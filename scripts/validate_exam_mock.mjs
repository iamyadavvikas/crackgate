// Pattern-aware structural validator for non-GATE mock JSON (STATE / DIPLOMA).
//
// Unlike scripts/validate_mock.mjs (which hard-codes the GATE 65 Q / 100 mark
// blueprint), this validator checks each mock against its OWN declared
// `sections[]`, `totalMarks` and per-question marks. Use it for the RPSC /
// coalfield-CBT mocks whose patterns differ from GATE.
//
// Usage:
//   node scripts/validate_exam_mock.mjs apps/web/src/data/questions/mocks/state-rpsc-ame-mock-01.json
import { readFileSync } from "node:fs";

const FIGURE_KINDS = new Set([
  "mohr", "ventilation", "bench", "stress-block", "stereonet", "pq-curve", "svg",
]);

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/validate_exam_mock.mjs <mock.json>");
  process.exit(2);
}

const d = JSON.parse(readFileSync(file, "utf8"));
const q = d.questions;
const problems = [];

// Top-level fields
for (const f of ["id", "title", "tier", "duration", "pattern", "totalMarks", "sections", "negativeMarking", "seed", "questions"]) {
  if (!(f in d)) problems.push(`missing top-level field "${f}"`);
}
if (!Array.isArray(q)) problems.push("questions is not an array");

// Section counts/marks must match the declared sections[]
const declaredCount = (d.sections || []).reduce((s, x) => s + x.count, 0);
const declaredMarks = (d.sections || []).reduce((s, x) => s + x.marks, 0);
if (Array.isArray(q) && q.length !== declaredCount) problems.push(`question count ${q.length} != sum(section counts) ${declaredCount}`);
if (declaredMarks !== d.totalMarks) problems.push(`sum(section marks) ${declaredMarks} != totalMarks ${d.totalMarks}`);

// Per-section question tallies
if (Array.isArray(q)) {
  for (const sec of d.sections || []) {
    const got = q.filter((x) => x.section === sec.name).length;
    if (got !== sec.count) problems.push(`section "${sec.name}": ${got} questions, expected ${sec.count}`);
  }
}

// Marks add up
const marks = Array.isArray(q) ? q.reduce((s, x) => s + x.marks, 0) : 0;
if (marks !== d.totalMarks) problems.push(`sum(question marks) ${marks} != totalMarks ${d.totalMarks}`);

// Ids unique + sequential
const ids = Array.isArray(q) ? q.map((x) => x.id) : [];
const dupes = ids.length - new Set(ids).size;
if (dupes) problems.push(`duplicate question ids: ${dupes}`);

// Per-question integrity
let figs = 0;
for (const x of q || []) {
  if (x.figure) {
    figs++;
    if (!x.figure.kind) problems.push(`Q${x.id} figure missing kind`);
    else if (!FIGURE_KINDS.has(x.figure.kind)) problems.push(`Q${x.id} unknown figure kind "${x.figure.kind}"`);
  }
  if (!x.solution || typeof x.solution !== "string") problems.push(`Q${x.id} missing solution`);
  if (!x.subject) problems.push(`Q${x.id} missing subject`);
  if (x.type === "MCQ") {
    if (typeof x.answer !== "number" || !Array.isArray(x.options)) problems.push(`Q${x.id} bad MCQ`);
    else if (x.answer < 0 || x.answer >= x.options.length) problems.push(`Q${x.id} MCQ answer out of range`);
    else if (new Set(x.options).size !== x.options.length) problems.push(`Q${x.id} duplicate options`);
  } else if (x.type === "MSQ") {
    if (!Array.isArray(x.answer) || !Array.isArray(x.options)) problems.push(`Q${x.id} bad MSQ`);
  } else if (x.type === "NAT") {
    if (x.options) problems.push(`Q${x.id} NAT has options`);
    if (typeof x.answer !== "number") problems.push(`Q${x.id} NAT answer not number`);
    if (typeof x.tolerance !== "number") problems.push(`Q${x.id} NAT missing tolerance`);
  } else {
    problems.push(`Q${x.id} unknown type ${x.type}`);
  }
}

console.log(`${file}`);
console.log(`  count=${ids.length} sections=${(d.sections || []).map((s) => `${s.name}:${s.count}`).join(", ")} marks=${marks}/${d.totalMarks} figures=${figs} dupes=${dupes}`);
console.log(problems.length ? "  PROBLEMS:\n   - " + problems.join("\n   - ") : "  OK ✓");
process.exit(problems.length ? 1 : 0);
