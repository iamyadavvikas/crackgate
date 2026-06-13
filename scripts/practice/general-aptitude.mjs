/** General Aptitude — 175-question template pools (A30/B30/C60/D55). */
import { mcq, nat, r2, fmt, solN, solC, numMCQ, svgBar, svgLine, figSvg } from "../build_practice_bank.mjs";

const SUB = "General Aptitude";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const base = ri(rng, 200, 800), p = pick(rng, [12, 15, 18, 20, 25]); const v = base * p / 100;
    return nat({ topic: "Numerical Ability — Percentage", difficulty: "easy", marks: 1,
      stem: `Find $${p}\\%$ of $${base}$. Round off to two decimal places.`, answer: v, tolerance: 0.01,
      solution: solN("Percentage means parts per hundred; multiply by $p/100$.", `$$\\frac{${p}}{100}\\times${base}=${fmt(v)}$$`, `base $=${base}$, $p=${p}\\%$.`, fmt(v), r2(v - 0.01), r2(v + 0.01)) }); },
  (rng) => { const kmh = ri(rng, 18, 108); const ms = kmh * 1000 / 3600;
    const m = numMCQ({ rng, correct: ms, traps: [kmh * 3.6, kmh / 3.6 * 3.6 / 1000, kmh], unit: "m/s" });
    return mcq({ topic: "Numerical Ability — Unit Conversion (Speed)", difficulty: "easy", marks: 1,
      stem: `Convert $${kmh}\\,\\text{km/h}$ to $\\text{m/s}$.`, options: m.options, answer: m.answer,
      solution: solC("Multiply km/h by $5/18$ (i.e. $1000/3600$); the trap is to multiply by $3.6$, which is the reverse conversion.", `$$${kmh}\\times\\frac{5}{18}=${fmt(ms)}\\ \\text{m/s}$$`, `$v=${kmh}$ km/h.`, `$${fmt(ms)}$ m/s is correct.`) }); },
  (rng) => { const a = ri(rng, 2, 8), b = ri(rng, 3, 9), total = (a + b) * ri(rng, 10, 40); const share = total * a / (a + b);
    return nat({ topic: "Numerical Ability — Ratio & Proportion", difficulty: "easy", marks: 1,
      stem: `An amount $${total}$ is divided in the ratio $${a}:${b}$. Find the larger... find the first share. Round off to two decimal places.`, answer: share, tolerance: 0.01,
      solution: solN("Each part $=$ total$/(a+b)$; the first share is $a$ parts.", `$$\\frac{${a}}{${a + b}}\\times${total}=${fmt(share)}$$`, `total $=${total}$, ratio $${a}:${b}$.`, fmt(share), r2(share - 0.01), r2(share + 0.01)) }); },
  (rng) => { const nums = [ri(rng, 10, 50), ri(rng, 10, 50), ri(rng, 10, 50), ri(rng, 10, 50), ri(rng, 10, 50)]; const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return nat({ topic: "Numerical Ability — Average", difficulty: "easy", marks: 1,
      stem: `Find the average of $${nums.join(", ")}$. Round off to two decimal places.`, answer: avg, tolerance: 0.01,
      solution: solN("Average $=$ sum $/$ count.", `$$\\bar x=\\frac{${nums.join("+")}}{${nums.length}}=${fmt(avg)}$$`, `$n=${nums.length}$.`, fmt(avg), r2(avg - 0.01), r2(avg + 0.01)) }); },
  (rng) => { const P = ri(rng, 1000, 8000), R = pick(rng, [5, 6, 8, 10, 12]), T = ri(rng, 2, 5); const SI = P * R * T / 100;
    return nat({ topic: "Numerical Ability — Simple Interest", difficulty: "easy", marks: 1,
      stem: `Find the simple interest on $${P}$ at $${R}\\%$ per annum for $${T}$ years. Round off to two decimal places.`, answer: SI, tolerance: 0.01,
      solution: solN("$SI=\\dfrac{P\\cdot R\\cdot T}{100}$.", `$$SI=\\frac{${P}\\times${R}\\times${T}}{100}=${fmt(SI)}$$`, `$P=${P},\\ R=${R}\\%,\\ T=${T}$.`, fmt(SI), r2(SI - 0.01), r2(SI + 0.01)) }); },
  (rng) => { const cp = ri(rng, 100, 500), p = pick(rng, [10, 15, 20, 25]); const sp = cp * (1 + p / 100);
    return nat({ topic: "Numerical Ability — Profit & Loss", difficulty: "easy", marks: 1,
      stem: `An article costing $${cp}$ is sold at a profit of $${p}\\%$. Find the selling price. Round off to two decimal places.`, answer: sp, tolerance: 0.01,
      solution: solN("$SP=CP(1+\\text{profit}\\%)$.", `$$SP=${cp}(1+${p / 100})=${fmt(sp)}$$`, `$CP=${cp},\\ \\text{profit}=${p}\\%$.`, fmt(sp), r2(sp - 0.01), r2(sp + 0.01)) }); },
  (rng) => { const a = ri(rng, 4, 12), b = ri(rng, 6, 18); const t = a * b / (a + b);
    return nat({ topic: "Numerical Ability — Time & Work", difficulty: "medium", marks: 2,
      stem: `$A$ finishes a job in $${a}$ days and $B$ in $${b}$ days. Working together, how many days do they take? Round off to two decimal places.`, answer: t, tolerance: 0.02,
      solution: solN("Add rates: combined time $=\\dfrac{ab}{a+b}$.", `$$t=\\frac{${a}\\times${b}}{${a}+${b}}=${fmt(t)}\\ \\text{days}$$`, `$a=${a},\\ b=${b}$.`, fmt(t), r2(t - 0.02), r2(t + 0.02)) }); },
  (rng) => { const ms = ri(rng, 5, 30); const kmh = ms * 3.6;
    const m = numMCQ({ rng, correct: kmh, traps: [ms * 5 / 18, ms / 3.6, ms], unit: "km/h" });
    return mcq({ topic: "Numerical Ability — Unit Conversion (Speed)", difficulty: "easy", marks: 1,
      stem: `Convert $${ms}\\,\\text{m/s}$ to $\\text{km/h}$.`, options: m.options, answer: m.answer,
      solution: solC("Multiply m/s by $18/5$ (i.e. $3.6$); the trap is multiplying by $5/18$.", `$$${ms}\\times3.6=${fmt(kmh)}\\ \\text{km/h}$$`, `$v=${ms}$ m/s.`, `$${fmt(kmh)}$ km/h is correct.`) }); },
];

