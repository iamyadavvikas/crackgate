/**
 * GATE Geology & Geophysics (GG) practice banks — loaded from per-subject JSON.
 *
 * Source of truth: apps/web/src/data/questions/practice/gg-<slug>.json
 * Regenerate via: npx tsx scripts/build_gg_practice.ts
 *
 * General Aptitude is shared with every GATE paper, so it is re-exported from
 * the common bank rather than duplicated.
 */
import type { PracticeSubject } from "@/data/practice";

import generalAptitude from "@/data/questions/practice/general-aptitude.json";
import math from "@/data/questions/practice/gg-geology-mathematics.json";
import earth from "@/data/questions/practice/gg-earth-system-geomorphology.json";
import structural from "@/data/questions/practice/gg-structural-geology.json";
import mineralogy from "@/data/questions/practice/gg-mineralogy-crystallography.json";
import igneous from "@/data/questions/practice/gg-igneous-petrology.json";
import sedimentary from "@/data/questions/practice/gg-sedimentary-petrology.json";
import metamorphic from "@/data/questions/practice/gg-metamorphic-petrology.json";
import stratigraphy from "@/data/questions/practice/gg-stratigraphy-indian-geology.json";
import paleontology from "@/data/questions/practice/gg-paleontology.json";
import economic from "@/data/questions/practice/gg-economic-ore-geology.json";
import geochemistry from "@/data/questions/practice/gg-geochemistry-isotope.json";
import engineering from "@/data/questions/practice/gg-engineering-environmental-geology.json";
import geophysics from "@/data/questions/practice/gg-geophysics.json";
import remoteSensing from "@/data/questions/practice/gg-applied-remote-sensing-gis.json";

/** Geology (GG) practice subjects in syllabus display order. */
export const GG_PRACTICE: PracticeSubject[] = [
  generalAptitude,
  math,
  earth,
  structural,
  mineralogy,
  igneous,
  sedimentary,
  metamorphic,
  stratigraphy,
  paleontology,
  economic,
  geochemistry,
  engineering,
  geophysics,
  remoteSensing,
] as PracticeSubject[];
