/**
 * GATE MN — Previous-Year Question (PYQ) Analytics.
 *
 * Pure, copyright-safe analytics over a FACTUAL metadata catalog of GATE Mining
 * (MN) papers, 2007–2024 (2015, 2016 & 2023 papers were not available). The
 * catalog (pyq-data.ts) stores NO question text — only {year, qno, section,
 * subtopic, type, marks}. Every function here is a pure transform used by the
 * /learn/insights dashboard.
 */
import { PYQ_RAW } from "./pyq-data";
import { LEARN_SYLLABUS } from "./learn";

export type PyqType = "MCQ" | "MSQ" | "NAT";

export type PyqRecord = {
  year: number;
  qno: number;
  /** 0 = General Aptitude, 1–6 = Learn syllabus section, 7 = Other. */
  section: number;
  /** Learn subtopic slug, or null when not mapped to a Learn module. */
  subtopic: string | null;
  type: PyqType;
  marks: 1 | 2;
};

/** Section metadata for labels/colours. ids align with LEARN_SYLLABUS (1–6). */
export type PyqSection = { id: number; title: string; short: string; color: string };

export const PYQ_SECTIONS: PyqSection[] = [
  { id: 1, title: "Engineering Mathematics", short: "Eng. Maths", color: "#6366f1" },
  { id: 2, title: "Mining Geology, Mine Development & Surveying", short: "Geology & Survey", color: "#0ea5e9" },
  { id: 3, title: "Geomechanics & Ground Control", short: "Geomechanics", color: "#10b981" },
  { id: 4, title: "Mining Methods & Machinery", short: "Methods & Machinery", color: "#f59e0b" },
  { id: 5, title: "Ventilation, Environment & Hazards", short: "Vent. & Env.", color: "#ef4444" },
  { id: 6, title: "Mineral Economics, Mine Planning & Systems Engg.", short: "Econ. & Planning", color: "#a855f7" },
  { id: 7, title: "Unclassified (legacy metadata)", short: "Unclassified", color: "#94a3b8" },
  { id: 0, title: "General Aptitude", short: "Aptitude", color: "#64748b" },
];

const SECTION_BY_ID = new Map(PYQ_SECTIONS.map((s) => [s.id, s]));

export function sectionTitle(id: number): string {
  return SECTION_BY_ID.get(id)?.title ?? `Section ${id}`;
}
export function sectionShort(id: number): string {
  return SECTION_BY_ID.get(id)?.short ?? `S${id}`;
}
export function sectionColor(id: number): string {
  return SECTION_BY_ID.get(id)?.color ?? "#94a3b8";
}

/** Subtopic slug → human title, sourced from the Learn syllabus. */
export const SUBTOPIC_TITLE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const sec of LEARN_SYLLABUS) {
    for (const st of sec.subtopics) {
      if (st.slug) map[st.slug] = st.title;
    }
  }
  return map;
})();

export function subtopicTitle(slug: string | null): string {
  if (!slug) return "Unmapped / general";
  return SUBTOPIC_TITLE[slug] ?? slug;
}

/** The full immutable catalog. */
export const PYQ_RECORDS: PyqRecord[] = PYQ_RAW.map(([year, qno, section, type, marks, subtopic]) => ({
  year,
  qno,
  section,
  type,
  marks,
  subtopic,
}));

export const PYQ_YEARS: number[] = Array.from(new Set(PYQ_RECORDS.map((r) => r.year))).sort((a, b) => a - b);
export const MIN_YEAR = PYQ_YEARS[0];
export const MAX_YEAR = PYQ_YEARS[PYQ_YEARS.length - 1];
export const PYQ_TOTAL = PYQ_RECORDS.length;

/* ─────────────────────────────  Filtering  ───────────────────────────── */

export type PyqFilter = {
  yearRange?: [number, number];
  sections?: number[]; // include only these section ids
  types?: PyqType[];
  marks?: (1 | 2)[];
  /** When true, drop General Aptitude (section 0) — the default for syllabus analytics. */
  excludeAptitude?: boolean;
};

