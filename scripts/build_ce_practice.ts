/**
 * CrackGate — GATE Civil (CE) practice-bank generator.
 *
 * Emits one JSON file per subject under
 *   apps/web/src/data/questions/practice/ce-<slug>.json
 * in the exact PracticeSubject / PracticeQuestion shape consumed by the app
 * (see apps/web/src/data/practice.ts).
 *
 * Every numerical answer is COMPUTED in code (not transcribed) so the keys are
 * guaranteed self-consistent. Questions are deterministic (seeded RNG) so the
 * bank is reproducible.
 *
 * Usage:
 *   npx tsx scripts/build_ce_practice.ts
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

// ───────────────────────── question helpers ─────────────────────────
type Diff = "easy" | "medium" | "hard";
type Arch = "A" | "B" | "C" | "D";

interface NatQ {
  id: string; subject: string; topic: string; difficulty: Diff; type: "NAT";
  stem: string; answer: number; tolerance: number; solution: string; archetype: Arch; marks: 1 | 2;
}
interface McqQ {
  id: string; subject: string; topic: string; difficulty: Diff; type: "MCQ";
  stem: string; options: string[]; answer: number; solution: string; archetype: Arch; marks: 1 | 2;
}
interface MsqQ {
  id: string; subject: string; topic: string; difficulty: Diff; type: "MSQ";
  stem: string; options: string[]; answer: number[]; solution: string; archetype: Arch; marks: 1 | 2;
}
type Q = NatQ | McqQ | MsqQ;

/** round to n decimals */
const r = (x: number, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

class Builder {
  private n = 0;
  readonly out: Q[] = [];
  constructor(private prefix: string, private subject: string) {}
  private id() { this.n += 1; return `${this.prefix}-${String(this.n).padStart(3, "0")}`; }

  nat(topic: string, difficulty: Diff, marks: 1 | 2, stem: string, answer: number, tolerance: number, solution: string, archetype: Arch = "A") {
    this.out.push({ id: this.id(), subject: this.subject, topic, difficulty, type: "NAT", stem, answer: r(answer, 4), tolerance, solution, archetype, marks });
  }
  mcq(topic: string, difficulty: Diff, marks: 1 | 2, stem: string, options: string[], answer: number, solution: string, archetype: Arch = "B") {
    this.out.push({ id: this.id(), subject: this.subject, topic, difficulty, type: "MCQ", stem, options, answer, solution, archetype, marks });
  }
  msq(topic: string, difficulty: Diff, marks: 1 | 2, stem: string, options: string[], answer: number[], solution: string, archetype: Arch = "B") {
    this.out.push({ id: this.id(), subject: this.subject, topic, difficulty, type: "MSQ", stem, options, answer, solution, archetype, marks });
  }
}

/** Build a 5-part-ish solution string with concept + working + answer. */
function sol(concept: string, working: string, answer: string) {
  return `**Concept.** ${concept}\n\n**Working.**\n${working}\n\n**Answer.** ${answer}`;
}

// pick from list using rng
function pick<T>(arr: T[], rand: () => number): T { return arr[Math.floor(rand() * arr.length)]; }
function ri(rand: () => number, lo: number, hi: number): number { return lo + Math.floor(rand() * (hi - lo + 1)); }
function rp<T>(arr: T[], rand: () => number): T { return arr[Math.floor(rand() * arr.length)]; }

/** A scalable parametric NAT generator: returns the fields minus id/subject. */
type GenOut = { topic: string; difficulty: Diff; marks: 1 | 2; type: "NAT"; stem: string; answer: number; tolerance: number; solution: string; archetype: Arch };

/**
 * Per-bank bulk generators. Each returns one randomised-but-correct NAT.
 * Answers are computed in code, so the keys are always self-consistent.
 */
const BULK: Record<string, ((rand: () => number) => GenOut)[]> = {
  "ce-engineering-mathematics": [
    (rand) => { const a = ri(rand, 2, 9), bb = ri(rand, 1, 9), c = ri(rand, 1, 6), d = ri(rand, 2, 9); const det = a * d - bb * c; return { topic: "Linear Algebra — Determinant", difficulty: "easy", marks: 1, type: "NAT", stem: `The determinant of $\\begin{bmatrix}${a} & ${bb}\\\\ ${c} & ${d}\\end{bmatrix}$ is _____.`, answer: det, tolerance: 0.001, solution: sol("$\\det=ad-bc$.", `$$\\det=(${a})(${d})-(${bb})(${c})=${det}.$$`, `$${det}$`), archetype: "A" }; },
    (rand) => { const a = ri(rand, 2, 6), x0 = ri(rand, 1, 5); const s = 2 * a * x0; return { topic: "Calculus — Differentiation", difficulty: "easy", marks: 1, type: "NAT", stem: `The slope of $y=${a}x^2$ at $x=${x0}$ is _____.`, answer: s, tolerance: 0.001, solution: sol("$dy/dx=2ax$.", `$$2(${a})(${x0})=${s}.$$`, `$${s}$`), archetype: "A" }; },
    (rand) => { const n = ri(rand, 2, 4), up = ri(rand, 2, 5); const v = up ** (n + 1) / (n + 1); return { topic: "Calculus — Integration", difficulty: "medium", marks: 2, type: "NAT", stem: `Evaluate $\\displaystyle\\int_0^{${up}} x^{${n}}\\,dx$.`, answer: v, tolerance: 0.01, solution: sol("$\\int_0^a x^n dx=\\dfrac{a^{n+1}}{n+1}$.", `$$\\dfrac{${up}^{${n + 1}}}{${n + 1}}=${r(v, 3)}.$$`, `$${r(v, 3)}$`), archetype: "A" }; },
    (rand) => { const a = ri(rand, 3, 9), d = ri(rand, 2, 9); const tr = a + d; return { topic: "Linear Algebra — Eigenvalues", difficulty: "easy", marks: 1, type: "NAT", stem: `The sum of eigenvalues of a $2\\times2$ matrix with diagonal $${a}$ and $${d}$ is _____.`, answer: tr, tolerance: 0.001, solution: sol("Σλ = trace.", `$$${a}+${d}=${tr}.$$`, `$${tr}$`), archetype: "A" }; },
  ],
  "ce-engineering-mechanics": [
    (rand) => { const t = rp([[3, 4], [6, 8], [5, 12], [8, 15], [9, 12], [7, 24]], rand); const R = Math.hypot(t[0], t[1]); return { topic: "Resultant of Forces", difficulty: "easy", marks: 1, type: "NAT", stem: `Two forces $${t[0]}\\,\\text{kN}$ and $${t[1]}\\,\\text{kN}$ act at right angles. Their resultant is _____ kN.`, answer: R, tolerance: 0.01, solution: sol("$R=\\sqrt{F_1^2+F_2^2}$.", `$$\\sqrt{${t[0]}^2+${t[1]}^2}=${r(R, 2)}.$$`, `$${r(R, 2)}\\,\\text{kN}$`), archetype: "A" }; },
    (rand) => { const f = ri(rand, 10, 40), d = ri(rand, 2, 6); const m = f * d; return { topic: "Moment of a Force", difficulty: "easy", marks: 1, type: "NAT", stem: `A force $${f}\\,\\text{kN}$ acts $${d}\\,\\text{m}$ perpendicular from a pivot. The moment is _____ kN·m.`, answer: m, tolerance: 0.01, solution: sol("$M=Fd$.", `$$${f}\\times${d}=${m}.$$`, `$${m}\\,\\text{kN·m}$`), archetype: "A" }; },
    (rand) => { const w = ri(rand, 10, 30) * 2, L = ri(rand, 4, 8); const mx = w * L / 4; return { topic: "Bending Moment", difficulty: "medium", marks: 2, type: "NAT", stem: `A simply supported beam, span $${L}\\,\\text{m}$, central point load $${w}\\,\\text{kN}$. Max BM is _____ kN·m.`, answer: mx, tolerance: 0.01, solution: sol("$M_{max}=WL/4$.", `$$\\dfrac{${w}\\times${L}}{4}=${mx}.$$`, `$${mx}\\,\\text{kN·m}$`), archetype: "A" }; },
    (rand) => { const w = ri(rand, 8, 24), L = ri(rand, 4, 8); const mx = w * L * L / 8; return { topic: "Bending Moment — UDL", difficulty: "medium", marks: 2, type: "NAT", stem: `A simply supported beam, span $${L}\\,\\text{m}$, UDL $${w}\\,\\text{kN/m}$. Max BM is _____ kN·m.`, answer: mx, tolerance: 0.01, solution: sol("$M_{max}=wL^2/8$.", `$$\\dfrac{${w}\\times${L}^2}{8}=${r(mx, 2)}.$$`, `$${r(mx, 2)}\\,\\text{kN·m}$`), archetype: "A" }; },
  ],
  "ce-solid-mechanics": [
    (rand) => { const P = ri(rand, 50, 250), A = rp([400, 500, 600, 800, 1000], rand); const s = P * 1000 / A; return { topic: "Axial Stress", difficulty: "easy", marks: 1, type: "NAT", stem: `A bar of area $${A}\\,\\text{mm}^2$ carries $${P}\\,\\text{kN}$ axial. Normal stress is _____ MPa.`, answer: s, tolerance: 0.05, solution: sol("$\\sigma=P/A$.", `$$\\dfrac{${P}\\times10^3}{${A}}=${r(s, 2)}.$$`, `$${r(s, 2)}\\,\\text{MPa}$`), archetype: "A" }; },
    (rand) => { const fy = rp([250, 415, 500], rand), fos = rp([1.5, 2, 2.5, 3], rand); const sw = fy / fos; return { topic: "Factor of Safety", difficulty: "easy", marks: 1, type: "NAT", stem: `Yield stress $${fy}\\,\\text{MPa}$, FoS $${fos}$. The permissible working stress is _____ MPa.`, answer: sw, tolerance: 0.1, solution: sol("$\\sigma_w=f_y/\\text{FoS}$.", `$$\\dfrac{${fy}}{${fos}}=${r(sw, 2)}.$$`, `$${r(sw, 2)}\\,\\text{MPa}$`), archetype: "A" }; },
    (rand) => { const P = ri(rand, 40, 120), A = rp([400, 500, 600], rand), L = rp([1000, 1500, 2000], rand), E = 200000; const dl = P * 1000 * L / (A * E); return { topic: "Axial Deformation", difficulty: "medium", marks: 2, type: "NAT", stem: `Steel bar ($E=200\\,\\text{GPa}$), area $${A}\\,\\text{mm}^2$, length $${L}\\,\\text{mm}$, load $${P}\\,\\text{kN}$. Elongation is _____ mm.`, answer: dl, tolerance: 0.005, solution: sol("$\\delta=PL/AE$.", `$$\\dfrac{${P}\\times10^3\\times${L}}{${A}\\times${E}}=${r(dl, 3)}.$$`, `$${r(dl, 3)}\\,\\text{mm}$`), archetype: "A" }; },
  ],
  "ce-structural-analysis": [
    (rand) => { const W = ri(rand, 10, 30) * 2, L = ri(rand, 4, 8); const m = W * L / 8; return { topic: "Fixed Beam", difficulty: "medium", marks: 2, type: "NAT", stem: `Fixed beam, span $${L}\\,\\text{m}$, central point load $${W}\\,\\text{kN}$. Fixed-end moment is _____ kN·m.`, answer: m, tolerance: 0.01, solution: sol("FEM $=WL/8$.", `$$\\dfrac{${W}\\times${L}}{8}=${r(m, 2)}.$$`, `$${r(m, 2)}\\,\\text{kN·m}$`), archetype: "A" }; },
    (rand) => { const w = ri(rand, 8, 24), L = ri(rand, 4, 8); const m = w * L * L / 12; return { topic: "Fixed Beam — UDL", difficulty: "medium", marks: 2, type: "NAT", stem: `Fixed beam, span $${L}\\,\\text{m}$, UDL $${w}\\,\\text{kN/m}$. Support moment is _____ kN·m.`, answer: m, tolerance: 0.01, solution: sol("FEM $=wL^2/12$.", `$$\\dfrac{${w}\\times${L}^2}{12}=${r(m, 2)}.$$`, `$${r(m, 2)}\\,\\text{kN·m}$`), archetype: "A" }; },
    (rand) => { const EI = rp([6000, 8000, 12000], rand), L = ri(rand, 3, 6); const k = 4 * EI / L; return { topic: "Stiffness", difficulty: "medium", marks: 1, type: "NAT", stem: `Rotational stiffness $4EI/L$ for $EI=${EI}\\,\\text{kN·m}^2$, $L=${L}\\,\\text{m}$ is _____ kN·m/rad.`, answer: k, tolerance: 0.5, solution: sol("$k=4EI/L$.", `$$\\dfrac{4\\times${EI}}{${L}}=${r(k, 1)}.$$`, `$${r(k, 1)}$`), archetype: "A" }; },
  ],
  "ce-construction-materials-management": [
    (rand) => { const o = ri(rand, 2, 5), m = ri(rand, 6, 9), p = ri(rand, 12, 18); const te = (o + 4 * m + p) / 6; return { topic: "PERT", difficulty: "medium", marks: 2, type: "NAT", stem: `Activity: optimistic $${o}$, most-likely $${m}$, pessimistic $${p}$ days. PERT expected time is _____ days.`, answer: te, tolerance: 0.05, solution: sol("$t_e=(t_o+4t_m+t_p)/6$.", `$$\\dfrac{${o}+4(${m})+${p}}{6}=${r(te, 2)}.$$`, `$${r(te, 2)}$`), archetype: "A" }; },
    (rand) => { const o = ri(rand, 2, 5), p = ri(rand, 12, 20); const v = ((p - o) / 6) ** 2; return { topic: "PERT — Variance", difficulty: "medium", marks: 1, type: "NAT", stem: `Activity: optimistic $${o}$, pessimistic $${p}$ days. Variance is _____ days².`, answer: v, tolerance: 0.05, solution: sol("$\\sigma^2=((t_p-t_o)/6)^2$.", `$$((${p}-${o})/6)^2=${r(v, 2)}.$$`, `$${r(v, 2)}$`), archetype: "A" }; },
    (rand) => { const D = rp([1000, 1500, 2000, 2500], rand), Co = rp([40, 50, 60], rand), Ch = rp([4, 5, 8], rand); const eoq = Math.sqrt(2 * D * Co / Ch); return { topic: "Inventory — EOQ", difficulty: "hard", marks: 2, type: "NAT", stem: `Demand $${D}$/yr, ordering cost $₹${Co}$, holding cost $₹${Ch}$/unit/yr. EOQ is _____ units.`, answer: eoq, tolerance: 1, solution: sol("$\\sqrt{2DC_o/C_h}$.", `$$\\sqrt{2(${D})(${Co})/${Ch}}=${r(eoq, 1)}.$$`, `$${r(eoq, 1)}$`), archetype: "C" }; },
  ],
  "ce-concrete-structures": [
    (rand) => { const fy = rp([415, 500], rand), Ast = rp([800, 1000, 1200, 1500], rand); const T = 0.87 * fy * Ast / 1000; return { topic: "Limit State — Steel Force", difficulty: "medium", marks: 2, type: "NAT", stem: `Design tensile force $0.87f_yA_{st}$ for $A_{st}=${Ast}\\,\\text{mm}^2$, Fe${fy} is _____ kN.`, answer: T, tolerance: 0.1, solution: sol("$T=0.87f_yA_{st}$.", `$$0.87\\times${fy}\\times${Ast}/1000=${r(T, 2)}.$$`, `$${r(T, 2)}\\,\\text{kN}$`), archetype: "A" }; },
    (rand) => { const fy = 415, Ast = rp([900, 1000, 1200], rand), fck = rp([20, 25, 30], rand), bw = rp([250, 300], rand); const xu = 0.87 * fy * Ast / (0.36 * fck * bw); return { topic: "Limit State — Stress Block", difficulty: "hard", marks: 2, type: "NAT", stem: `Singly-reinforced beam: $b=${bw}$, $A_{st}=${Ast}\\,\\text{mm}^2$, Fe415, M${fck}. Stress-block depth $x_u$ is _____ mm.`, answer: xu, tolerance: 1, solution: sol("$0.36f_{ck}bx_u=0.87f_yA_{st}$.", `$$\\dfrac{0.87\\times415\\times${Ast}}{0.36\\times${fck}\\times${bw}}=${r(xu, 1)}.$$`, `$${r(xu, 1)}\\,\\text{mm}$`), archetype: "C" }; },
  ],
  "ce-steel-structures": [
    (rand) => { const Ag = rp([1200, 1500, 2000, 2400], rand), fy = 250; const T = Ag * fy / 1.1 / 1000; return { topic: "Tension Member", difficulty: "medium", marks: 2, type: "NAT", stem: `Gross-section yielding strength $A_gf_y/\\gamma_{m0}$ for $A_g=${Ag}\\,\\text{mm}^2$, Fe250, $\\gamma_{m0}=1.1$ is _____ kN.`, answer: T, tolerance: 0.1, solution: sol("$T_{dg}=A_gf_y/\\gamma_{m0}$.", `$$\\dfrac{${Ag}\\times250}{1.1\\times1000}=${r(T, 2)}.$$`, `$${r(T, 2)}\\,\\text{kN}$`), archetype: "A" }; },
    (rand) => { const Le = rp([3000, 3500, 4000, 4500], rand), rmin = rp([25, 30, 35, 40], rand); const lam = Le / rmin; return { topic: "Compression Member", difficulty: "easy", marks: 1, type: "NAT", stem: `Effective length $${Le}\\,\\text{mm}$, $r_{min}=${rmin}\\,\\text{mm}$. Slenderness ratio is _____.`, answer: lam, tolerance: 0.1, solution: sol("$\\lambda=L_e/r_{min}$.", `$$\\dfrac{${Le}}{${rmin}}=${r(lam, 1)}.$$`, `$${r(lam, 1)}$`), archetype: "A" }; },
    (rand) => { const s = rp([5, 6, 8, 10, 12], rand); const t = 0.707 * s; return { topic: "Welded Connections", difficulty: "easy", marks: 1, type: "NAT", stem: `Fillet weld size $${s}\\,\\text{mm}$. Effective throat thickness is _____ mm.`, answer: t, tolerance: 0.01, solution: sol("throat $=0.707s$.", `$$0.707\\times${s}=${r(t, 2)}.$$`, `$${r(t, 2)}\\,\\text{mm}$`), archetype: "A" }; },
  ],
  "ce-soil-mechanics": [
    (rand) => { const nPct = rp([30, 33, 40, 45, 50], rand); const n = nPct / 100; const e = n / (1 - n); return { topic: "Phase Relations — Void Ratio", difficulty: "easy", marks: 1, type: "NAT", stem: `Soil porosity $${nPct}\\%$. Void ratio is _____.`, answer: e, tolerance: 0.005, solution: sol("$e=n/(1-n)$.", `$$\\dfrac{${n}}{1-${n}}=${r(e, 3)}.$$`, `$${r(e, 3)}$`), archetype: "A" }; },
    (rand) => { const gamma = rp([18, 19, 20, 21], rand), w = rp([0.15, 0.20, 0.25], rand); const gd = gamma / (1 + w); return { topic: "Unit Weight", difficulty: "medium", marks: 1, type: "NAT", stem: `Bulk unit weight $${gamma}\\,\\text{kN/m}^3$, water content $${w * 100}\\%$. Dry unit weight is _____ kN/m³.`, answer: gd, tolerance: 0.02, solution: sol("$\\gamma_d=\\gamma/(1+w)$.", `$$\\dfrac{${gamma}}{1+${w}}=${r(gd, 2)}.$$`, `$${r(gd, 2)}$`), archetype: "A" }; },
    (rand) => { const LL = rp([40, 45, 50, 55, 60], rand), PL = rp([18, 20, 22, 25], rand); const PI = LL - PL; return { topic: "Atterberg Limits", difficulty: "easy", marks: 1, type: "NAT", stem: `Liquid limit $${LL}\\%$, plastic limit $${PL}\\%$. Plasticity index is _____ %.`, answer: PI, tolerance: 0.01, solution: sol("$PI=LL-PL$.", `$$${LL}-${PL}=${PI}.$$`, `$${PI}\\%$`), archetype: "A" }; },
    (rand) => { const phi = rp([28, 30, 32, 34, 36], rand); const Ka = (1 - Math.sin(phi * Math.PI / 180)) / (1 + Math.sin(phi * Math.PI / 180)); return { topic: "Earth Pressure", difficulty: "medium", marks: 2, type: "NAT", stem: `Cohesionless backfill $\\phi=${phi}^\\circ$. Rankine active coefficient $K_a$ is _____.`, answer: Ka, tolerance: 0.005, solution: sol("$K_a=(1-\\sin\\phi)/(1+\\sin\\phi)$.", `$$\\dfrac{1-\\sin${phi}}{1+\\sin${phi}}=${r(Ka, 3)}.$$`, `$${r(Ka, 3)}$`), archetype: "A" }; },
  ],
  "ce-foundation-engineering": [
    (rand) => { const q = rp([180, 200, 240, 300], rand), gamma = rp([16, 18, 20], rand), Df = rp([1, 1.5, 2], rand); const net = q - gamma * Df; return { topic: "Bearing Pressure", difficulty: "medium", marks: 1, type: "NAT", stem: `Gross pressure $${q}\\,\\text{kPa}$ at depth $${Df}\\,\\text{m}$, $\\gamma=${gamma}\\,\\text{kN/m}^3$. Net pressure is _____ kPa.`, answer: net, tolerance: 0.1, solution: sol("$q_{net}=q-\\gamma D_f$.", `$$${q}-${gamma}\\times${Df}=${r(net, 1)}.$$`, `$${r(net, 1)}\\,\\text{kPa}$`), archetype: "A" }; },
    (rand) => { const qu = rp([300, 360, 450, 540], rand), fos = 3; const qs = qu / fos; return { topic: "Safe Bearing Capacity", difficulty: "easy", marks: 1, type: "NAT", stem: `Ultimate bearing capacity $${qu}\\,\\text{kPa}$, FoS $3$. Safe bearing capacity is _____ kPa.`, answer: qs, tolerance: 0.1, solution: sol("$q_{safe}=q_u/\\text{FoS}$.", `$$\\dfrac{${qu}}{3}=${r(qs, 1)}.$$`, `$${r(qs, 1)}$`), archetype: "A" }; },
    (rand) => { const c = rp([20, 25, 30, 40], rand), gamma = rp([16, 18, 20], rand), Df = rp([1, 1.5], rand); const qu = c * 5.7 + gamma * Df; return { topic: "Terzaghi Bearing Capacity", difficulty: "hard", marks: 2, type: "NAT", stem: `Strip footing at $${Df}\\,\\text{m}$ on clay: $c=${c}\\,\\text{kPa}$, $\\phi=0$, $\\gamma=${gamma}$. Terzaghi $q_u$ ($N_c=5.7,N_q=1,N_\\gamma=0$) is _____ kPa.`, answer: qu, tolerance: 1, solution: sol("$q_u=cN_c+\\gamma D_f$.", `$$${c}\\times5.7+${gamma}\\times${Df}=${r(qu, 1)}.$$`, `$${r(qu, 1)}$`), archetype: "C" }; },
  ],
  "ce-fluid-mechanics-hydraulics": [
    (rand) => { const A = rp([0.2, 0.3, 0.5, 0.8], rand), v = ri(rand, 2, 5); const Q = A * v; return { topic: "Continuity", difficulty: "easy", marks: 1, type: "NAT", stem: `Pipe area $${A}\\,\\text{m}^2$, velocity $${v}\\,\\text{m/s}$. Discharge is _____ m³/s.`, answer: Q, tolerance: 0.005, solution: sol("$Q=Av$.", `$$${A}\\times${v}=${r(Q, 3)}.$$`, `$${r(Q, 3)}$`), archetype: "A" }; },
    (rand) => { const h = ri(rand, 2, 12); const p = 9.81 * h; return { topic: "Hydrostatics", difficulty: "easy", marks: 1, type: "NAT", stem: `Gauge pressure at depth $${h}\\,\\text{m}$ in water ($\\gamma_w=9.81$) is _____ kPa.`, answer: p, tolerance: 0.1, solution: sol("$p=\\gamma_w h$.", `$$9.81\\times${h}=${r(p, 2)}.$$`, `$${r(p, 2)}\\,\\text{kPa}$`), archetype: "A" }; },
    (rand) => { const n = rp([0.012, 0.013, 0.015], rand), R = rp([0.4, 0.5, 0.6, 0.8], rand), S = rp([0.0008, 0.001, 0.0015], rand); const v = (1 / n) * R ** (2 / 3) * S ** 0.5; return { topic: "Open Channel — Manning", difficulty: "hard", marks: 2, type: "NAT", stem: `Manning $n=${n}$, $R=${R}\\,\\text{m}$, $S=${S}$. Mean velocity is _____ m/s.`, answer: v, tolerance: 0.02, solution: sol("$v=\\dfrac1n R^{2/3}S^{1/2}$.", `$$\\dfrac{1}{${n}}(${R})^{2/3}(${S})^{1/2}=${r(v, 3)}.$$`, `$${r(v, 3)}$`), archetype: "C" }; },
  ],
  "ce-hydrology-irrigation": [
    (rand) => { const C = rp([0.4, 0.5, 0.6, 0.7], rand), I = rp([30, 40, 50, 60], rand), A = rp([10, 20, 36, 50], rand); const Q = C * I * A / 360; return { topic: "Runoff — Rational Method", difficulty: "medium", marks: 2, type: "NAT", stem: `Catchment $${A}\\,\\text{ha}$, $C=${C}$, intensity $${I}\\,\\text{mm/hr}$. Peak runoff ($CIA/360$) is _____ m³/s.`, answer: Q, tolerance: 0.01, solution: sol("$Q=CIA/360$.", `$$\\dfrac{${C}\\times${I}\\times${A}}{360}=${r(Q, 3)}.$$`, `$${r(Q, 3)}$`), archetype: "A" }; },
    (rand) => { const B = rp([90, 100, 120, 135], rand), D = rp([700, 800, 1000, 1200], rand); const delta = 8.64 * B / D; return { topic: "Irrigation — Delta", difficulty: "medium", marks: 2, type: "NAT", stem: `Base period $${B}\\,\\text{days}$, duty $${D}\\,\\text{ha/cumec}$. Delta is _____ m.`, answer: delta, tolerance: 0.005, solution: sol("$\\Delta=8.64B/D$.", `$$\\dfrac{8.64\\times${B}}{${D}}=${r(delta, 3)}.$$`, `$${r(delta, 3)}\\,\\text{m}$`), archetype: "A" }; },
  ],
  "ce-environmental-engineering": [
    (rand) => { const pop = rp([50000, 80000, 100000, 120000], rand), lpcd = rp([135, 150, 200], rand); const d = pop * lpcd / 1e6; return { topic: "Water Demand", difficulty: "easy", marks: 1, type: "NAT", stem: `Population $${pop.toLocaleString("en-IN")}$, demand $${lpcd}\\,\\text{lpcd}$. Average daily demand is _____ MLD.`, answer: d, tolerance: 0.02, solution: sol("demand = pop × lpcd.", `$$\\dfrac{${pop}\\times${lpcd}}{10^6}=${r(d, 2)}.$$`, `$${r(d, 2)}\\,\\text{MLD}$`), archetype: "A" }; },
    (rand) => { const applied = rp([3, 4, 5, 6], rand), residual = rp([0.2, 0.3, 0.5], rand); const dm = applied - residual; return { topic: "Disinfection", difficulty: "easy", marks: 1, type: "NAT", stem: `Chlorine applied $${applied}\\,\\text{mg/L}$, residual $${residual}\\,\\text{mg/L}$. Chlorine demand is _____ mg/L.`, answer: dm, tolerance: 0.01, solution: sol("demand = applied − residual.", `$$${applied}-${residual}=${r(dm, 2)}.$$`, `$${r(dm, 2)}$`), archetype: "A" }; },
    (rand) => { const L0 = rp([200, 250, 300], rand), k = rp([0.1, 0.12, 0.15], rand), t = rp([3, 5, 7], rand); const y = L0 * (1 - 10 ** (-k * t)); return { topic: "BOD", difficulty: "hard", marks: 2, type: "NAT", stem: `Ultimate BOD $${L0}\\,\\text{mg/L}$, $k=${k}\\,\\text{d}^{-1}$ (base 10). BOD exerted in $${t}$ days is _____ mg/L.`, answer: y, tolerance: 0.5, solution: sol("$y_t=L_0(1-10^{-kt})$.", `$$${L0}(1-10^{-${k}\\times${t}})=${r(y, 1)}.$$`, `$${r(y, 1)}$`), archetype: "C" }; },
  ],
  "ce-transportation-engineering": [
    (rand) => { const V = rp([40, 50, 60, 80, 100], rand), t = 2.5; const lag = 0.278 * V * t; return { topic: "Sight Distance", difficulty: "medium", marks: 2, type: "NAT", stem: `Design speed $${V}\\,\\text{km/h}$, reaction time $2.5\\,\\text{s}$. Lag distance is _____ m.`, answer: lag, tolerance: 0.1, solution: sol("$d=0.278Vt$.", `$$0.278\\times${V}\\times2.5=${r(lag, 2)}.$$`, `$${r(lag, 2)}\\,\\text{m}$`), archetype: "A" }; },
    (rand) => { const V = rp([50, 60, 80, 100], rand), R = rp([100, 150, 200, 300], rand); const e = V * V / (127 * R); return { topic: "Horizontal Curve — Superelevation", difficulty: "hard", marks: 2, type: "NAT", stem: `Design speed $${V}\\,\\text{km/h}$, radius $${R}\\,\\text{m}$. Superelevation (no friction) is _____.`, answer: e, tolerance: 0.001, solution: sol("$e=V^2/(127R)$.", `$$\\dfrac{${V}^2}{127\\times${R}}=${r(e, 4)}.$$`, `$${r(e, 4)}$`), archetype: "C" }; },
    (rand) => { const k = rp([30, 40, 50, 60], rand), v = rp([40, 50, 60], rand); const q = k * v; return { topic: "Traffic Flow", difficulty: "easy", marks: 1, type: "NAT", stem: `Density $${k}\\,\\text{veh/km}$, speed $${v}\\,\\text{km/h}$. Flow is _____ veh/h.`, answer: q, tolerance: 1, solution: sol("$q=kv$.", `$$${k}\\times${v}=${q}.$$`, `$${q}\\,\\text{veh/h}$`), archetype: "A" }; },
  ],
  "ce-geomatics-surveying": [
    (rand) => { const S = r(0.5 + rand() * 1.5, 2); const D = 100 * S; return { topic: "Tacheometry", difficulty: "medium", marks: 2, type: "NAT", stem: `Tacheometer $K=100,C=0$, staff intercept $${S}\\,\\text{m}$ (horizontal sight). Horizontal distance is _____ m.`, answer: D, tolerance: 0.1, solution: sol("$D=KS+C$.", `$$100\\times${S}=${r(D, 1)}.$$`, `$${r(D, 1)}\\,\\text{m}$`), archetype: "A" }; },
    (rand) => { const R = rp([200, 250, 300, 400], rand), defl = rp([30, 40, 45, 60], rand); const L = Math.PI * R * defl / 180; return { topic: "Curves", difficulty: "hard", marks: 2, type: "NAT", stem: `Circular curve radius $${R}\\,\\text{m}$, central angle $${defl}^\\circ$. Curve length is _____ m.`, answer: L, tolerance: 0.1, solution: sol("$L=\\pi R\\Delta/180$.", `$$\\dfrac{\\pi\\times${R}\\times${defl}}{180}=${r(L, 2)}.$$`, `$${r(L, 2)}\\,\\text{m}$`), archetype: "C" }; },
    (rand) => { const bm = r(95 + rand() * 10, 3), bs = r(0.5 + rand() * 2, 3); const hi = r(bm + bs, 3); return { topic: "Levelling", difficulty: "easy", marks: 1, type: "NAT", stem: `Benchmark RL $${bm}\\,\\text{m}$, backsight $${bs}\\,\\text{m}$. Height of instrument is _____ m.`, answer: hi, tolerance: 0.001, solution: sol("HI = RL + BS.", `$$${bm}+${bs}=${hi}.$$`, `$${hi}\\,\\text{m}$`), archetype: "A" }; },
  ],
};

/** Pad a bank with bulk parametric NATs (deduped by stem) up to `target`. */
function padBank(bank: { slug: string; name: string; questions: Q[] }, rand: () => number, target: number) {
  const gens = BULK[bank.slug];
  if (!gens) return;
  const seen = new Set(bank.questions.map((q) => q.stem));
  let guard = 0;
  let n = bank.questions.length;
  const prefix = (bank.questions[0]?.id ?? `${bank.slug}-x`).replace(/-\d+$/, "");
  while (bank.questions.length < target && guard < target * 40) {
    guard++;
    const g = gens[Math.floor(rand() * gens.length)](rand);
    if (seen.has(g.stem)) continue;
    seen.add(g.stem);
    n++;
    bank.questions.push({ id: `${prefix}-${String(n).padStart(3, "0")}`, subject: bank.name, ...g } as Q);
  }
}

// ═════════════════════════════════════════════════════════════════════
//  1 · ENGINEERING MATHEMATICS
// ═════════════════════════════════════════════════════════════════════
function buildMath(rand: () => number): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-em", "Engineering Mathematics");
  // Determinant 2x2 (clean)
  for (const [a, bb, c, d] of [[2, 3, 1, 4], [5, 2, 3, 4], [6, 1, 2, 5], [3, 7, 1, 4]]) {
    const det = a * d - bb * c;
    b.nat("Linear Algebra — Determinant", "easy", 1,
      `The determinant of $\\begin{bmatrix}${a} & ${bb}\\\\ ${c} & ${d}\\end{bmatrix}$ is _____.`,
      det, 0.001,
      sol("For a $2\\times2$ matrix, $\\det = ad-bc$.", `$$\\det = (${a})(${d}) - (${bb})(${c}) = ${det}.$$`, `$${det}$`), "A");
  }
  // Eigenvalues sum/product
  for (const [a, d] of [[4, 6], [3, 5], [7, 2], [8, 4]]) {
    const tr = a + d;
    b.nat("Linear Algebra — Eigenvalues", "easy", 1,
      `For a $2\\times2$ matrix with diagonal entries $${a}$ and $${d}$ (off-diagonal arbitrary), the sum of its eigenvalues equals _____.`,
      tr, 0.001,
      sol("Sum of eigenvalues $=\\operatorname{trace}=a+d$.", `$$\\lambda_1+\\lambda_2 = ${a}+${d} = ${tr}.$$`, `$${tr}$`), "A");
  }
  // Derivative / slope
  for (const [a, x0] of [[3, 2], [2, 3], [4, 1], [5, 2]]) {
    const slope = 2 * a * x0;
    b.nat("Calculus — Differentiation", "easy", 1,
      `The slope of the curve $y = ${a}x^2$ at $x = ${x0}$ is _____.`,
      slope, 0.001,
      sol("$\\dfrac{dy}{dx} = 2ax$.", `$$\\left.\\dfrac{dy}{dx}\\right|_{x=${x0}} = 2(${a})(${x0}) = ${slope}.$$`, `$${slope}$`), "A");
  }
  // Definite integral of x^n
  for (const [n, up] of [[2, 3], [3, 2], [2, 6], [4, 2]]) {
    const val = up ** (n + 1) / (n + 1);
    b.nat("Calculus — Integration", "medium", 1,
      `Evaluate $\\displaystyle\\int_0^{${up}} x^{${n}}\\,dx$.`,
      val, 0.01,
      sol("$\\int_0^a x^n\\,dx = \\dfrac{a^{n+1}}{n+1}$.", `$$\\int_0^{${up}} x^{${n}}\\,dx = \\dfrac{${up}^{${n + 1}}}{${n + 1}} = ${r(val, 3)}.$$`, `$${r(val, 3)}$`), "A");
  }
  // Mean of data
  for (let i = 0; i < 3; i++) {
    const data = Array.from({ length: 5 }, () => 1 + Math.floor(rand() * 9));
    const mean = data.reduce((s, x) => s + x, 0) / data.length;
    b.nat("Probability & Statistics — Mean", "easy", 1,
      `The arithmetic mean of the data set $\\{${data.join(", ")}\\}$ is _____.`,
      mean, 0.01,
      sol("Mean $=\\dfrac{\\sum x_i}{n}$.", `$$\\bar{x} = \\dfrac{${data.join("+")}}{5} = ${r(mean, 2)}.$$`, `$${r(mean, 2)}$`), "A");
  }
  // Probability simple
  b.nat("Probability — Basic", "easy", 1,
    "A fair die is rolled once. The probability of obtaining a number greater than $4$ is _____.",
    2 / 6, 0.01,
    sol("Favourable outcomes $\\{5,6\\}$ out of $6$.", "$$P = \\dfrac{2}{6} = 0.333.$$", "$0.333$"), "A");
  // Trapezoidal/Simpson concept MCQ
  b.mcq("Numerical Methods — Integration", "medium", 1,
    "Simpson's $1/3$ rule integrates a function exactly when the function is a polynomial of degree at most",
    ["$3$", "$1$", "$2$", "$4$"], 0,
    sol("Simpson's $1/3$ rule fits parabolas but is exact up to cubics (degree $3$).", "Degree $\\le 3$ is integrated exactly.", "$3$"), "B");
  // Newton-Raphson concept
  b.mcq("Numerical Methods — Root Finding", "medium", 1,
    "The order of convergence of the Newton–Raphson method (for a simple root) is",
    ["$2$ (quadratic)", "$1$ (linear)", "$1.618$", "$3$"], 0,
    sol("Newton–Raphson converges quadratically near a simple root.", "Order $=2$.", "Quadratic, order $2$"), "B");
  // ODE order
  b.mcq("Differential Equations", "easy", 1,
    "The order of the differential equation $\\dfrac{d^2y}{dx^2} + 3\\dfrac{dy}{dx} + 2y = 0$ is",
    ["$2$", "$1$", "$3$", "$0$"], 0,
    sol("Order = highest derivative present.", "Highest is $d^2y/dx^2$ → order $2$.", "$2$"), "B");
  // Vector dot product
  for (const [a, c] of [[[1, 2, 2], [2, 0, 1]], [[3, 0, 4], [1, 2, 2]]] as number[][][]) {
    const dot = a[0] * c[0] + a[1] * c[1] + a[2] * c[2];
    b.nat("Vector Calculus — Dot Product", "easy", 1,
      `The dot product $(${a[0]}\\hat i + ${a[1]}\\hat j + ${a[2]}\\hat k)\\cdot(${c[0]}\\hat i + ${c[1]}\\hat j + ${c[2]}\\hat k)$ is _____.`,
      dot, 0.001,
      sol("$\\vec a\\cdot\\vec b = a_xb_x + a_yb_y + a_zb_z$.", `$$= ${a[0]}\\cdot${c[0]} + ${a[1]}\\cdot${c[1]} + ${a[2]}\\cdot${c[2]} = ${dot}.$$`, `$${dot}$`), "A");
  }
  // Rank/consistency MSQ
  b.msq("Linear Algebra — Systems", "hard", 2,
    "Select all TRUE statements about a square matrix $A$ of order $n$.",
    ["If $\\det A = 0$, $A$ is singular and non-invertible", "Sum of eigenvalues equals the trace", "$AB = BA$ for all matrices", "Product of eigenvalues equals $\\det A$"],
    [0, 1, 3],
    sol("Singular ⇔ zero determinant; trace = Σλ; det = Πλ. Matrix multiplication is NOT commutative.", "Options 1, 2, 4 are true.", "Singular, trace, and determinant statements"), "D");
  return { slug: "ce-engineering-mathematics", name: "Engineering Mathematics", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  2 · ENGINEERING MECHANICS
// ═════════════════════════════════════════════════════════════════════
function buildMechanics(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-mech", "Engineering Mechanics");
  // Resultant of perpendicular forces (Pythagorean triples)
  for (const [f1, f2] of [[3, 4], [6, 8], [5, 12], [8, 15]]) {
    const r0 = Math.hypot(f1, f2);
    b.nat("Resultant of Forces", f1 === 3 ? "easy" : "medium", f1 === 3 ? 1 : 2,
      `Two forces of $${f1}\\,\\text{kN}$ and $${f2}\\,\\text{kN}$ act at right angles at a point. The magnitude of their resultant is _____ kN.`,
      r0, 0.01,
      sol("For perpendicular forces $R=\\sqrt{F_1^2+F_2^2}$.", `$$R=\\sqrt{${f1}^2+${f2}^2}=${r0}.$$`, `$${r0}\\,\\text{kN}$`), "A");
  }
  // Moment of a force
  for (const [f, d] of [[20, 3], [15, 4], [25, 2]]) {
    const m = f * d;
    b.nat("Moment of a Force", "easy", 1,
      `A force of $${f}\\,\\text{kN}$ acts perpendicular to a lever at a distance of $${d}\\,\\text{m}$ from the pivot. The moment about the pivot is _____ kN·m.`,
      m, 0.01,
      sol("$M = F\\times d$ for a perpendicular force.", `$$M = ${f}\\times ${d} = ${m}.$$`, `$${m}\\,\\text{kN·m}$`), "A");
  }
  // Centroid of triangle from base
  for (const [h] of [[300], [600], [450]]) {
    const yc = h / 3;
    b.nat("Centroid", "easy", 1,
      `The centroid of a triangular section of height $${h}\\,\\text{mm}$ lies at a distance of _____ mm from its base.`,
      yc, 0.1,
      sol("Centroid of a triangle is at $h/3$ from the base.", `$$\\bar y = \\dfrac{${h}}{3} = ${yc}.$$`, `$${yc}\\,\\text{mm}$`), "A");
  }
  // Simply supported beam reaction (central point load)
  for (const [w] of [[40], [60], [100]]) {
    const reac = w / 2;
    b.nat("Beam Reactions", "easy", 1,
      `A simply supported beam carries a central point load of $${w}\\,\\text{kN}$. Each support reaction is _____ kN.`,
      reac, 0.01,
      sol("By symmetry each reaction = $W/2$.", `$$R = \\dfrac{${w}}{2} = ${reac}.$$`, `$${reac}\\,\\text{kN}$`), "A");
  }
  // SSB reaction with UDL
  for (const [w, L] of [[20, 6], [15, 8], [30, 4]]) {
    const reac = w * L / 2;
    b.nat("Beam Reactions — UDL", "medium", 1,
      `A simply supported beam of span $${L}\\,\\text{m}$ carries a UDL of $${w}\\,\\text{kN/m}$ over its full length. Each support reaction is _____ kN.`,
      reac, 0.01,
      sol("Total load $=wL$; each reaction $=wL/2$.", `$$R = \\dfrac{${w}\\times ${L}}{2} = ${reac}.$$`, `$${reac}\\,\\text{kN}$`), "A");
  }
  // Max BM SSB central load
  for (const [w, L] of [[40, 6], [60, 4]]) {
    const mmax = w * L / 4;
    b.nat("Bending Moment", "medium", 2,
      `A simply supported beam of span $${L}\\,\\text{m}$ carries a central point load $${w}\\,\\text{kN}$. The maximum bending moment is _____ kN·m.`,
      mmax, 0.01,
      sol("For a central point load $M_{max}=\\dfrac{WL}{4}$.", `$$M_{max}=\\dfrac{${w}\\times ${L}}{4}=${mmax}.$$`, `$${mmax}\\,\\text{kN·m}$`), "A");
  }
  // Max BM SSB udl
  for (const [w, L] of [[20, 6], [12, 8]]) {
    const mmax = w * L * L / 8;
    b.nat("Bending Moment — UDL", "medium", 2,
      `A simply supported beam of span $${L}\\,\\text{m}$ carries a UDL of $${w}\\,\\text{kN/m}$. The maximum bending moment is _____ kN·m.`,
      mmax, 0.01,
      sol("For a full UDL $M_{max}=\\dfrac{wL^2}{8}$.", `$$M_{max}=\\dfrac{${w}\\times ${L}^2}{8}=${mmax}.$$`, `$${mmax}\\,\\text{kN·m}$`), "A");
  }
  // Friction
  for (const [W, mu] of [[100, 0.3], [200, 0.25]]) {
    const f = W * mu;
    b.nat("Friction", "easy", 1,
      `A block weighing $${W}\\,\\text{N}$ rests on a horizontal surface with coefficient of friction $${mu}$. The limiting friction force is _____ N.`,
      f, 0.01,
      sol("Limiting friction $F=\\mu N=\\mu W$.", `$$F=${mu}\\times ${W}=${f}.$$`, `$${f}\\,\\text{N}$`), "A");
  }
  // Truss concept
  b.mcq("Trusses", "medium", 1,
    "A member of a perfect pin-jointed truss carrying no load (a zero-force member) is identified primarily to",
    ["simplify analysis without affecting equilibrium", "increase the truss strength", "carry the maximum force", "resist only bending"], 0,
    sol("Zero-force members carry no axial force under the given loading and are removed to simplify analysis.", "They simplify analysis.", "Simplify analysis"), "B");
  // Degree of static indeterminacy concept
  b.mcq("Statics", "easy", 1,
    "A simply supported beam (one hinge, one roller) is",
    ["statically determinate", "statically indeterminate to 1°", "a mechanism", "indeterminate to 2°"], 0,
    sol("3 reaction components, 3 equilibrium equations → determinate.", "Determinate.", "Statically determinate"), "B");
  return { slug: "ce-engineering-mechanics", name: "Engineering Mechanics", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  3 · SOLID MECHANICS (Strength of Materials)
// ═════════════════════════════════════════════════════════════════════
function buildSolid(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-som", "Solid Mechanics");
  // Axial stress
  for (const [P, A] of [[100, 500], [200, 1000], [150, 750]]) {
    const stress = P * 1000 / A; // kN, mm^2 -> N/mm^2 = MPa
    b.nat("Axial Stress", "easy", 1,
      `A bar of cross-sectional area $${A}\\,\\text{mm}^2$ carries an axial tensile load of $${P}\\,\\text{kN}$. The normal stress is _____ MPa.`,
      stress, 0.01,
      sol("$\\sigma = \\dfrac{P}{A}$.", `$$\\sigma=\\dfrac{${P}\\times10^3}{${A}}=${r(stress, 2)}\\,\\text{MPa}.$$`, `$${r(stress, 2)}\\,\\text{MPa}$`), "A");
  }
  // Strain & elongation
  for (const [P, A, L, E] of [[50, 500, 2000, 200000], [80, 400, 1500, 200000]]) {
    const dl = (P * 1000 * L) / (A * E);
    b.nat("Axial Deformation", "medium", 2,
      `A steel bar ($E=${E / 1000}\\,\\text{GPa}$) of area $${A}\\,\\text{mm}^2$ and length $${L}\\,\\text{mm}$ carries an axial load of $${P}\\,\\text{kN}$. The elongation is _____ mm.`,
      dl, 0.001,
      sol("$\\delta=\\dfrac{PL}{AE}$.", `$$\\delta=\\dfrac{${P}\\times10^3\\times ${L}}{${A}\\times ${E}}=${r(dl, 3)}.$$`, `$${r(dl, 3)}\\,\\text{mm}$`), "A");
  }
  // Bending stress σ = M y / I (rectangular)
  for (const [bw, h, M] of [[200, 400, 50], [150, 300, 30]]) {
    const I = bw * h ** 3 / 12;
    const y = h / 2;
    const stress = (M * 1e6 * y) / I; // kN·m -> N·mm
    b.nat("Bending Stress", "hard", 2,
      `A rectangular beam section $${bw}\\,\\text{mm}\\times ${h}\\,\\text{mm}$ (b×d) carries a bending moment of $${M}\\,\\text{kN·m}$. The maximum bending stress is _____ MPa.`,
      stress, 0.1,
      sol("$\\sigma=\\dfrac{My}{I}$ with $I=\\dfrac{bd^3}{12}$, $y=d/2$.", `$$I=\\dfrac{${bw}\\times ${h}^3}{12}=${r(I, 0)}\\,\\text{mm}^4,\\quad \\sigma=\\dfrac{${M}\\times10^6\\times ${y}}{${r(I, 0)}}=${r(stress, 2)}.$$`, `$${r(stress, 2)}\\,\\text{MPa}$`), "C");
  }
  // Torsion τ = T r / J (solid circular)
  for (const [d, T] of [[50, 2], [60, 3]]) {
    const J = Math.PI * d ** 4 / 32;
    const tau = (T * 1e6 * (d / 2)) / J;
    b.nat("Torsion", "hard", 2,
      `A solid circular shaft of diameter $${d}\\,\\text{mm}$ transmits a torque of $${T}\\,\\text{kN·m}$. The maximum shear stress is _____ MPa.`,
      tau, 0.1,
      sol("$\\tau=\\dfrac{Tr}{J}$, $J=\\dfrac{\\pi d^4}{32}$.", `$$J=\\dfrac{\\pi\\,${d}^4}{32}=${r(J, 0)}\\,\\text{mm}^4,\\quad \\tau=\\dfrac{${T}\\times10^6\\times ${d / 2}}{${r(J, 0)}}=${r(tau, 2)}.$$`, `$${r(tau, 2)}\\,\\text{MPa}$`), "C");
  }
  // Euler buckling
  for (const [d, L] of [[40, 3000]] as number[][]) {
    const E = 200000;
    const I = Math.PI * d ** 4 / 64;
    const Pcr = (Math.PI ** 2 * E * I) / (L ** 2) / 1000; // N -> kN
    b.nat("Column Buckling", "hard", 2,
      `A pin-ended steel column ($E=200\\,\\text{GPa}$) is a solid circular section of diameter $${d}\\,\\text{mm}$ and length $${L / 1000}\\,\\text{m}$. The Euler critical load is _____ kN.`,
      Pcr, 1,
      sol("$P_{cr}=\\dfrac{\\pi^2 EI}{L^2}$ (both ends pinned), $I=\\dfrac{\\pi d^4}{64}$.", `$$I=\\dfrac{\\pi\\,${d}^4}{64}=${r(I, 0)}\\,\\text{mm}^4,\\quad P_{cr}=\\dfrac{\\pi^2\\times ${E}\\times ${r(I, 0)}}{${L}^2}=${r(Pcr, 1)}\\,\\text{kN}.$$`, `$${r(Pcr, 1)}\\,\\text{kN}$`), "C");
  }
  // Poisson's ratio concept
  b.mcq("Elastic Constants", "easy", 1,
    "The relationship between Young's modulus $E$, shear modulus $G$ and Poisson's ratio $\\nu$ is",
    ["$E = 2G(1+\\nu)$", "$E = G(1+\\nu)$", "$E = 2G(1-\\nu)$", "$E = 3G(1-2\\nu)$"], 0,
    sol("Standard elastic-constant relation.", "$E=2G(1+\\nu)$.", "$E=2G(1+\\nu)$"), "B");
  // Principal stress concept
  b.nat("Principal Stress", "medium", 2,
    "At a point, $\\sigma_x = 80\\,\\text{MPa}$, $\\sigma_y = 0$ and $\\tau_{xy}=0$. The maximum shear stress is _____ MPa.",
    40, 0.1,
    sol("$\\tau_{max}=\\dfrac{\\sigma_1-\\sigma_2}{2}$. Here $\\sigma_1=80,\\sigma_2=0$.", "$$\\tau_{max}=\\dfrac{80-0}{2}=40.$$", "$40\\,\\text{MPa}$"), "A");
  // Factor of safety
  for (const [fy, sigma] of [[250, 125], [415, 166]]) {
    const fos = fy / sigma;
    b.nat("Factor of Safety", "easy", 1,
      `A steel with yield stress $${fy}\\,\\text{MPa}$ is loaded to a working stress of $${sigma}\\,\\text{MPa}$. The factor of safety is _____.`,
      fos, 0.01,
      sol("$\\text{FoS}=\\dfrac{\\text{yield stress}}{\\text{working stress}}$.", `$$\\text{FoS}=\\dfrac{${fy}}{${sigma}}=${r(fos, 2)}.$$`, `$${r(fos, 2)}$`), "A");
  }
  return { slug: "ce-solid-mechanics", name: "Solid Mechanics", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  4 · STRUCTURAL ANALYSIS
// ═════════════════════════════════════════════════════════════════════
function buildStructural(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-sa", "Structural Analysis");
  // Fixed beam central point load: M = WL/8
  for (const [W, L] of [[40, 6], [60, 4]]) {
    const m = W * L / 8;
    b.nat("Fixed Beam", "medium", 2,
      `A fixed beam of span $${L}\\,\\text{m}$ carries a central point load $${W}\\,\\text{kN}$. The magnitude of the fixed-end moment is _____ kN·m.`,
      m, 0.01,
      sol("Fixed-end moment for a central point load $=\\dfrac{WL}{8}$.", `$$M=\\dfrac{${W}\\times ${L}}{8}=${m}.$$`, `$${m}\\,\\text{kN·m}$`), "A");
  }
  // Fixed beam UDL: M = wL^2/12
  for (const [w, L] of [[20, 6], [12, 8]]) {
    const m = w * L * L / 12;
    b.nat("Fixed Beam — UDL", "medium", 2,
      `A fixed beam of span $${L}\\,\\text{m}$ carries a UDL of $${w}\\,\\text{kN/m}$. The magnitude of the support (fixed-end) moment is _____ kN·m.`,
      m, 0.01,
      sol("Fixed-end moment for full UDL $=\\dfrac{wL^2}{12}$.", `$$M=\\dfrac{${w}\\times ${L}^2}{12}=${r(m, 2)}.$$`, `$${r(m, 2)}\\,\\text{kN·m}$`), "A");
  }
  // Static indeterminacy of a portal frame (concept)
  b.mcq("Indeterminacy", "medium", 1,
    "A single-bay single-storey portal frame with both column bases fixed is statically indeterminate to degree",
    ["$3$", "$1$", "$2$", "$6$"], 0,
    sol("Closed frame indeterminacy $D_s = 3$ for a single fixed-base portal (3 redundants).", "$D_s=3$.", "$3$"), "B");
  // Degree of kinematic indeterminacy concept
  b.mcq("Kinematic Indeterminacy", "medium", 1,
    "Kinematic indeterminacy (degrees of freedom) of a propped cantilever beam (axially rigid) is",
    ["$1$", "$2$", "$0$", "$3$"], 0,
    sol("Propped cantilever: rotation at the propped end is the only unknown DOF (axial ignored).", "$D_k=1$.", "$1$"), "B");
  // Carry-over factor
  b.mcq("Moment Distribution", "easy", 1,
    "In the moment-distribution method, the carry-over factor for a prismatic member (far end fixed) is",
    ["$1/2$", "$1$", "$1/4$", "$2/3$"], 0,
    sol("Standard carry-over factor = $1/2$.", "$1/2$.", "$1/2$"), "B");
  // Slope-deflection stiffness
  b.nat("Stiffness", "medium", 1,
    "The rotational stiffness $\\left(\\tfrac{4EI}{L}\\right)$ of a prismatic member with $EI = 8000\\,\\text{kN·m}^2$ and $L = 4\\,\\text{m}$ is _____ kN·m/rad.",
    4 * 8000 / 4, 1,
    sol("Stiffness $k=\\dfrac{4EI}{L}$.", "$$k=\\dfrac{4\\times 8000}{4}=8000.$$", "$8000\\,\\text{kN·m/rad}$"), "A");
  // Influence line concept
  b.mcq("Influence Lines", "medium", 1,
    "The ordinate of the influence line for the reaction at support $A$ of a simply supported beam, directly under $A$, equals",
    ["$1$", "$0$", "$0.5$", "$L$"], 0,
    sol("ILD for a reaction has unit ordinate under that support.", "Ordinate $=1$.", "$1$"), "B");
  // Three-moment / continuous beam concept (MSQ)
  b.msq("Methods of Analysis", "hard", 2,
    "Which of the following are force (flexibility) methods of structural analysis?",
    ["Method of consistent deformation", "Column analogy method", "Slope-deflection method", "Moment-distribution method"],
    [0, 1],
    sol("Consistent deformation & column analogy are force methods; slope-deflection & moment-distribution are displacement methods.", "Options 1 and 2.", "Consistent deformation & column analogy"), "D");
  // Castigliano concept
  b.mcq("Energy Methods", "medium", 1,
    "Castigliano's second theorem is used to determine",
    ["deflections from strain energy", "reactions of determinate beams only", "buckling loads", "natural frequency"], 0,
    sol("$\\delta=\\partial U/\\partial P$ gives deflection.", "Deflections.", "Deflections"), "B");
  return { slug: "ce-structural-analysis", name: "Structural Analysis", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  5 · CONSTRUCTION MATERIALS & MANAGEMENT
// ═════════════════════════════════════════════════════════════════════
function buildConstruction(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-cm", "Construction Materials & Management");
  // Water-cement ratio
  for (const [w, c] of [[180, 360], [200, 400]]) {
    const wc = w / c;
    b.nat("Concrete — w/c ratio", "easy", 1,
      `A concrete mix uses $${w}\\,\\text{kg}$ of water and $${c}\\,\\text{kg}$ of cement per $\\text{m}^3$. The water–cement ratio is _____.`,
      wc, 0.001,
      sol("$\\text{w/c}=\\dfrac{\\text{water}}{\\text{cement}}$.", `$$\\dfrac{${w}}{${c}}=${r(wc, 3)}.$$`, `$${r(wc, 3)}$`), "A");
  }
  // PERT expected time
  for (const [o, m, p] of [[3, 6, 15], [2, 5, 8]]) {
    const te = (o + 4 * m + p) / 6;
    b.nat("PERT", "medium", 2,
      `For an activity with optimistic $${o}$, most-likely $${m}$ and pessimistic $${p}$ days, the PERT expected time is _____ days.`,
      te, 0.01,
      sol("$t_e=\\dfrac{t_o+4t_m+t_p}{6}$.", `$$t_e=\\dfrac{${o}+4(${m})+${p}}{6}=${r(te, 2)}.$$`, `$${r(te, 2)}\\,\\text{days}$`), "A");
  }
  // PERT variance
  for (const [o, p] of [[3, 15], [2, 8]]) {
    const v = ((p - o) / 6) ** 2;
    b.nat("PERT — Variance", "medium", 1,
      `For an activity with optimistic $${o}$ and pessimistic $${p}$ days, the variance of the activity duration is _____ days².`,
      v, 0.01,
      sol("$\\sigma^2=\\left(\\dfrac{t_p-t_o}{6}\\right)^2$.", `$$\\sigma^2=\\left(\\dfrac{${p}-${o}}{6}\\right)^2=${r(v, 2)}.$$`, `$${r(v, 2)}$`), "A");
  }
  // EOQ
  for (const [D, Co, Ch] of [[1000, 50, 4], [2000, 40, 5]]) {
    const eoq = Math.sqrt((2 * D * Co) / Ch);
    b.nat("Inventory — EOQ", "hard", 2,
      `Annual demand $${D}$ units, ordering cost $₹${Co}$/order, holding cost $₹${Ch}$/unit/yr. The economic order quantity is _____ units.`,
      eoq, 1,
      sol("$\\text{EOQ}=\\sqrt{\\dfrac{2DC_o}{C_h}}$.", `$$\\text{EOQ}=\\sqrt{\\dfrac{2(${D})(${Co})}{${Ch}}}=${r(eoq, 1)}.$$`, `$${r(eoq, 1)}\\,\\text{units}$`), "C");
  }
  // Cement fineness/test concept
  b.mcq("Cement", "easy", 1,
    "The initial setting time of ordinary Portland cement (as per IS) should not be less than",
    ["$30$ minutes", "$10$ minutes", "$60$ minutes", "$600$ minutes"], 0,
    sol("IS limit: initial set ≥ 30 min; final set ≤ 600 min.", "$30$ min.", "$30$ minutes"), "B");
  // Slump concept
  b.mcq("Workability", "easy", 1,
    "The workability of fresh concrete is commonly measured by the",
    ["slump test", "Vicat test", "Le Chatelier test", "Brinell test"], 0,
    sol("Slump cone test measures workability.", "Slump test.", "Slump test"), "B");
  // Aggregate
  b.mcq("Aggregates", "medium", 1,
    "The fineness modulus of fine aggregate generally lies in the range",
    ["$2.0$ to $3.5$", "$5$ to $8$", "$0.5$ to $1$", "$8$ to $10$"], 0,
    sol("Fine aggregate FM ≈ 2.0–3.5.", "$2.0$–$3.5$.", "$2.0$ to $3.5$"), "B");
  // Float (CPM)
  b.nat("CPM — Float", "medium", 2,
    "An activity has EST $=5$, LST $=8$ days. Its total float is _____ days.",
    3, 0.01,
    sol("Total float $=\\text{LST}-\\text{EST}$.", "$$TF=8-5=3.$$", "$3\\,\\text{days}$"), "A");
  return { slug: "ce-construction-materials-management", name: "Construction Materials & Management", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  6 · CONCRETE STRUCTURES (RCC)
// ═════════════════════════════════════════════════════════════════════
function buildConcrete(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-rcc", "RCC & Prestressed Concrete");
  // Limiting NA depth factor (Fe415: 0.48, Fe500: 0.46, Fe250: 0.53)
  b.mcq("Limit State — Neutral Axis", "medium", 1,
    "As per IS 456, the limiting neutral-axis depth ratio $x_{u,max}/d$ for Fe415 steel is",
    ["$0.48$", "$0.53$", "$0.46$", "$0.36$"], 0,
    sol("IS 456 limiting $x_u/d$: Fe250 → 0.53, Fe415 → 0.48, Fe500 → 0.46.", "$0.48$ for Fe415.", "$0.48$"), "B");
  // Effective depth from area concept
  // Tensile steel force
  for (const [fy, Ast] of [[415, 1000], [500, 800]]) {
    const T = 0.87 * fy * Ast / 1000; // kN
    b.nat("Limit State — Steel Force", "medium", 2,
      `For a singly-reinforced section, the design tensile force in $${Ast}\\,\\text{mm}^2$ of Fe${fy} steel is $0.87f_yA_{st}$ = _____ kN.`,
      T, 0.1,
      sol("Design tensile force $=0.87 f_y A_{st}$.", `$$T=0.87\\times ${fy}\\times ${Ast}/1000=${r(T, 2)}\\,\\text{kN}.$$`, `$${r(T, 2)}\\,\\text{kN}$`), "A");
  }
  // Depth of stress block
  for (const [fy, Ast, fck, bw] of [[415, 1000, 20, 300]]) {
    const xu = (0.87 * fy * Ast) / (0.36 * fck * bw);
    b.nat("Limit State — Stress Block", "hard", 2,
      `A singly-reinforced beam: $b=${bw}\\,\\text{mm}$, $A_{st}=${Ast}\\,\\text{mm}^2$, Fe${fy}, M${fck}. The depth of the rectangular stress block $x_u$ is _____ mm.`,
      xu, 1,
      sol("Equate $0.36f_{ck}b\\,x_u = 0.87f_yA_{st}$.", `$$x_u=\\dfrac{0.87\\times ${fy}\\times ${Ast}}{0.36\\times ${fck}\\times ${bw}}=${r(xu, 1)}.$$`, `$${r(xu, 1)}\\,\\text{mm}$`), "C");
  }
  // Modular ratio (WSM)
  b.mcq("Working Stress — Modular Ratio", "medium", 1,
    "In the working stress method, the modular ratio $m$ is taken as $\\dfrac{280}{3\\sigma_{cbc}}$. For M20 ($\\sigma_{cbc}=7$ MPa), $m$ is approximately",
    ["$13.33$", "$9.33$", "$18.67$", "$7$"], 0,
    sol("$m=\\dfrac{280}{3\\sigma_{cbc}}=\\dfrac{280}{21}$.", "$$m=\\dfrac{280}{3\\times 7}=13.33.$$", "$13.33$"), "B");
  // Development length concept
  b.nat("Development Length", "hard", 2,
    "For a bar of diameter $\\phi = 16\\,\\text{mm}$ with design bond stress giving $L_d = 47\\phi$, the development length is _____ mm.",
    47 * 16, 1,
    sol("$L_d = 47\\phi$ (given).", "$$L_d = 47\\times 16 = 752.$$", "$752\\,\\text{mm}$"), "A");
  // Prestress loss concept
  b.mcq("Prestressed Concrete", "medium", 1,
    "In a pre-tensioned member, loss of prestress due to elastic shortening is calculated using",
    ["modular ratio × concrete stress at steel level", "creep coefficient only", "relaxation of steel", "shrinkage strain × area"], 0,
    sol("Elastic shortening loss $=m\\,f_c$ at the steel level.", "$m f_c$.", "Modular ratio × concrete stress"), "B");
  // Min reinforcement concept
  b.mcq("Detailing", "easy", 1,
    "As per IS 456, the minimum tension reinforcement in a beam is $\\dfrac{A_s}{bd} =$",
    ["$\\dfrac{0.85}{f_y}$", "$\\dfrac{0.12}{100}$", "$\\dfrac{0.5}{f_y}$", "$\\dfrac{1}{f_y}$"], 0,
    sol("IS 456: $A_s/(bd) = 0.85/f_y$ minimum.", "$0.85/f_y$.", "$0.85/f_y$"), "B");
  return { slug: "ce-concrete-structures", name: "RCC & Prestressed Concrete", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  7 · STEEL STRUCTURES
// ═════════════════════════════════════════════════════════════════════
function buildSteel(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-st", "Steel Structures");
  // Tension member gross-section yielding
  for (const [Ag, fy] of [[1500, 250], [2000, 250]]) {
    const Tdg = (Ag * fy / 1.1) / 1000; // kN, γm0=1.1
    b.nat("Tension Member", "medium", 2,
      `A tension member of gross area $${Ag}\\,\\text{mm}^2$ (Fe$${fy}$, $\\gamma_{m0}=1.1$) has design strength governed by gross yielding $=\\dfrac{A_g f_y}{\\gamma_{m0}}$ = _____ kN.`,
      Tdg, 0.1,
      sol("Gross-section yielding: $T_{dg}=\\dfrac{A_g f_y}{\\gamma_{m0}}$.", `$$T_{dg}=\\dfrac{${Ag}\\times ${fy}}{1.1\\times 1000}=${r(Tdg, 2)}.$$`, `$${r(Tdg, 2)}\\,\\text{kN}$`), "A");
  }
  // Bolt shear capacity concept
  b.mcq("Bolted Connections", "medium", 1,
    "The design shear strength of a bearing-type bolt (single shear) is given (LSM) by $\\dfrac{f_{ub} A_{nb}}{\\sqrt 3\\,\\gamma_{mb}}$. The factor $\\sqrt 3$ arises from",
    ["the von Mises shear–tension relation", "the number of shear planes", "the bolt thread reduction", "the partial safety factor"], 0,
    sol("Shear yield = $f_y/\\sqrt3$ (von Mises).", "$\\sqrt3$ from von Mises.", "von Mises relation"), "B");
  // Slenderness ratio
  for (const [Le, rmin] of [[3000, 30], [4000, 40]]) {
    const lam = Le / rmin;
    b.nat("Compression Member", "easy", 1,
      `A column has effective length $${Le}\\,\\text{mm}$ and minimum radius of gyration $${rmin}\\,\\text{mm}$. Its slenderness ratio is _____.`,
      lam, 0.1,
      sol("$\\lambda=\\dfrac{L_e}{r_{min}}$.", `$$\\lambda=\\dfrac{${Le}}{${rmin}}=${r(lam, 1)}.$$`, `$${r(lam, 1)}$`), "A");
  }
  // Weld throat thickness
  for (const [s] of [[6], [8], [10]]) {
    const t = 0.707 * s;
    b.nat("Welded Connections", "easy", 1,
      `For a fillet weld of size $${s}\\,\\text{mm}$, the effective throat thickness is _____ mm.`,
      t, 0.01,
      sol("Throat $=0.707\\times$ weld size.", `$$t=0.707\\times ${s}=${r(t, 2)}.$$`, `$${r(t, 2)}\\,\\text{mm}$`), "A");
  }
  // Plastic section modulus / shape factor
  b.mcq("Plastic Analysis", "medium", 1,
    "The shape factor of a rectangular cross-section (in bending) is",
    ["$1.5$", "$1.0$", "$1.7$", "$1.12$"], 0,
    sol("Shape factor $=Z_p/Z_e=1.5$ for a rectangle.", "$1.5$.", "$1.5$"), "B");
  // Effective length factor concept
  b.mcq("Effective Length", "easy", 1,
    "For a column with both ends fixed (no sway), the effective length factor is",
    ["$0.5$", "$1.0$", "$2.0$", "$0.7$"], 0,
    sol("Both ends fixed → $0.65$ (design) ≈ theoretical $0.5$.", "$0.5$ (theoretical).", "$0.5$"), "B");
  // Gross vs net area MSQ
  b.msq("Limit States", "hard", 2,
    "Which limit states govern the design tensile strength of a steel plate with bolt holes?",
    ["Gross-section yielding", "Net-section rupture", "Block shear", "Lateral–torsional buckling"],
    [0, 1, 2],
    sol("Tension members: yielding, rupture and block shear. LTB is a flexural limit state.", "Options 1, 2, 3.", "Yielding, rupture, block shear"), "D");
  return { slug: "ce-steel-structures", name: "Steel Structures", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  8 · SOIL MECHANICS (Geotechnical)
// ═════════════════════════════════════════════════════════════════════
function buildSoil(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-soil", "Soil Mechanics");
  // Void ratio from porosity
  for (const [nPct] of [[40], [50], [33]]) {
    const n = nPct / 100;
    const e = n / (1 - n);
    b.nat("Phase Relations — Void Ratio", "easy", 1,
      `A soil has porosity $${nPct}\\%$. Its void ratio is _____.`,
      e, 0.001,
      sol("$e=\\dfrac{n}{1-n}$.", `$$e=\\dfrac{${n}}{1-${n}}=${r(e, 3)}.$$`, `$${r(e, 3)}$`), "A");
  }
  // Degree of saturation: Se = wGs
  for (const [w, Gs, e] of [[0.20, 2.70, 0.6], [0.25, 2.65, 0.7]]) {
    const S = (w * Gs / e) * 100;
    b.nat("Phase Relations — Saturation", "medium", 2,
      `A soil has water content $${w * 100}\\%$, $G_s=${Gs}$ and void ratio $${e}$. Its degree of saturation is _____ %.`,
      S, 0.1,
      sol("$Se=wG_s\\Rightarrow S=\\dfrac{wG_s}{e}$.", `$$S=\\dfrac{${w}\\times ${Gs}}{${e}}\\times100=${r(S, 1)}\\%.$$`, `$${r(S, 1)}\\%$`), "A");
  }
  // Dry unit weight
  for (const [gamma, w] of [[20, 0.25], [19, 0.20]]) {
    const gd = gamma / (1 + w);
    b.nat("Unit Weight", "medium", 1,
      `A soil has bulk unit weight $${gamma}\\,\\text{kN/m}^3$ and water content $${w * 100}\\%$. Its dry unit weight is _____ kN/m³.`,
      gd, 0.01,
      sol("$\\gamma_d=\\dfrac{\\gamma}{1+w}$.", `$$\\gamma_d=\\dfrac{${gamma}}{1+${w}}=${r(gd, 2)}.$$`, `$${r(gd, 2)}\\,\\text{kN/m}^3$`), "A");
  }
  // Effective stress
  for (const [h, hw] of [[6, 2]]) {
    const sigma = 18 * (h - hw) + 20 * hw; // simplistic two-layer; keep simple single
    // use single saturated layer instead:
    const gammaSat = 20, gammaW = 9.81;
    const total = gammaSat * h;
    const u = gammaW * hw;
    const eff = total - u;
    b.nat("Effective Stress", "hard", 2,
      `A saturated soil deposit ($\\gamma_{sat}=${gammaSat}\\,\\text{kN/m}^3$) is $${h}\\,\\text{m}$ thick with water table at the surface. At a depth of $${hw}\\,\\text{m}$, the effective vertical stress is _____ kPa.`,
      gammaSat * hw - gammaW * hw, 0.1,
      sol("$\\sigma' = \\sigma - u = \\gamma_{sat}z - \\gamma_w z = \\gamma' z$.", `$$\\sigma'=(${gammaSat}-${gammaW})\\times ${hw}=${r((gammaSat - gammaW) * hw, 2)}.$$`, `$${r((gammaSat - gammaW) * hw, 2)}\\,\\text{kPa}$`), "C");
    void sigma; void total; void u; void eff;
  }
  // Darcy velocity
  for (const [k, i] of [[1e-3, 0.5], [2e-4, 0.8]]) {
    const v = k * i;
    b.nat("Permeability — Darcy", "medium", 2,
      `A soil has coefficient of permeability $k = ${k}\\,\\text{m/s}$ and is subjected to a hydraulic gradient $i = ${i}$. The Darcy (discharge) velocity is _____ m/s.`,
      v, v * 1e-3,
      sol("$v=ki$ (Darcy's law).", `$$v=${k}\\times ${i}=${v.toExponential(2)}.$$`, `$${v.toExponential(2)}\\,\\text{m/s}$`), "A");
  }
  // Plasticity index
  for (const [LL, PL] of [[45, 22], [55, 25]]) {
    const PI = LL - PL;
    b.nat("Atterberg Limits", "easy", 1,
      `A soil has liquid limit $${LL}\\%$ and plastic limit $${PL}\\%$. Its plasticity index is _____ %.`,
      PI, 0.01,
      sol("$PI = LL - PL$.", `$$PI=${LL}-${PL}=${PI}.$$`, `$${PI}\\%$`), "A");
  }
  // Consolidation concept
  b.mcq("Consolidation", "medium", 1,
    "The coefficient of consolidation $c_v$ has the same dimensions as",
    ["$\\text{length}^2/\\text{time}$", "$\\text{length}/\\text{time}$", "$\\text{time}$", "dimensionless"], 0,
    sol("$c_v$ has units of area/time (e.g. m²/yr).", "$L^2T^{-1}$.", "length²/time"), "B");
  // Compaction concept
  b.mcq("Compaction", "easy", 1,
    "The maximum dry density of a soil is obtained at",
    ["the optimum moisture content", "zero moisture content", "the liquid limit", "full saturation"], 0,
    sol("MDD occurs at OMC in a compaction test.", "OMC.", "Optimum moisture content"), "B");
  return { slug: "ce-soil-mechanics", name: "Soil Mechanics", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  9 · FOUNDATION ENGINEERING
// ═════════════════════════════════════════════════════════════════════
function buildFoundation(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-fe", "Foundation Engineering");
  // Net vs gross pressure
  for (const [q, gamma, Df] of [[200, 18, 1.5], [250, 20, 2]]) {
    const net = q - gamma * Df;
    b.nat("Bearing Pressure", "medium", 1,
      `A footing applies a gross pressure of $${q}\\,\\text{kPa}$ at depth $${Df}\\,\\text{m}$ ($\\gamma=${gamma}\\,\\text{kN/m}^3$). The net pressure is _____ kPa.`,
      net, 0.1,
      sol("$q_{net}=q_{gross}-\\gamma D_f$.", `$$q_{net}=${q}-${gamma}\\times ${Df}=${r(net, 1)}.$$`, `$${r(net, 1)}\\,\\text{kPa}$`), "A");
  }
  // Terzaghi for clay phi=0 strip: qu = cNc + gamma Df Nq ; Nc=5.7, Nq=1
  for (const [c, gamma, Df] of [[30, 18, 1]]) {
    const Nc = 5.7, Nq = 1.0;
    const qu = c * Nc + gamma * Df * Nq;
    b.nat("Terzaghi Bearing Capacity", "hard", 2,
      `A strip footing rests at $${Df}\\,\\text{m}$ depth on clay ($c=${c}\\,\\text{kPa}$, $\\phi=0$, $\\gamma=${gamma}\\,\\text{kN/m}^3$). Using Terzaghi ($N_c=5.7,\\ N_q=1,\\ N_\\gamma=0$), the ultimate bearing capacity is _____ kPa.`,
      qu, 1,
      sol("$q_u=cN_c+\\gamma D_f N_q + 0.5\\gamma B N_\\gamma$ with $N_\\gamma=0$.", `$$q_u=${c}\\times5.7+${gamma}\\times ${Df}\\times1=${r(qu, 1)}.$$`, `$${r(qu, 1)}\\,\\text{kPa}$`), "C");
  }
  // Pile group efficiency concept
  b.mcq("Pile Foundations", "medium", 1,
    "The group efficiency of a pile group is generally defined as",
    ["group capacity ÷ sum of individual pile capacities", "sum of pile capacities ÷ group capacity", "number of piles × single capacity", "settlement ratio"], 0,
    sol("$\\eta_g=\\dfrac{Q_{group}}{n Q_{single}}$.", "Group/Σ individual.", "Group ÷ Σ individual"), "B");
  // Factor of safety bearing
  for (const [qu, fos] of [[300, 3], [450, 3]]) {
    const qsafe = qu / fos;
    b.nat("Safe Bearing Capacity", "easy", 1,
      `The ultimate bearing capacity is $${qu}\\,\\text{kPa}$. With a factor of safety of $${fos}$, the net safe bearing capacity (gross basis) is _____ kPa.`,
      qsafe, 0.1,
      sol("$q_{safe}=\\dfrac{q_u}{\\text{FoS}}$.", `$$q_{safe}=\\dfrac{${qu}}{${fos}}=${r(qsafe, 1)}.$$`, `$${r(qsafe, 1)}\\,\\text{kPa}$`), "A");
  }
  // Plate load / settlement concept
  b.mcq("Settlement", "medium", 1,
    "Immediate (elastic) settlement of a footing on saturated clay is computed using",
    ["undrained modulus $E_u$ and $\\nu=0.5$", "drained modulus only", "consolidation theory", "$c_v$ and time factor"], 0,
    sol("Immediate settlement uses $E_u$, $\\nu=0.5$ (no volume change).", "$E_u$, $\\nu=0.5$.", "Undrained $E_u$, $\\nu=0.5$"), "B");
  // Active earth pressure coefficient (Rankine)
  for (const [phi] of [[30], [36]]) {
    const Ka = (1 - Math.sin(phi * Math.PI / 180)) / (1 + Math.sin(phi * Math.PI / 180));
    b.nat("Earth Pressure", "medium", 2,
      `For a cohesionless backfill with $\\phi=${phi}^\\circ$, the Rankine active earth pressure coefficient $K_a$ is _____.`,
      Ka, 0.01,
      sol("$K_a=\\dfrac{1-\\sin\\phi}{1+\\sin\\phi}$.", `$$K_a=\\dfrac{1-\\sin ${phi}^\\circ}{1+\\sin ${phi}^\\circ}=${r(Ka, 3)}.$$`, `$${r(Ka, 3)}$`), "A");
  }
  return { slug: "ce-foundation-engineering", name: "Foundation Engineering", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  10 · FLUID MECHANICS & HYDRAULICS
// ═════════════════════════════════════════════════════════════════════
function buildFluid(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-fm", "Fluid Mechanics & Hydraulics");
  // Continuity
  for (const [A, v] of [[0.5, 2], [0.2, 3]]) {
    const Q = A * v;
    b.nat("Continuity", "easy", 1,
      `Water flows through a pipe of cross-sectional area $${A}\\,\\text{m}^2$ at a velocity of $${v}\\,\\text{m/s}$. The discharge is _____ m³/s.`,
      Q, 0.001,
      sol("$Q=Av$.", `$$Q=${A}\\times ${v}=${r(Q, 3)}.$$`, `$${r(Q, 3)}\\,\\text{m}^3/\\text{s}$`), "A");
  }
  // Velocity change from area change (continuity)
  for (const [A1, v1, A2] of [[0.1, 4, 0.05]]) {
    const v2 = A1 * v1 / A2;
    b.nat("Continuity — Velocity", "medium", 1,
      `In a tapering pipe, $A_1=${A1}\\,\\text{m}^2$, $v_1=${v1}\\,\\text{m/s}$ and $A_2=${A2}\\,\\text{m}^2$. The velocity $v_2$ is _____ m/s.`,
      v2, 0.01,
      sol("$A_1v_1=A_2v_2$.", `$$v_2=\\dfrac{${A1}\\times ${v1}}{${A2}}=${r(v2, 2)}.$$`, `$${r(v2, 2)}\\,\\text{m/s}$`), "A");
  }
  // Hydrostatic pressure
  for (const [h] of [[5], [10], [3]]) {
    const p = 9.81 * h;
    b.nat("Hydrostatics", "easy", 1,
      `The gauge pressure at a depth of $${h}\\,\\text{m}$ below a free water surface ($\\gamma_w=9.81\\,\\text{kN/m}^3$) is _____ kPa.`,
      p, 0.1,
      sol("$p=\\gamma_w h$.", `$$p=9.81\\times ${h}=${r(p, 2)}.$$`, `$${r(p, 2)}\\,\\text{kPa}$`), "A");
  }
  // Reynolds number
  for (const [v, D, nu] of [[2, 0.1, 1e-6]]) {
    const Re = v * D / nu;
    b.nat("Reynolds Number", "medium", 2,
      `Water ($\\nu=10^{-6}\\,\\text{m}^2/\\text{s}$) flows at $${v}\\,\\text{m/s}$ in a $${D * 1000}\\,\\text{mm}$ diameter pipe. The Reynolds number is _____.`,
      Re, 1,
      sol("$Re=\\dfrac{vD}{\\nu}$.", `$$Re=\\dfrac{${v}\\times ${D}}{${nu}}=${r(Re, 0)}.$$`, `$${r(Re, 0)}$`), "A");
  }
  // Manning's velocity
  for (const [n, R, S] of [[0.013, 0.5, 0.001]]) {
    const v = (1 / n) * R ** (2 / 3) * S ** 0.5;
    b.nat("Open Channel — Manning", "hard", 2,
      `Using Manning's equation with $n=${n}$, hydraulic radius $R=${R}\\,\\text{m}$ and bed slope $S=${S}$, the mean velocity is _____ m/s.`,
      v, 0.01,
      sol("$v=\\dfrac{1}{n}R^{2/3}S^{1/2}$.", `$$v=\\dfrac{1}{${n}}(${R})^{2/3}(${S})^{1/2}=${r(v, 3)}.$$`, `$${r(v, 3)}\\,\\text{m/s}$`), "C");
  }
  // Froude number concept
  b.mcq("Open Channel Flow", "medium", 1,
    "Flow in an open channel is critical when the Froude number is",
    ["equal to $1$", "greater than $1$", "less than $1$", "equal to $0$"], 0,
    sol("$Fr=1$ → critical; $<1$ subcritical; $>1$ supercritical.", "$Fr=1$.", "$Fr=1$"), "B");
  // Bernoulli concept
  b.mcq("Bernoulli's Equation", "easy", 1,
    "Bernoulli's equation is an expression of the conservation of",
    ["energy", "mass", "momentum", "angular momentum"], 0,
    sol("Bernoulli = energy conservation along a streamline.", "Energy.", "Energy"), "B");
  // Metacentric stability MSQ
  b.msq("Buoyancy", "hard", 2,
    "A floating body is in stable equilibrium when",
    ["the metacentre is above the centre of gravity", "metacentric height is positive", "the metacentre is below G", "metacentric height is negative"],
    [0, 1],
    sol("Stable floating: M above G, $GM>0$.", "Options 1 and 2.", "M above G, $GM>0$"), "D");
  return { slug: "ce-fluid-mechanics-hydraulics", name: "Fluid Mechanics & Hydraulics", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  11 · HYDROLOGY & IRRIGATION
// ═════════════════════════════════════════════════════════════════════
function buildHydrology(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-hi", "Hydrology & Irrigation");
  // Rational method Q = CIA/360 (A in ha, I in mm/hr → Q in m3/s)
  for (const [C, I, A] of [[0.6, 50, 20], [0.5, 40, 36]]) {
    const Q = C * I * A / 360;
    b.nat("Runoff — Rational Method", "medium", 2,
      `For a catchment of $${A}\\,\\text{ha}$, runoff coefficient $${C}$ and rainfall intensity $${I}\\,\\text{mm/hr}$, the peak runoff (rational method, $Q=CIA/360$) is _____ m³/s.`,
      Q, 0.01,
      sol("$Q=\\dfrac{CIA}{360}$ (A in ha, I in mm/hr).", `$$Q=\\dfrac{${C}\\times ${I}\\times ${A}}{360}=${r(Q, 3)}.$$`, `$${r(Q, 3)}\\,\\text{m}^3/\\text{s}$`), "A");
  }
  // Duty-delta: delta = 8.64 B / D  (B in base period days, D duty in ha/cumec)
  for (const [B, D] of [[120, 800], [100, 1000]]) {
    const delta = 8.64 * B / D;
    b.nat("Irrigation — Delta", "medium", 2,
      `For a base period of $${B}\\,\\text{days}$ and a duty of $${D}\\,\\text{ha/cumec}$, the delta is _____ m.`,
      delta, 0.001,
      sol("$\\Delta=\\dfrac{8.64\\,B}{D}$ (metres).", `$$\\Delta=\\dfrac{8.64\\times ${B}}{${D}}=${r(delta, 3)}.$$`, `$${r(delta, 3)}\\,\\text{m}$`), "A");
  }
  // Infiltration / runoff depth
  for (const [P, losses] of [[80, 30]]) {
    const runoff = P - losses;
    b.nat("Rainfall–Runoff", "easy", 1,
      `A storm produces $${P}\\,\\text{mm}$ of rainfall; abstractions (losses) total $${losses}\\,\\text{mm}$. The direct runoff depth is _____ mm.`,
      runoff, 0.1,
      sol("Runoff $=$ rainfall $-$ losses.", `$$=${P}-${losses}=${runoff}.$$`, `$${runoff}\\,\\text{mm}$`), "A");
  }
  // Unit hydrograph concept
  b.mcq("Unit Hydrograph", "medium", 1,
    "A unit hydrograph represents the direct runoff hydrograph resulting from $1\\,\\text{cm}$ of effective rainfall occurring",
    ["uniformly over the catchment in unit time", "at a single point", "over an infinite time", "only during floods"], 0,
    sol("UH = DRH from 1 cm effective rain uniformly in unit duration.", "Uniform, unit time.", "Uniformly in unit time"), "B");
  // Well hydraulics concept
  b.mcq("Groundwater", "medium", 1,
    "The discharge from a fully-penetrating well in a confined aquifer (Thiem equation) is proportional to",
    ["the drawdown and transmissivity", "the square of the radius", "the porosity only", "the storage coefficient only"], 0,
    sol("Thiem: $Q\\propto T\\,(s)$ for given radii.", "Drawdown × transmissivity.", "Drawdown and transmissivity"), "B");
  // Evapotranspiration concept
  b.mcq("Hydrologic Cycle", "easy", 1,
    "The combined loss of water by evaporation from soil and transpiration from plants is called",
    ["evapotranspiration", "infiltration", "percolation", "interception"], 0,
    sol("Evaporation + transpiration = evapotranspiration.", "Evapotranspiration.", "Evapotranspiration"), "B");
  // Field capacity / consumptive use MSQ
  b.msq("Irrigation Water Requirement", "hard", 2,
    "Which quantities directly increase the depth of irrigation water required?",
    ["Higher consumptive use", "Higher conveyance losses", "Higher application efficiency", "Higher effective rainfall"],
    [0, 1],
    sol("More consumptive use and losses raise requirement; higher efficiency and effective rainfall reduce it.", "Options 1 and 2.", "Consumptive use & conveyance losses"), "D");
  return { slug: "ce-hydrology-irrigation", name: "Hydrology & Irrigation", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  12 · ENVIRONMENTAL ENGINEERING
// ═════════════════════════════════════════════════════════════════════
function buildEnvironmental(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-env", "Environmental Engineering");
  // Per-capita water demand
  for (const [pop, lpcd] of [[100000, 135], [50000, 150]]) {
    const demand = pop * lpcd / 1e6; // MLD
    b.nat("Water Demand", "easy", 1,
      `A town of population $${pop.toLocaleString("en-IN")}$ has a per-capita demand of $${lpcd}\\,\\text{lpcd}$. The average daily demand is _____ MLD.`,
      demand, 0.01,
      sol("Demand $=$ population × lpcd.", `$$=\\dfrac{${pop}\\times ${lpcd}}{10^6}=${r(demand, 2)}\\,\\text{MLD}.$$`, `$${r(demand, 2)}\\,\\text{MLD}$`), "A");
  }
  // BOD remaining: Lt = L0 (1-...)? use BOD exerted y = L0(1-10^-kt)
  for (const [L0, k, t] of [[300, 0.1, 5]]) {
    const y = L0 * (1 - 10 ** (-k * t));
    b.nat("BOD", "hard", 2,
      `The ultimate BOD of a waste is $${L0}\\,\\text{mg/L}$ with deoxygenation rate $k=${k}\\,\\text{day}^{-1}$ (base 10). The BOD exerted in $${t}$ days is _____ mg/L.`,
      y, 0.5,
      sol("$y_t=L_0(1-10^{-kt})$.", `$$y_5=${L0}(1-10^{-${k}\\times ${t}})=${r(y, 1)}.$$`, `$${r(y, 1)}\\,\\text{mg/L}$`), "C");
  }
  // Population forecast (arithmetic)
  for (const [p0, rate, n] of [[50000, 1000, 3]]) {
    const pf = p0 + rate * n;
    b.nat("Population Forecast", "medium", 1,
      `By the arithmetic-increase method, a town of $${p0.toLocaleString("en-IN")}$ growing at $${rate}$ persons/decade over $${n}$ decades reaches a population of _____.`,
      pf, 1,
      sol("Arithmetic: $P_n=P_0+nx$.", `$$P_n=${p0}+${n}\\times ${rate}=${pf}.$$`, `$${pf}$`), "A");
  }
  // Settling velocity (Stokes) concept
  b.mcq("Sedimentation", "medium", 1,
    "In an ideal (Type I) sedimentation tank, a particle is removed if its settling velocity is",
    ["greater than or equal to the surface overflow rate", "less than the overflow rate", "zero", "equal to the flow velocity"], 0,
    sol("Removal when $v_s \\ge$ surface loading (overflow) rate.", "$v_s \\ge SOR$.", "≥ overflow rate"), "B");
  // Chlorine demand
  for (const [applied, residual] of [[5, 0.5], [4, 0.3]]) {
    const demand = applied - residual;
    b.nat("Disinfection", "easy", 1,
      `If $${applied}\\,\\text{mg/L}$ of chlorine is applied and the residual is $${residual}\\,\\text{mg/L}$, the chlorine demand is _____ mg/L.`,
      demand, 0.01,
      sol("Demand $=$ applied $-$ residual.", `$$=${applied}-${residual}=${r(demand, 2)}.$$`, `$${r(demand, 2)}\\,\\text{mg/L}$`), "A");
  }
  // Hardness concept
  b.mcq("Water Quality", "easy", 1,
    "Hardness of water is generally expressed in terms of equivalent",
    ["$\\text{CaCO}_3$", "$\\text{NaCl}$", "$\\text{MgSO}_4$ only", "free chlorine"], 0,
    sol("Hardness reported as mg/L of CaCO₃ equivalent.", "CaCO₃.", "CaCO₃ equivalent"), "B");
  // Noise (decibel addition) — two equal sources add 3 dB
  b.nat("Noise Pollution", "medium", 2,
    "Two identical machines each produce $80\\,\\text{dB}$ at a point. The combined sound level is _____ dB.",
    83, 0.1,
    sol("Two equal sources: $L = L_1 + 10\\log_{10}2 = L_1+3$.", "$$L=80+3=83.$$", "$83\\,\\text{dB}$"), "A");
  // Air quality / solid waste MSQ
  b.msq("Solid Waste & Air", "hard", 2,
    "Which of the following are primary air pollutants (emitted directly)?",
    ["$\\text{SO}_2$", "$\\text{CO}$", "Ozone ($\\text{O}_3$)", "$\\text{NO}$"],
    [0, 1, 3],
    sol("SO₂, CO, NO are primary; ground-level ozone is a secondary pollutant.", "Options 1, 2, 4.", "SO₂, CO, NO"), "D");
  return { slug: "ce-environmental-engineering", name: "Environmental Engineering", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  13 · TRANSPORTATION ENGINEERING
// ═════════════════════════════════════════════════════════════════════
function buildTransportation(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-tr", "Transportation Engineering");
  // Stopping sight distance lag portion only (reaction): d = 0.278 V t
  for (const [V, t] of [[60, 2.5], [80, 2.5]]) {
    const lag = 0.278 * V * t;
    b.nat("Sight Distance", "medium", 2,
      `For a design speed of $${V}\\,\\text{km/h}$ and reaction time $${t}\\,\\text{s}$, the lag (reaction) distance component of SSD is _____ m.`,
      lag, 0.1,
      sol("Lag distance $=0.278\\,V\\,t$.", `$$d=0.278\\times ${V}\\times ${t}=${r(lag, 2)}.$$`, `$${r(lag, 2)}\\,\\text{m}$`), "A");
  }
  // Superelevation e = V^2 / (127 R) (full, ignoring friction)
  for (const [V, R] of [[80, 200], [60, 150]]) {
    const e = (V * V) / (127 * R);
    b.nat("Horizontal Curve — Superelevation", "hard", 2,
      `For a design speed of $${V}\\,\\text{km/h}$ on a curve of radius $${R}\\,\\text{m}$, the superelevation required to fully counteract centrifugal force (no friction) is _____.`,
      e, 0.001,
      sol("$e=\\dfrac{V^2}{127R}$ (V in km/h, R in m).", `$$e=\\dfrac{${V}^2}{127\\times ${R}}=${r(e, 4)}.$$`, `$${r(e, 4)}$`), "C");
  }
  // Traffic flow q = k v
  for (const [k, v] of [[40, 60], [50, 50]]) {
    const q = k * v;
    b.nat("Traffic Flow", "easy", 1,
      `A traffic stream has a density of $${k}\\,\\text{veh/km}$ and a space-mean speed of $${v}\\,\\text{km/h}$. The flow is _____ veh/h.`,
      q, 1,
      sol("Fundamental relation $q=k\\,v$.", `$$q=${k}\\times ${v}=${q}.$$`, `$${q}\\,\\text{veh/h}$`), "A");
  }
  // CBR / pavement concept
  b.mcq("Pavement Design", "medium", 1,
    "The CBR method of flexible pavement design primarily gives the required",
    ["total thickness of pavement", "concrete grade", "joint spacing", "camber"], 0,
    sol("CBR → total pavement thickness above subgrade.", "Total thickness.", "Total pavement thickness"), "B");
  // PCU concept
  b.mcq("Highway Capacity", "easy", 1,
    "Traffic volume is converted to a common unit using",
    ["passenger car units (PCU)", "axle load", "tyre pressure", "design speed"], 0,
    sol("Mixed traffic homogenised using PCU factors.", "PCU.", "Passenger car units"), "B");
  // Rigid pavement — radius of relative stiffness concept
  b.mcq("Rigid Pavement", "medium", 1,
    "In Westergaard's analysis of rigid pavements, the radius of relative stiffness $l$ increases with",
    ["increasing slab thickness", "increasing modulus of subgrade reaction", "decreasing slab modulus", "increasing Poisson's ratio only"], 0,
    sol("$l=\\left[\\dfrac{Eh^3}{12(1-\\mu^2)k}\\right]^{1/4}$ increases with $h$.", "Increases with slab thickness $h$.", "Increasing slab thickness"), "B");
  // Gradient / ruling gradient MSQ
  b.msq("Geometric Design", "hard", 2,
    "Which factors are considered while fixing the ruling gradient of a highway?",
    ["Power of the design vehicle", "Length of the gradient", "Pavement colour", "Speed to be maintained"],
    [0, 1, 3],
    sol("Ruling gradient depends on vehicle power, gradient length and speed; pavement colour is irrelevant.", "Options 1, 2, 4.", "Vehicle power, length, speed"), "D");
  return { slug: "ce-transportation-engineering", name: "Transportation Engineering", questions: b.out };
}

// ═════════════════════════════════════════════════════════════════════
//  14 · GEOMATICS & SURVEYING  (separate bank)
// ═════════════════════════════════════════════════════════════════════
function buildSurveying(): { slug: string; name: string; questions: Q[] } {
  const b = new Builder("ce-sv", "Geomatics & Surveying");
  // Rise & fall / HI level
  b.nat("Levelling", "easy", 1,
    "The reduced level of a benchmark is $100.000\\,\\text{m}$ and the backsight on it is $1.250\\,\\text{m}$. The height of instrument (HI) is _____ m.",
    101.25, 0.001,
    sol("HI $=$ RL of BM $+$ BS.", "$$HI=100.000+1.250=101.250.$$", "$101.250\\,\\text{m}$"), "A");
  // RL of a point
  b.nat("Levelling — RL", "medium", 1,
    "The height of instrument is $101.250\\,\\text{m}$ and the foresight on a point is $0.750\\,\\text{m}$. The reduced level of the point is _____ m.",
    100.5, 0.001,
    sol("RL $=$ HI $-$ FS.", "$$RL=101.250-0.750=100.500.$$", "$100.500\\,\\text{m}$"), "A");
  // Stadia tacheometry D = K S (horizontal sight, K=100)
  for (const [S] of [[1.2], [0.85]]) {
    const D = 100 * S;
    b.nat("Tacheometry", "medium", 2,
      `For a tacheometer with multiplying constant $100$ and additive constant $0$, a staff intercept of $${S}\\,\\text{m}$ on a horizontal sight gives a horizontal distance of _____ m.`,
      D, 0.1,
      sol("$D=KS+C$ with $K=100,\\ C=0$ (horizontal sight).", `$$D=100\\times ${S}=${r(D, 1)}.$$`, `$${r(D, 1)}\\,\\text{m}$`), "A");
  }
  // Bearing conversion
  b.nat("Compass Surveying", "easy", 1,
    "The whole-circle bearing of a line is $210^\\circ$. Its reduced bearing magnitude (in the SW quadrant) is _____ degrees.",
    30, 0.01,
    sol("In the third quadrant, RB $=$ WCB $-180^\\circ$.", "$$RB=210-180=30^\\circ\\ \\text{S}30^\\circ\\text{W}.$$", "$30^\\circ$ (S30°W)"), "A");
  // Curve — length / tangent
  for (const [R, defl] of [[300, 40]]) {
    const L = Math.PI * R * defl / 180;
    b.nat("Curves", "hard", 2,
      `A circular curve of radius $${R}\\,\\text{m}$ has a deflection (central) angle of $${defl}^\\circ$. The length of the curve is _____ m.`,
      L, 0.1,
      sol("$L=\\dfrac{\\pi R \\Delta}{180}$.", `$$L=\\dfrac{\\pi\\times ${R}\\times ${defl}}{180}=${r(L, 2)}.$$`, `$${r(L, 2)}\\,\\text{m}$`), "C");
  }
  // Theodolite least count / total station concept
  b.mcq("Instruments", "easy", 1,
    "A total station combines an electronic theodolite with",
    ["an electronic distance meter (EDM)", "a plane table", "a dumpy level only", "a prismatic compass"], 0,
    sol("Total station = theodolite + EDM + data processor.", "EDM.", "EDM"), "B");
  // GPS / contour MSQ
  b.msq("Modern Surveying", "medium", 2,
    "Which statements about contour lines are correct?",
    ["Contours of different elevations never cross (except at a cliff/overhang)", "Closely spaced contours indicate steep ground", "Contours always form straight lines", "A contour line joins points of equal elevation"],
    [0, 1, 3],
    sol("Contours join equal elevations, crowd on steep ground and don't cross except at overhangs; they are not straight in general.", "Options 1, 2, 4.", "Equal elevation, steep crowding, no crossing"), "D");
  return { slug: "ce-geomatics-surveying", name: "Geomatics & Surveying", questions: b.out };
}

// ───────────────────────── emit ─────────────────────────
const seed = hashSeed("crackgate-ce-practice-v1");
const rand = rng(seed);

const banks = [
  buildMath(rand),
  buildMechanics(),
  buildSolid(),
  buildStructural(),
  buildConstruction(),
  buildConcrete(),
  buildSteel(),
  buildSoil(),
  buildFoundation(),
  buildFluid(),
  buildHydrology(),
  buildEnvironmental(),
  buildTransportation(),
  buildSurveying(),
];

// Pad each bank with bulk parametric (computed-answer) questions for mock-grade volume.
const TARGETS: Record<string, number> = {
  "ce-engineering-mathematics": 60,
  "ce-engineering-mechanics": 55,
  "ce-solid-mechanics": 55,
  "ce-structural-analysis": 45,
  "ce-construction-materials-management": 45,
  "ce-concrete-structures": 40,
  "ce-steel-structures": 45,
  "ce-soil-mechanics": 60,
  "ce-foundation-engineering": 45,
  "ce-fluid-mechanics-hydraulics": 55,
  "ce-hydrology-irrigation": 45,
  "ce-environmental-engineering": 50,
  "ce-transportation-engineering": 50,
  "ce-geomatics-surveying": 45,
};
for (const bank of banks) padBank(bank, rand, TARGETS[bank.slug] ?? 45);

const outDir = resolve(process.cwd(), "apps/web/src/data/questions/practice");
let total = 0;
for (const bank of banks) {
  const file = resolve(outDir, `${bank.slug}.json`);
  writeFileSync(file, JSON.stringify({ slug: bank.slug, name: bank.name, questions: bank.questions }, null, 2) + "\n", "utf8");
  total += bank.questions.length;
  console.log(`✅ ${bank.slug}.json  ${bank.questions.length} Q`);
}
console.log(`\nDone. ${banks.length} banks · ${total} questions.`);
void pick;
