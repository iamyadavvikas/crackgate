/** Mine Ventilation — 175-question template pools (A30/B30/C60/D55). */
import { mcq, nat, r2, fmt, solN, solC, numMCQ, figVent, figPQ, svgBar, svgLine, figSvg } from "../build_practice_bank.mjs";

const SUB = "Mine Ventilation";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const rf = (rng, a, b, d = 2) => r2(a + rng() * (b - a));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const Q = ri(rng, 20, 80), A = ri(rng, 4, 16); const v = Q / A;
    return nat({ topic: "Airflow — Continuity", difficulty: "easy", marks: 1,
      stem: `An airway of cross-section $${A}\\,\\text{m}^2$ carries $${Q}\\,\\text{m}^3/\\text{s}$. Find the mean air velocity (m/s). Round off to two decimal places.`, answer: v, tolerance: 0.02,
      solution: solN("Continuity: $v=Q/A$.", `$$v=\\frac{${Q}}{${A}}=${fmt(v)}\\ \\text{m/s}$$`, `$Q=${Q}\\,\\text{m}^3/\\text{s},\\ A=${A}\\,\\text{m}^2$.`, fmt(v), r2(v - 0.02), r2(v + 0.02)) }); },
  (rng) => { const R = rf(rng, 0.2, 1.2), Q = ri(rng, 20, 60); const P = R * Q * Q;
    return nat({ topic: "Mine Resistance — Square Law", difficulty: "medium", marks: 2,
      stem: `An airway has resistance $${R}\\,\\text{Ns}^2/\\text{m}^8$ and carries $${Q}\\,\\text{m}^3/\\text{s}$. Find the pressure drop (Pa). Round off to two decimal places.`, answer: P, tolerance: 0.1,
      solution: solN("Atkinson square law: $p=RQ^2$.", `$$p=RQ^2=${R}\\times${Q}^2=${fmt(P)}\\ \\text{Pa}$$`, `$R=${R},\\ Q=${Q}$.`, fmt(P), r2(P - 0.1), r2(P + 0.1)) }); },
  (rng) => { const p = ri(rng, 400, 1500), Q = ri(rng, 30, 90); const ap = p * Q / 1000;
    return nat({ topic: "Fan — Air Power", difficulty: "medium", marks: 2,
      stem: `A fan develops $${p}\\,\\text{Pa}$ at $${Q}\\,\\text{m}^3/\\text{s}$. Find the air power (kW). Round off to two decimal places.`, answer: ap, tolerance: 0.05,
      solution: solN("Air power $=p\\,Q$ (W); divide by 1000 for kW.", `$$AP=\\frac{${p}\\times${Q}}{1000}=${fmt(ap)}\\ \\text{kW}$$`, `$p=${p}\\,\\text{Pa},\\ Q=${Q}$.`, fmt(ap), r2(ap - 0.05), r2(ap + 0.05)) }); },
  (rng) => { const mm = ri(rng, 20, 120); const pa = mm * 9.81;
    const m = numMCQ({ rng, correct: pa, traps: [mm * 9.81 / 1000, mm, mm * 1000 / 9.81], unit: "Pa" });
    return mcq({ topic: "Pressure — Unit Conversion", difficulty: "easy", marks: 1,
      stem: `Convert a water-gauge of $${mm}\\,\\text{mm}$ to pascals (take $\\rho g=9.81\\,\\text{N}/\\text{m}^3$ per mm). Choose the closest value.`, options: m.options, answer: m.answer,
      solution: solC("$1\\,\\text{mm wg}=9.81\\,\\text{Pa}$; the trap is forgetting to multiply by $g$.", `$$${mm}\\times9.81=${fmt(pa)}\\ \\text{Pa}$$`, `$h=${mm}$ mm wg.`, `$${fmt(pa)}$ Pa.`) }); },
  (rng) => { const R1 = rf(rng, 0.2, 0.8), R2 = rf(rng, 0.2, 0.8), R3 = rf(rng, 0.2, 0.8); const Rs = R1 + R2 + R3;
    return nat({ topic: "Mine Resistance — Series", difficulty: "easy", marks: 1,
      stem: `Three airways of resistance $${R1}, ${R2}, ${R3}\\,\\text{Ns}^2/\\text{m}^8$ are in series. Find the total resistance. Round off to two decimal places.`, answer: Rs, tolerance: 0.01,
      solution: solN("Series resistances add directly.", `$$R=${R1}+${R2}+${R3}=${fmt(Rs)}$$`, `series of three.`, fmt(Rs), r2(Rs - 0.01), r2(Rs + 0.01)) }); },
  (rng) => { const q = rf(rng, 0.2, 1.0), allow = pick(rng, [1, 1.25, 2]); const Q = q / (allow / 100) ;
    return nat({ topic: "Gas Dilution — Methane", difficulty: "hard", marks: 2,
      stem: `Methane is emitted at $${q}\\,\\text{m}^3/\\text{s}$. To keep concentration below $${allow}\\%$, find the minimum air quantity (m³/s). Round off to two decimal places.`, answer: Q, tolerance: 0.1,
      solution: solN("Required air $=$ gas rate $/$ allowable fraction.", `$$Q=\\frac{${q}}{${allow}/100}=${fmt(Q)}\\ \\text{m}^3/\\text{s}$$`, `gas $=${q},\\ \\text{limit}=${allow}\\%$.`, fmt(Q), r2(Q - 0.1), r2(Q + 0.1)) }); },
  (rng) => { const p = ri(rng, 500, 1800), Q = ri(rng, 30, 80), eff = pick(rng, [0.6, 0.7, 0.8]); const mp = p * Q / (1000 * eff);
    return nat({ topic: "Fan — Motor Power", difficulty: "medium", marks: 2,
      stem: `A fan delivers $${Q}\\,\\text{m}^3/\\text{s}$ at $${p}\\,\\text{Pa}$ with efficiency $${eff}$. Find the motor input power (kW). Round off to two decimal places.`, answer: mp, tolerance: 0.1,
      solution: solN("Motor power $=$ air power $/$ efficiency.", `$$P_m=\\frac{pQ}{1000\\,\\eta}=\\frac{${p}\\times${Q}}{1000\\times${eff}}=${fmt(mp)}\\ \\text{kW}$$`, `$p=${p},\\ Q=${Q},\\ \\eta=${eff}$.`, fmt(mp), r2(mp - 0.1), r2(mp + 0.1)) }); },
  (rng) => { const A = ri(rng, 6, 20), v = rf(rng, 2, 8); const Q = A * v;
    return nat({ topic: "Airflow — Quantity", difficulty: "easy", marks: 1,
      stem: `Air moves at $${v}\\,\\text{m/s}$ through a $${A}\\,\\text{m}^2$ airway. Find the quantity (m³/s). Round off to two decimal places.`, answer: Q, tolerance: 0.02,
      solution: solN("$Q=Av$.", `$$Q=${A}\\times${v}=${fmt(Q)}\\ \\text{m}^3/\\text{s}$$`, `$A=${A},\\ v=${v}$.`, fmt(Q), r2(Q - 0.02), r2(Q + 0.02)) }); },
];

