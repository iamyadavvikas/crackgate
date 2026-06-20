/**
 * CrackGate — GATE Geology & Geophysics (GG) practice-bank generator.
 *
 * Emits one JSON file per subject under
 *   apps/web/src/data/questions/practice/gg-<slug>.json
 * in the exact PracticeSubject / PracticeQuestion shape consumed by the app
 * (see apps/web/src/data/practice.ts).
 *
 * Every numerical answer is COMPUTED in code (not transcribed) so the keys are
 * guaranteed self-consistent. Questions are deterministic (seeded RNG) so the
 * bank is reproducible. Load-bearing figures (stereonet / mohr / stress-block)
 * are attached to structural-geology, geophysics and engineering-geology items.
 *
 * Usage:
 *   npx tsx scripts/build_gg_practice.ts
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// ───────────────────────── deterministic RNG ─────────────────────────
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

// ───────────────────────── figure helpers (typed kinds only) ─────────────────────────
type Fig =
  | { kind: "stereonet"; planes: { strike: number; dip: number; label?: string }[]; caption?: string }
  | { kind: "mohr"; sigma1: number; sigma3: number; phi?: number; cohesion?: number; caption?: string }
  | { kind: "stress-block"; sx: number; sy: number; txy: number; caption?: string };

const stereonetFig = (strike: number, dip: number, label: string, caption: string): Fig =>
  ({ kind: "stereonet", planes: [{ strike, dip, label }], caption });
const mohrFig = (sigma1: number, sigma3: number, caption: string, phi?: number, cohesion?: number): Fig =>
  ({ kind: "mohr", sigma1, sigma3, ...(phi !== undefined ? { phi } : {}), ...(cohesion !== undefined ? { cohesion } : {}), caption });
const stressBlockFig = (sx: number, sy: number, txy: number, caption: string): Fig =>
  ({ kind: "stress-block", sx, sy, txy, caption });

// ───────────────────────── question helpers ─────────────────────────
type Diff = "easy" | "medium" | "hard";
type Arch = "A" | "B" | "C" | "D";

interface NatQ {
  id: string; subject: string; topic: string; difficulty: Diff; type: "NAT";
  stem: string; answer: number; tolerance: number; solution: string; archetype: Arch; marks: 1 | 2; figure?: Fig;
}
interface McqQ {
  id: string; subject: string; topic: string; difficulty: Diff; type: "MCQ";
  stem: string; options: string[]; answer: number; solution: string; archetype: Arch; marks: 1 | 2; figure?: Fig;
}
interface MsqQ {
  id: string; subject: string; topic: string; difficulty: Diff; type: "MSQ";
  stem: string; options: string[]; answer: number[]; solution: string; archetype: Arch; marks: 1 | 2; figure?: Fig;
}
type Q = NatQ | McqQ | MsqQ;

/** round to n decimals */
const r = (x: number, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const deg = Math.PI / 180;

class Builder {
  private n = 0;
  readonly out: Q[] = [];
  constructor(private prefix: string, private subject: string) {}
  private id() { this.n += 1; return `${this.prefix}-${String(this.n).padStart(3, "0")}`; }

  nat(topic: string, difficulty: Diff, marks: 1 | 2, stem: string, answer: number, tolerance: number, solution: string, archetype: Arch = "A", figure?: Fig) {
    this.out.push({ id: this.id(), subject: this.subject, topic, difficulty, type: "NAT", stem, answer: r(answer, 4), tolerance, solution, archetype, marks, ...(figure ? { figure } : {}) });
  }
  mcq(topic: string, difficulty: Diff, marks: 1 | 2, stem: string, options: string[], answer: number, solution: string, archetype: Arch = "B", figure?: Fig) {
    this.out.push({ id: this.id(), subject: this.subject, topic, difficulty, type: "MCQ", stem, options, answer, solution, archetype, marks, ...(figure ? { figure } : {}) });
  }
  msq(topic: string, difficulty: Diff, marks: 1 | 2, stem: string, options: string[], answer: number[], solution: string, archetype: Arch = "B", figure?: Fig) {
    this.out.push({ id: this.id(), subject: this.subject, topic, difficulty, type: "MSQ", stem, options, answer, solution, archetype, marks, ...(figure ? { figure } : {}) });
  }
}

/** Build a concept + working + answer solution string. */
function sol(concept: string, working: string, answer: string) {
  return `**Concept.** ${concept}\n\n**Working.**\n${working}\n\n**Answer.** ${answer}`;
}

function ri(rand: () => number, lo: number, hi: number): number { return lo + Math.floor(rand() * (hi - lo + 1)); }
function rp<T>(arr: T[], rand: () => number): T { return arr[Math.floor(rand() * arr.length)]; }

type GenOut =
  | { topic: string; difficulty: Diff; marks: 1 | 2; type: "NAT"; stem: string; answer: number; tolerance: number; solution: string; archetype: Arch; figure?: Fig }
  | { topic: string; difficulty: Diff; marks: 1 | 2; type: "MCQ"; stem: string; options: string[]; answer: number; solution: string; archetype: Arch; figure?: Fig };

/* ════════════════════════════════════════════════════════════════════ */
/*  BULK parametric generators (computed answers, deterministic)          */
/* ════════════════════════════════════════════════════════════════════ */

const BULK: Record<string, ((rand: () => number) => GenOut)[]> = {
  "gg-geology-mathematics": [
    (rand) => { const a = ri(rand, 2, 9), bb = ri(rand, 1, 9), c = ri(rand, 1, 6), d = ri(rand, 2, 9); const det = a * d - bb * c; return { topic: "Linear Algebra — Determinant", difficulty: "easy", marks: 1, type: "NAT", stem: `The determinant of $\\begin{bmatrix}${a} & ${bb}\\\\ ${c} & ${d}\\end{bmatrix}$ is _____.`, answer: det, tolerance: 0.001, solution: sol("$\\det=ad-bc$.", `$$\\det=(${a})(${d})-(${bb})(${c})=${det}.$$`, `$${det}$`), archetype: "A" }; },
    (rand) => { const xs = Array.from({ length: 5 }, () => ri(rand, 1, 9)); const mean = xs.reduce((s, x) => s + x, 0) / 5; return { topic: "Statistics — Mean", difficulty: "easy", marks: 1, type: "NAT", stem: `The arithmetic mean of the assay values $\\{${xs.join(", ")}\\}$ (in g/t) is _____ g/t.`, answer: mean, tolerance: 0.01, solution: sol("$\\bar x=\\sum x_i/n$.", `$$\\dfrac{${xs.join("+")}}{5}=${r(mean, 2)}.$$`, `$${r(mean, 2)}$`), archetype: "A" }; },
    (rand) => { const a = ri(rand, 2, 6), x0 = ri(rand, 1, 5); const s = 2 * a * x0; return { topic: "Calculus — Gradient", difficulty: "easy", marks: 1, type: "NAT", stem: `The slope of the depth–temperature relation $T=${a}z^2$ at $z=${x0}$ is _____.`, answer: s, tolerance: 0.001, solution: sol("$dT/dz=2az$.", `$$2(${a})(${x0})=${s}.$$`, `$${s}$`), archetype: "A" }; },
    (rand) => { const n = ri(rand, 2, 4), up = ri(rand, 2, 5); const v = up ** (n + 1) / (n + 1); return { topic: "Calculus — Integration", difficulty: "medium", marks: 2, type: "NAT", stem: `Evaluate $\\displaystyle\\int_0^{${up}} x^{${n}}\\,dx$.`, answer: v, tolerance: 0.01, solution: sol("$\\int_0^a x^n dx=a^{n+1}/(n+1)$.", `$$\\dfrac{${up}^{${n + 1}}}{${n + 1}}=${r(v, 3)}.$$`, `$${r(v, 3)}$`), archetype: "A" }; },
    (rand) => { const xs = [ri(rand, 2, 6), ri(rand, 4, 8), ri(rand, 6, 12)]; const m = xs.reduce((s, x) => s + x, 0) / 3; const varr = xs.reduce((s, x) => s + (x - m) ** 2, 0) / 3; return { topic: "Statistics — Variance", difficulty: "medium", marks: 2, type: "NAT", stem: `The population variance of $\\{${xs.join(", ")}\\}$ is _____.`, answer: varr, tolerance: 0.05, solution: sol("$\\sigma^2=\\sum(x_i-\\bar x)^2/n$.", `$$\\bar x=${r(m, 3)},\\ \\sigma^2=${r(varr, 3)}.$$`, `$${r(varr, 3)}$`), archetype: "C" }; },
  ],
  "gg-earth-system-geomorphology": [
    (rand) => { const grad = rp([25, 30, 20, 35], rand), depth = rp([2, 3, 4, 5], rand); const T = grad * depth + 15; return { topic: "Geothermal Gradient", difficulty: "easy", marks: 1, type: "NAT", stem: `Surface temperature $15\\,^\\circ$C and geothermal gradient $${grad}\\,^\\circ$C/km. The temperature at $${depth}\\,$km depth is _____ $^\\circ$C.`, answer: T, tolerance: 0.1, solution: sol("$T=T_0+\\text{gradient}\\times z$.", `$$15+${grad}\\times${depth}=${T}.$$`, `$${T}\\,^\\circ$C`), archetype: "A" }; },
    (rand) => { const rho = rp([2.7, 2.8, 2.67], rand), h = rp([2, 3, 4, 5], rand); const P = rho * 1000 * 9.81 * h * 1000 / 1e6; return { topic: "Lithostatic Pressure", difficulty: "medium", marks: 2, type: "NAT", stem: `Crustal density $${rho}\\,$g/cm³, depth $${h}\\,$km. The lithostatic pressure ($P=\\rho g h$) is _____ MPa.`, answer: P, tolerance: 1, solution: sol("$P=\\rho g h$.", `$$${rho}\\times10^3\\times9.81\\times${h}\\times10^3/10^6=${r(P, 1)}.$$`, `$${r(P, 1)}\\,$MPa`), archetype: "C" }; },
    (rand) => { const root = r(2.67 / (3.27 - 2.67), 2), hM = rp([1, 2, 3], rand); const t = r(root * hM, 2); return { topic: "Isostasy — Airy", difficulty: "hard", marks: 2, type: "NAT", stem: `Airy model: crust $\\rho_c=2.67$, mantle $\\rho_m=3.27\\,$g/cm³, so root $=${root}\\times h$. For a mountain $${hM}\\,$km high, the root depth is _____ km.`, answer: t, tolerance: 0.05, solution: sol("Root $r=\\dfrac{\\rho_c}{\\rho_m-\\rho_c}h$.", `$$${root}\\times${hM}=${r(t, 2)}.$$`, `$${r(t, 2)}\\,$km`), archetype: "C" }; },
    (rand) => { const rate = rp([2, 3, 5, 6], rand), t = rp([5, 10, 20], rand); const d = rate * t * 10; return { topic: "Plate Kinematics", difficulty: "medium", marks: 2, type: "NAT", stem: `A plate moves at $${rate}\\,$cm/yr. In $${t}\\,$Myr the displacement is _____ km.`, answer: d, tolerance: 5, solution: sol("$d=v\\,t$; $1\\,$cm/yr $\\times 1\\,$Myr $=10\\,$km.", `$$${rate}\\times${t}\\times10=${r(d, 1)}.$$`, `$${r(d, 1)}\\,$km`), archetype: "A" }; },
  ],
  "gg-structural-geology": [
    (rand) => { const dip = rp([30, 40, 45, 50, 60], rand), beta = rp([30, 40, 50, 60, 70], rand); const app = Math.atan(Math.tan(dip * deg) * Math.sin(beta * deg)) / deg; return { topic: "Apparent Dip", difficulty: "hard", marks: 2, type: "NAT", stem: `The bedding plane is plotted on the stereonet (read its true dip from the great circle). In a vertical cross-section making an angle of $${beta}^\\circ$ with the strike, the apparent dip is _____ degrees.`, answer: app, tolerance: 0.2, solution: sol("Read the true dip off the great circle, then $\\tan\\delta_{app}=\\tan\\delta_{true}\\sin\\beta$.", `$$\\tan^{-1}(\\tan${dip}^\\circ\\sin${beta}^\\circ)=${r(app, 2)}^\\circ.$$`, `$${r(app, 2)}^\\circ$`), archetype: "C", figure: stereonetFig(0, dip, `Bedding 000°/${dip}°`, `Read the true dip of the plotted bedding plane`) }; },
    (rand) => { const s1 = rp([80, 100, 120, 150], rand), s3 = rp([20, 30, 40], rand); const tmax = (s1 - s3) / 2; return { topic: "Mohr — Maximum Shear", difficulty: "medium", marks: 2, type: "NAT", stem: `For the state of stress represented by the Mohr circle shown (read $\\sigma_1$ and $\\sigma_3$ off the diagram), the maximum shear stress is _____ MPa.`, answer: tmax, tolerance: 0.1, solution: sol("$\\tau_{max}=(\\sigma_1-\\sigma_3)/2$ = radius of the Mohr circle.", `$$\\dfrac{${s1}-${s3}}{2}=${tmax}.$$`, `$${tmax}\\,$MPa`), archetype: "A", figure: mohrFig(s1, s3, `Mohr circle: σ₁=${s1}, σ₃=${s3} MPa`) }; },
    (rand) => { const s1 = rp([100, 120, 140], rand), s3 = rp([20, 40, 60], rand), th = rp([20, 30, 45, 60], rand); const sn = (s1 + s3) / 2 + (s1 - s3) / 2 * Math.cos(2 * th * deg); return { topic: "Mohr — Normal Stress on Plane", difficulty: "hard", marks: 2, type: "NAT", stem: `Using the principal stresses marked on the Mohr circle, the normal stress on a plane whose normal makes $${th}^\\circ$ with $\\sigma_1$ is _____ MPa.`, answer: sn, tolerance: 0.2, solution: sol("With $\\sigma_1,\\sigma_3$ read off the circle, $\\sigma_n=\\dfrac{\\sigma_1+\\sigma_3}{2}+\\dfrac{\\sigma_1-\\sigma_3}{2}\\cos2\\theta$.", `$$\\dfrac{${s1}+${s3}}{2}+\\dfrac{${s1}-${s3}}{2}\\cos${2 * th}^\\circ=${r(sn, 2)}.$$`, `$${r(sn, 2)}\\,$MPa`), archetype: "C", figure: mohrFig(s1, s3, `σ₁=${s1}, σ₃=${s3} MPa; plane at ${th}° to σ₁`) }; },
    (rand) => { const s1 = rp([100, 120, 140], rand), s3 = rp([20, 40, 60], rand), th = rp([20, 30, 45, 60], rand); const ts = (s1 - s3) / 2 * Math.sin(2 * th * deg); return { topic: "Mohr — Shear Stress on Plane", difficulty: "hard", marks: 2, type: "NAT", stem: `Using the principal stresses marked on the Mohr circle, the shear stress on a plane whose normal makes $${th}^\\circ$ with $\\sigma_1$ is _____ MPa.`, answer: ts, tolerance: 0.2, solution: sol("With $\\sigma_1,\\sigma_3$ read off the circle, $\\tau=\\dfrac{\\sigma_1-\\sigma_3}{2}\\sin2\\theta$.", `$$\\dfrac{${s1}-${s3}}{2}\\sin${2 * th}^\\circ=${r(ts, 2)}.$$`, `$${r(ts, 2)}\\,$MPa`), archetype: "C", figure: mohrFig(s1, s3, `σ₁=${s1}, σ₃=${s3} MPa; plane at ${th}° to σ₁`) }; },
    (rand) => { const phi = rp([20, 25, 30, 35, 40], rand); const a = 45 - phi / 2; return { topic: "Conjugate Faults", difficulty: "medium", marks: 1, type: "NAT", stem: `From the Mohr-Coulomb failure envelope shown (read its friction angle $\\phi$ off the diagram), conjugate shear (fault) planes form at _____ degrees to $\\sigma_1$.`, answer: a, tolerance: 0.1, solution: sol("Read $\\phi$ from the envelope slope; Coulomb gives shear planes at $45^\\circ-\\phi/2$ to $\\sigma_1$.", `$$45-${phi}/2=${a}.$$`, `$${a}^\\circ$`), archetype: "A", figure: mohrFig(100, 20, `Failure envelope, φ=${phi}°`, phi, 10) }; },
    (rand) => { const sx = rp([60, 80, 100, 120], rand), sy = rp([0, 20, 40], rand), txy = rp([20, 30, 40], rand); const avg = (sx + sy) / 2, R = Math.sqrt(((sx - sy) / 2) ** 2 + txy ** 2); const s1 = avg + R; return { topic: "Principal Stress", difficulty: "hard", marks: 2, type: "NAT", stem: `For the 2-D state of stress shown on the element, the major principal stress $\\sigma_1$ is _____ MPa.`, answer: s1, tolerance: 0.2, solution: sol("With $\\sigma_x,\\sigma_y,\\tau_{xy}$ read off the element, $\\sigma_{1}=\\dfrac{\\sigma_x+\\sigma_y}{2}+\\sqrt{(\\tfrac{\\sigma_x-\\sigma_y}{2})^2+\\tau_{xy}^2}$.", `$$${r(avg, 1)}+\\sqrt{${r((sx - sy) / 2, 1)}^2+${txy}^2}=${r(s1, 2)}.$$`, `$${r(s1, 2)}\\,$MPa`), archetype: "C", figure: stressBlockFig(sx, sy, txy, `σx=${sx}, σy=${sy}, τxy=${txy} MPa`) }; },
    (rand) => { const sx = rp([60, 80, 100, 120], rand), sy = rp([0, 20, 40], rand), txy = rp([20, 30, 40], rand); const tp = 0.5 * Math.atan2(2 * txy, sx - sy) / deg; return { topic: "Principal Stress Orientation", difficulty: "hard", marks: 2, type: "NAT", stem: `For the stress element shown, the angle $\\theta_p$ of $\\sigma_1$ measured from the x-axis is _____ degrees.`, answer: tp, tolerance: 0.3, solution: sol("With $\\sigma_x,\\sigma_y,\\tau_{xy}$ read off the element, $\\tan2\\theta_p=\\dfrac{2\\tau_{xy}}{\\sigma_x-\\sigma_y}$.", `$$\\theta_p=\\tfrac12\\tan^{-1}\\dfrac{2(${txy})}{${sx}-${sy}}=${r(tp, 2)}^\\circ.$$`, `$${r(tp, 2)}^\\circ$`), archetype: "C", figure: stressBlockFig(sx, sy, txy, `σx=${sx}, σy=${sy}, τxy=${txy} MPa`) }; },
    (rand) => { const strike = rp([30, 60, 90, 120, 150], rand), dip = rp([35, 45, 55, 65], rand); const plunge = dip; return { topic: "Dip & Plunge", difficulty: "medium", marks: 1, type: "NAT", stem: `For the fault plane plotted on the stereonet, the plunge of the true-dip line (steepest line on the plane) is _____ degrees.`, answer: plunge, tolerance: 0.1, solution: sol("The true-dip line plunges at the dip angle (read off the great circle), in the dip direction.", `$$\\text{plunge}=\\text{dip}=${dip}^\\circ.$$`, `$${dip}^\\circ$`), archetype: "A", figure: stereonetFig(strike, dip, `Fault: ${strike}°/${dip}°`, `Fault plane on stereonet`) }; },
  ],
  "gg-mineralogy-crystallography": [
    (rand) => { const hkl = rp([[1, 0, 0], [1, 1, 0], [1, 1, 1], [2, 0, 0], [2, 1, 1]], rand), a = rp([4.0, 5.0, 5.64, 4.5], rand); const d = a / Math.sqrt(hkl[0] ** 2 + hkl[1] ** 2 + hkl[2] ** 2); return { topic: "d-spacing (cubic)", difficulty: "medium", marks: 2, type: "NAT", stem: `A cubic mineral has $a=${a}\\,$Å. The interplanar spacing $d_{${hkl.join("")}}$ is _____ Å.`, answer: d, tolerance: 0.01, solution: sol("$d_{hkl}=a/\\sqrt{h^2+k^2+l^2}$.", `$$\\dfrac{${a}}{\\sqrt{${hkl[0]}^2+${hkl[1]}^2+${hkl[2]}^2}}=${r(d, 3)}.$$`, `$${r(d, 3)}\\,$Å`), archetype: "C" }; },
    (rand) => { const d = rp([2.0, 2.5, 3.0, 3.34], rand), lam = 1.54, n = 1; const th = Math.asin(n * lam / (2 * d)) / deg; return { topic: "Bragg's Law", difficulty: "hard", marks: 2, type: "NAT", stem: `X-rays of wavelength $1.54\\,$Å reflect from planes $d=${d}\\,$Å (first order). The Bragg angle $\\theta$ is _____ degrees.`, answer: th, tolerance: 0.1, solution: sol("$n\\lambda=2d\\sin\\theta$.", `$$\\theta=\\sin^{-1}\\dfrac{1.54}{2\\times${d}}=${r(th, 2)}^\\circ.$$`, `$${r(th, 2)}^\\circ$`), archetype: "C" }; },
    (rand) => { const Z = rp([2, 4, 8], rand), M = rp([60, 100, 120, 152], rand), a = rp([4.0, 5.0, 6.0], rand); const rho = Z * M / (6.022e23 * (a * 1e-8) ** 3); return { topic: "Unit-cell Density", difficulty: "hard", marks: 2, type: "NAT", stem: `A cubic mineral: $Z=${Z}$ formula units, $M=${M}\\,$g/mol, $a=${a}\\,$Å. Its density is _____ g/cm³.`, answer: rho, tolerance: 0.05, solution: sol("$\\rho=\\dfrac{ZM}{N_A a^3}$.", `$$\\dfrac{${Z}\\times${M}}{6.022\\times10^{23}(${a}\\times10^{-8})^3}=${r(rho, 3)}.$$`, `$${r(rho, 3)}\\,$g/cm³`), archetype: "C" }; },
  ],
  "gg-igneous-petrology": [
    (rand) => { const si = rp([42, 48, 58, 68, 72], rand); const opts = ["Ultramafic", "Mafic", "Intermediate", "Felsic"]; const idx = si < 45 ? 0 : si < 52 ? 1 : si < 65 ? 2 : 3; return { topic: "Silica Classification", difficulty: "easy", marks: 1, type: "MCQ", stem: `An igneous rock contains $${si}$ wt% SiO₂. On the basis of its silica content it is classified as`, options: opts, answer: idx, solution: sol("Silica classes (wt% SiO2): ultramafic <45, mafic 45-52, intermediate 52-65, felsic >65.", `$${si}$ wt% lies in the **${opts[idx].toLowerCase()}** field.`, opts[idx]), archetype: "B" }; },
    (rand) => { const x = rp([0.2, 0.4, 0.5, 0.6, 0.8], rand); const fo = r(x * 100, 0); return { topic: "Olivine Solid Solution", difficulty: "medium", marks: 1, type: "NAT", stem: `An olivine has Mg/(Mg+Fe) $=${x}$. Its forsterite content (Fo number) is _____.`, answer: fo, tolerance: 0.5, solution: sol("Fo$\\# = 100\\times$Mg/(Mg+Fe).", `$$100\\times${x}=${fo}.$$`, `Fo$_{${fo}}$`), archetype: "A" }; },
    (rand) => { const F = rp([0.1, 0.2, 0.3], rand), D = rp([0.01, 0.05], rand), C0 = rp([10, 20, 50], rand); const CL = C0 / (D + F * (1 - D)); return { topic: "Batch Melting", difficulty: "hard", marks: 2, type: "NAT", stem: `Batch melting: $C_0=${C0}\\,$ppm, bulk $D=${D}$, melt fraction $F=${F}$. The melt concentration $C_L$ is _____ ppm.`, answer: CL, tolerance: 0.5, solution: sol("$C_L=\\dfrac{C_0}{D+F(1-D)}$.", `$$\\dfrac{${C0}}{${D}+${F}(1-${D})}=${r(CL, 2)}.$$`, `$${r(CL, 2)}\\,$ppm`), archetype: "C" }; },
  ],
  "gg-sedimentary-petrology": [
    (rand) => { const dmm = rp([0.5, 0.25, 0.125, 0.0625, 1, 2], rand); const phi = -Math.log2(dmm); return { topic: "Phi Grain Size", difficulty: "medium", marks: 1, type: "NAT", stem: `A sediment grain is $${dmm}\\,$mm in diameter. Its phi ($\\phi$) value is _____.`, answer: phi, tolerance: 0.05, solution: sol("$\\phi=-\\log_2 d_{mm}$.", `$$-\\log_2(${dmm})=${r(phi, 2)}.$$`, `$${r(phi, 2)}$`), archetype: "A" }; },
    (rand) => { const rho = rp([2.65, 2.70], rand), d = rp([0.05, 0.1, 0.2], rand); const dm = d / 1000; const vs = 9.81 * (rho - 1) * 1000 * dm * dm / (18 * 1e-3); return { topic: "Stokes Settling", difficulty: "hard", marks: 2, type: "NAT", stem: `A quartz grain ($\\rho_s=${rho}$ g/cm³, $d=${d}\\,$mm) settles in water ($\\mu=10^{-3}\\,$Pa·s). Its Stokes settling velocity is _____ mm/s.`, answer: vs * 1000, tolerance: 0.5, solution: sol("$v_s=\\dfrac{g(\\rho_s-\\rho_w)d^2}{18\\mu}$.", `$$\\dfrac{9.81\\times${r((rho - 1) * 1000, 0)}\\times(${dm})^2}{18\\times10^{-3}}=${r(vs * 1000, 3)}\\,$mm/s.$$`, `$${r(vs * 1000, 3)}\\,$mm/s`), archetype: "C" }; },
    (rand) => { const Vp = rp([0.18, 0.22, 0.25, 0.3], rand); const phi = r(Vp * 100, 0); return { topic: "Porosity", difficulty: "easy", marks: 1, type: "NAT", stem: `A sandstone core of bulk volume $100\\,$cm³ has $${r(Vp * 100, 0)}\\,$cm³ of pore space. Its porosity is _____ %.`, answer: phi, tolerance: 0.5, solution: sol("$\\phi=V_{pore}/V_{bulk}\\times100$.", `$$${r(Vp * 100, 0)}/100\\times100=${phi}.$$`, `$${phi}\\%$`), archetype: "A" }; },
  ],
  "gg-metamorphic-petrology": [
    (rand) => { const grad = rp([20, 25, 30, 35], rand), z = rp([10, 15, 20, 25], rand); const T = grad * z; return { topic: "Geothermal Gradient", difficulty: "medium", marks: 2, type: "NAT", stem: `For a geothermal gradient of $${grad}\\,^\\circ$C/km, the temperature at $${z}\\,$km (surface $0\\,^\\circ$C) is _____ $^\\circ$C.`, answer: T, tolerance: 1, solution: sol("$T=\\text{gradient}\\times z$.", `$$${grad}\\times${z}=${T}.$$`, `$${T}\\,^\\circ$C`), archetype: "A" }; },
    (rand) => { const rho = rp([2.7, 2.8, 3.0], rand), z = rp([10, 20, 30], rand); const P = rho * 1000 * 9.81 * z * 1000 / 1e9; return { topic: "Metamorphic Pressure", difficulty: "hard", marks: 2, type: "NAT", stem: `At $${z}\\,$km depth in crust of density $${rho}\\,$g/cm³, the lithostatic pressure is _____ GPa.`, answer: P, tolerance: 0.05, solution: sol("$P=\\rho g z$.", `$$${rho}\\times10^3\\times9.81\\times${z}\\times10^3/10^9=${r(P, 3)}.$$`, `$${r(P, 3)}\\,$GPa`), archetype: "C" }; },
  ],
  "gg-stratigraphy-indian-geology": [
    (rand) => { const top = rp([252, 201, 145, 66], rand), base = rp([541, 485, 419, 359, 299], rand); const dur = base - top; return { topic: "Geological Time", difficulty: "easy", marks: 1, type: "NAT", stem: `A system spans from $${base}\\,$Ma (base) to $${top}\\,$Ma (top). Its duration is _____ Myr.`, answer: dur, tolerance: 0.1, solution: sol("Duration = base age − top age.", `$$${base}-${top}=${dur}.$$`, `$${dur}\\,$Myr`), archetype: "A" }; },
    (rand) => { const thick = rp([300, 500, 800, 1000], rand), rate = rp([5, 10, 20, 25], rand); const t = thick / rate; return { topic: "Sedimentation Rate", difficulty: "medium", marks: 2, type: "NAT", stem: `A $${thick}\\,$m sequence accumulated at $${rate}\\,$m/Myr. The time represented is _____ Myr.`, answer: t, tolerance: 0.1, solution: sol("$t=\\text{thickness}/\\text{rate}$.", `$$${thick}/${rate}=${r(t, 2)}.$$`, `$${r(t, 2)}\\,$Myr`), archetype: "A" }; },
  ],
  "gg-paleontology": [
    (rand) => { const N0 = rp([1000, 2000, 5000], rand), frac = rp([0.5, 0.25, 0.125], rand); const N = N0 * frac; return { topic: "Fossil Decay (count)", difficulty: "easy", marks: 1, type: "NAT", stem: `An assemblage starts with $${N0}$ individuals; after some time a fraction $${frac}$ remain. The number remaining is _____.`, answer: N, tolerance: 0.5, solution: sol("$N=N_0\\times$ fraction.", `$$${N0}\\times${frac}=${N}.$$`, `$${N}$`), archetype: "A" }; },
    (rand) => { const fad = rp([66, 145, 201, 252], rand), lad = rp([0, 23, 34, 56], rand); const range = fad - lad; return { topic: "Taxon Range", difficulty: "medium", marks: 1, type: "NAT", stem: `A taxon's first appearance is at $${fad}\\,$Ma and last appearance at $${lad}\\,$Ma. Its stratigraphic range is _____ Myr.`, answer: range, tolerance: 0.1, solution: sol("Range = FAD − LAD.", `$$${fad}-${lad}=${range}.$$`, `$${range}\\,$Myr`), archetype: "A" }; },
  ],
  "gg-economic-ore-geology": [
    (rand) => { const grade = rp([1.5, 2.0, 2.5, 3.0], rand), tonnage = rp([1, 2, 5, 10], rand); const metal = grade / 100 * tonnage * 1e6; return { topic: "Metal Content", difficulty: "medium", marks: 2, type: "NAT", stem: `An ore body of $${tonnage}\\,$million tonnes assays $${grade}\\%$ Cu. The contained copper is _____ tonnes.`, answer: metal, tolerance: 1, solution: sol("Metal = grade × tonnage.", `$$${grade}/100\\times${tonnage}\\times10^6=${r(metal, 0)}.$$`, `$${r(metal, 0)}\\,$t`), archetype: "A" }; },
    (rand) => { const g1 = rp([1, 2, 3], rand), t1 = rp([10, 20, 30], rand), g2 = rp([4, 5, 6], rand), t2 = rp([5, 10, 15], rand); const avg = (g1 * t1 + g2 * t2) / (t1 + t2); return { topic: "Weighted Grade", difficulty: "hard", marks: 2, type: "NAT", stem: `Two ore blocks: $${t1}\\,$kt at $${g1}\\%$ and $${t2}\\,$kt at $${g2}\\%$. The combined average grade is _____ %.`, answer: avg, tolerance: 0.05, solution: sol("Weighted by tonnage.", `$$\\dfrac{${g1}\\times${t1}+${g2}\\times${t2}}{${t1}+${t2}}=${r(avg, 3)}.$$`, `$${r(avg, 3)}\\%$`), archetype: "C" }; },
  ],
  "gg-geochemistry-isotope": [
    (rand) => { const Th = rp([5730, 1250, 4470], rand), t = rp([5730, 2500, 1000, 11460], rand); const frac = Math.pow(0.5, t / Th); return { topic: "Radioactive Decay", difficulty: "hard", marks: 2, type: "NAT", stem: `An isotope of half-life $${Th}\\,$units decays for $${t}\\,$units. The remaining fraction $N/N_0$ is _____.`, answer: frac, tolerance: 0.005, solution: sol("$N/N_0=(1/2)^{t/T_{1/2}}$.", `$$(1/2)^{${t}/${Th}}=${r(frac, 4)}.$$`, `$${r(frac, 4)}$`), archetype: "C" }; },
    (rand) => { const Th = rp([1250, 4470, 48800], rand), ratio = rp([0.5, 1, 2, 3], rand); const lam = Math.LN2 / Th; const t = Math.log(1 + ratio) / lam; return { topic: "Isochron Age", difficulty: "hard", marks: 2, type: "NAT", stem: `A mineral has daughter/parent ratio $D/P=${ratio}$ for a system with half-life $${Th}\\,$Myr. Its age is _____ Myr.`, answer: t, tolerance: Th > 10000 ? 200 : 5, solution: sol("$t=\\dfrac{1}{\\lambda}\\ln(1+D/P)$, $\\lambda=\\ln2/T_{1/2}$.", `$$\\lambda=\\ln2/${Th},\\ t=\\dfrac{\\ln(1+${ratio})}{\\lambda}=${r(t, 1)}.$$`, `$${r(t, 1)}\\,$Myr`), archetype: "C" }; },
    (rand) => { const C0 = rp([100, 200, 50], rand), KD = rp([0.1, 0.5, 2, 5], rand); const Cs = C0 * KD; return { topic: "Partition Coefficient", difficulty: "medium", marks: 1, type: "NAT", stem: `For a trace element with $K_D=${KD}$ and a melt concentration $${C0}\\,$ppm, the equilibrium solid concentration is _____ ppm.`, answer: Cs, tolerance: 0.1, solution: sol("$C_{solid}=K_D\\,C_{melt}$.", `$$${KD}\\times${C0}=${Cs}.$$`, `$${Cs}\\,$ppm`), archetype: "A" }; },
  ],
  "gg-engineering-environmental-geology": [
    (rand) => { const c = rp([20, 30, 40, 50], rand), sn = rp([50, 80, 100, 120], rand), phi = rp([25, 30, 35], rand); const tau = c + sn * Math.tan(phi * deg); return { topic: "Mohr–Coulomb Strength", difficulty: "hard", marks: 2, type: "NAT", stem: `A rock joint has the Mohr-Coulomb failure envelope shown (read its cohesion $c$ and friction angle $\\phi$ off the diagram). Under a normal stress of $${sn}\\,$kPa, the peak shear strength is _____ kPa.`, answer: tau, tolerance: 1, solution: sol("Read $c$ (intercept) and $\\phi$ (slope) from the envelope, then $\\tau=c+\\sigma_n\\tan\\phi$.", `$$${c}+${sn}\\tan${phi}^\\circ=${r(tau, 1)}.$$`, `$${r(tau, 1)}\\,$kPa`), archetype: "C", figure: mohrFig(sn * 1.6, sn * 0.4, `Joint: c=${c} kPa, φ=${phi}°`, phi, c) }; },
    (rand) => { const totLen = rp([100, 150, 200], rand), sumPieces = rp([60, 80, 110, 130], rand); const rqd = sumPieces / totLen * 100; return { topic: "RQD", difficulty: "medium", marks: 2, type: "NAT", stem: `In a $${totLen}\\,$cm core run, the total length of intact pieces $\\geq 10\\,$cm is $${sumPieces}\\,$cm. The RQD is _____ %.`, answer: rqd, tolerance: 0.1, solution: sol("RQD $=\\dfrac{\\sum(\\text{pieces}\\geq10\\,cm)}{\\text{run length}}\\times100$.", `$$\\dfrac{${sumPieces}}{${totLen}}\\times100=${r(rqd, 1)}.$$`, `$${r(rqd, 1)}\\%$`), archetype: "A" }; },
    (rand) => { const K = rp([1e-4, 5e-4, 1e-5], rand), i = rp([0.01, 0.02, 0.05], rand), A = rp([10, 20, 50], rand); const Q = K * i * A; return { topic: "Darcy Flow", difficulty: "hard", marks: 2, type: "NAT", stem: `An aquifer has $K=${K}\\,$m/s, hydraulic gradient $${i}$, cross-section $${A}\\,$m². The Darcy discharge is _____ ×10⁻³ m³/s.`, answer: Q / 1e-3, tolerance: 0.05, solution: sol("$Q=KiA$.", `$$${K}\\times${i}\\times${A}=${r(Q, 7)}\\,$m³/s.$$`, `$${r(Q / 1e-3, 3)}\\times10^{-3}$`), archetype: "C" }; },
  ],
  "gg-geophysics": [
    (rand) => { const h = rp([100, 200, 500, 1000], rand); const fa = 0.3086 * h; return { topic: "Free-air Correction", difficulty: "medium", marks: 2, type: "NAT", stem: `A gravity station is $${h}\\,$m above the datum. The free-air correction is _____ mGal.`, answer: fa, tolerance: 0.1, solution: sol("Free-air correction $=0.3086\\,h$ mGal.", `$$0.3086\\times${h}=${r(fa, 2)}.$$`, `$${r(fa, 2)}\\,$mGal`), archetype: "A" }; },
    (rand) => { const rho = rp([2.4, 2.5, 2.67, 2.8], rand), h = rp([100, 200, 500], rand); const bg = 0.04193 * rho * h; return { topic: "Bouguer Correction", difficulty: "hard", marks: 2, type: "NAT", stem: `For a slab of density $${rho}\\,$g/cm³ and thickness $${h}\\,$m, the Bouguer correction is _____ mGal.`, answer: bg, tolerance: 0.1, solution: sol("Bouguer correction $=0.04193\\,\\rho\\,h$ mGal.", `$$0.04193\\times${rho}\\times${h}=${r(bg, 2)}.$$`, `$${r(bg, 2)}\\,$mGal`), archetype: "C" }; },
    (rand) => { const V1 = rp([1500, 2000, 2500], rand), V2 = rp([3500, 4000, 5000], rand); const tc = Math.asin(V1 / V2) / deg; return { topic: "Seismic Critical Angle", difficulty: "hard", marks: 2, type: "NAT", stem: `A refraction survey has $V_1=${V1}$ and $V_2=${V2}\\,$m/s. The critical angle is _____ degrees.`, answer: tc, tolerance: 0.2, solution: sol("$\\sin\\theta_c=V_1/V_2$.", `$$\\theta_c=\\sin^{-1}(${V1}/${V2})=${r(tc, 2)}^\\circ.$$`, `$${r(tc, 2)}^\\circ$`), archetype: "C" }; },
    (rand) => { const V1 = rp([1000, 1500, 2000], rand), V2 = rp([3000, 4000, 5000], rand), h = rp([20, 30, 50], rand); const xco = 2 * h * Math.sqrt((V2 + V1) / (V2 - V1)); return { topic: "Crossover Distance", difficulty: "hard", marks: 2, type: "NAT", stem: `Two-layer refraction: $V_1=${V1}$, $V_2=${V2}\\,$m/s, layer thickness $${h}\\,$m. The crossover distance is _____ m.`, answer: xco, tolerance: 1, solution: sol("$X_{co}=2h\\sqrt{\\dfrac{V_2+V_1}{V_2-V_1}}$.", `$$2\\times${h}\\sqrt{\\dfrac{${V2}+${V1}}{${V2}-${V1}}}=${r(xco, 1)}.$$`, `$${r(xco, 1)}\\,$m`), archetype: "C" }; },
    (rand) => { const a = rp([5, 10, 20], rand), V = rp([0.5, 1, 2], rand), I = rp([0.1, 0.2, 0.5], rand); const R = V / I; const rho = 2 * Math.PI * a * R; return { topic: "Wenner Resistivity", difficulty: "hard", marks: 2, type: "NAT", stem: `A Wenner array (spacing $a=${a}\\,$m) reads $V=${V}\\,$V at $I=${I}\\,$A. The apparent resistivity is _____ Ω·m.`, answer: rho, tolerance: 1, solution: sol("$\\rho_a=2\\pi a (V/I)$.", `$$2\\pi\\times${a}\\times(${V}/${I})=${r(rho, 1)}.$$`, `$${r(rho, 1)}\\,\\Omega\\cdot$m`), archetype: "C" }; },
    (rand) => { const V1 = rp([1500, 2000], rand), V2 = rp([3000, 4000, 5000], rand), ti = rp([0.02, 0.03, 0.05], rand); const h = ti / 2 * V1 * V2 / Math.sqrt(V2 ** 2 - V1 ** 2); return { topic: "Refraction Depth", difficulty: "hard", marks: 2, type: "NAT", stem: `Refraction intercept time $t_i=${ti}\\,$s, $V_1=${V1}$, $V_2=${V2}\\,$m/s. The depth to the refractor is _____ m.`, answer: h, tolerance: 0.5, solution: sol("$h=\\dfrac{t_i}{2}\\dfrac{V_1V_2}{\\sqrt{V_2^2-V_1^2}}$.", `$$\\dfrac{${ti}}{2}\\dfrac{${V1}\\times${V2}}{\\sqrt{${V2}^2-${V1}^2}}=${r(h, 2)}.$$`, `$${r(h, 2)}\\,$m`), archetype: "C" }; },
  ],
  "gg-applied-remote-sensing-gis": [
    (rand) => { const f = rp([150, 210, 300], rand), H = rp([3000, 5000, 8000], rand); const scale = H * 1000 / f; return { topic: "Photo Scale", difficulty: "medium", marks: 2, type: "NAT", stem: `An aerial camera (focal length $${f}\\,$mm) flies at $${H}\\,$m above terrain. The photo scale denominator ($H/f$) is _____.`, answer: scale, tolerance: 5, solution: sol("Scale $=f/H$; denominator $=H/f$.", `$$\\dfrac{${H}\\times10^3}{${f}}=${r(scale, 0)}.$$`, `$1:${r(scale, 0)}$`), archetype: "A" }; },
    (rand) => { const lam = rp([0.5, 0.6, 0.7, 10, 0.45], rand); const f = 3e8 / (lam * 1e-6) / 1e12; return { topic: "EM Frequency", difficulty: "medium", marks: 2, type: "NAT", stem: `Radiation of wavelength $${lam}\\,\\mu$m. Its frequency is _____ THz.`, answer: f, tolerance: 1, solution: sol("$f=c/\\lambda$.", `$$\\dfrac{3\\times10^8}{${lam}\\times10^{-6}}=${r(f, 1)}\\times10^{12}.$$`, `$${r(f, 1)}\\,$THz`), archetype: "A" }; },
    (rand) => { const gsd = rp([15, 30, 10, 5], rand), n = rp([100, 200, 256], rand); const area = (gsd * n / 1000) ** 2; return { topic: "Spatial Resolution", difficulty: "hard", marks: 2, type: "NAT", stem: `A sensor with $${gsd}\\,$m ground resolution images a $${n}\\times${n}$ pixel scene. The ground area covered is _____ km².`, answer: area, tolerance: 0.05, solution: sol("Area $=(\\text{GSD}\\times n)^2$.", `$$(${gsd}\\times${n}/1000)^2=${r(area, 3)}.$$`, `$${r(area, 3)}\\,$km²`), archetype: "C" }; },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  BULK_HARD — extra harder generators broadening coverage               */
/* ════════════════════════════════════════════════════════════════════ */

const BULK_HARD: Record<string, ((rand: () => number) => GenOut)[]> = {
  "gg-geology-mathematics": [
    (rand) => { const a = ri(rand, 2, 6), d = ri(rand, 2, 6), b = ri(rand, 1, 3); const tr = a + d, det = a * d - b * b; const l1 = (tr + Math.sqrt(tr * tr - 4 * det)) / 2; return { topic: "Eigenvalues (symmetric)", difficulty: "hard", marks: 2, type: "NAT", stem: `The larger eigenvalue of $\\begin{bmatrix}${a} & ${b}\\\\ ${b} & ${d}\\end{bmatrix}$ is _____.`, answer: l1, tolerance: 0.01, solution: sol("$\\lambda=\\dfrac{\\operatorname{tr}\\pm\\sqrt{\\operatorname{tr}^2-4\\det}}{2}$.", `$$\\dfrac{${tr}+\\sqrt{${tr}^2-4(${det})}}{2}=${r(l1, 3)}.$$`, `$${r(l1, 3)}$`), archetype: "C" }; },
    (rand) => { const lam = rp([0.5, 1, 2, 3], rand); const p0 = Math.exp(-lam); return { topic: "Poisson Probability", difficulty: "medium", marks: 2, type: "NAT", stem: `Earthquakes occur as a Poisson process with mean $\\lambda=${lam}$ per year. The probability of zero events in a year is _____.`, answer: p0, tolerance: 0.001, solution: sol("$P(0)=e^{-\\lambda}$.", `$$e^{-${lam}}=${r(p0, 4)}.$$`, `$${r(p0, 4)}$`), archetype: "C" }; },
    (rand) => { const n = rp([20, 50, 100], rand), p = rp([0.1, 0.2, 0.3], rand); const q = r(1 - p, 2); const sd = Math.sqrt(n * p * q); return { topic: "Binomial SD", difficulty: "hard", marks: 2, type: "NAT", stem: `Of $${n}$ drill holes each hits ore with probability $${p}$. The standard deviation of the number of hits is _____.`, answer: sd, tolerance: 0.01, solution: sol("$\\sigma=\\sqrt{np(1-p)}$.", `$$\\sqrt{${n}\\times${p}\\times${q}}=${r(sd, 3)}.$$`, `$${r(sd, 3)}$`), archetype: "C" }; },
    (rand) => { const a = ri(rand, 1, 6), b = ri(rand, 1, 6), c = ri(rand, 1, 6); const div = a + b + c; return { topic: "Vector Divergence", difficulty: "medium", marks: 1, type: "NAT", stem: `The divergence of $\\vec F=${a}x\\,\\hat i+${b}y\\,\\hat j+${c}z\\,\\hat k$ is _____.`, answer: div, tolerance: 0.001, solution: sol("$\\nabla\\cdot\\vec F=\\partial_xF_x+\\partial_yF_y+\\partial_zF_z$.", `$$${a}+${b}+${c}=${div}.$$`, `$${div}$`), archetype: "A" }; },
  ],
  "gg-earth-system-geomorphology": [
    (rand) => { const Re = 6371, lat = rp([10, 20, 30, 45, 60], rand); const circ = 2 * Math.PI * Re * Math.cos(lat * deg); return { topic: "Earth Geometry", difficulty: "hard", marks: 2, type: "NAT", stem: `The Earth's radius is $6371\\,$km. The circumference of the parallel of latitude $${lat}^\\circ$ is _____ km.`, answer: circ, tolerance: 5, solution: sol("$C=2\\pi R\\cos\\phi$.", `$$2\\pi\\times6371\\cos${lat}^\\circ=${r(circ, 0)}.$$`, `$${r(circ, 0)}\\,$km`), archetype: "C" }; },
    (rand) => { const Q = rp([100, 200, 500], rand), w = rp([10, 20, 50], rand), d = rp([1, 2, 3], rand); const v = Q / (w * d); return { topic: "Stream Discharge", difficulty: "medium", marks: 2, type: "NAT", stem: `A river carries $${Q}\\,$m³/s through a channel $${w}\\,$m wide and $${d}\\,$m deep. The mean velocity is _____ m/s.`, answer: v, tolerance: 0.05, solution: sol("$Q=A v=wdv$.", `$$\\dfrac{${Q}}{${w}\\times${d}}=${r(v, 2)}.$$`, `$${r(v, 2)}\\,$m/s`), archetype: "A" }; },
    (rand) => { const drop = rp([100, 200, 300], rand), len = rp([10, 20, 50], rand); const grad = drop / (len * 1000) * 1000; return { topic: "Stream Gradient", difficulty: "medium", marks: 2, type: "NAT", stem: `A stream falls $${drop}\\,$m over $${len}\\,$km. Its gradient is _____ m/km.`, answer: drop / len, tolerance: 0.05, solution: sol("Gradient = drop / length.", `$$${drop}/${len}=${r(drop / len, 2)}.$$`, `$${r(drop / len, 2)}\\,$m/km`), archetype: "A" }; },
  ],
  "gg-structural-geology": [
    (rand) => { const l0 = rp([100, 120, 150], rand), l1 = rp([130, 160, 180, 200], rand); const e = (l1 - l0) / l0 * 100; return { topic: "Extensional Strain", difficulty: "medium", marks: 2, type: "NAT", stem: `A marker bed of original length $${l0}\\,$m is stretched to $${l1}\\,$m. The extension (elongation) is _____ %.`, answer: e, tolerance: 0.1, solution: sol("$e=\\dfrac{l_1-l_0}{l_0}\\times100$.", `$$\\dfrac{${l1}-${l0}}{${l0}}\\times100=${r(e, 2)}.$$`, `$${r(e, 2)}\\%$`), archetype: "A" }; },
    (rand) => { const s1 = rp([90, 120, 150], rand), s3 = rp([10, 30, 50], rand); const c = (s1 + s3) / 2; return { topic: "Mohr — Centre", difficulty: "medium", marks: 1, type: "NAT", stem: `For the Mohr circle shown (read $\\sigma_1$ and $\\sigma_3$ off the diagram), the mean stress (centre of the circle) is _____ MPa.`, answer: c, tolerance: 0.1, solution: sol("Centre $=(\\sigma_1+\\sigma_3)/2$.", `$$\\dfrac{${s1}+${s3}}{2}=${c}.$$`, `$${c}\\,$MPa`), archetype: "A", figure: mohrFig(s1, s3, `σ₁=${s1}, σ₃=${s3} MPa`) }; },
    (rand) => { const dip = rp([20, 30, 40, 50], rand), beta = rp([25, 35, 50, 65], rand); const app = Math.atan(Math.tan(dip * deg) * Math.sin(beta * deg)) / deg; return { topic: "Apparent Dip", difficulty: "hard", marks: 2, type: "NAT", stem: `The coal seam is plotted on the stereonet (read its true dip from the great circle). A mine drift trends at $${beta}^\\circ$ to the strike. The apparent dip in the drift is _____ degrees.`, answer: app, tolerance: 0.2, solution: sol("Read the seam's true dip off the great circle, then $\\tan\\delta_{app}=\\tan\\delta\\sin\\beta$.", `$$\\tan^{-1}(\\tan${dip}^\\circ\\sin${beta}^\\circ)=${r(app, 2)}^\\circ.$$`, `$${r(app, 2)}^\\circ$`), archetype: "C", figure: stereonetFig(0, dip, `Seam dip ${dip}°`, `Drift at ${beta}° to strike`) }; },
    (rand) => { const sx = rp([70, 90, 110], rand), sy = rp([10, 30, 50], rand), txy = rp([20, 30, 40], rand); const avg = (sx + sy) / 2, R = Math.sqrt(((sx - sy) / 2) ** 2 + txy ** 2); const s3 = avg - R; return { topic: "Minor Principal Stress", difficulty: "hard", marks: 2, type: "NAT", stem: `For the 2-D state of stress shown on the element, the minor principal stress $\\sigma_3$ is _____ MPa.`, answer: s3, tolerance: 0.2, solution: sol("With $\\sigma_x,\\sigma_y,\\tau_{xy}$ read off the element, $\\sigma_3=\\dfrac{\\sigma_x+\\sigma_y}{2}-\\sqrt{(\\tfrac{\\sigma_x-\\sigma_y}{2})^2+\\tau_{xy}^2}$.", `$$${r(avg, 1)}-\\sqrt{${r((sx - sy) / 2, 1)}^2+${txy}^2}=${r(s3, 2)}.$$`, `$${r(s3, 2)}\\,$MPa`), archetype: "C", figure: stressBlockFig(sx, sy, txy, `σx=${sx}, σy=${sy}, τxy=${txy} MPa`) }; },
    (rand) => { const sx = rp([70, 90, 110], rand), sy = rp([10, 30, 50], rand), txy = rp([20, 30, 40], rand); const R = Math.sqrt(((sx - sy) / 2) ** 2 + txy ** 2); return { topic: "Max In-plane Shear", difficulty: "hard", marks: 2, type: "NAT", stem: `For the stress element shown, the maximum in-plane shear stress is _____ MPa.`, answer: R, tolerance: 0.2, solution: sol("With $\\sigma_x,\\sigma_y,\\tau_{xy}$ read off the element, $\\tau_{max}=\\sqrt{(\\tfrac{\\sigma_x-\\sigma_y}{2})^2+\\tau_{xy}^2}$.", `$$\\sqrt{${r((sx - sy) / 2, 1)}^2+${txy}^2}=${r(R, 2)}.$$`, `$${r(R, 2)}\\,$MPa`), archetype: "C", figure: stressBlockFig(sx, sy, txy, `σx=${sx}, σy=${sy}, τxy=${txy} MPa`) }; },
    (rand) => { const strike = rp([0, 45, 90, 135], rand), dip = rp([30, 45, 60, 75], rand); const dipDir = (strike + 90) % 360; return { topic: "Dip Direction", difficulty: "medium", marks: 1, type: "NAT", stem: `For the bed plotted on the stereonet (drawn with the right-hand rule), the dip direction (azimuth) is _____ degrees.`, answer: dipDir, tolerance: 0.1, solution: sol("Dip direction = strike + 90° (right-hand rule).", `$$${strike}+90=${dipDir}.$$`, `$${dipDir}^\\circ$`), archetype: "A", figure: stereonetFig(strike, dip, `${strike}°/${dip}°`, `Plane on stereonet`) }; },
  ],
  "gg-mineralogy-crystallography": [
    (rand) => { const hkl = rp([[2, 0, 0], [2, 2, 0], [2, 2, 2], [3, 1, 1], [4, 0, 0]], rand), a = rp([4.0, 5.43, 5.64], rand); const d = a / Math.sqrt(hkl[0] ** 2 + hkl[1] ** 2 + hkl[2] ** 2); return { topic: "d-spacing (cubic)", difficulty: "hard", marks: 2, type: "NAT", stem: `A cubic crystal ($a=${a}\\,$Å) diffracts from $(${hkl.join("")})$. The $d$-spacing is _____ Å.`, answer: d, tolerance: 0.01, solution: sol("$d=a/\\sqrt{h^2+k^2+l^2}$.", `$$\\dfrac{${a}}{\\sqrt{${hkl[0]}^2+${hkl[1]}^2+${hkl[2]}^2}}=${r(d, 3)}.$$`, `$${r(d, 3)}\\,$Å`), archetype: "C" }; },
    (rand) => { const ratio = rp([0.225, 0.414, 0.732], rand); const cn = ratio < 0.414 ? 4 : ratio < 0.732 ? 6 : 8; return { topic: "Coordination Number", difficulty: "hard", marks: 1, type: "NAT", stem: `A cation/anion radius ratio is $${ratio}$. The predicted coordination number is _____.`, answer: cn, tolerance: 0.001, solution: sol("Ratio 0.225–0.414→4, 0.414–0.732→6, 0.732–1.0→8.", `$$${ratio}\\Rightarrow CN=${cn}.$$`, `$${cn}$`), archetype: "A" }; },
    (rand) => { const th = rp([10, 15, 20, 25], rand), d = rp([2.0, 2.5, 3.0], rand); const lam = 2 * d * Math.sin(th * deg); return { topic: "Bragg Wavelength", difficulty: "hard", marks: 2, type: "NAT", stem: `First-order diffraction occurs at $\\theta=${th}^\\circ$ from planes $d=${d}\\,$Å. The X-ray wavelength is _____ Å.`, answer: lam, tolerance: 0.01, solution: sol("$\\lambda=2d\\sin\\theta$.", `$$2\\times${d}\\sin${th}^\\circ=${r(lam, 3)}.$$`, `$${r(lam, 3)}\\,$Å`), archetype: "C" }; },
  ],
  "gg-igneous-petrology": [
    (rand) => { const F = rp([0.05, 0.1, 0.2], rand), C0 = rp([100, 200, 500], rand), D = rp([2, 3, 5], rand); const CL = C0 * Math.pow(F, D - 1); return { topic: "Rayleigh Fractionation", difficulty: "hard", marks: 2, type: "NAT", stem: `Rayleigh fractionation: $C_0=${C0}\\,$ppm, melt fraction remaining $F=${F}$, $D=${D}$. The residual-melt concentration is _____ ppm.`, answer: CL, tolerance: 1, solution: sol("$C_L=C_0F^{(D-1)}$.", `$$${C0}\\times${F}^{${D}-1}=${r(CL, 2)}.$$`, `$${r(CL, 2)}\\,$ppm`), archetype: "C" }; },
    (rand) => { const an = rp([20, 40, 60, 80], rand); const opts = ["Oligoclase", "Andesine", "Labradorite", "Bytownite"]; const idx = an < 30 ? 0 : an < 50 ? 1 : an < 70 ? 2 : 3; return { topic: "Plagioclase Composition", difficulty: "medium", marks: 1, type: "MCQ", stem: `A plagioclase feldspar has the composition An$_{${an}}$ (i.e. ${an}% anorthite). Its name in the plagioclase series is`, options: opts, answer: idx, solution: sol("Plagioclase series by anorthite content: albite 0-10, oligoclase 10-30, andesine 30-50, labradorite 50-70, bytownite 70-90, anorthite 90-100.", `An$_{${an}}$ falls in the **${opts[idx]}** range.`, opts[idx]), archetype: "B" }; },
    (rand) => { const T1 = rp([1200, 1100, 1000], rand), T2 = rp([800, 700, 900], rand); const dT = T1 - T2; return { topic: "Crystallisation Interval", difficulty: "easy", marks: 1, type: "NAT", stem: `A magma begins crystallising at $${T1}\\,^\\circ$C and is fully solid at $${T2}\\,^\\circ$C. The crystallisation interval is _____ $^\\circ$C.`, answer: dT, tolerance: 0.1, solution: sol("Interval = liquidus − solidus.", `$$${T1}-${T2}=${dT}.$$`, `$${dT}\\,^\\circ$C`), archetype: "A" }; },
  ],
  "gg-sedimentary-petrology": [
    (rand) => { const p84 = rp([2, 3, 4], rand), p16 = rp([0, 1], rand); const sort = (p84 - p16) / 2; return { topic: "Sorting (graphic SD)", difficulty: "hard", marks: 2, type: "NAT", stem: `A grain-size distribution has $\\phi_{84}=${p84}$ and $\\phi_{16}=${p16}$. The inclusive graphic sorting (approx $(\\phi_{84}-\\phi_{16})/2$) is _____.`, answer: sort, tolerance: 0.05, solution: sol("$\\sigma_\\phi\\approx(\\phi_{84}-\\phi_{16})/2$.", `$$(${p84}-${p16})/2=${r(sort, 2)}.$$`, `$${r(sort, 2)}\\,\\phi$`), archetype: "C" }; },
    (rand) => { const phi = rp([0.2, 0.25, 0.3], rand), Vb = rp([100, 200, 500], rand); const vp = phi * Vb; return { topic: "Pore Volume", difficulty: "medium", marks: 1, type: "NAT", stem: `A rock of porosity $${phi}$ has bulk volume $${Vb}\\,$cm³. The pore volume is _____ cm³.`, answer: vp, tolerance: 0.5, solution: sol("$V_{pore}=\\phi V_{bulk}$.", `$$${phi}\\times${Vb}=${vp}.$$`, `$${vp}\\,$cm³`), archetype: "A" }; },
    (rand) => { const d10 = rp([0.1, 0.2, 0.3], rand), d60 = rp([0.6, 0.9, 1.2], rand); const cu = d60 / d10; return { topic: "Uniformity Coefficient", difficulty: "medium", marks: 2, type: "NAT", stem: `A sand has $d_{60}=${d60}\\,$mm and $d_{10}=${d10}\\,$mm. Its uniformity coefficient $C_u$ is _____.`, answer: cu, tolerance: 0.05, solution: sol("$C_u=d_{60}/d_{10}$.", `$$${d60}/${d10}=${r(cu, 2)}.$$`, `$${r(cu, 2)}$`), archetype: "A" }; },
  ],
  "gg-metamorphic-petrology": [
    (rand) => { const P = rp([0.3, 0.5, 0.8, 1.0], rand), rho = rp([2.7, 2.8], rand); const z = P * 1e9 / (rho * 1000 * 9.81) / 1000; return { topic: "Pressure to Depth", difficulty: "hard", marks: 2, type: "NAT", stem: `A metamorphic assemblage equilibrated at $${P}\\,$GPa in crust of density $${rho}\\,$g/cm³. The depth is _____ km.`, answer: z, tolerance: 0.5, solution: sol("$z=P/(\\rho g)$.", `$$\\dfrac{${P}\\times10^9}{${rho}\\times10^3\\times9.81}/10^3=${r(z, 2)}.$$`, `$${r(z, 2)}\\,$km`), archetype: "C" }; },
    (rand) => { const dT = rp([100, 200, 300], rand), dz = rp([5, 10, 15], rand); const g = dT / dz; return { topic: "Field Gradient", difficulty: "medium", marks: 2, type: "NAT", stem: `Two isograds $${dz}\\,$km apart record a temperature difference of $${dT}\\,^\\circ$C. The implied gradient is _____ $^\\circ$C/km.`, answer: g, tolerance: 0.1, solution: sol("Gradient $=\\Delta T/\\Delta z$.", `$$${dT}/${dz}=${r(g, 2)}.$$`, `$${r(g, 2)}\\,^\\circ$C/km`), archetype: "A" }; },
  ],
  "gg-stratigraphy-indian-geology": [
    (rand) => { const t1 = rp([1000, 1600, 2500], rand), t2 = rp([541, 635, 750], rand); const gap = t1 - t2; return { topic: "Unconformity Gap", difficulty: "medium", marks: 2, type: "NAT", stem: `Beds of $${t1}\\,$Ma are overlain unconformably by beds of $${t2}\\,$Ma. The hiatus is _____ Myr.`, answer: gap, tolerance: 0.1, solution: sol("Hiatus = older − younger age.", `$$${t1}-${t2}=${gap}.$$`, `$${gap}\\,$Myr`), archetype: "A" }; },
    (rand) => { const dip = rp([10, 20, 30], rand), w = rp([200, 500, 1000], rand); const t = w * Math.sin(dip * deg); return { topic: "True Thickness", difficulty: "hard", marks: 2, type: "NAT", stem: `A bed dipping $${dip}^\\circ$ crops out across a horizontal width of $${w}\\,$m (perpendicular to strike). Its true thickness is _____ m.`, answer: t, tolerance: 1, solution: sol("$t=w\\sin\\delta$ (horizontal traverse $\\perp$ strike).", `$$${w}\\sin${dip}^\\circ=${r(t, 1)}.$$`, `$${r(t, 1)}\\,$m`), archetype: "C" }; },
  ],
  "gg-paleontology": [
    (rand) => { const N0 = rp([800, 1000, 1600], rand), Th = rp([5, 10, 20], rand), t = rp([10, 20, 30], rand); const N = N0 * Math.pow(0.5, t / Th); return { topic: "Extinction Decay", difficulty: "hard", marks: 2, type: "NAT", stem: `A clade of $${N0}$ genera halves every $${Th}\\,$Myr. After $${t}\\,$Myr, the number of genera is _____.`, answer: N, tolerance: 1, solution: sol("$N=N_0(1/2)^{t/T}$.", `$$${N0}(1/2)^{${t}/${Th}}=${r(N, 1)}.$$`, `$${r(N, 1)}$`), archetype: "C" }; },
    (rand) => { const total = rp([50, 80, 100], rand), surv = rp([10, 20, 30], rand); const ext = (total - surv) / total * 100; return { topic: "Extinction Percentage", difficulty: "medium", marks: 2, type: "NAT", stem: `Of $${total}$ genera before a mass extinction, $${surv}$ survived. The extinction percentage is _____ %.`, answer: ext, tolerance: 0.1, solution: sol("Extinction% $=(1-\\text{survivors}/\\text{total})\\times100$.", `$$\\dfrac{${total}-${surv}}{${total}}\\times100=${r(ext, 1)}.$$`, `$${r(ext, 1)}\\%$`), archetype: "A" }; },
  ],
  "gg-economic-ore-geology": [
    (rand) => { const cog = rp([0.3, 0.5, 1.0], rand), avg = rp([1.2, 2.0, 3.0], rand); const ratio = avg / cog; return { topic: "Grade/Cut-off Ratio", difficulty: "easy", marks: 1, type: "NAT", stem: `An ore body averages $${avg}\\%$ metal against a cut-off grade of $${cog}\\%$. The grade-to-cut-off ratio is _____.`, answer: ratio, tolerance: 0.05, solution: sol("Ratio = average grade / cut-off.", `$$${avg}/${cog}=${r(ratio, 2)}.$$`, `$${r(ratio, 2)}$`), archetype: "A" }; },
    (rand) => { const t = rp([2, 5, 10], rand), g = rp([5, 8, 10], rand), rec = rp([0.85, 0.9], rand); const m = t * 1e6 * g * rec; return { topic: "Recoverable Metal", difficulty: "hard", marks: 2, type: "NAT", stem: `An ore body of $${t}\\,$Mt at $${g}\\,$g/t Au is processed at $${r(rec * 100, 0)}\\%$ recovery. The recoverable gold is _____ kg. (1 g/t = 1 g per tonne)`, answer: m / 1000, tolerance: 10, solution: sol("Metal $=$ tonnage $\\times$ grade $\\times$ recovery.", `$$${t}\\times10^6\\times${g}\\times${rec}/1000=${r(m / 1000, 0)}\\,$kg.$$`, `$${r(m / 1000, 0)}\\,$kg`), archetype: "C" }; },
  ],
  "gg-geochemistry-isotope": [
    (rand) => { const Th = 5730, t = rp([2865, 11460, 17190, 8595], rand); const frac = Math.pow(0.5, t / Th) * 100; return { topic: "Radiocarbon", difficulty: "hard", marks: 2, type: "NAT", stem: `$^{14}$C has a half-life of $5730\\,$yr. After $${t}\\,$yr the percentage of $^{14}$C remaining is _____ %.`, answer: frac, tolerance: 0.5, solution: sol("$N/N_0=(1/2)^{t/T}$.", `$$(1/2)^{${t}/5730}\\times100=${r(frac, 2)}.$$`, `$${r(frac, 2)}\\%$`), archetype: "C" }; },
    (rand) => { const Th = rp([1250, 4470], rand), t = rp([625, 2235, 1250], rand); const lam = Math.LN2 / Th; const N = 100 * Math.exp(-lam * t); return { topic: "Decay (exponential)", difficulty: "hard", marks: 2, type: "NAT", stem: `A radionuclide ($T_{1/2}=${Th}\\,$Myr) starts at $100$ units. After $${t}\\,$Myr the remaining amount is _____ units.`, answer: N, tolerance: 0.5, solution: sol("$N=N_0e^{-\\lambda t}$, $\\lambda=\\ln2/T_{1/2}$.", `$$100e^{-(\\ln2/${Th})${t}}=${r(N, 2)}.$$`, `$${r(N, 2)}$`), archetype: "C" }; },
    (rand) => { const reservoir = rp([0.7025, 0.704, 0.706], rand); const idx = reservoir < 0.7035 ? 0 : 1; return { topic: "Sr Isotope Source", difficulty: "medium", marks: 1, type: "NAT", stem: `A basalt has initial $^{87}$Sr/$^{86}$Sr $=${reservoir}$. Index its source (0 = mantle ≤0.7035, 1 = crustal >0.7035): _____.`, answer: idx, tolerance: 0.001, solution: sol("Low initial ratios indicate a mantle source; high ratios indicate crustal contamination.", `$$${reservoir}\\Rightarrow ${idx}.$$`, `$${idx}$`), archetype: "A" }; },
  ],
  "gg-engineering-environmental-geology": [
    (rand) => { const K = rp([1e-5, 5e-5, 1e-4], rand), b = rp([10, 20, 30], rand); const T = K * b; return { topic: "Transmissivity", difficulty: "medium", marks: 2, type: "NAT", stem: `An aquifer has hydraulic conductivity $K=${K}\\,$m/s and saturated thickness $${b}\\,$m. Its transmissivity is _____ ×10⁻³ m²/s.`, answer: T / 1e-3, tolerance: 0.05, solution: sol("$T=Kb$.", `$$${K}\\times${b}=${r(T, 6)}\\,$m²/s.$$`, `$${r(T / 1e-3, 3)}\\times10^{-3}$`), archetype: "A" }; },
    (rand) => { const FS = rp([1.2, 1.5, 2.0], rand), driving = rp([100, 200, 300], rand); const resist = FS * driving; return { topic: "Slope Factor of Safety", difficulty: "medium", marks: 2, type: "NAT", stem: `A slope has a driving force of $${driving}\\,$kN and a factor of safety of $${FS}$. The resisting force is _____ kN.`, answer: resist, tolerance: 1, solution: sol("$FS=\\dfrac{\\text{resisting}}{\\text{driving}}$.", `$$${FS}\\times${driving}=${resist}.$$`, `$${resist}\\,$kN`), archetype: "A" }; },
    (rand) => { const c = rp([10, 20, 30], rand), sn = rp([40, 60, 80, 100], rand), phi = rp([25, 30, 35, 40], rand); const tau = c + sn * Math.tan(phi * deg); return { topic: "Joint Shear Strength", difficulty: "hard", marks: 2, type: "NAT", stem: `A discontinuity has the Mohr-Coulomb failure envelope shown (read its cohesion $c$ and friction angle $\\phi$ off the diagram). It carries a normal stress of $${sn}\\,$kPa. Its peak shear strength is _____ kPa.`, answer: tau, tolerance: 1, solution: sol("Read $c$ and $\\phi$ from the envelope, then $\\tau=c+\\sigma_n\\tan\\phi$.", `$$${c}+${sn}\\tan${phi}^\\circ=${r(tau, 1)}.$$`, `$${r(tau, 1)}\\,$kPa`), archetype: "C", figure: mohrFig(sn * 1.7, sn * 0.3, `c=${c} kPa, φ=${phi}°`, phi, c) }; },
  ],
  "gg-geophysics": [
    (rand) => { const K = rp([40, 60, 75], rand), mu = rp([20, 30, 40], rand), rho = rp([2.4, 2.6, 2.7], rand); const Vp = Math.sqrt((K + 4 / 3 * mu) * 1e9 / (rho * 1000)); return { topic: "P-wave Velocity", difficulty: "hard", marks: 2, type: "NAT", stem: `A rock has bulk modulus $${K}\\,$GPa, shear modulus $${mu}\\,$GPa, density $${rho}\\,$g/cm³. Its P-wave velocity is _____ m/s.`, answer: Vp, tolerance: 20, solution: sol("$V_p=\\sqrt{(K+\\tfrac43\\mu)/\\rho}$.", `$$\\sqrt{\\dfrac{(${K}+\\tfrac43\\times${mu})\\times10^9}{${rho}\\times10^3}}=${r(Vp, 0)}.$$`, `$${r(Vp, 0)}\\,$m/s`), archetype: "C" }; },
    (rand) => { const mu = rp([20, 30, 40], rand), rho = rp([2.4, 2.6, 2.7], rand); const Vs = Math.sqrt(mu * 1e9 / (rho * 1000)); return { topic: "S-wave Velocity", difficulty: "hard", marks: 2, type: "NAT", stem: `A rock has shear modulus $${mu}\\,$GPa and density $${rho}\\,$g/cm³. Its S-wave velocity is _____ m/s.`, answer: Vs, tolerance: 20, solution: sol("$V_s=\\sqrt{\\mu/\\rho}$.", `$$\\sqrt{\\dfrac{${mu}\\times10^9}{${rho}\\times10^3}}=${r(Vs, 0)}.$$`, `$${r(Vs, 0)}\\,$m/s`), archetype: "C" }; },
    (rand) => { const x = rp([100, 200, 300], rand), t0 = rp([0.05, 0.08, 0.1], rand), V = rp([2000, 3000, 4000], rand); const t = Math.sqrt(t0 ** 2 + (x / V) ** 2); return { topic: "Reflection Travel-time", difficulty: "hard", marks: 2, type: "NAT", stem: `A reflector gives $t_0=${t0}\\,$s at zero offset and the medium velocity is $${V}\\,$m/s. At offset $${x}\\,$m the two-way time is _____ s.`, answer: t, tolerance: 0.005, solution: sol("$t=\\sqrt{t_0^2+(x/V)^2}$.", `$$\\sqrt{${t0}^2+(${x}/${V})^2}=${r(t, 4)}.$$`, `$${r(t, 4)}\\,$s`), archetype: "C" }; },
    (rand) => { const I = rp([60000, 50000, 45000], rand), incl = rp([30, 45, 60], rand); const H = I * Math.cos(incl * deg); return { topic: "Magnetic Horizontal Component", difficulty: "medium", marks: 2, type: "NAT", stem: `The total geomagnetic field is $${I}\\,$nT with inclination $${incl}^\\circ$. The horizontal component is _____ nT.`, answer: H, tolerance: 5, solution: sol("$H=F\\cos I$.", `$$${I}\\cos${incl}^\\circ=${r(H, 0)}.$$`, `$${r(H, 0)}\\,$nT`), archetype: "A" }; },
  ],
  "gg-applied-remote-sensing-gis": [
    (rand) => { const sd = rp([10000, 20000, 25000], rand), photo = rp([100, 150, 200], rand); const ground = sd * photo / 1000; return { topic: "Ground Distance", difficulty: "medium", marks: 2, type: "NAT", stem: `On a $1:${sd}$ map, two points are $${photo}\\,$mm apart. The ground distance is _____ m.`, answer: ground, tolerance: 1, solution: sol("Ground = map distance × scale denominator.", `$$${photo}\\times10^{-3}\\times${sd}=${r(ground, 0)}.$$`, `$${r(ground, 0)}\\,$m`), archetype: "A" }; },
    (rand) => { const swath = rp([185, 60, 120], rand), repeat = rp([16, 26, 5], rand); const perDay = swath / repeat; return { topic: "Revisit Coverage", difficulty: "hard", marks: 2, type: "NAT", stem: `A satellite of $${swath}\\,$km swath has a $${repeat}\\,$day repeat cycle. The equivalent ground swath progressed per day is _____ km/day.`, answer: perDay, tolerance: 0.5, solution: sol("Per-day shift = swath / repeat cycle.", `$$${swath}/${repeat}=${r(perDay, 2)}.$$`, `$${r(perDay, 2)}\\,$km/day`), archetype: "A" }; },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  Hand-authored conceptual cores (one builder per subject)              */
/* ════════════════════════════════════════════════════════════════════ */

function buildMath(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-mat", "Mathematics & Geostatistics");
  b.mcq("Probability", "easy", 1, "Two drill holes are tested independently; each strikes ore with probability $0.5$. The probability that at least one strikes ore is", ["$0.75$", "$0.5$", "$0.25$", "$1.0$"], 0, sol("$P(\\text{at least one})=1-P(\\text{none})=1-0.5^2$.", "$$1-0.25=0.75.$$", "$0.75$"), "B");
  b.mcq("Statistics", "medium", 1, "For a positively skewed assay distribution, which ordering is generally correct?", ["mode < median < mean", "mean < median < mode", "mean = median = mode", "median < mode < mean"], 0, sol("Right (positive) skew pulls the mean above the median above the mode.", "mode < median < mean.", "mode < median < mean"), "B");
  b.msq("Geostatistics", "hard", 2, "Which statements about the semivariogram are correct?", ["The nugget represents micro-scale variability and measurement error", "The sill is the variance at which the semivariogram levels off", "The range is the lag beyond which samples are correlated", "Kriging is an exact interpolator at data points"], [0, 1, 3], sol("Nugget = micro-variance; sill = plateau variance; the range is the lag at which correlation VANISHES (beyond the range samples are uncorrelated); kriging honours data.", "Options 1, 2, 4.", "Nugget, sill, kriging-exactness"), "D");
  b.mcq("Numerical Methods", "medium", 1, "The trapezoidal rule approximates the area under a curve using", ["straight-line segments between points", "parabolic arcs", "cubic splines only", "random sampling"], 0, sol("Trapezoidal rule joins successive points by straight lines.", "Straight-line segments.", "Straight-line segments"), "B");
  return { slug: "gg-geology-mathematics", name: "Mathematics & Geostatistics", questions: b.out };
}

function buildEarth(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-ear", "Earth System & Geomorphology");
  b.mcq("Earth Interior", "easy", 1, "The boundary between the crust and the mantle is the", ["Mohorovičić discontinuity", "Gutenberg discontinuity", "Lehmann discontinuity", "Conrad discontinuity"], 0, sol("The Moho separates crust from mantle; Gutenberg = mantle–core; Lehmann = inner–outer core.", "Moho.", "Mohorovičić discontinuity"), "B");
  b.mcq("Plate Tectonics", "medium", 1, "Linear magnetic stripes of alternating polarity, symmetric about a mid-ocean ridge, are direct evidence for", ["sea-floor spreading", "continental collision", "isostatic rebound", "hotspot volcanism"], 0, sol("Vine–Matthews: symmetric magnetic anomalies record sea-floor spreading.", "Sea-floor spreading.", "Sea-floor spreading"), "B");
  b.mcq("Geomorphology", "medium", 1, "A meandering river deposits coarse sediment preferentially on the", ["point bar (inner bank)", "cut bank (outer bank)", "thalweg", "levee crest only"], 0, sol("Velocity is lowest on the inner bend, so point bars accrete there; the outer bank erodes.", "Point bar.", "Point bar (inner bank)"), "B");
  b.msq("Landforms", "hard", 2, "Which landforms are characteristically glacial in origin?", ["Cirque", "Drumlin", "Yardang", "Esker"], [0, 1, 3], sol("Cirque, drumlin and esker are glacial; a yardang is wind (aeolian) carved.", "Cirque, drumlin, esker.", "Glacial landforms"), "D");
  b.mcq("Isostasy", "medium", 1, "In the Airy model of isostasy, mountains are compensated by", ["deep low-density crustal roots", "lateral density variations only", "denser crust under highlands", "mantle convection currents"], 0, sol("Airy: constant-density crust of variable thickness — high topography has a deep root.", "Deep roots.", "Deep low-density roots"), "B");
  return { slug: "gg-earth-system-geomorphology", name: "Earth System & Geomorphology", questions: b.out };
}

function buildStructural(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-str", "Structural Geology");
  b.mcq("Folds", "easy", 1, "In an antiform, the oldest beds (if not overturned) are found", ["in the core", "on the limbs", "at the hinge surface only", "above the axial plane"], 0, sol("An anticline/antiform exposes the oldest strata in its core.", "Core.", "In the core"), "B");
  b.mcq("Faults", "medium", 1, "A reverse fault forms under a stress regime in which", ["$\\sigma_1$ is horizontal and $\\sigma_3$ is vertical", "$\\sigma_1$ is vertical and $\\sigma_3$ is horizontal", "all principal stresses are equal", "$\\sigma_2$ is vertical and largest"], 0, sol("Andersonian theory: reverse (thrust) faulting has horizontal $\\sigma_1$, vertical $\\sigma_3$.", "Horizontal $\\sigma_1$.", "$\\sigma_1$ horizontal"), "B", mohrFig(120, 30, "Compressional stress state"));
  b.nat("Stress on Plane", "hard", 2, "For the principal stresses shown on the Mohr circle, the shear stress on a plane whose normal is at $30^\\circ$ to $\\sigma_1$ is _____ MPa.", (120 - 40) / 2 * Math.sin(60 * deg), 0.2, sol("$\\tau=\\dfrac{\\sigma_1-\\sigma_3}{2}\\sin2\\theta$.", "$$\\dfrac{120-40}{2}\\sin60^\\circ=34.64.$$", "$34.64\\,$MPa"), "C", mohrFig(120, 40, "σ₁=120, σ₃=40 MPa; plane at 30° to σ₁"));
  b.mcq("Stereonet", "medium", 1, "On an equal-area (Schmidt) stereonet, a plane is represented as a", ["great circle", "single point at the centre", "small circle only", "straight diameter always"], 0, sol("A plane plots as a great circle; its pole plots as a point.", "Great circle.", "Great circle"), "B", stereonetFig(40, 50, "Plane 040°/50°", "A dipping plane as a great circle"));
  b.msq("Structures", "hard", 2, "Which features indicate the younging (way-up) direction in deformed strata?", ["Graded bedding", "Cross-bedding truncations", "Cleavage–bedding intersection angle", "Ripple marks (asymmetric)"], [0, 1, 3], sol("Graded bedding, cross-bed truncations and ripple/desiccation features are way-up criteria; cleavage–bedding angle gives fold position, not younging.", "Options 1, 2, 4.", "Way-up criteria"), "D");
  return { slug: "gg-structural-geology", name: "Structural Geology", questions: b.out };
}

function buildMineralogy(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-min", "Mineralogy & Crystallography");
  b.mcq("Crystal Systems", "easy", 1, "The number of crystal systems and Bravais lattices respectively are", ["7 and 14", "6 and 14", "7 and 32", "14 and 230"], 0, sol("7 crystal systems, 14 Bravais lattices, 32 point groups, 230 space groups.", "7 and 14.", "7 and 14"), "B");
  b.mcq("Silicate Structures", "medium", 1, "The silicate structural class with a Si:O ratio of 1:3 (single-chain) is the", ["pyroxenes", "olivines", "micas", "feldspars"], 0, sol("Single-chain inosilicates (pyroxenes) have Si:O = 1:3.", "Pyroxenes.", "Pyroxenes"), "B");
  b.mcq("Hardness", "easy", 1, "On the Mohs scale, the mineral with hardness 7 is", ["quartz", "calcite", "orthoclase", "topaz"], 0, sol("Mohs: calcite 3, orthoclase 6, quartz 7, topaz 8.", "Quartz.", "Quartz"), "B");
  b.msq("Optical Mineralogy", "hard", 2, "Which minerals are isotropic under crossed polars (remain dark on rotation)?", ["Garnet", "Quartz", "Spinel", "Halite"], [0, 2, 3], sol("Isotropic = cubic minerals (garnet, spinel, halite). Quartz is uniaxial (anisotropic).", "Garnet, spinel, halite.", "Isotropic minerals"), "D");
  b.nat("d-spacing", "hard", 2, "Halite is cubic with $a=5.64\\,$Å. The $d_{200}$ spacing is _____ Å.", 5.64 / 2, 0.01, sol("$d=a/\\sqrt{h^2+k^2+l^2}$.", "$$5.64/\\sqrt{4}=2.82.$$", "$2.82\\,$Å"), "C");
  return { slug: "gg-mineralogy-crystallography", name: "Mineralogy & Crystallography", questions: b.out };
}

function buildIgneous(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-ign", "Igneous Petrology");
  b.mcq("Bowen's Series", "easy", 1, "In Bowen's discontinuous reaction series, the first ferromagnesian mineral to crystallise is", ["olivine", "biotite", "amphibole", "muscovite"], 0, sol("Discontinuous: olivine → pyroxene → amphibole → biotite.", "Olivine.", "Olivine"), "B");
  b.mcq("Classification", "medium", 1, "The volcanic (fine-grained) equivalent of granite is", ["rhyolite", "basalt", "andesite", "gabbro"], 0, sol("Granite (plutonic felsic) ↔ rhyolite (volcanic felsic).", "Rhyolite.", "Rhyolite"), "B");
  b.mcq("Texture", "medium", 1, "A porphyritic texture with large phenocrysts in a fine groundmass indicates", ["two-stage cooling", "very slow uniform cooling", "rapid quenching only", "metasomatism"], 0, sol("Phenocrysts grow slowly at depth, then the magma erupts and the groundmass quenches.", "Two-stage cooling.", "Two-stage cooling"), "B");
  b.msq("Magma Series", "hard", 2, "Which processes can drive magmatic differentiation?", ["Fractional crystallisation", "Crustal assimilation", "Magma mixing", "Radioactive decay of K"], [0, 1, 2], sol("Fractional crystallisation, assimilation (AFC) and magma mixing differentiate magmas; K decay is a heat/dating effect, not differentiation.", "Options 1, 2, 3.", "Differentiation processes"), "D");
  b.mcq("Ultramafic", "easy", 1, "A rock with less than 45% SiO₂ dominated by olivine and pyroxene is", ["peridotite (ultramafic)", "granite (felsic)", "andesite (intermediate)", "rhyolite (felsic)"], 0, sol("Ultramafic (<45% SiO₂): peridotite, dunite.", "Peridotite.", "Peridotite"), "B");
  return { slug: "gg-igneous-petrology", name: "Igneous Petrology", questions: b.out };
}

function buildSedimentary(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-sed", "Sedimentology & Sedimentary Petrology");
  b.mcq("Grain Size", "easy", 1, "On the Udden–Wentworth scale, particles between 1/16 mm and 2 mm are classified as", ["sand", "silt", "clay", "gravel"], 0, sol("Sand: 1/16–2 mm; silt 1/256–1/16; clay <1/256; gravel >2.", "Sand.", "Sand"), "B");
  b.mcq("Maturity", "medium", 1, "A well-sorted, well-rounded quartz arenite is texturally and compositionally", ["mature", "immature", "metamorphosed", "volcaniclastic"], 0, sol("High sorting/rounding and quartz dominance = mature.", "Mature.", "Mature"), "B");
  b.mcq("Classification", "medium", 1, "In Dunham's classification, a mud-supported limestone with >10% grains is a", ["wackestone", "grainstone", "boundstone", "mudstone"], 0, sol("Dunham: mudstone (<10% grains), wackestone (>10%, mud-supported), packstone, grainstone (grain-supported).", "Wackestone.", "Wackestone"), "B");
  b.msq("Structures", "hard", 2, "Which primary sedimentary structures indicate current (traction) transport?", ["Cross-bedding", "Ripple marks", "Graded bedding", "Parallel lamination by traction"], [0, 1, 3], sol("Cross-beds, ripples and traction lamination are current structures; graded bedding records waning suspension (turbidity) flow.", "Options 1, 2, 4.", "Current structures"), "D");
  b.mcq("Diagenesis", "medium", 1, "The progressive loss of porosity in a sandstone with burial is mainly due to", ["compaction and cementation", "weathering", "metamorphism only", "bioturbation"], 0, sol("Mechanical compaction and cementation reduce porosity during diagenesis.", "Compaction & cementation.", "Compaction and cementation"), "B");
  return { slug: "gg-sedimentary-petrology", name: "Sedimentology & Sedimentary Petrology", questions: b.out };
}

function buildMetamorphic(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-met", "Metamorphic Petrology");
  b.mcq("Facies", "medium", 1, "The metamorphic facies characterised by high pressure and low temperature is", ["blueschist", "granulite", "amphibolite", "hornfels"], 0, sol("Blueschist = high-P/low-T (subduction); granulite = high-T; hornfels = contact.", "Blueschist.", "Blueschist"), "B");
  b.mcq("Barrovian", "medium", 1, "In Barrovian metamorphism, the index mineral marking the highest grade among these is", ["sillimanite", "chlorite", "biotite", "garnet"], 0, sol("Barrovian zones: chlorite → biotite → garnet → staurolite → kyanite → sillimanite.", "Sillimanite.", "Sillimanite"), "B");
  b.mcq("Texture", "easy", 1, "A metamorphic rock with strong planar alignment of platy minerals shows", ["foliation", "vesicularity", "graded bedding", "amygdules"], 0, sol("Foliation = preferred orientation of platy minerals (e.g. mica).", "Foliation.", "Foliation"), "B");
  b.msq("Protolith", "hard", 2, "Which protolith → metamorphic rock pairs are correct?", ["Shale → slate", "Limestone → marble", "Sandstone → quartzite", "Granite → basalt"], [0, 1, 2], sol("Shale→slate, limestone→marble, sandstone→quartzite are correct; granite→basalt is not metamorphic.", "Options 1, 2, 3.", "Protolith pairs"), "D");
  b.mcq("Contact", "medium", 1, "A non-foliated, fine-grained rock formed by contact metamorphism of pelite is", ["hornfels", "schist", "gneiss", "phyllite"], 0, sol("Contact (thermal) metamorphism of mudrock yields hornfels (non-foliated).", "Hornfels.", "Hornfels"), "B");
  return { slug: "gg-metamorphic-petrology", name: "Metamorphic Petrology", questions: b.out };
}

function buildStratigraphy(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-stg", "Stratigraphy & Indian Geology");
  b.mcq("Principles", "easy", 1, "The principle that, in undeformed strata, older beds lie below younger beds is the law of", ["superposition", "cross-cutting relationships", "faunal succession", "lateral continuity"], 0, sol("Steno's law of superposition.", "Superposition.", "Superposition"), "B");
  b.mcq("Indian Geology", "medium", 1, "The Deccan Trap basalts of peninsular India were erupted close to the", ["Cretaceous–Paleogene boundary (~66 Ma)", "Archean–Proterozoic boundary", "Permian–Triassic boundary", "Holocene"], 0, sol("Deccan Traps erupted ~66–65 Ma, near the K–Pg boundary.", "K–Pg (~66 Ma).", "K–Pg boundary"), "B");
  b.mcq("Indian Stratigraphy", "medium", 1, "The Gondwana Supergroup of India is economically important chiefly for its", ["coal deposits", "diamond deposits", "bauxite", "rock salt"], 0, sol("Permo-Carboniferous to Jurassic Gondwana sequences host India's major coalfields.", "Coal.", "Coal deposits"), "B");
  b.msq("Time Scale", "hard", 2, "Which periods belong to the Mesozoic Era?", ["Triassic", "Jurassic", "Cretaceous", "Permian"], [0, 1, 2], sol("Mesozoic = Triassic + Jurassic + Cretaceous; Permian is Paleozoic.", "Options 1, 2, 3.", "Mesozoic periods"), "D");
  b.mcq("Precambrian", "medium", 1, "The oldest cratonic nucleus exposed in southern India, type area of an Archean greenstone belt, is the", ["Dharwar Craton", "Vindhyan Basin", "Siwalik Group", "Cuddapah Basin"], 0, sol("The Dharwar Craton hosts classic Archean schist (greenstone) belts.", "Dharwar Craton.", "Dharwar Craton"), "B");
  return { slug: "gg-stratigraphy-indian-geology", name: "Stratigraphy & Indian Geology", questions: b.out };
}

function buildPaleontology(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-pal", "Palaeontology");
  b.mcq("Index Fossils", "easy", 1, "An ideal index (guide) fossil should have", ["wide geographic range and short time range", "narrow range and long duration", "limited distribution and long life", "no hard parts"], 0, sol("Good index fossils are widespread but short-lived (fine biostratigraphic resolution).", "Wide area, short time.", "Wide range, short duration"), "B");
  b.mcq("Trilobites", "medium", 1, "Trilobites are an extinct class of arthropods that were most abundant in the", ["Paleozoic", "Mesozoic", "Cenozoic", "Quaternary"], 0, sol("Trilobites flourished in the Paleozoic and died out at the end-Permian.", "Paleozoic.", "Paleozoic"), "B");
  b.mcq("Ammonoids", "medium", 1, "Ammonoids (ammonites) are key Mesozoic index fossils belonging to the phylum", ["Mollusca", "Brachiopoda", "Echinodermata", "Arthropoda"], 0, sol("Ammonoids are cephalopod molluscs.", "Mollusca.", "Mollusca"), "B");
  b.msq("Mass Extinctions", "hard", 2, "Which statements about the end-Cretaceous (K–Pg) extinction are correct?", ["Non-avian dinosaurs went extinct", "It is associated with an iridium anomaly", "It occurred at ~66 Ma", "It eliminated trilobites"], [0, 1, 2], sol("K–Pg (~66 Ma) killed non-avian dinosaurs and has an Ir anomaly; trilobites died at the end-Permian (~252 Ma).", "Options 1, 2, 3.", "K–Pg facts"), "D");
  b.mcq("Microfossils", "medium", 1, "Foraminifera are widely used in petroleum biostratigraphy because they are", ["abundant calcareous microfossils with rapid evolution", "large vertebrates", "plant spores only", "trace fossils"], 0, sol("Forams are abundant, environmentally sensitive, fast-evolving microfossils.", "Calcareous microfossils.", "Calcareous microfossils"), "B");
  return { slug: "gg-paleontology", name: "Palaeontology", questions: b.out };
}

function buildEconomic(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-eco", "Economic & Ore Geology");
  b.mcq("Ore Minerals", "easy", 1, "The principal ore mineral of lead is", ["galena", "chalcopyrite", "sphalerite", "cassiterite"], 0, sol("Galena (PbS) is the chief lead ore; chalcopyrite=Cu, sphalerite=Zn, cassiterite=Sn.", "Galena.", "Galena"), "B");
  b.mcq("Deposit Types", "medium", 1, "Chromite and platinum-group deposits typically form by", ["magmatic segregation in layered intrusions", "weathering of granite", "evaporation of seawater", "low-temperature hydrothermal veins"], 0, sol("Chromite/PGE concentrate by magmatic (cumulate) segregation in mafic–ultramafic layered intrusions.", "Magmatic segregation.", "Magmatic segregation"), "B");
  b.mcq("Bauxite", "medium", 1, "Bauxite, the ore of aluminium, forms primarily by", ["intense lateritic weathering in the tropics", "magmatic crystallisation", "contact metamorphism", "placer concentration"], 0, sol("Bauxite is a residual lateritic weathering product (tropical/humid).", "Lateritic weathering.", "Lateritic weathering"), "B");
  b.msq("Hydrothermal", "hard", 2, "Which deposit types are typically epigenetic/hydrothermal?", ["Porphyry copper", "Mississippi Valley-type Pb–Zn", "Banded iron formation", "Vein gold"], [0, 1, 3], sol("Porphyry Cu, MVT Pb–Zn and vein gold are hydrothermal; BIF is a chemical sedimentary (syngenetic) deposit.", "Options 1, 2, 4.", "Hydrothermal deposits"), "D");
  b.mcq("Indian Deposits", "medium", 1, "The Kolar belt of Karnataka is famous historically for", ["gold mining", "coal mining", "diamond mining", "petroleum"], 0, sol("Kolar Gold Fields — Archean greenstone-hosted lode gold.", "Gold.", "Gold mining"), "B");
  return { slug: "gg-economic-ore-geology", name: "Economic & Ore Geology", questions: b.out };
}

function buildGeochem(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-gch", "Geochemistry & Isotope Geology");
  b.mcq("Goldschmidt", "easy", 1, "In Goldschmidt's classification, elements that concentrate in metallic iron (e.g. Ni, Co, Au) are", ["siderophile", "lithophile", "chalcophile", "atmophile"], 0, sol("Siderophile = iron-loving; lithophile = silicate; chalcophile = sulphide; atmophile = gas.", "Siderophile.", "Siderophile"), "B");
  b.mcq("Dating", "medium", 1, "The isotopic system best suited for dating very young (<50 ka) organic material is", ["$^{14}$C", "$^{238}$U–$^{206}$Pb", "$^{87}$Rb–$^{87}$Sr", "$^{40}$K–$^{40}$Ar"], 0, sol("Radiocarbon (5730 yr half-life) suits late-Quaternary organic carbon.", "Radiocarbon.", "$^{14}$C"), "B");
  b.nat("Half-life Decay", "hard", 2, "A mineral system has a half-life of $1250\\,$Myr. After $2500\\,$Myr, the fraction of parent remaining is _____.", 0.25, 0.005, sol("$N/N_0=(1/2)^{t/T}$; $t/T=2$.", "$$(1/2)^2=0.25.$$", "$0.25$"), "C");
  b.msq("REE", "hard", 2, "Which statements about rare-earth elements (REE) are correct?", ["A negative Eu anomaly suggests plagioclase fractionation", "REE are normalised to chondrite for spider diagrams", "LREE are more incompatible than HREE in most mantle minerals", "All REE are radioactive"], [0, 1, 2], sol("Eu anomalies track plagioclase; chondrite normalisation removes the odd–even effect; LREE are more incompatible; most REE are not radioactive.", "Options 1, 2, 3.", "REE behaviour"), "D");
  b.mcq("Mantle", "medium", 1, "A low initial $^{87}$Sr/$^{86}$Sr ratio (~0.703) in a basalt indicates", ["a depleted mantle source", "strong crustal contamination", "an evaporite source", "a meteorite origin"], 0, sol("Low initial Sr ratios reflect a depleted (low Rb/Sr) mantle source.", "Mantle source.", "Depleted mantle"), "B");
  return { slug: "gg-geochemistry-isotope", name: "Geochemistry & Isotope Geology", questions: b.out };
}

function buildEngGeol(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-eng", "Engineering & Environmental Geology");
  b.mcq("Rock Mass", "medium", 1, "Rock Quality Designation (RQD) is computed from drill core as the percentage of", ["intact pieces ≥10 cm summed over the run length", "core recovered over total drilled", "fracture spacing over depth", "voids over total volume"], 0, sol("RQD = Σ(intact pieces ≥10 cm) / total core run × 100.", "Pieces ≥10 cm.", "Σ pieces ≥10 cm"), "B");
  b.nat("Mohr–Coulomb", "hard", 2, "A rock joint has the Mohr-Coulomb failure envelope shown (read its cohesion $c$ and friction angle $\\phi$ off the diagram). Under a normal stress of $100\\,$kPa, its shear strength is _____ kPa.", 30 + 100 * Math.tan(30 * deg), 0.5, sol("$\\tau=c+\\sigma_n\\tan\\phi$.", "$$30+100\\tan30^\\circ=87.74.$$", "$87.74\\,$kPa"), "C", mohrFig(160, 40, "c=30 kPa, φ=30°", 30, 30));
  b.mcq("Slope Stability", "medium", 1, "A planar rock slope is most prone to sliding when the discontinuity", ["daylights and dips less steeply than the slope face", "dips into the slope", "is horizontal", "is vertical and parallel to the slope"], 0, sol("Plane failure needs a discontinuity that daylights and is flatter than the face but steeper than friction.", "Daylighting, flatter than face.", "Daylights, flatter than slope"), "B", stereonetFig(90, 35, "Joint 090°/35°", "Discontinuity vs slope face"));
  b.msq("Geohazards", "hard", 2, "Which are recognised triggers of landslides?", ["Heavy rainfall raising pore pressure", "Earthquake shaking", "Toe excavation", "Decrease in slope height"], [0, 1, 2], sol("Rainfall, seismicity and toe undercutting trigger slides; reducing slope height improves stability.", "Options 1, 2, 3.", "Landslide triggers"), "D");
  b.mcq("Hydrogeology", "medium", 1, "An aquifer that is fully saturated and confined between two aquitards is best described as", ["confined (artesian)", "unconfined", "perched", "a vadose zone"], 0, sol("Confined aquifers are bounded by aquitards and are under pressure (artesian).", "Confined.", "Confined aquifer"), "B");
  return { slug: "gg-engineering-environmental-geology", name: "Engineering & Environmental Geology", questions: b.out };
}

function buildGeophysics(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-gph", "Geophysics");
  b.mcq("Seismic Waves", "easy", 1, "Which seismic body wave is the fastest and arrives first at a station?", ["P-wave", "S-wave", "Rayleigh wave", "Love wave"], 0, sol("P (compressional) waves travel fastest; S and surface waves are slower.", "P-wave.", "P-wave"), "B");
  b.mcq("Gravity", "medium", 1, "A positive Bouguer gravity anomaly over a sedimentary basin would most likely indicate", ["a dense mafic/basement body at depth", "thicker low-density sediments", "a salt dome", "an air-filled cavity"], 0, sol("Positive Bouguer anomalies reflect excess mass (dense bodies).", "Dense body.", "Dense body at depth"), "B");
  b.nat("Free-air", "medium", 2, "A gravity station sits $500\\,$m above the geoid. The free-air correction is _____ mGal.", 0.3086 * 500, 0.1, sol("Free-air correction $=0.3086\\,h$.", "$$0.3086\\times500=154.3.$$", "$154.3\\,$mGal"), "C");
  b.mcq("Magnetics", "medium", 1, "The magnetic susceptibility of a rock is controlled mainly by its content of", ["magnetite", "quartz", "calcite", "feldspar"], 0, sol("Ferrimagnetic magnetite dominates rock magnetic susceptibility.", "Magnetite.", "Magnetite"), "B");
  b.msq("Methods", "hard", 2, "Which geophysical methods are primarily used to map subsurface electrical properties?", ["Electrical resistivity tomography", "Induced polarisation", "Gravity", "Magnetotellurics"], [0, 1, 3], sol("ERT, IP and MT image electrical/conductive structure; gravity maps density.", "Options 1, 2, 4.", "Electrical methods"), "D");
  return { slug: "gg-geophysics", name: "Geophysics", questions: b.out };
}

function buildRemote(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("gg-rs", "Applied Geology · Remote Sensing & GIS");
  b.mcq("EM Spectrum", "easy", 1, "Healthy green vegetation reflects most strongly in the", ["near-infrared", "blue", "thermal infrared", "ultraviolet"], 0, sol("Chlorophyll/cell structure gives high NIR reflectance — the basis of NDVI.", "Near-infrared.", "Near-infrared"), "B");
  b.mcq("Resolution", "medium", 1, "The ability of a sensor to distinguish two adjacent objects on the ground is its", ["spatial resolution", "spectral resolution", "radiometric resolution", "temporal resolution"], 0, sol("Spatial resolution = smallest resolvable ground detail.", "Spatial resolution.", "Spatial resolution"), "B");
  b.mcq("GIS", "medium", 1, "In a GIS, a continuously varying surface such as elevation is best stored as a", ["raster (grid)", "single point", "topology table only", "attribute join"], 0, sol("Continuous fields (DEMs) are efficiently stored as rasters.", "Raster.", "Raster"), "B");
  b.msq("Indices", "hard", 2, "Which statements about NDVI are correct?", ["NDVI = (NIR − Red)/(NIR + Red)", "Values range from −1 to +1", "Dense vegetation gives high positive NDVI", "Water gives high positive NDVI"], [0, 1, 2], sol("NDVI uses NIR and Red, ranges −1 to +1, is high for vegetation and low/negative for water.", "Options 1, 2, 3.", "NDVI facts"), "D");
  b.mcq("Lineaments", "medium", 1, "Linear features on satellite imagery that often reflect faults or fractures are called", ["lineaments", "training sites", "ground control points", "pixels"], 0, sol("Lineaments are mappable linear features expressing structural control.", "Lineaments.", "Lineaments"), "B");
  return { slug: "gg-applied-remote-sensing-gis", name: "Applied Geology · Remote Sensing & GIS", questions: b.out };
}

/* ════════════════════════════════════════════════════════════════════ */
/*  Padding + emit                                                        */
/* ════════════════════════════════════════════════════════════════════ */

function padBank(bank: { slug: string; name: string; questions: Q[] }, rand: () => number, target: number) {
  const gens = [...(BULK[bank.slug] ?? []), ...(BULK_HARD[bank.slug] ?? [])];
  if (gens.length === 0) return;
  const seen = new Set(bank.questions.map((q) => q.stem));
  let guard = 0;
  let n = bank.questions.length;
  const prefix = (bank.questions[0]?.id ?? `${bank.slug}-x`).replace(/-\d+$/, "");
  while (bank.questions.length < target && guard < target * 60) {
    guard++;
    const g = gens[Math.floor(rand() * gens.length)](rand);
    if (seen.has(g.stem)) continue;
    seen.add(g.stem);
    n++;
    const { figure, ...rest } = g;
    bank.questions.push({ id: `${prefix}-${String(n).padStart(3, "0")}`, subject: bank.name, ...rest, ...(figure ? { figure } : {}) } as Q);
  }
}

const seed = hashSeed("crackgate-gg-practice-v1");
const rand = rng(seed);

const banks = [
  buildMath(),
  buildEarth(),
  buildStructural(),
  buildMineralogy(),
  buildIgneous(),
  buildSedimentary(),
  buildMetamorphic(),
  buildStratigraphy(),
  buildPaleontology(),
  buildEconomic(),
  buildGeochem(),
  buildEngGeol(),
  buildGeophysics(),
  buildRemote(),
];

const TARGETS: Record<string, number> = {
  "gg-geology-mathematics": 78,
  "gg-earth-system-geomorphology": 78,
  "gg-structural-geology": 95,
  "gg-mineralogy-crystallography": 80,
  "gg-igneous-petrology": 75,
  "gg-sedimentary-petrology": 78,
  "gg-metamorphic-petrology": 72,
  "gg-stratigraphy-indian-geology": 75,
  "gg-paleontology": 70,
  "gg-economic-ore-geology": 75,
  "gg-geochemistry-isotope": 78,
  "gg-engineering-environmental-geology": 85,
  "gg-geophysics": 90,
  "gg-applied-remote-sensing-gis": 72,
};
for (const bank of banks) padBank(bank, rand, TARGETS[bank.slug] ?? 60);

const outDir = resolve(process.cwd(), "apps/web/src/data/questions/practice");
let total = 0, figs = 0;
for (const bank of banks) {
  const file = resolve(outDir, `${bank.slug}.json`);
  writeFileSync(file, JSON.stringify({ slug: bank.slug, name: bank.name, questions: bank.questions }, null, 2) + "\n", "utf8");
  total += bank.questions.length;
  figs += bank.questions.filter((q) => "figure" in q && q.figure).length;
  console.log(`✅ ${bank.slug}.json  ${bank.questions.length} Q`);
}
console.log(`\nDone. ${banks.length} banks · ${total} questions · ${figs} with figures.`);
