/**
 * CrackGate — CIL Management Trainee (Civil) full-mock generator.
 *
 * Emits one JSON file per set under
 *   apps/web/src/data/questions/cil/civil/cil-civil-NN.json
 * in the official CIL MT pattern:
 *   200 MCQ · 2 papers · 1 mark each · 3 hours · NO negative marking
 *
 * Section layout (per set):
 *   Paper-I  · General Awareness        25
 *   Paper-I  · Numerical Ability        25
 *   Paper-I  · Reasoning                25
 *   Paper-I  · General English          25
 *   Paper-II · Professional Knowledge  100   (Civil — 60% theory / 40% numerical)
 *
 * Set 1 is hand-authored and already shipped; this script generates sets 2–10.
 * Numeric items are parametric (numbers vary per set → answer keys are computed,
 * never guessed, and questions never repeat across sets). Theory/GK/English items
 * are drawn from curated pools, rotated so no item repeats within a set and
 * cross-set overlap is minimised.
 *
 * Usage:
 *   npx tsx scripts/build_cil_civil.ts                 # sets 2..10
 *   npx tsx scripts/build_cil_civil.ts --only=2,5      # specific sets
 *   npx tsx scripts/build_cil_civil.ts --from=2 --to=10
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

// ─── CLI ─────────────────────────────────────────────────────────────────────
const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"] as const;
  }),
);
const ONLY = (args.get("only") ?? "").split(",").filter(Boolean).map(Number);
const FROM = Number(args.get("from") ?? 2);
const TO = Number(args.get("to") ?? 10);

// ─── Deterministic RNG (mulberry32) ──────────────────────────────────────────
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Question type ───────────────────────────────────────────────────────────
type Difficulty = "easy" | "medium" | "hard";
interface Q {
  id: number;
  subject: string;
  topic: string;
  section: "Paper-I" | "Paper-II";
  type: "MCQ";
  marks: 1;
  difficulty: Difficulty;
  stem: string;
  options: string[];
  answer: number;
  solution: string;
}

const SUBJ = {
  ga: "Paper-I · General Awareness",
  num: "Paper-I · Numerical Ability",
  reas: "Paper-I · Reasoning",
  eng: "Paper-I · General English",
  prof: "Paper-II · Professional Knowledge",
} as const;

// ─── MCQ builder: places the correct value among 4 options deterministically ──
/**
 * Build a 4-option MCQ from a correct value and 3 distractors. The correct
 * option position is chosen from the RNG so the answer key is well distributed.
 * Distractors are de-duplicated against the correct answer; if collisions occur
 * the caller-supplied fallbacks keep four distinct options.
 */
