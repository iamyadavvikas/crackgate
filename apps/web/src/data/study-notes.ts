/**
 * Premium GATE MN Study Notes — data model + authored content.
 *
 * Each StudyNote follows the CrackGate "IIT Professor" revision-notes spec, a
 * close cousin of the Learn engine but tuned for last-mile revision rather than
 * question practice. Every note carries the same four high-yield sections:
 *
 *   1. trend          → Recent Trend Analysis (2017–2026): how the area is tested.
 *   2. formulaMatrix  → Master Formula Matrix & Derivations, each with a strict
 *                       SI Variable Index so arithmetic/unit errors are impossible.
 *   3. traps          → The "IIT Trap" Warning System (unit / geometry / boundary).
 *   4. examples       → High-Fidelity Core Examples worked step-by-step at the
 *                       complexity of a 2-mark GATE question.
 *
 * Authoring conventions:
 *   • Every text field is rendered by <MathText>, so inline `$…$` / block `$$…$$`
 *     KaTeX and **bold** are supported. MathText has no markdown headings / lists /
 *     tables — structure is expressed through the typed fields below (the renderer
 *     turns `variables` / `given` into real, theme-aware HTML tables).
 *   • Tier gating mirrors Learn: "free" is open, "subject" needs pro+, "premium"
 *     needs premium. The Trend Analysis section always shows as a free teaser; the
 *     deeper sections unlock with the right plan.
 */

export type StudyNoteTier = "free" | "subject" | "premium";

/** One row of a formula's SI Variable Index. */
export type FormulaVariable = {
  /** Symbol, LaTeX-aware (e.g. "$R$"). */
  sym: string;
  /** Plain-language meaning (MathText-aware). */
  meaning: string;
  /** Exact SI unit required, LaTeX-aware (e.g. "$N\\,s^2/m^8$"). */
  unit: string;
};

/** A single governing law / equation block in the Master Formula Matrix. */
export type FormulaEntry = {
  /** Short name of the law (e.g. "Atkinson / Square Law"). */
  name: string;
  /** The governing physical law in words (MathText). */
  law: string;
  /** Primary equation as a MathText `$$…$$` block. */
  equation: string;
  /** Optional time-saving engineering shortcut used in the exam (MathText). */
  shortcut?: string;
  /** Strict SI Variable Index — one row per symbol. */
  variables: FormulaVariable[];
};

/** One row of a worked example's Given Parameters Matrix (clean SI). */
export type WorkedGiven = { label: string; value: string };

/** A fully worked, deeply annotated core example (2-mark complexity). */
export type WorkedExample = {
  /** The question stem at 2-mark GATE complexity (MathText). */
  prompt: string;
  /** Given Parameters Matrix — inputs converted to uniform SI units. */
  given: WorkedGiven[];
  /** The Algebraic Derivation Track — line-by-line intermediate steps (MathText). */
  derivation: string;
  /** Final Target Value + standard accepted bounding range / rounding rule (MathText). */
  target: string;
};

export type StudyNote = {
  slug: string;
  subject: string;
  title: string;
  tier: StudyNoteTier;
  /** One-line catalog blurb. */
  blurb: string;
  /** Section 1 — Recent Trend Analysis (2017–2026). */
  trend: string;
  /** Section 2 — Master Formula Matrix & Derivations. */
  formulaMatrix: FormulaEntry[];
  /** Section 3 — The "IIT Trap" Warning System. */
  traps: string[];
  /** Section 4 — High-Fidelity Core Examples. */
  examples: WorkedExample[];
  /** Last-reviewed stamp shown in the UI (e.g. "Jun 2026"). */
  updated?: string;
};

/* ════════════════════════════════════════════════════════════════════ */
/*  Mine Ventilation & Underground Hazards                                */
/*  Fan Laws · P–Q Characteristic · Network Topology                      */
/* ════════════════════════════════════════════════════════════════════ */

