/*
 * build_fullset_mocks.js
 * ---------------------------------------------------------------------------
 * Generates 5 NEW full-syllabus GATE Mining (MN) mocks (mn-mock-16 .. 20),
 * each in the exact GATE pattern (65 Q / 100 marks / 180 min):
 *   - General Aptitude .......... 10 Q (5 x 1-mark + 5 x 2-mark) = 15 marks
 *   - Technical (1-mark) ........ 25 Q
 *   - Technical (2-mark) ........ 30 Q ............................ = 85 marks
 *
 * Coverage is deliberately weighted toward the GATE topics that were under-
 * represented in the existing bank (the "left-out" topics):
 *   Sec1  Fourier/Taylor series, hypothesis testing, Binomial/Poisson/Normal
 *   Sec2  circular curves, photogrammetry, EDM/Total Station/GPS/GIS, blasting
 *   Sec3  engineering mechanics / statics, rock bursts
 *   Sec4  highwall & thick-seam mining, haulage, pumps, power transmission
 *   Sec5  mine fires, inundation, rescue, noise, lighting, reclamation, dust
 *   Sec6  reliability, LP, transportation, CPM/PERT, queuing, EOQ, UNFC
 *
 * Every numeric answer is computed in JS (correct by construction); MCQ
 * distractors are generated around the true value; figures use the typed
 * `figure` schema rendered by components/question-figure.tsx
 * (mohr / ventilation / bench / stress-block / pq-curve / svg).
 *
 * Run: node scripts/build_fullset_mocks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'apps', 'web', 'src', 'data', 'questions', 'mocks');

// ---- seedable RNG ----------------------------------------------------------
let _s = 1;
function seed(n) { _s = n >>> 0; }
function rng() {
  _s |= 0; _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (a) => a[Math.floor(rng() * a.length)];
const round = (x, d = 2) => { const p = Math.pow(10, d); return Math.round(x * p) / p; };
const fmt = (x, d) => (d === 0 ? String(Math.round(x)) : Number(x).toFixed(d));
const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const comb = (n, k) => fact(n) / (fact(k) * fact(n - k));

const SUBJ = {
  3: 'Geomechanics & Ground Control',
  4: 'Mining Methods & Machinery',
  5: 'Surface Environment, Ventilation & Underground Hazards',
  6: 'Mineral Economics, Mine Planning & Systems Engineering',
};

// ===========================================================================
//  NUMERIC GENERATORS  -> { subject, topic, value, decimals, unit, stem, solution, figure? }
// ===========================================================================

// ---- General Aptitude ------------------------------------------------------
const genGA = [
  function pct() {
    const x = pick([240, 320, 450, 560]); const p = pick([15, 20, 25]);
    const v = x * (1 + p / 100);
    return { subject: 'General Aptitude', topic: 'Percentages', unit: '', decimals: 0, value: v,
      stem: `A quantity of $${x}$ is increased by $${p}\\%$. What is the new value?`,
      solution: `**Concept:** New $=x(1+p/100)=${x}\\times${1 + p / 100}=${fmt(v, 0)}$. **Answer: ${fmt(v, 0)}.**` };
  },
  function speed() {
    const len = pick([120, 150, 180]); const plat = pick([220, 250, 300]); const kmph = pick([54, 72, 90]);
    const ms = kmph * 5 / 18; const v = (len + plat) / ms;
    return { subject: 'General Aptitude', topic: 'Speed-Time-Distance', unit: 's', decimals: 1, value: v,
      stem: `A train $${len}$ m long at $${kmph}$ km/h crosses a $${plat}$ m platform. Time taken (in s)?`,
      solution: `**Concept:** speed $=${kmph}\\times\\tfrac{5}{18}=${round(ms, 2)}$ m/s; $t=\\dfrac{${len}+${plat}}{${round(ms, 2)}}=${fmt(v, 1)}$ s. **Answer: ${fmt(v, 1)} s.**` };
  },
  function avg() {
    const n = pick([5, 6, 8]); const a = pick([20, 30, 40]); const rem = pick([12, 18, 24]);
    const v = (n * a - rem) / (n - 1);
    return { subject: 'General Aptitude', topic: 'Averages', unit: '', decimals: 2, value: v,
      stem: `The average of $${n}$ numbers is $${a}$. If $${rem}$ is removed, the average of the rest is?`,
      solution: `**Concept:** sum $=${n}\\times${a}=${n * a}$; new avg $=\\dfrac{${n * a}-${rem}}{${n - 1}}=${fmt(v, 2)}$. **Answer: ${fmt(v, 2)}.**` };
  },
  function prob() {
    const r = pick([3, 4, 5]); const b = pick([2, 3, 4]);
    const v = r / (r + b);
    return { subject: 'General Aptitude', topic: 'Probability', unit: '', decimals: 3, value: v,
      stem: `A bag has $${r}$ red and $${b}$ blue balls. Probability that a randomly drawn ball is red?`,
      solution: `**Concept:** $P=\\dfrac{${r}}{${r}+${b}}=${fmt(v, 3)}$. **Answer: ${fmt(v, 3)}.**` };
  },
  function di() {
    const a = pick([40, 50, 60]); const b = round(a * pick([1.2, 1.25, 1.5]), 0);
    const v = ((b - a) / a) * 100;
    return { subject: 'General Aptitude', topic: 'Data Interpretation', unit: '%', decimals: 1, value: v,
      stem: `The bar chart shows production (Mt) for two years: Year-1 $=${a}$ and Year-2 $=${b}$. Percentage increase?`,
      solution: `**Concept:** $\\dfrac{${b}-${a}}{${a}}\\times100=${fmt(v, 1)}\\%$. **Answer: ${fmt(v, 1)}\\%.**`,
      figure: { kind: 'svg', caption: 'Annual production (Mt)', markup: `<svg viewBox='0 0 220 160' style='width:100%;max-width:220px;height:auto' xmlns='http://www.w3.org/2000/svg'><rect width='220' height='160' fill='#fff'/><line x1='30' y1='15' x2='30' y2='135' stroke='#475569'/><line x1='30' y1='135' x2='210' y2='135' stroke='#475569'/><rect x='70' y='${135 - a}' width='40' height='${a}' fill='#2563eb'/><rect x='140' y='${135 - b}' width='40' height='${b}' fill='#1d4ed8'/><text x='90' y='148' font-size='10' text-anchor='middle' fill='#475569'>Y1</text><text x='160' y='148' font-size='10' text-anchor='middle' fill='#475569'>Y2</text><text x='90' y='${130 - a}' font-size='9' text-anchor='middle' fill='#1e293b'>${a}</text><text x='160' y='${130 - b}' font-size='9' text-anchor='middle' fill='#1e293b'>${b}</text></svg>` } };
  },
];
const cmcqGA = [
  { topic: 'Grammar', stem: 'Choose the correct word: "She is senior ___ him by two years."', options: ['than', 'to', 'from', 'over'], answer: 1, why: 'Latin comparatives (senior, junior) take "to".' },
  { topic: 'Vocabulary', stem: 'Select the word most nearly OPPOSITE in meaning to "abundant".', options: ['plentiful', 'scarce', 'ample', 'copious'], answer: 1, why: '"Scarce" is the antonym of "abundant".' },
  { topic: 'Verbal Analogy', stem: 'Hammer : Carpenter :: ____ : Miner', options: ['Brush', 'Pick', 'Needle', 'Scalpel'], answer: 1, why: 'A miner characteristically uses a pick, as a carpenter uses a hammer.' },
  { topic: 'Logical Reasoning', stem: 'If all engineers are graduates and some graduates are managers, which is necessarily true?', options: ['All engineers are managers', 'Some engineers are managers', 'All graduates are engineers', 'None can be concluded for certain'], answer: 3, why: 'The premises do not force any link between engineers and managers.' },
  { topic: 'Number Series', stem: 'Find the next term: 2, 6, 12, 20, 30, ___', options: ['40', '42', '44', '36'], answer: 1, why: 'Differences 4,6,8,10 -> next +12 -> 42 (= n(n+1)).' },
];

// ---- Section 1 : Engineering Mathematics (left-out emphasis) ---------------
const gen1 = [
  function fourierA0() {
    const k = pick([2, 3, 4]);
    const v = 2 * k; // a0 = (1/pi) int_0^{2pi} (k? ) ... use f(x)=k x? keep simple: f(x)=kx on (0,2pi): a0=(1/pi)*k*2pi^2/... avoid; use average*2
    // Use: for f(x)=k on (0,L), a0 (with a0/2 = average) => average value = k; we ask average value of f(x)=kx on (0,2): = k*1 = k
    const v2 = k * 1; // average of kx on (0,2) is k*(2)/2 = k? average = (1/2)int_0^2 kx dx = (1/2)(k*2)=k
    return { subject: 'Engineering Mathematics', topic: 'Fourier Series', unit: '', decimals: 2, value: v2,
      stem: `For $f(x)=${k}x$ on the interval $(0,2)$, the constant (mean) term $\\dfrac{a_0}{2}$ of its Fourier series equals the average value of $f$. Find it.`,
      solution: `**Concept:** $\\dfrac{a_0}{2}=\\dfrac{1}{2}\\int_0^2 ${k}x\\,dx=\\dfrac{1}{2}\\left[${k}\\dfrac{x^2}{2}\\right]_0^2=\\dfrac{1}{2}(${k}\\times2)=${fmt(v2, 2)}$. **Answer: ${fmt(v2, 2)}.**` };
  },
  function taylor() {
    const x = pick([0.1, 0.2, 0.3]);
    const v = 1 + x + (x * x) / 2;
    return { subject: 'Engineering Mathematics', topic: "Taylor / Maclaurin Series", unit: '', decimals: 4, value: v,
      stem: `Using the first three terms of the Maclaurin series of $e^{x}$, approximate $e^{${x}}$.`,
      solution: `**Concept:** $e^{x}\\approx1+x+\\dfrac{x^2}{2}=1+${x}+\\dfrac{${x}^2}{2}=${fmt(v, 4)}$. **Answer: ${fmt(v, 4)}.**` };
  },
  function binomial() {
    const n = pick([4, 5, 6]); const k = pick([2, 3]); const p = pick([0.3, 0.4, 0.5]);
    const v = comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    return { subject: 'Engineering Mathematics', topic: 'Binomial Distribution', unit: '', decimals: 4, value: v,
      stem: `In $n=${n}$ independent trials with success probability $p=${p}$, find $P(X=${k})$.`,
      solution: `**Concept:** $P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}=\\binom{${n}}{${k}}${p}^{${k}}(${round(1 - p, 2)})^{${n - k}}=${fmt(v, 4)}$. **Answer: ${fmt(v, 4)}.**` };
  },
  function poisson() {
    const lam = pick([2, 3, 4]); const k = pick([1, 2, 3]);
    const v = Math.exp(-lam) * Math.pow(lam, k) / fact(k);
    return { subject: 'Engineering Mathematics', topic: 'Poisson Distribution', unit: '', decimals: 4, value: v,
      stem: `For a Poisson process with mean $\\lambda=${lam}$, find $P(X=${k})$.`,
      solution: `**Concept:** $P(X=k)=\\dfrac{e^{-\\lambda}\\lambda^k}{k!}=\\dfrac{e^{-${lam}}\\,${lam}^{${k}}}{${k}!}=${fmt(v, 4)}$. **Answer: ${fmt(v, 4)}.**` };
  },
  function normalZ() {
    const mu = pick([50, 60, 100]); const sig = pick([5, 8, 10]); const x = mu + pick([1, 2, 3]) * sig;
    const v = (x - mu) / sig;
    return { subject: 'Engineering Mathematics', topic: 'Normal Distribution', unit: '', decimals: 2, value: v,
      stem: `A variable is normally distributed with mean $${mu}$ and standard deviation $${sig}$. Find the standard normal score (z) for $x=${x}$.`,
      solution: `**Concept:** $z=\\dfrac{x-\\mu}{\\sigma}=\\dfrac{${x}-${mu}}{${sig}}=${fmt(v, 2)}$. **Answer: ${fmt(v, 2)}.**` };
  },
  function hypothesis() {
    const mu = pick([100, 50, 200]); const xbar = mu + pick([2, 3, 4]); const sig = pick([10, 12, 15]); const n = pick([25, 36, 100]);
    const v = (xbar - mu) / (sig / Math.sqrt(n));
    return { subject: 'Engineering Mathematics', topic: 'Hypothesis Testing', unit: '', decimals: 2, value: v,
      stem: `A sample of size $n=${n}$ has mean $\\bar x=${xbar}$. Testing $H_0:\\mu=${mu}$ with known $\\sigma=${sig}$, find the test statistic z.`,
      solution: `**Concept:** $z=\\dfrac{\\bar x-\\mu}{\\sigma/\\sqrt n}=\\dfrac{${xbar}-${mu}}{${sig}/\\sqrt{${n}}}=${fmt(v, 2)}$. **Answer: ${fmt(v, 2)}.**` };
  },
  function eigen() {
    const a = pick([2, 3, 4]); const d = pick([1, 2, 3]); const b = pick([1, 2]); const c = pick([1, 2]);
    const T = a + d; const D = a * d - b * c; const disc = Math.sqrt(T * T - 4 * D);
    const v = (T + disc) / 2;
    return { subject: 'Engineering Mathematics', topic: 'Linear Algebra (Eigenvalues)', unit: '', decimals: 3, value: v,
      stem: `Find the larger eigenvalue of the matrix $\\begin{bmatrix}${a}&${b}\\\\${c}&${d}\\end{bmatrix}$.`,
      solution: `**Concept:** $\\lambda=\\dfrac{T\\pm\\sqrt{T^2-4D}}{2}$ with trace $T=${T}$, det $D=${D}$. $\\lambda_{max}=\\dfrac{${T}+\\sqrt{${T * T - 4 * D}}}{2}=${fmt(v, 3)}$. **Answer: ${fmt(v, 3)}.**` };
  },
  function definiteIntegral() {
    const a = pick([2, 3, 4]);
    const v = Math.pow(a, 3) / 3;
    return { subject: 'Engineering Mathematics', topic: 'Calculus (Definite Integral)', unit: '', decimals: 3, value: v,
      stem: `Evaluate $\\displaystyle\\int_0^{${a}} x^2\\,dx$.`,
      solution: `**Concept:** $\\int_0^{a}x^2dx=\\dfrac{a^3}{3}=\\dfrac{${a}^3}{3}=${fmt(v, 3)}$. **Answer: ${fmt(v, 3)}.**` };
  },
  function newton() {
    // f(x)=x^2 - N, root near x0; one NR step
    const N = pick([10, 20, 50]); const x0 = pick([3, 4, 7]);
    const v = x0 - (x0 * x0 - N) / (2 * x0);
    return { subject: 'Engineering Mathematics', topic: 'Numerical Methods (Newton-Raphson)', unit: '', decimals: 4, value: v,
      stem: `Apply one Newton-Raphson iteration to $f(x)=x^2-${N}$ starting at $x_0=${x0}$. Find $x_1$.`,
      solution: `**Concept:** $x_1=x_0-\\dfrac{f(x_0)}{f'(x_0)}=${x0}-\\dfrac{${x0}^2-${N}}{2\\times${x0}}=${fmt(v, 4)}$. **Answer: ${fmt(v, 4)}.**` };
  },
];
const cmcq1 = [
  { topic: 'Linear Algebra', stem: 'The rank of a non-zero $3\\times3$ matrix with two identical rows is at most:', options: ['1', '2', '3', '0'], answer: 1, why: 'Two identical rows are linearly dependent, so rank \u2264 2.' },
  { topic: 'Differential Equations', stem: 'The order of the differential equation $\\frac{d^2y}{dx^2}+3\\frac{dy}{dx}=x$ is:', options: ['1', '2', '3', '0'], answer: 1, why: 'Order = highest derivative = 2.' },
  { topic: 'Probability', stem: 'For a Poisson distribution, the mean and variance are:', options: ['Equal', 'Mean > variance', 'Mean < variance', 'Unrelated'], answer: 0, why: 'For Poisson, mean = variance = \u03bb.' },
  { topic: 'Complex Variables', stem: 'The value of $i^2$ (where $i=\\sqrt{-1}$) is:', options: ['1', '-1', 'i', '-i'], answer: 1, why: 'By definition $i^2=-1$.' },
];

// ---- Section 2 : Geology, Mine Development & Surveying ---------------------
const gen2 = [
  function curveLength() {
    const R = pick([200, 300, 400]); const D = pick([30, 45, 60]);
    const v = Math.PI * R * D / 180;
    return { subject: 'Mine Surveying', topic: 'Circular Curves', unit: 'm', decimals: 2, value: v,
      stem: `A circular curve of radius $R=${R}$ m subtends a deflection angle $\\Delta=${D}^\\circ$. Find the length of the curve (in m).`,
      solution: `**Concept:** $L=\\dfrac{\\pi R\\Delta}{180}=\\dfrac{\\pi\\times${R}\\times${D}}{180}=${fmt(v, 2)}$ m. **Answer: ${fmt(v, 2)} m.**`,
      figure: { kind: 'svg', caption: `Circular curve, R=${R} m, \u0394=${D}\u00b0`, markup: `<svg viewBox='0 0 200 140' style='width:100%;max-width:200px;height:auto' xmlns='http://www.w3.org/2000/svg'><rect width='200' height='140' fill='#fff'/><path d='M20 120 A 110 110 0 0 1 150 40' fill='none' stroke='#2563eb' stroke-width='2'/><line x1='20' y1='120' x2='120' y2='120' stroke='#94a3b8' stroke-dasharray='4 3'/><line x1='120' y1='120' x2='150' y2='40' stroke='#94a3b8' stroke-dasharray='4 3'/><text x='95' y='70' font-size='10' fill='#1e293b'>\u0394=${D}\u00b0</text></svg>` } };
  },
  function degreeOfCurve() {
    const R = pick([250, 350, 500]);
    const v = 1718.9 / R;
    return { subject: 'Mine Surveying', topic: 'Degree of Curve', unit: 'deg', decimals: 3, value: v,
      stem: `For a curve of radius $R=${R}$ m, find the degree of curve (30 m chord definition).`,
      solution: `**Concept:** $D=\\dfrac{1718.9}{R}=\\dfrac{1718.9}{${R}}=${fmt(v, 3)}^\\circ$. **Answer: ${fmt(v, 3)}.**` };
  },
  function photogrammetry() {
    const f = pick([150, 200, 300]); const H = pick([1500, 2000, 3000]);
    const v = (H * 1000) / f; // scale denominator (f in mm, H in m)
    return { subject: 'Mine Surveying', topic: 'Photogrammetry', unit: '', decimals: 0, value: v,
      stem: `An aerial photo is taken with focal length $f=${f}$ mm from a flying height $H=${H}$ m above ground. Find the scale denominator (1 : n).`,
      solution: `**Concept:** Scale $=\\dfrac{f}{H}=\\dfrac{${f}\\text{ mm}}{${H}\\text{ m}}=\\dfrac{1}{n}$, $n=\\dfrac{${H}\\times1000}{${f}}=${fmt(v, 0)}$. **Answer: ${fmt(v, 0)}.**` };
  },
  function latitude() {
    const L = pick([100, 150, 200]); const th = pick([30, 45, 60]);
    const v = L * Math.cos(th * Math.PI / 180);
    return { subject: 'Mine Surveying', topic: 'Traverse (Latitude/Departure)', unit: 'm', decimals: 2, value: v,
      stem: `A survey line of length $${L}$ m has a whole-circle bearing of $${th}^\\circ$. Find its latitude (N-S component, in m).`,
      solution: `**Concept:** Latitude $=L\\cos\\theta=${L}\\cos${th}^\\circ=${fmt(v, 2)}$ m. **Answer: ${fmt(v, 2)} m.**` };
  },
  function powderFactor() {
    const tonnes = pick([2000, 3000, 5000]); const expl = pick([400, 600, 800]);
    const v = tonnes / expl;
    return { subject: 'Drilling & Blasting', topic: 'Powder Factor', unit: 't/kg', decimals: 2, value: v,
      stem: `A blast breaks $${tonnes}$ t of rock using $${expl}$ kg of explosive. Find the powder factor (t/kg).`,
      solution: `**Concept:** $PF=\\dfrac{\\text{rock broken}}{\\text{explosive}}=\\dfrac{${tonnes}}{${expl}}=${fmt(v, 2)}$ t/kg. **Answer: ${fmt(v, 2)} t/kg.**` };
  },
  function chargePerHole() {
    const d = pick([0.1, 0.115, 0.15]); const l = pick([6, 8, 10]); const rho = pick([900, 1000, 1100]);
    const v = (Math.PI / 4) * d * d * l * rho;
    return { subject: 'Drilling & Blasting', topic: 'Explosive Charge per Hole', unit: 'kg', decimals: 2, value: v,
      stem: `A blast-hole of diameter $${d}$ m is charged over a length of $${l}$ m with explosive of density $${rho}$ kg/m\u00b3. Find the charge per hole (in kg).`,
      solution: `**Concept:** $W=\\dfrac{\\pi}{4}d^2 l\\rho=\\dfrac{\\pi}{4}(${d})^2\\times${l}\\times${rho}=${fmt(v, 2)}$ kg. **Answer: ${fmt(v, 2)} kg.**`,
      figure: { kind: 'bench', benchHeight: l + 2, burden: pick([3, 4]), spacing: pick([4, 5]), holes: pick([3, 4, 5]), slopeAngle: pick([70, 75, 80]), caption: `Blast bench (hole length ${l} m)` } };
  },
  function penetration() {
    const depth = pick([12, 18, 24]); const time = pick([6, 9, 12]);
    const v = depth / time;
    return { subject: 'Drilling & Blasting', topic: 'Drilling Penetration Rate', unit: 'm/min', decimals: 2, value: v,
      stem: `A drill advances $${depth}$ m in $${time}$ min. Find the penetration rate (in m/min).`,
      solution: `**Concept:** rate $=\\dfrac{${depth}}{${time}}=${fmt(v, 2)}$ m/min. **Answer: ${fmt(v, 2)} m/min.**` };
  },
];
const cmcq2 = [
  { topic: 'Surveying Instruments', stem: 'An EDM instrument measures distance by:', options: ['Counting paces', 'Phase comparison of modulated EM waves', 'Triangulation tables', 'Plane-table sketching'], answer: 1, why: 'EDM uses phase/time-of-flight of modulated electromagnetic waves.' },
  { topic: 'GPS / GIS', stem: 'The minimum number of satellites required for a 3-D GPS position fix is:', options: ['2', '3', '4', '6'], answer: 2, why: 'Four satellites resolve x, y, z and the receiver clock bias.' },
  { topic: 'Total Station', stem: 'A total station fundamentally integrates an EDM with a/an:', options: ['Barometer', 'Electronic theodolite', 'Magnetometer', 'Plane table'], answer: 1, why: 'A total station = EDM + electronic theodolite + processor.' },
  { topic: 'Mining Geology', stem: 'The dip of a stratum is measured:', options: ['Along the strike', 'Perpendicular to strike, in the vertical plane', 'Horizontally only', 'Along the bedding plane trace'], answer: 1, why: 'True dip is measured perpendicular to strike in the vertical plane.' },
  { topic: 'Photogrammetry', stem: 'Relief displacement on a vertical aerial photograph is:', options: ['Towards the principal point', 'Radially outward from the principal point', 'Always zero', 'Along the flight line only'], answer: 1, why: 'Relief displacement is radial, outward from the principal point.' },
];

// ---- Section 3 : Geomechanics & Ground Control -----------------------------
const gen3 = [
  function pillarStrength() {
    const S1 = pick([40, 45, 50, 55, 60]); const W = pick([4, 5, 6, 8]); const H = pick([3, 4, 5]);
    const v = S1 * (0.778 + 0.222 * (W / H));
    return { subject: SUBJ[3], topic: 'Pillar Design (Obert\u2013Duvall)', unit: 'MPa', decimals: 2, value: v,
      stem: `A square coal pillar of width $W=${W}$ m and height $H=${H}$ m has cubical strength $\\sigma_1=${S1}$ MPa. Using Obert\u2013Duvall, estimate the pillar strength (in MPa).`,
      solution: `**Concept:** $S_p=\\sigma_1(0.778+0.222\\,W/H)=${S1}(0.778+0.222\\times${round(W / H, 3)})=${fmt(v, 2)}$ MPa. **Answer: ${fmt(v, 2)} MPa.**` };
  },
  function mohr() {
    const c = pick([5, 10, 15]); const phi = pick([25, 30, 35, 40]); const s3 = pick([2, 3, 5]);
    const r = phi * Math.PI / 180; const N = (1 + Math.sin(r)) / (1 - Math.sin(r));
    const v = s3 * N + 2 * c * Math.sqrt(N);
    return { subject: SUBJ[3], topic: 'Mohr\u2013Coulomb Failure', unit: 'MPa', decimals: 2, value: v,
      stem: `A rock has cohesion $c=${c}$ MPa and friction angle $\\phi=${phi}^\\circ$. For $\\sigma_3=${s3}$ MPa, find $\\sigma_1$ at failure (in MPa).`,
      solution: `**Concept:** $\\sigma_1=\\sigma_3N_\\phi+2c\\sqrt{N_\\phi}$, $N_\\phi=${round(N, 3)}$, so $\\sigma_1=${fmt(v, 2)}$ MPa. **Answer: ${fmt(v, 2)} MPa.**`,
      figure: { kind: 'mohr', sigma1: round(v, 1), sigma3: s3, phi, cohesion: c, caption: `Mohr circle (\u03c6=${phi}\u00b0, c=${c} MPa)` } };
  },
  function beamReaction() {
    const L = pick([6, 8, 10]); const a = pick([2, 3, 4]); const P = pick([20, 30, 40, 50]);
    const v = P * (L - a) / L;
    return { subject: SUBJ[3], topic: 'Engineering Mechanics \u2013 Beam Reaction', unit: 'kN', decimals: 2, value: v,
      stem: `A simply-supported beam of span $${L}$ m carries a point load $${P}$ kN at $${a}$ m from support A. Find reaction $R_A$ (kN).`,
      solution: `**Concept:** $R_A=\\dfrac{P(L-a)}{L}=\\dfrac{${P}(${L}-${a})}{${L}}=${fmt(v, 2)}$ kN. **Answer: ${fmt(v, 2)} kN.**` };
  },
  function friction() {
    const W = pick([100, 150, 200]); const th = pick([15, 20, 25, 30]); const mu = pick([0.2, 0.25, 0.3]);
    const v = mu * W * Math.cos(th * Math.PI / 180);
    return { subject: SUBJ[3], topic: 'Engineering Mechanics \u2013 Friction', unit: 'N', decimals: 2, value: v,
      stem: `A block of weight $${W}$ N rests on a $${th}^\\circ$ incline with friction coefficient $\\mu=${mu}$. Find the maximum static friction available (N).`,
      solution: `**Concept:** $F=\\mu W\\cos\\theta=${mu}\\times${W}\\times\\cos${th}^\\circ=${fmt(v, 2)}$ N. **Answer: ${fmt(v, 2)} N.**` };
  },
  function stressBlock() {
    const sx = pick([40, 50, 60]); const sy = pick([10, 20, 30]); const txy = pick([10, 15, 20]);
    const c = (sx + sy) / 2; const r = Math.sqrt(((sx - sy) / 2) ** 2 + txy * txy);
    const v = c + r;
    return { subject: SUBJ[3], topic: 'Principal Stress', unit: 'MPa', decimals: 2, value: v,
      stem: `At a point $\\sigma_x=${sx}$, $\\sigma_y=${sy}$, $\\tau_{xy}=${txy}$ MPa. Find the major principal stress $\\sigma_1$ (MPa).`,
      solution: `**Concept:** $\\sigma_{1}=\\dfrac{\\sigma_x+\\sigma_y}{2}+\\sqrt{\\left(\\dfrac{\\sigma_x-\\sigma_y}{2}\\right)^2+\\tau_{xy}^2}=${round(c, 2)}+${round(r, 2)}=${fmt(v, 2)}$ MPa. **Answer: ${fmt(v, 2)} MPa.**`,
      figure: { kind: 'stress-block', sx, sy, txy, caption: '2-D stress element' } };
  },
  function rqd() {
    const L = pick([100, 120, 150, 200]); const frac = pick([0.55, 0.62, 0.7, 0.78, 0.85]); const G = Math.round(L * frac);
    const v = G / L * 100;
    return { subject: SUBJ[3], topic: 'Rock Quality Designation', unit: '%', decimals: 1, value: v,
      stem: `In a $${L}$ cm core run, intact pieces $>10$ cm total $${G}$ cm. Find the RQD (%).`,
      solution: `**Concept:** $RQD=\\dfrac{${G}}{${L}}\\times100=${fmt(v, 1)}\\%$. **Answer: ${fmt(v, 1)}.**` };
  },
];
const cmcq3 = [
  { topic: 'Rock Bursts', stem: 'Rock bursts and coal bumps are most associated with:', options: ['Soft, ductile, low-stress ground', 'Sudden violent release of strain energy in highly-stressed brittle rock', 'Slow plastic squeezing', 'Water inrush'], answer: 1, why: 'Bursts are violent failures of highly-stressed, brittle, strain-energy-storing rock.' },
  { topic: 'Ground Control', stem: 'A higher pillar width-to-height (W/H) ratio generally results in:', options: ['Lower pillar strength', 'Higher pillar strength', 'No change', 'Immediate failure'], answer: 1, why: 'Strength increases with W/H (confinement).' },
  { topic: 'Rock Mechanics', stem: 'In the RMR system, increasing groundwater inflow typically:', options: ['Increases the rating', 'Lowers the rating', 'Has no effect', 'Doubles the rating'], answer: 1, why: 'Water adversely affects rock mass quality, lowering RMR.' },
  { topic: 'Subsidence', stem: 'The angle of draw in subsidence is measured from the:', options: ['Horizontal at the edge of workings', 'Vertical at the edge of the extraction', 'Dip of the seam', 'Shaft centreline'], answer: 1, why: 'Angle of draw is measured from the vertical at the panel edge to the subsidence limit.' },
];
const msq3 = [{ topic: 'Rock Mass Behaviour', stem: 'Which statements about rock-mass behaviour are correct? (Select all that apply.)', options: ['RQD increases as discontinuity spacing increases', 'Higher RMR indicates better rock mass', 'Pillar strength increases with W/H', 'FoS < 1 indicates a stable pillar'], answer: [0, 1, 2], why: 'RQD rises with spacing, RMR with quality, strength with W/H; FoS<1 = failure.' }];

// ---- Section 4 : Mining Methods & Machinery --------------------------------
const gen4 = [
  function strip() { const Vw = pick([12, 15, 18, 24]); const Vo = pick([3, 4, 6]); const v = Vw / Vo;
    return { subject: SUBJ[4], topic: 'Overall Stripping Ratio', unit: 'm\u00b3/t', decimals: 2, value: v,
      stem: `Removing $${Vw}$ Mm\u00b3 of waste yields $${Vo}$ Mt of ore. Find the stripping ratio (m\u00b3/t).`,
      solution: `**Concept:** $SR=${Vw}/${Vo}=${fmt(v, 2)}$ m\u00b3/t. **Answer: ${fmt(v, 2)}.**` }; },
  function besr() { const price = pick([2400, 2800, 3200]); const oc = pick([900, 1100, 1300]); const wc = pick([60, 80, 100]); const v = (price - oc) / wc;
    return { subject: SUBJ[4], topic: 'Break-even Stripping Ratio', unit: 'm\u00b3/t', decimals: 2, value: v,
      stem: `Ore sells at \u20b9$${price}$/t (mining cost \u20b9$${oc}$/t); waste costs \u20b9$${wc}$/m\u00b3. Find BESR (m\u00b3/t).`,
      solution: `**Concept:** $BESR=\\dfrac{${price}-${oc}}{${wc}}=${fmt(v, 2)}$ m\u00b3/t. **Answer: ${fmt(v, 2)}.**` }; },
  function belt() { const A = pick([0.05, 0.08, 0.1]); const vel = pick([1.5, 2, 2.5]); const rho = pick([1400, 1500, 1600]); const v = 3.6 * A * vel * rho;
    return { subject: SUBJ[4], topic: 'Belt Conveyor Capacity', unit: 't/h', decimals: 1, value: v,
      stem: `A belt conveyor has load area $${A}$ m\u00b2, speed $${vel}$ m/s, bulk density $${rho}$ kg/m\u00b3. Find capacity (t/h).`,
      solution: `**Concept:** $Q=3.6Av\\rho=3.6\\times${A}\\times${vel}\\times${rho}=${fmt(v, 1)}$ t/h. **Answer: ${fmt(v, 1)}.**` }; },
  function pump() { const Q = pick([0.05, 0.08, 0.1, 0.12]); const H = pick([60, 80, 120, 150]); const eta = pick([0.7, 0.75, 0.8]); const v = 1000 * 9.81 * Q * H / eta / 1000;
    return { subject: SUBJ[4], topic: 'Mine Dewatering Pump Power', unit: 'kW', decimals: 2, value: v,
      stem: `A pump lifts $${Q}$ m\u00b3/s against $${H}$ m head at efficiency $${eta}$. Find shaft power (kW). $\\rho=1000$, $g=9.81$.`,
      solution: `**Concept:** $P=\\dfrac{\\rho g Q H}{\\eta}=${fmt(v, 2)}$ kW. **Answer: ${fmt(v, 2)} kW.**` }; },
  function tractive() { const m = pick([20, 30, 40]); const grade = pick([1, 1.5, 2]); const mu = pick([0.01, 0.012, 0.015]); const v = m * 1000 * 9.81 * (grade / 100 + mu) / 1000;
    return { subject: SUBJ[4], topic: 'Haulage Tractive Effort', unit: 'kN', decimals: 2, value: v,
      stem: `A $${m}$ t train is hauled up a $${grade}\\%$ grade (rolling resistance $${mu}$). Find tractive effort (kN). $g=9.81$.`,
      solution: `**Concept:** $TE=mg(\\text{grade}+\\mu)=${m}\\times1000\\times9.81\\times(${grade / 100}+${mu})/1000=${fmt(v, 2)}$ kN. **Answer: ${fmt(v, 2)} kN.**` }; },
  function rope() { const BL = pick([800, 1000, 1200, 1500]); const WL = pick([120, 150, 200]); const v = BL / WL;
    return { subject: SUBJ[4], topic: 'Winding Rope Factor of Safety', unit: '', decimals: 2, value: v,
      stem: `A winding rope: breaking load $${BL}$ kN, working load $${WL}$ kN. Find the factor of safety.`,
      solution: `**Concept:** $FoS=${BL}/${WL}=${fmt(v, 2)}$. **Answer: ${fmt(v, 2)}.**` }; },
  function highwall() { const total = pick([6, 8, 10]); const e = pick([4, 5, 6, 7]); const ee = Math.min(e, total - 1); const v = ee / total * 100;
    return { subject: SUBJ[4], topic: 'Thick-seam / Highwall Recovery', unit: '%', decimals: 1, value: v,
      stem: `A $${total}$ m seam is worked in slices; $${ee}$ m (equivalent) is recovered. Find recovery (%).`,
      solution: `**Concept:** Recovery $=${ee}/${total}\\times100=${fmt(v, 1)}\\%$. **Answer: ${fmt(v, 1)}.**` }; },
];
const cmcq4 = [
  { topic: 'Highwall Mining', stem: 'Highwall mining is typically deployed:', options: ['In deep underground longwall panels', 'To recover coal from the exposed highwall of a surface mine', 'Only for metalliferous block caving', 'For placer gold dredging'], answer: 1, why: 'Highwall mining extracts coal from the highwall after surface mining reaches its economic pit limit.' },
  { topic: 'Power Transmission', stem: 'In a hydraulic power transmission system, force is transmitted through:', options: ['Compressed air', 'An incompressible fluid under pressure', 'Electrical current', 'Gear teeth only'], answer: 1, why: 'Hydraulics transmit force via a pressurised incompressible fluid (Pascal\u2019s law).' },
  { topic: 'Surface Equipment', stem: 'A dragline primarily performs:', options: ['Ore hoisting in shafts', 'Overburden stripping by casting', 'Coal cutting at the face', 'Crushing of ROM ore'], answer: 1, why: 'Draglines strip and cast overburden.' },
  { topic: 'Continuous Mining', stem: 'A continuous miner is most associated with:', options: ['Bord-and-pillar coal extraction', 'Open-pit drilling', 'Dredging', 'Heap leaching'], answer: 0, why: 'Continuous miners cut and load coal in bord-and-pillar (room-and-pillar) workings.' },
];
const msq4 = [{ topic: 'Mining Machinery', stem: 'Which statements about mining machinery are correct? (Select all that apply.)', options: ['A dragline casts overburden', 'Higher fill factor raises shovel output', 'Belt capacity is independent of belt speed', 'Hydraulic systems use an incompressible fluid'], answer: [0, 1, 3], why: 'Capacity = 3.6 A v \u03c1 depends on speed, so that statement is false.' }];

// ---- Section 5 : Surface Env, Ventilation & Underground Hazards ------------
const gen5 = [
  function resistance() { const k = pick([0.01, 0.012, 0.014]); const O = pick([10, 12, 14]); const L = pick([200, 300, 500]); const A = pick([8, 10, 12]); const v = k * O * L / Math.pow(A, 3);
    return { subject: SUBJ[5], topic: 'Airway Resistance (Atkinson)', unit: 'Ns\u00b2/m\u2078', decimals: 4, value: v,
      stem: `An airway: $L=${L}$ m, $A=${A}$ m\u00b2, perimeter $O=${O}$ m, $k=${k}$ kg/m\u00b3. Find resistance $R$.`,
      solution: `**Concept:** $R=\\dfrac{kOL}{A^3}=${fmt(v, 4)}$ Ns\u00b2/m\u2078. **Answer: ${fmt(v, 4)}.**` }; },
  function airpower() { const P = pick([800, 1200, 1500, 2000]); const Q = pick([40, 60, 80]); const eta = pick([0.6, 0.7, 0.75]); const v = P * Q / eta / 1000;
    return { subject: SUBJ[5], topic: 'Fan Power', unit: 'kW', decimals: 2, value: v,
      stem: `A fan develops $${P}$ Pa moving $${Q}$ m\u00b3/s at efficiency $${eta}$. Find input power (kW).`,
      solution: `**Concept:** Power $=\\dfrac{PQ}{\\eta}=${fmt(v, 2)}$ kW. **Answer: ${fmt(v, 2)} kW.**`,
      figure: { kind: 'pq-curve', fan: { a: round(P * 1.3, 0), b: round(P / (Q * Q) * 0.0008, 6), label: 'Fan' }, resistances: [{ r: round(P / (Q * Q), 4), label: 'Mine' }], caption: 'Fan vs mine characteristic' } };
  },
  function parallel() { const R1 = pick([0.4, 0.6, 0.9]); const R2 = pick([0.4, 0.6, 0.9]); const inv = 1 / Math.sqrt(R1) + 1 / Math.sqrt(R2); const v = 1 / (inv * inv);
    return { subject: SUBJ[5], topic: 'Parallel Airway Resistance', unit: 'Ns\u00b2/m\u2078', decimals: 4, value: v,
      stem: `Two airways $R_1=${R1}$, $R_2=${R2}$ Ns\u00b2/m\u2078 are in parallel. Find equivalent resistance.`,
      solution: `**Concept:** $\\dfrac{1}{\\sqrt{R_{eq}}}=\\dfrac{1}{\\sqrt{R_1}}+\\dfrac{1}{\\sqrt{R_2}}\\Rightarrow R_{eq}=${fmt(v, 4)}$. **Answer: ${fmt(v, 4)}.**`,
      figure: { kind: 'ventilation', caption: 'Parallel airways', nodes: [{ id: 'A', x: 30, y: 60 }, { id: 'B', x: 240, y: 60 }], branches: [{ from: 'A', to: 'B', r: R1 }, { from: 'A', to: 'B', r: R2 }] } }; },
  function gas() { const G = pick([0.05, 0.08, 0.1, 0.12]); const lim = pick([0.0125, 0.01, 0.0075]); const v = G / lim;
    return { subject: SUBJ[5], topic: 'Methane Dilution', unit: 'm\u00b3/s', decimals: 1, value: v,
      stem: `A heading emits $${G}$ m\u00b3/s methane. To keep return \u2264 $${(lim * 100).toFixed(2)}\\%$ (intake gas-free), find minimum air quantity (m\u00b3/s).`,
      solution: `**Concept:** $Q=\\dfrac{${G}}{${lim}}=${fmt(v, 1)}$ m\u00b3/s. **Answer: ${fmt(v, 1)}.**` }; },
  function inundation() { const V = pick([3000, 5000, 8000]); const rate = pick([0.05, 0.08, 0.1]); const v = V / rate / 3600;
    return { subject: SUBJ[5], topic: 'Inundation / Dewatering Time', unit: 'h', decimals: 2, value: v,
      stem: `A district holds $${V}$ m\u00b3 of water; a pump discharges $${rate}$ m\u00b3/s. Find dewatering time (h).`,
      solution: `**Concept:** $t=\\dfrac{V}{Q}=${Math.round(V / rate)}$ s $=${fmt(v, 2)}$ h. **Answer: ${fmt(v, 2)} h.**` }; },
  function lighting() { const lm = pick([2000, 3000, 4000]); const ar = pick([20, 25, 40]); const v = lm / ar;
    return { subject: SUBJ[5], topic: 'Mine Illumination', unit: 'lux', decimals: 1, value: v,
      stem: `A $${ar}$ m\u00b2 working receives $${lm}$ lumens. Find the average illuminance (lux).`,
      solution: `**Concept:** $E=${lm}/${ar}=${fmt(v, 1)}$ lux. **Answer: ${fmt(v, 1)} lux.**` }; },
  function noise() { const n = pick([2, 4, 8, 10]); const each = pick([85, 88, 90]); const v = each + 10 * Math.log10(n);
    return { subject: SUBJ[5], topic: 'Noise (Sound Level Addition)', unit: 'dB', decimals: 1, value: v,
      stem: `$${n}$ identical machines each produce $${each}$ dB. Find the combined sound level (dB).`,
      solution: `**Concept:** $L=L_1+10\\log_{10}n=${each}+10\\log_{10}${n}=${fmt(v, 1)}$ dB. **Answer: ${fmt(v, 1)} dB.**` }; },
];
const cmcq5 = [
  { topic: 'Mine Fires', stem: 'Spontaneous heating of coal leading to fire is primarily due to:', options: ['Methane explosion', 'Slow oxidation of coal releasing heat', 'Water inrush', 'Roof falls'], answer: 1, why: 'Spontaneous combustion arises from exothermic low-temperature oxidation of coal.' },
  { topic: 'Rescue', stem: 'A self-contained self-rescuer (SCSR) protects a miner mainly against:', options: ['Noise', 'Carbon monoxide / oxygen deficiency', 'Vibration', 'Dust only'], answer: 1, why: 'SCSRs supply breathable oxygen during CO-rich / oxygen-deficient escape.' },
  { topic: 'Reclamation', stem: 'Land reclamation after surface mining typically begins with:', options: ['Final void flooding only', 'Regrading and replacement of topsoil', 'Building permanent haul roads', 'Increasing the stripping ratio'], answer: 1, why: 'Reclamation starts with regrading and re-spreading stored topsoil before revegetation.' },
  { topic: 'Dust / Pollution', stem: 'Respirable dust in mines is most hazardous because particles:', options: ['Are too large to inhale', 'Penetrate deep into the alveoli', 'Dissolve harmlessly', 'Only affect equipment'], answer: 1, why: 'Respirable (<5 \u00b5m) dust reaches the alveoli, causing pneumoconiosis.' },
];
const msq5 = [{ topic: 'Mine Atmosphere', stem: 'Which statements about mine atmospheres are correct? (Select all that apply.)', options: ['Methane is explosive roughly 5\u201315% in air', 'CO is toxic at low concentrations', 'More air dilutes return gas concentration', 'Resistance falls when airway area is reduced'], answer: [0, 1, 2], why: 'R = kOL/A\u00b3 increases when area falls, so the last statement is false.' }];

// ---- Section 6 : Mineral Economics, Mine Planning & Systems Engineering ----
const gen6 = [
  function npv() { const A = pick([20, 30, 40]); const n = pick([4, 5, 6]); const r = pick([0.08, 0.1, 0.12]); const I = pick([60, 80, 100]); const pvf = (1 - Math.pow(1 + r, -n)) / r; const v = A * pvf - I;
    return { subject: SUBJ[6], topic: 'Net Present Value', unit: '\u20b9 crore', decimals: 2, value: v,
      stem: `A project needs \u20b9$${I}$ crore now and returns \u20b9$${A}$ crore/yr for $${n}$ yr at $${(r * 100).toFixed(0)}\\%$. Find NPV (\u20b9 crore).`,
      solution: `**Concept:** $NPV=A\\dfrac{1-(1+r)^{-n}}{r}-I=${A}\\times${round(pvf, 4)}-${I}=${fmt(v, 2)}$ crore. **Answer: ${fmt(v, 2)}.**` }; },
  function payback() { const I = pick([120, 150, 200]); const CF = pick([25, 30, 40, 50]); const v = I / CF;
    return { subject: SUBJ[6], topic: 'Payback Period', unit: 'years', decimals: 2, value: v,
      stem: `Investment \u20b9$${I}$ crore, uniform cash flow \u20b9$${CF}$ crore/yr. Find simple payback (years).`,
      solution: `**Concept:** $=${I}/${CF}=${fmt(v, 2)}$ yr. **Answer: ${fmt(v, 2)}.**` }; },
  function life() { const res = pick([24, 36, 50, 60]); const prod = pick([3, 4, 5, 6]); const v = res / prod;
    return { subject: SUBJ[6], topic: 'Mine Life', unit: 'years', decimals: 2, value: v,
      stem: `Reserve $${res}$ Mt at $${prod}$ Mt/yr. Find mine life (years).`,
      solution: `**Concept:** life $=${res}/${prod}=${fmt(v, 2)}$ yr. **Answer: ${fmt(v, 2)}.**` }; },
  function relSeries() { const R1 = pick([0.9, 0.92, 0.95]); const R2 = pick([0.88, 0.9, 0.93]); const R3 = pick([0.85, 0.9, 0.95]); const v = R1 * R2 * R3;
    return { subject: SUBJ[6], topic: 'Reliability (Series)', unit: '', decimals: 4, value: v,
      stem: `Three series components: reliabilities $${R1}$, $${R2}$, $${R3}$. Find system reliability.`,
      solution: `**Concept:** $R_s=\\prod R_i=${fmt(v, 4)}$. **Answer: ${fmt(v, 4)}.**` }; },
  function relParallel() { const R1 = pick([0.8, 0.85, 0.9]); const R2 = pick([0.75, 0.8, 0.85]); const v = 1 - (1 - R1) * (1 - R2);
    return { subject: SUBJ[6], topic: 'Reliability (Parallel)', unit: '', decimals: 4, value: v,
      stem: `Two redundant pumps: reliabilities $${R1}$ and $${R2}$. Find system reliability.`,
      solution: `**Concept:** $R_p=1-(1-${R1})(1-${R2})=${fmt(v, 4)}$. **Answer: ${fmt(v, 4)}.**` }; },
  function pert() { const a = pick([3, 4, 5]); const m = pick([6, 7, 8]); const b = pick([11, 12, 14]); const v = (a + 4 * m + b) / 6;
    return { subject: SUBJ[6], topic: 'PERT Expected Time', unit: 'days', decimals: 2, value: v,
      stem: `Activity times $a=${a}$, $m=${m}$, $b=${b}$ days. Find PERT expected time $t_e$.`,
      solution: `**Concept:** $t_e=\\dfrac{a+4m+b}{6}=${fmt(v, 2)}$ days. **Answer: ${fmt(v, 2)}.**` }; },
  function queue() { const lam = pick([4, 5, 6]); const mu = pick([8, 9, 10]); const v = lam / (mu - lam);
    return { subject: SUBJ[6], topic: 'Queuing (M/M/1)', unit: 'trucks', decimals: 3, value: v,
      stem: `Trucks arrive at $\\lambda=${lam}$/h, served at $\\mu=${mu}$/h (M/M/1). Find $L_s$.`,
      solution: `**Concept:** $L_s=\\dfrac{\\lambda}{\\mu-\\lambda}=${fmt(v, 3)}$. **Answer: ${fmt(v, 3)}.**` }; },
  function eoq() { const D = pick([2000, 3600, 5000]); const Co = pick([100, 150, 200]); const Ch = pick([4, 5, 8]); const v = Math.sqrt(2 * D * Co / Ch);
    return { subject: SUBJ[6], topic: 'Inventory (EOQ)', unit: 'units', decimals: 1, value: v,
      stem: `Demand $${D}$/yr, ordering cost \u20b9$${Co}$, holding cost \u20b9$${Ch}$/unit/yr. Find EOQ.`,
      solution: `**Concept:** $EOQ=\\sqrt{\\dfrac{2DC_o}{C_h}}=${fmt(v, 1)}$ units. **Answer: ${fmt(v, 1)}.**` }; },
];
const cmcq6 = [
  { topic: 'Linear Programming', stem: 'In the simplex method, an optimal solution is reached when:', options: ['Any cost-row coefficient is negative', 'No further improvement is possible (no entering variable improves Z)', 'The basis is empty', 'All variables are zero'], answer: 1, why: 'Optimality is reached when no entering variable can improve the objective.' },
  { topic: 'Transportation', stem: 'A transportation problem is balanced when:', options: ['Total supply = total demand', 'Costs are equal', 'There is one source', 'Demand exceeds supply'], answer: 0, why: 'Balanced means total supply equals total demand.' },
  { topic: 'Resource Classification', stem: 'The UNFC system classifies resources on the basis of:', options: ['Colour of the ore', 'Economic, feasibility and geological axes', 'Depth only', 'Mining method only'], answer: 1, why: 'UNFC uses three axes: economic viability, feasibility, geological knowledge.' },
  { topic: 'Mine Planning', stem: 'The ultimate pit limit is determined primarily by:', options: ['Equipment colour', 'Economic break-even between ore value and stripping cost', 'Number of employees', 'Shaft depth'], answer: 1, why: 'Ultimate pit limits are set where incremental revenue equals incremental stripping cost.' },
];
const msq6 = [{ topic: 'Project Evaluation', stem: 'Which statements about mine project evaluation are correct? (Select all that apply.)', options: ['Positive NPV \u2192 acceptable at the chosen rate', 'IRR is the rate where NPV = 0', 'Series reliability exceeds each component', 'Critical path is the longest-duration path'], answer: [0, 1, 3], why: 'Series reliability is the product, lower than any component, so that statement is false.' }];

// ===========================================================================
//  Pools per section & wrappers
// ===========================================================================
const POOLS = {
  ga: { num: genGA, cmcq: cmcqGA, msq: [] },
  s1: { num: gen1, cmcq: cmcq1, msq: [] },
  s2: { num: gen2, cmcq: cmcq2, msq: [] },
  s3: { num: gen3, cmcq: cmcq3, msq: msq3 },
  s4: { num: gen4, cmcq: cmcq4, msq: msq4 },
  s5: { num: gen5, cmcq: cmcq5, msq: msq5 },
  s6: { num: gen6, cmcq: cmcq6, msq: msq6 },
};

function tolFor(value, decimals) {
  if (Number.isInteger(value) && decimals === 0) return 0;
  return round(Math.max(0.05, Math.abs(value) * 0.01), 2);
}
function numToNAT(g, marks, bucket) {
  const value = round(g.value, g.decimals);
  const q = { subject: g.subject, topic: g.topic, section: bucket, type: 'NAT', marks,
    difficulty: marks === 2 ? 'medium' : 'easy', answer: value, tolerance: tolFor(value, g.decimals),
    stem: g.stem, solution: g.solution };
  if (g.figure) q.figure = g.figure;
  return q;
}
function numToMCQ(g, marks, bucket) {
  const value = round(g.value, g.decimals); const unit = g.unit ? ` ${g.unit}` : '';
  const mults = [0.5, 0.75, 1.25, 1.5, 2].sort(() => rng() - 0.5); const ds = [];
  for (const m of mults) { const d = round(value * m, g.decimals); if (d !== value && !ds.includes(d)) ds.push(d); if (ds.length === 3) break; }
  while (ds.length < 3) { const d = round(value + (ds.length + 1) * (value === 0 ? 1 : Math.abs(value) * 0.1), g.decimals); if (d !== value && !ds.includes(d)) ds.push(d); }
  const vals = [value, ...ds];
  for (let i = vals.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [vals[i], vals[j]] = [vals[j], vals[i]]; }
  const q = { subject: g.subject, topic: g.topic, section: bucket, type: 'MCQ', marks,
    difficulty: marks === 2 ? 'medium' : 'easy',
    stem: g.stem, options: vals.map((x) => `${fmt(x, g.decimals)}${unit}`.trim()), answer: vals.indexOf(value), solution: g.solution };
  if (g.figure) q.figure = g.figure;
  return q;
}
function concToMCQ(b, subject, marks, bucket) {
  return { subject, topic: b.topic, section: bucket, type: 'MCQ', marks, difficulty: marks === 2 ? 'medium' : 'easy',
    stem: b.stem, options: b.options.slice(), answer: b.answer,
    solution: `**Concept:** ${b.why}\n\n**Answer: (${String.fromCharCode(65 + b.answer)}).**` };
}
function concToMSQ(b, subject, marks, bucket) {
  return { subject, topic: b.topic, section: bucket, type: 'MSQ', marks, difficulty: 'medium',
    stem: b.stem, options: b.options.slice(), answer: b.answer.slice(),
    solution: `**Concept:** ${b.why}\n\n**Answer: ${b.answer.map((i) => '(' + String.fromCharCode(65 + i) + ')').join(', ')}.**` };
}

function shuffled(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Build one section's questions for a given marks bucket.
function buildSection(poolKey, subjectForConc, types, marks, bucket, state) {
  const pool = POOLS[poolKey];
  const out = [];
  const uniqueNum = (make) => {
    let q;
    for (let tries = 0; tries < 40; tries++) {
      q = make(pick(pool.num)(), marks, bucket);
      if (!state.seen.has(q.stem)) break;
    }
    state.seen.add(q.stem);
    return q;
  };
  for (const t of types) {
    if (t === 'NAT') out.push(uniqueNum(numToNAT));
    else if (t === 'MCQ') out.push(uniqueNum(numToMCQ));
    else if (t === 'CMCQ') {
      if (!state.cmcq.length) state.cmcq = shuffled(pool.cmcq);
      out.push(concToMCQ(state.cmcq.pop(), subjectForConc, marks, bucket));
    } else if (t === 'MSQ') {
      if (!state.msq.length) state.msq = shuffled(pool.msq);
      out.push(concToMSQ(state.msq.pop(), subjectForConc, marks, bucket));
    }
  }
  return out;
}

// Blueprint: types per section per marks bucket.
const PLAN = {
  ga: { subj: 'General Aptitude', one: ['CMCQ', 'MCQ', 'NAT', 'CMCQ', 'MCQ'], two: ['NAT', 'MCQ', 'NAT', 'CMCQ', 'MCQ'] },
  s1: { subj: 'Engineering Mathematics', one: ['MCQ', 'NAT', 'CMCQ', 'MCQ'], two: ['NAT', 'MCQ', 'NAT', 'MCQ'] },
  s2: { subj: 'Mine Surveying', one: ['CMCQ', 'MCQ', 'NAT', 'CMCQ', 'MCQ'], two: ['NAT', 'MCQ', 'NAT', 'MCQ', 'NAT', 'MCQ'] },
  s3: { subj: SUBJ[3], one: ['CMCQ', 'MCQ', 'NAT', 'MCQ'], two: ['NAT', 'MCQ', 'NAT', 'MCQ', 'MSQ'] },
  s4: { subj: SUBJ[4], one: ['CMCQ', 'MCQ', 'NAT', 'MCQ'], two: ['NAT', 'MCQ', 'NAT', 'MCQ', 'MSQ'] },
  s5: { subj: SUBJ[5], one: ['CMCQ', 'MCQ', 'NAT', 'MCQ'], two: ['NAT', 'MCQ', 'NAT', 'MCQ', 'MSQ'] },
  s6: { subj: SUBJ[6], one: ['CMCQ', 'MCQ', 'NAT', 'MCQ'], two: ['NAT', 'MCQ', 'NAT', 'MCQ', 'MSQ'] },
};

function buildMock(meta) {
  seed(meta.seed);
  const state = {}; // per-section concept/msq queues
  const seen = new Set(); // global stem dedup within this mock
  for (const k of Object.keys(PLAN)) state[k] = { cmcq: [], msq: [], seen };

  // GA block (bucket "General Aptitude")
  const ga = [
    ...buildSection('ga', PLAN.ga.subj, PLAN.ga.one, 1, 'General Aptitude', state.ga),
    ...buildSection('ga', PLAN.ga.subj, PLAN.ga.two, 2, 'General Aptitude', state.ga),
  ];
  // Technical 1-mark (s1..s6)
  const tech1 = [];
  for (const k of ['s1', 's2', 's3', 's4', 's5', 's6']) tech1.push(...buildSection(k, PLAN[k].subj, PLAN[k].one, 1, 'Technical (1-mark)', state[k]));
  // Technical 2-mark (s1..s6)
  const tech2 = [];
  for (const k of ['s1', 's2', 's3', 's4', 's5', 's6']) tech2.push(...buildSection(k, PLAN[k].subj, PLAN[k].two, 2, 'Technical (2-mark)', state[k]));

  const questions = [...ga, ...tech1, ...tech2].map((q, i) => ({ id: i + 1, ...q }));

  return {
    id: meta.id, title: meta.title, tier: meta.tier, duration: 180,
    pattern: 'GATE 2027 (65 Q \u00b7 100 marks \u00b7 3 hours)', totalMarks: 100,
    sections: [
      { name: 'General Aptitude', count: 10, marks: 15 },
      { name: 'Technical (1-mark)', count: 25, marks: 25 },
      { name: 'Technical (2-mark)', count: 30, marks: 60 },
    ],
    negativeMarking: { mcq1: -0.3333, mcq2: -0.6667, nat: 0, msq: 0 },
    seed: meta.seed, locked: true, questions,
  };
}

const META = [
  { id: 'mn-mock-16', title: 'Mock Test 16 \u2014 Grand Test H (Syllabus-Gap Special)', tier: 'hard', seed: 16160001 },
  { id: 'mn-mock-17', title: 'Mock Test 17 \u2014 Grand Test I (Syllabus-Gap Special)', tier: 'hard', seed: 17170002 },
  { id: 'mn-mock-18', title: 'Mock Test 18 \u2014 Grand Test J (Full Syllabus)', tier: 'premium', seed: 18180003 },
  { id: 'mn-mock-19', title: 'Mock Test 19 \u2014 Grand Test K (Full Syllabus)', tier: 'premium', seed: 19190004 },
  { id: 'mn-mock-20', title: 'Mock Test 20 \u2014 Grand Test L (Premium Capstone)', tier: 'premium', seed: 20200005 },
];

for (const meta of META) {
  const mock = buildMock(meta);
  const marks = mock.questions.reduce((s, q) => s + q.marks, 0);
  const figs = mock.questions.filter((q) => q.figure).length;
  fs.writeFileSync(path.join(DIR, meta.id + '.json'), JSON.stringify(mock, null, 2) + '\n');
  console.log(`${meta.id}: ${mock.questions.length} Q, ${marks} marks, ${figs} figures`);
}
