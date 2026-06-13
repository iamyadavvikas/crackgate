/** Engineering Mathematics — 175-question template pools (A30/B30/C60/D55). */
import { mcq, nat, r2, deg, rad, fmt, solN, solC, numMCQ, svgLine, svgBar, figSvg } from "../build_practice_bank.mjs";

const SUB = "Engineering Mathematics";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const a = ri(rng, 2, 9), b = ri(rng, 3, 19), c = b + a * ri(rng, 2, 12); const x = (c - b) / a;
    return nat({ topic: "Linear Algebra — System of Equations", difficulty: "easy", marks: 1,
      stem: `Solve for $x$: $${a}x + ${b} = ${c}$. Round off to two decimal places.`, answer: x, tolerance: 0.01,
      solution: solN("Isolate the variable by inverse operations; do not divide before subtracting the constant.", `$$x=\\frac{${c}-${b}}{${a}}=${fmt(x)}$$`, `$a=${a},\\ b=${b},\\ c=${c}$.`, fmt(x), r2(x - 0.01), r2(x + 0.01)) }); },
  (rng) => { const a = ri(rng, 2, 7), b = ri(rng, 1, 9), x0 = ri(rng, 1, 4); const dy = 2 * a * x0 + b;
    return nat({ topic: "Calculus — Differentiation", difficulty: "easy", marks: 1,
      stem: `For $y=${a}x^{2}+${b}x$, evaluate $\\dfrac{dy}{dx}$ at $x=${x0}$. Round off to two decimal places.`, answer: dy, tolerance: 0.01,
      solution: solN("Differentiate term-by-term using the power rule, then substitute.", `$$\\frac{dy}{dx}=${2 * a}x+${b}\\Big|_{x=${x0}}=${fmt(dy)}$$`, `$y=${a}x^2+${b}x,\\ x=${x0}$.`, fmt(dy), r2(dy - 0.01), r2(dy + 0.01)) }); },
  (rng) => { const a = ri(rng, 2, 6), b = ri(rng, 1, 8), u = ri(rng, 2, 6); const I = a * u * u / 2 + b * u;
    return nat({ topic: "Calculus — Definite Integration", difficulty: "medium", marks: 2,
      stem: `Evaluate $\\displaystyle\\int_{0}^{${u}}(${a}x+${b})\\,dx$. Round off to two decimal places.`, answer: I, tolerance: 0.05,
      solution: solN("Integrate the linear integrand and apply the limits.", `$$\\int_0^{${u}}(${a}x+${b})dx=\\Big[\\tfrac{${a}}{2}x^2+${b}x\\Big]_0^{${u}}=${fmt(I)}$$`, `$a=${a},\\ b=${b},\\ \\text{upper}=${u}$.`, fmt(I), r2(I - 0.05), r2(I + 0.05)) }); },
  (rng) => { const a = ri(rng, 1, 6), b = ri(rng, 1, 6), c = ri(rng, 1, 6), d = ri(rng, 2, 7); const det = a * d - b * c;
    return nat({ topic: "Linear Algebra — Determinant", difficulty: "easy", marks: 1,
      stem: `Find the determinant of $\\begin{bmatrix}${a}&${b}\\\\${c}&${d}\\end{bmatrix}$. Round off to two decimal places.`, answer: det, tolerance: 0.01,
      solution: solN("For a $2\\times2$ matrix the determinant is the difference of diagonal products.", `$$\\det=ad-bc=(${a})(${d})-(${b})(${c})=${fmt(det)}$$`, `Entries as shown.`, fmt(det), r2(det - 0.01), r2(det + 0.01)) }); },
  (rng) => { // larger eigenvalue, ensure real
    let a, b, c, d, T, Δ, disc;
    do { a = ri(rng, 2, 6); b = ri(rng, 1, 4); c = ri(rng, 1, 4); d = ri(rng, 2, 6); T = a + d; Δ = a * d - b * c; disc = T * T - 4 * Δ; } while (disc < 0);
    const lam = (T + Math.sqrt(disc)) / 2;
    return nat({ topic: "Linear Algebra — Eigenvalues", difficulty: "medium", marks: 2,
      stem: `Find the larger eigenvalue of $\\begin{bmatrix}${a}&${b}\\\\${c}&${d}\\end{bmatrix}$. Round off to two decimal places.`, answer: lam, tolerance: 0.02,
      solution: solN("Eigenvalues satisfy $\\lambda^2-T\\lambda+\\Delta=0$ with $T=$ trace, $\\Delta=$ determinant.", `$$\\lambda=\\frac{T\\pm\\sqrt{T^2-4\\Delta}}{2}=\\frac{${T}\\pm\\sqrt{${disc}}}{2}=${fmt(lam)}$$`, `$T=${T},\\ \\Delta=${Δ}$.`, fmt(lam), r2(lam - 0.02), r2(lam + 0.02)) }); },
  (rng) => { const x = ri(rng, 1, 4), y = ri(rng, 1, 4), z = ri(rng, 1, 4), p = ri(rng, 1, 4), q = ri(rng, 1, 4), s = ri(rng, 1, 4);
    const dot = x * p + y * q + z * s; const m1 = Math.hypot(x, y, z), m2 = Math.hypot(p, q, s); const ang = deg(Math.acos(dot / (m1 * m2)));
    return nat({ topic: "Vector Calculus — Dot Product", difficulty: "medium", marks: 2,
      stem: `Find the angle (in degrees) between $\\vec{u}=(${x},${y},${z})$ and $\\vec{v}=(${p},${q},${s})$. Round off to two decimal places.`, answer: ang, tolerance: 0.1,
      solution: solN("The angle follows from $\\cos\\theta=\\dfrac{\\vec u\\cdot\\vec v}{|\\vec u||\\vec v|}$; the answer is required in degrees, not radians.", `$$\\theta=\\cos^{-1}\\!\\frac{${dot}}{${r2(m1)}\\times${r2(m2)}}=${fmt(ang)}^{\\circ}$$`, `$\\vec u\\cdot\\vec v=${dot},\\ |\\vec u|=${r2(m1)},\\ |\\vec v|=${r2(m2)}$.`, fmt(ang), r2(ang - 0.1), r2(ang + 0.1)) }); },
  (rng) => { const r = (ri(rng, 30, 140) / 100); const d = deg(r);
    const m = numMCQ({ rng, correct: d, traps: [r, r * 100, d / 2], unit: "°" });
    return mcq({ topic: "Trigonometry — Radian/Degree Conversion", difficulty: "easy", marks: 1,
      stem: `An angle measures $${r2(r)}$ radians. Express it in degrees.`, options: m.options, answer: m.answer,
      solution: solC("Multiply radians by $180/\\pi$; a common trap is to treat the radian value as degrees.", `$$${r2(r)}\\times\\frac{180}{\\pi}=${fmt(d)}^{\\circ}$$`, `$\\theta=${r2(r)}$ rad.`, `$${fmt(d)}^{\\circ}$ is correct.`) }); },
  (rng) => { const a = (ri(rng, 30, 90) / 100); const v = 1 + a + a * a / 2;
    return nat({ topic: "Calculus — Taylor/Maclaurin Series", difficulty: "medium", marks: 2,
      stem: `Using the first three terms of the Maclaurin series of $e^{x}$, estimate $e^{${r2(a)}}$. Round off to two decimal places.`, answer: v, tolerance: 0.02,
      solution: solN("$e^x=1+x+\\tfrac{x^2}{2!}+\\dots$; retain three terms.", `$$1+${r2(a)}+\\frac{${r2(a)}^2}{2}=${fmt(v)}$$`, `$x=${r2(a)}$.`, fmt(v), r2(v - 0.02), r2(v + 0.02)) }); },
];

