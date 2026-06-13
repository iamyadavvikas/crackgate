/** Surface Mining — 175-question template pools (A30/B30/C60/D55). */
import { mcq, nat, r2, deg, rad, fmt, solN, solC, numMCQ, figBench, svgBar, svgLine, figSvg } from "../build_practice_bank.mjs";

const SUB = "Surface Mining";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const rf = (rng, a, b) => r2(a + rng() * (b - a));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const ob = ri(rng, 200000, 800000), ore = ri(rng, 50000, 200000); const sr = ob / ore;
    return nat({ topic: "Stripping Ratio", difficulty: "easy", marks: 1,
      stem: `A block has $${ob}\\,\\text{m}^3$ overburden and $${ore}\\,\\text{t}$ of ore. Find the stripping ratio (m³/t). Round off to two decimal places.`, answer: sr, tolerance: 0.02,
      solution: solN("SR $=$ overburden volume $/$ ore mass.", `$$SR=\\frac{${ob}}{${ore}}=${fmt(sr)}\\ \\text{m}^3/\\text{t}$$`, `OB $=${ob},\\ \\text{ore}=${ore}$.`, fmt(sr), r2(sr - 0.02), r2(sr + 0.02)) }); },
  (rng) => { const L = ri(rng, 100, 300), W = ri(rng, 30, 80), H = ri(rng, 8, 20); const V = L * W * H;
    return nat({ topic: "Bench — Volume", difficulty: "easy", marks: 1,
      stem: `A bench block is $${L}\\,\\text{m}$ long, $${W}\\,\\text{m}$ wide, $${H}\\,\\text{m}$ high. Find its volume (m³). Round off to two decimal places.`, answer: V, tolerance: 0.5,
      solution: solN("$V=L\\times W\\times H$.", `$$V=${L}\\times${W}\\times${H}=${fmt(V)}$$`, `$L=${L},\\ W=${W},\\ H=${H}$.`, fmt(V), r2(V - 0.5), r2(V + 0.5)) }); },
  (rng) => { const bank = ri(rng, 1000, 5000), swell = pick(rng, [25, 30, 35, 40]); const loose = bank * (1 + swell / 100);
    return nat({ topic: "Swell — Loose Volume", difficulty: "medium", marks: 2,
      stem: `$${bank}\\,\\text{m}^3$ of bank material has $${swell}\\%$ swell. Find the loose volume (m³). Round off to two decimal places.`, answer: loose, tolerance: 0.5,
      solution: solN("Loose volume $=$ bank $\\times(1+\\text{swell})$.", `$$V_L=${bank}(1+${swell / 100})=${fmt(loose)}$$`, `swell $=${swell}\\%$.`, fmt(loose), r2(loose - 0.5), r2(loose + 0.5)) }); },
  (rng) => { const Tc = ri(rng, 25, 40), B = rf(rng, 4, 12), Ff = pick(rng, [0.8, 0.85, 0.9]); const Qt = (3600 / Tc) * B * Ff;
    return nat({ topic: "Shovel — Theoretical Output", difficulty: "medium", marks: 2,
      stem: `A shovel (bucket $${B}\\,\\text{m}^3$, fill factor $${Ff}$) cycles in $${Tc}\\,\\text{s}$. Find the theoretical loose output (m³/h). Round off to two decimal places.`, answer: Qt, tolerance: 1,
      solution: solN("$Q=\\dfrac{3600}{T_c}\\,B\\,F_f$.", `$$Q=\\frac{3600}{${Tc}}\\times${B}\\times${Ff}=${fmt(Qt)}\\ \\text{m}^3/\\text{h}$$`, `$B=${B},\\ T_c=${Tc},\\ F_f=${Ff}$.`, fmt(Qt), r2(Qt - 1), r2(Qt + 1)) }); },
  (rng) => { const B = rf(rng, 4, 12), Ff = pick(rng, [0.85, 0.9]), rho = rf(rng, 1.6, 2.2); const pay = B * Ff * rho;
    return nat({ topic: "Shovel — Bucket Payload", difficulty: "easy", marks: 1,
      stem: `A bucket of $${B}\\,\\text{m}^3$ at fill factor $${Ff}$ loads material of density $${rho}\\,\\text{t/m}^3$. Find the payload per pass (t). Round off to two decimal places.`, answer: pay, tolerance: 0.05,
      solution: solN("Payload $=B\\,F_f\\,\\rho$.", `$$P=${B}\\times${Ff}\\times${rho}=${fmt(pay)}\\ \\text{t}$$`, `$B=${B},\\ F_f=${Ff},\\ \\rho=${rho}$.`, fmt(pay), r2(pay - 0.05), r2(pay + 0.05)) }); },
  (rng) => { const rise = ri(rng, 3, 12), run = ri(rng, 60, 150); const grade = rise / run * 100;
    const m = numMCQ({ rng, correct: grade, traps: [run / rise, rise / run, deg(Math.atan(rise / run))], unit: "%" });
    return mcq({ topic: "Haul Road — Gradient", difficulty: "easy", marks: 1,
      stem: `A haul road rises $${rise}\\,\\text{m}$ over $${run}\\,\\text{m}$ horizontal. Find the gradient (%).`, options: m.options, answer: m.answer,
      solution: solC("Gradient $\\%=\\dfrac{\\text{rise}}{\\text{run}}\\times100$.", `$$\\frac{${rise}}{${run}}\\times100=${fmt(grade)}\\%$$`, `rise $=${rise}$, run $=${run}$.`, `$${fmt(grade)}\\%$.`) }); },
  (rng) => { const H = ri(rng, 10, 25), horiz = ri(rng, 6, 20); const ang = deg(Math.atan(H / horiz));
    return nat({ topic: "Bench — Face Angle", difficulty: "medium", marks: 2,
      stem: `A bench face is $${H}\\,\\text{m}$ high with a horizontal toe-to-crest offset of $${horiz}\\,\\text{m}$. Find the face angle (degrees). Round off to two decimal places.`, answer: ang, tolerance: 0.1,
      solution: solN("Face angle $=\\tan^{-1}(H/\\text{offset})$.", `$$\\alpha=\\tan^{-1}\\frac{${H}}{${horiz}}=${fmt(ang)}^{\\circ}$$`, `$H=${H},\\ \\text{offset}=${horiz}$.`, fmt(ang), r2(ang - 0.1), r2(ang + 0.1)) }); },
  (rng) => { const loose = ri(rng, 1000, 5000), swell = pick(rng, [25, 30, 35]); const bank = loose / (1 + swell / 100);
    return nat({ topic: "Swell — Bank from Loose", difficulty: "medium", marks: 2,
      stem: `$${loose}\\,\\text{m}^3$ of loose material had $${swell}\\%$ swell. Find the original bank volume (m³). Round off to two decimal places.`, answer: bank, tolerance: 0.5,
      solution: solN("Bank $=$ loose $/(1+\\text{swell})$.", `$$V_B=\\frac{${loose}}{1+${swell / 100}}=${fmt(bank)}$$`, `swell $=${swell}\\%$.`, fmt(bank), r2(bank - 0.5), r2(bank + 0.5)) }); },
];

