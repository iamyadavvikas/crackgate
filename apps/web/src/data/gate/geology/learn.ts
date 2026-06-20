/**
 * GATE Geology & Geophysics (GG) — Topic-Wise Learn & Solve content.
 *
 * Reuses the exact LearnTopic / LearnModule / LearnSyllabus model from the
 * mining Learn engine (`@/data/learn`) so the runner, gating and syllabus
 * dashboard work unchanged. Live sub-topics resolve to an authored LearnTopic;
 * the rest render as a "coming soon" roadmap mirroring the full GATE GG
 * (Geology stream) syllabus. See docs/gate-gg-syllabus.md.
 */
import type {
  LearnTopic,
  LearnReference,
  LearnSyllabusSection,
  LearnSyllabusSubtopic,
} from "@/data/learn";

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 1 — Mathematics & Geostatistics                               */
/* ════════════════════════════════════════════════════════════════════ */

const ggGeostatistics: LearnTopic = {
  slug: "gg-em-geostatistics",
  subject: "Mathematics & Geostatistics",
  title: "Statistics & Geostatistics",
  tier: "free",
  blurb:
    "Mean, variance and the semivariogram — the quantitative backbone GATE GG leans on for assay data, grade estimation and geophysical signal handling.",
  module: {
    principle:
      "Geological data are **samples** of a spatially-varying field. **Descriptive statistics** (mean, variance) summarise the spread of assay or measurement values, while **geostatistics** adds the spatial dimension: the **semivariogram** $\\gamma(h)$ measures how dissimilar two samples become as the separation (**lag**) $h$ grows. Its **nugget** captures micro-scale variance and measurement error, the **sill** is the plateau variance, and the **range** is the lag beyond which samples are no longer correlated. **Kriging** uses this model to interpolate grades as a best linear unbiased estimator.",
    formulaMatrix: [
      "**Arithmetic mean**: $\\bar x = \\dfrac{1}{n}\\sum x_i$",
      "",
      "**Population variance**: $\\sigma^2 = \\dfrac{1}{n}\\sum (x_i-\\bar x)^2$",
      "",
      "**Coefficient of variation**: $CV = \\sigma/\\bar x$ (high $CV$ ⇒ erratic, nuggety grades).",
      "",
      "**Experimental semivariogram**: $\\gamma(h)=\\dfrac{1}{2N(h)}\\sum [z(x_i)-z(x_i+h)]^2$",
      "",
      "**Spherical model**: rises from the nugget $C_0$ to the sill $C_0+C$ over the range $a$.",
    ].join("\n"),
    traps: [
      "**Range vs sill.** The *range* is a distance (lag), the *sill* is a variance — never interchange them.",
      "**Nugget ≠ zero.** A finite intercept at $h=0$ reflects real micro-variability plus sampling error, not a mistake.",
      "**Skewed grades.** Gold/precious-metal grades are log-normal; use the geometric mean or log-transform before kriging, not the raw arithmetic mean.",
    ],
  },
  questions: [
    {
      id: "gg-geostat-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "The arithmetic mean of the assay values $\\{2, 4, 6, 8, 10\\}$ g/t is _____ g/t.",
      natAnswer: 6, acceptedRange: [5.99, 6.01], unit: "g/t",
      solution: { given: "Five values; $n=5$.", derivation: "$\\bar x=(2+4+6+8+10)/5=30/5$.", target: "$6$ g/t." },
    },
    {
      id: "gg-geostat-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "For the data $\\{4, 6, 8\\}$, the population variance is _____.",
      natAnswer: 2.667, acceptedRange: [2.6, 2.73],
      solution: { given: "$\\bar x=6$.", derivation: "$\\sigma^2=\\tfrac13[(4-6)^2+(6-6)^2+(8-6)^2]=\\tfrac13(4+0+4)$.", target: "$2.67$." },
    },
    {
      id: "gg-geostat-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "On a spherical semivariogram, the lag distance at which the model first reaches its sill is the",
      options: ["range", "nugget", "sill variance", "lag tolerance"], answer: 0,
      solution: { given: "Spherical model.", derivation: "The semivariogram flattens at the sill once samples become uncorrelated.", target: "That lag is the **range**." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 2 — Earth System & Geomorphology                             */
/* ════════════════════════════════════════════════════════════════════ */

const ggEarthInterior: LearnTopic = {
  slug: "gg-es-earth-interior",
  subject: "Earth System & Geomorphology",
  title: "Earth's Interior & Plate Tectonics",
  tier: "free",
  blurb:
    "Seismic discontinuities, isostasy and plate boundaries — the Part-A backbone that fixes the structure and dynamics of the planet.",
  module: {
    principle:
      "The Earth is **layered** — crust, mantle, outer (liquid) and inner (solid) core — boundaries first revealed by **seismic-velocity jumps**. The **Mohorovičić discontinuity** separates crust from mantle; the **Gutenberg discontinuity** marks the mantle–core boundary (where S-waves vanish, proving the outer core is liquid). **Isostasy** is the buoyant balance of crustal blocks floating on the denser mantle (Airy = variable-thickness roots; Pratt = variable density). **Plate tectonics** ties it together: lithospheric plates diverge at ridges (sea-floor spreading, recorded by symmetric magnetic stripes), converge at subduction zones, and slide past at transforms.",
    formulaMatrix: [
      "**Airy root**: $r=\\dfrac{\\rho_c}{\\rho_m-\\rho_c}\\,h$ (root below a mountain of height $h$).",
      "",
      "**Lithostatic pressure**: $P=\\rho g z$.",
      "",
      "**Plate displacement**: $d = v\\,t$ — $1\\,\\text{cm/yr}\\times1\\,\\text{Myr}=10\\,\\text{km}$.",
      "",
      "**Geothermal gradient (upper crust)**: ≈ 25–30 °C/km.",
    ].join("\n"),
    traps: [
      "**Moho vs Gutenberg.** Moho = crust/mantle; Gutenberg = mantle/core. Do not confuse them.",
      "**S-wave shadow.** The S-wave shadow zone proves the *outer* core is liquid — the inner core is solid.",
      "**Airy vs Pratt.** Airy varies crustal *thickness*; Pratt varies crustal *density*.",
    ],
  },
  questions: [
    {
      id: "gg-earth-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The seismic discontinuity separating the crust from the mantle is the",
      options: ["Mohorovičić discontinuity", "Gutenberg discontinuity", "Lehmann discontinuity", "Conrad discontinuity"], answer: 0,
      solution: { given: "Layered Earth.", derivation: "Moho = crust/mantle; Gutenberg = mantle/core; Lehmann = inner/outer core.", target: "**Moho**." },
    },
    {
      id: "gg-earth-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "Airy isostasy with $\\rho_c=2.67$ and $\\rho_m=3.27$ g/cm³. The crustal root beneath a $3\\,$km-high mountain is _____ km.",
      natAnswer: 13.35, acceptedRange: [13.0, 13.7], unit: "km",
      solution: { given: "$h=3$ km.", derivation: "$r=\\dfrac{2.67}{3.27-2.67}\\times3=4.45\\times3$.", target: "$13.35$ km." },
    },
    {
      id: "gg-earth-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "A plate moves at $5\\,$cm/yr. The displacement accumulated in $10\\,$Myr is _____ km.",
      natAnswer: 500, acceptedRange: [499, 501], unit: "km",
      solution: { given: "$v=5$ cm/yr, $t=10$ Myr.", derivation: "$5\\,\\text{cm/yr}\\times10^7\\,\\text{yr}=5\\times10^7\\,\\text{cm}=500\\,\\text{km}$.", target: "$500$ km." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 3 — Structural Geology                                        */
/* ════════════════════════════════════════════════════════════════════ */

const ggStress: LearnTopic = {
  slug: "gg-sg-stress-mohr",
  subject: "Structural Geology",
  title: "Stress, Strain & the Mohr Circle",
  tier: "free",
  blurb:
    "Resolve normal and shear stress on any plane, read principal stresses off a stress block, and predict fault orientation with the Mohr–Coulomb criterion.",
  module: {
    principle:
      "**Stress** at a point is a tensor: on any plane it resolves into a **normal** ($\\sigma_n$) and **shear** ($\\tau$) component. The **Mohr circle** plots all $(\\sigma_n,\\tau)$ pairs as the plane orientation rotates — its centre is the mean stress $(\\sigma_1+\\sigma_3)/2$ and its radius is the maximum shear $(\\sigma_1-\\sigma_3)/2$. Rock fails along planes where the Mohr circle touches the **Coulomb failure envelope** $\\tau=c+\\sigma_n\\tan\\phi$; these conjugate shear planes lie at $45^\\circ-\\phi/2$ to $\\sigma_1$.",
    formulaMatrix: [
      "**Normal stress on a plane** (normal at $\\theta$ to $\\sigma_1$): $\\sigma_n=\\dfrac{\\sigma_1+\\sigma_3}{2}+\\dfrac{\\sigma_1-\\sigma_3}{2}\\cos2\\theta$",
      "",
      "**Shear stress**: $\\tau=\\dfrac{\\sigma_1-\\sigma_3}{2}\\sin2\\theta$",
      "",
      "**Principal stresses (from $\\sigma_x,\\sigma_y,\\tau_{xy}$)**: $\\sigma_{1,3}=\\dfrac{\\sigma_x+\\sigma_y}{2}\\pm\\sqrt{\\left(\\dfrac{\\sigma_x-\\sigma_y}{2}\\right)^2+\\tau_{xy}^2}$",
      "",
      "**Maximum shear**: $\\tau_{max}=\\dfrac{\\sigma_1-\\sigma_3}{2}$",
      "",
      "**Coulomb failure**: $\\tau=c+\\sigma_n\\tan\\phi$; conjugate shears at $45^\\circ-\\phi/2$ to $\\sigma_1$.",
    ].join("\n"),
    traps: [
      "**$2\\theta$, not $\\theta$.** The angle on the Mohr circle is twice the physical plane angle.",
      "**Max shear ≠ on the σ₁ plane.** Maximum shear acts on planes at $45^\\circ$ to $\\sigma_1$, where $\\tau=(\\sigma_1-\\sigma_3)/2$.",
      "**Sign of τ.** Track the sense of shear consistently; magnitude is $\\dfrac{\\sigma_1-\\sigma_3}{2}\\sin2\\theta$.",
    ],
    figure: { kind: "mohr", sigma1: 120, sigma3: 40, phi: 30, cohesion: 10, caption: "Mohr circle with a Coulomb failure envelope (φ=30°, c=10)." },
  },
  questions: [
    {
      id: "gg-stress-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "With $\\sigma_1=120\\,$MPa and $\\sigma_3=40\\,$MPa, the maximum shear stress is _____ MPa.",
      natAnswer: 40, acceptedRange: [39.9, 40.1], unit: "MPa",
      figure: { kind: "mohr", sigma1: 120, sigma3: 40, caption: "σ₁=120, σ₃=40 MPa." },
      solution: { given: "$\\sigma_1=120,\\ \\sigma_3=40$.", derivation: "$\\tau_{max}=(\\sigma_1-\\sigma_3)/2=(120-40)/2$.", target: "$40$ MPa." },
    },
    {
      id: "gg-stress-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "With $\\sigma_1=120$ and $\\sigma_3=40\\,$MPa, the normal stress on a plane whose normal makes $30^\\circ$ with $\\sigma_1$ is _____ MPa.",
      natAnswer: 100, acceptedRange: [99.5, 100.5], unit: "MPa",
      figure: { kind: "mohr", sigma1: 120, sigma3: 40, caption: "Plane at 30° to σ₁." },
      solution: { given: "$\\theta=30^\\circ$.", derivation: "$\\sigma_n=\\tfrac{120+40}{2}+\\tfrac{120-40}{2}\\cos60^\\circ=80+40(0.5)$.", target: "$100$ MPa." },
    },
    {
      id: "gg-stress-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "At a point $\\sigma_x=100$, $\\sigma_y=20$, $\\tau_{xy}=30\\,$MPa. The major principal stress $\\sigma_1$ is _____ MPa.",
      natAnswer: 110, acceptedRange: [109.5, 110.5], unit: "MPa",
      figure: { kind: "stress-block", sx: 100, sy: 20, txy: 30, caption: "σx=100, σy=20, τxy=30 MPa." },
      solution: { given: "$\\sigma_x=100,\\sigma_y=20,\\tau_{xy}=30$.", derivation: "$\\sigma_1=60+\\sqrt{40^2+30^2}=60+50$.", target: "$110$ MPa." },
    },
  ],
};

const ggStereonet: LearnTopic = {
  slug: "gg-sg-stereographic",
  subject: "Structural Geology",
  title: "Stereographic Projection & Apparent Dip",
  tier: "subject",
  blurb:
    "Plot planes and lines on the stereonet and convert true dip to the apparent dip seen in any cross-section or mine drift.",
  module: {
    principle:
      "Orientations of planes and lines are analysed on a **stereonet** (equal-area Schmidt net). A **plane** plots as a **great circle**; its **pole** (normal) plots as a single point. The **true dip** is the steepest inclination on a plane, measured perpendicular to strike. In any other vertical section the bed appears gentler — the **apparent dip** — given by $\\tan\\delta_{app}=\\tan\\delta_{true}\\sin\\beta$, where $\\beta$ is the angle between the section line and the strike. When $\\beta=90^\\circ$ (section ⟂ strike) the apparent dip equals the true dip.",
    formulaMatrix: [
      "**Apparent dip**: $\\tan\\delta_{app}=\\tan\\delta_{true}\\,\\sin\\beta$ ($\\beta$ = angle between section line and strike).",
      "",
      "**Dip direction** (right-hand rule): strike $+\\,90^\\circ$.",
      "",
      "**True thickness** (horizontal traverse ⟂ strike, width $w$): $t=w\\sin\\delta$.",
    ].join("\n"),
    traps: [
      "**Apparent ≤ true.** The apparent dip is always smaller than (or equal to) the true dip.",
      "**β from strike, not dip direction.** $\\beta$ is measured from the strike line; mixing it with the dip direction inverts the sine.",
      "**Plane = great circle; pole = point.** Don't plot a plane as a point.",
    ],
    figure: { kind: "stereonet", planes: [{ strike: 0, dip: 45, label: "Bed 000°/45°" }], caption: "A bed dipping 45° plotted as a great circle." },
  },
  questions: [
    {
      id: "gg-stereo-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A bed has a true dip of $45^\\circ$. In a vertical section making $30^\\circ$ with the strike, the apparent dip is _____ degrees.",
      natAnswer: 26.57, acceptedRange: [26.2, 26.9], unit: "°",
      figure: { kind: "stereonet", planes: [{ strike: 0, dip: 45, label: "Bed dip 45°" }], caption: "Section at 30° to strike." },
      solution: { given: "$\\delta=45^\\circ$, $\\beta=30^\\circ$.", derivation: "$\\tan\\delta_{app}=\\tan45^\\circ\\sin30^\\circ=1\\times0.5=0.5$.", target: "$\\tan^{-1}0.5=26.57^\\circ$." },
    },
    {
      id: "gg-stereo-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "On a stereonet, a dipping plane is represented by a",
      options: ["great circle", "single point", "small circle only", "horizontal diameter"], answer: 0,
      solution: { given: "Equal-area net.", derivation: "Planes project as great circles; their poles as points.", target: "**Great circle**." },
    },
    {
      id: "gg-stereo-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "A bed dipping $30^\\circ$ crops out across a horizontal width of $500\\,$m perpendicular to strike. Its true thickness is _____ m.",
      natAnswer: 250, acceptedRange: [249, 251], unit: "m",
      solution: { given: "$\\delta=30^\\circ$, $w=500$ m.", derivation: "$t=w\\sin\\delta=500\\sin30^\\circ=500\\times0.5$.", target: "$250$ m." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 4 — Mineralogy & Petrology                                    */
/* ════════════════════════════════════════════════════════════════════ */

const ggCrystallography: LearnTopic = {
  slug: "gg-mn-crystallography",
  subject: "Mineralogy & Crystallography",
  title: "Crystallography & X-ray Diffraction",
  tier: "subject",
  blurb:
    "Seven crystal systems, Miller indices and Bragg's law — how symmetry and X-rays fix the atomic architecture of minerals.",
  module: {
    principle:
      "Crystals are periodic atomic lattices classified by **symmetry**: **7 crystal systems**, **14 Bravais lattices**, **32 point groups** (crystal classes) and **230 space groups**. Lattice planes are labelled by **Miller indices** $(hkl)$. **X-ray diffraction** probes the spacing between these planes: constructive interference occurs when **Bragg's law** $n\\lambda=2d\\sin\\theta$ is satisfied, and for a cubic crystal the interplanar spacing is $d_{hkl}=a/\\sqrt{h^2+k^2+l^2}$.",
    formulaMatrix: [
      "**Cubic interplanar spacing**: $d_{hkl}=\\dfrac{a}{\\sqrt{h^2+k^2+l^2}}$",
      "",
      "**Bragg's law**: $n\\lambda=2d\\sin\\theta$",
      "",
      "**Unit-cell density**: $\\rho=\\dfrac{ZM}{N_A\\,a^3}$ ($Z$ formula units, $M$ molar mass).",
      "",
      "**Symmetry hierarchy**: 7 systems · 14 Bravais · 32 classes · 230 space groups.",
    ].join("\n"),
    traps: [
      "**$\\sin\\theta$, not $\\theta$.** Solve Bragg's law for $\\sin\\theta$ first, then take the inverse sine.",
      "**Sum of squares.** $d$ depends on $h^2+k^2+l^2$ — square each index before adding.",
      "**Å vs nm.** Keep wavelength and cell edge in the same unit (Å).",
    ],
  },
  questions: [
    {
      id: "gg-cryst-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The number of crystal systems and Bravais lattices are, respectively,",
      options: ["7 and 14", "6 and 14", "7 and 32", "14 and 230"], answer: 0,
      solution: { given: "Crystal symmetry hierarchy.", derivation: "7 systems, 14 Bravais lattices, 32 classes, 230 space groups.", target: "**7 and 14**." },
    },
    {
      id: "gg-cryst-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "Halite is cubic with $a=5.64\\,$Å. The $d_{200}$ spacing is _____ Å.",
      natAnswer: 2.82, acceptedRange: [2.80, 2.84], unit: "Å",
      solution: { given: "$a=5.64$ Å, $(hkl)=(200)$.", derivation: "$d=5.64/\\sqrt{2^2+0+0}=5.64/2$.", target: "$2.82$ Å." },
    },
    {
      id: "gg-cryst-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "X-rays ($\\lambda=1.54\\,$Å) reflect (first order) from planes with $d=3.08\\,$Å. The Bragg angle $\\theta$ is _____ degrees.",
      natAnswer: 14.48, acceptedRange: [14.0, 15.0], unit: "°",
      solution: { given: "$n=1,\\ \\lambda=1.54,\\ d=3.08$.", derivation: "$\\sin\\theta=\\lambda/2d=1.54/6.16=0.25$.", target: "$\\theta=\\sin^{-1}0.25=14.48^\\circ$." },
    },
  ],
};

const ggIgneous: LearnTopic = {
  slug: "gg-pt-igneous",
  subject: "Mineralogy & Petrology",
  title: "Igneous Petrology & Bowen's Series",
  tier: "subject",
  blurb:
    "Silica classification, Bowen's reaction series and fractional crystallisation — how magmas evolve from basalt to granite.",
  module: {
    principle:
      "Igneous rocks are classified by **silica content** (ultramafic <45 %, mafic 45–52 %, intermediate 52–65 %, felsic >65 %) and **grain size** (coarse plutonic vs fine volcanic). **Bowen's reaction series** describes the order of crystallisation: a **discontinuous** ferromagnesian branch (olivine → pyroxene → amphibole → biotite) and a **continuous** plagioclase branch (Ca-rich → Na-rich), converging on K-feldspar → muscovite → quartz. **Fractional crystallisation** removes early crystals, driving the residual melt toward silica-rich (felsic) compositions.",
    formulaMatrix: [
      "**SiO₂ classes**: ultramafic <45 % · mafic 45–52 % · intermediate 52–65 % · felsic >65 %.",
      "",
      "**Plutonic ↔ volcanic pairs**: granite↔rhyolite · diorite↔andesite · gabbro↔basalt · peridotite↔komatiite.",
      "",
      "**Forsterite number**: $Fo\\#=100\\,\\dfrac{Mg}{Mg+Fe}$.",
      "",
      "**Batch melting**: $C_L=\\dfrac{C_0}{D+F(1-D)}$.",
    ].join("\n"),
    traps: [
      "**Felsic = light, mafic = dark.** Felsic rocks are silica-rich and pale; mafic are Fe–Mg-rich and dark.",
      "**Grain size ≠ composition.** Granite and rhyolite share composition but differ in cooling rate.",
      "**Bowen order.** Olivine crystallises first (highest T); quartz last (lowest T).",
    ],
  },
  questions: [
    {
      id: "gg-ign-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The fine-grained volcanic equivalent of granite is",
      options: ["rhyolite", "basalt", "andesite", "gabbro"], answer: 0,
      solution: { given: "Felsic composition.", derivation: "Granite (plutonic) ↔ rhyolite (volcanic).", target: "**Rhyolite**." },
    },
    {
      id: "gg-ign-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "In Bowen's discontinuous series the first ferromagnesian mineral to crystallise is",
      options: ["olivine", "biotite", "amphibole", "quartz"], answer: 0,
      solution: { given: "Reaction series.", derivation: "olivine → pyroxene → amphibole → biotite.", target: "**Olivine**." },
    },
    {
      id: "gg-ign-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "Batch melting: $C_0=20\\,$ppm, bulk $D=0.05$, melt fraction $F=0.1$. The melt concentration $C_L$ is _____ ppm.",
      natAnswer: 137.93, acceptedRange: [135, 141], unit: "ppm",
      solution: { given: "$C_0=20,\\ D=0.05,\\ F=0.1$.", derivation: "$C_L=20/(0.05+0.1\\times0.95)=20/0.145$.", target: "$137.9$ ppm." },
    },
  ],
};

const ggSedimentary: LearnTopic = {
  slug: "gg-pt-sedimentary",
  subject: "Mineralogy & Petrology",
  title: "Sedimentology & Grain Size",
  tier: "subject",
  blurb:
    "The Udden–Wentworth scale, phi units, sorting and Stokes settling — quantifying clastic sediments and their depositional energy.",
  module: {
    principle:
      "Clastic sediments are described by **grain size** (Udden–Wentworth: clay <1/256 mm, silt 1/256–1/16 mm, sand 1/16–2 mm, gravel >2 mm), expressed on the logarithmic **phi scale** $\\phi=-\\log_2 d_{mm}$. **Sorting** (the spread of grain sizes) and **rounding** record transport energy and distance: a well-sorted, well-rounded quartz arenite is **mature**. Settling of fine grains obeys **Stokes' law**, where velocity scales with the square of diameter.",
    formulaMatrix: [
      "**Phi scale**: $\\phi=-\\log_2 d_{mm}$ (small/negative $\\phi$ = coarse).",
      "",
      "**Stokes settling velocity**: $v_s=\\dfrac{g(\\rho_s-\\rho_w)d^2}{18\\mu}$",
      "",
      "**Graphic sorting**: $\\sigma_\\phi\\approx\\dfrac{\\phi_{84}-\\phi_{16}}{2}$",
      "",
      "**Uniformity coefficient**: $C_u=d_{60}/d_{10}$.",
    ].join("\n"),
    traps: [
      "**Phi sign.** Coarser grains have *smaller* (even negative) $\\phi$; $-\\log_2$ flips the order.",
      "**Stokes ∝ d².** Halving grain diameter quarters the settling velocity.",
      "**Sorting vs grain size.** Sorting is the *spread*, not the average size.",
    ],
  },
  questions: [
    {
      id: "gg-sed-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A sand grain is $0.25\\,$mm in diameter. Its phi ($\\phi$) value is _____.",
      natAnswer: 2, acceptedRange: [1.99, 2.01],
      solution: { given: "$d=0.25$ mm.", derivation: "$\\phi=-\\log_2(0.25)=-(-2)$.", target: "$2$." },
    },
    {
      id: "gg-sed-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "On the Udden–Wentworth scale, particles between 1/16 mm and 2 mm are",
      options: ["sand", "silt", "clay", "gravel"], answer: 0,
      solution: { given: "Grain-size limits.", derivation: "Sand spans 1/16–2 mm.", target: "**Sand**." },
    },
    {
      id: "gg-sed-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "A sand has $d_{60}=0.9\\,$mm and $d_{10}=0.3\\,$mm. Its uniformity coefficient $C_u$ is _____.",
      natAnswer: 3, acceptedRange: [2.95, 3.05],
      solution: { given: "$d_{60}=0.9,\\ d_{10}=0.3$.", derivation: "$C_u=0.9/0.3$.", target: "$3$." },
    },
  ],
};

const ggMetamorphic: LearnTopic = {
  slug: "gg-pt-metamorphic",
  subject: "Mineralogy & Petrology",
  title: "Metamorphic Petrology: Facies & Grade",
  tier: "subject",
  blurb:
    "Metamorphic facies, Barrovian index minerals and P–T conditions — reading the temperature and pressure history of a rock.",
  module: {
    principle:
      "Metamorphism rearranges minerals in the solid state under changing **pressure and temperature**. **Facies** group assemblages by P–T: zeolite → greenschist → amphibolite → granulite with rising T; **blueschist** and **eclogite** record high-P/low-T subduction; **hornfels** records low-P contact heating. In Barrovian (regional) metamorphism, **index minerals** mark increasing grade: chlorite → biotite → garnet → staurolite → kyanite → sillimanite. Pressure converts to depth via the lithostatic relation.",
    formulaMatrix: [
      "**Lithostatic pressure**: $P=\\rho g z$ (≈ 27 MPa/km for crust).",
      "",
      "**Field gradient**: $\\Delta T/\\Delta z$ between isograds.",
      "",
      "**Barrovian sequence**: chlorite → biotite → garnet → staurolite → kyanite → sillimanite.",
      "",
      "**Protolith pairs**: shale→slate→phyllite→schist→gneiss; limestone→marble; sandstone→quartzite.",
    ].join("\n"),
    traps: [
      "**Blueschist = high P, low T.** Don't read 'blue' as cold-and-shallow; it is deep subduction.",
      "**Grade ≠ facies.** Grade is the intensity (low→high); facies is the specific P–T field.",
      "**Contact vs regional.** Hornfels (contact) is non-foliated; schist/gneiss (regional) are foliated.",
    ],
  },
  questions: [
    {
      id: "gg-met-q1", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "The metamorphic facies characterised by high pressure and low temperature is",
      options: ["blueschist", "granulite", "amphibolite", "hornfels"], answer: 0,
      solution: { given: "P–T fields.", derivation: "Blueschist = high-P/low-T (subduction).", target: "**Blueschist**." },
    },
    {
      id: "gg-met-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "Among these Barrovian index minerals, the one marking the highest grade is",
      options: ["sillimanite", "chlorite", "biotite", "garnet"], answer: 0,
      solution: { given: "Barrovian zones.", derivation: "chlorite → biotite → garnet → staurolite → kyanite → sillimanite.", target: "**Sillimanite**." },
    },
    {
      id: "gg-met-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "A metamorphic assemblage equilibrated at $0.8\\,$GPa in crust of density $2.8\\,$g/cm³. The depth is _____ km.",
      natAnswer: 29.13, acceptedRange: [28, 30.5], unit: "km",
      solution: { given: "$P=0.8\\times10^9$ Pa, $\\rho=2800$.", derivation: "$z=P/(\\rho g)=0.8\\times10^9/(2800\\times9.81)\\approx29130$ m.", target: "$≈29.1$ km." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 5 — Stratigraphy & Palaeontology                              */
/* ════════════════════════════════════════════════════════════════════ */

const ggStratigraphy: LearnTopic = {
  slug: "gg-st-stratigraphy",
  subject: "Stratigraphy & Indian Geology",
  title: "Stratigraphic Principles & Indian Geology",
  tier: "subject",
  blurb:
    "Superposition, the geological time scale and the Precambrian-to-Quaternary architecture of the Indian subcontinent.",
  module: {
    principle:
      "**Stratigraphy** orders rocks in time using **superposition** (older below younger in undeformed strata), **original horizontality**, **lateral continuity**, **cross-cutting relationships** and **faunal succession**. The **geological time scale** divides the Phanerozoic into Paleozoic, Mesozoic and Cenozoic. **Indian stratigraphy** ranges from the Archean **Dharwar** cratons through the Proterozoic **Cuddapah** and **Vindhyan** basins, the coal-bearing **Gondwana** Supergroup, the ~66 Ma **Deccan Traps**, to the Neogene **Siwaliks** of the Himalayan foreland.",
    formulaMatrix: [
      "**Key boundaries (Ma)**: Cambrian base ≈ 541 · P–Tr ≈ 252 · K–Pg ≈ 66.",
      "",
      "**Hiatus across an unconformity**: older age − younger age.",
      "",
      "**Sedimentation time**: thickness ÷ accumulation rate.",
      "",
      "**Deccan Traps**: flood basalts erupted ≈ 66–65 Ma (near K–Pg).",
    ].join("\n"),
    traps: [
      "**Superposition needs undeformed beds.** Overturned folds invert the order — check way-up criteria first.",
      "**Gondwana = coal, not the Gondwana continent only.** India's coalfields are Permo-Carboniferous Gondwana.",
      "**Deccan ≈ K–Pg, not Archean.** Deccan Traps are end-Cretaceous, not Precambrian.",
    ],
  },
  questions: [
    {
      id: "gg-strat-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The law stating that, in undeformed strata, older beds lie below younger beds is the law of",
      options: ["superposition", "cross-cutting relationships", "faunal succession", "lateral continuity"], answer: 0,
      solution: { given: "Steno's principles.", derivation: "Superposition orders undeformed layers.", target: "**Superposition**." },
    },
    {
      id: "gg-strat-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "The Deccan Trap basalts of India erupted close to the",
      options: ["Cretaceous–Paleogene boundary (~66 Ma)", "Permian–Triassic boundary", "Archean–Proterozoic boundary", "Holocene"], answer: 0,
      solution: { given: "Flood basalts.", derivation: "Deccan Traps ≈ 66–65 Ma, near the K–Pg boundary.", target: "**K–Pg (~66 Ma)**." },
    },
    {
      id: "gg-strat-q3", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A $600\\,$m sequence accumulated at $20\\,$m/Myr. The time represented is _____ Myr.",
      natAnswer: 30, acceptedRange: [29.9, 30.1], unit: "Myr",
      solution: { given: "Thickness 600 m, rate 20 m/Myr.", derivation: "$t=600/20$.", target: "$30$ Myr." },
    },
  ],
};

const ggPaleontology: LearnTopic = {
  slug: "gg-pl-paleontology",
  subject: "Palaeontology",
  title: "Fossils, Index Taxa & Mass Extinctions",
  tier: "subject",
  blurb:
    "Index fossils, major fossil groups and the five great extinctions — the biostratigraphic clock of Earth history.",
  module: {
    principle:
      "**Fossils** preserve past life and underpin **biostratigraphy**. An ideal **index (guide) fossil** is geographically **widespread** but stratigraphically **short-lived**, giving fine time resolution. Key groups: **trilobites** (Paleozoic arthropods), **ammonoids** (Mesozoic cephalopod molluscs) and **foraminifera** (abundant calcareous microfossils used in petroleum biostratigraphy). Earth's history is punctuated by **mass extinctions** — the end-Permian (~252 Ma, largest) and the end-Cretaceous **K–Pg** (~66 Ma, iridium anomaly, end of non-avian dinosaurs).",
    formulaMatrix: [
      "**Stratigraphic range**: FAD (first appearance) − LAD (last appearance).",
      "",
      "**Extinction %**: $(1-\\text{survivors}/\\text{total})\\times100$.",
      "",
      "**Decline (half-life form)**: $N=N_0(1/2)^{t/T}$.",
      "",
      "**Index-fossil rule**: wide area + short duration ⇒ best correlation.",
    ].join("\n"),
    traps: [
      "**Index ≠ long-lived.** Long-ranging fossils give poor time resolution.",
      "**Trilobites = Paleozoic.** They vanish at the end-Permian, not at K–Pg.",
      "**K–Pg killed dinosaurs, not trilobites.** Match the extinction to the right taxa.",
    ],
  },
  questions: [
    {
      id: "gg-pal-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "An ideal index fossil should have",
      options: ["wide geographic range and short time range", "narrow range and long duration", "limited distribution and long life", "no hard parts"], answer: 0,
      solution: { given: "Biostratigraphic correlation.", derivation: "Widespread + short-lived = high resolution.", target: "**Wide area, short time**." },
    },
    {
      id: "gg-pal-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "Ammonoids, key Mesozoic index fossils, belong to the phylum",
      options: ["Mollusca", "Brachiopoda", "Arthropoda", "Echinodermata"], answer: 0,
      solution: { given: "Cephalopods.", derivation: "Ammonoids are cephalopod molluscs.", target: "**Mollusca**." },
    },
    {
      id: "gg-pal-q3", difficulty: "medium", marks: 2, type: "NAT",
      stem: "Of $80$ genera before a mass extinction, $20$ survived. The extinction percentage is _____ %.",
      natAnswer: 75, acceptedRange: [74.9, 75.1], unit: "%",
      solution: { given: "80 total, 20 survivors.", derivation: "$(80-20)/80\\times100=60/80\\times100$.", target: "$75\\%$." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 6 — Economic Geology & Geochemistry                           */
/* ════════════════════════════════════════════════════════════════════ */

const ggEconomic: LearnTopic = {
  slug: "gg-ec-economic-geology",
  subject: "Economic & Ore Geology",
  title: "Ore Minerals, Deposit Types & Grade",
  tier: "subject",
  blurb:
    "Principal ore minerals, the magmatic-to-hydrothermal spectrum of deposits, and basic grade–tonnage arithmetic.",
  module: {
    principle:
      "**Economic geology** studies how metals concentrate into mineable **ore deposits**. Key ore minerals: **galena** (Pb), **sphalerite** (Zn), **chalcopyrite** (Cu), **cassiterite** (Sn), **chromite** (Cr), **hematite/magnetite** (Fe), **bauxite** (Al). Deposits span **magmatic segregation** (chromite, PGE in layered intrusions), **hydrothermal** (porphyry Cu, vein gold, MVT Pb–Zn), **sedimentary/chemical** (banded iron formation) and **residual weathering** (laterite/bauxite). Resource value is set by **grade** (metal %) above a **cut-off**, times **tonnage** and **recovery**.",
    formulaMatrix: [
      "**Contained metal**: tonnage × grade.",
      "",
      "**Weighted average grade**: $\\dfrac{\\sum g_i t_i}{\\sum t_i}$.",
      "",
      "**Recoverable metal**: tonnage × grade × recovery.",
      "",
      "**Cut-off ratio**: average grade ÷ cut-off grade.",
    ].join("\n"),
    traps: [
      "**Chalcopyrite ≠ lead.** Galena is Pb; chalcopyrite is Cu; sphalerite is Zn.",
      "**BIF is sedimentary, not hydrothermal.** Banded iron formations are chemical sediments.",
      "**Grade × tonnage units.** Watch %, g/t and tonnes — convert consistently.",
    ],
  },
  questions: [
    {
      id: "gg-eco-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The principal ore mineral of lead is",
      options: ["galena", "chalcopyrite", "sphalerite", "cassiterite"], answer: 0,
      solution: { given: "Sulphide ores.", derivation: "Galena = PbS.", target: "**Galena**." },
    },
    {
      id: "gg-eco-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "An ore body of $5\\,$million tonnes assays $2\\%$ Cu. The contained copper is _____ tonnes.",
      natAnswer: 100000, acceptedRange: [99000, 101000], unit: "t",
      solution: { given: "5 Mt at 2 %.", derivation: "$0.02\\times5\\times10^6$.", target: "$100{,}000$ t." },
    },
    {
      id: "gg-eco-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "Two ore blocks: $20\\,$kt at $2\\%$ and $10\\,$kt at $5\\%$. The combined average grade is _____ %.",
      natAnswer: 3, acceptedRange: [2.95, 3.05], unit: "%",
      solution: { given: "20 kt@2 %, 10 kt@5 %.", derivation: "$(2\\times20+5\\times10)/(20+10)=90/30$.", target: "$3\\%$." },
    },
  ],
};

const ggGeochemistry: LearnTopic = {
  slug: "gg-gc-geochemistry",
  subject: "Geochemistry & Isotope Geology",
  title: "Geochemistry & Radiometric Dating",
  tier: "subject",
  blurb:
    "Goldschmidt's element classification and radioactive-decay dating — how chemistry and isotopes read the age and source of rocks.",
  module: {
    principle:
      "**Goldschmidt's classification** groups elements by affinity: **lithophile** (silicate-loving), **siderophile** (iron-loving, e.g. Ni, Co, Au), **chalcophile** (sulphide-loving) and **atmophile** (gaseous). **Radiometric dating** exploits the constant decay of unstable isotopes: the parent decays exponentially $N=N_0e^{-\\lambda t}$, with **half-life** $T_{1/2}=\\ln2/\\lambda$. Measuring the **daughter/parent ratio** yields the age $t=\\tfrac1\\lambda\\ln(1+D/P)$. Different clocks suit different ages: $^{14}$C (5730 yr) for the late Quaternary; U–Pb, Rb–Sr and K–Ar for deep time.",
    formulaMatrix: [
      "**Decay**: $N=N_0e^{-\\lambda t}$, $\\lambda=\\ln2/T_{1/2}$.",
      "",
      "**Remaining fraction**: $N/N_0=(1/2)^{t/T_{1/2}}$.",
      "",
      "**Isochron age**: $t=\\dfrac{1}{\\lambda}\\ln\\!\\left(1+\\dfrac{D}{P}\\right)$.",
      "",
      "**Partition coefficient**: $C_{solid}=K_D\\,C_{melt}$.",
    ].join("\n"),
    traps: [
      "**Decay constant vs half-life.** $\\lambda=\\ln2/T_{1/2}$ — they are not equal.",
      "**$^{14}$C is short-lived.** It dates ≤ ~50 ka, not millions of years.",
      "**Low initial Sr = mantle.** High initial $^{87}$Sr/$^{86}$Sr signals crustal contamination.",
    ],
  },
  questions: [
    {
      id: "gg-gch-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "In Goldschmidt's classification, iron-loving elements (Ni, Co, Au) are termed",
      options: ["siderophile", "lithophile", "chalcophile", "atmophile"], answer: 0,
      solution: { given: "Element affinities.", derivation: "Siderophile = iron-loving.", target: "**Siderophile**." },
    },
    {
      id: "gg-gch-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A system with half-life $1250\\,$Myr decays for $2500\\,$Myr. The fraction of parent remaining is _____.",
      natAnswer: 0.25, acceptedRange: [0.245, 0.255],
      solution: { given: "$t/T=2$.", derivation: "$(1/2)^2$.", target: "$0.25$." },
    },
    {
      id: "gg-gch-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "A mineral has daughter/parent ratio $D/P=1$ for a system of half-life $1250\\,$Myr. Its age is _____ Myr.",
      natAnswer: 1250, acceptedRange: [1240, 1260], unit: "Myr",
      solution: { given: "$D/P=1$, $\\lambda=\\ln2/1250$.", derivation: "$t=\\tfrac1\\lambda\\ln(1+1)=\\tfrac{\\ln2}{\\lambda}=T_{1/2}$.", target: "$1250$ Myr." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 7 — Applied Geology & Geophysics                              */
/* ════════════════════════════════════════════════════════════════════ */

const ggEngGeology: LearnTopic = {
  slug: "gg-ap-engineering-geology",
  subject: "Engineering & Environmental Geology",
  title: "Rock Mechanics & Hydrogeology",
  tier: "subject",
  blurb:
    "RQD, Mohr–Coulomb joint strength, slope stability and Darcy flow — the geomechanics and groundwater of applied geology.",
  module: {
    principle:
      "Engineering geology evaluates rock and soil as **materials**. Rock-mass quality is graded by **RQD** (sum of intact core pieces ≥ 10 cm over the run length). Discontinuity strength follows the **Mohr–Coulomb** law $\\tau=c+\\sigma_n\\tan\\phi$; **slope stability** is the ratio of resisting to driving forces (factor of safety). Groundwater flows by **Darcy's law** $Q=KiA$, with **transmissivity** $T=Kb$ describing an aquifer's capacity to transmit water.",
    formulaMatrix: [
      "**RQD**: $\\dfrac{\\sum(\\text{intact pieces}\\geq10\\,cm)}{\\text{run length}}\\times100$.",
      "",
      "**Mohr–Coulomb**: $\\tau=c+\\sigma_n\\tan\\phi$.",
      "",
      "**Factor of safety**: $FS=\\dfrac{\\text{resisting}}{\\text{driving}}$.",
      "",
      "**Darcy / transmissivity**: $Q=KiA$, $T=Kb$.",
    ].join("\n"),
    traps: [
      "**RQD uses ≥10 cm pieces only.** Shorter fragments don't count.",
      "**φ is the friction angle, not the dip.** Use $\\tan\\phi$ for strength.",
      "**Darcy velocity ≠ pore velocity.** Seepage velocity $=Ki/n$ (divide by porosity).",
    ],
    figure: { kind: "mohr", sigma1: 160, sigma3: 40, phi: 30, cohesion: 30, caption: "Joint failure envelope: c=30 kPa, φ=30°." },
  },
  questions: [
    {
      id: "gg-eng-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A rock joint has $c=30\\,$kPa and $\\phi=30^\\circ$. Under a normal stress of $100\\,$kPa, its shear strength is _____ kPa.",
      natAnswer: 87.74, acceptedRange: [86, 89], unit: "kPa",
      figure: { kind: "mohr", sigma1: 160, sigma3: 40, phi: 30, cohesion: 30, caption: "c=30 kPa, φ=30°." },
      solution: { given: "$c=30,\\ \\phi=30^\\circ,\\ \\sigma_n=100$.", derivation: "$\\tau=30+100\\tan30^\\circ=30+57.74$.", target: "$87.74$ kPa." },
    },
    {
      id: "gg-eng-q2", difficulty: "basic", marks: 1, type: "NAT",
      stem: "In a $150\\,$cm core run, intact pieces ≥10 cm total $120\\,$cm. The RQD is _____ %.",
      natAnswer: 80, acceptedRange: [79.5, 80.5], unit: "%",
      solution: { given: "Run 150 cm, pieces 120 cm.", derivation: "$120/150\\times100$.", target: "$80\\%$." },
    },
    {
      id: "gg-eng-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "An aquifer has $K=5\\times10^{-5}\\,$m/s and saturated thickness $20\\,$m. Its transmissivity is _____ ×10⁻³ m²/s.",
      natAnswer: 1, acceptedRange: [0.99, 1.01],
      solution: { given: "$K=5\\times10^{-5}$, $b=20$.", derivation: "$T=Kb=5\\times10^{-5}\\times20=10^{-3}$.", target: "$1\\times10^{-3}$ m²/s." },
    },
  ],
};

const ggGeophysics: LearnTopic = {
  slug: "gg-ap-geophysics",
  subject: "Geophysics",
  title: "Applied Geophysics: Gravity & Seismics",
  tier: "subject",
  blurb:
    "Gravity corrections, seismic refraction and resistivity — the field methods that image the subsurface without drilling.",
  module: {
    principle:
      "Geophysics infers subsurface structure from **physical fields**. In **gravity** surveying, raw readings are reduced with the **free-air** ($0.3086\\,h$ mGal) and **Bouguer** ($0.04193\\,\\rho h$ mGal) corrections; the residual **Bouguer anomaly** maps density contrasts (positive over dense bodies). In **seismic refraction**, energy critically refracts when $\\sin\\theta_c=V_1/V_2$; layer depth comes from the intercept time or crossover distance. **Electrical resistivity** (Wenner array) gives apparent resistivity $\\rho_a=2\\pi a R$.",
    formulaMatrix: [
      "**Free-air correction**: $0.3086\\,h$ mGal ($h$ in m).",
      "",
      "**Bouguer correction**: $0.04193\\,\\rho\\,h$ mGal ($\\rho$ in g/cm³).",
      "",
      "**Critical angle**: $\\sin\\theta_c=V_1/V_2$.",
      "",
      "**Refractor depth**: $h=\\dfrac{t_i}{2}\\dfrac{V_1V_2}{\\sqrt{V_2^2-V_1^2}}$.",
      "",
      "**Wenner resistivity**: $\\rho_a=2\\pi a (V/I)$.",
    ].join("\n"),
    traps: [
      "**Free-air vs Bouguer.** Free-air corrects for elevation only; Bouguer also removes the rock slab's mass.",
      "**Critical angle needs $V_2>V_1$.** Refraction surveys require velocity increasing with depth.",
      "**P faster than S.** P-waves arrive first; $V_p>V_s$ always.",
    ],
  },
  questions: [
    {
      id: "gg-gph-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The seismic body wave that is fastest and arrives first is the",
      options: ["P-wave", "S-wave", "Rayleigh wave", "Love wave"], answer: 0,
      solution: { given: "Body waves.", derivation: "Compressional P-waves are fastest.", target: "**P-wave**." },
    },
    {
      id: "gg-gph-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A gravity station sits $500\\,$m above the datum. The free-air correction is _____ mGal.",
      natAnswer: 154.3, acceptedRange: [154, 154.6], unit: "mGal",
      solution: { given: "$h=500$ m.", derivation: "$0.3086\\times500$.", target: "$154.3$ mGal." },
    },
    {
      id: "gg-gph-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "A refraction survey has $V_1=2000$ and $V_2=4000\\,$m/s. The critical angle is _____ degrees.",
      natAnswer: 30, acceptedRange: [29.7, 30.3], unit: "°",
      solution: { given: "$V_1=2000,\\ V_2=4000$.", derivation: "$\\sin\\theta_c=2000/4000=0.5$.", target: "$\\theta_c=30^\\circ$." },
    },
  ],
};

const ggRemoteSensing: LearnTopic = {
  slug: "gg-ap-remote-sensing",
  subject: "Applied Geology · Remote Sensing & GIS",
  title: "Remote Sensing & GIS",
  tier: "subject",
  blurb:
    "The electromagnetic spectrum, sensor resolution, vegetation indices and GIS data models — mapping geology from above.",
  module: {
    principle:
      "**Remote sensing** records reflected/emitted **electromagnetic radiation**. Surfaces have diagnostic spectra: healthy vegetation reflects strongly in the **near-infrared** (basis of **NDVI**), water absorbs it. A sensor is characterised by **spatial** (smallest resolvable ground detail), **spectral** (number/width of bands), **radiometric** and **temporal** (revisit) resolution. **GIS** stores spatial data as **raster** (continuous fields like DEMs) or **vector** (discrete features), enabling overlay, lineament mapping and spatial analysis.",
    formulaMatrix: [
      "**Photo scale**: $\\text{scale}=f/H$; denominator $=H/f$.",
      "",
      "**Ground distance**: map distance × scale denominator.",
      "",
      "**EM relation**: $c=f\\lambda$.",
      "",
      "**NDVI**: $\\dfrac{NIR-Red}{NIR+Red}\\in[-1,+1]$.",
    ].join("\n"),
    traps: [
      "**Vegetation = high NIR.** Don't expect vegetation to peak in visible green alone.",
      "**Spatial vs spectral.** Spatial = ground detail; spectral = number of wavelength bands.",
      "**Raster for continuous fields.** Elevation/DEM is best as a raster, not points.",
    ],
  },
  questions: [
    {
      id: "gg-rs-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "Healthy green vegetation reflects most strongly in the",
      options: ["near-infrared", "blue", "thermal infrared", "ultraviolet"], answer: 0,
      solution: { given: "Vegetation spectrum.", derivation: "High NIR reflectance underlies NDVI.", target: "**Near-infrared**." },
    },
    {
      id: "gg-rs-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "The ability of a sensor to distinguish two adjacent objects on the ground is its",
      options: ["spatial resolution", "spectral resolution", "radiometric resolution", "temporal resolution"], answer: 0,
      solution: { given: "Resolution types.", derivation: "Spatial resolution = smallest resolvable detail.", target: "**Spatial resolution**." },
    },
    {
      id: "gg-rs-q3", difficulty: "medium", marks: 2, type: "NAT",
      stem: "On a $1:20000$ map, two points are $150\\,$mm apart. The ground distance is _____ m.",
      natAnswer: 3000, acceptedRange: [2990, 3010], unit: "m",
      solution: { given: "Scale 1:20000, 150 mm.", derivation: "$0.150\\,\\text{m}\\times20000$.", target: "$3000$ m." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  REFERENCES                                                            */
/* ════════════════════════════════════════════════════════════════════ */

const GG_TOPIC_REFERENCES: Record<string, LearnReference[]> = {
  "gg-em-geostatistics": [
    { book: "Mining Geostatistics", author: "A.G. Journel & C.J. Huijbregts" },
    { book: "An Introduction to Applied Geostatistics", author: "Isaaks & Srivastava" },
  ],
  "gg-es-earth-interior": [
    { book: "Principles of Physical Geology", author: "Arthur Holmes" },
    { book: "Earth: An Introduction to Physical Geology", author: "Tarbuck & Lutgens" },
  ],
  "gg-sg-stress-mohr": [
    { book: "Structural Geology", author: "Haakon Fossen" },
    { book: "Earth Structure", author: "van der Pluijm & Marshak" },
  ],
  "gg-sg-stereographic": [
    { book: "The Mapping of Geological Structures", author: "K.R. McClay" },
    { book: "An Outline of Structural Geology", author: "Hobbs, Means & Williams" },
  ],
  "gg-mn-crystallography": [
    { book: "Manual of Mineral Science", author: "Klein & Dutrow (Dana)" },
    { book: "Introduction to Mineralogy", author: "William D. Nesse" },
  ],
  "gg-pt-igneous": [
    { book: "Igneous and Metamorphic Petrology", author: "Myron G. Best" },
    { book: "Igneous Petrology", author: "Anthony Hall" },
  ],
  "gg-pt-sedimentary": [
    { book: "Sedimentary Petrology", author: "Maurice E. Tucker" },
    { book: "Principles of Sedimentology and Stratigraphy", author: "Sam Boggs Jr." },
  ],
  "gg-pt-metamorphic": [
    { book: "Petrogenesis of Metamorphic Rocks", author: "Bucher & Grapes" },
    { book: "Metamorphic Petrology", author: "Vernon & Clarke" },
  ],
  "gg-st-stratigraphy": [
    { book: "Geology of India", author: "M. Ramakrishnan & R. Vaidyanadhan" },
    { book: "Principles of Stratigraphy", author: "Michael E. Brookfield" },
  ],
  "gg-pl-paleontology": [
    { book: "Invertebrate Palaeontology and Evolution", author: "E.N.K. Clarkson" },
    { book: "Principles of Paleontology", author: "Foote & Miller" },
  ],
  "gg-ec-economic-geology": [
    { book: "Economic Mineral Deposits", author: "Jensen & Bateman" },
    { book: "Ore Geology and Industrial Minerals", author: "Anthony M. Evans" },
  ],
  "gg-gc-geochemistry": [
    { book: "Geochemistry", author: "William M. White" },
    { book: "Using Geochemical Data", author: "Hugh R. Rollinson" },
  ],
  "gg-ap-engineering-geology": [
    { book: "Engineering Geology", author: "F.G. Bell" },
    { book: "Foundations of Engineering Geology", author: "Tony Waltham" },
  ],
  "gg-ap-geophysics": [
    { book: "An Introduction to Geophysical Exploration", author: "Kearey, Brooks & Hill" },
    { book: "Applied Geophysics", author: "Telford, Geldart & Sheriff" },
  ],
  "gg-ap-remote-sensing": [
    { book: "Remote Sensing and Image Interpretation", author: "Lillesand, Kiefer & Chipman" },
    { book: "Concepts and Techniques of GIS", author: "Lo & Yeung" },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  RECOMMENDED BOOKS & RESOURCES (Learn index panel)                     */
/* ════════════════════════════════════════════════════════════════════ */

export type GeoResourceGroup = { subject: string; books: LearnReference[] };

export const GG_RESOURCES: GeoResourceGroup[] = [
  { subject: "Physical & Structural Geology", books: [
    { book: "Principles of Physical Geology", author: "Arthur Holmes" },
    { book: "Structural Geology", author: "Haakon Fossen" },
  ] },
  { subject: "Mineralogy & Petrology", books: [
    { book: "Manual of Mineral Science (Dana)", author: "Klein & Dutrow" },
    { book: "Igneous and Metamorphic Petrology", author: "Myron G. Best" },
    { book: "Sedimentary Petrology", author: "Maurice E. Tucker" },
  ] },
  { subject: "Stratigraphy & Palaeontology", books: [
    { book: "Geology of India", author: "Ramakrishnan & Vaidyanadhan" },
    { book: "Invertebrate Palaeontology and Evolution", author: "E.N.K. Clarkson" },
  ] },
  { subject: "Economic Geology & Geochemistry", books: [
    { book: "Economic Mineral Deposits", author: "Jensen & Bateman" },
    { book: "Geochemistry", author: "William M. White" },
  ] },
  { subject: "Geophysics & Applied Geology", books: [
    { book: "An Introduction to Geophysical Exploration", author: "Kearey, Brooks & Hill" },
    { book: "Remote Sensing and Image Interpretation", author: "Lillesand, Kiefer & Chipman" },
  ] },
];

export const GG_RESOURCE_LINKS: { label: string; href: string; note: string }[] = [
  { label: "NPTEL–GATE PYQ portal", href: "https://gate.nptel.ac.in", note: "Subject-wise previous-year GG questions with solutions and full-length mock tests." },
  { label: "NPTEL Earth Sciences lectures", href: "https://nptel.ac.in", note: "Video courses by IIT/IISc faculty mapped to the GATE GG syllabus." },
];

/* ════════════════════════════════════════════════════════════════════ */
/*  TOPIC REGISTRY                                                        */
/* ════════════════════════════════════════════════════════════════════ */

export const GG_LEARN_TOPICS: LearnTopic[] = [
  ggGeostatistics,
  ggEarthInterior,
  ggStress,
  ggStereonet,
  ggCrystallography,
  ggIgneous,
  ggSedimentary,
  ggMetamorphic,
  ggStratigraphy,
  ggPaleontology,
  ggEconomic,
  ggGeochemistry,
  ggEngGeology,
  ggGeophysics,
  ggRemoteSensing,
].map((t) => ({ ...t, references: t.references ?? GG_TOPIC_REFERENCES[t.slug] }));

export function getGeoLearnTopic(slug: string): LearnTopic | undefined {
  return GG_LEARN_TOPICS.find((t) => t.slug === slug);
}

/* ════════════════════════════════════════════════════════════════════ */
/*  GATE GG SYLLABUS MAP                                                  */
/* ════════════════════════════════════════════════════════════════════ */

export const GG_LEARN_SYLLABUS: LearnSyllabusSection[] = [
  {
    id: 1,
    title: "Mathematics & Geostatistics",
    summary: "The quantitative toolkit behind assay statistics, grade estimation and geophysical signal handling.",
    subtopics: [
      { title: "Statistics & Geostatistics", slug: "gg-em-geostatistics", highlight: "Mean, variance, semivariogram, nugget–sill–range, kriging" },
      { title: "Linear Algebra & Calculus", highlight: "Matrices, eigenvalues, gradients, integrals — applied to geophysical fields" },
      { title: "Probability for Geoscience", highlight: "Distributions, Poisson earthquake recurrence, log-normal grades" },
    ],
  },
  {
    id: 2,
    title: "Earth System & Geomorphology",
    summary: "The structure and dynamics of the planet, and the landforms sculpting its surface.",
    subtopics: [
      { title: "Earth's Interior & Plate Tectonics", slug: "gg-es-earth-interior", highlight: "Seismic discontinuities, isostasy, sea-floor spreading" },
      { title: "Geomorphic Processes & Landforms", highlight: "Weathering, fluvial, aeolian, glacial, karst & marine landforms" },
      { title: "Drainage & Slope Analysis", highlight: "Drainage patterns, longitudinal profiles, denudation" },
    ],
  },
  {
    id: 3,
    title: "Structural Geology",
    summary: "Stress, strain and the geometry of folds, faults and fabrics.",
    subtopics: [
      { title: "Stress, Strain & the Mohr Circle", slug: "gg-sg-stress-mohr", highlight: "Normal/shear stress, principal stresses, Coulomb failure" },
      { title: "Stereographic Projection & Apparent Dip", slug: "gg-sg-stereographic", highlight: "Great circles, poles, true vs apparent dip, true thickness" },
      { title: "Folds, Faults & Fabrics", highlight: "Fold geometry, Anderson fault classes, foliation & lineation" },
    ],
  },
  {
    id: 4,
    title: "Mineralogy & Petrology",
    summary: "Crystal chemistry and the origin of igneous, sedimentary and metamorphic rocks.",
    subtopics: [
      { title: "Crystallography & X-ray Diffraction", slug: "gg-mn-crystallography", highlight: "Crystal systems, Miller indices, Bragg's law, d-spacing" },
      { title: "Igneous Petrology & Bowen's Series", slug: "gg-pt-igneous", highlight: "Silica classification, reaction series, fractionation" },
      { title: "Sedimentology & Grain Size", slug: "gg-pt-sedimentary", highlight: "Udden–Wentworth, phi scale, sorting, Stokes settling" },
      { title: "Metamorphic Petrology: Facies & Grade", slug: "gg-pt-metamorphic", highlight: "Facies series, Barrovian zones, P–T paths" },
    ],
  },
  {
    id: 5,
    title: "Stratigraphy & Palaeontology",
    summary: "Ordering rocks in time and reading the fossil record of life.",
    subtopics: [
      { title: "Stratigraphic Principles & Indian Geology", slug: "gg-st-stratigraphy", highlight: "Superposition, time scale, Dharwar to Deccan to Siwalik" },
      { title: "Fossils, Index Taxa & Mass Extinctions", slug: "gg-pl-paleontology", highlight: "Index fossils, trilobites/ammonoids/forams, K–Pg & P–Tr" },
      { title: "Micropalaeontology & Biostratigraphy", highlight: "Foraminifera, conodonts, palynology, zonation" },
    ],
  },
  {
    id: 6,
    title: "Economic Geology & Geochemistry",
    summary: "How metals concentrate into deposits, and the chemistry & isotopes that date and source rocks.",
    subtopics: [
      { title: "Ore Minerals, Deposit Types & Grade", slug: "gg-ec-economic-geology", highlight: "Ore minerals, magmatic–hydrothermal spectrum, grade–tonnage" },
      { title: "Geochemistry & Radiometric Dating", slug: "gg-gc-geochemistry", highlight: "Goldschmidt classification, decay law, isochron ages" },
      { title: "Indian Mineral Deposits & Exploration", highlight: "Kolar, Singhbhum, Khetri; exploration geochemistry" },
    ],
  },
  {
    id: 7,
    title: "Applied Geology & Geophysics",
    summary: "Engineering geology, groundwater, geophysical exploration and remote sensing.",
    subtopics: [
      { title: "Rock Mechanics & Hydrogeology", slug: "gg-ap-engineering-geology", highlight: "RQD, Mohr–Coulomb, slope stability, Darcy flow" },
      { title: "Applied Geophysics: Gravity & Seismics", slug: "gg-ap-geophysics", highlight: "Gravity corrections, seismic refraction, resistivity" },
      { title: "Remote Sensing & GIS", slug: "gg-ap-remote-sensing", highlight: "EM spectrum, resolution, NDVI, raster/vector GIS" },
    ],
  },
];

/** A syllabus sub-topic resolved against the authored GG LearnTopic bank. */
export type GeoResolvedSubtopic = LearnSyllabusSubtopic & { topic?: LearnTopic };

/** The full GG syllabus with each sub-topic's authored LearnTopic attached. */
export function getGeoLearnSyllabus(): (Omit<LearnSyllabusSection, "subtopics"> & {
  subtopics: GeoResolvedSubtopic[];
  liveCount: number;
})[] {
  return GG_LEARN_SYLLABUS.map((sec) => {
    const subtopics: GeoResolvedSubtopic[] = sec.subtopics.map((st) => ({
      ...st,
      topic: st.slug ? getGeoLearnTopic(st.slug) : undefined,
    }));
    return {
      id: sec.id,
      title: sec.title,
      summary: sec.summary,
      subtopics,
      liveCount: subtopics.filter((s) => s.topic).length,
    };
  });
}
