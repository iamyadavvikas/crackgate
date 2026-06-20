/** GATE Civil (CE) — All India Test Series schedule.
 *
 *  Premium-only timed mocks released on a fixed calendar through the GATE 2027
 *  cycle. Each entry maps to an existing CE mock in ./mocks.ts (mockRefId =
 *  "ce-mock-XX"), so AITS is a scheduled-release wrapper, not new question data.
 *
 *  When scheduledAt is in the future, the test is "locked"; once past it
 *  behaves like any other mock but is ranked against all CE AITS-takers.
 */
import type { AitsTest } from "@/data/aits";

export { isUnlocked, countdownSec } from "@/data/aits";

export const CE_AITS: AitsTest[] = [
  { id: "ce-aits-01", mockRefId: "ce-mock-08", title: "CE AITS 01 · Engineering Mathematics + GA",        scheduledAt: "2026-07-15T09:00:00.000Z", durationMin: 180, syllabus: "Engineering Mathematics + General Aptitude (full)" },
  { id: "ce-aits-02", mockRefId: "ce-mock-02", title: "CE AITS 02 · Structural Mechanics & Analysis",     scheduledAt: "2026-08-05T09:00:00.000Z", durationMin: 180, syllabus: "Engineering Mechanics, Solid Mechanics, Structural Analysis" },
  { id: "ce-aits-03", mockRefId: "ce-mock-03", title: "CE AITS 03 · RCC & Steel Design",                  scheduledAt: "2026-08-26T09:00:00.000Z", durationMin: 180, syllabus: "Concrete Structures, Steel Structures" },
  { id: "ce-aits-04", mockRefId: "ce-mock-04", title: "CE AITS 04 · Geotechnical Engineering",            scheduledAt: "2026-09-16T09:00:00.000Z", durationMin: 180, syllabus: "Soil Mechanics, Foundation Engineering" },
  { id: "ce-aits-05", mockRefId: "ce-mock-05", title: "CE AITS 05 · Water Resources & Hydraulics",        scheduledAt: "2026-10-07T09:00:00.000Z", durationMin: 180, syllabus: "Fluid Mechanics, Hydraulics, Hydrology, Irrigation" },
  { id: "ce-aits-06", mockRefId: "ce-mock-06", title: "CE AITS 06 · Environmental Engineering",           scheduledAt: "2026-10-28T09:00:00.000Z", durationMin: 180, syllabus: "Water & Wastewater, Air, Solid Waste, Noise" },
  { id: "ce-aits-07", mockRefId: "ce-mock-07", title: "CE AITS 07 · Transportation & Geomatics",          scheduledAt: "2026-11-18T09:00:00.000Z", durationMin: 180, syllabus: "Transportation Engineering, Geomatics & Surveying" },
  { id: "ce-aits-08", mockRefId: "ce-mock-13", title: "CE AITS 08 · Construction Materials & Management",  scheduledAt: "2026-12-09T09:00:00.000Z", durationMin: 180, syllabus: "Construction Materials, PERT/CPM, project management" },
  { id: "ce-aits-09", mockRefId: "ce-mock-09", title: "CE AITS 09 · Full Syllabus FLT #1",                scheduledAt: "2026-12-30T09:00:00.000Z", durationMin: 180, syllabus: "Full GATE CE syllabus" },
  { id: "ce-aits-10", mockRefId: "ce-mock-20", title: "CE AITS 10 · Full Syllabus FLT #2 (Final)",        scheduledAt: "2027-01-20T09:00:00.000Z", durationMin: 180, syllabus: "Full GATE CE syllabus — final dress rehearsal" },
];
