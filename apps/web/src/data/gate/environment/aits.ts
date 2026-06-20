/** GATE Environmental Science (ES) — All India Test Series schedule.
 *
 *  Premium-only timed mocks released on a fixed calendar through the GATE 2027
 *  cycle. Each entry maps to an existing ES mock in ./mocks.ts (mockRefId =
 *  "es-mock-XX"), so AITS is a scheduled-release wrapper, not new question data.
 *
 *  When scheduledAt is in the future, the test is "locked"; once past it
 *  behaves like any other mock but is ranked against all ES AITS-takers.
 */
import type { AitsTest } from "@/data/aits";

export { isUnlocked, countdownSec } from "@/data/aits";

export const ES_AITS: AitsTest[] = [
  { id: "es-aits-01", mockRefId: "es-mock-04", title: "ES AITS 01 · Environmental Chemistry + GA",        scheduledAt: "2026-07-15T09:00:00.000Z", durationMin: 180, syllabus: "Environmental Chemistry + General Aptitude (full)" },
  { id: "es-aits-02", mockRefId: "es-mock-13", title: "ES AITS 02 · Chemistry & Microbiology",            scheduledAt: "2026-08-05T09:00:00.000Z", durationMin: 180, syllabus: "Environmental Chemistry, Environmental Microbiology" },
  { id: "es-aits-03", mockRefId: "es-mock-05", title: "ES AITS 03 · Ecology & Biodiversity",              scheduledAt: "2026-08-26T09:00:00.000Z", durationMin: 180, syllabus: "Ecology, Biodiversity, ecosystems, population dynamics" },
  { id: "es-aits-04", mockRefId: "es-mock-02", title: "ES AITS 04 · Air & Noise Pollution",               scheduledAt: "2026-09-16T09:00:00.000Z", durationMin: 180, syllabus: "Air Pollution, dispersion, control, Noise Pollution" },
  { id: "es-aits-05", mockRefId: "es-mock-03", title: "ES AITS 05 · Water & Wastewater Treatment",        scheduledAt: "2026-10-07T09:00:00.000Z", durationMin: 180, syllabus: "Water quality, water & wastewater treatment" },
  { id: "es-aits-06", mockRefId: "es-mock-06", title: "ES AITS 06 · Solid & Hazardous Waste",             scheduledAt: "2026-10-28T09:00:00.000Z", durationMin: 180, syllabus: "Solid waste, hazardous & biomedical waste management" },
  { id: "es-aits-07", mockRefId: "es-mock-08", title: "ES AITS 07 · Global & Regional Issues",            scheduledAt: "2026-11-18T09:00:00.000Z", durationMin: 180, syllabus: "Climate change, ozone depletion, acid rain, protocols" },
  { id: "es-aits-08", mockRefId: "es-mock-18", title: "ES AITS 08 · Management & Ethics",                 scheduledAt: "2026-12-09T09:00:00.000Z", durationMin: 180, syllabus: "EIA, EMS/ISO 14000, environmental economics & ethics" },
  { id: "es-aits-09", mockRefId: "es-mock-09", title: "ES AITS 09 · Full Syllabus FLT #1",                scheduledAt: "2026-12-30T09:00:00.000Z", durationMin: 180, syllabus: "Full GATE ES syllabus" },
  { id: "es-aits-10", mockRefId: "es-mock-20", title: "ES AITS 10 · Full Syllabus FLT #2 (Final)",        scheduledAt: "2027-01-20T09:00:00.000Z", durationMin: 180, syllabus: "Full GATE ES syllabus — final dress rehearsal" },
];
