/** Mine Environment & Occupational Health — 175 questions (A30/B30/C60/D55). */
import { mcq, nat, r2, fmt, solN, solC, numMCQ, svgBar, svgLine, figSvg } from "../build_practice_bank.mjs";

const SUB = "Mine Environment & Occupational Health";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const rf = (rng, a, b) => r2(a + rng() * (b - a));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const l1 = ri(rng, 80, 90), l2 = ri(rng, 80, 90); const tot = 10 * Math.log10(10 ** (l1 / 10) + 10 ** (l2 / 10));
    return nat({ topic: "Noise — Adding Two Sources", difficulty: "medium", marks: 2,
      stem: `Two machines produce $${l1}\\,\\text{dBA}$ and $${l2}\\,\\text{dBA}$. Find the combined level (dBA). Round off to two decimal places.`, answer: r2(tot), tolerance: 0.1,
      solution: solN("$L=10\\log(10^{L_1/10}+10^{L_2/10})$.", `$$L=10\\log(10^{${l1}/10}+10^{${l2}/10})=${fmt(tot)}\\ \\text{dBA}$$`, `$L_1=${l1},L_2=${l2}$.`, fmt(tot), r2(tot - 0.1), r2(tot + 0.1)) }); },
  (rng) => { const n = pick(rng, [2, 3, 4, 5]), single = ri(rng, 78, 88); const tot = single + 10 * Math.log10(n);
    return nat({ topic: "Noise — N Equal Sources", difficulty: "medium", marks: 2,
      stem: `$${n}$ identical machines each emit $${single}\\,\\text{dBA}$. Find the total level (dBA). Round off to two decimal places.`, answer: r2(tot), tolerance: 0.1,
      solution: solN("$L=L_1+10\\log n$.", `$$L=${single}+10\\log${n}=${fmt(tot)}\\ \\text{dBA}$$`, `$n=${n}$.`, fmt(tot), r2(tot - 0.1), r2(tot + 0.1)) }); },
  (rng) => { const conc = rf(rng, 1, 8), tlv = pick(rng, [2, 3, 5]); const ratio = conc / tlv;
    return nat({ topic: "Dust — TLV Ratio", difficulty: "easy", marks: 1,
      stem: `Respirable dust concentration is $${conc}\\,\\text{mg/m}^3$ against a TLV of $${tlv}\\,\\text{mg/m}^3$. Find the exposure ratio. Round off to two decimal places.`, answer: r2(ratio), tolerance: 0.02,
      solution: solN("ratio $=$ concentration $/$ TLV.", `$$\\frac{${conc}}{${tlv}}=${fmt(ratio)}$$`, `conc $=${conc}$.`, fmt(ratio), r2(ratio - 0.02), r2(ratio + 0.02)) }); },
  (rng) => { const Q = rf(rng, 0.5, 3), H = ri(rng, 50, 200), eff = pick(rng, [60, 70, 75]); const P = 9.81 * 1000 * Q * H / (eff / 100) / 1000;
    return nat({ topic: "Pump — Shaft Power", difficulty: "medium", marks: 2,
      stem: `A pump delivers $${Q}\\,\\text{m}^3/\\text{s}$ against a head of $${H}\\,\\text{m}$ at $${eff}\\%$ efficiency. Find the shaft power (kW). Round off to two decimal places.`, answer: r2(P), tolerance: 1,
      solution: solN("$P=\\rho g Q H/\\eta$.", `$$P=\\frac{1000\\times9.81\\times${Q}\\times${H}}{${eff / 100}\\times1000}=${fmt(P)}\\ \\text{kW}$$`, `$Q=${Q},H=${H}$.`, fmt(P), r2(P - 1), r2(P + 1)) }); },
  (rng) => { const dry = ri(rng, 28, 38), wet = ri(rng, 20, 27); const dep = dry - wet;
    return nat({ topic: "Psychrometry — Wet-Bulb Depression", difficulty: "easy", marks: 1,
      stem: `Dry-bulb $${dry}^{\\circ}$C, wet-bulb $${wet}^{\\circ}$C. Find the wet-bulb depression (°C). Round off to two decimal places.`, answer: r2(dep), tolerance: 0.05,
      solution: solN("depression $=$ dry $-$ wet.", `$$\\Delta=${dry}-${wet}=${fmt(dep)}^{\\circ}C$$`, `dry $=${dry}$, wet $=${wet}$.`, fmt(dep), r2(dep - 0.05), r2(dep + 0.05)) }); },
  (rng) => { const dose = rf(rng, 50, 150); const twa = 90 + 10 * Math.log2(dose / 100);
    return nat({ topic: "Noise — Dose to TWA", difficulty: "hard", marks: 2,
      stem: `A worker's noise dose is $${dose}\\%$. Using $TWA=90+10\\log_2(D/100)$, find the 8-h TWA (dBA). Round off to two decimal places.`, answer: r2(twa), tolerance: 0.1,
      solution: solN("$TWA=90+10\\log_2(D/100)$.", `$$TWA=90+10\\log_2\\frac{${dose}}{100}=${fmt(twa)}\\ \\text{dBA}$$`, `$D=${dose}\\%$.`, fmt(twa), r2(twa - 0.1), r2(twa + 0.1)) }); },
  (rng) => { const lux = ri(rng, 50, 200), area = ri(rng, 20, 80), lumens = lux * area; 
    return nat({ topic: "Illumination — Total Lumens", difficulty: "easy", marks: 1,
      stem: `An area of $${area}\\,\\text{m}^2$ must be lit to $${lux}\\,\\text{lux}$. Find the total luminous flux required (lumens). Round off to two decimal places.`, answer: r2(lumens), tolerance: 1,
      solution: solN("flux $=$ illuminance $\\times$ area.", `$$\\Phi=${lux}\\times${area}=${fmt(lumens)}\\ \\text{lm}$$`, `$E=${lux},A=${area}$.`, fmt(lumens), r2(lumens - 1), r2(lumens + 1)) }); },
  (rng) => { const conc = rf(rng, 0.2, 1.5), tlv = pick(rng, [0.5, 1.0, 1.5]); const pct = conc / tlv * 100;
    const m = numMCQ({ rng, correct: pct, traps: [tlv / conc * 100, conc * tlv, conc + tlv], unit: "%" });
    return mcq({ topic: "Gas — % of TLV", difficulty: "easy", marks: 1,
      stem: `A gas reads $${conc}\\,\\text{ppm}$ against a TLV of $${tlv}\\,\\text{ppm}$. What % of the TLV is this?`, options: m.options, answer: m.answer,
      solution: solC("$\\%=$ conc/TLV $\\times100$.", `$$\\frac{${conc}}{${tlv}}\\times100=${fmt(pct)}\\%$$`, `conc $=${conc}$.`, `$${fmt(pct)}\\%$.`) }); },
];

