/**
 * GATE Civil (CE) practice banks — loaded from per-subject JSON.
 *
 * Source of truth: apps/web/src/data/questions/practice/ce-<slug>.json
 * Regenerate via: npx tsx scripts/build_ce_practice.ts
 *
 * General Aptitude is shared with every GATE paper, so it is re-exported from
 * the common bank rather than duplicated.
 */
import type { PracticeSubject } from "@/data/practice";

import generalAptitude from "@/data/questions/practice/general-aptitude.json";
import math from "@/data/questions/practice/ce-engineering-mathematics.json";
import mechanics from "@/data/questions/practice/ce-engineering-mechanics.json";
import solid from "@/data/questions/practice/ce-solid-mechanics.json";
import structural from "@/data/questions/practice/ce-structural-analysis.json";
import construction from "@/data/questions/practice/ce-construction-materials-management.json";
import concrete from "@/data/questions/practice/ce-concrete-structures.json";
import steel from "@/data/questions/practice/ce-steel-structures.json";
import soil from "@/data/questions/practice/ce-soil-mechanics.json";
import foundation from "@/data/questions/practice/ce-foundation-engineering.json";
import fluid from "@/data/questions/practice/ce-fluid-mechanics-hydraulics.json";
import hydrology from "@/data/questions/practice/ce-hydrology-irrigation.json";
import environmental from "@/data/questions/practice/ce-environmental-engineering.json";
import transportation from "@/data/questions/practice/ce-transportation-engineering.json";
import surveying from "@/data/questions/practice/ce-geomatics-surveying.json";

/** Civil practice subjects in syllabus display order. */
export const CE_PRACTICE: PracticeSubject[] = [
  generalAptitude,
  math,
  mechanics,
  solid,
  structural,
  construction,
  concrete,
  steel,
  soil,
  foundation,
  fluid,
  hydrology,
  environmental,
  transportation,
  surveying,
] as PracticeSubject[];
