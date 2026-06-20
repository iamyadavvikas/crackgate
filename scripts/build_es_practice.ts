/**
 * CrackGate — GATE Environmental Science & Engineering (ES) practice-bank generator.
 *
 * Emits one JSON file per ES section under
 *   apps/web/src/data/questions/practice/es-<slug>.json
 * in the exact PracticeSubject / PracticeQuestion shape consumed by the app
 * (see apps/web/src/data/practice.ts).
 *
 * Every numerical answer is COMPUTED in code (not transcribed) so the keys are
 * guaranteed self-consistent. Questions are deterministic (seeded RNG) so the
 * bank is reproducible. A parametric SVG figure library keeps a large fraction
 * of questions diagram-based (the figure shows the exact values used in the
 * computation, so it is load-bearing), which lets the downstream mock generator
 * clear the validator's ">=17 figures / mock" bar.
 *
 * Mirrors scripts/build_ce_practice.ts 1:1 in structure.
 *
 * Usage:
 *   npx tsx scripts/build_es_practice.ts
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

// ───────────────────────── question helpers ─────────────────────────
type Diff = "easy" | "medium" | "hard";
type Arch = "A" | "B" | "C" | "D";
type Fig = { kind: "svg"; markup: string; caption?: string };

interface NatQ {
  id: string; subject: string; topic: string; difficulty: Diff; type: "NAT";
  stem: string; answer: number; tolerance: number; solution: string; figure?: Fig; archetype: Arch; marks: 1 | 2;
}
interface McqQ {
  id: string; subject: string; topic: string; difficulty: Diff; type: "MCQ";
  stem: string; options: string[]; answer: number; solution: string; figure?: Fig; archetype: Arch; marks: 1 | 2;
}
interface MsqQ {
  id: string; subject: string; topic: string; difficulty: Diff; type: "MSQ";
  stem: string; options: string[]; answer: number[]; solution: string; figure?: Fig; archetype: Arch; marks: 1 | 2;
}
type Q = NatQ | McqQ | MsqQ;

/** round to n decimals */
const r = (x: number, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

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

/** Build a solution string with concept + working + answer. */
function sol(concept: string, working: string, answer: string) {
  return `**Concept.** ${concept}\n\n**Working.**\n${working}\n\n**Answer.** ${answer}`;
}

function rp<T>(arr: T[], rand: () => number): T { return arr[Math.floor(rand() * arr.length)]; }
function ri(rand: () => number, lo: number, hi: number): number { return lo + Math.floor(rand() * (hi - lo + 1)); }

/* ══════════════════════════════════════════════════════════════════════ */
/*  PARAMETRIC SVG FIGURE LIBRARY                                           */
/*  Each returns a load-bearing diagram whose labels carry the exact data   */
/*  used in the calculation. Markup is self-contained, plain SVG.           */
/* ══════════════════════════════════════════════════════════════════════ */

const AX = "#475569", INK = "#1e293b", BLU = "#2563eb", GRN = "#16a34a", RED = "#dc2626", AMB = "#d97706";

/** Gaussian plume from an elevated stack. */
function figPlume(H: number, u: number, caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 340 200" width="100%" style="max-width:360px;height:auto">` +
    `<line x1="20" y1="170" x2="330" y2="170" stroke="${AX}" stroke-width="1.4"/>` +
    `<rect x="34" y="70" width="14" height="100" fill="#94a3b8" stroke="${INK}"/>` +
    `<text x="41" y="186" font-size="9" text-anchor="middle" fill="${INK}">stack</text>` +
    `<path d="M48 70 Q150 60 330 40 M48 70 Q150 80 330 110" fill="rgba(37,99,235,0.10)" stroke="${BLU}" stroke-width="1.3"/>` +
    `<line x1="41" y1="70" x2="41" y2="170" stroke="${RED}" stroke-width="1" stroke-dasharray="3 2"/>` +
    `<text x="58" y="66" font-size="9" fill="${RED}">H = ${H} m</text>` +
    `<text x="250" y="32" font-size="9" fill="${BLU}">plume (σy, σz grow ↓wind)</text>` +
    `<text x="300" y="166" font-size="9" fill="${INK}">x →</text>` +
    `<text x="150" y="150" font-size="9" fill="${GRN}">u = ${u} m/s</text>` +
    `<path d="M120 148 l18 0 m-4 -3 l4 3 -4 3" stroke="${GRN}" stroke-width="1" fill="none"/>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Elevated point source, effective height H = ${H} m, wind speed u = ${u} m/s.` };
}

/** Streeter–Phelps DO sag curve. */
function figSag(Dc: number, tc: number, caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 340 200" width="100%" style="max-width:360px;height:auto">` +
    `<line x1="34" y1="30" x2="34" y2="175" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="34" y1="175" x2="330" y2="175" stroke="${AX}" stroke-width="1.3"/>` +
    `<text x="8" y="40" font-size="9" fill="${INK}">DO</text>` +
    `<text x="305" y="190" font-size="9" fill="${INK}">distance/time →</text>` +
    `<line x1="34" y1="45" x2="330" y2="45" stroke="${GRN}" stroke-width="1" stroke-dasharray="4 3"/>` +
    `<text x="250" y="42" font-size="8" fill="${GRN}">saturation DO</text>` +
    `<path d="M34 60 Q120 175 175 150 Q260 110 330 70" fill="none" stroke="${BLU}" stroke-width="1.7"/>` +
    `<line x1="175" y1="45" x2="175" y2="150" stroke="${RED}" stroke-width="1" stroke-dasharray="3 2"/>` +
    `<circle cx="175" cy="150" r="3" fill="${RED}"/>` +
    `<text x="180" y="120" font-size="9" fill="${RED}">D_c = ${Dc} mg/L</text>` +
    `<text x="150" y="170" font-size="9" fill="${RED}">t_c = ${tc} d</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Oxygen-sag curve: critical deficit D_c at critical time t_c.` };
}

/** Horizontal-flow sedimentation tank. */
function figSettler(Q: number, A: number, caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 340 170" width="100%" style="max-width:360px;height:auto">` +
    `<rect x="40" y="40" width="250" height="90" fill="rgba(37,99,235,0.08)" stroke="${INK}" stroke-width="1.3"/>` +
    `<path d="M20 60 l20 0 m-5 -3 l5 3 -5 3" stroke="${GRN}" stroke-width="1.2" fill="none"/>` +
    `<text x="14" y="55" font-size="9" fill="${GRN}">Q = ${Q}</text>` +
    `<path d="M290 60 l20 0 m-5 -3 l5 3 -5 3" stroke="${GRN}" stroke-width="1.2" fill="none"/>` +
    `<text x="300" y="55" font-size="9" fill="${GRN}">out</text>` +
    `<line x1="40" y1="48" x2="290" y2="48" stroke="${BLU}" stroke-width="1" stroke-dasharray="3 2"/>` +
    `<circle cx="120" cy="80" r="2" fill="${INK}"/><circle cx="170" cy="100" r="2" fill="${INK}"/><circle cx="210" cy="118" r="2" fill="${INK}"/>` +
    `<path d="M120 86 L132 124 M170 106 L182 126" stroke="#94a3b8" stroke-width="0.8"/>` +
    `<text x="120" y="150" font-size="9" fill="${INK}">plan area A = ${A} m²</text>` +
    `<text x="160" y="36" font-size="8" fill="${BLU}">surface (overflow)</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Settling tank: flow Q, plan area A; overflow rate = Q/A.` };
}

/** ESP plate schematic for Deutsch–Anderson. */
function figESP(A: number, w: number, caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 340 170" width="100%" style="max-width:360px;height:auto">` +
    `<rect x="40" y="30" width="260" height="110" fill="none" stroke="${INK}" stroke-width="1.2"/>` +
    `<line x1="80" y1="30" x2="80" y2="140" stroke="#94a3b8" stroke-width="3"/>` +
    `<line x1="150" y1="30" x2="150" y2="140" stroke="#94a3b8" stroke-width="3"/>` +
    `<line x1="220" y1="30" x2="220" y2="140" stroke="#94a3b8" stroke-width="3"/>` +
    `<line x1="115" y1="35" x2="115" y2="135" stroke="${RED}" stroke-width="1" stroke-dasharray="2 2"/>` +
    `<line x1="185" y1="35" x2="185" y2="135" stroke="${RED}" stroke-width="1" stroke-dasharray="2 2"/>` +
    `<path d="M14 70 l22 0 m-6 -3 l6 3 -6 3" stroke="${GRN}" stroke-width="1.2" fill="none"/>` +
    `<text x="6" y="64" font-size="9" fill="${GRN}">gas in</text>` +
    `<text x="60" y="158" font-size="9" fill="${INK}">collecting area A = ${A} m²</text>` +
    `<text x="150" y="22" font-size="9" fill="${RED}">w = ${w} m/s (drift)</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Electrostatic precipitator: collection area A, drift velocity w.` };
}

/** Trophic energy pyramid (10% law). */
function figPyramid(base: number, caption?: string): Fig {
  const l1 = base, l2 = base / 10, l3 = base / 100, l4 = base / 1000;
  const markup =
    `<svg viewBox="0 0 320 180" width="100%" style="max-width:340px;height:auto">` +
    `<polygon points="40,150 280,150 240,118 80,118" fill="${GRN}" stroke="${INK}"/>` +
    `<polygon points="80,118 240,118 205,86 115,86" fill="#65a30d" stroke="${INK}"/>` +
    `<polygon points="115,86 205,86 178,54 142,54" fill="${AMB}" stroke="${INK}"/>` +
    `<polygon points="142,54 178,54 165,30 155,30" fill="${RED}" stroke="${INK}"/>` +
    `<text x="160" y="142" font-size="9" text-anchor="middle" fill="#fff">Producers ${l1}</text>` +
    `<text x="160" y="110" font-size="8" text-anchor="middle" fill="#fff">Primary ${r(l2,1)}</text>` +
    `<text x="160" y="78" font-size="8" text-anchor="middle" fill="#fff">Secondary ${r(l3,2)}</text>` +
    `<text x="160" y="46" font-size="7" text-anchor="middle" fill="#fff">Tert ${r(l4,3)}</text>` +
    `<text x="160" y="172" font-size="9" text-anchor="middle" fill="${INK}">energy units (kcal/m²/yr) — 10% transfer</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Ecological energy pyramid; ~10% transferred per trophic level.` };
}

/** Logistic population growth S-curve. */
function figLogistic(K: number, caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 320 190" width="100%" style="max-width:340px;height:auto">` +
    `<line x1="34" y1="20" x2="34" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="34" y1="165" x2="305" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="34" y1="40" x2="305" y2="40" stroke="${RED}" stroke-width="1" stroke-dasharray="4 3"/>` +
    `<text x="240" y="36" font-size="9" fill="${RED}">K = ${K}</text>` +
    `<path d="M34 158 C120 156 150 80 175 60 C210 44 260 41 305 40" fill="none" stroke="${BLU}" stroke-width="1.8"/>` +
    `<text x="10" y="30" font-size="9" fill="${INK}">N</text>` +
    `<text x="285" y="180" font-size="9" fill="${INK}">time →</text>` +
    `<text x="120" y="120" font-size="8" fill="${GRN}">max dN/dt at N=K/2</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Logistic growth toward carrying capacity K.` };
}

/** Sanitary landfill cross-section. */
function figLandfill(caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 340 180" width="100%" style="max-width:360px;height:auto">` +
    `<rect x="30" y="30" width="280" height="120" fill="none" stroke="${INK}" stroke-width="1.2"/>` +
    `<rect x="30" y="40" width="280" height="86" fill="#a16207" opacity="0.5"/>` +
    `<rect x="30" y="30" width="280" height="10" fill="#65a30d"/>` +
    `<rect x="30" y="126" width="280" height="14" fill="#1e3a8a" opacity="0.6"/>` +
    `<rect x="30" y="140" width="280" height="10" fill="#0f172a"/>` +
    `<text x="170" y="26" font-size="8" text-anchor="middle" fill="${GRN}">final cover / vegetation</text>` +
    `<text x="170" y="86" font-size="9" text-anchor="middle" fill="#fff">compacted MSW + daily cover</text>` +
    `<text x="170" y="137" font-size="8" text-anchor="middle" fill="#fff">leachate collection</text>` +
    `<text x="170" y="148" font-size="7" text-anchor="middle" fill="#fff">composite liner (clay+HDPE)</text>` +
    `<path d="M315 60 q14 0 14 14 q0 10 -8 18" stroke="${RED}" stroke-width="1.2" fill="none"/>` +
    `<text x="318" y="56" font-size="8" fill="${RED}">gas vent</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Engineered sanitary landfill: cover, waste cell, liner and leachate system.` };
}

/** Activated-sludge process flow (aeration + clarifier + recycle). */
function figASP(caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 350 180" width="100%" style="max-width:360px;height:auto">` +
    `<rect x="60" y="40" width="110" height="70" fill="rgba(37,99,235,0.08)" stroke="${INK}"/>` +
    `<text x="115" y="78" font-size="9" text-anchor="middle" fill="${INK}">Aeration</text>` +
    `<text x="115" y="92" font-size="8" text-anchor="middle" fill="${INK}">MLSS, V</text>` +
    `<circle cx="240" cy="75" r="34" fill="rgba(22,163,74,0.10)" stroke="${INK}"/>` +
    `<text x="240" y="72" font-size="8" text-anchor="middle" fill="${INK}">Clarifier</text>` +
    `<path d="M20 70 l40 0" stroke="${GRN}" stroke-width="1.3"/><text x="22" y="62" font-size="8" fill="${GRN}">Q, S0</text>` +
    `<path d="M170 70 l36 0" stroke="${GRN}" stroke-width="1.3"/>` +
    `<path d="M274 70 l44 0" stroke="${GRN}" stroke-width="1.3"/><text x="290" y="62" font-size="8" fill="${GRN}">Qe, Se</text>` +
    `<path d="M240 109 l0 36 -180 0 0 -35" stroke="${RED}" stroke-width="1.2" fill="none" stroke-dasharray="4 3"/>` +
    `<text x="120" y="158" font-size="8" fill="${RED}">return sludge Qr</text>` +
    `<path d="M250 140 l40 0" stroke="#7c2d12" stroke-width="1.2"/><text x="255" y="135" font-size="8" fill="#7c2d12">waste Qw</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Activated-sludge: aeration basin, secondary clarifier, sludge recycle.` };
}

/** Atmospheric temperature profile / lapse rate stability. */
function figLapse(stability: string, caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 320 190" width="100%" style="max-width:340px;height:auto">` +
    `<line x1="40" y1="20" x2="40" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="40" y1="165" x2="300" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<text x="10" y="28" font-size="9" fill="${INK}">altitude</text>` +
    `<text x="245" y="182" font-size="9" fill="${INK}">temperature →</text>` +
    `<line x1="120" y1="160" x2="220" y2="30" stroke="${AX}" stroke-width="1.3" stroke-dasharray="5 3"/>` +
    `<text x="222" y="34" font-size="8" fill="${AX}">DALR (dry adiabatic)</text>` +
    `<line x1="150" y1="160" x2="200" y2="30" stroke="${RED}" stroke-width="1.6"/>` +
    `<text x="172" y="50" font-size="8" fill="${RED}">ELR (${stability})</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Environmental lapse rate vs. dry adiabatic lapse rate — ${stability} atmosphere.` };
}

/** Breakpoint chlorination curve. */
function figBreakpoint(caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 330 190" width="100%" style="max-width:350px;height:auto">` +
    `<line x1="38" y1="20" x2="38" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="38" y1="165" x2="312" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<text x="6" y="30" font-size="8" fill="${INK}">residual</text>` +
    `<text x="240" y="182" font-size="9" fill="${INK}">Cl₂ dose →</text>` +
    `<path d="M38 165 L95 120 L150 150 L200 158 L300 70" fill="none" stroke="${BLU}" stroke-width="1.7"/>` +
    `<line x1="200" y1="60" x2="200" y2="165" stroke="${RED}" stroke-width="1" stroke-dasharray="3 2"/>` +
    `<text x="178" y="55" font-size="8" fill="${RED}">breakpoint</text>` +
    `<text x="95" y="112" font-size="7" fill="${INK}">combined</text>` +
    `<text x="255" y="80" font-size="7" fill="${GRN}">free residual</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Breakpoint chlorination: residual vs. applied dose.` };
}

