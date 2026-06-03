/** GET/POST /api/cron/weekly-digest
 *  Sends the weekly progress digest to every Pro/Premium user with a
 *  verified phone number. Idempotent within a 24h window — re-running
 *  it on the same day is a no-op for users already messaged today.
 *
 *  Auth: requires header `x-cron-secret: $CRON_SECRET`. In dev
 *  (NODE_ENV!=production) the header check is skipped so you can hit
 *  it from a browser.
 *
 *  Schedule: every Monday 09:00 IST (= 03:30 UTC) via Vercel cron / EventBridge.
 *
 *  ?dryRun=1 → computes digest payloads but does NOT send WhatsApp.
 *  ?userId=X → restrict to a single user (for QA).
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWeeklyDigest } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS  = 24 * 60 * 60 * 1000;

async function run(req: Request) {
  // Auth
  if (process.env.NODE_ENV === "production") {
    const want = process.env.CRON_SECRET;
    if (!want) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    const got = req.headers.get("x-cron-secret");
    if (got !== want) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";
  const onlyUserId = url.searchParams.get("userId");

  // Find eligible users: pro/premium with a verified phone, not messaged in last 24h
  const since24h = new Date(Date.now() - DAY_MS);
  const recentDigests = await db.activity.findMany({
    where: { type: "weekly_digest_sent", ts: { gt: since24h } },
    select: { userId: true },
  });
  const alreadySent = new Set(recentDigests.map((r) => r.userId));

  const users = await db.user.findMany({
    where: {
      ...(onlyUserId ? { id: onlyUserId } : {}),
      plan: { in: ["pro", "premium"] },
      phone: { not: null },
      phoneVerified: { not: null },
    },
    select: { id: true, name: true, phone: true, plan: true },
  });

  const weekAgo = new Date(Date.now() - WEEK_MS);
  const results: Array<{ userId: string; status: "sent" | "skipped" | "dry" | "error"; reason?: string; payload?: unknown }> = [];

  for (const u of users) {
    if (alreadySent.has(u.id)) {
      results.push({ userId: u.id, status: "skipped", reason: "sent_within_24h" });
      continue;
    }
    if (!u.phone) continue;

    // Pull last week's attempts + practice activity
    const [attempts, practiceRows] = await Promise.all([
      db.attempt.findMany({
        where: { userId: u.id, takenAt: { gt: weekAgo } },
        select: { score: true, total: true, breakdown: true },
      }),
      db.activity.findMany({
        where: { userId: u.id, type: "practice_attempt", ts: { gt: weekAgo } },
        select: { payload: true },
      }),
    ]);

    const totalAttempts = attempts.length + practiceRows.length;
    if (totalAttempts === 0) {
      results.push({ userId: u.id, status: "skipped", reason: "no_activity" });
      continue;
    }

    // Avg accuracy across both
    const attemptPct = attempts.length
      ? attempts.reduce((s, a) => s + (a.total ? (a.score / a.total) * 100 : 0), 0) / attempts.length
      : null;
    const practiceCorrect = practiceRows.filter((r) => {
      const p = r.payload as { correct?: boolean } | null;
      return p?.correct === true;
    }).length;
    const practicePct = practiceRows.length ? (practiceCorrect / practiceRows.length) * 100 : null;
    const accuracyParts = [attemptPct, practicePct].filter((x): x is number => x !== null);
    const avgAccuracy = accuracyParts.length
      ? Math.round(accuracyParts.reduce((s, x) => s + x, 0) / accuracyParts.length)
      : 0;

    // Find weakest subject across attempt breakdowns + practice
    const subjScore = new Map<string, { scored: number; total: number }>();
    for (const a of attempts) {
      const b = (a.breakdown as Record<string, { scored: number; total: number }>) ?? {};
      for (const [k, v] of Object.entries(b)) {
        const cur = subjScore.get(k) ?? { scored: 0, total: 0 };
        cur.scored += v.scored; cur.total += v.total;
        subjScore.set(k, cur);
      }
    }
    for (const r of practiceRows) {
      const p = r.payload as { subjectName?: string; correct?: boolean } | null;
      if (!p?.subjectName) continue;
      const cur = subjScore.get(p.subjectName) ?? { scored: 0, total: 0 };
      cur.total += 1;
      if (p.correct) cur.scored += 1;
      subjScore.set(p.subjectName, cur);
    }
    let weakest = "—";
    let weakestPct = 101;
    for (const [name, v] of subjScore) {
      if (v.total < 3) continue; // need at least 3 attempts to call it weak
      const pct = (v.scored / v.total) * 100;
      if (pct < weakestPct) { weakestPct = pct; weakest = name; }
    }
    const suggestion = weakest === "—"
      ? "Keep up the momentum — try a new subject this week!"
      : `Focus on ${weakest} (${Math.round(weakestPct)}% this week). Run an Adaptive session.`;

    const payload = {
      name: u.name?.split(" ")[0] ?? "Aspirant",
      attemptsThisWeek: totalAttempts,
      avgAccuracyPct: avgAccuracy,
      weakestSubject: weakest,
      suggestion,
    };

    if (dryRun) {
      results.push({ userId: u.id, status: "dry", payload });
      continue;
    }

    try {
      await sendWeeklyDigest(u.phone, payload);
      await db.activity.create({
        data: { userId: u.id, type: "weekly_digest_sent", payload: payload as object },
      });
      results.push({ userId: u.id, status: "sent" });
    } catch (e) {
      results.push({ userId: u.id, status: "error", reason: (e as Error).message });
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    eligible: users.length,
    sent:    results.filter((r) => r.status === "sent").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    errors:  results.filter((r) => r.status === "error").length,
    results,
  });
}

export async function GET(req: Request)  { return run(req); }
export async function POST(req: Request) { return run(req); }