/* ---------------- Archetype B — vintage PYQ variants ---------------- */
const B = [
  (rng) => { const Tc = ri(rng, 28, 40), B = rf(rng, 6, 15), Ff = pick(rng, [0.85, 0.9]), sf = pick(rng, [1.25, 1.3]), avail = pick(rng, [0.8, 0.85, 0.9]); const Q = (3600 / Tc) * B * Ff / sf * avail;
    return nat({ topic: "Shovel — Bank Productivity", difficulty: "hard", marks: 2,
      stem: `Shovel: bucket $${B}\\,\\text{m}^3$, fill $${Ff}$, swell factor $${sf}$, cycle $${Tc}\\,\\text{s}$, availability $${avail}$. Find bank productivity (BCM/h). Round off to two decimal places.`, answer: Q, tolerance: 2,
      solution: solN("$Q=\\dfrac{3600}{T_c}B\\,F_f\\dfrac{1}{S_f}\\,A$.", `$$Q=\\frac{3600}{${Tc}}\\times${B}\\times${Ff}\\div${sf}\\times${avail}=${fmt(Q)}$$`, `$S_f=${sf},\\ A=${avail}$.`, fmt(Q), r2(Q - 2), r2(Q + 2)) }); },
  (rng) => { const Tload = rf(rng, 2, 4), Thaul = rf(rng, 6, 12), Tret = rf(rng, 4, 8), Tdump = rf(rng, 0.5, 1.5); const cycle = Tload + Thaul + Tret + Tdump; const n = cycle / Tload;
    return nat({ topic: "Truck–Shovel — Trucks Required", difficulty: "hard", marks: 2,
      stem: `Truck cycle: load $${Tload}$, haul $${Thaul}$, dump $${Tdump}$, return $${Tret}$ (min). Find the number of trucks to keep the shovel busy. Round off to two decimal places.`, answer: n, tolerance: 0.05,
      solution: solN("Trucks $=\\dfrac{\\text{cycle time}}{\\text{loading time}}$.", `$$n=\\frac{${fmt(cycle)}}{${Tload}}=${fmt(n)}$$`, `cycle $=${fmt(cycle)}$ min.`, fmt(n), r2(n - 0.05), r2(n + 0.05)) }); },
  (rng) => { const B = rf(rng, 20, 60), Tc = ri(rng, 50, 70), Ff = pick(rng, [0.85, 0.9]), avail = pick(rng, [0.8, 0.85]); const Q = (3600 / Tc) * B * Ff * avail;
    return nat({ topic: "Dragline — Output", difficulty: "hard", marks: 2,
      stem: `A dragline (bucket $${B}\\,\\text{m}^3$, fill $${Ff}$, cycle $${Tc}\\,\\text{s}$, availability $${avail}$) operates. Find the loose output (m³/h). Round off to two decimal places.`, answer: Q, tolerance: 2,
      solution: solN("$Q=\\dfrac{3600}{T_c}B\\,F_f\\,A$.", `$$Q=\\frac{3600}{${Tc}}\\times${B}\\times${Ff}\\times${avail}=${fmt(Q)}$$`, `$B=${B},\\ T_c=${Tc}$.`, fmt(Q), r2(Q - 2), r2(Q + 2)) }); },
  (rng) => { const d = ri(rng, 2, 6), v1 = ri(rng, 15, 25), v2 = ri(rng, 30, 45); const t = (d / v1 + d / v2) * 60;
    return nat({ topic: "Haul — Round-trip Time", difficulty: "medium", marks: 2,
      stem: `A truck hauls $${d}\\,\\text{km}$ loaded at $${v1}\\,\\text{km/h}$ and returns empty at $${v2}\\,\\text{km/h}$. Find the travel time (min). Round off to two decimal places.`, answer: t, tolerance: 0.1,
      solution: solN("Sum loaded and empty travel times; convert to minutes.", `$$t=\\left(\\frac{${d}}{${v1}}+\\frac{${d}}{${v2}}\\right)\\times60=${fmt(t)}\\ \\text{min}$$`, `$d=${d},\\ v_1=${v1},\\ v_2=${v2}$.`, fmt(t), r2(t - 0.1), r2(t + 0.1)) }); },
  (rng) => { const nT = ri(rng, 4, 9), Tc = rf(rng, 18, 28), Tl = rf(rng, 2.5, 4); const MF = nT * Tl / Tc;
    return nat({ topic: "Truck–Shovel — Match Factor", difficulty: "hard", marks: 2,
      stem: `$${nT}$ trucks (load time $${Tl}$ min each) serve a shovel with truck cycle $${Tc}$ min. Find the match factor. Round off to two decimal places.`, answer: MF, tolerance: 0.02,
      solution: solN("Match factor $=\\dfrac{n\\times t_{load}}{t_{cycle}}$; $\\approx1$ is ideal.", `$$MF=\\frac{${nT}\\times${Tl}}{${Tc}}=${fmt(MF)}$$`, `$n=${nT},\\ t_l=${Tl}$.`, fmt(MF), r2(MF - 0.02), r2(MF + 0.02)) }); },
  (rng) => { const BH = ri(rng, 10, 15), BW = ri(rng, 8, 16), batter = ri(rng, 60, 75); const horiz = BH / Math.tan(rad(batter)) + BW; const overall = deg(Math.atan(BH / horiz));
    return nat({ topic: "Pit Slope — Overall Angle", difficulty: "hard", marks: 2,
      stem: `Benches: height $${BH}\\,\\text{m}$, berm width $${BW}\\,\\text{m}$, batter $${batter}^{\\circ}$. Find the overall slope angle for one bench-berm module. Round off to two decimal places.`, answer: overall, tolerance: 0.2,
      solution: solN("Overall angle $=\\tan^{-1}\\dfrac{BH}{BH/\\tan(\\text{batter})+BW}$.", `$$\\alpha=\\tan^{-1}\\frac{${BH}}{${fmt(horiz)}}=${fmt(overall)}^{\\circ}$$`, `$BH=${BH},\\ BW=${BW},\\ \\text{batter}=${batter}^{\\circ}$.`, fmt(overall), r2(overall - 0.2), r2(overall + 0.2)) }); },
  (rng) => { const prod = ri(rng, 2000, 6000), hrs = pick(rng, [16, 20, 22]), days = pick(rng, [300, 330]); const annual = prod * hrs * days / 1e6;
    return nat({ topic: "Mine Output — Annual", difficulty: "medium", marks: 2,
      stem: `A shovel moves $${prod}\\,\\text{m}^3/\\text{h}$, works $${hrs}\\,\\text{h/day}$, $${days}\\,\\text{days/yr}$. Find the annual output (million m³). Round off to two decimal places.`, answer: annual, tolerance: 0.05,
      solution: solN("Annual $=$ hourly $\\times$ hours $\\times$ days.", `$$V=\\frac{${prod}\\times${hrs}\\times${days}}{10^6}=${fmt(annual)}\\ \\text{Mm}^3$$`, `$${prod}$ m³/h.`, fmt(annual), r2(annual - 0.05), r2(annual + 0.05)) }); },
  (rng) => { const cap = ri(rng, 60, 220), pay = rf(rng, 1.6, 2.2), B = rf(rng, 8, 20), Ff = 0.9; const passes = cap / (B * Ff * pay);
    return nat({ topic: "Truck Loading — Passes", difficulty: "medium", marks: 2,
      stem: `A $${cap}\\,\\text{t}$ truck is loaded by a $${B}\\,\\text{m}^3$ bucket (fill 0.9) with material $${pay}\\,\\text{t/m}^3$. Find the number of passes needed. Round off to two decimal places.`, answer: passes, tolerance: 0.05,
      solution: solN("Passes $=\\dfrac{\\text{truck capacity}}{\\text{payload per pass}}$.", `$$n=\\frac{${cap}}{${B}\\times0.9\\times${pay}}=${fmt(passes)}$$`, `cap $=${cap},\\ B=${B}$.`, fmt(passes), r2(passes - 0.05), r2(passes + 0.05)) }); },
];