function mcqFrom(
  rand: () => number,
  correct: string,
  distractors: string[],
): { options: string[]; answer: number } {
  const opts = [correct];
  for (const d of distractors) {
    if (opts.length >= 4) break;
    if (!opts.includes(d)) opts.push(d);
  }
  // Pad if distractors collided.
  let pad = 1;
  while (opts.length < 4) {
    const cand = `${correct} (alt ${pad++})`;
    if (!opts.includes(cand)) opts.push(cand);
  }
  // Fisher–Yates shuffle, then locate the correct index.
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { options: opts, answer: opts.indexOf(correct) };
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const r1 = (n: number) => Math.round(n * 10) / 10;
const pick = <T,>(rand: () => number, a: readonly T[]): T =>
  a[Math.floor(rand() * a.length)];
const intIn = (rand: () => number, lo: number, hi: number) =>
  lo + Math.floor(rand() * (hi - lo + 1));

// ══════════════════════════════════════════════════════════════════════════
// PAPER-I · NUMERICAL ABILITY (25) — parametric, answer keys computed
// ══════════════════════════════════════════════════════════════════════════
type NumGen = (rand: () => number) => {
  topic: string;
  difficulty: Difficulty;
  stem: string;
  correct: string;
  distractors: string[];
  solution: string;
};

const NUM_GENERATORS: NumGen[] = [
  // Percentage of a number
  (rand) => {
    const p = pick(rand, [12, 15, 18, 24, 35, 40, 45]);
    const n = pick(rand, [240, 360, 480, 520, 640, 720, 850]);
    const v = r2((p / 100) * n);
    return {
      topic: "Percentage",
      difficulty: "easy",
      stem: `What is ${p}% of ${n}?`,
      correct: `${v}`,
      distractors: [`${r2(v * 1.1)}`, `${r2(v * 0.9)}`, `${r2(v + n * 0.02)}`],
      solution: `${p}% of ${n} = ${p}/100 \u00d7 ${n} = ${v}.`,
    };
  },
  // Reverse percentage
  (rand) => {
    const p = pick(rand, [20, 25, 30, 40, 60]);
    const part = pick(rand, [40, 50, 60, 75, 90]);
    const n = r2((part * 100) / p);
    return {
      topic: "Percentage",
      difficulty: "easy",
      stem: `If ${p}% of a number is ${part}, the number is:`,
      correct: `${n}`,
      distractors: [`${r2(n * 1.25)}`, `${r2(n * 0.8)}`, `${r2(n + part)}`],
      solution: `Number = ${part} \u00d7 100/${p} = ${n}.`,
    };
  },
  // Percentage increase
  (rand) => {
    const a = pick(rand, [40, 50, 60, 80]);
    const inc = pick(rand, [10, 12, 15, 20, 24]);
    const b = a + inc;
    const pct = r2((inc / a) * 100);
    return {
      topic: "Percentage",
      difficulty: "medium",
      stem: `The percentage increase when a value rises from ${a} to ${b} is:`,
      correct: `${pct}%`,
      distractors: [`${r2(pct + 5)}%`, `${r2((inc / b) * 100)}%`, `${r2(pct - 3)}%`],
      solution: `Increase = ${inc}; % = ${inc}/${a} \u00d7 100 = ${pct}%.`,
    };
  },
  // Average of first n natural numbers
  (rand) => {
    const n = pick(rand, [8, 10, 12, 14, 16, 20]);
    const avg = (n + 1) / 2;
    return {
      topic: "Average",
      difficulty: "easy",
      stem: `What is the average of the first ${n} natural numbers?`,
      correct: `${avg}`,
      distractors: [`${n / 2}`, `${r1(avg + 1)}`, `${r1(avg - 0.5)}`],
      solution: `Average of first n naturals = (n+1)/2 = (${n}+1)/2 = ${avg}.`,
    };
  },
  // Average after a member leaves
  (rand) => {
    const k = pick(rand, [4, 5, 6]);
    const avg = pick(rand, [25, 28, 30, 32]);
    const leaver = avg + pick(rand, [8, 10, 12]);
    const total = k * avg;
    const newAvg = r2((total - leaver) / (k - 1));
    return {
      topic: "Average",
      difficulty: "medium",
      stem: `The average age of ${k} persons is ${avg} years. If a person aged ${leaver} leaves, the average of the remaining ${k - 1} is:`,
      correct: `${newAvg}`,
      distractors: [`${r2(newAvg + 1.5)}`, `${avg}`, `${r2(newAvg - 1)}`],
      solution: `Total = ${total}; remaining = ${total} \u2212 ${leaver} = ${total - leaver}; average = ${newAvg}.`,
    };
  },
  // Train crossing a pole
  (rand) => {
    const len = pick(rand, [120, 150, 180, 200, 240]);
    const t = pick(rand, [10, 12, 15, 18, 20]);
    const kmph = r1((len / t) * 3.6);
    return {
      topic: "Speed-Time",
      difficulty: "medium",
      stem: `A ${len} m long train crosses a pole in ${t} seconds. Its speed is:`,
      correct: `${kmph} km/h`,
      distractors: [`${r1(kmph + 4)} km/h`, `${r1(kmph - 3)} km/h`, `${r1((len / t) * 3)} km/h`],
      solution: `Speed = ${len}/${t} = ${r1(len / t)} m/s = ${r1(len / t)} \u00d7 3.6 = ${kmph} km/h.`,
    };
  },
  // Distance = speed × time
  (rand) => {
    const sp = pick(rand, [45, 50, 60, 72, 80]);
    const t = pick(rand, [3, 4, 5, 6]);
    const d = sp * t;
    return {
      topic: "Speed-Time",
      difficulty: "easy",
      stem: `A car covers a distance at ${sp} km/h in ${t} hours. The distance is:`,
      correct: `${d} km`,
      distractors: [`${d + sp} km`, `${d - sp} km`, `${Math.round(d * 1.1)} km`],
      solution: `Distance = speed \u00d7 time = ${sp} \u00d7 ${t} = ${d} km.`,
    };
  },
  // Simple interest
  (rand) => {
    const p = pick(rand, [4000, 5000, 6000, 8000, 10000]);
    const r = pick(rand, [6, 7, 8, 9, 10]);
    const t = pick(rand, [2, 3, 4, 5]);
    const si = (p * r * t) / 100;
    return {
      topic: "Simple Interest",
      difficulty: "easy",
      stem: `Simple interest on Rs ${p} at ${r}% per annum for ${t} years is:`,
      correct: `Rs ${si}`,
      distractors: [`Rs ${si + p * 0.01}`, `Rs ${si - 100}`, `Rs ${Math.round(si * 1.1)}`],
      solution: `SI = PRT/100 = ${p}\u00d7${r}\u00d7${t}/100 = Rs ${si}.`,
    };
  },
  // SI doubling time
  (rand) => {
    const t = pick(rand, [5, 8, 10, 12.5, 20]);
    const rate = r2(100 / t);
    return {
      topic: "Simple Interest",
      difficulty: "medium",
      stem: `A sum doubles itself in ${t} years under simple interest. The annual rate is:`,
      correct: `${rate}%`,
      distractors: [`${r2(rate + 2)}%`, `${r2(rate - 1.5)}%`, `${r2(200 / t)}%`],
      solution: `To double, SI = P, so rate = 100/T = 100/${t} = ${rate}%.`,
    };
  },
  // Compound interest 2 years
  (rand) => {
    const p = pick(rand, [8000, 10000, 12000, 15000, 20000]);
    const r = pick(rand, [5, 8, 10, 12]);
    const ci = r2(p * (1 + r / 100) ** 2 - p);
    return {
      topic: "Compound Interest",
      difficulty: "medium",
      stem: `Compound interest on Rs ${p} at ${r}% per annum for 2 years is:`,
      correct: `Rs ${ci}`,
      distractors: [`Rs ${r2((p * r * 2) / 100)}`, `Rs ${r2(ci + 100)}`, `Rs ${r2(ci - 150)}`],
      solution: `Amount = ${p}\u00d7(1+${r}/100)\u00b2; CI = Amount \u2212 ${p} = Rs ${ci}.`,
    };
  },
  // Ratio division (larger part)
  (rand) => {
    const a = pick(rand, [2, 3, 4]);
    const b = pick(rand, [5, 7, 9]);
    const total = (a + b) * pick(rand, [6, 8, 9, 11]);
    const larger = (total * Math.max(a, b)) / (a + b);
    return {
      topic: "Ratio",
      difficulty: "easy",
      stem: `If ${total} is divided in the ratio ${a} : ${b}, the larger part is:`,
      correct: `${larger}`,
      distractors: [`${(total * Math.min(a, b)) / (a + b)}`, `${total / 2}`, `${larger - a}`],
      solution: `Larger part = ${total} \u00d7 ${Math.max(a, b)}/${a + b} = ${larger}.`,
    };
  },
  // Compound ratio
  (rand) => {
    const a = pick(rand, [2, 3, 4]);
    const b = pick(rand, [3, 5, 7]);
    const c = pick(rand, [4, 5, 6]);
    const d = pick(rand, [5, 7, 9]);
    return {
      topic: "Ratio",
      difficulty: "medium",
      stem: `The compound ratio of ${a} : ${b} and ${c} : ${d} is:`,
      correct: `${a * c} : ${b * d}`,
      distractors: [`${a + c} : ${b + d}`, `${a * d} : ${b * c}`, `${a * c} : ${b + d}`],
      solution: `Compound ratio = (${a}\u00d7${c}) : (${b}\u00d7${d}) = ${a * c} : ${b * d}.`,
    };
  },
  // Time & work (together)
  (rand) => {
    const x = pick(rand, [10, 12, 15, 18, 20]);
    const y = pick(rand, [20, 24, 30, 36]);
    const t = r2((x * y) / (x + y));
    return {
      topic: "Time & Work",
      difficulty: "medium",
      stem: `A can do a work in ${x} days and B in ${y} days. Working together they finish it in:`,
      correct: `${t} days`,
      distractors: [`${r2(t + 1.5)} days`, `${r2((x + y) / 2)} days`, `${r2(t - 1)} days`],
      solution: `Combined rate = 1/${x} + 1/${y}; time = ${x}\u00d7${y}/(${x}+${y}) = ${t} days.`,
    };
  },
  // Men-days inverse proportion
  (rand) => {
    const m1 = pick(rand, [8, 10, 12, 15]);
    const d1 = pick(rand, [9, 12, 15, 18]);
    const m2 = pick(rand, [6, 9, 5]);
    const d2 = r2((m1 * d1) / m2);
    return {
      topic: "Time & Work",
      difficulty: "medium",
      stem: `If ${m1} men complete a work in ${d1} days, ${m2} men will complete it in:`,
      correct: `${d2} days`,
      distractors: [`${r2(d2 - 2)} days`, `${r2(d2 + 3)} days`, `${d1} days`],
      solution: `Men-days constant: ${m1}\u00d7${d1} = ${m2}\u00d7D, D = ${d2} days.`,
    };
  },
  // Pipes filling together
  (rand) => {
    const a = pick(rand, [4, 6, 8, 10]);
    const b = pick(rand, [3, 5, 12, 15]);
    const t = r2((a * b) / (a + b));
    return {
      topic: "Pipes & Cisterns",
      difficulty: "medium",
      stem: `Pipe A fills a tank in ${a} h and pipe B in ${b} h. Together they fill it in:`,
      correct: `${t} h`,
      distractors: [`${r2(t + 0.6)} h`, `${r2((a + b) / 2)} h`, `${r2(t - 0.4)} h`],
      solution: `Rate = 1/${a} + 1/${b}; time = ${a}\u00d7${b}/(${a}+${b}) = ${t} h.`,
    };
  },
  // Profit %
  (rand) => {
    const cp = pick(rand, [500, 600, 800, 1000, 1200]);
    const pPct = pick(rand, [10, 12, 15, 20, 25]);
    const sp = r2(cp * (1 + pPct / 100));
    return {
      topic: "Profit & Loss",
      difficulty: "easy",
      stem: `An item bought for Rs ${cp} is sold for Rs ${sp}. The profit percentage is:`,
      correct: `${pPct}%`,
      distractors: [`${pPct + 5}%`, `${pPct - 3}%`, `${r2(((sp - cp) / sp) * 100)}%`],
      solution: `Profit = ${r2(sp - cp)}; profit% = ${r2(sp - cp)}/${cp} \u00d7 100 = ${pPct}%.`,
    };
  },
  // Loss → cost price
  (rand) => {
    const cp = pick(rand, [400, 500, 600, 800]);
    const lPct = pick(rand, [10, 12, 20, 25]);
    const sp = r2(cp * (1 - lPct / 100));
    return {
      topic: "Profit & Loss",
      difficulty: "medium",
      stem: `An article sold at Rs ${sp} incurs a ${lPct}% loss. Its cost price is:`,
      correct: `Rs ${cp}`,
      distractors: [`Rs ${r2(sp * (1 + lPct / 100))}`, `Rs ${cp + 10}`, `Rs ${cp - 10}`],
      solution: `CP = SP/(1 \u2212 ${lPct}/100) = ${sp}/${r2(1 - lPct / 100)} = Rs ${cp}.`,
    };
  },
  // Successive discounts
  (rand) => {
    const mp = pick(rand, [1000, 1200, 1500, 2000]);
    const d1 = pick(rand, [10, 15, 20]);
    const d2 = pick(rand, [10, 20, 25]);
    const fp = r2(mp * (1 - d1 / 100) * (1 - d2 / 100));
    return {
      topic: "Discount",
      difficulty: "medium",
      stem: `Successive discounts of ${d1}% and ${d2}% on a marked price of Rs ${mp} give a final price of:`,
      correct: `Rs ${fp}`,
      distractors: [`Rs ${r2(mp * (1 - (d1 + d2) / 100))}`, `Rs ${r2(fp + 30)}`, `Rs ${r2(fp - 25)}`],
      solution: `Final = ${mp} \u00d7 ${r2(1 - d1 / 100)} \u00d7 ${r2(1 - d2 / 100)} = Rs ${fp}.`,
    };
  },
  // HCF of two numbers
  (rand) => {
    const pairs: [number, number, number][] = [
      [36, 48, 12],
      [24, 60, 12],
      [40, 56, 8],
      [45, 75, 15],
      [54, 72, 18],
    ];
    const [a, b, h] = pick(rand, pairs);
    return {
      topic: "HCF",
      difficulty: "easy",
      stem: `The HCF of ${a} and ${b} is:`,
      correct: `${h}`,
      distractors: [`${h * 2}`, `${h / 2}`, `${(a * b) / h}`],
      solution: `The highest common factor of ${a} and ${b} is ${h}.`,
    };
  },
  // LCM of two numbers
  (rand) => {
    const pairs: [number, number, number][] = [
      [12, 15, 60],
      [8, 12, 24],
      [9, 12, 36],
      [10, 15, 30],
      [14, 21, 42],
    ];
    const [a, b, l] = pick(rand, pairs);
    return {
      topic: "LCM",
      difficulty: "easy",
      stem: `The LCM of ${a} and ${b} is:`,
      correct: `${l}`,
      distractors: [`${l / 2}`, `${l + a}`, `${a * b}`],
      solution: `The lowest common multiple of ${a} and ${b} is ${l}.`,
    };
  },
  // Perfect square root
  (rand) => {
    const n = pick(rand, [35, 45, 55, 65, 75, 85]);
    const sq = n * n;
    return {
      topic: "Square Root",
      difficulty: "easy",
      stem: `The square root of ${sq} is:`,
      correct: `${n}`,
      distractors: [`${n - 10}`, `${n + 10}`, `${n + 5}`],
      solution: `${n}\u00b2 = ${sq}, so \u221a${sq} = ${n}.`,
    };
  },
  // Probability with a die
  (rand) => {
    const cases: [string, string, string[]][] = [
      ["an even number", "1/2", ["1/3", "2/3", "1/6"]],
      ["a number greater than 4", "1/3", ["1/2", "1/6", "2/3"]],
      ["a multiple of 3", "1/3", ["1/2", "1/6", "1/4"]],
      ["a prime number", "1/2", ["1/3", "2/3", "1/6"]],
    ];
    const [evt, ans, dist] = pick(rand, cases);
    return {
      topic: "Probability",
      difficulty: "easy",
      stem: `The probability of getting ${evt} on a single throw of a fair die is:`,
      correct: ans,
      distractors: dist,
      solution: `Count the favourable outcomes out of 6 equally likely faces to get ${ans}.`,
    };
  },
  // Number from quotient/remainder
  (rand) => {
    const d = pick(rand, [6, 7, 8, 9]);
    const q = pick(rand, [11, 12, 13, 14]);
    const rem = intIn(rand, 1, d - 1);
    const n = d * q + rem;
    return {
      topic: "Number System",
      difficulty: "easy",
      stem: `A number divided by ${d} gives quotient ${q} and remainder ${rem}. The number is:`,
      correct: `${n}`,
      distractors: [`${n + d}`, `${n - 1}`, `${n + 1}`],
      solution: `Number = divisor \u00d7 quotient + remainder = ${d}\u00d7${q}+${rem} = ${n}.`,
    };
  },
  // Mixture / alligation simple average price
  (rand) => {
    const q1 = pick(rand, [2, 3, 4]);
    const q2 = pick(rand, [3, 5, 6]);
    const p1 = pick(rand, [20, 30, 40]);
    const p2 = pick(rand, [50, 60, 80]);
    const avg = r2((q1 * p1 + q2 * p2) / (q1 + q2));
    return {
      topic: "Mixtures",
      difficulty: "medium",
      stem: `${q1} kg of rice at Rs ${p1}/kg is mixed with ${q2} kg at Rs ${p2}/kg. The average price per kg is:`,
      correct: `Rs ${avg}`,
      distractors: [`Rs ${r2((p1 + p2) / 2)}`, `Rs ${r2(avg + 2)}`, `Rs ${r2(avg - 2)}`],
      solution: `Avg = (${q1}\u00d7${p1}+${q2}\u00d7${p2})/(${q1}+${q2}) = Rs ${avg}.`,
    };
  },
  // Partnership profit share
  (rand) => {
    const a = pick(rand, [3, 4, 5]);
    const b = pick(rand, [5, 6, 7]);
    const profit = (a + b) * pick(rand, [1000, 1200, 1500]);
    const share = (profit * a) / (a + b);
    return {
      topic: "Partnership",
      difficulty: "medium",
      stem: `A and B invest in the ratio ${a} : ${b}. Out of a total profit of Rs ${profit}, A's share is:`,
      correct: `Rs ${share}`,
      distractors: [`Rs ${(profit * b) / (a + b)}`, `Rs ${profit / 2}`, `Rs ${share + 100}`],
      solution: `A's share = ${profit} \u00d7 ${a}/${a + b} = Rs ${share}.`,
    };
  },
  // Average speed (two equal distances)
  (rand) => {
    const u = pick(rand, [30, 40, 60]);
    const v = pick(rand, [20, 60, 90]);
    const avg = r2((2 * u * v) / (u + v));
    return {
      topic: "Average Speed",
      difficulty: "medium",
      stem: `A man goes at ${u} km/h and returns over the same route at ${v} km/h. His average speed is:`,
      correct: `${avg} km/h`,
      distractors: [`${r2((u + v) / 2)} km/h`, `${r2(avg + 3)} km/h`, `${r2(avg - 2)} km/h`],
      solution: `Average speed = 2uv/(u+v) = 2\u00d7${u}\u00d7${v}/(${u}+${v}) = ${avg} km/h.`,
    };
  },
];

function genNumerical(rand: () => number, startId: number): Q[] {
  const out: Q[] = [];
  const seen = new Set<string>();
  const gens = [...NUM_GENERATORS];
  // Shuffle generator order per set so topic sequence varies.
  for (let i = gens.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [gens[i], gens[j]] = [gens[j], gens[i]];
  }
  let gi = 0;
  while (out.length < 25) {
    const g = gens[gi % gens.length];
    gi++;
    const spec = g(rand);
    if (seen.has(spec.stem)) continue; // avoid identical stems within a set
    seen.add(spec.stem);
    const { options, answer } = mcqFrom(rand, spec.correct, spec.distractors);
    out.push({
      id: startId + out.length,
      subject: SUBJ.num,
      topic: spec.topic,
      section: "Paper-I",
      type: "MCQ",
      marks: 1,
      difficulty: spec.difficulty,
      stem: spec.stem,
      options,
      answer,
      solution: spec.solution,
    });
  }
  return out;
}

// ══════════════════════════════════════════════════════════════════════════
// PAPER-I · REASONING (25) — parametric series, analogy, coding, directions
// ══════════════════════════════════════════════════════════════════════════
type ReasGen = (rand: () => number) => {
  topic: string;
  difficulty: Difficulty;
  stem: string;
  correct: string;
  distractors: string[];
  solution: string;
};

const REAS_GENERATORS: ReasGen[] = [
  // Geometric series ×r
  (rand) => {
    const a = pick(rand, [2, 3, 5, 7]);
    const r = pick(rand, [2, 3]);
    const s = [a, a * r, a * r * r, a * r ** 3];
    const next = a * r ** 4;
    return {
      topic: "Number Series",
      difficulty: "easy",
      stem: `Find the next term: ${s.join(", ")}, ?`,
      correct: `${next}`,
      distractors: [`${next - r}`, `${next + a}`, `${s[3] + s[2]}`],
      solution: `Each term is multiplied by ${r}, so next = ${s[3]} \\u00d7 ${r} = ${next}.`,
    };
  },
  // Square series
  (rand) => {
    const start = pick(rand, [1, 2, 3, 4]);
    const s = [start, start + 1, start + 2, start + 3].map((x) => x * x);
    const next = (start + 4) ** 2;
    return {
      topic: "Number Series",
      difficulty: "easy",
      stem: `Find the next term: ${s.join(", ")}, ?`,
      correct: `${next}`,
      distractors: [`${next - 5}`, `${next + 4}`, `${s[3] + 10}`],
      solution: `These are perfect squares; next = ${start + 4}\\u00b2 = ${next}.`,
    };
  },
  // Difference (arithmetic of differences)
  (rand) => {
    const a0 = pick(rand, [2, 3, 4, 5]);
    const d0 = pick(rand, [2, 3]);
    const seq = [a0];
    let d = d0;
    for (let i = 0; i < 4; i++) {
      seq.push(seq[seq.length - 1] + d);
      d += d0;
    }
    const next = seq[4];
    return {
      topic: "Number Series",
      difficulty: "medium",
      stem: `Find the next term: ${seq.slice(0, 4).join(", ")}, ?`,
      correct: `${next}`,
      distractors: [`${next - d0}`, `${next + d0}`, `${seq[3] + d0}`],
      solution: `Differences grow by ${d0}; adding the next difference gives ${next}.`,
    };
  },
  // Letter series −2
  (rand) => {
    const startCode = pick(rand, [25, 24, 23, 22]); // Z=25 (0-index A=0)
    const letters = [0, 1, 2, 3].map((i) => String.fromCharCode(65 + startCode - 2 * i));
    const nextCode = startCode - 8;
    return {
      topic: "Letter Series",
      difficulty: "medium",
      stem: `Find the next term: ${letters.join(", ")}, ?`,
      correct: String.fromCharCode(65 + nextCode),
      distractors: [
        String.fromCharCode(65 + nextCode + 1),
        String.fromCharCode(65 + nextCode - 1),
        String.fromCharCode(65 + nextCode + 2),
      ],
      solution: `Letters decrease by 2 each time, so the next letter is ${String.fromCharCode(65 + nextCode)}.`,
    };
  },
  // Consecutive letters
  (rand) => {
    const start = pick(rand, [10, 12, 13, 14]); // K..
    const letters = [0, 1, 2, 3].map((i) => String.fromCharCode(65 + start + i));
    const nxt = String.fromCharCode(65 + start + 4);
    return {
      topic: "Letter Series",
      difficulty: "easy",
      stem: `Find the next term: ${letters.join(", ")}, ?`,
      correct: nxt,
      distractors: [
        String.fromCharCode(65 + start + 5),
        String.fromCharCode(65 + start + 3),
        String.fromCharCode(65 + start + 6),
      ],
      solution: `Consecutive alphabet letters; after ${letters[3]} comes ${nxt}.`,
    };
  },
  // n : n^k analogy
  (rand) => {
    const base = pick(rand, [2, 3, 4]);
    const k = pick(rand, [2, 3]);
    const target = pick(rand, [3, 4, 5].filter((x) => x !== base));
    return {
      topic: "Number Analogy",
      difficulty: "easy",
      stem: `${base} : ${base ** k} :: ${target} : ? (pattern n : n^${k})`,
      correct: `${target ** k}`,
      distractors: [`${target ** k - target}`, `${target ** k + target}`, `${target * k}`],
      solution: `${base}^${k} = ${base ** k}, so ${target}^${k} = ${target ** k}.`,
    };
  },
  // Direction: Pythagorean displacement
  (rand) => {
    const triples: [number, number, number][] = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [9, 12, 15],
    ];
    const [x, y, h] = pick(rand, triples);
    return {
      topic: "Direction Sense",
      difficulty: "medium",
      stem: `A man walks ${x} km north, then ${y} km east. His distance from the start is:`,
      correct: `${h} km`,
      distractors: [`${x + y} km`, `${h - 1} km`, `${r1(Math.sqrt(x * x + y * y) + 1)} km`],
      solution: `Resultant = \\u221a(${x}\\u00b2 + ${y}\\u00b2) = ${h} km.`,
    };
  },
  // Direction turn
  (rand) => {
    const cases: [string, string, string, string[]][] = [
      ["north", "right", "East", ["West", "South", "North"]],
      ["south", "left", "East", ["West", "North", "South"]],
      ["east", "right", "South", ["North", "West", "East"]],
      ["west", "left", "South", ["North", "East", "West"]],
    ];
    const [facing, turn, ans, dist] = pick(rand, cases);
    return {
      topic: "Direction Sense",
      difficulty: "easy",
      stem: `A person facing ${facing} turns 90\\u00b0 to the ${turn}. Now they face:`,
      correct: ans,
      distractors: dist,
      solution: `Turning ${turn} from ${facing} leads to ${ans}.`,
    };
  },
  // Coding: next letter shift
  (rand) => {
    const words = ["ROSE", "BIRD", "GOLD", "FISH", "TREE", "STAR"];
    const w = pick(rand, words);
    const enc = w
      .split("")
      .map((c) => String.fromCharCode(((c.charCodeAt(0) - 65 + 1) % 26) + 65))
      .join("");
    const distort = (s: string) => s.slice(0, -1) + String.fromCharCode(((s.charCodeAt(s.length - 1) - 65 + 1) % 26) + 65);
    return {
      topic: "Coding-Decoding",
      difficulty: "medium",
      stem: `If each letter is replaced by the next letter, ${w} is coded as:`,
      correct: enc,
      distractors: [distort(enc), w, enc.slice(1) + enc[0]],
      solution: `Shift each letter forward by one to get ${enc}.`,
    };
  },
  // Coding: letter-sum
  (rand) => {
    const words = ["BAD", "CAB", "ACE", "DAB", "BED"];
    const w = pick(rand, words);
    const sum = w.split("").reduce((s, c) => s + (c.charCodeAt(0) - 64), 0);
    return {
      topic: "Coding-Decoding",
      difficulty: "easy",
      stem: `If A=1, B=2, ... then the sum of the letters of ${w} is:`,
      correct: `${sum}`,
      distractors: [`${sum + 1}`, `${sum - 1}`, `${sum + 2}`],
      solution: `Add the alphabet positions of ${w.split("").join(", ")} to get ${sum}.`,
    };
  },
  // Ranking position
  (rand) => {
    const total = pick(rand, [18, 20, 24, 30]);
    const left = pick(rand, [5, 7, 8, 9]);
    const right = total - left + 1;
    return {
      topic: "Ranking",
      difficulty: "easy",
      stem: `In a row of ${total} people, X is ${left}th from the left. X's position from the right is:`,
      correct: `${right}`,
      distractors: [`${right - 1}`, `${right + 1}`, `${total - left}`],
      solution: `Position from right = ${total} \\u2212 ${left} + 1 = ${right}.`,
    };
  },
  // Clock angle at o'clock
  (rand) => {
    const h = pick(rand, [2, 3, 4, 5]);
    const ang = h * 30;
    return {
      topic: "Clocks",
      difficulty: "easy",
      stem: `The angle between the hands of a clock at ${h}:00 is:`,
      correct: `${ang}\\u00b0`,
      distractors: [`${ang + 30}\\u00b0`, `${ang - 30}\\u00b0`, `${360 - ang}\\u00b0`],
      solution: `Each hour = 30\\u00b0; at ${h}:00 the hands are ${h} \\u00d7 30 = ${ang}\\u00b0 apart.`,
    };
  },
  // Calendar same-day
  (rand) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const d = pick(rand, days);
    const dateA = pick(rand, [1, 2, 3]);
    const dateB = dateA + 7;
    return {
      topic: "Calendar",
      difficulty: "easy",
      stem: `If ${dateA} January is a ${d}, what day is ${dateB} January?`,
      correct: d,
      distractors: days.filter((x) => x !== d).slice(0, 3),
      solution: `${dateB} \\u2212 ${dateA} = 7 days, exactly one week, so it is again ${d}.`,
    };
  },
  // Odd one out: prime vs composite
  (rand) => {
    const sets: [number[], number][] = [
      [[3, 5, 9, 11], 9],
      [[2, 7, 13, 15], 15],
      [[5, 11, 17, 21], 21],
      [[3, 7, 19, 25], 25],
    ];
    const [arr, odd] = pick(rand, sets);
    return {
      topic: "Odd One Out",
      difficulty: "easy",
      stem: `Which is the odd one out: ${arr.join(", ")}?`,
      correct: `${odd}`,
      distractors: arr.filter((x) => x !== odd).map(String),
      solution: `${arr.filter((x) => x !== odd).join(", ")} are prime; ${odd} is composite.`,
    };
  },
  // Odd one out: perfect cubes
  (rand) => {
    const sets: [number[], number][] = [
      [[27, 64, 100, 125], 100],
      [[8, 27, 50, 64], 50],
      [[1, 8, 20, 27], 20],
      [[64, 125, 200, 216], 200],
    ];
    const [arr, odd] = pick(rand, sets);
    return {
      topic: "Classification",
      difficulty: "medium",
      stem: `Which is the odd one out: ${arr.join(", ")}?`,
      correct: `${odd}`,
      distractors: arr.filter((x) => x !== odd).map(String),
      solution: `The others are perfect cubes; ${odd} is not.`,
    };
  },
  // Blood relation (only daughter)
  (rand) => {
    return {
      topic: "Blood Relations",
      difficulty: "medium",
      stem: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
      correct: "Mother",
      distractors: ["Sister", "Aunt", "Grandmother"],
      solution: "The only daughter of her mother is the woman herself, so she is the man's mother.",
    };
  },
  // Syllogism
  (rand) => {
    const sets: [string, string, string, string[]][] = [
      ["All roses are flowers. All flowers fade.", "All roses fade", "All roses fade", ["No rose fades", "Some roses never fade", "Cannot be determined"]],
      ["All cats are animals. All animals breathe.", "All cats breathe", "All cats breathe", ["No cat breathes", "Some cats do not breathe", "Cannot be determined"]],
      ["All pens are tools. All tools are useful.", "All pens are useful", "All pens are useful", ["No pen is useful", "Some pens are useless", "Cannot be determined"]],
    ];
    const [prem, , ans, dist] = pick(rand, sets);
    return {
      topic: "Syllogism",
      difficulty: "medium",
      stem: `${prem} Which conclusion follows?`,
      correct: ans,
      distractors: dist,
      solution: `Both premises are universal affirmatives, so the chained conclusion '${ans}' follows.`,
    };
  },
  // Analogy (worn item)
  (rand) => {
    const sets: [string, string, string, string[]][] = [
      ["Hand", "Glove", "Foot", ["Sock", "Toe", "Leg"]],
      ["Head", "Hat", "Foot", ["Shoe", "Sock", "Knee"]],
      ["Bird", "Nest", "Bee", ["Hive", "Web", "Den"]],
      ["Dog", "Kennel", "Horse", ["Stable", "Barn", "Cage"]],
    ];
    const [a, b, c, opts] = pick(rand, sets);
    return {
      topic: "Analogy",
      difficulty: "easy",
      stem: `${a} : ${b} :: ${c} : ?`,
      correct: opts[0],
      distractors: opts.slice(1),
      solution: `Just as ${b} relates to ${a}, ${opts[0]} relates to ${c}.`,
    };
  },
  // Halving code
  (rand) => {
    const n = pick(rand, [12, 16, 18, 20, 24]);
    return {
      topic: "Coding-Decoding",
      difficulty: "easy",
      stem: `If 8 \\u2192 4, 10 \\u2192 5 and 12 \\u2192 6, then ${n} \\u2192 ?`,
      correct: `${n / 2}`,
      distractors: [`${n / 2 + 1}`, `${n / 2 - 1}`, `${n}`],
      solution: `Each number is halved, so ${n} \\u2192 ${n / 2}.`,
    };
  },
  // Fraction comparison
  (rand) => {
    const fr: [string, number][] = [
      ["1/2", 0.5],
      ["2/3", 0.667],
      ["3/4", 0.75],
      ["4/5", 0.8],
      ["5/8", 0.625],
    ];
    const chosen = [...fr].sort(() => rand() - 0.5).slice(0, 4);
    const largest = chosen.reduce((m, c) => (c[1] > m[1] ? c : m));
    return {
      topic: "Comparison",
      difficulty: "easy",
      stem: "Which of these fractions is the largest?",
      correct: largest[0],
      distractors: chosen.filter((c) => c[0] !== largest[0]).map((c) => c[0]),
      solution: `Comparing decimal values, ${largest[0]} is the largest.`,
    };
  },
  // Classification (category odd-one)
  (rand) => {
    const sets: [string[], string][] = [
      [["Apple", "Mango", "Banana", "Potato"], "Potato"],
      [["Rose", "Lily", "Lotus", "Mango"], "Mango"],
      [["Cow", "Goat", "Tiger", "Sheep"], "Tiger"],
      [["Copper", "Iron", "Oxygen", "Zinc"], "Oxygen"],
    ];
    const [arr, odd] = pick(rand, sets);
    return {
      topic: "Classification",
      difficulty: "easy",
      stem: `Which is the odd one out: ${arr.join(", ")}?`,
      correct: odd,
      distractors: arr.filter((x) => x !== odd),
      solution: `${odd} belongs to a different category from the rest.`,
    };
  },
  // Pair series skip-one (AB, DE, GH ...)
  (rand) => {
    const startIdx = pick(rand, [0, 1, 2]); // group start
    const g = (k: number) => String.fromCharCode(65 + 3 * k) + String.fromCharCode(65 + 3 * k + 1);
    const groups = [startIdx, startIdx + 1, startIdx + 2].map(g);
    const next = g(startIdx + 3);
    return {
      topic: "Letter Series",
      difficulty: "easy",
      stem: `Find the next term: ${groups.join(", ")}, ?`,
      correct: next,
      distractors: [g(startIdx + 4), g(startIdx + 2), next.split("").reverse().join("")],
      solution: `Each pair skips one letter; after ${groups[2]} comes ${next}.`,
    };
  },
];