/* ---------------- Archetype B — vintage PYQ variants ---------------- */
const B = [
  (rng) => { const y0 = ri(rng, 50, 200), k = (ri(rng, 5, 25) / 100), t = ri(rng, 2, 6); const y = y0 * Math.exp(k * t);
    return nat({ topic: "ODE — First-order Linear (Growth)", difficulty: "hard", marks: 2,
      stem: `A population obeys $\\dfrac{dy}{dt}=ky$ with $y(0)=${y0}$ and $k=${r2(k)}\\,\\text{yr}^{-1}$. Find $y$ at $t=${t}$ years. Round off to two decimal places.`, answer: y, tolerance: 0.5,
      solution: solN("The separable linear ODE integrates to an exponential.", `$$y=y_0e^{kt}=${y0}\\,e^{${r2(k)}\\times${t}}=${fmt(y)}$$`, `$y_0=${y0},\\ k=${r2(k)},\\ t=${t}$.`, fmt(y), r2(y - 0.5), r2(y + 0.5)) }); },
  (rng) => { const N = pick(rng, [10, 20, 30, 50, 75]); const x0 = Math.ceil(Math.sqrt(N)) + ri(rng, 1, 3); const x1 = x0 - (x0 * x0 - N) / (2 * x0);
    return nat({ topic: "Numerical Methods — Newton–Raphson", difficulty: "medium", marks: 2,
      stem: `Apply one Newton–Raphson iteration to $f(x)=x^{2}-${N}$ starting from $x_0=${x0}$. Find $x_1$. Round off to two decimal places.`, answer: x1, tolerance: 0.01,
      solution: solN("$x_{1}=x_0-\\dfrac{f(x_0)}{f'(x_0)}$ with $f'(x)=2x$.", `$$x_1=${x0}-\\frac{${x0}^2-${N}}{2(${x0})}=${fmt(x1)}$$`, `$N=${N},\\ x_0=${x0}$.`, fmt(x1), r2(x1 - 0.01), r2(x1 + 0.01)) }); },
  (rng) => { const h = pick(rng, [0.5, 1, 2]); const f = [ri(rng, 2, 8), ri(rng, 4, 12), ri(rng, 6, 16), ri(rng, 3, 10)];
    const I = h * ((f[0] + f[3]) / 2 + f[1] + f[2]);
    return nat({ topic: "Numerical Methods — Trapezoidal Rule", difficulty: "medium", marks: 2,
      stem: `Using the trapezoidal rule with $h=${h}$ and ordinates $${f.join(", ")}$, estimate the integral. Round off to two decimal places.`, answer: I, tolerance: 0.05,
      solution: solN("Half-weight the end ordinates, full-weight the interior, times the step.", `$$I=h\\Big[\\tfrac{y_0+y_n}{2}+\\Sigma y_{int}\\Big]=${h}[${(f[0] + f[3]) / 2}+${f[1] + f[2]}]=${fmt(I)}$$`, `$h=${h}$, ordinates $${f.join(",")}$.`, fmt(I), r2(I - 0.05), r2(I + 0.05)) }); },
  (rng) => { const h = pick(rng, [0.5, 1]); const y0 = ri(rng, 2, 6), y1 = ri(rng, 6, 14), y2 = ri(rng, 3, 9);
    const I = (h / 3) * (y0 + 4 * y1 + y2);
    return nat({ topic: "Numerical Methods — Simpson's 1/3 Rule", difficulty: "hard", marks: 2,
      stem: `Using Simpson's $1/3$ rule with $h=${h}$ and three ordinates $${y0}, ${y1}, ${y2}$, estimate the integral. Round off to two decimal places.`, answer: I, tolerance: 0.02,
      solution: solN("Simpson weights the middle ordinate by 4: $I=\\tfrac{h}{3}(y_0+4y_1+y_2)$.", `$$I=\\frac{${h}}{3}(${y0}+4\\times${y1}+${y2})=${fmt(I)}$$`, `$h=${h}$, ordinates $${y0},${y1},${y2}$.`, fmt(I), r2(I - 0.02), r2(I + 0.02)) }); },
  (rng) => { const n = ri(rng, 4, 8), k = ri(rng, 1, 3), p = pick(rng, [0.2, 0.3, 0.4, 0.5]);
    const comb = factC(n, k); const P = comb * Math.pow(p, k) * Math.pow(1 - p, n - k);
    return nat({ topic: "Probability — Binomial Distribution", difficulty: "medium", marks: 2,
      stem: `In $n=${n}$ independent trials with success probability $p=${p}$, find $P(X=${k})$. Round off to two decimal places.`, answer: P, tolerance: 0.01,
      solution: solN("Binomial: $P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}$.", `$$P=\\binom{${n}}{${k}}${p}^{${k}}(${1 - p})^{${n - k}}=${fmt(P)}$$`, `$n=${n},\\ k=${k},\\ p=${p}$.`, fmt(P), r2(P - 0.01), r2(P + 0.01)) }); },
  (rng) => { const lam = pick(rng, [1, 1.5, 2, 2.5, 3]), k = ri(rng, 1, 3);
    const P = Math.exp(-lam) * Math.pow(lam, k) / fact(k);
    return nat({ topic: "Probability — Poisson Distribution", difficulty: "medium", marks: 2,
      stem: `Equipment failures follow a Poisson law with mean $\\lambda=${lam}$ per shift. Find $P(X=${k})$ in a shift. Round off to two decimal places.`, answer: P, tolerance: 0.01,
      solution: solN("Poisson: $P(X=k)=e^{-\\lambda}\\lambda^{k}/k!$.", `$$P=e^{-${lam}}\\frac{${lam}^{${k}}}{${k}!}=${fmt(P)}$$`, `$\\lambda=${lam},\\ k=${k}$.`, fmt(P), r2(P - 0.01), r2(P + 0.01)) }); },
  (rng) => { const mu = ri(rng, 40, 70), sig = ri(rng, 4, 10), x = mu + ri(rng, -20, 20); const z = (x - mu) / sig;
    return nat({ topic: "Probability — Normal Distribution (z-score)", difficulty: "medium", marks: 2,
      stem: `A normal variate has mean $${mu}$ and standard deviation $${sig}$. Find the standardised score $z$ for $x=${x}$. Round off to two decimal places.`, answer: z, tolerance: 0.01,
      solution: solN("Standardise via $z=(x-\\mu)/\\sigma$.", `$$z=\\frac{${x}-${mu}}{${sig}}=${fmt(z)}$$`, `$\\mu=${mu},\\ \\sigma=${sig},\\ x=${x}$.`, fmt(z), r2(z - 0.01), r2(z + 0.01)) }); },
  (rng) => { const a = ri(rng, 1, 3), b = ri(rng, 1, 3), c = ri(rng, 1, 3); const ux = 1, uy = 2, uz = 2; const m = 3;
    const dd = (a * ux + b * uy + c * uz) / m;
    return nat({ topic: "Vector Calculus — Directional Derivative", difficulty: "hard", marks: 2,
      stem: `For $\\nabla f=(${a},${b},${c})$ at a point, find the directional derivative along the unit vector $\\tfrac{1}{3}(1,2,2)$. Round off to two decimal places.`, answer: dd, tolerance: 0.01,
      solution: solN("Directional derivative $=\\nabla f\\cdot\\hat u$ (the direction is already a unit vector).", `$$D=\\frac{1}{3}(${a}+2(${b})+2(${c}))=${fmt(dd)}$$`, `$\\nabla f=(${a},${b},${c})$.`, fmt(dd), r2(dd - 0.01), r2(dd + 0.01)) }); },
];

