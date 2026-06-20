/**
 * DIPLOMA-level mining mock tests — one JSON file per mock.
 *
 * Source of truth: apps/web/src/data/questions/mocks/diploma-<exam>-mock-NN.json
 * Regenerate via:  npx tsx scripts/build_state_diploma_mocks.ts
 *
 * Currently shipped: Coalfield Mining Sirdar / Junior Overman CBT —
 *   100 MCQ · 100 marks (1 mark each) · 120 minutes · bilingual · NO negative.
 *   Section A: General Awareness & Aptitude (20) + Section B: Technical (80).
 *   Pattern source: mineportal.in/blog/mcl-2022-exam-pattern/1 (20+80, no −ve).
 *   Technical content mapped to the DGMS Mining Sirdar / Overman Certificate of
 *   Competency syllabus under Coal Mines Regulations, 2017
 *   (dgms.gov.in/UserView/index?mid=1255).
 */
import sirdarMock01 from "@/data/questions/mocks/diploma-coal-sirdar-mock-01.json";
import overmanMock01 from "@/data/questions/mocks/diploma-coal-overman-mock-01.json";

export const DIPLOMA_MOCKS = [sirdarMock01, overmanMock01] as const;
