/**
 * CrackGate — GATE-pattern full mock generator.
 *
 * Reads the per-subject practice bank, writes (or refreshes) one JSON file per
 * mock under apps/web/src/data/questions/mocks/. Mocks with `"locked":
 * true` are skipped so your hand-edits are never clobbered.
 *
 * GATE MN pattern (per mock):
 *   Section A · General Aptitude  — 5 × 1m + 5 × 2m   (15 marks)
 *   Section B · Technical         — 25 × 1m + 30 × 2m (85 marks)
 *   Total: 65 Q · 100 marks · 180 minutes
 *   Negative: -1/3 (1m MCQ), -2/3 (2m MCQ), 0 (NAT, MSQ)
 *
 * Usage:
 *   npm run build:mocks                     # regen all unlocked mocks
 *   npx tsx scripts/build_mocks.ts --force  # regen ALL, including locked
 *   npx tsx scripts/build_mocks.ts --only=mn-mock-02,mn-mock-09
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PRACTICE, type PracticeQuestion } from "../apps/web/src/data/practice";

// ---------- CLI ----------
const args = new Map(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, "").split("=");
  return [k, v ?? "true"];
}));
const FORCE = args.get("force") === "true";
const ONLY  = (args.get("only") ?? "").split(",").filter(Boolean);

// ---------- Deterministic RNG (mulberry32) ----------
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickUnique<T extends { id: string }>(pool: T[], n: number, used: Set<string>, rand: () => number): T[] {
  const out: T[] = [];
  for (const q of shuffle(pool, rand)) {
    if (out.length >= n) break;
    if (used.has(q.id)) continue;
    out.push(q);
    used.add(q.id);
  }
  return out;
}

// ---------- Mock specs ----------
type Tier = "free" | "subject" | "premium";
type DiffBias = "balanced" | "harder" | "hardest";

interface MockSpec {
  id: string;
  title: string;
  tier: Tier;
  focusSlugs: string[];
  diffBias: DiffBias;
}

const MOCK_SPECS: MockSpec[] = [
  { id: "mn-mock-01", title: "Mock Test 01 — Full Syllabus (Free)",                       tier: "free",    focusSlugs: [],                                                              diffBias: "balanced" },
  { id: "mn-mock-02", title: "Mock Test 02 — Ventilation & Environment Heavy",            tier: "subject", focusSlugs: ["mine-ventilation", "mine-environment"],                        diffBias: "balanced" },
  { id: "mn-mock-03", title: "Mock Test 03 — Rock Mechanics & Strata Control",            tier: "subject", focusSlugs: ["rock-mechanics"],                                              diffBias: "balanced" },
  { id: "mn-mock-04", title: "Mock Test 04 — Surface Mining & Mine Machinery",            tier: "subject", focusSlugs: ["surface-mining"],                                              diffBias: "balanced" },
  { id: "mn-mock-05", title: "Mock Test 05 — Underground Coal & Metal Mining",            tier: "subject", focusSlugs: ["underground-mining"],                                          diffBias: "balanced" },
  { id: "mn-mock-06", title: "Mock Test 06 — Drilling, Blasting & Explosives",            tier: "subject", focusSlugs: ["drilling-blasting"],                                           diffBias: "balanced" },
  { id: "mn-mock-07", title: "Mock Test 07 — Mine Surveying & Mineral Exploration",       tier: "subject", focusSlugs: ["mine-surveying"],                                              diffBias: "balanced" },
  { id: "mn-mock-08", title: "Mock Test 08 — Mineral Processing, Economics & Legislation",tier: "subject", focusSlugs: ["mineral-processing", "mine-environment"],                      diffBias: "balanced" },
  { id: "mn-mock-09", title: "Mock Test 09 — Full Syllabus High Difficulty",              tier: "subject", focusSlugs: [],                                                              diffBias: "harder"   },
  { id: "mn-mock-10", title: "Mock Test 10 — Grand Test (Premium)",                       tier: "premium", focusSlugs: [],                                                              diffBias: "hardest"  },
];

const gaSubject = PRACTICE.find((s) => s.slug === "general-aptitude");
if (!gaSubject) throw new Error("general-aptitude subject not found in PRACTICE");
const technicalSubjects = PRACTICE.filter((s) => s.slug !== "general-aptitude");

function diffWeightedPool(qs: PracticeQuestion[], bias: DiffBias): PracticeQuestion[] {
  if (bias === "hardest") return [
    ...qs.filter((q) => q.difficulty === "hard"),
    ...qs.filter((q) => q.difficulty === "hard"),
    ...qs.filter((q) => q.difficulty === "medium"),
  ];
  if (bias === "harder") return [
    ...qs.filter((q) => q.difficulty === "medium"),
    ...qs.filter((q) => q.difficulty === "hard"),
    ...qs.filter((q) => q.difficulty === "hard"),
  ];
  return qs;
}

function buildMock(spec: MockSpec) {
  const seed = hashSeed(spec.id);
  const rand = rng(seed);
  const used = new Set<string>();

  const ga1 = gaSubject!.questions.filter((q) => q.difficulty === "easy");
  const ga2 = gaSubject!.questions.filter((q) => q.difficulty !== "easy");
  const ga1Pick = pickUnique(ga1.length >= 5 ? ga1 : gaSubject!.questions, 5, used, rand)
    .map((q) => ({ ...q, marks: 1 as const, section: "General Aptitude" as const }));
  const ga2Pick = pickUnique(ga2.length >= 5 ? ga2 : gaSubject!.questions, 5, used, rand)
    .map((q) => ({ ...q, marks: 2 as const, section: "General Aptitude" as const }));

  const focus = new Set(spec.focusSlugs);
  const focusPool = technicalSubjects.filter((s) => focus.has(s.slug)).flatMap((s) => s.questions);
  const restPool  = technicalSubjects.filter((s) => !focus.has(s.slug)).flatMap((s) => s.questions);

  function technicalPool(targetDiff: "one" | "two"): PracticeQuestion[] {
    const filterByDiff = (q: PracticeQuestion) =>
      targetDiff === "one"
        ? q.difficulty === "easy" || q.difficulty === "medium"
        : q.difficulty === "medium" || q.difficulty === "hard";
    const focusFiltered = diffWeightedPool(focusPool.filter(filterByDiff), spec.diffBias);
    const restFiltered  = diffWeightedPool(restPool.filter(filterByDiff),  spec.diffBias);
    if (spec.focusSlugs.length === 0) return restFiltered.concat(focusFiltered);
    return [...focusFiltered, ...focusFiltered, ...focusFiltered, ...restFiltered];
  }

  const oneMark = pickUnique(technicalPool("one"), 25, used, rand)
    .map((q) => ({ ...q, marks: 1 as const, section: "Technical (1-mark)" as const }));
  const twoMark = pickUnique(technicalPool("two"), 30, used, rand)
    .map((q) => ({ ...q, marks: 2 as const, section: "Technical (2-mark)" as const }));

  const questions = [...ga1Pick, ...ga2Pick, ...oneMark, ...twoMark].map((q, idx) => ({
    id: idx + 1,
    subject: q.subject,
    topic: (q as { topic?: string }).topic ?? "",
    section: q.section,
    type: q.type,
    marks: q.marks,
    difficulty: (q as { difficulty?: string }).difficulty ?? "medium",
    stem: q.stem,
    ...(q.type === "MCQ" || q.type === "MSQ" ? { options: (q as { options: string[] }).options } : {}),
    answer: q.answer,
    ...(q.type === "NAT" ? { tolerance: (q as { tolerance: number }).tolerance } : {}),
    solution: q.solution,
  }));

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  return {
    id: spec.id,
    title: spec.title,
    tier: spec.tier,
    duration: 180,
    pattern: "GATE 2027 (65 Q · 100 marks · 3 hours)",
    totalMarks,
    sections: [
      { name: "General Aptitude",   count: 10, marks: 15 },
      { name: "Technical (1-mark)", count: 25, marks: 25 },
      { name: "Technical (2-mark)", count: 30, marks: 60 },
    ],
    negativeMarking: { mcq1: -1/3, mcq2: -2/3, nat: 0, msq: 0 },
    seed,
    locked: false, // flip to true in the JSON file to protect hand-edits
    questions,
  };
}

// ---------- Emit ----------
const mocksDir = resolve(process.cwd(), "apps/web/src/data/questions/mocks");

let wrote = 0, skipped = 0;
for (const spec of MOCK_SPECS) {
  if (ONLY.length && !ONLY.includes(spec.id)) continue;
  const file = resolve(mocksDir, `${spec.id}.json`);

  // Read existing file (if any) to honour the lock flag.
  let existingLocked = false;
  if (existsSync(file)) {
    try {
      const existing = JSON.parse(readFileSync(file, "utf8"));
      existingLocked = existing.locked === true;
    } catch { /* unreadable — treat as unlocked */ }
  }

  if (existingLocked && !FORCE) {
    console.log(`🔒 ${spec.id}  (locked — use --force to regen)`);
    skipped++;
    continue;
  }

  const mock = buildMock(spec);
  // Preserve the lock flag across --force regenerations so it isn't silently reset.
  if (existingLocked) mock.locked = true;
  writeFileSync(file, JSON.stringify(mock, null, 2) + "\n", "utf8");
  const lockTag = mock.locked ? " 🔒" : "";
  console.log(`✅ ${spec.id}  ${mock.questions.length} Qs · ${mock.totalMarks} marks · ${mock.duration} min · ${mock.tier}${lockTag}`);
  wrote++;
}

console.log(`\nDone. wrote=${wrote}  skipped=${skipped}  (total=${MOCK_SPECS.length})`);
