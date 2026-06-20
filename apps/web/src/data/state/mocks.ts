/**
 * STATE-level mining mock tests — one JSON file per mock.
 *
 * Source of truth: apps/web/src/data/questions/mocks/state-<exam>-mock-NN.json
 * Regenerate via:  npx tsx scripts/build_state_diploma_mocks.ts
 *
 * Currently shipped: RPSC Assistant Mining Engineer (Rajasthan PSC) —
 *   150 MCQ · 150 marks (1 mark each) · 150 minutes · online CBT · −1/3 negative.
 *   Pattern source: testbook.com/rpsc-assistant-mining-engineer/syllabus-exam-pattern
 *   (official RPSC syllabus PDF); PYQ archive: rpsc.rajasthan.gov.in.
 */
import rpscMock01 from "@/data/questions/mocks/state-rpsc-ame-mock-01.json";
import rpscMock02 from "@/data/questions/mocks/state-rpsc-ame-mock-02.json";

export const STATE_MOCKS = [rpscMock01, rpscMock02] as const;