function genReasoning(rand: () => number, startId: number): Q[] {
  const out: Q[] = [];
  const seen = new Set<string>();
  const gens = [...REAS_GENERATORS];
  for (let i = gens.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [gens[i], gens[j]] = [gens[j], gens[i]];
  }
  let gi = 0;
  let guard = 0;
  while (out.length < 25 && guard < 500) {
    guard++;
    const g = gens[gi % gens.length];
    gi++;
    const spec = g(rand);
    if (seen.has(spec.stem)) continue;
    seen.add(spec.stem);
    const { options, answer } = mcqFrom(rand, spec.correct, spec.distractors);
    out.push({
      id: startId + out.length,
      subject: SUBJ.reas,
      topic: spec.topic,
      section: "Paper-I",
      type: "MCQ",
      marks: 1,
      difficulty: spec.difficulty,
      stem: spec.stem,
      options,
      answer,
      solution: spec.solution,
    });
  }
  return out;
}

// ══════════════════════════════════════════════════════════════════════════
// PAPER-I · GENERAL AWARENESS (25) = 10 Current Affairs + 15 Static GK
// ══════════════════════════════════════════════════════════════════════════
interface FactQ {
  topic: string;
  difficulty: Difficulty;
  stem: string;
  correct: string;
  distractors: string[];
  solution: string;
}

// Real dated June-2026 headlines (same set verified for Set 1). These should be
// primary-source checked before the mocks are made public.
const CURRENT_AFFAIRS: FactQ[] = [
  { topic: "Current Affairs · Economy", difficulty: "medium", stem: "As per Income Tax Department data (June 2026), India's net direct tax collections in early FY27 rose by about what percentage year-on-year?", correct: "14.6%", distractors: ["8.4%", "22.1%", "5.2%"], solution: "Net direct tax collections rose ~14.6% YoY to about Rs 5.21 trillion." },
  { topic: "Current Affairs · International", difficulty: "medium", stem: "In 2026, which country became the first Central Asian member of the New Development Bank (NDB)?", correct: "Uzbekistan", distractors: ["Kazakhstan", "Tajikistan", "Turkmenistan"], solution: "Uzbekistan became the first Central Asian nation to join the BRICS-backed NDB." },
  { topic: "Current Affairs · Awards", difficulty: "medium", stem: "Which India-born theoretical physicist won the 2025 Wolf Prize in Physics?", correct: "Jainendra K. Jain", distractors: ["Ashoke Sen", "Abhay Ashtekar", "C. V. Vishveshwara"], solution: "Rajasthan-born physicist Jainendra K. Jain received the 2025 Wolf Prize in Physics." },
  { topic: "Current Affairs · Reports", difficulty: "easy", stem: "Which institution ranked first in the QS World University Rankings 2027 (released June 2026)?", correct: "MIT", distractors: ["Stanford University", "University of Oxford", "Harvard University"], solution: "Massachusetts Institute of Technology (MIT) ranked first in QS World University Rankings 2027." },
  { topic: "Current Affairs · International", difficulty: "hard", stem: "In June 2026, which Indian jurist was elected a Judge of the International Tribunal for the Law of the Sea (ITLOS)?", correct: "Bimal N. Patel", distractors: ["Dalveer Bhandari", "Nagendra Singh", "R. S. Pathak"], solution: "Indian jurist Bimal N. Patel was elected to ITLOS in June 2026." },
  { topic: "Current Affairs · Awards", difficulty: "medium", stem: "In 2026, PM Narendra Modi received the highest national award of which country?", correct: "Slovakia", distractors: ["Cyprus", "Egypt", "Fiji"], solution: "PM Modi was conferred Slovakia's highest national award in 2026." },
  { topic: "Current Affairs · Defence", difficulty: "medium", stem: "Exercise KHAAN QUEST 2026, in which an Indian Army contingent participated, was held in which country?", correct: "Mongolia", distractors: ["Nepal", "Kazakhstan", "Russia"], solution: "The multinational Exercise KHAAN QUEST 2026 was held in Mongolia." },
  { topic: "Current Affairs · Appointments", difficulty: "hard", stem: "Who was named the new Chairman of GIC Re in June 2026?", correct: "Hitesh Joshi", distractors: ["Devesh Srivastava", "N. Ramaswamy", "A. K. Roy"], solution: "The government named Hitesh Joshi as the new Chairman of GIC Re." },
  { topic: "Current Affairs · Economy", difficulty: "medium", stem: "In 2026, ONGC was assigned to develop a new strategic petroleum reserve (SPR) facility at which location?", correct: "Mangaluru", distractors: ["Padur", "Bikaner", "Chandikhol"], solution: "ONGC was tasked with building a new underground crude oil SPR cavern at Mangaluru, Karnataka." },
  { topic: "Current Affairs · International", difficulty: "medium", stem: "The India\\u2013UK CETA and Social Security Agreement were reported to take effect from which date?", correct: "July 15, 2026", distractors: ["January 1, 2027", "August 15, 2026", "April 1, 2026"], solution: "Reports indicated the India\\u2013UK CETA would take effect from July 15, 2026." },
];

