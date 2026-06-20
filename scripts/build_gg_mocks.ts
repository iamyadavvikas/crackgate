/**
 * CrackGate — GATE Geology & Geophysics (GG) full mock generator.
 *
 * Reads the GG per-subject practice banks (gg-*.json) plus the shared
 * General Aptitude bank, and writes one JSON file per mock under
 * apps/web/src/data/questions/mocks/ as gg-mock-NN.json.
 *
 * Dedupe is PER MOCK (questions may recur across mocks). A per-mock seed plus a
 * difficulty bias keeps the papers distinct. Every mock is guaranteed to carry
 * at least FIGURE_QUOTA load-bearing figures (stereonet / mohr / stress-block)
 * so it clears scripts/validate_mock.mjs (≥17 of 65).
 *
 * GATE GG pattern (per mock):
 *   Section A · General Aptitude  — 5 × 1m + 5 × 2m   (15 marks)
 *   Section B · Technical         — 25 × 1m + 30 × 2m (85 marks)
 *   Total: 65 Q · 100 marks · 180 minutes
 *   Negative: -1/3 (1m MCQ), -2/3 (2m MCQ), 0 (NAT, MSQ)
 *
 * Usage:
 *   npx tsx scripts/build_gg_mocks.ts            # regen all unlocked
 *   npx tsx scripts/build_gg_mocks.ts --force    # regen ALL
 *   npx tsx scripts/build_gg_mocks.ts --only=gg-mock-02
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

const FIGURE_QUOTA = 19; // > 17 (25% of 65) demanded by validate_mock.mjs

// ---------- Types ----------
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

const GG_SLUGS = [
  "gg-geology-mathematics",
  "gg-earth-system-geomorphology",
  "gg-structural-geology",
  "gg-mineralogy-crystallography",
  "gg-igneous-petrology",
  "gg-sedimentary-petrology",
  "gg-metamorphic-petrology",
  "gg-stratigraphy-indian-geology",
  "gg-paleontology",
  "gg-economic-ore-geology",
  "gg-geochemistry-isotope",
  "gg-engineering-environmental-geology",
  "gg-geophysics",
  "gg-applied-remote-sensing-gis",
];

const gaBank = loadBank("general-aptitude");
const technicalBanks = GG_SLUGS.map(loadBank);
const allTechnical = technicalBanks.flatMap((b) => b.questions);

// ---------- Mock specs ----------
type Tier = "free" | "subject" | "premium";
type DiffBias = "balanced" | "harder" | "hardest";
interface MockSpec { id: string; title: string; tier: Tier; focusSlugs: string[]; diffBias: DiffBias; }

const MOCK_SPECS: MockSpec[] = [
  { id: "gg-mock-01", title: "GG Mock 01 — Full Syllabus (Free)",                    tier: "free",    focusSlugs: [],                                                          diffBias: "balanced" },
  { id: "gg-mock-02", title: "GG Mock 02 — Structural Geology Heavy",                 tier: "subject", focusSlugs: ["gg-structural-geology"],                                    diffBias: "harder"   },
  { id: "gg-mock-03", title: "GG Mock 03 — Mineralogy & Crystallography",             tier: "subject", focusSlugs: ["gg-mineralogy-crystallography"],                            diffBias: "harder"   },
  { id: "gg-mock-04", title: "GG Mock 04 — Igneous & Metamorphic Petrology",          tier: "subject", focusSlugs: ["gg-igneous-petrology", "gg-metamorphic-petrology"],         diffBias: "harder"   },
  { id: "gg-mock-05", title: "GG Mock 05 — Sedimentology & Stratigraphy",             tier: "subject", focusSlugs: ["gg-sedimentary-petrology", "gg-stratigraphy-indian-geology"], diffBias: "harder" },
  { id: "gg-mock-06", title: "GG Mock 06 — Palaeontology & Earth System",             tier: "subject", focusSlugs: ["gg-paleontology", "gg-earth-system-geomorphology"],         diffBias: "harder"   },
  { id: "gg-mock-07", title: "GG Mock 07 — Economic & Ore Geology",                   tier: "subject", focusSlugs: ["gg-economic-ore-geology"],                                  diffBias: "harder"   },
  { id: "gg-mock-08", title: "GG Mock 08 — Geophysics Heavy",                         tier: "subject", focusSlugs: ["gg-geophysics"],                                           diffBias: "harder"   },
  { id: "gg-mock-09", title: "GG Mock 09 — Geochemistry & Isotopes",                  tier: "subject", focusSlugs: ["gg-geochemistry-isotope"],                                  diffBias: "harder"   },
  { id: "gg-mock-10", title: "GG Mock 10 — Grand Test (Premium)",                     tier: "premium", focusSlugs: [],                                                          diffBias: "hardest"  },
  { id: "gg-mock-11", title: "GG Mock 11 — Full Syllabus (Premium)",                  tier: "premium", focusSlugs: [],                                                          diffBias: "harder"   },
  { id: "gg-mock-12", title: "GG Mock 12 — Structural & Geophysics (Hard)",           tier: "subject", focusSlugs: ["gg-structural-geology", "gg-geophysics"],                   diffBias: "harder"   },
  { id: "gg-mock-13", title: "GG Mock 13 — Petrology Combined",                       tier: "subject", focusSlugs: ["gg-igneous-petrology", "gg-sedimentary-petrology", "gg-metamorphic-petrology"], diffBias: "harder" },
  { id: "gg-mock-14", title: "GG Mock 14 — Engineering & Environmental Geology",      tier: "subject", focusSlugs: ["gg-engineering-environmental-geology"],                     diffBias: "harder"   },
  { id: "gg-mock-15", title: "GG Mock 15 — Remote Sensing, GIS & Applied",            tier: "subject", focusSlugs: ["gg-applied-remote-sensing-gis"],                            diffBias: "harder"   },
  { id: "gg-mock-16", title: "GG Mock 16 — Stratigraphy & Indian Geology",           tier: "subject", focusSlugs: ["gg-stratigraphy-indian-geology"],                           diffBias: "harder"   },
  { id: "gg-mock-17", title: "GG Mock 17 — Mathematics & Geostatistics",              tier: "subject", focusSlugs: ["gg-geology-mathematics"],                                   diffBias: "harder"   },
  { id: "gg-mock-18", title: "GG Mock 18 — Mineralogy & Geochemistry (Hard)",         tier: "subject", focusSlugs: ["gg-mineralogy-crystallography", "gg-geochemistry-isotope"], diffBias: "harder"   },
  { id: "gg-mock-19", title: "GG Mock 19 — Full Syllabus High Difficulty",           tier: "subject", focusSlugs: [],                                                          diffBias: "harder"   },
  { id: "gg-mock-20", title: "GG Mock 20 — Grand Test Finale (Premium)",             tier: "premium", focusSlugs: [],                                                          diffBias: "hardest"  },
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

const hasFig = (q: PQ) => Boolean(q.figure);

function buildMock(spec: MockSpec) {
  const seed = hashSeed(spec.id);
  const rand = rng(seed);
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

  // ----- Figure-quota guarantee -----
  // Swap non-figure 2-mark technical questions for unused figure-bearing ones
  // (mostly hard, 2-mark) until the mock holds at least FIGURE_QUOTA figures.
  let figCount = [...oneMark, ...twoMark].filter(hasFig).length;
  if (figCount < FIGURE_QUOTA) {
    const figurePool = shuffle(allTechnical.filter((q) => hasFig(q) && !used.has(q.id)), rand);
    for (let i = 0; i < twoMark.length && figCount < FIGURE_QUOTA; i++) {
      if (hasFig(twoMark[i])) continue;
      const repl = figurePool.pop();
      if (!repl) break;
      used.delete(twoMark[i].id);
      used.add(repl.id);
      twoMark[i] = { ...repl, marks: 2 as const, section: "Technical (2-mark)" as const };
      figCount++;
    }
  }

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
    pattern: "GATE 2027 GG (65 Q · 100 marks · 3 hours)",
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
  const figs = mock.questions.filter((q) => "figure" in q && (q as { figure?: unknown }).figure).length;
  writeFileSync(file, JSON.stringify(mock, null, 2) + "\n", "utf8");
  console.log(`✅ ${spec.id}  ${mock.questions.length} Qs · ${mock.totalMarks} marks · ${figs} figs · ${mock.tier}`);
  wrote++;
}
console.log(`\nDone. wrote=${wrote}  skipped=${skipped}  (total=${MOCK_SPECS.length})`);