/* ---------------- Archetype B — vintage PYQ variants ---------------- */
const B = [
  (rng) => { const k = rf(rng, 0.005, 0.018, 3), C = ri(rng, 10, 18), L = ri(rng, 200, 600), A = ri(rng, 8, 20); const R = k * C * L / Math.pow(A, 3);
    return nat({ topic: "Atkinson Resistance — kCL/A³", difficulty: "hard", marks: 2,
      stem: `For an airway $k=${k}\\,\\text{kg/m}^3$, perimeter $${C}\\,\\text{m}$, length $${L}\\,\\text{m}$, area $${A}\\,\\text{m}^2$, find the resistance $R=\\dfrac{kCL}{A^3}$. Round off to two decimal places.`, answer: R, tolerance: 0.02,
      solution: solN("Atkinson: $R=\\dfrac{kCL}{A^3}$ (here $k$ already in $\\text{Ns}^2/\\text{m}^4$-equivalent form).", `$$R=\\frac{${k}\\times${C}\\times${L}}{${A}^3}=${fmt(R)}$$`, `$k=${k},\\ C=${C},\\ L=${L},\\ A=${A}$.`, fmt(R), r2(R - 0.02), r2(R + 0.02)) }); },
  (rng) => { const R1 = rf(rng, 0.3, 1.0), R2 = rf(rng, 0.3, 1.0); const Req = 1 / Math.pow(1 / Math.sqrt(R1) + 1 / Math.sqrt(R2), 2);
    return nat({ topic: "Mine Resistance — Parallel", difficulty: "hard", marks: 2,
      stem: `Two airways $R_1=${R1}$, $R_2=${R2}\\,\\text{Ns}^2/\\text{m}^8$ are in parallel. Find the equivalent resistance. Round off to two decimal places.`, answer: Req, tolerance: 0.01,
      solution: solN("Square-law parallel: $\\dfrac{1}{\\sqrt{R_{eq}}}=\\dfrac{1}{\\sqrt{R_1}}+\\dfrac{1}{\\sqrt{R_2}}$.", `$$R_{eq}=\\left(\\frac{1}{\\sqrt{${R1}}}+\\frac{1}{\\sqrt{${R2}}}\\right)^{-2}=${fmt(Req)}$$`, `$R_1=${R1},\\ R_2=${R2}$.`, fmt(Req), r2(Req - 0.01), r2(Req + 0.01)) }); },
  (rng) => { const Q1 = ri(rng, 30, 60), N1 = ri(rng, 400, 700), N2 = N1 + ri(rng, 50, 300); const Q2 = Q1 * N2 / N1;
    return nat({ topic: "Fan Laws — Quantity vs Speed", difficulty: "medium", marks: 2,
      stem: `A fan at $${N1}\\,\\text{rpm}$ gives $${Q1}\\,\\text{m}^3/\\text{s}$. Find the quantity at $${N2}\\,\\text{rpm}$. Round off to two decimal places.`, answer: Q2, tolerance: 0.05,
      solution: solN("First fan law: $Q\\propto N$.", `$$Q_2=Q_1\\frac{N_2}{N_1}=${Q1}\\times\\frac{${N2}}{${N1}}=${fmt(Q2)}$$`, `$N_1=${N1},\\ N_2=${N2}$.`, fmt(Q2), r2(Q2 - 0.05), r2(Q2 + 0.05)) }); },
  (rng) => { const P1 = ri(rng, 30, 90), N1 = ri(rng, 400, 700), N2 = N1 + ri(rng, 50, 250); const P2 = P1 * Math.pow(N2 / N1, 3);
    return nat({ topic: "Fan Laws — Power vs Speed", difficulty: "hard", marks: 2,
      stem: `A fan absorbs $${P1}\\,\\text{kW}$ at $${N1}\\,\\text{rpm}$. Find the power at $${N2}\\,\\text{rpm}$. Round off to two decimal places.`, answer: P2, tolerance: 0.2,
      solution: solN("Third fan law: $\\text{Power}\\propto N^3$.", `$$P_2=P_1\\left(\\frac{N_2}{N_1}\\right)^3=${P1}\\left(\\frac{${N2}}{${N1}}\\right)^3=${fmt(P2)}$$`, `$N_1=${N1},\\ N_2=${N2}$.`, fmt(P2), r2(P2 - 0.2), r2(P2 + 0.2)) }); },
  (rng) => { const H = ri(rng, 200, 500), d1 = rf(rng, 1.18, 1.25, 3), d2 = rf(rng, 1.05, 1.15, 3); const nvp = H * (d1 - d2) * 9.81;
    return nat({ topic: "Natural Ventilation Pressure", difficulty: "hard", marks: 2,
      stem: `Two shafts of height $${H}\\,\\text{m}$ have column air densities $${d1}$ and $${d2}\\,\\text{kg/m}^3$. Find the natural ventilation pressure (Pa). Round off to two decimal places.`, answer: nvp, tolerance: 1,
      solution: solN("NVP $=H\\,g\\,(\\rho_1-\\rho_2)$.", `$$NVP=${H}\\times9.81\\times(${d1}-${d2})=${fmt(nvp)}\\ \\text{Pa}$$`, `$H=${H},\\ \\rho_1=${d1},\\ \\rho_2=${d2}$.`, fmt(nvp), r2(nvp - 1), r2(nvp + 1)) }); },
  (rng) => { const R = rf(rng, 0.4, 1.2), Q1 = ri(rng, 30, 60), Q2 = Q1 + ri(rng, 10, 30); const dP = R * (Q2 * Q2 - Q1 * Q1);
    return nat({ topic: "Mine Resistance — Pressure Change", difficulty: "medium", marks: 2,
      stem: `An airway of resistance $${R}$ carries flow raised from $${Q1}$ to $${Q2}\\,\\text{m}^3/\\text{s}$. Find the increase in pressure drop (Pa). Round off to two decimal places.`, answer: dP, tolerance: 0.5,
      solution: solN("$\\Delta p=R(Q_2^2-Q_1^2)$ from the square law.", `$$\\Delta p=${R}(${Q2}^2-${Q1}^2)=${fmt(dP)}$$`, `$R=${R},\\ Q_1=${Q1},\\ Q_2=${Q2}$.`, fmt(dP), r2(dP - 0.5), r2(dP + 0.5)) }); },
  (rng) => { const rho = rf(rng, 1.1, 1.25, 3), v = rf(rng, 3, 10); const vp = 0.5 * rho * v * v;
    return nat({ topic: "Velocity Pressure", difficulty: "medium", marks: 2,
      stem: `Air of density $${rho}\\,\\text{kg/m}^3$ moves at $${v}\\,\\text{m/s}$. Find the velocity pressure (Pa). Round off to two decimal places.`, answer: vp, tolerance: 0.1,
      solution: solN("Velocity pressure $=\\tfrac12\\rho v^2$.", `$$p_v=\\tfrac12\\times${rho}\\times${v}^2=${fmt(vp)}\\ \\text{Pa}$$`, `$\\rho=${rho},\\ v=${v}$.`, fmt(vp), r2(vp - 0.1), r2(vp + 0.1)) }); },
  (rng) => { const X = pick(rng, [1.5, 2, 2.5]), rho = 1.2, v = rf(rng, 4, 9); const sl = X * 0.5 * rho * v * v;
    return nat({ topic: "Shock Loss", difficulty: "hard", marks: 2,
      stem: `A bend has shock-loss factor $X=${X}$. For air at $1.2\\,\\text{kg/m}^3$ and $${v}\\,\\text{m/s}$, find the shock loss (Pa). Round off to two decimal places.`, answer: sl, tolerance: 0.1,
      solution: solN("Shock loss $=X\\cdot\\tfrac12\\rho v^2$.", `$$p_s=${X}\\times\\tfrac12\\times1.2\\times${v}^2=${fmt(sl)}\\ \\text{Pa}$$`, `$X=${X},\\ v=${v}$.`, fmt(sl), r2(sl - 0.1), r2(sl + 0.1)) }); },
];