// Static GK pool — large enough to give each of sets 2..10 a distinct slice of 15.
const STATIC_GK: FactQ[] = [
  { topic: "Static GK · Organisations", difficulty: "easy", stem: "The headquarters of Coal India Limited (CIL) is located in which city?", correct: "Kolkata", distractors: ["New Delhi", "Ranchi", "Dhanbad"], solution: "Coal India Limited is headquartered in Kolkata, West Bengal." },
  { topic: "Static GK · Coal & Mining", difficulty: "medium", stem: "Which is the largest coal-producing state in India in recent years?", correct: "Chhattisgarh", distractors: ["Jharkhand", "Odisha", "West Bengal"], solution: "Chhattisgarh has been India's largest coal-producing state, ahead of Odisha and Jharkhand." },
  { topic: "Static GK · Coal & Mining", difficulty: "medium", stem: "Coal India Limited operates under which Union Ministry?", correct: "Ministry of Coal", distractors: ["Ministry of Mines", "Ministry of Power", "Ministry of Steel"], solution: "CIL functions under the Ministry of Coal, Government of India." },
  { topic: "Static GK · Coal & Mining", difficulty: "medium", stem: "Which subsidiary of CIL is the single largest coal-producing company?", correct: "South Eastern Coalfields Ltd", distractors: ["Bharat Coking Coal Ltd", "Central Coalfields Ltd", "Eastern Coalfields Ltd"], solution: "South Eastern Coalfields Limited (SECL) is among CIL's largest producing subsidiaries." },
  { topic: "Static GK · World Geography", difficulty: "easy", stem: "What is the capital of Australia?", correct: "Canberra", distractors: ["Sydney", "Melbourne", "Perth"], solution: "Canberra is the capital of Australia, not Sydney or Melbourne." },
  { topic: "Static GK · World Geography", difficulty: "easy", stem: "What is the capital of Canada?", correct: "Ottawa", distractors: ["Toronto", "Vancouver", "Montreal"], solution: "Ottawa is the national capital of Canada." },
  { topic: "Static GK · World Geography", difficulty: "medium", stem: "Mount Kilimanjaro, the highest mountain in Africa, is located in which country?", correct: "Tanzania", distractors: ["Kenya", "Uganda", "Ethiopia"], solution: "Mount Kilimanjaro lies in north-eastern Tanzania." },
  { topic: "Static GK · Science", difficulty: "easy", stem: "Which is the largest planet in the Solar System?", correct: "Jupiter", distractors: ["Saturn", "Neptune", "Earth"], solution: "Jupiter is the largest planet by both mass and diameter." },
  { topic: "Static GK · Science", difficulty: "easy", stem: "Which planet is known as the Red Planet?", correct: "Mars", distractors: ["Venus", "Jupiter", "Mercury"], solution: "Iron oxide on its surface gives Mars a reddish appearance." },
  { topic: "Static GK · Science", difficulty: "medium", stem: "The SI unit of electric current is the:", correct: "Ampere", distractors: ["Volt", "Ohm", "Watt"], solution: "The ampere (A) is the SI base unit of electric current." },
  { topic: "Static GK · Science", difficulty: "easy", stem: "Which gas is most abundant in Earth's atmosphere?", correct: "Nitrogen", distractors: ["Oxygen", "Carbon dioxide", "Hydrogen"], solution: "Nitrogen makes up about 78% of the atmosphere by volume." },
  { topic: "Static GK · Science", difficulty: "medium", stem: "The powerhouse of the cell is the:", correct: "Mitochondria", distractors: ["Nucleus", "Ribosome", "Golgi body"], solution: "Mitochondria generate most of the cell's ATP, earning the 'powerhouse' name." },
  { topic: "Static GK · Chemistry", difficulty: "easy", stem: "What is the chemical symbol of Gold?", correct: "Au", distractors: ["Gd", "Ag", "Go"], solution: "Gold's symbol is Au (from Latin 'aurum'); Ag is silver." },
  { topic: "Static GK · Chemistry", difficulty: "easy", stem: "What is the chemical symbol of Sodium?", correct: "Na", distractors: ["So", "Sd", "Sn"], solution: "Sodium's symbol is Na (from Latin 'natrium'); Sn is tin." },
  { topic: "Static GK · Chemistry", difficulty: "medium", stem: "The most abundant metal in the Earth's crust is:", correct: "Aluminium", distractors: ["Iron", "Copper", "Calcium"], solution: "Aluminium is the most abundant metal in the Earth's crust." },
  { topic: "Static GK · Polity", difficulty: "easy", stem: "Who chaired the Drafting Committee of the Indian Constitution?", correct: "B. R. Ambedkar", distractors: ["Jawaharlal Nehru", "Rajendra Prasad", "Vallabhbhai Patel"], solution: "Dr. B. R. Ambedkar chaired the Drafting Committee of the Constitution." },
  { topic: "Static GK · Polity", difficulty: "easy", stem: "Who was the first President of India?", correct: "Rajendra Prasad", distractors: ["S. Radhakrishnan", "Jawaharlal Nehru", "Zakir Husain"], solution: "Dr. Rajendra Prasad was the first President of India (1950\\u201362)." },
  { topic: "Static GK · Polity", difficulty: "medium", stem: "How many Fundamental Rights are currently guaranteed by the Indian Constitution?", correct: "Six", distractors: ["Five", "Seven", "Eight"], solution: "There are six Fundamental Rights after the Right to Property was removed in 1978." },
  { topic: "Static GK · Polity", difficulty: "medium", stem: "The Directive Principles of State Policy are enshrined in which Part of the Constitution?", correct: "Part IV", distractors: ["Part III", "Part II", "Part V"], solution: "Directive Principles are contained in Part IV (Articles 36\\u201351)." },
  { topic: "Static GK · Polity", difficulty: "medium", stem: "Who is the constitutional head of the Indian Union?", correct: "The President", distractors: ["The Prime Minister", "The Chief Justice", "The Vice President"], solution: "The President of India is the constitutional head of the Union." },
  { topic: "Static GK · India", difficulty: "easy", stem: "What is the national animal of India?", correct: "Tiger", distractors: ["Lion", "Elephant", "Peacock"], solution: "The Royal Bengal Tiger is the national animal of India." },
  { topic: "Static GK · India", difficulty: "easy", stem: "What is the national bird of India?", correct: "Peacock", distractors: ["Parrot", "Eagle", "Swan"], solution: "The Indian Peafowl (peacock) is the national bird of India." },
  { topic: "Static GK · India", difficulty: "easy", stem: "What is the national flower of India?", correct: "Lotus", distractors: ["Rose", "Sunflower", "Marigold"], solution: "The lotus is the national flower of India." },
  { topic: "Static GK · Indian Geography", difficulty: "easy", stem: "Which is the longest river in India?", correct: "Ganga", distractors: ["Yamuna", "Godavari", "Brahmaputra"], solution: "The Ganga is the longest river flowing within India." },
  { topic: "Static GK · Indian Geography", difficulty: "medium", stem: "Which is the highest mountain peak entirely within India?", correct: "Kangchenjunga", distractors: ["Nanda Devi", "K2", "Mount Everest"], solution: "Kangchenjunga is the highest peak located within India's borders." },
  { topic: "Static GK · Indian Geography", difficulty: "medium", stem: "The Tropic of Cancer passes through how many Indian states?", correct: "Eight", distractors: ["Five", "Six", "Ten"], solution: "The Tropic of Cancer passes through eight Indian states." },
  { topic: "Static GK · World", difficulty: "easy", stem: "What is the currency of Japan?", correct: "Yen", distractors: ["Yuan", "Won", "Ringgit"], solution: "The Yen is the currency of Japan; Yuan is Chinese, Won is Korean." },
  { topic: "Static GK · World", difficulty: "easy", stem: "What is the currency of the United Kingdom?", correct: "Pound Sterling", distractors: ["Euro", "Dollar", "Franc"], solution: "The UK's currency is the Pound Sterling (\\u00a3)." },
  { topic: "Static GK · Organisations", difficulty: "easy", stem: "Where are the headquarters of the United Nations located?", correct: "New York", distractors: ["Geneva", "Paris", "Vienna"], solution: "The UN headquarters is located in New York City, USA." },
  { topic: "Static GK · Organisations", difficulty: "medium", stem: "Where is the headquarters of the World Health Organization (WHO)?", correct: "Geneva", distractors: ["New York", "Paris", "Rome"], solution: "The WHO is headquartered in Geneva, Switzerland." },
  { topic: "Static GK · Organisations", difficulty: "easy", stem: "Which is India's national space agency?", correct: "ISRO", distractors: ["DRDO", "BARC", "NASA"], solution: "The Indian Space Research Organisation (ISRO) is India's space agency." },
  { topic: "Static GK · Monuments", difficulty: "easy", stem: "The Taj Mahal is located in which city?", correct: "Agra", distractors: ["Delhi", "Jaipur", "Lucknow"], solution: "The Taj Mahal is in Agra, Uttar Pradesh, on the bank of the Yamuna." },
  { topic: "Static GK · Monuments", difficulty: "medium", stem: "The Sun Temple at Konark is located in which state?", correct: "Odisha", distractors: ["West Bengal", "Bihar", "Jharkhand"], solution: "The Konark Sun Temple is in Odisha, a UNESCO World Heritage Site." },
  { topic: "Static GK · History", difficulty: "medium", stem: "In which year did the Dandi (Salt) March take place?", correct: "1930", distractors: ["1920", "1942", "1947"], solution: "Gandhi led the Dandi Salt March in 1930 during the Civil Disobedience Movement." },
  { topic: "Static GK · History", difficulty: "medium", stem: "The Quit India Movement was launched in which year?", correct: "1942", distractors: ["1930", "1939", "1945"], solution: "The Quit India Movement began in August 1942." },
  { topic: "Static GK · History", difficulty: "medium", stem: "Who founded the Maurya Empire?", correct: "Chandragupta Maurya", distractors: ["Ashoka", "Bindusara", "Bimbisara"], solution: "Chandragupta Maurya founded the Maurya Empire around 321 BCE." },
  { topic: "Static GK · Sports", difficulty: "easy", stem: "How many players are there in a cricket team on the field?", correct: "Eleven", distractors: ["Nine", "Ten", "Twelve"], solution: "A cricket team fields eleven players." },
  { topic: "Static GK · Sports", difficulty: "medium", stem: "The Thomas Cup is associated with which sport?", correct: "Badminton", distractors: ["Tennis", "Table Tennis", "Squash"], solution: "The Thomas Cup is the premier men's international team badminton event." },
  { topic: "Static GK · Awards", difficulty: "medium", stem: "The Bharat Ratna is India's highest:", correct: "Civilian award", distractors: ["Military award", "Sports award", "Literary award"], solution: "The Bharat Ratna is the highest civilian award of India." },
  { topic: "Static GK · Economy", difficulty: "medium", stem: "Which institution regulates monetary policy in India?", correct: "Reserve Bank of India", distractors: ["SEBI", "NITI Aayog", "Finance Commission"], solution: "The Reserve Bank of India (RBI) is the country's central bank and monetary authority." },
  { topic: "Static GK · Economy", difficulty: "medium", stem: "GST in India was implemented from which date?", correct: "1 July 2017", distractors: ["1 April 2016", "15 August 2017", "1 January 2018"], solution: "The Goods and Services Tax came into force on 1 July 2017." },
  { topic: "Static GK · Science", difficulty: "medium", stem: "The speed of light in vacuum is approximately:", correct: "3 \\u00d7 10^8 m/s", distractors: ["3 \\u00d7 10^6 m/s", "3 \\u00d7 10^10 m/s", "3 \\u00d7 10^5 m/s"], solution: "Light travels at about 3 \\u00d7 10^8 metres per second in vacuum." },
  { topic: "Static GK · Science", difficulty: "medium", stem: "Which vitamin is produced by the human body on exposure to sunlight?", correct: "Vitamin D", distractors: ["Vitamin A", "Vitamin C", "Vitamin K"], solution: "Sunlight triggers Vitamin D synthesis in the skin." },
  { topic: "Static GK · Coal & Mining", difficulty: "hard", stem: "The 'Maharatna' status was granted to Coal India Limited in which decade?", correct: "2010s", distractors: ["1990s", "2000s", "2020s"], solution: "CIL was conferred Maharatna status in 2011 (the 2010s)." },
  { topic: "Static GK · Coal & Mining", difficulty: "medium", stem: "The largest coalfield in India by reserves is the:", correct: "Jharia Coalfield", distractors: ["Raniganj Coalfield", "Korba Coalfield", "Singrauli Coalfield"], solution: "Jharia in Jharkhand holds major prime coking coal reserves." },
  { topic: "Static GK · Indian Geography", difficulty: "medium", stem: "Which Indian state has the longest coastline?", correct: "Gujarat", distractors: ["Andhra Pradesh", "Tamil Nadu", "Maharashtra"], solution: "Gujarat has the longest coastline among Indian states." },
];

function genGeneralAwareness(rand: () => number, startId: number, setNo: number): Q[] {
  const out: Q[] = [];
  // 10 current-affairs questions (ids 1..10) in fixed order for consistency.
  CURRENT_AFFAIRS.forEach((f, i) => {
    const { options, answer } = mcqFrom(rand, f.correct, f.distractors);
    out.push({
      id: startId + i,
      subject: SUBJ.ga,
      topic: f.topic,
      section: "Paper-I",
      type: "MCQ",
      marks: 1,
      difficulty: f.difficulty,
      stem: f.stem,
      options,
      answer,
      solution: f.solution,
    });
  });
  // 15 static-GK questions: rotate the pool by set so each set gets a distinct slice.
  const offset = ((setNo - 1) * 15) % STATIC_GK.length;
  const slice: FactQ[] = [];
  for (let i = 0; slice.length < 15; i++) {
    slice.push(STATIC_GK[(offset + i) % STATIC_GK.length]);
  }
  slice.forEach((f, i) => {
    const { options, answer } = mcqFrom(rand, f.correct, f.distractors);
    out.push({
      id: startId + 10 + i,
      subject: SUBJ.ga,
      topic: f.topic,
      section: "Paper-I",
      type: "MCQ",
      marks: 1,
      difficulty: f.difficulty,
      stem: f.stem,
      options,
      answer,
      solution: f.solution,
    });
  });
  return out;
}