/** Simple labelled bar/flow for material balance (waste composition / removal). */
function figRemoval(inVal: number, outVal: number, label: string, unit: string, caption?: string): Fig {
  const hIn = Math.max(8, Math.min(120, inVal / Math.max(inVal, outVal) * 120));
  const hOut = Math.max(4, Math.min(120, outVal / Math.max(inVal, outVal) * 120));
  const markup =
    `<svg viewBox="0 0 300 180" width="100%" style="max-width:320px;height:auto">` +
    `<line x1="40" y1="150" x2="280" y2="150" stroke="${AX}" stroke-width="1.3"/>` +
    `<rect x="70" y="${150 - hIn}" width="46" height="${hIn}" fill="${RED}" opacity="0.75"/>` +
    `<text x="93" y="${146 - hIn}" font-size="9" text-anchor="middle" fill="${RED}">in ${inVal}</text>` +
    `<rect x="190" y="${150 - hOut}" width="46" height="${hOut}" fill="${GRN}" opacity="0.8"/>` +
    `<text x="213" y="${146 - hOut}" font-size="9" text-anchor="middle" fill="${GRN}">out ${outVal}</text>` +
    `<text x="160" y="170" font-size="9" text-anchor="middle" fill="${INK}">${label} (${unit})</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `${label}: influent vs. effluent (${unit}).` };
}

/** Microbial growth curve (Monod / batch). */
function figGrowth(caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 330 180" width="100%" style="max-width:350px;height:auto">` +
    `<line x1="38" y1="18" x2="38" y2="158" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="38" y1="158" x2="312" y2="158" stroke="${AX}" stroke-width="1.3"/>` +
    `<text x="6" y="28" font-size="8" fill="${INK}">ln X</text>` +
    `<text x="270" y="174" font-size="9" fill="${INK}">time →</text>` +
    `<path d="M38 150 L80 148 L150 60 L230 40 L300 95" fill="none" stroke="${GRN}" stroke-width="1.7"/>` +
    `<text x="50" y="142" font-size="7" fill="${INK}">lag</text>` +
    `<text x="105" y="100" font-size="7" fill="${GRN}">log (μ_max)</text>` +
    `<text x="215" y="34" font-size="7" fill="${INK}">stationary</text>` +
    `<text x="278" y="110" font-size="7" fill="${RED}">death</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Batch microbial growth curve.` };
}

/** Cyclone separator schematic. */
function figCyclone(caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 280 200" width="100%" style="max-width:300px;height:auto">` +
    `<path d="M70 40 L210 40 L210 110 L165 175 L115 175 L70 110 Z" fill="rgba(37,99,235,0.06)" stroke="${INK}" stroke-width="1.3"/>` +
    `<rect x="120" y="20" width="40" height="22" fill="#fff" stroke="${INK}"/>` +
    `<text x="140" y="16" font-size="8" text-anchor="middle" fill="${INK}">clean gas out</text>` +
    `<path d="M40 55 l30 0" stroke="${GRN}" stroke-width="1.3"/><text x="6" y="50" font-size="8" fill="${GRN}">dusty in</text>` +
    `<path d="M150 50 q30 25 -8 50 q-34 18 6 45" stroke="${RED}" stroke-width="1.1" fill="none"/>` +
    `<text x="130" y="190" font-size="8" text-anchor="middle" fill="#7c2d12">dust hopper</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Reverse-flow cyclone separator (vortex collects particulates).` };
}

/** Strong-acid / strong-base titration (pH vs. titrant). */
function figTitration(caption?: string): Fig {
  const markup =
    `<svg viewBox="0 0 320 190" width="100%" style="max-width:340px;height:auto">` +
    `<line x1="38" y1="18" x2="38" y2="160" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="38" y1="160" x2="305" y2="160" stroke="${AX}" stroke-width="1.3"/>` +
    `<text x="14" y="28" font-size="9" fill="${INK}">pH</text>` +
    `<text x="240" y="178" font-size="9" fill="${INK}">titrant added →</text>` +
    `<line x1="38" y1="89" x2="305" y2="89" stroke="${GRN}" stroke-width="0.8" stroke-dasharray="3 3"/>` +
    `<text x="42" y="86" font-size="7" fill="${GRN}">pH 7</text>` +
    `<path d="M38 150 C120 146 160 140 168 89 C176 38 230 32 305 28" fill="none" stroke="${BLU}" stroke-width="1.8"/>` +
    `<circle cx="168" cy="89" r="3" fill="${RED}"/>` +
    `<text x="118" y="70" font-size="8" fill="${RED}">equivalence pt</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Titration curve: sharp pH jump at the equivalence point.` };
}

/** pH scale marker. */
function figpHScale(pH: number, caption?: string): Fig {
  const x = 30 + (Math.max(0, Math.min(14, pH)) / 14) * 260;
  const markup =
    `<svg viewBox="0 0 320 90" width="100%" style="max-width:340px;height:auto">` +
    `<defs><linearGradient id="ph" x1="0" x2="1"><stop offset="0" stop-color="#dc2626"/><stop offset="0.5" stop-color="#16a34a"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs>` +
    `<rect x="30" y="34" width="260" height="20" fill="url(#ph)" stroke="${INK}"/>` +
    `<text x="30" y="68" font-size="9" fill="${INK}">0 (acidic)</text>` +
    `<text x="150" y="68" font-size="9" text-anchor="middle" fill="${INK}">7</text>` +
    `<text x="290" y="68" font-size="9" text-anchor="end" fill="${INK}">14 (basic)</text>` +
    `<polygon points="${x},28 ${r(x - 5, 1)},18 ${r(x + 5, 1)},18" fill="${INK}"/>` +
    `<text x="${x}" y="14" font-size="9" text-anchor="middle" fill="${INK}">pH ≈ ${r(pH, 1)}</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: caption ?? `Position on the 0–14 pH scale.` };
}

/** EIA process flow. */
function figEIA(caption?: string): Fig {
  const steps = ["Screening", "Scoping", "Impact\nprediction", "EMP", "Review &\nclearance"];
  let g = `<svg viewBox="0 0 360 90" width="100%" style="max-width:360px;height:auto">`;
  steps.forEach((s, i) => {
    const x = 8 + i * 70;
    g += `<rect x="${x}" y="28" width="60" height="34" rx="4" fill="rgba(37,99,235,0.08)" stroke="${INK}"/>`;
    const lines = s.split("\n");
    lines.forEach((ln, j) => { g += `<text x="${x + 30}" y="${lines.length === 1 ? 49 : 44 + j * 11}" font-size="8" text-anchor="middle" fill="${INK}">${ln}</text>`; });
    if (i < steps.length - 1) g += `<path d="M${x + 60} 45 l10 0 m-4 -3 l4 3 -4 3" stroke="${GRN}" stroke-width="1.1" fill="none"/>`;
  });
  g += `</svg>`;
  return { kind: "svg", markup: g, caption: caption ?? `Sequential stages of the EIA process.` };
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  LOAD-BEARING FIGURE LIBRARY                                             */
/*  These carry REQUIRED data ONLY on the diagram; the matching stem OMITS   */
/*  it, so the question is unsolvable without reading the figure. Every      */
/*  caption carries the LB_TAG sentinel so the share of load-bearing         */
/*  figures per paper can be audited (grep the mock JSON for LB_TAG).        */
/* ══════════════════════════════════════════════════════════════════════ */
const LB_TAG = "(read values from the figure)";
const lbCap = (s: string) => `${s} ${LB_TAG}`;

/** Plume carrying H, u, σy, σz on the diagram only. */
function figPlumeLB(H: number, u: number, sy: number, sz: number): Fig {
  const markup =
    `<svg viewBox="0 0 360 210" width="100%" style="max-width:380px;height:auto">` +
    `<line x1="20" y1="175" x2="350" y2="175" stroke="${AX}" stroke-width="1.4"/>` +
    `<rect x="34" y="75" width="14" height="100" fill="#94a3b8" stroke="${INK}"/>` +
    `<text x="41" y="191" font-size="9" text-anchor="middle" fill="${INK}">stack</text>` +
    `<path d="M48 75 Q160 64 350 44 M48 75 Q160 86 350 116" fill="rgba(37,99,235,0.10)" stroke="${BLU}" stroke-width="1.3"/>` +
    `<line x1="41" y1="75" x2="41" y2="175" stroke="${RED}" stroke-width="1" stroke-dasharray="3 2"/>` +
    `<text x="54" y="70" font-size="10" fill="${RED}">H = ${H} m</text>` +
    `<path d="M118 148 l20 0 m-5 -3 l5 3 -5 3" stroke="${GRN}" stroke-width="1.1" fill="none"/>` +
    `<text x="142" y="151" font-size="10" fill="${GRN}">u = ${u} m/s</text>` +
    `<text x="206" y="40" font-size="10" fill="${BLU}">σ_y = ${sy} m,  σ_z = ${sz} m</text>` +
    `<text x="318" y="171" font-size="9" fill="${INK}">x →</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Elevated point source: H, u, σ_y and σ_z are marked on the diagram only.`) };
}

/** Physical stack height h_s and plume rise Δh on the diagram only. */
function figStackLB(hs: number, dh: number): Fig {
  const markup =
    `<svg viewBox="0 0 320 220" width="100%" style="max-width:340px;height:auto">` +
    `<line x1="20" y1="185" x2="300" y2="185" stroke="${AX}" stroke-width="1.4"/>` +
    `<rect x="60" y="85" width="16" height="100" fill="#94a3b8" stroke="${INK}"/>` +
    `<line x1="68" y1="85" x2="68" y2="42" stroke="${BLU}" stroke-width="1.2" stroke-dasharray="3 2"/>` +
    `<circle cx="68" cy="42" r="3" fill="${BLU}"/>` +
    `<line x1="40" y1="185" x2="40" y2="85" stroke="${RED}" stroke-width="1"/>` +
    `<text x="6" y="138" font-size="10" fill="${RED}">h_s = ${hs} m</text>` +
    `<line x1="92" y1="85" x2="92" y2="42" stroke="${GRN}" stroke-width="1"/>` +
    `<text x="98" y="66" font-size="10" fill="${GRN}">Δh = ${dh} m</text>` +
    `<text x="150" y="36" font-size="9" fill="${BLU}">plume centreline</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Physical stack height h_s and plume rise Δh marked on the diagram only.`) };
}

/** Energy pyramid with ONLY the producer (trophic-1) energy given. */
function figPyramidLB(base: number): Fig {
  const markup =
    `<svg viewBox="0 0 320 180" width="100%" style="max-width:340px;height:auto">` +
    `<polygon points="40,150 280,150 240,118 80,118" fill="${GRN}" stroke="${INK}"/>` +
    `<polygon points="80,118 240,118 205,86 115,86" fill="#65a30d" stroke="${INK}"/>` +
    `<polygon points="115,86 205,86 178,54 142,54" fill="${AMB}" stroke="${INK}"/>` +
    `<polygon points="142,54 178,54 165,30 155,30" fill="${RED}" stroke="${INK}"/>` +
    `<text x="160" y="142" font-size="9" text-anchor="middle" fill="#fff">Producers = ${base}</text>` +
    `<text x="160" y="110" font-size="8" text-anchor="middle" fill="#fff">L2 = ?</text>` +
    `<text x="160" y="78" font-size="8" text-anchor="middle" fill="#fff">L3 = ?</text>` +
    `<text x="160" y="46" font-size="7" text-anchor="middle" fill="#fff">L4 = ?</text>` +
    `<text x="160" y="172" font-size="9" text-anchor="middle" fill="${INK}">kcal/m²/yr — 10% transfer per level</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Only the producer (trophic level 1) energy is marked; upper levels follow the 10% rule.`) };
}

/** Exponential growth curve labelling only N0 at t = 0. */
function figExpLB(N0: number): Fig {
  const markup =
    `<svg viewBox="0 0 320 190" width="100%" style="max-width:340px;height:auto">` +
    `<line x1="40" y1="20" x2="40" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="40" y1="165" x2="300" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<path d="M40 150 C120 145 180 120 230 80 C260 55 285 35 300 25" fill="none" stroke="${BLU}" stroke-width="1.8"/>` +
    `<circle cx="40" cy="150" r="3" fill="${RED}"/>` +
    `<text x="46" y="146" font-size="10" fill="${RED}">N₀ = ${N0}</text>` +
    `<text x="14" y="30" font-size="9" fill="${INK}">N</text>` +
    `<text x="278" y="180" font-size="9" fill="${INK}">time →</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Initial population N₀ marked on the curve at t = 0.`) };
}

/** Logistic curve (carrying capacity K labelled) — LB wrapper. */
function figLogisticLB(K: number): Fig {
  return figLogistic(K, lbCap(`Carrying capacity K marked on the growth curve only.`));
}

/** Depth–time settling-column trajectory; v_s = depth ÷ time. */
function figSettleColLB(depthM: number, timeS: number): Fig {
  const markup =
    `<svg viewBox="0 0 330 200" width="100%" style="max-width:350px;height:auto">` +
    `<line x1="46" y1="20" x2="46" y2="170" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="46" y1="20" x2="300" y2="20" stroke="${AX}" stroke-width="1.3"/>` +
    `<text x="6" y="100" font-size="9" fill="${INK}">depth ↓</text>` +
    `<text x="252" y="14" font-size="9" fill="${INK}">time →</text>` +
    `<line x1="46" y1="20" x2="270" y2="150" stroke="${BLU}" stroke-width="1.8"/>` +
    `<circle cx="270" cy="150" r="3" fill="${RED}"/>` +
    `<line x1="270" y1="20" x2="270" y2="150" stroke="${GRN}" stroke-width="0.8" stroke-dasharray="3 2"/>` +
    `<line x1="46" y1="150" x2="270" y2="150" stroke="${GRN}" stroke-width="0.8" stroke-dasharray="3 2"/>` +
    `<text x="150" y="14" font-size="9" fill="${GRN}">t = ${timeS} s</text>` +
    `<text x="118" y="165" font-size="9" fill="${RED}">settles ${depthM} m</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Particle settles the marked depth in the marked time; v_s = depth ÷ time.`) };
}

/** Breakpoint-chlorination curve with the breakpoint dose marked on the x-axis. */
function figBreakpointLB(dose: number): Fig {
  const markup =
    `<svg viewBox="0 0 330 195" width="100%" style="max-width:350px;height:auto">` +
    `<line x1="38" y1="20" x2="38" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="38" y1="165" x2="312" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<text x="4" y="30" font-size="8" fill="${INK}">residual</text>` +
    `<text x="232" y="182" font-size="9" fill="${INK}">Cl₂ dose (mg/L) →</text>` +
    `<path d="M38 165 L95 120 L150 150 L205 160 L300 80" fill="none" stroke="${BLU}" stroke-width="1.7"/>` +
    `<line x1="205" y1="55" x2="205" y2="165" stroke="${RED}" stroke-width="1" stroke-dasharray="3 2"/>` +
    `<circle cx="205" cy="160" r="3" fill="${RED}"/>` +
    `<text x="170" y="50" font-size="9" fill="${RED}">breakpoint</text>` +
    `<text x="186" y="178" font-size="9" fill="${RED}">${dose}</text>` +
    `<text x="250" y="92" font-size="7" fill="${GRN}">free residual</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Breakpoint dose marked on the x-axis only.`) };
}

/** Stokes settling: particle diameter on the diagram only. */
function figStokesLB(dmm: number): Fig {
  const markup =
    `<svg viewBox="0 0 300 180" width="100%" style="max-width:320px;height:auto">` +
    `<rect x="60" y="20" width="180" height="140" fill="rgba(37,99,235,0.06)" stroke="${INK}"/>` +
    `<circle cx="150" cy="66" r="12" fill="#94a3b8" stroke="${INK}"/>` +
    `<line x1="138" y1="66" x2="162" y2="66" stroke="${RED}" stroke-width="1"/>` +
    `<text x="168" y="70" font-size="10" fill="${RED}">d = ${dmm} mm</text>` +
    `<path d="M150 82 l0 52 m-4 -6 l4 6 4 -6" stroke="${GRN}" stroke-width="1.1" fill="none"/>` +
    `<text x="158" y="118" font-size="9" fill="${GRN}">v_s</text>` +
    `<text x="150" y="174" font-size="8" text-anchor="middle" fill="${INK}">ρ_s = 2650 kg/m³, water μ = 10⁻³ Pa·s</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Particle diameter marked on the diagram only.`) };
}

/** Strong acid–base titration; equivalence-point volume marked on x-axis. */
function figTitrationLB(Veq: number): Fig {
  const markup =
    `<svg viewBox="0 0 320 195" width="100%" style="max-width:340px;height:auto">` +
    `<line x1="40" y1="18" x2="40" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="40" y1="165" x2="305" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<text x="16" y="28" font-size="9" fill="${INK}">pH</text>` +
    `<text x="220" y="182" font-size="9" fill="${INK}">titrant volume (mL) →</text>` +
    `<path d="M40 150 C120 146 160 140 168 92 C176 44 230 36 305 30" fill="none" stroke="${BLU}" stroke-width="1.8"/>` +
    `<line x1="168" y1="30" x2="168" y2="165" stroke="${RED}" stroke-width="1" stroke-dasharray="3 2"/>` +
    `<circle cx="168" cy="92" r="3" fill="${RED}"/>` +
    `<text x="118" y="70" font-size="8" fill="${RED}">equivalence</text>` +
    `<text x="158" y="178" font-size="9" fill="${RED}">${Veq}</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Equivalence-point titrant volume marked on the x-axis only.`) };
}

/** Saturation (Monod / Michaelis–Menten) curve with plateau and half-saturation labelled. */
function figSatCurve(vmax: number, kHalf: number, vLabel: string, kLabel: string, what: string): Fig {
  const markup =
    `<svg viewBox="0 0 330 195" width="100%" style="max-width:350px;height:auto">` +
    `<line x1="44" y1="20" x2="44" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<line x1="44" y1="165" x2="312" y2="165" stroke="${AX}" stroke-width="1.3"/>` +
    `<text x="240" y="182" font-size="9" fill="${INK}">substrate [S] →</text>` +
    `<line x1="44" y1="40" x2="312" y2="40" stroke="${RED}" stroke-width="1" stroke-dasharray="4 3"/>` +
    `<text x="232" y="36" font-size="10" fill="${RED}">${vLabel} = ${vmax}</text>` +
    `<path d="M44 165 C90 110 140 70 200 56 C250 46 290 42 312 41" fill="none" stroke="${BLU}" stroke-width="1.8"/>` +
    `<line x1="44" y1="102" x2="120" y2="102" stroke="${GRN}" stroke-width="0.8" stroke-dasharray="3 2"/>` +
    `<line x1="120" y1="102" x2="120" y2="165" stroke="${GRN}" stroke-width="0.8" stroke-dasharray="3 2"/>` +
    `<text x="14" y="106" font-size="7" fill="${GRN}">${vLabel}/2</text>` +
    `<text x="98" y="178" font-size="10" fill="${GRN}">${kLabel} = ${kHalf}</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`${what}: ${vLabel} (plateau) and ${kLabel} (half-saturation) marked on the curve only.`) };
}
function figMonodLB(umax: number, Ks: number): Fig { return figSatCurve(umax, Ks, "μ_max", "K_s", "Monod μ–S curve"); }
function figMMLB(Vmax: number, Km: number): Fig { return figSatCurve(Vmax, Km, "V_max", "K_m", "Michaelis–Menten curve"); }

