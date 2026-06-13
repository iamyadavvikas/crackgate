// Quick structural validator for matured mock JSON files.
// Usage: node scripts/validate_mock.mjs apps/web/src/data/questions/mocks/mn-mock-09.json
import { readFileSync } from "node:fs";

const file = process.argv[2];
const d = JSON.parse(readFileSync(file, "utf8"));
const q = d.questions;
const problems = [];

const ga = q.filter((x) => x.section === "General Aptitude").length;
const t1 = q.filter((x) => x.section === "Technical (1-mark)").length;
const t2 = q.filter((x) => x.section === "Technical (2-mark)").length;
const marks = q.reduce((s, x) => s + x.marks, 0);
const figs = q.filter((x) => x.figure).length;
const ids = q.map((x) => x.id);
const dupes = ids.length - new Set(ids).size;

if (q.length !== 65) problems.push(`question count ${q.length} != 65`);
if (ga !== 10) problems.push(`GA ${ga} != 10`);
if (t1 !== 25) problems.push(`T1 ${t1} != 25`);
if (t2 !== 30) problems.push(`T2 ${t2} != 30`);
if (marks !== 100) problems.push(`marks ${marks} != 100`);
if (figs < 17) problems.push(`figures ${figs} < 17 (25% of 65)`);
if (dupes) problems.push(`duplicate ids: ${dupes}`);

for (const x of q) {
  if (x.type === "MCQ") {
    if (typeof x.answer !== "number" || !Array.isArray(x.options)) problems.push(`Q${x.id} bad MCQ`);
    else if (x.answer < 0 || x.answer >= x.options.length) problems.push(`Q${x.id} MCQ answer out of range`);
  } else if (x.type === "MSQ") {
    if (!Array.isArray(x.answer) || !Array.isArray(x.options)) problems.push(`Q${x.id} bad MSQ`);
  } else if (x.type === "NAT") {
    if (x.options) problems.push(`Q${x.id} NAT has options`);
    if (typeof x.answer !== "number") problems.push(`Q${x.id} NAT answer not number`);
    if (typeof x.tolerance !== "number") problems.push(`Q${x.id} NAT missing tolerance`);
  } else problems.push(`Q${x.id} unknown type ${x.type}`);
  if (x.figure && !x.figure.kind) problems.push(`Q${x.id} figure missing kind`);
  if ("answerNote" in x) problems.push(`Q${x.id} stray answerNote field`);
}

console.log(`${file}`);
console.log(`  count=${q.length} GA=${ga} T1=${t1} T2=${t2} marks=${marks} figures=${figs} (${(figs / q.length * 100).toFixed(1)}%) dupes=${dupes}`);
console.log(problems.length ? "  PROBLEMS:\n   - " + problems.join("\n   - ") : "  OK ✓");
process.exit(problems.length ? 1 : 0);