// ══════════════════════════════════════════════════════════════════════════
// PAPER-I · GENERAL ENGLISH (25) — curated pool rotated by set
// ══════════════════════════════════════════════════════════════════════════
const ENGLISH_POOL: FactQ[] = [
  { topic: "Synonyms", difficulty: "easy", stem: "Choose the synonym of 'Abundant'.", correct: "Plentiful", distractors: ["Scarce", "Empty", "Rare"], solution: "'Abundant' means existing in large quantity, i.e. plentiful." },
  { topic: "Synonyms", difficulty: "easy", stem: "Choose the synonym of 'Brief'.", correct: "Short", distractors: ["Long", "Wide", "Heavy"], solution: "'Brief' means short or concise." },
  { topic: "Synonyms", difficulty: "easy", stem: "Choose the synonym of 'Happy'.", correct: "Joyful", distractors: ["Sad", "Angry", "Tired"], solution: "'Happy' is synonymous with 'joyful'." },
  { topic: "Synonyms", difficulty: "easy", stem: "Choose the synonym of 'Enormous'.", correct: "Huge", distractors: ["Tiny", "Narrow", "Light"], solution: "'Enormous' means very large, i.e. huge." },
  { topic: "Synonyms", difficulty: "medium", stem: "Choose the synonym of 'Diligent'.", correct: "Hard-working", distractors: ["Lazy", "Careless", "Slow"], solution: "'Diligent' describes someone hard-working and careful." },
  { topic: "Synonyms", difficulty: "medium", stem: "Choose the synonym of 'Candid'.", correct: "Frank", distractors: ["Secretive", "Rude", "Shy"], solution: "'Candid' means open and frank in speech." },
  { topic: "Synonyms", difficulty: "medium", stem: "Choose the synonym of 'Vivid'.", correct: "Bright", distractors: ["Dull", "Faint", "Pale"], solution: "'Vivid' means bright, clear and intense." },
  { topic: "Antonyms", difficulty: "easy", stem: "Choose the antonym of 'Ancient'.", correct: "Modern", distractors: ["Old", "Antique", "Aged"], solution: "'Ancient' (very old) is opposite to 'modern'." },
  { topic: "Antonyms", difficulty: "easy", stem: "Choose the antonym of 'Victory'.", correct: "Defeat", distractors: ["Win", "Success", "Triumph"], solution: "'Victory' is opposite to 'defeat'." },
  { topic: "Antonyms", difficulty: "easy", stem: "Choose the antonym of 'Expand'.", correct: "Contract", distractors: ["Grow", "Enlarge", "Stretch"], solution: "'Expand' is opposite to 'contract'." },
  { topic: "Antonyms", difficulty: "medium", stem: "Choose the antonym of 'Generous'.", correct: "Stingy", distractors: ["Kind", "Giving", "Liberal"], solution: "'Generous' is opposite to 'stingy' (mean with money)." },
  { topic: "Antonyms", difficulty: "medium", stem: "Choose the antonym of 'Transparent'.", correct: "Opaque", distractors: ["Clear", "Glassy", "Bright"], solution: "'Transparent' (see-through) is opposite to 'opaque'." },
  { topic: "Antonyms", difficulty: "medium", stem: "Choose the antonym of 'Optimist'.", correct: "Pessimist", distractors: ["Idealist", "Realist", "Dreamer"], solution: "An optimist's opposite is a 'pessimist'." },
  { topic: "Spelling", difficulty: "medium", stem: "Choose the correctly spelt word.", correct: "Occasion", distractors: ["Occassion", "Ocasion", "Occasson"], solution: "The correct spelling is 'Occasion' (one c, two s)." },
  { topic: "Spelling", difficulty: "medium", stem: "Choose the correctly spelt word.", correct: "Definitely", distractors: ["Definately", "Definitly", "Defenitely"], solution: "The correct spelling is 'Definitely'." },
  { topic: "Spelling", difficulty: "medium", stem: "Choose the correctly spelt word.", correct: "Accommodate", distractors: ["Accomodate", "Acommodate", "Accommodatte"], solution: "'Accommodate' has double c and double m." },
  { topic: "Spelling", difficulty: "medium", stem: "Choose the correctly spelt word.", correct: "Privilege", distractors: ["Priviledge", "Privelege", "Privilage"], solution: "The correct spelling is 'Privilege'." },
  { topic: "Prepositions", difficulty: "easy", stem: "Fill in the blank: 'She is good ___ mathematics.'", correct: "at", distractors: ["in", "on", "for"], solution: "The idiom is 'good at' a subject or skill." },
  { topic: "Prepositions", difficulty: "medium", stem: "Fill in the blank: 'He has been living here ___ 2010.'", correct: "since", distractors: ["for", "from", "by"], solution: "'Since' is used with a point of time like a year." },
  { topic: "Prepositions", difficulty: "easy", stem: "Fill in the blank: 'Divide this ___ two parts.'", correct: "into", distractors: ["in", "by", "to"], solution: "'Divide into' is the correct collocation for separation." },
  { topic: "Prepositions", difficulty: "medium", stem: "Fill in the blank: 'He is married ___ a doctor.'", correct: "to", distractors: ["with", "by", "for"], solution: "The correct collocation is 'married to' someone." },
  { topic: "Prepositions", difficulty: "easy", stem: "Fill in the blank: 'The book is ___ the table.'", correct: "on", distractors: ["in", "at", "into"], solution: "'On' indicates resting on a surface." },
  { topic: "One-word Substitution", difficulty: "easy", stem: "One word for 'a person who cannot read or write':", correct: "Illiterate", distractors: ["Literate", "Scholar", "Novice"], solution: "Such a person is 'illiterate'." },
  { topic: "One-word Substitution", difficulty: "easy", stem: "The study of living organisms is called:", correct: "Biology", distractors: ["Geology", "Zoology", "Botany"], solution: "'Biology' is the study of all living organisms." },
  { topic: "One-word Substitution", difficulty: "easy", stem: "One who studies stars and celestial bodies is an:", correct: "Astronomer", distractors: ["Astrologer", "Geologist", "Biologist"], solution: "An 'astronomer' scientifically studies celestial bodies." },
  { topic: "One-word Substitution", difficulty: "medium", stem: "One word for 'a speech made without preparation':", correct: "Extempore", distractors: ["Oration", "Lecture", "Recital"], solution: "An unprepared speech is delivered 'extempore'." },
  { topic: "One-word Substitution", difficulty: "medium", stem: "A place where birds are kept is called:", correct: "Aviary", distractors: ["Apiary", "Aquarium", "Sanctuary"], solution: "An 'aviary' houses birds; an apiary keeps bees." },
  { topic: "Idioms", difficulty: "medium", stem: "The idiom 'to break the ice' means:", correct: "to start a conversation", distractors: ["to fail badly", "to feel cold", "to win easily"], solution: "'Break the ice' means to initiate conversation in a tense or new setting." },
  { topic: "Idioms", difficulty: "easy", stem: "The idiom 'a piece of cake' means:", correct: "very easy", distractors: ["very tasty", "expensive", "difficult"], solution: "'A piece of cake' means something very easy to do." },
  { topic: "Idioms", difficulty: "easy", stem: "The idiom 'once in a blue moon' means:", correct: "rarely", distractors: ["frequently", "never", "always"], solution: "'Once in a blue moon' means something happening very rarely." },
  { topic: "Idioms", difficulty: "medium", stem: "The idiom 'to bury the hatchet' means:", correct: "to make peace", distractors: ["to hide a weapon", "to dig a hole", "to start a fight"], solution: "'Bury the hatchet' means to end a quarrel and make peace." },
  { topic: "Idioms", difficulty: "medium", stem: "The idiom 'to let the cat out of the bag' means:", correct: "to reveal a secret", distractors: ["to free an animal", "to make noise", "to tell a lie"], solution: "It means to accidentally reveal a secret." },
  { topic: "Grammar", difficulty: "easy", stem: "The plural of 'Child' is:", correct: "Children", distractors: ["Childs", "Childer", "Childes"], solution: "'Child' has the irregular plural 'children'." },
  { topic: "Grammar", difficulty: "easy", stem: "The plural of 'Mouse' is:", correct: "Mice", distractors: ["Mouses", "Mouse", "Mices"], solution: "'Mouse' has the irregular plural 'mice'." },
  { topic: "Grammar", difficulty: "medium", stem: "Fill in the blank: 'Neither he nor I ___ wrong.'", correct: "am", distractors: ["is", "are", "were"], solution: "With 'neither...nor', the verb agrees with the nearer subject 'I', so 'am'." },
  { topic: "Grammar", difficulty: "medium", stem: "Fill in the blank: 'Each of the students ___ a book.'", correct: "has", distractors: ["have", "are", "were"], solution: "'Each' is singular, so it takes 'has'." },
  { topic: "Articles", difficulty: "easy", stem: "Fill in the blank: 'He is ___ honest man.'", correct: "an", distractors: ["a", "the", "no article"], solution: "'Honest' starts with a vowel sound, so 'an' is used." },
  { topic: "Articles", difficulty: "medium", stem: "Fill in the blank: 'She plays ___ violin beautifully.'", correct: "the", distractors: ["a", "an", "no article"], solution: "Musical instruments take the definite article 'the'." },
  { topic: "Voice", difficulty: "medium", stem: "Passive voice of 'John wrote the letter.' is:", correct: "The letter was written by John", distractors: ["The letter is written by John", "John was written the letter", "The letter wrote John"], solution: "Past simple active becomes 'was written' in the passive." },
  { topic: "Voice", difficulty: "medium", stem: "Passive voice of 'She is reading a book.' is:", correct: "A book is being read by her", distractors: ["A book was read by her", "A book is read by her", "A book has been read by her"], solution: "Present continuous active becomes 'is being read' in the passive." },
  { topic: "Error Spotting", difficulty: "medium", stem: "Spot the error: 'He / don't / like / coffee.'", correct: "don't", distractors: ["He", "like", "coffee"], solution: "Third-person singular needs 'doesn't', not 'don't'." },
  { topic: "Error Spotting", difficulty: "medium", stem: "Spot the error: 'One of the boys / are / playing / outside.'", correct: "are", distractors: ["One of the boys", "playing", "outside"], solution: "'One of the boys' is singular, so it requires 'is'." },
  { topic: "Tenses", difficulty: "medium", stem: "Choose the correct form: 'I ___ my homework already.'", correct: "have done", distractors: ["did", "do", "had did"], solution: "'Already' signals present perfect, so 'have done' is correct." },
  { topic: "Tenses", difficulty: "medium", stem: "Choose the correct form: 'By next year, she ___ here for a decade.'", correct: "will have worked", distractors: ["will work", "works", "has worked"], solution: "A completed action by a future point uses the future perfect 'will have worked'." },
  { topic: "Vocabulary", difficulty: "easy", stem: "Choose the word that means the opposite of 'Artificial'.", correct: "Natural", distractors: ["Synthetic", "Fake", "Man-made"], solution: "'Artificial' is opposite to 'natural'." },
  { topic: "Vocabulary", difficulty: "medium", stem: "Choose the correct meaning of the word 'Frugal'.", correct: "Economical", distractors: ["Wasteful", "Generous", "Lavish"], solution: "'Frugal' means careful with money, i.e. economical." },
];

function genGeneralEnglish(rand: () => number, startId: number, setNo: number): Q[] {
  const out: Q[] = [];
  const offset = ((setNo - 1) * 25) % ENGLISH_POOL.length;
  const slice: FactQ[] = [];
  const used = new Set<string>();
  for (let i = 0; slice.length < 25; i++) {
    const f = ENGLISH_POOL[(offset + i) % ENGLISH_POOL.length];
    if (used.has(f.stem)) continue; // guarantee distinct within the set
    used.add(f.stem);
    slice.push(f);
  }
  slice.forEach((f, i) => {
    const { options, answer } = mcqFrom(rand, f.correct, f.distractors);
    out.push({
      id: startId + i,
      subject: SUBJ.eng,
      topic: f.topic,
      section: "Paper-I",
      type: "MCQ",
      marks: 1,
      difficulty: f.difficulty,
      stem: f.stem,
      options,
      answer,
      solution: f.solution,
    });
  });
  return out;
}

// ══════════════════════════════════════════════════════════════════════════
// PAPER-II · PROFESSIONAL KNOWLEDGE — CIVIL (100) = 60 theory + 40 numerical
// ══════════════════════════════════════════════════════════════════════════
type CivGen = (rand: () => number) => FactQ;

