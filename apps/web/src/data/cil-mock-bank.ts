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

import electricalSet01 from "./questions/cil/electrical/cil-electrical-01.json";
import electricalSet02 from "./questions/cil/electrical/cil-electrical-02.json";
import electricalSet03 from "./questions/cil/electrical/cil-electrical-03.json";
import electricalSet04 from "./questions/cil/electrical/cil-electrical-04.json";
import electricalSet05 from "./questions/cil/electrical/cil-electrical-05.json";
import electricalSet06 from "./questions/cil/electrical/cil-electrical-06.json";
import electricalSet07 from "./questions/cil/electrical/cil-electrical-07.json";
import electricalSet08 from "./questions/cil/electrical/cil-electrical-08.json";
import electricalSet09 from "./questions/cil/electrical/cil-electrical-09.json";
import electricalSet10 from "./questions/cil/electrical/cil-electrical-10.json";
import electricalSet11 from "./questions/cil/electrical/cil-electrical-11.json";
import electricalSet12 from "./questions/cil/electrical/cil-electrical-12.json";
import electricalSet13 from "./questions/cil/electrical/cil-electrical-13.json";
import electricalSet14 from "./questions/cil/electrical/cil-electrical-14.json";
import electricalSet15 from "./questions/cil/electrical/cil-electrical-15.json";

import mechanicalSet01 from "./questions/cil/mechanical/cil-mechanical-01.json";
import mechanicalSet02 from "./questions/cil/mechanical/cil-mechanical-02.json";
import mechanicalSet03 from "./questions/cil/mechanical/cil-mechanical-03.json";
import mechanicalSet04 from "./questions/cil/mechanical/cil-mechanical-04.json";
import mechanicalSet05 from "./questions/cil/mechanical/cil-mechanical-05.json";
import mechanicalSet06 from "./questions/cil/mechanical/cil-mechanical-06.json";
import mechanicalSet07 from "./questions/cil/mechanical/cil-mechanical-07.json";
import mechanicalSet08 from "./questions/cil/mechanical/cil-mechanical-08.json";
import mechanicalSet09 from "./questions/cil/mechanical/cil-mechanical-09.json";
import mechanicalSet10 from "./questions/cil/mechanical/cil-mechanical-10.json";
import mechanicalSet11 from "./questions/cil/mechanical/cil-mechanical-11.json";
import mechanicalSet12 from "./questions/cil/mechanical/cil-mechanical-12.json";
import mechanicalSet13 from "./questions/cil/mechanical/cil-mechanical-13.json";
import mechanicalSet14 from "./questions/cil/mechanical/cil-mechanical-14.json";
import mechanicalSet15 from "./questions/cil/mechanical/cil-mechanical-15.json";

import systemSet01 from "./questions/cil/system/cil-system-01.json";
import systemSet02 from "./questions/cil/system/cil-system-02.json";
import systemSet03 from "./questions/cil/system/cil-system-03.json";
import systemSet04 from "./questions/cil/system/cil-system-04.json";
import systemSet05 from "./questions/cil/system/cil-system-05.json";
import systemSet06 from "./questions/cil/system/cil-system-06.json";
import systemSet07 from "./questions/cil/system/cil-system-07.json";
import systemSet08 from "./questions/cil/system/cil-system-08.json";
import systemSet09 from "./questions/cil/system/cil-system-09.json";
import systemSet10 from "./questions/cil/system/cil-system-10.json";
import systemSet11 from "./questions/cil/system/cil-system-11.json";
import systemSet12 from "./questions/cil/system/cil-system-12.json";
import systemSet13 from "./questions/cil/system/cil-system-13.json";
import systemSet14 from "./questions/cil/system/cil-system-14.json";
import systemSet15 from "./questions/cil/system/cil-system-15.json";