/* ---------------- Archetype C — diagrammatic (every Q has a figure) -- */
const C = [
  (rng) => { const BH = ri(rng, 10, 18), burden = ri(rng, 5, 9), spacing = ri(rng, 6, 11), holes = ri(rng, 4, 8);
    return nat({ topic: "Bench Blast — Pattern Width", difficulty: "medium", marks: 2,
      stem: `From the bench plan, $${holes}$ holes are spaced $${spacing}\\,\\text{m}$ apart in a row. Find the row length (spacing $\\times$ (holes$-$1)). Round off to two decimal places.`, answer: spacing * (holes - 1), tolerance: 0.05,
      figure: figBench({ benchHeight: BH, burden, spacing, holes, caption: `${holes} holes @ ${spacing} m` }),
      solution: solN("Row length $=$ spacing $\\times(N-1)$.", `$$L=${spacing}\\times(${holes}-1)=${fmt(spacing * (holes - 1))}\\ \\text{m}$$`, `spacing $=${spacing}$, holes $=${holes}$.`, fmt(spacing * (holes - 1)), r2(spacing * (holes - 1) - 0.05), r2(spacing * (holes - 1) + 0.05)) }); },
  (rng) => { const BH = ri(rng, 10, 16), burden = ri(rng, 5, 8), spacing = ri(rng, 6, 10); const vol = BH * burden * spacing;
    return nat({ topic: "Bench Blast — Volume per Hole", difficulty: "medium", marks: 2,
      stem: `For the bench shown (height $${BH}\\,\\text{m}$, burden $${burden}\\,\\text{m}$, spacing $${spacing}\\,\\text{m}$), find the rock volume broken per hole. Round off to two decimal places.`, answer: vol, tolerance: 0.5,
      figure: figBench({ benchHeight: BH, burden, spacing, holes: 5, caption: "Bench geometry" }),
      solution: solN("Volume per hole $=H\\times B\\times S$.", `$$V=${BH}\\times${burden}\\times${spacing}=${fmt(vol)}\\ \\text{m}^3$$`, `$H=${BH},\\ B=${burden},\\ S=${spacing}$.`, fmt(vol), r2(vol - 0.5), r2(vol + 0.5)) }); },
  (rng) => { const BH = ri(rng, 10, 16), slope = ri(rng, 60, 75); const toe = BH / Math.tan(rad(slope));
    return nat({ topic: "Bench — Toe Offset", difficulty: "medium", marks: 2,
      stem: `A bench face (height $${BH}\\,\\text{m}$) stands at $${slope}^{\\circ}$. Find the horizontal toe-to-crest offset. Round off to two decimal places.`, answer: toe, tolerance: 0.05,
      figure: figBench({ benchHeight: BH, burden: 6, spacing: 7, slopeAngle: slope, caption: `face ${slope}°` }),
      solution: solN("Offset $=H/\\tan(\\text{slope})$.", `$$x=\\frac{${BH}}{\\tan${slope}^{\\circ}}=${fmt(toe)}\\ \\text{m}$$`, `$H=${BH},\\ \\theta=${slope}^{\\circ}$.`, fmt(toe), r2(toe - 0.05), r2(toe + 0.05)) }); },
  (rng) => { const vals = [ri(rng, 1500, 2500), ri(rng, 2000, 3000), ri(rng, 2500, 3500), ri(rng, 1800, 2800)]; const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return nat({ topic: "Production — Shift Average", difficulty: "medium", marks: 2,
      stem: `The bar chart shows four shifts' output (m³). Find the average output per shift. Round off to two decimal places.`, answer: avg, tolerance: 1,
      figure: svgBar({ labels: ["S1", "S2", "S3", "S4"], values: vals, caption: "Shift output", title: "m³/shift" }),
      solution: solN("Average the four bars.", `$$\\bar Q=\\frac{${vals.join("+")}}{4}=${fmt(avg)}$$`, `four shifts.`, fmt(avg), r2(avg - 1), r2(avg + 1)) }); },
  (rng) => { const years = [1, 2, 3, 4, 5]; const sr = years.map((y) => r2(1.5 + 0.6 * y)); const target = sr[4];
    return nat({ topic: "Stripping Ratio — Trend", difficulty: "medium", marks: 2,
      stem: `The plotted stripping ratio rises with pit depth. Read the SR in year 5. Round off to two decimal places.`, answer: target, tolerance: 0.05,
      figure: svgLine({ series: [{ points: years.map((y, i) => [y, sr[i]]), color: "#dc2626", dots: true, label: "SR" }], xlabel: "year", ylabel: "SR (m³/t)", caption: "Stripping ratio trend" }),
      solution: solN("Read the year-5 value off the line.", `$$SR_5=${fmt(target)}$$`, `linear rise.`, fmt(target), r2(target - 0.05), r2(target + 0.05)) }); },
  (rng) => { const load = ri(rng, 25, 35), haul = ri(rng, 35, 50), ret = ri(rng, 20, 30), dump = 100 - load - haul - ret; const total = ri(rng, 20, 30); const haulTime = haul / 100 * total;
    let acc = 0; const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"]; const parts = [load, haul, dump, ret]; let segs = "";
    parts.forEach((p, i) => { const a0 = acc / 100 * 2 * Math.PI, a1 = (acc + p) / 100 * 2 * Math.PI; acc += p; const x0 = 80 + 55 * Math.cos(a0), y0 = 75 + 55 * Math.sin(a0), x1 = 80 + 55 * Math.cos(a1), y1 = 75 + 55 * Math.sin(a1); const large = (a1 - a0) > Math.PI ? 1 : 0; segs += `<path d='M80,75 L${r2(x0)},${r2(y0)} A55,55 0 ${large} 1 ${r2(x1)},${r2(y1)} Z' fill='${colors[i]}'/>`; });
    return nat({ topic: "Truck Cycle — Time Split", difficulty: "medium", marks: 2,
      stem: `The pie shows a truck cycle split (load $${load}\\%$, haul $${haul}\\%$, dump $${dump}\\%$, return $${ret}\\%$). For a $${total}\\,\\text{min}$ cycle, find the haul time (min). Round off to two decimal places.`, answer: haulTime, tolerance: 0.05,
      figure: figSvg(`<svg viewBox='0 0 220 160' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='10'>${segs}<text x='80' y='150' text-anchor='middle' fill='#475569'>cycle split (load/haul/dump/return)</text></svg>`, "Truck cycle pie"),
      solution: solN("Haul time $=$ haul fraction $\\times$ cycle time.", `$$t_h=${haul / 100}\\times${total}=${fmt(haulTime)}\\ \\text{min}$$`, `haul $=${haul}\\%$.`, fmt(haulTime), r2(haulTime - 0.05), r2(haulTime + 0.05)) }); },
  (rng) => { const dist = [0, 1, 2, 3, 4]; const elev = [0, ri(rng, 10, 20), ri(rng, 25, 40), ri(rng, 45, 60), ri(rng, 65, 80)]; const grade = (elev[4] - elev[0]) / (4000) * 100;
    return nat({ topic: "Haul Profile — Average Grade", difficulty: "hard", marks: 2,
      stem: `The haul-road profile rises to $${elev[4]}\\,\\text{m}$ over $4\\,\\text{km}$. Find the average grade (%). Round off to two decimal places.`, answer: grade, tolerance: 0.05,
      figure: svgLine({ series: [{ points: dist.map((d, i) => [d, elev[i]]), color: "#2563eb", dots: true, label: "elev" }], xlabel: "distance (km)", ylabel: "elevation (m)", caption: "Haul profile" }),
      solution: solN("Average grade $=\\dfrac{\\text{total rise}}{\\text{total run}}\\times100$.", `$$\\frac{${elev[4]}}{4000}\\times100=${fmt(grade)}\\%$$`, `rise $=${elev[4]}$ m.`, fmt(grade), r2(grade - 0.05), r2(grade + 0.05)) }); },
  (rng) => { const BH = ri(rng, 12, 18), nB = ri(rng, 3, 6), BW = ri(rng, 8, 14), batter = ri(rng, 65, 75); const totalH = BH * nB; const totalHoriz = nB * (BH / Math.tan(rad(batter)) + BW) - BW; const overall = deg(Math.atan(totalH / totalHoriz));
    return nat({ topic: "Pit Slope — Multi-bench Overall", difficulty: "hard", marks: 2,
      stem: `A pit wall has $${nB}$ benches (height $${BH}\\,\\text{m}$, berm $${BW}\\,\\text{m}$, batter $${batter}^{\\circ}$, no top berm). Find the overall slope angle. Round off to two decimal places.`, answer: overall, tolerance: 0.3,
      figure: figSvg(`<svg viewBox='0 0 260 170' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='9'><polyline points='20,150 60,150 60,110 100,110 100,70 140,70 140,30 180,30' fill='none' stroke='#b91c1c' stroke-width='2'/><line x1='20' y1='150' x2='180' y2='30' stroke='#2563eb' stroke-dasharray='4 3'/><text x='130' y='162' text-anchor='middle' fill='#475569'>${nB} benches, overall slope (dashed)</text></svg>`, "Multi-bench wall"),
      solution: solN("Overall angle from total height over total horizontal run.", `$$\\alpha=\\tan^{-1}\\frac{${totalH}}{${fmt(totalHoriz)}}=${fmt(overall)}^{\\circ}$$`, `$${nB}$ benches.`, fmt(overall), r2(overall - 0.3), r2(overall + 0.3)) }); },
  (rng) => { const vals = [ri(rng, 60, 80), ri(rng, 70, 90), ri(rng, 75, 95)]; const util = vals[2];
    return nat({ topic: "Equipment — Utilization Read", difficulty: "easy", marks: 1,
      stem: `The bars give monthly fleet utilization (%). Read the third month's utilization. Round off to two decimal places.`, answer: util, tolerance: 0.01,
      figure: svgBar({ labels: ["M1", "M2", "M3"], values: vals, caption: "Utilization", title: "%" }),
      solution: solN("Read the third bar.", `$$U_3=${fmt(util)}\\%$$`, `three months.`, fmt(util), r2(util - 0.01), r2(util + 0.01)) }); },
  (rng) => { const cap = ri(rng, 90, 220), passes = ri(rng, 3, 6), B = rf(rng, 8, 16); const usedVol = passes * B * 0.9; const fill = cap / usedVol;
    return nat({ topic: "Loading — Effective Density", difficulty: "hard", marks: 2,
      stem: `A $${cap}\\,\\text{t}$ truck is filled in $${passes}$ passes of a $${B}\\,\\text{m}^3$ bucket (fill 0.9). Find the implied material density (t/m³). Round off to two decimal places.`, answer: fill, tolerance: 0.02,
      figure: svgBar({ labels: Array.from({ length: passes }, (_, i) => "p" + (i + 1)), values: Array.from({ length: passes }, () => r2(B * 0.9)), caption: "Bucket passes (m³ each)", title: "m³" }),
      solution: solN("Density $=\\dfrac{\\text{truck tonnage}}{\\text{total loose volume}}$.", `$$\\rho=\\frac{${cap}}{${passes}\\times${B}\\times0.9}=${fmt(fill)}$$`, `$${passes}$ passes.`, fmt(fill), r2(fill - 0.02), r2(fill + 0.02)) }); },
  (rng) => { const ore = [ri(rng, 40, 60), ri(rng, 50, 70), ri(rng, 60, 80)]; const ob = [ri(rng, 80, 120), ri(rng, 100, 140), ri(rng, 120, 160)]; const sr = ob[1] / ore[1];
    return nat({ topic: "Stripping — From Bar Pair", difficulty: "medium", marks: 2,
      stem: `For year 2, overburden (red) and ore (blue) are plotted. Find the stripping ratio in year 2. Round off to two decimal places.`, answer: sr, tolerance: 0.05,
      figure: svgLine({ series: [{ points: ob.map((v, i) => [i + 1, v]), color: "#dc2626", dots: true, label: "OB" }, { points: ore.map((v, i) => [i + 1, v]), color: "#2563eb", dots: true, label: "ore" }], xlabel: "year", ylabel: "k-units", caption: "OB vs ore" }),
      solution: solN("SR $=$ OB $/$ ore for that year.", `$$SR=\\frac{${ob[1]}}{${ore[1]}}=${fmt(sr)}$$`, `year-2 values.`, fmt(sr), r2(sr - 0.05), r2(sr + 0.05)) }); },
  (rng) => { const Tc = ri(rng, 28, 38), B = rf(rng, 8, 16); const pts = []; for (let t = 20; t <= 50; t += 5) pts.push([t, r2((3600 / t) * B * 0.9)]); const target = r2((3600 / Tc) * B * 0.9);
    return nat({ topic: "Shovel — Output vs Cycle Time", difficulty: "medium", marks: 2,
      stem: `The curve shows shovel output vs cycle time (bucket $${B}\\,\\text{m}^3$, fill 0.9). Read the output at cycle $${Tc}\\,\\text{s}$. Round off to two decimal places.`, answer: target, tolerance: 2,
      figure: svgLine({ series: [{ points: pts, color: "#16a34a", label: "Q" }], xlabel: "cycle (s)", ylabel: "Q (m³/h)", caption: "Output vs cycle" }),
      solution: solN("$Q=\\dfrac{3600}{T_c}B\\,F_f$.", `$$Q=\\frac{3600}{${Tc}}\\times${B}\\times0.9=${fmt(target)}$$`, `$T_c=${Tc}$.`, fmt(target), r2(target - 2), r2(target + 2)) }); },
];