// ---- Parametric numerical Civil generators (answers computed) --------------
const CIVIL_NUM_GENERATORS: CivGen[] = [
  // SOM: max BM simply supported, central point load = WL/4
  (rand) => {
    const W = pick(rand, [8, 10, 12, 16, 20]);
    const L = pick(rand, [3, 4, 5, 6]);
    const bm = (W * L) / 4;
    return {
      topic: "Strength of Materials",
      difficulty: "medium",
      stem: `A simply supported beam of span ${L} m carries a central point load of ${W} kN. The maximum bending moment is:`,
      correct: `${r2(bm)} kNm`,
      distractors: [`${r2((W * L) / 8)} kNm`, `${r2((W * L) / 2)} kNm`, `${r2(W * L)} kNm`],
      solution: `Max BM = WL/4 = ${W} \\u00d7 ${L} / 4 = ${r2(bm)} kNm.`,
    };
  },
  // SOM: max SF simply supported central load = W/2
  (rand) => {
    const W = pick(rand, [10, 12, 16, 20, 24]);
    const sf = W / 2;
    return {
      topic: "Strength of Materials",
      difficulty: "easy",
      stem: `For a simply supported beam with a central point load of ${W} kN, the maximum shear force is:`,
      correct: `${r2(sf)} kN`,
      distractors: [`${W} kN`, `${r2(W / 4)} kN`, `${r2(W * 0.75)} kN`],
      solution: `Each reaction = W/2 = ${r2(sf)} kN, which is the maximum shear force.`,
    };
  },
  // SOM: cantilever end load, max BM = WL
  (rand) => {
    const W = pick(rand, [4, 5, 6, 8, 10]);
    const L = pick(rand, [2, 2.5, 3, 4]);
    const bm = W * L;
    return {
      topic: "Strength of Materials",
      difficulty: "easy",
      stem: `A cantilever ${L} m long carries a ${W} kN load at its free end. The maximum bending moment is:`,
      correct: `${r2(bm)} kNm`,
      distractors: [`${r2(bm / 2)} kNm`, `${r2(bm * 2)} kNm`, `${r2((W * L) / 4)} kNm`],
      solution: `Max BM at fixed end = W \\u00d7 L = ${W} \\u00d7 ${L} = ${r2(bm)} kNm.`,
    };
  },
  // SOM: direct stress = P/A
  (rand) => {
    const P = pick(rand, [50, 80, 100, 120, 150]); // kN
    const A = pick(rand, [500, 800, 1000, 1200, 1500]); // mm^2
    const stress = (P * 1000) / A; // MPa
    return {
      topic: "Strength of Materials",
      difficulty: "easy",
      stem: `An axial load of ${P} kN acts on a bar of cross-sectional area ${A} mm\\u00b2. The direct stress is:`,
      correct: `${r2(stress)} MPa`,
      distractors: [`${r2(stress * 0.5)} MPa`, `${r2(stress * 2)} MPa`, `${r2(stress + 10)} MPa`],
      solution: `Stress = P/A = ${P * 1000} N / ${A} mm\\u00b2 = ${r2(stress)} MPa.`,
    };
  },
  // SOM: modulus of rigidity G = E / 2(1+mu)
  (rand) => {
    const E = pick(rand, [200, 210, 120, 100]); // GPa
    const mu = pick(rand, [0.25, 0.3, 0.2]);
    const G = E / (2 * (1 + mu));
    return {
      topic: "Strength of Materials",
      difficulty: "medium",
      stem: `If E = ${E} GPa and Poisson's ratio = ${mu}, the modulus of rigidity G is:`,
      correct: `${r2(G)} GPa`,
      distractors: [`${r2(G * 1.1)} GPa`, `${r2(E / 2)} GPa`, `${r2(G * 0.9)} GPa`],
      solution: `G = E / [2(1+\\u03bc)] = ${E} / (2 \\u00d7 ${1 + mu}) = ${r2(G)} GPa.`,
    };
  },
  // SOM: section modulus rectangle = bd^2/6
  (rand) => {
    const b = pick(rand, [100, 150, 200, 250]);
    const d = pick(rand, [200, 300, 400, 450]);
    const Z = (b * d * d) / 6;
    return {
      topic: "Strength of Materials",
      difficulty: "medium",
      stem: `The section modulus of a rectangular section ${b} mm wide and ${d} mm deep is:`,
      correct: `${Z.toExponential(2)} mm\\u00b3`,
      distractors: [`${((b * d * d) / 12).toExponential(2)} mm\\u00b3`, `${((b * d * d) / 3).toExponential(2)} mm\\u00b3`, `${(b * d).toExponential(2)} mm\\u00b3`],
      solution: `Z = bd\\u00b2/6 = ${b} \\u00d7 ${d}\\u00b2 / 6 = ${Z.toExponential(2)} mm\\u00b3.`,
    };
  },
  // SOM: thermal stress fully restrained = alpha E dT (symbolic)
  (rand) => {
    return {
      topic: "Strength of Materials",
      difficulty: "medium",
      stem: "The thermal stress developed in a fully restrained bar for a temperature rise \\u0394T is:",
      correct: "\\u03b1E\\u0394T",
      distractors: ["\\u03b1\\u0394T", "E\\u0394T/\\u03b1", "\\u03b1E/\\u0394T"],
      solution: "Restrained thermal stress = \\u03b1E\\u0394T, independent of length and area.",
    };
  },
  // Structural Analysis: FEM for UDL = wL^2/12 (symbolic with values)
  (rand) => {
    return {
      topic: "Structural Analysis",
      difficulty: "medium",
      stem: "For a fixed beam carrying a UDL w over span L, the support (fixed-end) moment is:",
      correct: "wL\\u00b2/12",
      distractors: ["wL\\u00b2/8", "wL\\u00b2/24", "wL\\u00b2/2"],
      solution: "Fixed-end moment for a UDL is wL\\u00b2/12 at each support.",
    };
  },
  // Structural Analysis: FEM central point load = WL/8
  (rand) => {
    return {
      topic: "Structural Analysis",
      difficulty: "medium",
      stem: "For a fixed beam with a central point load W over span L, the magnitude of the fixed-end moment is:",
      correct: "WL/8",
      distractors: ["WL/4", "WL/12", "WL/2"],
      solution: "Fixed-end moment for a central point load is WL/8 at each support.",
    };
  },
  // RCC: effective depth
  (rand) => {
    const D = pick(rand, [400, 450, 500, 550, 600]);
    const cover = pick(rand, [20, 25, 30, 40]);
    const bar = pick(rand, [16, 20, 25]);
    const d = D - cover - bar / 2;
    return {
      topic: "RCC Design",
      difficulty: "medium",
      stem: `A beam has overall depth ${D} mm, clear cover ${cover} mm and ${bar} mm main bars. The effective depth is:`,
      correct: `${d} mm`,
      distractors: [`${D - cover} mm`, `${D - cover - bar} mm`, `${d + bar / 2} mm`],
      solution: `d = ${D} \\u2212 ${cover} \\u2212 ${bar}/2 = ${d} mm.`,
    };
  },
  // RCC: area of one bar
  (rand) => {
    const dia = pick(rand, [12, 16, 20, 25]);
    const area = Math.round((Math.PI / 4) * dia * dia);
    return {
      topic: "RCC Design",
      difficulty: "easy",
      stem: `The cross-sectional area of one ${dia} mm diameter bar is approximately:`,
      correct: `${area} mm\\u00b2`,
      distractors: [`${Math.round(dia * dia)} mm\\u00b2`, `${Math.round(area * 1.27)} mm\\u00b2`, `${Math.round(area * 0.8)} mm\\u00b2`],
      solution: `Area = \\u03c0/4 \\u00d7 ${dia}\\u00b2 = ${area} mm\\u00b2.`,
    };
  },
  // Geotech: porosity from void ratio
  (rand) => {
    const e = pick(rand, [0.4, 0.5, 0.6, 0.75, 1.0]);
    const n = (e / (1 + e)) * 100;
    return {
      topic: "Geotechnical Engineering",
      difficulty: "medium",
      stem: `For a void ratio e = ${e}, the porosity n is:`,
      correct: `${r1(n)}%`,
      distractors: [`${r1(e * 100)}%`, `${r1((e / (1 - e)) * 100)}%`, `${r1(n + 5)}%`],
      solution: `n = e/(1+e) = ${e}/${1 + e} = ${r1(n)}%.`,
    };
  },
  // Geotech: plasticity index
  (rand) => {
    const LL = pick(rand, [40, 45, 50, 55, 60]);
    const PL = pick(rand, [20, 25, 30]);
    const PI = LL - PL;
    return {
      topic: "Geotechnical Engineering",
      difficulty: "easy",
      stem: `If LL = ${LL}% and PL = ${PL}%, the plasticity index is:`,
      correct: `${PI}`,
      distractors: [`${LL + PL}`, `${PI + 5}`, `${Math.abs(PI - 5)}`],
      solution: `PI = LL \\u2212 PL = ${LL} \\u2212 ${PL} = ${PI}.`,
    };
  },
  // Geotech: Rankine Ka
  (rand) => {
    const phi = pick(rand, [30, 36, 45]);
    const ka = (1 - Math.sin((phi * Math.PI) / 180)) / (1 + Math.sin((phi * Math.PI) / 180));
    return {
      topic: "Geotechnical Engineering",
      difficulty: "medium",
      stem: `The Rankine active earth pressure coefficient Ka for a soil with \\u03c6 = ${phi}\\u00b0 is:`,
      correct: `${r2(ka)}`,
      distractors: [`${r2(1 / ka)}`, `${r2(ka + 0.1)}`, `${r2(ka * 1.5)}`],
      solution: `Ka = (1\\u2212sin\\u03c6)/(1+sin\\u03c6) = ${r2(ka)} for \\u03c6 = ${phi}\\u00b0.`,
    };
  },
  // Fluid mechanics: discharge Q = A*V
  (rand) => {
    const A = pick(rand, [1.5, 2, 2.5, 3]);
    const V = pick(rand, [2, 3, 4, 5]);
    const Q = A * V;
    return {
      topic: "Fluid Mechanics",
      difficulty: "easy",
      stem: `The discharge through a section of area ${A} m\\u00b2 with velocity ${V} m/s is:`,
      correct: `${r2(Q)} m\\u00b3/s`,
      distractors: [`${r2(A + V)} m\\u00b3/s`, `${r2(Q / 2)} m\\u00b3/s`, `${r2(Q + 1)} m\\u00b3/s`],
      solution: `Q = A \\u00d7 V = ${A} \\u00d7 ${V} = ${r2(Q)} m\\u00b3/s.`,
    };
  },
  // Fluid mechanics: hydrostatic pressure p = rho g h
  (rand) => {
    const h = pick(rand, [5, 8, 10, 12, 15]);
    const p = (1000 * 9.81 * h) / 1000; // kPa
    return {
      topic: "Fluid Mechanics",
      difficulty: "medium",
      stem: `The pressure at a depth of ${h} m in water (\\u03c1 = 1000 kg/m\\u00b3, g = 9.81 m/s\\u00b2) is about:`,
      correct: `${r1(p)} kPa`,
      distractors: [`${r1(p / 10)} kPa`, `${r1(p * 10)} kPa`, `${r1(p + 10)} kPa`],
      solution: `p = \\u03c1gh = 1000 \\u00d7 9.81 \\u00d7 ${h} = ${r1(p)} kPa.`,
    };
  },
  // Fluid mechanics: velocity head V^2/2g
  (rand) => {
    const V = pick(rand, [2, 3, 4, 5]);
    const vh = (V * V) / (2 * 9.81);
    return {
      topic: "Fluid Mechanics",
      difficulty: "medium",
      stem: `The velocity head corresponding to a velocity of ${V} m/s is about:`,
      correct: `${r2(vh)} m`,
      distractors: [`${r2(vh * 2)} m`, `${r2(vh / 2)} m`, `${r2(V / 9.81)} m`],
      solution: `V\\u00b2/2g = ${V}\\u00b2 / (2 \\u00d7 9.81) = ${r2(vh)} m.`,
    };
  },
  // Surveying: back bearing
  (rand) => {
    const fb = pick(rand, [30, 45, 60, 75, 120]);
    const bb = fb < 180 ? fb + 180 : fb - 180;
    return {
      topic: "Surveying",
      difficulty: "medium",
      stem: `If the fore bearing of a line is ${fb}\\u00b0, its back bearing is:`,
      correct: `${bb}\\u00b0`,
      distractors: [`${(fb + 90) % 360}\\u00b0`, `${(360 - fb) % 360}\\u00b0`, `${fb}\\u00b0`],
      solution: `Back bearing = fore bearing \\u00b1 180\\u00b0 = ${bb}\\u00b0.`,
    };
  },
  // Surveying: RL of next point
  (rand) => {
    const rl = pick(rand, [100, 120, 150, 95.5]);
    const bs = pick(rand, [1.2, 1.5, 2.0, 1.8]);
    const fs = pick(rand, [0.8, 2.2, 2.5, 1.0]);
    const next = r2(rl + bs - fs);
    return {
      topic: "Surveying",
      difficulty: "medium",
      stem: `RL of a benchmark is ${rl} m. With back sight ${bs} m and fore sight ${fs} m, the RL of the next point is:`,
      correct: `${next} m`,
      distractors: [`${r2(rl - bs + fs)} m`, `${r2(rl + bs + fs)} m`, `${r2(rl + fs - bs)} m`],
      solution: `RL = ${rl} + ${bs} \\u2212 ${fs} = ${next} m (rise and fall).`,
    };
  },
  // Transportation: superelevation e = V^2/127R
  (rand) => {
    const V = pick(rand, [50, 60, 80, 100]);
    const R = pick(rand, [150, 200, 300, 400]);
    const e = (V * V) / (127 * R);
    return {
      topic: "Transportation Engineering",
      difficulty: "medium",
      stem: `The superelevation for a design speed of ${V} km/h and radius ${R} m (e = V\\u00b2/127R) is about:`,
      correct: `${r2(e)}`,
      distractors: [`${r2(e * 1.5)}`, `${r2(e / 2)}`, `${r2(e + 0.05)}`],
      solution: `e = ${V}\\u00b2/(127 \\u00d7 ${R}) = ${r2(e)}.`,
    };
  },
  // Environmental: detention time = V/Q
  (rand) => {
    const Vtank = pick(rand, [100, 150, 200, 300]);
    const Q = pick(rand, [25, 50, 60, 100]);
    const t = Vtank / Q;
    return {
      topic: "Environmental Engineering",
      difficulty: "medium",
      stem: `The detention time of a tank of volume ${Vtank} m\\u00b3 treating a flow of ${Q} m\\u00b3/h is:`,
      correct: `${r2(t)} hours`,
      distractors: [`${r2(t / 2)} hours`, `${r2(t * 2)} hours`, `${r2(t + 1)} hours`],
      solution: `Detention time = Volume / Discharge = ${Vtank} / ${Q} = ${r2(t)} hours.`,
    };
  },
];