/* ---------------- Archetype C — diagrammatic (every Q has a figure) -- */
const C = [
  (rng) => { const a = pick(rng, [1, 2]), b = ri(rng, -8, -2), c = ri(rng, 2, 8); const xv = -b / (2 * a);
    const pts = []; for (let x = 0; x <= 8; x += 0.5) pts.push([x, Math.max(0, a * x * x + b * x + c)]);
    return nat({ topic: "Calculus — Maxima/Minima", difficulty: "medium", marks: 2,
      stem: `The plotted parabola is $y=${a}x^{2}${b}x+${c}$. Determine the $x$-coordinate of its vertex. Round off to two decimal places.`, answer: xv, tolerance: 0.05,
      figure: svgLine({ series: [{ points: pts, color: "#2563eb", label: "y(x)" }], xlabel: "x", ylabel: "y", caption: `Parabola y=${a}x²${b}x+${c}` }),
      solution: solN("The vertex of a parabola is at $x=-b/2a$.", `$$x_v=-\\frac{${b}}{2(${a})}=${fmt(xv)}$$`, `$a=${a},\\ b=${b}$.`, fmt(xv), r2(xv - 0.05), r2(xv + 0.05)) }); },
  (rng) => { const m1 = ri(rng, 1, 3), c1 = ri(rng, 1, 6), m2 = -ri(rng, 1, 3), c2 = ri(rng, 6, 14);
    const xs = (c2 - c1) / (m1 - m2); const ys = m1 * xs + c1;
    const p1 = []; const p2 = []; for (let x = 0; x <= 8; x += 1) { p1.push([x, m1 * x + c1]); p2.push([x, m2 * x + c2]); }
    return nat({ topic: "Linear Algebra — System of Equations", difficulty: "medium", marks: 2,
      stem: `The two plotted lines are $y=${m1}x+${c1}$ and $y=${m2}x+${c2}$. Find the $x$-coordinate of their intersection. Round off to two decimal places.`, answer: xs, tolerance: 0.05,
      figure: svgLine({ series: [{ points: p1, color: "#2563eb", label: "L1" }, { points: p2, color: "#dc2626", label: "L2" }], xlabel: "x", ylabel: "y", caption: "Intersection of two lines" }),
      solution: solN("Set the two expressions equal and solve for $x$.", `$$${m1}x+${c1}=${m2}x+${c2}\\Rightarrow x=\\frac{${c2}-${c1}}{${m1}-(${m2})}=${fmt(xs)}$$`, `Slopes $${m1},${m2}$; intercepts $${c1},${c2}$.`, fmt(xs), r2(xs - 0.05), r2(xs + 0.05)) }); },
  (rng) => { const vals = [ri(rng, 2, 6), ri(rng, 4, 9), ri(rng, 6, 12), ri(rng, 3, 8), ri(rng, 1, 5)]; const labels = ["10", "20", "30", "40", "50"];
    const mids = [10, 20, 30, 40, 50]; const n = vals.reduce((a, b) => a + b, 0); const mean = vals.reduce((a, v, i) => a + v * mids[i], 0) / n;
    return nat({ topic: "Statistics — Mean of Grouped Data", difficulty: "medium", marks: 2,
      stem: `The bar chart gives the frequency of values at class midpoints. Determine the mean. Round off to two decimal places.`, answer: mean, tolerance: 0.05,
      figure: svgBar({ labels, values: vals, caption: "Frequency vs class midpoint", title: "Frequency distribution" }),
      solution: solN("Mean of grouped data $=\\dfrac{\\Sigma f_i x_i}{\\Sigma f_i}$.", `$$\\bar x=\\frac{${vals.map((v, i) => v * mids[i]).join("+")}}{${n}}=${fmt(mean)}$$`, `Frequencies $${vals.join(",")}$ at midpoints $${mids.join(",")}$.`, fmt(mean), r2(mean - 0.05), r2(mean + 0.05)) }); },
  (rng) => { const y0 = ri(rng, 80, 160), k = pick(rng, [0.1, 0.15, 0.2, 0.25]), t = ri(rng, 2, 6); const v = y0 * Math.exp(-k * t);
    const pts = []; for (let x = 0; x <= 8; x += 0.5) pts.push([x, y0 * Math.exp(-k * x)]);
    return nat({ topic: "ODE — Exponential Decay", difficulty: "medium", marks: 2,
      stem: `The plotted curve is $N(t)=${y0}e^{-${k}t}$. Read off / compute $N$ at $t=${t}$. Round off to two decimal places.`, answer: v, tolerance: 0.3,
      figure: svgLine({ series: [{ points: pts, color: "#16a34a", label: "N(t)" }], xlabel: "t", ylabel: "N", caption: "Exponential decay" }),
      solution: solN("Evaluate the decay law at the required time.", `$$N=${y0}e^{-${k}\\times${t}}=${fmt(v)}$$`, `$N_0=${y0},\\ k=${k},\\ t=${t}$.`, fmt(v), r2(v - 0.3), r2(v + 0.3)) }); },
  (rng) => { const x = [0, 1, 2, 3, 4], py = pick(rng, [[2, 5, 8, 9, 8], [1, 4, 7, 10, 11], [3, 6, 8, 8, 6]]); const h = 1;
    const I = (h / 3) * (py[0] + 4 * py[1] + 2 * py[2] + 4 * py[3] + py[4]);
    const pts = x.map((xi, i) => [xi, py[i]]);
    return nat({ topic: "Numerical Methods — Simpson's Rule (chart)", difficulty: "hard", marks: 2,
      stem: `The plotted ordinates (at $h=1$) are $${py.join(", ")}$. Estimate the area under the curve using Simpson's $1/3$ rule. Round off to two decimal places.`, answer: I, tolerance: 0.05,
      figure: svgLine({ series: [{ points: pts, color: "#2563eb", dots: true, label: "f(x)" }], xlabel: "x", ylabel: "f", caption: "Ordinates for Simpson's rule" }),
      solution: solN("Simpson pattern of weights: $1,4,2,4,1$.", `$$I=\\frac{1}{3}(${py[0]}+4\\cdot${py[1]}+2\\cdot${py[2]}+4\\cdot${py[3]}+${py[4]})=${fmt(I)}$$`, `$h=1$, five ordinates.`, fmt(I), r2(I - 0.05), r2(I + 0.05)) }); },
  (rng) => { const A = ri(rng, 2, 5), T = pick(rng, [2, 4, 6]); const pts = []; for (let x = 0; x <= 8; x += 0.25) pts.push([x, A + A * Math.sin((2 * Math.PI / T) * x)]);
    return nat({ topic: "Fourier/Trigonometry — Wave Parameters", difficulty: "medium", marks: 2,
      stem: `The plotted signal is $y=${A}+${A}\\sin(\\tfrac{2\\pi}{${T}}t)$. Determine its period. Round off to two decimal places.`, answer: T, tolerance: 0.05,
      figure: svgLine({ series: [{ points: pts, color: "#7c3aed", label: "y(t)" }], xlabel: "t", ylabel: "y", caption: "Periodic signal" }),
      solution: solN("Period $=2\\pi/\\omega$ where $\\omega$ is the angular frequency.", `$$T=\\frac{2\\pi}{2\\pi/${T}}=${fmt(T)}$$`, `$\\omega=2\\pi/${T}$.`, fmt(T), r2(T - 0.05), r2(T + 0.05)) }); },
  (rng) => { const p1 = pick(rng, [0.6, 0.7, 0.8]), p2 = pick(rng, [0.5, 0.6, 0.7]); const P = p1 * p2;
    const mk = `<svg viewBox='0 0 320 180' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='11'><circle cx='30' cy='90' r='4' fill='#1e3a8a'/><line x1='34' y1='90' x2='150' y2='45' stroke='#16a34a'/><line x1='34' y1='90' x2='150' y2='135' stroke='#b91c1c'/><text x='70' y='58' fill='#16a34a'>p=${p1}</text><text x='70' y='128' fill='#b91c1c'>${r2(1 - p1)}</text><line x1='156' y1='45' x2='270' y2='25' stroke='#16a34a'/><line x1='156' y1='45' x2='270' y2='70' stroke='#b91c1c'/><text x='200' y='30' fill='#16a34a'>p=${p2}</text><text x='200' y='70' fill='#b91c1c'>${r2(1 - p2)}</text><text x='276' y='28'>S,S</text><text x='276' y='74'>S,F</text><text x='276' y='140'>F</text><text x='150' y='170' text-anchor='middle' fill='#475569'>two-stage probability tree</text></svg>`;
    return nat({ topic: "Probability — Multiplication Rule", difficulty: "medium", marks: 2,
      stem: `From the probability tree, find the probability of success at BOTH independent stages. Round off to two decimal places.`, answer: P, tolerance: 0.01,
      figure: figSvg(mk, "Two-stage probability tree"),
      solution: solN("Independent events multiply along a branch.", `$$P=p_1p_2=${p1}\\times${p2}=${fmt(P)}$$`, `$p_1=${p1},\\ p_2=${p2}$.`, fmt(P), r2(P - 0.01), r2(P + 0.01)) }); },
  (rng) => { const vals = [pick(rng, [10, 20]), pick(rng, [30, 40]), pick(rng, [20, 30]), pick(rng, [10, 20])]; const probs = [0.1, 0.4, 0.3, 0.2];
    const E = vals.reduce((a, v, i) => a + v * probs[i], 0);
    return nat({ topic: "Probability — Expected Value", difficulty: "medium", marks: 2,
      stem: `The bars give a payoff (height) with probabilities $0.1, 0.4, 0.3, 0.2$ respectively. Find the expected payoff. Round off to two decimal places.`, answer: E, tolerance: 0.05,
      figure: svgBar({ labels: ["0.1", "0.4", "0.3", "0.2"], values: vals, caption: "payoff vs probability", title: "Discrete payoff" }),
      solution: solN("Expected value $=\\Sigma x_iP_i$.", `$$E=${vals.map((v, i) => `${v}\\times${probs[i]}`).join("+")}=${fmt(E)}$$`, `Payoffs $${vals.join(",")}$.`, fmt(E), r2(E - 0.05), r2(E + 0.05)) }); },
  (rng) => { const a = ri(rng, 2, 5), b = ri(rng, 1, 4); const area = a * b; // determinant as area scaling of unit square
    const mk = `<svg viewBox='0 0 300 180' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='11'><rect x='40' y='90' width='40' height='40' fill='#bfdbfe' stroke='#2563eb'/><text x='60' y='150' text-anchor='middle' fill='#1e3a8a'>unit square (area 1)</text><polygon points='160,130 ${160 + 30 * a},130 ${160 + 30 * a},${130 - 30 * b} 160,${130 - 30 * b}' fill='#fde68a' fill-opacity='0.6' stroke='#d97706'/><text x='${160 + 15 * a},${145}' text-anchor='middle' fill='#92400e'>image (area ${area})</text></svg>`;
    return nat({ topic: "Linear Algebra — Determinant as Area Scaling", difficulty: "medium", marks: 2,
      stem: `A linear map has matrix $\\begin{bmatrix}${a}&0\\\\0&${b}\\end{bmatrix}$. By how much does it scale the area of the unit square (figure)? Round off to two decimal places.`, answer: area, tolerance: 0.01,
      figure: figSvg(mk, "Area scaling = |det|"),
      solution: solN("The area scale factor equals $|\\det|$.", `$$|\\det|=${a}\\times${b}=${fmt(area)}$$`, `Diagonal entries $${a},${b}$.`, fmt(area), r2(area - 0.01), r2(area + 0.01)) }); },
  (rng) => { const r = pick(rng, [0.2, 0.25, 0.3]); const pts = []; let bal = 100; for (let x = 0; x <= 6; x++) { pts.push([x, bal]); bal = bal * (1 + r); }
    const v = 100 * Math.pow(1 + r, 4);
    return nat({ topic: "Series — Geometric Growth", difficulty: "medium", marks: 2,
      stem: `The plotted balance grows geometrically at rate $${r}$ per period from $100$. Find the balance after $4$ periods. Round off to two decimal places.`, answer: v, tolerance: 0.2,
      figure: svgLine({ series: [{ points: pts, color: "#0891b2", dots: true, label: "balance" }], xlabel: "period", ylabel: "amount", caption: "Geometric growth" }),
      solution: solN("Geometric: $A_n=A_0(1+r)^n$.", `$$A_4=100(1+${r})^4=${fmt(v)}$$`, `$A_0=100,\\ r=${r}$.`, fmt(v), r2(v - 0.2), r2(v + 0.2)) }); },
  (rng) => { const a = ri(rng, 1, 3), b = ri(rng, 2, 6); // area between curve y=ax^2 and x-axis 0..b via integral; plotted
    const area = a * Math.pow(b, 3) / 3; const pts = []; for (let x = 0; x <= b; x += b / 16) pts.push([x, a * x * x]);
    return nat({ topic: "Calculus — Area Under a Curve", difficulty: "hard", marks: 2,
      stem: `Find the area bounded by the plotted curve $y=${a}x^{2}$, the $x$-axis, and $x=${b}$. Round off to two decimal places.`, answer: area, tolerance: 0.1,
      figure: svgLine({ series: [{ points: pts, color: "#2563eb", label: "y=" + a + "x²" }], xlabel: "x", ylabel: "y", caption: "Area under parabola" }),
      solution: solN("Integrate the curve between the limits.", `$$A=\\int_0^{${b}}${a}x^2dx=\\frac{${a}}{3}(${b})^3=${fmt(area)}$$`, `$a=${a},\\ b=${b}$.`, fmt(area), r2(area - 0.1), r2(area + 0.1)) }); },
  (rng) => { const N = pick(rng, [20, 30, 50]); const x0 = Math.ceil(Math.sqrt(N)) + 2; const x1 = x0 - (x0 * x0 - N) / (2 * x0); const x2 = x1 - (x1 * x1 - N) / (2 * x1);
    const pts = []; for (let x = 1; x <= x0 + 1; x += 0.5) pts.push([x, x * x - N + N]); // show f shifted to stay positive in plot
    return nat({ topic: "Numerical Methods — Newton–Raphson (geometric)", difficulty: "hard", marks: 2,
      stem: `For $f(x)=x^{2}-${N}$ with $x_0=${x0}$ (see tangent-iteration sketch), compute $x_2$ after TWO Newton–Raphson steps. Round off to two decimal places.`, answer: x2, tolerance: 0.01,
      figure: svgLine({ series: [{ points: pts, color: "#dc2626", label: "x²" }], xlabel: "x", ylabel: "f+N", caption: `root ≈ √${N}` }),
      solution: solN("Iterate $x_{k+1}=x_k-\\dfrac{x_k^2-N}{2x_k}$ twice.", `$$x_1=${fmt(x1)},\\quad x_2=${fmt(x2)}$$`, `$N=${N},\\ x_0=${x0}$.`, fmt(x2), r2(x2 - 0.01), r2(x2 + 0.01)) }); },
];