import entSet01 from "./questions/cil/e-and-t/cil-e-and-t-01.json";
import entSet02 from "./questions/cil/e-and-t/cil-e-and-t-02.json";
import entSet03 from "./questions/cil/e-and-t/cil-e-and-t-03.json";
import entSet04 from "./questions/cil/e-and-t/cil-e-and-t-04.json";
import entSet05 from "./questions/cil/e-and-t/cil-e-and-t-05.json";
import entSet06 from "./questions/cil/e-and-t/cil-e-and-t-06.json";
import entSet07 from "./questions/cil/e-and-t/cil-e-and-t-07.json";
import entSet08 from "./questions/cil/e-and-t/cil-e-and-t-08.json";
import entSet09 from "./questions/cil/e-and-t/cil-e-and-t-09.json";
import entSet10 from "./questions/cil/e-and-t/cil-e-and-t-10.json";
import entSet11 from "./questions/cil/e-and-t/cil-e-and-t-11.json";
import entSet12 from "./questions/cil/e-and-t/cil-e-and-t-12.json";
import entSet13 from "./questions/cil/e-and-t/cil-e-and-t-13.json";
import entSet14 from "./questions/cil/e-and-t/cil-e-and-t-14.json";
import entSet15 from "./questions/cil/e-and-t/cil-e-and-t-15.json";

import geologySet01 from "./questions/cil/geology/cil-geology-01.json";
import geologySet02 from "./questions/cil/geology/cil-geology-02.json";
import geologySet03 from "./questions/cil/geology/cil-geology-03.json";
import geologySet04 from "./questions/cil/geology/cil-geology-04.json";
import geologySet05 from "./questions/cil/geology/cil-geology-05.json";
import geologySet06 from "./questions/cil/geology/cil-geology-06.json";
import geologySet07 from "./questions/cil/geology/cil-geology-07.json";
import geologySet08 from "./questions/cil/geology/cil-geology-08.json";
import geologySet09 from "./questions/cil/geology/cil-geology-09.json";
import geologySet10 from "./questions/cil/geology/cil-geology-10.json";
import geologySet11 from "./questions/cil/geology/cil-geology-11.json";
import geologySet12 from "./questions/cil/geology/cil-geology-12.json";
import geologySet13 from "./questions/cil/geology/cil-geology-13.json";
import geologySet14 from "./questions/cil/geology/cil-geology-14.json";
import geologySet15 from "./questions/cil/geology/cil-geology-15.json";

