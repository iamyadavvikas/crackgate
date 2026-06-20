/**
 * GATE Civil (CE) — Topic-Wise Learn & Solve content.
 *
 * Reuses the exact LearnTopic / LearnModule / LearnSyllabus model from the
 * mining Learn engine (`@/data/learn`) so the runner, gating and syllabus
 * dashboard work unchanged. Live sub-topics resolve to an authored LearnTopic;
 * the rest render as a "coming soon" roadmap mirroring the full GATE CE
 * syllabus.
 */
import type {
  LearnTopic,
  LearnSyllabusSection,
  LearnSyllabusSubtopic,
} from "@/data/learn";

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 1 — Engineering Mathematics                                   */
/* ════════════════════════════════════════════════════════════════════ */

const ceLinearAlgebra: LearnTopic = {
  slug: "ce-em-linear-algebra",
  subject: "Engineering Mathematics",
  title: "Linear Algebra",
  tier: "free",
  blurb:
    "Determinants, rank, systems of equations and eigenvalues — the matrix toolkit GATE CE leans on for structural systems and numerical methods.",
  module: {
    principle:
      "A matrix stores a **linear system** or a **linear transformation**. The **determinant** measures volume scaling — a zero determinant means the matrix is **singular** (non-invertible; the system has no unique solution). **Eigenvalues** $\\lambda$ satisfy $A\\mathbf{x}=\\lambda\\mathbf{x}$: special directions the transformation only stretches. For a 2×2 matrix the eigenvalues **sum to the trace** and **multiply to the determinant**.",
    formulaMatrix: [
      "**Determinant (2×2)**: $\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc$",
      "",
      "**Trace / determinant shortcuts**: $\\lambda_1+\\lambda_2=a+d,\\quad \\lambda_1\\lambda_2=\\det A$",
      "",
      "**Characteristic equation**: $\\det(A-\\lambda I)=0$",
      "",
      "**Rank–consistency**: a system $A\\mathbf{x}=\\mathbf{b}$ is consistent iff $\\text{rank}(A)=\\text{rank}([A|\\mathbf{b}])$; unique solution needs that rank $=$ number of unknowns.",
    ].join("\n"),
    traps: [
      "**Sum vs product of eigenvalues.** $\\lambda_1+\\lambda_2=\\text{trace}$ and $\\lambda_1\\lambda_2=\\det$ — never swap these.",
      "**Singular ⇒ no unique solution.** If $\\det A=0$ the system is either inconsistent or has infinitely many solutions.",
      "**$AB\\neq BA$.** Matrix multiplication is not commutative.",
    ],
  },
  questions: [
    {
      id: "ce-la-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The determinant of $\\begin{bmatrix}4 & 2\\\\ 1 & 3\\end{bmatrix}$ is:",
      options: ["$10$", "$14$", "$2$", "$-10$"], answer: 0,
      solution: { given: "$a=4,b=2,c=1,d=3$.", derivation: "$$\\det=ad-bc=(4)(3)-(2)(1)=12-2=10$$", target: "Correct option: $10$." },
    },
    {
      id: "ce-la-q2", difficulty: "medium", marks: 1, type: "NAT",
      stem: "A $2\\times2$ matrix has trace $7$ and determinant $12$. Its larger eigenvalue is _____.",
      natAnswer: 4, acceptedRange: [3.99, 4.01],
      solution: { given: "$\\lambda_1+\\lambda_2=7,\\ \\lambda_1\\lambda_2=12$.", derivation: "$$\\lambda^2-7\\lambda+12=0\\Rightarrow(\\lambda-3)(\\lambda-4)=0\\Rightarrow\\lambda=3,4$$", target: "Larger eigenvalue $=4$." },
    },
    {
      id: "ce-la-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "For what value of $k$ does the system $2x+ky=4,\\ 3x+6y=9$ have no unique solution?",
      options: ["$k=4$", "$k=2$", "$k=6$", "$k=3$"], answer: 0,
      solution: { given: "No unique solution ⇒ coefficient determinant $=0$.", derivation: "$$\\det\\begin{bmatrix}2&k\\\\3&6\\end{bmatrix}=12-3k=0\\Rightarrow k=4$$", target: "Correct option: $k=4$." },
    },
  ],
};

