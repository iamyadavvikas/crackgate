/** Mine Economics, Planning & Systems Engineering — 175 questions (A30/B30/C60/D55). */
import { mcq, nat, r2, fmt, solN, solC, numMCQ, svgBar, svgLine, svgCashFlow, svgCPM, svgReliability } from "../build_practice_bank.mjs";

const SUB = "Mine Economics, Planning & Systems Engineering";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const rf = (rng, a, b) => r2(a + rng() * (b - a));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const P = ri(rng, 100, 500), i = pick(rng, [8, 10, 12]), n = ri(rng, 3, 8); const F = P * (1 + i / 100) ** n;
    return nat({ topic: "Future Worth", difficulty: "medium", marks: 2,
      stem: `₹$${P}$ lakh is invested at $${i}\\%$ for $${n}$ years (compound). Find the future worth (₹ lakh). Round off to two decimal places.`, answer: F, tolerance: 0.1,
      solution: solN("$F=P(1+i)^n$.", `$$F=${P}(1+${i / 100})^{${n}}=${fmt(F)}$$`, `$P=${P},\\ i=${i}\\%,\\ n=${n}$.`, fmt(F), r2(F - 0.1), r2(F + 0.1)) }); },
  (rng) => { const F = ri(rng, 200, 800), i = pick(rng, [8, 10, 12]), n = ri(rng, 3, 8); const P = F / (1 + i / 100) ** n;
    return nat({ topic: "Present Worth", difficulty: "medium", marks: 2,
      stem: `A sum of ₹$${F}$ lakh is due in $${n}$ years. At $${i}\\%$, find its present worth (₹ lakh). Round off to two decimal places.`, answer: P, tolerance: 0.1,
      solution: solN("$P=F/(1+i)^n$.", `$$P=\\frac{${F}}{(1+${i / 100})^{${n}}}=${fmt(P)}$$`, `$F=${F},\\ i=${i}\\%,\\ n=${n}$.`, fmt(P), r2(P - 0.1), r2(P + 0.1)) }); },
  (rng) => { const cost = ri(rng, 500, 2000), salv = ri(rng, 50, 200), life = ri(rng, 5, 12); const dep = (cost - salv) / life;
    return nat({ topic: "Straight-Line Depreciation", difficulty: "easy", marks: 1,
      stem: `An asset costs ₹$${cost}$ lakh, salvage ₹$${salv}$ lakh, life $${life}$ yr. Find the annual straight-line depreciation (₹ lakh). Round off to two decimal places.`, answer: dep, tolerance: 0.05,
      solution: solN("$D=(C-S)/n$.", `$$D=\\frac{${cost}-${salv}}{${life}}=${fmt(dep)}$$`, `$C=${cost},\\ S=${salv},\\ n=${life}$.`, fmt(dep), r2(dep - 0.05), r2(dep + 0.05)) }); },
  (rng) => { const invest = ri(rng, 500, 2000), cf = ri(rng, 100, 400); const pb = invest / cf;
    return nat({ topic: "Simple Payback Period", difficulty: "easy", marks: 1,
      stem: `An investment of ₹$${invest}$ lakh yields ₹$${cf}$ lakh/yr. Find the simple payback period (yr). Round off to two decimal places.`, answer: pb, tolerance: 0.02,
      solution: solN("payback $=$ investment $/$ annual cash flow.", `$$PB=\\frac{${invest}}{${cf}}=${fmt(pb)}\\ \\text{yr}$$`, `inv $=${invest},\\ CF=${cf}$.`, fmt(pb), r2(pb - 0.02), r2(pb + 0.02)) }); },
  (rng) => { const fixed = ri(rng, 100, 500), price = rf(rng, 30, 80), varc = rf(rng, 10, 25); const beq = fixed * 1e5 / (price - varc);
    return nat({ topic: "Break-Even Quantity", difficulty: "medium", marks: 2,
      stem: `Fixed cost ₹$${fixed}$ lakh, selling price ₹$${price}\\,\\text{/t}$, variable cost ₹$${varc}\\,\\text{/t}$. Find the break-even output (t). Round off to two decimal places.`, answer: beq, tolerance: 1,
      solution: solN("BEQ $=$ fixed $/$ (price $-$ variable).", `$$Q=\\frac{${fixed}\\times10^5}{${price}-${varc}}=${fmt(beq)}\\ \\text{t}$$`, `FC $=${fixed}$ lakh.`, fmt(beq), r2(beq - 1), r2(beq + 1)) }); },
  (rng) => { const r1 = rf(rng, 0.85, 0.97), r2v = rf(rng, 0.85, 0.97); const rs = r1 * r2v;
    return nat({ topic: "Series Reliability (2 units)", difficulty: "easy", marks: 1,
      stem: `Two components in series have reliabilities $${r1}$ and $${r2v}$. Find the system reliability. Round off to two decimal places.`, answer: rs, tolerance: 0.005,
      solution: solN("$R_s=R_1R_2$.", `$$R_s=${r1}\\times${r2v}=${fmt(rs)}$$`, `$R_1=${r1},\\ R_2=${r2v}$.`, fmt(rs), r2(rs - 0.005), r2(rs + 0.005)) }); },
  (rng) => { const r1 = rf(rng, 0.7, 0.9), r2v = rf(rng, 0.7, 0.9); const rp = 1 - (1 - r1) * (1 - r2v);
    return nat({ topic: "Parallel Reliability (2 units)", difficulty: "medium", marks: 2,
      stem: `Two components in parallel have reliabilities $${r1}$ and $${r2v}$. Find the system reliability. Round off to two decimal places.`, answer: rp, tolerance: 0.005,
      solution: solN("$R_p=1-(1-R_1)(1-R_2)$.", `$$R_p=1-(1-${r1})(1-${r2v})=${fmt(rp)}$$`, `$R_1=${r1},\\ R_2=${r2v}$.`, fmt(rp), r2(rp - 0.005), r2(rp + 0.005)) }); },
  (rng) => { const grade = rf(rng, 0.5, 2.5), price = ri(rng, 4000, 8000), recov = pick(rng, [85, 90, 92]), cost = ri(rng, 30, 70); const cog = cost * 100 / (price / 100 * recov / 100 * 100);
    const cutoff = cost / (price / 100 * recov / 100);
    return nat({ topic: "Cut-off Grade", difficulty: "hard", marks: 2,
      stem: `Metal price ₹$${price}\\,\\text{/kg}$, recovery $${recov}\\%$, production cost ₹$${cost}\\,\\text{/t}$. Find the cut-off grade (% metal). Round off to two decimal places.`, answer: cutoff, tolerance: 0.02,
      solution: solN("cog $=\\dfrac{\\text{cost/t}}{\\text{price/kg}\\times\\text{recovery}\\times10}$ (% metal).", `$$g_c=\\frac{${cost}}{${price}/100\\times${recov}/100}=${fmt(cutoff)}\\%$$`, `cost $=${cost},\\ price=${price}$.`, fmt(cutoff), r2(cutoff - 0.02), r2(cutoff + 0.02)) }); },
];

