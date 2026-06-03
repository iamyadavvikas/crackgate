/**
 * One-shot: split the monolithic practice.ts and mocks.ts into per-subject /
 * per-mock JSON files so they can be edited independently.
 *
 *   apps/web/src/data/questions/practice/<subject-slug>.json   (10 files)
 *   apps/web/src/data/questions/mocks/<mock-id>.json            (10 files)
 *
 * Run once:  npx tsx scripts/split_data.ts
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PRACTICE } from "../apps/web/src/data/practice";
import { MOCKS } from "../apps/web/src/data/mocks";

const root = process.cwd();
const practiceDir = resolve(root, "apps/web/src/data/questions/practice");
const mocksDir    = resolve(root, "apps/web/src/data/questions/mocks");

if (!existsSync(practiceDir)) mkdirSync(practiceDir, { recursive: true });
if (!existsSync(mocksDir))    mkdirSync(mocksDir,    { recursive: true });

// ---------- Practice: one JSON per subject ----------
for (const subj of PRACTICE) {
  const file = resolve(practiceDir, `${subj.slug}.json`);
  const payload = {
    slug: subj.slug,
    name: subj.name,
    questions: subj.questions,
  };
  writeFileSync(file, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`  practice/${subj.slug}.json  (${subj.questions.length} Qs)`);
}

// ---------- Mocks: one JSON per mock ----------
for (const m of MOCKS as ReadonlyArray<{ id: string; questions: unknown[] }>) {
  const file = resolve(mocksDir, `${m.id}.json`);
  writeFileSync(file, JSON.stringify(m, null, 2) + "\n", "utf8");
  console.log(`  mocks/${m.id}.json  (${m.questions.length} Qs)`);
}

console.log(`\n✅ Split complete. Edit JSONs in:\n  ${practiceDir}\n  ${mocksDir}`);
