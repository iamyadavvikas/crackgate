/** Drilling & Blasting — 175-question template pools (A30/B30/C60/D55). */
import { mcq, nat, r2, deg, rad, fmt, solN, solC, numMCQ, figBench, svgBar, svgLine, figSvg } from "../build_practice_bank.mjs";

const SUB = "Drilling & Blasting";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const rf = (rng, a, b) => r2(a + rng() * (b - a));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const expl = ri(rng, 200, 600), rock = ri(rng, 1500, 4000); const pf = expl / rock;
    return nat({ topic: "Powder Factor", difficulty: "easy", marks: 1,
      stem: `A blast uses $${expl}\\,\\text{kg}$ of explosive to break $${rock}\\,\\text{t}$ of rock. Find the powder factor (kg/t). Round off to two decimal places.`, answer: pf, tolerance: 0.01,
      solution: solN("PF $=$ explosive mass $/$ rock broken.", `$$PF=\\frac{${expl}}{${rock}}=${fmt(pf)}\\ \\text{kg/t}$$`, `expl $=${expl},\\ \\text{rock}=${rock}$.`, fmt(pf), r2(pf - 0.01), r2(pf + 0.01)) }); },
  (rng) => { const d = ri(rng, 89, 165); const B = 25 * d / 1000;
    return nat({ topic: "Burden — Rule of Thumb", difficulty: "easy", marks: 1,
      stem: `Using the rule burden $\\approx 25\\times$ hole diameter, find the burden (m) for a $${d}\\,\\text{mm}$ blasthole. Round off to two decimal places.`, answer: B, tolerance: 0.02,
      solution: solN("$B=25\\,d$ (d in m).", `$$B=25\\times${d / 1000}=${fmt(B)}\\ \\text{m}$$`, `$d=${d}$ mm.`, fmt(B), r2(B - 0.02), r2(B + 0.02)) }); },
  (rng) => { const d = ri(rng, 100, 165), L = rf(rng, 8, 15), rho = rf(rng, 0.85, 1.2); const lin = Math.PI / 4 * (d / 1000) ** 2 * rho * 1000; const charge = lin * L;
    return nat({ topic: "Charge per Hole", difficulty: "medium", marks: 2,
      stem: `A $${d}\\,\\text{mm}$ hole has a charge column of $${L}\\,\\text{m}$ with explosive density $${rho}\\,\\text{g/cm}^3$. Find the charge mass per hole (kg). Round off to two decimal places.`, answer: charge, tolerance: 0.5,
      solution: solN("Linear charge $=\\frac{\\pi}{4}d^2\\rho$; mass $=$ linear $\\times L$.", `$$q=\\frac{\\pi}{4}(${d / 1000})^2\\times${rho}\\times1000\\times${L}=${fmt(charge)}\\ \\text{kg}$$`, `$d=${d},\\ L=${L},\\ \\rho=${rho}$.`, fmt(charge), r2(charge - 0.5), r2(charge + 0.5)) }); },
  (rng) => { const B = rf(rng, 4, 8), S = rf(rng, 5, 10), H = ri(rng, 10, 16); const vol = B * S * H;
    return nat({ topic: "Volume per Hole", difficulty: "easy", marks: 1,
      stem: `For burden $${B}\\,\\text{m}$, spacing $${S}\\,\\text{m}$, bench height $${H}\\,\\text{m}$, find the rock volume broken per hole (m³). Round off to two decimal places.`, answer: vol, tolerance: 0.5,
      solution: solN("$V=B\\times S\\times H$.", `$$V=${B}\\times${S}\\times${H}=${fmt(vol)}\\ \\text{m}^3$$`, `$B=${B},\\ S=${S},\\ H=${H}$.`, fmt(vol), r2(vol - 0.5), r2(vol + 0.5)) }); },
  (rng) => { const D = ri(rng, 50, 200), R = ri(rng, 100, 500); const sd = R / Math.sqrt(D);
    return nat({ topic: "Scaled Distance", difficulty: "medium", marks: 2,
      stem: `A charge of $${D}\\,\\text{kg}$ per delay detonates $${R}\\,\\text{m}$ from a structure. Find the scaled distance (m/kg$^{0.5}$). Round off to two decimal places.`, answer: sd, tolerance: 0.05,
      solution: solN("$SD=R/\\sqrt{W}$.", `$$SD=\\frac{${R}}{\\sqrt{${D}}}=${fmt(sd)}$$`, `$R=${R},\\ W=${D}$.`, fmt(sd), r2(sd - 0.05), r2(sd + 0.05)) }); },
  (rng) => { const S = rf(rng, 5, 10), B = rf(rng, 4, 8); const ratio = S / B;
    const m = numMCQ({ rng, correct: ratio, traps: [B / S, S * B, S - B] });
    return mcq({ topic: "Spacing/Burden Ratio", difficulty: "easy", marks: 1,
      stem: `A pattern has spacing $${S}\\,\\text{m}$ and burden $${B}\\,\\text{m}$. Find the S/B ratio.`, options: m.options, answer: m.answer,
      solution: solC("$S/B$ ratio.", `$$\\frac{${S}}{${B}}=${fmt(ratio)}$$`, `$S=${S},\\ B=${B}$.`, `$${fmt(ratio)}$.`) }); },
  (rng) => { const rho = rf(rng, 0.85, 1.25), vod = ri(rng, 3500, 5500); const Pd = rho * 1000 * vod ** 2 / 4 / 1e9;
    return nat({ topic: "Detonation Pressure", difficulty: "hard", marks: 2,
      stem: `An explosive of density $${rho}\\,\\text{g/cm}^3$ has VOD $${vod}\\,\\text{m/s}$. Estimate the detonation pressure $P_d=\\rho V^2/4$ (GPa). Round off to two decimal places.`, answer: Pd, tolerance: 0.05,
      solution: solN("$P_d=\\rho V^2/4$.", `$$P_d=\\frac{${rho}\\times1000\\times${vod}^2}{4}=${fmt(Pd)}\\ \\text{GPa}$$`, `$\\rho=${rho},\\ V=${vod}$.`, fmt(Pd), r2(Pd - 0.05), r2(Pd + 0.05)) }); },
  (rng) => { const sub = rf(rng, 0.3, 1.0), B = rf(rng, 4, 8); const ratio = sub / B;
    return nat({ topic: "Subdrill Ratio", difficulty: "easy", marks: 1,
      stem: `A blast uses subdrill $${sub}\\,\\text{m}$ with burden $${B}\\,\\text{m}$. Find the subdrill-to-burden ratio. Round off to two decimal places.`, answer: ratio, tolerance: 0.01,
      solution: solN("ratio $=$ subdrill $/$ burden.", `$$\\frac{${sub}}{${B}}=${fmt(ratio)}$$`, `sub $=${sub},\\ B=${B}$.`, fmt(ratio), r2(ratio - 0.01), r2(ratio + 0.01)) }); },
];