/* ---------------- Archetype B — vintage PYQ re-parameterised -------- */
const B = [
  (rng) => { const A0 = ri(rng, 100, 300), i = pick(rng, [8, 10, 12]), n = ri(rng, 4, 8); const f = ((1 + i / 100) ** n - 1) / (i / 100); const F = A0 * f;
    return nat({ topic: "Uniform Series — Future Worth", difficulty: "hard", marks: 2,
      stem: `An annual deposit of ₹$${A0}$ lakh earns $${i}\\%$ for $${n}$ years. Find the accumulated future worth (₹ lakh). Round off to two decimal places.`, answer: F, tolerance: 0.5,
      solution: solN("$F=A\\dfrac{(1+i)^n-1}{i}$.", `$$F=${A0}\\times\\frac{(1+${i / 100})^{${n}}-1}{${i / 100}}=${fmt(F)}$$`, `$A=${A0},\\ i=${i}\\%,\\ n=${n}$.`, fmt(F), r2(F - 0.5), r2(F + 0.5)) }); },
  (rng) => { const P = ri(rng, 500, 2000), i = pick(rng, [8, 10, 12]), n = ri(rng, 4, 8); const crf = (i / 100) * (1 + i / 100) ** n / ((1 + i / 100) ** n - 1); const A0 = P * crf;
    return nat({ topic: "Capital Recovery (EAC)", difficulty: "hard", marks: 2,
      stem: `A loan of ₹$${P}$ lakh at $${i}\\%$ is repaid over $${n}$ equal yearly instalments. Find each instalment (₹ lakh). Round off to two decimal places.`, answer: A0, tolerance: 0.1,
      solution: solN("$A=P\\dfrac{i(1+i)^n}{(1+i)^n-1}$.", `$$A=${P}\\times${r2(crf)}=${fmt(A0)}$$`, `$P=${P},\\ i=${i}\\%,\\ n=${n}$.`, fmt(A0), r2(A0 - 0.1), r2(A0 + 0.1)) }); },
  (rng) => { const I = ri(rng, 800, 2000), cf = ri(rng, 200, 500), i = pick(rng, [10, 12]), n = ri(rng, 4, 6);
    const pwf = (1 - (1 + i / 100) ** -n) / (i / 100); const npv = cf * pwf - I;
    return nat({ topic: "NPV of Uniform Cash Flow", difficulty: "hard", marks: 2,
      stem: `Investment ₹$${I}$ lakh returns ₹$${cf}$ lakh/yr for $${n}$ yr at $${i}\\%$. Find the NPV (₹ lakh). Round off to two decimal places.`, answer: npv, tolerance: 0.5,
      solution: solN("$NPV=A\\cdot\\frac{1-(1+i)^{-n}}{i}-I$.", `$$NPV=${cf}\\times${r2(pwf)}-${I}=${fmt(npv)}$$`, `$I=${I},\\ A=${cf}$.`, fmt(npv), r2(npv - 0.5), r2(npv + 0.5)) }); },
  (rng) => { const cost = ri(rng, 1000, 3000), rate = pick(rng, [20, 25, 30]); const y1 = cost * rate / 100, y2 = (cost - y1) * rate / 100;
    return nat({ topic: "Declining Balance Depreciation", difficulty: "medium", marks: 2,
      stem: `An asset costing ₹$${cost}$ lakh depreciates at $${rate}\\%$ (declining balance). Find the year-2 depreciation (₹ lakh). Round off to two decimal places.`, answer: y2, tolerance: 0.05,
      solution: solN("$D_2=(C-D_1)\\times r$.", `$$D_1=${r2(y1)},\\ D_2=(${cost}-${r2(y1)})${rate / 100}=${fmt(y2)}$$`, `$C=${cost},\\ r=${rate}\\%$.`, fmt(y2), r2(y2 - 0.05), r2(y2 + 0.05)) }); },
  (rng) => { const reserve = ri(rng, 10, 40), rate = rf(rng, 1.5, 4); const life = reserve / rate;
    return nat({ topic: "Mine Life (Taylor-style)", difficulty: "medium", marks: 2,
      stem: `A deposit holds $${reserve}\\,\\text{Mt}$ minable at $${rate}\\,\\text{Mt/yr}$. Find the mine life (yr). Round off to two decimal places.`, answer: life, tolerance: 0.05,
      solution: solN("life $=$ reserve $/$ rate.", `$$L=\\frac{${reserve}}{${rate}}=${fmt(life)}\\ \\text{yr}$$`, `reserve $=${reserve},\\ rate=${rate}$.`, fmt(life), r2(life - 0.05), r2(life + 0.05)) }); },
  (rng) => { const arr = rf(rng, 4, 9), serv = rf(rng, 10, 16); const rho = arr / serv; const Lq = rho ** 2 / (1 - rho);
    return nat({ topic: "M/M/1 Queue — Lq", difficulty: "hard", marks: 2,
      stem: `Trucks arrive at a crusher at $${arr}\\,\\text{/h}$; service rate $${serv}\\,\\text{/h}$ (M/M/1). Find the average queue length $L_q$. Round off to two decimal places.`, answer: Lq, tolerance: 0.05,
      solution: solN("$\\rho=\\lambda/\\mu$, $L_q=\\rho^2/(1-\\rho)$.", `$$\\rho=${r2(rho)},\\ L_q=\\frac{${r2(rho)}^2}{1-${r2(rho)}}=${fmt(Lq)}$$`, `$\\lambda=${arr},\\ \\mu=${serv}$.`, fmt(Lq), r2(Lq - 0.05), r2(Lq + 0.05)) }); },
  (rng) => { const arr = rf(rng, 4, 9), serv = rf(rng, 10, 16); const rho = arr / serv; const Ws = 1 / (serv - arr);
    return nat({ topic: "M/M/1 Queue — System Time", difficulty: "hard", marks: 2,
      stem: `With arrival $${arr}\\,\\text{/h}$ and service $${serv}\\,\\text{/h}$ (M/M/1), find the average time in system $W_s$ (h). Round off to two decimal places.`, answer: Ws, tolerance: 0.02,
      solution: solN("$W_s=1/(\\mu-\\lambda)$.", `$$W_s=\\frac{1}{${serv}-${arr}}=${fmt(Ws)}\\ \\text{h}$$`, `$\\lambda=${arr},\\ \\mu=${serv}$.`, fmt(Ws), r2(Ws - 0.02), r2(Ws + 0.02)) }); },
  (rng) => { const fixed = ri(rng, 100, 400), price = rf(rng, 40, 90), varc = rf(rng, 15, 30), q = ri(rng, 30000, 90000);
    const profit = (price - varc) * q - fixed * 1e5;
    return nat({ topic: "Profit at Output", difficulty: "medium", marks: 2,
      stem: `Fixed cost ₹$${fixed}$ lakh, contribution ₹$${r2(price - varc)}\\,\\text{/t}$, output $${q}\\,\\text{t}$. Find the profit (₹ lakh). Round off to two decimal places.`, answer: r2(profit / 1e5), tolerance: 0.1,
      solution: solN("profit $=$ contribution$\\times Q-$ fixed.", `$$\\pi=\\frac{${r2(price - varc)}\\times${q}-${fixed}\\times10^5}{10^5}=${fmt(profit / 1e5)}$$`, `$Q=${q}$.`, fmt(profit / 1e5), r2(profit / 1e5 - 0.1), r2(profit / 1e5 + 0.1)) }); },
];

