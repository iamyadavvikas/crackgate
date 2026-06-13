/**
 * Practice question bank — loaded from per-subject JSON files.
 *
 * Source of truth:  apps/web/src/data/questions/practice/<slug>.json
 *
 * To add/edit questions: open the JSON for that subject and edit by hand,
 * OR use the admin UI at /admin/questions (writes to the same files).
 *
 * After editing, run `npm run build:mocks` so the 10 mocks pick up changes
 * (mocks you haven't customised by hand are regenerated; edited ones stay).
 */
import type { QuestionFigure } from "@/components/question-figure";

/** Blueprint archetypes for the curated 175-question pool:
 *   A = Formula & unit-conversion traps
 *   B = Vintage PYQ variants (2011–2026, re-parameterised)
 *   C = Advanced diagrammatic / chart-based (always carries a figure)
 *   D = High-caliber "rank determinator" multi-stage problems
 *  Optional metadata — the runner ignores it; used for blueprint tracking. */
export type PracticeArchetype = "A" | "B" | "C" | "D";

export type PracticeQuestion =
  | { id: string; subject: string; topic: string; difficulty: "easy"|"medium"|"hard"; type: "MCQ"; stem: string; options: string[]; answer: number; solution: string; figure?: QuestionFigure; archetype?: PracticeArchetype; marks?: 1|2; }
  | { id: string; subject: string; topic: string; difficulty: "easy"|"medium"|"hard"; type: "MSQ"; stem: string; options: string[]; answer: number[]; solution: string; figure?: QuestionFigure; archetype?: PracticeArchetype; marks?: 1|2; }
  | { id: string; subject: string; topic: string; difficulty: "easy"|"medium"|"hard"; type: "NAT"; stem: string; answer: number; tolerance: number; solution: string; figure?: QuestionFigure; archetype?: PracticeArchetype; marks?: 1|2; };

export interface PracticeSubject {
  slug: string;
  name: string;
  questions: PracticeQuestion[];
}

// Static imports — each JSON is bundled at build time. Order = display order.
import engineeringMathematics from "./questions/practice/engineering-mathematics.json";
import generalAptitude        from "./questions/practice/general-aptitude.json";
import mineVentilation        from "./questions/practice/mine-ventilation.json";
import rockMechanics          from "./questions/practice/rock-mechanics.json";
import surfaceMining          from "./questions/practice/surface-mining.json";
import undergroundMining      from "./questions/practice/underground-mining.json";
import drillingBlasting       from "./questions/practice/drilling-blasting.json";
import mineEconomicsPlanning  from "./questions/practice/mine-economics-planning.json";
import mineSurveying          from "./questions/practice/mine-surveying.json";
import mineEnvironment        from "./questions/practice/mine-environment.json";import miningGeology         from "./questions/practice/mining-geology.json";
export const PRACTICE: PracticeSubject[] = [
  engineeringMathematics,
  generalAptitude,
  mineVentilation,
  rockMechanics,
  surfaceMining,
  undergroundMining,
  drillingBlasting,
  mineEconomicsPlanning,
  mineSurveying,
  mineEnvironment,
  miningGeology,
] as PracticeSubject[];
