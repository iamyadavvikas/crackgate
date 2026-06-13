/** Underground Mining — 175-question template pools (A30/B30/C60/D55). */
import { mcq, nat, r2, deg, rad, fmt, solN, solC, numMCQ, svgBar, svgLine, figSvg } from "../build_practice_bank.mjs";

const SUB = "Underground Mining";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const rf = (rng, a, b) => r2(a + rng() * (b - a));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const Wp = ri(rng, 12, 24), Wb = ri(rng, 4, 8); const e = (1 - (Wp * Wp) / ((Wp + Wb) ** 2)) * 100;
    return nat({ topic: "Bord & Pillar — Extraction Ratio", difficulty: "medium", marks: 2,
      stem: `Square pillars of side $${Wp}\\,\\text{m}$ are formed with $${Wb}\\,\\text{m}$ wide bords. Find the percentage extraction. Round off to two decimal places.`, answer: e, tolerance: 0.1,
      solution: solN("$e=1-\\dfrac{W_p^2}{(W_p+W_b)^2}$ for square pillars.", `$$e=1-\\frac{${Wp}^2}{(${Wp}+${Wb})^2}=${fmt(e)}\\%$$`, `$W_p=${Wp},\\ W_b=${Wb}$.`, fmt(e), r2(e - 0.1), r2(e + 0.1)) }); },
  (rng) => { const rho = ri(rng, 2400, 2700), H = ri(rng, 150, 500); const sv = rho * 9.81 * H / 1e6;
    return nat({ topic: "Cover Load — Vertical Stress", difficulty: "medium", marks: 2,
      stem: `Find the vertical (cover) stress (MPa) at depth $${H}\\,\\text{m}$ for strata of density $${rho}\\,\\text{kg/m}^3$. Round off to two decimal places.`, answer: sv, tolerance: 0.05,
      solution: solN("$\\sigma_v=\\rho g H$ (Pa) $\\to$ MPa.", `$$\\sigma_v=\\frac{${rho}\\times9.81\\times${H}}{10^6}=${fmt(sv)}$$`, `$\\rho=${rho},\\ H=${H}$.`, fmt(sv), r2(sv - 0.05), r2(sv + 0.05)) }); },
  (rng) => { const W = ri(rng, 2000, 8000), theta = ri(rng, 5, 20), mu = pick(rng, [0.02, 0.03, 0.05]); const T = W * (Math.sin(rad(theta)) + mu * Math.cos(rad(theta)));
    return nat({ topic: "Rope Haulage — Tension Up-grade", difficulty: "hard", marks: 2,
      stem: `A loaded tub train weighing $${W}\\,\\text{kN}$ is hauled up a $${theta}^{\\circ}$ incline ($\\mu=${mu}$). Find the rope tension (kN). Round off to two decimal places.`, answer: T, tolerance: 1,
      solution: solN("$T=W(\\sin\\theta+\\mu\\cos\\theta)$.", `$$T=${W}(\\sin${theta}^{\\circ}+${mu}\\cos${theta}^{\\circ})=${fmt(T)}\\ \\text{kN}$$`, `$W=${W},\\ \\theta=${theta}^{\\circ}$.`, fmt(T), r2(T - 1), r2(T + 1)) }); },
  (rng) => { const rho = ri(rng, 2400, 2700), t = rf(rng, 0.5, 2); const sp = rho * 9.81 * t / 1000;
    return nat({ topic: "Roof Support — Dead-weight Pressure", difficulty: "medium", marks: 2,
      stem: `A roof bed $${t}\\,\\text{m}$ thick of density $${rho}\\,\\text{kg/m}^3$ must be supported. Find the dead-weight pressure (kPa). Round off to two decimal places.`, answer: sp, tolerance: 0.5,
      solution: solN("Pressure $=\\rho g t$.", `$$p=\\frac{${rho}\\times9.81\\times${t}}{1000}=${fmt(sp)}\\ \\text{kPa}$$`, `$t=${t},\\ \\rho=${rho}$.`, fmt(sp), r2(sp - 0.5), r2(sp + 0.5)) }); },
  (rng) => { const face = ri(rng, 150, 300), web = rf(rng, 0.6, 1.0), h = rf(rng, 2, 4), rho = rf(rng, 1.3, 1.5), cuts = ri(rng, 6, 12); const out = face * web * h * rho * cuts;
    return nat({ topic: "Longwall — Daily Output", difficulty: "hard", marks: 2,
      stem: `Longwall: face $${face}\\,\\text{m}$, web $${web}\\,\\text{m}$, seam $${h}\\,\\text{m}$, coal $${rho}\\,\\text{t/m}^3$, $${cuts}$ cuts/day. Find the daily output (t). Round off to two decimal places.`, answer: out, tolerance: 5,
      solution: solN("Output $=$ face $\\times$ web $\\times$ height $\\times$ density $\\times$ cuts.", `$$Q=${face}\\times${web}\\times${h}\\times${rho}\\times${cuts}=${fmt(out)}$$`, `face $=${face}$, web $=${web}$.`, fmt(out), r2(out - 5), r2(out + 5)) }); },
  (rng) => { const D = rf(rng, 4, 8), depth = ri(rng, 200, 600); const vol = Math.PI * D * D / 4 * depth;
    return nat({ topic: "Shaft — Volume", difficulty: "easy", marks: 1,
      stem: `A circular shaft of diameter $${D}\\,\\text{m}$ is sunk to $${depth}\\,\\text{m}$. Find the excavated volume (m³). Round off to two decimal places.`, answer: vol, tolerance: 2,
      solution: solN("$V=\\tfrac{\\pi D^2}{4}\\times\\text{depth}$.", `$$V=\\frac{\\pi\\times${D}^2}{4}\\times${depth}=${fmt(vol)}$$`, `$D=${D},\\ H=${depth}$.`, fmt(vol), r2(vol - 2), r2(vol + 2)) }); },
  (rng) => { const breakL = ri(rng, 400, 900), load = ri(rng, 60, 180); const sf = breakL / load;
    const m = numMCQ({ rng, correct: sf, traps: [load / breakL, breakL - load, sf * 2], unit: "" });
    return mcq({ topic: "Winding Rope — Safety Factor", difficulty: "easy", marks: 1,
      stem: `A winding rope has breaking load $${breakL}\\,\\text{kN}$ and carries $${load}\\,\\text{kN}$. Find the factor of safety.`, options: m.options, answer: m.answer,
      solution: solC("FoS $=$ breaking load $/$ working load.", `$$FoS=\\frac{${breakL}}{${load}}=${fmt(sf)}$$`, `break $=${breakL}$, load $=${load}$.`, `$${fmt(sf)}$.`) }); },
  (rng) => { const skip = ri(rng, 8, 20), rope = rf(rng, 2, 5), accel = pick(rng, [0.5, 0.8, 1.0]); const load = (skip + rope) * (9.81 + accel);
    return nat({ topic: "Winding — Rope Load (accelerating)", difficulty: "hard", marks: 2,
      stem: `A skip+payload of $${skip}\\,\\text{t}$ with $${rope}\\,\\text{t}$ rope accelerates upward at $${accel}\\,\\text{m/s}^2$. Find the rope load (kN). Round off to two decimal places.`, answer: load, tolerance: 0.5,
      solution: solN("Load $=m(g+a)$ for upward acceleration.", `$$F=(${skip}+${rope})(9.81+${accel})=${fmt(load)}\\ \\text{kN}$$`, `$a=${accel}$.`, fmt(load), r2(load - 0.5), r2(load + 0.5)) }); },
];