/* ---------------- Archetype B — vintage PYQ re-parameterised -------- */
const B = [
  (rng) => { const k = pick(rng, [1140, 1500, 1720]), W = ri(rng, 50, 200), SD = rf(rng, 8, 30); const ppv = k * (SD) ** (-1.6);
    return nat({ topic: "PPV — USBM Predictor", difficulty: "hard", marks: 2,
      stem: `Using $PPV=k\\,(SD)^{-1.6}$ with $k=${k}$ and scaled distance $${SD}$, find the peak particle velocity (mm/s). Round off to two decimal places.`, answer: ppv, tolerance: 0.5,
      solution: solN("$PPV=k\\,SD^{-1.6}$.", `$$PPV=${k}\\times${SD}^{-1.6}=${fmt(ppv)}\\ \\text{mm/s}$$`, `$k=${k},\\ SD=${SD}$.`, fmt(ppv), r2(ppv - 0.5), r2(ppv + 0.5)) }); },
  (rng) => { const holes = ri(rng, 30, 80), q = rf(rng, 40, 120), rockPerHole = ri(rng, 400, 900); const pf = (holes * q) / (holes * rockPerHole);
    return nat({ topic: "Blast — Overall Powder Factor", difficulty: "medium", marks: 2,
      stem: `A round of $${holes}$ holes each carries $${q}\\,\\text{kg}$ and breaks $${rockPerHole}\\,\\text{t}$. Find the powder factor (kg/t). Round off to two decimal places.`, answer: pf, tolerance: 0.01,
      solution: solN("PF $=$ total explosive $/$ total rock.", `$$PF=\\frac{${q}}{${rockPerHole}}=${fmt(pf)}\\ \\text{kg/t}$$`, `$q=${q},\\ \\text{rock}=${rockPerHole}$.`, fmt(pf), r2(pf - 0.01), r2(pf + 0.01)) }); },
  (rng) => { const x50target = rf(rng, 0.2, 0.6), A = pick(rng, [8, 10, 12]); const n = 1.2; const passing = 100 * (1 - Math.exp(-Math.LN2 * (x50target / x50target) ** n));
    const Xc = x50target / (Math.log(2)) ** (1 / n); const target = Xc;
    return nat({ topic: "Fragmentation — Characteristic Size", difficulty: "hard", marks: 2,
      stem: `In the Rosin-Rammler model with $x_{50}=${x50target}\\,\\text{m}$ and uniformity $n=1.2$, find the characteristic size $X_c=x_{50}/(\\ln 2)^{1/n}$ (m). Round off to two decimal places.`, answer: target, tolerance: 0.02,
      solution: solN("$X_c=x_{50}/(\\ln2)^{1/n}$.", `$$X_c=\\frac{${x50target}}{(\\ln2)^{1/1.2}}=${fmt(target)}\\ \\text{m}$$`, `$x_{50}=${x50target},\\ n=1.2$.`, fmt(target), r2(target - 0.02), r2(target + 0.02)) }); },
  (rng) => { const Q = ri(rng, 100, 400), energy = ri(rng, 3500, 4500); const total = Q * energy / 1000;
    return nat({ topic: "Explosive Energy", difficulty: "medium", marks: 2,
      stem: `A charge of $${Q}\\,\\text{kg}$ has specific energy $${energy}\\,\\text{kJ/kg}$. Find the total energy released (MJ). Round off to two decimal places.`, answer: total, tolerance: 1,
      solution: solN("$E=Q\\times e$.", `$$E=\\frac{${Q}\\times${energy}}{1000}=${fmt(total)}\\ \\text{MJ}$$`, `$Q=${Q},\\ e=${energy}$.`, fmt(total), r2(total - 1), r2(total + 1)) }); },
  (rng) => { const len = ri(rng, 12, 20), stem = rf(rng, 3, 6); const charge = len - stem;
    return nat({ topic: "Charge Column Length", difficulty: "easy", marks: 1,
      stem: `A $${len}\\,\\text{m}$ hole has a stemming of $${stem}\\,\\text{m}$. Find the charge column length (m). Round off to two decimal places.`, answer: charge, tolerance: 0.02,
      solution: solN("Charge $=$ hole $-$ stemming.", `$$L_c=${len}-${stem}=${fmt(charge)}\\ \\text{m}$$`, `hole $=${len}$, stem $=${stem}$.`, fmt(charge), r2(charge - 0.02), r2(charge + 0.02)) }); },
  (rng) => { const rows = ri(rng, 3, 6), holesPerRow = ri(rng, 6, 12), delay = ri(rng, 17, 42); const total = (rows * holesPerRow - 1) * delay;
    return nat({ topic: "Delay Sequence — Total Time", difficulty: "medium", marks: 2,
      stem: `A pattern fires $${rows * holesPerRow}$ holes sequentially with $${delay}\\,\\text{ms}$ between each. Find the total firing time (ms). Round off to two decimal places.`, answer: total, tolerance: 1,
      solution: solN("Total $=(N-1)\\times$ delay.", `$$t=(${rows * holesPerRow}-1)\\times${delay}=${fmt(total)}\\ \\text{ms}$$`, `$N=${rows * holesPerRow},\\ \\Delta=${delay}$.`, fmt(total), r2(total - 1), r2(total + 1)) }); },
  (rng) => { const pf = rf(rng, 0.3, 0.7), rho = rf(rng, 2.5, 2.8); const sc = pf * rho;
    return nat({ topic: "Specific Charge", difficulty: "medium", marks: 2,
      stem: `A rock of density $${rho}\\,\\text{t/m}^3$ is blasted at powder factor $${pf}\\,\\text{kg/t}$. Find the specific charge (kg/m³). Round off to two decimal places.`, answer: sc, tolerance: 0.01,
      solution: solN("Specific charge $=$ PF $\\times\\rho$.", `$$q=${pf}\\times${rho}=${fmt(sc)}\\ \\text{kg/m}^3$$`, `PF $=${pf},\\ \\rho=${rho}$.`, fmt(sc), r2(sc - 0.01), r2(sc + 0.01)) }); },
  (rng) => { const depth = ri(rng, 8, 16), pen = rf(rng, 0.4, 1.2); const time = depth / pen;
    return nat({ topic: "Drilling — Time per Hole", difficulty: "easy", marks: 1,
      stem: `A drill penetrates at $${pen}\\,\\text{m/min}$. Find the time to drill a $${depth}\\,\\text{m}$ hole (min). Round off to two decimal places.`, answer: time, tolerance: 0.05,
      solution: solN("time $=$ depth $/$ rate.", `$$t=\\frac{${depth}}{${pen}}=${fmt(time)}\\ \\text{min}$$`, `depth $=${depth},\\ rate=${pen}$.`, fmt(time), r2(time - 0.05), r2(time + 0.05)) }); },
];