/* ---------------- Archetype B — vintage PYQ re-parameterised -------- */
const B = [
  (rng) => { const levels = [ri(rng, 78, 88), ri(rng, 78, 88), ri(rng, 78, 88)]; const tot = 10 * Math.log10(levels.reduce((a, l) => a + 10 ** (l / 10), 0));
    return nat({ topic: "Noise — Three Sources", difficulty: "hard", marks: 2,
      stem: `Three sources read $${levels.join(", ")}\\,\\text{dBA}$. Find the combined sound level (dBA). Round off to two decimal places.`, answer: r2(tot), tolerance: 0.1,
      solution: solN("$L=10\\log\\sum 10^{L_i/10}$.", `$$L=10\\log(10^{${levels[0]}/10}+10^{${levels[1]}/10}+10^{${levels[2]}/10})=${fmt(tot)}$$`, `3 sources.`, fmt(tot), r2(tot - 0.1), r2(tot + 0.1)) }); },
  (rng) => { const flow = rf(rng, 0.02, 0.2), conc = ri(rng, 200, 800), limit = pick(rng, [2, 3, 5]); const dilAir = flow * conc / limit;
    return nat({ topic: "Dust — Dilution Air", difficulty: "hard", marks: 2,
      stem: `Dust enters at $${conc}\\,\\text{mg/s}$ effective rate from a $${flow}\\,\\text{m}^3/\\text{s}$ source; TLV $${limit}\\,\\text{mg/m}^3$. Find the air quantity needed to dilute to TLV (m³/s). Round off to two decimal places.`, answer: r2(dilAir), tolerance: 0.05,
      solution: solN("$Q=\\dot m/C_{limit}$.", `$$Q=\\frac{${flow}\\times${conc}}{${limit}}=${fmt(dilAir)}\\ \\text{m}^3/\\text{s}$$`, `TLV $=${limit}$.`, fmt(dilAir), r2(dilAir - 0.05), r2(dilAir + 0.05)) }); },
  (rng) => { const Q = rf(rng, 1, 4), H = ri(rng, 80, 250), eff = pick(rng, [65, 70, 75, 80]); const P = 9.81 * 1000 * Q * H / (eff / 100) / 1000; const motor = P / 0.92;
    return nat({ topic: "Pump — Motor Input Power", difficulty: "hard", marks: 2,
      stem: `Pump: $${Q}\\,\\text{m}^3/\\text{s}$, head $${H}\\,\\text{m}$, pump eff $${eff}\\%$, motor eff $92\\%$. Find the motor input power (kW). Round off to two decimal places.`, answer: r2(motor), tolerance: 1,
      solution: solN("$P_{motor}=\\rho gQH/(\\eta_p\\eta_m)$.", `$$P=\\frac{1000\\times9.81\\times${Q}\\times${H}}{${eff / 100}\\times0.92\\times1000}=${fmt(motor)}$$`, `$Q=${Q},H=${H}$.`, fmt(motor), r2(motor - 1), r2(motor + 1)) }); },
  (rng) => { const T = ri(rng, 80, 100), exposure = pick(rng, [2, 4, 8]); const allowed = 8 / 2 ** ((T - 90) / 5);
    return nat({ topic: "Noise — Permissible Exposure Time", difficulty: "hard", marks: 2,
      stem: `Using the 5-dB exchange rule ($T=8/2^{(L-90)/5}$), find the permissible exposure time (h) at $${T}\\,\\text{dBA}$. Round off to two decimal places.`, answer: r2(allowed), tolerance: 0.05,
      solution: solN("$T=8/2^{(L-90)/5}$.", `$$T=\\frac{8}{2^{(${T}-90)/5}}=${fmt(allowed)}\\ \\text{h}$$`, `$L=${T}$ dBA.`, fmt(allowed), r2(allowed - 0.05), r2(allowed + 0.05)) }); },
  (rng) => { const inflow = rf(rng, 50, 200), pumpRate = rf(rng, 80, 250); const net = pumpRate - inflow;
    return nat({ topic: "Mine Drainage — Net Pumping", difficulty: "easy", marks: 1,
      stem: `Water enters a sump at $${inflow}\\,\\text{m}^3/\\text{h}$; the pump runs at $${pumpRate}\\,\\text{m}^3/\\text{h}$. Find the net dewatering rate (m³/h). Round off to two decimal places.`, answer: r2(net), tolerance: 0.05,
      solution: solN("net $=$ pump $-$ inflow.", `$$\\dot V=${pumpRate}-${inflow}=${fmt(net)}$$`, `pump $=${pumpRate}$.`, fmt(net), r2(net - 0.05), r2(net + 0.05)) }); },
  (rng) => { const co = rf(rng, 20, 80), o2 = rf(rng, 18, 20.9); const ratio = co / 1e4;
    return nat({ topic: "CO — ppm to Percent", difficulty: "easy", marks: 1,
      stem: `A CO reading is $${co}\\,\\text{ppm}$. Express this as a volume percentage. Round off to two decimal places.`, answer: r2(ratio), tolerance: 0.005,
      solution: solN("$\\%=$ ppm $/10^4$.", `$$${co}/10^4=${fmt(ratio)}\\%$$`, `CO $=${co}$ ppm.`, fmt(ratio), r2(ratio - 0.005), r2(ratio + 0.005)) }); },
  (rng) => { const effIn = ri(rng, 30, 60), bod = ri(rng, 200, 400); const out = bod * (1 - effIn / 100);
    return nat({ topic: "Effluent — BOD After Treatment", difficulty: "medium", marks: 2,
      stem: `Influent BOD $${bod}\\,\\text{mg/L}$; treatment removes $${effIn}\\%$. Find the effluent BOD (mg/L). Round off to two decimal places.`, answer: r2(out), tolerance: 0.5,
      solution: solN("out $=$ BOD$(1-\\eta)$.", `$$BOD_{out}=${bod}(1-${effIn / 100})=${fmt(out)}$$`, `$\\eta=${effIn}\\%$.`, fmt(out), r2(out - 0.5), r2(out + 0.5)) }); },
  (rng) => { const dust = rf(rng, 2, 10), sampledVol = rf(rng, 0.5, 2), mass = dust * sampledVol;
    return nat({ topic: "Gravimetric Dust — Mass Collected", difficulty: "medium", marks: 2,
      stem: `Air sampled at concentration $${dust}\\,\\text{mg/m}^3$ over $${sampledVol}\\,\\text{m}^3$. Find the dust mass collected on the filter (mg). Round off to two decimal places.`, answer: r2(mass), tolerance: 0.05,
      solution: solN("mass $=$ conc $\\times$ volume.", `$$m=${dust}\\times${sampledVol}=${fmt(mass)}\\ \\text{mg}$$`, `vol $=${sampledVol}$.`, fmt(mass), r2(mass - 0.05), r2(mass + 0.05)) }); },
];