/* ---------------- Archetype B — vintage PYQ variants ---------------- */
const B = [
  (rng) => { const sigc = ri(rng, 20, 45), W = ri(rng, 12, 22), H = ri(rng, 3, 6); const sp = sigc * (0.64 + 0.36 * W / H);
    return nat({ topic: "Pillar Strength — Bieniawski", difficulty: "hard", marks: 2,
      stem: `Using Bieniawski, find the strength of a coal pillar ($W=${W}$, $H=${H}\\,\\text{m}$) with specimen strength $${sigc}\\,\\text{MPa}$. Round off to two decimal places.`, answer: sp, tolerance: 0.1,
      solution: solN("$S_p=\\sigma_1(0.64+0.36\\,W/H)$.", `$$S_p=${sigc}(0.64+0.36\\times\\tfrac{${W}}{${H}})=${fmt(sp)}$$`, `$W=${W},\\ H=${H}$.`, fmt(sp), r2(sp - 0.1), r2(sp + 0.1)) }); },
  (rng) => { const sigc = ri(rng, 25, 45), W = ri(rng, 14, 22), Hp = ri(rng, 3, 5), depth = ri(rng, 150, 400), Wb = ri(rng, 5, 8), rho = 2500;
    const sp = sigc * (0.64 + 0.36 * W / Hp); const sv = rho * 9.81 * depth / 1e6; const stress = sv * ((W + Wb) / W) ** 2; const sf = sp / stress;
    return nat({ topic: "Pillar — Factor of Safety", difficulty: "hard", marks: 2,
      stem: `Coal pillar ($W=${W}$, $H=${Hp}\\,\\text{m}$, $\\sigma_c=${sigc}\\,\\text{MPa}$) with bord $${Wb}\\,\\text{m}$ at depth $${depth}\\,\\text{m}$ (ρ=2500). Find the FoS. Round off to two decimal places.`, answer: sf, tolerance: 0.05,
      solution: solN("Strength (Bieniawski) over tributary stress $\\sigma_v((W+W_b)/W)^2$.", `$$S_p=${fmt(sp)};\\ \\sigma_p=${fmt(stress)};\\ FoS=${fmt(sf)}$$`, `depth $=${depth}$.`, fmt(sf), r2(sf - 0.05), r2(sf + 0.05)) }); },
  (rng) => { const W = ri(rng, 2000, 8000), theta = ri(rng, 6, 18), mu = 0.03, v = rf(rng, 1, 3); const T = W * (Math.sin(rad(theta)) + mu * Math.cos(rad(theta))); const P = T * v;
    return nat({ topic: "Rope Haulage — Power", difficulty: "hard", marks: 2,
      stem: `A train ($${W}\\,\\text{kN}$) is hauled up $${theta}^{\\circ}$ ($\\mu=0.03$) at $${v}\\,\\text{m/s}$. Find the haulage power (kW). Round off to two decimal places.`, answer: P, tolerance: 1,
      solution: solN("$P=T\\,v$, with $T=W(\\sin\\theta+\\mu\\cos\\theta)$.", `$$T=${fmt(T)}\\,\\text{kN};\\ P=${fmt(T)}\\times${v}=${fmt(P)}\\ \\text{kW}$$`, `$v=${v}$.`, fmt(P), r2(P - 1), r2(P + 1)) }); },
  (rng) => { const a = pick(rng, [0.6, 0.7, 0.9]), m = rf(rng, 2, 4); const s = a * m;
    return nat({ topic: "Subsidence — Maximum", difficulty: "medium", marks: 2,
      stem: `For a subsidence factor $a=${a}$ and extracted seam thickness $${m}\\,\\text{m}$, find the maximum subsidence (m). Round off to two decimal places.`, answer: s, tolerance: 0.02,
      solution: solN("$S_{max}=a\\times m$.", `$$S_{max}=${a}\\times${m}=${fmt(s)}\\ \\text{m}$$`, `$a=${a},\\ m=${m}$.`, fmt(s), r2(s - 0.02), r2(s + 0.02)) }); },
  (rng) => { const area = ri(rng, 15, 30), capacity = ri(rng, 100, 200); const n = area / (capacity / 1000) / 1000;
    const cap = ri(rng, 80, 200), spacing = rf(rng, 1, 1.6); const density = cap / (spacing * spacing);
    return nat({ topic: "Roof Bolting — Support Density", difficulty: "medium", marks: 2,
      stem: `Bolts on a $${spacing}\\,\\text{m}\\times${spacing}\\,\\text{m}$ grid each provide $${cap}\\,\\text{kN}$. Find the support density (kN/m²). Round off to two decimal places.`, answer: density, tolerance: 0.1,
      solution: solN("Density $=$ bolt capacity $/$ (spacing area).", `$$\\rho_s=\\frac{${cap}}{${spacing}^2}=${fmt(density)}\\ \\text{kN/m}^2$$`, `grid $${spacing}\\times${spacing}$.`, fmt(density), r2(density - 0.1), r2(density + 0.1)) }); },
  (rng) => { const cap = ri(rng, 4, 12), trips = ri(rng, 30, 60), shift = pick(rng, [6, 7, 8]); const perHr = cap * trips / shift;
    return nat({ topic: "Man-winding — Hourly Capacity", difficulty: "medium", marks: 2,
      stem: `A cage carries $${cap}$ persons and makes $${trips}$ trips in a $${shift}\\,\\text{h}$ shift. Find the persons/hour wound. Round off to two decimal places.`, answer: perHr, tolerance: 0.05,
      solution: solN("Per hour $=$ capacity $\\times$ trips $/$ shift hours.", `$$=\\frac{${cap}\\times${trips}}{${shift}}=${fmt(perHr)}$$`, `cap $=${cap}$, trips $=${trips}$.`, fmt(perHr), r2(perHr - 0.05), r2(perHr + 0.05)) }); },
  (rng) => { const out = ri(rng, 400, 1200), men = ri(rng, 40, 120); const omp = out / men;
    return nat({ topic: "Productivity — Output per Manshift", difficulty: "easy", marks: 1,
      stem: `A district produces $${out}\\,\\text{t}$ using $${men}$ manshifts. Find the OMS (t/manshift). Round off to two decimal places.`, answer: omp, tolerance: 0.02,
      solution: solN("OMS $=$ output $/$ manshifts.", `$$OMS=\\frac{${out}}{${men}}=${fmt(omp)}$$`, `out $=${out}$, men $=${men}$.`, fmt(omp), r2(omp - 0.02), r2(omp + 0.02)) }); },
  (rng) => { const face = ri(rng, 150, 280), adv = rf(rng, 4, 9), h = rf(rng, 2, 3.5), rho = rf(rng, 1.3, 1.5); const daily = face * adv * h * rho;
    return nat({ topic: "Longwall — Output from Advance", difficulty: "hard", marks: 2,
      stem: `A longwall (face $${face}\\,\\text{m}$, seam $${h}\\,\\text{m}$, coal $${rho}\\,\\text{t/m}^3$) advances $${adv}\\,\\text{m}/\\text{day}$. Find the daily output (t). Round off to two decimal places.`, answer: daily, tolerance: 5,
      solution: solN("Output $=$ face $\\times$ advance $\\times$ height $\\times$ density.", `$$Q=${face}\\times${adv}\\times${h}\\times${rho}=${fmt(daily)}$$`, `advance $=${adv}$.`, fmt(daily), r2(daily - 5), r2(daily + 5)) }); },
];

