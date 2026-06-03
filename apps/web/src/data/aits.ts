/** AITS — All India Test Series schedule.
 *
 *  Premium-only timed mocks released on a fixed calendar through the
 *  GATE 2027 cycle. Each entry maps to an existing mock in /data/mocks.ts
 *  (refId="mock-XX") so we don't need a separate test bank — AITS is a
 *  scheduled-release wrapper, not new question data.
 *
 *  When scheduledAt is in the future, the test is "locked".
 *  When in the past, it behaves like any other mock — but results are
 *  ranked against all other AITS-takers for percentile.
 */

export type AitsTest = {
  id: string;             // "aits-01"
  mockRefId: string;      // links to data/mocks.ts mock-XX
  title: string;
  scheduledAt: string;    // ISO timestamp — exam goes live at this moment
  durationMin: number;
  syllabus: string;
};

// Cycle: AITS-01 every ~2 weeks starting Jul 2026, culminating Jan 2027 (pre-GATE)
export const AITS: AitsTest[] = [
  { id: "aits-01", mockRefId: "mn-mock-02", title: "AITS 01 · Engineering Mathematics + GA",   scheduledAt: "2026-07-15T09:00:00.000Z", durationMin: 180, syllabus: "Eng Math + Aptitude (full)" },
  { id: "aits-02", mockRefId: "mn-mock-03", title: "AITS 02 · Mine Development & Surveying",    scheduledAt: "2026-08-05T09:00:00.000Z", durationMin: 180, syllabus: "Mine Development, Surveying, Geology" },
  { id: "aits-03", mockRefId: "mn-mock-04", title: "AITS 03 · Rock Mechanics & Ground Control", scheduledAt: "2026-08-26T09:00:00.000Z", durationMin: 180, syllabus: "Rock Mechanics, Ground Control, Strata" },
  { id: "aits-04", mockRefId: "mn-mock-05", title: "AITS 04 · Drilling, Blasting & Excavation", scheduledAt: "2026-09-16T09:00:00.000Z", durationMin: 180, syllabus: "Drilling, Blasting, Explosives" },
  { id: "aits-05", mockRefId: "mn-mock-06", title: "AITS 05 · Surface & Underground Mining",     scheduledAt: "2026-10-07T09:00:00.000Z", durationMin: 180, syllabus: "Surface + Underground Mining methods" },
  { id: "aits-06", mockRefId: "mn-mock-07", title: "AITS 06 · Mine Ventilation & Environment",   scheduledAt: "2026-10-28T09:00:00.000Z", durationMin: 180, syllabus: "Ventilation, Climate, Dust, Gases" },
  { id: "aits-07", mockRefId: "mn-mock-08", title: "AITS 07 · Mineral Processing & Economics",   scheduledAt: "2026-11-18T09:00:00.000Z", durationMin: 180, syllabus: "Mineral Processing, Mining Economics" },
  { id: "aits-08", mockRefId: "mn-mock-09", title: "AITS 08 · Mine Safety, Legislation, Mgmt",   scheduledAt: "2026-12-09T09:00:00.000Z", durationMin: 180, syllabus: "Safety, Legislation, Mine Management" },
  { id: "aits-09", mockRefId: "mn-mock-10", title: "AITS 09 · Full Syllabus FLT #1",             scheduledAt: "2026-12-30T09:00:00.000Z", durationMin: 180, syllabus: "Full GATE MN syllabus" },
  { id: "aits-10", mockRefId: "mn-mock-10", title: "AITS 10 · Full Syllabus FLT #2 (Final)",     scheduledAt: "2027-01-20T09:00:00.000Z", durationMin: 180, syllabus: "Full GATE MN syllabus — final dress rehearsal" },
];

export function isUnlocked(test: AitsTest, now: Date = new Date()): boolean {
  return now >= new Date(test.scheduledAt);
}

export function countdownSec(test: AitsTest, now: Date = new Date()): number {
  return Math.max(0, Math.floor((new Date(test.scheduledAt).getTime() - now.getTime()) / 1000));
}
