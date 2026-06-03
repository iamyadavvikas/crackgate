/** GET /api/analytics/swot — Strengths / Weaknesses / Opportunities / Threats
 *  Aggregates the last 90 days of Attempt.breakdown (per-subject scoring) plus
 *  Activity practice_attempt rows to classify each subject into the 2x2.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubjBreakdown = Record<string, { scored: number; total: number }>;

type Bucket = { name: string; value: string; hint: string; pct?: number; trend?: number };
type SwotResp = {
  strengths: Bucket[];
  weaknesses: Bucket[];
  opportunities: Bucket[];
  threats: Bucket[];
  generatedAt: string;
  windowDays: number;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const midpoint = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

  const [attempts, practice] = await Promise.all([
    db.attempt.findMany({
      where: { userId, takenAt: { gte: since } },
      orderBy: { takenAt: "asc" },
      select: { breakdown: true, takenAt: true },
    }),
    db.activity.findMany({
      where: { userId, type: "practice_attempt", ts: { gte: since } },
      select: { payload: true, ts: true },
    }),
  ]);

  // Per-subject roll-up split into recent (last 45d) vs earlier (45–90d) so we
  // can compute a simple trend without doing a real regression.
  type Acc = { recent: { s: number; t: number }; earlier: { s: number; t: number } };
  const agg = new Map<string, Acc>();

  for (const a of attempts) {
    const b = (a.breakdown as unknown as SubjBreakdown) ?? {};
    const window = a.takenAt >= midpoint ? "recent" : "earlier";
    for (const [subject, v] of Object.entries(b)) {
      if (!v?.total) continue;
      const cur = agg.get(subject) ?? { recent: { s: 0, t: 0 }, earlier: { s: 0, t: 0 } };
      cur[window].s += v.scored;
      cur[window].t += v.total;
      agg.set(subject, cur);
    }
  }

  // Count practice attempts per subject (proxy for engagement / opportunity).
  const practiceCount = new Map<string, number>();
  for (const p of practice) {
    const payload = p.payload as unknown as { subjectName?: string; subjectSlug?: string };
    const key = payload?.subjectName ?? payload?.subjectSlug;
    if (!key) continue;
    practiceCount.set(key, (practiceCount.get(key) ?? 0) + 1);
  }

  const subjects = Array.from(agg.entries()).map(([name, v]) => {
    const totalQ = v.recent.t + v.earlier.t;
    const totalCorrect = v.recent.s + v.earlier.s;
    const pct = totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0;
    const recentPct = v.recent.t ? Math.round((v.recent.s / v.recent.t) * 100) : null;
    const earlierPct = v.earlier.t ? Math.round((v.earlier.s / v.earlier.t) * 100) : null;
    const trend = recentPct != null && earlierPct != null ? recentPct - earlierPct : null;
    return { name, pct, trend, totalQ, recentPct, earlierPct, practiced: practiceCount.get(name) ?? 0 };
  });

  const strengths: Bucket[] = [];
  const weaknesses: Bucket[] = [];
  const opportunities: Bucket[] = [];
  const threats: Bucket[] = [];

  for (const s of subjects) {
    // Strengths: high accuracy, stable or improving
    if (s.pct >= 70 && (s.trend == null || s.trend >= -2)) {
      strengths.push({
        name: s.name,
        value: `${s.pct}%`,
        hint: s.trend != null && s.trend > 0 ? `↑ ${s.trend}% vs prior 45d` : "Consistent accuracy",
        pct: s.pct,
        trend: s.trend ?? undefined,
      });
      continue;
    }
    // Threats: declining mid-band — used to be okay, slipping now
    if (s.pct >= 45 && s.pct < 70 && s.trend != null && s.trend <= -5) {
      threats.push({
        name: s.name,
        value: `${s.pct}%`,
        hint: `↓ ${Math.abs(s.trend)}% vs prior 45d — review before the dip widens`,
        pct: s.pct,
        trend: s.trend,
      });
      continue;
    }
    // Weaknesses: low accuracy
    if (s.pct < 50) {
      weaknesses.push({
        name: s.name,
        value: `${s.pct}%`,
        hint: s.practiced < 5 ? "Start with 10 easy practice Qs" : "Drill again — accuracy is below target",
        pct: s.pct,
        trend: s.trend ?? undefined,
      });
      continue;
    }
    // Mid-band stable — opportunity to push into strength
    opportunities.push({
      name: s.name,
      value: `${s.pct}%`,
      hint: "Close to mastery — a few focused sessions can push this to a strength",
      pct: s.pct,
      trend: s.trend ?? undefined,
    });
  }

  // Surface untouched subjects (practiced but never on a mock) as opportunities
  for (const [subject, n] of practiceCount) {
    if (agg.has(subject)) continue; // already classified
    if (n < 3) continue;
    opportunities.push({
      name: subject,
      value: `${n} practiced`,
      hint: "Practiced but never tested under timed conditions — try a mock",
    });
  }

  const bestFirst = (a: Bucket, b: Bucket) => (b.pct ?? 0) - (a.pct ?? 0);
  const worstFirst = (a: Bucket, b: Bucket) => (a.pct ?? 0) - (b.pct ?? 0);
  strengths.sort(bestFirst);
  weaknesses.sort(worstFirst);
  threats.sort((a, b) => (a.trend ?? 0) - (b.trend ?? 0));
  opportunities.sort(bestFirst);

  const body: SwotResp = {
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    opportunities: opportunities.slice(0, 5),
    threats: threats.slice(0, 5),
    generatedAt: new Date().toISOString(),
    windowDays: 90,
  };
  return NextResponse.json(body);
}