/* ---------------- Archetype C — diagrammatic (every Q has a figure) -- */
const C = [
  (rng) => { const flows = [-(ri(rng, 500, 1000)), ri(rng, 150, 300), ri(rng, 150, 300), ri(rng, 150, 300), ri(rng, 150, 300)];
    const i = pick(rng, [10, 12]); const npv = flows.reduce((a, f, k) => a + f / (1 + i / 100) ** k, 0);
    return nat({ topic: "Cash-Flow Diagram — NPV", difficulty: "hard", marks: 2,
      stem: `From the cash-flow diagram, compute the NPV at $${i}\\%$ (₹ lakh). Round off to two decimal places.`, answer: r2(npv), tolerance: 0.5,
      figure: svgCashFlow({ flows, caption: `discount ${i}%`, unit: "₹ lakh" }),
      solution: solN("Discount each flow to year 0 and sum.", `$$NPV=\\sum_{k}\\frac{CF_k}{(1+${i / 100})^k}=${fmt(npv)}$$`, `flows shown.`, fmt(npv), r2(npv - 0.5), r2(npv + 0.5)) }); },
  (rng) => { const flows = [-(ri(rng, 400, 800)), ri(rng, 200, 350), ri(rng, 200, 350), ri(rng, 200, 350)]; const undisc = flows.reduce((a, b) => a + b, 0);
    return nat({ topic: "Cash-Flow — Net Undiscounted", difficulty: "easy", marks: 1,
      stem: `From the diagram, find the net undiscounted cash flow over the project (₹ lakh). Round off to two decimal places.`, answer: undisc, tolerance: 0.5,
      figure: svgCashFlow({ flows, caption: "undiscounted", unit: "₹ lakh" }),
      solution: solN("Sum all the arrows (signed).", `$$\\Sigma CF=${flows.join("+").replace(/\+-/g, "-")}=${fmt(undisc)}$$`, `flows shown.`, fmt(undisc), r2(undisc - 0.5), r2(undisc + 0.5)) }); },
  (rng) => { const durs = [ri(rng, 2, 5), ri(rng, 3, 6), ri(rng, 2, 4), ri(rng, 4, 7)]; const cp = durs[0] + durs[1] + durs[3];
    return nat({ topic: "CPM — Critical Path Length", difficulty: "hard", marks: 2,
      stem: `For the network shown, path 1→2→3→5 has durations $${durs[0]},${durs[1]},${durs[3]}$ days. Find that path's total duration (days). Round off to two decimal places.`, answer: cp, tolerance: 0.5,
      figure: svgCPM({ nodes: [{ id: 1, x: 40, y: 100 }, { id: 2, x: 150, y: 50 }, { id: 3, x: 150, y: 150 }, { id: 5, x: 300, y: 100 }], edges: [{ from: 1, to: 2, dur: durs[0] }, { from: 2, to: 5, dur: durs[1] }, { from: 1, to: 3, dur: durs[2] }, { from: 3, to: 5, dur: durs[3] }], caption: "CPM network" }),
      solution: solN("Sum the durations along the path.", `$$T=${durs[0]}+${durs[1]}+${durs[3]}=${fmt(cp)}\\ \\text{days}$$`, `path 1→2→5.`, fmt(cp), r2(cp - 0.5), r2(cp + 0.5)) }); },
  (rng) => { const r1 = rf(rng, 0.88, 0.97), r2v = rf(rng, 0.88, 0.97), r3 = rf(rng, 0.88, 0.97); const rs = r1 * r2v * r3;
    return nat({ topic: "Reliability — Series System", difficulty: "medium", marks: 2,
      stem: `Three units in series (see block diagram) have reliabilities $${r1}, ${r2v}, ${r3}$. Find the system reliability. Round off to two decimal places.`, answer: r2(rs), tolerance: 0.005,
      figure: svgReliability({ blocks: [{ label: "A", r: r1 }, { label: "B", r: r2v }, { label: "C", r: r3 }], mode: "series", caption: "Series system" }),
      solution: solN("$R_s=\\prod R_i$.", `$$R_s=${r1}\\times${r2v}\\times${r3}=${fmt(rs)}$$`, `series.`, fmt(rs), r2(rs - 0.005), r2(rs + 0.005)) }); },
  (rng) => { const r1 = rf(rng, 0.7, 0.88), r2v = rf(rng, 0.7, 0.88); const rp = 1 - (1 - r1) * (1 - r2v);
    return nat({ topic: "Reliability — Parallel System", difficulty: "medium", marks: 2,
      stem: `Two units in parallel (block diagram) have reliabilities $${r1}$ and $${r2v}$. Find the system reliability. Round off to two decimal places.`, answer: r2(rp), tolerance: 0.005,
      figure: svgReliability({ blocks: [{ label: "A", r: r1 }, { label: "B", r: r2v }], mode: "parallel", caption: "Parallel system" }),
      solution: solN("$R_p=1-\\prod(1-R_i)$.", `$$R_p=1-(1-${r1})(1-${r2v})=${fmt(rp)}$$`, `parallel.`, fmt(rp), r2(rp - 0.005), r2(rp + 0.005)) }); },
  (rng) => { const prod = [ri(rng, 2, 4), ri(rng, 3, 5), ri(rng, 4, 6), ri(rng, 5, 7), ri(rng, 4, 6)]; const tot = prod.reduce((a, b) => a + b, 0);
    return nat({ topic: "Production Schedule — Total", difficulty: "easy", marks: 1,
      stem: `The bar chart shows yearly production (Mt) over the mine plan. Find the total tonnage (Mt). Round off to two decimal places.`, answer: tot, tolerance: 0.1,
      figure: svgBar({ labels: ["Y1", "Y2", "Y3", "Y4", "Y5"], values: prod, caption: "Production plan", title: "Mt/yr" }),
      solution: solN("Sum the bars.", `$$\\Sigma=${prod.join("+")}=${fmt(tot)}$$`, `5 years.`, fmt(tot), r2(tot - 0.1), r2(tot + 0.1)) }); },
  (rng) => { const cumP = [-(ri(rng, 600, 900))]; for (let k = 1; k <= 5; k++) cumP.push(r2(cumP[k - 1] + ri(rng, 200, 300))); let payIdx = cumP.findIndex((v) => v >= 0); payIdx = payIdx < 0 ? 5 : payIdx;
    return nat({ topic: "Cumulative Cash Flow — Payback Year", difficulty: "hard", marks: 2,
      stem: `The cumulative cash-flow curve crosses zero. Read the discrete payback year (first year cumulative $\\ge0$). Round off to two decimal places.`, answer: payIdx, tolerance: 0.5,
      figure: svgLine({ series: [{ points: cumP.map((v, i) => [i, v]), color: "#2563eb", dots: true, label: "cum CF" }], xlabel: "year", ylabel: "cum ₹ lakh", caption: "Cumulative cash flow" }),
      solution: solN("Find the first year where cumulative cash flow turns non-negative.", `$$\\text{payback year}=${payIdx}$$`, `curve crosses 0.`, fmt(payIdx), payIdx - 0.5, payIdx + 0.5) }); },
  (rng) => { const fixed = ri(rng, 100, 300), price = rf(rng, 50, 90), varc = rf(rng, 20, 35); const beq = r2(fixed * 1e5 / (price - varc));
    const qs = [0, beq * 0.5, beq, beq * 1.5];
    return nat({ topic: "Break-Even Chart — BEQ", difficulty: "medium", marks: 2,
      stem: `Revenue and total-cost lines intersect at break-even. With fixed cost ₹$${fixed}$ lakh, price ₹$${price}\\,\\text{/t}$, variable ₹$${varc}\\,\\text{/t}$, find the break-even output (t). Round off to two decimal places.`, answer: beq, tolerance: 1,
      figure: svgLine({ series: [{ points: qs.map((q) => [r2(q / 1000), r2((price * q) / 1e5)]), color: "#16a34a", label: "revenue" }, { points: qs.map((q) => [r2(q / 1000), r2((fixed * 1e5 + varc * q) / 1e5)]), color: "#dc2626", label: "total cost" }], xlabel: "output (kt)", ylabel: "₹ lakh", caption: "Break-even chart" }),
      solution: solN("BEQ $=$ fixed $/$ (price $-$ variable).", `$$Q=\\frac{${fixed}\\times10^5}{${price}-${varc}}=${fmt(beq)}$$`, `lines cross here.`, fmt(beq), r2(beq - 1), r2(beq + 1)) }); },
  (rng) => { const durs = [ri(rng, 3, 6), ri(rng, 2, 5), ri(rng, 4, 7)]; const total = durs[0] + durs[2];
    return nat({ topic: "CPM — Serial Chain Duration", difficulty: "medium", marks: 2,
      stem: `In the network, activities A(1→2)=$${durs[0]}$ and C(2→3)=$${durs[2]}$ days lie on the longest chain. Find the project duration (days). Round off to two decimal places.`, answer: total, tolerance: 0.5,
      figure: svgCPM({ nodes: [{ id: 1, x: 40, y: 100 }, { id: 2, x: 180, y: 100 }, { id: 3, x: 320, y: 100 }], edges: [{ from: 1, to: 2, dur: durs[0] }, { from: 2, to: 3, dur: durs[2] }], caption: "Serial network" }),
      solution: solN("Add the serial durations.", `$$T=${durs[0]}+${durs[2]}=${fmt(total)}$$`, `A then C.`, fmt(total), r2(total - 0.5), r2(total + 0.5)) }); },
  (rng) => { const r1 = rf(rng, 0.8, 0.95), r2v = rf(rng, 0.75, 0.9), r3 = rf(rng, 0.8, 0.95); const rpar = 1 - (1 - r2v) * (1 - r2v); const rsys = r1 * rpar * r3;
    return nat({ topic: "Reliability — Mixed (parallel pair)", difficulty: "hard", marks: 2,
      stem: `A pair of identical units ($R=${r2v}$) operate in parallel between two series units ($${r1}$ and $${r3}$). Find the overall system reliability. Round off to two decimal places.`, answer: r2(rsys), tolerance: 0.005,
      figure: svgReliability({ blocks: [{ label: "B1", r: r2v }, { label: "B2", r: r2v }], mode: "parallel", caption: "Redundant pair" }),
      solution: solN("Parallel pair $R_p=1-(1-R)^2$; multiply by series units.", `$$R_p=1-(1-${r2v})^2=${r2(rpar)};\\ R=${r1}\\times${r2(rpar)}\\times${r3}=${fmt(rsys)}$$`, `mixed.`, fmt(rsys), r2(rsys - 0.005), r2(rsys + 0.005)) }); },
  (rng) => { const grades = [rf(rng, 0.4, 0.8), rf(rng, 0.8, 1.4), rf(rng, 1.4, 2.0), rf(rng, 2.0, 2.6)]; const avg = r2(grades.reduce((a, b) => a + b, 0) / 4);
    return nat({ topic: "Grade-Tonnage — Mean Grade", difficulty: "medium", marks: 2,
      stem: `The bar chart shows average grade (%) of four blocks. Find the mean grade across blocks. Round off to two decimal places.`, answer: avg, tolerance: 0.02,
      figure: svgBar({ labels: ["B1", "B2", "B3", "B4"], values: grades, caption: "Block grades", title: "% metal" }),
      solution: solN("Average the four grades.", `$$\\bar g=\\frac{${grades.join("+")}}{4}=${fmt(avg)}$$`, `four blocks.`, fmt(avg), r2(avg - 0.02), r2(avg + 0.02)) }); },
  (rng) => { const i = pick(rng, [10, 12, 15]); const cf = ri(rng, 150, 300); const yrs = [1, 2, 3, 4, 5]; const pv = yrs.map((y) => r2(cf / (1 + i / 100) ** y)); const idx = ri(rng, 0, 4);
    return nat({ topic: "Discount Factor Curve — PV", difficulty: "hard", marks: 2,
      stem: `A constant ₹$${cf}$ lakh/yr is discounted at $${i}\\%$. From the curve, read the present value of the year-$${yrs[idx]}$ flow (₹ lakh). Round off to two decimal places.`, answer: pv[idx], tolerance: 0.1,
      figure: svgLine({ series: [{ points: yrs.map((y, k) => [y, pv[k]]), color: "#7c3aed", dots: true, label: "PV" }], xlabel: "year", ylabel: "PV ₹ lakh", caption: "Discounted flows" }),
      solution: solN("$PV=CF/(1+i)^n$.", `$$PV=\\frac{${cf}}{(1+${i / 100})^{${yrs[idx]}}}=${fmt(pv[idx])}$$`, `$i=${i}\\%$.`, fmt(pv[idx]), r2(pv[idx] - 0.1), r2(pv[idx] + 0.1)) }); },
];