/* ---------------- Archetype C — diagrammatic (every Q has a figure) -- */
const C = [
  (rng) => { const BH = ri(rng, 10, 16), burden = ri(rng, 4, 8), spacing = ri(rng, 5, 10), holes = ri(rng, 4, 9); const vol = BH * burden * spacing * holes;
    return nat({ topic: "Blast Pattern — Total Volume", difficulty: "medium", marks: 2,
      stem: `From the bench pattern ($${holes}$ holes, burden $${burden}\\,\\text{m}$, spacing $${spacing}\\,\\text{m}$, height $${BH}\\,\\text{m}$), find the total rock volume broken (m³). Round off to two decimal places.`, answer: vol, tolerance: 1,
      figure: figBench({ benchHeight: BH, burden, spacing, holes, caption: `${holes} holes` }),
      solution: solN("$V=N\\times B\\times S\\times H$.", `$$V=${holes}\\times${burden}\\times${spacing}\\times${BH}=${fmt(vol)}$$`, `$N=${holes}$.`, fmt(vol), r2(vol - 1), r2(vol + 1)) }); },
  (rng) => { const BH = ri(rng, 10, 16), burden = ri(rng, 4, 8), spacing = ri(rng, 5, 10); const sub = rf(rng, 0.5, 1.5); const hole = BH + sub;
    return nat({ topic: "Blasthole — Total Depth", difficulty: "medium", marks: 2,
      stem: `The bench (height $${BH}\\,\\text{m}$) is drilled with subdrill $${sub}\\,\\text{m}$. Find the total hole depth (m). Round off to two decimal places.`, answer: hole, tolerance: 0.02,
      figure: figBench({ benchHeight: BH, burden, spacing, caption: `subdrill ${sub} m` }),
      solution: solN("hole $=$ bench $+$ subdrill.", `$$H_h=${BH}+${sub}=${fmt(hole)}\\ \\text{m}$$`, `$H=${BH},\\ sub=${sub}$.`, fmt(hole), r2(hole - 0.02), r2(hole + 0.02)) }); },
  (rng) => { const BH = ri(rng, 10, 16), slope = ri(rng, 60, 78); const toe = BH / Math.tan(rad(slope));
    return nat({ topic: "Bench Face — Toe Offset", difficulty: "medium", marks: 2,
      stem: `A bench face (height $${BH}\\,\\text{m}$) is inclined at $${slope}^{\\circ}$. Find the toe-to-crest horizontal offset (m). Round off to two decimal places.`, answer: toe, tolerance: 0.05,
      figure: figBench({ benchHeight: BH, burden: 6, spacing: 7, slopeAngle: slope, caption: `${slope}° face` }),
      solution: solN("offset $=H/\\tan\\theta$.", `$$x=\\frac{${BH}}{\\tan${slope}^{\\circ}}=${fmt(toe)}$$`, `$H=${BH},\\ \\theta=${slope}$.`, fmt(toe), r2(toe - 0.05), r2(toe + 0.05)) }); },
  (rng) => { const vals = [ri(rng, 200, 400), ri(rng, 300, 500), ri(rng, 350, 600), ri(rng, 250, 450)]; const tot = vals.reduce((a, b) => a + b, 0);
    return nat({ topic: "Explosive Consumption — Total", difficulty: "easy", marks: 1,
      stem: `The bar chart shows explosive used (kg) in four rounds. Find the total consumption (kg). Round off to two decimal places.`, answer: tot, tolerance: 1,
      figure: svgBar({ labels: ["R1", "R2", "R3", "R4"], values: vals, caption: "Explosive use", title: "kg/round" }),
      solution: solN("Sum the four bars.", `$$\\Sigma=${vals.join("+")}=${fmt(tot)}$$`, `four rounds.`, fmt(tot), r2(tot - 1), r2(tot + 1)) }); },
  (rng) => { const sd = [10, 15, 20, 25, 30]; const k = 1140; const ppv = sd.map((s) => r2(k * s ** -1.6)); const idx = ri(rng, 0, 4); const target = ppv[idx];
    return nat({ topic: "PPV vs Scaled Distance — Read-off", difficulty: "hard", marks: 2,
      stem: `From the attenuation curve, read the PPV (mm/s) at scaled distance $${sd[idx]}$. Round off to two decimal places.`, answer: target, tolerance: 0.5,
      figure: svgLine({ series: [{ points: sd.map((s, i) => [s, ppv[i]]), color: "#dc2626", dots: true, label: "PPV" }], xlabel: "scaled distance", ylabel: "PPV (mm/s)", caption: "Vibration attenuation" }),
      solution: solN("Read the curve at the given SD.", `$$PPV=${fmt(target)}\\ \\text{mm/s}$$`, `$SD=${sd[idx]}$.`, fmt(target), r2(target - 0.5), r2(target + 0.5)) }); },
  (rng) => { const sizes = [0.1, 0.2, 0.3, 0.4, 0.5]; const x50 = 0.3; const n = 1.4; const pass = sizes.map((x) => r2(100 * (1 - Math.exp(-Math.LN2 * (x / x50) ** n)))); const idx = ri(rng, 0, 4); const target = pass[idx];
    return nat({ topic: "Fragmentation — % Passing", difficulty: "hard", marks: 2,
      stem: `From the sieve curve (Rosin-Rammler), read the % passing at size $${sizes[idx]}\\,\\text{m}$. Round off to two decimal places.`, answer: target, tolerance: 1,
      figure: svgLine({ series: [{ points: sizes.map((x, i) => [x, pass[i]]), color: "#2563eb", dots: true, label: "% pass" }], xlabel: "size (m)", ylabel: "% passing", caption: "Fragment size distribution" }),
      solution: solN("Read the curve at the given size.", `$$P=${fmt(target)}\\%$$`, `$x=${sizes[idx]}$.`, fmt(target), r2(target - 1), r2(target + 1)) }); },
  (rng) => { const hole = ri(rng, 12, 18), stem = rf(rng, 3, 5), sub = rf(rng, 0.5, 1.2); const charge = hole - stem;
    return nat({ topic: "Hole Loading Diagram", difficulty: "medium", marks: 2,
      stem: `The loading diagram shows a $${hole}\\,\\text{m}$ hole with $${stem}\\,\\text{m}$ stemming. Find the charged length (m). Round off to two decimal places.`, answer: charge, tolerance: 0.02,
      figure: figSvg(`<svg viewBox='0 0 120 200' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='9'><rect x='50' y='10' width='20' height='40' fill='#cbd5e1'/><text x='75' y='32' fill='#475569'>stem ${stem}m</text><rect x='50' y='50' width='20' height='130' fill='#f59e0b'/><text x='75' y='118' fill='#475569'>charge</text><line x1='40' y1='10' x2='40' y2='180' stroke='#1e293b'/><text x='5' y='98'>${hole}m</text></svg>`, "Blasthole loading"),
      solution: solN("charge $=$ hole $-$ stemming.", `$$L_c=${hole}-${stem}=${fmt(charge)}$$`, `hole $=${hole},\\ stem=${stem}$.`, fmt(charge), r2(charge - 0.02), r2(charge + 0.02)) }); },
  (rng) => { const rows = [1, 2, 3, 4]; const delay = ri(rng, 25, 50); const times = rows.map((r) => (r - 1) * delay);
    return nat({ topic: "Row Delay Timing", difficulty: "medium", marks: 2,
      stem: `The timing plot shows row-by-row firing at $${delay}\\,\\text{ms}$ inter-row delay. Find the firing time of row 4 (ms). Round off to two decimal places.`, answer: times[3], tolerance: 1,
      figure: svgLine({ series: [{ points: rows.map((r, i) => [r, times[i]]), color: "#16a34a", dots: true, label: "delay" }], xlabel: "row", ylabel: "time (ms)", caption: "Inter-row delay" }),
      solution: solN("row 4 time $=(4-1)\\times$ delay.", `$$t_4=3\\times${delay}=${fmt(times[3])}\\ \\text{ms}$$`, `delay $=${delay}$.`, fmt(times[3]), r2(times[3] - 1), r2(times[3] + 1)) }); },
  (rng) => { const d = ri(rng, 100, 165), L = rf(rng, 8, 14), rho = rf(rng, 0.85, 1.2); const charge = Math.PI / 4 * (d / 1000) ** 2 * rho * 1000 * L;
    return nat({ topic: "Charge Mass from Geometry", difficulty: "hard", marks: 2,
      stem: `The diagram shows a $${d}\\,\\text{mm}$ hole charged over $${L}\\,\\text{m}$ with explosive of $${rho}\\,\\text{g/cm}^3$. Find the charge mass (kg). Round off to two decimal places.`, answer: charge, tolerance: 0.5,
      figure: figSvg(`<svg viewBox='0 0 120 180' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='9'><rect x='50' y='20' width='22' height='140' fill='#f59e0b'/><text x='78' y='90' fill='#475569'>${L}m</text><text x='40' y='14' text-anchor='middle'>${d}mm</text></svg>`, "Charge column"),
      solution: solN("mass $=\\frac{\\pi}{4}d^2\\rho L$.", `$$q=\\frac{\\pi}{4}(${d / 1000})^2\\times${rho}\\times1000\\times${L}=${fmt(charge)}$$`, `$d=${d},\\ L=${L},\\ \\rho=${rho}$.`, fmt(charge), r2(charge - 0.5), r2(charge + 0.5)) }); },
  (rng) => { const dist = [0, 50, 100, 150, 200]; const k = 1140; const ppv = dist.map((x) => x === 0 ? 200 : r2(k * (x / Math.sqrt(100)) ** -1.6)); const idx = ri(rng, 1, 4); const target = ppv[idx];
    return nat({ topic: "Vibration vs Distance", difficulty: "hard", marks: 2,
      stem: `For a $100\\,\\text{kg}$ charge, the plotted PPV decays with distance. Read the PPV (mm/s) at $${dist[idx]}\\,\\text{m}$. Round off to two decimal places.`, answer: target, tolerance: 0.5,
      figure: svgLine({ series: [{ points: dist.slice(1).map((x, i) => [x, ppv[i + 1]]), color: "#dc2626", dots: true, label: "PPV" }], xlabel: "distance (m)", ylabel: "PPV (mm/s)", caption: "Decay with distance" }),
      solution: solN("Read off the decay curve.", `$$PPV=${fmt(target)}\\ \\text{mm/s}$$`, `$R=${dist[idx]}$.`, fmt(target), r2(target - 0.5), r2(target + 0.5)) }); },
  (rng) => { const burden = ri(rng, 4, 8), spacing = ri(rng, 5, 10), holes = ri(rng, 5, 10); const area = burden * spacing * holes;
    return nat({ topic: "Pattern — Plan Area", difficulty: "easy", marks: 1,
      stem: `The plan shows $${holes}$ holes on a $${burden}\\times${spacing}\\,\\text{m}$ grid. Find the total plan area covered (m²). Round off to two decimal places.`, answer: area, tolerance: 0.5,
      figure: figBench({ benchHeight: 12, burden, spacing, holes, caption: "Pattern plan" }),
      solution: solN("area $=N\\times B\\times S$.", `$$A=${holes}\\times${burden}\\times${spacing}=${fmt(area)}$$`, `$N=${holes}$.`, fmt(area), r2(area - 0.5), r2(area + 0.5)) }); },
  (rng) => { const vals = [ri(rng, 0.3, 0.5) * 100 | 0, ri(rng, 0.4, 0.6) * 100 | 0, ri(rng, 0.5, 0.7) * 100 | 0]; const pf = vals.map((v) => r2(v / 100)); const avg = pf.reduce((a, b) => a + b, 0) / 3;
    return nat({ topic: "Powder Factor — Bench Comparison", difficulty: "medium", marks: 2,
      stem: `The bar chart shows powder factor (kg/m³) for three benches. Find the average powder factor. Round off to two decimal places.`, answer: avg, tolerance: 0.02,
      figure: svgBar({ labels: ["B1", "B2", "B3"], values: pf, caption: "PF by bench", title: "kg/m³" }),
      solution: solN("Average the three values.", `$$\\overline{PF}=\\frac{${pf.join("+")}}{3}=${fmt(avg)}$$`, `three benches.`, fmt(avg), r2(avg - 0.02), r2(avg + 0.02)) }); },
];

