/** GET /api/practice/mastery — per-subject mastery for the current user.
 *  Aggregates Activity rows where type=practice_attempt.
 *  Returns: { subjects: [{slug, name, attempts, correct, pct, lastAt}], totals }
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type Payload = {
  subjectSlug: string;
  subjectName?: string;
  difficulty?: "easy" | "medium" | "hard";
  correct: boolean;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ subjects: [], totals: { attempts: 0, correct: 0, pct: 0 } });

  const rows = await db.activity.findMany({
    where: { userId: session.user.id, type: "practice_attempt" },
    orderBy: { ts: "desc" },
    take: 5000,
  });

  const agg: Record<string, {
    slug: string; name: string;
    attempts: number; correct: number;
    byDiff: Record<string, { attempts: number; correct: number }>;
    lastAt: Date;
  }> = {};

  for (const r of rows) {
    const p = r.payload as unknown as Payload;
    if (!p?.subjectSlug) continue;
    const cur = agg[p.subjectSlug] ??= {
      slug: p.subjectSlug,
      name: p.subjectName ?? p.subjectSlug,
      attempts: 0, correct: 0,
      byDiff: { easy: { attempts: 0, correct: 0 }, medium: { attempts: 0, correct: 0 }, hard: { attempts: 0, correct: 0 } },
      lastAt: r.ts,
    };
    cur.attempts += 1;
    if (p.correct) cur.correct += 1;
    const d = p.difficulty ?? "medium";
    if (cur.byDiff[d]) { cur.byDiff[d].attempts += 1; if (p.correct) cur.byDiff[d].correct += 1; }
    if (r.ts > cur.lastAt) cur.lastAt = r.ts;
  }

  const subjects = Object.values(agg)
    .map((s) => ({ ...s, pct: s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0 }))
    .sort((a, b) => b.attempts - a.attempts);

  const totalAttempts = subjects.reduce((s, x) => s + x.attempts, 0);
  const totalCorrect  = subjects.reduce((s, x) => s + x.correct, 0);

  return NextResponse.json({
    subjects,
    totals: {
      attempts: totalAttempts,
      correct: totalCorrect,
      pct: totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    },
  });
}