/* ---------------- Archetype B — vintage PYQ variants ---------------- */
const B = [
  (rng) => { const d = ri(rng, 60, 300), v = ri(rng, 20, 80); const t = d / v;
    return nat({ topic: "Numerical Ability — Time, Speed & Distance", difficulty: "medium", marks: 2,
      stem: `A vehicle travels $${d}\\,\\text{km}$ at $${v}\\,\\text{km/h}$. Find the time taken (hours). Round off to two decimal places.`, answer: t, tolerance: 0.02,
      solution: solN("$t=d/v$ in consistent units.", `$$t=\\frac{${d}}{${v}}=${fmt(t)}\\ \\text{h}$$`, `$d=${d},\\ v=${v}$.`, fmt(t), r2(t - 0.02), r2(t + 0.02)) }); },
  (rng) => { const Lt = ri(rng, 100, 300), Lp = 0, v = ri(rng, 36, 90); const vms = v * 5 / 18; const t = Lt / vms;
    return nat({ topic: "Numerical Ability — Trains", difficulty: "hard", marks: 2,
      stem: `A train $${Lt}\\,\\text{m}$ long moves at $${v}\\,\\text{km/h}$. How long (s) to cross a pole? Round off to two decimal places.`, answer: t, tolerance: 0.05,
      solution: solN("Crossing a pole covers one train-length; convert speed to m/s first.", `$$t=\\frac{${Lt}}{${v}\\times5/18}=\\frac{${Lt}}{${r2(vms)}}=${fmt(t)}\\ \\text{s}$$`, `$L=${Lt}$ m, $v=${v}$ km/h.`, fmt(t), r2(t - 0.05), r2(t + 0.05)) }); },
  (rng) => { const a = ri(rng, 6, 12), b = ri(rng, 8, 16); const t = a * b / (a + b);
    return nat({ topic: "Numerical Ability — Pipes & Cisterns", difficulty: "medium", marks: 2,
      stem: `Pipe $A$ fills a tank in $${a}\\,\\text{h}$, pipe $B$ in $${b}\\,\\text{h}$. Together, how long to fill it? Round off to two decimal places.`, answer: t, tolerance: 0.02,
      solution: solN("Add filling rates; combined time $=ab/(a+b)$.", `$$t=\\frac{${a}\\times${b}}{${a}+${b}}=${fmt(t)}\\ \\text{h}$$`, `$a=${a},\\ b=${b}$.`, fmt(t), r2(t - 0.02), r2(t + 0.02)) }); },
  (rng) => { const x = ri(rng, 2, 6), y = ri(rng, 3, 7), z = ri(rng, 2, 5), profit = ri(rng, 600, 2000) * (x + y + z); const share = profit * x / (x + y + z);
    return nat({ topic: "Numerical Ability — Partnership", difficulty: "medium", marks: 2,
      stem: `Three partners invest in the ratio $${x}:${y}:${z}$. From a total profit of $${profit}$, find the first partner's share. Round off to two decimal places.`, answer: share, tolerance: 0.5,
      solution: solN("Profit divides in the investment ratio.", `$$\\text{share}=\\frac{${x}}{${x + y + z}}\\times${profit}=${fmt(share)}$$`, `ratio $${x}:${y}:${z}$.`, fmt(share), r2(share - 0.5), r2(share + 0.5)) }); },
  (rng) => { const P = ri(rng, 1000, 5000), R = pick(rng, [5, 8, 10]), n = ri(rng, 2, 3); const A = P * Math.pow(1 + R / 100, n); const CI = A - P;
    return nat({ topic: "Numerical Ability — Compound Interest", difficulty: "hard", marks: 2,
      stem: `Find the compound interest on $${P}$ at $${R}\\%$ p.a. for $${n}$ years (annual compounding). Round off to two decimal places.`, answer: CI, tolerance: 0.5,
      solution: solN("$A=P(1+R/100)^n$; $CI=A-P$.", `$$A=${P}(1+${R / 100})^{${n}}=${fmt(A)};\\ CI=${fmt(CI)}$$`, `$P=${P},\\ R=${R}\\%,\\ n=${n}$.`, fmt(CI), r2(CI - 0.5), r2(CI + 0.5)) }); },
  (rng) => { const son = ri(rng, 8, 20), gap = ri(rng, 22, 34); const father = son + gap; const ratio = father / son;
    return nat({ topic: "Numerical Ability — Ages", difficulty: "medium", marks: 2,
      stem: `A father is $${gap}$ years older than his son who is $${son}$. Find the ratio (father:son) as a decimal. Round off to two decimal places.`, answer: ratio, tolerance: 0.02,
      solution: solN("Father's age $=$ son $+$ gap; ratio is the quotient.", `$$\\frac{${father}}{${son}}=${fmt(ratio)}$$`, `son $=${son}$, gap $=${gap}$.`, fmt(ratio), r2(ratio - 0.02), r2(ratio + 0.02)) }); },
  (rng) => { const x = pick(rng, [10, 20, 25]), y = pick(rng, [10, 20, 25]); const net = (1 + x / 100) * (1 - y / 100) - 1; const pct = net * 100;
    return nat({ topic: "Numerical Ability — Successive Percentage", difficulty: "hard", marks: 2,
      stem: `A price is increased by $${x}\\%$ then decreased by $${y}\\%$. Find the net percentage change. Round off to two decimal places.`, answer: pct, tolerance: 0.05,
      solution: solN("Apply successive multiplicative factors, not simple addition.", `$$(1+${x / 100})(1-${y / 100})-1=${r2(net)}\\Rightarrow ${fmt(pct)}\\%$$`, `$+${x}\\%$ then $-${y}\\%$.`, fmt(pct), r2(pct - 0.05), r2(pct + 0.05)) }); },
  (rng) => { const a = ri(rng, 2, 6), b = ri(rng, 3, 8), c = ri(rng, 1, 4); const total = ri(rng, 30, 60); const x = total / (a + b + c); const big = x * b;
    return nat({ topic: "Numerical Ability — Ratio Distribution", difficulty: "medium", marks: 2,
      stem: `$${total}$ items are split among three bins in ratio $${a}:${b}:${c}$. How many in the second bin? Round off to two decimal places.`, answer: big, tolerance: 0.05,
      solution: solN("Divide total by sum of ratio terms, scale by the required term.", `$$\\frac{${b}}{${a + b + c}}\\times${total}=${fmt(big)}$$`, `ratio $${a}:${b}:${c}$.`, fmt(big), r2(big - 0.05), r2(big + 0.05)) }); },
];