export function filterRecords(records: PyqRecord[], f: PyqFilter): PyqRecord[] {
  const [lo, hi] = f.yearRange ?? [MIN_YEAR, MAX_YEAR];
  const secSet = f.sections && f.sections.length ? new Set(f.sections) : null;
  const typeSet = f.types && f.types.length ? new Set(f.types) : null;
  const markSet = f.marks && f.marks.length ? new Set(f.marks) : null;
  return records.filter((r) => {
    if (r.year < lo || r.year > hi) return false;
    if (f.excludeAptitude && r.section === 0) return false;
    if (secSet && !secSet.has(r.section)) return false;
    if (typeSet && !typeSet.has(r.type)) return false;
    if (markSet && !markSet.has(r.marks)) return false;
    return true;
  });
}

/* ─────────────────────────────  Aggregations  ─────────────────────────── */

export type Tally = { key: string; label: string; count: number; marks: number; color?: string };

/** ① Distribution by section (count + total marks). */
export function bySection(records: PyqRecord[]): Tally[] {
  const m = new Map<number, { count: number; marks: number }>();
  for (const r of records) {
    const e = m.get(r.section) ?? { count: 0, marks: 0 };
    e.count += 1;
    e.marks += r.marks;
    m.set(r.section, e);
  }
  return [...m.entries()]
    .map(([id, e]) => ({ key: String(id), label: sectionShort(id), count: e.count, marks: e.marks, color: sectionColor(id) }))
    .sort((a, b) => b.count - a.count);
}

/** ③ Distribution by subtopic (optionally limited to one section). */
export function bySubtopic(records: PyqRecord[], sectionId?: number): Tally[] {
  const m = new Map<string, { count: number; marks: number }>();
  for (const r of records) {
    if (sectionId != null && r.section !== sectionId) continue;
    const key = r.subtopic ?? "__unmapped__";
    const e = m.get(key) ?? { count: 0, marks: 0 };
    e.count += 1;
    e.marks += r.marks;
    m.set(key, e);
  }
  return [...m.entries()]
    .map(([key, e]) => ({
      key,
      label: key === "__unmapped__" ? "Unmapped / general" : subtopicTitle(key),
      count: e.count,
      marks: e.marks,
    }))
    .sort((a, b) => b.count - a.count);
}

/** ② Year × section matrix (marks per cell) for stacked charts/tables. */
export type YearRow = { year: number; total: number } & Record<string, number>;
export function byYearSection(records: PyqRecord[]): { rows: YearRow[]; sections: number[] } {
  const sections = [...new Set(records.map((r) => r.section))].sort((a, b) => a - b);
  const byYear = new Map<number, YearRow>();
  for (const r of records) {
    let row = byYear.get(r.year);
    if (!row) {
      row = { year: r.year, total: 0 } as YearRow;
      for (const s of sections) row[sectionShort(s)] = 0;
      byYear.set(r.year, row);
    }
    row[sectionShort(r.section)] = (row[sectionShort(r.section)] ?? 0) + r.marks;
    row.total += r.marks;
  }
  const rows = [...byYear.values()].sort((a, b) => a.year - b.year);
  return { rows, sections };
}

/** ② Per-year total question count (line chart). */
export function countByYear(records: PyqRecord[]): { year: number; count: number; marks: number }[] {
  const m = new Map<number, { count: number; marks: number }>();
  for (const r of records) {
    const e = m.get(r.year) ?? { count: 0, marks: 0 };
    e.count += 1;
    e.marks += r.marks;
    m.set(r.year, e);
  }
  return [...m.entries()].map(([year, e]) => ({ year, ...e })).sort((a, b) => a.year - b.year);
}

/** ④ Question-type split (MCQ / MSQ / NAT). */
export function byType(records: PyqRecord[]): Tally[] {
  const m = new Map<PyqType, number>();
  for (const r of records) m.set(r.type, (m.get(r.type) ?? 0) + 1);
  const colors: Record<PyqType, string> = { MCQ: "#6366f1", NAT: "#10b981", MSQ: "#f59e0b" };
  return (["MCQ", "NAT", "MSQ"] as PyqType[])
    .filter((t) => m.has(t))
    .map((t) => ({ key: t, label: t, count: m.get(t) ?? 0, marks: 0, color: colors[t] }));
}

