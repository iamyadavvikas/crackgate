/** GET /api/analytics/timing — hour-of-day performance breakdown.
 *  Bins the last 60 days of Attempt rows into 24 buckets and reports avg
 *  accuracy + question volume. Useful for "you score best at 4 PM" callouts.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HourStat = {
  hour: number;            // 0–23 (IST)
  attempts: number;        // # of attempt rows in this hour
  questions: number;       // sum of `total` across those attempts
  avgAccuracy: number;     // 0–100
};

type Resp = {
  hourly: HourStat[];      // always length 24, sparse hours have zeros
  peakHour: number | null; // hour with highest accuracy AND ≥ 2 attempts
  peakAccuracy: number | null;
  totalAttempts: number;
  windowDays: number;
};

// Convert a UTC Date to the IST hour bucket (UTC+5:30 — half-hours round down).
function istHour(d: Date): number {
  const utcMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  const istMinutes = (utcMinutes + 5 * 60 + 30) % (24 * 60);
  return Math.floor(istMinutes / 60);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const attempts = await db.attempt.findMany({
    where: { userId: session.user.id, takenAt: { gte: since } },
    select: { takenAt: true, score: true, total: true },
  });

  const buckets: Array<{ accSum: number; attempts: number; questions: number }> = Array.from(
    { length: 24 },
    () => ({ accSum: 0, attempts: 0, questions: 0 }),
  );

  for (const a of attempts) {
    if (!a.total) continue;
    const h = istHour(a.takenAt);
    const b = buckets[h];
    b.accSum += (a.score / a.total) * 100;
    b.attempts += 1;
    b.questions += a.total;
  }

  const hourly: HourStat[] = buckets.map((b, hour) => ({
    hour,
    attempts: b.attempts,
    questions: b.questions,
    avgAccuracy: b.attempts ? Math.round(b.accSum / b.attempts) : 0,
  }));

  // Peak hour = best avg accuracy among hours with at least 2 sessions
  let peakHour: number | null = null;
  let peakAccuracy: number | null = null;
  for (const h of hourly) {
    if (h.attempts < 2) continue;
    if (peakAccuracy == null || h.avgAccuracy > peakAccuracy) {
      peakAccuracy = h.avgAccuracy;
      peakHour = h.hour;
    }
  }

  const body: Resp = {
    hourly,
    peakHour,
    peakAccuracy,
    totalAttempts: attempts.length,
    windowDays: 60,
  };
  return NextResponse.json(body);
}