const ceProbability: LearnTopic = {
  slug: "ce-em-probability-statistics",
  subject: "Engineering Mathematics",
  title: "Probability & Statistics",
  tier: "free",
  blurb:
    "Mean, variance, distributions and conditional probability — recurring 1- and 2-mark scorers in every GATE CE paper.",
  module: {
    principle:
      "Probability quantifies uncertainty on a $[0,1]$ scale. For **independent** events the joint probability multiplies; for **mutually exclusive** events it adds. The **mean** locates the centre of a distribution and the **variance** its spread. The **normal** distribution is symmetric about its mean; the **Poisson** models rare counts.",
    formulaMatrix: [
      "**Addition**: $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$",
      "",
      "**Independent**: $P(A\\cap B)=P(A)P(B)$",
      "",
      "**Conditional**: $P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}$",
      "",
      "**Mean / variance (discrete)**: $\\mu=\\sum x_ip_i,\\quad \\sigma^2=\\sum p_i(x_i-\\mu)^2$",
      "",
      "**Binomial**: $P(X=r)=\\binom{n}{r}p^r(1-p)^{n-r}$",
    ].join("\n"),
    traps: [
      "**Independent ≠ mutually exclusive.** Independent events multiply; mutually exclusive events cannot both occur ($P(A\\cap B)=0$).",
      "**Variance units are squared.** Standard deviation $\\sigma=\\sqrt{\\sigma^2}$ shares the data's units.",
      "**With vs without replacement** changes probabilities for the second draw.",
    ],
  },
  questions: [
    {
      id: "ce-pr-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A fair die is rolled once. The probability of getting a number greater than $4$ is _____.",
      natAnswer: 0.3333, acceptedRange: [0.33, 0.34],
      solution: { given: "Favourable: $\\{5,6\\}$; total $=6$.", derivation: "$$P=\\dfrac{2}{6}=0.333$$", target: "$P\\approx0.333$." },
    },
    {
      id: "ce-pr-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "Two independent events have $P(A)=0.4$ and $P(B)=0.5$. The probability that at least one occurs is _____.",
      natAnswer: 0.7, acceptedRange: [0.69, 0.71],
      solution: { given: "$P(A)=0.4,P(B)=0.5$, independent.", derivation: "$$P(A\\cup B)=0.4+0.5-(0.4)(0.5)=0.9-0.2=0.7$$", target: "$0.7$." },
    },
    {
      id: "ce-pr-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "A random variable takes values $0,1,2$ with probabilities $0.2,0.5,0.3$. Its mean is:",
      options: ["$1.1$", "$1.0$", "$1.5$", "$0.9$"], answer: 0,
      solution: { given: "$x=0,1,2$; $p=0.2,0.5,0.3$.", derivation: "$$\\mu=0(0.2)+1(0.5)+2(0.3)=0.5+0.6=1.1$$", target: "Correct option: $1.1$." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 2 — Structural Engineering                                    */
/* ════════════════════════════════════════════════════════════════════ */

const ceEngMechanics: LearnTopic = {
  slug: "ce-se-engineering-mechanics",
  subject: "Structural Engineering",
  title: "Engineering Mechanics",
  tier: "free",
  blurb:
    "Equilibrium, resultants, trusses and friction — the statics foundation for every structural analysis question.",
  module: {
    principle:
      "A body is in **static equilibrium** when the net force and net moment vanish: $\\sum F_x=\\sum F_y=\\sum M=0$. These three planar equations solve any **statically determinate** structure. In a **pin-jointed truss**, members carry only axial force; the method of joints applies $\\sum F_x=\\sum F_y=0$ at each pin.",
    formulaMatrix: [
      "**Equilibrium (planar)**: $\\sum F_x=0,\\ \\sum F_y=0,\\ \\sum M=0$",
      "",
      "**Resultant of two perpendicular forces**: $R=\\sqrt{F_1^2+F_2^2}$",
      "",
      "**Moment**: $M=F\\times d$ (force × perpendicular distance)",
      "",
      "**Limiting friction**: $F=\\mu N$",
      "",
      "**Truss determinacy**: $m+r=2j$ (perfect truss), $m$=members, $r$=reactions, $j$=joints.",
    ].join("\n"),
    traps: [
      "**Perpendicular distance only.** A moment uses the perpendicular distance from the pivot to the line of action — not the slant distance.",
      "**Zero-force members.** Identify them first to simplify truss analysis; they still exist physically (stability).",
      "**Sign convention.** Fix a consistent sense (e.g. CCW moment positive) before summing.",
    ],
  },
  questions: [
    {
      id: "ce-mech-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "Two forces $6\\,\\text{kN}$ and $8\\,\\text{kN}$ act at right angles at a point. Their resultant is _____ kN.",
      natAnswer: 10, acceptedRange: [9.99, 10.01],
      solution: { given: "$F_1=6,F_2=8$, perpendicular.", derivation: "$$R=\\sqrt{6^2+8^2}=\\sqrt{100}=10$$", target: "$10\\,\\text{kN}$." },
    },
    {
      id: "ce-mech-q2", difficulty: "medium", marks: 1, type: "NAT",
      stem: "A simply supported beam of span $6\\,\\text{m}$ carries a UDL of $20\\,\\text{kN/m}$. Each support reaction is _____ kN.",
      natAnswer: 60, acceptedRange: [59.9, 60.1],
      solution: { given: "$w=20,L=6$.", derivation: "$$R=\\dfrac{wL}{2}=\\dfrac{20\\times6}{2}=60$$", target: "$60\\,\\text{kN}$." },
    },
    {
      id: "ce-mech-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "A perfect plane truss has $7$ joints. The number of members required is:",
      options: ["$11$", "$14$", "$7$", "$9$"], answer: 0,
      solution: { given: "$j=7$, planar, $r=3$.", derivation: "$$m=2j-r=2(7)-3=11$$", target: "Correct option: $11$ members." },
    },
  ],
};

const ceSimpleStress: LearnTopic = {
  slug: "ce-se-simple-stresses",
  subject: "Structural Engineering",
  title: "Simple Stresses & Strains",
  tier: "free",
  blurb:
    "Axial stress, Hooke's law, elongation and the elastic constants — the bedrock of solid mechanics.",
  module: {
    principle:
      "**Normal stress** is internal force per unit area, $\\sigma=P/A$. Within the elastic limit **Hooke's law** gives $\\sigma=E\\varepsilon$, so an axial member elongates by $\\delta=PL/AE$. The three elastic constants are linked by $E=2G(1+\\nu)=3K(1-2\\nu)$.",
    formulaMatrix: [
      "**Axial stress**: $\\sigma=\\dfrac{P}{A}$",
      "",
      "**Strain & Hooke's law**: $\\varepsilon=\\dfrac{\\delta}{L},\\quad \\sigma=E\\varepsilon$",
      "",
      "**Elongation**: $\\delta=\\dfrac{PL}{AE}$",
      "",
      "**Elastic constants**: $E=2G(1+\\nu)=3K(1-2\\nu)$",
      "",
      "**Factor of safety**: $\\text{FoS}=\\dfrac{\\text{yield (or ultimate) stress}}{\\text{working stress}}$",
    ].join("\n"),
    traps: [
      "**Unit consistency.** With $P$ in N and $A$ in mm², $\\sigma$ is in MPa. Mixing kN and m introduces factors of $10^3$.",
      "**$\\nu$ range.** Poisson's ratio lies between $0$ and $0.5$ for common materials.",
      "**Series vs parallel bars.** In series the load is common and elongations add; in parallel the elongation is common and loads share by stiffness.",
    ],
  },
  questions: [
    {
      id: "ce-ss-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A bar of area $500\\,\\text{mm}^2$ carries an axial tensile load of $100\\,\\text{kN}$. The normal stress is _____ MPa.",
      natAnswer: 200, acceptedRange: [199.5, 200.5],
      solution: { given: "$P=100\\,\\text{kN},A=500\\,\\text{mm}^2$.", derivation: "$$\\sigma=\\dfrac{100\\times10^3}{500}=200\\,\\text{MPa}$$", target: "$200\\,\\text{MPa}$." },
    },
    {
      id: "ce-ss-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A steel bar ($E=200\\,\\text{GPa}$), area $400\\,\\text{mm}^2$, length $2000\\,\\text{mm}$, carries $80\\,\\text{kN}$. Its elongation is _____ mm.",
      natAnswer: 2.0, acceptedRange: [1.98, 2.02],
      solution: { given: "$P=80\\,\\text{kN},A=400,L=2000,E=2\\times10^5$.", derivation: "$$\\delta=\\dfrac{PL}{AE}=\\dfrac{80\\times10^3\\times2000}{400\\times2\\times10^5}=2.0$$", target: "$2.0\\,\\text{mm}$." },
    },
    {
      id: "ce-ss-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "For a material with $E=200\\,\\text{GPa}$ and $G=80\\,\\text{GPa}$, Poisson's ratio is:",
      options: ["$0.25$", "$0.30$", "$0.20$", "$0.33$"], answer: 0,
      solution: { given: "$E=2G(1+\\nu)$.", derivation: "$$200=2(80)(1+\\nu)\\Rightarrow1+\\nu=1.25\\Rightarrow\\nu=0.25$$", target: "Correct option: $0.25$." },
    },
  ],
};

const ceStructuralAnalysis: LearnTopic = {
  slug: "ce-se-structural-analysis",
  subject: "Structural Engineering",
  title: "Determinacy & Beam Forces",
  tier: "subject",
  blurb:
    "Static & kinematic indeterminacy, SF/BM diagrams and standard beam results — the analysis core of GATE CE.",
  module: {
    principle:
      "A structure is **statically determinate** when equilibrium alone fixes all reactions and internal forces. The **degree of static indeterminacy** counts the redundant restraints. **Shear force** is the algebraic sum of transverse forces on one side of a section; **bending moment** is the algebraic sum of their moments. BM is maximum where SF crosses zero.",
    formulaMatrix: [
      "**Static indeterminacy (beam/frame)**: $D_s=(3m+r)-3n-r_r$ (general); simple beam $\\Rightarrow D_s=0$.",
      "",
      "**SSB, central point load $W$**: $M_{max}=\\dfrac{WL}{4}$ at midspan.",
      "",
      "**SSB, full UDL $w$**: $M_{max}=\\dfrac{wL^2}{8}$, reactions $\\dfrac{wL}{2}$.",
      "",
      "**Fixed beam, central load**: end moment $=\\dfrac{WL}{8}$.",
      "",
      "**Fixed beam, UDL**: support moment $=\\dfrac{wL^2}{12}$, midspan $=\\dfrac{wL^2}{24}$.",
    ].join("\n"),
    traps: [
      "**BM at a free end / simple support is zero** (no applied moment there).",
      "**Maximum BM at zero shear.** Locate the point where SF changes sign.",
      "**Fixed-end vs simply-supported moments differ.** UDL gives $wL^2/8$ (SS) but $wL^2/12$ (fixed support).",
    ],
  },
  questions: [
    {
      id: "ce-sa-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A simply supported beam of span $4\\,\\text{m}$ carries a central point load of $60\\,\\text{kN}$. The maximum bending moment is _____ kN·m.",
      natAnswer: 60, acceptedRange: [59.5, 60.5],
      solution: { given: "$W=60,L=4$.", derivation: "$$M_{max}=\\dfrac{WL}{4}=\\dfrac{60\\times4}{4}=60$$", target: "$60\\,\\text{kN·m}$." },
    },
    {
      id: "ce-sa-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A fixed beam of span $6\\,\\text{m}$ carries a UDL of $18\\,\\text{kN/m}$. The magnitude of the support moment is _____ kN·m.",
      natAnswer: 54, acceptedRange: [53.5, 54.5],
      solution: { given: "$w=18,L=6$.", derivation: "$$M=\\dfrac{wL^2}{12}=\\dfrac{18\\times36}{12}=54$$", target: "$54\\,\\text{kN·m}$." },
    },
    {
      id: "ce-sa-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "A single-bay single-storey portal frame with both column bases fixed is statically indeterminate to degree:",
      options: ["$3$", "$1$", "$2$", "$6$"], answer: 0,
      solution: { given: "Closed single-storey portal, fixed bases.", derivation: "Three redundant restraints remain after equilibrium ⇒ $D_s=3$.", target: "Correct option: $3$." },
    },
  ],
};

const ceRcc: LearnTopic = {
  slug: "ce-se-rcc-limit-state",
  subject: "Structural Engineering",
  title: "RCC — Limit State Design",
  tier: "subject",
  blurb:
    "IS 456 limit-state design of singly-reinforced sections: stress block, neutral axis and moment capacity.",
  module: {
    principle:
      "In **limit state of collapse (flexure)**, concrete carries compression through a rectangular stress block of intensity $0.36f_{ck}$ over depth $x_u$, and steel yields in tension at $0.87f_y$. Force equilibrium fixes $x_u$; the lever arm gives the moment of resistance. A **balanced** section reaches both limits together at $x_{u,max}$.",
    formulaMatrix: [
      "**Tensile force**: $T=0.87f_yA_{st}$",
      "",
      "**Compressive force**: $C=0.36f_{ck}b\\,x_u$",
      "",
      "**Depth of NA**: $x_u=\\dfrac{0.87f_yA_{st}}{0.36f_{ck}b}$",
      "",
      "**Limiting $x_u/d$**: Fe250 → $0.53$, Fe415 → $0.48$, Fe500 → $0.46$.",
      "",
      "**Moment of resistance**: $M_u=0.87f_yA_{st}\\,(d-0.42x_u)$",
    ].join("\n"),
    traps: [
      "**Stress-block factors.** $0.36f_{ck}$ for the force and $0.42x_u$ for the centroid depth — memorise both.",
      "**Over- vs under-reinforced.** If $x_u>x_{u,max}$ the section is over-reinforced (brittle); IS 456 disallows it for design.",
      "**Use $0.87f_y$, not $f_y$** for the design strength of steel.",
    ],
  },
  questions: [
    {
      id: "ce-rcc-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "As per IS 456, the limiting neutral-axis depth ratio $x_{u,max}/d$ for Fe415 steel is:",
      options: ["$0.48$", "$0.53$", "$0.46$", "$0.36$"], answer: 0,
      solution: { given: "Fe415 grade.", derivation: "IS 456 limiting values: Fe250→0.53, Fe415→0.48, Fe500→0.46.", target: "Correct option: $0.48$." },
    },
    {
      id: "ce-rcc-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A singly-reinforced beam has $b=300\\,\\text{mm}$, $A_{st}=1000\\,\\text{mm}^2$, Fe415, M20. The depth of the stress block $x_u$ is _____ mm.",
      natAnswer: 167.1, acceptedRange: [165, 169],
      solution: { given: "$f_y=415,A_{st}=1000,f_{ck}=20,b=300$.", derivation: "$$x_u=\\dfrac{0.87(415)(1000)}{0.36(20)(300)}=\\dfrac{361050}{2160}=167.1$$", target: "$\\approx167\\,\\text{mm}$." },
    },
    {
      id: "ce-rcc-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "For $A_{st}=1200\\,\\text{mm}^2$ of Fe500 steel, the design tensile force $0.87f_yA_{st}$ is _____ kN.",
      natAnswer: 522, acceptedRange: [520, 524],
      solution: { given: "$f_y=500,A_{st}=1200$.", derivation: "$$T=0.87(500)(1200)/1000=522$$", target: "$522\\,\\text{kN}$." },
    },
  ],
};

const ceSteel: LearnTopic = {
  slug: "ce-se-steel-members",
  subject: "Structural Engineering",
  title: "Steel — Tension & Compression Members",
  tier: "subject",
  blurb:
    "IS 800 limit-state design: gross-section yielding, slenderness and the fundamentals of member capacity.",
  module: {
    principle:
      "A **tension member** can fail by gross-section yielding, net-section rupture or block shear; the design strength is the least of these. A **compression member**'s capacity falls as its **slenderness ratio** $\\lambda=L_e/r_{min}$ rises (Euler buckling). Effective length depends on end conditions.",
    formulaMatrix: [
      "**Gross-section yielding**: $T_{dg}=\\dfrac{A_gf_y}{\\gamma_{m0}}$, $\\gamma_{m0}=1.10$.",
      "",
      "**Slenderness ratio**: $\\lambda=\\dfrac{L_e}{r_{min}}$",
      "",
      "**Euler critical load**: $P_{cr}=\\dfrac{\\pi^2EI}{L_e^2}$",
      "",
      "**Effective length factors**: both fixed → $0.65L$, both pinned → $1.0L$, fixed-free → $2.0L$.",
      "",
      "**Fillet weld throat**: $t=0.707s$.",
    ].join("\n"),
    traps: [
      "**Least of three limit states.** Tension design uses the minimum of yielding, rupture and block shear.",
      "**$r_{min}$, not $r_{max}$.** Buckling occurs about the weakest axis.",
      "**Effective length ≠ actual length.** Apply the end-condition factor.",
    ],
  },
  questions: [
    {
      id: "ce-st-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A column has effective length $4000\\,\\text{mm}$ and minimum radius of gyration $40\\,\\text{mm}$. Its slenderness ratio is _____.",
      natAnswer: 100, acceptedRange: [99.5, 100.5],
      solution: { given: "$L_e=4000,r_{min}=40$.", derivation: "$$\\lambda=\\dfrac{4000}{40}=100$$", target: "$100$." },
    },
    {
      id: "ce-st-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A tension member of gross area $1500\\,\\text{mm}^2$ (Fe250, $\\gamma_{m0}=1.1$) has gross-yielding strength _____ kN.",
      natAnswer: 340.9, acceptedRange: [339, 343],
      solution: { given: "$A_g=1500,f_y=250$.", derivation: "$$T_{dg}=\\dfrac{1500\\times250}{1.1\\times1000}=340.9$$", target: "$\\approx341\\,\\text{kN}$." },
    },
    {
      id: "ce-st-q3", difficulty: "hard", marks: 1, type: "MCQ",
      stem: "For a column with both ends fixed (no sway), the theoretical effective length factor is:",
      options: ["$0.5$", "$1.0$", "$2.0$", "$0.7$"], answer: 0,
      solution: { given: "Both ends fixed.", derivation: "Theoretical $L_e=0.5L$ (IS 800 design value $0.65L$).", target: "Correct option: $0.5$." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 3 — Geotechnical Engineering                                  */
/* ════════════════════════════════════════════════════════════════════ */

const ceSoilPhase: LearnTopic = {
  slug: "ce-ge-soil-phase-relations",
  subject: "Geotechnical Engineering",
  title: "Soil Phase Relations & Index Properties",
  tier: "free",
  blurb:
    "Void ratio, porosity, water content, unit weights and Atterberg limits — the descriptive vocabulary of soil.",
  module: {
    principle:
      "Soil is a **three-phase** system (solids, water, air). The **void ratio** $e$ (voids ÷ solids) and **porosity** $n$ (voids ÷ total) describe packing; the basic identity is $Se=wG_s$. **Atterberg limits** mark the water contents separating the solid, plastic and liquid states of fine soils.",
    formulaMatrix: [
      "**Void ratio / porosity**: $e=\\dfrac{n}{1-n},\\quad n=\\dfrac{e}{1+e}$",
      "",
      "**Basic relation**: $Se=wG_s$",
      "",
      "**Dry unit weight**: $\\gamma_d=\\dfrac{\\gamma}{1+w}=\\dfrac{G_s\\gamma_w}{1+e}$",
      "",
      "**Plasticity index**: $PI=LL-PL$",
    ].join("\n"),
    traps: [
      "**$e$ vs $n$.** Void ratio is voids/solids (can exceed 1); porosity is voids/total (always $<1$).",
      "**Water content can exceed 100%** for soft clays — it is mass of water per mass of solids.",
      "**Bulk vs dry unit weight.** Divide by $(1+w)$ to convert bulk to dry.",
    ],
  },
  questions: [
    {
      id: "ce-soil-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A soil has porosity $40\\%$. Its void ratio is _____.",
      natAnswer: 0.667, acceptedRange: [0.66, 0.67],
      solution: { given: "$n=0.40$.", derivation: "$$e=\\dfrac{n}{1-n}=\\dfrac{0.40}{0.60}=0.667$$", target: "$\\approx0.667$." },
    },
    {
      id: "ce-soil-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A soil has bulk unit weight $20\\,\\text{kN/m}^3$ and water content $25\\%$. Its dry unit weight is _____ kN/m³.",
      natAnswer: 16, acceptedRange: [15.9, 16.1],
      solution: { given: "$\\gamma=20,w=0.25$.", derivation: "$$\\gamma_d=\\dfrac{20}{1+0.25}=16$$", target: "$16\\,\\text{kN/m}^3$." },
    },
    {
      id: "ce-soil-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "A soil has $w=20\\%$, $G_s=2.70$ and void ratio $0.6$. Its degree of saturation is _____ %.",
      natAnswer: 90, acceptedRange: [89, 91],
      solution: { given: "$Se=wG_s$.", derivation: "$$S=\\dfrac{wG_s}{e}=\\dfrac{0.20\\times2.70}{0.6}=0.90=90\\%$$", target: "$90\\%$." },
    },
  ],
};

const ceBearingCapacity: LearnTopic = {
  slug: "ce-ge-bearing-capacity",
  subject: "Geotechnical Engineering",
  title: "Shear Strength & Bearing Capacity",
  tier: "subject",
  blurb:
    "Mohr–Coulomb strength, Rankine earth pressure and Terzaghi bearing capacity — the design heart of foundations.",
  module: {
    principle:
      "Soil shear strength follows **Mohr–Coulomb**: $\\tau_f=c+\\sigma'\\tan\\phi$. A footing fails when the applied pressure reaches the **ultimate bearing capacity**; Terzaghi superposes cohesion, surcharge and self-weight terms. Lateral earth pressure on retaining walls uses Rankine's coefficients.",
    formulaMatrix: [
      "**Mohr–Coulomb**: $\\tau_f=c+\\sigma'\\tan\\phi$",
      "",
      "**Rankine active / passive**: $K_a=\\dfrac{1-\\sin\\phi}{1+\\sin\\phi},\\quad K_p=\\dfrac1{K_a}$",
      "",
      "**Terzaghi (strip)**: $q_u=cN_c+\\gamma D_fN_q+0.5\\gamma BN_\\gamma$",
      "",
      "**Clay, $\\phi=0$**: $N_c=5.7,N_q=1,N_\\gamma=0$.",
      "",
      "**Net safe bearing capacity**: $q_{safe}=\\dfrac{q_u}{\\text{FoS}}$ (FoS usually $3$).",
    ].join("\n"),
    traps: [
      "**Effective stress controls strength.** Use $\\sigma'$ (not total $\\sigma$) in Mohr–Coulomb.",
      "**$K_p=1/K_a$** only for a smooth vertical wall with horizontal backfill.",
      "**Net vs gross capacity.** Subtract the surcharge $\\gamma D_f$ for net values.",
    ],
  },
  questions: [
    {
      id: "ce-bc-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "For a cohesionless backfill with $\\phi=30^\\circ$, the Rankine active earth pressure coefficient $K_a$ is _____.",
      natAnswer: 0.333, acceptedRange: [0.33, 0.34],
      solution: { given: "$\\phi=30^\\circ$, $\\sin30^\\circ=0.5$.", derivation: "$$K_a=\\dfrac{1-0.5}{1+0.5}=\\dfrac{0.5}{1.5}=0.333$$", target: "$\\approx0.333$." },
    },
    {
      id: "ce-bc-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A strip footing at $1\\,\\text{m}$ depth rests on clay ($c=30\\,\\text{kPa}$, $\\phi=0$, $\\gamma=18\\,\\text{kN/m}^3$). Using Terzaghi ($N_c=5.7,N_q=1,N_\\gamma=0$), $q_u$ is _____ kPa.",
      natAnswer: 189, acceptedRange: [188, 190],
      solution: { given: "$c=30,\\gamma=18,D_f=1$.", derivation: "$$q_u=30(5.7)+18(1)(1)=171+18=189$$", target: "$189\\,\\text{kPa}$." },
    },
    {
      id: "ce-bc-q3", difficulty: "hard", marks: 1, type: "NAT",
      stem: "The ultimate bearing capacity is $450\\,\\text{kPa}$. With a factor of safety of $3$, the safe bearing capacity is _____ kPa.",
      natAnswer: 150, acceptedRange: [149, 151],
      solution: { given: "$q_u=450$, FoS $=3$.", derivation: "$$q_{safe}=\\dfrac{450}{3}=150$$", target: "$150\\,\\text{kPa}$." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 4 — Water Resources Engineering                               */
/* ════════════════════════════════════════════════════════════════════ */

const ceFluidMechanics: LearnTopic = {
  slug: "ce-wr-fluid-mechanics",
  subject: "Water Resources Engineering",
  title: "Fluid Mechanics & Flow",
  tier: "free",
  blurb:
    "Continuity, Bernoulli, hydrostatics and Manning's open-channel flow — the hydraulics fundamentals.",
  module: {
    principle:
      "**Continuity** conserves mass: $Q=Av$ is constant along a streamtube. **Bernoulli** conserves energy along a streamline. **Hydrostatic pressure** rises linearly with depth, $p=\\gamma_w h$. In open channels, **Manning's equation** relates velocity to slope and hydraulic radius.",
    formulaMatrix: [
      "**Continuity**: $Q=A_1v_1=A_2v_2$",
      "",
      "**Bernoulli**: $\\dfrac{p}{\\gamma}+\\dfrac{v^2}{2g}+z=\\text{const}$",
      "",
      "**Hydrostatic pressure**: $p=\\gamma_wh$",
      "",
      "**Manning**: $v=\\dfrac1n R^{2/3}S^{1/2}$",
      "",
      "**Reynolds number**: $Re=\\dfrac{vD}{\\nu}$ ($<2000$ laminar, $>4000$ turbulent).",
    ].join("\n"),
    traps: [
      "**Bernoulli = energy conservation**, not momentum. It needs steady, incompressible, inviscid flow along a streamline.",
      "**Hydraulic radius $R=A/P$**, not the geometric radius.",
      "**Gauge vs absolute pressure.** $p=\\gamma_wh$ gives gauge pressure.",
    ],
  },
  questions: [
    {
      id: "ce-fm-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "Water flows through a pipe of area $0.5\\,\\text{m}^2$ at $2\\,\\text{m/s}$. The discharge is _____ m³/s.",
      natAnswer: 1.0, acceptedRange: [0.99, 1.01],
      solution: { given: "$A=0.5,v=2$.", derivation: "$$Q=Av=0.5\\times2=1.0$$", target: "$1.0\\,\\text{m}^3/\\text{s}$." },
    },
    {
      id: "ce-fm-q2", difficulty: "medium", marks: 1, type: "NAT",
      stem: "The gauge pressure at $5\\,\\text{m}$ depth below a free water surface ($\\gamma_w=9.81\\,\\text{kN/m}^3$) is _____ kPa.",
      natAnswer: 49.05, acceptedRange: [48.9, 49.2],
      solution: { given: "$h=5,\\gamma_w=9.81$.", derivation: "$$p=9.81\\times5=49.05$$", target: "$49.05\\,\\text{kPa}$." },
    },
    {
      id: "ce-fm-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "Using Manning's equation with $n=0.013$, $R=0.5\\,\\text{m}$ and $S=0.001$, the mean velocity is _____ m/s.",
      natAnswer: 1.53, acceptedRange: [1.5, 1.56],
      solution: { given: "$n=0.013,R=0.5,S=0.001$.", derivation: "$$v=\\dfrac1{0.013}(0.5)^{2/3}(0.001)^{1/2}=76.9\\times0.63\\times0.0316=1.53$$", target: "$\\approx1.53\\,\\text{m/s}$." },
    },
  ],
};

const ceHydrology: LearnTopic = {
  slug: "ce-wr-hydrology-irrigation",
  subject: "Water Resources Engineering",
  title: "Hydrology & Irrigation",
  tier: "subject",
  blurb:
    "Rational-method runoff, the unit hydrograph concept and the duty–delta relationship of irrigation.",
  module: {
    principle:
      "The **rational method** estimates peak runoff from rainfall intensity, catchment area and a runoff coefficient. A **unit hydrograph** is the direct-runoff response to $1\\,\\text{cm}$ of effective rain in unit time. In irrigation, **duty**, **delta** and **base period** are linked by a single relation.",
    formulaMatrix: [
      "**Rational method**: $Q=\\dfrac{CIA}{360}$ ($A$ in ha, $I$ in mm/hr, $Q$ in m³/s).",
      "",
      "**Duty–delta**: $\\Delta=\\dfrac{8.64\\,B}{D}$ (m), $B$=base period (days), $D$=duty (ha/cumec).",
      "",
      "**Runoff depth**: runoff $=$ rainfall $-$ losses.",
    ].join("\n"),
    traps: [
      "**Unit care in the rational method.** The $360$ factor pairs hectares, mm/hr and m³/s.",
      "**Delta is a depth (m)**, duty is an area per unit discharge — keep them distinct.",
      "**Effective rainfall ≠ total rainfall** for a unit hydrograph; subtract abstractions.",
    ],
  },
  questions: [
    {
      id: "ce-hy-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A storm produces $80\\,\\text{mm}$ of rainfall with abstractions of $30\\,\\text{mm}$. The direct runoff depth is _____ mm.",
      natAnswer: 50, acceptedRange: [49.5, 50.5],
      solution: { given: "Rainfall $80$, losses $30$.", derivation: "$$\\text{runoff}=80-30=50$$", target: "$50\\,\\text{mm}$." },
    },
    {
      id: "ce-hy-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "For a catchment of $20\\,\\text{ha}$, $C=0.6$ and intensity $50\\,\\text{mm/hr}$, the peak runoff (rational method) is _____ m³/s.",
      natAnswer: 1.667, acceptedRange: [1.64, 1.69],
      solution: { given: "$C=0.6,I=50,A=20$.", derivation: "$$Q=\\dfrac{0.6\\times50\\times20}{360}=\\dfrac{600}{360}=1.667$$", target: "$\\approx1.667\\,\\text{m}^3/\\text{s}$." },
    },
    {
      id: "ce-hy-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "For a base period of $120\\,\\text{days}$ and a duty of $800\\,\\text{ha/cumec}$, the delta is _____ m.",
      natAnswer: 1.296, acceptedRange: [1.28, 1.31],
      solution: { given: "$B=120,D=800$.", derivation: "$$\\Delta=\\dfrac{8.64\\times120}{800}=\\dfrac{1036.8}{800}=1.296$$", target: "$\\approx1.296\\,\\text{m}$." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 5 — Environmental Engineering                                 */
/* ════════════════════════════════════════════════════════════════════ */

const ceEnvironmental: LearnTopic = {
  slug: "ce-en-water-wastewater",
  subject: "Environmental Engineering",
  title: "Water Demand, Treatment & BOD",
  tier: "subject",
  blurb:
    "Per-capita demand, sedimentation, disinfection and the first-order BOD equation — the public-health core.",
  module: {
    principle:
      "Town water demand scales with population and per-capita rate. In a **sedimentation tank**, a particle is removed if its settling velocity exceeds the **surface overflow rate**. **BOD** measures biodegradable organic load and decays first-order with time. **Chlorine demand** is the dose consumed before a residual remains.",
    formulaMatrix: [
      "**Average demand**: $Q=\\dfrac{\\text{population}\\times\\text{lpcd}}{10^6}\\ \\text{MLD}$",
      "",
      "**BOD exerted**: $y_t=L_0(1-10^{-kt})$ (base-10 rate $k$).",
      "",
      "**Chlorine demand**: applied $-$ residual.",
      "",
      "**Surface overflow rate**: $v_0=\\dfrac{Q}{A_{\\text{plan}}}$; removal if $v_s\\ge v_0$.",
    ].join("\n"),
    traps: [
      "**Base-10 vs base-e BOD.** $k$ values differ by a factor of $2.303$; match the equation form.",
      "**Overflow rate depends on plan area only**, not tank depth.",
      "**Hardness is reported as CaCO₃ equivalent.**",
    ],
  },
  questions: [
    {
      id: "ce-env-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A town of population $100{,}000$ has a per-capita demand of $135\\,\\text{lpcd}$. The average daily demand is _____ MLD.",
      natAnswer: 13.5, acceptedRange: [13.4, 13.6],
      solution: { given: "pop $=10^5$, lpcd $=135$.", derivation: "$$Q=\\dfrac{10^5\\times135}{10^6}=13.5$$", target: "$13.5\\,\\text{MLD}$." },
    },
    {
      id: "ce-env-q2", difficulty: "medium", marks: 1, type: "NAT",
      stem: "If $5\\,\\text{mg/L}$ of chlorine is applied and the residual is $0.5\\,\\text{mg/L}$, the chlorine demand is _____ mg/L.",
      natAnswer: 4.5, acceptedRange: [4.45, 4.55],
      solution: { given: "applied $5$, residual $0.5$.", derivation: "$$\\text{demand}=5-0.5=4.5$$", target: "$4.5\\,\\text{mg/L}$." },
    },
    {
      id: "ce-env-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "The ultimate BOD of a waste is $300\\,\\text{mg/L}$ with $k=0.1\\,\\text{day}^{-1}$ (base 10). The BOD exerted in $5$ days is _____ mg/L.",
      natAnswer: 205.1, acceptedRange: [202, 208],
      solution: { given: "$L_0=300,k=0.1,t=5$.", derivation: "$$y_5=300(1-10^{-0.5})=300(1-0.3162)=300(0.6838)=205.1$$", target: "$\\approx205\\,\\text{mg/L}$." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 6 — Transportation Engineering                                */
/* ════════════════════════════════════════════════════════════════════ */

const ceTransportation: LearnTopic = {
  slug: "ce-tr-geometric-design",
  subject: "Transportation Engineering",
  title: "Highway Geometric Design",
  tier: "subject",
  blurb:
    "Sight distance, superelevation and the fundamental traffic-flow relation — the geometry of safe roads.",
  module: {
    principle:
      "**Stopping sight distance** is the lag (reaction) distance plus the braking distance. On a horizontal curve, **superelevation** plus side friction counter the centrifugal force; the no-friction value balances it fully. The **fundamental traffic relation** links flow, density and speed.",
    formulaMatrix: [
      "**Lag distance**: $d=0.278Vt$ ($V$ in km/h, $t$ in s).",
      "",
      "**Braking distance**: $d_b=\\dfrac{V^2}{254f}$.",
      "",
      "**Superelevation (no friction)**: $e=\\dfrac{V^2}{127R}$.",
      "",
      "**Traffic flow**: $q=k\\,v$ (flow = density × speed).",
    ].join("\n"),
    traps: [
      "**Speed-unit factors.** The $0.278$ and $127$ constants embed the km/h → m/s conversion.",
      "**SSD = lag + braking**, both terms; on gradients add $\\pm g$ to friction.",
      "**Superelevation is dimensionless** (a slope, e.g. $0.07$).",
    ],
  },
  questions: [
    {
      id: "ce-tr-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A traffic stream has density $40\\,\\text{veh/km}$ and space-mean speed $60\\,\\text{km/h}$. The flow is _____ veh/h.",
      natAnswer: 2400, acceptedRange: [2399, 2401],
      solution: { given: "$k=40,v=60$.", derivation: "$$q=kv=40\\times60=2400$$", target: "$2400\\,\\text{veh/h}$." },
    },
    {
      id: "ce-tr-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "For a design speed of $60\\,\\text{km/h}$ and reaction time $2.5\\,\\text{s}$, the lag distance is _____ m.",
      natAnswer: 41.7, acceptedRange: [41.5, 41.9],
      solution: { given: "$V=60,t=2.5$.", derivation: "$$d=0.278\\times60\\times2.5=41.7$$", target: "$\\approx41.7\\,\\text{m}$." },
    },
    {
      id: "ce-tr-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "For a design speed of $80\\,\\text{km/h}$ on a curve of radius $200\\,\\text{m}$, the superelevation to fully counteract centrifugal force (no friction) is _____.",
      natAnswer: 0.252, acceptedRange: [0.24, 0.26],
      solution: { given: "$V=80,R=200$.", derivation: "$$e=\\dfrac{80^2}{127\\times200}=\\dfrac{6400}{25400}=0.252$$", target: "$\\approx0.252$." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 7 — Geomatics Engineering                                     */
/* ════════════════════════════════════════════════════════════════════ */

const ceSurveying: LearnTopic = {
  slug: "ce-gm-levelling-tacheometry",
  subject: "Geomatics Engineering",
  title: "Levelling & Tacheometry",
  tier: "free",
  blurb:
    "Height-of-instrument levelling, stadia tacheometry and curve geometry — the measurement backbone of surveying.",
  module: {
    principle:
      "In **levelling**, the height of instrument equals the known RL plus a backsight; any point's RL is HI minus its foresight. **Tacheometry** finds horizontal distance from a staff intercept via the multiplying constant. A **circular curve**'s length follows from its radius and central angle.",
    formulaMatrix: [
      "**Height of instrument**: $\\text{HI}=\\text{RL}_{BM}+\\text{BS}$",
      "",
      "**Reduced level**: $\\text{RL}=\\text{HI}-\\text{FS}$",
      "",
      "**Tacheometry (horizontal sight)**: $D=KS+C$ ($K=100,C=0$ typical).",
      "",
      "**Curve length**: $L=\\dfrac{\\pi R\\Delta}{180}$ ($\\Delta$ in degrees).",
    ].join("\n"),
    traps: [
      "**Backsight adds, foresight subtracts.** HI rises by BS; RL of a point falls by FS.",
      "**Tacheometry constant.** $K=100$ multiplies the staff intercept; the additive $C$ is usually zero.",
      "**Radians vs degrees.** Convert $\\Delta$ when using $L=R\\Delta$.",
    ],
  },
  questions: [
    {
      id: "ce-sv-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "The RL of a benchmark is $100.000\\,\\text{m}$ and the backsight on it is $1.250\\,\\text{m}$. The height of instrument is _____ m.",
      natAnswer: 101.25, acceptedRange: [101.24, 101.26],
      solution: { given: "$\\text{RL}=100.000,\\text{BS}=1.250$.", derivation: "$$\\text{HI}=100.000+1.250=101.250$$", target: "$101.250\\,\\text{m}$." },
    },
    {
      id: "ce-sv-q2", difficulty: "medium", marks: 1, type: "NAT",
      stem: "A tacheometer ($K=100,C=0$) reads a staff intercept of $1.2\\,\\text{m}$ on a horizontal sight. The horizontal distance is _____ m.",
      natAnswer: 120, acceptedRange: [119.5, 120.5],
      solution: { given: "$K=100,S=1.2,C=0$.", derivation: "$$D=100\\times1.2=120$$", target: "$120\\,\\text{m}$." },
    },
    {
      id: "ce-sv-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "A circular curve of radius $300\\,\\text{m}$ has a central angle of $40^\\circ$. Its length is _____ m.",
      natAnswer: 209.4, acceptedRange: [208, 211],
      solution: { given: "$R=300,\\Delta=40^\\circ$.", derivation: "$$L=\\dfrac{\\pi\\times300\\times40}{180}=\\dfrac{37699}{180}=209.4$$", target: "$\\approx209.4\\,\\text{m}$." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  TOPIC REGISTRY                                                        */
/* ════════════════════════════════════════════════════════════════════ */

export const CE_LEARN_TOPICS: LearnTopic[] = [
  ceLinearAlgebra,
  ceProbability,
  ceEngMechanics,
  ceSimpleStress,
  ceStructuralAnalysis,
  ceRcc,
  ceSteel,
  ceSoilPhase,
  ceBearingCapacity,
  ceFluidMechanics,
  ceHydrology,
  ceEnvironmental,
  ceTransportation,
  ceSurveying,
];

export function getCivilLearnTopic(slug: string): LearnTopic | undefined {
  return CE_LEARN_TOPICS.find((t) => t.slug === slug);
}

/* ════════════════════════════════════════════════════════════════════ */
/*  GATE CE SYLLABUS MAP                                                  */
/* ════════════════════════════════════════════════════════════════════ */

export const CE_LEARN_SYLLABUS: LearnSyllabusSection[] = [
  {
    id: 1,
    title: "Engineering Mathematics",
    summary: "The mathematical toolkit underpinning every quantitative question on the paper.",
    subtopics: [
      { title: "Linear Algebra", slug: "ce-em-linear-algebra", highlight: "Matrices, rank, systems of equations, eigenvalues & eigenvectors" },
      { title: "Calculus", highlight: "Limits, derivatives, maxima/minima, definite & multiple integrals" },
      { title: "Ordinary Differential Equations", highlight: "First-order, higher-order linear, Euler–Cauchy equations" },
      { title: "Partial Differential Equations", highlight: "Laplace, heat & wave equations; method of separation" },
      { title: "Probability & Statistics", slug: "ce-em-probability-statistics", highlight: "Mean, variance, distributions, conditional probability" },
      { title: "Numerical Methods", highlight: "Root finding, interpolation, numerical integration & ODEs" },
    ],
  },
  {
    id: 2,
    title: "Structural Engineering",
    summary: "Mechanics, analysis and the design of concrete and steel structures.",
    subtopics: [
      { title: "Engineering Mechanics", slug: "ce-se-engineering-mechanics", highlight: "Equilibrium, resultants, trusses, friction" },
      { title: "Simple Stresses & Strains", slug: "ce-se-simple-stresses", highlight: "Axial stress, Hooke's law, elongation, elastic constants" },
      { title: "Bending & Shear Stresses", highlight: "Flexure formula σ=My/I, transverse shear, torsion" },
      { title: "Structural Analysis", slug: "ce-se-structural-analysis", highlight: "Determinacy, SF & BM diagrams, standard beam results" },
      { title: "Deflection of Beams", highlight: "Double integration, moment-area, unit-load methods" },
      { title: "Construction Materials & Management", highlight: "Concrete, PERT/CPM, EOQ, work study" },
      { title: "Concrete Structures (RCC)", slug: "ce-se-rcc-limit-state", highlight: "Limit state, stress block, neutral axis, moment capacity" },
      { title: "Steel Structures", slug: "ce-se-steel-members", highlight: "Tension & compression members, slenderness, connections" },
    ],
  },
  {
    id: 3,
    title: "Geotechnical Engineering",
    summary: "Soil behaviour and the design of foundations and earth structures.",
    subtopics: [
      { title: "Soil Phase Relations & Index Properties", slug: "ce-ge-soil-phase-relations", highlight: "Void ratio, unit weights, Atterberg limits, classification" },
      { title: "Effective Stress & Seepage", highlight: "Terzaghi principle, flow nets, quick condition" },
      { title: "Consolidation", highlight: "Coefficient of consolidation, settlement, time factor" },
      { title: "Shear Strength & Bearing Capacity", slug: "ce-ge-bearing-capacity", highlight: "Mohr–Coulomb, Rankine, Terzaghi bearing capacity" },
      { title: "Foundation Engineering", highlight: "Shallow & deep foundations, pile groups, settlement" },
    ],
  },
  {
    id: 4,
    title: "Water Resources Engineering",
    summary: "Fluid mechanics, hydrology and the engineering of irrigation systems.",
    subtopics: [
      { title: "Fluid Mechanics & Flow", slug: "ce-wr-fluid-mechanics", highlight: "Continuity, Bernoulli, hydrostatics, Manning flow" },
      { title: "Flow Through Pipes", highlight: "Darcy–Weisbach, major & minor losses, networks" },
      { title: "Open Channel Flow", highlight: "Specific energy, critical flow, hydraulic jump" },
      { title: "Hydrology & Irrigation", slug: "ce-wr-hydrology-irrigation", highlight: "Rational method, unit hydrograph, duty–delta" },
    ],
  },
  {
    id: 5,
    title: "Environmental Engineering",
    summary: "Water supply, wastewater, air and noise — protecting public health.",
    subtopics: [
      { title: "Water Demand, Treatment & BOD", slug: "ce-en-water-wastewater", highlight: "Per-capita demand, sedimentation, disinfection, BOD kinetics" },
      { title: "Wastewater Treatment", highlight: "Primary, secondary & tertiary processes; sludge" },
      { title: "Air Pollution", highlight: "Primary & secondary pollutants, control, standards" },
      { title: "Solid Waste & Noise", highlight: "MSW management, decibel addition, exposure limits" },
    ],
  },
  {
    id: 6,
    title: "Transportation Engineering",
    summary: "Geometric design, traffic flow and pavement engineering.",
    subtopics: [
      { title: "Highway Geometric Design", slug: "ce-tr-geometric-design", highlight: "Sight distance, superelevation, traffic flow relation" },
      { title: "Traffic Engineering", highlight: "Speed studies, capacity, signal design, PCU" },
      { title: "Pavement Design", highlight: "Flexible & rigid pavements, CBR, Westergaard" },
      { title: "Highway Materials", highlight: "Aggregates, bitumen tests, mix design" },
    ],
  },
  {
    id: 7,
    title: "Geomatics Engineering",
    summary: "Surveying, levelling and modern positioning systems.",
    subtopics: [
      { title: "Levelling & Tacheometry", slug: "ce-gm-levelling-tacheometry", highlight: "HI method, stadia distance, curve geometry" },
      { title: "Theodolite & Traverse", highlight: "Angles, bearings, latitude & departure, closing error" },
      { title: "Curves", highlight: "Simple, compound, transition & vertical curves" },
      { title: "Modern Surveying", highlight: "Total station, GPS/GNSS, GIS & remote sensing" },
    ],
  },
];

/** A syllabus sub-topic resolved against the authored CE LearnTopic bank. */
export type CeResolvedSubtopic = LearnSyllabusSubtopic & { topic?: LearnTopic };

/** The full CE syllabus with each sub-topic's authored LearnTopic attached. */
export function getCivilLearnSyllabus(): (Omit<LearnSyllabusSection, "subtopics"> & {
  subtopics: CeResolvedSubtopic[];
  liveCount: number;
})[] {
  return CE_LEARN_SYLLABUS.map((sec) => {
    const subtopics: CeResolvedSubtopic[] = sec.subtopics.map((st) => ({
      ...st,
      topic: st.slug ? getCivilLearnTopic(st.slug) : undefined,
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