/** ④ 1-mark vs 2-mark split. */
export function byMarks(records: PyqRecord[]): Tally[] {
  const m = new Map<1 | 2, number>();
  for (const r of records) m.set(r.marks, (m.get(r.marks) ?? 0) + 1);
  return ([1, 2] as (1 | 2)[])
    .filter((mk) => m.has(mk))
    .map((mk) => ({ key: String(mk), label: `${mk}-mark`, count: m.get(mk) ?? 0, marks: mk * (m.get(mk) ?? 0), color: mk === 1 ? "#0ea5e9" : "#a855f7" }));
}

/* ─────────────────────  ⑤ Gaps / ⑥ Prep / ⑦ Trend  ────────────────────── */

/** Least-squares slope of count-per-year for a series of {year,count}. */
export function linregSlope(points: { x: number; y: number }[]): number {
  const n = points.length;
  if (n < 2) return 0;
  const sx = points.reduce((s, p) => s + p.x, 0);
  const sy = points.reduce((s, p) => s + p.y, 0);
  const sxx = points.reduce((s, p) => s + p.x * p.x, 0);
  const sxy = points.reduce((s, p) => s + p.x * p.y, 0);
  const denom = n * sxx - sx * sx;
  if (denom === 0) return 0;
  return (n * sxy - sx * sy) / denom;
}

export type SectionTrend = {
  section: number;
  label: string;
  color: string;
  total: number;
  avgPerYear: number;
  slope: number;
  direction: "rising" | "falling" | "steady";
  projectedNext: number;
};

/** ⑦ Per-section trend + naive next-paper projection. */
export function sectionTrends(records: PyqRecord[]): SectionTrend[] {
  const years = [...new Set(records.map((r) => r.year))].sort((a, b) => a - b);
  const out: SectionTrend[] = [];
  const sections = [...new Set(records.map((r) => r.section))];
  for (const sec of sections) {
    const perYear = years.map((y) => ({
      x: y,
      y: records.filter((r) => r.section === sec && r.year === y).length,
    }));
    const total = perYear.reduce((s, p) => s + p.y, 0);
    const slope = linregSlope(perYear);
    const avg = total / years.length;
    const last = perYear[perYear.length - 1];
    const projected = Math.max(0, Math.round((last?.y ?? avg) + slope));
    out.push({
      section: sec,
      label: sectionShort(sec),
      color: sectionColor(sec),
      total,
      avgPerYear: avg,
      slope,
      direction: slope > 0.15 ? "rising" : slope < -0.15 ? "falling" : "steady",
      projectedNext: projected,
    });
  }
  return out.sort((a, b) => b.total - a.total);
}

export type GapItem = { key: string; label: string; lastYear: number | null; count: number; section: number };

/** ⑤ Subtopics that have NOT appeared since `since` (default 2020). */
export function gapsSince(records: PyqRecord[], since = 2020): GapItem[] {
  const last = new Map<string, { year: number; count: number; section: number }>();
  for (const r of records) {
    if (!r.subtopic) continue;
    const e = last.get(r.subtopic) ?? { year: 0, count: 0, section: r.section };
    e.year = Math.max(e.year, r.year);
    e.count += 1;
    last.set(r.subtopic, e);
  }
  // include syllabus subtopics that never appeared at all
  for (const sec of LEARN_SYLLABUS) {
    for (const st of sec.subtopics) {
      if (st.slug && !last.has(st.slug)) last.set(st.slug, { year: 0, count: 0, section: sec.id });
    }
  }
  return [...last.entries()]
    .filter(([, e]) => e.year < since)
    .map(([slug, e]) => ({ key: slug, label: subtopicTitle(slug), lastYear: e.year || null, count: e.count, section: e.section }))
    .sort((a, b) => (a.lastYear ?? 0) - (b.lastYear ?? 0));
}

export type PrepItem = {
  section: number;
  label: string;
  color: string;
  count: number;
  marks: number;
  share: number; // 0..1 of total marks
  priority: number; // 0..100 weighted score
  studyHours: number;
  practiceTarget: number;
};

