// CIL Management Trainee question-bank registry.
//
// Each shipped set is a JSON file under `questions/cil/<slug>/cil-<slug>-NN.json`
// in the full CIL MT pattern (200 MCQ · 3 h · no negative marking). Register a
// new set by importing it and adding it to {@link CIL_SETS}; the discipline
// page and the exam portal pick it up automatically.

import type { Question } from "@/lib/grading";

import civilSet01 from "./questions/cil/civil/cil-civil-01.json";

export type CilSet = {
  /** Stable mock id, e.g. "cil-civil-01". Drives the runner route /mocks/<id>. */
  id: string;
  /** Discipline slug (matches CIL_ROWS slug + the PSU entitlement subject). */
  slug: string;
  /** Set number 1–10 within the discipline series. */
  no: number;
  title: string;
  discipline: string;
  durationMin: number;
  totalMarks: number;
  negativeMarking: boolean;
  questions: Question[];
};

// ── Registered sets ──────────────────────────────────────────────────────────
// Add `import civilSet01 from "./questions/cil/civil/cil-civil-01.json";`
// and push `civilSet01 as unknown as CilSet` below as each set ships.
const CIL_SETS: CilSet[] = [
  civilSet01 as unknown as CilSet,
];

export const CIL_MOCK_BANK: ReadonlyMap<string, CilSet> = new Map(
  CIL_SETS.map((s) => [s.id, s]),
);

/** Live (shipped) set numbers for a discipline — used to flip plan cards live. */
export function cilLiveSetNos(slug: string): ReadonlySet<number> {
  return new Set(CIL_SETS.filter((s) => s.slug === slug).map((s) => s.no));
}

/** All registered CIL mock ids (for static params / id enumeration). */
export function cilMockIds(): string[] {
  return CIL_SETS.map((s) => s.id);
}
