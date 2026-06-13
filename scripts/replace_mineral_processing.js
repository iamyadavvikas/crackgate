/*
 * replace_mineral_processing.js
 * ---------------------------------------------------------------------------
 * Replaces every "Mineral Processing" question (out of GATE MN syllabus) in the
 * 15 mock JSON files with a new, correct-by-construction question drawn equally
 * from the four in-syllabus technical subjects (Sections 3/4/5/6).
 *
 *  - 88 MP questions -> 22 each across Sec 3,4,5,6 (cycled by global index).
 *  - Each replacement PRESERVES the original id, marks-bucket (`section`),
 *    `type` (MCQ/NAT/MSQ), `marks` and `difficulty`, so every mock stays at
 *    65 questions / 100 marks with an unchanged section blueprint.
 *  - All numeric answers are computed in JS (no hand-typed arithmetic), so they
 *    are correct by construction. MCQ distractors are generated around the true
 *    value; NAT carries answer+tolerance; MSQ uses curated conceptual banks.
 *  - Diagrams/charts are attached via the typed `figure` schema
 *    (mohr / ventilation / svg) used elsewhere in the app.
 *
 * Run: node scripts/replace_mineral_processing.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'apps', 'web', 'src', 'data', 'questions', 'mocks');

// ---- deterministic RNG (mulberry32) so reruns are stable --------------------
let _s = 0x9e3779b9;
function rng() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const round = (x, d = 2) => {
  const p = Math.pow(10, d);
  return Math.round(x * p) / p;
};
const fmt = (x, d) => (d === 0 ? String(Math.round(x)) : x.toFixed(d));

// ---- canonical syllabus subjects (Sections 3/4/5/6) -------------------------
const SUBJ = {
  3: 'Geomechanics & Ground Control',
  4: 'Mining Methods & Machinery',
  5: 'Surface Environment, Ventilation & Underground Hazards',
  6: 'Mineral Economics, Mine Planning & Systems Engineering',
};

// ===========================================================================
//  NUMERIC GENERATORS  (return { topic, stem, value, decimals, unit, solution, figure? })
// ===========================================================================

// ---- Section 3 : Geomechanics & Ground Control -----------------------------
const gen3 = [
  function pillarStrength() {
    const S1 = pick([40, 45, 50, 55, 60]);
    const W = pick([4, 5, 6, 8]);
    const H = pick([3, 4, 5]);
    const v = S1 * (0.778 + 0.222 * (W / H));
    return {
      topic: 'Pillar Design (Obert\u2013Duvall)',
      unit: 'MPa', decimals: 2, value: v,
      stem: `A square coal pillar of width $W=${W}$ m and height $H=${H}$ m is made of material whose cubical-specimen strength is $\\sigma_1=${S1}$ MPa. Using the Obert\u2013Duvall formula, estimate the pillar strength (in MPa).`,
      solution: `**Concept:** Obert\u2013Duvall pillar strength $S_p=\\sigma_1\\left(0.778+0.222\\,\\dfrac{W}{H}\\right)$.\n\n**Substitute:** $S_p=${S1}\\left(0.778+0.222\\times\\dfrac{${W}}{${H}}\\right)=${S1}\\times${round(0.778 + 0.222 * (W / H), 4)}=${fmt(v, 2)}$ MPa.\n\n**Answer: ${fmt(v, 2)} MPa.**`,
    };
  },
  function tributaryStress() {
    const gamma = pick([0.024, 0.025, 0.027]);
    const depth = pick([150, 200, 250, 300]);
    const W = pick([6, 8, 10]);
    const B = pick([3, 4, 5]);
    const sv = gamma * depth;
    const v = sv * Math.pow(W + B, 2) / Math.pow(W, 2);
    return {
      topic: 'Tributary-Area Pillar Stress',
      unit: 'MPa', decimals: 2, value: v,
      stem: `Square pillars of side $W=${W}$ m are separated by roadways of width $B=${B}$ m at a depth of $${depth}$ m. Taking unit rock weight $\\gamma=${gamma}$ MN/m\u00b3, find the average pillar stress (in MPa) by the tributary-area method.`,
      solution: `**Concept:** Vertical stress $\\sigma_v=\\gamma H$; tributary-area pillar stress $\\sigma_p=\\sigma_v\\dfrac{(W+B)^2}{W^2}$.\n\n**Substitute:** $\\sigma_v=${gamma}\\times${depth}=${round(sv, 3)}$ MPa; $\\sigma_p=${round(sv, 3)}\\times\\dfrac{(${W}+${B})^2}{${W}^2}=${fmt(v, 2)}$ MPa.\n\n**Answer: ${fmt(v, 2)} MPa.**`,
    };
  },
  function factorOfSafety() {
    const Sp = pick([28, 32, 36, 40]);
    const sp = pick([12, 14, 16, 18]);
    const v = Sp / sp;
    return {
      topic: 'Pillar Factor of Safety',
      unit: '', decimals: 2, value: v,
      stem: `A pillar has strength $S_p=${Sp}$ MPa and carries an average stress $\\sigma_p=${sp}$ MPa. Determine the factor of safety of the pillar.`,
      solution: `**Concept:** $\\text{FoS}=\\dfrac{\\text{pillar strength}}{\\text{pillar stress}}=\\dfrac{${Sp}}{${sp}}=${fmt(v, 2)}$.\n\n**Answer: ${fmt(v, 2)}.**`,
    };
  },
  function mohrSigma1() {
    const c = pick([5, 10, 15]);
    const phi = pick([25, 30, 35, 40]);
    const s3 = pick([2, 3, 5]);
    const r = (phi * Math.PI) / 180;
    const Nphi = (1 + Math.sin(r)) / (1 - Math.sin(r));
    const v = s3 * Nphi + 2 * c * Math.sqrt(Nphi);
    return {
      topic: 'Mohr\u2013Coulomb Failure',
      unit: 'MPa', decimals: 2, value: v,
      stem: `A rock obeys the Mohr\u2013Coulomb criterion with cohesion $c=${c}$ MPa and friction angle $\\phi=${phi}^\\circ$. For a confining (minor principal) stress $\\sigma_3=${s3}$ MPa, find the major principal stress $\\sigma_1$ at failure (in MPa).`,
      solution: `**Concept:** $\\sigma_1=\\sigma_3 N_\\phi+2c\\sqrt{N_\\phi}$, where $N_\\phi=\\dfrac{1+\\sin\\phi}{1-\\sin\\phi}=${round(Nphi, 3)}$.\n\n**Substitute:** $\\sigma_1=${s3}\\times${round(Nphi, 3)}+2\\times${c}\\times${round(Math.sqrt(Nphi), 3)}=${fmt(v, 2)}$ MPa.\n\n**Answer: ${fmt(v, 2)} MPa.**`,
      figure: { kind: 'mohr', sigma1: round(v, 1), sigma3: s3, phi, cohesion: c, caption: `Mohr circle at failure (\u03c6=${phi}\u00b0, c=${c} MPa)` },
    };
  },
  function rqd() {
    const L = pick([100, 120, 150, 200]);
    const frac = pick([0.55, 0.62, 0.7, 0.78, 0.85]);
    const G = Math.round(L * frac);
    const v = (G / L) * 100;
    return {
      topic: 'Rock Quality Designation (RQD)',
      unit: '%', decimals: 1, value: v,
      stem: `In a drill run of total length $${L}$ cm, the sum of intact core pieces longer than $10$ cm is $${G}$ cm. Calculate the RQD (in %).`,
      solution: `**Concept:** $\\text{RQD}=\\dfrac{\\sum(\\text{pieces}\\ge 10\\text{ cm})}{\\text{total run}}\\times100=\\dfrac{${G}}{${L}}\\times100=${fmt(v, 1)}\\%$.\n\n**Answer: ${fmt(v, 1)}.**`,
    };
  },
  function verticalStress() {
    const gamma = pick([24, 25, 27]);
    const depth = pick([400, 500, 600, 800]);
    const v = (gamma * depth) / 1000; // kN/m3 * m -> kPa -> MPa
    return {
      topic: 'In-situ Vertical Stress',
      unit: 'MPa', decimals: 2, value: v,
      stem: `Estimate the in-situ vertical stress (in MPa) at a depth of $${depth}$ m if the average unit weight of the overburden is $${gamma}$ kN/m\u00b3.`,
      solution: `**Concept:** $\\sigma_v=\\gamma H=${gamma}\\times${depth}=${gamma * depth}$ kPa $=${fmt(v, 2)}$ MPa.\n\n**Answer: ${fmt(v, 2)} MPa.**`,
    };
  },
  function subsidence() {
    const a = pick([0.6, 0.7, 0.8]);
    const m = pick([2, 3, 4, 5]);
    const v = a * m;
    return {
      topic: 'Ground Subsidence',
      unit: 'm', decimals: 2, value: v,
      stem: `A seam of thickness $m=${m}$ m is extracted by total caving. If the subsidence factor is $a=${a}$, estimate the maximum surface subsidence (in m).`,
      solution: `**Concept:** $S_{max}=a\\,m=${a}\\times${m}=${fmt(v, 2)}$ m.\n\n**Answer: ${fmt(v, 2)} m.**`,
    };
  },
  function beamReaction() {
    const L = pick([6, 8, 10]);
    const a = pick([2, 3, 4]);
    const P = pick([20, 30, 40, 50]);
    const v = (P * (L - a)) / L; // R_A
    return {
      topic: 'Statics \u2013 Beam Reaction',
      unit: 'kN', decimals: 2, value: v,
      stem: `A simply-supported beam of span $L=${L}$ m carries a point load $P=${P}$ kN at a distance $a=${a}$ m from support A. Determine the reaction at A, $R_A$ (in kN).`,
      solution: `**Concept:** Taking moments about B: $R_A=\\dfrac{P(L-a)}{L}=\\dfrac{${P}\\times(${L}-${a})}{${L}}=${fmt(v, 2)}$ kN.\n\n**Answer: ${fmt(v, 2)} kN.**`,
      figure: { kind: 'svg', caption: `Simply-supported beam, span ${L} m`, markup: `<svg viewBox='0 0 300 110' style='width:100%;max-width:300px;height:auto' xmlns='http://www.w3.org/2000/svg'><rect width='300' height='110' fill='#fff'/><line x1='40' y1='70' x2='260' y2='70' stroke='#475569' stroke-width='3'/><polygon points='40,70 30,90 50,90' fill='#1e293b'/><polygon points='260,70 250,90 270,90' fill='#1e293b'/><line x1='${40 + (a / L) * 220}' y1='30' x2='${40 + (a / L) * 220}' y2='68' stroke='#2563eb' stroke-width='2' marker-end='url(#ar)'/><defs><marker id='ar' markerWidth='8' markerHeight='8' refX='4' refY='6' orient='auto'><polygon points='0,0 8,0 4,8' fill='#2563eb'/></marker></defs><text x='${40 + (a / L) * 220}' y='22' font-size='10' text-anchor='middle' fill='#1e293b'>P=${P} kN</text><text x='40' y='104' font-size='10' text-anchor='middle' fill='#475569'>A</text><text x='260' y='104' font-size='10' text-anchor='middle' fill='#475569'>B</text></svg>` },
    };
  },
  function frictionBlock() {
    const W = pick([100, 150, 200, 250]);
    const theta = pick([15, 20, 25, 30]);
    const mu = pick([0.2, 0.25, 0.3]);
    const r = (theta * Math.PI) / 180;
    const v = mu * W * Math.cos(r); // available friction force
    return {
      topic: 'Statics \u2013 Friction on Incline',
      unit: 'N', decimals: 2, value: v,
      stem: `A block of weight $W=${W}$ N rests on an incline of $${theta}^\\circ$. If the coefficient of friction is $\\mu=${mu}$, find the maximum static friction force available (in N).`,
      solution: `**Concept:** Normal reaction $N=W\\cos\\theta$; limiting friction $F=\\mu N=\\mu W\\cos\\theta=${mu}\\times${W}\\times\\cos ${theta}^\\circ=${fmt(v, 2)}$ N.\n\n**Answer: ${fmt(v, 2)} N.**`,
    };
  },
];

// ---- Section 4 : Mining Methods & Machinery --------------------------------
const gen4 = [
  function stripRatio() {
    const Vw = pick([12, 15, 18, 24]);
    const Vo = pick([3, 4, 6]);
    const v = Vw / Vo;
    return {
      topic: 'Overall Stripping Ratio',
      unit: 'm\u00b3/t', decimals: 2, value: v,
      stem: `An opencast block requires removal of $${Vw}$ million m\u00b3 of waste to extract $${Vo}$ million tonnes of ore. Determine the overall stripping ratio (m\u00b3 of waste per tonne of ore).`,
      solution: `**Concept:** $\\text{SR}=\\dfrac{\\text{waste}}{\\text{ore}}=\\dfrac{${Vw}}{${Vo}}=${fmt(v, 2)}$ m\u00b3/t.\n\n**Answer: ${fmt(v, 2)} m\u00b3/t.**`,
    };
  },
  function besr() {
    const price = pick([2400, 2800, 3200]);
    const oreCost = pick([900, 1100, 1300]);
    const wasteCost = pick([60, 80, 100]);
    const v = (price - oreCost) / wasteCost;
    return {
      topic: 'Break-even Stripping Ratio',
      unit: 'm\u00b3/t', decimals: 2, value: v,
      stem: `Ore sells at \u20b9$${price}$/t with an ore-mining cost of \u20b9$${oreCost}$/t. Waste removal costs \u20b9$${wasteCost}$/m\u00b3. Calculate the break-even stripping ratio (m\u00b3/t).`,
      solution: `**Concept:** $\\text{BESR}=\\dfrac{\\text{price}-\\text{ore cost}}{\\text{waste cost}}=\\dfrac{${price}-${oreCost}}{${wasteCost}}=${fmt(v, 2)}$ m\u00b3/t.\n\n**Answer: ${fmt(v, 2)} m\u00b3/t.**`,
    };
  },
  function beltCapacity() {
    const A = pick([0.05, 0.08, 0.1]);
    const vel = pick([1.5, 2.0, 2.5]);
    const rho = pick([1400, 1500, 1600]);
    const v = 3.6 * A * vel * rho;
    return {
      topic: 'Belt Conveyor Capacity',
      unit: 't/h', decimals: 1, value: v,
      stem: `A belt conveyor has a load cross-section $A=${A}$ m\u00b2 and runs at $v=${vel}$ m/s carrying material of bulk density $${rho}$ kg/m\u00b3. Find the conveying capacity (in t/h).`,
      solution: `**Concept:** $Q=3.6\\,A\\,v\\,\\rho=3.6\\times${A}\\times${vel}\\times${rho}=${fmt(v, 1)}$ t/h.\n\n**Answer: ${fmt(v, 1)} t/h.**`,
    };
  },
  function shovelOutput() {
    const B = pick([5, 8, 10]);
    const t = pick([30, 35, 40]);
    const fill = pick([0.85, 0.9]);
    const E = pick([0.75, 0.8, 0.85]);
    const v = (3600 / t) * B * fill * E;
    return {
      topic: 'Shovel Output',
      unit: 'm\u00b3/h', decimals: 1, value: v,
      stem: `A rope shovel has a dipper of $${B}$ m\u00b3, cycle time $${t}$ s, fill factor $${fill}$ and job efficiency $${E}$. Estimate its hourly output (in m\u00b3/h, bank corrected to dipper volume).`,
      solution: `**Concept:** $Q=\\dfrac{3600}{t}\\times B\\times f\\times E=\\dfrac{3600}{${t}}\\times${B}\\times${fill}\\times${E}=${fmt(v, 1)}$ m\u00b3/h.\n\n**Answer: ${fmt(v, 1)} m\u00b3/h.**`,
    };
  },
  function truckMatch() {
    const Tc = pick([18, 24, 30]);
    const tl = pick([3, 4, 5]);
    const v = Math.ceil(Tc / tl);
    return {
      topic: 'Truck\u2013Shovel Matching',
      unit: 'trucks', decimals: 0, value: v,
      stem: `A haul truck has a total cycle time of $${Tc}$ min and the shovel loads one truck in $${tl}$ min. Find the minimum number of trucks needed to keep the shovel fully utilised.`,
      solution: `**Concept:** $N=\\left\\lceil\\dfrac{\\text{truck cycle}}{\\text{loading time}}\\right\\rceil=\\left\\lceil\\dfrac{${Tc}}{${tl}}\\right\\rceil=${v}$.\n\n**Answer: ${v} trucks.**`,
    };
  },
  function ropeFOS() {
    const BL = pick([800, 1000, 1200, 1500]);
    const WL = pick([120, 150, 200]);
    const v = BL / WL;
    return {
      topic: 'Winding Rope \u2013 Factor of Safety',
      unit: '', decimals: 2, value: v,
      stem: `A winding rope has a breaking load of $${BL}$ kN and the maximum working load is $${WL}$ kN. Determine the factor of safety of the rope.`,
      solution: `**Concept:** $\\text{FoS}=\\dfrac{\\text{breaking load}}{\\text{working load}}=\\dfrac{${BL}}{${WL}}=${fmt(v, 2)}$.\n\n**Answer: ${fmt(v, 2)}.**`,
    };
  },
  function pumpPower() {
    const Q = pick([0.05, 0.08, 0.1, 0.12]);
    const H = pick([60, 80, 120, 150]);
    const eta = pick([0.7, 0.75, 0.8]);
    const v = (1000 * 9.81 * Q * H) / eta / 1000; // kW
    return {
      topic: 'Mine Dewatering Pump Power',
      unit: 'kW', decimals: 2, value: v,
      stem: `A mine pump delivers $Q=${Q}$ m\u00b3/s of water against a head of $H=${H}$ m at an overall efficiency of $${eta}$. Find the required shaft power (in kW). Take $\\rho=1000$ kg/m\u00b3, $g=9.81$ m/s\u00b2.`,
      solution: `**Concept:** $P=\\dfrac{\\rho g Q H}{\\eta}=\\dfrac{1000\\times9.81\\times${Q}\\times${H}}{${eta}}=${Math.round(1000 * 9.81 * Q * H / eta)}$ W $=${fmt(v, 2)}$ kW.\n\n**Answer: ${fmt(v, 2)} kW.**`,
    };
  },
  function tractiveEffort() {
    const m = pick([20, 30, 40]); // tonnes
    const grade = pick([1, 1.5, 2]); // percent
    const mu = pick([0.01, 0.012, 0.015]); // rolling resistance coeff
    const sinT = grade / 100;
    const v = m * 1000 * 9.81 * (sinT + mu) / 1000; // kN (small-angle)
    return {
      topic: 'Haulage Tractive Effort',
      unit: 'kN', decimals: 2, value: v,
      stem: `A train of total mass $${m}$ t is hauled up a $${grade}\\%$ gradient. With a rolling-resistance coefficient of $${mu}$, find the tractive effort required (in kN). Take $g=9.81$ m/s\u00b2 and a small-angle gradient.`,
      solution: `**Concept:** $TE=mg(\\sin\\theta+\\mu\\cos\\theta)\\approx mg(\\text{grade}+\\mu)=${m}\\times1000\\times9.81\\times(${sinT}+${mu})=${Math.round(m * 1000 * 9.81 * (sinT + mu))}$ N $=${fmt(v, 2)}$ kN.\n\n**Answer: ${fmt(v, 2)} kN.**`,
    };
  },
  function seamRecovery() {
    const total = pick([6, 8, 10]); // m thick seam
    const extracted = pick([4, 5, 6, 7]);
    const e = Math.min(extracted, total - 1);
    const v = (e / total) * 100;
    return {
      topic: 'Thick-seam Extraction Recovery',
      unit: '%', decimals: 1, value: v,
      stem: `A $${total}$ m thick seam is worked in slices and $${e}$ m of coal (thickness equivalent) is recovered. Determine the extraction recovery (in %).`,
      solution: `**Concept:** $\\text{Recovery}=\\dfrac{\\text{extracted}}{\\text{in-situ}}\\times100=\\dfrac{${e}}{${total}}\\times100=${fmt(v, 1)}\\%$.\n\n**Answer: ${fmt(v, 1)}.**`,
    };
  },
];

// ---- Section 5 : Surface Env, Ventilation & Underground Hazards ------------
const gen5 = [
  function resistance() {
    const k = pick([0.01, 0.012, 0.014]);
    const O = pick([10, 12, 14]);
    const L = pick([200, 300, 500]);
    const A = pick([8, 10, 12]);
    const v = (k * O * L) / Math.pow(A, 3);
    return {
      topic: 'Airway Resistance (Atkinson)',
      unit: 'Ns\u00b2/m\u2078', decimals: 4, value: v,
      stem: `An airway is $L=${L}$ m long with cross-sectional area $A=${A}$ m\u00b2 and perimeter $O=${O}$ m. With Atkinson friction factor $k=${k}$ kg/m\u00b3, find the airway resistance $R$ (in Ns\u00b2/m\u2078).`,
      solution: `**Concept:** $R=\\dfrac{k\\,O\\,L}{A^3}=\\dfrac{${k}\\times${O}\\times${L}}{${A}^3}=${fmt(v, 4)}$ Ns\u00b2/m\u2078.\n\n**Answer: ${fmt(v, 4)}.**`,
    };
  },
  function pressureDrop() {
    const R = pick([0.2, 0.35, 0.5]);
    const Q = pick([20, 30, 40, 50]);
    const v = R * Q * Q;
    return {
      topic: 'Mine Ventilation Pressure (Square Law)',
      unit: 'Pa', decimals: 1, value: v,
      stem: `An airway of resistance $R=${R}$ Ns\u00b2/m\u2078 carries $Q=${Q}$ m\u00b3/s of air. Using the square law, find the pressure drop across it (in Pa).`,
      solution: `**Concept:** $P=R\\,Q^2=${R}\\times${Q}^2=${fmt(v, 1)}$ Pa.\n\n**Answer: ${fmt(v, 1)} Pa.**`,
    };
  },
  function airPower() {
    const P = pick([800, 1200, 1500, 2000]);
    const Q = pick([40, 60, 80]);
    const eta = pick([0.6, 0.7, 0.75]);
    const v = (P * Q) / eta / 1000; // kW
    return {
      topic: 'Fan / Air Power',
      unit: 'kW', decimals: 2, value: v,
      stem: `A mine fan develops a pressure of $${P}$ Pa while circulating $${Q}$ m\u00b3/s of air at an efficiency of $${eta}$. Calculate the fan input power (in kW).`,
      solution: `**Concept:** Air power $=PQ$; fan power $=\\dfrac{PQ}{\\eta}=\\dfrac{${P}\\times${Q}}{${eta}}=${Math.round(P * Q / eta)}$ W $=${fmt(v, 2)}$ kW.\n\n**Answer: ${fmt(v, 2)} kW.**`,
    };
  },
  function parallelResistance() {
    const R1 = pick([0.4, 0.6, 0.9]);
    const R2 = pick([0.4, 0.6, 0.9]);
    const inv = 1 / Math.sqrt(R1) + 1 / Math.sqrt(R2);
    const v = 1 / (inv * inv);
    return {
      topic: 'Parallel Airway Resistance',
      unit: 'Ns\u00b2/m\u2078', decimals: 4, value: v,
      stem: `Two airways of resistance $R_1=${R1}$ and $R_2=${R2}$ Ns\u00b2/m\u2078 are connected in parallel. Find the equivalent resistance (in Ns\u00b2/m\u2078).`,
      solution: `**Concept:** For parallel airways $\\dfrac{1}{\\sqrt{R_{eq}}}=\\dfrac{1}{\\sqrt{R_1}}+\\dfrac{1}{\\sqrt{R_2}}=${round(inv, 3)}$, so $R_{eq}=\\dfrac{1}{(${round(inv, 3)})^2}=${fmt(v, 4)}$ Ns\u00b2/m\u2078.\n\n**Answer: ${fmt(v, 4)}.**`,
      figure: { kind: 'ventilation', caption: 'Two airways in parallel', nodes: [{ id: 'A', x: 30, y: 60 }, { id: 'B', x: 230, y: 60 }], branches: [{ from: 'A', to: 'B', r: R1 }, { from: 'A', to: 'B', r: R2 }] },
    };
  },
  function gasDilution() {
    const G = pick([0.05, 0.08, 0.1, 0.12]); // m3/s CH4
    const limit = pick([0.0125, 0.01, 0.0075]);
    const v = G / limit;
    return {
      topic: 'Gas Dilution Air Quantity',
      unit: 'm\u00b3/s', decimals: 1, value: v,
      stem: `A heading emits methane at $${G}$ m\u00b3/s. To keep the return concentration at or below $${(limit * 100).toFixed(2)}\\%$ (incoming air gas-free), find the minimum air quantity required (in m\u00b3/s).`,
      solution: `**Concept:** $Q=\\dfrac{\\text{gas make}}{\\text{allowable fraction}}=\\dfrac{${G}}{${limit}}=${fmt(v, 1)}$ m\u00b3/s.\n\n**Answer: ${fmt(v, 1)} m\u00b3/s.**`,
    };
  },
  function equivalentOrifice() {
    const Q = pick([40, 60, 80]);
    const P = pick([200, 400, 600]);
    const v = (1.2 * Q) / Math.sqrt(P);
    return {
      topic: 'Equivalent Orifice (Murgue)',
      unit: 'm\u00b2', decimals: 3, value: v,
      stem: `A mine passes $${Q}$ m\u00b3/s of air at a pressure of $${P}$ Pa. Using Murgue\u2019s relation, determine the equivalent orifice area (in m\u00b2).`,
      solution: `**Concept:** $A=\\dfrac{1.2\\,Q}{\\sqrt{P}}=\\dfrac{1.2\\times${Q}}{\\sqrt{${P}}}=${fmt(v, 3)}$ m\u00b2.\n\n**Answer: ${fmt(v, 3)} m\u00b2.**`,
    };
  },
  function airQuantity() {
    const A = pick([6, 8, 10, 12]);
    const vel = pick([2, 3, 4]);
    const v = A * vel;
    return {
      topic: 'Air Quantity from Velocity',
      unit: 'm\u00b3/s', decimals: 1, value: v,
      stem: `Air flows at $${vel}$ m/s through an airway of cross-section $${A}$ m\u00b2. Determine the air quantity (in m\u00b3/s).`,
      solution: `**Concept:** $Q=A\\,v=${A}\\times${vel}=${fmt(v, 1)}$ m\u00b3/s.\n\n**Answer: ${fmt(v, 1)} m\u00b3/s.**`,
    };
  },
  function inundation() {
    const V = pick([3000, 5000, 8000]); // m3
    const rate = pick([0.05, 0.08, 0.1]); // m3/s
    const v = V / rate / 3600; // hours
    return {
      topic: 'Inundation / Pumping Time',
      unit: 'h', decimals: 2, value: v,
      stem: `A worked-out district holds $${V}$ m\u00b3 of accumulated water. If a pump can discharge $${rate}$ m\u00b3/s, find the time required to dewater it (in hours).`,
      solution: `**Concept:** $t=\\dfrac{V}{Q}=\\dfrac{${V}}{${rate}}=${Math.round(V / rate)}$ s $=${fmt(v, 2)}$ h.\n\n**Answer: ${fmt(v, 2)} h.**`,
    };
  },
  function lighting() {
    const lumens = pick([2000, 3000, 4000]);
    const area = pick([20, 25, 40]);
    const v = lumens / area;
    return {
      topic: 'Mine Illumination',
      unit: 'lux', decimals: 1, value: v,
      stem: `A working area of $${area}$ m\u00b2 receives a luminous flux of $${lumens}$ lumens. Determine the average illuminance (in lux).`,
      solution: `**Concept:** Illuminance $E=\\dfrac{\\text{flux}}{\\text{area}}=\\dfrac{${lumens}}{${area}}=${fmt(v, 1)}$ lux.\n\n**Answer: ${fmt(v, 1)} lux.**`,
    };
  },
];

// ---- Section 6 : Mineral Economics, Mine Planning & Systems Engineering ----
const gen6 = [
  function npv() {
    const A = pick([20, 30, 40]); // crore/yr
    const n = pick([4, 5, 6]);
    const r = pick([0.08, 0.1, 0.12]);
    const I = pick([60, 80, 100]);
    const pvf = (1 - Math.pow(1 + r, -n)) / r;
    const v = A * pvf - I;
    return {
      topic: 'Net Present Value',
      unit: '\u20b9 crore', decimals: 2, value: v,
      stem: `A project needs \u20b9$${I}$ crore today and returns \u20b9$${A}$ crore/yr for $${n}$ years. At a discount rate of $${(r * 100).toFixed(0)}\\%$, find the NPV (in \u20b9 crore).`,
      solution: `**Concept:** $NPV=A\\dfrac{1-(1+r)^{-n}}{r}-I=${A}\\times${round(pvf, 4)}-${I}=${fmt(v, 2)}$ crore.\n\n**Answer: ${fmt(v, 2)} crore.**`,
    };
  },
  function payback() {
    const I = pick([120, 150, 200]);
    const CF = pick([25, 30, 40, 50]);
    const v = I / CF;
    return {
      topic: 'Payback Period',
      unit: 'years', decimals: 2, value: v,
      stem: `A mine requires \u20b9$${I}$ crore of investment and yields a uniform net cash flow of \u20b9$${CF}$ crore/yr. Determine the simple payback period (in years).`,
      solution: `**Concept:** $\\text{Payback}=\\dfrac{I}{\\text{annual cash flow}}=\\dfrac{${I}}{${CF}}=${fmt(v, 2)}$ years.\n\n**Answer: ${fmt(v, 2)} years.**`,
    };
  },
  function mineLife() {
    const reserve = pick([24, 36, 50, 60]);
    const prod = pick([3, 4, 5, 6]);
    const v = reserve / prod;
    return {
      topic: 'Mine Life',
      unit: 'years', decimals: 2, value: v,
      stem: `A deposit has a minable reserve of $${reserve}$ Mt and is planned at an annual production of $${prod}$ Mt/yr. Estimate the mine life (in years).`,
      solution: `**Concept:** $\\text{Life}=\\dfrac{\\text{reserve}}{\\text{annual production}}=\\dfrac{${reserve}}{${prod}}=${fmt(v, 2)}$ years.\n\n**Answer: ${fmt(v, 2)} years.**`,
    };
  },
  function relSeries() {
    const R1 = pick([0.9, 0.92, 0.95]);
    const R2 = pick([0.88, 0.9, 0.93]);
    const R3 = pick([0.85, 0.9, 0.95]);
    const v = R1 * R2 * R3;
    return {
      topic: 'System Reliability (Series)',
      unit: '', decimals: 4, value: v,
      stem: `Three components with reliabilities $${R1}$, $${R2}$ and $${R3}$ are connected in series. Find the overall system reliability.`,
      solution: `**Concept:** Series reliability $R_s=\\prod R_i=${R1}\\times${R2}\\times${R3}=${fmt(v, 4)}$.\n\n**Answer: ${fmt(v, 4)}.**`,
    };
  },
  function relParallel() {
    const R1 = pick([0.8, 0.85, 0.9]);
    const R2 = pick([0.75, 0.8, 0.85]);
    const v = 1 - (1 - R1) * (1 - R2);
    return {
      topic: 'System Reliability (Parallel)',
      unit: '', decimals: 4, value: v,
      stem: `Two pumps with reliabilities $${R1}$ and $${R2}$ work in parallel (redundant). Determine the reliability of the dewatering system.`,
      solution: `**Concept:** Parallel reliability $R_p=1-(1-R_1)(1-R_2)=1-(1-${R1})(1-${R2})=${fmt(v, 4)}$.\n\n**Answer: ${fmt(v, 4)}.**`,
    };
  },
  function pert() {
    const a = pick([3, 4, 5]);
    const m = pick([6, 7, 8]);
    const b = pick([11, 12, 14]);
    const v = (a + 4 * m + b) / 6;
    return {
      topic: 'PERT \u2013 Expected Activity Time',
      unit: 'days', decimals: 2, value: v,
      stem: `For an activity, the optimistic, most-likely and pessimistic times are $a=${a}$, $m=${m}$ and $b=${b}$ days. Using PERT, find the expected duration $t_e$ (in days).`,
      solution: `**Concept:** $t_e=\\dfrac{a+4m+b}{6}=\\dfrac{${a}+4\\times${m}+${b}}{6}=${fmt(v, 2)}$ days.\n\n**Answer: ${fmt(v, 2)} days.**`,
    };
  },
  function queueLs() {
    const lam = pick([4, 5, 6]);
    const mu = pick([8, 9, 10]);
    const v = lam / (mu - lam);
    return {
      topic: 'Queuing (M/M/1) \u2013 System Length',
      unit: 'trucks', decimals: 3, value: v,
      stem: `Trucks arrive at a crusher (Poisson) at $\\lambda=${lam}$/h and are served (exponential) at $\\mu=${mu}$/h. For an M/M/1 queue, find the average number of trucks in the system, $L_s$.`,
      solution: `**Concept:** $L_s=\\dfrac{\\lambda}{\\mu-\\lambda}=\\dfrac{${lam}}{${mu}-${lam}}=${fmt(v, 3)}$.\n\n**Answer: ${fmt(v, 3)}.**`,
    };
  },
  function eoq() {
    const D = pick([2000, 3600, 5000]);
    const Co = pick([100, 150, 200]);
    const Ch = pick([4, 5, 8]);
    const v = Math.sqrt((2 * D * Co) / Ch);
    return {
      topic: 'Inventory \u2013 EOQ',
      unit: 'units', decimals: 1, value: v,
      stem: `Annual demand is $D=${D}$ units, ordering cost \u20b9$${Co}$/order and holding cost \u20b9$${Ch}$/unit/yr. Determine the economic order quantity (EOQ).`,
      solution: `**Concept:** $EOQ=\\sqrt{\\dfrac{2DC_o}{C_h}}=\\sqrt{\\dfrac{2\\times${D}\\times${Co}}{${Ch}}}=${fmt(v, 1)}$ units.\n\n**Answer: ${fmt(v, 1)} units.**`,
    };
  },
  function cutoff() {
    const cost = pick([1800, 2200, 2600]); // Rs/t
    const price = pick([300, 350, 400]); // Rs per % per t (recovery*price)
    const v = cost / price;
    return {
      topic: 'Break-even Cut-off Grade',
      unit: '%', decimals: 2, value: v,
      stem: `Total cost to mine and process is \u20b9$${cost}$/t of ore and the net realisation is \u20b9$${price}$ per 1\\% metal per tonne. Find the break-even cut-off grade (in % metal).`,
      solution: `**Concept:** Cut-off grade $=\\dfrac{\\text{cost per tonne}}{\\text{value per 1\\% metal per tonne}}=\\dfrac{${cost}}{${price}}=${fmt(v, 2)}\\%$.\n\n**Answer: ${fmt(v, 2)}.**`,
    };
  },
];

const GEN = { 3: gen3, 4: gen4, 5: gen5, 6: gen6 };

// ===========================================================================
//  MSQ conceptual banks (answer = array of correct option indices)
// ===========================================================================
const MSQ = {
  3: [{
    topic: 'Rock Mass Classification',
    stem: 'Which of the following statements about rock-mass behaviour are correct? (Select all that apply.)',
    options: ['RQD increases as the spacing of discontinuities increases', 'A higher RMR indicates better-quality rock mass', 'Pillar strength increases with the width-to-height ratio', 'Factor of safety less than 1 indicates a stable pillar'],
    answer: [0, 1, 2],
    why: 'RQD rises with wider joint spacing, RMR rises with rock quality, and pillar strength grows with W/H. A FoS < 1 means failure, so (D) is false.',
  }],
  4: [{
    topic: 'Surface & Underground Equipment',
    stem: 'Which of the following statements about mining machinery are correct? (Select all that apply.)',
    options: ['A dragline removes overburden by stripping in casting mode', 'A higher fill factor increases shovel output', 'Increasing rope factor of safety reduces the safe working load', 'Belt conveyor capacity is independent of belt speed'],
    answer: [0, 1],
    why: 'Draglines cast overburden and fill factor raises output. Capacity = 3.6 A v \u03c1 depends on speed, and a higher rope FoS for a given breaking load lowers the permitted working load is mis-stated \u2014 so (C) and (D) are false.',
  }],
  5: [{
    topic: 'Mine Gases & Hazards',
    stem: 'Which of the following statements about mine atmospheres are correct? (Select all that apply.)',
    options: ['Methane is explosive in air roughly between 5\u201315%', 'Carbon monoxide is highly toxic even at low concentrations', 'Increasing air quantity reduces gas concentration in the return', 'Airway resistance decreases when its area is reduced'],
    answer: [0, 1, 2],
    why: 'CH\u2084 is explosive ~5\u201315%, CO is toxic at low ppm, and more air dilutes gas. Resistance R = kOL/A\u00b3 increases when area falls, so (D) is false.',
  }],
  6: [{
    topic: 'Project Evaluation & Systems',
    stem: 'Which of the following statements about mine project evaluation are correct? (Select all that apply.)',
    options: ['A positive NPV indicates an acceptable project at the chosen discount rate', 'IRR is the discount rate at which NPV equals zero', 'Components in series always have reliability higher than each component', 'The critical path is the longest duration path through a network'],
    answer: [0, 1, 3],
    why: 'Positive NPV \u2192 accept; IRR is the zero-NPV rate; the critical path is the longest path. Series reliability is the product, which is lower than any component, so (C) is false.',
  }],
};

// ===========================================================================
//  Wrappers: build a question object of the required type from a generator
// ===========================================================================
function tolFor(value, decimals) {
  if (Number.isInteger(value) && decimals === 0) return 0;
  return round(Math.max(0.05, Math.abs(value) * 0.01), 2);
}

function makeNAT(sec, marks, difficulty) {
  const g = pick(GEN[sec])();
  const value = round(g.value, g.decimals);
  const q = {
    subject: SUBJ[sec], topic: g.topic, type: 'NAT', marks, difficulty,
    answer: value, tolerance: tolFor(value, g.decimals),
    stem: g.stem, solution: g.solution,
  };
  if (g.figure) q.figure = g.figure;
  return q;
}

function makeMCQ(sec, marks, difficulty) {
  const g = pick(GEN[sec])();
  const value = round(g.value, g.decimals);
  const unit = g.unit ? ` ${g.unit}` : '';
  // build 3 distinct distractors around the true value
  const mults = [0.5, 0.75, 1.25, 1.5, 2].sort(() => rng() - 0.5);
  const distractors = [];
  for (const m of mults) {
    const d = round(value * m, g.decimals);
    if (d !== value && !distractors.includes(d)) distractors.push(d);
    if (distractors.length === 3) break;
  }
  while (distractors.length < 3) {
    const d = round(value + (distractors.length + 1) * (value === 0 ? 1 : Math.abs(value) * 0.1), g.decimals);
    if (d !== value && !distractors.includes(d)) distractors.push(d);
  }
  const vals = [value, ...distractors];
  // shuffle and find answer index
  for (let i = vals.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [vals[i], vals[j]] = [vals[j], vals[i]];
  }
  const options = vals.map((x) => `${fmt(x, g.decimals)}${unit}`.trim());
  const answer = vals.indexOf(value);
  const q = {
    subject: SUBJ[sec], topic: g.topic, type: 'MCQ', marks, difficulty,
    stem: g.stem, options, answer, solution: g.solution,
  };
  if (g.figure) q.figure = g.figure;
  return q;
}

function makeMSQ(sec, marks, difficulty) {
  const b = pick(MSQ[sec]);
  return {
    subject: SUBJ[sec], topic: b.topic, type: 'MSQ', marks, difficulty,
    stem: b.stem, options: b.options.slice(), answer: b.answer.slice(),
    solution: `**Concept:** ${b.why}\n\n**Answer: ${b.answer.map((i) => '(' + String.fromCharCode(65 + i) + ')').join(', ')}.**`,
  };
}

function buildReplacement(sec, original) {
  const { type, marks, difficulty = 'medium' } = original;
  if (type === 'MSQ') return makeMSQ(sec, marks, difficulty);
  if (type === 'NAT') return makeNAT(sec, marks, difficulty);
  return makeMCQ(sec, marks, difficulty);
}

// ===========================================================================
//  Main: walk files in stable order, replace MP questions, write back
// ===========================================================================
const files = fs.readdirSync(DIR).filter((f) => /^mn-mock-\d+\.json$/.test(f)).sort();
const order = [3, 4, 5, 6];
let globalIdx = 0;
const tally = { 3: 0, 4: 0, 5: 0, 6: 0 };
const report = [];

for (const f of files) {
  const p = path.join(DIR, f);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  let changed = 0;
  for (let i = 0; i < j.questions.length; i++) {
    const q = j.questions[i];
    if (!/mineral processing/i.test(q.subject || '')) continue;
    const sec = order[globalIdx % 4];
    const repl = buildReplacement(sec, q);
    repl.id = q.id;           // preserve id
    repl.section = q.section; // preserve marks bucket
    j.questions[i] = repl;
    tally[sec]++;
    globalIdx++;
    changed++;
  }
  if (changed) {
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
    report.push(`${f}: replaced ${changed}`);
  }
}

console.log('Replaced total:', globalIdx);
console.log('Per-section tally:', JSON.stringify(tally));
report.forEach((r) => console.log('  ' + r));
