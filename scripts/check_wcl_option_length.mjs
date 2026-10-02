#!/usr/bin/env node
/**
 * Option-length cue guard for the WCL Mining Sirdar mock bank.
 *
 * A correct option that is reliably the longest (or the shortest) lets a
 * candidate score by picking the most detailed-looking line instead of reading
 * the stem. On the pre-remediation bank the correct option was strictly the
 * longest in 71% of items, which is a large free-marks shortcut.
 *
 * This is a standalone script with zero dependencies on purpose. The unit-test
 * runner currently cannot start (vitest 3.x against a hoisted vite 7.x), so a
 * guard expressed as a vitest case would silently never execute. Runs in CI as
 * its own step so it keeps working regardless of the test toolchain.
 *
 * Usage:
 *   node scripts/check_wcl_option_length.mjs           # enforce, exit 1 on violation
 *   node scripts/check_wcl_option_length.mjs --report  # human summary, always exit 0
 *
 * Band semantics, with K = length of the correct option:
 *   K >= 0.75 * longest   and   K <= 1.35 * shortest
 * i.e. the correct option sits within roughly +/-25% of the option spread.
 * Deliberately loose: it only rejects gross skew, so ordinary rewording of a
 * distractor does not fail the build.
 *
 * Exemptions:
 *   - short items (longest option under MIN_CORROBORATING_LENGTH chars) --
 *     numeric/unit items are dominated by the value itself, and options too
 *     short to form a clause reflect noun choice, not elaboration
 *   - flat items, where every option is the same length
 *   - NAT items, and MSQ items with more than one marked answer
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MOCK_DIR = new URL("../apps/web/src/data/questions/mocks/", import.meta.url).pathname;
const FILE_PREFIX = "diploma-wcl-sirdar-mock-";

const KEY_SKEW_LOW = 0.75;
const KEY_SKEW_HIGH = 1.35;
const MIN_CORROBORATING_LENGTH = 16;

// 25% is the chance rate for one correct answer among four. 40% leaves headroom
// for sampling noise while still failing if the cue comes back.
const MAX_STRICTLY_LONGEST_RATE = 0.4;

const reportOnly = process.argv.includes("--report");

function loadMocks() {
  return readdirSync(MOCK_DIR)
    .filter((f) => f.startsWith(FILE_PREFIX) && f.endsWith(".json"))
    .sort()
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(MOCK_DIR, f), "utf8")) }));
}

/** @returns {{where:string, K:number, shortest:number, longest:number}|null} */
function checkQuestion(mockId, q) {
  if (String(q.type).toLowerCase() === "nat") return null;
  if (!Array.isArray(q.options) || q.options.length < 2) return null;

  const answers = (Array.isArray(q.answer) ? q.answer : [q.answer]).filter(
    (a) => Number.isInteger(a) && a >= 0 && a < q.options.length,
  );
  // Exactly one marked answer: MSQ and malformed items are scored elsewhere.
  if (answers.length !== 1) return null;

  const lens = q.options.map((o) => (typeof o === "string" ? o.length : 0));
  const longest = Math.max(...lens);
  const shortest = Math.min(...lens);
  if (longest < MIN_CORROBORATING_LENGTH) return null;
  if (longest === shortest) return null;

  const K = lens[answers[0]];
  if (K >= KEY_SKEW_LOW * longest && K <= KEY_SKEW_HIGH * shortest) return null;

  const where = `${mockId} q:${String(q.id ?? "")} "${String(q.stem ?? "").slice(0, 48)}"`;
  return { where, K, shortest, longest };
}

const mocks = loadMocks();
const offenders = [];
let scoreable = 0;
let strictlyLongest = 0;
let totalItems = 0;
const perMock = [];

for (const { file, data } of mocks) {
  const mockId = file.replace(/\.json$/, "");
  const questions = Array.isArray(data.questions) ? data.questions : [];
  totalItems += questions.length;

  let mockScoreable = 0;
  let mockStrict = 0;

  for (const q of questions) {
    const bad = checkQuestion(mockId, q);
    if (bad) offenders.push(bad);

    if (String(q.type).toLowerCase() === "nat") continue;
    if (!Array.isArray(q.options) || q.options.length < 2) continue;
    const answers = (Array.isArray(q.answer) ? q.answer : [q.answer]).filter(
      (a) => Number.isInteger(a) && a >= 0 && a < q.options.length,
    );
    if (answers.length !== 1) continue;

    const lens = q.options.map((o) => (typeof o === "string" ? o.length : 0));
    const longest = Math.max(...lens);
    if (longest < MIN_CORROBORATING_LENGTH) continue;

    scoreable++;
    mockScoreable++;
    if (lens[answers[0]] === longest && lens.filter((l) => l === longest).length === 1) {
      strictlyLongest++;
      mockStrict++;
    }
  }

  perMock.push({ mockId, items: questions.length, scoreable: mockScoreable, strict: mockStrict });
}

const strictRate = scoreable ? strictlyLongest / scoreable : 0;
const worst = [...perMock].sort((a, b) => b.strict / Math.max(1, b.scoreable) - a.strict / Math.max(1, a.scoreable)).slice(0, 5);

console.log(`WCL option-length guard: ${mocks.length} mocks, ${totalItems} items`);
console.log(
  `  scoreable (band-checked): ${scoreable}` +
    `   correct option strictly longest: ${strictlyLongest} (${(strictRate * 100).toFixed(1)}%)`,
);
console.log(`  band violations: ${offenders.length}`);
for (const w of worst) {
  console.log(
    `    ${w.mockId}: ${w.strict}/${w.scoreable} strictly longest (${((w.strict / Math.max(1, w.scoreable)) * 100).toFixed(0)}%)`,
  );
}

if (reportOnly) {
  if (offenders.length) {
    console.log("\nviolations (first 40):");
    for (const o of offenders.slice(0, 40)) {
      console.log(`  ${o.where}  key=${o.K} shortest=${o.shortest} longest=${o.longest}`);
    }
    if (offenders.length > 40) console.log(`  ... and ${offenders.length - 40} more`);
  }
  process.exit(0);
}

let failed = false;

if (offenders.length) {
  failed = true;
  console.error(
    `\nFAIL: ${offenders.length} item(s) leave the correct option isolated in length ` +
      `(>${Math.round((1 / KEY_SKEW_LOW - 1) * 100)}% longer than the shortest option, ` +
      `or >${Math.round((KEY_SKEW_HIGH - 1) * 100)}% shorter than the longest).`,
  );
  for (const o of offenders.slice(0, 40)) {
    console.error(`  ${o.where}  key=${o.K} shortest=${o.shortest} longest=${o.longest}`);
  }
  if (offenders.length > 40) console.error(`  ... and ${offenders.length - 40} more`);
  console.error("\nFix: adjust distractor wording only. Never edit the correct option,");
  console.error("the answer index, or any other field to satisfy this check.");
}

if (strictRate > MAX_STRICTLY_LONGEST_RATE) {
  failed = true;
  console.error(
    `\nFAIL: correct option is strictly longest in ${(strictRate * 100).toFixed(1)}% of ` +
      `${scoreable} scoreable items (limit ${MAX_STRICTLY_LONGEST_RATE * 100}%).`,
  );
  console.error("The 'pick the longest option' heuristic is scoring above chance.");
  console.error("Fix: lengthen at least one distractor past the correct option per item.");
}

if (failed) process.exit(1);
console.log("\nPASS: no exploitable option-length cue detected.");