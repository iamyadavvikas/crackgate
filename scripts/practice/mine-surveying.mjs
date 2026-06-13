/** Mine Surveying & Geomatics — 175 questions (A30/B30/C60/D55). */
import { mcq, nat, r2, deg, rad, fmt, solN, solC, numMCQ, svgBar, svgLine, figSvg } from "../build_practice_bank.mjs";

const SUB = "Mine Surveying & Geomatics";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const rf = (rng, a, b) => r2(a + rng() * (b - a));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const wcb = ri(rng, 100, 260); const rb = wcb <= 90 ? wcb : wcb <= 180 ? 180 - wcb : wcb <= 270 ? wcb - 180 : 360 - wcb;
    return nat({ topic: "WCB to Reduced Bearing", difficulty: "easy", marks: 1,
      stem: `A line has whole-circle bearing $${wcb}^{\\circ}$. Find the reduced bearing magnitude (degrees). Round off to two decimal places.`, answer: rb, tolerance: 0.05,
      solution: solN("Convert WCB to quadrantal RB.", `$$RB=${wcb}^{\\circ}\\to${fmt(rb)}^{\\circ}$$`, `WCB $=${wcb}^{\\circ}$.`, fmt(rb), r2(rb - 0.05), r2(rb + 0.05)) }); },
  (rng) => { const fb = ri(rng, 30, 150); const bb = fb < 180 ? fb + 180 : fb - 180;
    return nat({ topic: "Fore & Back Bearing", difficulty: "easy", marks: 1,
      stem: `The fore bearing of a line is $${fb}^{\\circ}$. Find its back bearing (degrees). Round off to two decimal places.`, answer: bb, tolerance: 0.05,
      solution: solN("BB $=$ FB $\\pm180^{\\circ}$.", `$$BB=${fb}+180=${fmt(bb)}^{\\circ}$$`, `FB $=${fb}^{\\circ}$.`, fmt(bb), r2(bb - 0.05), r2(bb + 0.05)) }); },
  (rng) => { const L = ri(rng, 100, 400), brg = ri(rng, 20, 70); const dep = L * Math.sin(rad(brg)), lat = L * Math.cos(rad(brg));
    return nat({ topic: "Latitude of a Line", difficulty: "medium", marks: 2,
      stem: `A line of length $${L}\\,\\text{m}$ has bearing $${brg}^{\\circ}$. Find its latitude (N-S component, m). Round off to two decimal places.`, answer: r2(lat), tolerance: 0.05,
      solution: solN("latitude $=L\\cos\\theta$.", `$$\\text{lat}=${L}\\cos${brg}^{\\circ}=${fmt(lat)}\\ \\text{m}$$`, `$L=${L},\\ \\theta=${brg}$.`, fmt(lat), r2(lat - 0.05), r2(lat + 0.05)) }); },
  (rng) => { const L = ri(rng, 100, 400), brg = ri(rng, 20, 70); const dep = L * Math.sin(rad(brg));
    return nat({ topic: "Departure of a Line", difficulty: "medium", marks: 2,
      stem: `A line of length $${L}\\,\\text{m}$ has bearing $${brg}^{\\circ}$. Find its departure (E-W component, m). Round off to two decimal places.`, answer: r2(dep), tolerance: 0.05,
      solution: solN("departure $=L\\sin\\theta$.", `$$\\text{dep}=${L}\\sin${brg}^{\\circ}=${fmt(dep)}\\ \\text{m}$$`, `$L=${L},\\ \\theta=${brg}$.`, fmt(dep), r2(dep - 0.05), r2(dep + 0.05)) }); },
  (rng) => { const bs = rf(rng, 0.5, 3), fs = rf(rng, 0.5, 3); const rise = bs - fs;
    return nat({ topic: "Levelling — Rise/Fall", difficulty: "easy", marks: 1,
      stem: `Back-sight $${bs}\\,\\text{m}$, fore-sight $${fs}\\,\\text{m}$. Find the rise ($+$) or fall ($-$) (m). Round off to two decimal places.`, answer: r2(rise), tolerance: 0.005,
      solution: solN("rise $=$ BS $-$ FS.", `$$\\Delta=${bs}-${fs}=${fmt(rise)}\\ \\text{m}$$`, `BS $=${bs}$, FS $=${fs}$.`, fmt(rise), r2(rise - 0.005), r2(rise + 0.005)) }); },
  (rng) => { const rl = rf(rng, 100, 200), bs = rf(rng, 0.5, 3); const hi = rl + bs;
    return nat({ topic: "Levelling — Height of Instrument", difficulty: "easy", marks: 1,
      stem: `A benchmark has RL $${rl}\\,\\text{m}$; back-sight reading $${bs}\\,\\text{m}$. Find the height of instrument (m). Round off to two decimal places.`, answer: r2(hi), tolerance: 0.005,
      solution: solN("HI $=$ RL $+$ BS.", `$$HI=${rl}+${bs}=${fmt(hi)}\\ \\text{m}$$`, `RL $=${rl}$, BS $=${bs}$.`, fmt(hi), r2(hi - 0.005), r2(hi + 0.005)) }); },
  (rng) => { const rise = ri(rng, 2, 12), run = ri(rng, 50, 150); const g = rise / run * 100;
    const m = numMCQ({ rng, correct: g, traps: [run / rise, deg(Math.atan(rise / run)), rise / run], unit: "%" });
    return mcq({ topic: "Gradient (%)", difficulty: "easy", marks: 1,
      stem: `A drive rises $${rise}\\,\\text{m}$ over $${run}\\,\\text{m}$. Find the gradient (%).`, options: m.options, answer: m.answer,
      solution: solC("gradient $=$ rise/run $\\times100$.", `$$\\frac{${rise}}{${run}}\\times100=${fmt(g)}\\%$$`, `rise $=${rise}$.`, `$${fmt(g)}\\%$.`) }); },
  (rng) => { const dip = ri(rng, 10, 45), slope = ri(rng, 50, 150); const horiz = slope * Math.cos(rad(dip));
    return nat({ topic: "Slope to Horizontal Distance", difficulty: "medium", marks: 2,
      stem: `A slope distance of $${slope}\\,\\text{m}$ is measured along a $${dip}^{\\circ}$ incline. Find the horizontal distance (m). Round off to two decimal places.`, answer: r2(horiz), tolerance: 0.05,
      solution: solN("horizontal $=L\\cos\\theta$.", `$$D=${slope}\\cos${dip}^{\\circ}=${fmt(horiz)}\\ \\text{m}$$`, `$L=${slope},\\ \\theta=${dip}$.`, fmt(horiz), r2(horiz - 0.05), r2(horiz + 0.05)) }); },
];