/* ---------------- Archetype C — data interpretation (figures) ------- */
const C = [
  (rng) => { const vals = [ri(rng, 20, 60), ri(rng, 30, 80), ri(rng, 40, 90), ri(rng, 25, 70), ri(rng, 35, 85)]; const mx = Math.max(...vals);
    return nat({ topic: "Data Interpretation — Bar Chart (Maximum)", difficulty: "medium", marks: 2,
      stem: `The bar chart shows monthly sales (units). Identify the highest monthly sales value. Round off to two decimal places.`, answer: mx, tolerance: 0.01,
      figure: svgBar({ labels: ["Jan", "Feb", "Mar", "Apr", "May"], values: vals, caption: "Monthly sales", title: "Sales (units)" }),
      solution: solN("Read off the tallest bar.", `$$\\max(${vals.join(",")})=${fmt(mx)}$$`, `five monthly values.`, fmt(mx), r2(mx - 0.01), r2(mx + 0.01)) }); },
  (rng) => { const vals = [ri(rng, 20, 50), ri(rng, 30, 60), ri(rng, 40, 70), ri(rng, 35, 65)]; const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return nat({ topic: "Data Interpretation — Bar Chart (Average)", difficulty: "medium", marks: 2,
      stem: `The bar chart shows quarterly output. Find the average quarterly output. Round off to two decimal places.`, answer: avg, tolerance: 0.05,
      figure: svgBar({ labels: ["Q1", "Q2", "Q3", "Q4"], values: vals, caption: "Quarterly output", title: "Output" }),
      solution: solN("Average the four bar heights.", `$$\\bar x=\\frac{${vals.join("+")}}{4}=${fmt(avg)}$$`, `four quarterly values.`, fmt(avg), r2(avg - 0.05), r2(avg + 0.05)) }); },
  (rng) => { const v0 = ri(rng, 40, 80), v1 = v0 + ri(rng, 10, 40); const pct = (v1 - v0) / v0 * 100;
    const pts = [[0, v0], [1, v0 + (v1 - v0) * 0.4], [2, v0 + (v1 - v0) * 0.7], [3, v1]];
    return nat({ topic: "Data Interpretation — Line Trend (% growth)", difficulty: "hard", marks: 2,
      stem: `The line chart shows revenue rising from $${v0}$ to $${v1}$. Find the percentage growth. Round off to two decimal places.`, answer: pct, tolerance: 0.05,
      figure: svgLine({ series: [{ points: pts, color: "#2563eb", dots: true, label: "rev" }], xlabel: "year", ylabel: "revenue", caption: "Revenue trend" }),
      solution: solN("Percentage growth $=\\dfrac{\\Delta}{\\text{initial}}\\times100$.", `$$\\frac{${v1}-${v0}}{${v0}}\\times100=${fmt(pct)}\\%$$`, `initial $=${v0}$, final $=${v1}$.`, fmt(pct), r2(pct - 0.05), r2(pct + 0.05)) }); },
  (rng) => { const parts = [ri(rng, 10, 30), ri(rng, 15, 35), ri(rng, 20, 40), ri(rng, 10, 25)]; const tot = parts.reduce((a, b) => a + b, 0); const deg0 = parts[2] / tot * 360;
    // pie chart svg
    let acc = 0; const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"]; let segs = "";
    parts.forEach((p, i) => { const a0 = acc / tot * 2 * Math.PI, a1 = (acc + p) / tot * 2 * Math.PI; acc += p;
      const x0 = 90 + 60 * Math.cos(a0), y0 = 80 + 60 * Math.sin(a0), x1 = 90 + 60 * Math.cos(a1), y1 = 80 + 60 * Math.sin(a1); const large = (a1 - a0) > Math.PI ? 1 : 0;
      segs += `<path d='M90,80 L${r2(x0)},${r2(y0)} A60,60 0 ${large} 1 ${r2(x1)},${r2(y1)} Z' fill='${colors[i]}'/>`; });
    const mk = `<svg viewBox='0 0 240 170' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='10'>${segs}<text x='90' y='160' text-anchor='middle' fill='#475569'>budget shares (A,B,C,D)</text></svg>`;
    return nat({ topic: "Data Interpretation — Pie Chart", difficulty: "hard", marks: 2,
      stem: `The pie chart splits a budget as $${parts.join(":")}$ (segments A,B,C,D). Find the central angle (degrees) of segment C. Round off to two decimal places.`, answer: deg0, tolerance: 0.1,
      figure: figSvg(mk, "Budget pie chart"),
      solution: solN("Central angle $=\\dfrac{\\text{part}}{\\text{total}}\\times360^{\\circ}$.", `$$\\frac{${parts[2]}}{${tot}}\\times360=${fmt(deg0)}^{\\circ}$$`, `parts $${parts.join(",")}$.`, fmt(deg0), r2(deg0 - 0.1), r2(deg0 + 0.1)) }); },
  (rng) => { const a = [ri(rng, 30, 50), ri(rng, 40, 60), ri(rng, 50, 70)]; const b = [ri(rng, 20, 40), ri(rng, 30, 50), ri(rng, 40, 60)]; const diff = a.reduce((s, v, i) => s + (v - b[i]), 0);
    return nat({ topic: "Data Interpretation — Comparative Bars", difficulty: "hard", marks: 2,
      stem: `Two product lines (P=blue) post outputs $${a.join(",")}$ across three years. Line Q posts $${b.join(",")}$. Find the total surplus of P over Q. Round off to two decimal places.`, answer: diff, tolerance: 0.01,
      figure: svgLine({ series: [{ points: a.map((v, i) => [i, v]), color: "#2563eb", dots: true, label: "P" }, { points: b.map((v, i) => [i, v]), color: "#dc2626", dots: true, label: "Q" }], xlabel: "year", ylabel: "output", caption: "P vs Q output" }),
      solution: solN("Sum the year-by-year differences.", `$$\\Sigma(P-Q)=${a.map((v, i) => `(${v}-${b[i]})`).join("+")}=${fmt(diff)}$$`, `P $${a.join(",")}$; Q $${b.join(",")}$.`, fmt(diff), r2(diff - 0.01), r2(diff + 0.01)) }); },
  (rng) => { const vals = [ri(rng, 10, 30), ri(rng, 20, 40), ri(rng, 30, 50), ri(rng, 15, 35), ri(rng, 25, 45)]; const tot = vals.reduce((a, b) => a + b, 0); const share = vals[2] / tot * 100;
    return nat({ topic: "Data Interpretation — Bar Chart (Share %)", difficulty: "medium", marks: 2,
      stem: `The bars give five regions' contribution. Find region C's percentage share of the total. Round off to two decimal places.`, answer: share, tolerance: 0.05,
      figure: svgBar({ labels: ["A", "B", "C", "D", "E"], values: vals, caption: "Regional contribution", title: "Contribution" }),
      solution: solN("Share $=\\dfrac{\\text{part}}{\\text{total}}\\times100$.", `$$\\frac{${vals[2]}}{${tot}}\\times100=${fmt(share)}\\%$$`, `values $${vals.join(",")}$.`, fmt(share), r2(share - 0.05), r2(share + 0.05)) }); },
  (rng) => { const base = ri(rng, 50, 100); const pts = [[0, base], [1, base * 1.1], [2, base * 1.1 * 1.2], [3, base * 1.1 * 1.2 * 0.9]]; const final = pts[3][1];
    return nat({ topic: "Data Interpretation — Index Trend", difficulty: "hard", marks: 2,
      stem: `An index starts at $${base}$ and changes by $+10\\%,+20\\%,-10\\%$ over three years (line plot). Find its final value. Round off to two decimal places.`, answer: final, tolerance: 0.05,
      figure: svgLine({ series: [{ points: pts, color: "#16a34a", dots: true, label: "idx" }], xlabel: "year", ylabel: "index", caption: "Index trend" }),
      solution: solN("Apply successive multiplicative factors.", `$$${base}\\times1.1\\times1.2\\times0.9=${fmt(final)}$$`, `base $=${base}$.`, fmt(final), r2(final - 0.05), r2(final + 0.05)) }); },
  (rng) => { const vals = [ri(rng, 4, 9), ri(rng, 6, 12), ri(rng, 8, 15), ri(rng, 5, 10)]; const cum = vals.map((_, i) => vals.slice(0, i + 1).reduce((a, b) => a + b, 0)); const total = cum[cum.length - 1];
    return nat({ topic: "Data Interpretation — Cumulative Total", difficulty: "medium", marks: 2,
      stem: `The bars give weekly intake $${vals.join(",")}$. Find the cumulative total over all four weeks. Round off to two decimal places.`, answer: total, tolerance: 0.01,
      figure: svgBar({ labels: ["W1", "W2", "W3", "W4"], values: vals, caption: "Weekly intake", title: "Intake" }),
      solution: solN("Cumulative total is the running sum's last value.", `$$\\Sigma=${vals.join("+")}=${fmt(total)}$$`, `weekly $${vals.join(",")}$.`, fmt(total), r2(total - 0.01), r2(total + 0.01)) }); },
  (rng) => { const vals = [ri(rng, 20, 40), ri(rng, 30, 50), ri(rng, 25, 45)]; const n = 30; const mids = [25, 35, 45]; const total = vals.reduce((a, b) => a + b, 0); const mean = vals.reduce((a, v, i) => a + v * mids[i], 0) / total;
    return nat({ topic: "Data Interpretation — Histogram Mean", difficulty: "hard", marks: 2,
      stem: `A histogram has frequencies $${vals.join(",")}$ at class midpoints $${mids.join(",")}$. Find the mean. Round off to two decimal places.`, answer: mean, tolerance: 0.05,
      figure: svgBar({ labels: mids.map(String), values: vals, caption: "Frequency histogram", title: "Frequency" }),
      solution: solN("Grouped mean $=\\dfrac{\\Sigma f_ix_i}{\\Sigma f_i}$.", `$$\\bar x=\\frac{${vals.map((v, i) => v * mids[i]).join("+")}}{${total}}=${fmt(mean)}$$`, `freqs $${vals.join(",")}$.`, fmt(mean), r2(mean - 0.05), r2(mean + 0.05)) }); },
  (rng) => { const a = [ri(rng, 20, 40), ri(rng, 30, 50), ri(rng, 40, 60)]; const ratio = a[2] / a[0];
    return nat({ topic: "Data Interpretation — Ratio from Chart", difficulty: "medium", marks: 2,
      stem: `From the plotted series $${a.join(",")}$, find the ratio of the third to the first value. Round off to two decimal places.`, answer: ratio, tolerance: 0.02,
      figure: svgLine({ series: [{ points: a.map((v, i) => [i, v]), color: "#7c3aed", dots: true, label: "x" }], xlabel: "index", ylabel: "value", caption: "Series" }),
      solution: solN("Divide the two read-off values.", `$$\\frac{${a[2]}}{${a[0]}}=${fmt(ratio)}$$`, `values $${a.join(",")}$.`, fmt(ratio), r2(ratio - 0.02), r2(ratio + 0.02)) }); },
  (rng) => { const vals = [ri(rng, 100, 200), ri(rng, 120, 220), ri(rng, 140, 240)]; const growth = (vals[2] - vals[0]) / vals[0] * 100;
    return nat({ topic: "Data Interpretation — Multi-year Growth", difficulty: "hard", marks: 2,
      stem: `Production over three years is $${vals.join(",")}$ (line plot). Find the total percentage growth from year 1 to year 3. Round off to two decimal places.`, answer: growth, tolerance: 0.05,
      figure: svgLine({ series: [{ points: vals.map((v, i) => [i, v]), color: "#0891b2", dots: true, label: "prod" }], xlabel: "year", ylabel: "tonnes", caption: "Production" }),
      solution: solN("Growth from first to last $=\\dfrac{\\text{last}-\\text{first}}{\\text{first}}\\times100$.", `$$\\frac{${vals[2]}-${vals[0]}}{${vals[0]}}\\times100=${fmt(growth)}\\%$$`, `values $${vals.join(",")}$.`, fmt(growth), r2(growth - 0.05), r2(growth + 0.05)) }); },
  (rng) => { const vals = [ri(rng, 10, 25), ri(rng, 15, 30), ri(rng, 20, 35), ri(rng, 12, 28)]; const med = [...vals].sort((a, b) => a - b); const median = (med[1] + med[2]) / 2;
    return nat({ topic: "Data Interpretation — Median from Bars", difficulty: "medium", marks: 2,
      stem: `The four bars read $${vals.join(",")}$. Find the median of these values. Round off to two decimal places.`, answer: median, tolerance: 0.01,
      figure: svgBar({ labels: ["a", "b", "c", "d"], values: vals, caption: "Four values", title: "Values" }),
      solution: solN("Median of an even set is the mean of the two middle (sorted) values.", `$$\\text{median}=\\frac{${med[1]}+${med[2]}}{2}=${fmt(median)}$$`, `sorted $${med.join(",")}$.`, fmt(median), r2(median - 0.01), r2(median + 0.01)) }); },
];

