/**
 * CrackGate — Practice Bank Generator (parametric, verified-by-construction)
 * ==========================================================================
 * Emits 10 per-subject JSON files into apps/web/src/data/questions/practice/.
 * Each subject gets EXACTLY 175 questions under the Council blueprint:
 *     A = 30  Formula & unit-conversion traps
 *     B = 30  Vintage elite PYQ variants (re-parameterised)
 *     C = 60  Advanced diagrammatic / chart-based  (EVERY question has a figure)
 *     D = 55  High-caliber multi-stage "rank determinator"
 *
 * Answers are COMPUTED in code, so there are zero arithmetic errors by
 * construction. Output is deterministic (seeded per subject) so re-runs are
 * reproducible. Run:  node scripts/build_practice_bank.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "..", "apps", "web", "src", "data", "questions", "practice");

/* ------------------------------------------------------------------ */
/* Seeded RNG (mulberry32) — deterministic, fast                       */
/* ------------------------------------------------------------------ */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function strSeed(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ------------------------------------------------------------------ */
/* Numeric helpers                                                     */
/* ------------------------------------------------------------------ */
const r2 = (x) => Math.round(x * 100) / 100;
const r3 = (x) => Math.round(x * 1000) / 1000;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
/** pretty-print a number without trailing-zero noise */
function fmt(x) {
  if (!isFinite(x)) return String(x);
  if (Number.isInteger(x)) return String(x);
  const s = r2(x);
  return String(s);
}

/* ------------------------------------------------------------------ */
/* Question constructors                                               */
/* ------------------------------------------------------------------ */
function mcq(o) {
  return { id: "", subject: o.subject, topic: o.topic, difficulty: o.difficulty, type: "MCQ",
    stem: o.stem, options: o.options, answer: o.answer, solution: o.solution,
    ...(o.figure ? { figure: o.figure } : {}), archetype: o.archetype, marks: o.marks };
}
function nat(o) {
  return { id: "", subject: o.subject, topic: o.topic, difficulty: o.difficulty, type: "NAT",
    stem: o.stem, answer: r2(o.answer), tolerance: o.tolerance, solution: o.solution,
    ...(o.figure ? { figure: o.figure } : {}), archetype: o.archetype, marks: o.marks };
}
function msq(o) {
  return { id: "", subject: o.subject, topic: o.topic, difficulty: o.difficulty, type: "MSQ",
    stem: o.stem, options: o.options, answer: [...o.answer].sort((a, b) => a - b), solution: o.solution,
    ...(o.figure ? { figure: o.figure } : {}), archetype: o.archetype, marks: o.marks };
}

/** 4-part NAT solution string (Core Principle / Mathematical Track / Given / Acceptance) */
function solN(core, track, given, target, lo, hi) {
  return `**Core Principle**\n${core}\n\n**Mathematical Track**\n${track}\n\n**Given Parameters (SI / consistent units)**\n${given}\n\n**Acceptance Validation**\nTarget: ${target} | Range: ${lo} to ${hi}`;
}
/** 4-part MCQ/MSQ solution string (Core / Track / Given / Correct Option) */
function solC(core, track, given, correct) {
  return `**Core Principle**\n${core}\n\n**Mathematical Track**\n${track}\n\n**Given Parameters (SI / consistent units)**\n${given}\n\n**Correct Option**\n${correct}`;
}

/** Build an MCQ around a numeric answer with plausible distractors (incl. trap values). */
function numMCQ(o) {
  // o.correct (number), o.traps (number[]), o.unit (string), o.fmt fn
  const f = o.fmtFn || fmt;
  const set = new Map();
  set.set(r2(o.correct), true);
  for (const t of o.traps) { if (set.size >= 4) break; if (isFinite(t)) set.set(r2(t), false); }
  // pad with nearby values if not enough distinct distractors
  let k = 1;
  while (set.size < 4) { const c = r2(o.correct * (1 + 0.13 * k) + (k % 2 ? 1 : -1)); if (!set.has(c)) set.set(c, false); k++; }
  const entries = [...set.keys()];
  // shuffle deterministically using provided rng
  for (let i = entries.length - 1; i > 0; i--) { const j = Math.floor(o.rng() * (i + 1)); [entries[i], entries[j]] = [entries[j], entries[i]]; }
  const options = entries.map((v) => `${f(v)}${o.unit ? " " + o.unit : ""}`);
  const answer = entries.indexOf(r2(o.correct));
  return { options, answer };
}

/* ================================================================== */
/* FIGURE BUILDERS — typed kinds rendered by question-figure.tsx       */
/* ================================================================== */
const figMohr = (sigma1, sigma3, opt = {}) => ({ kind: "mohr", sigma1: r2(sigma1), sigma3: r2(sigma3), ...(opt.phi != null ? { phi: r2(opt.phi) } : {}), ...(opt.cohesion != null ? { cohesion: r2(opt.cohesion) } : {}), caption: opt.caption });
const figStress = (sx, sy, txy, caption) => ({ kind: "stress-block", sx: r2(sx), sy: r2(sy), txy: r2(txy), caption });
const figStereonet = (planes, caption) => ({ kind: "stereonet", planes, caption });
const figVent = (nodes, branches, caption) => ({ kind: "ventilation", nodes, branches, caption });
const figPQ = (a, b, resistances, caption) => ({ kind: "pq-curve", fan: { a: r2(a), b: r2(b) }, resistances, caption });
const figBench = (o) => ({ kind: "bench", benchHeight: o.benchHeight, burden: o.burden, spacing: o.spacing, ...(o.holes != null ? { holes: o.holes } : {}), ...(o.slopeAngle != null ? { slopeAngle: o.slopeAngle } : {}), caption: o.caption });
const figSvg = (markup, caption) => ({ kind: "svg", markup, caption });

/* ------------------------------------------------------------------ */
/* Generic parametric SVG charts (escape-hatch figures)                */
/* ------------------------------------------------------------------ */
function svgBar({ labels, values, unit = "", caption = "", title = "" }) {
  const W = 320, H = 200, padL = 40, padB = 34, padT = title ? 24 : 12;
  const max = Math.max(...values) * 1.15 || 1;
  const n = values.length;
  const bw = (W - padL - 14) / n * 0.62;
  const gap = (W - padL - 14) / n;
  const Y = (v) => (H - padB) - (v / max) * (H - padB - padT);
  let bars = "";
  values.forEach((v, i) => {
    const x = padL + gap * i + (gap - bw) / 2;
    const y = Y(v);
    bars += `<rect x='${r2(x)}' y='${r2(y)}' width='${r2(bw)}' height='${r2(H - padB - y)}' fill='#2563eb'/>`;
    bars += `<text x='${r2(x + bw / 2)}' y='${r2(y - 4)}' text-anchor='middle' font-size='10' fill='#0f172a'>${fmt(v)}</text>`;
    bars += `<text x='${r2(x + bw / 2)}' y='${H - padB + 14}' text-anchor='middle' font-size='10' fill='#475569'>${labels[i]}</text>`;
  });
  const titleT = title ? `<text x='${W / 2}' y='16' text-anchor='middle' font-size='12' fill='#0f172a'>${title}</text>` : "";
  return figSvg(`<svg viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif'>${titleT}<line x1='${padL}' y1='${H - padB}' x2='${W - 6}' y2='${H - padB}' stroke='#cbd5e1'/><line x1='${padL}' y1='${padT}' x2='${padL}' y2='${H - padB}' stroke='#cbd5e1'/>${bars}${unit ? `<text x='${padL - 4}' y='${padT + 4}' text-anchor='end' font-size='9' fill='#94a3b8'>${unit}</text>` : ""}</svg>`, caption);
}

function svgLine({ series, xlabel = "", ylabel = "", caption = "", title = "", xmax, ymax }) {
  const W = 340, H = 210, padL = 44, padB = 36, padT = title ? 24 : 12;
  const allX = series.flatMap((s) => s.points.map((p) => p[0]));
  const allY = series.flatMap((s) => s.points.map((p) => p[1]));
  const XM = xmax ?? ((Math.max(...allX) * 1.1) || 1);
  const YM = ymax ?? ((Math.max(...allY) * 1.1) || 1);
  const X = (v) => padL + (v / XM) * (W - padL - 12);
  const Y = (v) => (H - padB) - (v / YM) * (H - padB - padT);
  let paths = "";
  for (const s of series) {
    const d = s.points.map((p, i) => `${i ? "L" : "M"}${r2(X(p[0]))},${r2(Y(p[1]))}`).join(" ");
    paths += `<path d='${d}' fill='none' stroke='${s.color || "#2563eb"}' stroke-width='2'/>`;
    if (s.label) { const last = s.points[s.points.length - 1]; paths += `<text x='${r2(X(last[0]) - 4)}' y='${r2(Y(last[1]) - 6)}' font-size='10' fill='${s.color || "#2563eb"}'>${s.label}</text>`; }
    if (s.dots) for (const p of s.points) paths += `<circle cx='${r2(X(p[0]))}' cy='${r2(Y(p[1]))}' r='2.5' fill='${s.color || "#2563eb"}'/>`;
  }
  const titleT = title ? `<text x='${W / 2}' y='16' text-anchor='middle' font-size='12' fill='#0f172a'>${title}</text>` : "";
  return figSvg(`<svg viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif'>${titleT}<line x1='${padL}' y1='${H - padB}' x2='${W - 6}' y2='${H - padB}' stroke='#94a3b8'/><line x1='${padL}' y1='${padT}' x2='${padL}' y2='${H - padB}' stroke='#94a3b8'/>${paths}<text x='${(W + padL) / 2}' y='${H - 6}' text-anchor='middle' font-size='10' fill='#475569'>${xlabel}</text><text x='12' y='${(H - padB + padT) / 2}' transform='rotate(-90 12 ${(H - padB + padT) / 2})' text-anchor='middle' font-size='10' fill='#475569'>${ylabel}</text></svg>`, caption);
}

/** Cash-flow timeline: flows[] (signed), period labels 0..n */
function svgCashFlow({ flows, caption = "", unit = "" }) {
  const W = 340, H = 170, padL = 30, base = 95, n = flows.length;
  const step = (W - padL - 20) / (n - 1 || 1);
  const maxAbs = Math.max(...flows.map((f) => Math.abs(f))) || 1;
  let arrows = "", axis = `<line x1='${padL}' y1='${base}' x2='${W - 10}' y2='${base}' stroke='#334155' stroke-width='1.5'/>`;
  flows.forEach((f, i) => {
    const x = padL + step * i;
    const h = (Math.abs(f) / maxAbs) * 60;
    const up = f >= 0;
    const y2 = up ? base - h : base + h;
    arrows += `<line x1='${r2(x)}' y1='${base}' x2='${r2(x)}' y2='${r2(y2)}' stroke='${up ? "#16a34a" : "#b91c1c"}' stroke-width='2'/>`;
    arrows += `<path d='M${r2(x - 4)},${r2(up ? y2 + 6 : y2 - 6)} L${r2(x)},${r2(y2)} L${r2(x + 4)},${r2(up ? y2 + 6 : y2 - 6)} z' fill='${up ? "#16a34a" : "#b91c1c"}'/>`;
    arrows += `<text x='${r2(x)}' y='${r2(up ? y2 - 6 : y2 + 14)}' text-anchor='middle' font-size='9' fill='#0f172a'>${fmt(f)}</text>`;
    arrows += `<text x='${r2(x)}' y='${base + 16}' text-anchor='middle' font-size='9' fill='#475569'>${i}</text>`;
  });
  return figSvg(`<svg viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif'>${axis}${arrows}<text x='${W / 2}' y='${H - 6}' text-anchor='middle' font-size='10' fill='#475569'>period (years)${unit ? " — " + unit : ""}</text></svg>`, caption);
}

/** CPM activity-on-arc network from explicit node positions + edges {from,to,dur} */
function svgCPM({ nodes, edges, caption = "" }) {
  const W = 420, H = 200;
  let e = "", c = "", lbl = "";
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  edges.forEach((ed) => {
    const a = pos[ed.from], b = pos[ed.to];
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, R = 15;
    e += `<line x1='${r2(a.x + ux * R)}' y1='${r2(a.y + uy * R)}' x2='${r2(b.x - ux * R)}' y2='${r2(b.y - uy * R)}' stroke='#334155' marker-end='url(#cpmA)'/>`;
    lbl += `<text x='${r2((a.x + b.x) / 2)}' y='${r2((a.y + b.y) / 2 - 5)}' text-anchor='middle' font-size='11' fill='#0f172a'>${ed.dur}</text>`;
  });
  nodes.forEach((n) => { c += `<circle cx='${n.x}' cy='${n.y}' r='15' fill='#2563eb'/><text x='${n.x}' y='${n.y + 4}' text-anchor='middle' font-size='12' fill='#fff'>${n.id}</text>`; });
  return figSvg(`<svg viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif'><defs><marker id='cpmA' markerWidth='8' markerHeight='8' refX='6' refY='3' orient='auto'><path d='M0,0 L6,3 L0,6 z' fill='#334155'/></marker></defs>${e}${c}${lbl}<text x='${W / 2}' y='${H - 6}' text-anchor='middle' font-size='10' fill='#475569'>activity-on-arc network (arc label = duration)</text></svg>`, caption);
}

/** Reliability block diagram: blocks = array of {label, r}; mode 'series'|'parallel' */
function svgReliability({ blocks, mode = "series", caption = "" }) {
  const W = 340, H = 140, cy = 70;
  let b = "", wires = "";
  if (mode === "series") {
    const step = (W - 60) / blocks.length;
    blocks.forEach((bl, i) => {
      const x = 30 + step * i + step / 2 - 28;
      b += `<rect x='${r2(x)}' y='${cy - 16}' width='56' height='32' rx='4' fill='#dbeafe' stroke='#2563eb'/><text x='${r2(x + 28)}' y='${cy - 2}' text-anchor='middle' font-size='10' fill='#1e3a8a'>${bl.label}</text><text x='${r2(x + 28)}' y='${cy + 11}' text-anchor='middle' font-size='10' fill='#1e3a8a'>R=${bl.r}</text>`;
    });
    wires = `<line x1='10' y1='${cy}' x2='${W - 10}' y2='${cy}' stroke='#334155'/>`;
  } else {
    const gap = 44;
    blocks.forEach((bl, i) => {
      const y = cy - ((blocks.length - 1) * gap) / 2 + gap * i;
      b += `<rect x='${W / 2 - 28}' y='${y - 14}' width='56' height='28' rx='4' fill='#dcfce7' stroke='#16a34a'/><text x='${W / 2}' y='${y}' text-anchor='middle' font-size='10' fill='#166534'>${bl.label} R=${bl.r}</text>`;
      wires += `<line x1='60' y1='${y}' x2='${W / 2 - 28}' y2='${y}' stroke='#334155'/><line x1='${W / 2 + 28}' y1='${y}' x2='${W - 60}' y2='${y}' stroke='#334155'/>`;
    });
    wires += `<line x1='10' y1='${cy}' x2='60' y2='${cy}' stroke='#334155'/><line x1='${W - 60}' y1='${cy}' x2='${W - 10}' y2='${cy}' stroke='#334155'/><line x1='60' y1='${cy - 44}' x2='60' y2='${cy + 44}' stroke='#334155'/><line x1='${W - 60}' y1='${cy - 44}' x2='${W - 60}' y2='${cy + 44}' stroke='#334155'/>`;
  }
  return figSvg(`<svg viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif'>${wires}${b}<text x='${W / 2}' y='${H - 6}' text-anchor='middle' font-size='10' fill='#475569'>${mode} reliability block diagram</text></svg>`, caption);
}

/* ------------------------------------------------------------------ */
/* Round-robin filler: build exactly `count` items from template list  */
/* ------------------------------------------------------------------ */
function fill(templates, count, rng) {
  const out = [];
  let i = 0;
  while (out.length < count) {
    const t = templates[i % templates.length];
    out.push(t(rng, out.length));
    i++;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Assemble one subject file from archetype template pools             */
/* ------------------------------------------------------------------ */
function buildSubject({ slug, name, subjectTag, pools }) {
  const rng = mulberry32(strSeed(slug));
  const counts = { A: 30, B: 30, C: 60, D: 55 };
  const all = [];
  for (const arch of ["A", "B", "C", "D"]) {
    const items = fill(pools[arch], counts[arch], rng);
    items.forEach((q, idx) => {
      q.id = `${slug}-${arch.toLowerCase()}-${String(idx + 1).padStart(2, "0")}`;
      q.subject = subjectTag;
      q.archetype = arch;
      if (arch === "C" && !q.figure) throw new Error(`C question without figure in ${slug}: ${q.id}`);
      all.push(q);
    });
  }
  const json = JSON.stringify({ slug, name, questions: all }, null, 2);
  writeFileSync(join(OUT_DIR, `${slug}.json`), json + "\n");
  return all.length;
}

export {
  mulberry32, strSeed, r2, r3, rad, deg, fmt, mcq, nat, msq, solN, solC, numMCQ,
  figMohr, figStress, figStereonet, figVent, figPQ, figBench, figSvg,
  svgBar, svgLine, svgCashFlow, svgCPM, svgReliability, fill, buildSubject,
};
