/** GATE Geology & Geophysics (GG) — All India Test Series schedule.
 *
 *  Premium-only timed mocks released on a fixed calendar through the GATE 2027
 *  cycle. Each entry maps to an existing GG mock in ./mocks.ts (mockRefId =
 *  "gg-mock-XX"), so AITS is a scheduled-release wrapper, not new question data.
 *
 *  When scheduledAt is in the future, the test is "locked"; once past it
 *  behaves like any other mock but is ranked against all GG AITS-takers.
 */
import type { AitsTest } from "@/data/aits";

export { isUnlocked, countdownSec } from "@/data/aits";

export const GG_AITS: AitsTest[] = [
  { id: "gg-aits-01", mockRefId: "gg-mock-08", title: "GG AITS 01 · Geophysics + GA",                       scheduledAt: "2026-07-15T09:00:00.000Z", durationMin: 180, syllabus: "Geophysics (gravity, magnetic, seismic, electrical) + General Aptitude" },
  { id: "gg-aits-02", mockRefId: "gg-mock-02", title: "GG AITS 02 · Structural Geology",                    scheduledAt: "2026-08-05T09:00:00.000Z", durationMin: 180, syllabus: "Structural Geology, stress–strain, stereographic projection" },
  { id: "gg-aits-03", mockRefId: "gg-mock-03", title: "GG AITS 03 · Mineralogy & Crystallography",          scheduledAt: "2026-08-26T09:00:00.000Z", durationMin: 180, syllabus: "Crystallography, mineralogy, optical mineralogy" },
  { id: "gg-aits-04", mockRefId: "gg-mock-04", title: "GG AITS 04 · Igneous & Metamorphic Petrology",       scheduledAt: "2026-09-16T09:00:00.000Z", durationMin: 180, syllabus: "Igneous & Metamorphic Petrology" },
  { id: "gg-aits-05", mockRefId: "gg-mock-05", title: "GG AITS 05 · Sedimentology & Stratigraphy",          scheduledAt: "2026-10-07T09:00:00.000Z", durationMin: 180, syllabus: "Sedimentology, Stratigraphy & Indian Geology" },
  { id: "gg-aits-06", mockRefId: "gg-mock-07", title: "GG AITS 06 · Economic & Ore Geology",                scheduledAt: "2026-10-28T09:00:00.000Z", durationMin: 180, syllabus: "Economic & Ore Geology, Indian mineral deposits" },
  { id: "gg-aits-07", mockRefId: "gg-mock-09", title: "GG AITS 07 · Geochemistry & Isotope Geology",        scheduledAt: "2026-11-18T09:00:00.000Z", durationMin: 180, syllabus: "Geochemistry, isotope geology & geochronology" },
  { id: "gg-aits-08", mockRefId: "gg-mock-14", title: "GG AITS 08 · Engineering & Environmental Geology",   scheduledAt: "2026-12-09T09:00:00.000Z", durationMin: 180, syllabus: "Engineering & Environmental Geology, Hydrogeology" },
  { id: "gg-aits-09", mockRefId: "gg-mock-11", title: "GG AITS 09 · Full Syllabus FLT #1",                  scheduledAt: "2026-12-30T09:00:00.000Z", durationMin: 180, syllabus: "Full GATE GG syllabus" },
  { id: "gg-aits-10", mockRefId: "gg-mock-20", title: "GG AITS 10 · Full Syllabus FLT #2 (Final)",          scheduledAt: "2027-01-20T09:00:00.000Z", durationMin: 180, syllabus: "Full GATE GG syllabus — final dress rehearsal" },
];
