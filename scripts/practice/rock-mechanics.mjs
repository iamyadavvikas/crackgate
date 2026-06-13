/** Rock Mechanics — 175-question template pools (A30/B30/C60/D55). */
import { mcq, nat, r2, deg, rad, fmt, solN, solC, numMCQ, figMohr, figStress, figStereonet, svgBar, svgLine, figSvg } from "../build_practice_bank.mjs";

const SUB = "Rock Mechanics";
const ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const rf = (rng, a, b) => r2(a + rng() * (b - a));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/* ---------------- Archetype A — formula & unit traps ---------------- */
const A = [
  (rng) => { const rho = ri(rng, 2400, 2800), H = ri(rng, 100, 600); const sv = rho * 9.81 * H / 1e6;
    return nat({ topic: "In-situ Stress — Vertical", difficulty: "medium", marks: 2,
      stem: `Find the vertical stress (MPa) at depth $${H}\\,\\text{m}$ in rock of density $${rho}\\,\\text{kg/m}^3$. Round off to two decimal places.`, answer: sv, tolerance: 0.05,
      solution: solN("$\\sigma_v=\\rho g H$; convert Pa to MPa.", `$$\\sigma_v=\\frac{${rho}\\times9.81\\times${H}}{10^6}=${fmt(sv)}\\ \\text{MPa}$$`, `$\\rho=${rho},\\ H=${H}$.`, fmt(sv), r2(sv - 0.05), r2(sv + 0.05)) }); },
  (rng) => { const sv = rf(rng, 5, 20), k = rf(rng, 0.3, 1.2); const sh = k * sv;
    return nat({ topic: "In-situ Stress — Horizontal", difficulty: "easy", marks: 1,
      stem: `With vertical stress $${sv}\\,\\text{MPa}$ and stress ratio $k=${k}$, find the horizontal stress (MPa). Round off to two decimal places.`, answer: sh, tolerance: 0.02,
      solution: solN("$\\sigma_h=k\\,\\sigma_v$.", `$$\\sigma_h=${k}\\times${sv}=${fmt(sh)}$$`, `$\\sigma_v=${sv},\\ k=${k}$.`, fmt(sh), r2(sh - 0.02), r2(sh + 0.02)) }); },
  (rng) => { const stress = rf(rng, 20, 120), strain = rf(rng, 0.0005, 0.003); const E = stress / strain / 1000;
    return nat({ topic: "Elasticity — Young's Modulus", difficulty: "medium", marks: 2,
      stem: `A rock sample under $${stress}\\,\\text{MPa}$ shows axial strain $${strain}$. Find Young's modulus (GPa). Round off to two decimal places.`, answer: E, tolerance: 0.5,
      solution: solN("$E=\\sigma/\\varepsilon$; convert MPa to GPa.", `$$E=\\frac{${stress}}{${strain}}=${fmt(stress / strain)}\\,\\text{MPa}=${fmt(E)}\\,\\text{GPa}$$`, `$\\sigma=${stress},\\ \\varepsilon=${strain}$.`, fmt(E), r2(E - 0.5), r2(E + 0.5)) }); },
  (rng) => { const P = ri(rng, 50, 300), d = rf(rng, 40, 60); const A = Math.PI * d * d / 4; const ucs = P * 1000 / A;
    return nat({ topic: "Strength — UCS", difficulty: "medium", marks: 2,
      stem: `A cylindrical core of diameter $${d}\\,\\text{mm}$ fails at $${P}\\,\\text{kN}$. Find the uniaxial compressive strength (MPa). Round off to two decimal places.`, answer: ucs, tolerance: 0.5,
      solution: solN("$\\sigma_c=P/A$ with $A=\\pi d^2/4$; kN and mm give MPa directly.", `$$\\sigma_c=\\frac{${P}\\times10^3}{${fmt(A)}}=${fmt(ucs)}\\ \\text{MPa}$$`, `$P=${P}\\,\\text{kN},\\ d=${d}\\,\\text{mm}$.`, fmt(ucs), r2(ucs - 0.5), r2(ucs + 0.5)) }); },
  (rng) => { const P = ri(rng, 10, 60), D = rf(rng, 50, 60), t = rf(rng, 25, 30); const st = 2 * P * 1000 / (Math.PI * D * t);
    return nat({ topic: "Strength — Brazilian Tensile", difficulty: "hard", marks: 2,
      stem: `A Brazilian disc ($D=${D}\\,\\text{mm}$, $t=${t}\\,\\text{mm}$) splits at $${P}\\,\\text{kN}$. Find the tensile strength (MPa). Round off to two decimal places.`, answer: st, tolerance: 0.1,
      solution: solN("Brazilian test: $\\sigma_t=\\dfrac{2P}{\\pi D t}$.", `$$\\sigma_t=\\frac{2\\times${P}\\times10^3}{\\pi\\times${D}\\times${t}}=${fmt(st)}\\ \\text{MPa}$$`, `$P=${P},\\ D=${D},\\ t=${t}$.`, fmt(st), r2(st - 0.1), r2(st + 0.1)) }); },
  (rng) => { const s1 = rf(rng, 30, 90), s3 = rf(rng, 2, 20); const tmax = (s1 - s3) / 2;
    return nat({ topic: "Stress — Maximum Shear", difficulty: "easy", marks: 1,
      stem: `Principal stresses are $\\sigma_1=${s1}$, $\\sigma_3=${s3}\\,\\text{MPa}$. Find the maximum shear stress. Round off to two decimal places.`, answer: tmax, tolerance: 0.02,
      solution: solN("$\\tau_{max}=(\\sigma_1-\\sigma_3)/2$.", `$$\\tau_{max}=\\frac{${s1}-${s3}}{2}=${fmt(tmax)}$$`, `$\\sigma_1=${s1},\\ \\sigma_3=${s3}$.`, fmt(tmax), r2(tmax - 0.02), r2(tmax + 0.02)) }); },
  (rng) => { const ea = rf(rng, 0.001, 0.004), nu = pick(rng, [0.2, 0.25, 0.3]); const el = -nu * ea;
    return nat({ topic: "Elasticity — Poisson's Ratio", difficulty: "medium", marks: 2,
      stem: `Axial strain is $${ea}$ and Poisson's ratio $${nu}$. Find the lateral strain (give magnitude). Round off to two decimal places... in millistrain.`, answer: Math.abs(el) * 1000, tolerance: 0.05,
      solution: solN("Lateral strain $=-\\nu\\,\\varepsilon_{axial}$.", `$$\\varepsilon_{lat}=-${nu}\\times${ea}=${fmt(el)}\\Rightarrow ${fmt(Math.abs(el) * 1000)}\\,\\text{m}\\varepsilon$$`, `$\\varepsilon_a=${ea},\\ \\nu=${nu}$.`, fmt(Math.abs(el) * 1000), r2(Math.abs(el) * 1000 - 0.05), r2(Math.abs(el) * 1000 + 0.05)) }); },
  (rng) => { const stress = rf(rng, 10, 80), E = ri(rng, 20, 70); const strain = stress / (E * 1000);
    const m = numMCQ({ rng, correct: strain * 1000, traps: [stress / E, stress * E, strain], unit: "mε" });
    return mcq({ topic: "Elasticity — Strain from Stress", difficulty: "easy", marks: 1,
      stem: `A rock ($E=${E}\\,\\text{GPa}$) carries $${stress}\\,\\text{MPa}$. Find the axial strain (in millistrain).`, options: m.options, answer: m.answer,
      solution: solC("$\\varepsilon=\\sigma/E$; mind the GPa/MPa unit ratio.", `$$\\varepsilon=\\frac{${stress}}{${E}\\times10^3}=${fmt(strain)}\\Rightarrow ${fmt(strain * 1000)}\\,\\text{m}\\varepsilon$$`, `$\\sigma=${stress},\\ E=${E}$.`, `$${fmt(strain * 1000)}\\,\\text{m}\\varepsilon$.`) }); },
];