/* ---------------- Archetype D — rank determinator (multi-stage) ----- */
const D = [
  (rng) => { const d = ri(rng, 115, 165), H = ri(rng, 12, 16), rho = rf(rng, 2.5, 2.7), pf = rf(rng, 0.4, 0.6), explRho = rf(rng, 0.9, 1.15);
    const stem = r2(25 * d / 1000), sub = r2(8 * d / 1000); const charge = r2(H + sub - stem);
    const lin = r2(Math.PI / 4 * (d / 1000) ** 2 * explRho * 1000); const q = r2(lin * charge);
    const rockVolPerHole = r2(q / pf / rho); const burden = r2(Math.sqrt(rockVolPerHole / H * (1)));
    return nat({ topic: "Integrated Blast Design — Burden", difficulty: "hard", marks: 2,
      stem: `Design data: $${d}\\,\\text{mm}$ hole, bench $${H}\\,\\text{m}$, subdrill $=8d$, stemming $=25d$, explosive $${explRho}\\,\\text{g/cm}^3$, target powder factor $${pf}\\,\\text{kg/t}$, rock $${rho}\\,\\text{t/m}^3$. Charge mass $=${q}\\,\\text{kg}$ breaks $V=q/(PF\\cdot\\rho)$ m³ over height $H$ for $B\\times S=V/H$ with $S=B$. Find the burden $B$ (m). Round off to two decimal places.`, answer: burden, tolerance: 0.1,
      solution: solN("Compute charge, then rock volume $V=q/(PF\\rho)$, then $B=\\sqrt{V/H}$ with $S=B$.", `$$q=${q},\\ V=\\frac{${q}}{${pf}\\times${rho}}=${rockVolPerHole},\\ B=\\sqrt{\\frac{${rockVolPerHole}}{${H}}}=${fmt(burden)}$$`, `$d=${d},\\ H=${H}$.`, fmt(burden), r2(burden - 0.1), r2(burden + 0.1)) }); },
  (rng) => { const holes = ri(rng, 40, 90), q = rf(rng, 50, 120), rockPerHole = ri(rng, 500, 900), price = ri(rng, 80, 160);
    const totRock = holes * rockPerHole, totExpl = r2(holes * q), cost = r2(totExpl * price), costPerT = r2(cost / totRock);
    return nat({ topic: "Blast Economics — Cost per Tonne", difficulty: "hard", marks: 2,
      stem: `A round: $${holes}$ holes, $${q}\\,\\text{kg/hole}$, $${rockPerHole}\\,\\text{t/hole}$, explosive at ₹$${price}\\,\\text{/kg}$. Find the explosive cost per tonne (₹/t). Round off to two decimal places.`, answer: costPerT, tolerance: 0.05,
      solution: solN("cost/t $=$ (holes·q·price)$/$(holes·rock).", `$$\\frac{${q}\\times${price}}{${rockPerHole}}=${fmt(costPerT)}\\ ₹/t$$`, `$q=${q},\\ price=${price}$.`, fmt(costPerT), r2(costPerT - 0.05), r2(costPerT + 0.05)) }); },
  (rng) => { const W = ri(rng, 80, 200), R = ri(rng, 80, 250), k = pick(rng, [1140, 1500]); const sd = r2(R / Math.sqrt(W)); const ppv = r2(k * sd ** -1.6);
    const limit = pick(rng, [5, 10, 12.5]); const safe = ppv <= limit;
    return mcq({ topic: "Vibration Compliance Check", difficulty: "hard", marks: 2,
      stem: `Charge $${W}\\,\\text{kg/delay}$ at $${R}\\,\\text{m}$; $SD=${sd}$, $PPV=k\\,SD^{-1.6}$ with $k=${k}$ giving $${ppv}\\,\\text{mm/s}$. Limit $=${limit}\\,\\text{mm/s}$. Is the blast compliant?`,
      options: ["Yes, PPV is within the limit", "No, PPV exceeds the limit", "Cannot determine without frequency", "Exactly at the limit only"],
      answer: safe ? 0 : 1,
      solution: solC("Compare computed PPV against the limit.", `$$PPV=${ppv}\\ \\text{vs}\\ ${limit}\\ \\text{mm/s}$$`, `$W=${W},\\ R=${R}$.`, safe ? "Compliant (within limit)." : "Non-compliant (exceeds limit).") }); },
  (rng) => { const H = ri(rng, 10, 16), B = rf(rng, 4, 7), S = rf(rng, 5, 9), rho = rf(rng, 2.5, 2.7), pf = rf(rng, 0.3, 0.55);
    const vol = r2(B * S * H), tonnes = r2(vol * rho), charge = r2(tonnes * pf);
    return nat({ topic: "Charge from Production Target", difficulty: "hard", marks: 2,
      stem: `For burden $${B}\\,\\text{m}$, spacing $${S}\\,\\text{m}$, height $${H}\\,\\text{m}$, rock $${rho}\\,\\text{t/m}^3$, powder factor $${pf}\\,\\text{kg/t}$, find the charge required per hole (kg). Round off to two decimal places.`, answer: charge, tolerance: 0.1,
      solution: solN("$V=BSH$, tonnes $=V\\rho$, charge $=$ tonnes·PF.", `$$V=${vol},\\ t=${tonnes},\\ q=${tonnes}\\times${pf}=${fmt(charge)}$$`, `$B=${B},\\ S=${S},\\ H=${H}$.`, fmt(charge), r2(charge - 0.1), r2(charge + 0.1)) }); },
  (rng) => { const depth = ri(rng, 12, 18), pen = rf(rng, 0.5, 1.0), setup = rf(rng, 2, 5), holes = ri(rng, 20, 40);
    const perHole = r2(depth / pen + setup), total = r2(perHole * holes / 60);
    return nat({ topic: "Drilling Shift Planning", difficulty: "hard", marks: 2,
      stem: `Each $${depth}\\,\\text{m}$ hole drills at $${pen}\\,\\text{m/min}$ plus $${setup}\\,\\text{min}$ setup. For $${holes}$ holes, find the total drilling time (h). Round off to two decimal places.`, answer: total, tolerance: 0.05,
      solution: solN("per hole $=$ depth/rate $+$ setup; total $=$ N·perHole/60.", `$$t_h=\\frac{${depth}}{${pen}}+${setup}=${perHole}\\ \\text{min};\\ T=\\frac{${holes}\\times${perHole}}{60}=${fmt(total)}\\ \\text{h}$$`, `$N=${holes}$.`, fmt(total), r2(total - 0.05), r2(total + 0.05)) }); },
  (rng) => { const d = ri(rng, 100, 150), spacingTraps = true; const rho = rf(rng, 0.9, 1.2), L = rf(rng, 9, 14);
    const lin = r2(Math.PI / 4 * (d / 1000) ** 2 * rho * 1000); const q = r2(lin * L); const energy = ri(rng, 3800, 4200); const E = r2(q * energy / 1000);
    return nat({ topic: "Energy Delivered per Hole", difficulty: "hard", marks: 2,
      stem: `A $${d}\\,\\text{mm}$ hole charged $${L}\\,\\text{m}$ ($${rho}\\,\\text{g/cm}^3$, $${energy}\\,\\text{kJ/kg}$). Find the energy delivered per hole (MJ). Round off to two decimal places.`, answer: E, tolerance: 1,
      solution: solN("$q=\\frac{\\pi}{4}d^2\\rho L$; $E=q\\,e$.", `$$q=${q}\\ \\text{kg},\\ E=\\frac{${q}\\times${energy}}{1000}=${fmt(E)}\\ \\text{MJ}$$`, `$d=${d},\\ L=${L}$.`, fmt(E), r2(E - 1), r2(E + 1)) }); },
  (rng) => { const x50 = rf(rng, 0.25, 0.5), n = pick(rng, [1.2, 1.4, 1.6]), x = rf(rng, 0.3, 0.7); const pass = r2(100 * (1 - Math.exp(-Math.LN2 * (x / x50) ** n)));
    return nat({ topic: "Fragmentation — Oversize Fraction", difficulty: "hard", marks: 2,
      stem: `Rosin-Rammler with $x_{50}=${x50}\\,\\text{m}$, $n=${n}$. Find the % passing at size $${x}\\,\\text{m}$. Round off to two decimal places.`, answer: pass, tolerance: 0.5,
      solution: solN("$P=100[1-e^{-\\ln2\\,(x/x_{50})^n}]$.", `$$P=100\\left[1-e^{-\\ln2(${x}/${x50})^{${n}}}\\right]=${fmt(pass)}\\%$$`, `$x_{50}=${x50},\\ n=${n}$.`, fmt(pass), r2(pass - 0.5), r2(pass + 0.5)) }); },
  (rng) => { const rows = ri(rng, 4, 7), perRow = ri(rng, 8, 14), delay = ri(rng, 17, 42), interRow = ri(rng, 42, 100);
    const N = rows * perRow; const lastHole = r2((perRow - 1) * delay + (rows - 1) * interRow);
    return nat({ topic: "Delay Network — Last Detonation", difficulty: "hard", marks: 2,
      stem: `A pattern: $${rows}$ rows of $${perRow}$ holes, $${delay}\\,\\text{ms}$ in-row delay, $${interRow}\\,\\text{ms}$ inter-row delay. Find the detonation time of the last hole (ms). Round off to two decimal places.`, answer: lastHole, tolerance: 1,
      solution: solN("last $=(perRow-1)\\Delta_{row}+(rows-1)\\Delta_{inter}$.", `$$t=(${perRow}-1)${delay}+(${rows}-1)${interRow}=${fmt(lastHole)}\\ \\text{ms}$$`, `$rows=${rows},\\ perRow=${perRow}$.`, fmt(lastHole), r2(lastHole - 1), r2(lastHole + 1)) }); },
  (rng) => { const Wmax = ri(rng, 50, 150), R = ri(rng, 100, 300), sdLimit = pick(rng, [20, 25, 30]); const Wallowed = r2((R / sdLimit) ** 2);
    return nat({ topic: "Max Charge per Delay", difficulty: "hard", marks: 2,
      stem: `To keep scaled distance $\\ge${sdLimit}$ at $${R}\\,\\text{m}$, find the maximum allowable charge per delay (kg). Round off to two decimal places.`, answer: Wallowed, tolerance: 0.5,
      solution: solN("$W_{max}=(R/SD)^2$.", `$$W=\\left(\\frac{${R}}{${sdLimit}}\\right)^2=${fmt(Wallowed)}\\ \\text{kg}$$`, `$R=${R},\\ SD=${sdLimit}$.`, fmt(Wallowed), r2(Wallowed - 0.5), r2(Wallowed + 0.5)) }); },
  (rng) => { const vol = ri(rng, 5000, 15000), rho = rf(rng, 2.5, 2.7), pf = rf(rng, 0.35, 0.55), perHole = rf(rng, 40, 90);
    const tonnes = r2(vol * rho), totCharge = r2(tonnes * pf), holes = Math.ceil(totCharge / perHole);
    return nat({ topic: "Number of Holes for a Round", difficulty: "hard", marks: 2,
      stem: `A round must break $${vol}\\,\\text{m}^3$ ($${rho}\\,\\text{t/m}^3$) at PF $${pf}\\,\\text{kg/t}$; each hole takes $${perHole}\\,\\text{kg}$. Find the number of holes required (round up). Round off to two decimal places.`, answer: holes, tolerance: 0.5,
      solution: solN("tonnes $=V\\rho$; total charge $=t\\cdot PF$; holes $=\\lceil$charge/perHole$\\rceil$.", `$$t=${tonnes},\\ Q=${totCharge},\\ N=\\lceil${totCharge}/${perHole}\\rceil=${holes}$$`, `$V=${vol}$.`, fmt(holes), holes - 0.5, holes + 0.5) }); },
];

export default { slug: "drilling-blasting", name: SUB, subjectTag: SUB, pools: { A, B, C, D } };
