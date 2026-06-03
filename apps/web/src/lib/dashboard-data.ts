/**
 * Server-side derivation helpers for the dashboard. Pure functions over data
 * that's already loaded — no I/O. Kept in /lib so individual components can
 * import what they need without re-fetching.
 */
import { PRACTICE } from "@/data/practice";
import { MOCKS } from "@/data/mocks";
import { PYQ } from "@/data/pyq";

// GATE 2027 MN paper is typically held on the first weekend of February.
// We use a placeholder date — update once IIT confirms the 2027 schedule.
export const GATE_EXAM_DATE = new Date("2027-02-07T03:30:00Z"); // 9:00 IST

export function daysUntilGate(now = new Date()): number {
  const ms = GATE_EXAM_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export type SubjectMastery = {
  slug: string;
  name: string;
  attempted: number;
  correct: number;
  accuracy: number;       // 0–100
  totalAvailable: number;
  coverage: number;       // attempted / totalAvailable, 0–100
  status: "untouched" | "weak" | "ok" | "strong";
};

/**
 * Per-subject mastery map keyed by display name.
 *
 * Inputs:
 *  - subjMap: subject → { scored, total } already aggregated from mock/PYQ attempts.
 *  - practiceCounts: subject slug → number of practice attempts the user submitted.
 */
export function buildSyllabusMap(
  subjMap: Record<string, { scored: number; total: number }>,
  practiceCounts: Record<string, number>,
): SubjectMastery[] {
  return PRACTICE.map((subj) => {
    const fromMocks = subjMap[subj.name] ?? subjMap[subj.slug] ?? { scored: 0, total: 0 };
    const practiced = practiceCounts[subj.slug] ?? 0;
    const attempted = fromMocks.total + practiced;
    const correct = fromMocks.scored; // we don't track per-practice correctness here
    const accuracy = fromMocks.total > 0
      ? Math.round((fromMocks.scored / fromMocks.total) * 100)
      : 0;
    const totalAvailable = subj.questions.length;
    const coverage = totalAvailable
      ? Math.min(100, Math.round((practiced / totalAvailable) * 100))
      : 0;
    const status: SubjectMastery["status"] =
      attempted === 0 ? "untouched"
      : accuracy >= 70 ? "strong"
      : accuracy >= 40 ? "ok"
      : "weak";
    return { slug: subj.slug, name: subj.name, attempted, correct, accuracy, totalAvailable, coverage, status };
  });
}

export type NextActions = {
  recommendedMockId: string;
  recommendedMockTitle: string;
  weakestSubject: { slug: string; name: string; accuracy: number } | null;
  nextPyqYear: number | null;
  dailyTenAvailable: boolean;
};

/**
 * Pick the 4 most useful next actions given what the user has already done.
 */
export function nextBestActions(
  attemptedMockIds: Set<string>,
  attemptedPyqYears: Set<number>,
  syllabus: SubjectMastery[],
): NextActions {
  // Next mock = first unattempted in canonical order (mn-mock-01 → 10).
  const nextMock = MOCKS.find((m) => !attemptedMockIds.has(m.id)) ?? MOCKS[0];

  // Weakest = lowest accuracy among subjects with ≥1 attempt, else lowest coverage.
  const touched = syllabus.filter((s) => s.attempted > 0);
  const weakest = touched.length
    ? [...touched].sort((a, b) => a.accuracy - b.accuracy)[0]
    : syllabus.find((s) => s.totalAvailable > 0) ?? null;

  // Most recent unattempted PYQ year (newest first).
  const pyqYears = [...PYQ.map((p) => p.year)].sort((a, b) => b - a);
  const nextPyq = pyqYears.find((y) => !attemptedPyqYears.has(y)) ?? pyqYears[0] ?? null;

  return {
    recommendedMockId: nextMock.id,
    recommendedMockTitle: nextMock.title,
    weakestSubject: weakest ? { slug: weakest.slug, name: weakest.name, accuracy: weakest.accuracy } : null,
    nextPyqYear: nextPyq,
    dailyTenAvailable: true,
  };
}

export type MiniSwot = {
  strengths: { name: string; accuracy: number }[];
  weaknesses: { name: string; accuracy: number }[];
};

export function miniSwot(syllabus: SubjectMastery[]): MiniSwot {
  const touched = syllabus.filter((s) => s.attempted > 0);
  const sorted = [...touched].sort((a, b) => b.accuracy - a.accuracy);
  return {
    strengths: sorted.slice(0, 2).filter((s) => s.accuracy >= 50).map((s) => ({ name: s.name, accuracy: s.accuracy })),
    weaknesses: sorted.slice(-2).reverse().filter((s) => s.accuracy < 70).map((s) => ({ name: s.name, accuracy: s.accuracy })),
  };
}

/** 7-day accuracy delta over the last 14 days (compared to the prior 7). */
export function trendDelta(
  attempts: { takenAt: Date; score: number; total: number }[],
  now = new Date(),
): { lastWeekAvg: number; thisWeekAvg: number; delta: number } | null {
  const cutoff7  = now.getTime() - 7  * 86_400_000;
  const cutoff14 = now.getTime() - 14 * 86_400_000;
  const recent: number[] = [];
  const prior:  number[] = [];
  for (const a of attempts) {
    if (!a.total) continue;
    const t = a.takenAt.getTime();
    const pct = (a.score / a.total) * 100;
    if (t >= cutoff7) recent.push(pct);
    else if (t >= cutoff14) prior.push(pct);
  }
  if (!recent.length && !prior.length) return null;
  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const thisWeekAvg = avg(recent);
  const lastWeekAvg = avg(prior);
  return { thisWeekAvg, lastWeekAvg, delta: thisWeekAvg - lastWeekAvg };
}