/* ---------------- Archetype C — diagrammatic (every Q has a figure) -- */
const C = [
  (rng) => { const Q = [0, 0.5, 1.0, 1.5, 2.0]; const H = Q.map((q) => r2(120 - 20 * q ** 2)); const idx = ri(rng, 1, 4);
    return nat({ topic: "Pump Curve — Head Read-off", difficulty: "medium", marks: 2,
      stem: `From the pump characteristic curve, read the head (m) at a flow of $${Q[idx]}\\,\\text{m}^3/\\text{s}$. Round off to two decimal places.`, answer: H[idx], tolerance: 1,
      figure: svgLine({ series: [{ points: Q.map((q, i) => [q, H[i]]), color: "#2563eb", dots: true, label: "H-Q" }], xlabel: "Q (m³/s)", ylabel: "head (m)", caption: "Pump characteristic" }),
      solution: solN("Read the H-Q curve at the given flow.", `$$H=${fmt(H[idx])}\\ \\text{m}$$`, `$Q=${Q[idx]}$.`, fmt(H[idx]), r2(H[idx] - 1), r2(H[idx] + 1)) }); },
  (rng) => { const t = [0, 2, 4, 6, 8]; const L = pick(rng, [85, 88, 90]); const levels = t.map((tt) => r2(L + tt * 0.5)); const idx = ri(rng, 1, 4);
    return nat({ topic: "Noise Dosimetry — Level Read-off", difficulty: "medium", marks: 2,
      stem: `The dosimeter trace plots sound level over a shift. Read the level (dBA) at hour $${t[idx]}$. Round off to two decimal places.`, answer: levels[idx], tolerance: 0.1,
      figure: svgLine({ series: [{ points: t.map((tt, i) => [tt, levels[i]]), color: "#dc2626", dots: true, label: "dBA" }], xlabel: "hour", ylabel: "dBA", caption: "Shift noise trace" }),
      solution: solN("Read the trace at the given hour.", `$$L=${fmt(levels[idx])}\\ \\text{dBA}$$`, `hour $=${t[idx]}$.`, fmt(levels[idx]), r2(levels[idx] - 0.1), r2(levels[idx] + 0.1)) }); },
  (rng) => { const vals = [rf(rng, 1, 4), rf(rng, 2, 5), rf(rng, 1.5, 4.5), rf(rng, 2, 6)]; const avg = r2(vals.reduce((a, b) => a + b, 0) / 4);
    return nat({ topic: "Dust Survey — Mean Concentration", difficulty: "easy", marks: 1,
      stem: `The bar chart shows respirable dust (mg/m³) at four locations. Find the mean concentration. Round off to two decimal places.`, answer: avg, tolerance: 0.02,
      figure: svgBar({ labels: ["L1", "L2", "L3", "L4"], values: vals, caption: "Dust survey", title: "mg/m³" }),
      solution: solN("Average the four bars.", `$$\\bar C=\\frac{${vals.join("+")}}{4}=${fmt(avg)}$$`, `4 sites.`, fmt(avg), r2(avg - 0.02), r2(avg + 0.02)) }); },
  (rng) => { const dry = ri(rng, 30, 38), wet = ri(rng, 22, 28); const dep = dry - wet;
    return nat({ topic: "Psychrometric Chart — Depression", difficulty: "medium", marks: 2,
      stem: `On the psychrometric sketch, dry-bulb $${dry}^{\\circ}$C and wet-bulb $${wet}^{\\circ}$C are marked. Find the wet-bulb depression (°C). Round off to two decimal places.`, answer: r2(dep), tolerance: 0.05,
      figure: figSvg(`<svg viewBox='0 0 200 140' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='9'><line x1='20' y1='120' x2='190' y2='120' stroke='#334155'/><line x1='20' y1='120' x2='20' y2='20' stroke='#334155'/><circle cx='${20 + dry * 4}' cy='40' r='3' fill='#dc2626'/><text x='${24 + dry * 4}' y='40'>DB ${dry}°</text><circle cx='${20 + wet * 4}' cy='70' r='3' fill='#2563eb'/><text x='${24 + wet * 4}' y='70'>WB ${wet}°</text><text x='80' y='135' fill='#475569'>temperature (°C)</text></svg>`, "Psychrometric points"),
      solution: solN("depression $=$ DB $-$ WB.", `$$\\Delta=${dry}-${wet}=${fmt(dep)}^{\\circ}C$$`, `DB,WB shown.`, fmt(dep), r2(dep - 0.05), r2(dep + 0.05)) }); },
  (rng) => { const Q = [0, 0.5, 1.0, 1.5, 2.0]; const Hpump = Q.map((q) => r2(120 - 20 * q ** 2)); const Hsys = Q.map((q) => r2(20 + 30 * q ** 2));
    // operating point where pump=system: 120-20q^2=20+30q^2 -> 100=50q^2 -> q=sqrt2
    const qop = Math.sqrt(100 / 50); const hop = r2(20 + 30 * qop ** 2);
    return nat({ topic: "Pump vs System — Operating Head", difficulty: "hard", marks: 2,
      stem: `The pump and system curves intersect at the duty point. Find the operating head (m). Round off to two decimal places.`, answer: hop, tolerance: 1,
      figure: svgLine({ series: [{ points: Q.map((q, i) => [q, Hpump[i]]), color: "#2563eb", label: "pump" }, { points: Q.map((q, i) => [q, Hsys[i]]), color: "#dc2626", label: "system" }], xlabel: "Q (m³/s)", ylabel: "head (m)", caption: "Duty point" }),
      solution: solN("Set pump head $=$ system head and solve.", `$$120-20q^2=20+30q^2\\Rightarrow q=${r2(qop)},\\ H=${fmt(hop)}$$`, `intersection.`, fmt(hop), r2(hop - 1), r2(hop + 1)) }); },
  (rng) => { const freq = [63, 125, 250, 500, 1000]; const spl = [r2(rf(rng, 70, 80)), r2(rf(rng, 75, 85)), r2(rf(rng, 80, 90)), r2(rf(rng, 78, 88)), r2(rf(rng, 70, 80))]; const idx = ri(rng, 0, 4);
    return nat({ topic: "Octave-Band Spectrum — Read-off", difficulty: "medium", marks: 2,
      stem: `From the octave-band noise spectrum, read the SPL (dB) in the $${freq[idx]}\\,\\text{Hz}$ band. Round off to two decimal places.`, answer: spl[idx], tolerance: 0.1,
      figure: svgBar({ labels: freq.map((f) => f + ""), values: spl, caption: "Octave spectrum", title: "dB" }),
      solution: solN("Read the bar at the given band.", `$$SPL=${fmt(spl[idx])}\\ \\text{dB}$$`, `${freq[idx]} Hz.`, fmt(spl[idx]), r2(spl[idx] - 0.1), r2(spl[idx] + 0.1)) }); },
  (rng) => { const depth = [0, 50, 100, 150, 200]; const temp = depth.map((d) => r2(28 + d * 0.012)); const idx = ri(rng, 1, 4);
    return nat({ topic: "Geothermal Gradient — Temperature", difficulty: "medium", marks: 2,
      stem: `The plot shows virgin rock temperature with depth. Read the temperature (°C) at $${depth[idx]}\\,\\text{m}$. Round off to two decimal places.`, answer: temp[idx], tolerance: 0.1,
      figure: svgLine({ series: [{ points: depth.map((d, i) => [d, temp[i]]), color: "#ea580c", dots: true, label: "T" }], xlabel: "depth (m)", ylabel: "T (°C)", caption: "Geothermal gradient" }),
      solution: solN("Read the gradient line at the given depth.", `$$T=${fmt(temp[idx])}^{\\circ}C$$`, `depth $=${depth[idx]}$.`, fmt(temp[idx]), r2(temp[idx] - 0.1), r2(temp[idx] + 0.1)) }); },
  (rng) => { const vals = [ri(rng, 100, 200), ri(rng, 120, 220), ri(rng, 90, 180), ri(rng, 110, 210)]; const tot = vals.reduce((a, b) => a + b, 0);
    return nat({ topic: "Water Make — Daily Total", difficulty: "easy", marks: 1,
      stem: `The bar chart shows water make (m³/h) over four shifts of 6 h each. Find the total daily water make (m³). Round off to two decimal places.`, answer: r2(vals.reduce((a, b) => a + b, 0) * 6), tolerance: 1,
      figure: svgBar({ labels: ["S1", "S2", "S3", "S4"], values: vals, caption: "Water make", title: "m³/h" }),
      solution: solN("total $=\\sum(\\text{rate}\\times6\\,\\text{h})$.", `$$V=(${vals.join("+")})\\times6=${fmt(vals.reduce((a, b) => a + b, 0) * 6)}$$`, `4 shifts.`, fmt(vals.reduce((a, b) => a + b, 0) * 6), r2(vals.reduce((a, b) => a + b, 0) * 6 - 1), r2(vals.reduce((a, b) => a + b, 0) * 6 + 1)) }); },
  (rng) => { const x = [0, 1, 2, 3, 4]; const wbgt = x.map((h) => r2(26 + h * 0.8)); const idx = ri(rng, 1, 4);
    return nat({ topic: "Heat Stress — WBGT Trend", difficulty: "medium", marks: 2,
      stem: `The WBGT rises through the shift as plotted. Read the WBGT (°C) at hour $${x[idx]}$. Round off to two decimal places.`, answer: wbgt[idx], tolerance: 0.1,
      figure: svgLine({ series: [{ points: x.map((h, i) => [h, wbgt[i]]), color: "#dc2626", dots: true, label: "WBGT" }], xlabel: "hour", ylabel: "WBGT (°C)", caption: "Heat stress trend" }),
      solution: solN("Read the WBGT trend at the given hour.", `$$WBGT=${fmt(wbgt[idx])}^{\\circ}C$$`, `hour $=${x[idx]}$.`, fmt(wbgt[idx]), r2(wbgt[idx] - 0.1), r2(wbgt[idx] + 0.1)) }); },
  (rng) => { const lux = [120, 90, 60, 40, 30]; const dist = [1, 2, 3, 4, 5]; const idx = ri(rng, 0, 4);
    return nat({ topic: "Illumination — Distance Falloff", difficulty: "medium", marks: 2,
      stem: `The chart plots illuminance vs distance from a lamp. Read the illuminance (lux) at $${dist[idx]}\\,\\text{m}$. Round off to two decimal places.`, answer: lux[idx], tolerance: 1,
      figure: svgLine({ series: [{ points: dist.map((d, i) => [d, lux[i]]), color: "#ca8a04", dots: true, label: "lux" }], xlabel: "distance (m)", ylabel: "illuminance (lux)", caption: "Lamp falloff" }),
      solution: solN("Read the curve at the given distance.", `$$E=${fmt(lux[idx])}\\ \\text{lux}$$`, `dist $=${dist[idx]}$.`, fmt(lux[idx]), r2(lux[idx] - 1), r2(lux[idx] + 1)) }); },
  (rng) => { const conc = [rf(rng, 0.5, 2), rf(rng, 1, 3), rf(rng, 2, 4), rf(rng, 1.5, 3.5)]; const tlv = pick(rng, [2, 3, 5]); const maxC = Math.max(...conc); const exceed = maxC > tlv;
    return mcq({ topic: "Dust — Compliance by Location", difficulty: "medium", marks: 2,
      stem: `The bar chart shows dust (mg/m³) at four sites; TLV $=${tlv}\\,\\text{mg/m}^3$. Is any site over the limit?`,
      options: ["No site exceeds the TLV", "At least one site exceeds the TLV", "All sites exceed the TLV", "Insufficient data"],
      answer: exceed ? 1 : 0,
      figure: svgBar({ labels: ["A", "B", "C", "D"], values: conc, unit: "mg/m³", caption: `TLV ${tlv}`, title: "mg/m³" }),
      solution: solC("Compare the tallest bar to the TLV.", `$$\\max=${r2(maxC)}\\ \\text{vs}\\ ${tlv}$$`, `4 sites.`, exceed ? "Yes, at least one exceeds the TLV." : "No, all sites are within the TLV.") }); },
  (rng) => { const Q = [0.5, 1.0, 1.5, 2.0]; const eff = Q.map((q) => r2(40 + 50 * q - 18 * q ** 2)); const idx = ri(rng, 0, 3);
    return nat({ topic: "Pump Efficiency Curve — Read-off", difficulty: "hard", marks: 2,
      stem: `The pump efficiency curve peaks near mid-flow. Read the efficiency (%) at $${Q[idx]}\\,\\text{m}^3/\\text{s}$. Round off to two decimal places.`, answer: eff[idx], tolerance: 0.5,
      figure: svgLine({ series: [{ points: Q.map((q, i) => [q, eff[i]]), color: "#16a34a", dots: true, label: "η" }], xlabel: "Q (m³/s)", ylabel: "efficiency (%)", caption: "Pump efficiency" }),
      solution: solN("Read the efficiency curve at the given flow.", `$$\\eta=${fmt(eff[idx])}\\%$$`, `$Q=${Q[idx]}$.`, fmt(eff[idx]), r2(eff[idx] - 0.5), r2(eff[idx] + 0.5)) }); },
];