const mineVentilation: StudyNote = {
  slug: "mine-ventilation-hazards",
  subject: "Mine Ventilation",
  title: "Mine Ventilation & Underground Hazards",
  tier: "subject",
  updated: "Jun 2026",
  blurb:
    "Fan laws, the P–Q characteristic & operating point, mine resistance and Kirchhoff network balancing — the single highest-yielding numerical cluster in GATE MN.",

  /* ─── Section 1 — Recent Trend Analysis (2017–2026) ─────────────────── */
  trend: [
    "Mine Ventilation is the **most numerically dense** chapter in GATE MN and has carried **4–7 marks almost every year from 2017 to 2026**, with the balance tilting sharply toward computation.",
    "",
    "**The decade-long shift in question style:**",
    "- **2017–2019** — mostly single-step recall: state the square law, compute a single resistance, or read an equivalent orifice. Pure 1-mark theory MCQs on damps and statutory air velocities were common.",
    "- **2020–2022** — the examiners moved to **two-step square-law manipulation**: resistances in **series and parallel combined first**, then a pressure or quantity solved. This is where the *parallel-resistance $\\sum 1/\\sqrt{R}$ rule* (NOT the electrical $\\sum 1/R$) began trapping candidates.",
    "- **2023–2026** — a decisive turn to **multi-variable NAT problems**: fan-law re-rating with **simultaneous changes in speed, diameter and air density**, operating-point reasoning on the **P–Q characteristic**, and **iterative network balancing** (Hardy-Cross style) across 2–3 mesh loops.",
    "",
    "**Exact recurring themes you must own:**",
    "- **Fan-law re-rating** under combined $N$, $D$, $\\rho$ changes — the $\\text{Power}\\propto N^3 D^5 \\rho$ scaling is the examiner's favourite distractor generator.",
    "- **Stable vs stall operation** on the fan characteristic — identifying that the duty point must sit on the **descending (right) limb**.",
    "- **Equivalent orifice classification** (large / medium / small) tied to a computed resistance.",
    "- **Natural Ventilation Pressure (NVP)** assisting or opposing the main fan with season.",
    "- A creeping number of **MSQs** asking which *set* of statements about damps (CH$_4$, CO, CO$_2$, after-damp) or about fan behaviour are simultaneously correct — partial credit is **not** awarded, so one wrong tick zeroes the mark.",
  ].join("\n"),

  /* ─── Section 2 — Master Formula Matrix & Derivations ───────────────── */
  formulaMatrix: [
    {
      name: "Atkinson Equation / Square Law",
      law: "For fully turbulent mine airflow the frictional pressure drop varies with the **square of the quantity**. Atkinson recasts this in terms of airway geometry and a friction factor.",
      equation:
        "$$P = R\\,Q^2,\\qquad R = \\dfrac{k\\,C\\,L}{A^3}$$",
      shortcut:
        "In the exam, collapse a whole branch to a single **resistance** $R = P/Q^2$ first, then never touch geometry again. For a circular airway $A=\\tfrac{\\pi d^2}{4}$ and $C=\\pi d$, so $R\\propto d^{-5}$ — a 10% larger diameter cuts resistance by ~40%.",
      variables: [
        { sym: "$P$", meaning: "Frictional pressure drop", unit: "$Pa$ (= $N/m^2$)" },
        { sym: "$R$", meaning: "Atkinson airway resistance", unit: "$N\\,s^2/m^8$" },
        { sym: "$Q$", meaning: "Air quantity (volume flow)", unit: "$m^3/s$" },
        { sym: "$k$", meaning: "Atkinson friction factor (at $1.2\\,kg/m^3$)", unit: "$kg/m^3$" },
        { sym: "$C$", meaning: "Airway perimeter", unit: "$m$" },
        { sym: "$L$", meaning: "Airway length", unit: "$m$" },
        { sym: "$A$", meaning: "Airway cross-sectional area", unit: "$m^2$" },
      ],
    },
    {
      name: "Resistances in Series & Parallel",
      law: "Mine networks reduce exactly like the square law demands: in **series** the quantity is common and pressures add; in **parallel** the pressure is common and quantities add.",
      equation:
        "$$R_{series}=\\sum_i R_i,\\qquad \\dfrac{1}{\\sqrt{R_{eq}}}=\\sum_i \\dfrac{1}{\\sqrt{R_i}}$$",
      shortcut:
        "Two equal resistances $R$ in parallel give $R_{eq}=R/4$ (because $\\frac{1}{\\sqrt{R_{eq}}}=\\frac{2}{\\sqrt R}$). This factor-of-4 is the fastest sanity check on any split.",
      variables: [
        { sym: "$R_{eq}$", meaning: "Equivalent resistance of the combination", unit: "$N\\,s^2/m^8$" },
        { sym: "$R_i$", meaning: "Resistance of the $i$-th branch", unit: "$N\\,s^2/m^8$" },
      ],
    },
    {
      name: "Equivalent Orifice (Murgue)",
      law: "A single notional sharp-edged orifice that would pass the mine's air for the same pressure — the classic measure of how 'hard' a mine is to ventilate.",
      equation:
        "$$A_{eq}=1.19\\,\\dfrac{Q}{\\sqrt{P}}$$",
      shortcut:
        "Classification: **large** $A_{eq}>2\\,m^2$ (easy mine), **medium** $1\\!-\\!2\\,m^2$, **small** $A_{eq}<1\\,m^2$ (tight, high-resistance mine).",
      variables: [
        { sym: "$A_{eq}$", meaning: "Equivalent orifice area", unit: "$m^2$" },
        { sym: "$Q$", meaning: "Total mine air quantity", unit: "$m^3/s$" },
        { sym: "$P$", meaning: "Mine pressure (total head)", unit: "$Pa$" },
      ],
    },
    {
      name: "Kirchhoff's Laws (Network Topology)",
      law: "Conservation of mass at every junction, and conservation of energy around every closed mesh — the basis of all iterative (Hardy-Cross) network balancing.",
      equation:
        "$$\\sum_{junction} Q = 0,\\qquad \\sum_{mesh} R\\,Q\\,|Q| = 0$$",
      shortcut:
        "Hardy-Cross correction per loop: $\\Delta Q=-\\dfrac{\\sum R\\,Q|Q|}{2\\sum R|Q|}$. Iterate until $\\Delta Q\\to 0$; the $|Q|$ keeps the sign of flow direction honest.",
      variables: [
        { sym: "$Q$", meaning: "Branch quantity (signed by flow direction)", unit: "$m^3/s$" },
        { sym: "$R$", meaning: "Branch resistance", unit: "$N\\,s^2/m^8$" },
        { sym: "$\\Delta Q$", meaning: "Loop flow correction per iteration", unit: "$m^3/s$" },
      ],
    },
    {
      name: "Fan Laws (Affinity Laws)",
      law: "For a geometrically similar fan, quantity, pressure and power scale with definite powers of rotational speed, impeller diameter and air density.",
      equation:
        "$$Q\\propto N\\,D^3,\\qquad P\\propto N^2 D^2\\,\\rho,\\qquad \\dot W\\propto N^3 D^5\\,\\rho$$",
      shortcut:
        "At **fixed diameter and density** these collapse to $\\dfrac{Q_2}{Q_1}=\\dfrac{N_2}{N_1}$, $\\dfrac{P_2}{P_1}=\\left(\\dfrac{N_2}{N_1}\\right)^2$, $\\dfrac{\\dot W_2}{\\dot W_1}=\\left(\\dfrac{N_2}{N_1}\\right)^3$. Quantity is **independent of density**; pressure and power are **directly proportional** to it.",
      variables: [
        { sym: "$N$", meaning: "Rotational speed (use a consistent unit on both sides)", unit: "$rev/s$ or $rev/min$" },
        { sym: "$D$", meaning: "Impeller diameter", unit: "$m$" },
        { sym: "$\\rho$", meaning: "Air density", unit: "$kg/m^3$" },
        { sym: "$\\dot W$", meaning: "Fan (air/shaft) power", unit: "$W$" },
      ],
    },
    {
      name: "Air Power & Fan Efficiency",
      law: "The useful power delivered to the air is the product of pressure and quantity; efficiency relates it to the shaft/motor input.",
      equation:
        "$$\\dot W_{air}=P\\,Q,\\qquad \\eta=\\dfrac{\\dot W_{air}}{\\dot W_{input}}$$",
      shortcut:
        "With $P$ in $Pa$ and $Q$ in $m^3/s$, $\\dot W_{air}$ comes out directly in **watts** — divide by $1000$ for kW. Motor power $=PQ/\\eta$.",
      variables: [
        { sym: "$\\dot W_{air}$", meaning: "Air (useful) power", unit: "$W$" },
        { sym: "$P$", meaning: "Fan total pressure", unit: "$Pa$" },
        { sym: "$Q$", meaning: "Air quantity", unit: "$m^3/s$" },
        { sym: "$\\eta$", meaning: "Fan efficiency (fraction, not %)", unit: "dimensionless" },
      ],
    },
    {
      name: "Natural Ventilation Pressure (NVP)",
      law: "A density difference between the downcast and upcast columns sets up a buoyancy-driven head that assists or opposes the main fan.",
      equation:
        "$$NVP=(\\rho_{dc}-\\rho_{uc})\\,g\\,H$$",
      shortcut:
        "In winter the colder, denser downcast usually **aids** the fan; in summer it can **oppose** it. NVP simply **adds to or subtracts from** the fan pressure in the square law: $P_{total}=P_{fan}\\pm NVP$.",
      variables: [
        { sym: "$NVP$", meaning: "Natural ventilation pressure", unit: "$Pa$" },
        { sym: "$\\rho_{dc},\\,\\rho_{uc}$", meaning: "Mean downcast / upcast air density", unit: "$kg/m^3$" },
        { sym: "$g$", meaning: "Gravitational acceleration ($9.81$)", unit: "$m/s^2$" },
        { sym: "$H$", meaning: "Vertical height of the air columns (shaft depth)", unit: "$m$" },
      ],
    },
  ],

  /* ─── Section 3 — The "IIT Trap" Warning System ─────────────────────── */
  traps: [
    "**Pressure unit swaps.** $1\\,kPa = 1000\\,Pa$ and, crucially, $1\\,mm$ water gauge $=9.81\\,Pa$. A pressure quoted in $mm\\,w.g.$ that you feed into $P=RQ^2$ as if it were $Pa$ is the single most common wrong-answer the setters bank on.",
    "**Square-law non-linearity.** Doubling the quantity **quadruples** the pressure ($P\\propto Q^2$) and **multiplies power by eight** ($\\dot W=PQ\\propto Q^3$). The linear distractor (\"pressure also doubles\") is always offered.",
    "**Parallel resistance is NOT electrical.** Use $\\frac{1}{\\sqrt{R_{eq}}}=\\sum\\frac{1}{\\sqrt{R_i}}$, never $\\frac{1}{R_{eq}}=\\sum\\frac{1}{R_i}$. The electrical-style answer is a deliberately seeded option.",
    "**Fan-law power exponent.** Power scales with the **cube** of speed ($N^3$), not the square. Under a diameter change as well it is $N^3 D^5$ — dropping the $D^5$ (or using $D^3$) is the classic NAT out-of-range trap.",
    "**Density is selective.** Air **quantity** delivered by a fan is **independent of density**; **pressure and power are directly proportional** to it. Forgetting to scale pressure/power by $\\rho_2/\\rho_1$ after an altitude or temperature change loses the mark.",
    "**Radius vs diameter.** For a circular airway $R\\propto d^{-5}$. Slipping radius in for diameter (or vice-versa) in $A=\\tfrac{\\pi d^2}{4}$ multiplies the resistance error by $2^5=32$.",
    "**Speed-unit consistency.** $N$ may be given in $rev/min$ in one state and $rev/s$ in another; only the **ratio** matters in the fan laws, so convert both to the *same* unit before forming $N_2/N_1$.",
    "**Operating-point boundary (stall).** The duty point is the intersection of the fan characteristic with the mine (system) curve, and it must lie on the **stable descending limb**. A point on the rising/hump (left) side is in the **stall zone** — unstable, and a valid MCQ trap.",
    "**Efficiency as fraction.** $\\eta$ in $\\dot W_{input}=PQ/\\eta$ is a **fraction** (0–1). Plugging $82$ instead of $0.82$ inflates the answer 100×.",
  ],

  /* ─── Section 4 — High-Fidelity Core Examples ───────────────────────── */
  examples: [
    {
      prompt:
        "Two airways connect the same two junctions in **parallel**. Their resistances are $R_1=0.40\\,N\\,s^2/m^8$ and $R_2=0.90\\,N\\,s^2/m^8$. A total quantity of $60\\,m^3/s$ must pass between the junctions. Determine the pressure drop across the parallel pair and how the air splits between the two airways.",
      given: [
        { label: "Resistance, airway 1 ($R_1$)", value: "$0.40\\,N\\,s^2/m^8$" },
        { label: "Resistance, airway 2 ($R_2$)", value: "$0.90\\,N\\,s^2/m^8$" },
        { label: "Total quantity ($Q$)", value: "$60\\,m^3/s$" },
      ],
      derivation: [
        "**Step 1 — Equivalent parallel resistance** (square-law rule):",
        "$$\\dfrac{1}{\\sqrt{R_{eq}}}=\\dfrac{1}{\\sqrt{R_1}}+\\dfrac{1}{\\sqrt{R_2}}=\\dfrac{1}{\\sqrt{0.40}}+\\dfrac{1}{\\sqrt{0.90}}=1.5811+1.0541=2.6352$$",
        "$$\\sqrt{R_{eq}}=\\dfrac{1}{2.6352}=0.37947\\ \\Rightarrow\\ R_{eq}=0.1440\\,N\\,s^2/m^8$$",
        "**Step 2 — Pressure drop** (common across both branches):",
        "$$P=R_{eq}\\,Q^2=0.1440\\times(60)^2=0.1440\\times3600=518.4\\,Pa$$",
        "**Step 3 — Split each branch** at this common pressure, $Q_i=\\sqrt{P/R_i}$:",
        "$$Q_1=\\sqrt{\\dfrac{518.4}{0.40}}=\\sqrt{1296}=36.0\\,m^3/s$$",
        "$$Q_2=\\sqrt{\\dfrac{518.4}{0.90}}=\\sqrt{576}=24.0\\,m^3/s$$",
        "**Step 4 — Continuity check:** $Q_1+Q_2=36.0+24.0=60.0\\,m^3/s$ ✓",
      ].join("\n"),
      target:
        "Pressure drop $P\\approx\\mathbf{518\\,Pa}$ (accept $\\mathbf{515\\!-\\!522\\,Pa}$). Split: $Q_1\\approx\\mathbf{36.0\\,m^3/s}$, $Q_2\\approx\\mathbf{24.0\\,m^3/s}$ (accept $\\pm0.3$). The lower-resistance airway carries the larger share, as expected.",
    },
    {
      prompt:
        "A main fan delivers $Q_1=50\\,m^3/s$ at a pressure of $1.8\\,kPa$ while drawing $110\\,kW$, running at $N_1=600\\,rev/min$. The impeller diameter and air density are unchanged. If the speed is raised to $N_2=720\\,rev/min$, find the new quantity, pressure and power.",
      given: [
        { label: "Initial quantity ($Q_1$)", value: "$50\\,m^3/s$" },
        { label: "Initial pressure ($P_1$)", value: "$1.8\\,kPa = 1800\\,Pa$" },
        { label: "Initial power ($\\dot W_1$)", value: "$110\\,kW$" },
        { label: "Speed change", value: "$600 \\to 720\\,rev/min$" },
      ],
      derivation: [
        "**Step 1 — Speed ratio** (same unit both sides, so no conversion needed):",
        "$$\\dfrac{N_2}{N_1}=\\dfrac{720}{600}=1.20$$",
        "**Step 2 — Quantity** scales linearly with speed:",
        "$$Q_2=Q_1\\left(\\dfrac{N_2}{N_1}\\right)=50\\times1.20=60.0\\,m^3/s$$",
        "**Step 3 — Pressure** scales with the square of speed:",
        "$$P_2=P_1\\left(\\dfrac{N_2}{N_1}\\right)^2=1.8\\times(1.20)^2=1.8\\times1.44=2.592\\,kPa$$",
        "**Step 4 — Power** scales with the cube of speed:",
        "$$\\dot W_2=\\dot W_1\\left(\\dfrac{N_2}{N_1}\\right)^3=110\\times(1.20)^3=110\\times1.728=190.08\\,kW$$",
      ].join("\n"),
      target:
        "$Q_2=\\mathbf{60.0\\,m^3/s}$; $P_2\\approx\\mathbf{2.59\\,kPa}$ ($2592\\,Pa$, accept $2.58\\!-\\!2.60\\,kPa$); $\\dot W_2\\approx\\mathbf{190\\,kW}$ (accept $189\\!-\\!191\\,kW$). Note the **cubic** power growth — a 20% speed rise costs ~73% more power.",
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  Geomechanics & Ground Control                                         */
/*  Rock Mass Classification (RQD · RMR · Q) · Mohr–Coulomb · Pillar SF   */
/* ════════════════════════════════════════════════════════════════════ */

const geomechanics: StudyNote = {
  slug: "geomechanics-ground-control",
  subject: "Rock Mechanics",
  title: "Geomechanics & Ground Control",
  tier: "premium",
  updated: "Jun 2026",
  blurb:
    "Rock-mass classification (RQD, RMR, Q-system), the Mohr–Coulomb failure envelope, in-situ stress and pillar safety factors — the analytical core of every ground-control question.",

  /* ─── Section 1 — Recent Trend Analysis (2017–2026) ─────────────────── */
  trend: [
    "Geomechanics is the **single largest scoring block** in GATE MN, reliably worth **6–10 marks** and spanning both 1-mark concept checks and the hardest 2-mark NATs on the paper.",
    "",
    "**The decade-long shift in question style:**",
    "- **2017–2019** — definition-heavy recall: state the **RQD** thresholds, the five **RMR** parameters, or the six **Q-system** factors. Pure-memory MCQs dominated.",
    "- **2020–2022** — a move to **single-formula computation**: compute RQD from a core run, convert **$Q\\leftrightarrow RMR$**, or solve a one-step **tributary-area pillar stress**.",
    "- **2023–2026** — full **multi-variable NAT** territory: complete **pillar safety-factor** chains (in-situ stress → tributary pillar stress → empirical pillar strength → SF), **Mohr–Coulomb** principal-stress failure with the $N_\\phi$ form, and **stress concentrations around circular openings** (Kirsch boundary stresses).",
    "",
    "**Exact recurring themes you must own:**",
    "- **Pillar Safety Factor** by the tributary-area method — the examiners' favourite 2-mark chain, with the $(W+B)^2/W^2$ square-pillar trap.",
    "- **Mohr–Coulomb in principal-stress form** $\\sigma_1=\\sigma_3 N_\\phi + 2c\\sqrt{N_\\phi}$, $N_\\phi=\\tan^2(45^\\circ+\\phi/2)$.",
    "- **RQD from volumetric joint count** $J_v$, and the **$RMR\\approx 9\\ln Q+44$** bridge.",
    "- **Kirsch boundary stresses** — roof/floor vs sidewall stress concentration in a biaxial field.",
    "- A rising count of **MSQs** asking which support/classification statements are simultaneously valid — one wrong tick zeroes the mark (no partial credit).",
  ].join("\n"),

  /* ─── Section 2 — Master Formula Matrix & Derivations ───────────────── */
  formulaMatrix: [
    {
      name: "Rock Quality Designation (RQD)",
      law: "RQD is the percentage of a core run made up of **sound pieces $\\geq 10\\,cm$** long, measured along the core axis — a direct index of fracturing.",
      equation:
        "$$RQD=\\dfrac{\\sum (\\text{core pieces}\\,\\geq 10\\,cm)}{\\text{total core run length}}\\times 100\\,\\%$$",
      shortcut:
        "Without core, estimate from the **volumetric joint count** $J_v$: $RQD=115-3.3\\,J_v$ (valid $4.5\\leq J_v\\leq 30$; take $RQD=100$ if $J_v<4.5$ and $RQD=0$ if $J_v>35$).",
      variables: [
        { sym: "$RQD$", meaning: "Rock Quality Designation", unit: "$\\%$ (0–100)" },
        { sym: "$J_v$", meaning: "Volumetric joint count (joints per $m^3$)", unit: "$joints/m^3$" },
      ],
    },
    {
      name: "Bieniawski RMR (1989)",
      law: "The Rock Mass Rating sums five primary parameter ratings and applies a joint-orientation **adjustment** to grade the mass (Class I–V).",
      equation:
        "$$RMR=R_{UCS}+R_{RQD}+R_{spacing}+R_{condition}+R_{water}+R_{orient}$$",
      shortcut:
        "Classes: $RMR\\,81\\!-\\!100$ = I (very good) … $<21$ = V (very poor). The orientation adjustment $R_{orient}$ is always $\\leq 0$ (it only penalises).",
      variables: [
        { sym: "$RMR$", meaning: "Total rock mass rating", unit: "dimensionless (0–100)" },
        { sym: "$R_{UCS}$", meaning: "Rating for intact strength (0–15)", unit: "dimensionless" },
        { sym: "$R_{RQD}$", meaning: "Rating for RQD (3–20)", unit: "dimensionless" },
        { sym: "$R_{orient}$", meaning: "Joint-orientation adjustment ($\\leq 0$)", unit: "dimensionless" },
      ],
    },
    {
      name: "Barton Q-system",
      law: "The NGI tunnelling quality $Q$ multiplies three ratios: block size, inter-block shear strength, and active stress.",
      equation:
        "$$Q=\\dfrac{RQD}{J_n}\\times\\dfrac{J_r}{J_a}\\times\\dfrac{J_w}{SRF}$$",
      shortcut:
        "Bridge to RMR with $RMR\\approx 9\\ln Q+44$. $Q$ spans $0.001$ (exceptionally poor) to $1000$ (exceptionally good) on a log scale.",
      variables: [
        { sym: "$RQD$", meaning: "Rock Quality Designation", unit: "$\\%$" },
        { sym: "$J_n$", meaning: "Joint set number", unit: "dimensionless" },
        { sym: "$J_r,\\,J_a$", meaning: "Joint roughness / alteration number", unit: "dimensionless" },
        { sym: "$J_w$", meaning: "Joint water reduction factor", unit: "dimensionless" },
        { sym: "$SRF$", meaning: "Stress Reduction Factor", unit: "dimensionless" },
      ],
    },
    {
      name: "Mohr–Coulomb Failure Criterion",
      law: "Shear failure occurs when shear stress on a plane reaches cohesion plus frictional resistance; recast in principal stresses for the failure envelope.",
      equation:
        "$$\\tau=c+\\sigma_n\\tan\\phi\\quad\\Rightarrow\\quad \\sigma_1=\\sigma_3\\,N_\\phi+2c\\sqrt{N_\\phi},\\;\\; N_\\phi=\\tan^2\\!\\left(45^\\circ+\\tfrac{\\phi}{2}\\right)$$",
      shortcut:
        "Unconfined ($\\sigma_3=0$) strength is $\\sigma_c=2c\\sqrt{N_\\phi}$. The failure plane makes an angle $(45^\\circ+\\phi/2)$ with the **minor** principal stress direction.",
      variables: [
        { sym: "$\\tau$", meaning: "Shear stress at failure", unit: "$Pa$ (or $MPa$)" },
        { sym: "$c$", meaning: "Cohesion", unit: "$Pa$ (or $MPa$)" },
        { sym: "$\\sigma_n$", meaning: "Normal stress on the plane", unit: "$Pa$" },
        { sym: "$\\phi$", meaning: "Angle of internal friction", unit: "degrees (or $rad$)" },
        { sym: "$\\sigma_1,\\,\\sigma_3$", meaning: "Major / minor principal stress", unit: "$Pa$" },
        { sym: "$N_\\phi$", meaning: "Flow factor $\\tan^2(45^\\circ+\\phi/2)$", unit: "dimensionless" },
      ],
    },
    {
      name: "In-situ Stress Field",
      law: "Vertical stress is the weight of overburden; horizontal stress follows from lateral confinement (gravitational case) or tectonics.",
      equation:
        "$$\\sigma_v=\\gamma H=\\rho g H,\\qquad \\sigma_h=K\\,\\sigma_v,\\quad K=\\dfrac{\\nu}{1-\\nu}$$",
      shortcut:
        "Rule of thumb: $\\sigma_v\\approx 0.025\\,H$ in $MPa$ for $H$ in metres ($\\gamma\\approx 25\\,kN/m^3$). $K$ can exceed 1 where tectonic stresses dominate.",
      variables: [
        { sym: "$\\sigma_v$", meaning: "Vertical (overburden) stress", unit: "$Pa$ (or $MPa$)" },
        { sym: "$\\gamma$", meaning: "Unit weight of rock ($=\\rho g$)", unit: "$N/m^3$ (or $kN/m^3$)" },
        { sym: "$H$", meaning: "Depth below surface", unit: "$m$" },
        { sym: "$K$", meaning: "Horizontal-to-vertical stress ratio", unit: "dimensionless" },
        { sym: "$\\nu$", meaning: "Poisson's ratio", unit: "dimensionless" },
      ],
    },
    {
      name: "Pillar Stress & Strength (Tributary Area)",
      law: "Each pillar carries the overburden of its tributary area; empirical strength formulas relate that to the pillar's width-to-height shape.",
      equation:
        "$$\\sigma_p=\\sigma_v\\,\\dfrac{(W+B)^2}{W^2},\\qquad S_p=S_1\\!\\left(0.778+0.222\\,\\dfrac{W}{H_p}\\right)$$",
      shortcut:
        "For long **rib** pillars use the un-squared form $\\sigma_p=\\sigma_v\\,\\frac{W+B}{W}$. Extraction ratio $e=1-\\frac{W^2}{(W+B)^2}$, so $\\sigma_p=\\frac{\\sigma_v}{1-e}$.",
      variables: [
        { sym: "$\\sigma_p$", meaning: "Average pillar stress", unit: "$MPa$" },
        { sym: "$\\sigma_v$", meaning: "Vertical in-situ stress $\\gamma H$", unit: "$MPa$" },
        { sym: "$W$", meaning: "Pillar width", unit: "$m$" },
        { sym: "$B$", meaning: "Bord (opening) width", unit: "$m$" },
        { sym: "$H_p$", meaning: "Pillar height", unit: "$m$" },
        { sym: "$S_p$", meaning: "Pillar strength", unit: "$MPa$" },
        { sym: "$S_1$", meaning: "Strength of a unit cube of pillar rock", unit: "$MPa$" },
      ],
    },
    {
      name: "Factor of Safety & Kirsch Boundary Stress",
      law: "Stability is the ratio of strength to demand; around a circular opening in a biaxial field the boundary tangential stress concentrates at roof and ribs.",
      equation:
        "$$F.S.=\\dfrac{S_p}{\\sigma_p};\\qquad \\sigma_{\\theta,\\,roof}=3\\sigma_h-\\sigma_v,\\quad \\sigma_{\\theta,\\,rib}=3\\sigma_v-\\sigma_h$$",
      shortcut:
        "Target $F.S.\\geq 1.5\\!-\\!2.0$ for long-term pillars. For a **hydrostatic** field ($\\sigma_h=\\sigma_v=P_0$) the boundary stress is a uniform $2P_0$ everywhere.",
      variables: [
        { sym: "$F.S.$", meaning: "Factor of safety (strength ÷ stress)", unit: "dimensionless" },
        { sym: "$\\sigma_\\theta$", meaning: "Tangential (hoop) boundary stress", unit: "$MPa$" },
        { sym: "$\\sigma_v,\\,\\sigma_h$", meaning: "Vertical / horizontal field stress", unit: "$MPa$" },
      ],
    },
  ],

  /* ─── Section 3 — The "IIT Trap" Warning System ─────────────────────── */
  traps: [
    "**RQD counts only sound pieces $\\geq 10\\,cm$** measured along the core **centre-line**. Drilling-induced fresh breaks must be mentally re-joined before measuring — counting them as natural fractures deflates RQD and is a seeded distractor.",
    "**$N_\\phi$ uses $(45^\\circ+\\phi/2)$ in degrees.** Feeding $\\phi$ straight into $\\tan^2\\phi$, or mixing radians and degrees, is the commonest Mohr–Coulomb error. Also note the failure plane angle is measured from the **minor** ($\\sigma_3$) stress.",
    "**Square pillar uses $(W+B)^2/W^2$, NOT $(W+B)/W$.** The un-squared (rib-pillar) form is always offered as a wrong option for a square-pillar problem — and vice-versa.",
    "**Unit weight vs density.** $\\gamma=\\rho g$. With $\\gamma$ in $kN/m^3$ and $H$ in $m$, $\\sigma_v$ comes out in $kPa$ — convert to $MPa$ (÷1000) before forming the safety factor. Using $\\rho$ (in $kg/m^3$) as if it were $\\gamma$ understates stress ~10×.",
    "**Width-to-height, not height-to-width.** The strength formula uses $W/H_p$. Inverting the ratio (using $H_p/W$) collapses the pillar strength and the answer.",
    "**$K$ ratio direction.** $\\sigma_h=K\\sigma_v$ with $K=\\nu/(1-\\nu)$ for the gravitational case; $K$ can exceed 1 under tectonic stress, so a horizontal stress larger than vertical is **not** automatically wrong.",
    "**RMR orientation adjustment is negative.** $R_{orient}$ only ever subtracts (favourable = 0, unfavourable < 0). Adding it as a positive number over-rates the mass.",
    "**Kirsch sign at the boundary.** At the roof the tangential stress is $3\\sigma_h-\\sigma_v$ — if $\\sigma_v>3\\sigma_h$ this is **tensile** (negative), the classic roof-failure trigger that an MCQ will probe.",
    "**Factor of safety threshold.** $F.S.<1$ means failure; a value just above 1 is **not** 'safe' for a long-life pillar (need $\\geq 1.5\\!-\\!2.0$). Watch MSQs that call $F.S.=1.1$ 'adequately stable'.",
  ],

  /* ─── Section 4 — High-Fidelity Core Examples ───────────────────────── */
  examples: [
    {
      prompt:
        "A bord-and-pillar panel lies at a depth of $H=200\\,m$ in rock of unit weight $\\gamma=25\\,kN/m^3$. Square pillars are $W=12\\,m$ wide with bords $B=6\\,m$ wide; pillar height is $H_p=3\\,m$. The strength of a unit cube of the pillar rock is $S_1=30\\,MPa$ (Obert–Duvall form). Determine the factor of safety of the pillars.",
      given: [
        { label: "Depth ($H$)", value: "$200\\,m$" },
        { label: "Unit weight ($\\gamma$)", value: "$25\\,kN/m^3$" },
        { label: "Pillar width ($W$)", value: "$12\\,m$" },
        { label: "Bord width ($B$)", value: "$6\\,m$" },
        { label: "Pillar height ($H_p$)", value: "$3\\,m$" },
        { label: "Unit-cube strength ($S_1$)", value: "$30\\,MPa$" },
      ],
      derivation: [
        "**Step 1 — Vertical in-situ stress:**",
        "$$\\sigma_v=\\gamma H=25\\times 200=5000\\,kPa=5.0\\,MPa$$",
        "**Step 2 — Tributary-area pillar stress** (square pillars):",
        "$$\\sigma_p=\\sigma_v\\,\\dfrac{(W+B)^2}{W^2}=5.0\\times\\dfrac{(12+6)^2}{12^2}=5.0\\times\\dfrac{324}{144}=5.0\\times 2.25=11.25\\,MPa$$",
        "**Step 3 — Pillar strength** (Obert–Duvall), with $W/H_p=12/3=4$:",
        "$$S_p=S_1\\!\\left(0.778+0.222\\,\\dfrac{W}{H_p}\\right)=30\\,(0.778+0.222\\times 4)=30\\times 1.666=49.98\\,MPa$$",
        "**Step 4 — Factor of safety:**",
        "$$F.S.=\\dfrac{S_p}{\\sigma_p}=\\dfrac{49.98}{11.25}=4.44$$",
      ].join("\n"),
      target:
        "Factor of safety $F.S.\\approx\\mathbf{4.44}$ (accept $\\mathbf{4.3\\!-\\!4.5}$). Well above the $1.5\\!-\\!2.0$ long-term threshold, so the pillars are stable.",
    },
    {
      prompt:
        "A triaxial test on a rock gives cohesion $c=8\\,MPa$ and an angle of internal friction $\\phi=30^\\circ$. Using the Mohr–Coulomb criterion, find the major principal stress $\\sigma_1$ at failure for a confining pressure $\\sigma_3=5\\,MPa$.",
      given: [
        { label: "Cohesion ($c$)", value: "$8\\,MPa$" },
        { label: "Friction angle ($\\phi$)", value: "$30^\\circ$" },
        { label: "Confining stress ($\\sigma_3$)", value: "$5\\,MPa$" },
      ],
      derivation: [
        "**Step 1 — Flow factor:**",
        "$$N_\\phi=\\tan^2\\!\\left(45^\\circ+\\dfrac{\\phi}{2}\\right)=\\tan^2(45^\\circ+15^\\circ)=\\tan^2 60^\\circ=(\\sqrt3)^2=3$$",
        "**Step 2 — Mohr–Coulomb principal-stress form:**",
        "$$\\sigma_1=\\sigma_3\\,N_\\phi+2c\\sqrt{N_\\phi}=5\\times 3+2\\times 8\\times\\sqrt3$$",
        "**Step 3 — Evaluate** ($\\sqrt3=1.7320$):",
        "$$\\sigma_1=15+16\\times 1.7320=15+27.71=42.71\\,MPa$$",
      ].join("\n"),
      target:
        "Major principal stress at failure $\\sigma_1\\approx\\mathbf{42.7\\,MPa}$ (accept $\\mathbf{42.5\\!-\\!43.0\\,MPa}$). The unconfined strength would be $\\sigma_c=2c\\sqrt{N_\\phi}=27.7\\,MPa$.",
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  Drilling & Blasting                                                   */
/*  Bench Geometry · Powder Factor · Charge per Hole · Detonation         */
/* ════════════════════════════════════════════════════════════════════ */

const drillingBlasting: StudyNote = {
  slug: "drilling-blasting",
  subject: "Drilling & Blasting",
  title: "Drilling & Blasting",
  tier: "subject",
  updated: "Jun 2026",
  blurb:
    "Bench-blast geometry (burden, spacing, subgrade, stemming), powder factor, linear charge concentration and detonation pressure — the most arithmetic-heavy cluster in the paper.",

  /* ─── Section 1 — Recent Trend Analysis (2017–2026) ─────────────────── */
  trend: [
    "Drilling & Blasting reliably carries **4–6 marks** and is the section where a clean **unit discipline** wins or loses the most marks per minute.",
    "",
    "**The decade-long shift in question style:**",
    "- **2017–2019** — property recall: rank explosives by **VOD**, define **powder factor**, state the role of **stemming** and **subgrade drilling**. Mostly 1-mark MCQs.",
    "- **2020–2022** — single-step computation: a **powder factor** from a given charge and volume, or a **detonation pressure** from density and VOD.",
    "- **2023–2026** — full **multi-variable NAT chains**: hole length → charge length → **linear charge concentration** → charge per hole → **powder factor**, and complete **bench-geometry** design with subgrade and stemming proportioned to the burden.",
    "",
    "**Exact recurring themes you must own:**",
    "- **Charge per hole** via the linear concentration $l=\\tfrac{\\pi}{4}d^2\\rho_e$ over the charged length.",
    "- **Powder factor** in both $kg/m^3$ and $kg/tonne$ (the density conversion trap).",
    "- **Detonation pressure** $P_d=\\rho_e\\,V_{OD}^2/4$ and the borehole-pressure ≈ half rule.",
    "- **Bench proportions**: $S=1.0\\!-\\!1.4\\,B$, subgrade $J\\approx 0.3B$, stemming $T\\approx 0.7B$.",
    "- A rising count of **MSQs** on which blast-design / explosive-selection statements are simultaneously valid — one wrong tick zeroes the mark.",
  ].join("\n"),

  /* ─── Section 2 — Master Formula Matrix & Derivations ───────────────── */
  formulaMatrix: [
    {
      name: "Powder Factor (Specific Charge)",
      law: "The mass of explosive consumed per unit volume (or mass) of rock broken — the headline efficiency metric of any blast.",
      equation:
        "$$q=\\dfrac{W_{exp}}{V_{rock}}\\quad(kg/m^3),\\qquad q_t=\\dfrac{W_{exp}}{\\rho_r\\,V_{rock}}\\quad(kg/tonne)$$",
      shortcut:
        "Convert between the two with the rock density: $q_t=q/\\rho_r$ (with $\\rho_r$ in $t/m^3$). Typical surface bench blasting: $q\\approx 0.3\\!-\\!0.8\\,kg/m^3$.",
      variables: [
        { sym: "$q$", meaning: "Powder factor (volumetric)", unit: "$kg/m^3$" },
        { sym: "$q_t$", meaning: "Powder factor (gravimetric)", unit: "$kg/tonne$" },
        { sym: "$W_{exp}$", meaning: "Explosive mass per blast (or per hole)", unit: "$kg$" },
        { sym: "$V_{rock}$", meaning: "Rock volume broken", unit: "$m^3$" },
        { sym: "$\\rho_r$", meaning: "Rock density", unit: "$t/m^3$ (or $kg/m^3$)" },
      ],
    },
    {
      name: "Bench Geometry (Burden, Spacing, Subgrade, Stemming)",
      law: "Sound blast design proportions every length to the **burden** — the distance from the charge to the nearest free face.",
      equation:
        "$$B=k_b\\,d,\\quad S=k_s\\,B,\\quad J=0.3\\,B,\\quad T=0.7\\,B,\\quad L=H+J$$",
      shortcut:
        "Practical ranges: $k_b\\approx 25\\!-\\!40$ (hole diameters), $k_s\\approx 1.0\\!-\\!1.4$. **Burden** $B$ is perpendicular to the face; **spacing** $S$ is along the row — never swap them in $V=B\\,S\\,H$.",
      variables: [
        { sym: "$B$", meaning: "Burden (charge-to-free-face distance)", unit: "$m$" },
        { sym: "$S$", meaning: "Spacing between holes in a row", unit: "$m$" },
        { sym: "$d$", meaning: "Blasthole diameter", unit: "$m$ (convert from $mm$)" },
        { sym: "$J$", meaning: "Subgrade (subdrill) depth", unit: "$m$" },
        { sym: "$T$", meaning: "Stemming length", unit: "$m$" },
        { sym: "$H$", meaning: "Bench height", unit: "$m$" },
        { sym: "$L$", meaning: "Total hole length ($H+J$)", unit: "$m$" },
      ],
    },
    {
      name: "Linear Charge Concentration & Charge per Hole",
      law: "A column charge filling the hole bore carries a fixed mass per metre; the hole charge is that concentration over the **charged** length only.",
      equation:
        "$$l=\\dfrac{\\pi}{4}\\,d^2\\,\\rho_e,\\qquad W_h=l\\,(L-T)$$",
      shortcut:
        "Charged length $=L-T$ (the stemming carries no explosive). Keep $d$ in metres and $\\rho_e$ in $kg/m^3$ so $l$ is in $kg/m$ directly.",
      variables: [
        { sym: "$l$", meaning: "Linear charge concentration", unit: "$kg/m$" },
        { sym: "$d$", meaning: "Blasthole diameter", unit: "$m$" },
        { sym: "$\\rho_e$", meaning: "Explosive density", unit: "$kg/m^3$" },
        { sym: "$W_h$", meaning: "Charge per hole", unit: "$kg$" },
        { sym: "$(L-T)$", meaning: "Charged (column) length", unit: "$m$" },
      ],
    },
    {
      name: "Volume / Tonnage Broken & Number of Holes",
      law: "Each production hole breaks the rock prism defined by its burden, spacing and the bench height (not the hole length).",
      equation:
        "$$V_h=B\\,S\\,H,\\qquad N=\\dfrac{V_{total}}{B\\,S\\,H},\\qquad q=\\dfrac{W_h}{B\\,S\\,H}$$",
      shortcut:
        "Use **bench height $H$**, not hole length $L$, for the broken volume — the subgrade only ensures a clean floor, it does not add to the prism.",
      variables: [
        { sym: "$V_h$", meaning: "Rock volume broken per hole", unit: "$m^3$" },
        { sym: "$N$", meaning: "Number of holes for the round", unit: "count" },
        { sym: "$q$", meaning: "Powder factor", unit: "$kg/m^3$" },
      ],
    },
    {
      name: "Detonation & Borehole Pressure",
      law: "The detonation pressure at the reaction front scales with explosive density and the square of the detonation velocity.",
      equation:
        "$$P_d=\\dfrac{\\rho_e\\,V_{OD}^2}{4},\\qquad P_b\\approx\\dfrac{1}{2}P_d$$",
      shortcut:
        "With $\\rho_e$ in $kg/m^3$ and $V_{OD}$ in $m/s$, $P_d$ comes out in $Pa$ — divide by $10^9$ for GPa. The coupled **borehole pressure** $P_b$ is roughly half the detonation pressure.",
      variables: [
        { sym: "$P_d$", meaning: "Detonation pressure", unit: "$Pa$ (≈ GPa range)" },
        { sym: "$P_b$", meaning: "Borehole (blasthole) pressure", unit: "$Pa$" },
        { sym: "$\\rho_e$", meaning: "Explosive density", unit: "$kg/m^3$" },
        { sym: "$V_{OD}$", meaning: "Velocity of detonation", unit: "$m/s$" },
      ],
    },
  ],

  /* ─── Section 3 — The "IIT Trap" Warning System ─────────────────────── */
  traps: [
    "**Burden ↔ spacing swap.** $B$ (perpendicular to the face) and $S$ (along the row) are distinct; both appear in $V=B\\,S\\,H$, so swapping them changes the geometry ratio and the powder factor. The setters offer the swapped-value distractor every time.",
    "**Diameter unit ($mm$ vs $m$).** Hole diameter is quoted in $mm$ but the charge concentration needs $d$ in **metres**. A $100\\,mm$ hole is $0.1\\,m$; forgetting the conversion scales $l$ by $10^6$.",
    "**Detonation-pressure constant.** $P_d=\\rho_e V_{OD}^2/4$. The **borehole** pressure uses roughly $/8$ (half of $P_d$) — picking the wrong divisor (4 vs 8) is the classic NAT trap.",
    "**Powder factor units.** $kg/m^3$ and $kg/tonne$ differ by the rock density $\\rho_r$. Reporting $kg/m^3$ when the question asks $kg/tonne$ (or vice-versa) is a seeded wrong option.",
    "**Subgrade does NOT add to broken volume.** The prism uses bench height $H$; only the **hole length** $L=H+J$ uses the subgrade. Using $L$ in $V=B\\,S\\,L$ over-estimates tonnage.",
    "**Stemming carries no charge.** Charged length is $L-T$, not $L$. Charging the full hole length inflates $W_h$ and the powder factor.",
    "**Radius vs diameter in $\\tfrac{\\pi}{4}d^2$.** The bore area uses **diameter**; slipping in the radius understates the charge concentration four-fold.",
    "**VOD is squared.** Detonation pressure $\\propto V_{OD}^2$ — doubling VOD **quadruples** $P_d$. The linear distractor ('pressure also doubles') is always present.",
  ],

  /* ─── Section 4 — High-Fidelity Core Examples ───────────────────────── */
  examples: [
    {
      prompt:
        "A surface bench is blasted with vertical holes of diameter $d=100\\,mm$. Bench height $H=10\\,m$, burden $B=3\\,m$, spacing $S=3.5\\,m$, subgrade drilling $J=0.9\\,m$ and stemming $T=2.5\\,m$. The explosive (column charge) has density $\\rho_e=1200\\,kg/m^3$. Determine the charge per hole and the powder factor in $kg/m^3$.",
      given: [
        { label: "Hole diameter ($d$)", value: "$100\\,mm = 0.10\\,m$" },
        { label: "Bench height ($H$)", value: "$10\\,m$" },
        { label: "Burden ($B$)", value: "$3\\,m$" },
        { label: "Spacing ($S$)", value: "$3.5\\,m$" },
        { label: "Subgrade ($J$)", value: "$0.9\\,m$" },
        { label: "Stemming ($T$)", value: "$2.5\\,m$" },
        { label: "Explosive density ($\\rho_e$)", value: "$1200\\,kg/m^3$" },
      ],
      derivation: [
        "**Step 1 — Hole length and charged length:**",
        "$$L=H+J=10+0.9=10.9\\,m,\\qquad L-T=10.9-2.5=8.4\\,m$$",
        "**Step 2 — Linear charge concentration:**",
        "$$l=\\dfrac{\\pi}{4}d^2\\rho_e=0.7854\\times(0.10)^2\\times1200=0.7854\\times0.01\\times1200=9.4248\\,kg/m$$",
        "**Step 3 — Charge per hole:**",
        "$$W_h=l\\,(L-T)=9.4248\\times8.4=79.17\\,kg$$",
        "**Step 4 — Volume broken per hole** (bench height, NOT hole length):",
        "$$V_h=B\\,S\\,H=3\\times3.5\\times10=105\\,m^3$$",
        "**Step 5 — Powder factor:**",
        "$$q=\\dfrac{W_h}{V_h}=\\dfrac{79.17}{105}=0.754\\,kg/m^3$$",
      ].join("\n"),
      target:
        "Charge per hole $W_h\\approx\\mathbf{79.2\\,kg}$ (accept $\\mathbf{78\\!-\\!80\\,kg}$); powder factor $q\\approx\\mathbf{0.75\\,kg/m^3}$ (accept $\\mathbf{0.74\\!-\\!0.77}$) — a typical, well-designed surface round.",
    },
    {
      prompt:
        "ANFO of density $\\rho_e=850\\,kg/m^3$ detonates at a velocity $V_{OD}=4000\\,m/s$. Estimate its detonation pressure and the approximate borehole pressure.",
      given: [
        { label: "Explosive density ($\\rho_e$)", value: "$850\\,kg/m^3$" },
        { label: "Detonation velocity ($V_{OD}$)", value: "$4000\\,m/s$" },
      ],
      derivation: [
        "**Step 1 — Detonation pressure:**",
        "$$P_d=\\dfrac{\\rho_e\\,V_{OD}^2}{4}=\\dfrac{850\\times(4000)^2}{4}=\\dfrac{850\\times1.6\\times10^{7}}{4}$$",
        "$$P_d=\\dfrac{1.36\\times10^{10}}{4}=3.4\\times10^{9}\\,Pa=3.4\\,GPa$$",
        "**Step 2 — Borehole pressure** (≈ half of detonation pressure):",
        "$$P_b\\approx\\tfrac{1}{2}P_d=\\tfrac{1}{2}(3.4)=1.7\\,GPa$$",
      ].join("\n"),
      target:
        "Detonation pressure $P_d\\approx\\mathbf{3.4\\,GPa}$ ($3400\\,MPa$, accept $\\mathbf{3.3\\!-\\!3.5\\,GPa}$); borehole pressure $P_b\\approx\\mathbf{1.7\\,GPa}$. Note the **square** law on VOD — a 25% faster explosive raises $P_d$ by ~56%.",
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  Mining Methods & Machinery                                            */
/*  Belt Conveyors · Rope Haulage · Hoisting / Winding                    */
/* ════════════════════════════════════════════════════════════════════ */

const miningMachinery: StudyNote = {
  slug: "mining-methods-machinery",
  subject: "Mining Methods & Machinery",
  title: "Mining Methods & Machinery",
  tier: "subject",
  updated: "Jun 2026",
  blurb:
    "Belt-conveyor capacity and drive power, Euler belt friction, gradient haulage resistance and balanced-winder hoisting power — the materials-handling numerics GATE leans on hardest.",

  /* ─── Section 1 — Recent Trend Analysis (2017–2026) ─────────────────── */
  trend: [
    "Materials handling carries **4–7 marks** and has migrated almost entirely from descriptive method questions to **machinery numericals**.",
    "",
    "**The decade-long shift in question style:**",
    "- **2017–2019** — method recall: compare **bord-and-pillar vs longwall**, list haulage types, define **belt-conveyor** components. Largely 1-mark theory.",
    "- **2020–2022** — single-formula compute: a **belt capacity** in $t/h$, a **drive power** from effective tension, or an **Euler belt-friction** tension ratio.",
    "- **2023–2026** — full **multi-variable NAT** chains: **balanced-winder hoisting power** (steady + acceleration peak), **gradient haulage** resistance with rolling friction, and capacity-to-power coupling on a single conveyor.",
    "",
    "**Exact recurring themes you must own:**",
    "- **Belt capacity** $Q=3.6\\,A\\,v\\,\\rho$ and its density-unit trap.",
    "- **Drive power** $P=T_e\\,v$ and the **Euler** ratio $T_1/T_2=e^{\\mu\\theta}$ (wrap angle in radians).",
    "- **Hoisting power** for a balanced (tail-rope) winder — out-of-balance = payload only — plus the **inertia peak** during acceleration.",
    "- **Gradient resistance** $\\sin\\alpha$ vs **rolling resistance** $\\mu\\cos\\alpha$.",
    "- A rising count of **MSQs** on method selection / machine suitability — one wrong tick zeroes the mark.",
  ].join("\n"),

  /* ─── Section 2 — Master Formula Matrix & Derivations ───────────────── */
  formulaMatrix: [
    {
      name: "Belt Conveyor Capacity",
      law: "Throughput is the load cross-section swept past a point at the belt speed, weighted by bulk density.",
      equation:
        "$$\\dot m=A\\,v\\,\\rho\\;(kg/s)\\quad\\Rightarrow\\quad Q=3.6\\,A\\,v\\,\\rho\\;(t/h,\\ \\rho\\text{ in }kg/m^3)$$",
      shortcut:
        "If $\\rho$ is given in $t/m^3$ use $Q=3600\\,A\\,v\\,\\rho$. The factor $3.6$ already folds in $\\times3600\\,s/h \\div 1000\\,kg/t$.",
      variables: [
        { sym: "$Q$", meaning: "Mass throughput", unit: "$t/h$" },
        { sym: "$\\dot m$", meaning: "Mass flow rate", unit: "$kg/s$" },
        { sym: "$A$", meaning: "Load cross-sectional area on belt", unit: "$m^2$" },
        { sym: "$v$", meaning: "Belt speed", unit: "$m/s$" },
        { sym: "$\\rho$", meaning: "Bulk density of material", unit: "$kg/m^3$" },
      ],
    },
    {
      name: "Drive Power & Euler Belt Friction",
      law: "The motor supplies the effective belt tension at belt speed; the drive pulley can only develop tension up to the Euler capstan limit before slipping.",
      equation:
        "$$P=T_e\\,v,\\qquad \\dfrac{T_1}{T_2}=e^{\\mu\\theta}$$",
      shortcut:
        "$T_e=T_1-T_2$ is the **effective** (driving) tension. The wrap angle $\\theta$ must be in **radians** ($180^\\circ=\\pi$). Input (motor) power $=P/\\eta$.",
      variables: [
        { sym: "$P$", meaning: "Drive (output) power", unit: "$W$" },
        { sym: "$T_e$", meaning: "Effective tension ($T_1-T_2$)", unit: "$N$" },
        { sym: "$T_1,\\,T_2$", meaning: "Tight-side / slack-side tension", unit: "$N$" },
        { sym: "$\\mu$", meaning: "Pulley–belt friction coefficient", unit: "dimensionless" },
        { sym: "$\\theta$", meaning: "Angle of wrap on drive pulley", unit: "$rad$" },
      ],
    },
    {
      name: "Haulage Tractive Resistance & Power",
      law: "A load on a gradient must overcome the component of gravity along the slope plus rolling friction across it.",
      equation:
        "$$R=W g\\,(\\sin\\alpha+\\mu\\cos\\alpha),\\qquad P=\\dfrac{R\\,v}{\\eta}$$",
      shortcut:
        "For a grade quoted as '1 in $n$', $\\sin\\alpha=1/n$ and $\\cos\\alpha\\approx 1$. Use **+** when hauling up, **−** for the friction term when the grade aids descent.",
      variables: [
        { sym: "$R$", meaning: "Total tractive resistance (rope pull)", unit: "$N$" },
        { sym: "$W$", meaning: "Mass hauled (cars + load)", unit: "$kg$" },
        { sym: "$g$", meaning: "Gravitational acceleration ($9.81$)", unit: "$m/s^2$" },
        { sym: "$\\alpha$", meaning: "Gradient angle", unit: "degrees" },
        { sym: "$\\mu$", meaning: "Rolling / track resistance coefficient", unit: "dimensionless" },
        { sym: "$v$", meaning: "Haulage speed", unit: "$m/s$" },
      ],
    },
    {
      name: "Hoisting / Winding Power (Steady + Peak)",
      law: "A balanced (tail-rope) winder lifts only the net out-of-balance load at steady speed; during acceleration the effective inertia adds a transient force.",
      equation:
        "$$P_{steady}=\\dfrac{W_p\\,g\\,v}{\\eta},\\qquad P_{peak}=\\dfrac{(W_p\\,g+m_{eff}\\,a)\\,v}{\\eta}$$",
      shortcut:
        "Balanced winding ⇒ out-of-balance $=$ **payload only** (skip + counterweight cancel). Without a tail rope, add the unbalanced rope weight. $m_{eff}$ lumps cage, load, ropes and the rotational-inertia equivalent.",
      variables: [
        { sym: "$P$", meaning: "Motor (input) power", unit: "$W$" },
        { sym: "$W_p$", meaning: "Payload mass", unit: "$kg$" },
        { sym: "$v$", meaning: "Hoisting (rope) speed", unit: "$m/s$" },
        { sym: "$a$", meaning: "Acceleration during ramp-up", unit: "$m/s^2$" },
        { sym: "$m_{eff}$", meaning: "Effective accelerated mass", unit: "$kg$" },
        { sym: "$\\eta$", meaning: "Drive efficiency (fraction)", unit: "dimensionless" },
      ],
    },
    {
      name: "Rope Factor of Safety",
      law: "Winding ropes are sized so the breaking strength comfortably exceeds the maximum static-plus-dynamic load.",
      equation:
        "$$F.S.=\\dfrac{T_{break}}{(W_p+W_{cage}+W_{rope})\\,g}$$",
      shortcut:
        "Statutory winding-rope F.S. is typically $\\geq 5$ and **decreases with depth** as rope self-weight grows. Add the inertia term $m_{eff}a$ for the dynamic check.",
      variables: [
        { sym: "$F.S.$", meaning: "Factor of safety", unit: "dimensionless" },
        { sym: "$T_{break}$", meaning: "Rope breaking strength", unit: "$N$" },
        { sym: "$W_{rope}$", meaning: "Suspended rope mass", unit: "$kg$" },
      ],
    },
  ],

  /* ─── Section 3 — The "IIT Trap" Warning System ─────────────────────── */
  traps: [
    "**Bulk-density units.** $Q=3.6\\,A\\,v\\,\\rho$ needs $\\rho$ in $kg/m^3$; with $\\rho$ in $t/m^3$ the factor is $3600$. Mixing the two slips the capacity by $1000\\times$.",
    "**Belt speed $m/s$ vs $m/min$.** Capacity and power both use $v$ in $m/s$. A speed given in $m/min$ must be divided by 60 first.",
    "**Euler wrap angle in radians.** $T_1/T_2=e^{\\mu\\theta}$ with $\\theta$ in **radians** — feeding degrees makes the exponent ~57× too large.",
    "**Effective vs tight-side tension.** Drive power uses $T_e=T_1-T_2$, not $T_1$. Using the tight-side tension alone over-states the power.",
    "**Gradient: $\\sin\\alpha$, not $\\tan\\alpha$.** Grade resistance is $Wg\\sin\\alpha$; rolling resistance uses $\\cos\\alpha\\,(\\approx 1)$. For a '1 in $n$' grade, $\\sin\\alpha=1/n$.",
    "**Balanced vs unbalanced winding.** With a tail rope the out-of-balance is the **payload only**. Adding cage/counterweight masses (which cancel) double-counts the load.",
    "**Weight vs inertia in the peak.** Peak force $=W_p g+m_{eff}a$ — the $g$ term is weight, the $a$ term is inertia; dropping either (or using $g$ for both) is a classic NAT error.",
    "**Efficiency placement.** Motor input power is $P_{out}/\\eta$ (divide). Multiplying by $\\eta$ understates the required motor rating.",
  ],

  /* ─── Section 4 — High-Fidelity Core Examples ───────────────────────── */
  examples: [
    {
      prompt:
        "A troughed belt conveyor carries coal of bulk density $\\rho=900\\,kg/m^3$ at a belt speed $v=2.5\\,m/s$ with a load cross-sectional area $A=0.05\\,m^2$. The effective belt tension is $T_e=18\\,kN$. Determine (a) the conveyor capacity in $t/h$ and (b) the drive (output) power.",
      given: [
        { label: "Bulk density ($\\rho$)", value: "$900\\,kg/m^3$" },
        { label: "Belt speed ($v$)", value: "$2.5\\,m/s$" },
        { label: "Load area ($A$)", value: "$0.05\\,m^2$" },
        { label: "Effective tension ($T_e$)", value: "$18\\,kN = 18000\\,N$" },
      ],
      derivation: [
        "**Step 1 — Capacity** (density in $kg/m^3$ ⇒ factor $3.6$):",
        "$$Q=3.6\\,A\\,v\\,\\rho=3.6\\times0.05\\times2.5\\times900$$",
        "$$Q=3.6\\times(0.05\\times2.5\\times900)=3.6\\times112.5=405\\,t/h$$",
        "**Step 2 — Drive power** at belt speed:",
        "$$P=T_e\\,v=18000\\times2.5=45000\\,W=45\\,kW$$",
      ].join("\n"),
      target:
        "Capacity $Q=\\mathbf{405\\,t/h}$ (accept $\\mathbf{400\\!-\\!410}$); drive power $P=\\mathbf{45\\,kW}$. Motor input would be $45/\\eta$ — e.g. $\\approx 50\\,kW$ at $\\eta=0.9$.",
    },
    {
      prompt:
        "A balanced (tail-rope) winder hoists a payload $W_p=8000\\,kg$ at a steady rope speed $v=12\\,m/s$. The effective accelerated mass (cage, load, ropes and rotating parts) is $m_{eff}=20000\\,kg$ and the acceleration during ramp-up is $a=0.8\\,m/s^2$. Drive efficiency is $\\eta=0.90$. Find (a) the steady motor power and (b) the peak motor power at the end of acceleration. Take $g=9.81\\,m/s^2$.",
      given: [
        { label: "Payload ($W_p$)", value: "$8000\\,kg$" },
        { label: "Rope speed ($v$)", value: "$12\\,m/s$" },
        { label: "Effective mass ($m_{eff}$)", value: "$20000\\,kg$" },
        { label: "Acceleration ($a$)", value: "$0.8\\,m/s^2$" },
        { label: "Efficiency ($\\eta$)", value: "$0.90$" },
      ],
      derivation: [
        "**Step 1 — Out-of-balance force** (balanced winder ⇒ payload only):",
        "$$F_{oob}=W_p\\,g=8000\\times9.81=78\\,480\\,N$$",
        "**Step 2 — Steady motor power:**",
        "$$P_{steady}=\\dfrac{F_{oob}\\,v}{\\eta}=\\dfrac{78\\,480\\times12}{0.90}=\\dfrac{941\\,760}{0.90}=1\\,046\\,400\\,W\\approx1046\\,kW$$",
        "**Step 3 — Peak force** (weight + inertia at end of acceleration):",
        "$$F_{peak}=W_p g+m_{eff}a=78\\,480+20000\\times0.8=78\\,480+16\\,000=94\\,480\\,N$$",
        "**Step 4 — Peak motor power:**",
        "$$P_{peak}=\\dfrac{F_{peak}\\,v}{\\eta}=\\dfrac{94\\,480\\times12}{0.90}=\\dfrac{1\\,133\\,760}{0.90}\\approx1260\\,kW$$",
      ].join("\n"),
      target:
        "Steady power $\\approx\\mathbf{1046\\,kW}$ (accept $\\mathbf{1040\\!-\\!1050\\,kW}$); peak power $\\approx\\mathbf{1260\\,kW}$ (accept $\\mathbf{1255\\!-\\!1265\\,kW}$). The motor must be rated for the **peak**, not the steady, demand.",
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  Mineral Economics & Planning                                          */
/*  Time Value of Money · NPV / DCF · Cut-off Grade · Reserve Estimation  */
/* ════════════════════════════════════════════════════════════════════ */

const mineralEconomics: StudyNote = {
  slug: "mineral-economics-planning",
  subject: "Mineral Economics",
  title: "Mineral Economics & Planning",
  tier: "premium",
  updated: "Jun 2026",
  blurb:
    "Discounted cash flow and NPV, annuity present value, break-even cut-off grade and reserve-tonnage estimation — the project-evaluation numerics that decide whether an orebody is worth mining.",

  /* ─── Section 1 — Recent Trend Analysis (2017–2026) ─────────────────── */
  trend: [
    "Mineral economics & planning is worth **3–6 marks** and has hardened from definition recall into **financial-evaluation NAT**.",
    "",
    "**The decade-long shift in question style:**",
    "- **2017–2019** — definitions: **resource vs reserve**, cut-off grade meaning, simple **payback** statements. 1-mark theory.",
    "- **2020–2022** — single compute: a **present value** discounting, a one-line **break-even cut-off grade**, or a **tonnage = volume × density** estimate.",
    "- **2023–2026** — full **DCF/NPV** chains over a project life, **annuity** present-worth, and **cut-off → ore tonnage → contained-metal** sequences in one NAT.",
    "",
    "**Exact recurring themes you must own:**",
    "- **NPV** $=\\sum CF_t/(1+i)^t-C_0$ and the **annuity** short-cut for uniform cash flows.",
    "- **Break-even cut-off grade** $g_c=C/(p\\,y)$ — the recovery and price-unit trap.",
    "- **Reserve tonnage** $T=A\\,t\\,\\rho$ and **contained metal** $=T\\,g$.",
    "- **Payback** vs **discounted payback** vs **IRR** (rate where $NPV=0$).",
    "- Frequent **MSQs** distinguishing reserve categories (proved/probable) and modifying factors.",
  ].join("\n"),

  /* ─── Section 2 — Master Formula Matrix & Derivations ───────────────── */
  formulaMatrix: [
    {
      name: "Time Value of Money & NPV",
      law: "A future cash flow is worth less today; project worth is the sum of discounted inflows minus the up-front capital.",
      equation:
        "$$PV=\\dfrac{FV}{(1+i)^n},\\qquad NPV=\\sum_{t=1}^{n}\\dfrac{CF_t}{(1+i)^t}-C_0$$",
      shortcut:
        "$C_0$ (capital at $t=0$) is **not** discounted. Accept the project if $NPV>0$. Use $i$ as a **decimal** ($10\\%\\to0.10$).",
      variables: [
        { sym: "$NPV$", meaning: "Net present value", unit: "currency" },
        { sym: "$CF_t$", meaning: "Net cash flow in year $t$", unit: "currency" },
        { sym: "$C_0$", meaning: "Initial capital outlay", unit: "currency" },
        { sym: "$i$", meaning: "Discount rate (per period)", unit: "fraction" },
        { sym: "$n$", meaning: "Project life", unit: "years" },
      ],
    },
    {
      name: "Present Value of an Annuity",
      law: "A stream of equal annual cash flows collapses to a single closed-form present worth.",
      equation:
        "$$PV=A\\cdot\\dfrac{1-(1+i)^{-n}}{i}$$",
      shortcut:
        "Use this **only** for uniform $CF$. The bracket is the 'annuity factor' — multiply by the constant annual cash flow $A$. Uneven flows must be discounted year-by-year.",
      variables: [
        { sym: "$PV$", meaning: "Present value of the stream", unit: "currency" },
        { sym: "$A$", meaning: "Uniform annual cash flow", unit: "currency/yr" },
        { sym: "$i$", meaning: "Discount rate", unit: "fraction" },
        { sym: "$n$", meaning: "Number of periods", unit: "years" },
      ],
    },
    {
      name: "Break-even Cut-off Grade",
      law: "The lowest grade at which the recovered metal value exactly pays the cost of mining and treating one tonne of ore.",
      equation:
        "$$g_c=\\dfrac{C}{p\\cdot y}$$",
      shortcut:
        "Keep units consistent: $C$ in \\$/t ore, $p$ in \\$/t metal ⇒ $g_c$ as a **fraction** ($\\times100$ for %). Higher costs raise $g_c$; better recovery $y$ or price $p$ lowers it.",
      variables: [
        { sym: "$g_c$", meaning: "Break-even cut-off grade", unit: "fraction" },
        { sym: "$C$", meaning: "Total cost per tonne of ore", unit: "\\$/t" },
        { sym: "$p$", meaning: "Metal price", unit: "\\$/t metal" },
        { sym: "$y$", meaning: "Mill / metallurgical recovery", unit: "fraction" },
      ],
    },
    {
      name: "Reserve Tonnage & Contained Metal",
      law: "Ore tonnage is the orebody volume times bulk density; contained metal scales that by the average grade.",
      equation:
        "$$T=A\\,t\\,\\rho,\\qquad M=T\\cdot g$$",
      shortcut:
        "Volume $V=A\\,t$ (area × mean thickness). For cross-sections use the mean-area rule $V=\\tfrac{A_1+A_2}{2}\\,L$. Metal mass uses grade as a **fraction**.",
      variables: [
        { sym: "$T$", meaning: "Ore tonnage", unit: "$t$" },
        { sym: "$A$", meaning: "Plan area of orebody", unit: "$m^2$" },
        { sym: "$t$", meaning: "Mean thickness", unit: "$m$" },
        { sym: "$\\rho$", meaning: "Bulk (in-situ) density", unit: "$t/m^3$" },
        { sym: "$g$", meaning: "Average grade (fraction)", unit: "dimensionless" },
        { sym: "$M$", meaning: "Contained metal", unit: "$t$" },
      ],
    },
    {
      name: "Payback Period & IRR",
      law: "Simple payback is the time to recover capital from cash flow; IRR is the discount rate that zeroes the NPV.",
      equation:
        "$$n_{pb}=\\dfrac{C_0}{CF_{annual}},\\qquad NPV(i=IRR)=0$$",
      shortcut:
        "Simple payback ignores the time value of money — discounted payback uses $CF_t/(1+i)^t$. Accept a project when $IRR>$ the hurdle (discount) rate.",
      variables: [
        { sym: "$n_{pb}$", meaning: "Payback period", unit: "years" },
        { sym: "$C_0$", meaning: "Initial capital", unit: "currency" },
        { sym: "$CF_{annual}$", meaning: "Annual net cash flow", unit: "currency/yr" },
        { sym: "$IRR$", meaning: "Internal rate of return", unit: "fraction" },
      ],
    },
  ],

  /* ─── Section 3 — The "IIT Trap" Warning System ─────────────────────── */
  traps: [
    "**Discount rate as a decimal.** $(1+i)^t$ needs $i=0.10$, not $10$. Plugging the percentage value blows the denominator apart.",
    "**Don't discount $C_0$.** The initial capital sits at $t=0$; only the future inflows $CF_t$ get the $(1+i)^t$ divisor.",
    "**Annuity formula is for uniform flows only.** If cash flows vary year-to-year, discount each one separately — the closed form silently gives a wrong answer.",
    "**Cut-off grade: recovery is in the denominator.** $g_c=C/(p\\,y)$. Forgetting $y$ (or putting it on top) mis-states the break-even grade.",
    "**Grade as fraction vs percent.** A $1.2\\%$ grade is $0.012$ in $M=T g$. Also $1\\%=10\\,000\\,ppm$ — watch ppm-quoted grades.",
    "**Tonnage vs contained metal.** $T=A t\\rho$ is **ore**; multiply by grade for **metal**. Reporting tonnage as metal (or vice-versa) is a classic slip.",
    "**Bulk density units.** $\\rho$ in $t/m^3$ gives tonnes directly; a $kg/m^3$ value must be divided by 1000.",
    "**Reserve vs resource.** A *reserve* is the economically/legally mineable part of a *resource*; cut-off grade and modifying factors convert one to the other.",
    "**Payback ≠ profitability.** A short payback can still have a negative NPV; use discounted measures (NPV, IRR) for the accept/reject decision.",
  ],

  /* ─── Section 4 — High-Fidelity Core Examples ───────────────────────── */
  examples: [
    {
      prompt:
        "A mining project needs an initial capital of $C_0=\\textsf{₹}50$ crore and is expected to generate a uniform net cash flow of $CF=\\textsf{₹}15$ crore per year for $5$ years. At a discount rate of $i=10\\%$, evaluate the project NPV and state whether it is viable.",
      given: [
        { label: "Initial capital ($C_0$)", value: "$\\textsf{₹}50$ crore" },
        { label: "Annual cash flow ($A$)", value: "$\\textsf{₹}15$ crore/yr" },
        { label: "Project life ($n$)", value: "$5$ years" },
        { label: "Discount rate ($i$)", value: "$10\\% = 0.10$" },
      ],
      derivation: [
        "**Step 1 — Annuity factor** (uniform cash flows):",
        "$$\\dfrac{1-(1+i)^{-n}}{i}=\\dfrac{1-(1.10)^{-5}}{0.10}$$",
        "$(1.10)^5=1.61051\\Rightarrow(1.10)^{-5}=0.62092$",
        "$$=\\dfrac{1-0.62092}{0.10}=\\dfrac{0.37908}{0.10}=3.7908$$",
        "**Step 2 — Present value of inflows:**",
        "$$PV=A\\times3.7908=15\\times3.7908=56.86\\ \\text{crore}$$",
        "**Step 3 — NPV:**",
        "$$NPV=PV-C_0=56.86-50=6.86\\ \\text{crore}$$",
      ].join("\n"),
      target:
        "$NPV\\approx\\mathbf{\\textsf{₹}6.86\\ crore}$ (accept $\\mathbf{6.8\\!-\\!6.9}$). Since $NPV>0$, the project is **viable** at a $10\\%$ hurdle rate.",
    },
    {
      prompt:
        "For a copper deposit the operating cost is $C=\\$40$ per tonne of ore, the copper price is $p=\\$6000$ per tonne of metal and the mill recovery is $y=0.85$. The tabular orebody has plan area $A=250\\,000\\,m^2$, mean thickness $t=8\\,m$, bulk density $\\rho=2.8\\,t/m^3$ and average grade $g=1.2\\%$ Cu. Find (a) the break-even cut-off grade and (b) the ore tonnage and contained copper.",
      given: [
        { label: "Operating cost ($C$)", value: "$\\$40/t$ ore" },
        { label: "Copper price ($p$)", value: "$\\$6000/t$ metal" },
        { label: "Recovery ($y$)", value: "$0.85$" },
        { label: "Area × thickness ($A,t$)", value: "$250\\,000\\,m^2 \\times 8\\,m$" },
        { label: "Bulk density ($\\rho$)", value: "$2.8\\,t/m^3$" },
        { label: "Average grade ($g$)", value: "$1.2\\% = 0.012$" },
      ],
      derivation: [
        "**Step 1 — Break-even cut-off grade:**",
        "$$g_c=\\dfrac{C}{p\\,y}=\\dfrac{40}{6000\\times0.85}=\\dfrac{40}{5100}=0.00784$$",
        "$$g_c=0.00784\\times100=0.78\\%\\ \\text{Cu}$$",
        "**Step 2 — Ore tonnage** ($T=A\\,t\\,\\rho$):",
        "$$T=250\\,000\\times8\\times2.8=2\\,000\\,000\\times2.8=5.6\\times10^{6}\\,t$$",
        "**Step 3 — Contained copper** ($M=T\\,g$):",
        "$$M=5.6\\times10^{6}\\times0.012=6.72\\times10^{4}\\,t$$",
      ].join("\n"),
      target:
        "Cut-off grade $g_c\\approx\\mathbf{0.78\\%\\,Cu}$; ore tonnage $T=\\mathbf{5.6\\ Mt}$; contained copper $M\\approx\\mathbf{67\\,200\\,t}$ ($67.2\\,kt$). The $1.2\\%$ average comfortably exceeds the $0.78\\%$ cut-off, so the block is ore.",
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  Mine Surveying                                                        */
/*  Levelling · Tape Corrections · Traversing · Tacheometry               */
/* ════════════════════════════════════════════════════════════════════ */

const mineSurveying: StudyNote = {
  slug: "mine-surveying",
  subject: "Mine Surveying",
  title: "Mine Surveying",
  tier: "subject",
  updated: "Jun 2026",
  blurb:
    "Levelling reductions and the arithmetic check, tape corrections, traverse latitude/departure with closing error and Bowditch adjustment, plus tacheometric distance — the measurement numerics GATE tests every year.",

  /* ─── Section 1 — Recent Trend Analysis (2017–2026) ─────────────────── */
  trend: [
    "Surveying carries **4–7 marks** and is the most reliably **numerical** unit in the paper — instrument theory has all but disappeared.",
    "",
    "**The decade-long shift in question style:**",
    "- **2017–2019** — instrument recall: parts of a level/theodolite, define **bearing**, **temporary adjustments**. 1-mark theory.",
    "- **2020–2022** — single compute: one **tape correction**, a **reduced level** by HI method, or a single **latitude/departure**.",
    "- **2023–2026** — full **NAT** chains: **traverse closing error + relative accuracy**, **combined tape corrections**, **rise-and-fall** with the arithmetic check, and **tacheometric** distance/elevation.",
    "",
    "**Exact recurring themes you must own:**",
    "- **Levelling**: $HI=RL+BS$, $RL=HI-FS$, and the check $\\sum BS-\\sum FS=\\text{Last}-\\text{First RL}$.",
    "- **Tape corrections**: temperature, pull (+), sag (−) and slope (−).",
    "- **Traverse**: $L=l\\cos\\theta$, $D=l\\sin\\theta$, closing error $e=\\sqrt{(\\sum L)^2+(\\sum D)^2}$.",
    "- **Bowditch rule** for distributing the misclosure.",
    "- **Tacheometry**: $D=Ks\\cos^2\\theta$ with the stadia constants $K=100,\\ C=0$.",
  ].join("\n"),

  /* ─── Section 2 — Master Formula Matrix & Derivations ───────────────── */
  formulaMatrix: [
    {
      name: "Levelling — HI Method & Arithmetic Check",
      law: "The line of collimation is fixed by a known point plus its back-sight; every other reduced level is the collimation height minus the staff reading.",
      equation:
        "$$HI=RL+BS,\\qquad RL_{next}=HI-FS$$\n$$\\textstyle\\sum BS-\\sum FS=\\text{Last RL}-\\text{First RL}$$",
      shortcut:
        "Rise-and-fall alternative: $rise/fall=BS-FS$ between successive points; a **rise** when $BS>FS$. The check $\\sum BS-\\sum FS=\\sum Rise-\\sum Fall$ must also equal the RL change.",
      variables: [
        { sym: "$HI$", meaning: "Height of instrument (collimation)", unit: "$m$" },
        { sym: "$RL$", meaning: "Reduced level of a point", unit: "$m$" },
        { sym: "$BS$", meaning: "Back sight (to known point)", unit: "$m$" },
        { sym: "$FS$", meaning: "Fore sight (to new point)", unit: "$m$" },
      ],
    },
    {
      name: "Tape Corrections",
      law: "A measured length is adjusted for the tape's temperature, applied pull, unsupported sag and ground slope.",
      equation:
        "$$C_t=\\alpha(T-T_0)L,\\quad C_p=\\dfrac{(P-P_0)L}{AE}$$\n$$C_{sag}=-\\dfrac{w^2L^3}{24P^2},\\quad C_{slope}=-\\dfrac{h^2}{2L}$$",
      shortcut:
        "Temperature & pull are **+** when hotter / pulled harder than standard; **sag and slope are always −** (subtract). Corrected length $=L+\\sum C$.",
      variables: [
        { sym: "$\\alpha$", meaning: "Coefficient of thermal expansion", unit: "$/^\\circ C$" },
        { sym: "$T,\\,T_0$", meaning: "Field / standard temperature", unit: "$^\\circ C$" },
        { sym: "$P,\\,P_0$", meaning: "Field / standard pull", unit: "$N$" },
        { sym: "$A$", meaning: "Tape cross-section", unit: "$m^2$" },
        { sym: "$E$", meaning: "Young's modulus of tape", unit: "$N/m^2$" },
        { sym: "$w$", meaning: "Tape weight per metre", unit: "$N/m$" },
        { sym: "$h$", meaning: "Height difference over span", unit: "$m$" },
        { sym: "$L$", meaning: "Measured (nominal) length", unit: "$m$" },
      ],
    },
    {
      name: "Traverse — Latitude, Departure & Closing Error",
      law: "Each line resolves into a north–south (latitude) and east–west (departure) component; a perfect closed traverse sums both to zero.",
      equation:
        "$$L=l\\cos\\theta,\\quad D=l\\sin\\theta$$\n$$e=\\sqrt{\\left(\\textstyle\\sum L\\right)^2+\\left(\\textstyle\\sum D\\right)^2}$$",
      shortcut:
        "$\\theta$ is the **whole-circle bearing**, so the signs of $\\cos$/$\\sin$ already fix the quadrant. Relative accuracy $=e/\\text{perimeter}$, quoted as $1/m$.",
      variables: [
        { sym: "$l$", meaning: "Line length", unit: "$m$" },
        { sym: "$\\theta$", meaning: "Whole-circle bearing", unit: "degrees" },
        { sym: "$L$", meaning: "Latitude (N–S component)", unit: "$m$" },
        { sym: "$D$", meaning: "Departure (E–W component)", unit: "$m$" },
        { sym: "$e$", meaning: "Closing (linear mis-closure) error", unit: "$m$" },
      ],
    },
    {
      name: "Bowditch (Compass) Rule",
      law: "The mis-closure is distributed to each line in proportion to its length — appropriate when angular and linear errors are comparable.",
      equation:
        "$$\\delta L_i=-\\,\\sum L\\cdot\\dfrac{l_i}{\\sum l},\\qquad \\delta D_i=-\\,\\sum D\\cdot\\dfrac{l_i}{\\sum l}$$",
      shortcut:
        "Bowditch ⇒ correction $\\propto$ **line length**. The Transit rule instead distributes $\\propto$ the latitude/departure magnitude of each line.",
      variables: [
        { sym: "$\\delta L_i$", meaning: "Latitude correction for line $i$", unit: "$m$" },
        { sym: "$\\delta D_i$", meaning: "Departure correction for line $i$", unit: "$m$" },
        { sym: "$l_i$", meaning: "Length of line $i$", unit: "$m$" },
        { sym: "$\\sum l$", meaning: "Traverse perimeter", unit: "$m$" },
      ],
    },
    {
      name: "Tacheometric Distance & Elevation",
      law: "Stadia readings give horizontal distance and vertical height from the intercept and the line-of-sight inclination.",
      equation:
        "$$D=K\\,s\\cos^2\\theta+C\\cos\\theta,\\qquad V=\\dfrac{K\\,s\\,\\sin 2\\theta}{2}+C\\sin\\theta$$",
      shortcut:
        "Modern internal-focusing instruments give $K=100,\\ C=0$, so $D=Ks\\cos^2\\theta$. For a horizontal sight ($\\theta=0$): $D=Ks$.",
      variables: [
        { sym: "$K$", meaning: "Stadia multiplying constant ($\\approx100$)", unit: "dimensionless" },
        { sym: "$C$", meaning: "Additive constant ($\\approx0$)", unit: "$m$" },
        { sym: "$s$", meaning: "Staff intercept (top − bottom hair)", unit: "$m$" },
        { sym: "$\\theta$", meaning: "Vertical angle of sight", unit: "degrees" },
        { sym: "$D$", meaning: "Horizontal distance", unit: "$m$" },
        { sym: "$V$", meaning: "Vertical height component", unit: "$m$" },
      ],
    },
  ],

  /* ─── Section 3 — The "IIT Trap" Warning System ─────────────────────── */
  traps: [
    "**Levelling sign convention.** A **rise** occurs when $BS>FS$; $RL=HI-FS$. Flipping the subtraction inverts every downstream level.",
    "**The arithmetic check is mandatory.** $\\sum BS-\\sum FS$ must equal **Last RL − First RL** (and $\\sum Rise-\\sum Fall$). If it doesn't, a reading was mis-classed.",
    "**Temperature/pull signs.** $C_t$ and $C_p$ are **positive** when the field temperature/pull exceed the standard — the tape stretches, reads short, so you *add*.",
    "**Sag and slope are always negative.** Both $C_{sag}$ and $C_{slope}$ shorten the true horizontal length — never add them.",
    "**$AE$ units in pull correction.** With $P$ in $N$, use $A$ in $m^2$ and $E$ in $N/m^2$ so $C_p$ comes out in metres. Mixing $mm^2$/$N/mm^2$ is fine **only** if kept consistent.",
    "**Latitude vs departure.** $L=l\\cos(\\text{bearing})$, $D=l\\sin(\\text{bearing})$ — swapping cos and sin (a very common slip) rotates the whole traverse.",
    "**Closing error magnitude.** $e=\\sqrt{(\\sum L)^2+(\\sum D)^2}$ uses the *algebraic* sums of latitudes and departures, not their absolute values.",
    "**Bowditch vs Transit.** Bowditch distributes $\\propto$ line length; Transit $\\propto$ latitude/departure. Using the wrong rule mis-adjusts each leg.",
    "**Tacheometry $\\cos^2\\theta$, not $\\cos\\theta$.** Horizontal distance is $Ks\\cos^2\\theta$; the vertical term uses $\\tfrac12 Ks\\sin 2\\theta$. Don't confuse the two.",
  ],

  /* ─── Section 4 — High-Fidelity Core Examples ───────────────────────── */
  examples: [
    {
      prompt:
        "A length is measured as $L=30.000\\,m$ with a steel tape standardised at $T_0=20^\\circ C$ under a pull of $P_0=50\\,N$. During measurement the temperature is $T=35^\\circ C$ and the applied pull is $P=100\\,N$. The tape has cross-section $A=3\\,mm^2$, $E=2\\times10^{5}\\,N/mm^2$ and $\\alpha=11.2\\times10^{-6}\\,/^\\circ C$. Find the temperature and pull corrections and the corrected length.",
      given: [
        { label: "Measured length ($L$)", value: "$30.000\\,m$" },
        { label: "Temperatures ($T,T_0$)", value: "$35^\\circ C,\\ 20^\\circ C$" },
        { label: "Pulls ($P,P_0$)", value: "$100\\,N,\\ 50\\,N$" },
        { label: "Section ($A$)", value: "$3\\,mm^2=3\\times10^{-6}\\,m^2$" },
        { label: "Modulus ($E$)", value: "$2\\times10^{11}\\,N/m^2$" },
        { label: "Expansion ($\\alpha$)", value: "$11.2\\times10^{-6}\\,/^\\circ C$" },
      ],
      derivation: [
        "**Step 1 — Temperature correction:**",
        "$$C_t=\\alpha(T-T_0)L=11.2\\times10^{-6}\\times(35-20)\\times30$$",
        "$$C_t=11.2\\times10^{-6}\\times450=5.04\\times10^{-3}\\,m=+5.04\\,mm$$",
        "**Step 2 — Pull correction** ($AE=3\\times10^{-6}\\times2\\times10^{11}=6\\times10^{5}\\,N$):",
        "$$C_p=\\dfrac{(P-P_0)L}{AE}=\\dfrac{(100-50)\\times30}{6\\times10^{5}}=\\dfrac{1500}{600000}=2.5\\times10^{-3}\\,m=+2.5\\,mm$$",
        "**Step 3 — Corrected length** (both positive):",
        "$$L'=30.000+0.00504+0.00250=30.00754\\,m$$",
      ].join("\n"),
      target:
        "$C_t=\\mathbf{+5.04\\,mm}$, $C_p=\\mathbf{+2.5\\,mm}$; corrected length $L'\\approx\\mathbf{30.0075\\,m}$.",
    },
    {
      prompt:
        "A four-sided closed traverse $ABCDA$ has lines AB $=100\\,m$ at $45^\\circ$, BC $=100\\,m$ at $135^\\circ$, CD $=100\\,m$ at $225^\\circ$ and DA $=99\\,m$ at $315^\\circ$ (whole-circle bearings). Compute the sum of latitudes and departures, the closing error and the relative accuracy.",
      given: [
        { label: "AB", value: "$100\\,m \\angle\\,45^\\circ$" },
        { label: "BC", value: "$100\\,m \\angle\\,135^\\circ$" },
        { label: "CD", value: "$100\\,m \\angle\\,225^\\circ$" },
        { label: "DA", value: "$99\\,m \\angle\\,315^\\circ$" },
      ],
      derivation: [
        "**Step 1 — Latitudes** $L=l\\cos\\theta$ (with $\\cos45^\\circ=0.7071$):",
        "AB $=+70.71$, BC $=-70.71$, CD $=-70.71$, DA $=+70.00$",
        "$$\\textstyle\\sum L=70.71-70.71-70.71+70.00=-0.71\\,m$$",
        "**Step 2 — Departures** $D=l\\sin\\theta$:",
        "AB $=+70.71$, BC $=+70.71$, CD $=-70.71$, DA $=-70.00$",
        "$$\\textstyle\\sum D=70.71+70.71-70.71-70.00=+0.71\\,m$$",
        "**Step 3 — Closing error:**",
        "$$e=\\sqrt{(-0.71)^2+(0.71)^2}=0.71\\sqrt2=1.00\\,m$$",
        "**Step 4 — Relative accuracy** (perimeter $=100+100+100+99=399\\,m$):",
        "$$\\dfrac{e}{\\sum l}=\\dfrac{1.00}{399}\\approx\\dfrac{1}{397}$$",
      ].join("\n"),
      target:
        "$\\sum L=\\mathbf{-0.71\\,m}$, $\\sum D=\\mathbf{+0.71\\,m}$; closing error $e\\approx\\mathbf{1.00\\,m}$; relative accuracy $\\approx\\mathbf{1/397}$. The Bowditch corrections would then be shared $\\propto$ each line's length.",
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  Catalog + lookups                                                     */
/* ════════════════════════════════════════════════════════════════════ */

export const STUDY_NOTES: StudyNote[] = [mineVentilation, geomechanics, drillingBlasting, miningMachinery, mineralEconomics, mineSurveying];

export function getStudyNote(slug: string): StudyNote | undefined {
  return STUDY_NOTES.find((n) => n.slug === slug);
}

/** Subject areas authored later — shown as "coming soon" in the catalog. */
export type PlannedNote = { subject: string; title: string; highlight: string };

export const STUDY_NOTE_PLAN: PlannedNote[] = [];
