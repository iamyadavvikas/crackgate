/**
 * Topic-Wise Learn & Solve Engine — data model + authored content.
 *
 * Each LearnTopic bundles three parts, mirroring the CrackGate "IIT Professor"
 * authoring spec:
 *   1. module      → Part 1: Topic Breakdown & Traps (theory, formula matrix, traps)
 *   2. questions[] → Part 2: Progressive 3-tier suite (basic / medium / hard)
 *   3. each question's `solution` → Part 3: post-submission worked solution
 *
 * Answer conventions (engine compares against these):
 *   • MCQ  → `answer` is the 0-based index of the single correct option.
 *   • MSQ  → `answer` is an array of 0-based indices (all must match; no partial).
 *   • NAT  → `natAnswer` is the exact target; `acceptedRange` is the inclusive
 *            [min, max] band that the engine marks correct (rounding tolerance).
 *
 * Figures reuse the typed QuestionFigure renderer (question-figure.tsx), so a
 * question can carry a ventilation network, P–Q fan curve, Mohr circle, etc.
 * as plain JSON.
 */
import type { QuestionFigure } from "@/components/question-figure";

export type LearnDifficulty = "basic" | "medium" | "hard";

export type LearnQuestion = {
  id: string;
  difficulty: LearnDifficulty;
  marks: 1 | 2;
  type: "MCQ" | "NAT" | "MSQ";
  stem: string;
  /** MCQ / MSQ option labels (LaTeX-aware via MathText). */
  options?: string[];
  /** MCQ: 0-based correct index. MSQ: array of 0-based correct indices. */
  answer?: number | number[];
  /** NAT: exact target value. */
  natAnswer?: number;
  /** NAT: inclusive accepted band the engine marks correct. */
  acceptedRange?: [number, number];
  /** Unit shown next to a NAT answer (e.g. "Pa", "m³/s"). */
  unit?: string;
  figure?: QuestionFigure;
  solution: {
    /** Given Parameters Matrix — inputs + unit conversions. */
    given: string;
    /** Mathematical Derivation Track — line-by-line algebra. */
    derivation: string;
    /** Target Value & Acceptable Range (or correct option rationale). */
    target: string;
  };
};

export type LearnModule = {
  /** The physical core mechanism. */
  principle: string;
  /** Definitive equations as MathText ($$…$$ blocks). */
  formulaMatrix: string;
  /** At least two common conceptual / mathematical missteps. */
  traps: string[];
  /** Optional illustrative figure for the learning module. */
  figure?: QuestionFigure;
};

export type LearnTier = "free" | "subject" | "premium";

export type LearnTopic = {
  slug: string;
  subject: string;
  title: string;
  tier: LearnTier;
  blurb: string;
  module: LearnModule;
  questions: LearnQuestion[];
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 1 — Engineering Mathematics                                   */
/* ════════════════════════════════════════════════════════════════════ */

const emLinearAlgebra: LearnTopic = {
  slug: "em-linear-algebra",
  subject: "Engineering Mathematics",
  title: "Linear Algebra",
  tier: "free",
  blurb:
    "Determinants, inverses, rank and — above all — eigenvalues: the matrix toolkit GATE leans on for systems and stability.",
  module: {
    principle:
      "A matrix is a compact way to store a **linear transformation** or a **system of linear equations**. The **determinant** measures how that transformation scales volume — and a zero determinant means information is lost (the matrix is singular and non-invertible, the system has no unique solution). **Eigenvalues** are the special scaling factors $\\lambda$ for which $A\\mathbf{x} = \\lambda\\mathbf{x}$: the transformation merely stretches certain directions (eigenvectors) without rotating them. Two shortcuts make 2×2 problems instant: the eigenvalues sum to the **trace** and multiply to the **determinant**.",
    formulaMatrix: [
      "**Determinant (2×2)**: $\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix} = ad - bc$",
      "",
      "**Inverse (2×2)**: $A^{-1} = \\dfrac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$ (exists only if $\\det A \\neq 0$).",
      "",
      "**Characteristic equation**: $\\det(A - \\lambda I) = 0$.",
      "",
      "**Trace / determinant shortcuts**:",
      "$$\\lambda_1 + \\lambda_2 = \\text{tr}(A) = a+d,\\qquad \\lambda_1\\lambda_2 = \\det(A)$$",
      "",
      "**3×3 determinant (cofactor expansion along row 1)**:",
      "$$\\det = a_{11}(a_{22}a_{33}-a_{23}a_{32}) - a_{12}(a_{21}a_{33}-a_{23}a_{31}) + a_{13}(a_{21}a_{32}-a_{22}a_{31})$$",
    ].join("\n"),
    traps: [
      "**Eigenvalue sum vs product.** $\\lambda_1+\\lambda_2 = \\text{trace}$ and $\\lambda_1\\lambda_2 = \\det$ — swapping these (or dropping a sign) is the commonest 2×2 mistake.",
      "**Cofactor sign pattern.** The 3×3 expansion alternates $+\\,-\\,+$. Forgetting the middle minus sign flips the answer.",
      "**Singular ⇒ no inverse.** If $\\det A = 0$ the inverse does not exist; the system is either inconsistent or has infinitely many solutions — never a unique one.",
      "**$AB \\neq BA$.** Matrix multiplication is not commutative; never reorder factors.",
    ],
  },
  questions: [
    {
      id: "la-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "The determinant of $\\begin{bmatrix}2 & 3\\\\ 1 & 4\\end{bmatrix}$ is:",
      options: ["$5$", "$8$", "$11$", "$-5$"],
      answer: 0,
      solution: {
        given: "$a=2,\\ b=3,\\ c=1,\\ d=4$.",
        derivation: "$$\\det = ad - bc = (2)(4) - (3)(1) = 8 - 3 = 5$$",
        target:
          "**Correct option: $5$.** $8$ keeps only $ad$; $11$ adds instead of subtracts ($ad+bc$); $-5$ reverses the subtraction.",
      },
    },
    {
      id: "la-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "For the matrix $A = \\begin{bmatrix}4 & 1\\\\ 2 & 3\\end{bmatrix}$, the larger of its two eigenvalues is ______. (Round off to two decimal places.)",
      natAnswer: 5,
      acceptedRange: [4.9, 5.1],
      unit: "",
      solution: {
        given: "$\\text{tr}(A) = 4+3 = 7$, $\\det(A) = (4)(3)-(1)(2) = 10$.",
        derivation:
          "Characteristic equation $\\lambda^2 - \\text{tr}\\,\\lambda + \\det = 0$:\n$$\\lambda^2 - 7\\lambda + 10 = 0 \\;\\Rightarrow\\; (\\lambda-5)(\\lambda-2)=0 \\;\\Rightarrow\\; \\lambda = 5,\\ 2$$",
        target: "**Target: 5.00 | Accepted range: 4.90 to 5.10.** The smaller eigenvalue is 2.",
      },
    },
    {
      id: "la-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "The determinant of $\\begin{bmatrix}1 & 2 & 3\\\\ 4 & 5 & 6\\\\ 7 & 8 & 10\\end{bmatrix}$ is ______. (Round off to two decimal places.)",
      natAnswer: -3,
      acceptedRange: [-3.1, -2.9],
      unit: "",
      solution: {
        given: "Cofactor expansion along the first row.",
        derivation:
          "$$\\det = 1(5\\cdot10 - 6\\cdot8) - 2(4\\cdot10 - 6\\cdot7) + 3(4\\cdot8 - 5\\cdot7)$$\n$$= 1(50-48) - 2(40-42) + 3(32-35) = 1(2) - 2(-2) + 3(-3)$$\n$$= 2 + 4 - 9 = -3$$",
        target: "**Target: −3.00 | Accepted range: −3.10 to −2.90.** Watch the alternating cofactor signs.",
      },
    },
  ],
};

const emCalculus: LearnTopic = {
  slug: "em-calculus",
  subject: "Engineering Mathematics",
  title: "Calculus",
  tier: "subject",
  blurb:
    "Derivatives, definite integrals, maxima–minima and area between curves — the rate-of-change and accumulation engine of GATE numericals.",
  module: {
    principle:
      "Calculus answers two complementary questions. The **derivative** gives the *instantaneous rate of change* — the slope of a curve — and at a maximum or minimum that slope is zero. The **definite integral** gives *accumulation* — the signed area under a curve between two limits. The Fundamental Theorem of Calculus ties them together: integrating a function and then differentiating returns the original, so a definite integral is evaluated by finding an antiderivative and taking the difference at the limits.",
    formulaMatrix: [
      "**Power rule**: $\\dfrac{d}{dx}x^n = n x^{\\,n-1}$, and $\\displaystyle\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C\\ (n\\neq -1)$.",
      "",
      "**Fundamental theorem**: $\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a)$, where $F' = f$.",
      "",
      "**Stationary points**: solve $f'(x)=0$; a **maximum** has $f''<0$, a **minimum** has $f''>0$.",
      "",
      "**Area between curves** $y=g(x)$ (upper) and $y=h(x)$ (lower):",
      "$$A = \\int_a^b \\big[g(x) - h(x)\\big]\\,dx$$",
    ].join("\n"),
    traps: [
      "**Don't forget the lower limit.** A definite integral is $F(b)-F(a)$; evaluating only at $b$ drops the $-F(a)$ term.",
      "**Upper minus lower curve.** For area between curves, subtract the *lower* function from the *upper* one over the interval where they don't cross; reversing them gives a negative (wrong-sign) area.",
      "**$n=-1$ exception.** $\\int x^{-1}dx = \\ln|x|$, not $x^0/0$. The power rule breaks at $n=-1$.",
      "**Slope zero ≠ always a maximum.** $f'=0$ marks a stationary point; you must check $f''$ (or sign change) to classify it.",
    ],
    figure: {
      kind: "svg",
      caption: "Area between the line y = 2x (upper) and the parabola y = x² (lower) from x = 0 to x = 2 — the shaded region equals ∫₀²(2x − x²)dx.",
      markup:
        '<svg viewBox="0 0 240 180" width="100%" role="img" aria-label="Region between line 2x and parabola x squared">\
<line x1="30" y1="150" x2="220" y2="150" stroke="#475569"/>\
<line x1="30" y1="150" x2="30" y2="15" stroke="#475569"/>\
<path d="M30,150 L190,30 L190,30 Q110,90 30,150 Z" fill="#bfdbfe" opacity="0.7"/>\
<path d="M30,150 Q110,90 190,30" fill="none" stroke="#dc2626" stroke-width="2"/>\
<line x1="30" y1="150" x2="190" y2="30" stroke="#2563eb" stroke-width="2"/>\
<text x="150" y="40" font-size="10" fill="#2563eb">y = 2x</text>\
<text x="120" y="110" font-size="10" fill="#dc2626">y = x²</text>\
<text x="184" y="165" font-size="9" fill="#334155">x=2</text>\
<text x="20" y="160" font-size="9" fill="#334155">0</text>\
</svg>',
    },
  },
  questions: [
    {
      id: "calc-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "If $f(x) = 3x^3 - 2x^2 + 5$, then $f'(1)$ equals:",
      options: ["$5$", "$7$", "$9$", "$13$"],
      answer: 0,
      solution: {
        given: "$f(x) = 3x^3 - 2x^2 + 5$.",
        derivation:
          "$$f'(x) = 9x^2 - 4x \\;\\Rightarrow\\; f'(1) = 9(1)^2 - 4(1) = 9 - 4 = 5$$",
        target: "**Correct option: $5$.** $9$ keeps only the $9x^2$ term; $13$ adds instead of subtracting.",
      },
    },
    {
      id: "calc-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "The value of the definite integral $\\displaystyle\\int_0^2 (3x^2 + 2x)\\,dx$ is ______. (Round off to two decimal places.)",
      natAnswer: 12,
      acceptedRange: [11.9, 12.1],
      unit: "",
      solution: {
        given: "Integrand $3x^2 + 2x$; limits $0$ to $2$.",
        derivation:
          "Antiderivative $F(x) = x^3 + x^2$.\n$$\\int_0^2 (3x^2+2x)\\,dx = \\big[x^3 + x^2\\big]_0^2 = (8 + 4) - 0 = 12$$",
        target: "**Target: 12.00 | Accepted range: 11.90 to 12.10.**",
      },
    },
    {
      id: "calc-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "The area enclosed between the curves $y = 2x$ and $y = x^2$ (see figure) is ______ square units. (Round off to two decimal places.)",
      natAnswer: 1.33,
      acceptedRange: [1.3, 1.36],
      unit: "",
      figure: {
        kind: "svg",
        caption: "y = 2x and y = x² intersect at x = 0 and x = 2; the line is the upper boundary in between.",
        markup:
          '<svg viewBox="0 0 240 180" width="100%" role="img" aria-label="Region between line 2x and parabola x squared">\
<line x1="30" y1="150" x2="220" y2="150" stroke="#475569"/>\
<line x1="30" y1="150" x2="30" y2="15" stroke="#475569"/>\
<path d="M30,150 L190,30 Q110,90 30,150 Z" fill="#bfdbfe" opacity="0.7"/>\
<path d="M30,150 Q110,90 190,30" fill="none" stroke="#dc2626" stroke-width="2"/>\
<line x1="30" y1="150" x2="190" y2="30" stroke="#2563eb" stroke-width="2"/>\
<text x="150" y="40" font-size="10" fill="#2563eb">y = 2x</text>\
<text x="118" y="112" font-size="10" fill="#dc2626">y = x²</text>\
<text x="184" y="165" font-size="9" fill="#334155">x=2</text>\
</svg>',
      },
      solution: {
        given: "Curves intersect where $2x = x^2 \\Rightarrow x=0,\\ 2$. On $[0,2]$, $2x \\ge x^2$.",
        derivation:
          "$$A = \\int_0^2 (2x - x^2)\\,dx = \\Big[x^2 - \\tfrac{x^3}{3}\\Big]_0^2 = \\Big(4 - \\tfrac{8}{3}\\Big) - 0 = \\tfrac{4}{3} = 1.33$$",
        target: "**Target: 1.33 (4/3) | Accepted range: 1.30 to 1.36.**",
      },
    },
  ],
};

const emVectorCalculus: LearnTopic = {
  slug: "em-vector-calculus",
  subject: "Engineering Mathematics",
  title: "Vector Calculus",
  tier: "subject",
  blurb:
    "Gradient, divergence, curl and directional derivatives — how scalar and vector fields change in space.",
  module: {
    principle:
      "Vector calculus describes how **fields** vary through space. The **gradient** $\\nabla f$ of a scalar field points in the direction of steepest increase and its magnitude is that rate of increase. The **divergence** $\\nabla\\cdot\\mathbf{F}$ of a vector field measures the net 'outflow' from a point (a source if positive, a sink if negative). The **curl** $\\nabla\\times\\mathbf{F}$ measures local rotation. The **directional derivative** projects the gradient onto a chosen *unit* direction to give the rate of change along it.",
    formulaMatrix: [
      "**Gradient** of a scalar $f$: $\\nabla f = \\left(\\dfrac{\\partial f}{\\partial x}, \\dfrac{\\partial f}{\\partial y}, \\dfrac{\\partial f}{\\partial z}\\right)$.",
      "",
      "**Divergence** of $\\mathbf{F} = (F_1, F_2, F_3)$: $\\nabla\\cdot\\mathbf{F} = \\dfrac{\\partial F_1}{\\partial x} + \\dfrac{\\partial F_2}{\\partial y} + \\dfrac{\\partial F_3}{\\partial z}$ (a **scalar**).",
      "",
      "**Curl**: $\\nabla\\times\\mathbf{F} = \\left(\\dfrac{\\partial F_3}{\\partial y}-\\dfrac{\\partial F_2}{\\partial z},\\ \\dfrac{\\partial F_1}{\\partial z}-\\dfrac{\\partial F_3}{\\partial x},\\ \\dfrac{\\partial F_2}{\\partial x}-\\dfrac{\\partial F_1}{\\partial y}\\right)$ (a **vector**).",
      "",
      "**Directional derivative** of $f$ along unit vector $\\hat{u}$: $D_{\\hat u}f = \\nabla f \\cdot \\hat u$.",
    ].join("\n"),
    traps: [
      "**Divergence is scalar, curl is vector.** Returning a vector for divergence (or a scalar for curl) is a category error that loses marks instantly.",
      "**Normalise the direction.** The directional derivative uses a *unit* vector. Forgetting to divide by $|\\mathbf{u}|$ inflates the answer — e.g. direction $(1,1,1)$ must be divided by $\\sqrt3$.",
      "**Gradient acts on scalars, divergence/curl on vectors.** Don't take the gradient of a vector field or the divergence of a scalar.",
    ],
  },
  questions: [
    {
      id: "vc-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "The divergence of $\\mathbf{F} = (x^2,\\ y^2,\\ z^2)$ evaluated at the point $(1,1,1)$ is:",
      options: ["$6$", "$2$", "$3$", "$0$"],
      answer: 0,
      solution: {
        given: "$\\mathbf{F} = (x^2, y^2, z^2)$.",
        derivation:
          "$$\\nabla\\cdot\\mathbf{F} = 2x + 2y + 2z \\;\\Rightarrow\\; \\text{at }(1,1,1):\\ 2+2+2 = 6$$",
        target: "**Correct option: $6$.** $2$ takes just one term; $3$ counts the components without the factor 2.",
      },
    },
    {
      id: "vc-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "For $f = x^2 + y^2 + z^2$, the magnitude of the gradient $|\\nabla f|$ at the point $(1, 2, 2)$ is ______. (Round off to two decimal places.)",
      natAnswer: 6,
      acceptedRange: [5.9, 6.1],
      unit: "",
      solution: {
        given: "$f = x^2 + y^2 + z^2$, point $(1,2,2)$.",
        derivation:
          "$$\\nabla f = (2x, 2y, 2z) = (2, 4, 4)$$\n$$|\\nabla f| = \\sqrt{2^2 + 4^2 + 4^2} = \\sqrt{4 + 16 + 16} = \\sqrt{36} = 6$$",
        target: "**Target: 6.00 | Accepted range: 5.90 to 6.10.**",
      },
    },
    {
      id: "vc-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "The directional derivative of $f = xyz$ at the point $(1,1,1)$ in the direction of the vector $(1,1,1)$ is ______. (Round off to two decimal places.)",
      natAnswer: 1.73,
      acceptedRange: [1.7, 1.76],
      unit: "",
      solution: {
        given: "$f = xyz$, point $(1,1,1)$, direction $\\mathbf{u} = (1,1,1)$.",
        derivation:
          "Gradient: $\\nabla f = (yz, xz, xy) = (1,1,1)$ at $(1,1,1)$.\nUnit direction: $\\hat u = \\dfrac{(1,1,1)}{\\sqrt{3}}$.\n$$D_{\\hat u}f = \\nabla f\\cdot\\hat u = \\frac{1+1+1}{\\sqrt3} = \\frac{3}{\\sqrt3} = \\sqrt3 = 1.73$$",
        target: "**Target: 1.73 (√3) | Accepted range: 1.70 to 1.76.** Forgetting to normalise gives 3 — a classic trap.",
      },
    },
  ],
};

const emDifferentialEquations: LearnTopic = {
  slug: "em-differential-equations",
  subject: "Engineering Mathematics",
  title: "Differential Equations",
  tier: "subject",
  blurb:
    "First-order linear ODEs (integrating factor) and second-order constant-coefficient equations via the auxiliary equation.",
  module: {
    principle:
      "A differential equation relates a function to its own rate of change. A **first-order linear ODE** $\\frac{dy}{dx} + P(x)y = Q(x)$ is solved by multiplying through by an **integrating factor** that turns the left side into an exact derivative. A **second-order constant-coefficient ODE** $ay'' + by' + cy = 0$ is solved by guessing $y=e^{mx}$, which reduces it to an algebraic **auxiliary (characteristic) equation** $am^2+bm+c=0$; the nature of its roots (real distinct, repeated, or complex) dictates the form of the solution.",
    formulaMatrix: [
      "**First-order linear**: $\\dfrac{dy}{dx} + P(x)y = Q(x)$, integrating factor $\\mu = e^{\\int P\\,dx}$, solution $y\\,\\mu = \\int Q\\,\\mu\\,dx + C$.",
      "",
      "**Second-order homogeneous**: $ay'' + by' + cy = 0$ → auxiliary equation $am^2 + bm + c = 0$.",
      "• Real distinct roots $m_1, m_2$: $y = C_1 e^{m_1 x} + C_2 e^{m_2 x}$.",
      "• Repeated root $m$: $y = (C_1 + C_2 x)e^{mx}$.",
      "• Complex $\\alpha\\pm i\\beta$: $y = e^{\\alpha x}(C_1\\cos\\beta x + C_2\\sin\\beta x)$.",
      "",
      "**Separable**: $\\dfrac{dy}{dx}=g(x) \\Rightarrow y = \\int g(x)\\,dx + C$, fix $C$ from the initial condition.",
    ].join("\n"),
    traps: [
      "**Integrating factor uses $\\int P\\,dx$, not $\\int Q\\,dx$.** $\\mu = e^{\\int P\\,dx}$ depends only on the coefficient of $y$.",
      "**Repeated roots need the extra $x$.** A double root gives $(C_1 + C_2 x)e^{mx}$; writing $C_1 e^{mx}+C_2 e^{mx}$ collapses to one constant and is wrong.",
      "**Apply initial conditions after the general solution.** Fix the constants only once the full general solution is assembled — not term by term.",
    ],
  },
  questions: [
    {
      id: "de-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "The integrating factor of the linear ODE $\\dfrac{dy}{dx} + 2y = x$ is:",
      options: ["$e^{2x}$", "$e^{-2x}$", "$e^{x^2}$", "$2x$"],
      answer: 0,
      solution: {
        given: "$P(x) = 2$, so $\\int P\\,dx = 2x$.",
        derivation: "$$\\mu = e^{\\int P\\,dx} = e^{\\int 2\\,dx} = e^{2x}$$",
        target: "**Correct option: $e^{2x}$.** $e^{-2x}$ has the wrong sign; $e^{x^2}$ wrongly integrates the right-hand side.",
      },
    },
    {
      id: "de-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "For the ODE $y'' - 5y' + 6y = 0$, the larger root of its auxiliary equation is ______. (Round off to two decimal places.)",
      natAnswer: 3,
      acceptedRange: [2.9, 3.1],
      unit: "",
      solution: {
        given: "Auxiliary equation $m^2 - 5m + 6 = 0$.",
        derivation: "$$m^2 - 5m + 6 = 0 \\Rightarrow (m-2)(m-3)=0 \\Rightarrow m = 2,\\ 3$$",
        target: "**Target: 3.00 | Accepted range: 2.90 to 3.10.** The general solution is $y = C_1 e^{2x} + C_2 e^{3x}$.",
      },
    },
    {
      id: "de-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Solve $y'' - 4y = 0$ with $y(0)=1$ and $y'(0)=0$. The value of $y(1)$ is ______. (Round off to two decimal places.)",
      natAnswer: 3.76,
      acceptedRange: [3.7, 3.82],
      unit: "",
      solution: {
        given: "Auxiliary equation $m^2 - 4 = 0 \\Rightarrow m = \\pm 2$. General solution $y = Ae^{2x} + Be^{-2x}$.",
        derivation:
          "Apply conditions: $y(0)=A+B=1$; $y'(0)=2A-2B=0 \\Rightarrow A=B=\\tfrac12$.\nSo $y = \\tfrac12(e^{2x}+e^{-2x}) = \\cosh 2x$.\n$$y(1) = \\cosh 2 = \\frac{e^{2}+e^{-2}}{2} = 3.76$$",
        target: "**Target: 3.76 (cosh 2) | Accepted range: 3.70 to 3.82.**",
      },
    },
  ],
};

const emProbabilityStatistics: LearnTopic = {
  slug: "em-probability-statistics",
  subject: "Engineering Mathematics",
  title: "Probability & Statistics",
  tier: "subject",
  blurb:
    "Probability axioms, complementary events, expectation and variance — the uncertainty mathematics behind reliability and quality questions.",
  module: {
    principle:
      "Probability quantifies uncertainty on a 0–1 scale. For **equally likely** outcomes a probability is simply favourable ÷ total. The **complement rule** is the workhorse for 'at least one' problems: it is far easier to compute the probability that an event *never* happens and subtract from 1. For a random variable, the **expectation** (mean) is the long-run average, and the **variance** measures spread about that mean.",
    formulaMatrix: [
      "**Classical probability**: $P(A) = \\dfrac{\\text{favourable outcomes}}{\\text{total outcomes}}$.",
      "",
      "**Addition rule**: $P(A\\cup B) = P(A) + P(B) - P(A\\cap B)$.",
      "",
      "**Complement**: $P(\\text{at least one}) = 1 - P(\\text{none})$.",
      "",
      "**Expectation & variance** (discrete, $N$ equally likely values):",
      "$$\\mu = \\frac{1}{N}\\sum x_i,\\qquad \\sigma^2 = \\frac{1}{N}\\sum (x_i - \\mu)^2$$",
    ].join("\n"),
    traps: [
      "**'At least one' ⇒ use the complement.** Adding individual probabilities double-counts overlaps; $1 - P(\\text{none})$ is clean and correct.",
      "**Independent ≠ mutually exclusive.** For independent events $P(A\\cap B)=P(A)P(B)$; for mutually exclusive ones $P(A\\cap B)=0$. They are different conditions.",
      "**Variance is the mean of squared deviations** — square first, then average. Don't forget to square, and don't divide by $N-1$ unless a *sample* estimate is asked.",
    ],
  },
  questions: [
    {
      id: "ps-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "Two fair dice are rolled. The probability that the sum of the faces equals 7 is:",
      options: ["$\\dfrac{1}{6}$", "$\\dfrac{1}{8}$", "$\\dfrac{7}{36}$", "$\\dfrac{1}{12}$"],
      answer: 0,
      solution: {
        given: "Total outcomes $= 6\\times6 = 36$. Pairs summing to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) → 6 outcomes.",
        derivation: "$$P = \\frac{6}{36} = \\frac{1}{6} \\approx 0.167$$",
        target: "**Correct option: $1/6$.** $7/36$ confuses the target sum with the count; $1/12$ halves it incorrectly.",
      },
    },
    {
      id: "ps-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A fair coin is tossed three times. The probability of getting at least one head is ______. (Round off to two decimal places.)",
      natAnswer: 0.88,
      acceptedRange: [0.86, 0.89],
      unit: "",
      solution: {
        given: "Each toss: $P(\\text{head})=P(\\text{tail})=\\tfrac12$; tosses independent.",
        derivation:
          "Use the complement (no heads = all tails):\n$$P(\\text{no head}) = \\left(\\tfrac12\\right)^3 = \\tfrac18 = 0.125$$\n$$P(\\text{at least one head}) = 1 - 0.125 = 0.875 \\approx 0.88$$",
        target: "**Target: 0.88 (7/8 = 0.875) | Accepted range: 0.86 to 0.89.**",
      },
    },
    {
      id: "ps-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "The variance of the data set $\\{2, 4, 6, 8\\}$ (treating it as the full population) is ______. (Round off to two decimal places.)",
      natAnswer: 5,
      acceptedRange: [4.9, 5.1],
      unit: "",
      solution: {
        given: "Data $\\{2,4,6,8\\}$, $N=4$.",
        derivation:
          "Mean $\\mu = \\dfrac{2+4+6+8}{4} = 5$.\nSquared deviations: $(2-5)^2=9,\\ (4-5)^2=1,\\ (6-5)^2=1,\\ (8-5)^2=9$.\n$$\\sigma^2 = \\frac{9+1+1+9}{4} = \\frac{20}{4} = 5$$",
        target: "**Target: 5.00 | Accepted range: 4.90 to 5.10.** (A sample variance with $N-1=3$ would give 6.67.)",
      },
    },
  ],
};

const emNumericalMethods: LearnTopic = {
  slug: "em-numerical-methods",
  subject: "Engineering Mathematics",
  title: "Numerical Methods",
  tier: "subject",
  blurb:
    "Newton–Raphson root finding and numerical integration (trapezoidal & Simpson's rules) — approximating answers when closed forms fail.",
  module: {
    principle:
      "When an equation can't be solved or an integral can't be evaluated by hand, we approximate. **Newton–Raphson** finds a root by repeatedly following the tangent line down to the axis — fast (quadratic) convergence near a good guess. **Numerical integration** estimates area by replacing the curve with simple shapes: the **trapezoidal rule** uses straight-line segments, while **Simpson's 1/3 rule** fits parabolas through pairs of intervals, giving far higher accuracy for the same number of points.",
    formulaMatrix: [
      "**Newton–Raphson iteration**: $x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}$.",
      "",
      "**Trapezoidal rule** ($n$ strips, width $h$): $\\displaystyle\\int_a^b f\\,dx \\approx \\frac{h}{2}\\big[f_0 + 2(f_1+\\dots+f_{n-1}) + f_n\\big]$.",
      "",
      "**Simpson's 1/3 rule** (even number of strips): $\\displaystyle\\int_a^b f\\,dx \\approx \\frac{h}{3}\\big[f_0 + 4(f_1+f_3+\\dots) + 2(f_2+f_4+\\dots) + f_n\\big]$.",
      "",
      "Here $h = \\dfrac{b-a}{n}$ and $f_i = f(a + i h)$.",
    ].join("\n"),
    traps: [
      "**Newton–Raphson sign.** It's $x_n - f/f'$ (minus). Using a plus sign sends the iteration the wrong way.",
      "**Trapezoidal weights are 1, 2, 2, …, 2, 1.** Only the end ordinates get weight 1; the interior ones are doubled. Simpson alternates 4 and 2.",
      "**Simpson needs an even number of strips.** With an odd $n$ the 1/3 rule can't be applied directly.",
      "**Coarse grids over-/under-estimate.** The trapezoidal rule over-estimates a convex (cup-up) curve; refine $h$ or use Simpson for accuracy.",
    ],
  },
  questions: [
    {
      id: "nm-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Applying one Newton–Raphson iteration to $f(x) = x^2 - 2$ starting from $x_0 = 1$ gives $x_1 =$",
      options: ["$1.50$", "$0.50$", "$2.00$", "$1.33$"],
      answer: 0,
      solution: {
        given: "$f(x)=x^2-2$, $f'(x)=2x$, $x_0=1$.",
        derivation:
          "$$x_1 = x_0 - \\frac{f(x_0)}{f'(x_0)} = 1 - \\frac{1^2 - 2}{2(1)} = 1 - \\frac{-1}{2} = 1 + 0.5 = 1.50$$",
        target: "**Correct option: $1.50$.** $0.50$ uses a $+$ sign; the true root is $\\sqrt2 \\approx 1.414$.",
      },
    },
    {
      id: "nm-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Estimate $\\displaystyle\\int_0^2 x^2\\,dx$ using the trapezoidal rule with $n = 2$ strips. The estimate is ______. (Round off to two decimal places.)",
      natAnswer: 3,
      acceptedRange: [2.9, 3.1],
      unit: "",
      solution: {
        given: "$a=0,\\ b=2,\\ n=2 \\Rightarrow h=1$. Ordinates: $f(0)=0,\\ f(1)=1,\\ f(2)=4$.",
        derivation:
          "$$\\int_0^2 x^2\\,dx \\approx \\frac{h}{2}\\big[f_0 + 2f_1 + f_2\\big] = \\frac{1}{2}\\big[0 + 2(1) + 4\\big] = \\frac{1}{2}(6) = 3$$",
        target: "**Target: 3.00 | Accepted range: 2.90 to 3.10.** (Exact value is 8/3 ≈ 2.667; the trapezoidal rule over-estimates this convex curve.)",
      },
    },
    {
      id: "nm-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Estimate $\\displaystyle\\int_0^2 x^2\\,dx$ using Simpson's 1/3 rule with $n = 2$ strips. The estimate is ______. (Round off to two decimal places.)",
      natAnswer: 2.67,
      acceptedRange: [2.63, 2.7],
      unit: "",
      solution: {
        given: "$a=0,\\ b=2,\\ n=2 \\Rightarrow h=1$. Ordinates: $f(0)=0,\\ f(1)=1,\\ f(2)=4$.",
        derivation:
          "$$\\int_0^2 x^2\\,dx \\approx \\frac{h}{3}\\big[f_0 + 4f_1 + f_2\\big] = \\frac{1}{3}\\big[0 + 4(1) + 4\\big] = \\frac{8}{3} = 2.67$$",
        target:
          "**Target: 2.67 (8/3) | Accepted range: 2.63 to 2.70.** Simpson's rule is exact for polynomials up to degree 3, so it nails this quadratic.",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 2 — Mine Development and Surveying                            */
/* ════════════════════════════════════════════════════════════════════ */

const mdsExplosivesBlasting: LearnTopic = {
  slug: "mds-explosives-blasting",
  subject: "Mine Development & Surveying",
  title: "Explosives & Blasting",
  tier: "free",
  blurb:
    "Powder factor, bench-blast geometry and charge per hole — the numbers that decide fragmentation, cost and safety.",
  module: {
    principle:
      "Blasting converts the chemical energy of an explosive into the work of **breaking and displacing rock**. The single most important efficiency metric is the **powder factor** — the mass of explosive needed to break a unit volume (or tonne) of rock. Too low and the rock is poorly fragmented (oversize, hard digging); too high and explosive is wasted and flyrock/ground-vibration risk rises. The volume each blast breaks is set by the drill-hole geometry — the **burden** (distance to the free face), the **spacing** between holes, and the **bench height** — while the explosive each hole holds depends on its diameter, charge length and the explosive's density.",
    formulaMatrix: [
      "**Powder factor** (mass per unit volume): $$PF = \\dfrac{E}{V}\\quad[\\text{kg/m}^3]$$ where $E$ = total explosive mass, $V$ = rock volume broken.",
      "",
      "**Volume broken** by a bench round of $N$ holes: $$V = B \\times S \\times H \\times N$$ $B$ = burden, $S$ = spacing, $H$ = bench height $[\\text{m}]$.",
      "",
      "**Charge mass per hole** (continuous column): $$E_h = \\rho_e\\,\\dfrac{\\pi d^2}{4}\\,\\ell$$ $\\rho_e$ = explosive density $[\\text{kg/m}^3]$, $d$ = hole diameter $[\\text{m}]$, $\\ell$ = charge length $[\\text{m}]$.",
    ].join("\n"),
    traps: [
      "**Powder factor, not its inverse.** $PF = E/V$ (kg/m³). Computing $V/E$ gives the reciprocal (m³/kg) — a different quantity that flips the answer.",
      "**Diameter in metres before squaring.** $\\frac{\\pi d^2}{4}$ needs $d$ in metres; leaving 100 mm as '100' inflates the area by $10^6$.",
      "**Burden vs spacing.** Burden is measured *to the free face*; spacing is *between adjacent holes*. Swapping them changes the breakage volume and the blast result.",
      "**Volume vs tonnage powder factor.** kg/m³ and kg/tonne differ by the rock density; don't mix the two definitions.",
    ],
    figure: {
      kind: "bench",
      caption: "Bench-blast geometry: burden B to the free face, spacing S between holes, bench height H.",
      benchHeight: 10,
      burden: 3,
      spacing: 3.5,
      holes: 4,
    },
  },
  questions: [
    {
      id: "blast-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A blast uses $200\\ \\text{kg}$ of explosive to break $1000\\ \\text{m}^3$ of rock. The powder factor is:",
      options: ["$0.20\\ \\text{kg/m}^3$", "$0.02\\ \\text{kg/m}^3$", "$2.0\\ \\text{kg/m}^3$", "$5.0\\ \\text{kg/m}^3$"],
      answer: 0,
      solution: {
        given: "$E = 200\\ \\text{kg}$, $V = 1000\\ \\text{m}^3$.",
        derivation: "$$PF = \\frac{E}{V} = \\frac{200}{1000} = 0.20\\ \\text{kg/m}^3$$",
        target: "**Correct option: $0.20\\ \\text{kg/m}^3$.** $5.0$ is the inverse $V/E$; $0.02$ and $2.0$ are decimal slips.",
      },
    },
    {
      id: "blast-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A bench round has $N = 20$ holes with burden $B = 3\\ \\text{m}$, spacing $S = 3.5\\ \\text{m}$ and bench height $H = 10\\ \\text{m}$. If $420\\ \\text{kg}$ of explosive is used, the powder factor is ______ kg/m³. (Round off to two decimal places.)",
      natAnswer: 0.2,
      acceptedRange: [0.19, 0.21],
      unit: "kg/m³",
      solution: {
        given: "$N=20,\\ B=3,\\ S=3.5,\\ H=10\\ \\text{m},\\ E=420\\ \\text{kg}$.",
        derivation:
          "Volume broken:\n$$V = B\\,S\\,H\\,N = 3\\times 3.5\\times 10\\times 20 = 2100\\ \\text{m}^3$$\nPowder factor:\n$$PF = \\frac{E}{V} = \\frac{420}{2100} = 0.20\\ \\text{kg/m}^3$$",
        target: "**Target: 0.20 kg/m³ | Accepted range: 0.19 to 0.21.**",
      },
    },
    {
      id: "blast-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A blasthole of diameter $d = 100\\ \\text{mm}$ is charged with ANFO (density $850\\ \\text{kg/m}^3$) over a continuous column length of $6\\ \\text{m}$. The explosive mass in the hole is ______ kg. (Round off to two decimal places.)",
      natAnswer: 40.06,
      acceptedRange: [39.5, 40.7],
      unit: "kg",
      solution: {
        given: "$d = 100\\ \\text{mm} = 0.10\\ \\text{m}$, $\\rho_e = 850\\ \\text{kg/m}^3$, $\\ell = 6\\ \\text{m}$.",
        derivation:
          "Cross-sectional area: $\\dfrac{\\pi d^2}{4} = \\dfrac{\\pi (0.10)^2}{4} = 7.854\\times10^{-3}\\ \\text{m}^2$.\n$$E_h = \\rho_e\\,\\frac{\\pi d^2}{4}\\,\\ell = 850\\times 7.854\\times10^{-3}\\times 6 = 40.06\\ \\text{kg}$$",
        target: "**Target: 40.06 kg | Accepted range: 39.50 to 40.70.**",
      },
    },
  ],
};

const mdsLevellingTacheometry: LearnTopic = {
  slug: "mds-levelling-tacheometry",
  subject: "Mine Development & Surveying",
  title: "Levelling & Tacheometry",
  tier: "subject",
  blurb:
    "Reduced levels by the height-of-instrument method and distances from stadia readings — fixing elevation and range in the field.",
  module: {
    principle:
      "Levelling determines the **reduced level (RL)** — the height above a datum — of points by sighting a graduated staff. In the **height-of-instrument (HI)** method, a backsight onto a benchmark of known RL fixes the instrument's collimation height; any foresight is then simply subtracted from that height to give the new point's RL. **Tacheometry** speeds up surveying by reading the **stadia interval** (the gap between the upper and lower cross-hairs on the staff) to compute distance directly — no chaining required — with a small correction for any inclination of the line of sight.",
    formulaMatrix: [
      "**Height of instrument**: $HI = RL_{BM} + BS$ (backsight).",
      "**Reduced level of a point**: $RL = HI - FS$ (foresight).",
      "",
      "**Tacheometric distance** (stadia, line of sight inclined at angle $\\theta$):",
      "$$D = K\\,S\\,\\cos^{2}\\theta + C$$",
      "$K$ = multiplying constant (usually 100), $S$ = staff intercept (upper − lower hair), $C$ = additive constant (≈ 0 for modern internal-focusing instruments).",
      "",
      "**Vertical component**: $V = \\tfrac{1}{2}K\\,S\\,\\sin 2\\theta$. For a horizontal sight ($\\theta = 0$): $D = K\\,S$.",
    ].join("\n"),
    traps: [
      "**Backsight adds, foresight subtracts.** $HI = RL + BS$, then $RL_{new} = HI - FS$. Reversing the roles inverts every level.",
      "**$\\cos^2\\theta$, not $\\cos\\theta$.** The horizontal tacheometric distance carries the square of the cosine; using a single cosine over-estimates the distance.",
      "**Staff intercept = upper − lower.** $S$ is the difference of the outer stadia readings, not the middle (axial) reading.",
    ],
  },
  questions: [
    {
      id: "lev-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A benchmark has $RL = 100.000\\ \\text{m}$. A backsight of $1.250\\ \\text{m}$ is taken on it, then a foresight of $0.750\\ \\text{m}$ on a change point. The RL of the change point is:",
      options: ["$100.500\\ \\text{m}$", "$101.500\\ \\text{m}$", "$99.500\\ \\text{m}$", "$100.000\\ \\text{m}$"],
      answer: 0,
      solution: {
        given: "$RL_{BM} = 100.000$, $BS = 1.250$, $FS = 0.750$.",
        derivation:
          "$$HI = RL_{BM} + BS = 100.000 + 1.250 = 101.250\\ \\text{m}$$\n$$RL = HI - FS = 101.250 - 0.750 = 100.500\\ \\text{m}$$",
        target: "**Correct option: $100.500\\ \\text{m}$.** The change point is higher than the BM because $BS > FS$.",
      },
    },
    {
      id: "lev-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A tacheometer ($K = 100$, $C = 0$) reads stadia hairs of $1.500\\ \\text{m}$ (upper) and $0.700\\ \\text{m}$ (lower) on a vertical staff with a horizontal line of sight. The horizontal distance to the staff is ______ m. (Round off to two decimal places.)",
      natAnswer: 80,
      acceptedRange: [79.5, 80.5],
      unit: "m",
      solution: {
        given: "$K=100,\\ C=0$, intercept $S = 1.500 - 0.700 = 0.800\\ \\text{m}$, $\\theta = 0$.",
        derivation: "$$D = K\\,S\\,\\cos^2 0 + C = 100\\times 0.800\\times 1 + 0 = 80\\ \\text{m}$$",
        target: "**Target: 80.00 m | Accepted range: 79.50 to 80.50.**",
      },
    },
    {
      id: "lev-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "The same tacheometer ($K = 100$, $C = 0$) reads a staff intercept of $S = 1.250\\ \\text{m}$ with the line of sight inclined at $\\theta = 5^{\\circ}$ above horizontal. The horizontal distance is ______ m. (Round off to two decimal places.)",
      natAnswer: 124.05,
      acceptedRange: [123.5, 124.6],
      unit: "m",
      solution: {
        given: "$K=100,\\ C=0,\\ S=1.250\\ \\text{m},\\ \\theta = 5^{\\circ}$ ($\\cos 5^{\\circ} = 0.99619$).",
        derivation:
          "$$D = K\\,S\\,\\cos^2\\theta = 100\\times 1.250\\times (0.99619)^2 = 125\\times 0.99240 = 124.05\\ \\text{m}$$",
        target: "**Target: 124.05 m | Accepted range: 123.50 to 124.60.** Note the $\\cos^2\\theta$ factor, not $\\cos\\theta$.",
      },
    },
  ],
};

const mdsChainTapeCorrections: LearnTopic = {
  slug: "mds-chain-tape-corrections",
  subject: "Mine Development & Surveying",
  title: "Linear Measurement: Errors & Corrections",
  tier: "subject",
  blurb:
    "Standardisation, temperature, slope and sag corrections — turning a raw tape reading into a true horizontal distance.",
  module: {
    principle:
      "A steel tape rarely measures the true horizontal distance directly: it may be the **wrong length** (standardisation), it expands or contracts with **temperature**, it is pulled with a **tension** different from its standard, it **sags** between supports, and it may be laid along a **slope** rather than the horizontal. Each effect is a small, *signed* correction added to the measured length. Knowing the sign of each correction — and that some (slope, sag) are always subtractive — is half the battle.",
    formulaMatrix: [
      "**Standardisation (wrong tape length)**: true length $= L_{meas}\\times\\dfrac{L'}{L}$, where $L'$ = actual tape length, $L$ = nominal length.",
      "",
      "**Temperature**: $C_t = \\alpha\\,(T_m - T_0)\\,L$  (sign follows the temperature difference).",
      "",
      "**Slope** (always subtractive): $C_{slope} = -\\dfrac{h^2}{2L}$, with $h$ = height difference over slope length $L$.",
      "",
      "**Sag** (always subtractive, per span): $C_{sag} = -\\dfrac{w^2 L^3}{24 P^2}$, $w$ = weight per unit length, $P$ = applied tension.",
    ].join("\n"),
    traps: [
      "**Slope and sag are always negative.** They shorten the horizontal/true length; adding them with a plus sign is a guaranteed error.",
      "**A tape too long ⇒ measured distance is too short.** So the standardisation correction is *positive* when $L' > L$ — the opposite of many students' first instinct.",
      "**Use consistent units for $\\alpha$.** The coefficient of thermal expansion is per °C (≈ $11.2\\times10^{-6}$ for steel); keep length in metres so the correction comes out in metres.",
    ],
  },
  questions: [
    {
      id: "corr-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A $100\\ \\text{m}$ steel tape ($\\alpha = 11.2\\times10^{-6}/^{\\circ}\\text{C}$) standardised at $20^{\\circ}\\text{C}$ is used at $35^{\\circ}\\text{C}$. The temperature correction is:",
      options: ["$16.8\\ \\text{mm}$", "$1.68\\ \\text{mm}$", "$168\\ \\text{mm}$", "$0.168\\ \\text{mm}$"],
      answer: 0,
      solution: {
        given: "$\\alpha = 11.2\\times10^{-6}/^{\\circ}\\text{C}$, $T_m - T_0 = 35 - 20 = 15^{\\circ}\\text{C}$, $L = 100\\ \\text{m}$.",
        derivation:
          "$$C_t = \\alpha\\,(T_m-T_0)\\,L = 11.2\\times10^{-6}\\times 15\\times 100 = 0.0168\\ \\text{m} = 16.8\\ \\text{mm}$$",
        target: "**Correct option: $16.8\\ \\text{mm}$ (positive — the tape expanded).** The others are decimal-place slips.",
      },
    },
    {
      id: "corr-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A length of $50\\ \\text{m}$ is measured along a slope with a height difference of $2\\ \\text{m}$ between its ends. The slope correction (magnitude) to be subtracted is ______ m. (Round off to three decimal places.)",
      natAnswer: 0.04,
      acceptedRange: [0.038, 0.042],
      unit: "m",
      solution: {
        given: "Slope length $L = 50\\ \\text{m}$, height difference $h = 2\\ \\text{m}$.",
        derivation:
          "$$|C_{slope}| = \\frac{h^2}{2L} = \\frac{2^2}{2\\times 50} = \\frac{4}{100} = 0.040\\ \\text{m}$$\nHorizontal distance $= 50 - 0.04 = 49.96\\ \\text{m}$.",
        target: "**Target: 0.040 m | Accepted range: 0.038 to 0.042.** Always subtracted.",
      },
    },
    {
      id: "corr-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A line is measured as $1500\\ \\text{m}$ with a $30\\ \\text{m}$ tape that is later found to be $0.02\\ \\text{m}$ too long. The corrected (true) length of the line is ______ m. (Round off to two decimal places.)",
      natAnswer: 1501,
      acceptedRange: [1500.8, 1501.2],
      unit: "m",
      solution: {
        given: "Measured $L_{meas} = 1500\\ \\text{m}$; nominal tape $L = 30\\ \\text{m}$; actual tape $L' = 30.02\\ \\text{m}$.",
        derivation:
          "A tape that is too long makes the measured distance read short, so multiply by $L'/L$:\n$$L_{true} = L_{meas}\\times\\frac{L'}{L} = 1500\\times\\frac{30.02}{30} = 1500 + \\frac{1500\\times0.02}{30} = 1500 + 1.0 = 1501.0\\ \\text{m}$$",
        target: "**Target: 1501.00 m | Accepted range: 1500.80 to 1501.20.** Correction is positive for a too-long tape.",
      },
    },
  ],
};

const mdsTraverseCurves: LearnTopic = {
  slug: "mds-traverse-curves",
  subject: "Mine Development & Surveying",
  title: "Traverse & Circular Curves",
  tier: "subject",
  blurb:
    "Latitude/departure of a survey line and the tangent length & arc length of a simple circular curve.",
  module: {
    principle:
      "A **traverse** fixes positions by measuring the length and bearing of connected lines; each line's change in northing is its **latitude** ($l\\cos\\theta$) and its change in easting is its **departure** ($l\\sin\\theta$). To join two straight alignments smoothly — a haul road or rail bend — a **circular curve** of radius $R$ is inserted through a deflection angle $\\Delta$. Its **tangent length** $T$ (from the intersection point to where the curve begins) and its **arc length** $L_c$ follow directly from $R$ and $\\Delta$.",
    formulaMatrix: [
      "**Latitude / Departure** of a line of length $l$ at bearing $\\theta$:",
      "$$\\text{Latitude} = l\\cos\\theta,\\qquad \\text{Departure} = l\\sin\\theta$$",
      "",
      "**Tangent length** of a circular curve: $$T = R\\,\\tan\\!\\left(\\frac{\\Delta}{2}\\right)$$",
      "",
      "**Length of curve** (arc), $\\Delta$ in degrees: $$L_c = \\frac{\\pi R \\Delta}{180}$$",
      "",
      "$R$ = curve radius, $\\Delta$ = deflection (intersection) angle.",
    ].join("\n"),
    traps: [
      "**Latitude uses cosine, departure uses sine.** Bearings are measured from the north–south meridian, so the cosine gives the N–S (latitude) component. Swapping them is the classic traverse error.",
      "**Tangent uses $\\Delta/2$, arc uses full $\\Delta$.** $T = R\\tan(\\Delta/2)$ but $L_c = \\pi R\\Delta/180$ — don't mix the half-angle into the arc formula.",
      "**Degrees vs radians.** $L_c = \\pi R\\Delta/180$ already converts $\\Delta$ from degrees; using radians here double-converts.",
    ],
  },
  questions: [
    {
      id: "trav-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A survey line is $100\\ \\text{m}$ long with a whole-circle bearing of $\\text{N}\\,30^{\\circ}\\,\\text{E}$. Its departure (easting component) is:",
      options: ["$50.0\\ \\text{m}$", "$86.6\\ \\text{m}$", "$100.0\\ \\text{m}$", "$70.7\\ \\text{m}$"],
      answer: 0,
      solution: {
        given: "$l = 100\\ \\text{m}$, bearing $\\theta = 30^{\\circ}$ from north.",
        derivation: "$$\\text{Departure} = l\\sin\\theta = 100\\sin 30^{\\circ} = 100\\times 0.5 = 50.0\\ \\text{m}$$",
        target: "**Correct option: $50.0\\ \\text{m}$.** $86.6$ is the latitude ($100\\cos30^{\\circ}$); $70.7$ would be $\\sin45^{\\circ}$.",
      },
    },
    {
      id: "trav-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A circular curve of radius $R = 300\\ \\text{m}$ connects two straights meeting at a deflection angle $\\Delta = 40^{\\circ}$. The tangent length is ______ m. (Round off to two decimal places.)",
      natAnswer: 109.19,
      acceptedRange: [108.6, 109.8],
      unit: "m",
      solution: {
        given: "$R = 300\\ \\text{m}$, $\\Delta = 40^{\\circ}$, so $\\Delta/2 = 20^{\\circ}$ ($\\tan 20^{\\circ} = 0.36397$).",
        derivation: "$$T = R\\tan\\!\\left(\\frac{\\Delta}{2}\\right) = 300\\times\\tan 20^{\\circ} = 300\\times 0.36397 = 109.19\\ \\text{m}$$",
        target: "**Target: 109.19 m | Accepted range: 108.60 to 109.80.**",
      },
    },
    {
      id: "trav-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For the same curve ($R = 300\\ \\text{m}$, $\\Delta = 40^{\\circ}$), the length of the curve (arc) is ______ m. (Round off to two decimal places.)",
      natAnswer: 209.44,
      acceptedRange: [208.4, 210.4],
      unit: "m",
      solution: {
        given: "$R = 300\\ \\text{m}$, $\\Delta = 40^{\\circ}$.",
        derivation:
          "$$L_c = \\frac{\\pi R\\Delta}{180} = \\frac{\\pi\\times 300\\times 40}{180} = \\frac{12000\\pi}{180} = 209.44\\ \\text{m}$$",
        target: "**Target: 209.44 m | Accepted range: 208.40 to 210.40.** The arc uses the full $\\Delta$, unlike the tangent length.",
      },
    },
  ],
};

/* ──────────────────────────────────────────────────────────────────── */
/*  SECTION 2 (fill) — Access, Drivages, Drilling, Correlation, EDM      */
/* ──────────────────────────────────────────────────────────────────── */

const mdsAccessDeposits: LearnTopic = {
  slug: "mds-access-deposits",
  subject: "Mine Development & Surveying",
  title: "Methods of Access to Deposits",
  tier: "subject",
  blurb:
    "Vertical shafts, inclines and adits — and the geometry that sets how long an inclined drivage must be to reach a given depth.",
  module: {
    principle:
      "A deposit is reached by a **vertical shaft** (fastest descent, costly winding), an **incline/decline** (gentle gradient for conveyors and trackless equipment), or a horizontal **adit** (where terrain allows gravity drainage). For an inclined access the length is fixed by simple right-triangle geometry: to gain a vertical depth $H$ at an inclination $\\theta$, the inclined length is $L = H/\\sin\\theta$. Stated as a gradient '1 in $n$', the horizontal run is $n$ times the rise, and the true length is the hypotenuse.",
    formulaMatrix: [
      "**Inclined length from angle**: $L = \\dfrac{H}{\\sin\\theta}$  ($H$ = vertical depth, $\\theta$ = inclination).",
      "",
      "**Gradient 1 in $n$**: horizontal run $= nH$; inclined length $L = \\sqrt{H^2 + (nH)^2} = H\\sqrt{1+n^2}$.",
      "",
      "**Shaft sinking time** $= \\dfrac{\\text{depth}}{\\text{sinking rate}}$.",
    ].join("\n"),
    traps: [
      "**'1 in $n$' is a gradient, not an angle.** It means rise:run $= 1:n$, so $\\tan\\theta = 1/n$ — convert before using $\\sin\\theta$.",
      "**Inclined length uses the hypotenuse.** $L = H/\\sin\\theta > H$; using $H$ alone underestimates the drivage.",
      "**Adits need favourable topography.** They only work where the deposit outcrops above valley level.",
    ],
  },
  questions: [
    {
      id: "acc-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "An incline at $30^{\\circ}$ to the horizontal must reach a vertical depth of $150\\ \\text{m}$. Its length is:",
      options: ["$300\\ \\text{m}$", "$150\\ \\text{m}$", "$260\\ \\text{m}$", "$173\\ \\text{m}$"],
      answer: 0,
      solution: {
        given: "$H = 150\\ \\text{m}$, $\\theta = 30^{\\circ}$ ($\\sin 30^{\\circ} = 0.5$).",
        derivation: "$$L = \\frac{H}{\\sin\\theta} = \\frac{150}{0.5} = 300\\ \\text{m}$$",
        target: "**Correct option: $300\\ \\text{m}$.** $260 = H/\\tan30^{\\circ}$ is the horizontal run, not the length.",
      },
    },
    {
      id: "acc-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A decline of gradient $1$ in $4$ is driven to reach a vertical depth of $100\\ \\text{m}$. Its length is ______ m. (Round off to two decimal places.)",
      natAnswer: 412.31,
      acceptedRange: [410, 415],
      unit: "m",
      solution: {
        given: "Gradient $1$ in $4$ ⇒ horizontal run $= 4\\times100 = 400\\ \\text{m}$; rise $H = 100\\ \\text{m}$.",
        derivation: "$$L = \\sqrt{H^2 + (4H)^2} = \\sqrt{100^2 + 400^2} = \\sqrt{170000} = 412.31\\ \\text{m}$$",
        target: "**Target: 412.31 m | Accepted range: 410 to 415.**",
      },
    },
    {
      id: "acc-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A conveyor decline at gradient $1$ in $5$ reaches a vertical depth of $200\\ \\text{m}$. The length of the decline is ______ m. (Round off to two decimal places.)",
      natAnswer: 1019.8,
      acceptedRange: [1015, 1025],
      unit: "m",
      solution: {
        given: "Gradient $1$ in $5$ ⇒ horizontal run $= 5\\times200 = 1000\\ \\text{m}$; rise $= 200\\ \\text{m}$.",
        derivation: "$$L = \\sqrt{200^2 + 1000^2} = \\sqrt{1040000} = 1019.80\\ \\text{m}$$",
        target: "**Target: 1019.80 m | Accepted range: 1015 to 1025.**",
      },
    },
  ],
};

const mdsUndergroundDrivages: LearnTopic = {
  slug: "mds-underground-drivages",
  subject: "Mine Development & Surveying",
  title: "Underground Drivages",
  tier: "subject",
  blurb:
    "The drill–blast cycle of a development heading — advance per round, number of rounds, and the muck produced.",
  module: {
    principle:
      "A development heading advances by repeating a **drill–blast–muck** cycle. Each round drills holes to a set depth, but the blast never pulls the full depth — the **pull efficiency** gives the actual **advance per round**. The number of rounds to drive a given length is the length divided by the advance, and the **muck** produced per round is the cross-sectional area times the advance times the rock density.",
    formulaMatrix: [
      "**Advance per round**: $a = d\\,\\eta_{pull}$  ($d$ = hole depth, $\\eta_{pull}$ = pull efficiency).",
      "",
      "**Rounds for a drive of length $L$**: $N = \\dfrac{L}{a}$.",
      "",
      "**Muck per round** (tonnes): $T = A\\,a\\,\\rho$  ($A$ = cross-section, $\\rho$ = density).",
    ].join("\n"),
    traps: [
      "**Pull efficiency < 100%.** The advance is always less than the hole depth; using the full depth over-states progress.",
      "**Muck uses the *advance*, not the hole depth.** Only the blasted-out length contributes to the round's tonnage.",
      "**Round up the number of rounds.** A fractional round still needs a full cycle.",
    ],
  },
  questions: [
    {
      id: "driv-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Holes are drilled to $2.0\\ \\text{m}$ depth with a pull efficiency of $80\\%$. The advance per round is:",
      options: ["$1.6\\ \\text{m}$", "$2.0\\ \\text{m}$", "$1.65\\ \\text{m}$", "$0.9\\ \\text{m}$"],
      answer: 0,
      solution: {
        given: "$d = 2.0\\ \\text{m}$, $\\eta_{pull} = 0.80$.",
        derivation: "$$a = d\\,\\eta_{pull} = 2.0\\times 0.80 = 1.6\\ \\text{m}$$",
        target: "**Correct option: $1.6\\ \\text{m}$.** The blast pulls 80% of the drilled depth.",
      },
    },
    {
      id: "driv-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "With an advance of $1.6\\ \\text{m}$ per round, the number of rounds required to drive a heading $120\\ \\text{m}$ long is ______. (Round off to the nearest whole number.)",
      natAnswer: 75,
      acceptedRange: [74, 76],
      solution: {
        given: "$a = 1.6\\ \\text{m}$, $L = 120\\ \\text{m}$.",
        derivation: "$$N = \\frac{L}{a} = \\frac{120}{1.6} = 75\\ \\text{rounds}$$",
        target: "**Target: 75 | Accepted range: 74 to 76.**",
      },
    },
    {
      id: "driv-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A heading of cross-section $12\\ \\text{m}^2$ advances $1.6\\ \\text{m}$ per round in rock of density $2.5\\ \\text{t/m}^3$. The muck produced per round is ______ t. (Round off to two decimal places.)",
      natAnswer: 48,
      acceptedRange: [47, 49],
      unit: "t",
      solution: {
        given: "$A = 12\\ \\text{m}^2$, $a = 1.6\\ \\text{m}$, $\\rho = 2.5\\ \\text{t/m}^3$.",
        derivation: "$$T = A\\,a\\,\\rho = 12\\times 1.6\\times 2.5 = 48\\ \\text{t}$$",
        target: "**Target: 48.00 t | Accepted range: 47 to 49.**",
      },
    },
  ],
};

const mdsDrilling: LearnTopic = {
  slug: "mds-drilling",
  subject: "Mine Development & Surveying",
  title: "Drilling Methods & Machines",
  tier: "subject",
  blurb:
    "Penetration rate and drilling time for a blast round, and the specific-drilling measure of drilling effort per unit rock.",
  module: {
    principle:
      "Rock is drilled by **percussive**, **rotary** or **rotary-percussive** machines; the key performance figure is the **penetration rate** (metres drilled per minute). The time to complete a round is the total drilled length divided by that rate. **Specific drilling** — metres of hole per cubic metre of rock broken — measures how drilling-intensive a blast pattern is, and is a useful cost indicator.",
    formulaMatrix: [
      "**Drilling time** $= \\dfrac{\\text{total drilled length}}{\\text{penetration rate}}$;  total length $= N\\times d$.",
      "",
      "**Specific drilling** $= \\dfrac{\\text{total drilled length}}{\\text{volume of rock broken}}$  $[\\text{m/m}^3]$.",
    ].join("\n"),
    traps: [
      "**Total length = holes × depth.** Forgetting to multiply by the number of holes badly under-counts drilling time.",
      "**Penetration rate divides, not multiplies.** Time $=$ length $/$ rate.",
      "**Specific drilling is m per m³, not per tonne** unless you convert through density.",
    ],
  },
  questions: [
    {
      id: "drill-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A drill advances at a penetration rate of $0.5\\ \\text{m/min}$. The time to drill one $3\\ \\text{m}$ hole is:",
      options: ["$6\\ \\text{min}$", "$1.5\\ \\text{min}$", "$0.17\\ \\text{min}$", "$3\\ \\text{min}$"],
      answer: 0,
      solution: {
        given: "Penetration rate $= 0.5\\ \\text{m/min}$, hole depth $= 3\\ \\text{m}$.",
        derivation: "$$t = \\frac{3}{0.5} = 6\\ \\text{min}$$",
        target: "**Correct option: $6\\ \\text{min}$.** $1.5 = 3\\times0.5$ multiplies instead of dividing.",
      },
    },
    {
      id: "drill-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A round needs $20$ holes, each $3\\ \\text{m}$ deep, drilled at $0.6\\ \\text{m/min}$ (ignore repositioning). The total drilling time is ______ min. (Round off to the nearest whole number.)",
      natAnswer: 100,
      acceptedRange: [98, 102],
      unit: "min",
      solution: {
        given: "$N = 20$, $d = 3\\ \\text{m}$, rate $= 0.6\\ \\text{m/min}$.",
        derivation:
          "Total length $= 20\\times3 = 60\\ \\text{m}$.\n$$t = \\frac{60}{0.6} = 100\\ \\text{min}$$",
        target: "**Target: 100 min | Accepted range: 98 to 102.**",
      },
    },
    {
      id: "drill-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "If those $60\\ \\text{m}$ of drilling break $200\\ \\text{m}^3$ of rock, the specific drilling is ______ m/m³. (Round off to two decimal places.)",
      natAnswer: 0.3,
      acceptedRange: [0.28, 0.32],
      unit: "m/m³",
      solution: {
        given: "Drilled length $= 60\\ \\text{m}$, broken volume $= 200\\ \\text{m}^3$.",
        derivation: "$$\\text{Specific drilling} = \\frac{60}{200} = 0.30\\ \\text{m/m}^3$$",
        target: "**Target: 0.30 m/m³ | Accepted range: 0.28 to 0.32.**",
      },
    },
  ],
};

const mdsUndergroundCorrelation: LearnTopic = {
  slug: "mds-underground-correlation",
  subject: "Mine Development & Surveying",
  title: "Underground Surveying & Correlation",
  tier: "subject",
  blurb:
    "Bearings and lengths from coordinate differences, and the closing error that measures a traverse's accuracy.",
  module: {
    principle:
      "Underground survey lines are tied to the surface by **correlation** (transferring bearing and coordinates down a shaft). Once partial coordinates (latitude $\\Delta N$ and departure $\\Delta E$) are known, the line's **length** is the hypotenuse and its **bearing** is the arctangent of departure over latitude. A closed traverse should return to its start; any residual $(\\sum\\Delta N,\\ \\sum\\Delta E)$ is the **closing error**, whose magnitude gauges the survey quality.",
    formulaMatrix: [
      "**Line length**: $L = \\sqrt{\\Delta N^2 + \\Delta E^2}$.",
      "",
      "**Bearing**: $\\theta = \\tan^{-1}\\!\\left(\\dfrac{\\Delta E}{\\Delta N}\\right)$ (measured from north).",
      "",
      "**Closing error**: $e = \\sqrt{\\left(\\sum\\Delta N\\right)^2 + \\left(\\sum\\Delta E\\right)^2}$.",
    ].join("\n"),
    traps: [
      "**Bearing uses departure over latitude** ($\\Delta E/\\Delta N$), then is reckoned from north — not $\\Delta N/\\Delta E$.",
      "**Closing error is the vector magnitude**, combining both component misclosures, not their simple sum.",
      "**Watch the quadrant.** The signs of $\\Delta N$ and $\\Delta E$ place the bearing in the correct quadrant (N–E, S–E, etc.).",
    ],
  },
  questions: [
    {
      id: "ucorr-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A survey line has $\\Delta N = 30\\ \\text{m}$ and $\\Delta E = 40\\ \\text{m}$. Its length is:",
      options: ["$50\\ \\text{m}$", "$70\\ \\text{m}$", "$10\\ \\text{m}$", "$35\\ \\text{m}$"],
      answer: 0,
      solution: {
        given: "$\\Delta N = 30\\ \\text{m}$, $\\Delta E = 40\\ \\text{m}$.",
        derivation: "$$L = \\sqrt{30^2 + 40^2} = \\sqrt{2500} = 50\\ \\text{m}$$",
        target: "**Correct option: $50\\ \\text{m}$.** $70$ adds the components; the length is the hypotenuse.",
      },
    },
    {
      id: "ucorr-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "For the same line ($\\Delta N = 30\\ \\text{m}$ N, $\\Delta E = 40\\ \\text{m}$ E), the whole-circle bearing is ______ degrees. (Round off to two decimal places.)",
      natAnswer: 53.13,
      acceptedRange: [52, 54],
      unit: "°",
      solution: {
        given: "$\\Delta N = 30$, $\\Delta E = 40$ (both positive ⇒ NE quadrant).",
        derivation: "$$\\theta = \\tan^{-1}\\!\\left(\\frac{\\Delta E}{\\Delta N}\\right) = \\tan^{-1}\\!\\left(\\frac{40}{30}\\right) = 53.13^{\\circ}$$",
        target: "**Target: 53.13° | Accepted range: 52 to 54.**",
      },
    },
    {
      id: "ucorr-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A closed traverse fails to close by $\\sum\\Delta N = 0.06\\ \\text{m}$ and $\\sum\\Delta E = 0.08\\ \\text{m}$. The closing error is ______ m. (Round off to two decimal places.)",
      natAnswer: 0.1,
      acceptedRange: [0.09, 0.11],
      unit: "m",
      solution: {
        given: "$\\sum\\Delta N = 0.06\\ \\text{m}$, $\\sum\\Delta E = 0.08\\ \\text{m}$.",
        derivation: "$$e = \\sqrt{0.06^2 + 0.08^2} = \\sqrt{0.0036 + 0.0064} = \\sqrt{0.01} = 0.10\\ \\text{m}$$",
        target: "**Target: 0.10 m | Accepted range: 0.09 to 0.11.**",
      },
    },
  ],
};

const mdsEdmTotalStation: LearnTopic = {
  slug: "mds-edm-total-station",
  subject: "Mine Development & Surveying",
  title: "EDM, Total Station & GPS",
  tier: "subject",
  blurb:
    "Resolving an EDM-measured slope distance into its horizontal and vertical components using the vertical angle.",
  module: {
    principle:
      "An **EDM** (electronic distance measurement) instrument — the heart of a **total station** — measures the straight-line **slope distance** to a prism. To map and level we need the **horizontal distance** and the **vertical (height) difference**, obtained by resolving the slope distance with the measured **vertical angle**: the horizontal component uses the cosine, the vertical component the sine. GPS gives 3-D coordinates directly but the same trigonometric resolution applies to any sloping measurement.",
    formulaMatrix: [
      "**Horizontal distance**: $D = S\\cos\\alpha$.",
      "",
      "**Vertical (height) difference**: $V = S\\sin\\alpha$.",
      "",
      "$S$ = slope distance, $\\alpha$ = vertical angle from the horizontal.",
    ].join("\n"),
    traps: [
      "**Horizontal uses cosine, vertical uses sine.** Swapping them is the classic slope-reduction error.",
      "**$\\alpha$ is measured from the horizontal**, not the vertical (zenith) — check the instrument convention.",
      "**Slope distance ≥ horizontal distance.** If your 'horizontal' exceeds the slope distance, the trig is inverted.",
    ],
  },
  questions: [
    {
      id: "edm-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A total station measures a slope distance of $200\\ \\text{m}$ at a vertical angle of $30^{\\circ}$. The horizontal distance is:",
      options: ["$173.21\\ \\text{m}$", "$100.0\\ \\text{m}$", "$200.0\\ \\text{m}$", "$141.42\\ \\text{m}$"],
      answer: 0,
      solution: {
        given: "$S = 200\\ \\text{m}$, $\\alpha = 30^{\\circ}$ ($\\cos 30^{\\circ} = 0.8660$).",
        derivation: "$$D = S\\cos\\alpha = 200\\times 0.8660 = 173.21\\ \\text{m}$$",
        target: "**Correct option: $173.21\\ \\text{m}$.** $100 = S\\sin30^{\\circ}$ is the vertical component.",
      },
    },
    {
      id: "edm-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A slope distance of $250\\ \\text{m}$ is measured at a vertical angle of $20^{\\circ}$. The vertical height difference is ______ m. (Round off to two decimal places.)",
      natAnswer: 85.51,
      acceptedRange: [84, 87],
      unit: "m",
      solution: {
        given: "$S = 250\\ \\text{m}$, $\\alpha = 20^{\\circ}$ ($\\sin 20^{\\circ} = 0.3420$).",
        derivation: "$$V = S\\sin\\alpha = 250\\times 0.3420 = 85.51\\ \\text{m}$$",
        target: "**Target: 85.51 m | Accepted range: 84 to 87.**",
      },
    },
    {
      id: "edm-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "An EDM slope distance of $500\\ \\text{m}$ is observed at a vertical angle of $12^{\\circ}$. The horizontal distance is ______ m. (Round off to two decimal places.)",
      natAnswer: 489.07,
      acceptedRange: [487, 491],
      unit: "m",
      solution: {
        given: "$S = 500\\ \\text{m}$, $\\alpha = 12^{\\circ}$ ($\\cos 12^{\\circ} = 0.9781$).",
        derivation: "$$D = S\\cos\\alpha = 500\\times 0.9781 = 489.07\\ \\text{m}$$",
        target: "**Target: 489.07 m | Accepted range: 487 to 491.**",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 3 — Geomechanics and Ground Control                          */
/* ════════════════════════════════════════════════════════════════════ */

const gmMohrCoulomb: LearnTopic = {
  slug: "gm-mohr-coulomb",
  subject: "Geomechanics & Ground Control",
  title: "Mohr–Coulomb Failure",
  tier: "free",
  blurb:
    "The shear-strength envelope τ = c + σ tanφ and the principal-stress failure criterion — the backbone of rock and soil strength.",
  module: {
    principle:
      "Rock fails in shear when the shear stress on a plane reaches the material's resistance, which has two parts: a **cohesion** $c$ (the strength at zero normal stress) and a **frictional** part that grows with the normal stress through the **angle of internal friction** $\\phi$. Plotted as $\\tau = c + \\sigma\\tan\\phi$, this is the **Mohr–Coulomb envelope**; a stress state is safe while its Mohr circle stays below the line and fails when the circle just touches it. Re-cast in principal stresses, the criterion predicts the major principal stress $\\sigma_1$ a sample can carry for a given confinement $\\sigma_3$.",
    formulaMatrix: [
      "**Shear-strength envelope**: $$\\tau = c + \\sigma_n\\tan\\phi$$",
      "",
      "**Principal-stress form** (at failure): $$\\sigma_1 = \\sigma_3\\,N_\\phi + 2c\\sqrt{N_\\phi},\\qquad N_\\phi = \\frac{1+\\sin\\phi}{1-\\sin\\phi} = \\tan^2\\!\\left(45^{\\circ}+\\tfrac{\\phi}{2}\\right)$$",
      "",
      "**Uniaxial compressive strength** ($\\sigma_3 = 0$): $$\\sigma_c = 2c\\sqrt{N_\\phi} = 2c\\,\\tan\\!\\left(45^{\\circ}+\\tfrac{\\phi}{2}\\right)$$",
      "",
      "$c$ = cohesion, $\\phi$ = friction angle, $\\sigma_n$ = normal stress.",
    ].join("\n"),
    traps: [
      "**$N_\\phi$ uses $45^{\\circ}+\\phi/2$, not $45^{\\circ}-\\phi/2$.** The half-angle is added for the strength (active-failure) direction.",
      "**Cohesion is the intercept, friction is the slope.** Confusing $c$ (a stress) with $\\tan\\phi$ (dimensionless) breaks the units.",
      "**The envelope is a straight line in $\\sigma$–$\\tau$ space, not the Mohr circle.** Failure is the circle *tangent* to the line, not where the circle peaks.",
    ],
    figure: {
      kind: "mohr",
      caption: "Mohr circle for σ₃ = 5, σ₁ = 49.64 MPa just touching the c = 10 MPa, φ = 30° envelope.",
      sigma1: 49.64,
      sigma3: 5,
      phi: 30,
      cohesion: 10,
    },
  },
  questions: [
    {
      id: "mc-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A rock has cohesion $c = 20\\ \\text{kPa}$ and friction angle $\\phi = 30^{\\circ}$. The shear strength on a plane carrying a normal stress of $100\\ \\text{kPa}$ is:",
      options: ["$77.74\\ \\text{kPa}$", "$57.74\\ \\text{kPa}$", "$120.0\\ \\text{kPa}$", "$100.0\\ \\text{kPa}$"],
      answer: 0,
      solution: {
        given: "$c = 20\\ \\text{kPa}$, $\\phi = 30^{\\circ}$, $\\sigma_n = 100\\ \\text{kPa}$ ($\\tan 30^{\\circ} = 0.5774$).",
        derivation: "$$\\tau = c + \\sigma_n\\tan\\phi = 20 + 100\\times 0.5774 = 20 + 57.74 = 77.74\\ \\text{kPa}$$",
        target: "**Correct option: $77.74\\ \\text{kPa}$.** $57.74$ omits cohesion; $120$ uses $\\tan 45^{\\circ}=1$.",
      },
    },
    {
      id: "mc-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A rock has cohesion $c = 10\\ \\text{MPa}$ and friction angle $\\phi = 30^{\\circ}$. Its uniaxial compressive strength is ______ MPa. (Round off to two decimal places.)",
      natAnswer: 34.64,
      acceptedRange: [34.0, 35.3],
      unit: "MPa",
      solution: {
        given: "$c = 10\\ \\text{MPa}$, $\\phi = 30^{\\circ}$; $45^{\\circ}+\\phi/2 = 60^{\\circ}$, $\\tan 60^{\\circ} = 1.7321$.",
        derivation: "$$\\sigma_c = 2c\\,\\tan\\!\\left(45^{\\circ}+\\tfrac{\\phi}{2}\\right) = 2\\times 10\\times 1.7321 = 34.64\\ \\text{MPa}$$",
        target: "**Target: 34.64 MPa | Accepted range: 34.00 to 35.30.**",
      },
    },
    {
      id: "mc-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For $c = 10\\ \\text{MPa}$ and $\\phi = 30^{\\circ}$, the major principal stress at failure under a confining stress $\\sigma_3 = 5\\ \\text{MPa}$ is ______ MPa. (Round off to two decimal places.)",
      natAnswer: 49.64,
      acceptedRange: [49.0, 50.3],
      unit: "MPa",
      solution: {
        given: "$c = 10$, $\\phi = 30^{\\circ}$, $\\sigma_3 = 5\\ \\text{MPa}$; $N_\\phi = \\tan^2 60^{\\circ} = 3$.",
        derivation:
          "$$\\sigma_1 = \\sigma_3 N_\\phi + 2c\\sqrt{N_\\phi} = 5\\times 3 + 2\\times 10\\times\\sqrt{3} = 15 + 34.64 = 49.64\\ \\text{MPa}$$",
        target: "**Target: 49.64 MPa | Accepted range: 49.00 to 50.30.** The figure shows this circle tangent to the envelope.",
      },
    },
  ],
};

const gmStressAroundOpenings: LearnTopic = {
  slug: "gm-stress-around-openings",
  subject: "Geomechanics & Ground Control",
  title: "Stress Around Openings",
  tier: "subject",
  blurb:
    "In-situ cover stress and the Kirsch tangential stresses at the boundary of a circular opening — where roof and sidewall stresses concentrate.",
  module: {
    principle:
      "Before mining, the rock carries a **vertical (cover) stress** $\\sigma_v = \\gamma H$ from the weight of the overburden, plus a horizontal stress $\\sigma_h$. Excavating an opening forces this stress to flow *around* the void, concentrating the **tangential stress** at the boundary. For a circular opening the **Kirsch** solution gives the boundary tangential stress: highest at the **sidewall** and lowest (sometimes *tensile*) at the **roof and floor**. Tensile boundary stress is the warning sign for roof slabbing.",
    formulaMatrix: [
      "**Vertical cover stress**: $\\sigma_v = \\gamma H$  ($\\gamma$ = unit weight, $H$ = depth).",
      "",
      "**Hydrostatic field** ($\\sigma_h = \\sigma_v = p$): boundary tangential stress is uniform, $\\sigma_\\theta = 2p$.",
      "",
      "**Biaxial field, circular opening (Kirsch, boundary):**",
      "$$\\sigma_{\\theta,\\,\\text{sidewall}} = 3\\sigma_v - \\sigma_h,\\qquad \\sigma_{\\theta,\\,\\text{roof}} = 3\\sigma_h - \\sigma_v$$",
    ].join("\n"),
    traps: [
      "**Sidewall vs roof formulae are mirror images.** Sidewall $= 3\\sigma_v-\\sigma_h$; roof $= 3\\sigma_h-\\sigma_v$. Swapping them sends the concentration to the wrong wall.",
      "**Roof stress can go negative (tensile).** When $\\sigma_v > 3\\sigma_h$ the roof tangential stress is tensile — don't clip it to zero.",
      "**Unit weight in kN/m³, depth in m ⇒ stress in kPa.** $25\\times200 = 5000\\ \\text{kPa} = 5\\ \\text{MPa}$; keep the factor of 1000 straight.",
    ],
  },
  questions: [
    {
      id: "str-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A circular opening sits in a hydrostatic stress field of $10\\ \\text{MPa}$. The tangential stress at its boundary is:",
      options: ["$20\\ \\text{MPa}$", "$10\\ \\text{MPa}$", "$30\\ \\text{MPa}$", "$5\\ \\text{MPa}$"],
      answer: 0,
      solution: {
        given: "Hydrostatic field $p = 10\\ \\text{MPa}$.",
        derivation: "$$\\sigma_\\theta = 2p = 2\\times 10 = 20\\ \\text{MPa}\\ \\text{(uniform around the boundary)}$$",
        target: "**Correct option: $20\\ \\text{MPa}$.** Hydrostatic loading doubles uniformly — the classic stress-concentration factor of 2.",
      },
    },
    {
      id: "str-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A circular roadway lies in a field with vertical stress $\\sigma_v = 10\\ \\text{MPa}$ and horizontal stress $\\sigma_h = 2\\ \\text{MPa}$. The tangential stress at the sidewall is ______ MPa. (Round off to two decimal places.)",
      natAnswer: 28,
      acceptedRange: [27, 29],
      unit: "MPa",
      solution: {
        given: "$\\sigma_v = 10$, $\\sigma_h = 2\\ \\text{MPa}$.",
        derivation: "$$\\sigma_{\\theta,\\,\\text{sidewall}} = 3\\sigma_v - \\sigma_h = 3\\times 10 - 2 = 28\\ \\text{MPa}$$",
        target: "**Target: 28.00 MPa | Accepted range: 27.00 to 29.00.**",
      },
    },
    {
      id: "str-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For the same field ($\\sigma_v = 10\\ \\text{MPa}$, $\\sigma_h = 2\\ \\text{MPa}$), the tangential stress at the roof of the circular opening is ______ MPa (a negative value indicates tension). (Round off to two decimal places.)",
      natAnswer: -4,
      acceptedRange: [-5, -3],
      unit: "MPa",
      solution: {
        given: "$\\sigma_v = 10$, $\\sigma_h = 2\\ \\text{MPa}$.",
        derivation:
          "$$\\sigma_{\\theta,\\,\\text{roof}} = 3\\sigma_h - \\sigma_v = 3\\times 2 - 10 = -4\\ \\text{MPa}\\ \\text{(tensile)}$$",
        target: "**Target: −4.00 MPa | Accepted range: −5.00 to −3.00.** Tension in the roof signals slabbing risk.",
      },
    },
  ],
};

const gmPillarDesign: LearnTopic = {
  slug: "gm-pillar-design",
  subject: "Geomechanics & Ground Control",
  title: "Pillar Design",
  tier: "subject",
  blurb:
    "Tributary-area pillar stress, the Obert–Duvall strength formula and the all-important factor of safety.",
  module: {
    principle:
      "In bord-and-pillar mining the **pillars** carry the weight of the overburden that the excavated bords no longer support. The **tributary area** theory loads each pillar with the cover stress acting over the full pillar-plus-opening area, so the pillar stress rises above the cover stress by the ratio of those areas. The pillar's **strength** depends on its width-to-height ratio — squatter pillars are stronger — captured by the **Obert–Duvall** formula. The **factor of safety** is simply strength divided by stress.",
    formulaMatrix: [
      "**Cover stress**: $\\sigma_v = \\gamma H$.",
      "",
      "**Tributary-area pillar stress** (square pillars, width $W$, opening $B$):",
      "$$\\sigma_p = \\sigma_v\\,\\frac{(W+B)^2}{W^2}$$",
      "",
      "**Obert–Duvall pillar strength**: $$S_p = S_1\\left(0.778 + 0.222\\,\\frac{W}{H}\\right)$$ $S_1$ = strength of a cubical specimen, $H$ = pillar height.",
      "",
      "**Factor of safety**: $$FS = \\frac{S_p}{\\sigma_p}$$",
    ].join("\n"),
    traps: [
      "**Square the area ratio.** Tributary stress scales as $(W+B)^2/W^2$, not $(W+B)/W$ — it's an *area* ratio.",
      "**Width-to-height, not height-to-width.** Obert–Duvall uses $W/H$; squat pillars ($W/H>1$) are stronger.",
      "**FS = strength/stress.** Inverting it makes a safe pillar look unsafe.",
    ],
  },
  questions: [
    {
      id: "pil-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "At a depth of $200\\ \\text{m}$ the overburden unit weight is $25\\ \\text{kN/m}^3$. The vertical cover stress is:",
      options: ["$5\\ \\text{MPa}$", "$0.5\\ \\text{MPa}$", "$50\\ \\text{MPa}$", "$2.5\\ \\text{MPa}$"],
      answer: 0,
      solution: {
        given: "$\\gamma = 25\\ \\text{kN/m}^3$, $H = 200\\ \\text{m}$.",
        derivation: "$$\\sigma_v = \\gamma H = 25\\times 200 = 5000\\ \\text{kPa} = 5\\ \\text{MPa}$$",
        target: "**Correct option: $5\\ \\text{MPa}$.** The others are unit-conversion (kPa↔MPa) slips.",
      },
    },
    {
      id: "pil-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Square pillars of width $W = 10\\ \\text{m}$ are separated by bords of width $B = 5\\ \\text{m}$ at a depth giving a cover stress of $5\\ \\text{MPa}$. The pillar stress by tributary-area theory is ______ MPa. (Round off to two decimal places.)",
      natAnswer: 11.25,
      acceptedRange: [11.0, 11.5],
      unit: "MPa",
      solution: {
        given: "$\\sigma_v = 5\\ \\text{MPa}$, $W = 10\\ \\text{m}$, $B = 5\\ \\text{m}$.",
        derivation:
          "$$\\sigma_p = \\sigma_v\\frac{(W+B)^2}{W^2} = 5\\times\\frac{(15)^2}{(10)^2} = 5\\times\\frac{225}{100} = 11.25\\ \\text{MPa}$$",
        target: "**Target: 11.25 MPa | Accepted range: 11.00 to 11.50.**",
      },
    },
    {
      id: "pil-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A pillar of width $W = 10\\ \\text{m}$ and height $H = 8\\ \\text{m}$ has a cubical-specimen strength $S_1 = 30\\ \\text{MPa}$ and carries a pillar stress of $11.25\\ \\text{MPa}$. Using the Obert–Duvall formula, the factor of safety is ______. (Round off to two decimal places.)",
      natAnswer: 2.81,
      acceptedRange: [2.7, 2.95],
      solution: {
        given: "$S_1 = 30\\ \\text{MPa}$, $W/H = 10/8 = 1.25$, $\\sigma_p = 11.25\\ \\text{MPa}$.",
        derivation:
          "Pillar strength:\n$$S_p = S_1\\left(0.778 + 0.222\\times 1.25\\right) = 30\\times(0.778 + 0.2775) = 30\\times 1.0555 = 31.67\\ \\text{MPa}$$\nFactor of safety:\n$$FS = \\frac{S_p}{\\sigma_p} = \\frac{31.67}{11.25} = 2.81$$",
        target: "**Target: 2.81 | Accepted range: 2.70 to 2.95.**",
      },
    },
  ],
};

const gmSlopeStability: LearnTopic = {
  slug: "gm-slope-stability",
  subject: "Geomechanics & Ground Control",
  title: "Slope Stability (Planar Failure)",
  tier: "premium",
  blurb:
    "Factor of safety for sliding on a discontinuity — resisting friction and cohesion versus the driving weight component.",
  module: {
    principle:
      "An open-pit bench or hillside fails when a block slides along a **discontinuity** dipping out of the slope. The **driving force** is the down-dip component of the block's weight, $W\\sin\\beta$; the **resisting force** is the friction $W\\cos\\beta\\tan\\phi$ plus the cohesion acting over the failure-plane area, $cA$. Their ratio is the **factor of safety** — below 1 the slope moves. When cohesion is zero the result collapses to the elegant $FS = \\tan\\phi/\\tan\\beta$.",
    formulaMatrix: [
      "**Factor of safety, planar (dry) failure:**",
      "$$FS = \\frac{cA + W\\cos\\beta\\,\\tan\\phi}{W\\sin\\beta}$$",
      "$\\beta$ = dip of failure plane, $\\phi$ = friction angle, $c$ = cohesion, $A$ = plane area, $W$ = block weight.",
      "",
      "**Cohesionless special case** ($c = 0$): $$FS = \\frac{\\tan\\phi}{\\tan\\beta}$$",
    ].join("\n"),
    traps: [
      "**Driving uses $\\sin\\beta$, resisting friction uses $\\cos\\beta$.** Swapping the trig functions inverts the safety factor.",
      "**Cohesion acts over the plane area $A$**, giving a force $cA$ — don't add $c$ (a stress) directly to forces.",
      "**$c=0 \\Rightarrow FS = \\tan\\phi/\\tan\\beta$**: weight cancels, so a cohesionless slope's stability is independent of block size.",
    ],
  },
  questions: [
    {
      id: "slp-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A block weighing $1000\\ \\text{kN}$ rests on a plane dipping at $30^{\\circ}$. The driving (down-dip) force is:",
      options: ["$500\\ \\text{kN}$", "$866\\ \\text{kN}$", "$1000\\ \\text{kN}$", "$577\\ \\text{kN}$"],
      answer: 0,
      solution: {
        given: "$W = 1000\\ \\text{kN}$, dip $\\beta = 30^{\\circ}$.",
        derivation: "$$\\text{Driving} = W\\sin\\beta = 1000\\times\\sin 30^{\\circ} = 1000\\times 0.5 = 500\\ \\text{kN}$$",
        target: "**Correct option: $500\\ \\text{kN}$.** $866 = W\\cos30^{\\circ}$ is the normal component, not the driving one.",
      },
    },
    {
      id: "slp-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A cohesionless ($c = 0$) discontinuity has friction angle $\\phi = 35^{\\circ}$ and dips at $\\beta = 30^{\\circ}$ out of the slope. The factor of safety against planar sliding is ______. (Round off to two decimal places.)",
      natAnswer: 1.21,
      acceptedRange: [1.15, 1.27],
      solution: {
        given: "$c = 0$, $\\phi = 35^{\\circ}$, $\\beta = 30^{\\circ}$.",
        derivation:
          "$$FS = \\frac{\\tan\\phi}{\\tan\\beta} = \\frac{\\tan 35^{\\circ}}{\\tan 30^{\\circ}} = \\frac{0.7002}{0.5774} = 1.21$$",
        target: "**Target: 1.21 | Accepted range: 1.15 to 1.27.** Marginally stable — independent of block weight.",
      },
    },
    {
      id: "slp-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A block of weight $W = 2000\\ \\text{kN}$ rests on a plane of area $A = 20\\ \\text{m}^2$ dipping at $\\beta = 35^{\\circ}$. The discontinuity has $c = 25\\ \\text{kPa}$ and $\\phi = 30^{\\circ}$. The factor of safety is ______. (Round off to two decimal places.)",
      natAnswer: 1.26,
      acceptedRange: [1.18, 1.34],
      solution: {
        given: "$W = 2000\\ \\text{kN}$, $A = 20\\ \\text{m}^2$, $\\beta = 35^{\\circ}$, $c = 25\\ \\text{kPa}$, $\\phi = 30^{\\circ}$.",
        derivation:
          "Cohesion force: $cA = 25\\times 20 = 500\\ \\text{kN}$.\nFriction: $W\\cos\\beta\\tan\\phi = 2000\\times\\cos35^{\\circ}\\times\\tan30^{\\circ} = 2000\\times0.8192\\times0.5774 = 945.9\\ \\text{kN}$.\nDriving: $W\\sin\\beta = 2000\\times\\sin35^{\\circ} = 1147.2\\ \\text{kN}$.\n$$FS = \\frac{500 + 945.9}{1147.2} = \\frac{1445.9}{1147.2} = 1.26$$",
        target: "**Target: 1.26 | Accepted range: 1.18 to 1.34.**",
      },
    },
  ],
};

/* ──────────────────────────────────────────────────────────────────── */
/*  SECTION 3 (fill) — Rock properties, RMR/Q, Subsidence, Supports,     */
/*  Rock bursts, Ground vibrations                                       */
/* ──────────────────────────────────────────────────────────────────── */

const gmRockProperties: LearnTopic = {
  slug: "gm-rock-properties",
  subject: "Geomechanics & Ground Control",
  title: "Geotechnical Properties of Rocks",
  tier: "subject",
  blurb:
    "Porosity, void ratio and the point-load estimate of strength — the index properties that classify a rock for design.",
  module: {
    principle:
      "A rock's mechanical behaviour is summarised by **index properties**. **Porosity** $n$ is the fraction of the total volume that is voids; the **void ratio** $e$ relates voids to solids and is recovered from porosity by $e = n/(1-n)$. Strength is quickly estimated in the field by the **point-load test**, whose index $I_{s(50)}$ correlates with uniaxial compressive strength through a multiplier of roughly 22–24.",
    formulaMatrix: [
      "**Porosity**: $n = \\dfrac{V_v}{V}$  (void volume / total volume).",
      "",
      "**Void ratio**: $e = \\dfrac{V_v}{V_s} = \\dfrac{n}{1-n}$.",
      "",
      "**UCS from point load**: $\\sigma_c \\approx 22\\,I_{s(50)}$.",
    ].join("\n"),
    traps: [
      "**Porosity and void ratio are different.** $n$ is per *total* volume; $e$ is per *solids* — convert with $e=n/(1-n)$.",
      "**Point-load index gives an *estimate* of UCS**, not the UCS itself; apply the ~22 multiplier.",
      "**Keep $n$ as a fraction in the $e$ formula.** Using 20 instead of 0.2 wrecks the ratio.",
    ],
  },
  questions: [
    {
      id: "rock-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A rock sample of total volume $0.5\\ \\text{m}^3$ contains $0.1\\ \\text{m}^3$ of voids. Its porosity is:",
      options: ["$20\\%$", "$25\\%$", "$50\\%$", "$10\\%$"],
      answer: 0,
      solution: {
        given: "$V_v = 0.1\\ \\text{m}^3$, $V = 0.5\\ \\text{m}^3$.",
        derivation: "$$n = \\frac{V_v}{V} = \\frac{0.1}{0.5} = 0.20 = 20\\%$$",
        target: "**Correct option: $20\\%$.** $25\\%$ is the void ratio (voids/solids), a different quantity.",
      },
    },
    {
      id: "rock-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "For a rock of porosity $20\\%$, the void ratio is ______. (Round off to two decimal places.)",
      natAnswer: 0.25,
      acceptedRange: [0.24, 0.26],
      solution: {
        given: "$n = 0.20$.",
        derivation: "$$e = \\frac{n}{1-n} = \\frac{0.20}{0.80} = 0.25$$",
        target: "**Target: 0.25 | Accepted range: 0.24 to 0.26.**",
      },
    },
    {
      id: "rock-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A point-load test gives $I_{s(50)} = 4\\ \\text{MPa}$. Using $\\sigma_c \\approx 22\\,I_{s(50)}$, the estimated uniaxial compressive strength is ______ MPa. (Round off to two decimal places.)",
      natAnswer: 88,
      acceptedRange: [85, 91],
      unit: "MPa",
      solution: {
        given: "$I_{s(50)} = 4\\ \\text{MPa}$.",
        derivation: "$$\\sigma_c \\approx 22\\times I_{s(50)} = 22\\times 4 = 88\\ \\text{MPa}$$",
        target: "**Target: 88.00 MPa | Accepted range: 85 to 91.** This classifies as a strong rock.",
      },
    },
  ],
};

const gmRmrQ: LearnTopic = {
  slug: "gm-rmr-q",
  subject: "Geomechanics & Ground Control",
  title: "Rock Mass Classification (RMR, Q)",
  tier: "subject",
  blurb:
    "Adding up the six RMR ratings and multiplying the six Q-system parameters to score a rock mass for support design.",
  module: {
    principle:
      "Empirical classifications turn observations into a design score. **Bieniawski's RMR** *sums* ratings for six parameters (UCS, RQD, joint spacing, joint condition, groundwater) and applies an orientation **adjustment**, giving a value out of 100 that maps to rock-mass classes. **Barton's Q-system** *multiplies* six parameters as three quotients: block size ($RQD/J_n$), inter-block shear ($J_r/J_a$) and active stress ($J_w/SRF$).",
    formulaMatrix: [
      "**RMR**: $RMR = \\sum(\\text{6 parameter ratings}) + \\text{orientation adjustment}$ (the adjustment is usually negative).",
      "",
      "**Q-system**: $$Q = \\frac{RQD}{J_n}\\times\\frac{J_r}{J_a}\\times\\frac{J_w}{SRF}$$",
      "$J_n$ = joint-set number, $J_r$ = roughness, $J_a$ = alteration, $J_w$ = water, $SRF$ = stress reduction factor.",
    ].join("\n"),
    traps: [
      "**RMR adds, Q multiplies.** Mixing the operations is the most common error.",
      "**The RMR orientation adjustment is subtracted** for unfavourable discontinuities — don't drop it.",
      "**Q's three quotients each have a meaning** (block size, shear, stress); keep numerator/denominator pairs together.",
    ],
  },
  questions: [
    {
      id: "rmr-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Parameter ratings are $15, 10, 20, 20, 10$ with an orientation adjustment of $-5$. The RMR is:",
      options: ["$70$", "$75$", "$65$", "$80$"],
      answer: 0,
      solution: {
        given: "Ratings $15+10+20+20+10$, adjustment $-5$.",
        derivation: "$$RMR = (15+10+20+20+10) - 5 = 75 - 5 = 70$$",
        target: "**Correct option: $70$.** $75$ forgets the orientation adjustment.",
      },
    },
    {
      id: "rmr-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A rock mass has parameter ratings $12, 13, 20, 25, 15$ and an orientation adjustment of $-10$. Its RMR is ______. (Round off to the nearest whole number.)",
      natAnswer: 75,
      acceptedRange: [74, 76],
      solution: {
        given: "Ratings $12+13+20+25+15 = 85$, adjustment $-10$.",
        derivation: "$$RMR = 85 - 10 = 75$$",
        target: "**Target: 75 | Accepted range: 74 to 76** (Good rock, Class II).",
      },
    },
    {
      id: "rmr-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For $RQD = 75$, $J_n = 9$, $J_r = 2$, $J_a = 1$, $J_w = 1$, $SRF = 2.5$, the Q-value is ______. (Round off to two decimal places.)",
      natAnswer: 6.67,
      acceptedRange: [6.4, 6.9],
      solution: {
        given: "$RQD=75$, $J_n=9$, $J_r=2$, $J_a=1$, $J_w=1$, $SRF=2.5$.",
        derivation:
          "$$Q = \\frac{75}{9}\\times\\frac{2}{1}\\times\\frac{1}{2.5} = 8.333\\times 2\\times 0.4 = 6.67$$",
        target: "**Target: 6.67 | Accepted range: 6.40 to 6.90** (Fair rock).",
      },
    },
  ],
};

const gmSubsidence: LearnTopic = {
  slug: "gm-subsidence",
  subject: "Geomechanics & Ground Control",
  title: "Subsidence",
  tier: "subject",
  blurb:
    "Maximum surface subsidence from the subsidence factor, and the critical width set by the angle of draw.",
  module: {
    principle:
      "Extracting a seam lets the overburden sag, producing surface **subsidence**. The **maximum subsidence** over a fully-worked (critical or super-critical) area is the **subsidence factor** $a$ times the extracted thickness $m$. The subsidence trough spreads beyond the workings by the **angle of draw**, so the surface area affected — and the width needed for full subsidence — depends on the depth and that angle.",
    formulaMatrix: [
      "**Maximum subsidence**: $S_{max} = a\\,m$  ($a$ = subsidence factor, $m$ = extracted thickness).",
      "",
      "**Critical width** (for full subsidence at depth $H$, angle of draw $\\gamma$): $W = 2H\\tan\\gamma$.",
    ].join("\n"),
    traps: [
      "**Subsidence factor $a < 1$** (typically 0.5–0.9 with caving); $S_{max}$ is a fraction of the seam thickness, never more.",
      "**Angle of draw is measured from the vertical.** The trough extends $H\\tan\\gamma$ each side of the panel edge.",
      "**$S_{max}$ needs a critical (fully-worked) area.** Sub-critical panels subside less than $a\\,m$.",
    ],
  },
  questions: [
    {
      id: "sub-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A $2\\ \\text{m}$ thick seam is extracted with a subsidence factor of $0.6$. The maximum surface subsidence is:",
      options: ["$1.2\\ \\text{m}$", "$0.6\\ \\text{m}$", "$2.0\\ \\text{m}$", "$3.33\\ \\text{m}$"],
      answer: 0,
      solution: {
        given: "$a = 0.6$, $m = 2\\ \\text{m}$.",
        derivation: "$$S_{max} = a\\,m = 0.6\\times 2 = 1.2\\ \\text{m}$$",
        target: "**Correct option: $1.2\\ \\text{m}$.** Subsidence is a fraction of the extracted thickness.",
      },
    },
    {
      id: "sub-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A $1.8\\ \\text{m}$ seam produces a maximum subsidence of $0.9\\ \\text{m}$. The subsidence factor is ______. (Round off to two decimal places.)",
      natAnswer: 0.5,
      acceptedRange: [0.48, 0.52],
      solution: {
        given: "$S_{max} = 0.9\\ \\text{m}$, $m = 1.8\\ \\text{m}$.",
        derivation: "$$a = \\frac{S_{max}}{m} = \\frac{0.9}{1.8} = 0.50$$",
        target: "**Target: 0.50 | Accepted range: 0.48 to 0.52.**",
      },
    },
    {
      id: "sub-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For a panel at depth $H = 200\\ \\text{m}$ with an angle of draw $\\gamma = 35^{\\circ}$, the critical width for full subsidence is ______ m. (Round off to two decimal places.)",
      natAnswer: 280.08,
      acceptedRange: [277, 283],
      unit: "m",
      solution: {
        given: "$H = 200\\ \\text{m}$, $\\gamma = 35^{\\circ}$ ($\\tan 35^{\\circ} = 0.7002$).",
        derivation: "$$W = 2H\\tan\\gamma = 2\\times 200\\times 0.7002 = 280.08\\ \\text{m}$$",
        target: "**Target: 280.08 m | Accepted range: 277 to 283.**",
      },
    },
  ],
};

const gmSupportDesign: LearnTopic = {
  slug: "gm-support-design",
  subject: "Geomechanics & Ground Control",
  title: "Design of Supports",
  tier: "subject",
  blurb:
    "Support pressure from the loosened rock height, the roof load it implies, and the number of rock bolts to carry it safely.",
  module: {
    principle:
      "An excavation's roof must carry a **loosened (loading) height** $H_p$ of rock above it. The **support pressure** is the weight of that column per unit area, $\\gamma H_p$. Multiplied by the roof area it gives the total **roof load**, which the support system — here **rock bolts** — must hold with an adequate **factor of safety**. The number of bolts is the factored load divided by the capacity of one bolt.",
    formulaMatrix: [
      "**Support pressure**: $p = \\gamma\\,H_p$  ($\\gamma$ = rock unit weight, $H_p$ = loosened height).",
      "",
      "**Roof load**: $F = p\\times A$  ($A$ = roof area supported).",
      "",
      "**Number of bolts**: $N = \\dfrac{F\\times FS}{\\text{capacity per bolt}}$.",
    ].join("\n"),
    traps: [
      "**Support pressure is $\\gamma H_p$**, the weight of the loosened column — not the full overburden stress.",
      "**Apply the factor of safety to the load before dividing** by bolt capacity.",
      "**Round bolt numbers up.** A fractional bolt still means installing a whole one.",
    ],
  },
  questions: [
    {
      id: "sup-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A loosened rock height of $2\\ \\text{m}$ (unit weight $25\\ \\text{kN/m}^3$) bears on the roof. The support pressure is:",
      options: ["$50\\ \\text{kPa}$", "$12.5\\ \\text{kPa}$", "$100\\ \\text{kPa}$", "$25\\ \\text{kPa}$"],
      answer: 0,
      solution: {
        given: "$\\gamma = 25\\ \\text{kN/m}^3$, $H_p = 2\\ \\text{m}$.",
        derivation: "$$p = \\gamma\\,H_p = 25\\times 2 = 50\\ \\text{kPa}$$",
        target: "**Correct option: $50\\ \\text{kPa}$.**",
      },
    },
    {
      id: "sup-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A support pressure of $50\\ \\text{kPa}$ acts over a roof area of $12\\ \\text{m}^2$. The total roof load is ______ kN. (Round off to the nearest whole number.)",
      natAnswer: 600,
      acceptedRange: [590, 610],
      unit: "kN",
      solution: {
        given: "$p = 50\\ \\text{kPa}$, $A = 12\\ \\text{m}^2$.",
        derivation: "$$F = p\\times A = 50\\times 12 = 600\\ \\text{kN}$$",
        target: "**Target: 600 kN | Accepted range: 590 to 610.**",
      },
    },
    {
      id: "sup-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "The $600\\ \\text{kN}$ roof load is to be held by rock bolts of capacity $100\\ \\text{kN}$ each, with a factor of safety of $2$. The number of bolts required is ______. (Round off to the nearest whole number.)",
      natAnswer: 12,
      acceptedRange: [11, 13],
      solution: {
        given: "$F = 600\\ \\text{kN}$, capacity $= 100\\ \\text{kN}$, $FS = 2$.",
        derivation: "$$N = \\frac{F\\times FS}{\\text{capacity}} = \\frac{600\\times 2}{100} = 12\\ \\text{bolts}$$",
        target: "**Target: 12 | Accepted range: 11 to 13.**",
      },
    },
  ],
};

const gmRockBursts: LearnTopic = {
  slug: "gm-rock-bursts",
  subject: "Geomechanics & Ground Control",
  title: "Rock Bursts & Coal Bumps",
  tier: "premium",
  blurb:
    "The strain energy stored in highly stressed rock — the reservoir whose sudden release drives a rock burst.",
  module: {
    principle:
      "A **rock burst** (or coal bump) is the violent, sudden failure of highly stressed rock as stored **elastic strain energy** is released. The energy stored per unit volume under a uniaxial stress $\\sigma$ in a rock of Young's modulus $E$ is $u = \\sigma^2/(2E)$. Stiff, strong, brittle rock at high stress stores the most — and is the most burst-prone. The total reservoir is this density times the stressed volume.",
    formulaMatrix: [
      "**Strain energy density**: $$u = \\frac{\\sigma^2}{2E}\\quad[\\text{J/m}^3]$$",
      "",
      "**Total stored energy**: $U = u\\times V$  ($V$ = stressed volume).",
      "",
      "$\\sigma$ in Pa, $E$ in Pa ⇒ $u$ in J/m³.",
    ].join("\n"),
    traps: [
      "**Stress is squared, modulus is in the denominator** (×2). Higher stress ⇒ much more stored energy; stiffer rock ⇒ less per unit stress.",
      "**Keep units in Pa.** $50\\ \\text{MPa} = 50\\times10^6\\ \\text{Pa}$, $50\\ \\text{GPa} = 50\\times10^9\\ \\text{Pa}$.",
      "**Energy *density* vs total energy.** Multiply by the volume only for the total reservoir.",
    ],
  },
  questions: [
    {
      id: "burst-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Rock at a stress of $50\\ \\text{MPa}$ has $E = 50\\ \\text{GPa}$. The stored strain energy density is:",
      options: ["$25\\ \\text{kJ/m}^3$", "$50\\ \\text{kJ/m}^3$", "$12.5\\ \\text{kJ/m}^3$", "$2.5\\ \\text{kJ/m}^3$"],
      answer: 0,
      solution: {
        given: "$\\sigma = 50\\times10^6\\ \\text{Pa}$, $E = 50\\times10^9\\ \\text{Pa}$.",
        derivation:
          "$$u = \\frac{\\sigma^2}{2E} = \\frac{(50\\times10^6)^2}{2\\times 50\\times10^9} = \\frac{2.5\\times10^{15}}{1\\times10^{11}} = 25000\\ \\text{J/m}^3 = 25\\ \\text{kJ/m}^3$$",
        target: "**Correct option: $25\\ \\text{kJ/m}^3$.**",
      },
    },
    {
      id: "burst-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Rock at $\\sigma = 80\\ \\text{MPa}$ with $E = 40\\ \\text{GPa}$ stores a strain energy density of ______ kJ/m³. (Round off to two decimal places.)",
      natAnswer: 80,
      acceptedRange: [78, 82],
      unit: "kJ/m³",
      solution: {
        given: "$\\sigma = 80\\times10^6\\ \\text{Pa}$, $E = 40\\times10^9\\ \\text{Pa}$.",
        derivation:
          "$$u = \\frac{(80\\times10^6)^2}{2\\times 40\\times10^9} = \\frac{6.4\\times10^{15}}{8\\times10^{10}} = 80000\\ \\text{J/m}^3 = 80\\ \\text{kJ/m}^3$$",
        target: "**Target: 80.00 kJ/m³ | Accepted range: 78 to 82.**",
      },
    },
    {
      id: "burst-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "If that rock ($u = 80\\ \\text{kJ/m}^3$) occupies a stressed volume of $10\\ \\text{m}^3$, the total stored strain energy is ______ kJ. (Round off to the nearest whole number.)",
      natAnswer: 800,
      acceptedRange: [785, 815],
      unit: "kJ",
      solution: {
        given: "$u = 80\\ \\text{kJ/m}^3$, $V = 10\\ \\text{m}^3$.",
        derivation: "$$U = u\\times V = 80\\times 10 = 800\\ \\text{kJ}$$",
        target: "**Target: 800 kJ | Accepted range: 785 to 815.** This is the energy available to drive a burst.",
      },
    },
  ],
};

const gmGroundVibrations: LearnTopic = {
  slug: "gm-ground-vibrations",
  subject: "Geomechanics & Ground Control",
  title: "Ground Vibrations",
  tier: "premium",
  blurb:
    "Scaled distance and the peak particle velocity (PPV) prediction that keeps blast vibrations within safe limits.",
  module: {
    principle:
      "Blasting radiates ground vibrations whose severity is judged by the **peak particle velocity (PPV)**. Field data collapse onto a single curve when plotted against the **scaled distance** — the distance $D$ divided by the square root of the **maximum charge per delay** $W$. The USBM-type prediction is $PPV = k\\,(D/\\sqrt{W})^{-\\beta}$. Re-arranged, it sets the **maximum charge per delay** that keeps PPV below a damage threshold at a given distance.",
    formulaMatrix: [
      "**Scaled distance**: $SD = \\dfrac{D}{\\sqrt{W}}$  ($D$ = distance, $W$ = charge per delay).",
      "",
      "**PPV prediction**: $PPV = k\\,(SD)^{-\\beta} = k\\left(\\dfrac{D}{\\sqrt{W}}\\right)^{-\\beta}$.",
      "",
      "**Max charge per delay** for an allowable $SD$: $W = \\left(\\dfrac{D}{SD}\\right)^2$.",
    ].join("\n"),
    traps: [
      "**Square-root scaling: $\\sqrt{W}$, not $W$.** Charge-weight enters under a square root for cylindrical charges.",
      "**Larger scaled distance ⇒ lower PPV.** The exponent is negative; bigger $SD$ is safer.",
      "**$W$ is charge *per delay*, not the total round.** Delays are precisely what keep $W$ (and PPV) down.",
    ],
  },
  questions: [
    {
      id: "vib-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A blast uses $25\\ \\text{kg}$ per delay and is recorded $100\\ \\text{m}$ away. The scaled distance is:",
      options: ["$20\\ \\text{m/√kg}$", "$4\\ \\text{m/√kg}$", "$100\\ \\text{m/√kg}$", "$500\\ \\text{m/√kg}$"],
      answer: 0,
      solution: {
        given: "$D = 100\\ \\text{m}$, $W = 25\\ \\text{kg}$.",
        derivation: "$$SD = \\frac{D}{\\sqrt{W}} = \\frac{100}{\\sqrt{25}} = \\frac{100}{5} = 20\\ \\text{m/√kg}$$",
        target: "**Correct option: $20\\ \\text{m/√kg}$.** $4 = \\sqrt{W}/\\,\\ldots$ inverts the ratio.",
      },
    },
    {
      id: "vib-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Using $PPV = 1140\\,(SD)^{-1.6}$ with $SD = 20$, the predicted peak particle velocity is ______ mm/s. (Round off to two decimal places.)",
      natAnswer: 9.45,
      acceptedRange: [9.0, 9.9],
      unit: "mm/s",
      solution: {
        given: "$k = 1140$, $\\beta = 1.6$, $SD = 20$.",
        derivation:
          "$20^{1.6} = 120.66$.\n$$PPV = 1140\\times 20^{-1.6} = \\frac{1140}{120.66} = 9.45\\ \\text{mm/s}$$",
        target: "**Target: 9.45 mm/s | Accepted range: 9.00 to 9.90** (within typical structural limits).",
      },
    },
    {
      id: "vib-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "To keep the scaled distance at $25\\ \\text{m/√kg}$ for a structure $50\\ \\text{m}$ away, the maximum charge per delay is ______ kg. (Round off to two decimal places.)",
      natAnswer: 4,
      acceptedRange: [3.8, 4.2],
      unit: "kg",
      solution: {
        given: "$D = 50\\ \\text{m}$, allowable $SD = 25\\ \\text{m/√kg}$.",
        derivation: "$$W = \\left(\\frac{D}{SD}\\right)^2 = \\left(\\frac{50}{25}\\right)^2 = 2^2 = 4\\ \\text{kg}$$",
        target: "**Target: 4.00 kg | Accepted range: 3.80 to 4.20.** Smaller delays let you blast closer safely.",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 4 — Mining Methods and Machinery                             */
/* ════════════════════════════════════════════════════════════════════ */

const mmBeltConveyor: LearnTopic = {
  slug: "mm-belt-conveyor",
  subject: "Mining Methods & Machinery",
  title: "Belt Conveyor Capacity & Power",
  tier: "free",
  blurb:
    "Volumetric and mass throughput of a troughed belt, and the power needed to lift the carried material.",
  module: {
    principle:
      "A belt conveyor carries a continuous stream of broken rock whose **volumetric capacity** is simply the cross-sectional area of the load profile times the belt speed. Multiplying by the **bulk density** turns that into a mass rate (t/h). The **power** a conveyor draws is the force it must overcome times the belt speed; on an inclined run the dominant term is the rate at which the material is *lifted* — mass flow times gravity times lift height.",
    formulaMatrix: [
      "**Volumetric capacity**: $Q_v = A\\,v$  $[\\text{m}^3/\\text{s}]$  ($A$ = load cross-section, $v$ = belt speed).",
      "",
      "**Mass capacity**: $Q_m = A\\,v\\,\\rho$  $[\\text{kg/s}]$; in tonnes per hour $Q_m\\,[\\text{t/h}] = 3.6\\,A\\,v\\,\\rho$ (with $\\rho$ in $\\text{kg/m}^3$).",
      "",
      "**Lift power**: $P = \\dot{m}\\,g\\,H$  ($\\dot{m}$ = mass flow $[\\text{kg/s}]$, $H$ = lift height).",
    ].join("\n"),
    traps: [
      "**The 3.6 factor for t/h.** $\\text{kg/s}\\times3600/1000 = 3.6$; forgetting it leaves the answer 3.6× too small.",
      "**Bulk density, not solid density.** Conveyor capacity uses the loose bulk density of broken rock, which is well below the intact density.",
      "**Lift power uses vertical height $H$, not belt length $L$.** On an incline, only the rise lifts the material.",
    ],
  },
  questions: [
    {
      id: "belt-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A belt carries a load cross-section of $0.2\\ \\text{m}^2$ at a speed of $2.5\\ \\text{m/s}$. Its volumetric capacity is:",
      options: ["$0.50\\ \\text{m}^3/\\text{s}$", "$0.08\\ \\text{m}^3/\\text{s}$", "$5.0\\ \\text{m}^3/\\text{s}$", "$1.25\\ \\text{m}^3/\\text{s}$"],
      answer: 0,
      solution: {
        given: "$A = 0.2\\ \\text{m}^2$, $v = 2.5\\ \\text{m/s}$.",
        derivation: "$$Q_v = A\\,v = 0.2\\times 2.5 = 0.50\\ \\text{m}^3/\\text{s}$$",
        target: "**Correct option: $0.50\\ \\text{m}^3/\\text{s}$.** $0.08$ divides instead of multiplies; $1.25$ is $v/A$.",
      },
    },
    {
      id: "belt-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A belt with load cross-section $0.15\\ \\text{m}^2$ runs at $2\\ \\text{m/s}$ carrying ore of bulk density $1600\\ \\text{kg/m}^3$. Its mass capacity is ______ t/h. (Round off to the nearest whole number.)",
      natAnswer: 1728,
      acceptedRange: [1700, 1750],
      unit: "t/h",
      solution: {
        given: "$A = 0.15\\ \\text{m}^2$, $v = 2\\ \\text{m/s}$, $\\rho = 1600\\ \\text{kg/m}^3$.",
        derivation:
          "$$Q_m = 3.6\\,A\\,v\\,\\rho = 3.6\\times 0.15\\times 2\\times 1600 = 1728\\ \\text{t/h}$$",
        target: "**Target: 1728 t/h | Accepted range: 1700 to 1750.**",
      },
    },
    {
      id: "belt-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "An inclined conveyor lifts ore at a mass flow rate of $100\\ \\text{kg/s}$ through a vertical height of $20\\ \\text{m}$. The power required to lift the material is ______ kW. (Round off to two decimal places.)",
      natAnswer: 19.62,
      acceptedRange: [19.0, 20.2],
      unit: "kW",
      solution: {
        given: "$\\dot{m} = 100\\ \\text{kg/s}$, $H = 20\\ \\text{m}$, $g = 9.81\\ \\text{m/s}^2$.",
        derivation:
          "$$P = \\dot{m}\\,g\\,H = 100\\times 9.81\\times 20 = 19620\\ \\text{W} = 19.62\\ \\text{kW}$$",
        target: "**Target: 19.62 kW | Accepted range: 19.00 to 20.20.** Only the vertical lift counts.",
      },
    },
  ],
};

const mmHaulageRope: LearnTopic = {
  slug: "mm-haulage-rope",
  subject: "Mining Methods & Machinery",
  title: "Haulage & Rope Pull",
  tier: "subject",
  blurb:
    "The pull a rope haulage must exert to drag loaded cars up a gradient against gravity and track friction — and the power it costs.",
  module: {
    principle:
      "On a rope-haulage incline, the rope must overcome two resistances: the **gravity component** of the load acting down the slope, $W\\sin\\theta$, and the **track friction**, $\\mu W\\cos\\theta$. Their sum is the rope pull $T$. Multiply by the haulage speed for the **power**, and by the number of cars in a trip for the full set.",
    formulaMatrix: [
      "**Rope pull (hauling up an incline)**: $$T = W(\\sin\\theta + \\mu\\cos\\theta)$$ $W$ = car weight, $\\theta$ = gradient angle, $\\mu$ = friction (track) coefficient.",
      "",
      "**Power**: $P = T\\,v$  ($v$ = haulage speed). For $N$ cars: $T_{set} = N\\,T$, $P = T_{set}\\,v$.",
    ].join("\n"),
    traps: [
      "**Gravity term is $\\sin\\theta$, friction term is $\\cos\\theta$.** Swapping them is wrong; for small gradients friction can rival gravity.",
      "**Hauling down reduces the pull.** Going down-grade the gravity term *assists*, so $T = W(\\mu\\cos\\theta - \\sin\\theta)$ — sign flips.",
      "**Multiply by car count before power.** Power is the whole trip's pull times speed, not a single car's.",
    ],
  },
  questions: [
    {
      id: "haul-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A loaded car weighing $20\\ \\text{kN}$ stands on an incline of $15^{\\circ}$. The gravity component along the slope is:",
      options: ["$5.18\\ \\text{kN}$", "$19.32\\ \\text{kN}$", "$20.0\\ \\text{kN}$", "$10.0\\ \\text{kN}$"],
      answer: 0,
      solution: {
        given: "$W = 20\\ \\text{kN}$, $\\theta = 15^{\\circ}$ ($\\sin 15^{\\circ} = 0.2588$).",
        derivation: "$$W\\sin\\theta = 20\\times 0.2588 = 5.18\\ \\text{kN}$$",
        target: "**Correct option: $5.18\\ \\text{kN}$.** $19.32 = W\\cos15^{\\circ}$ is the normal component.",
      },
    },
    {
      id: "haul-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A car weighing $50\\ \\text{kN}$ is hauled up a $10^{\\circ}$ incline with a track-friction coefficient $\\mu = 0.02$. The rope pull required is ______ kN. (Round off to two decimal places.)",
      natAnswer: 9.67,
      acceptedRange: [9.3, 10.0],
      unit: "kN",
      solution: {
        given: "$W = 50\\ \\text{kN}$, $\\theta = 10^{\\circ}$, $\\mu = 0.02$ ($\\sin10^{\\circ}=0.1736$, $\\cos10^{\\circ}=0.9848$).",
        derivation:
          "$$T = W(\\sin\\theta + \\mu\\cos\\theta) = 50\\,(0.1736 + 0.02\\times 0.9848) = 50\\times 0.1933 = 9.67\\ \\text{kN}$$",
        target: "**Target: 9.67 kN | Accepted range: 9.30 to 10.00.**",
      },
    },
    {
      id: "haul-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A trip of $10$ such cars (each needing $9.67\\ \\text{kN}$) is hauled at $2\\ \\text{m/s}$. The haulage power required is ______ kW. (Round off to one decimal place.)",
      natAnswer: 193.4,
      acceptedRange: [188, 199],
      unit: "kW",
      solution: {
        given: "$N = 10$, $T = 9.67\\ \\text{kN}$ per car, $v = 2\\ \\text{m/s}$.",
        derivation:
          "$$T_{set} = N\\,T = 10\\times 9.67 = 96.7\\ \\text{kN}$$\n$$P = T_{set}\\,v = 96.7\\times 2 = 193.4\\ \\text{kW}$$",
        target: "**Target: 193.4 kW | Accepted range: 188.0 to 199.0.**",
      },
    },
  ],
};

const mmHoisting: LearnTopic = {
  slug: "mm-hoisting",
  subject: "Mining Methods & Machinery",
  title: "Mine Hoisting",
  tier: "subject",
  blurb:
    "Static rope load and motor power for a winding system — including the extra force demanded during acceleration.",
  module: {
    principle:
      "A hoist raises a **skip or cage** (its own dead weight plus the payload) up the shaft on a rope wound over a drum. At steady speed the rope carries just the **static weight** of the suspended load; while **accelerating**, it must also supply the inertia force $m\\,a$, so the effective force rises to $m(g+a)$. The **motor power** is this force times the rope speed, divided by the drive **efficiency**.",
    formulaMatrix: [
      "**Static rope load**: $F = (m_{payload} + m_{skip})\\,g$.",
      "",
      "**Effective force while accelerating** at $a$: $F = m\\,(g + a)$.",
      "",
      "**Motor power**: $$P = \\frac{F\\,v}{\\eta}$$ $v$ = rope (hoisting) speed, $\\eta$ = efficiency.",
    ].join("\n"),
    traps: [
      "**Include the skip/cage dead weight.** The rope lifts payload *and* conveyance; using payload alone under-sizes the motor.",
      "**Acceleration adds $m\\,a$, giving $m(g+a)$**, not $mg$. Forgetting it under-estimates the peak power.",
      "**Divide by efficiency for motor power.** $P = Fv/\\eta$; the output $Fv$ is less than the motor's input.",
    ],
  },
  questions: [
    {
      id: "hoist-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A skip of $4000\\ \\text{kg}$ carries a payload of $8000\\ \\text{kg}$. The static rope load (at steady speed) is approximately:",
      options: ["$117.72\\ \\text{kN}$", "$78.48\\ \\text{kN}$", "$39.24\\ \\text{kN}$", "$120.0\\ \\text{kN}$"],
      answer: 0,
      solution: {
        given: "Total mass $m = 8000 + 4000 = 12000\\ \\text{kg}$, $g = 9.81\\ \\text{m/s}^2$.",
        derivation: "$$F = m\\,g = 12000\\times 9.81 = 117720\\ \\text{N} = 117.72\\ \\text{kN}$$",
        target: "**Correct option: $117.72\\ \\text{kN}$.** $78.48$ uses payload only; $120$ uses $g=10$.",
      },
    },
    {
      id: "hoist-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "The same load ($117.72\\ \\text{kN}$) is hoisted at $10\\ \\text{m/s}$ through a drive of efficiency $0.90$ at steady speed. The motor power is ______ kW. (Round off to the nearest whole number.)",
      natAnswer: 1308,
      acceptedRange: [1290, 1330],
      unit: "kW",
      solution: {
        given: "$F = 117.72\\ \\text{kN}$, $v = 10\\ \\text{m/s}$, $\\eta = 0.90$.",
        derivation: "$$P = \\frac{F\\,v}{\\eta} = \\frac{117.72\\times 10}{0.90} = 1308\\ \\text{kW}$$",
        target: "**Target: 1308 kW | Accepted range: 1290 to 1330.**",
      },
    },
    {
      id: "hoist-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "During start-up the $12000\\ \\text{kg}$ load is accelerated at $1\\ \\text{m/s}^2$ while moving at $10\\ \\text{m/s}$ ($\\eta = 0.90$). The peak motor power is ______ kW. (Round off to two decimal places.)",
      natAnswer: 1441.33,
      acceptedRange: [1420, 1465],
      unit: "kW",
      solution: {
        given: "$m = 12000\\ \\text{kg}$, $a = 1\\ \\text{m/s}^2$, $v = 10\\ \\text{m/s}$, $\\eta = 0.90$.",
        derivation:
          "Effective force: $F = m(g+a) = 12000\\times(9.81+1) = 12000\\times 10.81 = 129720\\ \\text{N} = 129.72\\ \\text{kN}$.\n$$P = \\frac{F\\,v}{\\eta} = \\frac{129.72\\times 10}{0.90} = 1441.33\\ \\text{kW}$$",
        target: "**Target: 1441.33 kW | Accepted range: 1420 to 1465.** Acceleration raises the demand by $m\\,a\\,v/\\eta$.",
      },
    },
  ],
};

const mmPumpsComminution: LearnTopic = {
  slug: "mm-pumps-comminution",
  subject: "Mining Methods & Machinery",
  title: "Pumps & Comminution",
  tier: "premium",
  blurb:
    "Dewatering-pump power from flow and head, and the grinding energy predicted by Bond's law of comminution.",
  module: {
    principle:
      "A mine **dewatering pump** raises water at a flow rate $Q$ against a total **head** $H$; the hydraulic power is $\\rho g Q H$, and the shaft (motor) power is that divided by the pump **efficiency**. Size reduction — **comminution** — is governed empirically by **Bond's law**, which says the work per tonne is proportional to the difference of the reciprocal square-roots of the product and feed sizes, scaled by the material's **work index** $W_i$.",
    formulaMatrix: [
      "**Pump (hydraulic) power**: $P_h = \\rho g Q H$;  **shaft power**: $P = \\dfrac{\\rho g Q H}{\\eta}$.",
      "$\\rho$ = fluid density, $Q$ = flow $[\\text{m}^3/\\text{s}]$, $H$ = total head $[\\text{m}]$, $\\eta$ = efficiency.",
      "",
      "**Bond's law** (work index $W_i$ in kWh/t, sizes in µm):",
      "$$W = 10\\,W_i\\left(\\frac{1}{\\sqrt{P_{80}}} - \\frac{1}{\\sqrt{F_{80}}}\\right)\\ \\text{kWh/t}$$",
      "$F_{80}$, $P_{80}$ = 80%-passing feed and product sizes.",
    ].join("\n"),
    traps: [
      "**Divide hydraulic power by efficiency for shaft power.** $\\rho g Q H$ is the useful output; the motor draws more.",
      "**Bond uses $1/\\sqrt{P_{80}} - 1/\\sqrt{F_{80}}$** (product minus feed reciprocals). Reversing the order flips the sign.",
      "**Keep $Q$ in m³/s and $H$ in m** so $\\rho g Q H$ comes out in watts; mixing L/s or m³/h needs conversion first.",
    ],
  },
  questions: [
    {
      id: "pump-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A pump delivers $0.05\\ \\text{m}^3/\\text{s}$ of water against a total head of $100\\ \\text{m}$. The hydraulic power (ideal) is:",
      options: ["$49.05\\ \\text{kW}$", "$4.91\\ \\text{kW}$", "$490.5\\ \\text{kW}$", "$98.1\\ \\text{kW}$"],
      answer: 0,
      solution: {
        given: "$Q = 0.05\\ \\text{m}^3/\\text{s}$, $H = 100\\ \\text{m}$, $\\rho = 1000\\ \\text{kg/m}^3$.",
        derivation:
          "$$P_h = \\rho g Q H = 1000\\times 9.81\\times 0.05\\times 100 = 49050\\ \\text{W} = 49.05\\ \\text{kW}$$",
        target: "**Correct option: $49.05\\ \\text{kW}$.** The others are decimal-place slips.",
      },
    },
    {
      id: "pump-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "If that pump ($P_h = 49.05\\ \\text{kW}$) has an efficiency of $0.70$, the shaft power required is ______ kW. (Round off to two decimal places.)",
      natAnswer: 70.07,
      acceptedRange: [68, 72],
      unit: "kW",
      solution: {
        given: "$P_h = 49.05\\ \\text{kW}$, $\\eta = 0.70$.",
        derivation: "$$P = \\frac{P_h}{\\eta} = \\frac{49.05}{0.70} = 70.07\\ \\text{kW}$$",
        target: "**Target: 70.07 kW | Accepted range: 68.00 to 72.00.**",
      },
    },
    {
      id: "comm-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A mill reduces ore from $F_{80} = 10000\\ \\mu\\text{m}$ to $P_{80} = 100\\ \\mu\\text{m}$. With a Bond work index $W_i = 15\\ \\text{kWh/t}$, the specific grinding energy is ______ kWh/t. (Round off to two decimal places.)",
      natAnswer: 13.5,
      acceptedRange: [13.0, 14.0],
      unit: "kWh/t",
      solution: {
        given: "$W_i = 15\\ \\text{kWh/t}$, $F_{80} = 10000\\ \\mu\\text{m}$, $P_{80} = 100\\ \\mu\\text{m}$.",
        derivation:
          "$$W = 10\\,W_i\\left(\\frac{1}{\\sqrt{P_{80}}} - \\frac{1}{\\sqrt{F_{80}}}\\right) = 10\\times 15\\left(\\frac{1}{10} - \\frac{1}{100}\\right) = 150\\times 0.09 = 13.5\\ \\text{kWh/t}$$",
        target: "**Target: 13.50 kWh/t | Accepted range: 13.00 to 14.00.**",
      },
    },
  ],
};

/* ──────────────────────────────────────────────────────────────────── */
/*  SECTION 4 (fill) — Surface mining, Continuous systems, Bord&Pillar,  */
/*  Longwall, Thick seam, Stoping, Power transmission                    */
/* ──────────────────────────────────────────────────────────────────── */

const mmSurfaceMining: LearnTopic = {
  slug: "mm-surface-mining",
  subject: "Mining Methods & Machinery",
  title: "Surface Mining: Layout & Stripping Ratio",
  tier: "subject",
  blurb:
    "The stripping ratio that decides how much waste must move per tonne of ore — and the break-even ratio that draws the pit limit.",
  module: {
    principle:
      "Surface mining is governed by the **stripping ratio (SR)** — the amount of overburden (waste) that must be removed to win one unit of ore. It can be expressed as volume of waste per tonne of ore or as a tonnage ratio. Mining stays profitable only while the actual SR is below the **break-even stripping ratio (BESR)**, where the value recovered just pays for ore production plus stripping. BESR sets the economic pit limit.",
    formulaMatrix: [
      "**Stripping ratio**: $SR = \\dfrac{\\text{waste removed}}{\\text{ore mined}}$.",
      "",
      "**Break-even stripping ratio**: $$BESR = \\frac{\\text{selling price} - \\text{production cost}}{\\text{stripping cost}}$$",
      "Units must match (e.g. $\\$/\\text{t}$ over $\\$/\\text{m}^3$ ⇒ $\\text{m}^3/\\text{t}$).",
    ].join("\n"),
    traps: [
      "**SR is waste ÷ ore**, not ore ÷ waste — keep the order.",
      "**Mine while actual SR < BESR.** Once the actual ratio exceeds break-even, that block is uneconomic.",
      "**BESR uses *net* value** (price − production cost) on top, stripping cost on the bottom.",
    ],
  },
  questions: [
    {
      id: "sr-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A pit removes $3\\ \\text{Mt}$ of waste to win $1\\ \\text{Mt}$ of ore. The stripping ratio is:",
      options: ["$3$", "$0.33$", "$4$", "$1.5$"],
      answer: 0,
      solution: {
        given: "Waste $= 3\\ \\text{Mt}$, ore $= 1\\ \\text{Mt}$.",
        derivation: "$$SR = \\frac{\\text{waste}}{\\text{ore}} = \\frac{3}{1} = 3$$",
        target: "**Correct option: $3$.** $0.33$ inverts the ratio.",
      },
    },
    {
      id: "sr-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "An operation strips $12\\ \\text{Mm}^3$ of overburden to expose $4\\ \\text{Mt}$ of coal. The overall stripping ratio is ______ m³/t. (Round off to two decimal places.)",
      natAnswer: 3,
      acceptedRange: [2.9, 3.1],
      unit: "m³/t",
      solution: {
        given: "Waste $= 12\\ \\text{Mm}^3$, coal $= 4\\ \\text{Mt}$.",
        derivation: "$$SR = \\frac{12}{4} = 3\\ \\text{m}^3/\\text{t}$$",
        target: "**Target: 3.00 m³/t | Accepted range: 2.90 to 3.10.**",
      },
    },
    {
      id: "sr-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Coal sells for $\\$50/\\text{t}$, costs $\\$20/\\text{t}$ to produce, and stripping costs $\\$5/\\text{m}^3$. The break-even stripping ratio is ______ m³/t. (Round off to two decimal places.)",
      natAnswer: 6,
      acceptedRange: [5.8, 6.2],
      unit: "m³/t",
      solution: {
        given: "Price $= 50$, production $= 20$, stripping $= 5\\ \\$/\\text{m}^3$.",
        derivation: "$$BESR = \\frac{50 - 20}{5} = \\frac{30}{5} = 6\\ \\text{m}^3/\\text{t}$$",
        target: "**Target: 6.00 m³/t | Accepted range: 5.80 to 6.20.** Mine blocks with SR below this.",
      },
    },
  ],
};

const mmContinuousSurface: LearnTopic = {
  slug: "mm-continuous-surface",
  subject: "Mining Methods & Machinery",
  title: "Continuous Surface Mining (BWE Output)",
  tier: "subject",
  blurb:
    "The theoretical output of a bucket-wheel excavator, the effect of fill factor, and converting loose volume to solid in-situ rock.",
  module: {
    principle:
      "Continuous surface systems such as the **bucket-wheel excavator (BWE)** dig without interruption. Their **theoretical output** is the number of bucket discharges per minute times the bucket volume — converted to per hour. Real output is reduced by a **fill factor**. Because dug material bulks up, the loose volume divided by the **swell (bulking) factor** gives the equivalent **solid (bank) volume** actually removed from the face.",
    formulaMatrix: [
      "**Loose output**: $Q_{loose} = n\\times V_b\\times f\\times 60\\ [\\text{m}^3/\\text{h}]$",
      "$n$ = buckets/min, $V_b$ = bucket volume, $f$ = fill factor.",
      "",
      "**Solid (bank) output**: $Q_{solid} = \\dfrac{Q_{loose}}{\\text{swell factor}}$.",
    ].join("\n"),
    traps: [
      "**Multiply by 60** to go from per-minute to per-hour output.",
      "**Fill factor reduces output**; it's ≤ 1.",
      "**Loose vs solid:** divide loose volume by the swell factor (>1) to get the in-situ bank volume.",
    ],
  },
  questions: [
    {
      id: "bwe-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A BWE discharges $30$ buckets per minute, each $0.5\\ \\text{m}^3$ (fill factor $1.0$). Its theoretical output is:",
      options: ["$900\\ \\text{m}^3/\\text{h}$", "$15\\ \\text{m}^3/\\text{h}$", "$54000\\ \\text{m}^3/\\text{h}$", "$90\\ \\text{m}^3/\\text{h}$"],
      answer: 0,
      solution: {
        given: "$n = 30$/min, $V_b = 0.5\\ \\text{m}^3$, $f = 1$.",
        derivation: "$$Q = 30\\times 0.5\\times 60 = 900\\ \\text{m}^3/\\text{h}$$",
        target: "**Correct option: $900\\ \\text{m}^3/\\text{h}$.** $15$ forgot the ×60.",
      },
    },
    {
      id: "bwe-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A BWE makes $40$ discharges/min of $0.6\\ \\text{m}^3$ buckets at a fill factor of $0.9$. Its loose output is ______ m³/h. (Round off to the nearest whole number.)",
      natAnswer: 1296,
      acceptedRange: [1280, 1310],
      unit: "m³/h",
      solution: {
        given: "$n = 40$, $V_b = 0.6$, $f = 0.9$.",
        derivation: "$$Q_{loose} = 40\\times 0.6\\times 0.9\\times 60 = 1296\\ \\text{m}^3/\\text{h}$$",
        target: "**Target: 1296 m³/h | Accepted range: 1280 to 1310.**",
      },
    },
    {
      id: "bwe-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "If that loose output of $1296\\ \\text{m}^3/\\text{h}$ corresponds to a swell factor of $1.2$, the solid (bank) output is ______ m³/h. (Round off to the nearest whole number.)",
      natAnswer: 1080,
      acceptedRange: [1060, 1100],
      unit: "m³/h",
      solution: {
        given: "$Q_{loose} = 1296\\ \\text{m}^3/\\text{h}$, swell $= 1.2$.",
        derivation: "$$Q_{solid} = \\frac{1296}{1.2} = 1080\\ \\text{m}^3/\\text{h}$$",
        target: "**Target: 1080 m³/h | Accepted range: 1060 to 1100.**",
      },
    },
  ],
};

const mmBordPillar: LearnTopic = {
  slug: "mm-bord-pillar",
  subject: "Mining Methods & Machinery",
  title: "Bord & Pillar Mining (Extraction Ratio)",
  tier: "subject",
  blurb:
    "The fraction of coal won in development from square pillars, and inverting it to size pillars for a target extraction.",
  module: {
    principle:
      "In **bord-and-pillar** development, galleries (bords) are driven leaving **pillars** to support the roof. For square pillars of side $W$ separated by galleries of width $B$, the **extraction ratio** in development is the worked area over the centre-to-centre area: $e = 1 - W^2/(W+B)^2$. Wider galleries (or smaller pillars) raise extraction but reduce pillar strength — the design trade-off.",
    formulaMatrix: [
      "**Extraction ratio** (square pillars): $$e = 1 - \\frac{W^2}{(W+B)^2}$$",
      "$W$ = pillar side, $B$ = gallery width.",
      "",
      "**Pillar size for target $e$**: $\\dfrac{W}{W+B} = \\sqrt{1-e}$.",
    ].join("\n"),
    traps: [
      "**Use centre-to-centre $(W+B)$** in the denominator, not just $W$ or $B$.",
      "**Bigger pillars ⇒ lower extraction**, higher safety. It's a balance, not a maximisation.",
      "**$e$ is the development extraction**; depillaring later recovers more.",
    ],
  },
  questions: [
    {
      id: "bp-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Square pillars of side $20\\ \\text{m}$ are separated by $5\\ \\text{m}$ galleries. The extraction ratio is:",
      options: ["$36\\%$", "$64\\%$", "$20\\%$", "$80\\%$"],
      answer: 0,
      solution: {
        given: "$W = 20\\ \\text{m}$, $B = 5\\ \\text{m}$.",
        derivation: "$$e = 1 - \\frac{20^2}{25^2} = 1 - \\frac{400}{625} = 1 - 0.64 = 0.36 = 36\\%$$",
        target: "**Correct option: $36\\%$.** $64\\%$ is the area left in pillars.",
      },
    },
    {
      id: "bp-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Pillars of side $15\\ \\text{m}$ with $6\\ \\text{m}$ galleries give an extraction ratio of ______ %. (Round off to two decimal places.)",
      natAnswer: 48.98,
      acceptedRange: [48, 50],
      unit: "%",
      solution: {
        given: "$W = 15\\ \\text{m}$, $B = 6\\ \\text{m}$, $(W+B) = 21\\ \\text{m}$.",
        derivation: "$$e = 1 - \\frac{225}{441} = 1 - 0.5102 = 0.4898 = 48.98\\%$$",
        target: "**Target: 48.98 % | Accepted range: 48 to 50.**",
      },
    },
    {
      id: "bp-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For an extraction ratio of $25\\%$ with $4\\ \\text{m}$ galleries, the required pillar side is ______ m. (Round off to two decimal places.)",
      natAnswer: 25.86,
      acceptedRange: [25, 27],
      unit: "m",
      solution: {
        given: "$e = 0.25$, $B = 4\\ \\text{m}$.",
        derivation:
          "$\\dfrac{W}{W+B} = \\sqrt{1-e} = \\sqrt{0.75} = 0.8660$.\n$$W = 0.8660(W+4)\\Rightarrow 0.1340W = 3.464\\Rightarrow W = 25.86\\ \\text{m}$$",
        target: "**Target: 25.86 m | Accepted range: 25 to 27.** Low extraction ⇒ large pillars.",
      },
    },
  ],
};

const mmLongwall: LearnTopic = {
  slug: "mm-longwall",
  subject: "Mining Methods & Machinery",
  title: "Longwall Mining (Face Output)",
  tier: "subject",
  blurb:
    "Output per shearer cycle from face length, web and seam height, scaled up to daily and annual production.",
  module: {
    principle:
      "In **longwall** mining a shearer traverses a long face, taking a slice (the **web**) of the seam each pass. The coal won per cycle is the face length times the web depth times the seam height times the coal density. Multiplying by the number of cycles per day and the working days per year gives daily and annual output. Longwall delivers high, concentrated production.",
    formulaMatrix: [
      "**Output per cycle**: $P_{cycle} = L\\times d\\times h\\times \\rho$",
      "$L$ = face length, $d$ = web depth, $h$ = seam height, $\\rho$ = coal density.",
      "",
      "**Daily**: $P_{day} = P_{cycle}\\times(\\text{cycles/day})$.  **Annual**: $P_{year} = P_{day}\\times(\\text{working days})$.",
    ].join("\n"),
    traps: [
      "**Web is the cut depth per pass**, typically 0.6–1.0 m — not the seam height.",
      "**Multiply by density** to convert mined volume to tonnes.",
      "**Annual output uses working days** (with availability), not 365.",
    ],
  },
  questions: [
    {
      id: "lw-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A $200\\ \\text{m}$ face, $0.8\\ \\text{m}$ web, $2\\ \\text{m}$ seam, coal density $1.4\\ \\text{t/m}^3$. Output per cycle is:",
      options: ["$448\\ \\text{t}$", "$320\\ \\text{t}$", "$640\\ \\text{t}$", "$224\\ \\text{t}$"],
      answer: 0,
      solution: {
        given: "$L=200$, $d=0.8$, $h=2$, $\\rho=1.4$.",
        derivation: "$$P_{cycle} = 200\\times 0.8\\times 2\\times 1.4 = 448\\ \\text{t}$$",
        target: "**Correct option: $448\\ \\text{t}$.** $320$ forgot the density.",
      },
    },
    {
      id: "lw-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "If that face completes $10$ cycles per day, the daily output is ______ tonnes. (Round off to the nearest whole number.)",
      natAnswer: 4480,
      acceptedRange: [4400, 4560],
      unit: "t/day",
      solution: {
        given: "$P_{cycle} = 448\\ \\text{t}$, $10$ cycles/day.",
        derivation: "$$P_{day} = 448\\times 10 = 4480\\ \\text{t/day}$$",
        target: "**Target: 4480 t/day | Accepted range: 4400 to 4560.**",
      },
    },
    {
      id: "lw-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Over $300$ working days, the annual output is ______ Mt. (Round off to two decimal places.)",
      natAnswer: 1.34,
      acceptedRange: [1.3, 1.4],
      unit: "Mt/yr",
      solution: {
        given: "$P_{day} = 4480\\ \\text{t}$, $300$ working days.",
        derivation: "$$P_{year} = 4480\\times 300 = 1\\,344\\,000\\ \\text{t} = 1.34\\ \\text{Mt}$$",
        target: "**Target: 1.34 Mt | Accepted range: 1.30 to 1.40.**",
      },
    },
  ],
};

const mmThickSeam: LearnTopic = {
  slug: "mm-thick-seam",
  subject: "Mining Methods & Machinery",
  title: "Thick-Seam Mining (Recovery)",
  tier: "subject",
  blurb:
    "Recovery as the fraction of seam thickness extracted, in-situ versus recovered tonnage, and top-coal caving recovery.",
  module: {
    principle:
      "Thick seams cannot be taken in one lift, so methods (slicing, top-coal caving) recover only part of the seam. **Recovery** is the extracted thickness (or tonnage) over the in-situ total. In **longwall top-coal caving (LTCC)** the lower slice is cut directly while the top coal is caved and drawn at a lower recovery — the overall recovery combines both.",
    formulaMatrix: [
      "**Recovery**: $R = \\dfrac{\\text{extracted}}{\\text{in-situ}}$ (thickness or tonnage).",
      "",
      "**Recovered tonnage**: $T = (\\text{thickness}\\times\\text{area}\\times\\rho)\\times R$.",
      "",
      "**LTCC effective thickness**: $h_{eff} = h_{cut} + h_{top}\\times R_{top}$.",
    ].join("\n"),
    traps: [
      "**Recovery ≤ 100 %.** A value above 1 means you flipped the ratio.",
      "**In-situ tonnage uses the *full* seam thickness**; apply recovery afterwards.",
      "**In caving, only the top coal carries the reduced recovery** — the cut slice is fully won.",
    ],
  },
  questions: [
    {
      id: "ts-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A method extracts $6\\ \\text{m}$ from an $8\\ \\text{m}$ seam. The recovery is:",
      options: ["$75\\%$", "$80\\%$", "$25\\%$", "$133\\%$"],
      answer: 0,
      solution: {
        given: "Extracted $= 6\\ \\text{m}$, seam $= 8\\ \\text{m}$.",
        derivation: "$$R = \\frac{6}{8} = 0.75 = 75\\%$$",
        target: "**Correct option: $75\\%$.**",
      },
    },
    {
      id: "ts-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A $10\\ \\text{m}$ seam over $100{,}000\\ \\text{m}^2$ (density $1.5\\ \\text{t/m}^3$) is mined at $70\\%$ recovery. The recovered tonnage is ______ Mt. (Round off to two decimal places.)",
      natAnswer: 1.05,
      acceptedRange: [1.0, 1.1],
      unit: "Mt",
      solution: {
        given: "$h=10$, $A=100000$, $\\rho=1.5$, $R=0.7$.",
        derivation:
          "In-situ $= 10\\times 100000\\times 1.5 = 1.5\\times10^6\\ \\text{t}$.\n$$T = 1.5\\times10^6\\times 0.7 = 1.05\\times10^6\\ \\text{t} = 1.05\\ \\text{Mt}$$",
        target: "**Target: 1.05 Mt | Accepted range: 1.00 to 1.10.**",
      },
    },
    {
      id: "ts-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "In LTCC, a $3\\ \\text{m}$ lower slice is cut directly and the $5\\ \\text{m}$ top coal is caved at $80\\%$ recovery (total seam $8\\ \\text{m}$). The overall recovery is ______ %. (Round off to two decimal places.)",
      natAnswer: 87.5,
      acceptedRange: [86, 89],
      unit: "%",
      solution: {
        given: "$h_{cut}=3$, $h_{top}=5$, $R_{top}=0.8$, seam $=8\\ \\text{m}$.",
        derivation:
          "$h_{eff} = 3 + 5\\times 0.8 = 3 + 4 = 7\\ \\text{m}$.\n$$R = \\frac{7}{8} = 0.875 = 87.5\\%$$",
        target: "**Target: 87.5 % | Accepted range: 86 to 89.**",
      },
    },
  ],
};

const mmStoping: LearnTopic = {
  slug: "mm-stoping",
  subject: "Mining Methods & Machinery",
  title: "Underground Metal Mining: Stoping & Dilution",
  tier: "subject",
  blurb:
    "Dilution as the waste fraction of the muck pile, how it lowers the milled grade, and the tonnage that actually reaches the mill.",
  module: {
    principle:
      "In metal **stoping**, some barren wall rock is unavoidably mined with the ore — this is **dilution**, the waste fraction of the total material hauled. Dilution lowers the **mill feed grade** below the in-situ ore grade and increases the tonnage sent to the mill. Controlling dilution is central to stope design economics.",
    formulaMatrix: [
      "**Dilution**: $D = \\dfrac{\\text{waste}}{\\text{ore} + \\text{waste}}\\times 100\\%$.",
      "",
      "**Diluted (mill) grade**: $g_{mill} = g_{ore}(1-D) + g_{waste}\\,D$.",
      "",
      "**Tonnage to mill**: $T_{mill} = \\dfrac{T_{ore}}{1-D}$.",
    ].join("\n"),
    traps: [
      "**Dilution is waste ÷ *total* (ore+waste)**, not waste ÷ ore.",
      "**Waste grade is often ~0**, so diluted grade ≈ $g_{ore}(1-D)$.",
      "**More dilution ⇒ more tonnes milled** at a lower grade — both hurt economics.",
    ],
  },
  questions: [
    {
      id: "st-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A muck pile contains $90\\ \\text{t}$ ore and $10\\ \\text{t}$ waste. The dilution is:",
      options: ["$10\\%$", "$11.1\\%$", "$9\\%$", "$90\\%$"],
      answer: 0,
      solution: {
        given: "Ore $= 90\\ \\text{t}$, waste $= 10\\ \\text{t}$.",
        derivation: "$$D = \\frac{10}{90+10}\\times 100 = 10\\%$$",
        target: "**Correct option: $10\\%$.** $11.1\\%$ uses waste÷ore by mistake.",
      },
    },
    {
      id: "st-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Ore grading $8\\ \\text{g/t}$ Au is diluted $20\\%$ with barren ($0\\ \\text{g/t}$) waste. The mill feed grade is ______ g/t. (Round off to two decimal places.)",
      natAnswer: 6.4,
      acceptedRange: [6.2, 6.6],
      unit: "g/t",
      solution: {
        given: "$g_{ore}=8$, $D=0.20$, $g_{waste}=0$.",
        derivation: "$$g_{mill} = 8(1-0.20) + 0\\times 0.20 = 8\\times 0.8 = 6.4\\ \\text{g/t}$$",
        target: "**Target: 6.40 g/t | Accepted range: 6.20 to 6.60.**",
      },
    },
    {
      id: "st-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "If $1000\\ \\text{t}$ of ore is mined at $20\\%$ dilution, the total tonnage hauled to the mill is ______ t. (Round off to the nearest whole number.)",
      natAnswer: 1250,
      acceptedRange: [1230, 1270],
      unit: "t",
      solution: {
        given: "$T_{ore}=1000\\ \\text{t}$, $D=0.20$.",
        derivation: "$$T_{mill} = \\frac{1000}{1-0.20} = \\frac{1000}{0.8} = 1250\\ \\text{t}$$",
        target: "**Target: 1250 t | Accepted range: 1230 to 1270.**",
      },
    },
  ],
};

const mmPowerTransmission: LearnTopic = {
  slug: "mm-power-transmission",
  subject: "Mining Methods & Machinery",
  title: "Generation & Transmission of Power",
  tier: "premium",
  blurb:
    "Three-phase power from line voltage, current and power factor, the line current it implies, and the I²R transmission loss.",
  module: {
    principle:
      "Mine power is distributed as **three-phase AC**. The real power delivered is $P = \\sqrt{3}\\,V_L I_L\\cos\\phi$, where $V_L$ and $I_L$ are line quantities and $\\cos\\phi$ is the **power factor**. For a known load the **line current** is found by inverting this. Energy lost in transmission is the **$I^2R$ loss** summed over the three conductors — minimised by transmitting at high voltage (low current).",
    formulaMatrix: [
      "**Three-phase power**: $P = \\sqrt{3}\\,V_L I_L\\cos\\phi$.",
      "",
      "**Line current**: $I_L = \\dfrac{P}{\\sqrt{3}\\,V_L\\cos\\phi}$.",
      "",
      "**Transmission loss** (3 conductors): $P_{loss} = 3\\,I_L^2 R$.",
    ].join("\n"),
    traps: [
      "**The $\\sqrt{3}$ is essential** for line quantities in a three-phase system.",
      "**Power factor multiplies** real power; ignoring it overstates $P$.",
      "**Loss scales with current squared** — raising voltage (lowering $I$) cuts losses sharply.",
    ],
  },
  questions: [
    {
      id: "pw-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A $400\\ \\text{V}$ line carries $50\\ \\text{A}$ at power factor $0.8$. The three-phase real power is:",
      options: ["$27.71\\ \\text{kW}$", "$16\\ \\text{kW}$", "$48\\ \\text{kW}$", "$32\\ \\text{kW}$"],
      answer: 0,
      solution: {
        given: "$V_L=400\\ \\text{V}$, $I_L=50\\ \\text{A}$, $\\cos\\phi=0.8$.",
        derivation: "$$P = \\sqrt{3}\\times 400\\times 50\\times 0.8 = 27712\\ \\text{W} \\approx 27.71\\ \\text{kW}$$",
        target: "**Correct option: $27.71\\ \\text{kW}$.** $16\\ \\text{kW}$ drops the $\\sqrt{3}$.",
      },
    },
    {
      id: "pw-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A $100\\ \\text{kW}$ load is fed at $3300\\ \\text{V}$ (line) with power factor $0.85$. The line current is ______ A. (Round off to two decimal places.)",
      natAnswer: 20.58,
      acceptedRange: [20, 21],
      unit: "A",
      solution: {
        given: "$P=100\\ \\text{kW}$, $V_L=3300\\ \\text{V}$, $\\cos\\phi=0.85$.",
        derivation:
          "$$I_L = \\frac{P}{\\sqrt{3}\\,V_L\\cos\\phi} = \\frac{100000}{1.732\\times 3300\\times 0.85} = 20.58\\ \\text{A}$$",
        target: "**Target: 20.58 A | Accepted range: 20 to 21.**",
      },
    },
    {
      id: "pw-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Each of the three conductors has resistance $2\\ \\Omega$ and carries $20.58\\ \\text{A}$. The total transmission loss is ______ kW. (Round off to two decimal places.)",
      natAnswer: 2.54,
      acceptedRange: [2.4, 2.7],
      unit: "kW",
      solution: {
        given: "$I_L=20.58\\ \\text{A}$, $R=2\\ \\Omega$, 3 conductors.",
        derivation:
          "$$P_{loss} = 3\\,I_L^2 R = 3\\times 20.58^2\\times 2 = 2542\\ \\text{W} \\approx 2.54\\ \\text{kW}$$",
        target: "**Target: 2.54 kW | Accepted range: 2.40 to 2.70.** Higher voltage would cut this loss.",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 5 — Mine Ventilation: Airway Resistance & Fan Laws (seed)    */
/* ════════════════════════════════════════════════════════════════════ */

const ventilationResistanceFanLaws: LearnTopic = {
  slug: "ventilation-airway-resistance-fan-laws",
  subject: "Mine Ventilation",
  title: "Airway Resistance & Fan Laws",
  tier: "free",
  blurb:
    "Atkinson's square law, series/parallel airway networks, and the fan laws — the backbone of every mine ventilation numerical.",
  module: {
    principle:
      "Air pushed through a mine airway behaves like a fluid in a rough duct: energy is lost to **wall friction**, and because the flow is fully turbulent the pressure drop rises with the **square** of the airflow (P ∝ Q²) — not linearly like Ohm's law. Atkinson's equation rolls the airway geometry (perimeter, length, cross-sectional area) and wall roughness (friction factor k) into a single number, the **airway resistance R**. Airways combine like resistors, but the square-law makes the parallel rule use **reciprocal square-roots**. A fan's duty (Q, P, power) scales with its speed through the **fan laws**, letting you predict a new operating point from a known one.",
    formulaMatrix: [
      "**Atkinson airway resistance**",
      "$$R = \\dfrac{k\\,O\\,L}{A^{3}}$$",
      "where $k$ = friction factor $[\\text{N·s}^2/\\text{m}^4 \\approx \\text{kg/m}^3]$, $O$ = airway perimeter $[\\text{m}]$, $L$ = length $[\\text{m}]$, $A$ = cross-sectional area $[\\text{m}^2]$, and $R$ = resistance $[\\text{N·s}^2/\\text{m}^8]$.",
      "",
      "**Atkinson square law (pressure drop)**",
      "$$P = R\\,Q^{2}$$",
      "$P$ = frictional pressure drop $[\\text{Pa} = \\text{N/m}^2]$, $Q$ = airflow $[\\text{m}^3/\\text{s}]$.",
      "",
      "**Series airways** (same Q through each):",
      "$$R_{eq} = R_1 + R_2 + \\dots$$",
      "**Parallel airways** (same P across each):",
      "$$\\dfrac{1}{\\sqrt{R_{eq}}} = \\dfrac{1}{\\sqrt{R_1}} + \\dfrac{1}{\\sqrt{R_2}} + \\dots$$",
      "",
      "**Fan laws** (constant diameter, speed $N$):",
      "$$\\dfrac{Q_2}{Q_1} = \\dfrac{N_2}{N_1}, \\quad \\dfrac{P_2}{P_1} = \\left(\\dfrac{N_2}{N_1}\\right)^{2}, \\quad \\dfrac{\\dot W_2}{\\dot W_1} = \\left(\\dfrac{N_2}{N_1}\\right)^{3}$$",
      "**Air power** delivered: $\\dot W_{air} = P\\,Q\\;[\\text{W}]$.",
    ].join("\n"),
    traps: [
      "**Cube the area, not the square.** Atkinson's R has $A^{3}$ in the denominator. Using $A^{2}$ (a very common slip) inflates R by a factor equal to the area — a classic distractor in MCQs.",
      "**Parallel ≠ Ohm's law.** Because $P = RQ^2$ is non-linear, parallel airways combine as $1/\\sqrt{R_{eq}} = \\sum 1/\\sqrt{R_i}$, NOT $1/R_{eq} = \\sum 1/R_i$. Treating airways like electrical resistors gives a wrong (too-small) equivalent resistance.",
      "**Fan-law exponents differ.** Quantity scales as $N^1$, pressure as $N^2$, and power as $N^3$. Applying a single linear factor to all three is a frequent error.",
      "**You cannot add parallel pressures.** Airflow splits between parallel paths so that each path carries the *same* pressure drop; the quantities add, the pressures do not.",
    ],
    figure: {
      kind: "ventilation",
      caption:
        "Two airways (R₁, R₂) in parallel between junctions A–B, then airway R₃ in series to the upcast C.",
      nodes: [
        { id: "A", x: 40, y: 110 },
        { id: "B", x: 200, y: 110 },
        { id: "C", x: 310, y: 110 },
        { id: "T", x: 120, y: 50 },
        { id: "D", x: 120, y: 170 },
      ],
      branches: [
        { from: "A", to: "T", r: 0.4 },
        { from: "T", to: "B" },
        { from: "A", to: "D", r: 0.9 },
        { from: "D", to: "B" },
        { from: "B", to: "C", r: 0.2, q: 30 },
      ],
    },
  },
  questions: [
    /* ---- Q1 · BASIC · 1 mark · MCQ ---------------------------------- */
    {
      id: "vent-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A straight mine airway has friction factor $k = 0.01\\ \\text{N·s}^2/\\text{m}^4$, length $L = 200\\ \\text{m}$, perimeter $O = 8\\ \\text{m}$ and cross-sectional area $A = 4\\ \\text{m}^2$. Using Atkinson's equation, the airway resistance $R$ is:",
      options: [
        "$0.0625\\ \\text{N·s}^2/\\text{m}^8$",
        "$0.25\\ \\text{N·s}^2/\\text{m}^8$",
        "$1.00\\ \\text{N·s}^2/\\text{m}^8$",
        "$4.00\\ \\text{N·s}^2/\\text{m}^8$",
      ],
      answer: 1,
      solution: {
        given:
          "$k = 0.01\\ \\text{N·s}^2/\\text{m}^4$, $\\;O = 8\\ \\text{m}$, $\\;L = 200\\ \\text{m}$, $\\;A = 4\\ \\text{m}^2$. All quantities already in SI — no conversion needed.",
        derivation:
          "$$R = \\frac{k\\,O\\,L}{A^{3}} = \\frac{0.01 \\times 8 \\times 200}{4^{3}} = \\frac{16}{64} = 0.25\\ \\text{N·s}^2/\\text{m}^8$$",
        target:
          "**Correct option: $0.25\\ \\text{N·s}^2/\\text{m}^8$.** Distractor traps: $1.00$ comes from using $A^2$ (=16) instead of $A^3$; $0.0625$ from using $A^4$ (=256); $4.00$ from inverting the ratio ($64/16$).",
      },
    },

    /* ---- Q2 · MEDIUM · 2 marks · NAT -------------------------------- */
    {
      id: "vent-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "An airway has $k = 0.012\\ \\text{N·s}^2/\\text{m}^4$, $L = 300\\ \\text{m}$, perimeter $O = 10\\ \\text{m}$ and area $A = 5\\ \\text{m}^2$. If it carries an airflow of $Q = 20\\ \\text{m}^3/\\text{s}$, the frictional pressure drop across it is ______ Pa. (Round off to two decimal places.)",
      natAnswer: 115.2,
      acceptedRange: [114.7, 115.7],
      unit: "Pa",
      solution: {
        given:
          "$k = 0.012\\ \\text{N·s}^2/\\text{m}^4$, $\\;O = 10\\ \\text{m}$, $\\;L = 300\\ \\text{m}$, $\\;A = 5\\ \\text{m}^2$, $\\;Q = 20\\ \\text{m}^3/\\text{s}$. SI throughout.",
        derivation:
          "Step 1 — resistance from Atkinson's equation:\n$$R = \\frac{k\\,O\\,L}{A^{3}} = \\frac{0.012 \\times 10 \\times 300}{5^{3}} = \\frac{36}{125} = 0.288\\ \\text{N·s}^2/\\text{m}^8$$\nStep 2 — apply the square law:\n$$P = R\\,Q^{2} = 0.288 \\times 20^{2} = 0.288 \\times 400 = 115.20\\ \\text{Pa}$$",
        target: "**Target: 115.20 Pa | Accepted range: 114.70 to 115.70.**",
      },
    },

    /* ---- Q3 · HARD · 2 marks · NAT (chart) -------------------------- */
    {
      id: "vent-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "The plot shows a main fan whose characteristic is linearised as $P = a - bQ$ with $a = 2000\\ \\text{Pa}$ and $b = 20\\ \\text{Pa·s/m}^3$, operating against a mine of total resistance $R = 0.5\\ \\text{N·s}^2/\\text{m}^8$ (mine curve $P = R\\,Q^{2}$). The operating airflow $Q$ at the intersection of the two curves is ______ m³/s. (Round off to two decimal places.)",
      natAnswer: 46.33,
      acceptedRange: [46.03, 46.63],
      unit: "m³/s",
      figure: {
        kind: "pq-curve",
        caption:
          "Fan line P = a − bQ (a = 2000 Pa, b = 20) intersecting the mine resistance parabola P = 0.5·Q². The intersection is the operating point.",
        fan: { a: 2000, b: 20, label: "Fan P = a − bQ" },
        resistances: [{ r: 0.5, label: "Mine R = 0.5", color: "#dc2626" }],
      },
      solution: {
        given:
          "Fan: $P = a - bQ$ with $a = 2000\\ \\text{Pa}$, $b = 20\\ \\text{Pa·s/m}^3$. Mine: $P = R\\,Q^{2}$ with $R = 0.5\\ \\text{N·s}^2/\\text{m}^8$.",
        derivation:
          "At the operating point the fan pressure equals the mine pressure drop:\n$$R\\,Q^{2} = a - bQ \\;\\Rightarrow\\; 0.5Q^{2} + 20Q - 2000 = 0$$\nMultiply through by 2:\n$$Q^{2} + 40Q - 4000 = 0$$\nQuadratic formula (take the positive root):\n$$Q = \\frac{-40 + \\sqrt{40^{2} + 4(4000)}}{2} = \\frac{-40 + \\sqrt{17600}}{2} = \\frac{-40 + 132.665}{2} = 46.33\\ \\text{m}^3/\\text{s}$$\nCheck: $P = 2000 - 20(46.33) = 1073.4\\ \\text{Pa}$, and $R\\,Q^{2} = 0.5(46.33)^{2} \\approx 1073.3\\ \\text{Pa}$ ✓",
        target:
          "**Target: 46.33 m³/s | Accepted range: 46.03 to 46.63** (allows for rounding of $\\sqrt{17600}$).",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  TOPIC — Mine Ventilation: Mine Gases & Gas Dilution                  */
/* ════════════════════════════════════════════════════════════════════ */

const ventilationMineGases: LearnTopic = {
  slug: "ventilation-mine-gases-dilution",
  subject: "Mine Ventilation",
  title: "Mine Gases & Gas Dilution",
  tier: "subject",
  blurb:
    "Firedamp, blackdamp, whitedamp and stinkdamp — their explosive/toxic limits and the steady-state airflow needed to dilute a gas make below statutory limits.",
  module: {
    principle:
      "The underground atmosphere is continuously contaminated by gases: **methane** (firedamp, CH₄) from coal seams is explosive between 5 % and 15 %, most violently around 9.5 %; **carbon monoxide** (whitedamp, CO) is acutely toxic with a TLV of only 50 ppm; **carbon dioxide** (blackdamp, CO₂) and **hydrogen sulphide** (stinkdamp, H₂S) are also regulated. We keep concentrations safe by **dilution** — supplying enough fresh air so that, at steady state, the gas make is swept away below its permissible limit. The governing idea is a simple volumetric mass balance: gas added per second must be diluted by the air swept past per second.",
    formulaMatrix: [
      "**Concentration ↔ ppm**",
      "$$1\\% \\text{ by volume} = 10{,}000\\ \\text{ppm}, \\qquad C[\\text{fraction}] = \\frac{C[\\%]}{100}$$",
      "",
      "**Dilution airflow** (steady state, dilute gas):",
      "$$Q_{air} = \\dfrac{q_g}{C - B}$$",
      "$q_g$ = gas make rate $[\\text{m}^3/\\text{s}]$, $C$ = maximum permissible concentration (fraction), $B$ = concentration already in the intake air (fraction), $Q_{air}$ = required fresh airflow $[\\text{m}^3/\\text{s}]$.",
      "",
      "**Gas carried by an air current**: $q_g = Q_{air}\\,C$.",
      "",
      "**Methane explosibility:** Lower Explosive Limit (LEL) ≈ 5 %, Upper Explosive Limit (UEL) ≈ 15 %, most explosive ≈ 9.5 %.",
    ].join("\n"),
    traps: [
      "**ppm ↔ % decimal slips.** $50\\ \\text{ppm} = 0.005\\%$ (divide by 10,000), not $0.05\\%$ or $0.5\\%$. Misplacing this decimal is the single most common gas-question error.",
      "**Forgetting the intake background $B$.** If the intake air already carries some of the gas, the *available* dilution capacity is only $(C - B)$, not $C$. Using $C$ alone under-estimates the air needed.",
      "**Confusing the gases.** Hydrogen's explosive range is ~4–75 % and CO's is ~12.5–74 %; methane is the narrow 5–15 % band. Mixing these ranges up is a classic trap.",
      "**Density direction.** Methane (SG ≈ 0.55) layers along the **roof**; CO₂ and H₂S (heavier than air) collect in **floor** dips and standing water — sampling at the wrong height misreads the hazard.",
    ],
    figure: {
      kind: "svg",
      caption: "Methane-in-air explosibility band: inert below 5 %, explosive 5–15 % (peak ≈ 9.5 %), fuel-rich above 15 %.",
      markup:
        '<svg viewBox="0 0 360 90" width="100%" role="img" aria-label="Methane explosive range bar from 0 to 20 percent">\
<rect x="20" y="25" width="320" height="26" fill="#e2e8f0" stroke="#94a3b8"/>\
<rect x="100" y="25" width="160" height="26" fill="#fca5a5" stroke="#dc2626"/>\
<line x1="172" y1="20" x2="172" y2="56" stroke="#7f1d1d" stroke-width="2"/>\
<text x="20" y="70" font-size="10" fill="#334155">0%</text>\
<text x="92" y="70" font-size="10" fill="#7f1d1d">5% LEL</text>\
<text x="150" y="18" font-size="9" fill="#7f1d1d">9.5% peak</text>\
<text x="244" y="70" font-size="10" fill="#7f1d1d">15% UEL</text>\
<text x="320" y="70" font-size="10" fill="#334155">20%</text>\
<text x="40" y="42" font-size="9" fill="#334155">inert</text>\
<text x="150" y="42" font-size="9" fill="#7f1d1d">EXPLOSIVE</text>\
<text x="280" y="42" font-size="9" fill="#334155">fuel-rich</text>\
</svg>',
    },
  },
  questions: [
    {
      id: "gas-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "The 8-hour threshold limit value (TLV) for carbon monoxide is 50 ppm. Expressed as a percentage by volume, this is:",
      options: ["$0.0005\\%$", "$0.005\\%$", "$0.05\\%$", "$0.5\\%$"],
      answer: 1,
      solution: {
        given: "TLV(CO) $= 50\\ \\text{ppm}$. Conversion: $1\\% = 10{,}000\\ \\text{ppm}$.",
        derivation: "$$C = \\frac{50}{10{,}000} = 0.005\\%$$",
        target:
          "**Correct option: $0.005\\%$.** The distractors $0.05\\%$ and $0.5\\%$ come from dividing by 1,000 or 100 (decimal-place slips); $0.0005\\%$ from dividing by 100,000.",
      },
    },
    {
      id: "gas-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A development heading liberates methane at $q_g = 0.05\\ \\text{m}^3/\\text{s}$. The intake air already contains $0.10\\%$ CH₄. The minimum fresh-air quantity required to hold the general-body concentration at the statutory limit of $1.25\\%$ is ______ m³/s. (Round off to two decimal places.)",
      natAnswer: 4.35,
      acceptedRange: [4.3, 4.4],
      unit: "m³/s",
      solution: {
        given:
          "$q_g = 0.05\\ \\text{m}^3/\\text{s}$; permissible $C = 1.25\\% = 0.0125$; intake background $B = 0.10\\% = 0.0010$.",
        derivation:
          "$$Q_{air} = \\frac{q_g}{C - B} = \\frac{0.05}{0.0125 - 0.0010} = \\frac{0.05}{0.0115} = 4.35\\ \\text{m}^3/\\text{s}$$",
        target: "**Target: 4.35 m³/s | Accepted range: 4.30 to 4.40.**",
      },
    },
    {
      id: "gas-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A return airway carries $Q = 50\\ \\text{m}^3/\\text{s}$ of air (negligible methane at intake). To keep the methane concentration in this current at or below $0.75\\%$, the maximum permissible methane make into the airway is ______ m³/s. (Round off to two decimal places.)",
      natAnswer: 0.38,
      acceptedRange: [0.37, 0.39],
      unit: "m³/s",
      solution: {
        given: "$Q = 50\\ \\text{m}^3/\\text{s}$; max concentration $C = 0.75\\% = 0.0075$; intake CH₄ ≈ 0.",
        derivation:
          "Gas carried by the current: $q_g = Q\\,C$.\n$$q_g = 50 \\times 0.0075 = 0.375\\ \\text{m}^3/\\text{s} \\approx 0.38\\ \\text{m}^3/\\text{s}$$",
        target:
          "**Target: 0.38 m³/s (0.375 before rounding) | Accepted range: 0.37 to 0.39.** Note this 0.75 % working limit sits safely below the 5 % LEL.",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  TOPIC — Mine Ventilation: Psychrometry & Mine Climate                */
/* ════════════════════════════════════════════════════════════════════ */

const ventilationPsychrometry: LearnTopic = {
  slug: "ventilation-psychrometry-mine-climate",
  subject: "Mine Ventilation",
  title: "Psychrometry & Mine Climate",
  tier: "subject",
  blurb:
    "Dry-bulb, wet-bulb, relative humidity and moisture content — quantifying the hot, humid deep-mine atmosphere and the body's cooling power.",
  module: {
    principle:
      "Deep workings are **hot and humid** because of auto-compression, strata heat and machinery. The thermal stress on a miner depends not on temperature alone but on the air's ability to remove body heat — driven by **dry-bulb temperature**, **humidity** and **air velocity**. Psychrometry is the bookkeeping of moist air: it links the **dry-bulb** temperature, the **wet-bulb** temperature (which falls as evaporative cooling occurs), the **relative humidity** (how close the air is to saturation) and the **moisture (humidity) content** (mass of water vapour per unit mass of dry air). Saturated air can hold no more vapour, so evaporative cooling — the body's main defence — stops, which is why high humidity is so dangerous underground.",
    formulaMatrix: [
      "**Relative humidity** (ratio of actual to saturation vapour pressure at the dry-bulb temperature):",
      "$$RH = \\dfrac{p_v}{p_s}\\times 100\\%$$",
      "$p_v$ = actual vapour pressure, $p_s$ = saturation vapour pressure at dry-bulb $[\\text{kPa}]$.",
      "",
      "**Moisture (humidity) content** — mass of water vapour per kg of dry air:",
      "$$W = 0.622\\,\\dfrac{p_v}{P - p_v}\\quad[\\text{kg/kg dry air}]$$",
      "$P$ = barometric pressure $[\\text{kPa}]$. The factor 0.622 is the ratio of molar masses (water 18 / dry air 29).",
      "",
      "**From RH back to vapour pressure**: $p_v = \\dfrac{RH}{100}\\,p_s$.",
      "",
      "Multiply $W$ by 1000 to quote in **g/kg**.",
    ].join("\n"),
    traps: [
      "**RH uses pressures, not temperatures.** $RH = p_v/p_s$ at the *same* (dry-bulb) temperature. Dividing wet-bulb by dry-bulb temperature is meaningless.",
      "**Use $P - p_v$ in the denominator, not $P$.** Moisture content is referenced to *dry* air, so the partial pressure of vapour is subtracted from the total. Using $P$ alone slightly under-estimates $W$.",
      "**Keep pressures in the same unit.** Mixing kPa and Pa (a factor of 1000) wrecks both $RH$ and $W$. Convert everything first.",
      "**Saturation ≠ 100 % comfort.** At RH = 100 % evaporative (latent) cooling stops entirely; a modest dry-bulb temperature can still be hazardous — temperature alone is not the criterion.",
    ],
    figure: {
      kind: "svg",
      caption:
        "Schematic psychrometric relationship: at a fixed dry-bulb temperature, the actual vapour pressure pᵥ sits below the saturation pressure pₛ; their ratio is the relative humidity.",
      markup:
        '<svg viewBox="0 0 360 150" width="100%" role="img" aria-label="Schematic of vapour pressure versus saturation curve">\
<line x1="40" y1="120" x2="340" y2="120" stroke="#475569"/>\
<line x1="40" y1="120" x2="40" y2="20" stroke="#475569"/>\
<text x="150" y="140" font-size="10" fill="#334155">dry-bulb temperature →</text>\
<text x="8" y="70" font-size="10" fill="#334155" transform="rotate(-90 12 70)">vapour pressure</text>\
<path d="M40,118 C140,110 220,80 320,30" fill="none" stroke="#2563eb" stroke-width="2"/>\
<text x="250" y="40" font-size="9" fill="#2563eb">saturation pₛ</text>\
<line x1="220" y1="120" x2="220" y2="80" stroke="#94a3b8" stroke-dasharray="3 3"/>\
<circle cx="220" cy="80" r="3" fill="#2563eb"/>\
<circle cx="220" cy="98" r="3" fill="#dc2626"/>\
<text x="226" y="100" font-size="9" fill="#dc2626">actual pᵥ</text>\
<text x="120" y="60" font-size="9" fill="#334155">RH = pᵥ / pₛ</text>\
</svg>',
    },
  },
  questions: [
    {
      id: "psy-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "At a certain dry-bulb temperature the saturation vapour pressure is $p_s = 2.8\\ \\text{kPa}$ and the actual vapour pressure is $p_v = 1.4\\ \\text{kPa}$. The relative humidity is:",
      options: ["$25\\%$", "$50\\%$", "$140\\%$", "$200\\%$"],
      answer: 1,
      solution: {
        given: "$p_v = 1.4\\ \\text{kPa}$, $p_s = 2.8\\ \\text{kPa}$.",
        derivation: "$$RH = \\frac{p_v}{p_s}\\times 100 = \\frac{1.4}{2.8}\\times 100 = 50\\%$$",
        target:
          "**Correct option: $50\\%$.** The $200\\%$ trap inverts the ratio ($p_s/p_v$); $140\\%$ wrongly reads the numbers as a difference/percentage; $25\\%$ squares the ratio.",
      },
    },
    {
      id: "psy-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Mine air at a barometric pressure of $P = 100\\ \\text{kPa}$ has an actual vapour pressure $p_v = 2.0\\ \\text{kPa}$. The moisture content of the air is ______ g of water per kg of dry air. (Round off to two decimal places.)",
      natAnswer: 12.69,
      acceptedRange: [12.5, 12.9],
      unit: "g/kg",
      solution: {
        given: "$P = 100\\ \\text{kPa}$, $p_v = 2.0\\ \\text{kPa}$.",
        derivation:
          "$$W = 0.622\\,\\frac{p_v}{P - p_v} = 0.622\\times\\frac{2.0}{100 - 2.0} = 0.622\\times\\frac{2.0}{98.0} = 0.012694\\ \\text{kg/kg}$$\nConvert to g/kg: $0.012694\\times 1000 = 12.69\\ \\text{g/kg}$.",
        target: "**Target: 12.69 g/kg | Accepted range: 12.50 to 12.90.**",
      },
    },
    {
      id: "psy-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "At a working face the dry-bulb temperature gives a saturation vapour pressure $p_s = 4.24\\ \\text{kPa}$, the relative humidity is $70\\%$ and the barometric pressure is $P = 101\\ \\text{kPa}$. The moisture content of this air is ______ g/kg of dry air. (Round off to two decimal places.)",
      natAnswer: 18.83,
      acceptedRange: [18.6, 19.1],
      unit: "g/kg",
      solution: {
        given: "$p_s = 4.24\\ \\text{kPa}$, $RH = 70\\%$, $P = 101\\ \\text{kPa}$.",
        derivation:
          "Step 1 — actual vapour pressure from RH:\n$$p_v = \\frac{RH}{100}\\,p_s = 0.70\\times 4.24 = 2.968\\ \\text{kPa}$$\nStep 2 — moisture content:\n$$W = 0.622\\,\\frac{p_v}{P - p_v} = 0.622\\times\\frac{2.968}{101 - 2.968} = 0.622\\times\\frac{2.968}{98.032} = 0.018832\\ \\text{kg/kg}$$\n$$W = 18.83\\ \\text{g/kg}$$",
        target: "**Target: 18.83 g/kg | Accepted range: 18.60 to 19.10.**",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  TOPIC — Mine Ventilation: Mine Dust Sampling & Control               */
/* ════════════════════════════════════════════════════════════════════ */

const ventilationDust: LearnTopic = {
  slug: "ventilation-mine-dust-sampling",
  subject: "Mine Ventilation",
  title: "Mine Dust Sampling & Control",
  tier: "subject",
  blurb:
    "Respirable dust, gravimetric sampling and time-weighted exposure — measuring the airborne dust that causes pneumoconiosis and silicosis.",
  module: {
    principle:
      "Fine airborne dust — especially the **respirable fraction** (roughly < 5–7 µm, small enough to reach the alveoli) and crystalline **silica** — causes the irreversible lung diseases pneumoconiosis and silicosis. Because the hazard is a *dose* (concentration × time), we measure the airborne mass concentration by **gravimetric sampling**: a personal pump draws air at a known, steady flow rate across a pre-weighed filter; re-weighing the filter gives the mass of dust collected, and dividing by the volume of air sampled gives the concentration. Over a shift, exposure is summarised as a **time-weighted average** (TWA) so that short high-exposure spells and longer low-exposure spells are combined fairly.",
    formulaMatrix: [
      "**Volume of air sampled**:",
      "$$V = Q_s\\,t$$",
      "$Q_s$ = sampling flow rate $[\\text{L/min}]$, $t$ = duration $[\\text{min}]$. Convert litres to m³ by dividing by 1000.",
      "",
      "**Dust concentration** (gravimetric):",
      "$$c = \\dfrac{m}{V}\\quad[\\text{mg/m}^3]$$",
      "$m$ = mass of dust collected $[\\text{mg}]$, $V$ = volume sampled $[\\text{m}^3]$.",
      "",
      "**Time-weighted average** over a shift of $n$ intervals:",
      "$$\\text{TWA} = \\dfrac{\\sum c_i\\,t_i}{\\sum t_i}$$",
      "$c_i$ = concentration during interval $i$, $t_i$ = its duration.",
    ].join("\n"),
    traps: [
      "**Litres ↔ cubic metres.** $1\\ \\text{m}^3 = 1000\\ \\text{L}$. A pump at 2 L/min for 480 min samples $960\\ \\text{L} = 0.96\\ \\text{m}^3$, not 960 m³. Forgetting the ÷1000 is the dominant error in dust questions.",
      "**Mass units.** Filters gain milligrams; concentration is mg/m³. Mixing mg with g (×1000) throws the answer off by three orders of magnitude.",
      "**TWA is time-weighted, not a plain average.** Average the concentrations *weighted by their durations*; a simple mean of the readings is wrong whenever the intervals differ.",
      "**Total vs respirable.** The health limit applies to the **respirable** fraction (after the size-selective cyclone), which is only part of the total airborne dust — comparing total dust to the respirable limit over-reads compliance.",
    ],
    figure: {
      kind: "svg",
      caption:
        "Gravimetric sampling train: intake → size-selective cyclone (removes coarse dust) → pre-weighed filter → constant-flow pump. Concentration = filter mass gain ÷ (flow × time).",
      markup:
        '<svg viewBox="0 0 380 120" width="100%" role="img" aria-label="Gravimetric dust sampling train schematic">\
<text x="10" y="60" font-size="18" fill="#475569">→</text>\
<polygon points="40,40 80,40 70,75 50,75" fill="#bfdbfe" stroke="#2563eb"/>\
<text x="34" y="95" font-size="9" fill="#334155">cyclone</text>\
<rect x="110" y="40" width="40" height="35" fill="#fde68a" stroke="#d97706"/>\
<text x="104" y="95" font-size="9" fill="#334155">filter</text>\
<rect x="190" y="38" width="55" height="40" rx="4" fill="#e2e8f0" stroke="#475569"/>\
<text x="198" y="62" font-size="9" fill="#334155">pump</text>\
<text x="196" y="95" font-size="9" fill="#334155">Qₛ L/min</text>\
<line x1="80" y1="57" x2="110" y2="57" stroke="#475569"/>\
<line x1="150" y1="57" x2="190" y2="57" stroke="#475569"/>\
<text x="270" y="50" font-size="10" fill="#334155">c = m / (Qₛ·t)</text>\
<text x="270" y="68" font-size="9" fill="#64748b">mg/m³</text>\
</svg>',
    },
  },
  questions: [
    {
      id: "dust-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A personal sampler runs at a flow rate of $2.0\\ \\text{L/min}$ for a full shift of $480\\ \\text{min}$. The volume of air sampled is:",
      options: ["$0.096\\ \\text{m}^3$", "$0.96\\ \\text{m}^3$", "$9.6\\ \\text{m}^3$", "$960\\ \\text{m}^3$"],
      answer: 1,
      solution: {
        given: "$Q_s = 2.0\\ \\text{L/min}$, $t = 480\\ \\text{min}$.",
        derivation:
          "$$V = Q_s\\,t = 2.0\\times 480 = 960\\ \\text{L} = \\frac{960}{1000} = 0.96\\ \\text{m}^3$$",
        target:
          "**Correct option: $0.96\\ \\text{m}^3$.** $960\\ \\text{m}^3$ forgets the L→m³ conversion; $9.6$ and $0.096$ are decimal-place slips in that ÷1000.",
      },
    },
    {
      id: "dust-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A gravimetric sampler draws air at $1.9\\ \\text{L/min}$ for $420\\ \\text{min}$. The pre-weighed filter gains $2.10\\ \\text{mg}$ of respirable dust. The mean respirable-dust concentration is ______ mg/m³. (Round off to two decimal places.)",
      natAnswer: 2.63,
      acceptedRange: [2.55, 2.7],
      unit: "mg/m³",
      solution: {
        given: "$Q_s = 1.9\\ \\text{L/min}$, $t = 420\\ \\text{min}$, $m = 2.10\\ \\text{mg}$.",
        derivation:
          "Step 1 — volume sampled:\n$$V = Q_s\\,t = 1.9\\times 420 = 798\\ \\text{L} = 0.798\\ \\text{m}^3$$\nStep 2 — concentration:\n$$c = \\frac{m}{V} = \\frac{2.10}{0.798} = 2.63\\ \\text{mg/m}^3$$",
        target: "**Target: 2.63 mg/m³ | Accepted range: 2.55 to 2.70.**",
      },
    },
    {
      id: "dust-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "During an 8-hour shift a miner spends 4 h in a zone measuring $3.0\\ \\text{mg/m}^3$ respirable dust and 4 h in a zone measuring $1.0\\ \\text{mg/m}^3$. The 8-hour time-weighted-average exposure is ______ mg/m³. (Round off to two decimal places.)",
      natAnswer: 2.0,
      acceptedRange: [1.95, 2.05],
      unit: "mg/m³",
      figure: {
        kind: "svg",
        caption: "Exposure profile over the shift: 4 h at 3.0 mg/m³ then 4 h at 1.0 mg/m³. The TWA is the duration-weighted mean (dashed line).",
        markup:
          '<svg viewBox="0 0 360 130" width="100%" role="img" aria-label="Dust exposure profile bar chart over 8 hour shift">\
<line x1="40" y1="110" x2="340" y2="110" stroke="#475569"/>\
<line x1="40" y1="110" x2="40" y2="15" stroke="#475569"/>\
<rect x="40" y="35" width="140" height="75" fill="#fca5a5" stroke="#dc2626"/>\
<rect x="180" y="85" width="140" height="25" fill="#fcd34d" stroke="#d97706"/>\
<line x1="40" y1="60" x2="340" y2="60" stroke="#1e3a8a" stroke-dasharray="5 4"/>\
<text x="344" y="63" font-size="9" fill="#1e3a8a">TWA</text>\
<text x="90" y="28" font-size="9" fill="#7f1d1d">3.0 mg/m³</text>\
<text x="215" y="80" font-size="9" fill="#92400e">1.0 mg/m³</text>\
<text x="95" y="124" font-size="9" fill="#334155">0–4 h</text>\
<text x="235" y="124" font-size="9" fill="#334155">4–8 h</text>\
</svg>',
      },
      solution: {
        given: "$c_1 = 3.0\\ \\text{mg/m}^3$ for $t_1 = 4\\ \\text{h}$; $c_2 = 1.0\\ \\text{mg/m}^3$ for $t_2 = 4\\ \\text{h}$.",
        derivation:
          "$$\\text{TWA} = \\frac{c_1 t_1 + c_2 t_2}{t_1 + t_2} = \\frac{(3.0)(4) + (1.0)(4)}{4 + 4} = \\frac{12 + 4}{8} = \\frac{16}{8} = 2.0\\ \\text{mg/m}^3$$",
        target:
          "**Target: 2.00 mg/m³ | Accepted range: 1.95 to 2.05.** Because both intervals are equal here the TWA equals the simple mean — but always weight by duration when they differ.",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  TOPIC — Mine Ventilation: Natural Ventilation Pressure (NVP)         */
/* ════════════════════════════════════════════════════════════════════ */

const ventilationNVP: LearnTopic = {
  slug: "ventilation-natural-ventilation-pressure",
  subject: "Mine Ventilation",
  title: "Natural Ventilation Pressure (NVP)",
  tier: "premium",
  blurb:
    "The buoyancy-driven 'free fan': how a density difference between the downcast and upcast columns drives airflow, and how it combines with a mechanical fan.",
  module: {
    principle:
      "When the air column in the **upcast** shaft is warmer (and therefore lighter) than the column in the **downcast** shaft, the heavier downcast column sinks and pushes air around the mine — a buoyancy-driven flow that acts like a **free fan**. This **natural ventilation pressure (NVP)** equals the weight difference of the two columns. Density follows the ideal-gas law, so a temperature difference between the two shafts is what creates the density difference. NVP can **assist** a mechanical fan (pressures add) in winter or **oppose** it in summer when the surface air is hot; the combined pressure then drives airflow against the mine resistance through the square law $P = R\\,Q^2$.",
    formulaMatrix: [
      "**Air density (ideal gas)**:",
      "$$\\rho = \\dfrac{P}{R_a\\,T}$$",
      "$P$ = barometric pressure $[\\text{Pa}]$, $R_a = 287\\ \\text{J/(kg·K)}$ for dry air, $T$ = absolute temperature $[\\text{K} = {}^{\\circ}\\text{C} + 273]$.",
      "",
      "**Natural ventilation pressure** from the column density difference:",
      "$$\\text{NVP} = (\\rho_d - \\rho_u)\\,g\\,H$$",
      "$\\rho_d$ = mean downcast density, $\\rho_u$ = mean upcast density $[\\text{kg/m}^3]$, $g = 9.81\\ \\text{m/s}^2$, $H$ = shaft depth $[\\text{m}]$; NVP in $[\\text{Pa}]$.",
      "",
      "**Combining with a fan** (assisting) against mine resistance $R$:",
      "$$P_{fan} + \\text{NVP} = R\\,Q^{2}\\;\\Rightarrow\\; Q = \\sqrt{\\dfrac{P_{fan} + \\text{NVP}}{R}}$$",
    ].join("\n"),
    traps: [
      "**Temperatures must be in kelvin.** $\\rho = P/(R_a T)$ needs absolute temperature; using °C makes the densities (and NVP) nonsense.",
      "**Denser column is the downcast.** NVP $= (\\rho_d - \\rho_u)gH$ with the cooler/denser downcast first. Reversing the order flips the sign and the implied airflow direction.",
      "**NVP adds or subtracts — not multiplies.** With a fan the pressures simply combine: assisting → $P_{fan}+\\text{NVP}$, opposing → $P_{fan}-\\text{NVP}$. Then apply the square law once.",
      "**Watch the pressure unit in $\\rho$.** $R_a = 287$ expects $P$ in pascals; feeding kPa under-states density by 1000×.",
    ],
    figure: {
      kind: "svg",
      caption:
        "Cool dense downcast column (ρ_d) and warm light upcast column (ρ_u) over depth H. The weight difference of the two columns is the natural ventilation pressure.",
      markup:
        '<svg viewBox="0 0 360 160" width="100%" role="img" aria-label="Downcast and upcast shaft columns with density difference">\
<rect x="60" y="20" width="40" height="110" fill="#bfdbfe" stroke="#2563eb"/>\
<rect x="260" y="20" width="40" height="110" fill="#fecaca" stroke="#dc2626"/>\
<line x1="100" y1="130" x2="260" y2="130" stroke="#475569" stroke-width="2"/>\
<text x="46" y="15" font-size="9" fill="#2563eb">downcast ρ_d (cool)</text>\
<text x="246" y="15" font-size="9" fill="#dc2626">upcast ρ_u (warm)</text>\
<text x="64" y="80" font-size="14" fill="#1e3a8a">↓</text>\
<text x="276" y="80" font-size="14" fill="#7f1d1d">↑</text>\
<line x1="20" y1="20" x2="20" y2="130" stroke="#475569"/>\
<text x="6" y="78" font-size="9" fill="#334155" transform="rotate(-90 10 78)">depth H</text>\
<text x="150" y="148" font-size="9" fill="#334155">workings</text>\
</svg>',
    },
  },
  questions: [
    {
      id: "nvp-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A mine shaft is $H = 300\\ \\text{m}$ deep. The mean downcast air density is $1.20\\ \\text{kg/m}^3$ and the mean upcast density is $1.10\\ \\text{kg/m}^3$. Taking $g = 9.81\\ \\text{m/s}^2$, the natural ventilation pressure is:",
      options: ["$2.94\\ \\text{Pa}$", "$29.43\\ \\text{Pa}$", "$294.30\\ \\text{Pa}$", "$2943.0\\ \\text{Pa}$"],
      answer: 2,
      solution: {
        given: "$\\rho_d = 1.20$, $\\rho_u = 1.10\\ \\text{kg/m}^3$, $H = 300\\ \\text{m}$, $g = 9.81$.",
        derivation:
          "$$\\text{NVP} = (\\rho_d - \\rho_u)\\,g\\,H = (1.20 - 1.10)\\times 9.81 \\times 300 = 0.10\\times 9.81\\times 300 = 294.30\\ \\text{Pa}$$",
        target:
          "**Correct option: $294.30\\ \\text{Pa}$.** The other options are pure decimal-place slips (×10 / ÷10 / ÷100) — a reminder to track the magnitude.",
      },
    },
    {
      id: "nvp-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "In a $H = 400\\ \\text{m}$ shaft system the downcast air is at $15^{\\circ}\\text{C}$ and the upcast air at $35^{\\circ}\\text{C}$, both at a mean pressure of $101.3\\ \\text{kPa}$. Using $R_a = 287\\ \\text{J/(kg·K)}$ and $g = 9.81\\ \\text{m/s}^2$, the natural ventilation pressure is ______ Pa. (Round off to two decimal places.)",
      natAnswer: 312.28,
      acceptedRange: [309.0, 316.0],
      unit: "Pa",
      solution: {
        given:
          "$H = 400\\ \\text{m}$; downcast $T_d = 15 + 273 = 288\\ \\text{K}$; upcast $T_u = 35 + 273 = 308\\ \\text{K}$; $P = 101.3\\ \\text{kPa} = 101300\\ \\text{Pa}$; $R_a = 287$.",
        derivation:
          "Step 1 — column densities from $\\rho = P/(R_a T)$:\n$$\\rho_d = \\frac{101300}{287\\times 288} = 1.2256\\ \\text{kg/m}^3,\\quad \\rho_u = \\frac{101300}{287\\times 308} = 1.1460\\ \\text{kg/m}^3$$\nStep 2 — natural ventilation pressure:\n$$\\text{NVP} = (\\rho_d - \\rho_u)\\,g\\,H = (1.2256 - 1.1460)\\times 9.81\\times 400 = 0.0796\\times 9.81\\times 400 = 312.28\\ \\text{Pa}$$",
        target:
          "**Target: 312.28 Pa | Accepted range: 309.00 to 316.00** (band allows for using 273.15 vs 273 in the kelvin conversion).",
      },
    },
    {
      id: "nvp-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A main fan develops $900\\ \\text{Pa}$ and is *assisted* by a natural ventilation pressure of $300\\ \\text{Pa}$. The total mine resistance is $R = 0.5\\ \\text{N·s}^2/\\text{m}^8$. The resulting airflow through the mine is ______ m³/s. (Round off to two decimal places.)",
      natAnswer: 48.99,
      acceptedRange: [48.5, 49.5],
      unit: "m³/s",
      solution: {
        given: "$P_{fan} = 900\\ \\text{Pa}$, $\\text{NVP} = 300\\ \\text{Pa}$ (assisting), $R = 0.5\\ \\text{N·s}^2/\\text{m}^8$.",
        derivation:
          "Assisting pressures add, then apply the square law $P = R\\,Q^2$:\n$$P_{total} = P_{fan} + \\text{NVP} = 900 + 300 = 1200\\ \\text{Pa}$$\n$$Q = \\sqrt{\\frac{P_{total}}{R}} = \\sqrt{\\frac{1200}{0.5}} = \\sqrt{2400} = 48.99\\ \\text{m}^3/\\text{s}$$",
        target:
          "**Target: 48.99 m³/s | Accepted range: 48.50 to 49.50.** Had the NVP opposed the fan, you would subtract: $\\sqrt{(900-300)/0.5} = 34.64\\ \\text{m}^3/\\text{s}$.",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 5 — Mechanical & Auxiliary Ventilation, Fires, Environment   */
/* ════════════════════════════════════════════════════════════════════ */

const ventilationMechanicalFans: LearnTopic = {
  slug: "ventilation-mechanical-fans",
  subject: "Mine Ventilation",
  title: "Mechanical Ventilation & Mine Fans",
  tier: "subject",
  blurb:
    "Air power, fan efficiency and the operating point where a fan's pressure–quantity curve meets the mine's resistance characteristic.",
  module: {
    principle:
      "A mine fan supplies the **pressure** that drives air through the mine's resistance ($P = R Q^2$). The useful **air power** delivered is the product of that pressure and the airflow, $P\\cdot Q$; the **shaft (motor) power** is larger by the reciprocal of the fan's **efficiency**. The mine actually runs where the **fan characteristic** (pressure falling with quantity) intersects the rising **mine characteristic** $P = RQ^2$ — the operating point.",
    formulaMatrix: [
      "**Mine characteristic**: $P = R\\,Q^2$.",
      "",
      "**Air power** (useful output): $P_a = P\\,Q$  $[\\text{W}]$ (pressure in Pa, $Q$ in m³/s).",
      "",
      "**Fan efficiency / shaft power**: $\\eta = \\dfrac{P_a}{P_{shaft}}\\ \\Rightarrow\\ P_{shaft} = \\dfrac{P\\,Q}{\\eta}$.",
      "",
      "**Operating point**: solve $R\\,Q^2 = P_{fan}(Q)$ for $Q$ (fan curve meets mine curve).",
    ].join("\n"),
    traps: [
      "**Air power is $P\\cdot Q$, not $P/Q$.** Pressure (Pa) × quantity (m³/s) gives watts directly.",
      "**Shaft power divides by efficiency.** The motor must supply more than the air power: $P_{shaft}=P_aQ/\\eta$... i.e. $P\\,Q/\\eta$.",
      "**Operating point balances both curves.** Reading the fan's free-delivery or shut-off point instead of the intersection gives the wrong duty.",
    ],
    figure: {
      kind: "pq-curve",
      caption: "Fan curve P = 3000 − 20Q meeting the mine resistance R = 1.0 at Q ≈ 45.7 m³/s.",
      fan: { a: 3000, b: 20, label: "Fan: 3000 − 20Q" },
      resistances: [{ r: 1.0, label: "Mine R = 1.0", color: "#ef4444" }],
    },
  },
  questions: [
    {
      id: "fan-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A fan develops $2000\\ \\text{Pa}$ while passing $50\\ \\text{m}^3/\\text{s}$. The air power delivered is:",
      options: ["$100\\ \\text{kW}$", "$40\\ \\text{kW}$", "$1000\\ \\text{kW}$", "$10\\ \\text{kW}$"],
      answer: 0,
      solution: {
        given: "$P = 2000\\ \\text{Pa}$, $Q = 50\\ \\text{m}^3/\\text{s}$.",
        derivation: "$$P_a = P\\,Q = 2000\\times 50 = 100000\\ \\text{W} = 100\\ \\text{kW}$$",
        target: "**Correct option: $100\\ \\text{kW}$.** $40$ is $P/Q\\times1$; the others are decimal slips.",
      },
    },
    {
      id: "fan-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "The fan above (air power $100\\ \\text{kW}$) has an efficiency of $0.75$. The shaft power required is ______ kW. (Round off to two decimal places.)",
      natAnswer: 133.33,
      acceptedRange: [130, 137],
      unit: "kW",
      solution: {
        given: "$P_a = 100\\ \\text{kW}$, $\\eta = 0.75$.",
        derivation: "$$P_{shaft} = \\frac{P_a}{\\eta} = \\frac{100}{0.75} = 133.33\\ \\text{kW}$$",
        target: "**Target: 133.33 kW | Accepted range: 130.00 to 137.00.**",
      },
    },
    {
      id: "fan-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A fan with characteristic $P = 3000 - 20Q$ (Pa) serves a mine of resistance $R = 1.0\\ \\text{N·s}^2/\\text{m}^8$. The operating airflow is ______ m³/s. (Round off to two decimal places.)",
      natAnswer: 45.68,
      acceptedRange: [45.0, 46.5],
      unit: "m³/s",
      solution: {
        given: "Fan $P = 3000 - 20Q$; mine $P = R Q^2 = Q^2$.",
        derivation:
          "Set fan pressure = mine pressure:\n$$Q^2 = 3000 - 20Q\\ \\Rightarrow\\ Q^2 + 20Q - 3000 = 0$$\n$$Q = \\frac{-20 + \\sqrt{20^2 + 4\\times 3000}}{2} = \\frac{-20 + \\sqrt{12400}}{2} = 45.68\\ \\text{m}^3/\\text{s}$$",
        target: "**Target: 45.68 m³/s | Accepted range: 45.00 to 46.50.** This is the curve intersection in the figure.",
      },
    },
  ],
};

const ventilationAuxiliary: LearnTopic = {
  slug: "ventilation-auxiliary",
  subject: "Mine Ventilation",
  title: "Auxiliary Ventilation",
  tier: "subject",
  blurb:
    "Ventilating blind headings with a duct and fan — duct resistance, leakage and the air power delivered to the face.",
  module: {
    principle:
      "A **blind heading** (development end) has no through-flow, so it is ventilated by a **fan-and-duct** system. The duct itself imposes a resistance $P = R Q^2$, and inevitable **leakage** through joints means the quantity reaching the face is less than the quantity the fan delivers — the ratio is the **duct (delivery) efficiency**. To guarantee a required face quantity you must oversize the fan flow accordingly.",
    formulaMatrix: [
      "**Duct resistance pressure**: $P = R\\,Q^2$ ($R$ = duct resistance, $Q$ = quantity in the duct).",
      "",
      "**Delivery efficiency**: $\\eta_d = \\dfrac{Q_{face}}{Q_{fan}}\\ \\Rightarrow\\ Q_{fan} = \\dfrac{Q_{face}}{\\eta_d}$.",
      "",
      "**Air power of the auxiliary fan**: $P_a = P\\,Q_{fan}$.",
    ].join("\n"),
    traps: [
      "**Leakage means fan flow > face flow.** Size the fan for $Q_{face}/\\eta_d$, not just the face requirement.",
      "**Duct pressure follows the square law $RQ^2$.** Doubling the duct quantity quadruples its pressure loss.",
      "**Use the fan (duct) quantity for fan air power**, not the face quantity.",
    ],
  },
  questions: [
    {
      id: "aux-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A ventilation duct has resistance $R = 2\\ \\text{N·s}^2/\\text{m}^8$ and passes $3\\ \\text{m}^3/\\text{s}$. The pressure loss in the duct is:",
      options: ["$18\\ \\text{Pa}$", "$6\\ \\text{Pa}$", "$12\\ \\text{Pa}$", "$9\\ \\text{Pa}$"],
      answer: 0,
      solution: {
        given: "$R = 2\\ \\text{N·s}^2/\\text{m}^8$, $Q = 3\\ \\text{m}^3/\\text{s}$.",
        derivation: "$$P = R\\,Q^2 = 2\\times 3^2 = 2\\times 9 = 18\\ \\text{Pa}$$",
        target: "**Correct option: $18\\ \\text{Pa}$.** $6 = RQ$ (forgets the square); $9 = Q^2$ only.",
      },
    },
    {
      id: "aux-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A heading requires $4\\ \\text{m}^3/\\text{s}$ at the face. With a duct delivery efficiency of $80\\%$, the fan must deliver ______ m³/s. (Round off to two decimal places.)",
      natAnswer: 5,
      acceptedRange: [4.8, 5.2],
      unit: "m³/s",
      solution: {
        given: "$Q_{face} = 4\\ \\text{m}^3/\\text{s}$, $\\eta_d = 0.80$.",
        derivation: "$$Q_{fan} = \\frac{Q_{face}}{\\eta_d} = \\frac{4}{0.80} = 5\\ \\text{m}^3/\\text{s}$$",
        target: "**Target: 5.00 m³/s | Accepted range: 4.80 to 5.20.** The extra $1\\ \\text{m}^3/\\text{s}$ is leakage.",
      },
    },
    {
      id: "aux-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "The auxiliary fan delivers $5\\ \\text{m}^3/\\text{s}$ through a duct of resistance $R = 3\\ \\text{N·s}^2/\\text{m}^8$. The air power of the fan is ______ W. (Round off to the nearest whole number.)",
      natAnswer: 375,
      acceptedRange: [365, 385],
      unit: "W",
      solution: {
        given: "$Q_{fan} = 5\\ \\text{m}^3/\\text{s}$, $R = 3\\ \\text{N·s}^2/\\text{m}^8$.",
        derivation:
          "Duct pressure: $P = R\\,Q^2 = 3\\times 5^2 = 75\\ \\text{Pa}$.\n$$P_a = P\\,Q_{fan} = 75\\times 5 = 375\\ \\text{W}$$",
        target: "**Target: 375 W | Accepted range: 365 to 385.**",
      },
    },
  ],
};

const ventilationMineFires: LearnTopic = {
  slug: "ventilation-mine-fires",
  subject: "Mine Ventilation",
  title: "Mine Fires & Explosions",
  tier: "premium",
  blurb:
    "Methane explosibility limits, Graham's ratio for early heating detection, and the oxygen-deficiency calculation behind it.",
  module: {
    principle:
      "Underground fires and explosions hinge on gas chemistry. **Methane** is explosive only within its flammable band (roughly 5–15% in air), most violently near 9.5%. To detect a **heating** before it flames, mine atmospheres are monitored for carbon monoxide: **Graham's ratio** expresses the CO produced per unit of oxygen consumed, rising sharply as spontaneous combustion develops. The oxygen actually consumed is estimated from the measured nitrogen and oxygen via the **oxygen-deficiency** formula.",
    formulaMatrix: [
      "**Methane flammable range**: ≈ $5\\%$ (LEL) to $15\\%$ (UEL); most explosive near $9.5\\%$.",
      "",
      "**Graham's ratio (CO index)**: $$GR = \\frac{\\text{CO}}{\\text{O}_2\\ \\text{deficiency}}\\times 100$$",
      "",
      "**Oxygen deficiency**: $\\text{O}_2\\ \\text{def} = 0.265\\,N_2 - O_2$  (gas concentrations in %).",
    ].join("\n"),
    traps: [
      "**Lower explosive limit of CH₄ is 5%, not 9.5%.** 9.5% is the *most violent* mixture, not the lower limit.",
      "**Graham's ratio uses O₂ *deficiency*, not the measured O₂.** Dividing by raw O₂ understates the index.",
      "**The 0.265 factor reconstructs the original O₂** from the (inert) nitrogen; omit it and the deficiency is meaningless.",
    ],
  },
  questions: [
    {
      id: "fire-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "The lower explosive limit (LEL) of methane in air is approximately:",
      options: ["$5\\%$", "$15\\%$", "$9.5\\%$", "$1\\%$"],
      answer: 0,
      solution: {
        given: "Methane flammable range in air.",
        derivation: "Methane is explosive between about $5\\%$ (LEL) and $15\\%$ (UEL), most violently near $9.5\\%$.",
        target: "**Correct option: $5\\%$.** $15\\%$ is the upper limit; $9.5\\%$ is the most explosive mixture.",
      },
    },
    {
      id: "fire-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A return-airway sample shows $\\text{CO} = 0.05\\%$ with an oxygen deficiency of $0.40\\%$. Graham's ratio is ______. (Round off to two decimal places.)",
      natAnswer: 12.5,
      acceptedRange: [12.0, 13.0],
      solution: {
        given: "$\\text{CO} = 0.05\\%$, $\\text{O}_2\\ \\text{def} = 0.40\\%$.",
        derivation: "$$GR = \\frac{\\text{CO}}{\\text{O}_2\\ \\text{def}}\\times 100 = \\frac{0.05}{0.40}\\times 100 = 12.5$$",
        target: "**Target: 12.50 | Accepted range: 12.00 to 13.00.** A rising Graham's ratio warns of active heating.",
      },
    },
    {
      id: "fire-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "An air sample contains $N_2 = 80\\%$ and $O_2 = 20\\%$. The oxygen deficiency is ______ %. (Round off to two decimal places.)",
      natAnswer: 1.2,
      acceptedRange: [1.0, 1.4],
      unit: "%",
      solution: {
        given: "$N_2 = 80\\%$, $O_2 = 20\\%$.",
        derivation: "$$\\text{O}_2\\ \\text{def} = 0.265\\,N_2 - O_2 = 0.265\\times 80 - 20 = 21.2 - 20 = 1.2\\%$$",
        target: "**Target: 1.20% | Accepted range: 1.00 to 1.40.** This deficiency feeds straight into Graham's ratio.",
      },
    },
  ],
};

const envNoisePollution: LearnTopic = {
  slug: "env-noise-pollution",
  subject: "Surface Environment",
  title: "Noise & Pollution Control",
  tier: "free",
  blurb:
    "How sound levels in decibels combine logarithmically — adding equal sources, mixing unequal ones, and the 3 dB doubling rule.",
  module: {
    principle:
      "Sound level in **decibels** is a logarithmic measure, so noise sources do not add arithmetically. **Doubling** the number of equal sources adds about **3 dB**; combining unequal levels requires converting each back to intensity, summing, and taking the logarithm again. This governs how machinery noise builds up on a mine bench and how exposure limits are assessed.",
    formulaMatrix: [
      "**$N$ equal sources** of level $L$: $$L_{total} = L + 10\\log_{10} N$$",
      "",
      "**Two (or more) unequal levels**: $$L_{total} = 10\\log_{10}\\!\\left(10^{L_1/10} + 10^{L_2/10} + \\cdots\\right)$$",
      "",
      "**Doubling rule**: two equal sources ⇒ $+10\\log_{10}2 \\approx +3\\ \\text{dB}$.",
    ].join("\n"),
    traps: [
      "**Decibels don't add arithmetically.** $90 + 90 \\ne 180\\ \\text{dB}$; two equal 90 dB sources give 93 dB.",
      "**Convert to intensity before summing unequal levels**, then take $10\\log_{10}$ — averaging the dB values is wrong.",
      "**Each doubling adds ~3 dB, not 6.** Four equal sources are $+6$ dB above one.",
    ],
  },
  questions: [
    {
      id: "noise-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "Two machines each producing $90\\ \\text{dB}$ operate together. The combined sound level is approximately:",
      options: ["$93\\ \\text{dB}$", "$180\\ \\text{dB}$", "$90\\ \\text{dB}$", "$96\\ \\text{dB}$"],
      answer: 0,
      solution: {
        given: "Two equal sources, $L = 90\\ \\text{dB}$, $N = 2$.",
        derivation: "$$L_{total} = L + 10\\log_{10} N = 90 + 10\\log_{10} 2 = 90 + 3.01 = 93.01\\ \\text{dB}$$",
        target: "**Correct option: $93\\ \\text{dB}$.** Decibels add logarithmically — never $180$.",
      },
    },
    {
      id: "noise-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Two sources of $85\\ \\text{dB}$ and $88\\ \\text{dB}$ operate together. The combined level is ______ dB. (Round off to two decimal places.)",
      natAnswer: 89.76,
      acceptedRange: [89.3, 90.2],
      unit: "dB",
      solution: {
        given: "$L_1 = 85\\ \\text{dB}$, $L_2 = 88\\ \\text{dB}$.",
        derivation:
          "$$L_{total} = 10\\log_{10}\\!\\left(10^{8.5} + 10^{8.8}\\right) = 10\\log_{10}(3.162\\times10^{8} + 6.310\\times10^{8}) = 89.76\\ \\text{dB}$$",
        target: "**Target: 89.76 dB | Accepted range: 89.30 to 90.20.**",
      },
    },
    {
      id: "noise-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Five identical machines, each $95\\ \\text{dB}$, run simultaneously. The total sound level is ______ dB. (Round off to two decimal places.)",
      natAnswer: 101.99,
      acceptedRange: [101.5, 102.5],
      unit: "dB",
      solution: {
        given: "$N = 5$ equal sources, $L = 95\\ \\text{dB}$.",
        derivation: "$$L_{total} = 95 + 10\\log_{10} 5 = 95 + 6.99 = 101.99\\ \\text{dB}$$",
        target: "**Target: 101.99 dB | Accepted range: 101.50 to 102.50.**",
      },
    },
  ],
};

/* ──────────────────────────────────────────────────────────────────── */
/*  SECTION 5 (fill) — Noise, Land reclamation, Inundation, Lighting,    */
/*  Rescue & occupational health                                         */
/* ──────────────────────────────────────────────────────────────────── */

const envNoiseExposure: LearnTopic = {
  slug: "env-noise-exposure",
  subject: "Environment, Ventilation & Hazards",
  title: "Noise Exposure & Permissible Time",
  tier: "subject",
  blurb:
    "Permissible daily exposure time from sound level, and the cumulative noise dose when levels vary through the shift.",
  module: {
    principle:
      "Hearing damage depends on both **level and duration**. Standards set a permissible **exposure time** that halves with every 5 dBA rise above the 90 dBA / 8-hour reference (the 5 dB exchange rate). When a worker meets several levels, the **noise dose** sums the actual time at each level over the permissible time for that level; a dose above 100 % is over-exposure.",
    formulaMatrix: [
      "**Permissible time**: $$T = \\frac{8}{2^{(L-90)/5}}\\ \\text{hours}$$ ($L$ in dBA).",
      "",
      "**Noise dose**: $D = \\left(\\sum \\dfrac{C_i}{T_i}\\right)\\times 100\\%$",
      "$C_i$ = actual time at level $i$, $T_i$ = permissible time at that level.",
    ].join("\n"),
    traps: [
      "**5 dB exchange rate**: every +5 dBA halves the allowed time (some standards use 3 dB).",
      "**Dose > 100 % means over-exposure**, regardless of any single level being 'within limit'.",
      "**Use permissible time $T_i$ in the denominator**, not 8 hours, for each level.",
    ],
  },
  questions: [
    {
      id: "noise-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "At a steady $95\\ \\text{dBA}$, the permissible daily exposure time (90 dBA/8 h reference, 5 dB rule) is:",
      options: ["$4\\ \\text{h}$", "$8\\ \\text{h}$", "$2\\ \\text{h}$", "$16\\ \\text{h}$"],
      answer: 0,
      solution: {
        given: "$L = 95\\ \\text{dBA}$.",
        derivation: "$$T = \\frac{8}{2^{(95-90)/5}} = \\frac{8}{2^1} = 4\\ \\text{h}$$",
        target: "**Correct option: $4\\ \\text{h}$.** Each +5 dBA halves the time.",
      },
    },
    {
      id: "noise-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "The permissible exposure time at $100\\ \\text{dBA}$ is ______ hours. (Round off to two decimal places.)",
      natAnswer: 2,
      acceptedRange: [1.9, 2.1],
      unit: "hours",
      solution: {
        given: "$L = 100\\ \\text{dBA}$.",
        derivation: "$$T = \\frac{8}{2^{(100-90)/5}} = \\frac{8}{2^2} = \\frac{8}{4} = 2\\ \\text{h}$$",
        target: "**Target: 2.00 hours | Accepted range: 1.90 to 2.10.**",
      },
    },
    {
      id: "noise-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A worker spends $4\\ \\text{h}$ at $95\\ \\text{dBA}$ ($T=4$) and $2\\ \\text{h}$ at $100\\ \\text{dBA}$ ($T=2$). The total noise dose is ______ %. (Round off to two decimal places.)",
      natAnswer: 200,
      acceptedRange: [195, 205],
      unit: "%",
      solution: {
        given: "$C_1{=}4,T_1{=}4$; $C_2{=}2,T_2{=}2$.",
        derivation: "$$D = \\left(\\frac{4}{4} + \\frac{2}{2}\\right)\\times 100 = (1+1)\\times 100 = 200\\%$$",
        target: "**Target: 200 % | Accepted range: 195 to 205.** Twice the permissible dose — clear over-exposure.",
      },
    },
  ],
};

const envLandReclamation: LearnTopic = {
  slug: "env-land-reclamation",
  subject: "Environment, Ventilation & Hazards",
  title: "Land Reclamation (Earthwork & Backfill)",
  tier: "subject",
  blurb:
    "Topsoil and backfill volumes, the truck loads to move them allowing for swell, and balancing spoil against pit volume.",
  module: {
    principle:
      "Reclamation re-establishes land after mining: spreading **topsoil**, **backfilling** voids and regrading spoil. Volumes are area times depth. Because excavated material **bulks (swells)**, the loose volume to be hauled exceeds the in-situ (bank) volume by the swell factor — which sets the number of truck loads. A **cut–fill balance** checks whether the available spoil meets the backfill requirement.",
    formulaMatrix: [
      "**Layer volume**: $V = \\text{area}\\times\\text{depth}$.",
      "",
      "**Loose volume / truck loads**: $V_{loose} = V\\times\\text{swell}$; loads $= V_{loose}/V_{truck}$.",
      "",
      "**Cut–fill balance**: surplus $= \\dfrac{V_{spoil,loose}}{\\text{swell}} - V_{backfill}$.",
    ].join("\n"),
    traps: [
      "**Swell increases hauled volume**; multiply bank volume by the swell factor for loose volume.",
      "**Backfill volume is in-situ (compacted)**; convert loose spoil back to bank volume before comparing.",
      "**Keep area and depth in consistent units** before multiplying.",
    ],
  },
  questions: [
    {
      id: "recl-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Spreading topsoil $0.3\\ \\text{m}$ deep over $10{,}000\\ \\text{m}^2$ needs a topsoil volume of:",
      options: ["$3000\\ \\text{m}^3$", "$300\\ \\text{m}^3$", "$30000\\ \\text{m}^3$", "$333\\ \\text{m}^3$"],
      answer: 0,
      solution: {
        given: "Area $= 10000\\ \\text{m}^2$, depth $= 0.3\\ \\text{m}$.",
        derivation: "$$V = 10000\\times 0.3 = 3000\\ \\text{m}^3$$",
        target: "**Correct option: $3000\\ \\text{m}^3$.**",
      },
    },
    {
      id: "recl-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Hauling that $3000\\ \\text{m}^3$ (swell factor $1.25$) in $15\\ \\text{m}^3$ trucks needs ______ truck loads. (Round off to the nearest whole number.)",
      natAnswer: 250,
      acceptedRange: [245, 255],
      solution: {
        given: "$V = 3000\\ \\text{m}^3$, swell $= 1.25$, truck $= 15\\ \\text{m}^3$.",
        derivation: "$$\\text{loads} = \\frac{3000\\times 1.25}{15} = \\frac{3750}{15} = 250$$",
        target: "**Target: 250 | Accepted range: 245 to 255.**",
      },
    },
    {
      id: "recl-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A spoil bank of $60{,}000\\ \\text{m}^3$ loose (swell $1.2$) is used to backfill a pit of area $8000\\ \\text{m}^2$ to $5\\ \\text{m}$ depth. The surplus in-situ volume is ______ m³. (Round off to the nearest whole number.)",
      natAnswer: 10000,
      acceptedRange: [9800, 10200],
      unit: "m³",
      solution: {
        given: "$V_{spoil,loose}=60000$, swell $=1.2$; backfill $=8000\\times5=40000\\ \\text{m}^3$.",
        derivation:
          "Available bank $= 60000/1.2 = 50000\\ \\text{m}^3$.\n$$\\text{surplus} = 50000 - 40000 = 10000\\ \\text{m}^3$$",
        target: "**Target: 10000 m³ | Accepted range: 9800 to 10200.** Enough spoil with material to spare.",
      },
    },
  ],
};

const hazardMineInundation: LearnTopic = {
  slug: "hazard-mine-inundation",
  subject: "Environment, Ventilation & Hazards",
  title: "Mine Inundation (Water Hazards)",
  tier: "subject",
  blurb:
    "Hydrostatic pressure behind a water body, the time to pump out a flooded volume, and the pumping power required.",
  module: {
    principle:
      "**Inundation** is the sudden inrush of water into workings — from old flooded workings, aquifers or surface water. The static **hydrostatic pressure** at depth $h$ below a water surface is $\\rho g h$. Recovering a flooded mine means pumping out the **stored volume** at the available pump rate (time = volume/rate), and the **pumping power** to lift water against the head is $\\rho g Q H/\\eta$.",
    formulaMatrix: [
      "**Hydrostatic pressure**: $p = \\rho g h$.",
      "",
      "**Pump-out time**: $t = \\dfrac{V}{Q}$  ($V$ = flooded volume, $Q$ = pump rate).",
      "",
      "**Pumping power**: $P = \\dfrac{\\rho g Q H}{\\eta}$  ($Q$ in m³/s, $H$ = head).",
    ].join("\n"),
    traps: [
      "**Convert $Q$ to m³/s** for power (divide m³/h by 3600).",
      "**Hydrostatic pressure depends only on depth $h$**, not the water body's lateral extent.",
      "**Pump power divides by efficiency $\\eta$** — input power exceeds the hydraulic power.",
    ],
  },
  questions: [
    {
      id: "inun-q1",
      difficulty: "basic",
      marks: 1,
      type: "NAT",
      stem:
        "The hydrostatic pressure at the base of a $50\\ \\text{m}$ column of water ($\\rho=1000\\ \\text{kg/m}^3$, $g=9.81$) is ______ kPa. (Round off to two decimal places.)",
      natAnswer: 490.5,
      acceptedRange: [488, 493],
      unit: "kPa",
      solution: {
        given: "$\\rho=1000$, $g=9.81$, $h=50\\ \\text{m}$.",
        derivation: "$$p = \\rho g h = 1000\\times 9.81\\times 50 = 490500\\ \\text{Pa} = 490.5\\ \\text{kPa}$$",
        target: "**Target: 490.50 kPa | Accepted range: 488 to 493.**",
      },
    },
    {
      id: "inun-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A flooded section holds $18{,}000\\ \\text{m}^3$ of water; a pump delivers $50\\ \\text{m}^3/\\text{h}$. The time to pump it dry is ______ hours. (Round off to the nearest whole number.)",
      natAnswer: 360,
      acceptedRange: [355, 365],
      unit: "hours",
      solution: {
        given: "$V = 18000\\ \\text{m}^3$, $Q = 50\\ \\text{m}^3/\\text{h}$.",
        derivation: "$$t = \\frac{V}{Q} = \\frac{18000}{50} = 360\\ \\text{h}$$",
        target: "**Target: 360 hours | Accepted range: 355 to 365.**",
      },
    },
    {
      id: "inun-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Pumping $50\\ \\text{m}^3/\\text{h}$ against a $50\\ \\text{m}$ head at $70\\%$ efficiency requires a power of ______ kW. (Round off to two decimal places.)",
      natAnswer: 9.73,
      acceptedRange: [9.3, 10.2],
      unit: "kW",
      solution: {
        given: "$Q = 50/3600 = 0.01389\\ \\text{m}^3/\\text{s}$, $H = 50\\ \\text{m}$, $\\eta = 0.7$.",
        derivation:
          "$$P = \\frac{\\rho g Q H}{\\eta} = \\frac{1000\\times 9.81\\times 0.01389\\times 50}{0.7} = 9732\\ \\text{W} \\approx 9.73\\ \\text{kW}$$",
        target: "**Target: 9.73 kW | Accepted range: 9.30 to 10.20.**",
      },
    },
  ],
};

const hazardMineLighting: LearnTopic = {
  slug: "hazard-mine-lighting",
  subject: "Environment, Ventilation & Hazards",
  title: "Mine Lighting (Illuminance)",
  tier: "subject",
  blurb:
    "Illuminance from luminous flux over an area, the inverse-square law for point sources, and the flux needed for a target lux level.",
  module: {
    principle:
      "Adequate **illuminance** (lux = lumens per m²) is essential for safe working. Spread over a surface, $E = \\Phi/A$. From a point source the **inverse-square law** gives $E = I/d^2$ (illuminance falls with the square of distance). Designing a layout, the **lumen method** inflates the required flux by dividing by the utilisation and maintenance factors.",
    formulaMatrix: [
      "**Illuminance (area)**: $E = \\dfrac{\\Phi}{A}\\ [\\text{lux}]$.",
      "",
      "**Inverse-square law**: $E = \\dfrac{I}{d^2}$  ($I$ in candela, $d$ in m).",
      "",
      "**Lumen method (required flux)**: $\\Phi = \\dfrac{E\\times A}{UF\\times MF}$.",
    ].join("\n"),
    traps: [
      "**Illuminance falls as $1/d^2$** — doubling the distance quarters the light.",
      "**Lux = lumens / m²**; don't confuse luminous flux (lm) with illuminance (lux).",
      "**Divide by UF and MF** (both < 1) so the installed flux is larger than the bare requirement.",
    ],
  },
  questions: [
    {
      id: "light-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A luminaire delivering $2000\\ \\text{lm}$ uniformly over $20\\ \\text{m}^2$ gives an illuminance of:",
      options: ["$100\\ \\text{lux}$", "$40\\ \\text{lux}$", "$10\\ \\text{lux}$", "$400\\ \\text{lux}$"],
      answer: 0,
      solution: {
        given: "$\\Phi = 2000\\ \\text{lm}$, $A = 20\\ \\text{m}^2$.",
        derivation: "$$E = \\frac{\\Phi}{A} = \\frac{2000}{20} = 100\\ \\text{lux}$$",
        target: "**Correct option: $100\\ \\text{lux}$.**",
      },
    },
    {
      id: "light-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A point source of $200\\ \\text{cd}$ illuminates a surface $4\\ \\text{m}$ away (normal incidence). The illuminance is ______ lux. (Round off to two decimal places.)",
      natAnswer: 12.5,
      acceptedRange: [12, 13],
      unit: "lux",
      solution: {
        given: "$I = 200\\ \\text{cd}$, $d = 4\\ \\text{m}$.",
        derivation: "$$E = \\frac{I}{d^2} = \\frac{200}{16} = 12.5\\ \\text{lux}$$",
        target: "**Target: 12.50 lux | Accepted range: 12 to 13.**",
      },
    },
    {
      id: "light-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "To achieve $150\\ \\text{lux}$ over $50\\ \\text{m}^2$ with utilisation factor $0.6$ and maintenance factor $0.8$, the required luminous flux is ______ lm. (Round off to the nearest whole number.)",
      natAnswer: 15625,
      acceptedRange: [15400, 15900],
      unit: "lm",
      solution: {
        given: "$E=150$, $A=50$, $UF=0.6$, $MF=0.8$.",
        derivation: "$$\\Phi = \\frac{E\\times A}{UF\\times MF} = \\frac{150\\times 50}{0.6\\times 0.8} = \\frac{7500}{0.48} = 15625\\ \\text{lm}$$",
        target: "**Target: 15625 lm | Accepted range: 15400 to 15900.**",
      },
    },
  ],
};

const hazardSafetyHealth: LearnTopic = {
  slug: "hazard-safety-health",
  subject: "Environment, Ventilation & Hazards",
  title: "Rescue Apparatus, Safety & Occupational Health",
  tier: "premium",
  blurb:
    "Breathing-apparatus endurance from oxygen capacity and consumption, and the accident frequency rate per million man-hours.",
  module: {
    principle:
      "Mine rescue relies on **self-contained breathing apparatus**; its endurance is the usable oxygen volume divided by the wearer's consumption rate, with a reserve held back. Safety performance is tracked statistically: the **accident frequency rate** normalises the number of reportable accidents to a fixed exposure (commonly per million man-hours), allowing fair comparison across operations.",
    formulaMatrix: [
      "**Apparatus duration**: $t = \\dfrac{V_{usable}}{\\text{consumption rate}}$  (subtract any reserve first).",
      "",
      "**Accident frequency rate**: $$FR = \\frac{\\text{number of accidents}\\times 10^6}{\\text{man-hours worked}}$$",
    ].join("\n"),
    traps: [
      "**Subtract the reserve** before dividing by consumption — usable volume, not total.",
      "**FR is per $10^6$ man-hours** (a common convention); keep the multiplier consistent.",
      "**Consumption is per minute** — duration comes out in minutes.",
    ],
  },
  questions: [
    {
      id: "safe-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A breathing set has $300\\ \\text{L}$ of usable oxygen; the wearer uses $1.5\\ \\text{L/min}$. Its duration is:",
      options: ["$200\\ \\text{min}$", "$450\\ \\text{min}$", "$100\\ \\text{min}$", "$300\\ \\text{min}$"],
      answer: 0,
      solution: {
        given: "$V_{usable} = 300\\ \\text{L}$, rate $= 1.5\\ \\text{L/min}$.",
        derivation: "$$t = \\frac{300}{1.5} = 200\\ \\text{min}$$",
        target: "**Correct option: $200\\ \\text{min}$.**",
      },
    },
    {
      id: "safe-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A cylinder holds $360\\ \\text{L}$ but $60\\ \\text{L}$ is kept as reserve; consumption is $2\\ \\text{L/min}$. The usable working duration is ______ min. (Round off to the nearest whole number.)",
      natAnswer: 150,
      acceptedRange: [145, 155],
      unit: "min",
      solution: {
        given: "Total $=360\\ \\text{L}$, reserve $=60\\ \\text{L}$, rate $=2\\ \\text{L/min}$.",
        derivation: "$$t = \\frac{360 - 60}{2} = \\frac{300}{2} = 150\\ \\text{min}$$",
        target: "**Target: 150 min | Accepted range: 145 to 155.**",
      },
    },
    {
      id: "safe-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A mine records $6$ reportable accidents over $1{,}200{,}000$ man-hours. The accident frequency rate (per million man-hours) is ______. (Round off to two decimal places.)",
      natAnswer: 5,
      acceptedRange: [4.8, 5.2],
      solution: {
        given: "$6$ accidents, $1.2\\times10^6$ man-hours.",
        derivation: "$$FR = \\frac{6\\times 10^6}{1.2\\times10^6} = 5$$",
        target: "**Target: 5.00 | Accepted range: 4.80 to 5.20.**",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 6 — Mining & Mineral Economics, Resource Management          */
/* ════════════════════════════════════════════════════════════════════ */

const ecDcfNpv: LearnTopic = {
  slug: "ec-dcf-npv",
  subject: "Mining Economics",
  title: "Discounted Cash Flow & NPV",
  tier: "free",
  blurb:
    "The time value of money — discounting future cash to the present and judging a mine project by its net present value.",
  module: {
    principle:
      "A rupee received in the future is worth less than one today, because money can earn a return in the meantime. **Discounting** brings each future cash flow back to its **present value** by dividing by $(1+i)^n$. A project's **net present value (NPV)** is the sum of all discounted inflows minus the initial investment; a positive NPV means the project earns more than the discount rate and is worth pursuing.",
    formulaMatrix: [
      "**Present value of a single future amount**: $$PV = \\frac{FV}{(1+i)^n}$$ $i$ = discount rate per period, $n$ = number of periods.",
      "",
      "**Net present value**: $$NPV = -C_0 + \\sum_{t=1}^{n}\\frac{CF_t}{(1+i)^t}$$ $C_0$ = initial investment, $CF_t$ = cash flow in year $t$.",
    ].join("\n"),
    traps: [
      "**Discount each year by its own exponent.** Year 3 cash divides by $(1+i)^3$, not $(1+i)$; using a single year understates the discounting.",
      "**Subtract the initial outlay $C_0$.** NPV is *net* — forgetting $-C_0$ turns it into a gross present value.",
      "**Rate as a decimal.** $i = 10\\%$ means $0.10$; mixing percent and decimal corrupts $(1+i)^n$.",
    ],
  },
  questions: [
    {
      id: "dcf-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "At a discount rate of $10\\%$, the present value of $\\,\\text{₹}1100$ received one year from now is:",
      options: ["$\\text{₹}1000$", "$\\text{₹}990$", "$\\text{₹}1210$", "$\\text{₹}1100$"],
      answer: 0,
      solution: {
        given: "$FV = 1100$, $i = 0.10$, $n = 1$.",
        derivation: "$$PV = \\frac{FV}{(1+i)^n} = \\frac{1100}{1.10} = 1000$$",
        target: "**Correct option: ₹1000.** ₹1210 compounds forward instead of discounting back.",
      },
    },
    {
      id: "dcf-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "The present value of $\\,\\text{₹}1000$ to be received in $3$ years at a discount rate of $10\\%$ is ₹______. (Round off to two decimal places.)",
      natAnswer: 751.31,
      acceptedRange: [748, 755],
      unit: "₹",
      solution: {
        given: "$FV = 1000$, $i = 0.10$, $n = 3$.",
        derivation: "$$PV = \\frac{1000}{(1.10)^3} = \\frac{1000}{1.331} = 751.31$$",
        target: "**Target: ₹751.31 | Accepted range: 748 to 755.**",
      },
    },
    {
      id: "dcf-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A project costs $\\,\\text{₹}1000$ today and returns $\\,\\text{₹}500$ at the end of each of the next $3$ years. At a discount rate of $10\\%$, the NPV is ₹______. (Round off to two decimal places.)",
      natAnswer: 243.43,
      acceptedRange: [240, 247],
      unit: "₹",
      solution: {
        given: "$C_0 = 1000$, $CF_t = 500$ for $t=1,2,3$, $i = 0.10$.",
        derivation:
          "$$NPV = -1000 + \\frac{500}{1.1} + \\frac{500}{1.21} + \\frac{500}{1.331}$$\n$$= -1000 + 454.55 + 413.22 + 375.66 = 243.43$$",
        target: "**Target: ₹243.43 | Accepted range: 240 to 247.** Positive ⇒ project beats the 10% hurdle rate.",
      },
    },
  ],
};

const ecReliability: LearnTopic = {
  slug: "ec-reliability",
  subject: "Mining Economics",
  title: "Reliability of Systems",
  tier: "subject",
  blurb:
    "Series and parallel reliability — why a chain is only as strong as its weakest link, and why redundancy multiplies dependability.",
  module: {
    principle:
      "Mine equipment forms reliability networks. In a **series** arrangement every component must work for the system to function, so reliabilities **multiply** — the system is always less reliable than its weakest part. In a **parallel** (redundant) arrangement the system fails only if *all* paths fail, so we multiply the **failure** probabilities and subtract from one — redundancy dramatically raises dependability.",
    formulaMatrix: [
      "**Series system**: $$R_s = R_1 \\times R_2 \\times \\cdots \\times R_n = \\prod R_i$$",
      "",
      "**Parallel (redundant) system**: $$R_p = 1 - \\prod (1 - R_i)$$",
      "",
      "$R_i$ = reliability of component $i$ (probability it works).",
    ].join("\n"),
    traps: [
      "**Series multiplies reliabilities, not failure rates.** $R_s = \\prod R_i$; adding them is wrong and can exceed 1.",
      "**Parallel multiplies the *failures* $(1-R_i)$.** Multiplying the reliabilities themselves gives a lower (incorrect) answer.",
      "**Decompose mixed systems block by block.** Reduce each parallel sub-block first, then combine in series.",
    ],
  },
  questions: [
    {
      id: "rel-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Two components, each of reliability $0.9$, are connected in series. The system reliability is:",
      options: ["$0.81$", "$0.99$", "$0.90$", "$1.80$"],
      answer: 0,
      solution: {
        given: "$R_1 = R_2 = 0.9$, series.",
        derivation: "$$R_s = R_1\\times R_2 = 0.9\\times 0.9 = 0.81$$",
        target: "**Correct option: $0.81$.** $0.99$ is the *parallel* result; series is always lower.",
      },
    },
    {
      id: "rel-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "The same two components ($R = 0.9$ each) are connected in parallel. The system reliability is ______. (Round off to two decimal places.)",
      natAnswer: 0.99,
      acceptedRange: [0.98, 1.0],
      solution: {
        given: "$R_1 = R_2 = 0.9$, parallel.",
        derivation: "$$R_p = 1 - (1-0.9)(1-0.9) = 1 - (0.1)(0.1) = 1 - 0.01 = 0.99$$",
        target: "**Target: 0.99 | Accepted range: 0.98 to 1.00.** Redundancy lifts 0.9 to 0.99.",
      },
    },
    {
      id: "rel-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Two components of reliability $0.8$ each are in parallel, and that block is in series with a third component of reliability $0.9$. The overall system reliability is ______. (Round off to three decimal places.)",
      natAnswer: 0.864,
      acceptedRange: [0.85, 0.88],
      solution: {
        given: "Parallel block: $R = 0.8, 0.8$; series component $R = 0.9$.",
        derivation:
          "Parallel block: $R_p = 1 - (1-0.8)^2 = 1 - 0.04 = 0.96$.\nSeries with 0.9:\n$$R = R_p\\times 0.9 = 0.96\\times 0.9 = 0.864$$",
        target: "**Target: 0.864 | Accepted range: 0.850 to 0.880.**",
      },
    },
  ],
};

const ecQueueing: LearnTopic = {
  slug: "ec-queueing",
  subject: "Mining Economics",
  title: "Queueing Theory (M/M/1)",
  tier: "subject",
  blurb:
    "The single-server queue — utilization, average number in the system, and average waiting time for shovel–truck and service problems.",
  module: {
    principle:
      "Truck-and-shovel and workshop-service problems are modelled as an **M/M/1 queue**: Poisson arrivals at rate $\\lambda$ and exponential service at rate $\\mu$ with one server. The **utilization** $\\rho = \\lambda/\\mu$ must be below 1 for a stable queue. From it follow the average **number in the system** $L_s$ and the average **waiting time**, which grow sharply as $\\rho$ approaches 1.",
    formulaMatrix: [
      "**Utilization**: $\\rho = \\dfrac{\\lambda}{\\mu}$  (must be $<1$).",
      "",
      "**Average number in system**: $L_s = \\dfrac{\\lambda}{\\mu-\\lambda} = \\dfrac{\\rho}{1-\\rho}$.",
      "",
      "**Average number in queue**: $L_q = \\dfrac{\\rho^2}{1-\\rho}$.",
      "",
      "**Average waiting time in queue**: $W_q = \\dfrac{\\lambda}{\\mu(\\mu-\\lambda)}$;  in system $W_s = \\dfrac{1}{\\mu-\\lambda}$.",
    ].join("\n"),
    traps: [
      "**$\\rho = \\lambda/\\mu$, not $\\mu/\\lambda$.** Utilization must be below 1; the inverse exceeds 1 and is meaningless here.",
      "**$L_s$ counts the one in service plus those waiting**, so $L_s = \\lambda/(\\mu-\\lambda)$, larger than $L_q$.",
      "**Keep $\\lambda$ and $\\mu$ in the same time unit.** Mixing per-hour and per-minute corrupts every result.",
    ],
  },
  questions: [
    {
      id: "que-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Trucks arrive at a crusher at $\\lambda = 6$ per hour and are served at $\\mu = 10$ per hour. The server utilization is:",
      options: ["$0.60$", "$1.67$", "$0.40$", "$6.0$"],
      answer: 0,
      solution: {
        given: "$\\lambda = 6/\\text{hr}$, $\\mu = 10/\\text{hr}$.",
        derivation: "$$\\rho = \\frac{\\lambda}{\\mu} = \\frac{6}{10} = 0.60$$",
        target: "**Correct option: $0.60$.** $1.67 = \\mu/\\lambda$ (inverted) and would imply an unstable queue.",
      },
    },
    {
      id: "que-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "For $\\lambda = 6$/hr and $\\mu = 10$/hr (M/M/1), the average number of trucks in the system is ______. (Round off to two decimal places.)",
      natAnswer: 1.5,
      acceptedRange: [1.4, 1.6],
      solution: {
        given: "$\\lambda = 6$, $\\mu = 10$ per hour.",
        derivation: "$$L_s = \\frac{\\lambda}{\\mu-\\lambda} = \\frac{6}{10-6} = \\frac{6}{4} = 1.5$$",
        target: "**Target: 1.50 | Accepted range: 1.40 to 1.60.**",
      },
    },
    {
      id: "que-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For $\\lambda = 6$/hr and $\\mu = 10$/hr, the average waiting time in the queue is ______ hours. (Round off to two decimal places.)",
      natAnswer: 0.15,
      acceptedRange: [0.14, 0.16],
      unit: "hr",
      solution: {
        given: "$\\lambda = 6$, $\\mu = 10$ per hour.",
        derivation:
          "$$W_q = \\frac{\\lambda}{\\mu(\\mu-\\lambda)} = \\frac{6}{10\\times(10-6)} = \\frac{6}{40} = 0.15\\ \\text{hr}\\ (= 9\\ \\text{min})$$",
        target: "**Target: 0.15 hr | Accepted range: 0.14 to 0.16.**",
      },
    },
  ],
};

const ecLinearProgramming: LearnTopic = {
  slug: "ec-linear-programming",
  subject: "Mining Economics",
  title: "Linear Programming",
  tier: "premium",
  blurb:
    "Optimising a linear objective over a polygon of constraints — the optimum always sits at a corner of the feasible region.",
  module: {
    principle:
      "Many mine-planning problems — blending, allocation, transport — maximise (or minimise) a **linear objective** subject to **linear constraints**. The feasible region is a convex polygon, and a fundamental result guarantees the optimum lies at one of its **corner (vertex) points**. The graphical method therefore reduces to finding the corners and evaluating the objective at each.",
    formulaMatrix: [
      "**Standard form**: maximise $Z = c_1 x + c_2 y$ subject to $a_i x + b_i y \\le d_i$, $x,y \\ge 0$.",
      "",
      "**Corner-point theorem**: the optimum of $Z$ over a bounded feasible region occurs at a **vertex**.",
      "",
      "**Method**: find all corner points (constraint intersections), evaluate $Z$ at each, pick the best.",
    ].join("\n"),
    traps: [
      "**Optima are at vertices, not interior points.** Don't test the centroid; test the corners.",
      "**Include the axes' intercepts and constraint intersections** — and discard any vertex that violates another constraint.",
      "**Check feasibility of each candidate corner.** A constraint intersection outside the region is not a valid vertex.",
    ],
  },
  questions: [
    {
      id: "lp-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "For the objective $Z = 3x + 2y$, the value at the point $(2,\\,2)$ is:",
      options: ["$10$", "$4$", "$12$", "$6$"],
      answer: 0,
      solution: {
        given: "$Z = 3x + 2y$, point $(2,2)$.",
        derivation: "$$Z = 3(2) + 2(2) = 6 + 4 = 10$$",
        target: "**Correct option: $10$.** Substitute coordinates directly into the objective.",
      },
    },
    {
      id: "lp-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Maximise $Z = 3x + 2y$ subject to $x + y \\le 4$, $x \\le 3$, $x,y \\ge 0$. The maximum value of $Z$ is ______. (Round off to two decimal places.)",
      natAnswer: 11,
      acceptedRange: [10.5, 11.5],
      solution: {
        given: "Constraints $x+y\\le4$, $x\\le3$, $x,y\\ge0$.",
        derivation:
          "Corner points: $(0,0)\\,Z{=}0$, $(3,0)\\,Z{=}9$, $(3,1)\\,Z{=}11$, $(0,4)\\,Z{=}8$.\nMaximum at $(3,1)$:\n$$Z = 3(3) + 2(1) = 11$$",
        target: "**Target: 11.00 | Accepted range: 10.50 to 11.50.** The optimum is the vertex $(3,1)$.",
      },
    },
    {
      id: "lp-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Maximise $Z = 5x + 4y$ subject to $6x + 4y \\le 24$, $x + 2y \\le 6$, $x,y \\ge 0$. The maximum value of $Z$ is ______. (Round off to two decimal places.)",
      natAnswer: 21,
      acceptedRange: [20.5, 21.5],
      solution: {
        given: "Constraints $6x+4y\\le24$, $x+2y\\le6$, $x,y\\ge0$.",
        derivation:
          "Intersection of $6x+4y=24$ and $x+2y=6$: solving gives $x=3$, $y=1.5$.\nCorner values: $(4,0)\\,Z{=}20$, $(0,3)\\,Z{=}12$, $(3,1.5)\\,Z{=}21$.\nMaximum at $(3,1.5)$:\n$$Z = 5(3) + 4(1.5) = 15 + 6 = 21$$",
        target: "**Target: 21.00 | Accepted range: 20.50 to 21.50.**",
      },
    },
  ],
};

/* ──────────────────────────────────────────────────────────────────── */
/*  SECTION 6 (fill) — Resource classification, Reserve estimation,      */
/*  Mineral taxation, Facility location, Cost-benefit & work study       */
/* ──────────────────────────────────────────────────────────────────── */

const ecResourceClassification: LearnTopic = {
  slug: "ec-resource-classification",
  subject: "Mining & Mineral Economics",
  title: "Resource & Reserve Classification",
  tier: "subject",
  blurb:
    "Turning a measured deposit into tonnage: in-situ mass from geometry and density, then recoverable reserve after mining losses.",
  module: {
    principle:
      "A mineral **resource** becomes a **reserve** once economic and technical modifying factors are applied. The **in-situ tonnage** of a tabular deposit is its area times thickness times density. The **recoverable reserve** is that in-situ tonnage multiplied by the **recovery factor** — the fraction the chosen method can actually extract. Confidence levels (measured/indicated/inferred) classify how well the geometry and grade are known.",
    formulaMatrix: [
      "**In-situ tonnage**: $T = A\\times t\\times \\rho$  ($A$ = area, $t$ = thickness, $\\rho$ = density).",
      "",
      "**Recoverable reserve**: $T_{rec} = T\\times R$  ($R$ = recovery factor).",
    ].join("\n"),
    traps: [
      "**Keep units consistent**: area in m², thickness in m, density in t/m³ ⇒ tonnes.",
      "**Resource ≠ reserve.** Reserve is what's economically recoverable, after the recovery factor.",
      "**Apply recovery to in-situ tonnage**, not the other way round.",
    ],
  },
  questions: [
    {
      id: "res-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A tabular orebody covers $50{,}000\\ \\text{m}^2$, is $4\\ \\text{m}$ thick, density $2.5\\ \\text{t/m}^3$. Its in-situ tonnage is:",
      options: ["$500{,}000\\ \\text{t}$", "$200{,}000\\ \\text{t}$", "$1{,}250{,}000\\ \\text{t}$", "$50{,}000\\ \\text{t}$"],
      answer: 0,
      solution: {
        given: "$A=50000\\ \\text{m}^2$, $t=4\\ \\text{m}$, $\\rho=2.5\\ \\text{t/m}^3$.",
        derivation: "$$T = 50000\\times 4\\times 2.5 = 500{,}000\\ \\text{t}$$",
        target: "**Correct option: $500{,}000\\ \\text{t}$.**",
      },
    },
    {
      id: "res-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "If that $500{,}000\\ \\text{t}$ in-situ deposit is mined at $80\\%$ recovery, the recoverable reserve is ______ tonnes. (Round off to the nearest whole number.)",
      natAnswer: 400000,
      acceptedRange: [395000, 405000],
      unit: "t",
      solution: {
        given: "$T = 500000\\ \\text{t}$, $R = 0.80$.",
        derivation: "$$T_{rec} = 500000\\times 0.80 = 400{,}000\\ \\text{t}$$",
        target: "**Target: 400000 t | Accepted range: 395000 to 405000.**",
      },
    },
    {
      id: "res-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A proved block of area $120{,}000\\ \\text{m}^2$, average thickness $3.5\\ \\text{m}$, density $2.7\\ \\text{t/m}^3$ is mined at $75\\%$ recovery. The recoverable reserve is ______ tonnes. (Round off to the nearest whole number.)",
      natAnswer: 850500,
      acceptedRange: [845000, 856000],
      unit: "t",
      solution: {
        given: "$A=120000$, $t=3.5$, $\\rho=2.7$, $R=0.75$.",
        derivation:
          "In-situ $= 120000\\times 3.5\\times 2.7 = 1{,}134{,}000\\ \\text{t}$.\n$$T_{rec} = 1{,}134{,}000\\times 0.75 = 850{,}500\\ \\text{t}$$",
        target: "**Target: 850500 t | Accepted range: 845000 to 856000.**",
      },
    },
  ],
};

const ecReserveEstimation: LearnTopic = {
  slug: "ec-reserve-estimation",
  subject: "Mining & Mineral Economics",
  title: "Sampling & Reserve Estimation",
  tier: "subject",
  blurb:
    "The length-weighted average grade that combines drill-core samples of unequal length into a single representative grade.",
  module: {
    principle:
      "Drill-core or channel samples have **different lengths**, so a simple arithmetic mean is biased. The correct representative grade is the **length-weighted average** — each grade weighted by its sample length, summed and divided by the total length. This honours the fact that a long, low-grade interval contributes more metal than a short, high-grade one.",
    formulaMatrix: [
      "**Length-weighted average grade**: $$\\bar{g} = \\frac{\\sum (g_i\\,l_i)}{\\sum l_i}$$",
      "$g_i$ = grade of sample $i$, $l_i$ = its length.",
    ].join("\n"),
    traps: [
      "**Weight by length, not count.** A plain average over-weights short samples.",
      "**Use the metal-content sum** $\\sum g_i l_i$ on top, total length on the bottom.",
      "**Keep grade units consistent** (all % or all g/t) before combining.",
    ],
  },
  questions: [
    {
      id: "est-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Two samples: $2\\%$ over $3\\ \\text{m}$ and $4\\%$ over $1\\ \\text{m}$. The length-weighted average grade is:",
      options: ["$2.5\\%$", "$3.0\\%$", "$10\\%$", "$2.0\\%$"],
      answer: 0,
      solution: {
        given: "$g_1{=}2\\%,l_1{=}3$; $g_2{=}4\\%,l_2{=}1$.",
        derivation: "$$\\bar{g} = \\frac{2\\times3 + 4\\times1}{3+1} = \\frac{10}{4} = 2.5\\%$$",
        target: "**Correct option: $2.5\\%$.** $3.0\\%$ is the (wrong) simple average.",
      },
    },
    {
      id: "est-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Grades $1.5,\\,2.0,\\,3.0\\ \\text{g/t}$ over lengths $2,\\,3,\\,5\\ \\text{m}$. The weighted average grade is ______ g/t. (Round off to two decimal places.)",
      natAnswer: 2.4,
      acceptedRange: [2.3, 2.5],
      unit: "g/t",
      solution: {
        given: "Grades and lengths as listed; $\\sum l = 10\\ \\text{m}$.",
        derivation:
          "$$\\bar{g} = \\frac{1.5(2) + 2.0(3) + 3.0(5)}{2+3+5} = \\frac{3 + 6 + 15}{10} = \\frac{24}{10} = 2.4\\ \\text{g/t}$$",
        target: "**Target: 2.40 g/t | Accepted range: 2.30 to 2.50.**",
      },
    },
    {
      id: "est-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Four drill intersections grade $0.8,\\,1.2,\\,1.0,\\,1.4\\%$ over $5,\\,5,\\,10,\\,5\\ \\text{m}$. The weighted average grade is ______ %. (Round off to two decimal places.)",
      natAnswer: 1.08,
      acceptedRange: [1.0, 1.15],
      unit: "%",
      solution: {
        given: "Grades and lengths as listed; $\\sum l = 25\\ \\text{m}$.",
        derivation:
          "$$\\bar{g} = \\frac{0.8(5) + 1.2(5) + 1.0(10) + 1.4(5)}{25} = \\frac{4 + 6 + 10 + 7}{25} = \\frac{27}{25} = 1.08\\%$$",
        target: "**Target: 1.08 % | Accepted range: 1.00 to 1.15.**",
      },
    },
  ],
};

const ecMineralTaxation: LearnTopic = {
  slug: "ec-mineral-taxation",
  subject: "Mining & Mineral Economics",
  title: "Mineral Taxation",
  tier: "subject",
  blurb:
    "Royalty as a share of value, profit after corporate tax, and net profit once both royalty and tax are deducted.",
  module: {
    principle:
      "Mineral projects pay the state through **royalty** (a charge on production, often a percentage of value or a rate per tonne) and **corporate income tax** on profit. **Profit after tax** is profit before tax times $(1-\\text{tax rate})$. Net profit is what remains after royalty is deducted from revenue, operating costs are removed, and tax is applied to the resulting taxable profit.",
    formulaMatrix: [
      "**Royalty**: $\\text{Royalty} = \\text{rate}\\times\\text{value}$.",
      "",
      "**Profit after tax**: $PAT = PBT\\times(1 - \\text{tax rate})$.",
      "",
      "**Taxable profit**: $PBT = \\text{revenue} - \\text{royalty} - \\text{operating cost}$.",
    ].join("\n"),
    traps: [
      "**Royalty is usually on revenue/value**, deducted before tax — not on profit.",
      "**Apply $(1-\\text{tax rate})$**, not the tax rate, to get the amount kept.",
      "**Deduct royalty and costs first**, then tax the remainder.",
    ],
  },
  questions: [
    {
      id: "tax-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Production value is $\\$10\\ \\text{M}$ and the royalty rate is $5\\%$. The royalty payable is:",
      options: ["$\\$0.5\\ \\text{M}$", "$\\$5\\ \\text{M}$", "$\\$2\\ \\text{M}$", "$\\$0.05\\ \\text{M}$"],
      answer: 0,
      solution: {
        given: "Value $= \\$10\\ \\text{M}$, rate $= 5\\%$.",
        derivation: "$$\\text{Royalty} = 0.05\\times 10 = \\$0.5\\ \\text{M}$$",
        target: "**Correct option: $\\$0.5\\ \\text{M}$.**",
      },
    },
    {
      id: "tax-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A mine earns $\\$20\\ \\text{M}$ revenue with $\\$12\\ \\text{M}$ costs; the tax rate is $30\\%$. The profit after tax is ______ \\$M. (Round off to two decimal places.)",
      natAnswer: 5.6,
      acceptedRange: [5.4, 5.8],
      unit: "$M",
      solution: {
        given: "Revenue $=20$, costs $=12$ ⇒ $PBT = 8\\ \\$\\text{M}$; tax $=30\\%$.",
        derivation: "$$PAT = 8\\times(1 - 0.30) = 8\\times 0.70 = \\$5.6\\ \\text{M}$$",
        target: "**Target: 5.60 \\$M | Accepted range: 5.40 to 5.80.**",
      },
    },
    {
      id: "tax-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Gross revenue is $\\$50\\ \\text{M}$, royalty $8\\%$ of revenue, operating cost $\\$30\\ \\text{M}$, tax $25\\%$. The profit after tax is ______ \\$M. (Round off to two decimal places.)",
      natAnswer: 12,
      acceptedRange: [11.5, 12.5],
      unit: "$M",
      solution: {
        given: "Revenue $=50$, royalty $=0.08\\times50=4$, cost $=30$, tax $=25\\%$.",
        derivation:
          "$PBT = 50 - 4 - 30 = \\$16\\ \\text{M}$.\n$$PAT = 16\\times(1 - 0.25) = 16\\times 0.75 = \\$12\\ \\text{M}$$",
        target: "**Target: 12.00 \\$M | Accepted range: 11.50 to 12.50.**",
      },
    },
  ],
};

const ecFacilityLocation: LearnTopic = {
  slug: "ec-facility-location",
  subject: "Mining & Mineral Economics",
  title: "Mine Planning & Facility Location",
  tier: "subject",
  blurb:
    "The centre-of-gravity method that places a facility to minimise weighted transport, working coordinate by coordinate.",
  module: {
    principle:
      "Locating a central facility (crusher, plant, workshop) to minimise haulage uses the **centre-of-gravity (centroid) method**. Each demand/supply point has a **weight** (tonnage or trips) and coordinates. The optimal location's coordinates are the weight-weighted averages of the point coordinates — computed independently for $x$ and $y$.",
    formulaMatrix: [
      "**Centre of gravity**: $$x^* = \\frac{\\sum w_i x_i}{\\sum w_i},\\qquad y^* = \\frac{\\sum w_i y_i}{\\sum w_i}$$",
      "$w_i$ = weight (tonnage/trips) at point $i$.",
    ].join("\n"),
    traps: [
      "**Weight by tonnage/trips**, not by the number of points.",
      "**Compute $x^*$ and $y^*$ separately**, each with the same total weight in the denominator.",
      "**Use total weight $\\sum w_i$** in the denominator, not the count.",
    ],
  },
  questions: [
    {
      id: "fac-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "Two sources: weight $10$ at $x=0$ and weight $30$ at $x=8$. The centre-of-gravity $x$-coordinate is:",
      options: ["$6$", "$4$", "$8$", "$5$"],
      answer: 0,
      solution: {
        given: "$w_1{=}10,x_1{=}0$; $w_2{=}30,x_2{=}8$.",
        derivation: "$$x^* = \\frac{10(0) + 30(8)}{10+30} = \\frac{240}{40} = 6$$",
        target: "**Correct option: $6$.** $4$ is the unweighted midpoint.",
      },
    },
    {
      id: "fac-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Weights $20,\\,30,\\,50$ sit at $y = 2,\\,4,\\,6$. The centre-of-gravity $y$-coordinate is ______. (Round off to two decimal places.)",
      natAnswer: 4.6,
      acceptedRange: [4.5, 4.7],
      solution: {
        given: "Weights and $y$-coordinates as listed; $\\sum w = 100$.",
        derivation:
          "$$y^* = \\frac{20(2) + 30(4) + 50(6)}{100} = \\frac{40 + 120 + 300}{100} = \\frac{460}{100} = 4.6$$",
        target: "**Target: 4.60 | Accepted range: 4.50 to 4.70.**",
      },
    },
    {
      id: "fac-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Three loading points with trip-weights $100,\\,200,\\,300$ lie at $x = 10,\\,20,\\,40\\ \\text{km}$. The centre-of-gravity $x$-coordinate is ______ km. (Round off to two decimal places.)",
      natAnswer: 28.33,
      acceptedRange: [27.5, 29],
      unit: "km",
      solution: {
        given: "Weights and $x$-coordinates as listed; $\\sum w = 600$.",
        derivation:
          "$$x^* = \\frac{100(10) + 200(20) + 300(40)}{600} = \\frac{1000 + 4000 + 12000}{600} = \\frac{17000}{600} = 28.33\\ \\text{km}$$",
        target: "**Target: 28.33 km | Accepted range: 27.50 to 29.00.** Pulled toward the heaviest point.",
      },
    },
  ],
};

const ecCostBenefit: LearnTopic = {
  slug: "ec-cost-benefit",
  subject: "Mining & Mineral Economics",
  title: "Cost-Benefit Analysis & Work Study",
  tier: "premium",
  blurb:
    "The benefit–cost ratio for project screening, plus work-study standard time and the shift output it implies.",
  module: {
    principle:
      "**Cost-benefit analysis** screens projects by the **benefit–cost (B/C) ratio** — present value of benefits over present value of costs; a project is acceptable when B/C ≥ 1. **Work study** sets a **standard time** for a task: the observed time is adjusted by a performance **rating** to a basic time, then inflated by **allowances**. Standard time fixes the achievable **shift output**.",
    formulaMatrix: [
      "**Benefit–cost ratio**: $B/C = \\dfrac{PV_{benefits}}{PV_{costs}}$ (accept if $\\ge 1$).",
      "",
      "**Standard time**: $ST = (\\text{observed}\\times\\text{rating})\\times(1 + \\text{allowance})$.",
      "",
      "**Shift output**: $\\text{units} = \\dfrac{\\text{shift time}\\times\\text{efficiency}}{ST}$.",
    ].join("\n"),
    traps: [
      "**B/C ≥ 1 to accept.** Below 1 the costs outweigh the benefits.",
      "**Rating first, then allowances.** Basic time = observed × rating; standard = basic × (1+allowance).",
      "**Rating > 100 % speeds up** the basic time relative to observed.",
    ],
  },
  questions: [
    {
      id: "cb-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem:
        "A project has PV of benefits $\\$12\\ \\text{M}$ and PV of costs $\\$8\\ \\text{M}$. Its benefit–cost ratio is:",
      options: ["$1.5$", "$0.67$", "$4$", "$2$"],
      answer: 0,
      solution: {
        given: "$PV_{benefits} = 12$, $PV_{costs} = 8$.",
        derivation: "$$B/C = \\frac{12}{8} = 1.5$$",
        target: "**Correct option: $1.5$.** Above 1, so acceptable.",
      },
    },
    {
      id: "cb-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "An operation is observed at $5\\ \\text{min}$, rated at $120\\%$, with $10\\%$ allowances. The standard time is ______ min. (Round off to two decimal places.)",
      natAnswer: 6.6,
      acceptedRange: [6.4, 6.8],
      unit: "min",
      solution: {
        given: "Observed $=5$, rating $=1.20$, allowance $=0.10$.",
        derivation:
          "Basic $= 5\\times 1.20 = 6\\ \\text{min}$.\n$$ST = 6\\times(1 + 0.10) = 6.6\\ \\text{min}$$",
        target: "**Target: 6.60 min | Accepted range: 6.40 to 6.80.**",
      },
    },
    {
      id: "cb-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "With a standard time of $6.6\\ \\text{min/unit}$, a $480\\ \\text{min}$ shift at $90\\%$ efficiency produces ______ units. (Round off to two decimal places.)",
      natAnswer: 65.45,
      acceptedRange: [64, 67],
      unit: "units",
      solution: {
        given: "$ST = 6.6\\ \\text{min}$, shift $= 480\\ \\text{min}$, efficiency $= 0.90$.",
        derivation: "$$\\text{units} = \\frac{480\\times 0.90}{6.6} = \\frac{432}{6.6} = 65.45$$",
        target: "**Target: 65.45 units | Accepted range: 64 to 67.**",
      },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  PENDING MODULES — authored to complete the syllabus map               */
/* ════════════════════════════════════════════════════════════════════ */

/* ---- Section 2 — Mining Geology, Mine Development & Surveying ---------- */

const geoMineralsRocks: LearnTopic = {
  slug: "geo-minerals-rocks",
  subject: "Mine Development & Surveying",
  title: "Mining Geology: Minerals & Rocks",
  tier: "free",
  blurb:
    "How minerals are identified from physical properties and how the three rock families form — the geological vocabulary every MN question assumes.",
  module: {
    principle:
      "A **mineral** is a naturally occurring, inorganic, crystalline solid with a definite chemical composition; a **rock** is a solid aggregate of one or more minerals. Minerals are fingerprinted by **physical properties** — **hardness** (Mohs scale 1–10, talc to diamond), **cleavage/fracture**, **lustre**, **streak** (colour of the powder, far more reliable than the body colour), and **specific gravity (SG)**. Rocks fall into three families by their mode of origin: **igneous** (crystallised from molten magma/lava), **sedimentary** (lithified from weathered detritus or chemical/organic precipitates, the host of coal and most placer/strata-bound deposits), and **metamorphic** (recrystallised in the solid state under heat and pressure).",
    formulaMatrix: [
      "**Specific gravity (Archimedes)**: $SG = \\dfrac{W_{air}}{W_{air}-W_{water}}$",
      "",
      "**Density link**: $\\rho_{mineral} = SG \\times \\rho_{water} = SG \\times 1000\\ \\text{kg/m}^3$",
      "",
      "**Mohs scale (ordinal, non-linear)**: talc 1, gypsum 2, calcite 3, fluorite 4, apatite 5, orthoclase 6, quartz 7, topaz 8, corundum 9, diamond 10.",
      "",
      "**Mineral mass in a rock**: $m_{mineral} = V_{rock}\\,\\rho_{rock}\\,x_{mineral}$ (mass fraction $x$).",
    ].join("\n"),
    traps: [
      "**Streak ≠ colour.** Body colour varies with impurities; the streak (powder colour) is diagnostic — e.g. pyrite is brassy but streaks greenish-black.",
      "**Mohs is ordinal, not linear.** Diamond (10) is far more than twice as hard as apatite (5); never interpolate hardness numerically.",
      "**Rock vs mineral.** Granite is a rock (quartz + feldspar + mica); quartz is a mineral. Coal, though organic, is classified with the sedimentary rocks.",
      "**SG uses the weight loss in water**, not the water weight — the denominator is $W_{air}-W_{water}$.",
    ],
  },
  questions: [
    {
      id: "geo-mr-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "On the Mohs scale of hardness, the mineral that scratches all others but is scratched by none is:",
      options: ["Quartz", "Corundum", "Diamond", "Topaz"],
      answer: 2,
      solution: {
        given: "Mohs scale ranks hardness 1 (talc) to 10 (diamond).",
        derivation: "The hardest mineral sits at the top of the scale and cannot be scratched by any other natural mineral.",
        target: "**Correct option: Diamond (Mohs 10).** Corundum is 9, topaz 8, quartz 7 — all scratched by diamond.",
      },
    },
    {
      id: "geo-mr-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A mineral specimen weighs $54.0\\ \\text{g}$ in air and $34.0\\ \\text{g}$ when fully submerged in water. Its specific gravity is ______. (Round off to two decimal places.)",
      natAnswer: 2.7,
      acceptedRange: [2.65, 2.75],
      unit: "",
      solution: {
        given: "$W_{air} = 54.0\\ \\text{g}$, $W_{water} = 34.0\\ \\text{g}$.",
        derivation:
          "$$SG = \\frac{W_{air}}{W_{air}-W_{water}} = \\frac{54.0}{54.0-34.0} = \\frac{54.0}{20.0} = 2.70$$",
        target: "**Target: 2.70 | Accepted range: 2.65 to 2.75.** This value is typical of quartz/feldspar.",
      },
    },
    {
      id: "geo-mr-q3",
      difficulty: "hard",
      marks: 2,
      type: "MSQ",
      stem: "Which of the following are correctly paired with their rock family? (Select all that apply.)",
      options: [
        "Granite — igneous",
        "Marble — metamorphic",
        "Sandstone — sedimentary",
        "Basalt — sedimentary",
      ],
      answer: [0, 1, 2],
      solution: {
        given: "Igneous = crystallised melt; sedimentary = lithified detritus/precipitate; metamorphic = recrystallised in solid state.",
        derivation:
          "Granite crystallises from magma (igneous). Marble is metamorphosed limestone. Sandstone is lithified sand (sedimentary). Basalt is an extrusive **igneous** rock, not sedimentary.",
        target: "**Correct: Granite–igneous, Marble–metamorphic, Sandstone–sedimentary.** Basalt is igneous, so that pairing is wrong.",
      },
    },
  ],
};

const geoOreGenesis: LearnTopic = {
  slug: "geo-ore-genesis",
  subject: "Mine Development & Surveying",
  title: "Classification & Ore Genesis",
  tier: "free",
  blurb:
    "The processes that concentrate metals into mineable orebodies — magmatic, hydrothermal, sedimentary and placer — plus the grade/tenor arithmetic that decides if rock is ore.",
  module: {
    principle:
      "An **ore** is a rock from which a metal can be extracted **at a profit** — so an orebody is defined as much by economics as by geology. **Ore genesis** describes how ordinary crustal abundances are upgraded by a factor of tens to thousands into a mineable **grade (tenor)**. Key processes: **magmatic segregation** (early dense sulphides/oxides settle in a cooling magma — e.g. chromite, Ni–Cu sulphides), **hydrothermal** (hot mineralising fluids deposit veins and disseminations along fractures — most base- and precious-metal lodes), **sedimentary/residual** (banded iron formations, bauxite from lateritic weathering), and **placer** (mechanical concentration of heavy, durable minerals — gold, cassiterite, diamond — in stream/beach sediments).",
    formulaMatrix: [
      "**Concentration factor**: $CF = \\dfrac{\\text{ore grade}}{\\text{average crustal abundance}}$",
      "",
      "**Contained metal**: $M = T \\times g$  (tonnage $T$ × grade fraction $g$)",
      "",
      "**Recoverable metal**: $M_{rec} = T \\times g \\times R$  (recovery $R$)",
      "",
      "**Grade conversion**: $1\\% = 10{,}000\\ \\text{ppm} = 10\\ \\text{kg/t}$; gold often quoted in g/t.",
    ].join("\n"),
    traps: [
      "**Grade is a fraction in the tonnage formula.** A 2% Cu ore means $g=0.02$, not 2, when multiplying by tonnage.",
      "**ppm ↔ %.** $1\\% = 10{,}000\\ \\text{ppm}$. Mixing these by a factor of $10^4$ is the classic blunder.",
      "**Ore is economic, not just enriched.** A high concentration factor does not make rock 'ore' unless extraction pays.",
      "**Placer ≠ hydrothermal.** Placers concentrate by density/durability in sediments; they are not chemically precipitated from fluids.",
    ],
  },
  questions: [
    {
      id: "geo-og-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "Alluvial gold and cassiterite are most characteristically concentrated by which ore-forming process?",
      options: ["Magmatic segregation", "Placer (mechanical) concentration", "Hydrothermal veining", "Contact metamorphism"],
      answer: 1,
      solution: {
        given: "Gold and cassiterite are dense, chemically durable minerals.",
        derivation: "Heavy, weathering-resistant grains are winnowed and concentrated by flowing water in stream and beach sediments.",
        target: "**Correct option: Placer concentration.** This exploits high density and durability, not chemical precipitation.",
      },
    },
    {
      id: "geo-og-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "An orebody contains $5.0$ million tonnes at an average grade of $1.2\\%$ copper. If metallurgical recovery is $90\\%$, the recoverable copper metal is ______ tonnes. (Round to the nearest whole number.)",
      natAnswer: 54000,
      acceptedRange: [53500, 54500],
      unit: "t",
      solution: {
        given: "$T = 5.0\\times10^{6}\\ \\text{t}$, $g = 0.012$, $R = 0.90$.",
        derivation:
          "$$M_{rec} = T\\,g\\,R = 5.0\\times10^{6}\\times0.012\\times0.90$$\n$$= 60{,}000\\times0.90 = 54{,}000\\ \\text{t}$$",
        target: "**Target: 54000 t | Accepted range: 53500 to 54500.** In-situ metal is 60,000 t; recovery trims 10%.",
      },
    },
    {
      id: "geo-og-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Copper has an average crustal abundance of about $55\\ \\text{ppm}$. For a deposit to be mined at $0.55\\%$ Cu, the concentration factor relative to crustal abundance is ______. (Round off to the nearest whole number.)",
      natAnswer: 100,
      acceptedRange: [95, 105],
      unit: "",
      solution: {
        given: "Ore grade $= 0.55\\% = 5500\\ \\text{ppm}$; crustal abundance $= 55\\ \\text{ppm}$.",
        derivation:
          "$$CF = \\frac{\\text{ore grade}}{\\text{crustal abundance}} = \\frac{5500}{55} = 100$$",
        target: "**Target: 100 | Accepted range: 95 to 105.** Convert 0.55% to 5500 ppm before dividing.",
      },
    },
  ],
};

const geoStructural: LearnTopic = {
  slug: "geo-structural",
  subject: "Mine Development & Surveying",
  title: "Structural Geology",
  tier: "free",
  blurb:
    "Dip, strike, folds and faults — and the apparent-dip and true-thickness trigonometry that turns a geological section into mineable numbers.",
  module: {
    principle:
      "**Structural geology** describes how rock layers are oriented and deformed. A planar bed is fixed by its **strike** (the horizontal line on the plane) and its **true dip** $\\delta$ (the steepest inclination, measured perpendicular to strike). Any section cut oblique to strike shows a gentler **apparent dip** $\\alpha$. Deformation produces **folds** (anticlines/synclines), **faults** (normal — extension, hanging wall down; reverse/thrust — compression, hanging wall up; strike-slip — lateral), and **joints** (fractures with no displacement). For mine planning the two quantities that matter most are the **apparent dip** seen in a given drive direction and the **true thickness** of a seam from its outcrop/borehole width.",
    formulaMatrix: [
      "**Apparent dip**: $\\tan\\alpha = \\tan\\delta\\,\\sin\\beta$  ($\\beta$ = angle between section and strike)",
      "",
      "**True thickness from horizontal width** $w$ (across-strike, beds dipping $\\delta$): $t = w\\,\\sin\\delta$",
      "",
      "**True thickness from a vertical borehole depth** $d$ through the seam: $t = d\\,\\cos\\delta$",
      "",
      "**Limits**: along strike $\\beta=0\\Rightarrow\\alpha=0$; perpendicular $\\beta=90^\\circ\\Rightarrow\\alpha=\\delta$.",
    ].join("\n"),
    traps: [
      "**Apparent dip $\\leq$ true dip, always.** If a calculation gives $\\alpha>\\delta$, the section angle $\\beta$ was mis-measured.",
      "**Horizontal width uses $\\sin\\delta$; vertical depth uses $\\cos\\delta$.** Picking the wrong projection swaps the answer.",
      "**Normal vs reverse fault.** Normal = hanging wall **down** (extension); reverse/thrust = hanging wall **up** (compression).",
      "**$\\beta$ is measured from the strike**, not from the dip direction; using the complement flips $\\sin$ and $\\cos$.",
    ],
  },
  questions: [
    {
      id: "geo-st-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "In a normal fault, the hanging wall moves:",
      options: ["Up relative to the footwall", "Down relative to the footwall", "Horizontally only", "It does not move"],
      answer: 1,
      solution: {
        given: "Normal faults form under extensional (tensional) stress.",
        derivation: "Extension lets the hanging wall slip down the fault plane relative to the footwall.",
        target: "**Correct option: Down relative to the footwall.** Reverse/thrust faults (compression) push it up.",
      },
    },
    {
      id: "geo-st-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A coal seam has a true dip of $30^\\circ$. A roadway is driven at $40^\\circ$ to the strike. The apparent dip along the roadway is ______ degrees. (Round off to two decimal places.)",
      natAnswer: 20.36,
      acceptedRange: [20.0, 20.7],
      unit: "deg",
      solution: {
        given: "$\\delta = 30^\\circ$, $\\beta = 40^\\circ$.",
        derivation:
          "$$\\tan\\alpha = \\tan\\delta\\,\\sin\\beta = \\tan 30^\\circ \\times \\sin 40^\\circ$$\n$$= 0.5774\\times0.6428 = 0.3712$$\n$$\\alpha = \\tan^{-1}(0.3712) = 20.36^\\circ$$",
        target: "**Target: 20.36° | Accepted range: 20.0 to 20.7.** Apparent dip is gentler than the 30° true dip, as expected.",
      },
    },
    {
      id: "geo-st-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A seam dipping at $35^\\circ$ shows a horizontal outcrop width of $12\\ \\text{m}$ measured across the strike. Its true (perpendicular) thickness is ______ m. (Round off to two decimal places.)",
      natAnswer: 6.88,
      acceptedRange: [6.7, 7.05],
      unit: "m",
      solution: {
        given: "Horizontal across-strike width $w = 12\\ \\text{m}$, dip $\\delta = 35^\\circ$.",
        derivation:
          "$$t = w\\,\\sin\\delta = 12\\times\\sin 35^\\circ = 12\\times0.5736 = 6.88\\ \\text{m}$$",
        target: "**Target: 6.88 m | Accepted range: 6.70 to 7.05.** Horizontal width → use $\\sin\\delta$ (not $\\cos$).",
      },
    },
  ],
};

const mdsRockToolInteraction: LearnTopic = {
  slug: "mds-rock-tool-interaction",
  subject: "Mine Development & Surveying",
  title: "Rock–Tool Interaction & Mechanical Cutting",
  tier: "free",
  blurb:
    "Specific energy — the single number that links cutter forces, machine power and production rate for roadheaders and continuous miners.",
  module: {
    principle:
      "Mechanical excavators (roadheaders, continuous miners, TBMs) break rock with **drag or disc picks**. The governing quantity is **specific energy (SE)** — the energy needed to excavate **unit volume** of rock. Efficient cutting (deeper picks, optimum spacing-to-depth ratio) **minimises SE**; blunt tools or shallow scraping raise it. Because $SE = \\text{power}/\\text{production rate}$, it directly ties the installed **cutting power** of a machine to the **volume rate** it can achieve in a given rock, and the **cutting force** on each pick to the depth of cut. SE rises with rock strength, so it is the practical index for machine selection and cutter-head sizing.",
    formulaMatrix: [
      "**Specific energy**: $SE = \\dfrac{P_{cut}}{Q}$  (cutting power $P_{cut}$ ÷ volume production rate $Q$)",
      "",
      "**Production rate**: $Q = \\dfrac{P_{cut}}{SE}$,  with $SE$ in $\\text{MJ/m}^3$ and $P$ in MW gives $Q$ in $\\text{m}^3/\\text{s}$.",
      "",
      "**Cutting work per pick pass**: $W = F_c \\times \\ell$  (mean cutting force $F_c$ × cut length $\\ell$)",
      "",
      "**Unit note**: $1\\ \\text{MJ/m}^3 = 1\\ \\text{MPa}$; SE and rock UCS share dimensions.",
    ].join("\n"),
    traps: [
      "**Lower SE = better cutting.** SE measures inefficiency of energy use, so minimising it is the design goal.",
      "**Keep units consistent.** $SE\\,[\\text{MJ/m}^3]$ with power in MW gives $Q$ in $\\text{m}^3/\\text{s}$; convert to m³/h by ×3600.",
      "**Cutting power, not total motor power.** Auxiliary, gathering and tramming loads are excluded from $P_{cut}$.",
      "**SE rises with optimum s/d ratio departures.** Too-wide pick spacing leaves ridges and spikes SE.",
    ],
  },
  questions: [
    {
      id: "mds-rt-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "Specific energy in mechanical rock cutting is defined as the energy required to:",
      options: [
        "Excavate unit volume of rock",
        "Move the machine unit distance",
        "Sharpen one pick",
        "Raise rock through unit height",
      ],
      answer: 0,
      solution: {
        given: "SE has units of energy per unit volume ($\\text{MJ/m}^3$).",
        derivation: "By definition $SE = P_{cut}/Q$ — energy expended per unit volume excavated.",
        target: "**Correct option: Excavate unit volume of rock.** Lower SE indicates more efficient cutting.",
      },
    },
    {
      id: "mds-rt-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A roadheader cutting head develops $300\\ \\text{kW}$ of cutting power in rock of specific energy $20\\ \\text{MJ/m}^3$. The instantaneous cutting rate is ______ $\\text{m}^3/\\text{h}$. (Round off to one decimal place.)",
      natAnswer: 54,
      acceptedRange: [53, 55],
      unit: "m³/h",
      solution: {
        given: "$P_{cut} = 300\\ \\text{kW} = 0.300\\ \\text{MW}$, $SE = 20\\ \\text{MJ/m}^3$.",
        derivation:
          "$$Q = \\frac{P_{cut}}{SE} = \\frac{0.300\\ \\text{MJ/s}}{20\\ \\text{MJ/m}^3} = 0.015\\ \\text{m}^3/\\text{s}$$\n$$Q = 0.015\\times3600 = 54.0\\ \\text{m}^3/\\text{h}$$",
        target: "**Target: 54.0 m³/h | Accepted range: 53 to 55.** Express power in MJ/s so SE units cancel to m³/s, then ×3600.",
      },
    },
    {
      id: "mds-rt-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A pick exerts a mean cutting force of $4.0\\ \\text{kN}$ over a $0.6\\ \\text{m}$ cut, removing $0.0015\\ \\text{m}^3$ of rock per pass. The specific energy is ______ $\\text{MJ/m}^3$. (Round off to two decimal places.)",
      natAnswer: 1.6,
      acceptedRange: [1.55, 1.65],
      unit: "MJ/m³",
      solution: {
        given: "$F_c = 4.0\\ \\text{kN}$, cut length $\\ell = 0.6\\ \\text{m}$, volume per pass $V = 0.0015\\ \\text{m}^3$.",
        derivation:
          "$$W = F_c\\,\\ell = 4000\\times0.6 = 2400\\ \\text{J}$$\n$$SE = \\frac{W}{V} = \\frac{2400}{0.0015} = 1.6\\times10^{6}\\ \\text{J/m}^3 = 1.60\\ \\text{MJ/m}^3$$",
        target: "**Target: 1.60 MJ/m³ | Accepted range: 1.55 to 1.65.** Work = force × distance, then divide by volume.",
      },
    },
  ],
};

const mdsGisRemoteSensing: LearnTopic = {
  slug: "mds-gis-remote-sensing",
  subject: "Mine Development & Surveying",
  title: "GIS & Remote Sensing Basics",
  tier: "free",
  blurb:
    "Raster vs vector data, spectral bands and the photo-scale relation that converts an aerial image into ground distances.",
  module: {
    principle:
      "**GIS (Geographic Information Systems)** store spatial data in two models: **vector** (points, lines, polygons — sharp boundaries like lease limits and benches) and **raster** (a grid of cells/pixels, each holding a value — elevation, reflectance). **Remote sensing** acquires information without contact, recording reflected/emitted energy in discrete **spectral bands** (visible, NIR, SWIR, thermal). Resolution is described as **spatial** (pixel ground size / GSD), **spectral** (number and width of bands), **radiometric** and **temporal**. **Photogrammetry** links an aerial photo to the ground through the **scale relation** $S = f/H = \\ell/L$, the basis for measuring distances and areas off imagery.",
    formulaMatrix: [
      "**Photo scale**: $S = \\dfrac{f}{H} = \\dfrac{\\ell}{L}$  ($f$ = focal length, $H$ = flying height above ground; $\\ell$ = photo distance, $L$ = ground distance)",
      "",
      "**Representative fraction**: a scale of 1:25,000 means $1\\ \\text{cm}$ on the photo = $25{,}000\\ \\text{cm} = 250\\ \\text{m}$ on the ground.",
      "",
      "**Ground distance**: $L = \\dfrac{\\ell}{S} = \\ell \\times \\dfrac{H}{f}$",
      "",
      "**Ground area**: $A_{ground} = A_{photo}\\times\\left(\\dfrac{1}{S}\\right)^2$  (area scales with the square).",
    ].join("\n"),
    traps: [
      "**Scale is a ratio $f/H$ — flying height is above the ground**, not above sea level; ignoring terrain elevation biases the scale.",
      "**Area scales as the square of the scale factor**, not linearly. Forgetting the square underestimates area by orders of magnitude.",
      "**Larger denominator = smaller scale.** 1:50,000 is a *smaller* scale (less detail) than 1:10,000.",
      "**Raster vs vector.** Continuous fields (DEMs, reflectance) suit raster; discrete features (boundaries, roads) suit vector.",
    ],
  },
  questions: [
    {
      id: "mds-gis-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "In a GIS, a continuously varying surface such as a Digital Elevation Model is best represented by which data model?",
      options: ["Vector points", "Vector polygons", "Raster grid", "Topological network"],
      answer: 2,
      solution: {
        given: "Raster = grid of cells each holding a value; vector = discrete points/lines/polygons.",
        derivation: "A continuous field like elevation maps naturally onto a regular grid of cells, one value per cell.",
        target: "**Correct option: Raster grid.** Vector models suit discrete boundaries, not continuous surfaces.",
      },
    },
    {
      id: "mds-gis-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "An aerial camera of focal length $150\\ \\text{mm}$ flies at a height of $1500\\ \\text{m}$ above the ground. The representative fraction of the photograph is $1:n$, where $n$ is ______. (Round to the nearest whole number.)",
      natAnswer: 10000,
      acceptedRange: [9900, 10100],
      unit: "",
      solution: {
        given: "$f = 150\\ \\text{mm} = 0.150\\ \\text{m}$, $H = 1500\\ \\text{m}$.",
        derivation:
          "$$S = \\frac{f}{H} = \\frac{0.150}{1500} = \\frac{1}{10{,}000}$$",
        target: "**Target: 10000 | Accepted range: 9900 to 10100.** Keep $f$ and $H$ in the same units before dividing.",
      },
    },
    {
      id: "mds-gis-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "On a photograph of scale $1:10{,}000$, a rectangular waste dump measures $4.0\\ \\text{cm}\\times3.0\\ \\text{cm}$. Its actual ground area is ______ hectares. (Round off to one decimal place.)",
      natAnswer: 12,
      acceptedRange: [11.8, 12.2],
      unit: "ha",
      solution: {
        given: "Photo area $= 4.0\\times3.0 = 12\\ \\text{cm}^2$; scale $S = 1/10{,}000$.",
        derivation:
          "Ground length factor $= 10{,}000$, so area factor $= 10{,}000^2 = 10^{8}$.\n$$A = 12\\ \\text{cm}^2 \\times 10^{8} = 12\\times10^{8}\\ \\text{cm}^2$$\n$$= 12\\times10^{8}\\times10^{-4}\\ \\text{m}^2 = 1.2\\times10^{5}\\ \\text{m}^2 = 12\\ \\text{ha}$$",
        target: "**Target: 12.0 ha | Accepted range: 11.8 to 12.2.** Area scales with the square of the scale; $1\\ \\text{ha}=10^4\\ \\text{m}^2$.",
      },
    },
  ],
};

/* ---- Section 3 — Geomechanics & Ground Control ------------------------ */

const gmEngineeringMechanics: LearnTopic = {
  slug: "gm-engineering-mechanics",
  subject: "Geomechanics & Ground Control",
  title: "Engineering Mechanics",
  tier: "free",
  blurb:
    "Free-body diagrams, equilibrium, moments and friction — the statics toolkit underpinning every support, pillar and equipment-loading calculation.",
  module: {
    principle:
      "**Engineering mechanics (statics)** analyses bodies in equilibrium. A body is in equilibrium when the **net force and net moment are zero**: $\\sum F_x = 0$, $\\sum F_y = 0$, $\\sum M = 0$. The first step is always a **free-body diagram (FBD)** isolating the body and showing every external force (loads, reactions, friction, weight). A **moment** measures a force's turning effect about a point: $M = F \\times d$, where $d$ is the **perpendicular** distance from the pivot to the line of action. **Dry friction** resists impending sliding up to a limit $F = \\mu N$ (coefficient of friction $\\mu$ × normal reaction $N$); on an incline of angle $\\theta$, sliding impends when $\\tan\\theta = \\mu$.",
    formulaMatrix: [
      "**Force equilibrium**: $\\sum F_x = 0,\\quad \\sum F_y = 0$",
      "",
      "**Moment equilibrium**: $\\sum M = 0$, with $M = F\\,d_{\\perp}$",
      "",
      "**Limiting friction**: $F_{max} = \\mu N$",
      "",
      "**Angle of repose** (block on incline): sliding impends when $\\tan\\theta = \\mu$, i.e. $\\theta = \\tan^{-1}\\mu$.",
    ].join("\n"),
    traps: [
      "**Moment uses the perpendicular distance** to the line of action, not the slant distance to the point of application.",
      "**Friction is $\\mu N$, and $N$ is not always $mg$.** On an incline $N = mg\\cos\\theta$; applied vertical forces also change $N$.",
      "**Friction opposes *impending* motion** and is $\\leq \\mu N$ when static; only at the verge of sliding does $F = \\mu N$.",
      "**Take moments about an unknown's line of action** to eliminate it — choosing the pivot wisely halves the algebra.",
    ],
  },
  questions: [
    {
      id: "gm-em-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "The moment of a force about a point is the product of the force and the:",
      options: [
        "Distance along the force's line of action",
        "Perpendicular distance from the point to the line of action",
        "Magnitude of the reaction",
        "Time of application",
      ],
      answer: 1,
      solution: {
        given: "Moment $M = F \\times d$.",
        derivation: "The lever arm $d$ is the perpendicular (shortest) distance from the pivot to the force's line of action.",
        target: "**Correct option: Perpendicular distance from the point to the line of action.**",
      },
    },
    {
      id: "gm-em-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A block rests on a rough horizontal surface with coefficient of friction $0.30$ and normal reaction $500\\ \\text{N}$. The maximum static friction force available is ______ N. (Round to the nearest whole number.)",
      natAnswer: 150,
      acceptedRange: [148, 152],
      unit: "N",
      solution: {
        given: "$\\mu = 0.30$, $N = 500\\ \\text{N}$.",
        derivation: "$$F_{max} = \\mu N = 0.30\\times500 = 150\\ \\text{N}$$",
        target: "**Target: 150 N | Accepted range: 148 to 152.** Limiting friction is $\\mu N$.",
      },
    },
    {
      id: "gm-em-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A uniform horizontal beam of length $4\\ \\text{m}$ is simply supported at both ends and carries a single vertical point load of $600\\ \\text{N}$ at $1\\ \\text{m}$ from the left support. The vertical reaction at the left support is ______ N. (Round to the nearest whole number.)",
      natAnswer: 450,
      acceptedRange: [445, 455],
      unit: "N",
      solution: {
        given: "Span $L = 4\\ \\text{m}$, load $W = 600\\ \\text{N}$ at $a = 1\\ \\text{m}$ from the left.",
        derivation:
          "Take moments about the right support: $R_L \\times 4 = 600\\times(4-1) = 600\\times3$.\n$$R_L = \\frac{1800}{4} = 450\\ \\text{N}$$",
        target: "**Target: 450 N | Accepted range: 445 to 455.** Check: $R_R = 600-450 = 150\\ \\text{N}$.",
      },
    },
  ],
};

const gmInsituMeasurement: LearnTopic = {
  slug: "gm-insitu-measurement",
  subject: "Geomechanics & Ground Control",
  title: "In-situ Stress Measurement & Instrumentation",
  tier: "free",
  blurb:
    "Overcoring, flatjack and hydraulic fracturing — how virgin ground stresses are measured, plus the convergence/load instruments that watch openings.",
  module: {
    principle:
      "Underground openings respond to the **in-situ (virgin) stress field**, which must be measured, not guessed. The **vertical stress** is usually gravitational: $\\sigma_v = \\gamma H$ (unit weight × depth). The **horizontal stress** is expressed through the lateral stress ratio $k = \\sigma_h/\\sigma_v$. Field techniques: **overcoring** (a strain cell is set in a borehole, then stress-relieved by coring around it — the recovered strain gives stress), **flatjack** (slot cut in a wall, jack pressurised to cancel the relaxation), and **hydraulic fracturing** (a sealed borehole interval is pressurised until the wall cracks; the **breakdown** and **shut-in** pressures give the horizontal stresses). **Monitoring instruments** — convergence stations, extensometers, load cells and stress meters — track how the opening deforms over time.",
    formulaMatrix: [
      "**Vertical stress**: $\\sigma_v = \\gamma H$  (unit weight $\\gamma$ × depth $H$); rule of thumb $\\approx 0.025\\ \\text{MPa/m} = 1\\ \\text{MPa per }40\\ \\text{m}$.",
      "",
      "**Lateral stress ratio**: $k = \\dfrac{\\sigma_h}{\\sigma_v}$",
      "",
      "**Hydrofrac (impermeable rock)**: breakdown $P_b = 3\\sigma_{h,min} - \\sigma_{h,max} - P_0 + T$  ($P_0$ = pore pressure, $T$ = tensile strength)",
      "",
      "**Shut-in pressure**: $P_s = \\sigma_{h,min}$ (closes the fracture, giving the minimum horizontal stress directly).",
    ].join("\n"),
    traps: [
      "**Vertical stress depends on depth, not opening size.** $\\sigma_v=\\gamma H$ uses overburden depth; the drive dimensions don't enter.",
      "**Use unit weight $\\gamma$ (kN/m³), not density** in $\\sigma_v=\\gamma H$; if given $\\rho$, multiply by $g$.",
      "**Shut-in pressure gives the *minimum* horizontal stress** directly; breakdown pressure needs the full formula with $T$ and $P_0$.",
      "**$k$ can exceed 1.** Near the surface and in tectonic regions horizontal stress often exceeds vertical.",
    ],
  },
  questions: [
    {
      id: "gm-im-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "Which in-situ stress measurement technique relies on stress-relieving a strain cell by drilling a larger-diameter core around it?",
      options: ["Flatjack method", "Overcoring", "Hydraulic fracturing", "Convergence recording"],
      answer: 1,
      solution: {
        given: "Overcoring isolates a strain sensor by coring around it, releasing the in-situ stress.",
        derivation: "The recovered elastic strain on relief, with the rock modulus, back-calculates the stress.",
        target: "**Correct option: Overcoring.** Flatjack uses slot relaxation; hydrofrac uses borehole pressurisation.",
      },
    },
    {
      id: "gm-im-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Rock of unit weight $25\\ \\text{kN/m}^3$ overlies a drive at a depth of $600\\ \\text{m}$. The vertical in-situ stress is ______ MPa. (Round off to one decimal place.)",
      natAnswer: 15,
      acceptedRange: [14.7, 15.3],
      unit: "MPa",
      solution: {
        given: "$\\gamma = 25\\ \\text{kN/m}^3$, $H = 600\\ \\text{m}$.",
        derivation:
          "$$\\sigma_v = \\gamma H = 25\\ \\text{kN/m}^3 \\times 600\\ \\text{m} = 15{,}000\\ \\text{kPa} = 15.0\\ \\text{MPa}$$",
        target: "**Target: 15.0 MPa | Accepted range: 14.7 to 15.3.** $1\\ \\text{MPa}=1000\\ \\text{kPa}$.",
      },
    },
    {
      id: "gm-im-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "In a hydraulic fracturing test in impermeable rock with negligible pore pressure, the breakdown pressure is $18\\ \\text{MPa}$ and the shut-in pressure is $7\\ \\text{MPa}$. If the rock tensile strength is $3\\ \\text{MPa}$, the maximum horizontal stress is ______ MPa. (Round off to one decimal place.)",
      natAnswer: 6,
      acceptedRange: [5.7, 6.3],
      unit: "MPa",
      solution: {
        given: "$P_b = 18$, $P_s = \\sigma_{h,min} = 7$, $T = 3\\ \\text{MPa}$, $P_0 = 0$.",
        derivation:
          "$$P_b = 3\\sigma_{h,min} - \\sigma_{h,max} - P_0 + T$$\n$$18 = 3(7) - \\sigma_{h,max} - 0 + 3 = 24 - \\sigma_{h,max}$$\n$$\\sigma_{h,max} = 24 - 18 = 6\\ \\text{MPa}$$",
        target: "**Target: 6.0 MPa | Accepted range: 5.7 to 6.3.** Shut-in pressure gives $\\sigma_{h,min}=7$; rearrange the breakdown equation for $\\sigma_{h,max}$.",
      },
    },
  ],
};

const gmMineFilling: LearnTopic = {
  slug: "gm-mine-filling",
  subject: "Geomechanics & Ground Control",
  title: "Mine Filling & Strata Monitoring",
  tier: "free",
  blurb:
    "Hydraulic and paste backfill — percentage solids, settlement and the convergence/stress monitoring that confirms the strata are under control.",
  module: {
    principle:
      "**Backfilling** places waste material into mined voids to support the walls, control subsidence, reduce pillar loss and dispose of tailings. **Hydraulic fill** is sand/tailings transported as a slurry and dewatered in place; its key spec is **percentage solids** (mass of solids ÷ total slurry mass). **Paste fill** is a non-settling high-density mix, often cemented. The fill reduces wall convergence and redistributes stress onto the support system. **Strata monitoring** confirms control: **convergence stations** measure roof-to-floor closure, **extensometers** measure bed separation at depth into the roof, and **load/stress cells** measure support and pillar loading. A rising convergence *rate* is the classic warning of instability.",
    formulaMatrix: [
      "**Percentage solids (by mass)**: $C_w = \\dfrac{m_{solids}}{m_{solids}+m_{water}}\\times100\\%$",
      "",
      "**Slurry (pulp) density**: $\\rho_{pulp} = \\dfrac{1}{\\dfrac{C_w}{\\rho_s}+\\dfrac{1-C_w}{\\rho_w}}$  ($C_w$ as a fraction)",
      "",
      "**Convergence rate**: $\\dot{c} = \\dfrac{\\Delta c}{\\Delta t}$ (closure per unit time) — a rising rate signals instability.",
      "",
      "**Void fill ratio**: fraction of the mined void occupied by competent fill after settlement.",
    ].join("\n"),
    traps: [
      "**Percentage solids is by mass unless stated.** Volume basis gives a different number; check the basis.",
      "**Backfill supports, it does not 'hold up' the roof alone.** It limits convergence and confines pillars rather than carrying full overburden.",
      "**Convergence *rate*, not total closure, is the alarm.** Slow steady closure can be safe; an accelerating rate is the danger sign.",
      "**Drainage matters.** Hydraulic fill must dewater; poor drainage leaves a weak, saturated mass.",
    ],
  },
  questions: [
    {
      id: "gm-mf-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "The primary instrument used to measure roof-to-floor closure of an underground opening is the:",
      options: ["Extensometer", "Convergence station/indicator", "Anemometer", "Piezometer"],
      answer: 1,
      solution: {
        given: "Closure = relative movement of roof and floor.",
        derivation: "A convergence station/indicator directly records the change in roof-to-floor distance over time.",
        target: "**Correct option: Convergence station/indicator.** Extensometers track bed separation into the roof; anemometers measure airflow.",
      },
    },
    {
      id: "gm-mf-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A hydraulic fill slurry is made by mixing $700\\ \\text{kg}$ of solids with $300\\ \\text{kg}$ of water. The percentage solids by mass is ______ %. (Round to the nearest whole number.)",
      natAnswer: 70,
      acceptedRange: [69, 71],
      unit: "%",
      solution: {
        given: "$m_{solids} = 700\\ \\text{kg}$, $m_{water} = 300\\ \\text{kg}$.",
        derivation:
          "$$C_w = \\frac{700}{700+300}\\times100 = \\frac{700}{1000}\\times100 = 70\\%$$",
        target: "**Target: 70% | Accepted range: 69 to 71.** Percentage solids = solids mass ÷ total slurry mass.",
      },
    },
    {
      id: "gm-mf-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A convergence station reads $0\\ \\text{mm}$ on day 0 and $36\\ \\text{mm}$ of cumulative closure on day 12, closing at a steady rate. The mean convergence rate is ______ mm/day. (Round off to one decimal place.)",
      natAnswer: 3,
      acceptedRange: [2.9, 3.1],
      unit: "mm/day",
      solution: {
        given: "$\\Delta c = 36\\ \\text{mm}$ over $\\Delta t = 12\\ \\text{days}$.",
        derivation: "$$\\dot{c} = \\frac{\\Delta c}{\\Delta t} = \\frac{36}{12} = 3.0\\ \\text{mm/day}$$",
        target: "**Target: 3.0 mm/day | Accepted range: 2.9 to 3.1.** Watch for any *increase* in this rate as a warning sign.",
      },
    },
  ],
};

/* ---- Section 5 — Ventilation, Environment & Hazards ------------------- */

const ventilationHeatCooling: LearnTopic = {
  slug: "ventilation-heat-cooling",
  subject: "Mine Ventilation",
  title: "Heat Load, Thermal Environment & Air Cooling",
  tier: "free",
  blurb:
    "Why deep mines get hot, how to quantify the sensible heat the air must remove, and the refrigeration duty that keeps workings within legal limits.",
  module: {
    principle:
      "As mines deepen, **virgin rock temperature rises** with the **geothermal gradient** (typically $\\sim 1^\\circ\\text{C}$ per 30–40 m), and **autocompression** heats descending air. Heat sources include the strata, machinery, oxidation, men and lights. The ventilating air removes heat as **sensible heat** (temperature rise of the air) and **latent heat** (moisture pick-up). The **sensible-heat balance** $Q = \\dot{m}\\,c_p\\,\\Delta T$ sets the airflow or cooling needed to hold the workplace within the statutory **wet-bulb** limit. When ventilation alone cannot cope, **mechanical refrigeration / spot coolers** supply the extra cooling duty.",
    formulaMatrix: [
      "**Sensible heat removed by air**: $Q = \\dot{m}\\,c_p\\,\\Delta T$  ($\\dot{m}$ = mass flow, $c_p\\approx1.005\\ \\text{kJ/kg·K}$ for dry air)",
      "",
      "**Mass flow from volume flow**: $\\dot{m} = \\rho\\,Q_v$  (air density $\\rho\\approx1.2\\ \\text{kg/m}^3$)",
      "",
      "**Virgin rock temperature**: $T_r = T_{surface} + g_{geo}\\,(H - H_0)$  ($g_{geo}$ = geothermal gradient)",
      "",
      "**Refrigeration duty**: $Q_{ref} = Q_{heat,total} - Q_{air}$ (cooling that ventilation cannot remove).",
    ].join("\n"),
    traps: [
      "**Use mass flow, not volume flow, in $Q=\\dot mc_p\\Delta T$.** Convert $Q_v$ via $\\dot m=\\rho Q_v$ first.",
      "**$c_p$ in kJ/kg·K gives $Q$ in kW** when $\\dot m$ is kg/s and $\\Delta T$ in K — keep the units aligned.",
      "**Wet-bulb temperature, not dry-bulb, governs heat stress.** Humidity (latent heat) matters as much as temperature.",
      "**Autocompression heats *downcast* air** even with no other source — about $1^\\circ\\text{C}$ per 100 m of descent.",
    ],
  },
  questions: [
    {
      id: "vent-hc-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "The statutory index used to assess heat stress on miners is primarily the:",
      options: ["Dry-bulb temperature", "Wet-bulb temperature", "Barometric pressure", "Air velocity alone"],
      answer: 1,
      solution: {
        given: "Heat stress depends on the body's ability to lose heat by evaporation.",
        derivation: "Wet-bulb temperature reflects both heat and humidity, capturing evaporative cooling capacity.",
        target: "**Correct option: Wet-bulb temperature.** High humidity blocks sweating, so dry-bulb alone understates the hazard.",
      },
    },
    {
      id: "vent-hc-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Air flows through a working at $50\\ \\text{kg/s}$. It enters at $24^\\circ\\text{C}$ and leaves at $30^\\circ\\text{C}$. Taking $c_p = 1.005\\ \\text{kJ/kg·K}$, the sensible heat picked up is ______ kW. (Round to the nearest whole number.)",
      natAnswer: 302,
      acceptedRange: [298, 305],
      unit: "kW",
      solution: {
        given: "$\\dot m = 50\\ \\text{kg/s}$, $\\Delta T = 30-24 = 6\\ \\text{K}$, $c_p = 1.005\\ \\text{kJ/kg·K}$.",
        derivation:
          "$$Q = \\dot m\\,c_p\\,\\Delta T = 50\\times1.005\\times6 = 301.5\\ \\text{kW}$$",
        target: "**Target: 302 kW | Accepted range: 298 to 305.** Sensible heat only; moisture pick-up would add latent heat.",
      },
    },
    {
      id: "vent-hc-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A working generates a total heat load of $400\\ \\text{kW}$. The ventilating air ($30\\ \\text{kg/s}$, $c_p=1.005\\ \\text{kJ/kg·K}$) is allowed a temperature rise of only $8\\ \\text{K}$. The refrigeration duty required is ______ kW. (Round to the nearest whole number.)",
      natAnswer: 159,
      acceptedRange: [155, 163],
      unit: "kW",
      solution: {
        given: "Total heat $= 400\\ \\text{kW}$; air $\\dot m=30\\ \\text{kg/s}$, $\\Delta T=8\\ \\text{K}$, $c_p=1.005$.",
        derivation:
          "$$Q_{air} = 30\\times1.005\\times8 = 241.2\\ \\text{kW}$$\n$$Q_{ref} = 400 - 241.2 = 158.8\\ \\text{kW}$$",
        target: "**Target: 159 kW | Accepted range: 155 to 163.** Ventilation removes 241 kW; refrigeration covers the balance.",
      },
    },
  ],
};

const ventilationNetworksSurvey: LearnTopic = {
  slug: "ventilation-networks-survey",
  subject: "Mine Ventilation",
  title: "Ventilation Networks, Survey & Planning",
  tier: "free",
  blurb:
    "Series/parallel airway resistance, Kirchhoff's laws and the pressure survey — how a whole-mine ventilation network is analysed and planned.",
  module: {
    principle:
      "A mine ventilation system is a **network** of airways obeying laws analogous to electrical circuits. Each airway has a **resistance** $R$; the **square law** $P = R\\,Q^2$ links pressure drop to airflow (note the *square* — ventilation is non-linear). Airways combine in **series** (resistances add) and **parallel** (a softer combined resistance). **Kirchhoff's laws** apply: the **node law** (flow in = flow out at every junction) and the **mesh law** (pressure drops around any closed loop sum to zero). A **pressure (ventilation) survey** measures pressures and flows in the field to determine each airway's resistance, calibrating the network model used for planning fans and splits.",
    formulaMatrix: [
      "**Square law**: $P = R\\,Q^2$  (pressure drop $P$, resistance $R$, airflow $Q$)",
      "",
      "**Series**: $R_{eq} = R_1 + R_2 + \\dots$ (same $Q$ through each)",
      "",
      "**Parallel**: $\\dfrac{1}{\\sqrt{R_{eq}}} = \\dfrac{1}{\\sqrt{R_1}} + \\dfrac{1}{\\sqrt{R_2}} + \\dots$ (same $P$ across each)",
      "",
      "**Kirchhoff**: node $\\sum Q = 0$; mesh $\\sum P = \\sum R Q^2 = 0$ around any loop.",
    ].join("\n"),
    traps: [
      "**Ventilation parallel law uses $1/\\sqrt R$, not $1/R$**, because the square law makes flow scale with $\\sqrt{1/R}$.",
      "**Pressure drop scales with $Q^2$.** Doubling the airflow quadruples the pressure loss — never linear.",
      "**Two equal-resistance airways in parallel** carry equal flow and give $R_{eq}=R/4$ (not $R/2$).",
      "**Survey resistances drift** as airways age, fall or are obstructed; re-survey before major planning.",
    ],
  },
  questions: [
    {
      id: "vent-ns-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "In mine ventilation the pressure drop across an airway varies with the airflow as:",
      options: ["Directly proportional to $Q$", "Proportional to $Q^2$", "Proportional to $\\sqrt{Q}$", "Independent of $Q$"],
      answer: 1,
      solution: {
        given: "The square law $P = R Q^2$ governs turbulent airway flow.",
        derivation: "Pressure loss rises with the square of the volume flow because of turbulent friction.",
        target: "**Correct option: Proportional to $Q^2$.** This non-linearity drives the $1/\\sqrt R$ parallel rule.",
      },
    },
    {
      id: "vent-ns-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "An airway of resistance $0.5\\ \\text{N·s}^2/\\text{m}^8$ (gaul) carries $40\\ \\text{m}^3/\\text{s}$. The pressure drop across it is ______ Pa. (Round to the nearest whole number.)",
      natAnswer: 800,
      acceptedRange: [790, 810],
      unit: "Pa",
      solution: {
        given: "$R = 0.5$, $Q = 40\\ \\text{m}^3/\\text{s}$.",
        derivation:
          "$$P = R\\,Q^2 = 0.5\\times40^2 = 0.5\\times1600 = 800\\ \\text{Pa}$$",
        target: "**Target: 800 Pa | Accepted range: 790 to 810.** Square the flow before multiplying by resistance.",
      },
    },
    {
      id: "vent-ns-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "Two airways of resistance $0.8$ and $0.8\\ \\text{N·s}^2/\\text{m}^8$ are connected in parallel. The equivalent resistance of the combination is ______ $\\text{N·s}^2/\\text{m}^8$. (Round off to two decimal places.)",
      natAnswer: 0.2,
      acceptedRange: [0.19, 0.21],
      unit: "",
      solution: {
        given: "$R_1 = R_2 = 0.8$ in parallel.",
        derivation:
          "$$\\frac{1}{\\sqrt{R_{eq}}} = \\frac{1}{\\sqrt{0.8}}+\\frac{1}{\\sqrt{0.8}} = \\frac{2}{\\sqrt{0.8}}$$\n$$\\sqrt{R_{eq}} = \\frac{\\sqrt{0.8}}{2}\\Rightarrow R_{eq} = \\frac{0.8}{4} = 0.20$$",
        target: "**Target: 0.20 | Accepted range: 0.19 to 0.21.** Two equal parallel airways give $R/4$, not $R/2$.",
      },
    },
  ],
};

const hazardMethaneDrainage: LearnTopic = {
  slug: "hazard-methane-drainage",
  subject: "Environment, Ventilation & Hazards",
  title: "Methane Drainage",
  tier: "free",
  blurb:
    "Pre- and post-drainage of seam gas, capture efficiency and the dilution airflow needed to keep methane below statutory limits.",
  module: {
    principle:
      "**Methane (firedamp)** is released from coal as it is mined and is explosive between roughly **5% and 15%** in air (most violent near 9.5%). Two controls work together: **ventilation dilution** carries gas away in the airstream, and **methane drainage** captures gas at source through boreholes (pre-drainage ahead of mining, post-drainage from the relaxed/goaf zone) and pipes it away. **Drainage efficiency** (or capture ratio) is the fraction of total emission removed by the drainage system; the remainder must be diluted by ventilation. The dilution airflow follows directly from a mass balance: enough fresh air to hold the general-body concentration below the statutory limit.",
    formulaMatrix: [
      "**Drainage (capture) efficiency**: $\\eta = \\dfrac{Q_{drained}}{Q_{total emission}}\\times100\\%$",
      "",
      "**Gas to dilute by ventilation**: $Q_{vent gas} = Q_{total}(1-\\eta)$",
      "",
      "**Dilution airflow**: $Q_{air} = \\dfrac{Q_{gas}}{C_{limit}}$  ($C_{limit}$ as a fraction, e.g. $1.25\\% = 0.0125$)",
      "",
      "**Explosive range of methane in air**: $\\approx 5\\%$ (LEL) to $15\\%$ (UEL).",
    ].join("\n"),
    traps: [
      "**Use the concentration *limit* as a fraction in the dilution formula**, not a percentage — $0.0125$, not $1.25$.",
      "**Drainage reduces the gas the air must carry**, so the ventilation duty is on $(1-\\eta)$ of the emission.",
      "**The explosive range matters even below the LEL** — layering at the roof can be locally rich; measure near the roof.",
      "**Capture efficiency is of total emission**, not just the goaf release; define the denominator clearly.",
    ],
  },
  questions: [
    {
      id: "haz-md-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "The approximate lower explosive limit (LEL) of methane in air is:",
      options: ["1%", "5%", "15%", "25%"],
      answer: 1,
      solution: {
        given: "Methane is explosive between about 5% and 15% in air.",
        derivation: "Below ~5% the mixture is too lean to propagate a flame; that lower bound is the LEL.",
        target: "**Correct option: 5%.** The upper explosive limit is about 15%; most violent near 9.5%.",
      },
    },
    {
      id: "haz-md-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A district emits $5.0\\ \\text{m}^3/\\text{min}$ of methane, of which the drainage system captures $3.5\\ \\text{m}^3/\\text{min}$. The drainage (capture) efficiency is ______ %. (Round to the nearest whole number.)",
      natAnswer: 70,
      acceptedRange: [69, 71],
      unit: "%",
      solution: {
        given: "$Q_{drained} = 3.5$, $Q_{total} = 5.0\\ \\text{m}^3/\\text{min}$.",
        derivation:
          "$$\\eta = \\frac{3.5}{5.0}\\times100 = 70\\%$$",
        target: "**Target: 70% | Accepted range: 69 to 71.** The remaining $1.5\\ \\text{m}^3/\\text{min}$ must be diluted by ventilation.",
      },
    },
    {
      id: "haz-md-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "After drainage, $1.5\\ \\text{m}^3/\\text{min}$ of methane enters the general body of air. To hold the concentration at the statutory limit of $1.25\\%$, the dilution airflow required is ______ $\\text{m}^3/\\text{min}$. (Round to the nearest whole number.)",
      natAnswer: 120,
      acceptedRange: [118, 122],
      unit: "m³/min",
      solution: {
        given: "$Q_{gas} = 1.5\\ \\text{m}^3/\\text{min}$, $C_{limit} = 1.25\\% = 0.0125$.",
        derivation:
          "$$Q_{air} = \\frac{Q_{gas}}{C_{limit}} = \\frac{1.5}{0.0125} = 120\\ \\text{m}^3/\\text{min}$$",
        target: "**Target: 120 m³/min | Accepted range: 118 to 122.** Express the limit as a fraction (0.0125) before dividing.",
      },
    },
  ],
};

const envEia: LearnTopic = {
  slug: "env-eia",
  subject: "Environment, Ventilation & Hazards",
  title: "Environmental Impact Assessment (EIA)",
  tier: "free",
  blurb:
    "The structured process — screening, scoping, prediction, EMP — that forecasts and manages a mine's environmental footprint before clearance.",
  module: {
    principle:
      "**Environmental Impact Assessment (EIA)** is the formal process of predicting, evaluating and mitigating a project's environmental effects **before** it is approved. The standard stages are **screening** (does the project need an EIA?), **scoping** (which impacts and baselines matter?), **baseline data collection**, **impact prediction & evaluation**, the **Environmental Management Plan (EMP)** with mitigation and monitoring, **public consultation**, and **decision/clearance** followed by **post-project monitoring/audit**. Methods range from simple **checklists** and **interaction matrices** (e.g. the Leopold matrix, scoring each activity-vs-component cell for magnitude and importance) to network and overlay techniques. In India, mining clearances follow the **EIA Notification 2006** under the Environment (Protection) Act, 1986.",
    formulaMatrix: [
      "**Leopold matrix cell score**: $S = M \\times I$  (magnitude $M$ × importance $I$, each typically scored 1–10)",
      "",
      "**Aggregate impact**: $S_{total} = \\sum_{i,j} M_{ij}\\,I_{ij}$ over all activity–component interactions.",
      "",
      "**Composite air/water index**: weighted sum $\\sum w_k\\,q_k$ of sub-indices $q_k$ with weights $w_k$ ($\\sum w_k = 1$).",
      "",
      "**Statutory frame (India)**: Environment (Protection) Act 1986 → EIA Notification 2006 (Categories A & B).",
    ].join("\n"),
    traps: [
      "**EIA is predictive and pre-decision.** It is done *before* clearance, not as a post-mortem after impacts occur.",
      "**Screening ≠ scoping.** Screening decides *whether* an EIA is needed; scoping decides *what* it should cover.",
      "**The EMP is the deliverable that matters operationally** — mitigation + monitoring commitments, not just impact lists.",
      "**Matrix scores combine magnitude *and* importance.** A large but unimportant impact may score lower than a small critical one.",
    ],
  },
  questions: [
    {
      id: "env-eia-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "Which EIA stage decides whether a proposed project requires a full environmental impact assessment at all?",
      options: ["Scoping", "Screening", "Public hearing", "Post-project audit"],
      answer: 1,
      solution: {
        given: "Screening is the first filtering step of the EIA process.",
        derivation: "Screening applies thresholds/categories to decide if a project needs an EIA; scoping then defines its contents.",
        target: "**Correct option: Screening.** Scoping comes next and sets the study boundaries.",
      },
    },
    {
      id: "env-eia-q2",
      difficulty: "medium",
      marks: 2,
      type: "MSQ",
      stem: "Which of the following are recognised components of an Environmental Management Plan (EMP)? (Select all that apply.)",
      options: [
        "Mitigation measures for predicted impacts",
        "A monitoring programme",
        "The project's profit-and-loss statement",
        "Institutional/budgetary arrangements for implementation",
      ],
      answer: [0, 1, 3],
      solution: {
        given: "An EMP operationalises mitigation and monitoring of predicted impacts.",
        derivation: "It specifies mitigation, a monitoring schedule, and the responsibilities/budget to implement them. Financial profitability is not an EMP element.",
        target: "**Correct: mitigation measures, monitoring programme, institutional/budgetary arrangements.** The P&L statement is not part of an EMP.",
      },
    },
    {
      id: "env-eia-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "In a Leopold-type matrix, an activity scores magnitude $M = 7$ and importance $I = 6$ for its impact on surface water. The cell impact score ($M\\times I$) is ______. (Round to the nearest whole number.)",
      natAnswer: 42,
      acceptedRange: [41, 43],
      unit: "",
      solution: {
        given: "$M = 7$, $I = 6$.",
        derivation: "$$S = M\\times I = 7\\times6 = 42$$",
        target: "**Target: 42 | Accepted range: 41 to 43.** The matrix multiplies magnitude by importance for each interaction cell.",
      },
    },
  ],
};

const hazardLegislationAccidents: LearnTopic = {
  slug: "hazard-legislation-accidents",
  subject: "Environment, Ventilation & Hazards",
  title: "Mine Legislation & Accident Analysis",
  tier: "free",
  blurb:
    "The Mines Act framework plus the frequency- and severity-rate arithmetic used to benchmark a mine's safety performance.",
  module: {
    principle:
      "Indian mining safety is governed by the **Mines Act 1952** and subordinate rules — the **Coal Mines Regulations** and **Metalliferous Mines Regulations** — enforced by the **DGMS (Directorate General of Mines Safety)**. The Act fixes duties of owner/agent/manager, hours, and notification of accidents. **Accident analysis** benchmarks performance with standardised rates so mines of different sizes can be compared. The two core indices are the **frequency rate** (number of injuries per standard quantum of exposure — e.g. per million man-hours or per 1000 persons employed) and the **severity rate** (days lost per the same quantum). Trends in these rates, not raw counts, reveal whether safety is improving.",
    formulaMatrix: [
      "**Frequency rate (per million man-hours)**: $FR = \\dfrac{\\text{No. of injuries}\\times10^{6}}{\\text{man-hours worked}}$",
      "",
      "**Severity rate (per million man-hours)**: $SR = \\dfrac{\\text{man-days lost}\\times10^{6}}{\\text{man-hours worked}}$",
      "",
      "**Incidence rate (per 1000 persons)**: $IR = \\dfrac{\\text{No. of injuries}\\times1000}{\\text{average persons employed}}$",
      "",
      "**Statutory frame (India)**: Mines Act 1952; Coal & Metalliferous Mines Regulations; enforced by DGMS.",
    ].join("\n"),
    traps: [
      "**Frequency vs severity.** Frequency counts *how often* injuries occur; severity weights them by *days lost*. A low-frequency, high-severity record is still poor.",
      "**Keep the base consistent.** Per-million-man-hours and per-1000-persons are different bases; don't mix them when comparing.",
      "**Man-hours, not shifts, unless stated.** Convert shifts to hours before applying the man-hour formulas.",
      "**Rates normalise for size.** Always benchmark with rates, not raw injury counts, across mines.",
    ],
  },
  questions: [
    {
      id: "haz-la-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "The statutory authority that administers and enforces safety legislation in Indian mines is the:",
      options: ["CPCB", "DGMS", "BIS", "NGT"],
      answer: 1,
      solution: {
        given: "Mine safety in India is regulated under the Mines Act 1952.",
        derivation: "The Directorate General of Mines Safety (DGMS) inspects mines and enforces the Act and its regulations.",
        target: "**Correct option: DGMS.** CPCB/NGT handle environmental matters; BIS sets standards.",
      },
    },
    {
      id: "haz-la-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A mine records $8$ reportable injuries while working $4{,}000{,}000$ man-hours in a year. The injury frequency rate per million man-hours is ______. (Round off to one decimal place.)",
      natAnswer: 2,
      acceptedRange: [1.9, 2.1],
      unit: "",
      solution: {
        given: "Injuries $= 8$, man-hours $= 4\\times10^{6}$.",
        derivation:
          "$$FR = \\frac{8\\times10^{6}}{4\\times10^{6}} = 2.0$$",
        target: "**Target: 2.0 | Accepted range: 1.9 to 2.1.** Two reportable injuries per million man-hours.",
      },
    },
    {
      id: "haz-la-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "In the same year the mine lost $6000$ man-days to injuries over $4{,}000{,}000$ man-hours. The severity rate per million man-hours is ______. (Round to the nearest whole number.)",
      natAnswer: 1500,
      acceptedRange: [1485, 1515],
      unit: "",
      solution: {
        given: "Man-days lost $= 6000$, man-hours $= 4\\times10^{6}$.",
        derivation:
          "$$SR = \\frac{6000\\times10^{6}}{4\\times10^{6}} = \\frac{6000}{4} = 1500$$",
        target: "**Target: 1500 | Accepted range: 1485 to 1515.** Severity weights injuries by days lost, exposing serious-but-rare events.",
      },
    },
  ],
};

/* ---- Section 6 — Mining & Mineral Economics -------------------------- */

const ecGeostatistics: LearnTopic = {
  slug: "ec-geostatistics",
  subject: "Mining & Mineral Economics",
  title: "Sampling, Geostatistics & Grade Control",
  tier: "free",
  blurb:
    "From sample mean and variance to the variogram and ordinary kriging — the statistics that turn drill assays into a defensible grade estimate.",
  module: {
    principle:
      "**Grade estimation** starts with **sampling**: assays of cores, channels or blastholes. The **sample mean** estimates grade; the **variance/standard deviation** quantifies its scatter. Classical statistics assumes samples are independent, but ore grades are **spatially correlated** — nearby samples are alike. **Geostatistics** captures this with the **variogram** $\\gamma(h)$, which rises with separation $h$ up to a **sill** at the **range** (beyond which samples are uncorrelated); a non-zero intercept is the **nugget effect** (micro-variability + sampling error). **Kriging** is the best linear unbiased estimator: it weights surrounding samples using the variogram to estimate a block grade with **minimum estimation variance**.",
    formulaMatrix: [
      "**Sample mean**: $\\bar{x} = \\dfrac{1}{n}\\sum_{i=1}^{n} x_i$",
      "",
      "**Sample variance**: $s^2 = \\dfrac{1}{n-1}\\sum_{i=1}^{n}(x_i-\\bar{x})^2$",
      "",
      "**Experimental variogram**: $\\gamma(h) = \\dfrac{1}{2N(h)}\\sum (x_i - x_{i+h})^2$",
      "",
      "**Variogram model**: nugget $C_0$ + sill rise $C$ over the range $a$; total sill $= C_0 + C$.",
    ].join("\n"),
    traps: [
      "**Use $n-1$ for the *sample* variance**, not $n$ — the $n$ divisor is the (biased) population variance.",
      "**The variogram has a factor of $\\tfrac{1}{2}$** (it is a *semi*-variogram); forgetting it doubles $\\gamma(h)$.",
      "**Nugget is the intercept at $h\\to0$**, not the value at large $h$ (that is the sill).",
      "**Kriging minimises estimation variance**, giving each sample a weight — it is not a simple inverse-distance average.",
    ],
  },
  questions: [
    {
      id: "ec-gs-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "In a variogram, the non-zero value of $\\gamma(h)$ as the separation distance $h$ approaches zero is called the:",
      options: ["Sill", "Range", "Nugget effect", "Lag"],
      answer: 2,
      solution: {
        given: "A variogram rises from an intercept to a sill at the range.",
        derivation: "The intercept at $h\\to0$, due to micro-scale variability and sampling error, is the nugget effect.",
        target: "**Correct option: Nugget effect.** The sill is the plateau; the range is the distance to reach it.",
      },
    },
    {
      id: "ec-gs-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Four channel samples assay $2.0, 4.0, 4.0$ and $6.0\\ \\%$ metal. The sample mean grade is ______ %. (Round off to one decimal place.)",
      natAnswer: 4,
      acceptedRange: [3.9, 4.1],
      unit: "%",
      solution: {
        given: "Samples: 2.0, 4.0, 4.0, 6.0 (%), $n = 4$.",
        derivation:
          "$$\\bar{x} = \\frac{2.0+4.0+4.0+6.0}{4} = \\frac{16.0}{4} = 4.0\\%$$",
        target: "**Target: 4.0% | Accepted range: 3.9 to 4.1.** Simple arithmetic mean of the assays.",
      },
    },
    {
      id: "ec-gs-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For the same four samples ($2.0, 4.0, 4.0, 6.0\\ \\%$, mean $4.0\\%$), the sample standard deviation (using the $n-1$ divisor) is ______ %. (Round off to two decimal places.)",
      natAnswer: 1.63,
      acceptedRange: [1.58, 1.68],
      unit: "%",
      solution: {
        given: "Deviations from mean 4.0: $-2, 0, 0, +2$; $n = 4$.",
        derivation:
          "$$\\sum(x_i-\\bar x)^2 = (-2)^2+0+0+(2)^2 = 8$$\n$$s^2 = \\frac{8}{n-1} = \\frac{8}{3} = 2.667$$\n$$s = \\sqrt{2.667} = 1.63\\%$$",
        target: "**Target: 1.63% | Accepted range: 1.58 to 1.68.** Divide by $n-1=3$ for the sample standard deviation.",
      },
    },
  ],
};

const ecMineSizeCutoff: LearnTopic = {
  slug: "ec-mine-size-cutoff",
  subject: "Mining & Mineral Economics",
  title: "Mine Size, Life & Optimum Cut-off Grade",
  tier: "free",
  blurb:
    "Taylor's rule for optimum mine life and the break-even cut-off grade that separates ore from waste.",
  module: {
    principle:
      "Two linked decisions size a mine: **how fast to mine** (production rate / life) and **what to call ore** (cut-off grade). **Taylor's rule** is the classic empirical guide to **optimum mine life** from the tonnage of reserves — bigger deposits justify proportionally longer (but not linearly longer) lives, and the optimum daily rate follows. The **break-even cut-off grade** is the grade at which the **revenue from a tonne of ore just equals the cost** of mining, processing and selling it; material above cut-off is ore, below is waste. Raising the cut-off lifts the average grade fed to the plant but shrinks the reserve — the central economic trade-off in planning.",
    formulaMatrix: [
      "**Taylor's rule (optimum life)**: $\\text{Life (years)} \\approx 0.2\\times\\sqrt[4]{\\text{ExpReserves (tonnes)}}$ (±20%)",
      "",
      "**Daily rate**: $\\text{Rate} = \\dfrac{\\text{Reserves}}{\\text{Life}\\times\\text{operating days/yr}}$",
      "",
      "**Break-even cut-off grade**: $g_{co} = \\dfrac{\\text{Cost per tonne}}{\\text{Price}\\times\\text{Recovery}}$",
      "",
      "**Cut-off in metal terms**: above $g_{co}$ a tonne pays its way; below it loses money.",
    ].join("\n"),
    traps: [
      "**Taylor's rule uses the fourth root of tonnage**, not a linear scaling — doubling reserves does not double life.",
      "**Match units in the cut-off formula.** Price per unit metal and cost per tonne ore must be consistent; include recovery.",
      "**Recovery sits in the denominator of $g_{co}$.** Ignoring it underestimates the grade needed to break even.",
      "**Higher cut-off = higher head grade but lower tonnage.** It is a trade-off, not a free improvement.",
    ],
  },
  questions: [
    {
      id: "ec-ms-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "Material whose grade lies below the break-even cut-off grade is classified as:",
      options: ["Ore", "Waste", "High-grade ore", "Concentrate"],
      answer: 1,
      solution: {
        given: "Cut-off grade separates economically mineable ore from sub-economic material.",
        derivation: "Below cut-off, a tonne's revenue cannot cover its cost, so it is waste.",
        target: "**Correct option: Waste.** Only material at or above cut-off is ore.",
      },
    },
    {
      id: "ec-ms-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Mining + processing + selling cost is $\\$30$ per tonne of ore. The metal sells for $\\$2000$ per tonne and process recovery is $75\\%$. The break-even cut-off grade is ______ % metal. (Round off to two decimal places.)",
      natAnswer: 2,
      acceptedRange: [1.95, 2.05],
      unit: "%",
      solution: {
        given: "Cost $= \\$30/\\text{t ore}$, price $= \\$2000/\\text{t metal}$, recovery $= 0.75$.",
        derivation:
          "$$g_{co} = \\frac{\\text{cost}}{\\text{price}\\times\\text{recovery}} = \\frac{30}{2000\\times0.75} = \\frac{30}{1500} = 0.02$$\n$$= 2.0\\%$$",
        target: "**Target: 2.00% | Accepted range: 1.95 to 2.05.** A tonne grading 2% yields $0.02\\times0.75\\times2000 = \\$30$, exactly covering cost.",
      },
    },
    {
      id: "ec-ms-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "By Taylor's rule, the optimum life of a mine with expected reserves of $50$ million tonnes is approximately $0.2\\times\\sqrt[4]{\\text{tonnes}}$ years. The optimum life is ______ years. (Round to the nearest whole number.)",
      natAnswer: 17,
      acceptedRange: [15, 18],
      unit: "years",
      solution: {
        given: "Reserves $= 50\\times10^{6}\\ \\text{t}$.",
        derivation:
          "$$\\sqrt[4]{50\\times10^{6}} = (5\\times10^{7})^{0.25}$$\n$$= (5)^{0.25}\\times(10^{7})^{0.25} = 1.495\\times56.23 = 84.07$$\n$$\\text{Life} = 0.2\\times84.07 = 16.8\\approx17\\ \\text{years}$$",
        target: "**Target: 17 years | Accepted range: 15 to 18.** Taylor's rule scales with the fourth root of tonnage.",
      },
    },
  ],
};

const ecPitStopePlanning: LearnTopic = {
  slug: "ec-pit-stope-planning",
  subject: "Mining & Mineral Economics",
  title: "Ultimate Pit & Stope Planning",
  tier: "free",
  blurb:
    "Stripping ratio, the break-even stripping ratio (BESR) and the Lerchs–Grossmann idea behind the ultimate pit limit.",
  module: {
    principle:
      "For a surface mine, the **ultimate pit limit** is the economically optimal final shape — mined only while each extra increment of ore pays for the waste removed to reach it. The key ratio is the **stripping ratio** $SR$ = tonnes (or volume) of waste per tonne of ore. The **break-even stripping ratio (BESR)** is the maximum waste a tonne of ore can carry before mining it loses money. The classic optimisation is the **Lerchs–Grossmann** algorithm, which finds the maximum-value pit on a block model subject to pull-back **slope (wall) angle** constraints. Underground, the analogous decision is **stope boundary planning** — choosing which blocks to stope so that each pays for its own development and support.",
    formulaMatrix: [
      "**Stripping ratio**: $SR = \\dfrac{\\text{waste mined}}{\\text{ore mined}}$ (t/t or m³/t)",
      "",
      "**Break-even SR**: $BESR = \\dfrac{(\\text{Price}-\\text{Production cost})\\ \\text{per t ore}}{\\text{Cost of removing one tonne of waste}}$",
      "",
      "**Mine while** $SR \\leq BESR$; stop extending the pit when $SR = BESR$.",
      "",
      "**Pit value (block model)**: $\\sum(\\text{block value})$ maximised subject to slope-angle precedence (Lerchs–Grossmann).",
    ].join("\n"),
    traps: [
      "**BESR uses the *net* value of ore (price − production cost)** over the waste-removal cost — not price alone.",
      "**Mine only while $SR\\leq BESR$.** Extending the pit where $SR>BESR$ destroys value.",
      "**Stripping ratio can be mass or volume based** — state which; rock densities differ between ore and waste.",
      "**Slope-angle constraints drive waste.** Flatter walls (weaker rock) force more stripping for the same ore.",
    ],
  },
  questions: [
    {
      id: "ec-ps-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "The stripping ratio of an open-pit mine is the ratio of:",
      options: [
        "Ore to waste",
        "Waste to ore",
        "Ore to total material",
        "Concentrate to tailings",
      ],
      answer: 1,
      solution: {
        given: "Stripping ratio expresses how much waste accompanies each unit of ore.",
        derivation: "$SR = \\text{waste}/\\text{ore}$, e.g. 3:1 means three tonnes of waste per tonne of ore.",
        target: "**Correct option: Waste to ore.** Higher SR means more waste handling per tonne of ore.",
      },
    },
    {
      id: "ec-ps-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A tonne of ore returns a net value (price minus production cost) of $\\$24$. Removing a tonne of waste costs $\\$3$. The break-even stripping ratio is ______ (tonnes waste per tonne ore). (Round to the nearest whole number.)",
      natAnswer: 8,
      acceptedRange: [7.8, 8.2],
      unit: "",
      solution: {
        given: "Net ore value $= \\$24/\\text{t}$, waste removal cost $= \\$3/\\text{t}$.",
        derivation:
          "$$BESR = \\frac{\\text{net value of ore}}{\\text{cost per t waste}} = \\frac{24}{3} = 8$$",
        target: "**Target: 8 | Accepted range: 7.8 to 8.2.** Up to 8 t of waste per t of ore can be carried before breaking even.",
      },
    },
    {
      id: "ec-ps-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A pushback exposes $200{,}000\\ \\text{t}$ of ore and requires removing $1{,}400{,}000\\ \\text{t}$ of waste. If the break-even stripping ratio is $8:1$, the actual stripping ratio is ______, so the pushback is (economic / uneconomic). Give the numerical stripping ratio. (Round off to one decimal place.)",
      natAnswer: 7,
      acceptedRange: [6.8, 7.2],
      unit: "",
      solution: {
        given: "Ore $= 200{,}000\\ \\text{t}$, waste $= 1{,}400{,}000\\ \\text{t}$, $BESR = 8$.",
        derivation:
          "$$SR = \\frac{1{,}400{,}000}{200{,}000} = 7.0$$\nSince $SR = 7 \\leq BESR = 8$, the pushback is **economic**.",
        target: "**Target: 7.0 | Accepted range: 6.8 to 7.2.** $SR(7) < BESR(8)$, so the increment pays — mine it.",
      },
    },
  ],
};

const ecHaulroadEquipment: LearnTopic = {
  slug: "ec-haulroad-equipment",
  subject: "Mining & Mineral Economics",
  title: "Haul-road Design & Equipment Selection",
  tier: "free",
  blurb:
    "Rolling and grade resistance, rimpull and the truck–shovel match factor that balances a loading-and-hauling fleet.",
  module: {
    principle:
      "Hauling cost dominates surface-mine economics, so **haul-road design** and **fleet matching** are central. A truck must overcome **total resistance** = **rolling resistance** (tyre/road deformation, as a % of weight) + **grade resistance** (≈1% of weight per 1% of uphill grade). The engine supplies **rimpull** (tractive force at the tyre); the truck can climb only while $\\text{rimpull} \\geq \\text{total resistance force}$. Fleet productivity depends on **matching** loaders to trucks: the **match factor** compares the loader's truck-filling capacity with the trucks' demand — a factor near **1.0** balances the fleet, $<1$ means the loader waits, $>1$ means trucks queue.",
    formulaMatrix: [
      "**Grade resistance**: $GR \\approx 1\\%\\ \\text{of GVW per }1\\%\\ \\text{grade}$  (force $= 0.01\\times\\text{grade}\\times W$)",
      "",
      "**Total resistance force**: $F = (RR\\% + GR\\%)\\times \\dfrac{W}{100}$  ($W$ = gross vehicle weight)",
      "",
      "**Rimpull needed**: $\\text{Rimpull} \\geq F$ to maintain speed; surplus accelerates the truck.",
      "",
      "**Match factor**: $MF = \\dfrac{N_{trucks}\\times \\text{loader cycle time}}{N_{loaders}\\times \\text{truck cycle time}}$  (target $\\approx 1.0$)",
    ].join("\n"),
    traps: [
      "**Grade resistance ≈ 1% of weight per 1% grade** — use the *percent* grade, not the angle in degrees (valid for small grades).",
      "**Add rolling and grade resistance** before comparing with rimpull; one alone understates the demand.",
      "**Match factor target is 1.0.** Above 1, trucks queue at the loader; below 1, the loader idles.",
      "**Rimpull falls as speed rises** (constant-power curve); check rimpull at the required gradeability speed.",
    ],
  },
  questions: [
    {
      id: "ec-he-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "A truck–shovel fleet with a match factor greater than 1.0 will typically experience:",
      options: [
        "Trucks queuing at the loader",
        "The loader idle and waiting",
        "Perfectly balanced operation",
        "No effect on productivity",
      ],
      answer: 0,
      solution: {
        given: "Match factor compares truck arrival demand with loader service capacity.",
        derivation: "$MF>1$ means trucks arrive faster than the loader can fill them, so they queue.",
        target: "**Correct option: Trucks queuing at the loader.** $MF<1$ idles the loader; $MF\\approx1$ balances.",
      },
    },
    {
      id: "ec-he-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A haul truck has a gross weight of $300\\ \\text{kN}$. Rolling resistance is $2\\%$ and it climbs a $6\\%$ grade. The total resistance force it must overcome is ______ kN. (Round to the nearest whole number.)",
      natAnswer: 24,
      acceptedRange: [23.5, 24.5],
      unit: "kN",
      solution: {
        given: "$W = 300\\ \\text{kN}$, $RR = 2\\%$, grade $= 6\\%$ (so $GR\\approx6\\%$).",
        derivation:
          "$$F = (RR + GR)\\times\\frac{W}{100} = (2+6)\\times\\frac{300}{100} = 8\\times3 = 24\\ \\text{kN}$$",
        target: "**Target: 24 kN | Accepted range: 23.5 to 24.5.** Add rolling (2%) and grade (6%) resistance, then apply to weight.",
      },
    },
    {
      id: "ec-he-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A loader fills a truck in $2.5\\ \\text{min}$. Each truck's full cycle time is $20\\ \\text{min}$. With one loader and $7$ trucks, the match factor is ______. (Round off to two decimal places.)",
      natAnswer: 0.875,
      acceptedRange: [0.85, 0.9],
      unit: "",
      solution: {
        given: "Loader cycle (fill) $= 2.5\\ \\text{min}$, truck cycle $= 20\\ \\text{min}$, $N_{trucks}=7$, $N_{loaders}=1$.",
        derivation:
          "$$MF = \\frac{N_{trucks}\\times t_{loader}}{N_{loaders}\\times t_{truck}} = \\frac{7\\times2.5}{1\\times20} = \\frac{17.5}{20} = 0.875$$",
        target: "**Target: 0.88 | Accepted range: 0.85 to 0.90.** $MF<1$, so the loader has slight idle time — room for an 8th truck.",
      },
    },
  ],
};

const ecNetworkAnalysis: LearnTopic = {
  slug: "ec-network-analysis",
  subject: "Mining & Mineral Economics",
  title: "Network Analysis (PERT/CPM)",
  tier: "free",
  blurb:
    "Critical path, the three-point PERT estimate and float — the project-scheduling tools for mine development and shutdowns.",
  module: {
    principle:
      "**Network analysis** schedules interdependent activities (sinking, drivages, plant installation, shutdowns). Activities and their dependencies form a network; the **critical path** is the longest chain of activities, and its length is the **shortest possible project duration**. **CPM (Critical Path Method)** uses single deterministic durations; **PERT** treats durations as uncertain, combining an **optimistic ($o$)**, **most-likely ($m$)** and **pessimistic ($p$)** estimate into an expected time. **Float (slack)** is the spare time a non-critical activity has before it delays the project; critical activities have **zero float**.",
    formulaMatrix: [
      "**PERT expected time**: $t_e = \\dfrac{o + 4m + p}{6}$",
      "",
      "**Activity variance**: $\\sigma^2 = \\left(\\dfrac{p - o}{6}\\right)^2$",
      "",
      "**Total float**: $TF = LS - ES = LF - EF$ (late minus early start/finish)",
      "",
      "**Project duration** = sum of $t_e$ along the **critical path** (the path with zero total float).",
    ].join("\n"),
    traps: [
      "**The most-likely estimate $m$ carries a weight of 4** in $t_e=(o+4m+p)/6$; treating all three equally is wrong.",
      "**The critical path is the *longest* path**, because every activity on it must finish for the project to end.",
      "**Critical activities have zero float.** Any float means the activity is not critical.",
      "**Variance uses $(p-o)/6$ squared** — only the spread of the extremes, not $m$.",
    ],
  },
  questions: [
    {
      id: "ec-na-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "In project network analysis, an activity that lies on the critical path has a total float of:",
      options: ["Maximum", "Zero", "Exactly one day", "Undefined"],
      answer: 1,
      solution: {
        given: "The critical path is the longest path and sets the project duration.",
        derivation: "Activities on it have no spare time; any delay delays the whole project, so total float = 0.",
        target: "**Correct option: Zero.** Non-critical activities carry positive float.",
      },
    },
    {
      id: "ec-na-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "An activity has an optimistic time of $4\\ \\text{days}$, most-likely $6\\ \\text{days}$ and pessimistic $14\\ \\text{days}$. Its PERT expected time is ______ days. (Round off to one decimal place.)",
      natAnswer: 7,
      acceptedRange: [6.9, 7.1],
      unit: "days",
      solution: {
        given: "$o = 4$, $m = 6$, $p = 14$.",
        derivation:
          "$$t_e = \\frac{o+4m+p}{6} = \\frac{4 + 4(6) + 14}{6} = \\frac{4+24+14}{6} = \\frac{42}{6} = 7.0$$",
        target: "**Target: 7.0 days | Accepted range: 6.9 to 7.1.** The most-likely value is weighted ×4.",
      },
    },
    {
      id: "ec-na-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For the activity above ($o=4$, $p=14$), the standard deviation of its duration is ______ days. (Round off to two decimal places.)",
      natAnswer: 1.67,
      acceptedRange: [1.6, 1.74],
      unit: "days",
      solution: {
        given: "$o = 4$, $p = 14$.",
        derivation:
          "$$\\sigma = \\frac{p-o}{6} = \\frac{14-4}{6} = \\frac{10}{6} = 1.667\\ \\text{days}$$",
        target: "**Target: 1.67 days | Accepted range: 1.60 to 1.74.** Variance is $\\sigma^2=(10/6)^2\\approx2.78$.",
      },
    },
  ],
};

const ecInventory: LearnTopic = {
  slug: "ec-inventory",
  subject: "Mining & Mineral Economics",
  title: "Inventory Models",
  tier: "free",
  blurb:
    "The Economic Order Quantity, reorder point and total inventory cost that minimise stores and spares spending.",
  module: {
    principle:
      "A mine ties up capital in **stores and spares**. **Inventory models** find the order policy that minimises total cost, balancing two opposing costs: **ordering cost** (per purchase order — falls if you order in big batches) against **holding (carrying) cost** (per unit per year — rises with batch size). The **Economic Order Quantity (EOQ)** is the batch size that minimises their sum. At EOQ the **annual ordering cost equals the annual holding cost**. The **reorder point** is the stock level that triggers a fresh order, set so stock lasts through the **lead time** (plus safety stock).",
    formulaMatrix: [
      "**EOQ**: $Q^* = \\sqrt{\\dfrac{2DS}{H}}$  ($D$ = annual demand, $S$ = cost per order, $H$ = holding cost per unit per year)",
      "",
      "**Minimum total variable cost**: $TC^* = \\sqrt{2DSH}$  (and ordering cost $=$ holding cost at $Q^*$)",
      "",
      "**Number of orders/yr**: $N = \\dfrac{D}{Q^*}$;  **cycle time** $= \\dfrac{Q^*}{D}$",
      "",
      "**Reorder point**: $ROP = d\\times L\\;(+\\,\\text{safety stock})$  ($d$ = demand rate, $L$ = lead time)",
    ].join("\n"),
    traps: [
      "**EOQ has the $2DS$ inside a square root.** Forgetting the root, or the factor 2, is the classic error.",
      "**$H$ is the holding cost per unit *per year*** — if given as a % of unit price, multiply by price first.",
      "**At EOQ, ordering cost = holding cost** — a quick check on your answer.",
      "**Reorder point uses lead-time demand**, not annual demand; convert $D$ to the lead-time period.",
    ],
  },
  questions: [
    {
      id: "ec-inv-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "At the Economic Order Quantity, the annual ordering cost is:",
      options: [
        "Much greater than the holding cost",
        "Equal to the annual holding cost",
        "Zero",
        "Much less than the holding cost",
      ],
      answer: 1,
      solution: {
        given: "EOQ minimises the sum of ordering and holding costs.",
        derivation: "At the minimum of the total-cost curve, the two cost components are equal.",
        target: "**Correct option: Equal to the annual holding cost.** This equality defines the EOQ.",
      },
    },
    {
      id: "ec-inv-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "Annual demand for a spare is $1200$ units, the cost per order is $\\$100$, and the holding cost is $\\$6$ per unit per year. The Economic Order Quantity is ______ units. (Round to the nearest whole number.)",
      natAnswer: 200,
      acceptedRange: [195, 205],
      unit: "units",
      solution: {
        given: "$D = 1200$, $S = \\$100$, $H = \\$6$/unit/yr.",
        derivation:
          "$$Q^* = \\sqrt{\\frac{2DS}{H}} = \\sqrt{\\frac{2\\times1200\\times100}{6}} = \\sqrt{\\frac{240{,}000}{6}} = \\sqrt{40{,}000} = 200$$",
        target: "**Target: 200 units | Accepted range: 195 to 205.** Order 200 at a time; $N = 1200/200 = 6$ orders/yr.",
      },
    },
    {
      id: "ec-inv-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "For the same item ($D=1200$, $S=\\$100$, $H=\\$6$, $Q^*=200$), the minimum total variable (ordering + holding) cost per year is ______ dollars. (Round to the nearest whole number.)",
      natAnswer: 1200,
      acceptedRange: [1185, 1215],
      unit: "$",
      solution: {
        given: "$D=1200$, $S=100$, $H=6$, $Q^*=200$.",
        derivation:
          "$$TC^* = \\sqrt{2DSH} = \\sqrt{2\\times1200\\times100\\times6} = \\sqrt{1{,}440{,}000} = 1200$$\nCheck: ordering $=\\frac{D}{Q}S = 6\\times100 = 600$; holding $=\\frac{Q}{2}H = 100\\times6 = 600$; sum $=1200$.",
        target: "**Target: \\$1200 | Accepted range: 1185 to 1215.** Ordering (\\$600) and holding (\\$600) are equal at EOQ.",
      },
    },
  ],
};

const ecMaintainabilityDecision: LearnTopic = {
  slug: "ec-maintainability-decision",
  subject: "Mining & Mineral Economics",
  title: "Maintainability, Availability & Decision Trees",
  tier: "free",
  blurb:
    "MTBF, MTTR and machine availability, plus the expected-monetary-value logic of decision trees under uncertainty.",
  module: {
    principle:
      "Equipment economics hinges on **availability** — the fraction of scheduled time a machine is fit to run. It is built from two reliability measures: **MTBF (mean time between failures)**, a measure of reliability, and **MTTR (mean time to repair)**, a measure of **maintainability**. Higher MTBF and lower MTTR both raise availability. For investment and operating choices under uncertainty, **decision trees** lay out decisions (squares) and chance events (circles) with probabilities and payoffs; each branch is rolled back using **expected monetary value (EMV)** — the probability-weighted average payoff — and the highest-EMV decision is chosen.",
    formulaMatrix: [
      "**Availability**: $A = \\dfrac{MTBF}{MTBF + MTTR}$",
      "",
      "**Failure rate**: $\\lambda = \\dfrac{1}{MTBF}$;  **repair rate** $\\mu = \\dfrac{1}{MTTR}$",
      "",
      "**Expected monetary value**: $EMV = \\sum_i p_i\\,V_i$  (probability $p_i$ × payoff $V_i$, $\\sum p_i = 1$)",
      "",
      "**Decision rule**: choose the alternative with the **highest EMV** (or lowest expected cost).",
    ].join("\n"),
    traps: [
      "**Availability puts MTBF over (MTBF + MTTR)** — not MTBF over MTTR. Mixing these is the classic slip.",
      "**MTBF and MTTR must share units** (both hours, say) before combining.",
      "**EMV weights *all* outcomes by probability** — don't just take the best-case payoff.",
      "**Probabilities at a chance node sum to 1.** If they don't, an outcome is missing.",
    ],
  },
  questions: [
    {
      id: "ec-mt-q1",
      difficulty: "basic",
      marks: 1,
      type: "MCQ",
      stem: "Mean Time To Repair (MTTR) is primarily a measure of a machine's:",
      options: ["Reliability", "Maintainability", "Purchase cost", "Fuel efficiency"],
      answer: 1,
      solution: {
        given: "MTBF measures reliability; MTTR measures how quickly repairs are made.",
        derivation: "A short MTTR means faults are fixed quickly — that is maintainability.",
        target: "**Correct option: Maintainability.** Reliability is captured by MTBF.",
      },
    },
    {
      id: "ec-mt-q2",
      difficulty: "medium",
      marks: 2,
      type: "NAT",
      stem:
        "A shovel has a mean time between failures of $90\\ \\text{h}$ and a mean time to repair of $10\\ \\text{h}$. Its availability is ______ %. (Round to the nearest whole number.)",
      natAnswer: 90,
      acceptedRange: [89, 91],
      unit: "%",
      solution: {
        given: "$MTBF = 90\\ \\text{h}$, $MTTR = 10\\ \\text{h}$.",
        derivation:
          "$$A = \\frac{MTBF}{MTBF+MTTR} = \\frac{90}{90+10} = \\frac{90}{100} = 0.90 = 90\\%$$",
        target: "**Target: 90% | Accepted range: 89 to 91.** Availability = uptime ÷ (uptime + repair time).",
      },
    },
    {
      id: "ec-mt-q3",
      difficulty: "hard",
      marks: 2,
      type: "NAT",
      stem:
        "A decision has two outcomes: a $0.6$ chance of a $\\$50{,}000$ profit and a $0.4$ chance of a $\\$20{,}000$ loss. The expected monetary value (EMV) of the decision is ______ dollars. (Round to the nearest whole number.)",
      natAnswer: 22000,
      acceptedRange: [21500, 22500],
      unit: "$",
      solution: {
        given: "$p_1 = 0.6$, $V_1 = +50{,}000$; $p_2 = 0.4$, $V_2 = -20{,}000$.",
        derivation:
          "$$EMV = \\sum p_i V_i = 0.6\\times50{,}000 + 0.4\\times(-20{,}000)$$\n$$= 30{,}000 - 8{,}000 = 22{,}000$$",
        target: "**Target: \\$22000 | Accepted range: 21500 to 22500.** Positive EMV favours taking the decision.",
      },
    },
  ],
};

export const LEARN_TOPICS: LearnTopic[] = [
  // Section 1 — Engineering Mathematics
  emLinearAlgebra,
  emCalculus,
  emVectorCalculus,
  emDifferentialEquations,
  emProbabilityStatistics,
  emNumericalMethods,
  // Section 2 — Mine Development & Surveying
  mdsExplosivesBlasting,
  mdsLevellingTacheometry,
  mdsChainTapeCorrections,
  mdsTraverseCurves,
  mdsAccessDeposits,
  mdsUndergroundDrivages,
  mdsDrilling,
  mdsUndergroundCorrelation,
  mdsEdmTotalStation,
  geoMineralsRocks,
  geoOreGenesis,
  geoStructural,
  mdsRockToolInteraction,
  mdsGisRemoteSensing,
  // Section 3 — Geomechanics & Ground Control
  gmMohrCoulomb,
  gmStressAroundOpenings,
  gmPillarDesign,
  gmSlopeStability,
  gmRockProperties,
  gmRmrQ,
  gmSubsidence,
  gmSupportDesign,
  gmRockBursts,
  gmGroundVibrations,
  gmEngineeringMechanics,
  gmInsituMeasurement,
  gmMineFilling,
  // Section 4 — Mining Methods & Machinery
  mmBeltConveyor,
  mmHaulageRope,
  mmHoisting,
  mmPumpsComminution,
  mmSurfaceMining,
  mmContinuousSurface,
  mmBordPillar,
  mmLongwall,
  mmThickSeam,
  mmStoping,
  mmPowerTransmission,
  // Section 5 — Mine Ventilation & Surface Environment
  ventilationResistanceFanLaws,
  ventilationMineGases,
  ventilationPsychrometry,
  ventilationDust,
  ventilationNVP,
  ventilationMechanicalFans,
  ventilationAuxiliary,
  ventilationMineFires,
  envNoisePollution,
  envNoiseExposure,
  envLandReclamation,
  hazardMineInundation,
  hazardMineLighting,
  hazardSafetyHealth,
  ventilationHeatCooling,
  ventilationNetworksSurvey,
  hazardMethaneDrainage,
  envEia,
  hazardLegislationAccidents,
  // Section 6 — Mining & Mineral Economics
  ecDcfNpv,
  ecReliability,
  ecQueueing,
  ecLinearProgramming,
  ecResourceClassification,
  ecReserveEstimation,
  ecMineralTaxation,
  ecFacilityLocation,
  ecCostBenefit,
  ecGeostatistics,
  ecMineSizeCutoff,
  ecPitStopePlanning,
  ecHaulroadEquipment,
  ecNetworkAnalysis,
  ecInventory,
  ecMaintainabilityDecision,
];

export function getLearnTopic(slug: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((t) => t.slug === slug);
}

/* ════════════════════════════════════════════════════════════════════ */
/*  GATE MN SYLLABUS MAP                                                  */
/*                                                                        */
/*  The Learn dashboard is organised exactly like the official GATE      */
/*  Mining Engineering (MN) syllabus: six numbered sections, each with    */
/*  its syllabus sub-topics. A sub-topic whose `slug` resolves to a       */
/*  LearnTopic above is a fully-authored module (Part 1/2/3 engine);      */
/*  the rest render as a "coming soon" roadmap so the page mirrors the    */
/*  complete syllabus, not just what's been written yet.                  */
/* ════════════════════════════════════════════════════════════════════ */

export type LearnSyllabusSubtopic = {
  /** Syllabus line-item name. */
  title: string;
  /** When set and it matches a LEARN_TOPICS slug, the sub-topic is live. */
  slug?: string;
  /** Short "what's inside" line shown under a live sub-topic. */
  highlight?: string;
};

export type LearnSyllabusSection = {
  /** 1–6, matching the GATE MN section numbering. */
  id: number;
  /** Official section title. */
  title: string;
  /** One-line scope description. */
  summary: string;
  subtopics: LearnSyllabusSubtopic[];
};

export const LEARN_SYLLABUS: LearnSyllabusSection[] = [
  {
    id: 1,
    title: "Engineering Mathematics",
    summary: "The mathematical toolkit underpinning every quantitative question on the paper.",
    subtopics: [
      { title: "Linear Algebra", slug: "em-linear-algebra", highlight: "Matrices, rank, inverse, eigenvalues/vectors, Cayley–Hamilton, linear systems" },
      { title: "Calculus", slug: "em-calculus", highlight: "Limits, continuity, partial derivatives, MVT, L'Hôpital, maxima/minima, Taylor, sequences & series, Fourier" },
      { title: "Vector Calculus", slug: "em-vector-calculus", highlight: "Gradient, divergence, curl; line/surface/volume integrals; Stokes, Gauss & Green" },
      { title: "Differential Equations", slug: "em-differential-equations", highlight: "First-order ODEs, higher-order linear, Cauchy–Euler equations" },
      { title: "Probability & Statistics", slug: "em-probability-statistics", highlight: "Central tendency & dispersion, hypothesis testing, binomial/Poisson/exponential/normal, correlation & regression" },
      { title: "Numerical Methods", slug: "em-numerical-methods", highlight: "Linear systems, interpolation, trapezoidal & Simpson, single & multi-step ODE methods" },
    ],
  },
  {
    id: 2,
    title: "Mining Geology, Mine Development and Surveying",
    summary: "The deposit's geology, gaining access to it, and fixing everything accurately in space.",
    subtopics: [
      { title: "Mining Geology: minerals & rocks", slug: "geo-minerals-rocks", highlight: "Mineral properties; igneous, sedimentary & metamorphic rocks and their origin" },
      { title: "Classification & ore genesis", slug: "geo-ore-genesis", highlight: "Magmatic, hydrothermal, sedimentary & placer ore-forming processes" },
      { title: "Structural geology", slug: "geo-structural", highlight: "Folds, faults, joints, dip & strike, unconformities" },
      { title: "Methods of access to deposits", slug: "mds-access-deposits", highlight: "Shaft/incline/adit, incline length L = H/sinθ, 1-in-n gradient" },
      { title: "Underground drivages", slug: "mds-underground-drivages", highlight: "Advance = d·η_pull, rounds = L/a, muck = A·a·ρ" },
      { title: "Drilling methods & machines", slug: "mds-drilling", highlight: "Penetration rate, drilling time, specific drilling m/m³" },
      { title: "Explosives, blasting devices & practices", slug: "mds-explosives-blasting", highlight: "Powder factor, bench geometry, charge per hole" },
      { title: "Levelling, theodolite & tacheometry", slug: "mds-levelling-tacheometry", highlight: "HI method RL, stadia distance D = KS·cos²θ" },
      { title: "Triangulation, contouring, errors & adjustments", slug: "mds-chain-tape-corrections", highlight: "Standardisation, temperature, slope corrections" },
      { title: "Underground surveying & correlation", slug: "mds-underground-correlation", highlight: "Length √(ΔN²+ΔE²), bearing, closing error" },
      { title: "Curves, photogrammetry & field astronomy", slug: "mds-traverse-curves", highlight: "Latitude/departure, tangent length, arc length" },
      { title: "EDM, Total Station & GPS", slug: "mds-edm-total-station", highlight: "Slope reduction D = Scosα, V = Ssinα" },
      { title: "Rock–tool interaction & mechanical cutting", slug: "mds-rock-tool-interaction", highlight: "Specific energy, pick forces, cutter selection for roadheaders & continuous miners" },
      { title: "GIS & remote sensing basics", slug: "mds-gis-remote-sensing", highlight: "Georeferencing, raster/vector, spectral bands, photogrammetry basics" },
    ],
  },
  {
    id: 3,
    title: "Geomechanics and Ground Control",
    summary: "How rock behaves under stress and how we keep openings stable.",
    subtopics: [
      { title: "Engineering Mechanics", slug: "gm-engineering-mechanics", highlight: "Equilibrium, 2-D trusses & frames, FBD, friction, beam analysis, particle kinematics & dynamics" },
      { title: "Geotechnical properties of rocks", slug: "gm-rock-properties", highlight: "Porosity n=Vv/V, void ratio e=n/(1−n), UCS≈22·Is(50)" },
      { title: "Rock mass classification (RMR, Q)", slug: "gm-rmr-q", highlight: "RMR = Σ6 ratings + adjustment, Q = (RQD/Jn)(Jr/Ja)(Jw/SRF)" },
      { title: "Stress distribution around openings", slug: "gm-stress-around-openings", highlight: "σ_v = γH, Kirsch sidewall 3σ_v−σ_h, roof 3σ_h−σ_v" },
      { title: "Theories of rock failure (Mohr–Coulomb)", slug: "gm-mohr-coulomb", highlight: "τ = c + σ tanφ, σ₁ = σ₃N_φ + 2c√N_φ, Mohr circle" },
      { title: "Subsidence", slug: "gm-subsidence", highlight: "S_max = a·m, critical width W = 2H tan(angle of draw)" },
      { title: "Slope stability", slug: "gm-slope-stability", highlight: "FS = (cA + Wcosβ tanφ)/(Wsinβ); c=0 ⇒ tanφ/tanβ" },
      { title: "Design of supports in roadways & workings", slug: "gm-support-design", highlight: "Support pressure p=γH_p, roof load p·A, bolts N=F·FS/cap" },
      { title: "Pillar design", slug: "gm-pillar-design", highlight: "Tributary σ_p = σ_v(W+B)²/W², Obert–Duvall, FS" },
      { title: "Rock bursts & coal bumps", slug: "gm-rock-bursts", highlight: "Strain energy density u = σ²/(2E), total U = u·V" },
      { title: "Ground vibrations", slug: "gm-ground-vibrations", highlight: "Scaled distance SD=D/√W, PPV = k·SD^(−β)" },
      { title: "In-situ stress measurement & instrumentation", slug: "gm-insitu-measurement", highlight: "Hydrofracturing, overcoring, flat-jack; convergence & load monitoring" },
      { title: "Mine filling & strata monitoring", slug: "gm-mine-filling", highlight: "Hydraulic/paste fill, fill strength, strata-control & monitoring plan" },
    ],
  },
  {
    id: 4,
    title: "Mining Methods and Machinery",
    summary: "Extracting the ore — the systems, layouts and machines that move rock.",
    subtopics: [
      { title: "Surface mining: layout, development & mechanization", slug: "mm-surface-mining", highlight: "Stripping ratio SR=waste/ore, BESR=(price−cost)/strip cost" },
      { title: "Continuous surface mining systems", slug: "mm-continuous-surface", highlight: "BWE output = n·V_b·f·60, solid = loose/swell factor" },
      { title: "Bord & pillar mining", slug: "mm-bord-pillar", highlight: "Extraction e = 1 − W²/(W+B)² for square pillars" },
      { title: "Longwall mining", slug: "mm-longwall", highlight: "Output/cycle = L·d·h·ρ, scaled to daily & annual" },
      { title: "Thick-seam mining methods", slug: "mm-thick-seam", highlight: "Recovery = extracted/in-situ, LTCC h_eff = h_cut + h_top·R" },
      { title: "Underground metal mining: stoping methods", slug: "mm-stoping", highlight: "Dilution = waste/(ore+waste), diluted grade, mill tonnage" },
      { title: "Generation & transmission of power", slug: "mm-power-transmission", highlight: "P = √3·V_L·I_L·cosφ, line loss 3I²R" },
      { title: "Materials handling: haulage, conveyors & ropeways", slug: "mm-belt-conveyor", highlight: "Belt capacity Q_m = 3.6·A·v·ρ, lift power ṁgH" },
      { title: "Rope haulage & gradients", slug: "mm-haulage-rope", highlight: "T = W(sinθ + μcosθ), trip power T·v" },
      { title: "Hoisting systems", slug: "mm-hoisting", highlight: "Static F = mg, accelerating m(g+a), P = Fv/η" },
      { title: "Pumps & comminution", slug: "mm-pumps-comminution", highlight: "Pump P = ρgQH/η, Bond's law grinding energy" },
    ],
  },
  {
    id: 5,
    title: "Surface Environment, Mine Ventilation & Underground Hazards",
    summary: "Keeping the mine atmosphere and surroundings safe, breathable and legal.",
    subtopics: [
      { title: "Air, water & soil pollution: standards & control", slug: "env-noise-pollution", highlight: "Decibel addition, +3 dB doubling rule, source combination" },
      { title: "Noise", slug: "env-noise-exposure", highlight: "Permissible T = 8/2^((L−90)/5), noise dose Σ(C/T)×100%" },
      { title: "Land reclamation", slug: "env-land-reclamation", highlight: "Volume = area×depth, swell & truck loads, cut–fill balance" },
      {
        title: "Airway resistance & fan laws",
        slug: "ventilation-airway-resistance-fan-laws",
        highlight: "Atkinson R, square law, series/parallel, fan laws",
      },
      {
        title: "Natural ventilation pressure (NVP)",
        slug: "ventilation-natural-ventilation-pressure",
        highlight: "ρ=P/RₐT, NVP=(ρ_d−ρ_u)gH, fan+NVP combination, shaft figure",
      },
      { title: "Mechanical ventilation & mine fans", slug: "ventilation-mechanical-fans", highlight: "Air power P·Q, shaft power /η, operating point, P–Q curve" },
      { title: "Auxiliary ventilation", slug: "ventilation-auxiliary", highlight: "Duct RQ², leakage η_d = Q_face/Q_fan, fan air power" },
      {
        title: "Mine gases & gas dilution",
        slug: "ventilation-mine-gases-dilution",
        highlight: "ppm↔%, dilution airflow Q=q/(C−B), explosive-range bar figure",
      },
      {
        title: "Psychrometry & mine climate",
        slug: "ventilation-psychrometry-mine-climate",
        highlight: "RH, moisture content W=0.622·pv/(P−pv), psychrometric figure",
      },
      {
        title: "Mine dust sampling & control",
        slug: "ventilation-mine-dust-sampling",
        highlight: "gravimetric c=m/V, time-weighted average, sampler + exposure figures",
      },
      { title: "Mine fires & explosions", slug: "ventilation-mine-fires", highlight: "CH₄ 5–15% range, Graham's ratio, O₂ deficiency 0.265N₂−O₂" },
      { title: "Mine inundation", slug: "hazard-mine-inundation", highlight: "Hydrostatic p=ρgh, pump-out t=V/Q, power ρgQH/η" },
      { title: "Mine lighting", slug: "hazard-mine-lighting", highlight: "E=Φ/A lux, inverse-square E=I/d², lumen method" },
      { title: "Rescue apparatus, safety & occupational health", slug: "hazard-safety-health", highlight: "Apparatus duration V/rate, accident frequency rate ×10⁶/man-hours" },
      { title: "Heat load, thermal environment & air cooling", slug: "ventilation-heat-cooling", highlight: "Strata & auto-compression heat, cooling load, refrigeration & spot cooling" },
      { title: "Ventilation networks, survey & planning", slug: "ventilation-networks-survey", highlight: "Kirchhoff laws, Hardy–Cross mesh balancing, pressure survey" },
      { title: "Methane drainage", slug: "hazard-methane-drainage", highlight: "Pre/post drainage, borehole capture, drainage efficiency" },
      { title: "Environmental impact assessment (EIA)", slug: "env-eia", highlight: "Baseline study, impact prediction, EMP, statutory clearances" },
      { title: "Mine legislation & accident analysis", slug: "hazard-legislation-accidents", highlight: "Mines Act & Regulations, frequency & severity rates, accident data" },
    ],
  },
  {
    id: 6,
    title: "Mineral Economics, Mine Planning, Systems Engineering",
    summary: "Valuing the deposit and planning the operation as an optimised system.",
    subtopics: [
      { title: "Mineral resource & reserve classification", slug: "ec-resource-classification", highlight: "In-situ T = A×t×ρ, recoverable reserve T×recovery" },
      { title: "Sampling & reserve estimation", slug: "ec-reserve-estimation", highlight: "Length-weighted grade Σ(g·l)/Σl" },
      { title: "Discounted cash flow & mine valuation", slug: "ec-dcf-npv", highlight: "PV = FV/(1+i)ⁿ, NPV = −C₀ + Σ CF/(1+i)ᵗ" },
      { title: "Mineral taxation", slug: "ec-mineral-taxation", highlight: "Royalty = rate×value, PAT = PBT×(1−tax)" },
      { title: "Mine planning, layouts & facility location", slug: "ec-facility-location", highlight: "Centre of gravity x*=Σw·x/Σw, y*=Σw·y/Σw" },
      { title: "Reliability of series & parallel systems", slug: "ec-reliability", highlight: "Series ∏Rᵢ, parallel 1−∏(1−Rᵢ), mixed blocks" },
      { title: "Cost-benefit analysis & work study", slug: "ec-cost-benefit", highlight: "B/C = PV benefits/PV costs, standard time, shift output" },
      { title: "Queueing theory", slug: "ec-queueing", highlight: "M/M/1: ρ=λ/μ, L_s=λ/(μ−λ), W_q" },
      { title: "Linear programming, transportation & assignment", slug: "ec-linear-programming", highlight: "Graphical LP, corner-point theorem, vertex optimum" },
      { title: "Sampling, geostatistics & grade control", slug: "ec-geostatistics", highlight: "Variogram, ordinary kriging, nugget/sill/range, QA–QC" },
      { title: "Mine size, life & optimum cut-off grade", slug: "ec-mine-size-cutoff", highlight: "Taylor's rule, optimum mill cut-off, NPV-driven mine life" },
      { title: "Ultimate pit & stope planning", slug: "ec-pit-stope-planning", highlight: "Lerchs–Grossmann pit limits, stope layout & sequencing" },
      { title: "Haul-road design & equipment selection", slug: "ec-haulroad-equipment", highlight: "Grade/width/superelevation, truck–shovel match, fleet sizing" },
      { title: "Network analysis (PERT/CPM)", slug: "ec-network-analysis", highlight: "Critical path, float, project crashing, PERT expected time" },
      { title: "Inventory models", slug: "ec-inventory", highlight: "EOQ, reorder point, safety stock, total cost" },
      { title: "Maintainability, availability & decision trees", slug: "ec-maintainability-decision", highlight: "MTBF/MTTR, availability A=MTBF/(MTBF+MTTR), EMV decision trees" },
    ],
  },
];

/** A syllabus sub-topic resolved against the authored LearnTopic bank. */
export type ResolvedSubtopic = LearnSyllabusSubtopic & { topic?: LearnTopic };

/** The full syllabus with each sub-topic's authored LearnTopic attached. */
export function getLearnSyllabus(): (Omit<LearnSyllabusSection, "subtopics"> & {
  subtopics: ResolvedSubtopic[];
  liveCount: number;
})[] {
  return LEARN_SYLLABUS.map((sec) => {
    const subtopics: ResolvedSubtopic[] = sec.subtopics.map((st) => ({
      ...st,
      topic: st.slug ? getLearnTopic(st.slug) : undefined,
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