/* ---------------- Archetype C — diagrammatic (every Q has a figure) -- */
const C = [
  (rng) => { const Wp = ri(rng, 14, 22), Wb = ri(rng, 5, 8); const e = (1 - (Wp * Wp) / ((Wp + Wb) ** 2)) * 100; const sc = 4;
    const mk = `<svg viewBox='0 0 220 170' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='9'>` +
      [0, 1].flatMap((i) => [0, 1].map((j) => `<rect x='${20 + j * sc * (Wp + Wb)}' y='${20 + i * sc * (Wp + Wb)}' width='${sc * Wp}' height='${sc * Wp}' fill='#94a3b8'/>`)).join("") +
      `<text x='110' y='160' text-anchor='middle' fill='#475569'>pillars ${Wp} m, bords ${Wb} m</text></svg>`;
    return nat({ topic: "Bord & Pillar — Extraction (plan)", difficulty: "medium", marks: 2,
      stem: `From the plan view, pillars are $${Wp}\\,\\text{m}$ square with $${Wb}\\,\\text{m}$ bords. Find the extraction percentage. Round off to two decimal places.`, answer: e, tolerance: 0.1,
      figure: figSvg(mk, "Bord & pillar plan"),
      solution: solN("$e=1-\\dfrac{W_p^2}{(W_p+W_b)^2}$.", `$$e=1-\\frac{${Wp}^2}{(${Wp}+${Wb})^2}=${fmt(e)}\\%$$`, `$W_p=${Wp},\\ W_b=${Wb}$.`, fmt(e), r2(e - 0.1), r2(e + 0.1)) }); },
  (rng) => { const depths = [200, 300, 400, 500]; const sv = depths.map((d) => r2(2500 * 9.81 * d / 1e6)); const target = sv[2];
    return nat({ topic: "Cover Load — Depth Trend", difficulty: "medium", marks: 2,
      stem: `The plot shows vertical stress vs depth (ρ=2500). Read the stress at $400\\,\\text{m}$. Round off to two decimal places.`, answer: target, tolerance: 0.1,
      figure: svgLine({ series: [{ points: depths.map((d, i) => [d, sv[i]]), color: "#dc2626", dots: true, label: "σv" }], xlabel: "depth (m)", ylabel: "σv (MPa)", caption: "Stress vs depth" }),
      solution: solN("$\\sigma_v=\\rho gH$.", `$$\\sigma_v=\\frac{2500\\times9.81\\times400}{10^6}=${fmt(target)}$$`, `at 400 m.`, fmt(target), r2(target - 0.1), r2(target + 0.1)) }); },
  (rng) => { const dist = [0, 1, 2, 3]; const elev = [0, ri(rng, 8, 16), ri(rng, 20, 32), ri(rng, 36, 50)];
    return nat({ topic: "Incline — Gradient Angle", difficulty: "medium", marks: 2,
      stem: `The profile shows an incline rising $${elev[3]}\\,\\text{m}$ over $3\\,\\text{km}$. Find the gradient angle (degrees). Round off to two decimal places.`, answer: deg(Math.atan(elev[3] / 3000)), tolerance: 0.05,
      figure: svgLine({ series: [{ points: dist.map((d, i) => [d, elev[i]]), color: "#2563eb", dots: true, label: "elev" }], xlabel: "distance (km)", ylabel: "elevation (m)", caption: "Incline profile" }),
      solution: solN("Angle $=\\tan^{-1}(\\text{rise}/\\text{run})$.", `$$\\theta=\\tan^{-1}\\frac{${elev[3]}}{3000}=${fmt(deg(Math.atan(elev[3] / 3000)))}^{\\circ}$$`, `rise $=${elev[3]}$ m.`, fmt(deg(Math.atan(elev[3] / 3000))), r2(deg(Math.atan(elev[3] / 3000)) - 0.05), r2(deg(Math.atan(elev[3] / 3000)) + 0.05)) }); },
  (rng) => { const vals = [ri(rng, 600, 900), ri(rng, 700, 1000), ri(rng, 800, 1100), ri(rng, 650, 950)]; const tot = vals.reduce((a, b) => a + b, 0);
    return nat({ topic: "Production — Weekly Total", difficulty: "medium", marks: 2,
      stem: `The bars give four days' coal output (t). Find the four-day total. Round off to two decimal places.`, answer: tot, tolerance: 1,
      figure: svgBar({ labels: ["D1", "D2", "D3", "D4"], values: vals, caption: "Daily output", title: "t/day" }),
      solution: solN("Sum the bars.", `$$\\Sigma=${vals.join("+")}=${fmt(tot)}$$`, `four days.`, fmt(tot), r2(tot - 1), r2(tot + 1)) }); },
  (rng) => { const face = ri(rng, 150, 280); const adv = [3, 5, 7, 9]; const h = 3, rho = 1.4; const out = adv.map((a) => r2(face * a * h * rho)); const target = out[2];
    return nat({ topic: "Longwall — Output vs Advance", difficulty: "hard", marks: 2,
      stem: `The curve plots daily output vs advance for a $${face}\\,\\text{m}$ face (seam 3 m, coal 1.4). Read the output at $7\\,\\text{m/day}$ advance. Round off to two decimal places.`, answer: target, tolerance: 5,
      figure: svgLine({ series: [{ points: adv.map((a, i) => [a, out[i]]), color: "#16a34a", dots: true, label: "Q" }], xlabel: "advance (m/day)", ylabel: "output (t)", caption: "Output vs advance" }),
      solution: solN("Output $=$ face $\\times$ advance $\\times$ height $\\times$ density.", `$$Q=${face}\\times7\\times3\\times1.4=${fmt(target)}$$`, `advance $=7$.`, fmt(target), r2(target - 5), r2(target + 5)) }); },
  (rng) => { const W = ri(rng, 3000, 8000), theta = ri(rng, 8, 18); const T = W * Math.sin(rad(theta));
    return nat({ topic: "Haulage — Gravity Component", difficulty: "medium", marks: 2,
      stem: `On the incline shown, a $${W}\\,\\text{kN}$ load sits on a $${theta}^{\\circ}$ grade. Find the gravity component along the incline (kN). Round off to two decimal places.`, answer: T, tolerance: 1,
      figure: figSvg(`<svg viewBox='0 0 240 150' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='10'><line x1='20' y1='130' x2='220' y2='${r2(130 - 200 * Math.tan(rad(theta)))}' stroke='#334155' stroke-width='2'/><rect x='110' y='${r2(130 - 90 * Math.tan(rad(theta)) - 16)}' width='22' height='14' fill='#2563eb' transform='rotate(-${theta} 121 ${r2(130 - 90 * Math.tan(rad(theta)) - 9)})'/><text x='120' y='145' text-anchor='middle' fill='#475569'>incline ${theta}°</text></svg>`, "Load on incline"),
      solution: solN("Along-incline gravity $=W\\sin\\theta$.", `$$F=${W}\\sin${theta}^{\\circ}=${fmt(T)}\\ \\text{kN}$$`, `$W=${W},\\ \\theta=${theta}^{\\circ}$.`, fmt(T), r2(T - 1), r2(T + 1)) }); },
  (rng) => { const x = [0, 50, 100, 150, 200]; const Smax = rf(rng, 1.5, 2.5); const trough = x.map((d) => r2(Smax * Math.exp(-((d - 100) ** 2) / 3000))); const target = trough[2];
    return nat({ topic: "Subsidence — Trough Centre", difficulty: "hard", marks: 2,
      stem: `The plotted subsidence trough peaks at the panel centre. Read the maximum subsidence (m). Round off to two decimal places.`, answer: target, tolerance: 0.05,
      figure: svgLine({ series: [{ points: x.map((d, i) => [d, trough[i]]), color: "#7c3aed", dots: true, label: "S" }], xlabel: "offset (m)", ylabel: "subsidence (m)", caption: "Subsidence trough" }),
      solution: solN("The maximum subsidence is the trough centre value.", `$$S_{max}=${fmt(target)}\\ \\text{m}$$`, `peak at centre.`, fmt(target), r2(target - 0.05), r2(target + 0.05)) }); },
  (rng) => { const cap = ri(rng, 80, 160), spacing = rf(rng, 1, 1.5); const density = cap / (spacing * spacing); const sc = 40;
    const mk = `<svg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='9'>` +
      [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => `<circle cx='${30 + j * sc}' cy='${30 + i * sc}' r='4' fill='#1e3a8a'/>`)).join("") +
      `<text x='90' y='170' text-anchor='middle' fill='#475569'>bolt grid ${spacing} m</text></svg>`;
    return nat({ topic: "Roof Bolting — Density (pattern)", difficulty: "medium", marks: 2,
      stem: `Bolts on the grid shown are $${spacing}\\,\\text{m}$ apart, each rated $${cap}\\,\\text{kN}$. Find the areal support density (kN/m²). Round off to two decimal places.`, answer: density, tolerance: 0.1,
      figure: figSvg(mk, "Roof bolt pattern"),
      solution: solN("Density $=$ bolt rating $/$ tributary area $s^2$.", `$$\\rho_s=\\frac{${cap}}{${spacing}^2}=${fmt(density)}$$`, `grid $${spacing}$ m.`, fmt(density), r2(density - 0.1), r2(density + 0.1)) }); },
  (rng) => { const depth = ri(rng, 200, 600), vc = rf(rng, 8, 14), cycle = depth / vc * 2 + 30; const trips = 3600 / cycle;
    return nat({ topic: "Winding — Trips per Hour", difficulty: "hard", marks: 2,
      stem: `A skip winds from $${depth}\\,\\text{m}$ at $${vc}\\,\\text{m/s}$ (rest time 30 s/cycle, two-way travel). Find trips per hour. Round off to two decimal places.`, answer: trips, tolerance: 0.1,
      figure: svgLine({ series: [{ points: [[0, 0], [depth / vc, vc], [2 * depth / vc, 0]], color: "#2563eb", dots: true, label: "v(t)" }], xlabel: "time (s)", ylabel: "v (m/s)", caption: "Winding velocity profile" }),
      solution: solN("Cycle $=$ two-way travel $+$ rest; trips $=3600/$cycle.", `$$t_c=2\\times\\frac{${depth}}{${vc}}+30=${fmt(cycle)}\\,\\text{s};\\ n=\\frac{3600}{${fmt(cycle)}}=${fmt(trips)}$$`, `depth $=${depth}$.`, fmt(trips), r2(trips - 0.1), r2(trips + 0.1)) }); },
  (rng) => { const vals = [ri(rng, 75, 90), ri(rng, 80, 92), ri(rng, 70, 88)]; const tgt = vals[1];
    return nat({ topic: "Support — Setting Load Read", difficulty: "easy", marks: 1,
      stem: `The bars give powered-support setting load as % of yield for three legs. Read the second leg's value. Round off to two decimal places.`, answer: tgt, tolerance: 0.01,
      figure: svgBar({ labels: ["L1", "L2", "L3"], values: vals, caption: "Setting load %", title: "%" }),
      solution: solN("Read the second bar.", `$$=${fmt(tgt)}\\%$$`, `three legs.`, fmt(tgt), r2(tgt - 0.01), r2(tgt + 0.01)) }); },
  (rng) => { const Wp = ri(rng, 12, 20), Wb = ri(rng, 4, 7), depth = ri(rng, 150, 350), rho = 2500; const sv = rho * 9.81 * depth / 1e6; const sp = sv * ((Wp + Wb) / Wp) ** 2;
    return nat({ topic: "Pillar Stress — Tributary (plan)", difficulty: "hard", marks: 2,
      stem: `From the plan ($W_p=${Wp}$, bord $${Wb}\\,\\text{m}$) at depth $${depth}\\,\\text{m}$ (ρ=2500), find the pillar stress by tributary area (MPa). Round off to two decimal places.`, answer: sp, tolerance: 0.1,
      figure: figSvg(`<svg viewBox='0 0 180 160' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='9'><rect x='40' y='30' width='${Wp * 4}' height='${Wp * 4}' fill='#94a3b8'/><rect x='30' y='20' width='${(Wp + Wb) * 4}' height='${(Wp + Wb) * 4}' fill='none' stroke='#dc2626' stroke-dasharray='4 3'/><text x='90' y='150' text-anchor='middle' fill='#475569'>pillar + tributary area</text></svg>`, "Tributary area"),
      solution: solN("$\\sigma_p=\\sigma_v\\left(\\tfrac{W_p+W_b}{W_p}\\right)^2$.", `$$\\sigma_v=${fmt(sv)};\\ \\sigma_p=${fmt(sv)}\\left(\\tfrac{${Wp + Wb}}{${Wp}}\\right)^2=${fmt(sp)}$$`, `depth $=${depth}$.`, fmt(sp), r2(sp - 0.1), r2(sp + 0.1)) }); },
  (rng) => { const adv = [2, 4, 6, 8, 10]; const cum = adv.map((_, i) => adv.slice(0, i + 1).reduce((a, b) => a + b, 0)); const target = cum[4];
    return nat({ topic: "Development — Cumulative Advance", difficulty: "easy", marks: 1,
      stem: `Daily heading advances are $${adv.join(", ")}\\,\\text{m}$ (line plot of cumulative). Find the total advance after 5 days. Round off to two decimal places.`, answer: target, tolerance: 0.01,
      figure: svgLine({ series: [{ points: cum.map((c, i) => [i + 1, c]), color: "#0891b2", dots: true, label: "cum" }], xlabel: "day", ylabel: "cum advance (m)", caption: "Cumulative advance" }),
      solution: solN("Cumulative advance is the running sum.", `$$\\Sigma=${adv.join("+")}=${fmt(target)}$$`, `five days.`, fmt(target), r2(target - 0.01), r2(target + 0.01)) }); },
];