/* ---------------- Archetype B — vintage PYQ re-parameterised -------- */
const B = [
  (rng) => { const sumLat = rf(rng, -0.3, 0.3), sumDep = rf(rng, -0.3, 0.3); const ce = Math.hypot(sumLat, sumDep);
    return nat({ topic: "Traverse — Closing Error", difficulty: "medium", marks: 2,
      stem: `A closed traverse has $\\Sigma$latitude $=${sumLat}\\,\\text{m}$ and $\\Sigma$departure $=${sumDep}\\,\\text{m}$. Find the closing error (m). Round off to two decimal places.`, answer: r2(ce), tolerance: 0.01,
      solution: solN("$e=\\sqrt{(\\Sigma L)^2+(\\Sigma D)^2}$.", `$$e=\\sqrt{${sumLat}^2+${sumDep}^2}=${fmt(ce)}\\ \\text{m}$$`, `$\\Sigma L=${sumLat},\\ \\Sigma D=${sumDep}$.`, fmt(ce), r2(ce - 0.01), r2(ce + 0.01)) }); },
  (rng) => { const ce = rf(rng, 0.1, 0.5), per = ri(rng, 800, 2000); const ratio = per / ce;
    return nat({ topic: "Traverse — Relative Accuracy", difficulty: "medium", marks: 2,
      stem: `A traverse of perimeter $${per}\\,\\text{m}$ has closing error $${ce}\\,\\text{m}$. Find the precision ratio denominator (i.e. perimeter/error). Round off to two decimal places.`, answer: r2(ratio), tolerance: 1,
      solution: solN("precision $=1:(\\text{perimeter}/e)$.", `$$\\frac{${per}}{${ce}}=${fmt(ratio)}$$`, `per $=${per},\\ e=${ce}$.`, fmt(ratio), r2(ratio - 1), r2(ratio + 1)) }); },
  (rng) => { const x = [0, ri(rng, 30, 60), ri(rng, 70, 110), ri(rng, 20, 50)]; const y = [0, ri(rng, 10, 40), ri(rng, 60, 100), ri(rng, 70, 110)];
    let area = 0; const n = x.length; for (let k = 0; k < n; k++) { const j = (k + 1) % n; area += x[k] * y[j] - x[j] * y[k]; } area = Math.abs(area) / 2;
    return nat({ topic: "Area by Coordinates", difficulty: "hard", marks: 2,
      stem: `A parcel has corners $(0,0),(${x[1]},${y[1]}),(${x[2]},${y[2]}),(${x[3]},${y[3]})$ m. Find the area by the shoelace formula (m²). Round off to two decimal places.`, answer: r2(area), tolerance: 0.5,
      solution: solN("Shoelace: $A=\\frac12|\\sum(x_i y_{i+1}-x_{i+1}y_i)|$.", `$$A=${fmt(area)}\\ \\text{m}^2$$`, `4 corners.`, fmt(area), r2(area - 0.5), r2(area + 0.5)) }); },
  (rng) => { const a1 = ri(rng, 200, 400), a2 = ri(rng, 250, 450), d = ri(rng, 20, 40); const vol = (a1 + a2) / 2 * d;
    return nat({ topic: "Volume — End-Area Method", difficulty: "medium", marks: 2,
      stem: `Two cross-sections of areas $${a1}\\,\\text{m}^2$ and $${a2}\\,\\text{m}^2$ are $${d}\\,\\text{m}$ apart. Find the volume by the average-end-area method (m³). Round off to two decimal places.`, answer: r2(vol), tolerance: 0.5,
      solution: solN("$V=\\frac{A_1+A_2}{2}\\,d$.", `$$V=\\frac{${a1}+${a2}}{2}\\times${d}=${fmt(vol)}$$`, `$A_1=${a1},A_2=${a2},d=${d}$.`, fmt(vol), r2(vol - 0.5), r2(vol + 0.5)) }); },
  (rng) => { const dec = pick(rng, [-2, -1.5, 1, 2.5]), magBrg = ri(rng, 40, 120); const trueBrg = magBrg + dec;
    return nat({ topic: "Magnetic Declination Correction", difficulty: "medium", marks: 2,
      stem: `A magnetic bearing of $${magBrg}^{\\circ}$ is observed where declination is $${dec}^{\\circ}$ (E$+$). Find the true bearing (degrees). Round off to two decimal places.`, answer: r2(trueBrg), tolerance: 0.05,
      solution: solN("true $=$ magnetic $+$ declination.", `$$T=${magBrg}+(${dec})=${fmt(trueBrg)}^{\\circ}$$`, `dec $=${dec}^{\\circ}$.`, fmt(trueBrg), r2(trueBrg - 0.05), r2(trueBrg + 0.05)) }); },
  (rng) => { const incl = ri(rng, 200, 500), grade = ri(rng, 1, 6); const vert = incl * grade / 100;
    return nat({ topic: "Incline — Vertical Depth", difficulty: "medium", marks: 2,
      stem: `An incline $${incl}\\,\\text{m}$ long has a gradient of $${grade}\\%$. Find the vertical depth gained (m). Round off to two decimal places.`, answer: r2(vert), tolerance: 0.05,
      solution: solN("vertical $=$ length $\\times$ grade.", `$$v=${incl}\\times${grade / 100}=${fmt(vert)}\\ \\text{m}$$`, `$L=${incl},g=${grade}\\%$.`, fmt(vert), r2(vert - 0.05), r2(vert + 0.05)) }); },
  (rng) => { const dN = ri(rng, 50, 200), dE = ri(rng, 50, 200); const dist = Math.hypot(dN, dE); const brg = deg(Math.atan2(dE, dN));
    return nat({ topic: "Coordinates — Bearing Between Stations", difficulty: "hard", marks: 2,
      stem: `Station B is $${dN}\\,\\text{m}$ N and $${dE}\\,\\text{m}$ E of A. Find the bearing A→B (degrees). Round off to two decimal places.`, answer: r2(brg), tolerance: 0.05,
      solution: solN("bearing $=\\tan^{-1}(\\Delta E/\\Delta N)$.", `$$\\theta=\\tan^{-1}\\frac{${dE}}{${dN}}=${fmt(brg)}^{\\circ}$$`, `$\\Delta N=${dN},\\Delta E=${dE}$.`, fmt(brg), r2(brg - 0.05), r2(brg + 0.05)) }); },
  (rng) => { const dN = ri(rng, 50, 200), dE = ri(rng, 50, 200); const dist = Math.hypot(dN, dE);
    return nat({ topic: "Coordinates — Horizontal Distance", difficulty: "medium", marks: 2,
      stem: `Station B is $${dN}\\,\\text{m}$ N and $${dE}\\,\\text{m}$ E of A. Find the horizontal distance A→B (m). Round off to two decimal places.`, answer: r2(dist), tolerance: 0.05,
      solution: solN("$D=\\sqrt{\\Delta N^2+\\Delta E^2}$.", `$$D=\\sqrt{${dN}^2+${dE}^2}=${fmt(dist)}\\ \\text{m}$$`, `$\\Delta N=${dN},\\Delta E=${dE}$.`, fmt(dist), r2(dist - 0.05), r2(dist + 0.05)) }); },
];