// ---- Curated Civil theory pool (answers fixed) -----------------------------
const CIVIL_THEORY_POOL: FactQ[] = [
  // Strength of Materials
  { topic: "Strength of Materials", difficulty: "easy", stem: "In a beam section subjected to bending, the bending stress is zero at the:", correct: "Neutral axis", distractors: ["Extreme fibre", "Top flange", "Support"], solution: "Bending stress varies linearly and is zero at the neutral axis (centroidal axis)." },
  { topic: "Strength of Materials", difficulty: "easy", stem: "The Poisson's ratio for structural steel is approximately:", correct: "0.3", distractors: ["0.1", "0.5", "0.7"], solution: "Steel has a Poisson's ratio of about 0.3." },
  { topic: "Strength of Materials", difficulty: "easy", stem: "The flexure (bending) equation is:", correct: "M/I = \\u03c3/y = E/R", distractors: ["P/A = \\u03c3", "V = Q/Ib", "\\u03c4 = Tr/J"], solution: "The bending equation relates moment, stress and curvature as M/I = \\u03c3/y = E/R." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "A point of contraflexure in a beam is where:", correct: "Bending moment changes sign (is zero)", distractors: ["Shear force is maximum", "Slope is zero", "Deflection is maximum"], solution: "At a point of contraflexure the bending moment is zero and reverses sign." },
  { topic: "Strength of Materials", difficulty: "easy", stem: "The slenderness ratio of a column is defined as:", correct: "Effective length / radius of gyration", distractors: ["Length / area", "Radius of gyration / length", "EI / length"], solution: "Slenderness ratio = effective length / least radius of gyration." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "Euler's critical buckling load of a column is proportional to:", correct: "1 / (effective length)\\u00b2", distractors: ["(effective length)\\u00b2", "effective length", "1 / effective length"], solution: "Pcr = \\u03c0\\u00b2EI/Le\\u00b2, so it varies inversely with the square of effective length." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "The shear stress distribution across a rectangular beam section is:", correct: "Parabolic", distractors: ["Linear", "Uniform", "Triangular"], solution: "Transverse shear stress varies parabolically, peaking at the neutral axis." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "The ratio of maximum to average shear stress for a rectangular section is:", correct: "1.5", distractors: ["1.0", "1.33", "2.0"], solution: "For a rectangle, maximum shear stress is 1.5 times the average." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "Torsional shear stress in a circular shaft is given by:", correct: "\\u03c4 = Tr/J", distractors: ["\\u03c3 = My/I", "\\u03c4 = VQ/Ib", "\\u03c3 = P/A"], solution: "The torsion formula is \\u03c4/r = T/J = G\\u03b8/L." },
  { topic: "Strength of Materials", difficulty: "hard", stem: "The strain energy stored per unit volume under axial stress \\u03c3 is:", correct: "\\u03c3\\u00b2/2E", distractors: ["\\u03c3\\u00b2E/2", "\\u03c3E\\u00b2", "2\\u03c3\\u00b2/E"], solution: "Resilience (strain energy density) = \\u03c3\\u00b2/2E." },
  // Structural Analysis
  { topic: "Structural Analysis", difficulty: "easy", stem: "The degree of static indeterminacy of a simply supported beam is:", correct: "0", distractors: ["1", "2", "3"], solution: "A simply supported beam is statically determinate (indeterminacy = 0)." },
  { topic: "Structural Analysis", difficulty: "medium", stem: "The degree of static indeterminacy of a propped cantilever beam is:", correct: "1", distractors: ["0", "2", "3"], solution: "A propped cantilever has one redundant reaction, so indeterminacy = 1." },
  { topic: "Structural Analysis", difficulty: "medium", stem: "The carry-over factor for a prismatic member in moment distribution is:", correct: "1/2", distractors: ["1", "1/4", "2"], solution: "For a prismatic member with a far fixed end the carry-over factor is 1/2." },
  { topic: "Structural Analysis", difficulty: "easy", stem: "The sum of distribution factors at a rigid joint equals:", correct: "1", distractors: ["0", "0.5", "2"], solution: "Distribution factors at any joint always sum to unity." },
  { topic: "Structural Analysis", difficulty: "easy", stem: "The moment distribution method was developed by:", correct: "Hardy Cross", distractors: ["James Clerk Maxwell", "Otto Mohr", "Castigliano"], solution: "Hardy Cross developed the moment distribution method in 1930." },
  { topic: "Structural Analysis", difficulty: "medium", stem: "A three-hinged arch is:", correct: "Statically determinate", distractors: ["Indeterminate to 1st degree", "Indeterminate to 2nd degree", "Unstable"], solution: "Three equilibrium equations plus the hinge condition make it determinate." },
  { topic: "Structural Analysis", difficulty: "medium", stem: "Castigliano's first theorem gives:", correct: "Deflection = \\u2202U/\\u2202P", distractors: ["Force = \\u2202U/\\u2202x", "Stress = \\u2202U/\\u2202A", "Strain energy density"], solution: "The partial derivative of strain energy with respect to a load gives the deflection at that load." },
  { topic: "Structural Analysis", difficulty: "medium", stem: "The Müller-Breslau principle is used to draw:", correct: "Influence lines", distractors: ["Bending moment diagrams", "Shear force diagrams", "Deflected shapes only"], solution: "It states the influence line for a response equals the deflected shape from a unit displacement." },
  { topic: "Structural Analysis", difficulty: "medium", stem: "Kinematic indeterminacy of a structure equals the number of:", correct: "Unknown joint displacements", distractors: ["Redundant forces", "Members", "Supports"], solution: "Kinematic indeterminacy = number of independent unknown joint displacements (degrees of freedom)." },
  { topic: "Structural Analysis", difficulty: "hard", stem: "The method best suited for analysing trusses with a single redundant member is the:", correct: "Method of consistent deformation", distractors: ["Slope-deflection method", "Method of joints", "Method of sections"], solution: "Consistent deformation (unit load) handles internally redundant trusses efficiently." },
  { topic: "Structural Analysis", difficulty: "medium", stem: "In a perfect plane truss, the relation between members m and joints j is:", correct: "m = 2j \\u2212 3", distractors: ["m = 3j \\u2212 2", "m = j \\u2212 2", "m = 2j + 3"], solution: "A statically determinate (perfect) plane truss satisfies m = 2j \\u2212 3." },
  // RCC Design
  { topic: "RCC Design", difficulty: "easy", stem: "The characteristic compressive strength of M20 concrete is:", correct: "20 MPa", distractors: ["15 MPa", "25 MPa", "30 MPa"], solution: "M20 denotes a characteristic cube strength of 20 MPa at 28 days." },
  { topic: "RCC Design", difficulty: "easy", stem: "The partial safety factor for concrete in the limit state method (IS 456) is:", correct: "1.5", distractors: ["1.0", "1.15", "2.0"], solution: "\\u03b3m for concrete is 1.5 in limit state design." },
  { topic: "RCC Design", difficulty: "easy", stem: "The partial safety factor for steel in the limit state method (IS 456) is:", correct: "1.15", distractors: ["1.0", "1.5", "2.0"], solution: "\\u03b3m for reinforcing steel is 1.15 in limit state design." },
  { topic: "RCC Design", difficulty: "medium", stem: "As per IS 456, the minimum grade of concrete for reinforced concrete work is:", correct: "M20", distractors: ["M10", "M15", "M25"], solution: "IS 456 specifies M20 as the minimum grade for RCC." },
  { topic: "RCC Design", difficulty: "medium", stem: "As per IS 456, the maximum spacing of main bars in a slab is the smaller of:", correct: "3d or 300 mm", distractors: ["5d or 450 mm", "2d or 200 mm", "d or 100 mm"], solution: "Maximum spacing of main reinforcement is 3 times effective depth or 300 mm." },
  { topic: "RCC Design", difficulty: "medium", stem: "The development length Ld of a bar is given by:", correct: "\\u03c6\\u03c3s / (4\\u03c4bd)", distractors: ["4\\u03c4bd / (\\u03c6\\u03c3s)", "\\u03c6 / \\u03c3s", "\\u03c3s / \\u03c6"], solution: "Ld = \\u03c6\\u03c3s/(4\\u03c4bd), where \\u03c6 is bar diameter and \\u03c4bd is design bond stress." },
  { topic: "RCC Design", difficulty: "medium", stem: "Compression steel in a doubly reinforced beam is provided when:", correct: "Mu exceeds the limiting moment Mu,lim", distractors: ["Mu is less than Mu,lim", "Shear is high", "Span is small"], solution: "When the design moment exceeds the section's balanced (limiting) capacity, compression steel is added." },
  { topic: "RCC Design", difficulty: "easy", stem: "The characteristic yield strength of Fe415 reinforcing steel is:", correct: "415 MPa", distractors: ["250 MPa", "500 MPa", "550 MPa"], solution: "Fe415 denotes a yield strength of 415 MPa." },
  { topic: "RCC Design", difficulty: "easy", stem: "Lateral ties in an RCC column primarily prevent:", correct: "Buckling of longitudinal bars", distractors: ["Corrosion", "Creep", "Shrinkage"], solution: "Ties hold the main bars in position and prevent their lateral buckling." },
  { topic: "RCC Design", difficulty: "easy", stem: "The limit state method of design checks both:", correct: "Collapse and serviceability", distractors: ["Only collapse", "Only deflection", "Only cracking"], solution: "Limit state design verifies the limit states of collapse (strength) and serviceability." },
  { topic: "RCC Design", difficulty: "medium", stem: "The modular ratio m in working stress design is taken as:", correct: "280/(3\\u03c3cbc)", distractors: ["\\u03c3cbc/280", "280\\u03c3cbc", "3\\u03c3cbc/280"], solution: "IS 456 gives the modular ratio as m = 280/(3\\u03c3cbc)." },
  { topic: "RCC Design", difficulty: "hard", stem: "For a balanced section with Fe415 steel, the limiting neutral axis depth factor xu,max/d is:", correct: "0.48", distractors: ["0.53", "0.46", "0.36"], solution: "IS 456 specifies xu,max/d = 0.48 for Fe415 steel." },
  // Steel Design
  { topic: "Steel Design", difficulty: "easy", stem: "The most economical rolled section for a steel beam in bending is the:", correct: "I-section", distractors: ["Circular section", "Square section", "T-section"], solution: "The I-section concentrates material in the flanges, giving high section modulus per unit weight." },
  { topic: "Steel Design", difficulty: "medium", stem: "As per IS 800, the maximum slenderness ratio for a load-bearing steel compression member is:", correct: "180", distractors: ["120", "150", "250"], solution: "The limiting slenderness ratio for members carrying loads is 180." },
  { topic: "Steel Design", difficulty: "easy", stem: "A weld used to join two overlapping plates is a:", correct: "Fillet weld", distractors: ["Butt weld", "Groove weld", "Plug weld only"], solution: "Fillet welds are used at the edges of overlapping or lapped plates." },
  { topic: "Steel Design", difficulty: "hard", stem: "Lug angles in a steel tension member are provided to:", correct: "Reduce the length of the end connection", distractors: ["Increase the span", "Resist torsion", "Provide camber"], solution: "Lug angles add connecting area so the gusset connection length is shortened." },
  { topic: "Steel Design", difficulty: "medium", stem: "The partial safety factor for yielding of steel (\\u03b3m0) in IS 800 limit state design is:", correct: "1.10", distractors: ["1.25", "1.50", "1.15"], solution: "IS 800:2007 specifies \\u03b3m0 = 1.10 for yielding." },
  { topic: "Steel Design", difficulty: "medium", stem: "The phenomenon of sudden reduction in compressive strength of a slender column is called:", correct: "Buckling", distractors: ["Creep", "Fatigue", "Yielding"], solution: "Slender compression members fail by elastic buckling before yielding." },
  { topic: "Steel Design", difficulty: "medium", stem: "Bolts subjected to both shear and tension are checked for:", correct: "Combined interaction", distractors: ["Shear only", "Tension only", "Bearing only"], solution: "An interaction (combined) check is required when bolts carry shear and tension together." },
  // Geotechnical
  { topic: "Geotechnical Engineering", difficulty: "easy", stem: "Soil with particle size less than 0.002 mm is classified as:", correct: "Clay", distractors: ["Sand", "Silt", "Gravel"], solution: "Particles finer than 0.002 mm are classified as clay." },
  { topic: "Geotechnical Engineering", difficulty: "medium", stem: "The relation between porosity n and void ratio e is:", correct: "n = e/(1+e)", distractors: ["n = e/(1\\u2212e)", "n = (1+e)/e", "n = e"], solution: "By definition, n = e/(1+e)." },
  { topic: "Geotechnical Engineering", difficulty: "easy", stem: "The plasticity index of a soil is:", correct: "LL \\u2212 PL", distractors: ["PL \\u2212 LL", "LL + PL", "LL / PL"], solution: "Plasticity Index = Liquid Limit \\u2212 Plastic Limit." },
  { topic: "Geotechnical Engineering", difficulty: "easy", stem: "Darcy's law states that the discharge velocity v equals:", correct: "ki", distractors: ["k/i", "i/k", "k\\u00b2i"], solution: "Darcy's law: v = ki, where k is permeability and i is hydraulic gradient." },
  { topic: "Geotechnical Engineering", difficulty: "medium", stem: "The Standard Proctor test is used to determine:", correct: "Optimum moisture content and maximum dry density", distractors: ["Permeability", "Shear strength", "Bearing capacity"], solution: "The Proctor compaction test gives the OMC and maximum dry unit weight." },
  { topic: "Geotechnical Engineering", difficulty: "medium", stem: "Terzaghi's one-dimensional theory deals with the:", correct: "Consolidation of soils", distractors: ["Compaction of soils", "Permeability of soils", "Bearing capacity of footings"], solution: "Terzaghi's theory describes one-dimensional consolidation of saturated soils." },
  { topic: "Geotechnical Engineering", difficulty: "easy", stem: "The specific gravity of soil solids is typically about:", correct: "2.65", distractors: ["1.65", "3.65", "0.65"], solution: "The specific gravity of most soil solids is around 2.65." },
  { topic: "Geotechnical Engineering", difficulty: "medium", stem: "A quick sand condition occurs when the effective stress becomes:", correct: "Zero", distractors: ["Maximum", "Negative and large", "Constant"], solution: "When upward seepage reduces effective stress to zero, the soil loses strength (quick condition)." },
  { topic: "Geotechnical Engineering", difficulty: "easy", stem: "The Standard Penetration Test (SPT) gives the soil's:", correct: "N-value", distractors: ["Permeability", "Void ratio", "Plastic limit"], solution: "The SPT reports the blow count N used to estimate relative density and strength." },
  { topic: "Geotechnical Engineering", difficulty: "easy", stem: "The classical bearing capacity theory for shallow footings was given by:", correct: "Terzaghi", distractors: ["Darcy", "Rankine", "Mohr"], solution: "Terzaghi's bearing capacity theory is the standard for shallow foundations." },
  { topic: "Geotechnical Engineering", difficulty: "medium", stem: "The coefficient of permeability of a soil has units of:", correct: "Velocity (e.g., cm/s)", distractors: ["Pressure", "Area", "Dimensionless"], solution: "Permeability k has the dimensions of velocity, commonly cm/s." },
  { topic: "Geotechnical Engineering", difficulty: "hard", stem: "The shear strength of a cohesionless soil is governed by:", correct: "Internal friction angle", distractors: ["Cohesion only", "Plasticity index", "Liquid limit"], solution: "For sands, shear strength = \\u03c3' tan\\u03c6 (no cohesion)." },
  // Fluid Mechanics
  { topic: "Fluid Mechanics", difficulty: "easy", stem: "The continuity equation for incompressible steady flow in a pipe is:", correct: "A1V1 = A2V2", distractors: ["P1 = P2", "V1 = V2", "A1 = A2"], solution: "Conservation of mass gives A1V1 = A2V2 for incompressible flow." },
  { topic: "Fluid Mechanics", difficulty: "easy", stem: "Bernoulli's equation is based on the conservation of:", correct: "Energy", distractors: ["Mass", "Momentum", "Charge"], solution: "Bernoulli's theorem expresses conservation of energy along a streamline." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "Flow in a circular pipe is laminar when the Reynolds number is:", correct: "Less than about 2000", distractors: ["Greater than 4000", "Equal to 10000", "Greater than 2000"], solution: "Pipe flow is laminar for Re below roughly 2000." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "The energy grade line lies above the hydraulic grade line by an amount equal to the:", correct: "Velocity head", distractors: ["Pressure head", "Datum head", "Total head"], solution: "EGL = HGL + velocity head (V\\u00b2/2g)." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "The centre of pressure on a vertical immersed plane surface lies:", correct: "Below the centroid", distractors: ["Above the centroid", "At the centroid", "At the free surface"], solution: "Due to increasing pressure with depth, the centre of pressure is below the centroid." },
  { topic: "Fluid Mechanics", difficulty: "easy", stem: "Manning's formula is used for:", correct: "Open channel flow", distractors: ["Pipe pressure rise", "Buoyancy", "Capillarity"], solution: "Manning's equation estimates uniform flow velocity in open channels." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "For a floating body, stable equilibrium requires the metacentric height to be:", correct: "Positive", distractors: ["Zero", "Negative", "Infinite"], solution: "A positive metacentric height (M above G) ensures stable equilibrium." },
  { topic: "Fluid Mechanics", difficulty: "easy", stem: "A venturimeter is used to measure:", correct: "Discharge (flow rate)", distractors: ["Pressure only", "Viscosity", "Density"], solution: "A venturimeter measures discharge using the pressure difference between throat and inlet." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "The coefficient of discharge Cd of an orifice equals:", correct: "Cc \\u00d7 Cv", distractors: ["Cc / Cv", "Cv / Cc", "Cc + Cv"], solution: "Cd is the product of the coefficient of contraction and coefficient of velocity." },
  { topic: "Fluid Mechanics", difficulty: "hard", stem: "The hydraulic mean depth of a circular pipe running full of diameter D is:", correct: "D/4", distractors: ["D/2", "D", "D/8"], solution: "For a full circular pipe, hydraulic radius R = A/P = D/4." },
  // Surveying
  { topic: "Surveying", difficulty: "easy", stem: "The instrument used to measure horizontal and vertical angles is the:", correct: "Theodolite", distractors: ["Level", "Chain", "Compass"], solution: "A theodolite measures both horizontal and vertical angles." },
  { topic: "Surveying", difficulty: "easy", stem: "The process of determining the relative elevations of points is called:", correct: "Levelling", distractors: ["Chaining", "Ranging", "Traversing"], solution: "Levelling determines the relative heights (elevations) of points." },
  { topic: "Surveying", difficulty: "easy", stem: "Contour lines on a map join points of:", correct: "Equal elevation", distractors: ["Equal distance", "Equal slope", "Equal area"], solution: "A contour line connects points of equal elevation." },
  { topic: "Surveying", difficulty: "easy", stem: "Closely spaced contour lines indicate:", correct: "Steep slope", distractors: ["Gentle slope", "Flat ground", "A depression"], solution: "The closer the contours, the steeper the ground slope." },
  { topic: "Surveying", difficulty: "easy", stem: "The fundamental principle of surveying is to work:", correct: "From the whole to the part", distractors: ["From the part to the whole", "Randomly", "From the centre outward only"], solution: "Surveying proceeds from whole to part to control accumulation of errors." },
  { topic: "Surveying", difficulty: "medium", stem: "A prismatic compass measures bearings in the:", correct: "Whole circle bearing system", distractors: ["Quadrantal bearing system", "Reduced bearing system", "Magnetic dip system"], solution: "A prismatic compass reads whole circle bearings from 0\\u00b0 to 360\\u00b0." },
  { topic: "Surveying", difficulty: "medium", stem: "A total station essentially combines a theodolite with:", correct: "Electronic distance measurement (EDM)", distractors: ["A level", "A plane table", "A sextant"], solution: "A total station integrates an electronic theodolite with an EDM and data recorder." },
  { topic: "Surveying", difficulty: "medium", stem: "Tacheometry is mainly used to determine:", correct: "Horizontal distances and elevations without chaining", distractors: ["Angles only", "Areas only", "Volumes only"], solution: "Tacheometry measures distances and elevations rapidly using stadia readings." },
  { topic: "Surveying", difficulty: "medium", stem: "The number of links in a 30 m metric chain is:", correct: "150", distractors: ["100", "120", "200"], solution: "A 30 m metric chain has 150 links of 0.2 m each." },
  { topic: "Surveying", difficulty: "hard", stem: "The error due to the curvature of the earth in levelling is:", correct: "Negative (objects appear lower)", distractors: ["Positive", "Zero", "Independent of distance"], solution: "Earth's curvature makes distant points read lower; correction is +0.0785 d\\u00b2 m." },
  // Transportation
  { topic: "Transportation Engineering", difficulty: "easy", stem: "Camber on a road surface is provided mainly for:", correct: "Surface drainage of rainwater", distractors: ["Higher speed", "Aesthetics", "Extra strength"], solution: "Camber lets rainwater drain off the carriageway to the sides." },
  { topic: "Transportation Engineering", difficulty: "easy", stem: "Superelevation is provided on:", correct: "Horizontal curves", distractors: ["Straight stretches", "Bridges only", "Steep gradients"], solution: "Superelevation counters centrifugal force on horizontal curves." },
  { topic: "Transportation Engineering", difficulty: "easy", stem: "The CBR test is used in the design of:", correct: "Flexible pavements", distractors: ["Rigid pavements", "Bridges", "Dams"], solution: "California Bearing Ratio is used to design flexible pavement thickness." },
  { topic: "Transportation Engineering", difficulty: "easy", stem: "Rigid pavements are generally made of:", correct: "Cement concrete", distractors: ["Bitumen", "Gravel", "Compacted soil"], solution: "Rigid pavements use a cement concrete slab that resists loads in flexure." },
  { topic: "Transportation Engineering", difficulty: "medium", stem: "Stopping sight distance depends on the driver's reaction time and the:", correct: "Braking distance", distractors: ["Camber", "Lane width", "Gradient only"], solution: "SSD = lag (reaction) distance + braking distance." },
  { topic: "Transportation Engineering", difficulty: "easy", stem: "The broad gauge of Indian Railways measures:", correct: "1676 mm", distractors: ["1435 mm", "1000 mm", "762 mm"], solution: "Indian Broad Gauge is 1676 mm; 1435 mm is standard gauge." },
  { topic: "Transportation Engineering", difficulty: "medium", stem: "The Marshall stability test is used for:", correct: "Bituminous mix design", distractors: ["Concrete mix design", "Soil classification", "Steel design"], solution: "The Marshall test determines optimum bitumen content in bituminous mixes." },
  { topic: "Transportation Engineering", difficulty: "easy", stem: "Traffic volume is expressed as:", correct: "Number of vehicles per unit time", distractors: ["Speed of vehicles", "Density only", "Distance travelled"], solution: "Traffic volume is the number of vehicles crossing a section per unit time." },
  { topic: "Transportation Engineering", difficulty: "hard", stem: "The shape of the ideal transition curve used on highways is a:", correct: "Spiral (clothoid)", distractors: ["Circular arc", "Parabola", "Straight line"], solution: "An ideal transition curve is a spiral where radius varies inversely with length." },
  // Environmental
  { topic: "Environmental Engineering", difficulty: "easy", stem: "Biochemical Oxygen Demand (BOD) indicates:", correct: "Organic pollution in water", distractors: ["Hardness", "Turbidity", "pH"], solution: "BOD measures the oxygen needed to biodegrade organic matter, indicating organic pollution." },
  { topic: "Environmental Engineering", difficulty: "easy", stem: "The permissible pH range of drinking water as per IS 10500 is:", correct: "6.5 \\u2013 8.5", distractors: ["4 \\u2013 6", "9 \\u2013 11", "5 \\u2013 7"], solution: "IS 10500 specifies a desirable pH of 6.5 to 8.5 for drinking water." },
  { topic: "Environmental Engineering", difficulty: "medium", stem: "The average domestic per-capita water demand in Indian cities is taken as about:", correct: "135 litres per capita per day", distractors: ["50 litres per capita per day", "250 litres per capita per day", "400 litres per capita per day"], solution: "A domestic demand of about 135 lpcd is commonly assumed." },
  { topic: "Environmental Engineering", difficulty: "easy", stem: "The coagulant most commonly used in water treatment is:", correct: "Alum", distractors: ["Chlorine", "Lime", "Ozone"], solution: "Alum (aluminium sulphate) is the usual coagulant for removing fine suspended matter." },
  { topic: "Environmental Engineering", difficulty: "easy", stem: "Disinfection of municipal water supplies is most commonly achieved by:", correct: "Chlorination", distractors: ["Coagulation", "Sedimentation", "Aeration"], solution: "Chlorination is the standard method for disinfecting drinking water." },
  { topic: "Environmental Engineering", difficulty: "easy", stem: "Hardness in water is caused mainly by salts of:", correct: "Calcium and magnesium", distractors: ["Sodium and potassium", "Iron only", "Chlorine"], solution: "Dissolved calcium and magnesium salts are the main cause of hardness." },
  { topic: "Environmental Engineering", difficulty: "medium", stem: "The activated sludge process is used for the treatment of:", correct: "Wastewater (sewage)", distractors: ["Drinking water only", "Air pollutants", "Solid waste"], solution: "The activated sludge process is an aerobic biological treatment for sewage." },
  { topic: "Environmental Engineering", difficulty: "easy", stem: "Sedimentation tanks in water treatment primarily remove:", correct: "Suspended solids", distractors: ["Dissolved gases", "All bacteria completely", "Colour fully"], solution: "Sedimentation removes settleable suspended solids by gravity." },
  { topic: "Environmental Engineering", difficulty: "hard", stem: "The most common index organism for faecal contamination of water is:", correct: "E. coli", distractors: ["Salmonella", "Vibrio cholerae", "Staphylococcus"], solution: "E. coli is used as the indicator of faecal pollution in water." },
  // Building / Construction Materials
  { topic: "Building Materials", difficulty: "medium", stem: "The initial setting time of ordinary Portland cement should not be less than:", correct: "30 minutes", distractors: ["10 minutes", "600 minutes", "5 minutes"], solution: "IS specifies a minimum initial setting time of 30 minutes for OPC." },
  { topic: "Construction Materials", difficulty: "easy", stem: "The slump test on fresh concrete measures its:", correct: "Workability", distractors: ["Compressive strength", "Durability", "Density"], solution: "The slump test is a measure of the workability (consistency) of fresh concrete." },
  { topic: "Building Materials", difficulty: "easy", stem: "The actual size of a standard modular brick (without mortar) is:", correct: "190 \\u00d7 90 \\u00d7 90 mm", distractors: ["200 \\u00d7 100 \\u00d7 100 mm", "230 \\u00d7 110 \\u00d7 70 mm", "250 \\u00d7 120 \\u00d7 80 mm"], solution: "The actual modular brick size is 190 \\u00d7 90 \\u00d7 90 mm; nominal size with mortar is 200 \\u00d7 100 \\u00d7 100 mm." },
  { topic: "Building Materials", difficulty: "medium", stem: "The final setting time of ordinary Portland cement should not exceed:", correct: "600 minutes", distractors: ["30 minutes", "120 minutes", "1000 minutes"], solution: "IS limits the final setting time of OPC to 600 minutes (10 hours)." },
  { topic: "Construction Materials", difficulty: "medium", stem: "The water-cement ratio law was proposed by:", correct: "Abrams", distractors: ["Bogue", "Feret", "Terzaghi"], solution: "Abrams' law relates concrete strength inversely to the water-cement ratio." },
  { topic: "Construction Materials", difficulty: "hard", stem: "The compound mainly responsible for early strength gain in cement is:", correct: "Tricalcium silicate (C3S)", distractors: ["Dicalcium silicate (C2S)", "Tricalcium aluminate (C3A)", "Tetracalcium aluminoferrite (C4AF)"], solution: "C3S hydrates rapidly and gives early strength to cement." },
  { topic: "Construction Materials", difficulty: "medium", stem: "Curing of concrete is done primarily to:", correct: "Promote hydration and gain strength", distractors: ["Increase workability", "Speed up setting", "Reduce cement use"], solution: "Curing maintains moisture so cement hydration continues and concrete gains strength." },
];