/**
 * ⑥ Personalised prep plan. Priority = frequency weighted by recency (recent
 * papers count more). `budgetHours` is split across sections proportionally to
 * priority; practice targets scale with the same weight.
 */
export function prepPlan(records: PyqRecord[], budgetHours = 200, practiceBudget = 600): PrepItem[] {
  const maxYear = Math.max(...records.map((r) => r.year));
  const weightOf = (year: number) => 1 + Math.max(0, 6 - (maxYear - year)) * 0.12; // newer ≈ up to ~1.7×
  const m = new Map<number, { count: number; marks: number; w: number }>();
  for (const r of records) {
    if (r.section === 0) continue; // skip aptitude in the syllabus prep plan
    const e = m.get(r.section) ?? { count: 0, marks: 0, w: 0 };
    e.count += 1;
    e.marks += r.marks;
    e.w += r.marks * weightOf(r.year);
    m.set(r.section, e);
  }
  const totalMarks = [...m.values()].reduce((s, e) => s + e.marks, 0) || 1;
  const totalW = [...m.values()].reduce((s, e) => s + e.w, 0) || 1;
  const maxW = Math.max(...[...m.values()].map((e) => e.w), 1);
  return [...m.entries()]
    .map(([sec, e]) => ({
      section: sec,
      label: sectionShort(sec),
      color: sectionColor(sec),
      count: e.count,
      marks: e.marks,
      share: e.marks / totalMarks,
      priority: Math.round((e.w / maxW) * 100),
      studyHours: Math.round((e.w / totalW) * budgetHours),
      practiceTarget: Math.round((e.w / totalW) * practiceBudget),
    }))
    .sort((a, b) => b.priority - a.priority);
}

/* ───────────────────────  Headline answers (Quick stats)  ─────────────── */

export type QuickStats = {
  topSubtopics: { label: string; count: number }[];
  rockMechanicsPeakYear: { year: number; count: number } | null;
  avgMathPerYear: number;
  twoMarkDominant: { label: string; ratio: number }[];
  oneMarkDominant: { label: string; ratio: number }[];
  mostRepeatedTypeLast5: { type: PyqType; count: number } | null;
  absentSince2020: string[];
};

export function quickStats(records: PyqRecord[]): QuickStats {
  // top-5 subtopics by frequency (mapped subtopics only)
  const topSubtopics = bySubtopic(records.filter((r) => r.subtopic))
    .slice(0, 5)
    .map((t) => ({ label: t.label, count: t.count }));

  // year with most Geomechanics (Rock Mechanics) questions
  const rmByYear = new Map<number, number>();
  for (const r of records) if (r.section === 3) rmByYear.set(r.year, (rmByYear.get(r.year) ?? 0) + 1);
  let rmPeak: { year: number; count: number } | null = null;
  for (const [year, count] of rmByYear) if (!rmPeak || count > rmPeak.count) rmPeak = { year, count };

  // avg Engineering-Mathematics questions per year
  const years = [...new Set(records.map((r) => r.year))];
  const mathTotal = records.filter((r) => r.section === 1).length;
  const avgMathPerYear = years.length ? mathTotal / years.length : 0;

  // subtopics that are predominantly 2-mark vs 1-mark
  const markRatio = new Map<string, { one: number; two: number }>();
  for (const r of records) {
    if (!r.subtopic) continue;
    const e = markRatio.get(r.subtopic) ?? { one: 0, two: 0 };
    if (r.marks === 1) e.one += 1;
    else e.two += 1;
    markRatio.set(r.subtopic, e);
  }
  const twoMarkDominant: { label: string; ratio: number }[] = [];
  const oneMarkDominant: { label: string; ratio: number }[] = [];
  for (const [slug, e] of markRatio) {
    const n = e.one + e.two;
    if (n < 4) continue;
    const twoRatio = e.two / n;
    if (twoRatio >= 0.75) twoMarkDominant.push({ label: subtopicTitle(slug), ratio: twoRatio });
    else if (twoRatio <= 0.25) oneMarkDominant.push({ label: subtopicTitle(slug), ratio: 1 - twoRatio });
  }
  twoMarkDominant.sort((a, b) => b.ratio - a.ratio);
  oneMarkDominant.sort((a, b) => b.ratio - a.ratio);

  // most repeated question type in the last 5 papers
  const last5Years = [...new Set(records.map((r) => r.year))].sort((a, b) => b - a).slice(0, 5);
  const last5 = records.filter((r) => last5Years.includes(r.year));
  const typeCount = new Map<PyqType, number>();
  for (const r of last5) typeCount.set(r.type, (typeCount.get(r.type) ?? 0) + 1);
  let mostRepeatedTypeLast5: { type: PyqType; count: number } | null = null;
  for (const [type, count] of typeCount) if (!mostRepeatedTypeLast5 || count > mostRepeatedTypeLast5.count) mostRepeatedTypeLast5 = { type, count };

  const absentSince2020 = gapsSince(records, 2020).map((g) => g.label);

  return {
    topSubtopics,
    rockMechanicsPeakYear: rmPeak,
    avgMathPerYear: Math.round(avgMathPerYear * 10) / 10,
    twoMarkDominant: twoMarkDominant.slice(0, 6),
    oneMarkDominant: oneMarkDominant.slice(0, 6),
    mostRepeatedTypeLast5,
    absentSince2020,
  };
}