/* ---------------- Archetype C — diagrammatic (every Q has a figure) -- */
const C = [
  (rng) => { const L = ri(rng, 100, 250), brg = ri(rng, 25, 65); const lat = r2(L * Math.cos(rad(brg))), dep = r2(L * Math.sin(rad(brg)));
    return nat({ topic: "Traverse Leg — Latitude", difficulty: "medium", marks: 2,
      stem: `From the traverse sketch, leg AB is $${L}\\,\\text{m}$ at bearing $${brg}^{\\circ}$. Find its latitude (m). Round off to two decimal places.`, answer: lat, tolerance: 0.05,
      figure: figSvg(`<svg viewBox='0 0 200 160' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='10'><line x1='40' y1='130' x2='40' y2='20' stroke='#94a3b8' stroke-dasharray='3'/><text x='44' y='18' fill='#475569'>N</text><line x1='40' y1='130' x2='${r2(40 + L * Math.sin(rad(brg)) * 0.5)}' y2='${r2(130 - L * Math.cos(rad(brg)) * 0.5)}' stroke='#2563eb' stroke-width='2' marker-end='url(#aB)'/><defs><marker id='aB' markerWidth='8' markerHeight='8' refX='6' refY='3' orient='auto'><path d='M0,0 L6,3 L0,6 z' fill='#2563eb'/></marker></defs><circle cx='40' cy='130' r='3' fill='#1e293b'/><text x='28' y='143'>A</text><text x='${r2(48 + L * Math.sin(rad(brg)) * 0.5)}' y='${r2(126 - L * Math.cos(rad(brg)) * 0.5)}'>B</text><text x='70' y='80' fill='#dc2626'>${brg}°</text></svg>`, "Traverse leg"),
      solution: solN("latitude $=L\\cos\\theta$.", `$$\\text{lat}=${L}\\cos${brg}^{\\circ}=${fmt(lat)}$$`, `$L=${L},\\theta=${brg}$.`, fmt(lat), r2(lat - 0.05), r2(lat + 0.05)) }); },
  (rng) => { const L = ri(rng, 100, 250), brg = ri(rng, 25, 65); const dep = r2(L * Math.sin(rad(brg)));
    return nat({ topic: "Traverse Leg — Departure", difficulty: "medium", marks: 2,
      stem: `From the sketch, leg AB is $${L}\\,\\text{m}$ at bearing $${brg}^{\\circ}$. Find its departure (m). Round off to two decimal places.`, answer: dep, tolerance: 0.05,
      figure: figSvg(`<svg viewBox='0 0 200 160' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='10'><line x1='40' y1='130' x2='40' y2='20' stroke='#94a3b8' stroke-dasharray='3'/><text x='44' y='18' fill='#475569'>N</text><line x1='40' y1='130' x2='${r2(40 + L * Math.sin(rad(brg)) * 0.5)}' y2='${r2(130 - L * Math.cos(rad(brg)) * 0.5)}' stroke='#2563eb' stroke-width='2'/><circle cx='40' cy='130' r='3' fill='#1e293b'/><text x='28' y='143'>A</text><text x='70' y='80' fill='#dc2626'>${brg}°</text></svg>`, "Traverse leg"),
      solution: solN("departure $=L\\sin\\theta$.", `$$\\text{dep}=${L}\\sin${brg}^{\\circ}=${fmt(dep)}$$`, `$L=${L},\\theta=${brg}$.`, fmt(dep), r2(dep - 0.05), r2(dep + 0.05)) }); },
  (rng) => { const rls = [r2(rf(rng, 100, 105)), 0, 0, 0]; for (let k = 1; k < 4; k++) rls[k] = r2(rls[k - 1] + rf(rng, -1.5, 1.5)); const target = rls[3];
    return nat({ topic: "Levelling Profile — Final RL", difficulty: "medium", marks: 2,
      stem: `The level profile plots RL at four stations. Read the RL at station 4 (m). Round off to two decimal places.`, answer: target, tolerance: 0.02,
      figure: svgLine({ series: [{ points: rls.map((v, i) => [i + 1, v]), color: "#16a34a", dots: true, label: "RL" }], xlabel: "station", ylabel: "RL (m)", caption: "Level profile" }),
      solution: solN("Read the RL at station 4.", `$$RL_4=${fmt(target)}\\ \\text{m}$$`, `from profile.`, fmt(target), r2(target - 0.02), r2(target + 0.02)) }); },
  (rng) => { const elevs = [r2(rf(rng, 200, 210)), 0, 0, 0, 0]; for (let k = 1; k < 5; k++) elevs[k] = r2(elevs[k - 1] + rf(rng, 1, 3)); const ci = r2(elevs[4] - elevs[0]) / 4;
    return nat({ topic: "Contour — Interval", difficulty: "easy", marks: 1,
      stem: `Five evenly spaced contours rise from $${elevs[0]}$ to $${elevs[4]}\\,\\text{m}$. Find the contour interval (m). Round off to two decimal places.`, answer: r2(ci), tolerance: 0.02,
      figure: figSvg(`<svg viewBox='0 0 200 140' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='9'>${[0, 1, 2, 3, 4].map((k) => `<path d='M20,${20 + k * 22} Q100,${5 + k * 22} 180,${20 + k * 22}' fill='none' stroke='#92400e'/><text x='4' y='${24 + k * 22}'>${elevs[k]}</text>`).join("")}</svg>`, "Contour lines"),
      solution: solN("CI $=$ total rise $/$ (n$-$1).", `$$CI=\\frac{${elevs[4]}-${elevs[0]}}{4}=${fmt(ci)}$$`, `5 contours.`, fmt(ci), r2(ci - 0.02), r2(ci + 0.02)) }); },
  (rng) => { const incl = ri(rng, 150, 350), depth = ri(rng, 20, 60); const ang = deg(Math.asin(depth / incl));
    return nat({ topic: "Incline Section — Dip Angle", difficulty: "hard", marks: 2,
      stem: `The vertical section shows an incline $${incl}\\,\\text{m}$ long dropping $${depth}\\,\\text{m}$. Find the inclination angle (degrees). Round off to two decimal places.`, answer: r2(ang), tolerance: 0.1,
      figure: figSvg(`<svg viewBox='0 0 220 140' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='10'><line x1='20' y1='30' x2='200' y2='110' stroke='#1e293b' stroke-width='2'/><line x1='20' y1='30' x2='200' y2='30' stroke='#94a3b8' stroke-dasharray='3'/><line x1='200' y1='30' x2='200' y2='110' stroke='#dc2626'/><text x='205' y='75' fill='#dc2626'>${depth}m</text><text x='100' y='25' fill='#475569'>horizontal</text><text x='95' y='80' fill='#2563eb'>${incl}m</text></svg>`, "Incline section"),
      solution: solN("$\\theta=\\sin^{-1}(\\text{drop}/L)$.", `$$\\theta=\\sin^{-1}\\frac{${depth}}{${incl}}=${fmt(ang)}^{\\circ}$$`, `$L=${incl},\\ drop=${depth}$.`, fmt(ang), r2(ang - 0.1), r2(ang + 0.1)) }); },
  (rng) => { const widths = [ri(rng, 8, 14), ri(rng, 12, 20), ri(rng, 10, 16)]; const d = ri(rng, 10, 20); const a1 = widths[0] * 2, a2 = widths[1] * 2; const vol = (a1 + a2) / 2 * d;
    return nat({ topic: "Cross-Section — End Area Volume", difficulty: "hard", marks: 2,
      stem: `Two cross-sections (areas $${a1}$ and $${a2}\\,\\text{m}^2$) shown are $${d}\\,\\text{m}$ apart. Find the volume between them (m³). Round off to two decimal places.`, answer: r2(vol), tolerance: 0.5,
      figure: figSvg(`<svg viewBox='0 0 220 130' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='9'><polygon points='20,100 50,40 70,40 100,100' fill='#dbeafe' stroke='#2563eb'/><text x='40' y='115'>A=${a1}</text><polygon points='130,100 160,30 185,30 215,100' fill='#dcfce7' stroke='#16a34a'/><text x='150' y='115'>A=${a2}</text><text x='105' y='60' fill='#475569'>${d}m</text></svg>`, "Cross-sections"),
      solution: solN("$V=\\frac{A_1+A_2}{2}d$.", `$$V=\\frac{${a1}+${a2}}{2}\\times${d}=${fmt(vol)}$$`, `$d=${d}$.`, fmt(vol), r2(vol - 0.5), r2(vol + 0.5)) }); },
  (rng) => { const x = [0, ri(rng, 30, 60), ri(rng, 60, 100), ri(rng, 20, 50)]; const y = [0, ri(rng, 10, 40), ri(rng, 50, 90), ri(rng, 60, 100)];
    let area = 0; const n = 4; for (let k = 0; k < n; k++) { const j = (k + 1) % n; area += x[k] * y[j] - x[j] * y[k]; } area = Math.abs(area) / 2;
    return nat({ topic: "Plotted Parcel — Area", difficulty: "hard", marks: 2,
      stem: `The plotted parcel has corners $(0,0),(${x[1]},${y[1]}),(${x[2]},${y[2]}),(${x[3]},${y[3]})$ m. Find its area (m²). Round off to two decimal places.`, answer: r2(area), tolerance: 0.5,
      figure: svgLine({ series: [{ points: [[x[0], y[0]], [x[1], y[1]], [x[2], y[2]], [x[3], y[3]], [x[0], y[0]]], color: "#7c3aed", dots: true, label: "boundary" }], xlabel: "E (m)", ylabel: "N (m)", caption: "Parcel boundary" }),
      solution: solN("Shoelace formula.", `$$A=${fmt(area)}\\ \\text{m}^2$$`, `4 corners.`, fmt(area), r2(area - 0.5), r2(area + 0.5)) }); },
  (rng) => { const stations = [1, 2, 3, 4, 5]; const grade = ri(rng, 1, 5); const rl0 = r2(rf(rng, 150, 160)); const rls = stations.map((s) => r2(rl0 + (s - 1) * 30 * grade / 100)); const idx = ri(rng, 0, 4);
    return nat({ topic: "Gradient Line — RL Read-off", difficulty: "medium", marks: 2,
      stem: `A drive at $${grade}\\%$ has stations every 30 m. From the profile, read the RL at station $${stations[idx]}$ (m). Round off to two decimal places.`, answer: rls[idx], tolerance: 0.05,
      figure: svgLine({ series: [{ points: stations.map((s, k) => [s, rls[k]]), color: "#0891b2", dots: true, label: "RL" }], xlabel: "station", ylabel: "RL (m)", caption: `${grade}% gradient` }),
      solution: solN("RL $=RL_0+(\\text{chainage})\\times g$.", `$$RL=${fmt(rls[idx])}\\ \\text{m}$$`, `station $${stations[idx]}$.`, fmt(rls[idx]), r2(rls[idx] - 0.05), r2(rls[idx] + 0.05)) }); },
  (rng) => { const angs = [ri(rng, 80, 120), ri(rng, 80, 120), ri(rng, 80, 120)]; const sum = angs.reduce((a, b) => a + b, 0); const fourth = 360 - sum;
    return nat({ topic: "Closed Traverse — Missing Angle", difficulty: "medium", marks: 2,
      stem: `Three interior angles of a 4-sided closed traverse are $${angs[0]}^{\\circ}, ${angs[1]}^{\\circ}, ${angs[2]}^{\\circ}$. Find the fourth interior angle (degrees). Round off to two decimal places.`, answer: r2(fourth), tolerance: 0.05,
      figure: figSvg(`<svg viewBox='0 0 180 150' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='10'><polygon points='30,120 150,110 140,30 50,40' fill='none' stroke='#2563eb' stroke-width='1.5'/><text x='20' y='130'>${angs[0]}°</text><text x='150' y='122'>${angs[1]}°</text><text x='140' y='25'>${angs[2]}°</text><text x='38' y='38'>?</text></svg>`, "4-sided traverse"),
      solution: solN("Interior angles sum $=(n-2)180=360^{\\circ}$.", `$$\\theta_4=360-(${angs[0]}+${angs[1]}+${angs[2]})=${fmt(fourth)}^{\\circ}$$`, `4 sides.`, fmt(fourth), r2(fourth - 0.05), r2(fourth + 0.05)) }); },
  (rng) => { const offsets = [ri(rng, 5, 12), ri(rng, 8, 16), ri(rng, 10, 18), ri(rng, 6, 14), ri(rng, 5, 12)]; const d = ri(rng, 8, 15); const area = d * (offsets[0] / 2 + offsets[1] + offsets[2] + offsets[3] + offsets[4] / 2);
    return nat({ topic: "Trapezoidal Rule — Area", difficulty: "hard", marks: 2,
      stem: `Offsets $${offsets.join(", ")}\\,\\text{m}$ are taken at $${d}\\,\\text{m}$ intervals along a baseline. Find the area by the trapezoidal rule (m²). Round off to two decimal places.`, answer: r2(area), tolerance: 0.5,
      figure: svgBar({ labels: offsets.map((_, i) => "o" + (i + 1)), values: offsets, caption: "Offsets", title: "m" }),
      solution: solN("$A=d\\left[\\frac{o_1+o_n}{2}+\\sum o_{mid}\\right]$.", `$$A=${d}\\left[\\frac{${offsets[0]}+${offsets[4]}}{2}+${offsets[1]}+${offsets[2]}+${offsets[3]}\\right]=${fmt(area)}$$`, `$d=${d}$.`, fmt(area), r2(area - 0.5), r2(area + 0.5)) }); },
  (rng) => { const dip = ri(rng, 15, 45), trueDist = ri(rng, 50, 120); const apparent = trueDist / Math.cos(rad(dip));
    return nat({ topic: "Borehole — Apparent vs True", difficulty: "hard", marks: 2,
      stem: `The section shows a seam dipping $${dip}^{\\circ}$. A horizontal hole crosses a true thickness of $${trueDist}\\,\\text{m}$ normal width — find the apparent width along horizontal (m). Round off to two decimal places.`, answer: r2(apparent), tolerance: 0.1,
      figure: figSvg(`<svg viewBox='0 0 220 130' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='10'><line x1='20' y1='40' x2='200' y2='100' stroke='#92400e' stroke-width='3'/><line x1='20' y1='70' x2='200' y2='130' stroke='#92400e' stroke-width='3'/><text x='90' y='60' fill='#475569'>seam ${dip}°</text></svg>`, "Dipping seam"),
      solution: solN("apparent $=$ true $/\\cos(\\text{dip})$.", `$$w_a=\\frac{${trueDist}}{\\cos${dip}^{\\circ}}=${fmt(apparent)}\\ \\text{m}$$`, `dip $=${dip}$.`, fmt(apparent), r2(apparent - 0.1), r2(apparent + 0.1)) }); },
  (rng) => { const vals = [ri(rng, 100, 130), ri(rng, 105, 135), ri(rng, 110, 140), ri(rng, 108, 138)]; const avg = r2(vals.reduce((a, b) => a + b, 0) / 4);
    return nat({ topic: "Spot Heights — Mean RL", difficulty: "easy", marks: 1,
      stem: `The bar chart shows spot-height RLs (m) at four pillars. Find the mean RL (m). Round off to two decimal places.`, answer: avg, tolerance: 0.05,
      figure: svgBar({ labels: ["P1", "P2", "P3", "P4"], values: vals, caption: "Spot heights", title: "RL (m)" }),
      solution: solN("Average the four RLs.", `$$\\overline{RL}=\\frac{${vals.join("+")}}{4}=${fmt(avg)}$$`, `four pillars.`, fmt(avg), r2(avg - 0.05), r2(avg + 0.05)) }); },
];

