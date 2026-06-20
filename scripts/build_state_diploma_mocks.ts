/**
 * CrackGate — STATE & DIPLOMA mining mock generator.
 *
 * Builds full-length, syllabus-mapped mock tests for two exam families that are
 * NOT GATE-patterned. Every numeric answer is computed in JS with a seeded RNG
 * (correct-by-construction), so the mocks are deterministic and re-runnable.
 *
 *   ── STATE · RPSC Assistant Mining Engineer (Rajasthan PSC) ──
 *     150 MCQ · 150 marks (1 mark each) · 150 minutes · online CBT
 *     Negative marking: -1/3 per wrong MCQ. Single paper (Mining Engineering).
 *     Source: testbook.com/rpsc-assistant-mining-engineer/syllabus-exam-pattern
 *             (official RPSC syllabus PDF); rpsc.rajasthan.gov.in PYQ archive.
 *
 *   ── DIPLOMA · Coalfield Mining Sirdar / Junior Overman (MCL CBT) ──
 *     100 MCQ · 100 marks (1 mark each) · 120 minutes · online CBT, bilingual
 *     Section A: General Awareness & Aptitude (20 Q)
 *     Section B: Technical — Mining (80 Q)
 *     NO negative marking.
 *     Source: mineportal.in/blog/mcl-2022-exam-pattern/1 (20+80 split, no -ve).
 *     Technical content mapped to the DGMS Mining Sirdar Certificate of
 *     Competency syllabus under Coal Mines Regulations, 2017
 *     (dgms.gov.in/UserView/index?mid=1255; DGMS Legis. Circular 01 of 2021).
 *
 * Usage:
 *   npx tsx scripts/build_state_diploma_mocks.ts          # regen all four
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// ----------------------------------------------------------------- RNG
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
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

// ----------------------------------------------------------------- Types
type Fig = Record<string, unknown>;
interface Cand {
  cid: string;            // stable candidate id (for dedupe)
  bucket: "ga" | "mining";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  stem: string;
  options: string[];      // option 0 is ALWAYS the correct one before shuffle
  solution: string;
  figure?: Fig;
}

// A concept MCQ where the first option is correct.
function C(
  cid: string,
  bucket: Cand["bucket"],
  topic: string,
  difficulty: Cand["difficulty"],
  stem: string,
  correct: string,
  wrong: [string, string, string],
  solution: string,
  figure?: Fig,
): Cand {
  return { cid, bucket, topic, difficulty, stem, options: [correct, ...wrong], solution, figure };
}

const r2 = (x: number) => Math.round(x * 100) / 100;
const r1 = (x: number) => Math.round(x * 10) / 10;

// Build a numeric MCQ: correct value + 3 deterministic distractors.
function numMCQ(
  cid: string,
  bucket: Cand["bucket"],
  topic: string,
  difficulty: Cand["difficulty"],
  stem: string,
  correct: number,
  distractors: number[],
  unit: string,
  solution: string,
  figure?: Fig,
): Cand {
  const fmt = (v: number) => `${Number.isInteger(v) ? v : r2(v)}${unit ? " " + unit : ""}`;
  const seen = new Set<string>([fmt(correct)]);
  const wrong: string[] = [];
  for (const d of distractors) {
    const s = fmt(d);
    if (!seen.has(s)) { seen.add(s); wrong.push(s); }
    if (wrong.length === 3) break;
  }
  let bump = 1;
  while (wrong.length < 3) {
    const v = r2(correct * (1 + 0.17 * bump) + bump);
    const s = fmt(v);
    if (!seen.has(s)) { seen.add(s); wrong.push(s); }
    bump++;
  }
  return { cid, bucket, topic, difficulty, stem, options: [fmt(correct), ...wrong], solution, figure };
}

// ================================================================
// POOL A — GENERAL AWARENESS & APTITUDE (diploma Section A)
// ================================================================
const GA: Cand[] = [];

// --- numeric aptitude templates (deterministic grids) ---
(() => {
  // Averages
  const sets = [[12, 18, 24, 30, 36], [8, 16, 24, 32, 40], [15, 25, 35, 45, 55], [10, 14, 18, 22, 26]];
  sets.forEach((s, i) => {
    const avg = s.reduce((a, b) => a + b, 0) / s.length;
    GA.push(numMCQ(`ga-avg-${i}`, "ga", "Quantitative — Average", "easy",
      `The average of ${s.join(", ")} is _____.`, avg, [avg + 2, avg - 2, avg * 1.5], "",
      `**Concept.** Average = sum ÷ count.\n\n**Working.** Sum $=${s.reduce((a, b) => a + b, 0)}$, count $=${s.length}$, so average $=${avg}$.\n\n**Answer.** $${avg}$.`));
  });
  // Percentage
  const pct = [[200, 15], [350, 20], [80, 25], [640, 12.5]];
  pct.forEach(([n, p], i) => {
    const v = (n * p) / 100;
    GA.push(numMCQ(`ga-pct-${i}`, "ga", "Quantitative — Percentage", "easy",
      `What is ${p}% of ${n}?`, v, [v * 2, v / 2, v + p], "",
      `**Concept.** $x\\%$ of $N=\\dfrac{x}{100}\\times N$.\n\n**Working.** $\\dfrac{${p}}{100}\\times ${n}=${v}$.\n\n**Answer.** $${v}$.`));
  });
  // Speed-distance-time
  const sdt = [[60, 2.5], [45, 3], [72, 1.5], [50, 4]];
  sdt.forEach(([sp, t], i) => {
    const d = sp * t;
    GA.push(numMCQ(`ga-sdt-${i}`, "ga", "Quantitative — Speed & Distance", "easy",
      `A vehicle travels at ${sp} km/h for ${t} hours. Distance covered is _____.`, d, [d / 2, d + sp, sp + t], "km",
      `**Concept.** Distance $=$ speed $\\times$ time.\n\n**Working.** $${sp}\\times ${t}=${d}$ km.\n\n**Answer.** $${d}$ km.`));
  });
  // Ratio sharing
  const rat = [[3, 2, 250], [4, 1, 300], [5, 3, 320], [7, 3, 500]];
  rat.forEach(([a, b, tot], i) => {
    const share = (tot * a) / (a + b);
    GA.push(numMCQ(`ga-rat-${i}`, "ga", "Quantitative — Ratio & Proportion", "medium",
      `A sum of ₹${tot} is divided between two persons in the ratio ${a}:${b}. The larger share is _____.`,
      Math.max(share, tot - share), [Math.min(share, tot - share), tot / 2, tot - share - a], "₹",
      `**Concept.** Share $=\\dfrac{\\text{part}}{\\text{sum of parts}}\\times\\text{total}$.\n\n**Working.** Parts $=${a}+${b}=${a + b}$; larger share $=\\dfrac{${Math.max(a, b)}}{${a + b}}\\times ${tot}=${Math.max(share, tot - share)}$.\n\n**Answer.** ₹$${Math.max(share, tot - share)}$.`));
  });
  // Simple interest
  const si = [[5000, 8, 2], [10000, 6, 3], [4000, 10, 1.5], [12000, 5, 2]];
  si.forEach(([P, R, T], i) => {
    const I = (P * R * T) / 100;
    GA.push(numMCQ(`ga-si-${i}`, "ga", "Quantitative — Simple Interest", "medium",
      `Simple interest on ₹${P} at ${R}% per annum for ${T} years is _____.`, I, [I * 2, I / 2, I + R], "₹",
      `**Concept.** $SI=\\dfrac{P\\,R\\,T}{100}$.\n\n**Working.** $\\dfrac{${P}\\times ${R}\\times ${T}}{100}=${I}$.\n\n**Answer.** ₹$${I}$.`));
  });
})();

// --- static GA concept MCQs ---
GA.push(
  C("ga-cap-cg", "ga", "General Awareness — States", "easy",
    "The capital of Chhattisgarh is:", "Raipur", ["Bilaspur", "Bhopal", "Ranchi"],
    "**Answer.** Raipur is the capital of Chhattisgarh."),
  C("ga-cap-rj", "ga", "General Awareness — States", "easy",
    "The capital of Rajasthan is:", "Jaipur", ["Jodhpur", "Udaipur", "Ajmer"],
    "**Answer.** Jaipur is the capital of Rajasthan."),
  C("ga-coal-state", "ga", "General Awareness — Minerals", "medium",
    "Which Indian state has the largest coal reserves?", "Jharkhand", ["Rajasthan", "Gujarat", "Kerala"],
    "**Answer.** Jharkhand holds the largest coal reserves in India, followed by Odisha and Chhattisgarh."),
  C("ga-syn-curtail", "ga", "Verbal — Synonyms", "easy",
    "Choose the word most similar in meaning to 'CURTAIL':", "Reduce", ["Extend", "Permit", "Repair"],
    "**Answer.** 'Curtail' means to cut short or reduce."),
  C("ga-ant-ascend", "ga", "Verbal — Antonyms", "easy",
    "Choose the word OPPOSITE in meaning to 'ASCEND':", "Descend", ["Climb", "Rise", "Mount"],
    "**Answer.** The opposite of 'ascend' (go up) is 'descend' (go down)."),
  C("ga-ministry-mines", "ga", "General Awareness — Governance", "medium",
    "DGMS (Directorate General of Mines Safety) functions under which Union Ministry?",
    "Ministry of Labour and Employment", ["Ministry of Mines", "Ministry of Coal", "Ministry of Environment"],
    "**Answer.** DGMS is under the Ministry of Labour and Employment, Government of India."),
  C("ga-series-2", "ga", "Reasoning — Number Series", "medium",
    "Find the next term: 2, 6, 12, 20, 30, ___", "42", ["40", "36", "44"],
    "**Concept.** Differences are 4, 6, 8, 10, … (increasing by 2).\n\n**Working.** Next difference $=12$, so $30+12=42$.\n\n**Answer.** 42."),
  C("ga-odd-one", "ga", "Reasoning — Classification", "easy",
    "Find the odd one out: Coal, Lignite, Anthracite, Bauxite", "Bauxite", ["Coal", "Lignite", "Anthracite"],
    "**Answer.** Bauxite is an aluminium ore; the rest are ranks/types of coal."),
  C("ga-clock", "ga", "Reasoning — Clocks", "medium",
    "The angle between the hour and minute hands of a clock at 3:00 is:", "90°", ["60°", "120°", "45°"],
    "**Concept.** Each hour mark $=30°$.\n\n**Working.** At 3:00 the hands are 3 hour-marks apart $=3\\times30°=90°$.\n\n**Answer.** 90°."),
  C("ga-direction", "ga", "Reasoning — Directions", "medium",
    "A man walks 3 km North, then 4 km East. How far is he from the start?", "5 km", ["7 km", "1 km", "12 km"],
    "**Concept.** Resultant $=\\sqrt{3^2+4^2}$.\n\n**Working.** $\\sqrt{9+16}=\\sqrt{25}=5$ km.\n\n**Answer.** 5 km."),
  C("ga-largest-coal-psu", "ga", "General Awareness — PSU", "easy",
    "Coal India Limited (CIL) is headquartered in:", "Kolkata", ["New Delhi", "Dhanbad", "Nagpur"],
    "**Answer.** CIL's registered office is in Kolkata, West Bengal."),
);

// ================================================================
// POOL B — MINING ENGINEERING + LEGISLATION + SAFETY
// (used by RPSC technical and by diploma Section B)
// ================================================================
const MINING: Cand[] = [];

// ---------------- numeric/applied templates ----------------
(() => {
  // 1) Ventilation: Q = v * A  (with ventilation figure on some)
  const v = [1.2, 1.5, 1.8, 2, 2.5, 3, 3.5, 4], A = [4, 6, 8, 10, 12, 15, 18, 20];
  let k = 0;
  for (const vv of v) for (const aa of A) {
    k++;
    const Q = vv * aa;
    const fig = (k % 3 === 0)
      ? {
          kind: "ventilation",
          nodes: [{ id: "A", x: 30, y: 60 }, { id: "B", x: 150, y: 60 }, { id: "C", x: 270, y: 60 }],
          branches: [{ from: "A", to: "B", q: Q }, { from: "B", to: "C", q: Q }],
          caption: "Single airway — measure station",
        }
      : undefined;
    MINING.push(numMCQ(`mn-vent-${k}`, "mining", "Mine Ventilation — Air Quantity", "easy",
      `Air flows through a roadway of cross-sectional area ${aa} m² at a mean velocity of ${vv} m/s. The air quantity is _____.`,
      Q, [Q / 2, Q * 2, vv + aa], "m³/s",
      `**Concept.** Quantity $Q=v\\times A$.\n\n**Working.** $Q=${vv}\\times ${aa}=${r2(Q)}$ m³/s.\n\n**Answer.** $${r2(Q)}$ m³/s.`, fig));
  }
  // 2) Mine resistance square law: P = R Q^2
  const R = [0.1, 0.2, 0.4, 0.5, 0.8, 1, 1.5, 2], Qs = [10, 15, 20, 25, 30, 40];
  let m = 0;
  for (const rr of R) for (const qq of Qs) {
    m++;
    const P = rr * qq * qq;
    MINING.push(numMCQ(`mn-res-${m}`, "mining", "Mine Ventilation — Mine Resistance", "medium",
      `A mine airway has resistance ${rr} Ns²/m⁸ (gauls) and carries ${qq} m³/s. The pressure drop (square law) is _____.`,
      P, [rr * qq, P / 2, P * 2], "Pa",
      `**Concept.** $P=R\\,Q^2$ (Atkinson square law).\n\n**Working.** $P=${rr}\\times ${qq}^2=${r2(P)}$ Pa.\n\n**Answer.** $${r2(P)}$ Pa.`));
  }
  // 3) Methane % in general body: q/Q*100
  const qm = [0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7], Qm = [15, 20, 25, 30, 40, 50];
  let g = 0;
  for (const a of qm) for (const b of Qm) {
    g++;
    const pc = (a / b) * 100;
    MINING.push(numMCQ(`mn-ch4-${g}`, "mining", "Mine Gases — Methane Dilution", "medium",
      `Methane is emitted at ${a} m³/min into a roadway carrying ${b} m³/min of air. The general-body CH₄ concentration is _____.`,
      pc, [pc * 2, pc / 2, a * b], "%",
      `**Concept.** % gas $=\\dfrac{\\text{gas flow}}{\\text{air flow}}\\times100$.\n\n**Working.** $\\dfrac{${a}}{${b}}\\times100=${r2(pc)}\\%$.\n\n**Answer.** $${r2(pc)}\\%$.`));
  }
  // 4) Powder factor (t/kg) over a bench — bench figure on some
  const bench = [[5, 4, 8, 2.6, 0.45], [6, 5, 10, 2.5, 0.5], [4, 3, 6, 2.7, 0.4], [5, 5, 9, 2.6, 0.5], [7, 6, 12, 2.5, 0.55], [6, 4, 9, 2.65, 0.42], [8, 7, 14, 2.6, 0.6], [5, 4, 10, 2.7, 0.48], [4, 4, 7, 2.55, 0.4], [7, 5, 11, 2.6, 0.5], [6, 6, 12, 2.7, 0.52], [5, 3, 8, 2.5, 0.45]];
  bench.forEach((b, i) => {
    const [B, S, H, rho, q] = b; // burden, spacing, bench height, density, explosive kg/m3 proxy
    const vol = B * S * H;
    const tonnes = vol * rho;
    const expl = vol * q;
    const pf = tonnes / expl;
    const fig = (i % 2 === 0)
      ? { kind: "bench", benchHeight: H, burden: B, spacing: S, holes: 3, slopeAngle: 70, caption: "Opencast bench blast block" }
      : undefined;
    MINING.push(numMCQ(`mn-pf-${i}`, "mining", "Drilling & Blasting — Powder Factor", "hard",
      `An opencast blast block has burden ${B} m, spacing ${S} m, bench height ${H} m and rock density ${rho} t/m³. If ${r2(expl)} kg of explosive is used, the powder factor (tonnes broken per kg) is _____.`,
      pf, [pf / 2, pf * 1.5, rho], "t/kg",
      `**Concept.** PF $=\\dfrac{\\text{rock broken (t)}}{\\text{explosive (kg)}}$.\n\n**Working.** Volume $=${B}\\times${S}\\times${H}=${r2(vol)}$ m³; mass $=${r2(vol)}\\times${rho}=${r2(tonnes)}$ t; PF $=\\dfrac{${r2(tonnes)}}{${r2(expl)}}=${r2(pf)}$ t/kg.\n\n**Answer.** $${r2(pf)}$ t/kg.`, fig));
  });
  // 5) Pillar strength (Obert–Duvall): S = Sp (0.778 + 0.222 w/h)
  const wh = [[6, 3], [8, 4], [10, 2.5], [5, 5], [12, 4], [9, 3], [7, 3.5], [14, 4], [6, 4], [10, 5], [8, 2], [11, 5.5]];
  wh.forEach((p, i) => {
    const [w, h] = p; const Sp = 7.0; // MPa cube strength proxy
    const S = Sp * (0.778 + 0.222 * (w / h));
    MINING.push(numMCQ(`mn-pil-${i}`, "mining", "Rock Mechanics — Pillar Strength", "hard",
      `Using the Obert–Duvall formula $S=S_p(0.778+0.222\\,w/h)$ with $S_p=${Sp}$ MPa, the strength of a pillar of width ${w} m and height ${h} m is _____.`,
      S, [Sp, Sp * (0.778 + 0.222 * (h / w)), S * 1.3], "MPa",
      `**Concept.** Obert–Duvall pillar strength uses the width-to-height ratio $w/h$.\n\n**Working.** $w/h=${r2(w / h)}$; $S=${Sp}(0.778+0.222\\times${r2(w / h)})=${r2(S)}$ MPa.\n\n**Answer.** $${r2(S)}$ MPa.`));
  });
  // 6) Tonnage from volume
  const tv = [[1000, 2.5], [2000, 2.7], [1500, 3.2], [800, 4.5], [1200, 2.8], [2500, 3.0], [600, 4.2], [1800, 2.6], [3000, 2.9], [900, 3.5], [1100, 4.0], [1600, 2.75]];
  tv.forEach((p, i) => {
    const [vol, rho] = p; const t = vol * rho;
    MINING.push(numMCQ(`mn-ton-${i}`, "mining", "Mine Economics — Tonnage", "easy",
      `An ore block of ${vol} m³ has bulk density ${rho} t/m³. Its tonnage is _____.`, t, [vol / rho, t / 2, vol + rho], "t",
      `**Concept.** Tonnage $=$ volume $\\times$ density.\n\n**Working.** $${vol}\\times${rho}=${r2(t)}$ t.\n\n**Answer.** $${r2(t)}$ t.`));
  });
  // 7) Stripping ratio
  const sr = [[450000, 90000], [600000, 150000], [320000, 80000], [500000, 100000], [720000, 120000], [840000, 140000], [360000, 90000], [550000, 110000], [480000, 120000], [630000, 90000]];
  sr.forEach((p, i) => {
    const [waste, ore] = p; const v = waste / ore;
    MINING.push(numMCQ(`mn-sr-${i}`, "mining", "Surface Mining — Stripping Ratio", "medium",
      `An opencast mine removes ${waste} m³ of overburden to win ${ore} t of ore. The stripping ratio (m³/t) is _____.`,
      v, [ore / waste, v * 2, v / 2], "m³/t",
      `**Concept.** Stripping ratio $=\\dfrac{\\text{overburden}}{\\text{ore}}$.\n\n**Working.** $\\dfrac{${waste}}{${ore}}=${r2(v)}$ m³/t.\n\n**Answer.** $${r2(v)}$ m³/t.`));
  });
  // 8) Dilution %
  const dil = [[100, 10], [200, 30], [150, 15], [240, 60], [180, 20], [300, 50], [120, 30], [400, 100], [160, 40], [250, 25]];
  dil.forEach((p, i) => {
    const [ore, waste] = p; const d = (waste / (ore + waste)) * 100;
    MINING.push(numMCQ(`mn-dil-${i}`, "mining", "Stoping — Dilution", "medium",
      `A stope yields ${ore} t of ore mixed with ${waste} t of waste. The percentage dilution is _____.`,
      d, [(waste / ore) * 100, d / 2, ore / waste], "%",
      `**Concept.** Dilution $=\\dfrac{\\text{waste}}{\\text{ore}+\\text{waste}}\\times100$.\n\n**Working.** $\\dfrac{${waste}}{${ore + waste}}\\times100=${r2(d)}\\%$.\n\n**Answer.** $${r2(d)}\\%$.`));
  });
  // 9) Pump power: P = rho g Q H / eta (kW)
  const pmp = [[0.05, 120, 0.7], [0.1, 80, 0.75], [0.08, 150, 0.8], [0.06, 100, 0.72], [0.12, 90, 0.78], [0.04, 200, 0.7], [0.09, 110, 0.76], [0.07, 130, 0.74], [0.11, 95, 0.8], [0.05, 180, 0.72]];
  pmp.forEach((p, i) => {
    const [Q, H, eta] = p; const P = (1000 * 9.81 * Q * H) / (eta * 1000);
    MINING.push(numMCQ(`mn-pump-${i}`, "mining", "Mine Drainage — Pump Power", "hard",
      `A mine pump delivers ${Q} m³/s of water against a head of ${H} m at ${Math.round(eta * 100)}% efficiency. The input power is _____.`,
      P, [P * eta, P / 2, H * Q], "kW",
      `**Concept.** $P=\\dfrac{\\rho g Q H}{\\eta}$ with $\\rho=1000$ kg/m³, $g=9.81$ m/s².\n\n**Working.** $P=\\dfrac{1000\\times9.81\\times${Q}\\times${H}}{${eta}}\\div1000=${r2(P)}$ kW.\n\n**Answer.** $${r2(P)}$ kW.`));
  });
  // 10) Haulage rope pull on gradient 1 in n: T = W g (1/n + mu)
  const hl = [[5000, 20, 0.02], [8000, 25, 0.03], [10000, 30, 0.025], [6000, 15, 0.02], [12000, 40, 0.03], [7500, 20, 0.025], [9000, 50, 0.02], [4000, 12, 0.035], [11000, 25, 0.028], [6500, 18, 0.022]];
  hl.forEach((p, i) => {
    const [W, n, mu] = p; const T = W * 9.81 * (1 / n + mu);
    MINING.push(numMCQ(`mn-haul-${i}`, "mining", "Haulage — Rope Pull", "hard",
      `A loaded train of mass ${W} kg is hauled up a gradient of 1 in ${n}. With a tractive (rolling) resistance coefficient of ${mu}, the rope pull is approximately _____.`,
      T, [W * 9.81 * mu, W * 9.81 / n, T * 1.5], "N",
      `**Concept.** Rope pull $T=Wg\\left(\\frac{1}{n}+\\mu\\right)$ (gravity + resistance).\n\n**Working.** $T=${W}\\times9.81\\times(\\frac{1}{${n}}+${mu})=${r2(T)}$ N.\n\n**Answer.** $${r2(T)}$ N.`));
  });
  // 11) Subsidence: s = a * m
  const sub = [[2.5, 0.6], [3, 0.65], [1.8, 0.5], [2.0, 0.55], [3.5, 0.7], [1.5, 0.45], [2.8, 0.6], [4.0, 0.75], [2.2, 0.5], [3.2, 0.68]];
  sub.forEach((p, i) => {
    const [mth, a] = p; const s = a * mth;
    MINING.push(numMCQ(`mn-sub-${i}`, "mining", "Subsidence", "medium",
      `A seam of extraction thickness ${mth} m is worked by caving with a subsidence factor of ${a}. The maximum surface subsidence is _____.`,
      s, [mth, s / 2, mth + a], "m",
      `**Concept.** Maximum subsidence $S_{max}=a\\times m$ (subsidence factor $\\times$ extracted thickness).\n\n**Working.** $${a}\\times${mth}=${r2(s)}$ m.\n\n**Answer.** $${r2(s)}$ m.`));
  });
  // 12) Fan operating point — pq-curve figure
  const fan = [[20, 0.5], [25, 0.4], [18, 0.6], [30, 0.45], [22, 0.55], [28, 0.5], [24, 0.35], [16, 0.65]];
  fan.forEach((p, i) => {
    const [a, b] = p; // fan: P = a - b Q^2 ; mine: P = R Q^2 with R=0.5
    const Rm = 0.5;
    const Qop = Math.sqrt(a / (b + Rm));
    MINING.push(numMCQ(`mn-fan-${i}`, "mining", "Mine Ventilation — Fan Operating Point", "hard",
      `A fan characteristic is $P=${a}-${b}Q^2$ and the mine resistance is $P=0.5\\,Q^2$. The operating air quantity $Q$ (intersection) is _____.`,
      Qop, [Qop * 1.4, Qop / 2, a / b], "m³/s",
      `**Concept.** Operating point: fan pressure = mine pressure.\n\n**Working.** $${a}-${b}Q^2=0.5Q^2\\Rightarrow Q^2=\\dfrac{${a}}{${b + Rm}}\\Rightarrow Q=${r2(Qop)}$ m³/s.\n\n**Answer.** $${r2(Qop)}$ m³/s.`,
      { kind: "pq-curve", fan: { a, b, label: "Fan" }, resistances: [{ r: Rm, label: "Mine", color: "#2563eb" }], caption: "Fan vs mine characteristic" }));
  });
  // 13) Belt conveyor capacity: Q (t/h) = 3.6 * (load per metre kg/m) * speed (m/s)
  const belt = [[40, 1.5], [60, 2], [50, 2.5], [80, 1.8], [35, 2.2], [45, 1.6], [70, 2.4], [55, 1.9], [90, 2.0], [30, 2.5], [65, 1.7], [75, 2.1]];
  belt.forEach((p, i) => {
    const [w, sp] = p; const Qh = 3.6 * w * sp;
    MINING.push(numMCQ(`mn-belt-${i}`, "mining", "Materials Handling — Belt Capacity", "medium",
      `A belt conveyor carries a uniform load of ${w} kg per metre of belt at a speed of ${sp} m/s. Its capacity is _____.`,
      Qh, [Qh / 3.6, Qh * 2, w * sp], "t/h",
      `**Concept.** Capacity $=3.6\\times(\\text{kg/m})\\times v\\,(\\text{m/s})$ t/h.\n\n**Working.** $3.6\\times${w}\\times${sp}=${r2(Qh)}$ t/h.\n\n**Answer.** $${r2(Qh)}$ t/h.`));
  });
  // 14) Weighted average grade
  const wg = [[[200, 1.5], [300, 2.5]], [[100, 0.8], [150, 1.2]], [[400, 3], [100, 1]], [[250, 2], [250, 4]], [[300, 1.2], [200, 2.2]], [[500, 2.5], [250, 1.5]], [[150, 0.9], [350, 1.8]], [[120, 3.0], [180, 1.5]], [[400, 2.0], [200, 3.5]], [[260, 1.6], [140, 2.8]]];
  wg.forEach((blocks, i) => {
    const num = blocks.reduce((s, [t, gr]) => s + t * gr, 0);
    const den = blocks.reduce((s, [t]) => s + t, 0);
    const gAvg = num / den;
    MINING.push(numMCQ(`mn-wgr-${i}`, "mining", "Ore Reserves — Weighted Grade", "hard",
      `Two ore blocks assay: ${blocks[0][0]} t at ${blocks[0][1]}% and ${blocks[1][0]} t at ${blocks[1][1]}%. The combined (tonnage-weighted) grade is _____.`,
      gAvg, [(blocks[0][1] + blocks[1][1]) / 2, gAvg * 1.3, gAvg / 2], "%",
      `**Concept.** Weighted grade $=\\dfrac{\\sum(t_i g_i)}{\\sum t_i}$.\n\n**Working.** $\\dfrac{${blocks[0][0]}\\times${blocks[0][1]}+${blocks[1][0]}\\times${blocks[1][1]}}{${den}}=${r2(gAvg)}\\%$.\n\n**Answer.** $${r2(gAvg)}\\%$.`));
  });
  // 15) Air power of a fan: AP = P * Q (kW), P in Pa, Q in m3/s -> /1000
  const ap = [[1500, 50], [2000, 40], [1200, 60], [2500, 30], [1800, 45], [2200, 35], [1000, 70], [3000, 25], [1600, 55], [2400, 38], [1400, 65], [2800, 32]];
  ap.forEach((p, i) => {
    const [P, Q] = p; const AP = (P * Q) / 1000;
    MINING.push(numMCQ(`mn-ap-${i}`, "mining", "Mine Ventilation — Air Power", "medium",
      `A main fan develops a pressure of ${P} Pa while passing ${Q} m³/s of air. The air power is _____.`,
      AP, [P * Q, AP / 2, P / Q], "kW",
      `**Concept.** Air power $=\\dfrac{P\\times Q}{1000}$ kW ($P$ in Pa, $Q$ in m³/s).\n\n**Working.** $\\dfrac{${P}\\times${Q}}{1000}=${r2(AP)}$ kW.\n\n**Answer.** $${r2(AP)}$ kW.`));
  });
  // 16) Scaled distance (blast vibration control): SD = D / sqrt(W)
  const sdg = [[50, 25], [100, 100], [150, 36], [200, 64], [80, 16], [120, 100], [180, 81], [250, 49]];
  sdg.forEach((p, i) => {
    const [D, W] = p; const SD = D / Math.sqrt(W);
    MINING.push(numMCQ(`mn-sd-${i}`, "mining", "Drilling & Blasting — Scaled Distance", "hard",
      `A blast detonates ${W} kg of explosive per delay and a structure stands ${D} m away. The scaled distance $\\left(D/\\sqrt{W}\\right)$ is _____.`,
      SD, [D / W, SD / 2, (D * Math.sqrt(W)) / 10], "m/kg^½",
      `**Concept.** Scaled distance $SD=\\dfrac{D}{\\sqrt{W}}$ governs peak particle velocity in blast-vibration control.\n\n**Working.** $\\dfrac{${D}}{\\sqrt{${W}}}=\\dfrac{${D}}{${r2(Math.sqrt(W))}}=${r2(SD)}$.\n\n**Answer.** $${r2(SD)}$ m/kg$^{1/2}$.`));
  });
  // 17) Life of mine: LOM = reserves / annual production
  const lom = [[12, 1.5], [20, 2.5], [30, 2], [45, 3], [18, 1.2], [24, 4], [36, 3], [50, 5]];
  lom.forEach((p, i) => {
    const [res, ann] = p; const L = res / ann;
    MINING.push(numMCQ(`mn-lom-${i}`, "mining", "Mine Economics — Life of Mine", "medium",
      `A deposit holds ${res} Mt of mineable reserve and is worked at ${ann} Mt per year. The life of the mine is _____.`,
      L, [ann / res, L / 2, res + ann], "years",
      `**Concept.** Life of mine $=\\dfrac{\\text{reserve}}{\\text{annual production}}$.\n\n**Working.** $\\dfrac{${res}}{${ann}}=${r2(L)}$ years.\n\n**Answer.** $${r2(L)}$ years.`));
  });
  // 18) Shovel productivity: P = bucket * fill * 3600 / cycle  (m3/h, loose)
  const shp = [[5, 0.9, 30], [8, 0.85, 35], [10, 0.9, 40], [6, 0.8, 25], [12, 0.9, 45], [7, 0.85, 30], [9, 0.88, 36], [4, 0.8, 20]];
  shp.forEach((p, i) => {
    const [bk, f, cyc] = p; const P = (bk * f * 3600) / cyc;
    MINING.push(numMCQ(`mn-shovel-${i}`, "mining", "Surface Mining — Shovel Productivity", "hard",
      `A shovel with a ${bk} m³ bucket works at a fill factor of ${f} and a cycle time of ${cyc} s. Its theoretical output is _____.`,
      P, [bk * f, P / 2, (bk * 3600) / cyc], "m³/h",
      `**Concept.** Output $=\\dfrac{\\text{bucket}\\times\\text{fill factor}\\times3600}{\\text{cycle (s)}}$ m³/h.\n\n**Working.** $\\dfrac{${bk}\\times${f}\\times3600}{${cyc}}=${r2(P)}$ m³/h.\n\n**Answer.** $${r2(P)}$ m³/h.`));
  });
  // 19) Truck output per shift: trips = shift/cycle; output = trips * payload
  const trk = [[480, 20, 50], [420, 15, 35], [450, 18, 60], [480, 24, 90], [400, 16, 40], [360, 20, 55], [480, 30, 100], [420, 21, 45]];
  trk.forEach((p, i) => {
    const [shift, cyc, pay] = p; const trips = shift / cyc; const out = trips * pay;
    MINING.push(numMCQ(`mn-truck-${i}`, "mining", "Surface Mining — Truck Output", "medium",
      `A dump truck of ${pay} t payload completes a ${cyc}-minute haul cycle over a ${shift}-minute working shift. Its production is _____.`,
      out, [pay, out / 2, (shift * pay) / 100], "t",
      `**Concept.** Trips $=\\dfrac{\\text{shift}}{\\text{cycle}}$; output $=$ trips $\\times$ payload.\n\n**Working.** Trips $=\\dfrac{${shift}}{${cyc}}=${r2(trips)}$; output $=${r2(trips)}\\times${pay}=${r2(out)}$ t.\n\n**Answer.** $${r2(out)}$ t.`));
  });
  // 20) Development extraction (square pillars): e = (1 - a^2/(a+w)^2) * 100
  const ext = [[20, 4], [25, 5], [30, 6], [15, 3], [40, 5], [24, 6], [18, 4.5], [36, 6]];
  ext.forEach((p, i) => {
    const [a, w] = p; const e = (1 - (a * a) / ((a + w) * (a + w))) * 100;
    MINING.push(numMCQ(`mn-ext-${i}`, "mining", "Bord & Pillar — Extraction", "hard",
      `In bord-and-pillar development with square pillars of side ${a} m and galleries ${w} m wide, the percentage of coal extracted on development is _____.`,
      e, [((a * a) / ((a + w) * (a + w))) * 100, e / 2, (w / a) * 100], "%",
      `**Concept.** For square pillars (centre spacing $a+w$), development extraction $=\\left(1-\\dfrac{a^2}{(a+w)^2}\\right)\\times100$.\n\n**Working.** $\\left(1-\\dfrac{${a}^2}{${a + w}^2}\\right)\\times100=${r2(e)}\\%$.\n\n**Answer.** $${r2(e)}\\%$.`));
  });
  // 21) DC line current: I = P / V
  const cur = [[1100, 110], [2200, 220], [3300, 550], [1980, 220], [1100, 220], [550, 110], [4400, 550], [2750, 550]];
  cur.forEach((p, i) => {
    const [P, V] = p; const I = P / V;
    MINING.push(numMCQ(`mn-cur-${i}`, "mining", "Mine Electrical — Line Current", "medium",
      `A DC mine pump motor draws ${P} W from a ${V} V supply. The line current is _____.`,
      I, [(P * V) / 1000, I / 2, V / I], "A",
      `**Concept.** Power $P=V\\,I\\Rightarrow I=\\dfrac{P}{V}$.\n\n**Working.** $\\dfrac{${P}}{${V}}=${r2(I)}$ A.\n\n**Answer.** $${r2(I)}$ A.`));
  });
  // 22) Drill advance: depth = penetration rate * time
  const drl = [[0.4, 30], [0.5, 40], [0.6, 25], [0.3, 50], [0.45, 36], [0.55, 20], [0.35, 45], [0.5, 28]];
  drl.forEach((p, i) => {
    const [rate, t] = p; const d = rate * t;
    MINING.push(numMCQ(`mn-drill-${i}`, "mining", "Drilling — Penetration", "easy",
      `A jackhammer drills at ${rate} m/min for ${t} minutes of net drilling time. The total hole length advanced is _____.`,
      d, [rate / t, d / 2, rate + t], "m",
      `**Concept.** Advance $=$ penetration rate $\\times$ time.\n\n**Working.** $${rate}\\times${t}=${r2(d)}$ m.\n\n**Answer.** $${r2(d)}$ m.`));
  });
  // 23) Mill metal recovery: metal = feed * grade/100 * recovery/100
  const mill = [[1000, 2.5, 90], [2000, 1.5, 85], [1500, 3.0, 88], [800, 4.0, 92], [1200, 2.0, 80], [2500, 1.2, 86], [900, 3.5, 90], [1800, 2.2, 84]];
  mill.forEach((p, i) => {
    const [feed, gr, rec] = p; const metal = feed * (gr / 100) * (rec / 100);
    MINING.push(numMCQ(`mn-mill-${i}`, "mining", "Mineral Processing — Metal Recovery", "hard",
      `A concentrator treats ${feed} t of ore assaying ${gr}% metal at ${rec}% recovery. The mass of metal recovered is _____.`,
      metal, [(feed * gr) / 100, metal / 2, (feed * rec) / 100], "t",
      `**Concept.** Metal recovered $=$ feed $\\times\\dfrac{\\text{grade}}{100}\\times\\dfrac{\\text{recovery}}{100}$.\n\n**Working.** $${feed}\\times${gr / 100}\\times${rec / 100}=${r2(metal)}$ t.\n\n**Answer.** $${r2(metal)}$ t.`));
  });
})();

// ---------------- static mining concept MCQs ----------------
MINING.push(
  // Legislation
  C("mn-cmr-year", "mining", "Legislation — Coal Mines Regulations", "easy",
    "Statutory safety in Indian coal mines is currently governed by the:", "Coal Mines Regulations, 2017",
    ["Coal Mines Regulations, 1957", "Metalliferous Mines Regulations, 1961", "Mines Rules, 1955"],
    "**Answer.** The Coal Mines Regulations, 2017 superseded the CMR 1957 and govern coal-mine safety."),
  C("mn-mmr-year", "mining", "Legislation — Metalliferous Mines", "easy",
    "Safety in metalliferous (non-coal) mines is regulated by the:", "Metalliferous Mines Regulations, 1961",
    ["Coal Mines Regulations, 2017", "Oil Mines Regulations, 2017", "Mines Act, 1952"],
    "**Answer.** The Metalliferous Mines Regulations, 1961 cover non-coal mines."),
  C("mn-sirdar-duty", "mining", "Legislation — Statutory Duties", "medium",
    "Under the Coal Mines Regulations, the first-line supervisor responsible for inspecting roof and sides of a working district at the start of a shift is the:",
    "Mining Sirdar", ["Surveyor", "Manager", "Winding Engine Driver"],
    "**Answer.** The Mining Sirdar examines the roof, sides and working places of the district and is the statutory first-line supervisor."),
  C("mn-overman-duty", "mining", "Legislation — Statutory Duties", "medium",
    "In a coal mine, the official who supervises a number of districts and is immediately above the Mining Sirdar is the:",
    "Overman", ["Blaster", "Gas-testing person", "Engine driver"],
    "**Answer.** The Overman supervises several districts/sirdars and reports to the Assistant Manager/Manager."),
  C("mn-percent-ch4-stop", "mining", "Legislation — Gas Limits", "hard",
    "Under the Coal Mines Regulations, 2017, persons must be withdrawn from a place in the mine if the percentage of inflammable gas in the general body of air reaches:",
    "1.25%", ["0.5%", "2.5%", "5%"],
    "**Answer.** Withdrawal of persons is required when general-body inflammable gas reaches 1.25% (the lower explosive limit of methane is ~5%, but statutory withdrawal is at 1.25%)."),
  C("mn-comp-cert-body", "mining", "Legislation — Competency", "medium",
    "Certificates of Competency (Manager, Overman, Sirdar, Surveyor) are granted by the:",
    "Board of Mining Examinations under DGMS", ["State Public Service Commission", "Coal India Limited", "Bureau of Indian Standards"],
    "**Answer.** The Board of Mining Examinations, under the Director General of Mines Safety, conducts competency examinations and grants certificates."),
  C("mn-mines-act", "mining", "Legislation — Mines Act", "easy",
    "The principal parent legislation historically empowering mine-safety rules and DGMS in India is the:",
    "Mines Act, 1952", ["Factories Act, 1948", "Electricity Act, 2003", "Environment Protection Act, 1986"],
    "**Answer.** The Mines Act, 1952 is the parent statute (now being subsumed under the OSH Code, 2020)."),
  C("mn-shotfiring", "mining", "Blasting — Statutory", "medium",
    "Before firing a shot in a gassy coal seam, the shot-firer must test for inflammable gas using a:",
    "Flame safety lamp / methanometer", ["Anemometer", "Theodolite", "Sling psychrometer"],
    "**Answer.** Gas testing before shotfiring uses a flame safety lamp or approved methanometer."),
  // Ventilation concepts
  C("mn-anemometer", "mining", "Ventilation — Instruments", "easy",
    "Air velocity in a mine roadway is measured with a(n):", "Anemometer", ["Barometer", "Manometer", "Hygrometer"],
    "**Answer.** An anemometer measures air velocity; quantity is then $Q=vA$."),
  C("mn-natural-vent", "mining", "Ventilation — Natural", "medium",
    "Natural ventilation in a mine is primarily caused by:", "Difference in air column densities (temperature)",
    ["Rotation of the earth", "Barometric tides", "Roof convergence"],
    "**Answer.** Density (temperature) differences between downcast and upcast columns create the natural ventilation pressure."),
  C("mn-blackdamp", "mining", "Mine Gases — Identification", "easy",
    "'Blackdamp' (chokedamp) in mines chiefly consists of:", "Carbon dioxide and nitrogen (oxygen-deficient air)",
    ["Methane", "Carbon monoxide", "Hydrogen sulphide"],
    "**Answer.** Blackdamp is an oxygen-deficient mixture rich in CO₂ and N₂; it does not support life or flame."),
  C("mn-afterdamp", "mining", "Mine Gases — Identification", "medium",
    "The poisonous gas mixture remaining after an explosion or fire, rich in carbon monoxide, is called:",
    "Afterdamp", ["Firedamp", "Whitedamp", "Stinkdamp"],
    "**Answer.** Afterdamp is the post-explosion mixture; firedamp = methane, stinkdamp = H₂S, whitedamp = CO."),
  C("mn-firedamp", "mining", "Mine Gases — Identification", "easy",
    "'Firedamp' in coal mines refers mainly to:", "Methane", ["Carbon dioxide", "Hydrogen sulphide", "Sulphur dioxide"],
    "**Answer.** Firedamp is predominantly methane (CH₄), explosive in the 5–15% range."),
  // Methods
  C("mn-bord-pillar", "mining", "Coal Mining — Methods", "medium",
    "In bord-and-pillar mining, the operation of extracting the coal pillars is called:",
    "Depillaring (pillar extraction)", ["Development", "Stoping", "Benching"],
    "**Answer.** First the area is developed into pillars (bords); later the pillars are extracted — depillaring."),
  C("mn-longwall", "mining", "Coal Mining — Longwall", "medium",
    "In longwall mining the immediate roof behind the supports is allowed to:",
    "Cave (controlled collapse)", ["Remain permanently supported", "Be stowed with sand only", "Be bolted indefinitely"],
    "**Answer.** Longwall caving lets the goaf roof collapse behind the powered supports as the face advances."),
  C("mn-room-pillar-metal", "mining", "Metal Mining — Stoping", "medium",
    "Which stoping method leaves the stope open and unsupported, suitable for strong ore and walls?",
    "Open stoping", ["Cut-and-fill stoping", "Shrinkage stoping", "Block caving"],
    "**Answer.** Open stoping suits competent ore/host rock where no artificial support is needed."),
  C("mn-cut-fill", "mining", "Metal Mining — Stoping", "hard",
    "Cut-and-fill stoping is most appropriate when:", "Ore is valuable and wall rock is weak",
    ["Ore is low-grade and massive", "The deposit is flat and shallow", "The orebody is a thin coal seam"],
    "**Answer.** Cut-and-fill suits high-value ore in weak ground, where fill provides support and a working floor."),
  C("mn-highwall", "mining", "Surface Mining — Highwall", "medium",
    "Highwall mining recovers coal from:", "The exposed seam in the final highwall of an opencast pit",
    ["The shaft pillar", "The river bed", "A vertical shaft bottom"],
    "**Answer.** Highwall mining drives unmanned entries into the seam exposed in the opencast highwall."),
  // Rock mechanics / strata
  C("mn-rqd", "mining", "Rock Mechanics — RQD", "medium",
    "Rock Quality Designation (RQD) is computed from drill core as the percentage of:",
    "Sum of intact core pieces ≥ 10 cm long to total core run", ["Recovered core to drilled length",
    "Voids to solid in the core", "Fractured pieces to total pieces"],
    "**Answer.** RQD = (Σ lengths of sound core pieces ≥10 cm) / (total core run length) × 100."),
  C("mn-roof-bolt", "mining", "Strata Control — Support", "easy",
    "A roof bolt primarily stabilises strata by:", "Binding/suspending roof beds together",
    ["Adding dead weight to the roof", "Cooling the roof rock", "Sealing off gas"],
    "**Answer.** Roof bolts knit weak beds to a stronger bed (suspension/beam-building), improving self-support."),
  C("mn-rmr", "mining", "Rock Mechanics — Classification", "hard",
    "Bieniawski's RMR (Rock Mass Rating) does NOT directly include which parameter?",
    "In-situ stress magnitude", ["Uniaxial compressive strength", "RQD", "Groundwater condition"],
    "**Answer.** RMR uses UCS, RQD, discontinuity spacing/condition, groundwater and orientation adjustment — not in-situ stress directly."),
  // Surveying
  C("mn-theodolite", "mining", "Mine Surveying — Instruments", "easy",
    "Horizontal and vertical angles in mine surveying are measured with a:", "Theodolite",
    ["Planimeter", "Clinometer only", "Dumpy level only"],
    "**Answer.** A theodolite measures both horizontal and vertical angles."),
  C("mn-correlation", "mining", "Mine Surveying — Correlation", "hard",
    "Transferring surface coordinates and bearing down a vertical shaft to underground workings is called:",
    "Shaft plumbing / correlation", ["Tacheometry", "Contouring", "Photogrammetry"],
    "**Answer.** Correlation (shaft plumbing) carries surface orientation and position underground."),
  C("mn-gradient", "mining", "Mine Surveying — Levelling", "medium",
    "A roadway falls 1 m over a horizontal length of 50 m. Its gradient is:",
    "1 in 50", ["1 in 5", "1 in 500", "50 in 1"],
    "**Concept.** Gradient = rise/run expressed as 1 in n.\n\n**Working.** $1$ m over $50$ m $= 1$ in $50$.\n\n**Answer.** 1 in 50."),
  // Environment
  C("mn-eia", "mining", "Environment — EIA", "medium",
    "Before opening a major mine, the statutory study assessing environmental consequences is the:",
    "Environmental Impact Assessment (EIA)", ["Detailed Project Report", "Feasibility Study", "Mine Closure Audit"],
    "**Answer.** EIA, leading to an Environment Management Plan (EMP), is required for environmental clearance."),
  C("mn-spm", "mining", "Environment — Air Pollution", "easy",
    "The chief airborne pollutant from drilling, blasting and haulage in opencast mines is:",
    "Suspended particulate matter (dust)", ["Ozone", "Chlorofluorocarbons", "Methane"],
    "**Answer.** SPM/respirable dust is the dominant opencast air pollutant; water spraying suppresses it."),
  C("mn-reclamation", "mining", "Environment — Reclamation", "medium",
    "Backfilling and revegetating mined-out opencast land is termed:", "Reclamation",
    ["Beneficiation", "Comminution", "Calcination"],
    "**Answer.** Reclamation restores mined land to a usable, stable, vegetated condition."),
  // Mineral resources (RPSC Rajasthan flavour)
  C("mn-raj-zinc", "mining", "Mineral Resources — Rajasthan", "medium",
    "The Rampura–Agucha mine in Rajasthan is India's largest producer of:",
    "Lead–zinc", ["Iron ore", "Coal", "Bauxite"],
    "**Answer.** Rampura–Agucha (Bhilwara, Rajasthan) is India's largest lead–zinc mine, operated by Hindustan Zinc."),
  C("mn-raj-marble", "mining", "Mineral Resources — Rajasthan", "easy",
    "Makrana in Rajasthan is world-famous for:", "Marble (dimensional stone)",
    ["Granite", "Sandstone", "Limestone for cement"],
    "**Answer.** Makrana marble (used in the Taj Mahal) is a premier dimensional stone of Rajasthan."),
  C("mn-nmp", "mining", "Policy — National Mineral Policy", "medium",
    "The current National Mineral Policy of India was promulgated in:", "2019", ["2008", "2015", "1993"],
    "**Answer.** The National Mineral Policy, 2019 replaced the NMP 2008."),
  C("mn-mmdr", "mining", "Legislation — MMDR", "medium",
    "Grant of mineral concessions (leases) in India is primarily governed by the:",
    "MMDR Act, 1957", ["Mines Act, 1952", "Coal Mines Regulations, 2017", "Forest Conservation Act, 1980"],
    "**Answer.** The Mines and Minerals (Development and Regulation) Act, 1957 governs mineral concessions and leasing."),
  // Mine machinery
  C("mn-cm", "mining", "Machinery — Continuous Miner", "easy",
    "A continuous miner is mainly used in:", "Bord-and-pillar coal development",
    ["Opencast overburden removal", "Shaft sinking", "Ore crushing"],
    "**Answer.** Continuous miners cut and load coal in bord-and-pillar (and some pillar extraction) operations."),
  C("mn-dragline", "mining", "Machinery — Dragline", "medium",
    "A walking dragline in opencast coal mining is principally deployed for:",
    "Overburden (waste) removal", ["Coal loading into wagons", "Drilling blastholes", "Hauling men"],
    "**Answer.** Draglines strip and cast overburden to expose the coal seam."),
  C("mn-sdl", "mining", "Machinery — Loading", "medium",
    "An SDL (Side Discharge Loader) in underground coal mines is used to:",
    "Gather and load broken coal onto cars/conveyor", ["Cut roof slots", "Pump water", "Test gas"],
    "**Answer.** The SDL gathers blasted coal and side-discharges it to tubs or a conveyor."),
  // Safety / first aid
  C("mn-self-rescuer", "mining", "Safety — Self Rescuer", "medium",
    "A self-contained self-rescuer (SCSR) carried by miners protects against:",
    "Carbon monoxide / oxygen deficiency during escape", ["Roof falls", "Electric shock", "Noise"],
    "**Answer.** The self-rescuer converts/filters or supplies breathable air (notably against CO) during escape."),
  C("mn-stone-dust", "mining", "Safety — Explosion Barriers", "hard",
    "Stone dusting in coal mine roadways is done to:", "Render coal dust incapable of propagating an explosion",
    ["Improve roof support", "Reduce humidity", "Lubricate conveyors"],
    "**Answer.** Inert stone dust raises the incombustible content so coal dust cannot sustain a flame front."),
  C("mn-permissible-explosive", "mining", "Blasting — Permitted Explosives", "medium",
    "In gassy coal seams, only 'permitted' (P-series) explosives are used because they:",
    "Have a low flame temperature/duration to avoid igniting gas/dust", ["Are cheaper", "Produce more fumes", "Detonate faster"],
    "**Answer.** Permitted explosives are formulated for short, cool flames to reduce ignition risk of firedamp/coal dust."),
  C("mn-inundation", "mining", "Safety — Inundation", "medium",
    "When approaching old waterlogged workings, the principal precaution is:",
    "Advance boreholes (probe drilling) ahead of the face", ["Increase ventilation only", "Add more lighting", "Reduce support density"],
    "**Answer.** Boring ahead (and flanks) detects water bodies before the face holes through — preventing inundation."),
  C("mn-support-withdrawal", "mining", "Strata Control — Depillaring", "hard",
    "During pillar extraction, supports are withdrawn using:", "A remote/mechanical withdrawal device from a place of safety",
    ["Bare hands at the face", "Water jetting", "Compressed air only"],
    "**Answer.** Supports in the goaf edge are withdrawn remotely so the operator stays in a supported, safe position."),
  // --- additional concepts (headroom + variety) ---
  C("mn-coal-rank", "mining", "Coal — Rank", "easy",
    "Which of the following coals has the highest fixed-carbon content and calorific value?",
    "Anthracite", ["Peat", "Lignite", "Sub-bituminous"],
    "**Answer.** Coal rank rises peat → lignite → bituminous → anthracite; anthracite has the highest carbon."),
  C("mn-incline-access", "mining", "Access — Inclines", "easy",
    "An inclined roadway driven from the surface to reach a shallow seam is called a(n):",
    "Incline (drift) access", ["Vertical shaft", "Adit to nowhere", "Winze"],
    "**Answer.** Inclines/drifts give surface access to shallow seams; shafts are vertical, winzes are internal."),
  C("mn-winze", "mining", "Development — Openings", "medium",
    "A vertical or steeply inclined opening driven DOWNWARD between two levels, connecting them, is a:",
    "Winze", ["Raise", "Adit", "Shaft collar"],
    "**Answer.** A winze is sunk downward between levels; a raise is driven upward."),
  C("mn-raise", "mining", "Development — Openings", "medium",
    "An opening driven UPWARD from a level to connect with a level above is a:",
    "Raise", ["Winze", "Sump", "Stope"],
    "**Answer.** A raise is excavated upward; if driven downward it is a winze."),
  C("mn-grade-haulage", "mining", "Haulage — Gradients", "medium",
    "The gradient most favourable for self-acting (gravity) haulage of loaded tubs is one that:",
    "Falls in the direction of the loaded run", ["Rises towards the shaft", "Is exactly level", "Reverses every 10 m"],
    "**Answer.** In self-acting haulage the loaded tubs descend, hauling the empties up via gravity."),
  C("mn-tub-circuit", "mining", "Mine Surveying — Levels", "easy",
    "A 'level' in underground mining is:", "A horizontal roadway/working horizon",
    ["A vertical shaft", "A blasting pattern", "A type of explosive"],
    "**Answer.** Levels are the horizontal workings developed at intervals from the shaft."),
  C("mn-davy-lamp", "mining", "Safety — Flame Lamp", "medium",
    "In a flame safety lamp, the elongation/cap of the flame indicates the presence of:",
    "Methane (firedamp)", ["Carbon dioxide", "Nitrogen", "Water vapour"],
    "**Answer.** A methane cap above the flame signals firedamp; the gauze prevents ignition of the surrounding gas."),
  C("mn-vent-tube", "mining", "Ventilation — Auxiliary", "medium",
    "Ventilation of a blind heading (dead-end drivage) is best achieved by:",
    "Auxiliary ventilation with a fan and duct", ["Natural ventilation alone", "Opening more doors", "Stopping the main fan"],
    "**Answer.** Blind headings have no through-flow, so a forcing/exhausting auxiliary fan-and-duct is used."),
  C("mn-air-crossing", "mining", "Ventilation — Control Devices", "medium",
    "A device that lets intake and return airways cross without mixing is a(n):",
    "Air crossing (overcast)", ["Regulator", "Stopping", "Booster fan"],
    "**Answer.** An air crossing (overcast) carries one airstream over another, keeping intake and return separate."),
  C("mn-regulator", "mining", "Ventilation — Control Devices", "medium",
    "To reduce (split-control) the air quantity in a district, a ventilation engineer installs a:",
    "Regulator", ["Booster fan", "Air crossing", "Extra stopping only"],
    "**Answer.** A regulator is an adjustable opening that adds resistance to a split, lowering its airflow."),
  C("mn-grade-classification", "mining", "Reserves — Classification", "hard",
    "Under UNFC, a mineral resource that is well explored and economically mineable is classed as a:",
    "Proved mineral reserve", ["Inferred resource", "Reconnaissance resource", "Speculative resource"],
    "**Answer.** Increasing geological assurance/feasibility moves material from inferred → indicated → measured/proved reserve."),
  C("mn-explosive-anfo", "mining", "Blasting — Explosives", "easy",
    "ANFO, a common bulk blasting agent, is a mixture of:", "Ammonium nitrate and fuel oil",
    ["Nitroglycerine and sawdust", "TNT and water", "Black powder and clay"],
    "**Answer.** ANFO = Ammonium Nitrate (94%) + Fuel Oil (6%); cheap, used in dry opencast holes."),
  C("mn-detonator-delay", "mining", "Blasting — Initiation", "medium",
    "Delay detonators are used in blast rounds mainly to:", "Improve fragmentation and reduce ground vibration",
    ["Increase noise", "Save explosive cost only", "Prevent any movement of rock"],
    "**Answer.** Sequenced delays create free faces between holes, improving breakage and lowering peak vibration."),
  C("mn-mine-fire-coal", "mining", "Safety — Spontaneous Heating", "hard",
    "Spontaneous combustion of coal is promoted by:", "Oxidation of coal at low temperature with poor heat dissipation",
    ["High ventilation velocity", "Complete absence of oxygen", "Low pyrite content only"],
    "**Answer.** Coal oxidises exothermically; if heat is trapped (loose coal in goaf), temperature rises to ignition."),
  C("mn-dust-respirable", "mining", "Occupational Health — Dust", "medium",
    "Prolonged inhalation of respirable silica dust in mines causes:", "Silicosis",
    ["Pneumoconiosis from coal only", "Asbestosis", "Byssinosis"],
    "**Answer.** Free crystalline silica dust causes silicosis; coal dust causes coal workers' pneumoconiosis (CWP)."),

  // ---- Mines Act, 1952 ----
  C("mn-act-weekhours", "mining", "Legislation — Mines Act 1952", "medium",
    "Under the Mines Act, 1952, the maximum hours a person may be employed ABOVE ground in any week is:",
    "48 hours", ["54 hours", "60 hours", "40 hours"],
    "**Answer.** Section 28 caps weekly working hours above ground at 48."),
  C("mn-act-dayhours-above", "mining", "Legislation — Mines Act 1952", "medium",
    "Under the Mines Act, 1952, the maximum hours a person may work ABOVE ground in any day is:",
    "9 hours", ["8 hours", "10 hours", "12 hours"],
    "**Answer.** Section 30 limits daily hours above ground to 9."),
  C("mn-act-dayhours-below", "mining", "Legislation — Mines Act 1952", "medium",
    "Under the Mines Act, 1952, no person shall be employed BELOW ground for more than ___ in any day:",
    "8 hours", ["9 hours", "10 hours", "6 hours"],
    "**Answer.** Section 30(b) limits below-ground work to 8 hours per day."),
  C("mn-act-minage", "mining", "Legislation — Mines Act 1952", "easy",
    "Under the Mines Act, 1952, no person below the age of ___ years shall be employed in any mine or part thereof:",
    "18 years", ["14 years", "16 years", "21 years"],
    "**Answer.** Section 40 prohibits employment of persons below 18 in a mine."),
  C("mn-act-restday", "mining", "Legislation — Mines Act 1952", "easy",
    "The Mines Act, 1952 entitles a worker to at least one ___ as a day of rest:",
    "Day in every week", ["Day in every fortnight", "Day in every month", "Hour in every shift"],
    "**Answer.** A weekly day of rest is mandated by the Act (Section 28)."),
  C("mn-act-dgms", "mining", "Legislation — Mines Act 1952", "easy",
    "Enforcement of the Mines Act, 1952 and the regulations made under it is the responsibility of the:",
    "Directorate General of Mines Safety (DGMS)", ["State Pollution Control Board", "Coal India Limited", "Indian Bureau of Mines"],
    "**Answer.** DGMS, under the Ministry of Labour and Employment, enforces the Mines Act and regulations."),

  // ---- MMDR Act, 1957 / National Mineral Policy ----
  C("mn-mmdr-leaseterm", "mining", "Legislation — MMDR Act", "medium",
    "After the 2015 amendment to the MMDR Act, a mining lease (other than coal/atomic) is granted for a maximum period of:",
    "50 years", ["20 years", "30 years", "99 years"],
    "**Answer.** The MMDR (Amendment) Act, 2015 fixed the mining-lease term at 50 years."),
  C("mn-mmdr-dmf", "mining", "Legislation — MMDR Act", "medium",
    "The District Mineral Foundation (DMF), funded by lease-holder contributions for the benefit of mining-affected people, was created by the:",
    "MMDR (Amendment) Act, 2015", ["Mines Act, 1952", "Coal Mines Regulations, 2017", "Forest Conservation Act, 1980"],
    "**Answer.** Section 9B (2015 amendment) established DMFs in mining-affected districts."),
  C("mn-mmdr-nmet", "mining", "Legislation — MMDR Act", "medium",
    "The National Mineral Exploration Trust (NMET) for regional/detailed exploration was set up under the:",
    "MMDR (Amendment) Act, 2015", ["National Mineral Policy, 2008", "Mines Act, 1952", "Geological Survey Act"],
    "**Answer.** Section 9C (2015 amendment) created the NMET to fund exploration."),
  C("mn-mmdr-royalty", "mining", "Legislation — MMDR Act", "medium",
    "Rates of royalty payable on minerals are specified in which schedule of the MMDR Act, 1957?",
    "Second Schedule", ["First Schedule", "Third Schedule", "Fourth Schedule"],
    "**Answer.** Royalty rates are listed in the Second Schedule of the MMDR Act."),
  C("mn-mmdr-auction", "mining", "Legislation — MMDR Act", "medium",
    "Since the 2015 amendment, mineral concessions for notified minerals are granted primarily through:",
    "Auction (competitive bidding)", ["First-come-first-served", "Lottery", "Nomination only"],
    "**Answer.** The 2015 amendment introduced grant of mineral concessions by auction to ensure transparency."),
  C("mn-nmp-target", "mining", "Policy — National Mineral Policy 2019", "medium",
    "A key thrust of the National Mineral Policy, 2019 is to:",
    "Encourage exploration and reduce import dependence on minerals", ["Ban all private mining", "Nationalise cement plants", "Stop mineral exports entirely"],
    "**Answer.** NMP 2019 emphasises boosting domestic exploration/production and cutting mineral imports through sustainable mining."),

  // ---- Coal Mines Regulations, 2017 ----
  C("mn-cmr-degrees", "mining", "Legislation — Coal Mines Regulations 2017", "medium",
    "Under the Coal Mines Regulations, 2017, gassy seams are classified into how many degrees?",
    "Three", ["Two", "Four", "Five"],
    "**Answer.** CMR 2017 classifies gassy seams as first, second and third degree."),
  C("mn-cmr-firstdeg", "mining", "Legislation — Coal Mines Regulations 2017", "hard",
    "A seam is classified as 'degree-I gassy' when the inflammable gas in the general body of the return air does not exceed ___ and the emission rate is below 1 m³ per tonne:",
    "0.1%", ["0.5%", "1.0%", "1.25%"],
    "**Answer.** Degree-I: return-air gas ≤0.1% and emission <1 m³/tonne of output."),
  C("mn-cmr-oxygen", "mining", "Legislation — Coal Mines Regulations 2017", "medium",
    "The Coal Mines Regulations require that the air in workings where persons work contains not less than ___ oxygen by volume:",
    "19%", ["21%", "16%", "10%"],
    "**Answer.** A minimum of 19% oxygen is required in the general body of air at working places."),
  C("mn-cmr-survey", "mining", "Legislation — Coal Mines Regulations 2017", "medium",
    "Statutory mine survey plans must be kept up to date and corrected at intervals not exceeding:",
    "3 months", ["1 month", "6 months", "12 months"],
    "**Answer.** Survey plans must be brought up to date at least once every three months."),
  C("mn-cmr-smoking", "mining", "Legislation — Coal Mines Regulations 2017", "easy",
    "In a below-ground coal mine, smoking materials and naked lights are:",
    "Prohibited (treated as contraband)", ["Allowed in intake airways", "Allowed near the shaft bottom", "Allowed during night shift"],
    "**Answer.** Smoking materials/naked lights are contraband below ground to prevent firedamp/coal-dust ignition."),

  // ---- Metalliferous Mines Regulations, 1961 ----
  C("mn-mmr-scope", "mining", "Legislation — Metalliferous Mines 1961", "easy",
    "The Metalliferous Mines Regulations, 1961 apply to all mines EXCEPT:",
    "Coal mines and oil mines", ["Iron-ore mines", "Limestone mines", "Copper mines"],
    "**Answer.** MMR 1961 covers non-coal, non-oil mines; coal and oil mines have their own regulations."),
  C("mn-mmr-mate", "mining", "Legislation — Metalliferous Mines 1961", "medium",
    "In metalliferous mines, the statutory first-line supervisor equivalent to the coal-mine Sirdar is the:",
    "Mining Mate", ["Overman", "Surveyor", "Winding Engine Driver"],
    "**Answer.** The Mining Mate is the first-line supervisor under the MMR 1961."),

  // ---- Rajasthan mineral geography (RPSC flavour) ----
  C("mn-raj-khetri", "mining", "Mineral Resources — Rajasthan", "medium",
    "The Khetri belt in Rajasthan is India's well-known source of:",
    "Copper", ["Lead", "Manganese", "Chromite"],
    "**Answer.** The Khetri copper belt (Jhunjhunu) is worked by Hindustan Copper Limited."),
  C("mn-raj-zawar", "mining", "Mineral Resources — Rajasthan", "medium",
    "Zawar in Rajasthan is historically famous for ancient mining and smelting of:",
    "Zinc", ["Gold", "Iron", "Copper only"],
    "**Answer.** Zawar (Udaipur) has evidence of ancient zinc smelting and is a major lead–zinc field."),
  C("mn-raj-phosphate", "mining", "Mineral Resources — Rajasthan", "medium",
    "India's principal rock-phosphate deposit is mined at Jhamarkotra in which Rajasthan district?",
    "Udaipur", ["Jaipur", "Bikaner", "Kota"],
    "**Answer.** Jhamarkotra (Udaipur) is India's largest rock-phosphate source, mined by RSMML."),
  C("mn-raj-hzl", "mining", "Mineral Resources — Rajasthan", "easy",
    "Hindustan Zinc Limited, India's largest integrated zinc–lead producer, is headquartered at:",
    "Udaipur", ["Jaipur", "Jodhpur", "Kota"],
    "**Answer.** Hindustan Zinc Limited (Vedanta) is headquartered at Udaipur, Rajasthan."),
  C("mn-raj-makrana-dist", "mining", "Mineral Resources — Rajasthan", "medium",
    "The famous Makrana marble belt lies in which district of Rajasthan?",
    "Nagaur", ["Bhilwara", "Sikar", "Alwar"],
    "**Answer.** Makrana, source of the Taj Mahal marble, is in Nagaur district."),
  C("mn-raj-sambhar", "mining", "Mineral Resources — Rajasthan", "medium",
    "Sambhar Lake in Rajasthan is India's largest inland source of:",
    "Common salt", ["Gypsum", "Potash", "Borax"],
    "**Answer.** Sambhar Lake is the country's largest inland saline lake worked for common salt."),
  C("mn-raj-gypsum", "mining", "Mineral Resources — Rajasthan", "medium",
    "Which Indian state is the leading producer of gypsum, used in cement and plaster?",
    "Rajasthan", ["Kerala", "West Bengal", "Assam"],
    "**Answer.** Rajasthan (Bikaner, Nagaur, Jaisalmer) leads India's gypsum production."),
  C("mn-raj-aravalli", "mining", "Mineral Resources — Rajasthan", "hard",
    "The Aravalli range, host to Rajasthan's base-metal deposits, is composed mainly of:",
    "Precambrian metamorphic and igneous rocks", ["Recent alluvium", "Deccan basalt", "Marine Tertiary sediments"],
    "**Answer.** The Aravallis are among the oldest (Precambrian) fold mountains, of metamorphic/igneous rock."),
  C("mn-raj-dariba", "mining", "Mineral Resources — Rajasthan", "medium",
    "Rajpura–Dariba in Rajasthan is mined chiefly for:",
    "Lead–zinc", ["Iron ore", "Bauxite", "Coal"],
    "**Answer.** Rajpura–Dariba (Rajsamand) is a major lead–zinc–silver deposit of Hindustan Zinc."),
  C("mn-raj-wollastonite", "mining", "Mineral Resources — Rajasthan", "hard",
    "Rajasthan is virtually the sole Indian producer of which industrial mineral used in ceramics and paints?",
    "Wollastonite", ["Chromite", "Graphite", "Magnesite"],
    "**Answer.** Rajasthan accounts for nearly all of India's wollastonite output."),

  // ---- General mining engineering (headroom) ----
  C("mn-goaf", "mining", "Coal Mining — Terminology", "easy",
    "The void left in the strata after extraction of coal (e.g. behind a longwall face) is the:",
    "Goaf (gob)", ["Stope", "Sump", "Collar"],
    "**Answer.** The de-stressed, caved void behind the face is the goaf or gob."),
  C("mn-adit", "mining", "Access — Adit", "easy",
    "An 'adit' is best described as a:",
    "Near-horizontal entry driven into a hillside to reach a deposit", ["Vertical shaft to deep seams", "Internal winze between levels", "Blasthole pattern"],
    "**Answer.** An adit is a horizontal/near-horizontal drift driven from a hillside, often self-draining."),
  C("mn-burden-def", "mining", "Blasting — Geometry", "medium",
    "In a blast round the 'burden' is the distance from a blasthole to the:",
    "Nearest free face, measured perpendicular to the hole", ["Adjacent hole in the same row", "Collar of the hole", "Floor of the bench"],
    "**Answer.** Burden is the perpendicular distance to the nearest free face; spacing is between holes in a row."),
  C("mn-spacing-def", "mining", "Blasting — Geometry", "easy",
    "In a blast pattern, 'spacing' is the distance:",
    "Between adjacent holes in the same row", ["From the hole to the free face", "From collar to charge top", "Of stemming column"],
    "**Answer.** Spacing is the centre-to-centre distance between adjacent holes in a row."),
  C("mn-stemming", "mining", "Blasting — Charging", "medium",
    "'Stemming' placed in the collar of a blasthole serves to:",
    "Confine the explosion gases and improve energy use", ["Initiate the charge", "Cool the rock", "Lubricate the drill rod"],
    "**Answer.** Inert stemming confines gases, reducing blow-out and improving fragmentation."),
  C("mn-misfire", "mining", "Blasting — Safety", "easy",
    "A 'misfire' in blasting refers to:",
    "A charge that fails to detonate as intended", ["A perfectly fragmented blast", "An early detonation by one second", "A blast with excess stemming"],
    "**Answer.** A misfire is an unexploded/partly exploded charge needing strict statutory handling."),
  C("mn-burncut", "mining", "Tunnelling — Drill Pattern", "hard",
    "A drill cut for tunnels/drivages using parallel holes with one or more uncharged relief holes is the:",
    "Burn cut", ["Wedge cut", "Fan cut", "Pyramid cut"],
    "**Answer.** The burn (parallel-hole) cut uses empty relief holes to create a free face for the charged holes."),
  C("mn-fos-pillar", "mining", "Rock Mechanics — Pillar Design", "medium",
    "The factor of safety of a mine pillar is the ratio of:",
    "Pillar strength to pillar stress", ["Pillar stress to overburden depth", "Pillar width to height", "Extraction to development"],
    "**Answer.** FoS $=$ pillar strength $\\div$ induced pillar stress; values around 1.5–2 are typical."),
  C("mn-tributary", "mining", "Rock Mechanics — Pillar Stress", "hard",
    "Tributary area theory estimates the average pillar stress as the overburden stress multiplied by:",
    "Total (tributary) area divided by pillar area", ["Pillar area divided by total area", "Width-to-height ratio", "Extraction ratio squared"],
    "**Answer.** $\\sigma_p=\\sigma_v\\,\\dfrac{A_{total}}{A_{pillar}}=\\dfrac{\\sigma_v}{1-e}$ where $e$ is the extraction ratio."),
  C("mn-convergence", "mining", "Strata Control — Monitoring", "medium",
    "'Convergence' measured in an underground opening refers to:",
    "Closure between the roof and the floor", ["Lateral airflow", "Gas accumulation", "Rope elongation"],
    "**Answer.** Convergence is the reduction in roof-to-floor (or rib-to-rib) distance over time."),
  C("mn-vertstress", "mining", "Rock Mechanics — In-situ Stress", "hard",
    "In-situ vertical stress in rock increases with depth at approximately:",
    "0.025 MPa per metre", ["0.0025 MPa per metre", "0.25 MPa per metre", "2.5 MPa per metre"],
    "**Answer.** $\\sigma_v\\approx\\gamma h$; with $\\gamma\\approx0.025$ MN/m³ this is ~0.025 MPa/m (≈1 MPa per 40 m)."),
  C("mn-ch4-explosive", "mining", "Mine Gases — Explosibility", "hard",
    "Methane forms its most violently explosive mixture with air at a concentration of about:",
    "9.5%", ["5%", "15%", "25%"],
    "**Answer.** Methane is explosive 5–15%; the most violent mixture is near the stoichiometric ~9.5%."),
  C("mn-co-haem", "mining", "Mine Gases — Toxicology", "medium",
    "Carbon monoxide is dangerous chiefly because it:",
    "Binds haemoglobin far more strongly than oxygen", ["Is explosive at 1%", "Displaces all nitrogen", "Condenses on the lungs"],
    "**Answer.** CO forms carboxyhaemoglobin (~240× the affinity of O₂), causing tissue asphyxia."),
  C("mn-co-tlv", "mining", "Occupational Health — Gas Limits", "hard",
    "The 8-hour threshold limit value (TLV) for carbon monoxide in mine air is about:",
    "50 ppm", ["5 ppm", "500 ppm", "1000 ppm"],
    "**Answer.** The 8-hour TLV-TWA for CO is ~50 ppm (0.005%)."),
  C("mn-amd", "mining", "Environment — Acid Mine Drainage", "medium",
    "Acid mine drainage (AMD) is produced mainly by the oxidation of:",
    "Pyrite (iron sulphide) in the presence of water and air", ["Limestone", "Quartz", "Feldspar"],
    "**Answer.** Pyrite (FeS₂) oxidises to sulphuric acid and iron salts, lowering water pH."),
  C("mn-amd-ph", "mining", "Environment — Water Quality", "medium",
    "The pH of typical acid mine drainage is:",
    "Low (acidic, often below 4)", ["Neutral (~7)", "High (alkaline, ~10)", "Exactly 14"],
    "**Answer.** AMD is acidic, frequently pH 2–4, and is treated with lime/limestone."),
  C("mn-settling", "mining", "Environment — Effluent", "easy",
    "Settling (sedimentation) ponds at a mine are provided to:",
    "Remove suspended solids before water is discharged", ["Increase blasting efficiency", "Store explosives", "Cool the ventilation air"],
    "**Answer.** Settling ponds let suspended solids settle so discharged water meets effluent norms."),
  C("mn-hygrometer", "mining", "Ventilation — Instruments", "easy",
    "Relative humidity of mine air is measured with a:",
    "Hygrometer (sling psychrometer)", ["Anemometer", "Theodolite", "Barometer"],
    "**Answer.** Wet- and dry-bulb readings from a sling psychrometer/hygrometer give relative humidity."),
  C("mn-wetdrill", "mining", "Drilling — Dust Control", "easy",
    "Wet drilling is preferred over dry drilling primarily to:",
    "Suppress respirable dust at the source", ["Increase penetration rate", "Save compressed air", "Cool the explosive"],
    "**Answer.** Water flushing suppresses silica/coal dust, reducing pneumoconiosis risk."),
  C("mn-hydraulic-stow", "mining", "Strata Control — Stowing", "hard",
    "In hydraulic stowing, the goaf is filled with:",
    "Sand slurry transported and placed by water", ["Compressed air only", "Dry rock by gravity", "Cement grout pumped under pressure"],
    "**Answer.** Hydraulic stowing pipes a sand–water slurry into the goaf; the water drains, leaving compact fill."),
  C("mn-koepe", "mining", "Winding — Systems", "hard",
    "A Koepe (friction) winder differs from a drum winder in that it:",
    "Drives the rope by friction over a sheave rather than coiling it on a drum", ["Uses no headgear", "Cannot use a counterweight", "Works only in inclined shafts"],
    "**Answer.** The Koepe system grips the rope by friction on a driving sheave, with a balance/counterweight."),
  C("mn-cage-skip", "mining", "Winding — Conveyances", "easy",
    "In shaft winding, a 'skip' is used mainly to hoist:",
    "Bulk mineral (loose ore/coal)", ["Men only", "Timber only", "Ventilation air"],
    "**Answer.** Skips hoist loose mineral; cages carry men, materials and tubs."),
  C("mn-secondary-blast", "mining", "Blasting — Operations", "easy",
    "Secondary blasting in a mine is carried out to:",
    "Break oversize boulders produced by primary blasting", ["Develop a new shaft", "Drain mine water", "Stow the goaf"],
    "**Answer.** Secondary blasting (pop/plaster shooting) reduces oversize rock to handleable size."),
  C("mn-cbm", "mining", "Coal — Coalbed Methane", "medium",
    "The gas extracted from coal seams as 'coalbed methane' (CBM) is predominantly:",
    "Methane", ["Carbon dioxide", "Hydrogen", "Nitrogen"],
    "**Answer.** CBM is mainly methane adsorbed on coal, drained to improve safety and as an energy resource."),
  C("mn-noise-db", "mining", "Occupational Health — Noise", "easy",
    "Occupational noise exposure in mines is measured in:",
    "Decibels, dB(A)", ["Lux", "Pascals only", "Becquerels"],
    "**Answer.** Noise is measured in A-weighted decibels, dB(A); 90 dB(A) over 8 h is a common limit."),
  C("mn-shaft-freeze", "mining", "Shaft Sinking — Special Methods", "hard",
    "Sinking a shaft through heavily water-bearing, unstable strata is often achieved by the:",
    "Ground-freezing method", ["Drill-and-blast in dry ground", "Raise boring", "Self-acting haulage"],
    "**Answer.** Freezing forms an ice wall to support and seal water-bearing strata during sinking (cementation is an alternative)."),
  C("mn-coaldust-fine", "mining", "Safety — Coal Dust", "medium",
    "Coal-dust explosions are most violent when the dust is:",
    "Fine (a high proportion below ~75 microns)", ["Coarse lumps only", "Completely wet", "Mixed with stone dust above limit"],
    "**Answer.** Fine, dry coal dust has high surface area and is easily raised and ignited; stone dusting inerts it."),
  C("mn-jaisalmer-limestone", "mining", "Mineral Resources — Rajasthan", "medium",
    "The Sanu deposit in Jaisalmer district, Rajasthan, is an important source of:",
    "Limestone (for steel plants)", ["Coal", "Bauxite", "Manganese"],
    "**Answer.** Sanu limestone (Jaisalmer) supplies flux-grade limestone to steel plants."),
);

// ================================================================
// Mock assembly
// ================================================================
type Tier = "free" | "subject" | "premium";
interface MockSpec {
  id: string; title: string; tier: Tier;
  exam: "STATE" | "DIPLOMA";
  pattern: string; duration: number; totalMarks: number;
  sections: { name: string; count: number; marks: number; bucket: Cand["bucket"]; difficulty?: Cand["difficulty"] }[];
  negative: { mcq1: number; mcq2: number; nat: number; msq: number };
  paperLabel: string;
}

const NEG_THIRD = { mcq1: -1 / 3, mcq2: 0, nat: 0, msq: 0 };
const NEG_NONE = { mcq1: 0, mcq2: 0, nat: 0, msq: 0 };

const SPECS: MockSpec[] = [
  {
    id: "state-rpsc-ame-mock-01", title: "RPSC Assistant Mining Engineer — Mock 01 (Free)", tier: "free",
    exam: "STATE", paperLabel: "Mining Engineering",
    pattern: "RPSC AME (150 Q · 150 marks · 150 min · −1/3)", duration: 150, totalMarks: 150,
    sections: [{ name: "Mining Engineering", count: 150, marks: 150, bucket: "mining" }],
    negative: NEG_THIRD,
  },
  {
    id: "state-rpsc-ame-mock-02", title: "RPSC Assistant Mining Engineer — Mock 02", tier: "subject",
    exam: "STATE", paperLabel: "Mining Engineering",
    pattern: "RPSC AME (150 Q · 150 marks · 150 min · −1/3)", duration: 150, totalMarks: 150,
    sections: [{ name: "Mining Engineering", count: 150, marks: 150, bucket: "mining" }],
    negative: NEG_THIRD,
  },
  {
    id: "diploma-coal-sirdar-mock-01", title: "Mining Sirdar (Coalfields CBT) — Mock 01 (Free)", tier: "free",
    exam: "DIPLOMA", paperLabel: "Mining Sirdar CBT",
    pattern: "Coalfield Sirdar/Overman CBT (100 Q · 100 marks · 120 min · no −ve)", duration: 120, totalMarks: 100,
    sections: [
      { name: "General Awareness & Aptitude", count: 20, marks: 20, bucket: "ga" },
      { name: "Technical (Mining)", count: 80, marks: 80, bucket: "mining" },
    ],
    negative: NEG_NONE,
  },
  {
    id: "diploma-coal-overman-mock-01", title: "Junior Overman (Coalfields CBT) — Mock 01", tier: "subject",
    exam: "DIPLOMA", paperLabel: "Junior Overman CBT",
    pattern: "Coalfield Sirdar/Overman CBT (100 Q · 100 marks · 120 min · no −ve)", duration: 120, totalMarks: 100,
    sections: [
      { name: "General Awareness & Aptitude", count: 20, marks: 20, bucket: "ga" },
      { name: "Technical (Mining)", count: 80, marks: 80, bucket: "mining" },
    ],
    negative: NEG_NONE,
  },
];

function pick(pool: Cand[], n: number, used: Set<string>, rand: () => number): Cand[] {
  const out: Cand[] = [];
  for (const c of shuffle(pool, rand)) {
    if (out.length >= n) break;
    if (used.has(c.cid)) continue;
    out.push(c);
    used.add(c.cid);
  }
  if (out.length < n) {
    throw new Error(`pool exhausted: need ${n}, got ${out.length} (pool size ${pool.length})`);
  }
  return out;
}

// Deterministically shuffle a concept's options and report the new answer index.
function placeOptions(c: Cand, rand: () => number): { options: string[]; answer: number } {
  const correct = c.options[0];
  const order = shuffle(c.options, rand);
  return { options: order, answer: order.indexOf(correct) };
}

const outDir = resolve(process.cwd(), "apps/web/src/data/questions/mocks");

for (const spec of SPECS) {
  const seed = hashSeed(spec.id);
  const rand = rng(seed);
  const used = new Set<string>();
  const questions: Record<string, unknown>[] = [];
  let qid = 0;

  for (const sec of spec.sections) {
    const pool = sec.bucket === "ga" ? GA : MINING;
    const chosen = pick(pool, sec.count, used, rand);
    for (const c of chosen) {
      qid++;
      const { options, answer } = placeOptions(c, rand);
      const q: Record<string, unknown> = {
        id: qid,
        subject: sec.name,
        topic: c.topic,
        section: sec.name,
        type: "MCQ",
        marks: 1,
        difficulty: c.difficulty,
        stem: c.stem,
        options,
        answer,
        solution: c.solution,
      };
      if (c.figure) q.figure = c.figure;
      questions.push(q);
    }
  }

  const doc = {
    id: spec.id,
    title: spec.title,
    tier: spec.tier,
    duration: spec.duration,
    pattern: spec.pattern,
    totalMarks: spec.totalMarks,
    sections: spec.sections.map((s) => ({ name: s.name, count: s.count, marks: s.marks })),
    negativeMarking: spec.negative,
    seed,
    locked: true,
    questions,
  };

  const file = resolve(outDir, `${spec.id}.json`);
  writeFileSync(file, JSON.stringify(doc, null, 2) + "\n", "utf8");
  const figs = questions.filter((q) => q.figure).length;
  console.log(`wrote ${spec.id}.json — ${questions.length} Q, ${figs} figures, seed ${seed}`);
}

console.log("\nPool sizes:", { ga: GA.length, mining: MINING.length });