/* ---------------- Archetype B — vintage PYQ variants ---------------- */
const B = [
  (rng) => { const sx = rf(rng, 20, 60), sy = rf(rng, 10, 40), txy = rf(rng, 5, 25); const R = Math.sqrt(((sx - sy) / 2) ** 2 + txy * txy); const s1 = (sx + sy) / 2 + R;
    return nat({ topic: "Stress Transformation — Major Principal", difficulty: "hard", marks: 2,
      stem: `For $\\sigma_x=${sx}$, $\\sigma_y=${sy}$, $\\tau_{xy}=${txy}\\,\\text{MPa}$, find the major principal stress. Round off to two decimal places.`, answer: s1, tolerance: 0.05,
      solution: solN("$\\sigma_{1}=\\dfrac{\\sigma_x+\\sigma_y}{2}+\\sqrt{\\left(\\dfrac{\\sigma_x-\\sigma_y}{2}\\right)^2+\\tau_{xy}^2}$.", `$$\\sigma_1=${r2((sx + sy) / 2)}+${fmt(R)}=${fmt(s1)}$$`, `$\\sigma_x=${sx},\\ \\sigma_y=${sy},\\ \\tau=${txy}$.`, fmt(s1), r2(s1 - 0.05), r2(s1 + 0.05)) }); },
  (rng) => { const c = rf(rng, 1, 8), phi = ri(rng, 25, 40), sn = rf(rng, 10, 50); const tf = c + sn * Math.tan(rad(phi));
    return nat({ topic: "Mohr–Coulomb — Shear Strength", difficulty: "medium", marks: 2,
      stem: `For cohesion $${c}\\,\\text{MPa}$, friction angle $${phi}^{\\circ}$, normal stress $${sn}\\,\\text{MPa}$, find the shear strength. Round off to two decimal places.`, answer: tf, tolerance: 0.05,
      solution: solN("Mohr–Coulomb: $\\tau_f=c+\\sigma_n\\tan\\phi$.", `$$\\tau_f=${c}+${sn}\\tan${phi}^{\\circ}=${fmt(tf)}$$`, `$c=${c},\\ \\phi=${phi}^{\\circ},\\ \\sigma_n=${sn}$.`, fmt(tf), r2(tf - 0.05), r2(tf + 0.05)) }); },
  (rng) => { const c = rf(rng, 2, 8), phi = ri(rng, 28, 40), sn = rf(rng, 15, 45), tau = rf(rng, 8, 25); const tf = c + sn * Math.tan(rad(phi)); const fos = tf / tau;
    return nat({ topic: "Slope/Joint — Factor of Safety", difficulty: "hard", marks: 2,
      stem: `On a joint ($c=${c}$, $\\phi=${phi}^{\\circ}$, $\\sigma_n=${sn}\\,\\text{MPa}$) the driving shear is $${tau}\\,\\text{MPa}$. Find the factor of safety. Round off to two decimal places.`, answer: fos, tolerance: 0.02,
      solution: solN("$FoS=\\tau_f/\\tau$ with $\\tau_f=c+\\sigma_n\\tan\\phi$.", `$$\\tau_f=${fmt(tf)};\\ FoS=\\frac{${fmt(tf)}}{${tau}}=${fmt(fos)}$$`, `driving $\\tau=${tau}$.`, fmt(fos), r2(fos - 0.02), r2(fos + 0.02)) }); },
  (rng) => { const s3 = rf(rng, 2, 15), c = rf(rng, 3, 10), phi = ri(rng, 28, 38); const N = (1 + Math.sin(rad(phi))) / (1 - Math.sin(rad(phi))); const s1 = s3 * N + 2 * c * Math.sqrt(N);
    return nat({ topic: "Triaxial — Peak Strength", difficulty: "hard", marks: 2,
      stem: `Using Mohr–Coulomb with $c=${c}\\,\\text{MPa}$, $\\phi=${phi}^{\\circ}$ and confining $\\sigma_3=${s3}\\,\\text{MPa}$, find the peak axial stress $\\sigma_1$. Round off to two decimal places.`, answer: s1, tolerance: 0.1,
      solution: solN("$\\sigma_1=\\sigma_3N_\\phi+2c\\sqrt{N_\\phi}$, $N_\\phi=\\tfrac{1+\\sin\\phi}{1-\\sin\\phi}$.", `$$N_\\phi=${fmt(N)};\\ \\sigma_1=${s3}(${fmt(N)})+2(${c})\\sqrt{${fmt(N)}}=${fmt(s1)}$$`, `$c=${c},\\ \\phi=${phi}^{\\circ},\\ \\sigma_3=${s3}$.`, fmt(s1), r2(s1 - 0.1), r2(s1 + 0.1)) }); },
  (rng) => { const ev = rf(rng, 0.001, 0.005), K = ri(rng, 5, 30); const p = K * ev * 1000;
    return nat({ topic: "Elasticity — Bulk Modulus", difficulty: "medium", marks: 2,
      stem: `A rock with bulk modulus $${K}\\,\\text{GPa}$ undergoes volumetric strain $${ev}$. Find the hydrostatic pressure (MPa). Round off to two decimal places.`, answer: p, tolerance: 0.1,
      solution: solN("$p=K\\,\\varepsilon_v$.", `$$p=${K}\\times10^3\\times${ev}=${fmt(p)}\\ \\text{MPa}$$`, `$K=${K},\\ \\varepsilon_v=${ev}$.`, fmt(p), r2(p - 0.1), r2(p + 0.1)) }); },
  (rng) => { const s1 = rf(rng, 20, 60), s3 = rf(rng, 2, 12); const sigTheta = 3 * s1 - s3;
    return nat({ topic: "Circular Opening — Tangential Stress", difficulty: "hard", marks: 2,
      stem: `For a circular opening with far-field $\\sigma_1=${s1}$, $\\sigma_3=${s3}\\,\\text{MPa}$ (Kirsch), find the maximum tangential boundary stress. Round off to two decimal places.`, answer: sigTheta, tolerance: 0.05,
      solution: solN("Kirsch: peak boundary stress $=3\\sigma_1-\\sigma_3$.", `$$\\sigma_\\theta=3(${s1})-${s3}=${fmt(sigTheta)}$$`, `$\\sigma_1=${s1},\\ \\sigma_3=${s3}$.`, fmt(sigTheta), r2(sigTheta - 0.05), r2(sigTheta + 0.05)) }); },
  (rng) => { const sumL = ri(rng, 60, 90), total = 100; const pieces = sumL; const rqd = pieces;
    const segs = [ri(rng, 10, 25), ri(rng, 12, 22), ri(rng, 8, 18)]; const big = segs.filter((x) => x >= 10).reduce((a, b) => a + b, 0); const core = 100; const RQD = big / core * 100;
    return nat({ topic: "Rock Mass — RQD", difficulty: "medium", marks: 2,
      stem: `In a $100\\,\\text{cm}$ core run, intact pieces $\\ge10\\,\\text{cm}$ measure $${segs.join(", ")}\\,\\text{cm}$. Find the RQD (%). Round off to two decimal places.`, answer: RQD, tolerance: 0.05,
      solution: solN("RQD $=\\dfrac{\\Sigma(\\text{pieces}\\ge10\\,\\text{cm})}{\\text{core run}}\\times100$.", `$$RQD=\\frac{${segs.filter((x) => x >= 10).join("+")}}{100}\\times100=${fmt(RQD)}\\%$$`, `pieces $${segs.join(",")}$ cm.`, fmt(RQD), r2(RQD - 0.05), r2(RQD + 0.05)) }); },
  (rng) => { const E = ri(rng, 20, 60), nu = pick(rng, [0.2, 0.25, 0.3]); const G = E / (2 * (1 + nu));
    return nat({ topic: "Elasticity — Shear Modulus", difficulty: "medium", marks: 2,
      stem: `For $E=${E}\\,\\text{GPa}$ and $\\nu=${nu}$, find the shear modulus $G$ (GPa). Round off to two decimal places.`, answer: G, tolerance: 0.05,
      solution: solN("$G=\\dfrac{E}{2(1+\\nu)}$.", `$$G=\\frac{${E}}{2(1+${nu})}=${fmt(G)}\\ \\text{GPa}$$`, `$E=${E},\\ \\nu=${nu}$.`, fmt(G), r2(G - 0.05), r2(G + 0.05)) }); },
];