/** Beaker showing only the initial concentration C0. */
function figConc0LB(C0: number): Fig {
  const h = Math.max(10, Math.min(120, C0 / 2));
  const markup =
    `<svg viewBox="0 0 300 170" width="100%" style="max-width:300px;height:auto">` +
    `<rect x="120" y="${150 - h}" width="60" height="${h}" fill="${BLU}" opacity="0.25" stroke="${INK}"/>` +
    `<rect x="120" y="30" width="60" height="120" fill="none" stroke="${INK}" stroke-width="1.3"/>` +
    `<text x="150" y="22" font-size="9" text-anchor="middle" fill="${INK}">t = 0</text>` +
    `<text x="150" y="96" font-size="11" text-anchor="middle" fill="${BLU}">C₀ = ${C0}</text>` +
    `<text x="150" y="164" font-size="8" text-anchor="middle" fill="${INK}">mg/L</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Initial concentration C₀ marked on the diagram only.`) };
}

/** Cash-flow diagram: future benefit F at year n. */
function figPWLB(F: number, n: number): Fig {
  const markup =
    `<svg viewBox="0 0 330 150" width="100%" style="max-width:350px;height:auto">` +
    `<line x1="30" y1="100" x2="310" y2="100" stroke="${AX}" stroke-width="1.4"/>` +
    `<text x="30" y="118" font-size="9" fill="${INK}">0</text>` +
    `<line x1="290" y1="100" x2="290" y2="48" stroke="${GRN}" stroke-width="1.6"/>` +
    `<path d="M290 46 l-5 9 10 0 z" fill="${GRN}"/>` +
    `<text x="290" y="40" font-size="10" text-anchor="middle" fill="${GRN}">F = ₹${F.toLocaleString("en-IN")}</text>` +
    `<text x="290" y="118" font-size="9" text-anchor="middle" fill="${INK}">year ${n}</text>` +
    `<text x="165" y="118" font-size="8" text-anchor="middle" fill="${INK}">time (years) →</text>` +
    `<text x="42" y="60" font-size="10" fill="${RED}">PW = ?</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Future benefit F and its time horizon n marked on the cash-flow diagram only.`) };
}

/** Two labelled bars (read both values off the chart). */
function figBars2LB(v1: number, v2: number, l1: string, l2: string, unit: string, caption: string): Fig {
  const mx = Math.max(v1, v2) || 1;
  const h1 = Math.max(6, v1 / mx * 120), h2 = Math.max(6, v2 / mx * 120);
  const markup =
    `<svg viewBox="0 0 300 188" width="100%" style="max-width:320px;height:auto">` +
    `<line x1="40" y1="150" x2="280" y2="150" stroke="${AX}" stroke-width="1.3"/>` +
    `<rect x="80" y="${r(150 - h1, 1)}" width="50" height="${r(h1, 1)}" fill="${BLU}" opacity="0.8"/>` +
    `<text x="105" y="${r(146 - h1, 1)}" font-size="10" text-anchor="middle" fill="${BLU}">${v1}</text>` +
    `<text x="105" y="164" font-size="8" text-anchor="middle" fill="${INK}">${l1}</text>` +
    `<rect x="180" y="${r(150 - h2, 1)}" width="50" height="${r(h2, 1)}" fill="${GRN}" opacity="0.85"/>` +
    `<text x="205" y="${r(146 - h2, 1)}" font-size="10" text-anchor="middle" fill="${GRN}">${v2}</text>` +
    `<text x="205" y="164" font-size="8" text-anchor="middle" fill="${INK}">${l2}</text>` +
    `<text x="160" y="182" font-size="8" text-anchor="middle" fill="${INK}">${unit}</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(caption) };
}

/** Three labelled mass bars (read all three off the chart). */
function figBars3LB(vals: number[], labels: string[], unit: string, caption: string): Fig {
  const mx = Math.max(...vals) || 1;
  let g = `<svg viewBox="0 0 320 188" width="100%" style="max-width:340px;height:auto">` +
    `<line x1="36" y1="150" x2="304" y2="150" stroke="${AX}" stroke-width="1.3"/>`;
  vals.forEach((v, i) => {
    const x = 60 + i * 82;
    const h = Math.max(6, v / mx * 120);
    g += `<rect x="${x}" y="${r(150 - h, 1)}" width="46" height="${r(h, 1)}" fill="${BLU}" opacity="0.8"/>`;
    g += `<text x="${x + 23}" y="${r(146 - h, 1)}" font-size="10" text-anchor="middle" fill="${BLU}">${v}</text>`;
    g += `<text x="${x + 23}" y="164" font-size="8" text-anchor="middle" fill="${INK}">${labels[i]}</text>`;
  });
  g += `<text x="170" y="182" font-size="8" text-anchor="middle" fill="${INK}">${unit}</text></svg>`;
  return { kind: "svg", markup: g, caption: lbCap(caption) };
}

/** GWP factor box (read the GWP off the diagram). */
function figGWPLB(gwp: number, gas: string): Fig {
  const markup =
    `<svg viewBox="0 0 300 130" width="100%" style="max-width:300px;height:auto">` +
    `<rect x="40" y="36" width="220" height="56" rx="6" fill="rgba(217,119,6,0.12)" stroke="${INK}"/>` +
    `<text x="150" y="58" font-size="11" text-anchor="middle" fill="${INK}">${gas}</text>` +
    `<text x="150" y="80" font-size="12" text-anchor="middle" fill="${RED}">GWP₁₀₀ = ${gwp}</text>` +
    `<text x="150" y="112" font-size="8" text-anchor="middle" fill="${INK}">CO₂-e = mass × GWP</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Global-warming potential of ${gas} marked on the diagram only.`) };
}

/** Landfill with usable air-space and annual fill rate marked. */
function figLandfillLB(cap: number, rate: number): Fig {
  const markup =
    `<svg viewBox="0 0 340 180" width="100%" style="max-width:360px;height:auto">` +
    `<rect x="30" y="30" width="280" height="120" fill="none" stroke="${INK}" stroke-width="1.2"/>` +
    `<rect x="30" y="40" width="280" height="100" fill="#a16207" opacity="0.45"/>` +
    `<rect x="30" y="30" width="280" height="10" fill="#65a30d"/>` +
    `<text x="170" y="86" font-size="10" text-anchor="middle" fill="#fff">air-space = ${cap.toLocaleString("en-IN")} m³</text>` +
    `<text x="170" y="108" font-size="9" text-anchor="middle" fill="#fff">fill rate = ${rate.toLocaleString("en-IN")} m³/yr</text>` +
    `<text x="170" y="166" font-size="8" text-anchor="middle" fill="${INK}">design life = air-space ÷ fill rate</text>` +
    `</svg>`;
  return { kind: "svg", markup, caption: lbCap(`Landfill air-space and annual fill rate marked on the diagram only.`) };
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  SECTION BUILDERS (curated seeds)                                        */
/* ══════════════════════════════════════════════════════════════════════ */

// 1 · ENVIRONMENTAL MANAGEMENT & ETHICS
function buildManagement(rand: () => number) {
  const b = new Builder("es-mgmt", "Environmental Management & Ethics");
  // EIA concept
  b.mcq("EIA", "easy", 1,
    "In Environmental Impact Assessment, the systematic process of narrowing down to the significant impacts that need detailed study is called",
    ["scoping", "screening", "monitoring", "auditing"], 0,
    sol("Screening decides *whether* an EIA is needed; **scoping** identifies the significant issues to study in depth.", "Scoping = focusing on key impacts.", "Scoping"), "B", figEIA());
  b.mcq("EIA", "medium", 1,
    "Which statement about the EIA process in India is correct?",
    ["Public consultation is a mandatory stage for Category A projects", "EIA is optional for all projects", "EMP is prepared before screening", "Scoping precedes the identification of the project"], 0,
    sol("Public consultation (public hearing + written responses) is a statutory stage for most Category A and B1 projects under EIA Notification 2006.", "Public hearing is mandatory.", "Public consultation is mandatory"), "B", figEIA());
  // Sustainability / carrying capacity NAT
  for (const [P, cc] of [[80000, 100000], [120000, 150000]]) {
    const pct = P / cc * 100;
    b.nat("Carrying Capacity", "easy", 1,
      `Read the region's present population and its ecological carrying capacity from the bar chart. The fraction of carrying capacity utilised is _____ %.`,
      pct, 0.1,
      sol("Utilisation $=\\dfrac{\\text{population}}{\\text{carrying capacity}}\\times100$, with both values read from the bars.", `$$\\dfrac{${P}}{${cc}}\\times100=${r(pct, 1)}\\%.$$`, `$${r(pct, 1)}\\%$`), "A", figBars2LB(P, cc, "population", "carrying capacity", "persons", "Present population and carrying capacity shown on the bars only."));
  }
  // Environmental economics — present worth / discounting
  for (const [C, i, n] of [[100000, 0.08, 5], [50000, 0.1, 3]]) {
    const pw = C / (1 + i) ** n;
    b.nat("Environmental Economics", "hard", 2,
      `An abatement benefit arrives as the single future cash flow shown in the diagram. At a discount rate of $${r(i * 100, 0)}\\%$, its present worth is $₹$ _____.`,
      pw, 1,
      sol("Present worth $=\\dfrac{F}{(1+i)^n}$, with $F$ and $n$ read from the cash-flow diagram.", `$$\\dfrac{${C}}{(1+${i})^{${n}}}=${r(pw, 0)}.$$`, `$₹${r(pw, 0)}$`), "C", figPWLB(C, n));
  }
  // ISO 14000 — applied scenario (match scope to standard)
  b.mcq("EMS — ISO 14000", "medium", 1,
    "An exporter's overseas buyers demand third-party certification of an audited, continually-improving system that reduces the environmental impact of its operations — not product quality, not worker safety, not information security. The exporter should certify to",
    ["ISO 14001", "ISO 9001", "ISO 45001", "ISO 27001"], 0,
    sol("Match the scope to the standard: ISO 14001 = Environmental Management System (PDCA over environmental aspects); ISO 9001 = quality; ISO 45001 = occupational health & safety; ISO 27001 = information security.", "Scope is environmental impact ⇒ ISO 14001.", "ISO 14001"), "B");
  // Indian laws MSQ
  b.msq("Environmental Legislation", "medium", 2,
    "Select all statutes/instruments that are central environmental legislation in India.",
    ["The Water (Prevention and Control of Pollution) Act, 1974", "The Air (Prevention and Control of Pollution) Act, 1981", "The Environment (Protection) Act, 1986", "The Companies Act, 1956"],
    [0, 1, 2],
    sol("The Water Act (1974), Air Act (1981) and EP Act (1986) are the core environmental statutes; the Companies Act is corporate law.", "First three are environmental law.", "Water, Air and EP Acts"), "D");
  // LCA concept
  b.mcq("Life Cycle Assessment", "medium", 1,
    "A 'cradle-to-grave' Life Cycle Assessment evaluates environmental burdens from",
    ["raw-material extraction through to final disposal", "manufacture only", "use phase only", "disposal only"], 0,
    sol("Cradle-to-grave LCA spans extraction → production → use → end-of-life.", "Extraction to disposal.", "Raw material to disposal"), "B");
  // Polluter pays — applied cost internalisation
  b.nat("Environmental Ethics — Polluter Pays", "medium", 2,
    "A tannery's discharge requires $₹4.5$ lakh of effluent-treatment (abatement) and additionally causes $₹2.8$ lakh of measurable downstream crop damage. Under the polluter-pays principle, the amount (in $₹$ lakh) the tannery must internalise is _____.",
    4.5 + 2.8, 0.01,
    sol("The polluter-pays principle internalises the full externality: the polluter bears abatement **plus** damage costs (not just one of them).", "$$4.5+2.8=7.3\\text{ lakh}.$$", "$₹7.3$ lakh"), "C");
  return { slug: "es-environmental-management-ethics", name: "Environmental Management & Ethics", questions: b.out };
}

// 2 · ENVIRONMENTAL CHEMISTRY
function buildChemistry(rand: () => number) {
  const b = new Builder("es-chem", "Environmental Chemistry");
  // pH from [H+]
  for (const h of [1e-3, 1e-5, 1e-9, 3.16e-6]) {
    const pH = -Math.log10(h);
    b.nat("Acid–Base — pH", "easy", 1,
      `The hydrogen-ion concentration of a water sample is $${h.toExponential(2)}\\,\\text{mol/L}$. Its pH is _____.`,
      pH, 0.05,
      sol("$\\text{pH}=-\\log_{10}[\\text{H}^+]$.", `$$-\\log_{10}(${h.toExponential(2)})=${r(pH, 2)}.$$`, `$${r(pH, 2)}$`), "A", figpHScale(pH));
  }
  // pOH / pH relation
  b.nat("Acid–Base — pOH", "easy", 1,
    "At $25^\\circ$C a solution has $\\text{pOH}=4.2$. Its pH is _____.",
    14 - 4.2, 0.01,
    sol("$\\text{pH}+\\text{pOH}=14$ at $25^\\circ$C.", "$$\\text{pH}=14-4.2=9.8.$$", "$9.8$"), "A", figpHScale(9.8));
  // First-order kinetics half life
  for (const k of [0.1, 0.231, 0.05]) {
    const t12 = Math.log(2) / k;
    b.nat("Chemical Kinetics", "medium", 2,
      `A pollutant decays by first-order kinetics with rate constant $k=${k}\\,\\text{d}^{-1}$. Its half-life is _____ days.`,
      t12, 0.05,
      sol("For first order, $t_{1/2}=\\dfrac{\\ln 2}{k}$.", `$$\\dfrac{0.693}{${k}}=${r(t12, 2)}.$$`, `$${r(t12, 2)}\\,\\text{d}$`), "A");
  }
  // first order remaining concentration
  for (const [C0, k, t] of [[100, 0.2, 5], [50, 0.3, 3]]) {
    const C = C0 * Math.exp(-k * t);
    b.nat("Chemical Kinetics — Decay", "hard", 2,
      `A reactant starts at $${C0}\\,\\text{mg/L}$ and follows first-order decay ($k=${k}\\,\\text{d}^{-1}$). Its concentration after $${t}$ days is _____ mg/L.`,
      C, 0.1,
      sol("$C=C_0e^{-kt}$.", `$$${C0}\\,e^{-${k}\\times${t}}=${r(C, 2)}.$$`, `$${r(C, 2)}\\,\\text{mg/L}$`), "C");
  }
  // Hardness (CaCO3 equivalent)
  for (const [ca, mg] of [[40, 12], [60, 24]]) {
    const hard = ca * (50 / 20) + mg * (50 / 12.15);
    b.nat("Hardness", "hard", 2,
      `A water contains $${ca}\\,\\text{mg/L}$ of $\\text{Ca}^{2+}$ and $${mg}\\,\\text{mg/L}$ of $\\text{Mg}^{2+}$. The total hardness as $\\text{CaCO}_3$ is _____ mg/L. (Eq. wt: Ca 20, Mg 12.15, CaCO₃ 50)`,
      hard, 1,
      sol("Convert each ion to $\\text{CaCO}_3$: $\\text{mg/L}\\times\\dfrac{50}{\\text{eq.wt}}$.", `$$${ca}\\times\\dfrac{50}{20}+${mg}\\times\\dfrac{50}{12.15}=${r(hard, 1)}.$$`, `$${r(hard, 1)}\\,\\text{mg/L as CaCO}_3$`), "C", figTitration("EDTA titration is used to measure total hardness."));
  }
  // ppm to mg/L (dilute)
  b.mcq("Units of Concentration", "easy", 1,
    "For a dilute aqueous solution (density $\\approx 1\\,\\text{g/mL}$), a concentration of $1\\,\\text{mg/L}$ is equal to",
    ["$1\\,\\text{ppm}$", "$1000\\,\\text{ppm}$", "$0.001\\,\\text{ppm}$", "$1\\,\\%$"], 0,
    sol("In dilute water $1\\,\\text{mg/L}=1\\,\\text{mg/kg}=1\\,\\text{ppm}$.", "1 mg/L = 1 ppm.", "1 ppm"), "B");
  // Photochemical smog MSQ
  b.msq("Photochemistry", "medium", 2,
    "Which species are associated with photochemical (Los-Angeles type) smog?",
    ["Ozone (O₃)", "Peroxyacetyl nitrate (PAN)", "Nitrogen oxides (NOₓ)", "Sulphur dioxide as the chief agent"],
    [0, 1, 2],
    sol("Photochemical smog is an oxidising NOₓ/VOC–sunlight system producing O₃ and PAN; SO₂ characterises reducing/London smog.", "O₃, PAN, NOₓ.", "Ozone, PAN and NOₓ"), "D");
  // Alkalinity
  b.mcq("Carbonate System", "medium", 1,
    "In the pH range 8.3–9.5 of most natural waters, alkalinity is predominantly due to",
    ["bicarbonate (HCO₃⁻)", "hydroxide (OH⁻)", "dissolved CO₂", "carbonate only (CO₃²⁻)"], 0,
    sol("Between pH ~6.3 and 10.3 the carbonate system is dominated by $\\text{HCO}_3^-$.", "Bicarbonate dominates.", "Bicarbonate"), "B", figTitration("Alkalinity end-points (phenolphthalein, methyl-orange) on a titration curve."));
  return { slug: "es-environmental-chemistry", name: "Environmental Chemistry", questions: b.out };
}