/* ---------------- Archetype D — rank determinator (multi-stage) ----- */
const D = [
  (rng) => { const levels = [ri(rng, 80, 90), ri(rng, 80, 90), ri(rng, 80, 90), ri(rng, 80, 90)]; const tot = 10 * Math.log10(levels.reduce((a, l) => a + 10 ** (l / 10), 0));
    return nat({ topic: "Noise — Four-Source Sum", difficulty: "hard", marks: 2,
      stem: `Four machines emit $${levels.join(", ")}\\,\\text{dBA}$. Find the combined level (dBA). Round off to two decimal places.`, answer: r2(tot), tolerance: 0.1,
      solution: solN("$L=10\\log\\sum10^{L_i/10}$.", `$$L=10\\log\\sum10^{L_i/10}=${fmt(tot)}$$`, `4 sources.`, fmt(tot), r2(tot - 0.1), r2(tot + 0.1)) }); },
  (rng) => { const t1 = pick(rng, [2, 4]), L1 = ri(rng, 92, 100), t2 = pick(rng, [2, 4]), L2 = ri(rng, 85, 92);
    const allow = (L) => 8 / 2 ** ((L - 90) / 5); const dose = (t1 / allow(L1) + t2 / allow(L2)) * 100;
    return nat({ topic: "Noise — Combined Dose", difficulty: "hard", marks: 2,
      stem: `A worker spends $${t1}\\,\\text{h}$ at $${L1}\\,\\text{dBA}$ and $${t2}\\,\\text{h}$ at $${L2}\\,\\text{dBA}$ (5-dB rule). Find the total noise dose (%). Round off to two decimal places.`, answer: r2(dose), tolerance: 1,
      solution: solN("dose $=\\sum(C_i/T_i)\\times100$, $T=8/2^{(L-90)/5}$.", `$$D=\\left(\\frac{${t1}}{${r2(allow(L1))}}+\\frac{${t2}}{${r2(allow(L2))}}\\right)100=${fmt(dose)}\\%$$`, `two exposures.`, fmt(dose), r2(dose - 1), r2(dose + 1)) }); },
  (rng) => { const Q = rf(rng, 1, 3), staticH = ri(rng, 50, 150), f = rf(rng, 0.02, 0.04), L = ri(rng, 200, 600), d = rf(rng, 0.2, 0.5);
    const v = Q / (Math.PI / 4 * d ** 2); const hf = f * L / d * v ** 2 / (2 * 9.81); const totH = staticH + hf; const P = 9.81 * 1000 * Q * totH / 0.75 / 1000;
    return nat({ topic: "Pumping — Total Head & Power", difficulty: "hard", marks: 2,
      stem: `Pump $${Q}\\,\\text{m}^3/\\text{s}$ through a $${d}\\,\\text{m}$ pipe, length $${L}\\,\\text{m}$, $f=${f}$, static lift $${staticH}\\,\\text{m}$, pump eff $75\\%$. Find the input power (kW). Round off to two decimal places.`, answer: r2(P), tolerance: 2,
      solution: solN("$v=Q/A$, $h_f=fLv^2/(2gd)$, $H=H_s+h_f$, $P=\\rho gQH/\\eta$.", `$$v=${r2(v)},\\ h_f=${r2(hf)},\\ H=${r2(totH)},\\ P=${fmt(P)}$$`, `$Q=${Q},d=${d}$.`, fmt(P), r2(P - 2), r2(P + 2)) }); },
  (rng) => { const C1 = rf(rng, 0.5, 2), T1 = pick(rng, [2, 5]), C2 = rf(rng, 1, 3), T2 = pick(rng, [3, 5]); const idx = C1 / T1 + C2 / T2;
    return nat({ topic: "Mixed Dust — Additive Exposure Index", difficulty: "hard", marks: 2,
      stem: `Two dusts: $${C1}\\,\\text{mg/m}^3$ (TLV $${T1}$) and $${C2}\\,\\text{mg/m}^3$ (TLV $${T2}$). Find the additive exposure index $\\sum C_i/TLV_i$. Round off to two decimal places.`, answer: r2(idx), tolerance: 0.02,
      solution: solN("index $=\\sum C_i/TLV_i$; $>1$ means over-exposed.", `$$\\frac{${C1}}{${T1}}+\\frac{${C2}}{${T2}}=${fmt(idx)}$$`, `two dusts.`, fmt(idx), r2(idx - 0.02), r2(idx + 0.02)) }); },
  (rng) => { const flow = rf(rng, 100, 300), bod = ri(rng, 200, 500), eff1 = pick(rng, [30, 40]), eff2 = pick(rng, [50, 60, 70]);
    const afterPrimary = bod * (1 - eff1 / 100); const final = afterPrimary * (1 - eff2 / 100);
    return nat({ topic: "Two-Stage Treatment — Final BOD", difficulty: "hard", marks: 2,
      stem: `Influent BOD $${bod}\\,\\text{mg/L}$ passes primary ($${eff1}\\%$ removal) then secondary ($${eff2}\\%$). Find the final effluent BOD (mg/L). Round off to two decimal places.`, answer: r2(final), tolerance: 0.5,
      solution: solN("$BOD_f=BOD_0(1-\\eta_1)(1-\\eta_2)$.", `$$BOD_f=${bod}(1-${eff1 / 100})(1-${eff2 / 100})=${fmt(final)}$$`, `two stages.`, fmt(final), r2(final - 0.5), r2(final + 0.5)) }); },
  (rng) => { const dry = ri(rng, 32, 40), wet = ri(rng, 24, 30); const dep = dry - wet; const rh = Math.max(0, 100 - 5 * dep);
    return nat({ topic: "Psychrometry — Approx RH", difficulty: "hard", marks: 2,
      stem: `With dry-bulb $${dry}^{\\circ}$C and wet-bulb $${wet}^{\\circ}$C, estimate the relative humidity using $RH\\approx100-5(\\text{DB}-\\text{WB})$ (%). Round off to two decimal places.`, answer: r2(rh), tolerance: 0.5,
      solution: solN("$RH\\approx100-5\\Delta$.", `$$RH=100-5(${dry}-${wet})=${fmt(rh)}\\%$$`, `DB,WB given.`, fmt(rh), r2(rh - 0.5), r2(rh + 0.5)) }); },
  (rng) => { const co = ri(rng, 20, 60), co2 = rf(rng, 0.3, 1.2), o2 = rf(rng, 18, 20.5); const safeCO = co <= 50, safeO2 = o2 >= 19.5;
    return mcq({ topic: "Atmosphere — Fitness to Enter", difficulty: "hard", marks: 2,
      stem: `Readings: CO $${co}\\,\\text{ppm}$ (limit 50), O$_2$ $${o2}\\%$ (min 19.5), CO$_2$ $${co2}\\%$. Is the atmosphere fit to enter without apparatus?`,
      options: ["Fit — all within limits", "Unfit — at least one parameter out of range", "Fit only with self-rescuer", "Cannot say without methane reading"],
      answer: (safeCO && safeO2) ? 0 : 1,
      solution: solC("Check each reading against its limit.", `$$CO=${co}\\le50?\\ ${safeCO};\\ O_2=${o2}\\ge19.5?\\ ${safeO2}$$`, `CO,O2 checked.`, (safeCO && safeO2) ? "Fit — within limits." : "Unfit — a parameter is out of range.") }); },
  (rng) => { const E = ri(rng, 100, 300), area = ri(rng, 30, 90), lampLumens = ri(rng, 2000, 5000), cu = pick(rng, [0.4, 0.5, 0.6]), llf = 0.8;
    const lamps = E * area / (lampLumens * cu * llf);
    return nat({ topic: "Lumen Method — Number of Lamps", difficulty: "hard", marks: 2,
      stem: `To light $${area}\\,\\text{m}^2$ to $${E}\\,\\text{lux}$: lamp output $${lampLumens}\\,\\text{lm}$, CU $${cu}$, LLF $0.8$. Find the number of lamps required. Round off to two decimal places.`, answer: r2(lamps), tolerance: 0.1,
      solution: solN("$N=\\frac{E\\,A}{\\Phi\\,CU\\,LLF}$.", `$$N=\\frac{${E}\\times${area}}{${lampLumens}\\times${cu}\\times0.8}=${fmt(lamps)}$$`, `$E=${E},A=${area}$.`, fmt(lamps), r2(lamps - 0.1), r2(lamps + 0.1)) }); },
  (rng) => { const inflow = rf(rng, 100, 300), sumpVol = ri(rng, 200, 600), pumpRate = rf(rng, 350, 600); const fillTime = sumpVol / (pumpRate - inflow);
    return nat({ topic: "Sump — Time to Empty Margin", difficulty: "hard", marks: 2,
      stem: `A $${sumpVol}\\,\\text{m}^3$ sump fills at $${inflow}\\,\\text{m}^3/\\text{h}$; pump runs at $${pumpRate}\\,\\text{m}^3/\\text{h}$. Find the time to draw it down from full to empty (h). Round off to two decimal places.`, answer: r2(fillTime), tolerance: 0.05,
      solution: solN("time $=$ volume $/$ (pump $-$ inflow).", `$$t=\\frac{${sumpVol}}{${pumpRate}-${inflow}}=${fmt(fillTime)}\\ \\text{h}$$`, `net $=${r2(pumpRate - inflow)}$.`, fmt(fillTime), r2(fillTime - 0.05), r2(fillTime + 0.05)) }); },
  (rng) => { const metab = ri(rng, 200, 400), rad = ri(rng, 50, 150), conv = ri(rng, 30, 100), evap = ri(rng, 200, 500); const storage = metab + rad + conv - evap;
    return nat({ topic: "Heat Balance — Body Storage", difficulty: "hard", marks: 2,
      stem: `A miner's heat balance: metabolic $+${metab}$, radiation $+${rad}$, convection $+${conv}$, evaporation $-${evap}\\,\\text{W}$. Find the net heat storage (W). Round off to two decimal places.`, answer: r2(storage), tolerance: 0.5,
      solution: solN("$S=M+R+C-E$.", `$$S=${metab}+${rad}+${conv}-${evap}=${fmt(storage)}\\ \\text{W}$$`, `4 terms.`, fmt(storage), r2(storage - 0.5), r2(storage + 0.5)) }); },
];

export default { slug: "mine-environment", name: SUB, subjectTag: SUB, pools: { A, B, C, D } };
