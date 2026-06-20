// CIL Management Trainee question-bank registry.
//
// Each shipped set is a JSON file under `questions/cil/<slug>/cil-<slug>-NN.json`
// in the full CIL MT pattern (200 MCQ · 3 h · no negative marking). Register a
// new set by importing it and adding it to {@link CIL_SETS}; the discipline
// page and the exam portal pick it up automatically.

import type { Question } from "@/lib/grading";

import civilSet01 from "./questions/cil/civil/cil-civil-01.json";
import civilSet02 from "./questions/cil/civil/cil-civil-02.json";
import civilSet03 from "./questions/cil/civil/cil-civil-03.json";
import civilSet04 from "./questions/cil/civil/cil-civil-04.json";
import civilSet05 from "./questions/cil/civil/cil-civil-05.json";
import civilSet06 from "./questions/cil/civil/cil-civil-06.json";
import civilSet07 from "./questions/cil/civil/cil-civil-07.json";
import civilSet08 from "./questions/cil/civil/cil-civil-08.json";
import civilSet09 from "./questions/cil/civil/cil-civil-09.json";
import civilSet10 from "./questions/cil/civil/cil-civil-10.json";
import civilSet11 from "./questions/cil/civil/cil-civil-11.json";
import civilSet12 from "./questions/cil/civil/cil-civil-12.json";
import civilSet13 from "./questions/cil/civil/cil-civil-13.json";
import civilSet14 from "./questions/cil/civil/cil-civil-14.json";
import civilSet15 from "./questions/cil/civil/cil-civil-15.json";

export type CilSet = {
  /** Stable mock id, e.g. "cil-civil-01". Drives the runner route /mocks/<id>. */
  id: string;
  /** Discipline slug (matches CIL_ROWS slug + the PSU entitlement subject). */
  slug: string;
  /** Set number 1–15 within the discipline series (11–15 = Advanced tier). */
  no: number;
  title: string;
  discipline: string;
  durationMin: number;
  totalMarks: number;
  negativeMarking: boolean;
  questions: Question[];
};

// ── Registered sets ──────────────────────────────────────────────────────────
// Add `import civilSetNN from "./questions/cil/civil/cil-civil-NN.json";`
// and push `civilSetNN as unknown as CilSet` below as each set ships.
const CIL_SETS: CilSet[] = [
  civilSet01 as unknown as CilSet,
  civilSet02 as unknown as CilSet,
  civilSet03 as unknown as CilSet,
  civilSet04 as unknown as CilSet,
  civilSet05 as unknown as CilSet,
  civilSet06 as unknown as CilSet,
  civilSet07 as unknown as CilSet,
  civilSet08 as unknown as CilSet,
  civilSet09 as unknown as CilSet,
  civilSet10 as unknown as CilSet,
  civilSet11 as unknown as CilSet,
  civilSet12 as unknown as CilSet,
  civilSet13 as unknown as CilSet,
  civilSet14 as unknown as CilSet,
  civilSet15 as unknown as CilSet,
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
