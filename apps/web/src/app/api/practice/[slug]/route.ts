/** GET /api/practice/[slug]?difficulty=easy|medium|hard|mixed&limit=20
 *
 *  Returns up to N questions for the given subject + difficulty, plus
 *  the correct answers + solution (so the client can grade instantly).
 *
 *  Plan-gating (capability over quantity):
 *   - Anonymous / free plan: capped to FREE_PREVIEW (20) questions per subject
 *     — enough to evaluate quality, not enough to seriously prep.
 *   - pro: 500 per request — effectively the whole bank, no friction.
 *   - premium: 1000 per request — hard ceiling above the 906-Q bank.
 *
 *  Reasoning for shipping answers: practice mode shows solution INSTANTLY
 *  after each question; the score isn't persisted, so there's no exploit. */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PRACTICE } from "@/data/practice";

export const runtime = "nodejs";

const FREE_PREVIEW = 20;
const CAPS: Record<string, number> = { free: FREE_PREVIEW, pro: 500, premium: 1000 };

/** Build a per-topic weakness score (lower = weaker) from the user's recent
 *  practice_attempt activity rows. Returns a map topic→correctnessPct.
 *  Topics with <3 attempts are treated as "unknown" (medium weight). */
async function loadTopicMastery(userId: string, subjectSlug: string): Promise<Map<string, number>> {
  const rows = await db.activity.findMany({
    where: { userId, type: "practice_attempt" },
    orderBy: { ts: "desc" },
    take: 1500,
  });
  const acc = new Map<string, { c: number; n: number }>();
  for (const r of rows) {
    const p = r.payload as { subjectSlug?: string; topic?: string | null; correct?: boolean } | null;
    if (!p?.subjectSlug || p.subjectSlug !== subjectSlug || !p.topic) continue;
    const cur = acc.get(p.topic) ?? { c: 0, n: 0 };
    cur.n += 1;
    if (p.correct) cur.c += 1;
    acc.set(p.topic, cur);
  }
  const out = new Map<string, number>();
  for (const [topic, v] of acc) {
    if (v.n < 3) continue;
    out.set(topic, v.c / v.n);
  }
  return out;
}

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const subject = PRACTICE.find((s) => s.slug === slug);
  if (!subject) return NextResponse.json({ error: "unknown_subject" }, { status: 404 });

  const session = await auth();
  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  const cap  = CAPS[plan] ?? FREE_PREVIEW;

  const url = new URL(req.url);
  const difficulty = url.searchParams.get("difficulty") ?? "mixed";
  const reqLimit   = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, cap);
  const adaptive   = url.searchParams.get("adaptive") === "1";

  let bank = subject.questions;
  if (difficulty !== "mixed") bank = bank.filter((q) => q.difficulty === difficulty);

  // ---------- Adaptive (premium only) ----------
  // Weight each question by (1 – topicCorrectness). Weak topics surface first.
  // Falls back to plain shuffle if user has no mastery data yet.
  let adaptiveApplied = false;
  let weakTopicsUsed: string[] = [];
  if (adaptive && plan === "premium" && session?.user?.id) {
    const mastery = await loadTopicMastery(session.user.id, slug);
    if (mastery.size > 0) {
      adaptiveApplied = true;
      const UNKNOWN_WEIGHT = 0.4; // un-attempted topics get medium priority
      const scored = bank.map((q) => {
        const m = mastery.get(q.topic);
        const weakness = m === undefined ? UNKNOWN_WEIGHT : 1 - m;
        // Add small jitter so equal-weight questions don't always come in the same order
        return { q, w: weakness + Math.random() * 0.05 };
      });
      scored.sort((a, b) => b.w - a.w);
      const questions = scored.slice(0, reqLimit).map((s) => s.q);
      weakTopicsUsed = [...new Set(questions.map((q) => q.topic))].slice(0, 5);
      return NextResponse.json({
        subject: { slug: subject.slug, name: subject.name },
        plan, cap, capped: bank.length > cap,
        requested: reqLimit, returned: questions.length, totalAvailable: bank.length,
        adaptive: adaptiveApplied, weakTopics: weakTopicsUsed,
        questions,
      });
    }
  }

  // Deterministic-ish shuffle: order = stable per call via Fisher–Yates seeded by Date.now()
  const arr = [...bank];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const questions = arr.slice(0, reqLimit);
  return NextResponse.json({
    subject: { slug: subject.slug, name: subject.name },
    plan,
    cap,
    capped: bank.length > cap,
    requested: reqLimit,
    returned: questions.length,
    totalAvailable: bank.length,
    adaptive: adaptiveApplied,
    adaptiveRequested: adaptive,
    questions,
  });
}