import ieSet01 from "./questions/cil/industrial-engineering/cil-industrial-engineering-01.json";
import ieSet02 from "./questions/cil/industrial-engineering/cil-industrial-engineering-02.json";
import ieSet03 from "./questions/cil/industrial-engineering/cil-industrial-engineering-03.json";
import ieSet04 from "./questions/cil/industrial-engineering/cil-industrial-engineering-04.json";
import ieSet05 from "./questions/cil/industrial-engineering/cil-industrial-engineering-05.json";
import ieSet06 from "./questions/cil/industrial-engineering/cil-industrial-engineering-06.json";
import ieSet07 from "./questions/cil/industrial-engineering/cil-industrial-engineering-07.json";
import ieSet08 from "./questions/cil/industrial-engineering/cil-industrial-engineering-08.json";
import ieSet09 from "./questions/cil/industrial-engineering/cil-industrial-engineering-09.json";
import ieSet10 from "./questions/cil/industrial-engineering/cil-industrial-engineering-10.json";
import ieSet11 from "./questions/cil/industrial-engineering/cil-industrial-engineering-11.json";
import ieSet12 from "./questions/cil/industrial-engineering/cil-industrial-engineering-12.json";
import ieSet13 from "./questions/cil/industrial-engineering/cil-industrial-engineering-13.json";
import ieSet14 from "./questions/cil/industrial-engineering/cil-industrial-engineering-14.json";
import ieSet15 from "./questions/cil/industrial-engineering/cil-industrial-engineering-15.json";

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
  electricalSet01 as unknown as CilSet,
  electricalSet02 as unknown as CilSet,
  electricalSet03 as unknown as CilSet,
  electricalSet04 as unknown as CilSet,
  electricalSet05 as unknown as CilSet,
  electricalSet06 as unknown as CilSet,
  electricalSet07 as unknown as CilSet,
  electricalSet08 as unknown as CilSet,
  electricalSet09 as unknown as CilSet,
  electricalSet10 as unknown as CilSet,
  electricalSet11 as unknown as CilSet,
  electricalSet12 as unknown as CilSet,
  electricalSet13 as unknown as CilSet,
  electricalSet14 as unknown as CilSet,
  electricalSet15 as unknown as CilSet,
  mechanicalSet01 as unknown as CilSet,
  mechanicalSet02 as unknown as CilSet,
  mechanicalSet03 as unknown as CilSet,
  mechanicalSet04 as unknown as CilSet,
  mechanicalSet05 as unknown as CilSet,
  mechanicalSet06 as unknown as CilSet,
  mechanicalSet07 as unknown as CilSet,
  mechanicalSet08 as unknown as CilSet,
  mechanicalSet09 as unknown as CilSet,
  mechanicalSet10 as unknown as CilSet,
  mechanicalSet11 as unknown as CilSet,
  mechanicalSet12 as unknown as CilSet,
  mechanicalSet13 as unknown as CilSet,
  mechanicalSet14 as unknown as CilSet,
  mechanicalSet15 as unknown as CilSet,
  systemSet01 as unknown as CilSet,
  systemSet02 as unknown as CilSet,
  systemSet03 as unknown as CilSet,
  systemSet04 as unknown as CilSet,
  systemSet05 as unknown as CilSet,
  systemSet06 as unknown as CilSet,
  systemSet07 as unknown as CilSet,
  systemSet08 as unknown as CilSet,
  systemSet09 as unknown as CilSet,
  systemSet10 as unknown as CilSet,
  systemSet11 as unknown as CilSet,
  systemSet12 as unknown as CilSet,
  systemSet13 as unknown as CilSet,
  systemSet14 as unknown as CilSet,
  systemSet15 as unknown as CilSet,
  entSet01 as unknown as CilSet,
  entSet02 as unknown as CilSet,
  entSet03 as unknown as CilSet,
  entSet04 as unknown as CilSet,
  entSet05 as unknown as CilSet,
  entSet06 as unknown as CilSet,
  entSet07 as unknown as CilSet,
  entSet08 as unknown as CilSet,
  entSet09 as unknown as CilSet,
  entSet10 as unknown as CilSet,
  entSet11 as unknown as CilSet,
  entSet12 as unknown as CilSet,
  entSet13 as unknown as CilSet,
  entSet14 as unknown as CilSet,
  entSet15 as unknown as CilSet,
  geologySet01 as unknown as CilSet,
  geologySet02 as unknown as CilSet,
  geologySet03 as unknown as CilSet,
  geologySet04 as unknown as CilSet,
  geologySet05 as unknown as CilSet,
  geologySet06 as unknown as CilSet,
  geologySet07 as unknown as CilSet,
  geologySet08 as unknown as CilSet,
  geologySet09 as unknown as CilSet,
  geologySet10 as unknown as CilSet,
  geologySet11 as unknown as CilSet,
  geologySet12 as unknown as CilSet,
  geologySet13 as unknown as CilSet,
  geologySet14 as unknown as CilSet,
  geologySet15 as unknown as CilSet,
  ieSet01 as unknown as CilSet,
  ieSet02 as unknown as CilSet,
  ieSet03 as unknown as CilSet,
  ieSet04 as unknown as CilSet,
  ieSet05 as unknown as CilSet,
  ieSet06 as unknown as CilSet,
  ieSet07 as unknown as CilSet,
  ieSet08 as unknown as CilSet,
  ieSet09 as unknown as CilSet,
  ieSet10 as unknown as CilSet,
  ieSet11 as unknown as CilSet,
  ieSet12 as unknown as CilSet,
  ieSet13 as unknown as CilSet,
  ieSet14 as unknown as CilSet,
  ieSet15 as unknown as CilSet,
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