/* ---------------- Archetype D — multi-stage rank determinators ------ */
const D = [
  (rng) => { const c1 = pick(rng, [20, 25, 30]), c2 = pick(rng, [40, 50, 60]), m = pick(rng, [30, 35, 40]); const ratio = (c2 - m) / (m - c1);
    return nat({ topic: "Numerical Ability — Alligation/Mixture", difficulty: "hard", marks: 2,
      stem: `Two solutions of concentration $${c1}\\%$ and $${c2}\\%$ are mixed to get $${m}\\%$. Find the mixing ratio (cheaper:dearer). Round off to two decimal places.`, answer: ratio, tolerance: 0.02,
      solution: solN("Alligation: ratio $=\\dfrac{(\\text{dearer}-\\text{mean})}{(\\text{mean}-\\text{cheaper})}$.", `$$\\frac{${c2}-${m}}{${m}-${c1}}=${fmt(ratio)}$$`, `$c_1=${c1},\\ c_2=${c2},\\ m=${m}$.`, fmt(ratio), r2(ratio - 0.02), r2(ratio + 0.02)) }); },
  (rng) => { const b = ri(rng, 8, 16), s = ri(rng, 2, 5); const down = b + s, up = b - s; const d = ri(rng, 20, 60); const t = d / down + d / up;
    return nat({ topic: "Numerical Ability — Boats & Streams", difficulty: "hard", marks: 2,
      stem: `A boat rows at $${b}\\,\\text{km/h}$ in still water; stream $${s}\\,\\text{km/h}$. Find total time for a round trip of $${d}\\,\\text{km}$ each way. Round off to two decimal places.`, answer: t, tolerance: 0.05,
      solution: solN("Downstream speed $=b+s$, upstream $=b-s$; sum the two leg-times.", `$$t=\\frac{${d}}{${down}}+\\frac{${d}}{${up}}=${fmt(t)}\\ \\text{h}$$`, `$b=${b},\\ s=${s},\\ d=${d}$.`, fmt(t), r2(t - 0.05), r2(t + 0.05)) }); },
  (rng) => { const a = ri(rng, 8, 14), b = ri(rng, 10, 18), c = ri(rng, 12, 20); const rate = 1 / a + 1 / b + 1 / c; const t = 1 / rate;
    return nat({ topic: "Numerical Ability — Combined Work (3 agents)", difficulty: "hard", marks: 2,
      stem: `Three machines complete a task individually in $${a},${b},${c}$ hours. Working together, how long do they take? Round off to two decimal places.`, answer: t, tolerance: 0.02,
      solution: solN("Sum the per-hour rates, then invert.", `$$t=\\frac{1}{\\tfrac1{${a}}+\\tfrac1{${b}}+\\tfrac1{${c}}}=${fmt(t)}\\ \\text{h}$$`, `$${a},${b},${c}$ h.`, fmt(t), r2(t - 0.02), r2(t + 0.02)) }); },
  (rng) => { const mp = ri(rng, 400, 900), disc = pick(rng, [10, 15, 20]), profit = pick(rng, [20, 25, 30]); const sp = mp * (1 - disc / 100); const cp = sp / (1 + profit / 100);
    return nat({ topic: "Numerical Ability — Marked Price/Discount", difficulty: "hard", marks: 2,
      stem: `An item marked $${mp}$ is sold at $${disc}\\%$ discount yet yields $${profit}\\%$ profit. Find the cost price. Round off to two decimal places.`, answer: cp, tolerance: 0.5,
      solution: solN("$SP=MP(1-\\text{disc})$; $CP=SP/(1+\\text{profit})$.", `$$SP=${mp}(1-${disc / 100})=${fmt(sp)};\\ CP=\\frac{${fmt(sp)}}{1+${profit / 100}}=${fmt(cp)}$$`, `$MP=${mp}$, disc $${disc}\\%$, profit $${profit}\\%$.`, fmt(cp), r2(cp - 0.5), r2(cp + 0.5)) }); },
  (rng) => { const n = ri(rng, 4, 7), k = ri(rng, 2, 3); const c = factC(n, k);
    return nat({ topic: "Numerical Ability — Combinations", difficulty: "hard", marks: 2,
      stem: `In how many ways can $${k}$ members be chosen from $${n}$? Round off to two decimal places.`, answer: c, tolerance: 0.01,
      solution: solN("Use $\\binom{n}{k}=\\dfrac{n!}{k!(n-k)!}$.", `$$\\binom{${n}}{${k}}=${fmt(c)}$$`, `$n=${n},\\ k=${k}$.`, fmt(c), r2(c - 0.01), r2(c + 0.01)) }); },
  (rng) => { const total = ri(rng, 20, 40), red = ri(rng, 5, 12), blue = total - red; const P = red / total * (red - 1) / (total - 1);
    return nat({ topic: "Numerical Ability — Probability (without replacement)", difficulty: "hard", marks: 2,
      stem: `A bag has $${red}$ red and $${blue}$ blue balls. Two are drawn without replacement. Find $P(\\text{both red})$. Round off to two decimal places.`, answer: P, tolerance: 0.01,
      solution: solN("Multiply conditional probabilities for sequential draws.", `$$P=\\frac{${red}}{${total}}\\times\\frac{${red - 1}}{${total - 1}}=${fmt(P)}$$`, `red $${red}$, total $${total}$.`, fmt(P), r2(P - 0.01), r2(P + 0.01)) }); },
  (rng) => { const w1 = ri(rng, 2, 5), w2 = ri(rng, 3, 6), a1 = ri(rng, 60, 80), a2 = ri(rng, 70, 95); const wa = (w1 * a1 + w2 * a2) / (w1 + w2);
    return nat({ topic: "Numerical Ability — Weighted Average", difficulty: "hard", marks: 2,
      stem: `Two groups of sizes $${w1}$ and $${w2}$ average $${a1}$ and $${a2}$ respectively. Find the combined (weighted) average. Round off to two decimal places.`, answer: wa, tolerance: 0.05,
      solution: solN("Weighted mean $=\\dfrac{\\Sigma w_ia_i}{\\Sigma w_i}$.", `$$\\frac{${w1}\\times${a1}+${w2}\\times${a2}}{${w1 + w2}}=${fmt(wa)}$$`, `weights $${w1},${w2}$.`, fmt(wa), r2(wa - 0.05), r2(wa + 0.05)) }); },
  (rng) => { const d = ri(rng, 100, 240), v1 = ri(rng, 30, 50), v2 = ri(rng, 55, 75); const avg = 2 * v1 * v2 / (v1 + v2);
    return nat({ topic: "Numerical Ability — Average Speed (round trip)", difficulty: "hard", marks: 2,
      stem: `A trip covers equal distances at $${v1}$ and $${v2}\\,\\text{km/h}$. Find the average speed over the whole journey. Round off to two decimal places.`, answer: avg, tolerance: 0.05,
      solution: solN("For equal distances the average speed is the harmonic mean, not the arithmetic mean.", `$$v_{avg}=\\frac{2v_1v_2}{v_1+v_2}=\\frac{2\\times${v1}\\times${v2}}{${v1 + v2}}=${fmt(avg)}$$`, `$v_1=${v1},\\ v_2=${v2}$.`, fmt(avg), r2(avg - 0.05), r2(avg + 0.05)) }); },
  (rng) => { const p = ri(rng, 5000, 12000), r = pick(rng, [8, 10, 12]); const n = 2; const ci = p * Math.pow(1 + r / 200, 2 * n) - p; const si = p * r * n / 100; const diff = ci - si;
    return nat({ topic: "Numerical Ability — CI vs SI difference", difficulty: "hard", marks: 2,
      stem: `For $P=${p}$ at $${r}\\%$ p.a. over $2$ years (CI compounded half-yearly), find CI$-$SI. Round off to two decimal places.`, answer: diff, tolerance: 1,
      solution: solN("Half-yearly compounding uses rate $r/2$ over $2n$ periods; subtract simple interest.", `$$CI=${p}(1+${r / 200})^{${2 * n}}-${p};\\ CI-SI=${fmt(diff)}$$`, `$P=${p},\\ r=${r}\\%,\\ n=2$.`, fmt(diff), r2(diff - 1), r2(diff + 1)) }); },
  (rng) => { const men = ri(rng, 6, 12), days = ri(rng, 8, 16), extra = ri(rng, 2, 5); const newDays = men * days / (men + extra);
    return nat({ topic: "Numerical Ability — Work & Men (inverse)", difficulty: "hard", marks: 2,
      stem: `$${men}$ workers finish a job in $${days}$ days. With $${men + extra}$ workers (same job), how many days? Round off to two decimal places.`, answer: newDays, tolerance: 0.02,
      solution: solN("Men and days are inversely proportional (constant man-days).", `$$d_2=\\frac{${men}\\times${days}}{${men + extra}}=${fmt(newDays)}\\ \\text{days}$$`, `man-days $=${men * days}$.`, fmt(newDays), r2(newDays - 0.02), r2(newDays + 0.02)) }); },
];

function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function factC(n, k) { return fact(n) / (fact(k) * fact(n - k)); }

export default { slug: "general-aptitude", name: "General Aptitude", subjectTag: SUB, pools: { A, B, C, D } };