/* ─────────────────────────────  CSV export  ──────────────────────────── */

export function toCsv(records: PyqRecord[]): string {
  const header = "year,qno,section,section_title,subtopic_slug,subtopic_title,type,marks";
  const rows = records.map((r) =>
    [
      r.year,
      r.qno,
      r.section,
      `"${sectionTitle(r.section)}"`,
      r.subtopic ?? "",
      `"${subtopicTitle(r.subtopic)}"`,
      r.type,
      r.marks,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

/* ─────────────────────────  Syllabus coverage  ────────────────────────── */

export type SyllabusTopicCoverage = {
  slug: string | null;
  title: string;
  count: number;
  marks: number;
  lastYear: number | null;
  asked: boolean;
};

export type SyllabusSectionCoverage = {
  id: number;
  title: string;
  short: string;
  color: string;
  count: number;
  marks: number;
  topicCount: number;
  askedTopicCount: number;
  topics: SyllabusTopicCoverage[];
};

/**
 * Full syllabus-driven coverage map. Walks the OFFICIAL LEARN_SYLLABUS so EVERY
 * section and EVERY subtopic appears — even those that have never been asked in
 * a PYQ (flagged `asked: false`). This is what the insights dashboard renders so
 * the user always sees the complete syllabus, not just topics with data.
 */
export function syllabusCoverage(records: PyqRecord[]): SyllabusSectionCoverage[] {
  // index PYQ records by subtopic slug
  const bySlug = new Map<string, { count: number; marks: number; lastYear: number }>();
  for (const r of records) {
    if (!r.subtopic) continue;
    const e = bySlug.get(r.subtopic) ?? { count: 0, marks: 0, lastYear: 0 };
    e.count += 1;
    e.marks += r.marks;
    e.lastYear = Math.max(e.lastYear, r.year);
    bySlug.set(r.subtopic, e);
  }

  return LEARN_SYLLABUS.map((sec) => {
    const topics: SyllabusTopicCoverage[] = sec.subtopics.map((st) => {
      const e = st.slug ? bySlug.get(st.slug) : undefined;
      return {
        slug: st.slug ?? null,
        title: st.title,
        count: e?.count ?? 0,
        marks: e?.marks ?? 0,
        lastYear: e?.lastYear ?? null,
        asked: !!e && e.count > 0,
      };
    });
    topics.sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
    const sectionMeta = SECTION_BY_ID.get(sec.id);
    return {
      id: sec.id,
      title: sectionMeta?.title ?? sec.title,
      short: sectionMeta?.short ?? sectionShort(sec.id),
      color: sectionMeta?.color ?? sectionColor(sec.id),
      count: topics.reduce((s, t) => s + t.count, 0),
      marks: topics.reduce((s, t) => s + t.marks, 0),
      topicCount: topics.length,
      askedTopicCount: topics.filter((t) => t.asked).length,
      topics,
    };
  });
}