/* ---------------- Archetype D — multi-stage rank determinators ------ */
const D = [
  (rng) => { const sigc = ri(rng, 25, 45), Hp = ri(rng, 3, 5), depth = ri(rng, 150, 350), Wb = ri(rng, 5, 8), rho = 2500, targetFoS = pick(rng, [1.5, 2]);
    const sv = rho * 9.81 * depth / 1e6;
    // find W such that sigc(0.64+0.36 W/Hp)/ (sv ((W+Wb)/W)^2) = targetFoS — solve numerically
    let W = 10; for (let it = 0; it < 60; it++) { const sp = sigc * (0.64 + 0.36 * W / Hp); const st = sv * ((W + Wb) / W) ** 2; const f = sp / st; W += (targetFoS - f) * 5; if (W < 4) W = 4; }
    return nat({ topic: "Pillar Design — Required Width", difficulty: "hard", marks: 2,
      stem: `Design a coal pillar ($H=${Hp}\\,\\text{m}$, $\\sigma_c=${sigc}\\,\\text{MPa}$, bord $${Wb}\\,\\text{m}$) at depth $${depth}\\,\\text{m}$ (ρ=2500) for FoS $=${targetFoS}$. Find the approximate pillar width (m). Round off to two decimal places.`, answer: W, tolerance: 1.5,
      solution: solN("Iterate $W$ so Bieniawski strength / tributary stress $=$ target FoS.", `$$\\sigma_v=${fmt(sv)};\\ W\\approx${fmt(W)}\\,\\text{m for FoS}=${targetFoS}$$`, `target FoS $=${targetFoS}$.`, fmt(W), r2(W - 1.5), r2(W + 1.5)) }); },
  (rng) => { const face = ri(rng, 150, 280), web = rf(rng, 0.6, 1.0), h = rf(rng, 2.5, 4), rho = 1.4, cuts = ri(rng, 8, 14), days = pick(rng, [25, 26, 28]); const annual = face * web * h * rho * cuts * days * 12 / 1e6;
    return nat({ topic: "Longwall — Annual Output", difficulty: "hard", marks: 2,
      stem: `Longwall: face $${face}\\,\\text{m}$, web $${web}\\,\\text{m}$, seam $${h}\\,\\text{m}$, coal 1.4, $${cuts}$ cuts/day, $${days}$ days/month. Find annual output (Mt). Round off to two decimal places.`, answer: annual, tolerance: 0.05,
      solution: solN("Daily output $\\times$ days/month $\\times$ 12, to Mt.", `$$Q=\\frac{${face}\\times${web}\\times${h}\\times1.4\\times${cuts}\\times${days}\\times12}{10^6}=${fmt(annual)}$$`, `face $=${face}$.`, fmt(annual), r2(annual - 0.05), r2(annual + 0.05)) }); },
  (rng) => { const skip = ri(rng, 10, 20), rope = rf(rng, 2, 5), depth = ri(rng, 300, 700), v = rf(rng, 10, 16), eff = pick(rng, [0.8, 0.85, 0.9]);
    const load = (skip + rope); const power = load * 9.81 * v / eff;
    return nat({ topic: "Winding — Motor Power", difficulty: "hard", marks: 2,
      stem: `A winder lifts $${skip}\\,\\text{t}$ (skip+coal) plus $${rope}\\,\\text{t}$ rope at $${v}\\,\\text{m/s}$, drive efficiency $${eff}$. Find the steady-state motor power (kW). Round off to two decimal places.`, answer: power, tolerance: 2,
      solution: solN("Power $=\\dfrac{(m)gv}{\\eta}$ at constant speed.", `$$P=\\frac{(${skip}+${rope})\\times9.81\\times${v}}{${eff}}=${fmt(power)}\\ \\text{kW}$$`, `$v=${v},\\ \\eta=${eff}$.`, fmt(power), r2(power - 2), r2(power + 2)) }); },
  (rng) => { const m = rf(rng, 2, 4), a = 0.75, w = ri(rng, 150, 300), H = ri(rng, 100, 250); const Smax = a * m; const angleDraw = ri(rng, 25, 35); const halfWidth = H * Math.tan(rad(angleDraw)) + w / 2;
    return nat({ topic: "Subsidence — Trough Half-width", difficulty: "hard", marks: 2,
      stem: `A panel of width $${w}\\,\\text{m}$ at depth $${H}\\,\\text{m}$ has draw angle $${angleDraw}^{\\circ}$. Find the surface trough half-width (m). Round off to two decimal places.`, answer: halfWidth, tolerance: 0.5,
      solution: solN("Half-width $=H\\tan(\\text{draw angle})+W/2$.", `$$b=${H}\\tan${angleDraw}^{\\circ}+\\frac{${w}}{2}=${fmt(halfWidth)}\\ \\text{m}$$`, `draw $=${angleDraw}^{\\circ}$.`, fmt(halfWidth), r2(halfWidth - 0.5), r2(halfWidth + 0.5)) }); },
  (rng) => { const reserve = ri(rng, 8, 25), face = ri(rng, 150, 250), h = 3, rho = 1.4, adv = rf(rng, 4, 8), days = 320; const annual = face * adv * h * rho * days / 1e6; const life = reserve / annual;
    return nat({ topic: "Longwall — Panel Life", difficulty: "hard", marks: 2,
      stem: `A reserve of $${reserve}\\,\\text{Mt}$ is mined by a longwall (face $${face}\\,\\text{m}$, seam 3 m, coal 1.4, advance $${adv}\\,\\text{m/day}$, 320 days/yr). Find the life (years). Round off to two decimal places.`, answer: life, tolerance: 0.1,
      solution: solN("Annual output then reserve/output.", `$$Q=\\frac{${face}\\times${adv}\\times3\\times1.4\\times320}{10^6}=${fmt(annual)};\\ L=\\frac{${reserve}}{${fmt(annual)}}=${fmt(life)}$$`, `reserve $=${reserve}$ Mt.`, fmt(life), r2(life - 0.1), r2(life + 0.1)) }); },
  (rng) => { const W = ri(rng, 4000, 9000), theta = ri(rng, 8, 16), mu = 0.03; const Tup = W * (Math.sin(rad(theta)) + mu * Math.cos(rad(theta))); const Tdown = W * (Math.sin(rad(theta)) - mu * Math.cos(rad(theta))); const ratio = Tup / Tdown;
    return nat({ topic: "Haulage — Up/Down Tension Ratio", difficulty: "hard", marks: 2,
      stem: `For a $${W}\\,\\text{kN}$ load on a $${theta}^{\\circ}$ grade ($\\mu=0.03$), find the ratio of hauling tension (up) to retarding tension (down). Round off to two decimal places.`, answer: ratio, tolerance: 0.02,
      solution: solN("$T_{up}=W(\\sin\\theta+\\mu\\cos\\theta)$, $T_{down}=W(\\sin\\theta-\\mu\\cos\\theta)$.", `$$\\frac{T_{up}}{T_{down}}=\\frac{${fmt(Tup)}}{${fmt(Tdown)}}=${fmt(ratio)}$$`, `$\\theta=${theta}^{\\circ}$.`, fmt(ratio), r2(ratio - 0.02), r2(ratio + 0.02)) }); },
  (rng) => { const out = ri(rng, 1000, 3000), faces = ri(rng, 2, 4), perFace = out / faces, men = ri(rng, 60, 150); const oms = out / men;
    return nat({ topic: "Mine — Combined OMS", difficulty: "medium", marks: 2,
      stem: `A mine with $${faces}$ faces produces $${out}\\,\\text{t/day}$ using $${men}$ manshifts. Find the overall OMS (t/manshift). Round off to two decimal places.`, answer: oms, tolerance: 0.02,
      solution: solN("OMS $=$ total output $/$ manshifts.", `$$OMS=\\frac{${out}}{${men}}=${fmt(oms)}$$`, `out $=${out}$.`, fmt(oms), r2(oms - 0.02), r2(oms + 0.02)) }); },
  (rng) => { const depth = ri(rng, 300, 700), v = rf(rng, 10, 16), accel = pick(rng, [0.6, 0.8, 1.0]); const ta = v / accel; const da = 0.5 * accel * ta * ta; const dconst = depth - 2 * da; const tconst = dconst / v; const total = 2 * ta + tconst;
    return nat({ topic: "Winding — Cycle Time (trapezoidal)", difficulty: "hard", marks: 2,
      stem: `A skip travels $${depth}\\,\\text{m}$ with accel/decel $${accel}\\,\\text{m/s}^2$ and full speed $${v}\\,\\text{m/s}$ (symmetric trapezoid). Find the travel time (s). Round off to two decimal places.`, answer: total, tolerance: 0.1,
      solution: solN("Accel time $v/a$, accel distance $\\tfrac12 a t_a^2$; constant phase covers the rest.", `$$t_a=${fmt(ta)};\\ d_a=${fmt(da)};\\ t=2t_a+\\frac{${depth}-2d_a}{${v}}=${fmt(total)}$$`, `$a=${accel},\\ v=${v}$.`, fmt(total), r2(total - 0.1), r2(total + 0.1)) }); },
  (rng) => { const m = rf(rng, 2, 4), incl = ri(rng, 0, 30), a = 0.7; const Smax = a * m * Math.cos(rad(incl));
    return nat({ topic: "Subsidence — Inclined Seam", difficulty: "hard", marks: 2,
      stem: `A $${m}\\,\\text{m}$ seam dipping $${incl}^{\\circ}$ is extracted (subsidence factor 0.7). Find the maximum subsidence normal-projected $=0.7\\,m\\cos\\delta$ (m). Round off to two decimal places.`, answer: Smax, tolerance: 0.02,
      solution: solN("Vertical subsidence reduces with dip: $S=a\\,m\\cos\\delta$.", `$$S=0.7\\times${m}\\times\\cos${incl}^{\\circ}=${fmt(Smax)}$$`, `dip $=${incl}^{\\circ}$.`, fmt(Smax), r2(Smax - 0.02), r2(Smax + 0.02)) }); },
  (rng) => { const sigc = ri(rng, 25, 45), W = ri(rng, 14, 22), Hp = ri(rng, 3, 5), reduce = pick(rng, [0.6, 0.7]); const dry = sigc * (0.64 + 0.36 * W / Hp); const wet = dry * reduce;
    return nat({ topic: "Pillar — Strength Reduction (wet)", difficulty: "hard", marks: 2,
      stem: `A pillar (Bieniawski, $W=${W}$, $H=${Hp}$, $\\sigma_c=${sigc}\\,\\text{MPa}$) loses $${r2((1 - reduce) * 100)}\\%$ strength when saturated. Find the wet strength (MPa). Round off to two decimal places.`, answer: wet, tolerance: 0.1,
      solution: solN("Compute dry strength, then apply the moisture reduction factor.", `$$S_{dry}=${fmt(dry)};\\ S_{wet}=${reduce}\\times${fmt(dry)}=${fmt(wet)}$$`, `reduction to $${reduce}$.`, fmt(wet), r2(wet - 0.1), r2(wet + 0.1)) }); },
];

export default { slug: "underground-mining", name: "Underground Mining", subjectTag: SUB, pools: { A, B, C, D } };