/* ---------------- Archetype D — multi-stage rank determinators ------ */
const D = [
  (rng) => { const A = ri(rng, 80, 120), k = pick(rng, [0.2, 0.3, 0.4]), t = ri(rng, 3, 6); const y = A * (1 - Math.exp(-k * t)); const pct = (y / A) * 100;
    return nat({ topic: "ODE — Newton's Law of Cooling/Charging", difficulty: "hard", marks: 2,
      stem: `A quantity follows $\\dfrac{dy}{dt}=k(${A}-y)$, $y(0)=0$, $k=${k}\\,\\text{s}^{-1}$. What percentage of the ceiling $${A}$ is reached at $t=${t}$ s? Round off to two decimal places.`, answer: pct, tolerance: 0.2,
      solution: solN("Solution is $y=A(1-e^{-kt})$; the fraction of the ceiling is $1-e^{-kt}$.", `$$\\frac{y}{A}=1-e^{-${k}\\times${t}}=${r2(pct / 100)}\\Rightarrow ${fmt(pct)}\\%$$`, `$A=${A},\\ k=${k},\\ t=${t}$.`, fmt(pct), r2(pct - 0.2), r2(pct + 0.2)) }); },
  (rng) => { let a, b, c, d, T, Δ, disc; do { a = ri(rng, 2, 6); b = ri(rng, 1, 3); c = ri(rng, 1, 3); d = ri(rng, 2, 6); T = a + d; Δ = a * d - b * c; disc = T * T - 4 * Δ; } while (disc <= 0);
    const l1 = (T + Math.sqrt(disc)) / 2, l2 = (T - Math.sqrt(disc)) / 2; const prod = l1 * l2;
    return nat({ topic: "Linear Algebra — Eigenvalue Product", difficulty: "hard", marks: 2,
      stem: `For $\\begin{bmatrix}${a}&${b}\\\\${c}&${d}\\end{bmatrix}$, compute both eigenvalues and report their product. Round off to two decimal places.`, answer: prod, tolerance: 0.05,
      solution: solN("Eigenvalue product equals the determinant; verify via $\\lambda_1\\lambda_2$.", `$$\\lambda_{1,2}=\\frac{${T}\\pm\\sqrt{${disc}}}{2};\\ \\lambda_1\\lambda_2=\\Delta=${fmt(prod)}$$`, `$T=${T},\\ \\Delta=${Δ}$.`, fmt(prod), r2(prod - 0.05), r2(prod + 0.05)) }); },
  (rng) => { const a = ri(rng, 1, 3), b = ri(rng, 1, 3); const I = a * b * 2 * 3 * 3 / 2 ; // placeholder replaced below
    const X = 2, Y = 3; const val = a * (X * X / 2) * Y + b * X * (Y * Y / 2);
    return nat({ topic: "Calculus — Double Integration", difficulty: "hard", marks: 2,
      stem: `Evaluate $\\displaystyle\\int_{0}^{${Y}}\\!\\!\\int_{0}^{${X}}(${a}x+${b}y)\\,dx\\,dy$. Round off to two decimal places.`, answer: val, tolerance: 0.05,
      solution: solN("Integrate the inner variable first, then the outer.", `$$\\int_0^{${Y}}\\!\\Big[\\tfrac{${a}}{2}x^2+${b}xy\\Big]_0^{${X}}dy=\\int_0^{${Y}}(${a * X * X / 2}+${b * X}y)dy=${fmt(val)}$$`, `Rectangle $[0,${X}]\\times[0,${Y}]$.`, fmt(val), r2(val - 0.05), r2(val + 0.05)) }); },
  (rng) => { const py = pick(rng, [[1, 4, 9, 16, 25], [2, 3, 5, 8, 13], [1, 3, 7, 13, 21]]); const h = 1; const I = (h / 3) * (py[0] + 4 * py[1] + 2 * py[2] + 4 * py[3] + py[4]);
    return nat({ topic: "Numerical Methods — Composite Simpson", difficulty: "hard", marks: 2,
      stem: `Estimate $\\int$ using composite Simpson's $1/3$ rule with $h=1$ and ordinates $${py.join(", ")}$. Round off to two decimal places.`, answer: I, tolerance: 0.05,
      solution: solN("Composite Simpson weights: $1,4,2,4,1$.", `$$I=\\tfrac13(${py[0]}+4\\cdot${py[1]}+2\\cdot${py[2]}+4\\cdot${py[3]}+${py[4]})=${fmt(I)}$$`, `Five ordinates, $h=1$.`, fmt(I), r2(I - 0.05), r2(I + 0.05)) }); },
  (rng) => { const p = pick(rng, [0.1, 0.15, 0.2]), n = ri(rng, 3, 5); const P = 1 - Math.pow(1 - p, n);
    return nat({ topic: "Probability — At-least-one Rule", difficulty: "hard", marks: 2,
      stem: `Each of $${n}$ independent blast holes misfires with probability $${p}$. Find the probability of AT LEAST ONE misfire. Round off to two decimal places.`, answer: P, tolerance: 0.01,
      solution: solN("Complement: $P(\\ge1)=1-(1-p)^n$.", `$$P=1-(1-${p})^{${n}}=${fmt(P)}$$`, `$p=${p},\\ n=${n}$.`, fmt(P), r2(P - 0.01), r2(P + 0.01)) }); },
  (rng) => { const mu = ri(rng, 50, 70), sig = ri(rng, 5, 10); const lo = mu - sig, hi = mu + sig; const P = 68.27;
    return nat({ topic: "Probability — Normal Empirical Rule", difficulty: "hard", marks: 2,
      stem: `For a normal distribution with $\\mu=${mu}$, $\\sigma=${sig}$, what percentage of values lie within $[${lo},${hi}]$ (i.e. $\\mu\\pm\\sigma$)? Round off to two decimal places.`, answer: P, tolerance: 0.5,
      solution: solN("By the empirical (68–95–99.7) rule, $\\mu\\pm1\\sigma$ captures $\\approx68.27\\%$.", `$$P(\\mu-\\sigma<X<\\mu+\\sigma)=68.27\\%$$`, `$\\mu=${mu},\\ \\sigma=${sig}$.`, "68.27", "67.77", "68.77") }); },
  (rng) => { const a0coef = ri(rng, 2, 6); const L = Math.PI; const a0 = a0coef; // average value of constant a0 over period -> a0
    const v = a0coef; return nat({ topic: "Fourier Series — Mean Value", difficulty: "hard", marks: 2,
      stem: `A periodic function equals the constant $${a0coef}$ over one full period. What is its Fourier mean (the $a_0/2$ d.c. term, i.e. average value)? Round off to two decimal places.`, answer: v, tolerance: 0.01,
      solution: solN("The d.c. term is the average value $\\tfrac{1}{T}\\int_0^T f\\,dt$.", `$$\\bar f=\\frac{1}{T}\\int_0^T ${a0coef}\\,dt=${fmt(v)}$$`, `$f=${a0coef}$ over the period.`, fmt(v), r2(v - 0.01), r2(v + 0.01)) }); },
  (rng) => { const a = pick(rng, [1, 2]), b = ri(rng, 6, 14), c = ri(rng, 2, 10); const xstar = b / (2 * a); const fmax = -a * xstar * xstar + b * xstar + c;
    return nat({ topic: "Calculus — Constrained Maximum", difficulty: "hard", marks: 2,
      stem: `A profit function is $P(x)=-${a}x^{2}+${b}x+${c}$. Find the MAXIMUM profit. Round off to two decimal places.`, answer: fmax, tolerance: 0.05,
      solution: solN("Set $P'(x)=0$ to locate the optimum, then evaluate $P$ there.", `$$x^*=\\frac{${b}}{2(${a})}=${fmt(xstar)};\\ P_{max}=${fmt(fmax)}$$`, `$a=${a},\\ b=${b},\\ c=${c}$.`, fmt(fmax), r2(fmax - 0.05), r2(fmax + 0.05)) }); },
  (rng) => { const fx = ri(rng, 2, 5), fy = ri(rng, 2, 5); const x1 = 2, y1 = 3; const phi = fx * x1 + fy * y1; const phi0 = 0; const W = phi - phi0;
    return nat({ topic: "Vector Calculus — Conservative Line Integral", difficulty: "hard", marks: 2,
      stem: `A conservative field has potential $\\phi=${fx}x+${fy}y$. Find the work done moving from $(0,0)$ to $(${x1},${y1})$. Round off to two decimal places.`, answer: W, tolerance: 0.01,
      solution: solN("For a conservative field, work $=\\phi(\\text{end})-\\phi(\\text{start})$, path-independent.", `$$W=\\phi(${x1},${y1})-\\phi(0,0)=${fx}\\cdot${x1}+${fy}\\cdot${y1}=${fmt(W)}$$`, `$\\phi=${fx}x+${fy}y$.`, fmt(W), r2(W - 0.01), r2(W + 0.01)) }); },
  (rng) => { const k = pick(rng, [0.05, 0.1, 0.15]); const t = Math.log(2) / k;
    return nat({ topic: "ODE — Half-life", difficulty: "hard", marks: 2,
      stem: `A decaying quantity has rate constant $k=${k}\\,\\text{s}^{-1}$ in $N=N_0e^{-kt}$. Find its half-life (s). Round off to two decimal places.`, answer: t, tolerance: 0.05,
      solution: solN("Half-life solves $\\tfrac12=e^{-kt_{1/2}}\\Rightarrow t_{1/2}=\\ln2/k$.", `$$t_{1/2}=\\frac{\\ln 2}{${k}}=${fmt(t)}\\ \\text{s}$$`, `$k=${k}$.`, fmt(t), r2(t - 0.05), r2(t + 0.05)) }); },
];

function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function factC(n, k) { return fact(n) / (fact(k) * fact(n - k)); }

export default { slug: "engineering-mathematics", name: "Engineering Mathematics", subjectTag: SUB, pools: { A, B, C, D } };
