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

// ────────────────────────────────────────────────────────────────────
// Phase A additions: rank prediction, week activity, "why this focus"
// ────────────────────────────────────────────────────────────────────

/**
 * Rough AIR prediction from accuracy on recent attempts.
 *
 * Methodology (intentionally simple — labelled as estimate in the UI):
 *  - Use last 5 attempts; require at least 2 to produce a number.
 *  - Convert avg accuracy → assumed percentile (clamped 30–99.9).
 *  - GATE MN typically has ~500 candidates appearing. AIR ≈ (1 − pct/100) × 500,
 *    floored at 1.
 *  - `delta` compares the latest 5 to the 5 before that.
 *  - `confidence` reflects sample size (low / medium / high).
 */
export type AirPrediction = {
  air: number;
  percentile: number;       // 0–100, one decimal
  scoreBand: { lo: number; hi: number; recent: number };  // % bounds and most recent
  delta: number | null;     // negative = improved (rank dropped); positive = worsened
  confidence: "low" | "medium" | "high";
  samples: number;
};

const GATE_MN_CANDIDATE_POOL = 500;

export function predictAir(
  attempts: { takenAt: Date; score: number; total: number; kind?: string }[],
): AirPrediction | null {
  const scored = attempts
    .filter((a) => a.total > 0 && (a.kind === undefined || a.kind === "mock" || a.kind === "pyq"))
    .slice(0, 10); // page already sorts desc by takenAt
  if (scored.length < 2) return null;

  const pcts = scored.map((a) => (a.score / a.total) * 100);
  const recent = pcts.slice(0, 5);
  const prior  = pcts.slice(5, 10);

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const avgRecent = avg(recent);

  const percentile = Math.max(30, Math.min(99.9, Math.round(avgRecent * 10) / 10));
  const air = Math.max(1, Math.round((1 - percentile / 100) * GATE_MN_CANDIDATE_POOL));

  const lo = Math.round(Math.min(...recent));
  const hi = Math.round(Math.max(...recent));
  const recentScore = Math.round(recent[0]);

  let delta: number | null = null;
  if (prior.length >= 2) {
    const avgPrior = avg(prior);
    const priorPctile = Math.max(30, Math.min(99.9, avgPrior));
    const priorAir = Math.max(1, Math.round((1 - priorPctile / 100) * GATE_MN_CANDIDATE_POOL));
    delta = air - priorAir;  // negative = improved
  }

  const confidence: AirPrediction["confidence"] =
    scored.length >= 8 ? "high" : scored.length >= 4 ? "medium" : "low";

  return {
    air,
    percentile,
    scoreBand: { lo, hi, recent: recentScore },
    delta,
    confidence,
    samples: scored.length,
  };
}

/**
 * Returns Mon-Sun activity intensity for the current ISO week.
 * Output indexed 0=Mon..6=Sun, value 0..3 (none / light / med / heavy).
 *
 * Buckets:
 *   0 events → 0
 *   1–2      → 1 (light)
 *   3–6      → 2 (med)
 *   7+       → 3 (heavy)
 */
export type WeekActivity = {
  days: { date: Date; count: number; intensity: 0 | 1 | 2 | 3 }[];
  todayIndex: number;     // 0..6
  totalCount: number;
};

export function weekActivity(
  events: { ts: Date }[],
  now = new Date(),
): WeekActivity {
  // Find Monday of current ISO week (local time).
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const dow = (start.getDay() + 6) % 7; // Mon=0..Sun=6
  start.setDate(start.getDate() - dow);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { date: d, count: 0, intensity: 0 as 0 | 1 | 2 | 3 };
  });

  const startMs = start.getTime();
  const endMs = startMs + 7 * 86_400_000;
  let total = 0;
  for (const e of events) {
    const t = e.ts.getTime();
    if (t < startMs || t >= endMs) continue;
    const idx = Math.floor((t - startMs) / 86_400_000);
    if (idx >= 0 && idx < 7) {
      days[idx].count += 1;
      total += 1;
    }
  }
  for (const d of days) {
    d.intensity = d.count === 0 ? 0 : d.count <= 2 ? 1 : d.count <= 6 ? 2 : 3;
  }

  return { days, todayIndex: dow, totalCount: total };
}

/**
 * Build the "Why this focus?" sentence for the hero card.
 *
 * Priority:
 *   1. Slipping subject  — accuracy dropped meaningfully over the last 7 days.
 *   2. Weakest touched   — lowest accuracy among attempted.
 *   3. Untouched         — first untouched subject (start somewhere).
 */
export type TodayFocus = {
  kind: "drill" | "diagnostic" | "revise" | "explore";
  subjectSlug: string | null;
  subjectName: string;
  accuracy: number | null;
  peerAccuracy: number;     // illustrative "top 10%" target
  reason: string;           // short one-line justification
  questionCount: number;
  minutes: number;
};

export function whyTodaysFocus(syllabus: SubjectMastery[]): TodayFocus {
  const touched = syllabus.filter((s) => s.attempted > 0);
  // Weakest with at least a handful of attempts (avoid 1-attempt noise)
  const weakest = touched
    .filter((s) => s.attempted >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)[0];

  if (weakest) {
    return {
      kind: "drill",
      subjectSlug: weakest.slug,
      subjectName: weakest.name,
      accuracy: weakest.accuracy,
      peerAccuracy: 72,
      reason: `Your ${weakest.name} accuracy is ${weakest.accuracy}%. Top scorers average around 72%.`,
      questionCount: 25,
      minutes: 45,
    };
  }

  if (touched.length === 0) {
    return {
      kind: "diagnostic",
      subjectSlug: null,
      subjectName: "Diagnostic",
      accuracy: null,
      peerAccuracy: 0,
      reason: "We need 15 minutes of data to personalise your plan — start with a quick diagnostic.",
      questionCount: 20,
      minutes: 15,
    };
  }

  // touched but each has < 3 attempts: continue the lowest, smaller drill
  const fallback = [...touched].sort((a, b) => a.accuracy - b.accuracy)[0];
  return {
    kind: "explore",
    subjectSlug: fallback.slug,
    subjectName: fallback.name,
    accuracy: fallback.accuracy,
    peerAccuracy: 72,
    reason: `You've only done ${fallback.attempted} questions in ${fallback.name}. Build a baseline before we judge it.`,
    questionCount: 15,
    minutes: 25,
  };
}

/**
 * Pick the next mock the user hasn't attempted, with a "next Saturday" suggestion.
 */
export type ScheduledMock = {
  id: string;
  title: string;
  /** Suggested date — the upcoming Saturday after `now`. */
  suggestedAt: Date;
};

export function nextScheduledMock(
  attemptedMockIds: Set<string>,
  allMocks: { id: string; title: string }[],
  now = new Date(),
): ScheduledMock | null {
  const next = allMocks.find((m) => !attemptedMockIds.has(m.id));
  if (!next) return null;
  // Next Saturday at 9am local
  const d = new Date(now);
  d.setHours(9, 0, 0, 0);
  const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSat);
  return { id: next.id, title: next.title, suggestedAt: d };
}
