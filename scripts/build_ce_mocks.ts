/**
 * CrackGate — GATE Civil (CE) full mock generator.
 *
 * Reads the CE per-subject practice banks (ce-*.json) plus the shared
 * General Aptitude bank, and writes one JSON file per mock under
 * apps/web/src/data/questions/mocks/ as ce-mock-NN.json.
 *
 * Unlike the mining generator (which enforces GLOBAL zero-overlap across all
 * 20 mocks), the CE technical pool (~620 Q) is smaller than 20×55 = 1100, so
 * this generator dedupes PER MOCK only: every question is unique within a mock,
 * but a question may reappear in another mock. Difficulty bias + per-mock seed
 * keep the papers distinct.
 *
 * GATE CE pattern (per mock):
 *   Section A · General Aptitude  — 5 × 1m + 5 × 2m   (15 marks)
 *   Section B · Technical         — 25 × 1m + 30 × 2m (85 marks)
 *   Total: 65 Q · 100 marks · 180 minutes
 *   Negative: -1/3 (1m MCQ), -2/3 (2m MCQ), 0 (NAT, MSQ)
 *
 * Usage:
 *   npx tsx scripts/build_ce_mocks.ts                       # regen all unlocked
 *   npx tsx scripts/build_ce_mocks.ts --force               # regen ALL
 *   npx tsx scripts/build_ce_mocks.ts --only=ce-mock-02
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// ---------- CLI ----------
const args = new Map(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, "").split("=");
  return [k, v ?? "true"];
}));
const FORCE = args.get("force") === "true";
const ONLY = (args.get("only") ?? "").split(",").filter(Boolean);

// ---------- Types (mirror PracticeQuestion) ----------
type Diff = "easy" | "medium" | "hard";
interface PQ {
  id: string;
  subject: string;
  topic?: string;
  difficulty: Diff;
  type: "MCQ" | "MSQ" | "NAT";
  stem: string;
  options?: string[];
  answer: number | number[];
  tolerance?: number;
  figure?: unknown;
  solution: string;
}
interface Bank { slug: string; name: string; questions: PQ[]; }

// ---------- Deterministic RNG ----------
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
function pickUnique(pool: PQ[], n: number, used: Set<string>, rand: () => number): PQ[] {
  const out: PQ[] = [];
  for (const q of shuffle(pool, rand)) {
    if (out.length >= n) break;
    if (used.has(q.id)) continue;
    out.push(q);
    used.add(q.id);
  }
  return out;
}

// ---------- Load banks ----------
const practiceDir = resolve(process.cwd(), "apps/web/src/data/questions/practice");
function loadBank(slug: string): Bank {
  return JSON.parse(readFileSync(resolve(practiceDir, `${slug}.json`), "utf8")) as Bank;
}

const CE_SLUGS = [
  "ce-engineering-mathematics",
  "ce-engineering-mechanics",
  "ce-solid-mechanics",
  "ce-structural-analysis",
  "ce-construction-materials-management",
  "ce-concrete-structures",
  "ce-steel-structures",
  "ce-soil-mechanics",
  "ce-foundation-engineering",
  "ce-fluid-mechanics-hydraulics",
  "ce-hydrology-irrigation",
  "ce-environmental-engineering",
  "ce-transportation-engineering",
  "ce-geomatics-surveying",
];

const gaBank = loadBank("general-aptitude");
const technicalBanks = CE_SLUGS.map(loadBank);

// ---------- Mock specs ----------
type Tier = "free" | "subject" | "premium";
type DiffBias = "balanced" | "harder" | "hardest";
interface MockSpec { id: string; title: string; tier: Tier; focusSlugs: string[]; diffBias: DiffBias; }

const MOCK_SPECS: MockSpec[] = [
  { id: "ce-mock-01", title: "CE Mock 01 — Full Syllabus (Free)",                       tier: "free",    focusSlugs: [],                                                                            diffBias: "balanced" },
  { id: "ce-mock-02", title: "CE Mock 02 — Structural Engineering Heavy",               tier: "subject", focusSlugs: ["ce-solid-mechanics", "ce-structural-analysis"],                               diffBias: "balanced" },
  { id: "ce-mock-03", title: "CE Mock 03 — RCC & Steel Design",                         tier: "subject", focusSlugs: ["ce-concrete-structures", "ce-steel-structures"],                              diffBias: "balanced" },
  { id: "ce-mock-04", title: "CE Mock 04 — Geotechnical Engineering",                   tier: "subject", focusSlugs: ["ce-soil-mechanics", "ce-foundation-engineering"],                            diffBias: "balanced" },
  { id: "ce-mock-05", title: "CE Mock 05 — Water Resources & Hydraulics",               tier: "subject", focusSlugs: ["ce-fluid-mechanics-hydraulics", "ce-hydrology-irrigation"],                  diffBias: "balanced" },
  { id: "ce-mock-06", title: "CE Mock 06 — Environmental Engineering",                  tier: "subject", focusSlugs: ["ce-environmental-engineering"],                                              diffBias: "balanced" },
  { id: "ce-mock-07", title: "CE Mock 07 — Transportation & Geomatics",                 tier: "subject", focusSlugs: ["ce-transportation-engineering", "ce-geomatics-surveying"],                 diffBias: "balanced" },
  { id: "ce-mock-08", title: "CE Mock 08 — Engineering Mechanics & Mathematics",        tier: "subject", focusSlugs: ["ce-engineering-mechanics", "ce-engineering-mathematics"],                  diffBias: "balanced" },
  { id: "ce-mock-09", title: "CE Mock 09 — Full Syllabus High Difficulty",              tier: "subject", focusSlugs: [],                                                                            diffBias: "harder"   },
  { id: "ce-mock-10", title: "CE Mock 10 — Grand Test (Premium)",                       tier: "premium", focusSlugs: [],                                                                            diffBias: "hardest"  },
  { id: "ce-mock-11", title: "CE Mock 11 — Full Syllabus (Premium)",                    tier: "premium", focusSlugs: [],                                                                            diffBias: "balanced" },
  { id: "ce-mock-12", title: "CE Mock 12 — Structural Analysis & Mechanics (Hard)",     tier: "subject", focusSlugs: ["ce-structural-analysis", "ce-solid-mechanics"],                               diffBias: "harder"   },
  { id: "ce-mock-13", title: "CE Mock 13 — Concrete & Construction Management",         tier: "subject", focusSlugs: ["ce-concrete-structures", "ce-construction-materials-management"],         diffBias: "balanced" },
  { id: "ce-mock-14", title: "CE Mock 14 — Soil Mechanics & Foundations (Hard)",        tier: "subject", focusSlugs: ["ce-soil-mechanics", "ce-foundation-engineering"],                            diffBias: "harder"   },
  { id: "ce-mock-15", title: "CE Mock 15 — Fluid Mechanics & Irrigation",               tier: "subject", focusSlugs: ["ce-fluid-mechanics-hydraulics", "ce-hydrology-irrigation"],                  diffBias: "balanced" },
  { id: "ce-mock-16", title: "CE Mock 16 — Environmental & Transportation",             tier: "subject", focusSlugs: ["ce-environmental-engineering", "ce-transportation-engineering"],            diffBias: "balanced" },
  { id: "ce-mock-17", title: "CE Mock 17 — Steel Structures & Geomatics",               tier: "subject", focusSlugs: ["ce-steel-structures", "ce-geomatics-surveying"],                            diffBias: "harder"   },
  { id: "ce-mock-18", title: "CE Mock 18 — Construction Materials & Management",        tier: "subject", focusSlugs: ["ce-construction-materials-management"],                                     diffBias: "balanced" },
  { id: "ce-mock-19", title: "CE Mock 19 — Full Syllabus High Difficulty",             tier: "subject", focusSlugs: [],                                                                            diffBias: "harder"   },
  { id: "ce-mock-20", title: "CE Mock 20 — Grand Test Finale (Premium)",               tier: "premium", focusSlugs: [],                                                                            diffBias: "hardest"  },
];

function diffWeightedPool(qs: PQ[], bias: DiffBias): PQ[] {
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
  // Per-mock dedupe set (NOT global) — questions may recur across mocks.
  const used = new Set<string>();

  const ga1 = gaBank.questions.filter((q) => q.difficulty === "easy");
  const ga2 = gaBank.questions.filter((q) => q.difficulty !== "easy");
  function pickGA(primary: PQ[], n: number): PQ[] {
    const out = pickUnique(primary, n, used, rand);
    if (out.length < n) out.push(...pickUnique(gaBank.questions, n - out.length, used, rand));
    return out;
  }
  const ga1Pick = pickGA(ga1, 5).map((q) => ({ ...q, marks: 1 as const, section: "General Aptitude" as const }));
  const ga2Pick = pickGA(ga2, 5).map((q) => ({ ...q, marks: 2 as const, section: "General Aptitude" as const }));

  const focus = new Set(spec.focusSlugs);
  const focusPool = technicalBanks.filter((s) => focus.has(s.slug)).flatMap((s) => s.questions);
  const restPool = technicalBanks.filter((s) => !focus.has(s.slug)).flatMap((s) => s.questions);

  function technicalPool(targetDiff: "one" | "two"): PQ[] {
    const filterByDiff = (q: PQ) =>
      targetDiff === "one"
        ? q.difficulty === "easy" || q.difficulty === "medium"
        : q.difficulty === "medium" || q.difficulty === "hard";
    const focusFiltered = diffWeightedPool(focusPool.filter(filterByDiff), spec.diffBias);
    const restFiltered = diffWeightedPool(restPool.filter(filterByDiff), spec.diffBias);
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
    topic: q.topic ?? "",
    section: q.section,
    type: q.type,
    marks: q.marks,
    difficulty: q.difficulty ?? "medium",
    stem: q.stem,
    ...(q.type === "MCQ" || q.type === "MSQ" ? { options: q.options } : {}),
    answer: q.answer,
    ...(q.type === "NAT" ? { tolerance: q.tolerance } : {}),
    ...(q.figure ? { figure: q.figure } : {}),
    solution: q.solution,
  }));

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  return {
    id: spec.id,
    title: spec.title,
    tier: spec.tier,
    duration: 180,
    pattern: "GATE 2027 CE (65 Q · 100 marks · 3 hours)",
    totalMarks,
    sections: [
      { name: "General Aptitude", count: 10, marks: 15 },
      { name: "Technical (1-mark)", count: 25, marks: 25 },
      { name: "Technical (2-mark)", count: 30, marks: 60 },
    ],
    negativeMarking: { mcq1: -1 / 3, mcq2: -2 / 3, nat: 0, msq: 0 },
    seed,
    locked: false,
    questions,
  };
}

// ---------- Emit ----------
const mocksDir = resolve(process.cwd(), "apps/web/src/data/questions/mocks");
let wrote = 0, skipped = 0;
for (const spec of MOCK_SPECS) {
  if (ONLY.length && !ONLY.includes(spec.id)) continue;
  const file = resolve(mocksDir, `${spec.id}.json`);

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
  if (existingLocked) mock.locked = true;
  writeFileSync(file, JSON.stringify(mock, null, 2) + "\n", "utf8");
  const short = mock.questions.length;
  console.log(`✅ ${spec.id}  ${short} Qs · ${mock.totalMarks} marks · ${mock.tier}`);
  wrote++;
}
console.log(`\nDone. wrote=${wrote}  skipped=${skipped}  (total=${MOCK_SPECS.length})`);