// 3 · ENVIRONMENTAL MICROBIOLOGY
function buildMicrobiology(rand: () => number) {
  const b = new Builder("es-micro", "Environmental Microbiology");
  // Monod specific growth rate (load-bearing: read μ_max, K_s off the curve)
  for (const [umax, Ks, S] of [[0.5, 50, 100], [0.4, 20, 60]]) {
    const mu = umax * S / (Ks + S);
    b.nat("Monod Kinetics", "hard", 2,
      `A culture follows Monod kinetics. Reading $\\mu_{max}$ (plateau) and the half-saturation constant $K_s$ from the $\\mu$–$S$ curve shown, the specific growth rate at substrate $S=${S}\\,\\text{mg/L}$ is _____ h⁻¹.`,
      mu, 0.005,
      sol("Monod: $\\mu=\\dfrac{\\mu_{max}S}{K_s+S}$, with $\\mu_{max}$ and $K_s$ read from the curve.", `$$\\dfrac{${umax}\\times${S}}{${Ks}+${S}}=${r(mu, 3)}.$$`, `$${r(mu, 3)}\\,\\text{h}^{-1}$`), "C", figMonodLB(umax, Ks));
  }
  // Michaelis–Menten enzyme kinetics (Section 3) — load-bearing
  for (const [Vmax, Km, S] of [[10, 5, 15], [8, 2, 6]]) {
    const v = Vmax * S / (Km + S);
    b.nat("Enzyme Kinetics — Michaelis–Menten", "hard", 2,
      `An enzyme follows Michaelis–Menten kinetics. Reading $V_{max}$ (plateau) and $K_m$ (half-saturation) from the curve shown, the reaction velocity at substrate concentration $[S]=${S}\\,\\text{mmol/L}$ is _____ µmol·L⁻¹·min⁻¹.`,
      v, 0.01,
      sol("Michaelis–Menten: $v=\\dfrac{V_{max}[S]}{K_m+[S]}$, with $V_{max}$ and $K_m$ read from the curve.", `$$\\dfrac{${Vmax}\\times${S}}{${Km}+${S}}=${r(v, 3)}.$$`, `$${r(v, 3)}\\,\\mu\\text{mol L}^{-1}\\text{min}^{-1}$`), "C", figMMLB(Vmax, Km));
  }
  // Yield coefficient
  for (const [dX, dS] of [[40, 100], [30, 120]]) {
    const Y = dX / dS;
    b.nat("Cell Yield", "medium", 2,
      `In a reactor, $${dX}\\,\\text{mg/L}$ of biomass is produced while $${dS}\\,\\text{mg/L}$ of substrate is consumed. The observed yield $Y_{X/S}$ is _____ mg/mg.`,
      Y, 0.005,
      sol("$Y_{X/S}=\\dfrac{\\Delta X}{\\Delta S}$.", `$$\\dfrac{${dX}}{${dS}}=${r(Y, 3)}.$$`, `$${r(Y, 3)}$`), "A");
  }
  // Generation / doubling time
  for (const [mu] of [[0.5], [0.231], [0.35]]) {
    const td = Math.log(2) / mu;
    b.nat("Microbial Growth", "medium", 2,
      `Bacteria grow exponentially with specific growth rate $\\mu=${mu}\\,\\text{h}^{-1}$. The doubling (generation) time is _____ hours.`,
      td, 0.02,
      sol("$t_d=\\dfrac{\\ln 2}{\\mu}$.", `$$\\dfrac{0.693}{${mu}}=${r(td, 2)}.$$`, `$${r(td, 2)}\\,\\text{h}$`), "A", figGrowth());
  }
  // exponential count
  for (const [N0, n] of [[1000, 6], [500, 8]]) {
    const N = N0 * 2 ** n;
    b.nat("Binary Fission", "easy", 1,
      `Starting from $${N0}$ cells, a culture undergoes $${n}$ generations of binary fission. The final cell count is _____.`,
      N, 0.5,
      sol("$N=N_0\\,2^{n}$.", `$$${N0}\\times2^{${n}}=${N}.$$`, `$${N}$`), "A");
  }
  // Indicator organism — applied (compare count to the zero-tolerance standard)
  b.mcq("Indicator Organisms", "medium", 1,
    "Drinking-water standards require E. coli to be ABSENT in any 100 mL sample. A membrane-filtration test of a 100 mL sample of treated water yields 8 E. coli colonies. The correct interpretation is that the water",
    ["fails the potability standard and is unsafe to drink", "is potable, since 8 is a low count", "is potable after simple aeration", "meets the E. coli standard"], 0,
    sol("The standard is zero E. coli per 100 mL; 8 colonies/100 mL exceeds it, signalling recent faecal contamination — the water is unsafe.", "Compare the measured count to the zero-tolerance standard.", "Fails / unsafe"), "B");
  // Biogeochemical cycle — applied nitrification oxygen demand
  b.nat("Nitrogen Cycle — Nitrification O₂ Demand", "hard", 2,
    "In a nitrifying reactor the ammonia-nitrogen falls from $40\\,\\text{mg/L}$ to $6\\,\\text{mg/L}$ as it is oxidised to nitrate. Taking the stoichiometric requirement as $4.57\\,\\text{g O}_2$ per g of N nitrified, the oxygen demand exerted by nitrification is _____ mg/L.",
    (40 - 6) * 4.57, 0.1,
    sol("Nitrification (NH₄⁺ → NO₃⁻) consumes 4.57 g O₂ per g N. Demand $=\\Delta N\\times4.57$.", "$$(40-6)\\times4.57=155.38\\,\\text{mg/L}.$$", "$155.38\\,\\text{mg/L}$"), "C");
  // Aerobic vs anaerobic MSQ
  b.msq("Microbial Metabolism", "medium", 2,
    "Which processes are strictly anaerobic in wastewater treatment?",
    ["Methanogenesis", "Denitrification (can be anoxic)", "Nitrification", "Aerobic carbon oxidation"],
    [0],
    sol("Methanogenesis requires strict anaerobiosis. Denitrification is anoxic (uses NO₃⁻), nitrification and carbon oxidation are aerobic.", "Only methanogenesis is strictly anaerobic.", "Methanogenesis"), "D");
  return { slug: "es-environmental-microbiology", name: "Environmental Microbiology", questions: b.out };
}

// 4 · ECOLOGY & BIODIVERSITY
function buildEcology(rand: () => number) {
  const b = new Builder("es-eco", "Ecology & Biodiversity");
  // 10% law energy transfer (load-bearing: read producer energy off the pyramid)
  for (const [base, lvl] of [[10000, 3], [8000, 2]]) {
    const e = base * 0.1 ** lvl;
    b.nat("Energy Flow — 10% Law", "medium", 2,
      `In the energy pyramid shown, only the producer (trophic-1) energy is marked. Assuming 10% transfer per trophic level, the energy available at trophic level $${lvl + 1}$ is _____ kcal/m²/yr.`,
      e, 0.5,
      sol("Each transfer retains ~10%: $E_n=E_0(0.1)^n$, with $E_0$ read from the pyramid.", `$$${base}\\times0.1^{${lvl}}=${r(e, 2)}.$$`, `$${r(e, 2)}\\,\\text{kcal/m}^2/\\text{yr}$`), "A", figPyramidLB(base));
  }
  // Net primary productivity
  for (const [gpp, resp] of [[1000, 400], [1500, 600]]) {
    const npp = gpp - resp;
    b.nat("Productivity", "easy", 1,
      `An ecosystem has gross primary productivity $${gpp}\\,\\text{g C/m}^2/\\text{yr}$ and autotroph respiration $${resp}\\,\\text{g C/m}^2/\\text{yr}$. The net primary productivity is _____ g C/m²/yr.`,
      npp, 0.5,
      sol("$\\text{NPP}=\\text{GPP}-R_{\\text{auto}}$.", `$$${gpp}-${resp}=${npp}.$$`, `$${npp}$`), "A");
  }
  // Exponential growth (load-bearing: read N0 off the curve)
  for (const [N0, r0, t] of [[1000, 0.02, 10], [500, 0.05, 8]]) {
    const N = N0 * Math.exp(r0 * t);
    b.nat("Population Growth — Exponential", "hard", 2,
      `A population grows exponentially at intrinsic rate $r=${r0}\\,\\text{yr}^{-1}$. Reading the initial size $N_0$ from the figure, after $${t}$ years it numbers _____.`,
      N, 1,
      sol("$N_t=N_0e^{rt}$, with $N_0$ read from the figure.", `$$${N0}\\,e^{${r0}\\times${t}}=${r(N, 0)}.$$`, `$${r(N, 0)}$`), "C", figExpLB(N0));
  }
  // Logistic max growth at K/2 (load-bearing: read K off the curve)
  for (const [K, r0] of [[10000, 0.3], [5000, 0.4]]) {
    const dNdt = r0 * K / 4;
    b.nat("Logistic Growth", "hard", 2,
      `A population grows logistically at intrinsic rate $r=${r0}\\,\\text{yr}^{-1}$. Reading the carrying capacity $K$ from the growth curve shown, the maximum rate of population increase ($rK/4$) is _____ individuals/yr.`,
      dNdt, 1,
      sol("Max $\\dfrac{dN}{dt}=\\dfrac{rK}{4}$ at $N=K/2$, with $K$ read from the curve.", `$$\\dfrac{${r0}\\times${K}}{4}=${r(dNdt, 0)}.$$`, `$${r(dNdt, 0)}$`), "C", figLogisticLB(K));
  }
  // Shannon index (2 species, simple)
  b.nat("Biodiversity — Shannon Index", "hard", 2,
    "A community has two equally abundant species (each proportion $0.5$). The Shannon diversity index $H'=-\\sum p_i\\ln p_i$ is _____.",
    -2 * (0.5 * Math.log(0.5)), 0.01,
    sol("$H'=-\\sum p_i\\ln p_i$.", "$$-2(0.5\\ln 0.5)=0.693.$$", "$0.693$"), "C");
  // Trophic level MCQ
  b.mcq("Food Chains", "easy", 1,
    "In a grazing food chain, organisms that obtain energy directly from producers are",
    ["primary consumers (herbivores)", "decomposers", "tertiary consumers", "secondary consumers"], 0,
    sol("Herbivores (primary consumers) feed on producers.", "Primary consumers.", "Primary consumers"), "B", figPyramid(10000));
  // Ecological succession MCQ
  b.mcq("Succession", "medium", 1,
    "The stable, self-perpetuating community reached at the end of ecological succession is the",
    ["climax community", "pioneer community", "seral stage", "ecotone"], 0,
    sol("Succession culminates in a climax community in equilibrium with the environment.", "Climax community.", "Climax community"), "B");
  // Biodiversity hotspot MSQ
  b.msq("Biodiversity Conservation", "medium", 2,
    "Which are recognised biodiversity hotspots in/around India?",
    ["Western Ghats", "Eastern Himalaya", "Indo-Burma", "Thar Desert"],
    [0, 1, 2],
    sol("Western Ghats, Himalaya and Indo-Burma are global hotspots; the Thar is not (low endemism/richness threshold).", "First three.", "Western Ghats, Himalaya, Indo-Burma"), "D");
  // Environmental Biotechnology (Section 4)
  b.mcq("Bioremediation", "medium", 1,
    "A diesel-contaminated soil is cleaned in place by injecting air and nutrients to stimulate indigenous hydrocarbon-degrading bacteria, with no excavation. This technique is best classified as",
    ["in-situ bioremediation (bioventing)", "ex-situ landfarming", "incineration", "solidification / stabilisation"], 0,
    sol("Treating soil where it lies by stimulating native microbes with O₂/nutrients is in-situ bioremediation (bioventing); ex-situ methods require excavation, and incineration/S-S are not biological.", "No excavation + stimulate native microbes ⇒ in-situ.", "In-situ bioremediation"), "B");
  b.nat("Phytoremediation", "medium", 2,
    "A hyperaccumulator crop yields $20\\,\\text{t/ha}$ of dry biomass containing $500\\,\\text{mg/kg}$ of nickel. The nickel phytoextracted per hectare in one harvest is _____ g/ha.",
    20 * 500, 1,
    sol("Metal extracted $=$ dry biomass $\\times$ tissue concentration. With biomass $20\\,\\text{t/ha}=20{,}000\\,\\text{kg/ha}$ and $500\\,\\text{mg/kg}$: $(20{,}000)(500)/1000$ g.", "$$20{,}000\\times500/1000=10{,}000\\,\\text{g/ha}.$$", "$10\\,000\\,\\text{g/ha}$"), "A");
  b.nat("Biofuels — Biogas", "hard", 2,
    "Anaerobic digestion of $1000\\,\\text{kg}$ of volatile solids yields biogas at $0.4\\,\\text{m}^3/\\text{kg VS}$, of which $60\\%$ is methane (calorific value $36\\,\\text{MJ/m}^3$). The recoverable energy is _____ MJ.",
    1000 * 0.4 * 0.6 * 36, 1,
    sol("Energy $=$ VS $\\times$ gas yield $\\times$ CH₄ fraction $\\times$ calorific value.", "$$1000\\times0.4\\times0.6\\times36=8640\\,\\text{MJ}.$$", "$8640\\,\\text{MJ}$"), "C");
  b.mcq("Biosensors", "medium", 1,
    "A field device estimates wastewater BOD within minutes by measuring the respiration of immobilised microbes through a dissolved-oxygen electrode. The biological recognition element and the transducer are, respectively,",
    ["immobilised microorganisms and the dissolved-oxygen electrode", "the DO electrode and the microbes", "an antibody and an enzyme", "DNA and a thermistor"], 0,
    sol("In a microbial BOD biosensor the immobilised microbes are the bio-recognition element; the O₂ they consume is sensed by the DO electrode (the transducer).", "Recognition = microbes; transducer = DO electrode.", "Microbes; DO electrode"), "B");
  return { slug: "es-ecology-biodiversity", name: "Ecology & Biodiversity", questions: b.out };
}