/* ---------------- Archetype D — rank determinator (multi-stage) ----- */
const D = [
  (rng) => { const legs = [[ri(rng, 100, 200), ri(rng, 20, 70)], [ri(rng, 100, 200), ri(rng, 100, 150)], [ri(rng, 100, 200), ri(rng, 200, 260)]];
    let sLat = 0, sDep = 0; legs.forEach(([L, b]) => { sLat += L * Math.cos(rad(b)); sDep += L * Math.sin(rad(b)); }); const ce = Math.hypot(sLat, sDep);
    return nat({ topic: "Open Traverse — Closing Error", difficulty: "hard", marks: 2,
      stem: `A 3-leg traverse: $(${legs[0][0]}\\,\\text{m},${legs[0][1]}^{\\circ}),(${legs[1][0]},${legs[1][1]}^{\\circ}),(${legs[2][0]},${legs[2][1]}^{\\circ})$. Find the closing error (m). Round off to two decimal places.`, answer: r2(ce), tolerance: 0.1,
      solution: solN("Sum latitudes & departures, then $e=\\sqrt{\\Sigma L^2+\\Sigma D^2}$.", `$$\\Sigma L=${r2(sLat)},\\ \\Sigma D=${r2(sDep)},\\ e=${fmt(ce)}$$`, `3 legs.`, fmt(ce), r2(ce - 0.1), r2(ce + 0.1)) }); },
  (rng) => { const rl0 = r2(rf(rng, 100, 110)), bs1 = rf(rng, 1, 2.5), fs1 = rf(rng, 0.5, 2), bs2 = rf(rng, 1, 2.5), fs2 = rf(rng, 0.5, 2);
    const r1 = bs1 - fs1, r2v = bs2 - fs2; const rlFinal = r2(rl0 + r1 + r2v);
    return nat({ topic: "Levelling — Two Change Points", difficulty: "hard", marks: 2,
      stem: `BM RL $${rl0}\\,\\text{m}$. Readings: BS$_1$=$${bs1}$, FS$_1$=$${fs1}$, BS$_2$=$${bs2}$, FS$_2$=$${fs2}$ m. Find the final RL (m). Round off to two decimal places.`, answer: rlFinal, tolerance: 0.02,
      solution: solN("RL$_f$=RL$_0$+$\\sum$(BS$-$FS).", `$$RL_f=${rl0}+(${r2(r1)})+(${r2(r2v)})=${fmt(rlFinal)}$$`, `2 change points.`, fmt(rlFinal), r2(rlFinal - 0.02), r2(rlFinal + 0.02)) }); },
  (rng) => { const dN = ri(rng, 100, 300), dE = ri(rng, 100, 300), dRL = ri(rng, 20, 80); const slope = Math.sqrt(dN ** 2 + dE ** 2 + dRL ** 2);
    return nat({ topic: "3-D Distance Between Stations", difficulty: "hard", marks: 2,
      stem: `Station B is $${dN}\\,\\text{m}$ N, $${dE}\\,\\text{m}$ E and $${dRL}\\,\\text{m}$ below A. Find the 3-D (slope) distance A→B (m). Round off to two decimal places.`, answer: r2(slope), tolerance: 0.1,
      solution: solN("$D=\\sqrt{\\Delta N^2+\\Delta E^2+\\Delta H^2}$.", `$$D=\\sqrt{${dN}^2+${dE}^2+${dRL}^2}=${fmt(slope)}$$`, `3 components.`, fmt(slope), r2(slope - 0.1), r2(slope + 0.1)) }); },
  (rng) => { const dip = ri(rng, 15, 40), strikeDist = ri(rng, 100, 250), perp = ri(rng, 50, 150); const apparentDip = deg(Math.atan(Math.tan(rad(dip)) * Math.sin(rad(90))));
    const trueThick = perp * Math.sin(rad(dip));
    return nat({ topic: "Seam — True Thickness", difficulty: "hard", marks: 2,
      stem: `A vertical borehole intersects $${perp}\\,\\text{m}$ of a seam dipping $${dip}^{\\circ}$. Find the true thickness (m). Round off to two decimal places.`, answer: r2(trueThick), tolerance: 0.1,
      solution: solN("true $=$ borehole intercept $\\times\\cos(\\text{dip})$ for vertical hole; here $t=w\\sin\\theta$ for the given geometry.", `$$t=${perp}\\times\\sin${dip}^{\\circ}=${fmt(trueThick)}$$`, `dip $=${dip}$.`, fmt(trueThick), r2(trueThick - 0.1), r2(trueThick + 0.1)) }); },
  (rng) => { const a = [ri(rng, 150, 300), ri(rng, 180, 350), ri(rng, 200, 380), ri(rng, 160, 320)]; const d = ri(rng, 15, 30);
    const vol = d * (a[0] / 2 + a[1] + a[2] + a[3] / 2);
    return nat({ topic: "Multi-Section Volume (Trapezoidal)", difficulty: "hard", marks: 2,
      stem: `Cross-sectional areas $${a.join(", ")}\\,\\text{m}^2$ are spaced $${d}\\,\\text{m}$ apart. Find the total volume by the trapezoidal rule (m³). Round off to two decimal places.`, answer: r2(vol), tolerance: 1,
      solution: solN("$V=d[\\frac{A_1+A_n}{2}+\\sum A_{mid}]$.", `$$V=${d}\\left[\\frac{${a[0]}+${a[3]}}{2}+${a[1]}+${a[2]}\\right]=${fmt(vol)}$$`, `$d=${d}$.`, fmt(vol), r2(vol - 1), r2(vol + 1)) }); },
  (rng) => { const wireLen = ri(rng, 200, 500), temp = ri(rng, 25, 40), stdTemp = 20, alpha = 0.0000117; const corr = alpha * (temp - stdTemp) * wireLen; const corrected = wireLen + corr;
    return nat({ topic: "Tape — Temperature Correction", difficulty: "hard", marks: 2,
      stem: `A $${wireLen}\\,\\text{m}$ steel tape (std $20^{\\circ}$C, $\\alpha=1.17\\times10^{-5}$/°C) is used at $${temp}^{\\circ}$C. Find the corrected length (m). Round off to two decimal places.`, answer: r2(corrected), tolerance: 0.01,
      solution: solN("correction $=\\alpha\\,\\Delta T\\,L$.", `$$C=${alpha}\\times(${temp}-20)\\times${wireLen}=${r2(corr)};\\ L'=${fmt(corrected)}$$`, `$T=${temp}^{\\circ}$C.`, fmt(corrected), r2(corrected - 0.01), r2(corrected + 0.01)) }); },
  (rng) => { const angA = ri(rng, 40, 70), base = ri(rng, 80, 150), angB = ri(rng, 40, 70); const angC = 180 - angA - angB; const sideA = base * Math.sin(rad(angA)) / Math.sin(rad(angC));
    return nat({ topic: "Triangulation — Side Length", difficulty: "hard", marks: 2,
      stem: `In a triangle, base $${base}\\,\\text{m}$ subtends angle $C=${180 - angA - angB}^{\\circ}$ with angles $A=${angA}^{\\circ}$, $B=${angB}^{\\circ}$. Find side $a$ (opposite $A$) by the sine rule (m). Round off to two decimal places.`, answer: r2(sideA), tolerance: 0.1,
      solution: solN("Sine rule: $a=\\frac{c\\sin A}{\\sin C}$.", `$$a=\\frac{${base}\\sin${angA}^{\\circ}}{\\sin${angC}^{\\circ}}=${fmt(sideA)}$$`, `$A=${angA},B=${angB}$.`, fmt(sideA), r2(sideA - 0.1), r2(sideA + 0.1)) }); },
  (rng) => { const e = rf(rng, 0.2, 0.6), n = ri(rng, 4, 7), legLen = ri(rng, 150, 300); const perim = n * legLen; const corrPerLeg = e / n;
    return nat({ topic: "Bowditch — Correction per Leg", difficulty: "hard", marks: 2,
      stem: `A $${n}$-leg traverse (each leg $${legLen}\\,\\text{m}$) has total closing error $${e}\\,\\text{m}$. Using equal-leg Bowditch, find the linear correction applied to each leg (m). Round off to two decimal places.`, answer: r2(corrPerLeg), tolerance: 0.01,
      solution: solN("Equal legs $\\Rightarrow$ correction $=e/n$ per leg.", `$$\\frac{${e}}{${n}}=${fmt(corrPerLeg)}\\ \\text{m}$$`, `$n=${n}$.`, fmt(corrPerLeg), r2(corrPerLeg - 0.01), r2(corrPerLeg + 0.01)) }); },
  (rng) => { const azA = ri(rng, 30, 120), azB = ri(rng, 200, 320); const included = Math.abs(azB - azA); const inc = included > 180 ? 360 - included : included;
    return nat({ topic: "Included Angle from Azimuths", difficulty: "medium", marks: 2,
      stem: `Two lines from a station have azimuths $${azA}^{\\circ}$ and $${azB}^{\\circ}$. Find the included angle between them (degrees). Round off to two decimal places.`, answer: r2(inc), tolerance: 0.05,
      solution: solN("Included $=|az_2-az_1|$ (take $<180^{\\circ}$).", `$$\\theta=|${azB}-${azA}|=${included}\\to${fmt(inc)}^{\\circ}$$`, `azimuths given.`, fmt(inc), r2(inc - 0.05), r2(inc + 0.05)) }); },
  (rng) => { const slope = ri(rng, 100, 250), dip = ri(rng, 10, 35); const horiz = slope * Math.cos(rad(dip)); const vert = slope * Math.sin(rad(dip));
    return nat({ topic: "Slope Distance — Components", difficulty: "hard", marks: 2,
      stem: `A slope distance of $${slope}\\,\\text{m}$ is measured down a $${dip}^{\\circ}$ incline. Find the vertical drop (m). Round off to two decimal places.`, answer: r2(vert), tolerance: 0.05,
      solution: solN("vertical $=L\\sin\\theta$.", `$$v=${slope}\\sin${dip}^{\\circ}=${fmt(vert)}$$`, `$L=${slope},\\theta=${dip}$.`, fmt(vert), r2(vert - 0.05), r2(vert + 0.05)) }); },
];

export default { slug: "mine-surveying", name: SUB, subjectTag: SUB, pools: { A, B, C, D } };
