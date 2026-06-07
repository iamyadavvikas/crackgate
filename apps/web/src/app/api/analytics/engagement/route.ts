/** GET /api/analytics/engagement — streaks + cadence summary.
 *  Pulls the last 90 days of Activity + Attempt events, groups them by local
 *  date and returns current/longest streak, weekly/monthly counts, avg/day.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Resp = {
  currentStreak: number;
  longestStreak: number;
  daysActive: number;
  questionsThisWeek: number;
  questionsThisMonth: number;
  avgPerActiveDay: number;
  activeDates: string[]; // YYYY-MM-DD
};

function localDateKey(d: Date): string {
  // Use UTC date for determinism on the server. India is UTC+5:30 — close enough
  // for streak purposes; we'd revisit only if users complain about boundary cases.
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [practice, attempts] = await Promise.all([
    db.activity.findMany({
      where: { userId, type: "practice_attempt", ts: { gte: since } },
      select: { ts: true },
    }),
    db.attempt.findMany({
      where: { userId, takenAt: { gte: since } },
      select: { takenAt: true, total: true },
    }),
  ]);

  // dateKey -> total questions answered that day (practice rows = 1 each, attempts contribute their `total`).
  const perDay = new Map<string, number>();
  for (const p of practice) {
    const k = localDateKey(p.ts);
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }
  for (const a of attempts) {
    const k = localDateKey(a.takenAt);
    perDay.set(k, (perDay.get(k) ?? 0) + a.total);
  }

  const activeDates = Array.from(perDay.keys()).sort(); // ascending YYYY-MM-DD

  // Current streak: walk backwards from today (or yesterday) consuming consecutive active days.
  const today = localDateKey(new Date());
  const yesterday = localDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  let cursor = perDay.has(today) ? today : perDay.has(yesterday) ? yesterday : null;
  let currentStreak = 0;
  while (cursor && perDay.has(cursor)) {
    currentStreak += 1;
    const prev = new Date(cursor + "T00:00:00Z");
    prev.setUTCDate(prev.getUTCDate() - 1);
    cursor = prev.toISOString().slice(0, 10);
  }

  // Longest streak across the 90-day window.
  let longestStreak = 0;
  let run = 0;
  let prevKey: string | null = null;
  for (const k of activeDates) {
    if (prevKey) {
      const expected: Date = new Date(prevKey + "T00:00:00Z");
      expected.setUTCDate(expected.getUTCDate() + 1);
      if (expected.toISOString().slice(0, 10) === k) {
        run += 1;
      } else {
        run = 1;
      }
    } else {
      run = 1;
    }
    if (run > longestStreak) longestStreak = run;
    prevKey = k;
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  let questionsThisWeek = 0;
  let questionsThisMonth = 0;
  for (const [date, count] of perDay) {
    const d = new Date(date + "T00:00:00Z");
    if (d >= weekAgo) questionsThisWeek += count;
    if (d >= monthAgo) questionsThisMonth += count;
  }

  const totalQs = Array.from(perDay.values()).reduce((s, n) => s + n, 0);
  const avgPerActiveDay = perDay.size ? Math.round(totalQs / perDay.size) : 0;

  const body: Resp = {
    currentStreak,
    longestStreak,
    daysActive: perDay.size,
    questionsThisWeek,
    questionsThisMonth,
    avgPerActiveDay,
    activeDates,
  };
  return NextResponse.json(body);
}