/* ---------------- Archetype D — multi-stage rank determinators ------ */
const D = [
  (rng) => { const target = ri(rng, 3000, 6000), Tc = ri(rng, 28, 38), B = rf(rng, 8, 16), Ff = 0.9, sf = 1.3, avail = 0.85; const perShovel = (3600 / Tc) * B * Ff / sf * avail; const n = target / perShovel;
    return nat({ topic: "Fleet Sizing — Shovels", difficulty: "hard", marks: 2,
      stem: `A pit must move $${target}\\,\\text{BCM/h}$. Each shovel (bucket $${B}\\,\\text{m}^3$, fill 0.9, swell 1.3, cycle $${Tc}\\,\\text{s}$, avail 0.85) delivers. Find the number of shovels required. Round off to two decimal places.`, answer: n, tolerance: 0.05,
      solution: solN("Per-shovel bank output, then divide the target.", `$$Q_1=\\frac{3600}{${Tc}}\\times${B}\\times0.9\\div1.3\\times0.85=${fmt(perShovel)};\\ n=\\frac{${target}}{${fmt(perShovel)}}=${fmt(n)}$$`, `target $=${target}$.`, fmt(n), r2(n - 0.05), r2(n + 0.05)) }); },
  (rng) => { const price = rf(rng, 40, 80), cost = rf(rng, 18, 30), stripCost = rf(rng, 2, 4); const besr = (price - cost) / stripCost;
    return nat({ topic: "Break-even Stripping Ratio", difficulty: "hard", marks: 2,
      stem: `Ore sells for $${price}$/t, ore mining+processing costs $${cost}$/t, and overburden removal costs $${stripCost}$/m³. Find the break-even stripping ratio. Round off to two decimal places.`, answer: besr, tolerance: 0.05,
      solution: solN("BESR $=\\dfrac{\\text{revenue}-\\text{ore cost}}{\\text{stripping cost}}$.", `$$BESR=\\frac{${price}-${cost}}{${stripCost}}=${fmt(besr)}\\ \\text{m}^3/\\text{t}$$`, `price $=${price}$, cost $=${cost}$.`, fmt(besr), r2(besr - 0.05), r2(besr + 0.05)) }); },
  (rng) => { const target = ri(rng, 2000, 5000), pay = rf(rng, 80, 180), cycle = rf(rng, 18, 30); const perTruck = pay / cycle * 60; const n = target / perTruck;
    return nat({ topic: "Fleet Sizing — Trucks", difficulty: "hard", marks: 2,
      stem: `Required haulage is $${target}\\,\\text{t/h}$. Each truck carries $${pay}\\,\\text{t}$ with cycle $${cycle}\\,\\text{min}$. Find the number of trucks. Round off to two decimal places.`, answer: n, tolerance: 0.05,
      solution: solN("Per-truck rate $=\\dfrac{\\text{payload}\\times60}{\\text{cycle}}$; divide the target.", `$$Q_1=\\frac{${pay}\\times60}{${cycle}}=${fmt(perTruck)};\\ n=\\frac{${target}}{${fmt(perTruck)}}=${fmt(n)}$$`, `target $=${target}$.`, fmt(n), r2(n - 0.05), r2(n + 0.05)) }); },
  (rng) => { const avail = pick(rng, [0.85, 0.88, 0.9]), util = pick(rng, [0.8, 0.85]), sched = pick(rng, [16, 20, 24]); const opHrs = sched * avail * util;
    return nat({ topic: "Equipment — Effective Operating Hours", difficulty: "hard", marks: 2,
      stem: `A machine is scheduled $${sched}\\,\\text{h/day}$ at availability $${avail}$ and utilization $${util}$. Find effective operating hours per day. Round off to two decimal places.`, answer: opHrs, tolerance: 0.05,
      solution: solN("Effective hours $=$ scheduled $\\times$ availability $\\times$ utilization.", `$$t=${sched}\\times${avail}\\times${util}=${fmt(opHrs)}\\ \\text{h}$$`, `$A=${avail},\\ U=${util}$.`, fmt(opHrs), r2(opHrs - 0.05), r2(opHrs + 0.05)) }); },
  (rng) => { const dumpH = ri(rng, 20, 40), repose = ri(rng, 34, 38); const base = dumpH / Math.tan(rad(repose)); const footprint = Math.PI * base * base;
    return nat({ topic: "Waste Dump — Footprint", difficulty: "hard", marks: 2,
      stem: `A conical waste dump is $${dumpH}\\,\\text{m}$ high at angle of repose $${repose}^{\\circ}$. Find its base footprint area (m²). Round off to two decimal places.`, answer: footprint, tolerance: 2,
      solution: solN("Base radius $=H/\\tan(\\text{repose})$; area $=\\pi r^2$.", `$$r=\\frac{${dumpH}}{\\tan${repose}^{\\circ}}=${fmt(base)};\\ A=\\pi r^2=${fmt(footprint)}$$`, `$H=${dumpH},\\ \\theta=${repose}^{\\circ}$.`, fmt(footprint), r2(footprint - 2), r2(footprint + 2)) }); },
  (rng) => { const Q = ri(rng, 1500, 4000), grade = rf(rng, 0.5, 2.5), rec = pick(rng, [85, 90, 92]); const metal = Q * grade / 100 * rec / 100;
    return nat({ topic: "Ore — Recovered Metal", difficulty: "hard", marks: 2,
      stem: `$${Q}\\,\\text{t}$ of ore at $${grade}\\%$ metal is processed at $${rec}\\%$ recovery. Find the recovered metal (t). Round off to two decimal places.`, answer: metal, tolerance: 0.1,
      solution: solN("Metal $=$ tonnage $\\times$ grade $\\times$ recovery.", `$$M=${Q}\\times${grade / 100}\\times${rec / 100}=${fmt(metal)}\\ \\text{t}$$`, `grade $=${grade}\\%$, rec $=${rec}\\%$.`, fmt(metal), r2(metal - 0.1), r2(metal + 0.1)) }); },
  (rng) => { const W = ri(rng, 200, 400), GVW = ri(rng, 300, 600), grade = pick(rng, [8, 10, 12]), rr = pick(rng, [2, 2.5, 3]); const totalRes = (grade + rr) / 100 * GVW * 9.81;
    return nat({ topic: "Haul Truck — Total Resistance Force", difficulty: "hard", marks: 2,
      stem: `A truck (GVW $${GVW}\\,\\text{kN}$ as mass-equivalent... take GVW $=${GVW}$ tonnes) climbs a $${grade}\\%$ grade with $${rr}\\%$ rolling resistance. Find the total resistive force (kN). Round off to two decimal places.`, answer: totalRes, tolerance: 1,
      solution: solN("Total resistance $\\approx(\\text{grade}\\%+\\text{RR}\\%)\\times$ weight; weight $=mg$.", `$$F=\\frac{${grade}+${rr}}{100}\\times${GVW}\\times9.81=${fmt(totalRes)}\\ \\text{kN}$$`, `grade $=${grade}\\%$, RR $=${rr}\\%$.`, fmt(totalRes), r2(totalRes - 1), r2(totalRes + 1)) }); },
  (rng) => { const reserve = ri(rng, 5, 20), rate = rf(rng, 0.8, 3); const life = reserve / rate;
    return nat({ topic: "Mine Life", difficulty: "medium", marks: 2,
      stem: `A deposit holds $${reserve}\\,\\text{Mt}$ minable at $${rate}\\,\\text{Mt/yr}$. Find the mine life (years). Round off to two decimal places.`, answer: life, tolerance: 0.05,
      solution: solN("Mine life $=$ reserve $/$ annual production.", `$$L=\\frac{${reserve}}{${rate}}=${fmt(life)}\\ \\text{yr}$$`, `reserve $=${reserve}$ Mt.`, fmt(life), r2(life - 0.05), r2(life + 0.05)) }); },
  (rng) => { const b = ri(rng, 6, 10), s = ri(rng, 7, 12), H = ri(rng, 12, 18), n = ri(rng, 20, 40), rho = rf(rng, 2.4, 2.7); const tonnes = b * s * H * n * rho;
    return nat({ topic: "Blast — Tonnage Broken", difficulty: "hard", marks: 2,
      stem: `A blast of $${n}$ holes (burden $${b}$, spacing $${s}$, bench $${H}\\,\\text{m}$) breaks rock of $${rho}\\,\\text{t/m}^3$. Find the total tonnage. Round off to two decimal places.`, answer: tonnes, tolerance: 5,
      solution: solN("Tonnage $=B\\times S\\times H\\times N\\times\\rho$.", `$$T=${b}\\times${s}\\times${H}\\times${n}\\times${rho}=${fmt(tonnes)}\\ \\text{t}$$`, `$N=${n},\\ \\rho=${rho}$.`, fmt(tonnes), r2(tonnes - 5), r2(tonnes + 5)) }); },
  (rng) => { const capEx = ri(rng, 50, 200), annual = rf(rng, 10, 40); const payback = capEx / annual;
    return nat({ topic: "Project — Simple Payback", difficulty: "medium", marks: 2,
      stem: `A pit expansion costs $${capEx}$ crore and returns $${annual}$ crore/yr net. Find the simple payback period (years). Round off to two decimal places.`, answer: payback, tolerance: 0.05,
      solution: solN("Payback $=$ capital $/$ annual net cash flow.", `$$t=\\frac{${capEx}}{${annual}}=${fmt(payback)}\\ \\text{yr}$$`, `capex $=${capEx}$.`, fmt(payback), r2(payback - 0.05), r2(payback + 0.05)) }); },
];

export default { slug: "surface-mining", name: "Surface Mining", subjectTag: SUB, pools: { A, B, C, D } };