/* ---------------- Archetype C — diagrammatic (every Q has a figure) -- */
const C = [
  (rng) => { const s1 = rf(rng, 40, 90), s3 = rf(rng, 5, 20); const center = (s1 + s3) / 2;
    return nat({ topic: "Mohr Circle — Centre", difficulty: "medium", marks: 2,
      stem: `From the Mohr circle (principal stresses $\\sigma_1=${s1}$, $\\sigma_3=${s3}\\,\\text{MPa}$), find the circle centre on the $\\sigma$-axis. Round off to two decimal places.`, answer: center, tolerance: 0.02,
      figure: figMohr(s1, s3, { caption: `Mohr circle σ1=${s1}, σ3=${s3}` }),
      solution: solN("Mohr circle centre $=(\\sigma_1+\\sigma_3)/2$.", `$$c=\\frac{${s1}+${s3}}{2}=${fmt(center)}$$`, `$\\sigma_1=${s1},\\ \\sigma_3=${s3}$.`, fmt(center), r2(center - 0.02), r2(center + 0.02)) }); },
  (rng) => { const s1 = rf(rng, 40, 90), s3 = rf(rng, 5, 20); const radius = (s1 - s3) / 2;
    return nat({ topic: "Mohr Circle — Radius", difficulty: "medium", marks: 2,
      stem: `From the Mohr circle ($\\sigma_1=${s1}$, $\\sigma_3=${s3}\\,\\text{MPa}$), find the radius (= maximum shear). Round off to two decimal places.`, answer: radius, tolerance: 0.02,
      figure: figMohr(s1, s3, { caption: `Mohr circle σ1=${s1}, σ3=${s3}` }),
      solution: solN("Mohr circle radius $=(\\sigma_1-\\sigma_3)/2=\\tau_{max}$.", `$$r=\\frac{${s1}-${s3}}{2}=${fmt(radius)}$$`, `$\\sigma_1=${s1},\\ \\sigma_3=${s3}$.`, fmt(radius), r2(radius - 0.02), r2(radius + 0.02)) }); },
  (rng) => { const sx = rf(rng, 30, 70), sy = rf(rng, 10, 40), txy = rf(rng, 8, 25); const R = Math.sqrt(((sx - sy) / 2) ** 2 + txy * txy); const s1 = (sx + sy) / 2 + R;
    return nat({ topic: "Stress Block — Principal Stress", difficulty: "hard", marks: 2,
      stem: `The stress element shows $\\sigma_x=${sx}$, $\\sigma_y=${sy}$, $\\tau_{xy}=${txy}\\,\\text{MPa}$. Find the major principal stress. Round off to two decimal places.`, answer: s1, tolerance: 0.05,
      figure: figStress(sx, sy, txy, "2-D stress element"),
      solution: solN("$\\sigma_1=\\bar\\sigma+R$ with $\\bar\\sigma=(\\sigma_x+\\sigma_y)/2$, $R=\\sqrt{((\\sigma_x-\\sigma_y)/2)^2+\\tau^2}$.", `$$\\sigma_1=${r2((sx + sy) / 2)}+${fmt(R)}=${fmt(s1)}$$`, `$\\sigma_x=${sx},\\ \\sigma_y=${sy},\\ \\tau=${txy}$.`, fmt(s1), r2(s1 - 0.05), r2(s1 + 0.05)) }); },
  (rng) => { const sx = rf(rng, 30, 70), sy = rf(rng, 10, 40), txy = rf(rng, 8, 25); const theta = 0.5 * deg(Math.atan2(2 * txy, sx - sy));
    return nat({ topic: "Stress Block — Principal Plane Angle", difficulty: "hard", marks: 2,
      stem: `For the element ($\\sigma_x=${sx}$, $\\sigma_y=${sy}$, $\\tau_{xy}=${txy}$), find the orientation of the principal plane (degrees). Round off to two decimal places.`, answer: theta, tolerance: 0.1,
      figure: figStress(sx, sy, txy, "Find principal plane"),
      solution: solN("$\\tan2\\theta_p=\\dfrac{2\\tau_{xy}}{\\sigma_x-\\sigma_y}$.", `$$\\theta_p=\\tfrac12\\tan^{-1}\\frac{2(${txy})}{${sx}-${sy}}=${fmt(theta)}^{\\circ}$$`, `$\\sigma_x=${sx},\\ \\sigma_y=${sy},\\ \\tau=${txy}$.`, fmt(theta), r2(theta - 0.1), r2(theta + 0.1)) }); },
  (rng) => { const strike = pick(rng, [30, 45, 60, 90, 120]), dip = ri(rng, 30, 70); const slope = ri(rng, 50, 75); const ok = dip < slope;
    return mcq({ topic: "Stereonet — Planar Failure Check", difficulty: "hard", marks: 2,
      stem: `A joint dips at $${dip}^{\\circ}$ into a slope face of $${slope}^{\\circ}$. Per the daylight/kinematic rule, is planar sliding KINEMATICALLY possible?`, options: ["Yes — joint daylights (dip < slope face)", "No — joint dips steeper than the face"], answer: ok ? 0 : 1,
      figure: figStereonet([{ strike, dip, label: "joint" }], `Joint ${strike}/${dip}, face ${slope}°`),
      solution: solC("Planar sliding needs the joint to daylight: joint dip $<$ slope-face angle and dip direction within $\\pm20^{\\circ}$ of the face.", `Joint dip $${dip}^{\\circ}$ vs face $${slope}^{\\circ}$ $\\Rightarrow$ ${ok ? "daylights" : "does not daylight"}.`, `dip $${dip}^{\\circ}$, face $${slope}^{\\circ}$.`, `${ok ? "Yes" : "No"} is correct.`) }); },
  (rng) => { const c = rf(rng, 10, 40), gamma = ri(rng, 18, 26), H = ri(rng, 8, 20), beta = ri(rng, 45, 70), phi = ri(rng, 25, 35);
    // simple FoS via friction circle approx: Fs = (c + (gamma*H*cos^2 b)*tanphi)/(gamma*H*sinb*cosb)  -- infinite slope
    const b = rad(beta); const num = c + gamma * H * Math.cos(b) ** 2 * Math.tan(rad(phi)); const den = gamma * H * Math.sin(b) * Math.cos(b); const fos = num / den;
    return nat({ topic: "Slope Stability — Infinite Slope FoS", difficulty: "hard", marks: 2,
      stem: `For an infinite slope ($c=${c}\\,\\text{kPa}$, $\\gamma=${gamma}\\,\\text{kN/m}^3$, $H=${H}\\,\\text{m}$, $\\beta=${beta}^{\\circ}$, $\\phi=${phi}^{\\circ}$), find the factor of safety. Round off to two decimal places.`, answer: fos, tolerance: 0.05,
      figure: figSvg(`<svg viewBox='0 0 260 150' xmlns='http://www.w3.org/2000/svg' font-family='sans-serif' font-size='10'><polygon points='20,130 240,130 240,${130 - 200 * Math.tan(b) > 20 ? 30 : 60} ' fill='#fde68a' stroke='#d97706'/><line x1='20' y1='130' x2='200' y2='${r2(130 - 180 * Math.tan(b))}' stroke='#b91c1c' stroke-width='2'/><text x='120' y='145' text-anchor='middle' fill='#475569'>slope β=${beta}°, H=${H} m</text></svg>`, "Infinite slope"),
      solution: solN("Infinite slope: $F=\\dfrac{c+\\gamma H\\cos^2\\beta\\tan\\phi}{\\gamma H\\sin\\beta\\cos\\beta}$.", `$$F=\\frac{${c}+${gamma}\\times${H}\\cos^2${beta}\\tan${phi}}{${gamma}\\times${H}\\sin${beta}\\cos${beta}}=${fmt(fos)}$$`, `$c=${c},\\ \\phi=${phi}^{\\circ},\\ \\beta=${beta}^{\\circ}$.`, fmt(fos), r2(fos - 0.05), r2(fos + 0.05)) }); },
  (rng) => { const stresses = [rf(rng, 0.5, 1.5), rf(rng, 1.5, 3), rf(rng, 3, 5), rf(rng, 5, 7)]; const strains = [0.5, 1.5, 3, 5]; const E = (stresses[2] - stresses[0]) / ((strains[2] - strains[0]) / 1000) / 1000;
    return nat({ topic: "Stress–Strain Curve — Modulus", difficulty: "hard", marks: 2,
      stem: `The plotted stress (MPa) vs strain (millistrain) curve passes through the marked points. Find the tangent modulus between the 1st and 3rd points (GPa). Round off to two decimal places.`, answer: E, tolerance: 0.3,
      figure: svgLine({ series: [{ points: strains.map((s, i) => [s, stresses[i]]), color: "#2563eb", dots: true, label: "σ–ε" }], xlabel: "strain (mε)", ylabel: "σ (MPa)", caption: "Stress–strain" }),
      solution: solN("Modulus is the slope $\\Delta\\sigma/\\Delta\\varepsilon$ between two points.", `$$E=\\frac{${stresses[2]}-${stresses[0]}}{(${strains[2]}-${strains[0]})\\times10^{-3}}=${fmt(E)}\\,\\text{GPa}$$`, `points read from plot.`, fmt(E), r2(E - 0.3), r2(E + 0.3)) }); },
  (rng) => { const s1 = rf(rng, 40, 80), s3 = rf(rng, 5, 18); const theta = ri(rng, 20, 40); const sn = (s1 + s3) / 2 + (s1 - s3) / 2 * Math.cos(rad(2 * theta));
    return nat({ topic: "Mohr Circle — Normal Stress on Plane", difficulty: "hard", marks: 2,
      stem: `From the Mohr circle ($\\sigma_1=${s1}$, $\\sigma_3=${s3}$), find the normal stress on a plane at $${theta}^{\\circ}$ to the major principal plane. Round off to two decimal places.`, answer: sn, tolerance: 0.05,
      figure: figMohr(s1, s3, { caption: `Plane at ${theta}° to σ1` }),
      solution: solN("$\\sigma_n=\\bar\\sigma+\\dfrac{\\sigma_1-\\sigma_3}{2}\\cos2\\theta$.", `$$\\sigma_n=${r2((s1 + s3) / 2)}+${r2((s1 - s3) / 2)}\\cos${2 * theta}^{\\circ}=${fmt(sn)}$$`, `$\\theta=${theta}^{\\circ}$.`, fmt(sn), r2(sn - 0.05), r2(sn + 0.05)) }); },
  (rng) => { const s1 = rf(rng, 40, 80), s3 = rf(rng, 5, 18); const theta = ri(rng, 20, 40); const tau = (s1 - s3) / 2 * Math.sin(rad(2 * theta));
    return nat({ topic: "Mohr Circle — Shear Stress on Plane", difficulty: "hard", marks: 2,
      stem: `From the Mohr circle ($\\sigma_1=${s1}$, $\\sigma_3=${s3}$), find the shear stress on a plane at $${theta}^{\\circ}$ to the major principal plane. Round off to two decimal places.`, answer: tau, tolerance: 0.05,
      figure: figMohr(s1, s3, { caption: `Shear on plane at ${theta}°` }),
      solution: solN("$\\tau=\\dfrac{\\sigma_1-\\sigma_3}{2}\\sin2\\theta$.", `$$\\tau=${r2((s1 - s3) / 2)}\\sin${2 * theta}^{\\circ}=${fmt(tau)}$$`, `$\\theta=${theta}^{\\circ}$.`, fmt(tau), r2(tau - 0.05), r2(tau + 0.05)) }); },
  (rng) => { const loads = [ri(rng, 50, 100), ri(rng, 120, 180), ri(rng, 200, 260), ri(rng, 150, 200)]; const mx = Math.max(...loads);
    return nat({ topic: "Lab Data — Peak Load", difficulty: "medium", marks: 2,
      stem: `The bar chart shows failure loads (kN) of four specimens. Identify the peak failure load. Round off to two decimal places.`, answer: mx, tolerance: 0.01,
      figure: svgBar({ labels: ["S1", "S2", "S3", "S4"], values: loads, caption: "Failure loads", title: "Load (kN)" }),
      solution: solN("Read the tallest bar.", `$$\\max=${fmt(mx)}\\ \\text{kN}$$`, `four specimens.`, fmt(mx), r2(mx - 0.01), r2(mx + 0.01)) }); },
  (rng) => { const s1 = rf(rng, 30, 70), c = rf(rng, 3, 9), phi = ri(rng, 28, 38); const N = (1 + Math.sin(rad(phi))) / (1 - Math.sin(rad(phi))); const s3 = (s1 - 2 * c * Math.sqrt(N)) / N;
    return nat({ topic: "Mohr–Coulomb Envelope — Confinement", difficulty: "hard", marks: 2,
      stem: `Given the failure envelope ($c=${c}$, $\\phi=${phi}^{\\circ}$) and peak $\\sigma_1=${s1}\\,\\text{MPa}$, find the confining $\\sigma_3$ that caused failure. Round off to two decimal places.`, answer: s3, tolerance: 0.1,
      figure: figMohr(s1, Math.max(0, r2(s1 * 0.2)), { phi, cohesion: c, caption: "Failure envelope" }),
      solution: solN("Invert $\\sigma_1=\\sigma_3N+2c\\sqrt N$ for $\\sigma_3$.", `$$\\sigma_3=\\frac{\\sigma_1-2c\\sqrt N}{N}=\\frac{${s1}-2(${c})\\sqrt{${fmt(N)}}}{${fmt(N)}}=${fmt(s3)}$$`, `$c=${c},\\ \\phi=${phi}^{\\circ}$.`, fmt(s3), r2(s3 - 0.1), r2(s3 + 0.1)) }); },
  (rng) => { const W = ri(rng, 4, 8), Wp = ri(rng, 6, 12), H = ri(rng, 3, 6); const sigPillar = 1; const extract = (W) / (W + Wp); const er = extract * 100;
    return nat({ topic: "Pillar Design — Extraction Ratio", difficulty: "medium", marks: 2,
      stem: `Square pillars of side $${Wp}\\,\\text{m}$ are separated by $${W}\\,\\text{m}$ wide openings (plan view). Find the extraction ratio (%). Round off to two decimal places.`, answer: (1 - (Wp * Wp) / ((Wp + W) ** 2)) * 100, tolerance: 0.1,
      figure: figSvg(`<svg viewBox='0 0 220 160' xmlns='http://www.w3.org/2000/svg'><rect x='30' y='30' width='${6 * Wp}' height='${6 * Wp}' fill='#94a3b8'/><rect x='${30 + 6 * (Wp + W)}' y='30' width='${6 * Wp}' height='${6 * Wp}' fill='#94a3b8'/><rect x='30' y='${30 + 6 * (Wp + W)}' width='${6 * Wp}' height='${6 * Wp}' fill='#94a3b8'/><rect x='${30 + 6 * (Wp + W)}' y='${30 + 6 * (Wp + W)}' width='${6 * Wp}' height='${6 * Wp}' fill='#94a3b8'/><text x='110' y='150' text-anchor='middle' font-family='sans-serif' font-size='10' fill='#475569'>pillars ${Wp} m, openings ${W} m</text></svg>`, "Pillar plan"),
      solution: solN("Extraction ratio $e=1-\\dfrac{W_p^2}{(W_p+W_o)^2}$ for square pillars.", `$$e=1-\\frac{${Wp}^2}{(${Wp}+${W})^2}=${fmt((1 - (Wp * Wp) / ((Wp + W) ** 2)) * 100)}\\%$$`, `$W_p=${Wp},\\ W_o=${W}$.`, fmt((1 - (Wp * Wp) / ((Wp + W) ** 2)) * 100), r2((1 - (Wp * Wp) / ((Wp + W) ** 2)) * 100 - 0.1), r2((1 - (Wp * Wp) / ((Wp + W) ** 2)) * 100 + 0.1)) }); },
];