/* ---------------- Archetype C — diagrammatic (every Q has a figure) -- */
const C = [
  (rng) => { const Qin = ri(rng, 40, 80), Qb = ri(rng, 10, 25); const Qc = Qin - Qb;
    return nat({ topic: "Ventilation Network — Junction Balance", difficulty: "medium", marks: 2,
      stem: `At the junction shown, intake $${Qin}\\,\\text{m}^3/\\text{s}$ splits; one branch carries $${Qb}$. Find the flow in the other branch (Kirchhoff's first law). Round off to two decimal places.`, answer: Qc, tolerance: 0.02,
      figure: figVent([{ id: "A", x: 40, y: 90 }, { id: "B", x: 160, y: 40 }, { id: "C", x: 160, y: 140 }], [{ from: "A", to: "B", q: Qb }, { from: "A", to: "C" }], "Flow split at a junction"),
      solution: solN("Inflow $=$ sum of outflows at a node.", `$$Q_C=Q_{in}-Q_B=${Qin}-${Qb}=${fmt(Qc)}$$`, `$Q_{in}=${Qin},\\ Q_B=${Qb}$.`, fmt(Qc), r2(Qc - 0.02), r2(Qc + 0.02)) }); },
  (rng) => { const a = ri(rng, 1500, 2500), b = rf(rng, 0.3, 0.8); const R = rf(rng, 0.5, 1.2);
    // operating point: a - b Q^2 = R Q^2  -> Q = sqrt(a/(b+R))
    const Q = Math.sqrt(a / (b + R)); const P = R * Q * Q;
    return nat({ topic: "Fan Operating Point", difficulty: "hard", marks: 2,
      stem: `The fan characteristic is $p=${a}-${b}Q^2$ and the mine resistance is $R=${R}$. Find the operating quantity $Q$ (m³/s). Round off to two decimal places.`, answer: Q, tolerance: 0.1,
      figure: figPQ(a, b, [{ r: R, label: "mine R", color: "#dc2626" }], "Fan vs mine characteristic"),
      solution: solN("Operating point: fan pressure equals mine resistance pressure, $a-bQ^2=RQ^2$.", `$$Q=\\sqrt{\\frac{a}{b+R}}=\\sqrt{\\frac{${a}}{${r2(b + R)}}}=${fmt(Q)}$$`, `$a=${a},\\ b=${b},\\ R=${R}$; $p_{op}=${fmt(P)}$ Pa.`, fmt(Q), r2(Q - 0.1), r2(Q + 0.1)) }); },
  (rng) => { const Rs = [rf(rng, 0.3, 0.9), rf(rng, 0.4, 1.0), rf(rng, 0.5, 1.1), rf(rng, 0.2, 0.8)]; const mx = Math.max(...Rs);
    return nat({ topic: "Ventilation — Highest Resistance Airway", difficulty: "medium", marks: 2,
      stem: `The bars show four airway resistances. Identify the largest resistance value (Ns²/m⁸). Round off to two decimal places.`, answer: mx, tolerance: 0.01,
      figure: svgBar({ labels: ["1", "2", "3", "4"], values: Rs, caption: "Airway resistances", title: "R (Ns²/m⁸)" }),
      solution: solN("Read off the tallest bar.", `$$\\max=${fmt(mx)}$$`, `four resistances.`, fmt(mx), r2(mx - 0.01), r2(mx + 0.01)) }); },
  (rng) => { const Qtot = ri(rng, 60, 100); const R1 = rf(rng, 0.4, 0.9), R2 = rf(rng, 0.4, 0.9); const Q1 = Qtot * Math.sqrt(R2) / (Math.sqrt(R1) + Math.sqrt(R2));
    return nat({ topic: "Ventilation — Parallel Flow Split", difficulty: "hard", marks: 2,
      stem: `Total $${Qtot}\\,\\text{m}^3/\\text{s}$ splits between parallel airways $R_1=${R1}$, $R_2=${R2}$. Find the flow in airway 1. Round off to two decimal places.`, answer: Q1, tolerance: 0.05,
      figure: figVent([{ id: "A", x: 30, y: 90 }, { id: "B", x: 150, y: 40 }, { id: "C", x: 150, y: 140 }, { id: "D", x: 270, y: 90 }], [{ from: "A", to: "B", r: R1 }, { from: "B", to: "D", r: R1 }, { from: "A", to: "C", r: R2 }, { from: "C", to: "D", r: R2 }], "Parallel split"),
      solution: solN("In parallel (square law) $Q\\propto1/\\sqrt{R}$.", `$$Q_1=Q\\frac{\\sqrt{R_2}}{\\sqrt{R_1}+\\sqrt{R_2}}=${fmt(Q1)}$$`, `$Q=${Qtot},\\ R_1=${R1},\\ R_2=${R2}$.`, fmt(Q1), r2(Q1 - 0.05), r2(Q1 + 0.05)) }); },
  (rng) => { const pts = []; const a = ri(rng, 1800, 2400), b = rf(rng, 0.4, 0.9); for (let q = 0; q <= 60; q += 5) pts.push([q, Math.max(0, a - b * q * q)]); const qq = 40; const pAt = a - b * qq * qq;
    return nat({ topic: "Fan Characteristic — Read Pressure", difficulty: "medium", marks: 2,
      stem: `The fan curve is $p=${a}-${b}Q^2$. Read the fan pressure at $Q=40\\,\\text{m}^3/\\text{s}$. Round off to two decimal places.`, answer: pAt, tolerance: 0.5,
      figure: svgLine({ series: [{ points: pts, color: "#2563eb", label: "fan p(Q)" }], xlabel: "Q (m³/s)", ylabel: "p (Pa)", caption: "Fan characteristic" }),
      solution: solN("Substitute $Q$ into the fan equation.", `$$p=${a}-${b}\\times40^2=${fmt(pAt)}\\ \\text{Pa}$$`, `$a=${a},\\ b=${b}$.`, fmt(pAt), r2(pAt - 0.5), r2(pAt + 0.5)) }); },
  (rng) => { const Qin = ri(rng, 80, 120), Q1 = ri(rng, 20, 35), Q2 = ri(rng, 25, 40); const Q3 = Qin - Q1 - Q2;
    return nat({ topic: "Ventilation Network — Three-way Split", difficulty: "hard", marks: 2,
      stem: `Intake $${Qin}\\,\\text{m}^3/\\text{s}$ feeds three branches; two carry $${Q1}$ and $${Q2}$. Find the third branch flow. Round off to two decimal places.`, answer: Q3, tolerance: 0.02,
      figure: figVent([{ id: "A", x: 30, y: 90 }, { id: "B", x: 160, y: 30 }, { id: "C", x: 160, y: 90 }, { id: "D", x: 160, y: 150 }], [{ from: "A", to: "B", q: Q1 }, { from: "A", to: "C", q: Q2 }, { from: "A", to: "D" }], "Three-way split"),
      solution: solN("Node balance: third $=$ inflow $-$ other two.", `$$Q_3=${Qin}-${Q1}-${Q2}=${fmt(Q3)}$$`, `$Q_{in}=${Qin}$.`, fmt(Q3), r2(Q3 - 0.02), r2(Q3 + 0.02)) }); },
  (rng) => { const a = ri(rng, 1600, 2200), b = rf(rng, 0.4, 0.8); const R1 = rf(rng, 0.4, 0.8), R2 = rf(rng, 0.6, 1.0); const Q1 = Math.sqrt(a / (b + R1)), Q2 = Math.sqrt(a / (b + R2)); const dQ = Q1 - Q2;
    return nat({ topic: "Fan — Effect of Resistance", difficulty: "hard", marks: 2,
      stem: `For fan $p=${a}-${b}Q^2$, the mine resistance rises from $R_1=${R1}$ to $R_2=${R2}$. Find the DROP in delivered quantity. Round off to two decimal places.`, answer: dQ, tolerance: 0.1,
      figure: figPQ(a, b, [{ r: R1, label: "R1", color: "#16a34a" }, { r: R2, label: "R2", color: "#dc2626" }], "Two mine resistances"),
      solution: solN("Solve operating point for each resistance, subtract.", `$$Q=\\sqrt{\\tfrac{a}{b+R}};\\ \\Delta Q=${fmt(Q1)}-${fmt(Q2)}=${fmt(dQ)}$$`, `$R_1=${R1},\\ R_2=${R2}$.`, fmt(dQ), r2(dQ - 0.1), r2(dQ + 0.1)) }); },
  (rng) => { const vals = [ri(rng, 30, 50), ri(rng, 40, 60), ri(rng, 50, 70), ri(rng, 35, 55)]; const tot = vals.reduce((a, b) => a + b, 0);
    return nat({ topic: "Ventilation — District Air Demand", difficulty: "medium", marks: 2,
      stem: `Four districts demand the plotted air quantities (m³/s). Find the total air the main fan must supply. Round off to two decimal places.`, answer: tot, tolerance: 0.01,
      figure: svgBar({ labels: ["D1", "D2", "D3", "D4"], values: vals, caption: "District air demand", title: "Q (m³/s)" }),
      solution: solN("Total demand is the sum of district demands.", `$$\\Sigma Q=${vals.join("+")}=${fmt(tot)}$$`, `four districts.`, fmt(tot), r2(tot - 0.01), r2(tot + 0.01)) }); },
  (rng) => { const R = rf(rng, 0.4, 1.0); const pts = []; for (let q = 0; q <= 50; q += 5) pts.push([q, R * q * q]); const qq = 30; const pAt = R * qq * qq;
    return nat({ topic: "Mine Characteristic — Read Pressure", difficulty: "medium", marks: 2,
      stem: `The mine characteristic is $p=${R}Q^2$. From the plot, find the pressure at $Q=30\\,\\text{m}^3/\\text{s}$. Round off to two decimal places.`, answer: pAt, tolerance: 0.5,
      figure: svgLine({ series: [{ points: pts, color: "#dc2626", label: "p=RQ²" }], xlabel: "Q (m³/s)", ylabel: "p (Pa)", caption: "Mine characteristic" }),
      solution: solN("Square law $p=RQ^2$.", `$$p=${R}\\times30^2=${fmt(pAt)}$$`, `$R=${R}$.`, fmt(pAt), r2(pAt - 0.5), r2(pAt + 0.5)) }); },
  (rng) => { const Q = ri(rng, 40, 80), A1 = ri(rng, 8, 14), A2 = ri(rng, 4, 7); const v2 = Q / A2;
    return nat({ topic: "Ventilation — Velocity at Contraction", difficulty: "medium", marks: 2,
      stem: `Air $${Q}\\,\\text{m}^3/\\text{s}$ passes from a $${A1}\\,\\text{m}^2$ airway into a $${A2}\\,\\text{m}^2$ regulator opening. Find the velocity through the opening. Round off to two decimal places.`, answer: v2, tolerance: 0.05,
      figure: figVent([{ id: "A", x: 40, y: 90 }, { id: "B", x: 180, y: 90 }], [{ from: "A", to: "B", q: Q, regulator: true }], "Regulated airway"),
      solution: solN("Continuity at the smaller area: $v=Q/A$.", `$$v=\\frac{${Q}}{${A2}}=${fmt(v2)}\\ \\text{m/s}$$`, `$Q=${Q},\\ A=${A2}$.`, fmt(v2), r2(v2 - 0.05), r2(v2 + 0.05)) }); },
  (rng) => { const N = [400, 500, 600, 700]; const Qbase = ri(rng, 25, 40); const Qs = N.map((n) => Qbase * n / 400);
    return nat({ topic: "Fan Laws — Quantity Trend", difficulty: "medium", marks: 2,
      stem: `The plot shows fan quantity rising linearly with speed (base $${Qbase}\\,\\text{m}^3/\\text{s}$ at 400 rpm). Find the quantity at 700 rpm. Round off to two decimal places.`, answer: Qs[3], tolerance: 0.05,
      figure: svgLine({ series: [{ points: N.map((n, i) => [n - 400, Qs[i]]), color: "#2563eb", dots: true, label: "Q" }], xlabel: "Δspeed (rpm)", ylabel: "Q", caption: "Q ∝ N" }),
      solution: solN("First fan law $Q\\propto N$.", `$$Q=${Qbase}\\times\\frac{700}{400}=${fmt(Qs[3])}$$`, `base $${Qbase}$ at 400 rpm.`, fmt(Qs[3]), r2(Qs[3] - 0.05), r2(Qs[3] + 0.05)) }); },
  (rng) => { const Qin = ri(rng, 70, 110), leak = pick(rng, [0.05, 0.08, 0.1]); const reach = Qin * (1 - leak);
    return nat({ topic: "Ventilation — Leakage Loss", difficulty: "hard", marks: 2,
      stem: `Of $${Qin}\\,\\text{m}^3/\\text{s}$ sent underground, $${r2(leak * 100)}\\%$ leaks through stoppings (see network). Find the air reaching the face. Round off to two decimal places.`, answer: reach, tolerance: 0.05,
      figure: figVent([{ id: "A", x: 30, y: 90 }, { id: "B", x: 150, y: 90 }, { id: "C", x: 270, y: 90 }, { id: "L", x: 150, y: 150 }], [{ from: "A", to: "B", q: Qin }, { from: "B", to: "C" }, { from: "B", to: "L", regulator: true }], "Leakage at stopping"),
      solution: solN("Air at face $=$ supply $\\times(1-\\text{leakage fraction})$.", `$$Q_f=${Qin}(1-${leak})=${fmt(reach)}$$`, `leak $=${r2(leak * 100)}\\%$.`, fmt(reach), r2(reach - 0.05), r2(reach + 0.05)) }); },
];