// 5 · AIR & NOISE POLLUTION
function buildAirNoise(rand: () => number) {
  const b = new Builder("es-air", "Air & Noise Pollution");
  // Noise addition n identical sources
  for (const [L1, n] of [[80, 4], [85, 3], [75, 10]]) {
    const L = L1 + 10 * Math.log10(n);
    b.nat("Noise — Addition", "medium", 2,
      `At a receptor, $${n}$ identical machines each produce $${L1}\\,\\text{dB}$. The combined sound pressure level is _____ dB.`,
      L, 0.1,
      sol("$L=L_1+10\\log_{10}n$ for $n$ equal incoherent sources.", `$$${L1}+10\\log_{10}${n}=${r(L, 2)}.$$`, `$${r(L, 2)}\\,\\text{dB}$`), "A");
  }
  // Two different sources combine
  b.nat("Noise — Combination", "hard", 2,
    "Two sources produce $70\\,\\text{dB}$ and $73\\,\\text{dB}$ at a point. The combined level is _____ dB.",
    10 * Math.log10(10 ** 7 + 10 ** 7.3), 0.1,
    sol("$L=10\\log_{10}(10^{L_1/10}+10^{L_2/10})$.", "$$10\\log_{10}(10^{7}+10^{7.3})=74.76.$$", "$74.76\\,\\text{dB}$"), "C");
  // Gaussian plume ground-level conc on centreline at ground (reflective) — load-bearing
  for (const [Qs, u, sy, sz, H] of [[100, 5, 30, 20, 50], [80, 4, 40, 25, 40]]) {
    // C at ground, plume centreline downwind, full reflection (ground), y=0,z=0
    const C = (Qs / (Math.PI * u * sy * sz)) * Math.exp(-(H * H) / (2 * sz * sz)); // g/s, m -> g/m3
    b.nat("Gaussian Plume", "hard", 2,
      `A stack emits $${Qs}\\,\\text{g/s}$ of a pollutant. Using the effective height $H$, wind speed $u$ and dispersion coefficients $\\sigma_y,\\sigma_z$ marked on the diagram, the ground-level concentration on the plume centreline (full ground reflection, $y=0$) is _____ ×10⁻⁴ g/m³.`,
      C / 1e-4, 0.2,
      sol("$C=\\dfrac{Q}{\\pi u\\sigma_y\\sigma_z}\\exp\\!\\left(-\\dfrac{H^2}{2\\sigma_z^2}\\right)$ (ground, centreline, full reflection); $H,u,\\sigma_y,\\sigma_z$ read from the figure.", `$$\\dfrac{${Qs}}{\\pi\\times${u}\\times${sy}\\times${sz}}e^{-${H}^2/(2\\times${sz}^2)}=${r(C, 8)}\\,\\text{g/m}^3.$$`, `$${r(C / 1e-4, 3)}\\times10^{-4}$`), "C", figPlumeLB(H, u, sy, sz));
  }
  // Effective stack height (plume rise add) — load-bearing
  for (const [hs, dh] of [[60, 25], [80, 30]]) {
    const H = hs + dh;
    b.nat("Effective Stack Height", "easy", 1,
      `For the chimney shown, the physical stack height $h_s$ and the plume rise $\\Delta h$ are marked on the diagram. The effective stack height $H=h_s+\\Delta h$ is _____ m.`,
      H, 0.1,
      sol("$H=h_s+\\Delta h$, with $h_s$ and $\\Delta h$ read from the figure.", `$$${hs}+${dh}=${H}.$$`, `$${H}\\,\\text{m}$`), "A", figStackLB(hs, dh));
  }
  // Deutsch-Anderson ESP efficiency — load-bearing
  for (const [A, Q, w] of [[200, 5, 0.1], [300, 8, 0.12]]) {
    const eta = (1 - Math.exp(-w * A / Q)) * 100;
    b.nat("ESP — Deutsch–Anderson", "hard", 2,
      `An ESP treats $${Q}\\,\\text{m}^3/\\text{s}$ of flue gas. Reading the collecting area $A$ and the drift velocity $w$ from the figure, its Deutsch–Anderson collection efficiency is _____ %.`,
      eta, 0.1,
      sol("Deutsch–Anderson: $\\eta=1-e^{-wA/Q}$, with $A$ and $w$ read from the figure.", `$$\\left(1-e^{-${w}\\times${A}/${Q}}\\right)\\times100=${r(eta, 2)}\\%.$$`, `$${r(eta, 2)}\\%$`), "C", figESP(A, w, lbCap("Collecting area A and drift velocity w marked on the diagram only.")));
  }
  // Cyclone / control device MCQ
  b.mcq("Particulate Control", "medium", 1,
    "Which device is most effective for removing very fine particulates (< 1 µm) at high efficiency?",
    ["Electrostatic precipitator", "Settling chamber", "Simple cyclone", "Gravity settler"], 0,
    sol("ESPs and fabric filters capture sub-micron particles; settling chambers/cyclones are for coarse particles.", "ESP.", "Electrostatic precipitator"), "B", figCyclone());
  // Lapse rate stability MCQ
  b.mcq("Atmospheric Stability", "hard", 1,
    "When the environmental lapse rate is greater than the dry adiabatic lapse rate, the atmosphere is",
    ["superadiabatic and unstable", "isothermal", "inverted and stable", "neutral"], 0,
    sol("ELR > DALR ⇒ a displaced parcel keeps rising ⇒ superadiabatic, unstable (good dispersion, looping plume).", "Superadiabatic, unstable.", "Superadiabatic / unstable"), "B", figLapse("unstable"));
  // Inversion MSQ
  b.msq("Meteorology", "medium", 2,
    "Which conditions worsen ground-level air pollution by limiting dispersion?",
    ["Temperature inversion", "Low mixing height", "Calm winds", "Strong superadiabatic lapse"],
    [0, 1, 2],
    sol("Inversions, low mixing height and calm winds all trap pollutants; a strong superadiabatic lapse improves dispersion.", "First three.", "Inversion, low mixing height, calm winds"), "D", figLapse("inversion"));
  return { slug: "es-air-noise-pollution", name: "Air & Noise Pollution", questions: b.out };
}

// 6 · WATER & WASTEWATER TREATMENT
function buildWater(rand: () => number) {
  const b = new Builder("es-water", "Water & Wastewater Treatment");
  // BOD exerted
  for (const [L0, k, t] of [[250, 0.23, 5], [300, 0.3, 3]]) {
    const y = L0 * (1 - Math.exp(-k * t));
    b.nat("BOD Kinetics", "hard", 2,
      `A wastewater has ultimate BOD $L_0=${L0}\\,\\text{mg/L}$ and deoxygenation constant $k=${k}\\,\\text{d}^{-1}$ (base $e$). The BOD exerted in $${t}$ days is _____ mg/L.`,
      y, 0.2,
      sol("$y_t=L_0(1-e^{-kt})$.", `$$${L0}(1-e^{-${k}\\times${t}})=${r(y, 2)}.$$`, `$${r(y, 2)}\\,\\text{mg/L}$`), "C", figSag(r(L0 * 0.3, 1), r(0.7 / k, 1)));
  }
  // Surface overflow rate — load-bearing (read Q and A off the figure)
  for (const [Q, A] of [[6, 300], [8, 400]]) {
    const sor = Q * 1000 / A;
    b.nat("Sedimentation — Overflow Rate", "medium", 2,
      `For the rectangular settling tank shown, read the flow $Q$ (in MLD) and the plan area $A$ from the diagram. The surface overflow rate $Q/A$ is _____ m³/m²/day.`,
      sor, 0.1,
      sol("$SOR=\\dfrac{Q}{A}$ (1 MLD = 1000 m³/day), with $Q$ and $A$ read from the figure.", `$$\\dfrac{${Q}\\times1000}{${A}}=${r(sor, 1)}.$$`, `$${r(sor, 1)}\\,\\text{m/day}$`), "A", figSettler(`${Q} MLD`, A, lbCap("Flow Q and plan area A marked on the diagram only.")));
  }
  // Stokes settling velocity — load-bearing (read diameter off the figure)
  for (const [dmm] of [[0.02], [0.05]]) {
    const d = dmm / 1000;
    const vs = 9.81 * 1650 * d * d / (18 * 1e-3);
    b.nat("Stokes' Law", "hard", 2,
      `A discrete particle ($\\rho_s=2650\\,\\text{kg/m}^3$) settles in water ($\\rho=1000$, $\\mu=10^{-3}\\,\\text{Pa·s}$). Reading its diameter from the figure, its terminal velocity is _____ ×10⁻³ m/s.`,
      vs / 1e-3, 0.3,
      sol("$v_s=\\dfrac{g(\\rho_s-\\rho)d^2}{18\\mu}$, with $d$ read from the figure.", `$$\\dfrac{9.81\\times1650\\times(${d})^2}{18\\times10^{-3}}=${r(vs, 5)}\\,\\text{m/s}.$$`, `$${r(vs / 1e-3, 3)}\\times10^{-3}$`), "C", figStokesLB(dmm));
  }
  // Settling-column test — load-bearing (read depth & time off the trajectory)
  for (const [depth, time] of [[2, 500], [2.4, 400]]) {
    const vs = depth / time * 1000;
    b.nat("Settling Velocity", "medium", 2,
      `In the settling-column test plotted in the figure, a particle settles the marked depth in the marked time. Its settling velocity is _____ mm/s.`,
      vs, 0.05,
      sol("$v_s=\\text{depth}\\div\\text{time}$, both read from the trajectory.", `$$\\dfrac{${depth}\\,\\text{m}}{${time}\\,\\text{s}}\\times1000=${r(vs, 2)}\\,\\text{mm/s}.$$`, `$${r(vs, 2)}\\,\\text{mm/s}$`), "C", figSettleColLB(depth, time));
  }
  // Water demand
  for (const [pop, lpcd] of [[100000, 135], [80000, 150]]) {
    const d = pop * lpcd / 1e6;
    b.nat("Water Demand", "easy", 1,
      `A town of population $${pop.toLocaleString("en-IN")}$ has per-capita demand $${lpcd}\\,\\text{lpcd}$. The average daily demand is _____ MLD.`,
      d, 0.02,
      sol("Demand $=$ population $\\times$ lpcd.", `$$\\dfrac{${pop}\\times${lpcd}}{10^6}=${r(d, 2)}.$$`, `$${r(d, 2)}\\,\\text{MLD}$`), "A");
  }
  // Chlorine demand
  for (const [app, res] of [[4, 0.3], [5, 0.5]]) {
    const dm = app - res;
    b.nat("Disinfection", "easy", 1,
      `Chlorine is applied at $${app}\\,\\text{mg/L}$ and the residual is $${res}\\,\\text{mg/L}$. The chlorine demand is _____ mg/L.`,
      dm, 0.01,
      sol("Demand = applied − residual.", `$$${app}-${res}=${r(dm, 2)}.$$`, `$${r(dm, 2)}$`), "A", figBreakpoint());
  }
  // Streeter-Phelps critical time
  for (const [kd, kr, D0, L0] of [[0.2, 0.4, 2, 20]]) {
    const tc = (1 / (kr - kd)) * Math.log((kr / kd) * (1 - D0 * (kr - kd) / (kd * L0)));
    b.nat("Oxygen Sag — Critical Time", "hard", 2,
      `In a stream, $k_d=${kd}\\,\\text{d}^{-1}$, $k_r=${kr}\\,\\text{d}^{-1}$, initial deficit $D_0=${D0}\\,\\text{mg/L}$, initial BOD $L_0=${L0}\\,\\text{mg/L}$. The critical time of maximum deficit is _____ days.`,
      tc, 0.05,
      sol("$t_c=\\dfrac{1}{k_r-k_d}\\ln\\!\\left[\\dfrac{k_r}{k_d}\\left(1-\\dfrac{D_0(k_r-k_d)}{k_dL_0}\\right)\\right]$.", `$$t_c=\\dfrac{1}{${kr}-${kd}}\\ln\\!\\left[\\dfrac{${kr}}{${kd}}\\left(1-\\dfrac{${D0}(${kr}-${kd})}{${kd}\\times${L0}}\\right)\\right]=${r(tc, 3)}.$$`, `$${r(tc, 3)}\\,\\text{d}$`), "C", figSag(2.7, r(tc, 1)));
  }
  // Activated sludge F/M ratio
  for (const [Q, S0, V, X] of [[10000, 250, 2000, 3000]]) {
    const fm = Q * S0 / (V * X);
    b.nat("Activated Sludge — F/M", "hard", 2,
      `An aeration tank: flow $Q=${Q}\\,\\text{m}^3/\\text{d}$, influent BOD $S_0=${S0}\\,\\text{mg/L}$, volume $V=${V}\\,\\text{m}^3$, MLSS $X=${X}\\,\\text{mg/L}$. The F/M ratio is _____ d⁻¹.`,
      fm, 0.005,
      sol("$\\dfrac{F}{M}=\\dfrac{QS_0}{VX}$.", `$$\\dfrac{${Q}\\times${S0}}{${V}\\times${X}}=${r(fm, 3)}.$$`, `$${r(fm, 3)}\\,\\text{d}^{-1}$`), "C", figASP());
  }
  // BOD removal efficiency figure
  for (const [in0, out0] of [[200, 30], [250, 25]]) {
    const eff = (in0 - out0) / in0 * 100;
    b.nat("Treatment Efficiency", "medium", 2,
      `A treatment plant receives BOD $${in0}\\,\\text{mg/L}$ and discharges $${out0}\\,\\text{mg/L}$. The BOD removal efficiency is _____ %.`,
      eff, 0.1,
      sol("$\\eta=\\dfrac{S_0-S_e}{S_0}\\times100$.", `$$\\dfrac{${in0}-${out0}}{${in0}}\\times100=${r(eff, 1)}\\%.$$`, `$${r(eff, 1)}\\%$`), "A", figRemoval(in0, out0, "BOD", "mg/L"));
  }
  // Filtration MCQ
  b.mcq("Filtration", "medium", 1,
    "Compared with a slow sand filter, a rapid sand filter is characterised by",
    ["higher filtration rate and reliance on prior coagulation", "biological 'schmutzdecke' as the main mechanism", "very low loading rate", "no backwashing"], 0,
    sol("Rapid sand filters run at ~100–125 times the slow-filter rate, need coagulation–sedimentation upstream, and are cleaned by backwashing.", "Higher rate, needs coagulation.", "High rate, coagulation-dependent"), "B");
  return { slug: "es-water-wastewater", name: "Water & Wastewater Treatment", questions: b.out };
}

// 7 · SOLID & HAZARDOUS WASTE MANAGEMENT
function buildSolidWaste(rand: () => number) {
  const b = new Builder("es-waste", "Solid & Hazardous Waste Management");
  // MSW generation rate
  for (const [pop, perCap] of [[100000, 0.5], [250000, 0.45]]) {
    const t = pop * perCap / 1000;
    b.nat("MSW Generation", "easy", 1,
      `A city of $${pop.toLocaleString("en-IN")}$ people generates solid waste at $${perCap}\\,\\text{kg/capita/day}$. The total daily generation is _____ tonnes/day.`,
      t, 0.5,
      sol("Total $=$ population $\\times$ per-capita rate.", `$$\\dfrac{${pop}\\times${perCap}}{1000}=${r(t, 1)}.$$`, `$${r(t, 1)}\\,\\text{t/day}$`), "A", figRemoval(pop * perCap, 0, "MSW", "kg/day", "Daily MSW mass balance."));
  }
  // Calorific value — modified Dulong (simplified given fractions)
  b.nat("Calorific Value", "hard", 2,
    "Using the modified Dulong formula $HHV = 337C + 1419(H - O/8) + 93S$ (kJ/kg), a fuel with $C=45\\%$, $H=6\\%$, $O=40\\%$, $S=0\\%$ has a higher heating value of _____ kJ/kg.",
    337 * 45 + 1419 * (6 - 40 / 8) + 93 * 0, 5,
    sol("Apply the modified Dulong formula with percentages.", "$$337(45)+1419(6-40/8)+93(0)=16584\\,\\text{kJ/kg}.$$", "$16584\\,\\text{kJ/kg}$"), "C");
  // Density / volume reduction
  for (const [m, d1, d2] of [[1000, 100, 500]]) {
    const v1 = m / d1, v2 = m / d2;
    const vr = (1 - v2 / v1) * 100;
    b.nat("Compaction", "medium", 2,
      `Waste of mass $${m}\\,\\text{kg}$ at loose density $${d1}\\,\\text{kg/m}^3$ is compacted to $${d2}\\,\\text{kg/m}^3$. The volume reduction is _____ %.`,
      vr, 0.1,
      sol("$VR=\\left(1-\\dfrac{V_2}{V_1}\\right)\\times100=\\left(1-\\dfrac{\\rho_1}{\\rho_2}\\right)\\times100$.", `$$\\left(1-\\dfrac{${d1}}{${d2}}\\right)\\times100=${r(vr, 1)}\\%.$$`, `$${r(vr, 1)}\\%$`), "A");
  }
  // Landfill gas (simplified yield)
  for (const [mass, yield_] of [[1000, 0.15], [2000, 0.1]]) {
    const gas = mass * yield_;
    b.nat("Landfill Gas", "medium", 2,
      `Decomposable waste of $${mass}\\,\\text{kg}$ yields landfill gas at $${yield_}\\,\\text{m}^3/\\text{kg}$. The total gas generated is _____ m³.`,
      gas, 0.5,
      sol("Gas $=$ mass $\\times$ specific yield.", `$$${mass}\\times${yield_}=${r(gas, 1)}.$$`, `$${r(gas, 1)}\\,\\text{m}^3$`), "A", figLandfill());
  }
  // Landfill area / life (simple)
  for (const [vol, rate] of [[500000, 50000]]) {
    const life = vol / rate;
    b.nat("Landfill Life", "medium", 2,
      `A landfill has a usable air-space of $${vol.toLocaleString("en-IN")}\\,\\text{m}^3$ and receives compacted waste at $${rate.toLocaleString("en-IN")}\\,\\text{m}^3/\\text{yr}$. Its design life is _____ years.`,
      life, 0.1,
      sol("Life $=\\dfrac{\\text{capacity}}{\\text{annual fill}}$.", `$$\\dfrac{${vol}}{${rate}}=${r(life, 1)}.$$`, `$${r(life, 1)}\\,\\text{yr}$`), "A", figLandfill());
  }
  // 3R hierarchy MCQ
  b.mcq("Waste Hierarchy", "easy", 1,
    "In the integrated solid-waste-management hierarchy, the most preferred option is",
    ["source reduction (waste prevention)", "landfilling", "incineration", "recycling"], 0,
    sol("The hierarchy ranks: reduce > reuse > recycle > recover (energy) > dispose (landfill).", "Source reduction.", "Source reduction"), "B");
  // Hazardous waste MSQ
  b.msq("Hazardous Waste", "medium", 2,
    "Which characteristics define a hazardous waste under typical regulatory frameworks?",
    ["Ignitability", "Corrosivity", "Reactivity", "High moisture content"],
    [0, 1, 2],
    sol("The four hazard characteristics are ignitability, corrosivity, reactivity and toxicity; moisture content is not one.", "Ignitability, corrosivity, reactivity.", "Ignitability, corrosivity, reactivity"), "D");
  // Composting C/N MCQ
  b.mcq("Composting", "medium", 1,
    "The optimum carbon-to-nitrogen (C/N) ratio for efficient aerobic composting is approximately",
    ["25–30 : 1", "5 : 1", "100 : 1", "1 : 1"], 0,
    sol("A C/N around 25–30:1 balances microbial energy (C) and protein synthesis (N).", "≈ 25–30:1.", "25–30:1"), "B");
  return { slug: "es-solid-hazardous-waste", name: "Solid & Hazardous Waste Management", questions: b.out };
}