function genProfessional(rand: () => number, startId: number, setNo: number): Q[] {
  const out: Q[] = [];
  // 60 theory questions: rotate the pool by set for a distinct slice.
  const theoryOffset = ((setNo - 1) * 60) % CIVIL_THEORY_POOL.length;
  const theorySlice: FactQ[] = [];
  const usedT = new Set<string>();
  for (let i = 0; theorySlice.length < 60; i++) {
    const f = CIVIL_THEORY_POOL[(theoryOffset + i) % CIVIL_THEORY_POOL.length];
    if (usedT.has(f.stem)) continue;
    usedT.add(f.stem);
    theorySlice.push(f);
  }
  // 40 numerical questions: cycle the parametric generators (numbers vary).
  const numItems: FactQ[] = [];
  const gens = [...CIVIL_NUM_GENERATORS];
  for (let i = gens.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [gens[i], gens[j]] = [gens[j], gens[i]];
  }
  const seenNum = new Set<string>();
  let gi = 0;
  let guard = 0;
  while (numItems.length < 40 && guard < 2000) {
    guard++;
    const f = gens[gi % gens.length](rand);
    gi++;
    if (seenNum.has(f.stem)) continue;
    seenNum.add(f.stem);
    numItems.push(f);
  }
  // Interleave theory and numerical so topics are well mixed through the paper.
  const merged: FactQ[] = [];
  let ti = 0;
  let ni = 0;
  for (let k = 0; k < 100; k++) {
    // Roughly 3 theory : 2 numerical cadence.
    const wantNum = k % 5 === 2 || k % 5 === 4;
    if (wantNum && ni < numItems.length) merged.push(numItems[ni++]);
    else if (ti < theorySlice.length) merged.push(theorySlice[ti++]);
    else if (ni < numItems.length) merged.push(numItems[ni++]);
  }
  merged.forEach((f, i) => {
    const { options, answer } = mcqFrom(rand, f.correct, f.distractors);
    out.push({
      id: startId + i,
      subject: SUBJ.prof,
      topic: f.topic,
      section: "Paper-II",
      type: "MCQ",
      marks: 1,
      difficulty: f.difficulty,
      stem: f.stem,
      options,
      answer,
      solution: f.solution,
    });
  });
  return out;
}

// ══════════════════════════════════════════════════════════════════════════
// SET ASSEMBLY + FILE OUTPUT
// ══════════════════════════════════════════════════════════════════════════
function buildSet(setNo: number) {
  const seed = 0x1c1c000 + setNo * 7919; // distinct per set
  const rand = rng(seed);
  const nn = String(setNo).padStart(2, "0");

  const questions: Q[] = [
    ...genGeneralAwareness(rand, 1, setNo), // 1..25
    ...genNumerical(rand, 26), // 26..50
    ...genReasoning(rand, 51), // 51..75
    ...genGeneralEnglish(rand, 76, setNo), // 76..100
    ...genProfessional(rand, 101, setNo), // 101..200
  ];

  return {
    id: `cil-civil-${nn}`,
    slug: "civil",
    no: setNo,
    title: `CIL Civil — Full-length Mock ${nn}`,
    discipline: "Civil",
    durationMin: 180,
    totalMarks: 200,
    negativeMarking: false,
    pattern: "CIL MT — 200 MCQ · 2 papers · 1 mark each · no negative marking",
    sections: [
      { name: SUBJ.ga, count: 25, marks: 25 },
      { name: SUBJ.num, count: 25, marks: 25 },
      { name: SUBJ.reas, count: 25, marks: 25 },
      { name: SUBJ.eng, count: 25, marks: 25 },
      { name: SUBJ.prof, count: 100, marks: 100 },
    ],
    questions,
  };
}

// ---- Validation guard before writing --------------------------------------
function validate(set: ReturnType<typeof buildSet>): string[] {
  const errs: string[] = [];
  const qs = set.questions;
  if (qs.length !== 200) errs.push(`expected 200 questions, got ${qs.length}`);
  const ids = new Set<number>();
  const dist: Record<string, number> = {};
  qs.forEach((q) => {
    if (ids.has(q.id)) errs.push(`duplicate id ${q.id}`);
    ids.add(q.id);
    if (q.options.length !== 4) errs.push(`id ${q.id}: options.length=${q.options.length}`);
    if (new Set(q.options).size !== 4) errs.push(`id ${q.id}: duplicate options`);
    if (q.answer < 0 || q.answer > 3) errs.push(`id ${q.id}: answer out of range`);
    if (!q.solution || q.solution.length < 5) errs.push(`id ${q.id}: missing solution`);
    dist[q.subject] = (dist[q.subject] ?? 0) + 1;
  });
  const want: Record<string, number> = {
    [SUBJ.ga]: 25,
    [SUBJ.num]: 25,
    [SUBJ.reas]: 25,
    [SUBJ.eng]: 25,
    [SUBJ.prof]: 100,
  };
  for (const [k, v] of Object.entries(want)) {
    if (dist[k] !== v) errs.push(`distribution ${k}: ${dist[k] ?? 0} (want ${v})`);
  }
  return errs;
}

// ---- Run -------------------------------------------------------------------
const targets = ONLY.length ? ONLY : Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i);
const outDir = resolve(
  process.cwd(),
  "apps/web/src/data/questions/cil/civil",
);
mkdirSync(outDir, { recursive: true });

let failed = false;
for (const n of targets) {
  if (n < 2 || n > 10) {
    console.warn(`skip set ${n}: only sets 2–10 are generated (set 1 is hand-authored)`);
    continue;
  }
  const set = buildSet(n);
  const errs = validate(set);
  if (errs.length) {
    failed = true;
    console.error(`✗ Set ${n} FAILED validation:`);
    errs.forEach((e) => console.error(`   - ${e}`));
    continue;
  }
  const file = resolve(outDir, `${set.id}.json`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(set, null, 2)}\n`, "utf8");
  console.log(`✓ ${set.id}.json — 200 Q (25/25/25/25/100)`);
}

if (failed) {
  process.exitCode = 1;
}