/* ---------------- Archetype D — multi-stage rank determinators ------ */
const D = [
  (rng) => { const R1 = rf(rng, 0.3, 0.7), R2 = rf(rng, 0.4, 0.8), R3 = rf(rng, 0.5, 0.9); const Rpar = 1 / Math.pow(1 / Math.sqrt(R2) + 1 / Math.sqrt(R3), 2); const Rtot = R1 + Rpar;
    return nat({ topic: "Mine Resistance — Series–Parallel", difficulty: "hard", marks: 2,
      stem: `An airway $R_1=${R1}$ is in series with a parallel pair $R_2=${R2}$, $R_3=${R3}$. Find the total equivalent resistance. Round off to two decimal places.`, answer: Rtot, tolerance: 0.02,
      solution: solN("Combine the parallel pair (square law) then add the series airway.", `$$R_{par}=\\left(\\tfrac{1}{\\sqrt{${R2}}}+\\tfrac{1}{\\sqrt{${R3}}}\\right)^{-2}=${fmt(Rpar)};\\ R=${R1}+R_{par}=${fmt(Rtot)}$$`, `$R_1=${R1},\\ R_2=${R2},\\ R_3=${R3}$.`, fmt(Rtot), r2(Rtot - 0.02), r2(Rtot + 0.02)) }); },
  (rng) => { const R = rf(rng, 0.5, 1.0), Q = ri(rng, 40, 70); const p1 = R * Q * Q; const pBoost = ri(rng, 300, 600); const Qnew = Math.sqrt((p1 + pBoost) / R);
    return nat({ topic: "Booster Fan — New Quantity", difficulty: "hard", marks: 2,
      stem: `An airway $R=${R}$ carries $${Q}\\,\\text{m}^3/\\text{s}$. A booster adding $${pBoost}\\,\\text{Pa}$ is installed. Find the new quantity. Round off to two decimal places.`, answer: Qnew, tolerance: 0.1,
      solution: solN("Total pressure now $p_1+p_{boost}=RQ_{new}^2$.", `$$Q_{new}=\\sqrt{\\frac{${fmt(p1)}+${pBoost}}{${R}}}=${fmt(Qnew)}$$`, `original $p_1=${fmt(p1)}$ Pa.`, fmt(Qnew), r2(Qnew - 0.1), r2(Qnew + 0.1)) }); },
  (rng) => { const q1 = rf(rng, 0.2, 0.5), q2 = rf(rng, 0.3, 0.6), limit = pick(rng, [1.25, 2]); const Q = (q1 + q2) / (limit / 100);
    return nat({ topic: "Gas Dilution — Multiple Sources", difficulty: "hard", marks: 2,
      stem: `Two faces emit methane at $${q1}$ and $${q2}\\,\\text{m}^3/\\text{s}$ into a common return. To keep below $${limit}\\%$, find the minimum return air quantity. Round off to two decimal places.`, answer: Q, tolerance: 0.2,
      solution: solN("Sum the gas sources; required air $=$ total gas $/$ allowable fraction.", `$$Q=\\frac{${q1}+${q2}}{${limit}/100}=${fmt(Q)}$$`, `$q_1=${q1},\\ q_2=${q2}$.`, fmt(Q), r2(Q - 0.2), r2(Q + 0.2)) }); },
  (rng) => { const a = ri(rng, 1800, 2400), b = rf(rng, 0.4, 0.8); const R = rf(rng, 0.5, 1.0); const Q = Math.sqrt(a / (b + R)); const pop = R * Q * Q; const ap = pop * Q / 1000;
    return nat({ topic: "Fan — Operating Air Power", difficulty: "hard", marks: 2,
      stem: `Fan $p=${a}-${b}Q^2$ works against $R=${R}$. Find the air power delivered at the operating point (kW). Round off to two decimal places.`, answer: ap, tolerance: 0.2,
      solution: solN("Find $Q$ at the operating point, then air power $=pQ$.", `$$Q=\\sqrt{\\tfrac{a}{b+R}}=${fmt(Q)};\\ AP=\\frac{${fmt(pop)}\\times${fmt(Q)}}{1000}=${fmt(ap)}$$`, `$a=${a},\\ b=${b},\\ R=${R}$.`, fmt(ap), r2(ap - 0.2), r2(ap + 0.2)) }); },
  (rng) => { const H = ri(rng, 250, 450), d1 = rf(rng, 1.18, 1.24, 3), d2 = rf(rng, 1.05, 1.14, 3), R = rf(rng, 0.5, 1.0); const nvp = H * 9.81 * (d1 - d2); const Q = Math.sqrt(nvp / R);
    return nat({ topic: "Natural Ventilation — Induced Flow", difficulty: "hard", marks: 2,
      stem: `NVP from a $${H}\\,\\text{m}$ shaft (densities $${d1}$, $${d2}\\,\\text{kg/m}^3$) drives flow through resistance $R=${R}$. Find the induced quantity. Round off to two decimal places.`, answer: Q, tolerance: 0.1,
      solution: solN("Compute NVP, then $Q=\\sqrt{NVP/R}$.", `$$NVP=${H}\\times9.81\\times(${d1}-${d2})=${fmt(nvp)};\\ Q=\\sqrt{\\tfrac{${fmt(nvp)}}{${R}}}=${fmt(Q)}$$`, `$H=${H}$.`, fmt(Q), r2(Q - 0.1), r2(Q + 0.1)) }); },
  (rng) => { const R1 = rf(rng, 0.4, 0.8), R2 = rf(rng, 0.4, 0.8); const Rser = R1 + R2; const Rpar = 1 / Math.pow(1 / Math.sqrt(R1) + 1 / Math.sqrt(R2), 2); const ratio = Rser / Rpar;
    return nat({ topic: "Mine Resistance — Series vs Parallel", difficulty: "hard", marks: 2,
      stem: `Two equal-ish airways $R_1=${R1}$, $R_2=${R2}$ can be arranged in series or parallel. Find the ratio $R_{series}/R_{parallel}$. Round off to two decimal places.`, answer: ratio, tolerance: 0.05,
      solution: solN("Compute both equivalents and divide.", `$$R_s=${fmt(Rser)},\\ R_p=${fmt(Rpar)},\\ \\frac{R_s}{R_p}=${fmt(ratio)}$$`, `$R_1=${R1},\\ R_2=${R2}$.`, fmt(ratio), r2(ratio - 0.05), r2(ratio + 0.05)) }); },
  (rng) => { const p = ri(rng, 800, 1600), Q = ri(rng, 40, 80), eff = pick(rng, [0.65, 0.7, 0.75, 0.8]), hrs = pick(rng, [24, 16]), rate = pick(rng, [6, 8, 10]); const kW = p * Q / (1000 * eff); const cost = kW * hrs * rate;
    return nat({ topic: "Fan — Daily Energy Cost", difficulty: "hard", marks: 2,
      stem: `A fan ($${p}\\,\\text{Pa}$, $${Q}\\,\\text{m}^3/\\text{s}$, $\\eta=${eff}$) runs $${hrs}\\,\\text{h/day}$ at $${rate}\\,\\text{₹/kWh}$. Find the daily energy cost (₹). Round off to two decimal places.`, answer: cost, tolerance: 2,
      solution: solN("Motor kW $=pQ/(1000\\eta)$; cost $=$ kW $\\times$ hours $\\times$ tariff.", `$$P=\\frac{${p}\\times${Q}}{1000\\times${eff}}=${fmt(kW)}\\,\\text{kW};\\ \\text{cost}=${fmt(kW)}\\times${hrs}\\times${rate}=${fmt(cost)}$$`, `$\\eta=${eff}$.`, fmt(cost), r2(cost - 2), r2(cost + 2)) }); },
  (rng) => { const Q1 = ri(rng, 30, 50), p1 = ri(rng, 400, 800); const Q2 = ri(rng, 25, 45), p2 = ri(rng, 500, 900); const parallelQ = Q1 + Q2;
    return nat({ topic: "Fans in Parallel — Combined Quantity", difficulty: "hard", marks: 2,
      stem: `At a common operating pressure, fan A passes $${Q1}$ and fan B passes $${Q2}\\,\\text{m}^3/\\text{s}$. In parallel, find the combined quantity. Round off to two decimal places.`, answer: parallelQ, tolerance: 0.01,
      solution: solN("Fans in parallel add quantities at the same pressure.", `$$Q=Q_A+Q_B=${Q1}+${Q2}=${fmt(parallelQ)}$$`, `$Q_A=${Q1},\\ Q_B=${Q2}$.`, fmt(parallelQ), r2(parallelQ - 0.01), r2(parallelQ + 0.01)) }); },
  (rng) => { const p1 = ri(rng, 400, 800), p2 = ri(rng, 400, 800); const seriesP = p1 + p2;
    return nat({ topic: "Fans in Series — Combined Pressure", difficulty: "hard", marks: 2,
      stem: `At a common quantity, fan A gives $${p1}$ and fan B gives $${p2}\\,\\text{Pa}$. In series, find the combined pressure. Round off to two decimal places.`, answer: seriesP, tolerance: 0.01,
      solution: solN("Fans in series add pressures at the same quantity.", `$$p=p_A+p_B=${p1}+${p2}=${fmt(seriesP)}$$`, `$p_A=${p1},\\ p_B=${p2}$.`, fmt(seriesP), r2(seriesP - 0.01), r2(seriesP + 0.01)) }); },
  (rng) => { const Qreq = ri(rng, 50, 90), perMan = pick(rng, [6, 0.075]), men = ri(rng, 20, 60); const need = men * 6; const ok = Qreq >= need ? Qreq - need : need - Qreq;
    return nat({ topic: "Ventilation — Statutory Air per Person", difficulty: "hard", marks: 2,
      stem: `A district has $${men}$ workers; statutory air is $6\\,\\text{m}^3/\\text{min}$ per person. Supply is $${Qreq}\\,\\text{m}^3/\\text{min}$. Find the surplus/deficit magnitude (m³/min). Round off to two decimal places.`, answer: ok, tolerance: 0.01,
      solution: solN("Required $=$ men $\\times6$; compare with supply.", `$$\\text{req}=${men}\\times6=${need};\\ |${Qreq}-${need}|=${fmt(ok)}$$`, `$${men}$ workers.`, fmt(ok), r2(ok - 0.01), r2(ok + 0.01)) }); },
];

export default { slug: "mine-ventilation", name: "Mine Ventilation", subjectTag: SUB, pools: { A, B, C, D } };