/* ---------------- Archetype D — multi-stage rank determinators ------ */
const D = [
  (rng) => { const s3a = rf(rng, 2, 6), s1a = rf(rng, 30, 45), s3b = rf(rng, 10, 16), s1b = rf(rng, 60, 80);
    // two triaxial tests -> solve c, phi. slope m = (s1b-s1a)/(s3b-s3a) = N; intercept = 2c sqrt(N)
    const N = (s1b - s1a) / (s3b - s3a); const phi = deg(Math.asin((N - 1) / (N + 1))); const inter = s1a - N * s3a; const c = inter / (2 * Math.sqrt(N));
    return nat({ topic: "Triaxial — Friction Angle from Two Tests", difficulty: "hard", marks: 2,
      stem: `Two triaxial tests give $(\\sigma_3,\\sigma_1)=(${s3a},${s1a})$ and $(${s3b},${s1b})\\,\\text{MPa}$. Find the friction angle $\\phi$ (degrees). Round off to two decimal places.`, answer: phi, tolerance: 0.2,
      solution: solN("Slope of $\\sigma_1$–$\\sigma_3$ line $=N_\\phi$; $\\sin\\phi=(N-1)/(N+1)$.", `$$N=\\frac{${s1b}-${s1a}}{${s3b}-${s3a}}=${fmt(N)};\\ \\phi=\\sin^{-1}\\frac{N-1}{N+1}=${fmt(phi)}^{\\circ}$$`, `two tests.`, fmt(phi), r2(phi - 0.2), r2(phi + 0.2)) }); },
  (rng) => { const s3a = rf(rng, 2, 6), s1a = rf(rng, 30, 45), s3b = rf(rng, 10, 16), s1b = rf(rng, 60, 80); const N = (s1b - s1a) / (s3b - s3a); const inter = s1a - N * s3a; const c = inter / (2 * Math.sqrt(N));
    return nat({ topic: "Triaxial — Cohesion from Two Tests", difficulty: "hard", marks: 2,
      stem: `From the same two tests $(${s3a},${s1a})$, $(${s3b},${s1b})\\,\\text{MPa}$, find the cohesion $c$ (MPa). Round off to two decimal places.`, answer: c, tolerance: 0.1,
      solution: solN("Intercept of the $\\sigma_1$–$\\sigma_3$ line $=2c\\sqrt N$.", `$$N=${fmt(N)},\\ \\text{intercept}=${fmt(inter)};\\ c=\\frac{${fmt(inter)}}{2\\sqrt{${fmt(N)}}}=${fmt(c)}$$`, `two tests.`, fmt(c), r2(c - 0.1), r2(c + 0.1)) }); },
  (rng) => { const rho = ri(rng, 2400, 2800), H = ri(rng, 200, 600), k = rf(rng, 0.4, 1.0); const sv = rho * 9.81 * H / 1e6; const sh = k * sv; const sigTheta = 3 * sv - sh;
    return nat({ topic: "Opening at Depth — Boundary Stress", difficulty: "hard", marks: 2,
      stem: `At depth $${H}\\,\\text{m}$ (rock $${rho}\\,\\text{kg/m}^3$, $k=${k}$), a circular tunnel is driven. Find the peak tangential stress in the sidewall (MPa). Round off to two decimal places.`, answer: sigTheta, tolerance: 0.1,
      solution: solN("Compute $\\sigma_v=\\rho gH$, $\\sigma_h=k\\sigma_v$, then Kirsch $\\sigma_\\theta=3\\sigma_v-\\sigma_h$.", `$$\\sigma_v=${fmt(sv)},\\ \\sigma_h=${fmt(sh)};\\ \\sigma_\\theta=3\\sigma_v-\\sigma_h=${fmt(sigTheta)}$$`, `$H=${H},\\ k=${k}$.`, fmt(sigTheta), r2(sigTheta - 0.1), r2(sigTheta + 0.1)) }); },
  (rng) => { const c = rf(rng, 15, 40), gamma = ri(rng, 18, 25), H = ri(rng, 8, 16), beta = ri(rng, 50, 70), phi = ri(rng, 25, 35), ru = pick(rng, [0, 0.25, 0.5]);
    const b = rad(beta); const num = c + (gamma * H * Math.cos(b) ** 2 - ru * gamma * H) * Math.tan(rad(phi)); const den = gamma * H * Math.sin(b) * Math.cos(b); const fos = num / den;
    return nat({ topic: "Slope Stability — With Pore Pressure", difficulty: "hard", marks: 2,
      stem: `Infinite slope with pore-pressure ratio $r_u=${ru}$ ($c=${c}\\,\\text{kPa}$, $\\gamma=${gamma}$, $H=${H}\\,\\text{m}$, $\\beta=${beta}^{\\circ}$, $\\phi=${phi}^{\\circ}$). Find the factor of safety. Round off to two decimal places.`, answer: fos, tolerance: 0.05,
      solution: solN("Reduce the normal stress by pore pressure $u=r_u\\gamma H$ in the friction term.", `$$F=\\frac{c+(\\gamma H\\cos^2\\beta-r_u\\gamma H)\\tan\\phi}{\\gamma H\\sin\\beta\\cos\\beta}=${fmt(fos)}$$`, `$r_u=${ru}$.`, fmt(fos), r2(fos - 0.05), r2(fos + 0.05)) }); },
  (rng) => { const sigUCS = ri(rng, 80, 160), W = ri(rng, 5, 9), H = ri(rng, 3, 6); const sp = sigUCS * (0.778 + 0.222 * W / H);
    return nat({ topic: "Pillar Strength — Obert–Duvall", difficulty: "hard", marks: 2,
      stem: `Using Obert–Duvall, find the strength of a pillar with $W/H$ from $W=${W}$, $H=${H}\\,\\text{m}$ and specimen strength $${sigUCS}\\,\\text{MPa}$. Round off to two decimal places.`, answer: sp, tolerance: 0.2,
      solution: solN("$S_p=\\sigma_1(0.778+0.222\\,W/H)$.", `$$S_p=${sigUCS}(0.778+0.222\\times\\tfrac{${W}}{${H}})=${fmt(sp)}\\ \\text{MPa}$$`, `$W=${W},\\ H=${H}$.`, fmt(sp), r2(sp - 0.2), r2(sp + 0.2)) }); },
  (rng) => { const sp = ri(rng, 30, 60), depth = ri(rng, 150, 400), rho = 2500, W = ri(rng, 5, 9), Wo = ri(rng, 4, 7); const sv = rho * 9.81 * depth / 1e6; const pillarStress = sv * Math.pow((W + Wo) / W, 2); const fos = sp / pillarStress;
    return nat({ topic: "Pillar — Factor of Safety (Tributary)", difficulty: "hard", marks: 2,
      stem: `Square pillars ($W=${W}$, opening $${Wo}\\,\\text{m}$) at depth $${depth}\\,\\text{m}$ (rock $2500\\,\\text{kg/m}^3$) have strength $${sp}\\,\\text{MPa}$. Find the FoS by tributary area. Round off to two decimal places.`, answer: fos, tolerance: 0.05,
      solution: solN("Tributary stress $=\\sigma_v\\left(\\tfrac{W+W_o}{W}\\right)^2$; $FoS=S_p/\\sigma_p$.", `$$\\sigma_v=${fmt(sv)};\\ \\sigma_p=${fmt(pillarStress)};\\ FoS=${fmt(fos)}$$`, `$W=${W},\\ W_o=${Wo}$.`, fmt(fos), r2(fos - 0.05), r2(fos + 0.05)) }); },
  (rng) => { const E = ri(rng, 20, 50), I = 1, w = rf(rng, 10, 30), L = ri(rng, 3, 6), t = rf(rng, 0.3, 0.8); const sigmax = 3 * w * L * L / (4 * t * t) / 1000;
    return nat({ topic: "Roof Beam — Maximum Bending Stress", difficulty: "hard", marks: 2,
      stem: `A clamped roof beam (span $${L}\\,\\text{m}$, thickness $${t}\\,\\text{m}$) carries UDL $${w}\\,\\text{kPa}$. Find the maximum bending stress (MPa) using $\\sigma=\\tfrac{wL^2}{2t^2}$ (per unit width, fixed ends factor). Round off to two decimal places.`, answer: w * L * L / (2 * t * t) / 1000, tolerance: 0.05,
      solution: solN("For a fixed-end beam, $\\sigma_{max}=\\dfrac{wL^2}{2t^2}$ (per unit width).", `$$\\sigma=\\frac{${w}\\times${L}^2}{2\\times${t}^2}=${fmt(w * L * L / (2 * t * t))}\\,\\text{kPa}=${fmt(w * L * L / (2 * t * t) / 1000)}\\,\\text{MPa}$$`, `$L=${L},\\ t=${t},\\ w=${w}$.`, fmt(w * L * L / (2 * t * t) / 1000), r2(w * L * L / (2 * t * t) / 1000 - 0.05), r2(w * L * L / (2 * t * t) / 1000 + 0.05)) }); },
  (rng) => { const s1 = rf(rng, 40, 90), s3 = rf(rng, 5, 18), sigt = rf(rng, 3, 8); const ratio = (s1 - s3) / 2 / ((s1 + s3) / 2 + sigt);
    return nat({ topic: "Failure — Mohr Circle Tangency Check", difficulty: "hard", marks: 2,
      stem: `A Mohr circle has $\\sigma_1=${s1}$, $\\sigma_3=${s3}$; the cut-off tensile strength is $${sigt}\\,\\text{MPa}$. Find $\\sin\\phi$ required for tangency $=\\dfrac{(\\sigma_1-\\sigma_3)/2}{(\\sigma_1+\\sigma_3)/2+\\sigma_t}$. Round off to two decimal places.`, answer: ratio, tolerance: 0.02,
      solution: solN("For tangency of the envelope to the circle, $\\sin\\phi=\\dfrac{r}{c\\cot\\phi+\\bar\\sigma}$; here expressed with the tensile cut-off.", `$$\\sin\\phi=\\frac{${r2((s1 - s3) / 2)}}{${r2((s1 + s3) / 2)}+${sigt}}=${fmt(ratio)}$$`, `$\\sigma_1=${s1},\\ \\sigma_3=${s3}$.`, fmt(ratio), r2(ratio - 0.02), r2(ratio + 0.02)) }); },
  (rng) => { const Q = pick(rng, [1, 4, 10, 20]), Jn = pick(rng, [4, 6, 9]), Jr = pick(rng, [1.5, 2, 3]), Ja = pick(rng, [1, 2, 4]); const Qval = (100 / Jn) * (Jr / Ja) * (1 / 1);
    // RMR ~ 9 ln Q + 44
    const rmr = 9 * Math.log(Qval) + 44;
    return nat({ topic: "Rock Mass — Q to RMR", difficulty: "hard", marks: 2,
      stem: `With RQD $=100$, $J_n=${Jn}$, $J_r=${Jr}$, $J_a=${Ja}$ (SRF=1, $J_w=1$), find the equivalent RMR using $RMR=9\\ln Q+44$. Round off to two decimal places.`, answer: rmr, tolerance: 0.2,
      solution: solN("Compute $Q=\\tfrac{RQD}{J_n}\\tfrac{J_r}{J_a}\\tfrac{J_w}{SRF}$ then convert.", `$$Q=\\frac{100}{${Jn}}\\times\\frac{${Jr}}{${Ja}}=${fmt(Qval)};\\ RMR=9\\ln Q+44=${fmt(rmr)}$$`, `$J_n=${Jn},\\ J_r=${Jr},\\ J_a=${Ja}$.`, fmt(rmr), r2(rmr - 0.2), r2(rmr + 0.2)) }); },
  (rng) => { const sigc = ri(rng, 80, 160), depth = ri(rng, 300, 800), rho = 2600; const sv = rho * 9.81 * depth / 1e6; const SF = sigc / sv;
    return nat({ topic: "Stress — Strength/Stress Ratio", difficulty: "hard", marks: 2,
      stem: `Rock UCS is $${sigc}\\,\\text{MPa}$; at depth $${depth}\\,\\text{m}$ (rock $2600\\,\\text{kg/m}^3$) find the strength-to-vertical-stress ratio. Round off to two decimal places.`, answer: SF, tolerance: 0.05,
      solution: solN("Compute $\\sigma_v=\\rho gH$ then divide UCS by it.", `$$\\sigma_v=${fmt(sv)};\\ \\frac{\\sigma_c}{\\sigma_v}=\\frac{${sigc}}{${fmt(sv)}}=${fmt(SF)}$$`, `$\\sigma_c=${sigc},\\ H=${depth}$.`, fmt(SF), r2(SF - 0.05), r2(SF + 0.05)) }); },
];

export default { slug: "rock-mechanics", name: "Rock Mechanics", subjectTag: SUB, pools: { A, B, C, D } };