// 8 · GLOBAL & REGIONAL ENVIRONMENTAL ISSUES
function buildGlobal(rand: () => number) {
  const b = new Builder("es-global", "Global & Regional Environmental Issues");
  // GWP weighted CO2-equivalent
  for (const [mCH4, gwp] of [[10, 28], [5, 25]]) {
    const co2e = mCH4 * gwp;
    b.nat("Global Warming Potential", "medium", 2,
      `A source emits $${mCH4}\\,\\text{t}$ of methane (GWP$_{100}=${gwp}$). Its carbon-dioxide-equivalent emission is _____ t CO₂-e.`,
      co2e, 0.5,
      sol("CO₂-e $=$ mass $\\times$ GWP.", `$$${mCH4}\\times${gwp}=${co2e}.$$`, `$${co2e}\\,\\text{t CO}_2\\text{-e}$`), "A", figRemoval(co2e, mCH4, "CH₄ → CO₂-e", "t", "Methane converted to CO₂-equivalent via GWP."));
  }
  // Total CO2-e from a mix
  b.nat("Carbon Footprint", "hard", 2,
    "A facility emits $100\\,\\text{t}$ CO₂, $4\\,\\text{t}$ CH₄ (GWP 28) and $1\\,\\text{t}$ N₂O (GWP 265). The total carbon footprint is _____ t CO₂-e.",
    100 * 1 + 4 * 28 + 1 * 265, 1,
    sol("Sum each gas × its GWP.", "$$100(1)+4(28)+1(265)=477.$$", "$477\\,\\text{t CO}_2\\text{-e}$"), "C", figRemoval(477, 105, "GHG mix", "t CO₂-e", "Aggregating gases into CO₂-equivalent."));
  // Ozone depletion / ODP MCQ
  b.mcq("Ozone Depletion", "easy", 1,
    "Stratospheric ozone depletion is primarily driven by the catalytic release of which radical from CFCs?",
    ["Chlorine (Cl·)", "Hydroxyl (OH·)", "Nitrate (NO₃·)", "Carbon (C·)"], 0,
    sol("UV photolysis of CFCs releases Cl· which catalytically destroys O₃ (one Cl can destroy thousands of O₃).", "Chlorine radical.", "Chlorine"), "B");
  // International protocols — applied ODP-weighting
  b.nat("Ozone-Depletion Potential", "hard", 2,
    "A refrigerant recovery releases $2\\,\\text{t}$ of CFC-11 (ODP $=1.0$) and $5\\,\\text{t}$ of HCFC-22 (ODP $=0.055$). The total release expressed as CFC-11-equivalent (ODP-weighted) is _____ t.",
    2 * 1.0 + 5 * 0.055, 0.01,
    sol("ODP-weighted release $=\\sum(\\text{mass}\\times\\text{ODP})$ — the basis on which the Montreal Protocol controls ozone-depleting substances.", "$$2(1.0)+5(0.055)=2.275\\,\\text{t}.$$", "$2.275\\,\\text{t CFC-11-eq}$"), "C");
  // Acid rain chemistry MCQ
  b.mcq("Acid Rain", "medium", 1,
    "Acid rain is chiefly caused by the atmospheric oxidation and hydration of",
    ["SO₂ and NOₓ to sulphuric and nitric acids", "CO₂ to carbonic acid only", "CH₄ to formic acid", "O₃ to nitric acid"], 0,
    sol("SO₂→H₂SO₄ and NOₓ→HNO₃ depress rain pH below ~5.6.", "SO₂ and NOₓ.", "SO₂ and NOₓ"), "B");
  // Greenhouse gases MSQ
  b.msq("Greenhouse Gases", "easy", 2,
    "Which of the following are greenhouse gases?",
    ["Carbon dioxide (CO₂)", "Methane (CH₄)", "Nitrous oxide (N₂O)", "Nitrogen (N₂)"],
    [0, 1, 2],
    sol("CO₂, CH₄ and N₂O absorb infrared; diatomic N₂ does not and is not a GHG.", "First three.", "CO₂, CH₄, N₂O"), "D");
  // Eutrophication MCQ
  b.mcq("Eutrophication", "medium", 1,
    "The nutrient most commonly limiting and therefore triggering eutrophication in freshwater lakes is",
    ["phosphorus", "carbon", "silicon", "iron"], 0,
    sol("Phosphorus is usually the limiting nutrient in freshwater; its loading drives algal blooms.", "Phosphorus.", "Phosphorus"), "B");
  // Conventions matching MSQ
  b.msq("Conventions", "hard", 2,
    "Match the correct themes: which statements are TRUE?",
    ["Basel Convention → transboundary movement of hazardous waste", "Ramsar Convention → conservation of wetlands", "Stockholm Convention → persistent organic pollutants (POPs)", "Montreal Protocol → greenhouse-gas emission caps"],
    [0, 1, 2],
    sol("Basel = hazardous-waste trade; Ramsar = wetlands; Stockholm = POPs; Montreal = ODS (not GHG caps — that is Kyoto/Paris).", "First three are correct.", "Basel, Ramsar, Stockholm"), "D");
  return { slug: "es-global-regional-issues", name: "Global & Regional Environmental Issues", questions: b.out };
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  BULK parametric generators (figure-bearing where it adds value)         */
/* ══════════════════════════════════════════════════════════════════════ */
type GenOut = { topic: string; difficulty: Diff; marks: 1 | 2; type: "NAT" | "MCQ" | "MSQ"; stem: string; answer: number | number[]; tolerance?: number; options?: string[]; solution: string; figure?: Fig; archetype: Arch };

const BULK: Record<string, ((rand: () => number) => GenOut)[]> = {
  "es-environmental-management-ethics": [
    (rand) => { const cc = rp([100000, 150000, 200000], rand), P = ri(rand, 40, 90) * 1000; const pct = P / cc * 100; return { topic: "Carrying Capacity", difficulty: "easy", marks: 1, type: "NAT", stem: `Read the present population and the ecological carrying capacity from the bar chart. The carrying-capacity utilisation is _____ %.`, answer: r(pct, 2), tolerance: 0.1, solution: sol("Utilisation = population/carrying capacity ×100, both read from the bars.", `$$\\dfrac{${P}}{${cc}}\\times100=${r(pct, 1)}\\%.$$`, `$${r(pct, 1)}\\%$`), figure: figBars2LB(P, cc, "population", "carrying capacity", "persons", "Present population and carrying capacity shown on the bars only."), archetype: "A" }; },
    (rand) => { const C = rp([50000, 80000, 120000], rand), i = rp([0.06, 0.08, 0.1], rand), n = ri(rand, 2, 6); const pw = C / (1 + i) ** n; return { topic: "Environmental Economics", difficulty: "hard", marks: 2, type: "NAT", stem: `At a discount rate of $${r(i * 100, 0)}\\%$, and reading the future benefit $F$ and its time horizon $n$ from the cash-flow diagram, the present worth is $₹$ _____.`, answer: r(pw, 0), tolerance: 1, solution: sol("PW = F/(1+i)^n, with F and n read from the diagram.", `$$\\dfrac{${C}}{(1+${i})^{${n}}}=${r(pw, 0)}.$$`, `$₹${r(pw, 0)}$`), figure: figPWLB(C, n), archetype: "C" }; },
    () => ({ topic: "EIA", difficulty: "medium", marks: 1, type: "MCQ", stem: "The document that lays out mitigation measures and monitoring after impact prediction in an EIA is the", options: ["Environmental Management Plan (EMP)", "Terms of Reference", "Scoping report", "Form-1"], answer: 0, solution: sol("The EMP details mitigation, monitoring and institutional arrangements.", "EMP follows impact prediction.", "EMP"), figure: figEIA(), archetype: "B" }),
    () => ({ topic: "Sustainability", difficulty: "medium", marks: 1, type: "MCQ", stem: "A municipality proposes to mine its sole confined aquifer to exhaustion within 15 years to bankroll current expansion, leaving the next generation with no water source. This plan MOST directly violates which pillar of sustainable development?", options: ["Inter-generational equity", "The polluter-pays principle", "Free trade", "Maximising present-year GDP"], answer: 0, solution: sol("Exhausting a resource so future generations cannot meet their own needs breaches inter-generational equity — the core of the Brundtland definition.", "Map the scenario to the violated principle.", "Inter-generational equity"), archetype: "B" }),
    () => ({ topic: "EIA", difficulty: "medium", marks: 1, type: "MCQ", stem: "Which stage of the EIA cycle immediately follows screening?", options: ["Scoping", "Public hearing", "Clearance", "Decommissioning"], answer: 0, solution: sol("Order: screening → scoping → impact prediction → EMP → review/clearance.", "Scoping follows screening.", "Scoping"), figure: figEIA(), archetype: "B" }),
    () => ({ topic: "EMS — ISO 14000", difficulty: "medium", marks: 1, type: "MCQ", stem: "The cyclical framework underpinning an ISO 14001 EMS is", options: ["Plan–Do–Check–Act (PDCA)", "Reduce–Reuse–Recycle", "Define–Measure–Analyse", "Strengths–Weaknesses–Opportunities–Threats"], answer: 0, solution: sol("ISO 14001 follows the PDCA continual-improvement loop.", "PDCA.", "Plan-Do-Check-Act"), archetype: "B" }),
    () => ({ topic: "Environmental Economics", difficulty: "medium", marks: 1, type: "MCQ", stem: "An uncompensated environmental cost imposed on a third party by an economic activity is called a(n)", options: ["negative externality", "opportunity cost", "sunk cost", "transfer payment"], answer: 0, solution: sol("Pollution damage to others is a negative externality the polluter-pays principle internalises.", "Negative externality.", "Negative externality"), archetype: "B" }),
  ],
  "es-environmental-chemistry": [
    (rand) => { const h = rp([1e-2, 1e-4, 1e-6, 1e-8, 1e-10], rand); const pH = -Math.log10(h); return { topic: "Acid–Base — pH", difficulty: "easy", marks: 1, type: "NAT", stem: `If $[\\text{H}^+]=${h.toExponential(0)}\\,\\text{mol/L}$, the pH is _____.`, answer: r(pH, 2), tolerance: 0.02, solution: sol("pH = −log[H⁺].", `$$-\\log(${h.toExponential(0)})=${r(pH, 1)}.$$`, `$${r(pH, 1)}$`), figure: figpHScale(pH), archetype: "A" }; },
    (rand) => { const k = rp([0.05, 0.1, 0.2, 0.231, 0.35], rand); const t = Math.log(2) / k; return { topic: "Chemical Kinetics", difficulty: "medium", marks: 2, type: "NAT", stem: `First-order decay, $k=${k}\\,\\text{d}^{-1}$. Half-life is _____ days.`, answer: r(t, 3), tolerance: 0.05, solution: sol("t½ = ln2/k.", `$$0.693/${k}=${r(t, 2)}.$$`, `$${r(t, 2)}\\,\\text{d}$`), archetype: "A" }; },
    (rand) => { const C0 = rp([80, 100, 150], rand), k = rp([0.1, 0.2, 0.3], rand), t = ri(rand, 2, 8); const C = C0 * Math.exp(-k * t); return { topic: "Chemical Kinetics — Decay", difficulty: "hard", marks: 2, type: "NAT", stem: `A pollutant decays first-order with $k=${k}\\,\\text{d}^{-1}$. Reading the initial concentration $C_0$ from the figure, its concentration after $${t}$ d is _____ mg/L.`, answer: r(C, 3), tolerance: 0.1, solution: sol("C = C₀e^{−kt}, with C₀ read from the figure.", `$$${C0}e^{-${k}\\times${t}}=${r(C, 2)}.$$`, `$${r(C, 2)}$`), figure: figConc0LB(C0), archetype: "C" }; },
    (rand) => { const N = rp([0.05, 0.1, 0.2], rand), Vs = rp([20, 25, 50], rand), Veq = rp([10, 15, 20, 25], rand); const Na = N * Veq / Vs; return { topic: "Acid–Base Titration", difficulty: "hard", marks: 2, type: "NAT", stem: `$${Vs}\\,\\text{mL}$ of an acid is titrated with $${N}\\,\\text{N}$ NaOH. Reading the equivalence-point volume $V_{eq}$ from the titration curve shown, the normality of the acid is _____ N.`, answer: r(Na, 4), tolerance: 0.002, solution: sol("At the equivalence point $N_aV_a=N_bV_b$, with $V_{eq}$ read from the curve.", `$$N_a=\\dfrac{${N}\\times${Veq}}{${Vs}}=${r(Na, 4)}.$$`, `$${r(Na, 4)}\\,\\text{N}$`), figure: figTitrationLB(Veq), archetype: "C" }; },
    () => ({ topic: "Carbonate System", difficulty: "medium", marks: 1, type: "MCQ", stem: "Alkalinity of natural water is primarily a measure of its capacity to", options: ["neutralise acid", "neutralise base", "conduct electricity", "absorb light"], answer: 0, solution: sol("Alkalinity = acid-neutralising capacity (mainly HCO₃⁻/CO₃²⁻/OH⁻).", "Acid-neutralising capacity.", "Neutralise acid"), figure: figTitration(), archetype: "B" }),
    (rand) => { const pOH = rp([2.5, 3.4, 4.6, 5.2, 6.0], rand); const pH = 14 - pOH; return { topic: "Acid–Base — pOH", difficulty: "easy", marks: 1, type: "NAT", stem: `A solution has pOH $=${pOH}$ at 25 °C. Its pH is _____.`, answer: r(pH, 2), tolerance: 0.02, solution: sol("pH + pOH = 14.", `$$14-${pOH}=${r(pH, 1)}.$$`, `$${r(pH, 1)}$`), figure: figpHScale(pH), archetype: "A" }; },
    () => ({ topic: "Units of Concentration", difficulty: "medium", marks: 1, type: "MCQ", stem: "For an ideal gas at 25 °C and 1 atm, converting a gaseous pollutant from ppm(v) to mg/m³ requires multiplying by", options: ["molecular weight / 24.45", "24.45 / molecular weight", "molecular weight × 22.4", "density of water"], answer: 0, solution: sol("mg/m³ = ppm × MW / 24.45 (molar volume 24.45 L at 25°C, 1 atm).", "× MW/24.45.", "MW/24.45"), archetype: "B" }),
  ],
  "es-environmental-microbiology": [
    (rand) => { const umax = rp([0.3, 0.4, 0.5, 0.6], rand), Ks = rp([20, 40, 50, 60], rand), S = rp([40, 80, 100, 150], rand); const mu = umax * S / (Ks + S); return { topic: "Monod Kinetics", difficulty: "hard", marks: 2, type: "NAT", stem: `A culture follows Monod kinetics at substrate $S=${S}\\,\\text{mg/L}$. Reading $\\mu_{max}$ and $K_s$ from the $\\mu$–$S$ curve shown, the specific growth rate $\\mu$ is _____ h⁻¹.`, answer: r(umax * S / (Ks + S), 4), tolerance: 0.005, solution: sol("μ = μ_max S/(K_s+S), with μ_max and K_s read from the curve.", `$$\\dfrac{${umax}\\times${S}}{${Ks}+${S}}=${r(mu, 3)}.$$`, `$${r(mu, 3)}$`), figure: figMonodLB(umax, Ks), archetype: "C" }; },
    (rand) => { const mu = rp([0.2, 0.3, 0.5, 0.693], rand); const td = Math.log(2) / mu; return { topic: "Microbial Growth", difficulty: "medium", marks: 2, type: "NAT", stem: `Specific growth rate $\\mu=${mu}\\,\\text{h}^{-1}$. Doubling time is _____ h.`, answer: r(td, 3), tolerance: 0.02, solution: sol("t_d = ln2/μ.", `$$0.693/${mu}=${r(td, 2)}.$$`, `$${r(td, 2)}\\,\\text{h}$`), figure: figGrowth(), archetype: "A" }; },
    (rand) => { const N0 = rp([100, 500, 1000], rand), n = ri(rand, 4, 10); const N = N0 * 2 ** n; return { topic: "Binary Fission", difficulty: "easy", marks: 1, type: "NAT", stem: `$${N0}$ cells after $${n}$ generations of binary fission number _____.`, answer: N, tolerance: 0.5, solution: sol("N = N₀·2ⁿ.", `$$${N0}\\times2^{${n}}=${N}.$$`, `$${N}$`), archetype: "A" }; },
    () => ({ topic: "Indicator Organisms", difficulty: "medium", marks: 1, type: "MCQ", stem: "MPN (Most Probable Number) test in water analysis estimates the density of", options: ["coliform bacteria", "viruses", "algae", "protozoa"], answer: 0, solution: sol("MPN is a statistical estimate of coliform density.", "Coliforms.", "Coliform bacteria"), archetype: "B" }),
  ],
  "es-ecology-biodiversity": [
    (rand) => { const base = rp([8000, 10000, 12000, 15000], rand), lvl = ri(rand, 2, 3); const e = base * 0.1 ** lvl; return { topic: "Energy Flow — 10% Law", difficulty: "medium", marks: 2, type: "NAT", stem: `In the energy pyramid shown, only the producer (trophic-1) energy is marked; 10% transfers per level. Energy at trophic level $${lvl + 1}$ is _____ kcal/m²/yr.`, answer: r(e, 3), tolerance: 0.5, solution: sol("Eₙ = E₀(0.1)ⁿ, with E₀ read from the pyramid.", `$$${base}\\times0.1^{${lvl}}=${r(e, 2)}.$$`, `$${r(e, 2)}$`), figure: figPyramidLB(base), archetype: "A" }; },
    (rand) => { const gpp = rp([1000, 1200, 1500, 2000], rand), resp = rp([300, 400, 600], rand); const npp = gpp - resp; return { topic: "Productivity", difficulty: "easy", marks: 1, type: "NAT", stem: `GPP $${gpp}$, respiration $${resp}\\,\\text{g C/m}^2/\\text{yr}$. NPP is _____ g C/m²/yr.`, answer: npp, tolerance: 0.5, solution: sol("NPP = GPP − R.", `$$${gpp}-${resp}=${npp}.$$`, `$${npp}$`), archetype: "A" }; },
    (rand) => { const K = rp([4000, 6000, 8000, 10000], rand), r0 = rp([0.2, 0.3, 0.4], rand); const m = r0 * K / 4; return { topic: "Logistic Growth", difficulty: "hard", marks: 2, type: "NAT", stem: `A population grows logistically at $r=${r0}\\,\\text{yr}^{-1}$. Reading the carrying capacity $K$ from the growth curve shown, the maximum $dN/dt$ ($rK/4$) is _____ /yr.`, answer: r(m, 1), tolerance: 1, solution: sol("max dN/dt = rK/4 at N=K/2, with K read from the curve.", `$$\\dfrac{${r0}\\times${K}}{4}=${r(m, 0)}.$$`, `$${r(m, 0)}$`), figure: figLogisticLB(K), archetype: "C" }; },
    () => ({ topic: "Biodiversity Indices", difficulty: "medium", marks: 1, type: "MCQ", stem: "A higher value of the Shannon–Wiener index $H'$ indicates", options: ["greater species diversity", "lower diversity", "a single dominant species", "no relationship to diversity"], answer: 0, solution: sol("H' increases with richness and evenness.", "Greater diversity.", "Greater diversity"), archetype: "B" }),
  ],
  "es-air-noise-pollution": [
    (rand) => { const L1 = rp([70, 75, 80, 85], rand), n = rp([2, 3, 4, 5, 10], rand); const L = L1 + 10 * Math.log10(n); return { topic: "Noise — Addition", difficulty: "medium", marks: 2, type: "NAT", stem: `$${n}$ identical sources each $${L1}\\,\\text{dB}$. Combined level is _____ dB.`, answer: r(L, 3), tolerance: 0.1, solution: sol("L = L₁ + 10log n.", `$$${L1}+10\\log${n}=${r(L, 2)}.$$`, `$${r(L, 2)}\\,\\text{dB}$`), archetype: "A" }; },
    (rand) => { const A = rp([150, 200, 250, 300], rand), Q = rp([4, 5, 6, 8], rand), w = rp([0.08, 0.1, 0.12], rand); const eta = (1 - Math.exp(-w * A / Q)) * 100; return { topic: "ESP — Deutsch–Anderson", difficulty: "hard", marks: 2, type: "NAT", stem: `An ESP treats $${Q}\\,\\text{m}^3/\\text{s}$. Reading the collecting area $A$ and drift velocity $w$ from the figure, its collection efficiency is _____ %.`, answer: r(eta, 3), tolerance: 0.1, solution: sol("η = 1 − e^{−wA/Q}, with A and w read from the figure.", `$$(1-e^{-${w}\\times${A}/${Q}})\\times100=${r(eta, 2)}\\%.$$`, `$${r(eta, 2)}\\%$`), figure: figESP(A, w, lbCap("Collecting area A and drift velocity w marked on the diagram only.")), archetype: "C" }; },
    (rand) => { const hs = rp([50, 60, 80, 100], rand), dh = rp([15, 20, 25, 30], rand); const H = hs + dh; return { topic: "Effective Stack Height", difficulty: "easy", marks: 1, type: "NAT", stem: `For the chimney shown, the physical stack height $h_s$ and plume rise $\\Delta h$ are marked on the diagram. The effective stack height is _____ m.`, answer: H, tolerance: 0.1, solution: sol("H = h_s + Δh, with both read from the figure.", `$$${hs}+${dh}=${H}.$$`, `$${H}\\,\\text{m}$`), figure: figStackLB(hs, dh), archetype: "A" }; },
    () => ({ topic: "Atmospheric Stability", difficulty: "hard", marks: 1, type: "MCQ", stem: "A 'fanning' plume is associated with which atmospheric condition?", options: ["Stable (inversion) layer", "Strongly unstable", "Neutral", "Superadiabatic"], answer: 0, solution: sol("Fanning occurs in a stable/inversion layer that suppresses vertical mixing.", "Stable inversion.", "Stable"), figure: figLapse("inversion"), archetype: "B" }),
  ],
  "es-water-wastewater": [
    (rand) => { const L0 = rp([200, 250, 300, 350], rand), k = rp([0.1, 0.2, 0.23, 0.3], rand), t = ri(rand, 2, 7); const y = L0 * (1 - Math.exp(-k * t)); return { topic: "BOD Kinetics", difficulty: "hard", marks: 2, type: "NAT", stem: `$L_0=${L0}\\,\\text{mg/L}$, $k=${k}\\,\\text{d}^{-1}$ (base e). BOD exerted in $${t}$ d is _____ mg/L.`, answer: r(y, 3), tolerance: 0.2, solution: sol("y_t = L₀(1−e^{−kt}).", `$$${L0}(1-e^{-${k}\\times${t}})=${r(y, 2)}.$$`, `$${r(y, 2)}$`), figure: figSag(r(L0 * 0.3, 1), r(0.7 / k, 1)), archetype: "C" }; },
    (rand) => { const Q = rp([4, 5, 6, 8, 10], rand), A = rp([200, 300, 400, 500], rand); const sor = Q * 1000 / A; return { topic: "Sedimentation — Overflow Rate", difficulty: "medium", marks: 2, type: "NAT", stem: `For the settling tank shown, read the flow $Q$ (MLD) and plan area $A$ from the diagram. The surface overflow rate $Q/A$ is _____ m³/m²/day.`, answer: r(sor, 3), tolerance: 0.1, solution: sol("SOR = Q/A, with Q and A read from the figure.", `$$\\dfrac{${Q}\\times1000}{${A}}=${r(sor, 1)}.$$`, `$${r(sor, 1)}$`), figure: figSettler(`${Q} MLD`, A, lbCap("Flow Q and plan area A marked on the diagram only.")), archetype: "A" }; },
    (rand) => { const inb = rp([180, 200, 250, 300], rand), out = rp([20, 25, 30, 40], rand); const eff = (inb - out) / inb * 100; return { topic: "Treatment Efficiency", difficulty: "medium", marks: 2, type: "NAT", stem: `Influent BOD $${inb}$, effluent $${out}\\,\\text{mg/L}$. Removal efficiency is _____ %.`, answer: r(eff, 3), tolerance: 0.1, solution: sol("η = (S₀−Se)/S₀ ×100.", `$$\\dfrac{${inb}-${out}}{${inb}}\\times100=${r(eff, 1)}\\%.$$`, `$${r(eff, 1)}\\%$`), figure: figRemoval(inb, out, "BOD", "mg/L"), archetype: "A" }; },
    (rand) => { const pop = rp([50000, 80000, 100000, 120000], rand), lpcd = rp([135, 150, 200], rand); const d = pop * lpcd / 1e6; return { topic: "Water Demand", difficulty: "easy", marks: 1, type: "NAT", stem: `Population $${pop.toLocaleString("en-IN")}$, $${lpcd}\\,\\text{lpcd}$. Average demand is _____ MLD.`, answer: r(d, 3), tolerance: 0.02, solution: sol("Demand = pop×lpcd/10⁶.", `$$\\dfrac{${pop}\\times${lpcd}}{10^6}=${r(d, 2)}.$$`, `$${r(d, 2)}$`), archetype: "A" }; },
    (rand) => { const sat = rp([8, 9, 9.2], rand), Dc = rp([2.5, 3, 3.5, 4], rand), tc = rp([1.5, 2, 2.5], rand); const minDO = sat - Dc; return { topic: "Oxygen Sag — Minimum DO", difficulty: "hard", marks: 2, type: "NAT", stem: `A river has DO saturation $${sat}\\,\\text{mg/L}$. From the oxygen-sag curve shown, read the critical deficit $D_c$. The minimum dissolved oxygen in the stream is _____ mg/L.`, answer: r(minDO, 3), tolerance: 0.05, solution: sol("Minimum DO = DO_sat − D_c, with D_c read from the sag curve.", `$$${sat}-${Dc}=${r(minDO, 2)}.$$`, `$${r(minDO, 2)}\\,\\text{mg/L}$`), figure: figSag(Dc, tc, lbCap("Critical deficit D_c (and t_c) marked on the sag curve only.")), archetype: "C" }; },
    (rand) => { const dose = rp([6, 7, 8, 9], rand), res = rp([0.5, 1, 1.5], rand); const applied = dose + res; return { topic: "Breakpoint Chlorination", difficulty: "medium", marks: 2, type: "NAT", stem: `Ammonia-bearing water is chlorinated. From the breakpoint-chlorination curve shown, read the breakpoint dose. To leave a free residual of $${res}\\,\\text{mg/L}$, the chlorine that must be applied is _____ mg/L.`, answer: r(applied, 3), tolerance: 0.05, solution: sol("Beyond the breakpoint, extra chlorine appears as free residual: applied = breakpoint dose + desired free residual.", `$$${dose}+${res}=${r(applied, 2)}.$$`, `$${r(applied, 2)}\\,\\text{mg/L}$`), figure: figBreakpointLB(dose), archetype: "C" }; },
    (rand) => { const depth = rp([1.5, 2, 2.5, 3], rand), time = rp([300, 400, 500, 600], rand); const vs = depth / time * 1000; return { topic: "Settling Velocity", difficulty: "medium", marks: 2, type: "NAT", stem: `In the settling-column test plotted in the figure, a particle settles the marked depth in the marked time. Its settling velocity is _____ mm/s.`, answer: r(vs, 3), tolerance: 0.05, solution: sol("v_s = depth ÷ time (read both from the trajectory).", `$$\\dfrac{${depth}\\,\\text{m}}{${time}\\,\\text{s}}\\times1000=${r(vs, 2)}\\,\\text{mm/s}.$$`, `$${r(vs, 2)}\\,\\text{mm/s}$`), figure: figSettleColLB(depth, time), archetype: "C" }; },
  ],
  "es-solid-hazardous-waste": [
    (rand) => { const pop = rp([100000, 200000, 250000], rand), pc = rp([0.4, 0.45, 0.5, 0.6], rand); const t = pop * pc / 1000; return { topic: "MSW Generation", difficulty: "easy", marks: 1, type: "NAT", stem: `City of $${pop.toLocaleString("en-IN")}$ at $${pc}\\,\\text{kg/cap/day}$. Daily MSW is _____ t/day.`, answer: r(t, 2), tolerance: 0.5, solution: sol("Total = pop × rate.", `$$\\dfrac{${pop}\\times${pc}}{1000}=${r(t, 1)}.$$`, `$${r(t, 1)}\\,\\text{t/day}$`), archetype: "A" }; },
    (rand) => { const d1 = rp([80, 100, 120], rand), d2 = rp([400, 500, 600], rand); const vr = (1 - d1 / d2) * 100; return { topic: "Compaction", difficulty: "medium", marks: 2, type: "NAT", stem: `Read the loose and compacted densities from the bar chart. The volume reduction $(1-\\rho_1/\\rho_2)$ achieved is _____ %.`, answer: r(vr, 3), tolerance: 0.1, solution: sol("VR = (1 − ρ₁/ρ₂)×100, both densities read from the bars.", `$$\\left(1-\\dfrac{${d1}}{${d2}}\\right)\\times100=${r(vr, 1)}\\%.$$`, `$${r(vr, 1)}\\%$`), figure: figBars2LB(d1, d2, "loose ρ₁", "compacted ρ₂", "kg/m³", "Loose and compacted densities shown on the bars only."), archetype: "A" }; },
    (rand) => { const vol = rp([300000, 500000, 800000], rand), rate = rp([40000, 50000, 60000], rand); const life = vol / rate; return { topic: "Landfill Life", difficulty: "medium", marks: 2, type: "NAT", stem: `For the landfill shown, read the usable air-space and the annual fill rate from the diagram. Its design life is _____ years.`, answer: r(life, 3), tolerance: 0.1, solution: sol("Life = air-space/annual fill, both read from the figure.", `$$\\dfrac{${vol}}{${rate}}=${r(life, 1)}.$$`, `$${r(life, 1)}\\,\\text{yr}$`), figure: figLandfillLB(vol, rate), archetype: "A" }; },
    () => ({ topic: "Waste Hierarchy", difficulty: "easy", marks: 1, type: "MCQ", stem: "Energy recovery by incineration ranks, in the waste hierarchy, above only", options: ["landfill disposal", "source reduction", "reuse", "recycling"], answer: 0, solution: sol("Order: reduce>reuse>recycle>recover>dispose. Recovery sits just above landfill.", "Above landfill disposal.", "Landfill disposal"), archetype: "B" }),
  ],
  "es-global-regional-issues": [
    (rand) => { const a = rp([50, 80, 100], rand), b = rp([2, 4, 5], rand), c = rp([0.5, 1, 2], rand); const total = a + b * 28 + c * 265; return { topic: "Carbon Footprint", difficulty: "hard", marks: 2, type: "NAT", stem: `A facility emits CO₂, CH₄ (GWP 28) and N₂O (GWP 265); the three masses (t) are shown on the bar chart. The total carbon footprint is _____ t CO₂-e.`, answer: r(total, 2), tolerance: 1, solution: sol("Σ massᵢ × GWPᵢ, with the three masses read from the bars.", `$$${a}+${b}\\times28+${c}\\times265=${r(total, 1)}.$$`, `$${r(total, 1)}$`), figure: figBars3LB([a, b, c], ["CO₂", "CH₄", "N₂O"], "t", "Masses of CO₂, CH₄ and N₂O shown on the bars only."), archetype: "C" }; },
    (rand) => { const m = rp([3, 6, 12, 18], rand), gwp = rp([21, 25, 28, 265], rand); const co2e = m * gwp; return { topic: "Global Warming Potential", difficulty: "medium", marks: 2, type: "NAT", stem: `A source emits $${m}\\,\\text{t}$ of a greenhouse gas. Reading the gas's GWP₁₀₀ from the figure, its CO₂-equivalent emission is _____ t CO₂-e.`, answer: co2e, tolerance: 0.5, solution: sol("CO₂-e = mass × GWP, with the GWP read from the figure.", `$$${m}\\times${gwp}=${co2e}.$$`, `$${co2e}$`), figure: figGWPLB(gwp, "the gas"), archetype: "A" }; },
    () => ({ topic: "Radiative Forcing", difficulty: "hard", marks: 2, type: "NAT", stem: "Doubling atmospheric CO₂ adds a radiative forcing of $3.7\\,\\text{W/m}^2$. For a climate-sensitivity parameter of $0.8\\,\\text{K per W/m}^2$, the equilibrium surface warming is _____ K.", answer: 3.7 * 0.8, tolerance: 0.02, solution: sol("Equilibrium warming $\\Delta T=\\lambda\\,\\Delta F$ (climate sensitivity × forcing) — GHGs absorb the outgoing long-wave IR.", "$$0.8\\times3.7=2.96\\,\\text{K}.$$", "$2.96\\,\\text{K}$"), archetype: "C" }),
    () => ({ topic: "Eutrophication", difficulty: "medium", marks: 1, type: "MCQ", stem: "A direct consequence of eutrophication in a water body is", options: ["dissolved-oxygen depletion from algal decay", "increased water transparency", "reduced nutrient loading", "lower BOD"], answer: 0, solution: sol("Algal blooms die and decompose, consuming DO and raising BOD.", "DO depletion.", "Oxygen depletion"), archetype: "B" }),
    () => ({ topic: "Carbon Budget", difficulty: "hard", marks: 2, type: "NAT", stem: "To hold warming below its target threshold, a remaining global carbon budget of $400\\,\\text{Gt CO}_2$ is available. At current emissions of $40\\,\\text{Gt CO}_2/\\text{yr}$ (held constant), the budget is exhausted in _____ years.", answer: 400 / 40, tolerance: 0.1, solution: sol("Years to exhaustion $=\\dfrac{\\text{remaining budget}}{\\text{annual emissions}}$ — the logic behind the Paris-Agreement temperature goals.", "$$\\dfrac{400}{40}=10\\,\\text{years}.$$", "$10$ years"), archetype: "C" }),
    () => ({ topic: "Ozone Depletion", difficulty: "hard", marks: 1, type: "MSQ", stem: "Which gases are ozone-depleting substances?", options: ["CFCs (chlorofluorocarbons)", "Halons", "Carbon tetrachloride", "Carbon dioxide"], answer: [0, 1, 2], solution: sol("CFCs, halons and CCl₄ deplete ozone; CO₂ is a GHG but not an ODS.", "First three.", "CFCs, halons, CCl₄"), archetype: "D" }),
    (rand) => { const base = rp([400, 410, 420], rand), rate = rp([2, 2.5, 3], rand), yr = ri(rand, 5, 20); const conc = base + rate * yr; return { topic: "Carbon Dioxide Trend", difficulty: "easy", marks: 1, type: "NAT", stem: `Atmospheric CO₂ is $${base}\\,\\text{ppm}$ rising at $${rate}\\,\\text{ppm/yr}$. After $${yr}$ years it is _____ ppm.`, answer: r(conc, 2), tolerance: 0.5, solution: sol("Linear extrapolation: C = C₀ + rate×t.", `$$${base}+${rate}\\times${yr}=${r(conc, 1)}.$$`, `$${r(conc, 1)}\\,\\text{ppm}$`), archetype: "A" }; },
  ],
};

const BULK_HARD: Record<string, ((rand: () => number) => GenOut)[]> = {
  "es-environmental-chemistry": [
    (rand) => { const ca = rp([20, 40, 60, 80], rand), mg = rp([12, 18, 24], rand); const h = ca * 50 / 20 + mg * 50 / 12.15; return { topic: "Hardness", difficulty: "hard", marks: 2, type: "NAT", stem: `Read the Ca²⁺ and Mg²⁺ concentrations from the bar chart. The total hardness as CaCO₃ (eq. wt Ca 20, Mg 12.15) is _____ mg/L.`, answer: r(h, 2), tolerance: 1, solution: sol("Convert each ion to CaCO₃ (×50/eq.wt) and sum, with both concentrations read from the bars.", `$$${ca}\\times\\dfrac{50}{20}+${mg}\\times\\dfrac{50}{12.15}=${r(h, 1)}.$$`, `$${r(h, 1)}$`), figure: figBars2LB(ca, mg, "Ca²⁺", "Mg²⁺", "mg/L", "Ca²⁺ and Mg²⁺ concentrations shown on the bars only."), archetype: "C" }; },
    (rand) => { const pOH = rp([2.5, 3.4, 4.6, 5.2], rand); const pH = 14 - pOH; return { topic: "Acid–Base", difficulty: "medium", marks: 1, type: "NAT", stem: `A solution has pOH $=${pOH}$ at 25 °C. Its pH is _____.`, answer: r(pH, 2), tolerance: 0.02, solution: sol("pH + pOH = 14.", `$$14-${pOH}=${r(pH, 1)}.$$`, `$${r(pH, 1)}$`), archetype: "A" }; },
  ],
  "es-water-wastewater": [
    (rand) => { const dmm = rp([0.01, 0.02, 0.05], rand); const d = dmm / 1000; const vs = 9.81 * 1650 * d * d / (18 * 1e-3); return { topic: "Stokes' Law", difficulty: "hard", marks: 2, type: "NAT", stem: `A particle ($\\rho_s=2650\\,\\text{kg/m}^3$) settles in water ($\\mu=10^{-3}\\,\\text{Pa·s}$). Reading its diameter from the figure, the Stokes velocity is _____ ×10⁻³ m/s.`, answer: r(vs / 1e-3, 4), tolerance: 0.3, solution: sol("v_s = g(ρ_s−ρ)d²/18μ, with d read from the figure.", `$$\\dfrac{9.81\\times1650\\times(${d})^2}{18\\times10^{-3}}=${r(vs, 5)}.$$`, `$${r(vs / 1e-3, 3)}\\times10^{-3}$`), figure: figStokesLB(dmm), archetype: "C" }; },
    (rand) => { const Q = rp([8000, 10000, 12000], rand), S0 = rp([200, 250, 300], rand), V = rp([1500, 2000, 2500], rand), X = rp([2500, 3000, 3500], rand); const fm = Q * S0 / (V * X); return { topic: "Activated Sludge — F/M", difficulty: "hard", marks: 2, type: "NAT", stem: `ASP: $Q=${Q}\\,\\text{m}^3/\\text{d}$, $S_0=${S0}$, $V=${V}\\,\\text{m}^3$, MLSS $${X}\\,\\text{mg/L}$. F/M is _____ d⁻¹.`, answer: r(fm, 4), tolerance: 0.005, solution: sol("F/M = QS₀/(VX).", `$$\\dfrac{${Q}\\times${S0}}{${V}\\times${X}}=${r(fm, 3)}.$$`, `$${r(fm, 3)}$`), figure: figASP(), archetype: "C" }; },
  ],
  "es-air-noise-pollution": [
    (rand) => { const Qs = rp([80, 100, 120], rand), u = rp([3, 4, 5, 6], rand), sy = rp([25, 30, 40], rand), sz = rp([15, 20, 25], rand), H = rp([30, 40, 50, 60], rand); const C = (Qs / (Math.PI * u * sy * sz)) * Math.exp(-(H * H) / (2 * sz * sz)); return { topic: "Gaussian Plume", difficulty: "hard", marks: 2, type: "NAT", stem: `A stack emits $Q=${Qs}\\,\\text{g/s}$. Using the effective height $H$, wind speed $u$ and dispersion coefficients $\\sigma_y,\\sigma_z$ marked on the diagram, the ground-level centreline concentration (full reflection) is _____ ×10⁻⁴ g/m³.`, answer: r(C / 1e-4, 4), tolerance: 0.2, solution: sol("C = Q/(πuσ_yσ_z)·exp(−H²/2σ_z²); H,u,σ_y,σ_z read from the figure.", `$$\\dfrac{${Qs}}{\\pi\\times${u}\\times${sy}\\times${sz}}e^{-${H}^2/(2\\times${sz}^2)}=${r(C, 8)}.$$`, `$${r(C / 1e-4, 3)}\\times10^{-4}$`), figure: figPlumeLB(H, u, sy, sz), archetype: "C" }; },
    (rand) => { const L1 = rp([68, 70, 72], rand), L2 = rp([73, 75, 76], rand); const L = 10 * Math.log10(10 ** (L1 / 10) + 10 ** (L2 / 10)); return { topic: "Noise — Combination", difficulty: "hard", marks: 2, type: "NAT", stem: `Two sources $${L1}\\,\\text{dB}$ and $${L2}\\,\\text{dB}$ at a point. Combined level is _____ dB.`, answer: r(L, 3), tolerance: 0.1, solution: sol("L = 10log(10^{L₁/10}+10^{L₂/10}).", `$$10\\log(10^{${L1}/10}+10^{${L2}/10})=${r(L, 2)}.$$`, `$${r(L, 2)}\\,\\text{dB}$`), archetype: "C" }; },
  ],
  "es-ecology-biodiversity": [
    (rand) => { const N0 = rp([500, 1000, 2000], rand), r0 = rp([0.02, 0.05, 0.08], rand), t = ri(rand, 5, 15); const N = N0 * Math.exp(r0 * t); return { topic: "Population Growth — Exponential", difficulty: "hard", marks: 2, type: "NAT", stem: `A population grows exponentially at $r=${r0}\\,\\text{yr}^{-1}$. Reading the initial size $N_0$ from the figure, after $${t}$ yr, $N=$ _____.`, answer: r(N, 1), tolerance: 1, solution: sol("N = N₀e^{rt}, with N₀ read from the figure.", `$$${N0}e^{${r0}\\times${t}}=${r(N, 0)}.$$`, `$${r(N, 0)}$`), figure: figExpLB(N0), archetype: "C" }; },
  ],
  "es-solid-hazardous-waste": [
    (rand) => { const mass = rp([1000, 1500, 2000, 2500], rand), y = rp([0.1, 0.12, 0.15, 0.2], rand); const gas = mass * y; return { topic: "Landfill Gas", difficulty: "medium", marks: 2, type: "NAT", stem: `Decomposable waste $${mass}\\,\\text{kg}$ yields $${y}\\,\\text{m}^3/\\text{kg}$ gas. Total gas is _____ m³.`, answer: r(gas, 2), tolerance: 0.5, solution: sol("Gas = mass × yield.", `$$${mass}\\times${y}=${r(gas, 1)}.$$`, `$${r(gas, 1)}$`), figure: figLandfill(), archetype: "A" }; },
    (rand) => { const C = rp([40, 45, 50], rand), H = rp([5, 6, 7], rand), O = rp([35, 40, 42], rand); const hhv = 337 * C + 1419 * (H - O / 8); return { topic: "Calorific Value", difficulty: "hard", marks: 2, type: "NAT", stem: `Modified Dulong $HHV=337C+1419(H-O/8)$ kJ/kg with $C=${C}\\%$, $H=${H}\\%$, $O=${O}\\%$. HHV is _____ kJ/kg.`, answer: r(hhv, 1), tolerance: 5, solution: sol("Apply the modified Dulong formula.", `$$337(${C})+1419(${H}-${O}/8)=${r(hhv, 0)}.$$`, `$${r(hhv, 0)}\\,\\text{kJ/kg}$`), figure: figRemoval(r(hhv / 1000, 1), 0, "HHV", "MJ/kg", "Energy content of the waste fuel."), archetype: "C" }; },
    (rand) => { const wet = rp([1000, 1500, 2000], rand), mc = rp([40, 50, 60], rand); const dry = wet * (1 - mc / 100); return { topic: "Moisture Content", difficulty: "medium", marks: 2, type: "NAT", stem: `Wet MSW $${wet}\\,\\text{kg}$ at $${mc}\\%$ moisture. The dry-solids mass is _____ kg.`, answer: r(dry, 1), tolerance: 0.5, solution: sol("Dry = wet × (1 − moisture).", `$$${wet}(1-${mc}/100)=${r(dry, 1)}.$$`, `$${r(dry, 1)}\\,\\text{kg}$`), archetype: "A" }; },
    (rand) => { const d1 = rp([80, 100, 120, 150], rand), d2 = rp([400, 500, 600, 700], rand); const vr = (1 - d1 / d2) * 100; return { topic: "Compaction", difficulty: "medium", marks: 2, type: "NAT", stem: `Read the loose and compacted densities from the bar chart. The volume reduction $(1-\\rho_1/\\rho_2)$ is _____ %.`, answer: r(vr, 3), tolerance: 0.1, solution: sol("VR = (1 − ρ₁/ρ₂)×100, both densities read from the bars.", `$$\\left(1-\\dfrac{${d1}}{${d2}}\\right)\\times100=${r(vr, 1)}\\%.$$`, `$${r(vr, 1)}\\%$`), figure: figBars2LB(d1, d2, "loose ρ₁", "compacted ρ₂", "kg/m³", "Loose and compacted densities shown on the bars only."), archetype: "A" }; },
    (rand) => { const t = rp([100, 150, 200, 250], rand), eff = rp([0.7, 0.75, 0.8], rand); const rec = t * eff; return { topic: "Material Recovery", difficulty: "easy", marks: 1, type: "NAT", stem: `A MRF receives $${t}\\,\\text{t/day}$ and recovers recyclables at $${r(eff * 100, 0)}\\%$ efficiency. The recovered mass is _____ t/day.`, answer: r(rec, 2), tolerance: 0.5, solution: sol("Recovered = throughput × efficiency.", `$$${t}\\times${eff}=${r(rec, 1)}.$$`, `$${r(rec, 1)}\\,\\text{t/day}$`), figure: figRemoval(t, r(rec, 0), "MRF recovery", "t/day"), archetype: "A" }; },
    () => ({ topic: "Biomedical Waste", difficulty: "medium", marks: 1, type: "MCQ", stem: "Under colour-coded biomedical-waste segregation, anatomical/infected waste for incineration is typically placed in the", options: ["yellow bag", "blue bag", "red bag", "white container"], answer: 0, solution: sol("Yellow = incinerable anatomical/soiled waste; red = contaminated recyclable plastics; blue/white = glass/sharps.", "Yellow bag.", "Yellow"), archetype: "B" }),
    () => ({ topic: "Incineration", difficulty: "medium", marks: 1, type: "MCQ", stem: "The main purpose of maintaining ~850–1100 °C with adequate residence time in an MSW incinerator is to", options: ["ensure complete combustion and destroy dioxins/pathogens", "maximise ash volume", "reduce the need for air pollution control", "increase moisture"], answer: 0, solution: sol("High temperature + 2 s residence ensures complete burnout and dioxin destruction.", "Complete combustion.", "Complete combustion"), archetype: "B" }),
  ],
  "es-global-regional-issues": [
    (rand) => { const a = rp([50, 80, 100], rand), b = rp([2, 4, 5], rand), c = rp([0.5, 1, 2], rand); const total = a + b * 28 + c * 265; return { topic: "Carbon Footprint", difficulty: "hard", marks: 2, type: "NAT", stem: `A facility emits CO₂, CH₄ (GWP 28) and N₂O (GWP 265); the three masses (t) are shown on the bar chart. The total carbon footprint is _____ t CO₂-e.`, answer: r(total, 2), tolerance: 1, solution: sol("Σ massᵢ × GWPᵢ, with the three masses read from the bars.", `$$${a}+${b}\\times28+${c}\\times265=${r(total, 1)}.$$`, `$${r(total, 1)}$`), figure: figBars3LB([a, b, c], ["CO₂", "CH₄", "N₂O"], "t", "Masses of CO₂, CH₄ and N₂O shown on the bars only."), archetype: "C" }; },
  ],
};

/** Pad a bank with bulk parametric questions (deduped by stem + figure) up to `target`.
 * Load-bearing questions move the varying data ONTO the figure, so their stems are
 * identical across draws; we key the dedupe on stem+figure so distinct figures (and
 * hence distinct questions) are kept rather than collapsed to one. */
function padBank(bank: { slug: string; name: string; questions: Q[] }, rand: () => number, target: number) {
  const gens = [...(BULK[bank.slug] ?? []), ...(BULK_HARD[bank.slug] ?? [])];
  if (gens.length === 0) return;
  const keyOf = (stem: string, figure?: Fig) => stem + (figure ? "\u0000" + figure.markup : "");
  const seen = new Set(bank.questions.map((q) => keyOf(q.stem, "figure" in q ? q.figure : undefined)));
  let guard = 0;
  let n = bank.questions.length;
  const prefix = (bank.questions[0]?.id ?? `${bank.slug}-x`).replace(/-\d+$/, "");
  while (bank.questions.length < target && guard < target * 50) {
    guard++;
    const g = gens[Math.floor(rand() * gens.length)](rand);
    const key = keyOf(g.stem, g.figure);
    if (seen.has(key)) continue;
    seen.add(key);
    n++;
    const base = { id: `${prefix}-${String(n).padStart(3, "0")}`, subject: bank.name, topic: g.topic, difficulty: g.difficulty, marks: g.marks, archetype: g.archetype, solution: g.solution, ...(g.figure ? { figure: g.figure } : {}) };
    if (g.type === "NAT") bank.questions.push({ ...base, type: "NAT", stem: g.stem, answer: g.answer as number, tolerance: g.tolerance ?? 0.01 } as Q);
    else if (g.type === "MCQ") bank.questions.push({ ...base, type: "MCQ", stem: g.stem, options: g.options!, answer: g.answer as number } as Q);
    else bank.questions.push({ ...base, type: "MSQ", stem: g.stem, options: g.options!, answer: g.answer as number[] } as Q);
  }
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  EMIT                                                                     */
/* ══════════════════════════════════════════════════════════════════════ */
const rand = rng(0x45531);
const banks = [
  buildManagement(rand),
  buildChemistry(rand),
  buildMicrobiology(rand),
  buildEcology(rand),
  buildAirNoise(rand),
  buildWater(rand),
  buildSolidWaste(rand),
  buildGlobal(rand),
];

// Pad each bank to a healthy size (mirrors CE bank sizes ~70).
const TARGET = 70;
for (const bank of banks) padBank(bank, rand, TARGET);

const outDir = resolve(process.cwd(), "apps/web/src/data/questions/practice");
let totalQ = 0, totalFig = 0;
for (const bank of banks) {
  const figs = bank.questions.filter((q) => "figure" in q && q.figure).length;
  totalQ += bank.questions.length; totalFig += figs;
  const file = resolve(outDir, `${bank.slug}.json`);
  writeFileSync(file, JSON.stringify({ slug: bank.slug, name: bank.name, questions: bank.questions }, null, 2) + "\n", "utf8");
  console.log(`✅ ${bank.slug.padEnd(36)} ${String(bank.questions.length).padStart(3)} Qs · ${String(figs).padStart(2)} figures`);
}
console.log(`\nTotal: ${totalQ} questions across ${banks.length} ES banks · ${totalFig} figures (${(totalFig / totalQ * 100).toFixed(0)}%)`);