/* ---------------- Archetype D — rank determinator (multi-stage) ----- */
const D = [
  (rng) => { const I = ri(rng, 1000, 2500), cf = ri(rng, 250, 500), n = ri(rng, 5, 8), i = pick(rng, [10, 12, 15]);
    const pwf = (1 - (1 + i / 100) ** -n) / (i / 100); const npv = r2(cf * pwf - I);
    return nat({ topic: "Project NPV — Annuity", difficulty: "hard", marks: 2,
      stem: `A mine needs ₹$${I}$ lakh now, returns ₹$${cf}$ lakh/yr for $${n}$ yr; MARR $${i}\\%$. Find the NPV (₹ lakh). Round off to two decimal places.`, answer: npv, tolerance: 0.5,
      solution: solN("$NPV=A\\frac{1-(1+i)^{-n}}{i}-I$.", `$$NPV=${cf}\\times${r2(pwf)}-${I}=${fmt(npv)}$$`, `$I=${I},\\ A=${cf}$.`, fmt(npv), r2(npv - 0.5), r2(npv + 0.5)) }); },
  (rng) => { const I = ri(rng, 800, 1500), cf = ri(rng, 300, 500), n = 4;
    // IRR by bisection
    const npvAt = (r) => -I + cf * (1 - (1 + r) ** -n) / r;
    let lo = 0.01, hi = 1; for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (npvAt(mid) > 0) lo = mid; else hi = mid; } const irr = r2((lo + hi) / 2 * 100);
    return nat({ topic: "IRR — 4-Year Annuity", difficulty: "hard", marks: 2,
      stem: `Investment ₹$${I}$ lakh yields ₹$${cf}$ lakh/yr for 4 yr. Find the IRR (%). Round off to two decimal places.`, answer: irr, tolerance: 0.3,
      solution: solN("IRR solves $-I+A\\frac{1-(1+r)^{-n}}{r}=0$ (numerically).", `$$\\text{IRR}\\approx${fmt(irr)}\\%$$`, `$I=${I},\\ A=${cf}$.`, fmt(irr), r2(irr - 0.3), r2(irr + 0.3)) }); },
  (rng) => { const fixed = ri(rng, 150, 400), price = rf(rng, 60, 110), varc = rf(rng, 25, 45), target = ri(rng, 50, 120);
    const q = r2((fixed * 1e5 + target * 1e5) / (price - varc));
    return nat({ topic: "Output for Target Profit", difficulty: "hard", marks: 2,
      stem: `Fixed cost ₹$${fixed}$ lakh, contribution ₹$${r2(price - varc)}\\,\\text{/t}$. Find the output (t) needed for a profit of ₹$${target}$ lakh. Round off to two decimal places.`, answer: q, tolerance: 1,
      solution: solN("$Q=\\frac{(FC+\\text{target})}{\\text{contribution}}$.", `$$Q=\\frac{(${fixed}+${target})\\times10^5}{${r2(price - varc)}}=${fmt(q)}$$`, `target $=${target}$ lakh.`, fmt(q), r2(q - 1), r2(q + 1)) }); },
  (rng) => { const I = ri(rng, 1000, 2000), cf = ri(rng, 200, 400), n = ri(rng, 6, 9), i = pick(rng, [10, 12]);
    let cum = -I, yr = 0, disc = 0; for (let k = 1; k <= n; k++) { disc = cf / (1 + i / 100) ** k; cum += disc; if (cum >= 0 && yr === 0) yr = k; } if (yr === 0) yr = n;
    return nat({ topic: "Discounted Payback Period", difficulty: "hard", marks: 2,
      stem: `Investment ₹$${I}$ lakh, ₹$${cf}$ lakh/yr at $${i}\\%$. Find the discounted payback (whole years, first year cumulative DCF $\\ge0$). Round off to two decimal places.`, answer: yr, tolerance: 0.5,
      solution: solN("Accumulate discounted flows until $\\ge$ investment.", `$$\\text{discounted payback}=${yr}\\ \\text{yr}$$`, `$I=${I},\\ A=${cf}$.`, fmt(yr), yr - 0.5, yr + 0.5) }); },
  (rng) => { const rA = rf(rng, 0.85, 0.95), rB = rf(rng, 0.8, 0.92), rC = rf(rng, 0.85, 0.95);
    const rBpar = 1 - (1 - rB) ** 2; const rsys = r2(rA * rBpar * rC);
    return nat({ topic: "System Reliability — Redundancy Design", difficulty: "hard", marks: 2,
      stem: `A conveyor system: drive ($R=${rA}$) in series with two redundant gearboxes ($R=${rB}$ each, parallel) in series with a discharge unit ($R=${rC}$). Find the system reliability. Round off to two decimal places.`, answer: rsys, tolerance: 0.005,
      solution: solN("$R=R_A[1-(1-R_B)^2]R_C$.", `$$R=${rA}\\times[1-(1-${rB})^2]\\times${rC}=${fmt(rsys)}$$`, `mixed system.`, fmt(rsys), r2(rsys - 0.005), r2(rsys + 0.005)) }); },
  (rng) => { const price = ri(rng, 5000, 9000), recov = pick(rng, [85, 90, 92]), mineCost = ri(rng, 30, 60), procCost = ri(rng, 20, 50);
    const totCost = mineCost + procCost; const cutoff = r2(totCost / (price / 100 * recov / 100));
    return nat({ topic: "Cut-off Grade — Combined Cost", difficulty: "hard", marks: 2,
      stem: `Mining ₹$${mineCost}\\,\\text{/t}$, processing ₹$${procCost}\\,\\text{/t}$, metal ₹$${price}\\,\\text{/kg}$, recovery $${recov}\\%$. Find the break-even cut-off grade (% metal). Round off to two decimal places.`, answer: cutoff, tolerance: 0.02,
      solution: solN("$g_c=\\dfrac{C_{mine}+C_{proc}}{\\text{price/kg}\\times\\text{recovery}\\times10}$.", `$$g_c=\\frac{${totCost}}{${price}/100\\times${recov}/100}=${fmt(cutoff)}\\%$$`, `cost $=${totCost}$.`, fmt(cutoff), r2(cutoff - 0.02), r2(cutoff + 0.02)) }); },
  (rng) => { const arr = rf(rng, 5, 9), serv = rf(rng, 11, 16); const rho = arr / serv; const Ls = rho / (1 - rho); const idle = 1 - rho;
    return nat({ topic: "Queue — Utilisation & Length", difficulty: "hard", marks: 2,
      stem: `A shovel-truck system (M/M/1): arrival $${arr}\\,\\text{/h}$, service $${serv}\\,\\text{/h}$. Find the expected number in system $L_s$. Round off to two decimal places.`, answer: r2(Ls), tolerance: 0.05,
      solution: solN("$\\rho=\\lambda/\\mu$, $L_s=\\rho/(1-\\rho)$.", `$$\\rho=${r2(rho)},\\ L_s=\\frac{${r2(rho)}}{1-${r2(rho)}}=${fmt(Ls)}$$`, `$\\lambda=${arr},\\ \\mu=${serv}$.`, fmt(Ls), r2(Ls - 0.05), r2(Ls + 0.05)) }); },
  (rng) => { const c1 = ri(rng, 40, 70), c2 = ri(rng, 30, 60), b1 = ri(rng, 6, 10), b2 = ri(rng, 5, 9), cap = ri(rng, 40, 60);
    // maximize c1*x1 + c2*x2 s.t. x1+x2<=cap, evaluate corner choosing higher unit profit
    const best = c1 >= c2 ? c1 * cap : c2 * cap;
    return nat({ topic: "LP — Single-Constraint Optimum", difficulty: "hard", marks: 2,
      stem: `Two ore types give ₹$${c1}$ and ₹$${c2}$ profit/t; combined hoisting limit $${cap}\\,\\text{t}$. With only this constraint, find the maximum profit (₹). Round off to two decimal places.`, answer: best, tolerance: 0.5,
      solution: solN("Allocate all capacity to the higher unit-profit ore.", `$$\\max=${Math.max(c1, c2)}\\times${cap}=${fmt(best)}$$`, `pick higher margin.`, fmt(best), r2(best - 0.5), r2(best + 0.5)) }); },
  (rng) => { const opt = ri(rng, 8, 14), ml = ri(rng, 14, 22), pess = ri(rng, 24, 36); const te = (opt + 4 * ml + pess) / 6; const sd = (pess - opt) / 6;
    return nat({ topic: "PERT — Expected Activity Time", difficulty: "medium", marks: 2,
      stem: `A PERT activity has optimistic $${opt}$, most-likely $${ml}$, pessimistic $${pess}$ days. Find the expected time $t_e$ (days). Round off to two decimal places.`, answer: r2(te), tolerance: 0.05,
      solution: solN("$t_e=(a+4m+b)/6$.", `$$t_e=\\frac{${opt}+4(${ml})+${pess}}{6}=${fmt(te)}$$`, `$a=${opt},m=${ml},b=${pess}$.`, fmt(te), r2(te - 0.05), r2(te + 0.05)) }); },
  (rng) => { const opt = ri(rng, 8, 14), ml = ri(rng, 14, 22), pess = ri(rng, 24, 36); const variance = ((pess - opt) / 6) ** 2;
    return nat({ topic: "PERT — Activity Variance", difficulty: "medium", marks: 2,
      stem: `For a PERT activity (optimistic $${opt}$, pessimistic $${pess}$ days), find the variance $\\sigma^2=((b-a)/6)^2$. Round off to two decimal places.`, answer: r2(variance), tolerance: 0.05,
      solution: solN("$\\sigma^2=((b-a)/6)^2$.", `$$\\sigma^2=\\left(\\frac{${pess}-${opt}}{6}\\right)^2=${fmt(variance)}$$`, `$a=${opt},b=${pess}$.`, fmt(variance), r2(variance - 0.05), r2(variance + 0.05)) }); },
  (rng) => { const cost = ri(rng, 1500, 3000), salv = ri(rng, 100, 300), life = ri(rng, 6, 10), yr = ri(rng, 2, 5);
    const sum = life * (life + 1) / 2; const dep = (life - yr + 1) / sum * (cost - salv);
    return nat({ topic: "Sum-of-Years-Digits Depreciation", difficulty: "hard", marks: 2,
      stem: `Asset cost ₹$${cost}$ lakh, salvage ₹$${salv}$ lakh, life $${life}$ yr. Using SYD, find the year-$${yr}$ depreciation (₹ lakh). Round off to two decimal places.`, answer: r2(dep), tolerance: 0.05,
      solution: solN("$D_t=\\frac{n-t+1}{\\sum}\\,(C-S)$.", `$$D_${yr}=\\frac{${life}-${yr}+1}{${sum}}(${cost}-${salv})=${fmt(dep)}$$`, `$n=${life},t=${yr}$.`, fmt(dep), r2(dep - 0.05), r2(dep + 0.05)) }); },
];

export default { slug: "mine-economics-planning", name: SUB, subjectTag: SUB, pools: { A, B, C, D } };
