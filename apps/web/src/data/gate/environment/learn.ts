/**
 * GATE Environmental Science & Engineering (ES) — Topic-Wise Learn & Solve.
 *
 * Reuses the exact LearnTopic / LearnModule / LearnSyllabus model from the
 * mining/civil Learn engine (`@/data/learn`) so the runner, gating and
 * syllabus dashboard work unchanged. Live sub-topics resolve to an authored
 * LearnTopic; the rest render as a "coming soon" roadmap mirroring the full
 * GATE ES syllabus.
 */
import type {
  LearnTopic,
  LearnReference,
  LearnSyllabusSection,
  LearnSyllabusSubtopic,
} from "@/data/learn";

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 1 — Environmental Management & Ethics                         */
/* ════════════════════════════════════════════════════════════════════ */

const esEIA: LearnTopic = {
  slug: "es-mg-eia",
  subject: "Environmental Management & Ethics",
  title: "Environmental Impact Assessment (EIA)",
  tier: "free",
  blurb:
    "Screening, scoping, impact prediction and the EMP — the statutory decision tool that governs project clearance under EIA Notification 2006.",
  module: {
    principle:
      "**EIA** is a systematic process that predicts the environmental consequences of a proposed project *before* a decision is taken, so impacts can be avoided, minimised or mitigated. The cycle runs **screening → scoping → baseline study → impact prediction → Environmental Management Plan (EMP) → public consultation → appraisal/clearance → monitoring**. **Screening** decides *whether* an EIA is needed; **scoping** identifies the *significant* issues to study in depth; the **EMP** details mitigation, monitoring and institutional responsibility.",
    formulaMatrix: [
      "**Category A** projects: appraised at the **central** level (MoEFCC) — always require EIA + public hearing.",
      "",
      "**Category B1 / B2**: appraised by the **State** (SEIAA); B1 needs EIA, B2 is exempt.",
      "",
      "**Leopold matrix**: an interaction grid of *activities* × *environmental components*; each cell scored for **magnitude** and **importance** (1–10).",
      "",
      "**RIAM, network & overlay methods**: alternative impact-identification tools.",
    ].join("\n"),
    traps: [
      "**Screening ≠ scoping.** Screening = *is an EIA required?* Scoping = *what should it cover?*",
      "**Public consultation is statutory** for most Category A and B1 projects — not optional.",
      "**The EMP follows impact prediction**, never precedes screening.",
    ],
  },
  questions: [
    {
      id: "es-eia-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "In the EIA cycle, the stage that identifies the significant impacts requiring detailed study is called:",
      options: ["Scoping", "Screening", "Monitoring", "Auditing"], answer: 0,
      solution: { given: "Screening decides whether an EIA is needed.", derivation: "Scoping focuses the study on the key/significant impacts.", target: "Correct option: Scoping." },
    },
    {
      id: "es-eia-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "Under the EIA Notification 2006 (India), Category A projects are appraised at the:",
      options: ["Central level (MoEFCC)", "State level (SEIAA)", "District level", "Municipal level"], answer: 0,
      solution: { given: "Category A = central appraisal; B = state.", derivation: "Category A projects require central clearance with mandatory public hearing.", target: "Correct option: Central level." },
    },
    {
      id: "es-eia-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "In a Leopold matrix, each interaction cell is typically scored on two attributes. These are:",
      options: ["Magnitude and importance", "Cost and benefit", "Probability and time", "Area and volume"], answer: 0,
      solution: { given: "Leopold matrix = activities × components grid.", derivation: "Each cell carries a magnitude (extent) and an importance (significance) score, usually 1–10.", target: "Correct option: Magnitude and importance." },
    },
  ],
};

const esEnvEconomics: LearnTopic = {
  slug: "es-mg-economics",
  subject: "Environmental Management & Ethics",
  title: "Environmental Economics & Ethics",
  tier: "free",
  blurb:
    "Externalities, polluter-pays, discounting and cost–benefit analysis — valuing the environment in decision-making.",
  module: {
    principle:
      "Markets fail when production imposes an **uncompensated external cost** (a *negative externality*) such as pollution. The **polluter-pays principle (PPP)** internalises that cost. **Cost–benefit analysis (CBA)** compares the discounted stream of benefits and costs; future values are converted to **present worth** by discounting. The **precautionary principle** justifies action under scientific uncertainty when impacts could be serious or irreversible.",
    formulaMatrix: [
      "**Present worth**: $PW=\\dfrac{F}{(1+i)^n}$  (F = future value, i = discount rate, n = years)",
      "",
      "**Net present value**: $NPV=\\sum_{t=0}^{n}\\dfrac{B_t-C_t}{(1+i)^t}$  — accept if $NPV>0$",
      "",
      "**Benefit–cost ratio**: $BCR=\\dfrac{\\text{PW of benefits}}{\\text{PW of costs}}$ — viable if $BCR>1$",
      "",
      "**Polluter-pays principle**: the polluter bears the cost of pollution prevention and control.",
    ].join("\n"),
    traps: [
      "**Negative externality ≠ opportunity cost.** An externality falls on a *third party*, not the decision-maker.",
      "**Discounting reduces future values.** A higher discount rate makes future environmental benefits look smaller.",
      "**BCR > 1 and NPV > 0** are equivalent acceptance criteria for a single project.",
    ],
  },
  questions: [
    {
      id: "es-econ-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "Pollution damage imposed on people who are not party to a transaction is an example of a:",
      options: ["Negative externality", "Opportunity cost", "Sunk cost", "Transfer payment"], answer: 0,
      solution: { given: "External, uncompensated cost on third parties.", derivation: "This is a negative externality the polluter-pays principle internalises.", target: "Correct option: Negative externality." },
    },
    {
      id: "es-econ-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "An abatement benefit of ₹1,00,000 is expected after 5 years. At a discount rate of 10%, its present worth (₹) is _____.",
      natAnswer: 62092, acceptedRange: [61900, 62300],
      solution: { given: "$F=100000,\\ i=0.10,\\ n=5$.", derivation: "$$PW=\\dfrac{100000}{(1.10)^5}=\\dfrac{100000}{1.6105}=62092$$", target: "≈ ₹62,092." },
    },
    {
      id: "es-econ-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "Taking precautionary action against a potentially serious, irreversible impact even without full scientific certainty reflects the:",
      options: ["Precautionary principle", "Polluter-pays principle", "Principle of intergenerational equity", "Coase theorem"], answer: 0,
      solution: { given: "Action under uncertainty for serious/irreversible harm.", derivation: "This is the precautionary principle (Rio Declaration, Principle 15).", target: "Correct option: Precautionary principle." },
    },
  ],
};

const esEMS: LearnTopic = {
  slug: "es-mg-ems",
  subject: "Environmental Management & Ethics",
  title: "EMS, ISO 14000 & Sustainability",
  tier: "free",
  blurb:
    "Environmental management systems, the ISO 14001 PDCA cycle, carrying capacity and sustainable development.",
  module: {
    principle:
      "An **Environmental Management System (EMS)** is the part of an organisation's management that develops, implements and reviews its environmental policy. **ISO 14001** is the international EMS standard, built on the **Plan–Do–Check–Act (PDCA)** continual-improvement loop. **Sustainable development** (Brundtland, 1987) meets present needs *without compromising the ability of future generations to meet theirs* — balancing the environmental, economic and social pillars within the system's **carrying capacity**.",
    formulaMatrix: [
      "**PDCA cycle**: Plan (policy & objectives) → Do (implement) → Check (monitor/audit) → Act (review & improve).",
      "",
      "**Carrying capacity utilisation**: $U=\\dfrac{\\text{present load}}{\\text{carrying capacity}}\\times100\\%$",
      "",
      "**Three pillars of sustainability**: environmental, economic, social.",
      "",
      "**Life-Cycle Assessment (LCA)**: cradle-to-grave accounting of inputs, outputs and impacts.",
    ].join("\n"),
    traps: [
      "**ISO 14001 follows PDCA**, not DMAIC (that is Six Sigma) or 3R (waste hierarchy).",
      "**Sustainability is about future generations**, not maximising present output.",
      "**Carrying capacity** is a *limit*; utilisation above 100 % is overshoot.",
    ],
  },
  questions: [
    {
      id: "es-ems-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The continual-improvement framework underpinning an ISO 14001 EMS is:",
      options: ["Plan–Do–Check–Act (PDCA)", "Reduce–Reuse–Recycle", "Define–Measure–Analyse", "SWOT"], answer: 0,
      solution: { given: "ISO 14001 EMS structure.", derivation: "ISO 14001 is built on the PDCA continual-improvement loop.", target: "Correct option: Plan–Do–Check–Act." },
    },
    {
      id: "es-ems-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A region has a carrying capacity of 2,00,000 people and a present population of 1,50,000. The carrying-capacity utilisation is _____ %.",
      natAnswer: 75, acceptedRange: [74.5, 75.5],
      solution: { given: "Load = 150000, capacity = 200000.", derivation: "$$U=\\dfrac{150000}{200000}\\times100=75\\%$$", target: "75 %." },
    },
    {
      id: "es-ems-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "The Brundtland Commission's definition of sustainable development emphasises meeting present needs without compromising:",
      options: ["the ability of future generations to meet their own needs", "short-term industrial output", "current consumption levels", "national GDP growth"], answer: 0,
      solution: { given: "Brundtland Report, 1987.", derivation: "Sustainable development = intergenerational equity.", target: "Correct option: future generations' needs." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 2 — Environmental Chemistry                                   */
/* ════════════════════════════════════════════════════════════════════ */

const esAcidBase: LearnTopic = {
  slug: "es-ch-acid-base",
  subject: "Environmental Chemistry",
  title: "Acid–Base Equilibria & pH",
  tier: "free",
  blurb:
    "pH, pOH, the ion product of water and buffering — the acid–base backbone of water-quality chemistry.",
  module: {
    principle:
      "**pH** measures the hydrogen-ion activity of a solution on a logarithmic scale. At 25 °C the **ion product of water** is $K_w=[\\text{H}^+][\\text{OH}^-]=10^{-14}$, so $\\text{pH}+\\text{pOH}=14$. Neutral water has pH 7; acids lower it, bases raise it. Because the scale is logarithmic, **each pH unit is a ten-fold change** in $[\\text{H}^+]$.",
    formulaMatrix: [
      "**pH**: $\\text{pH}=-\\log_{10}[\\text{H}^+]$",
      "",
      "**pOH**: $\\text{pOH}=-\\log_{10}[\\text{OH}^-]$",
      "",
      "**Water relation (25 °C)**: $\\text{pH}+\\text{pOH}=14$",
      "",
      "**Ten-fold rule**: $\\Delta\\text{pH}=1\\Rightarrow$ $[\\text{H}^+]$ changes by a factor of 10.",
    ].join("\n"),
    traps: [
      "**pH 7 is neutral only at 25 °C.** $K_w$ rises with temperature, shifting neutral pH below 7.",
      "**A change of 2 pH units is 100×**, not 2×, in hydrogen-ion concentration.",
      "**pH + pOH = 14** holds at 25 °C only.",
    ],
  },
  questions: [
    {
      id: "es-ab-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "The hydrogen-ion concentration of a sample is $1\\times10^{-5}\\,\\text{mol/L}$. Its pH is _____.",
      natAnswer: 5, acceptedRange: [4.98, 5.02],
      solution: { given: "$[\\text{H}^+]=10^{-5}$.", derivation: "$$\\text{pH}=-\\log(10^{-5})=5$$", target: "pH = 5." },
    },
    {
      id: "es-ab-q2", difficulty: "medium", marks: 1, type: "NAT",
      stem: "At 25 °C a solution has pOH = 4.2. Its pH is _____.",
      natAnswer: 9.8, acceptedRange: [9.78, 9.82],
      solution: { given: "$\\text{pH}+\\text{pOH}=14$.", derivation: "$$\\text{pH}=14-4.2=9.8$$", target: "pH = 9.8." },
    },
    {
      id: "es-ab-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "If the pH of a water sample drops from 7 to 5, its hydrogen-ion concentration:",
      options: ["increases 100-fold", "doubles", "halves", "decreases 100-fold"], answer: 0,
      solution: { given: "ΔpH = 2, lower pH = more acidic.", derivation: "Each unit is ×10; two units lower ⇒ $10^2=100$× more $[\\text{H}^+]$.", target: "Correct option: increases 100-fold." },
    },
  ],
};

const esKinetics: LearnTopic = {
  slug: "es-ch-kinetics",
  subject: "Environmental Chemistry",
  title: "Reaction Kinetics & Decay",
  tier: "free",
  blurb:
    "First-order decay, half-life and rate constants — the kinetics behind BOD, disinfection and pollutant persistence.",
  module: {
    principle:
      "Most environmental decay processes (BOD exertion, radioactive decay, chlorine die-away, contaminant degradation) follow **first-order kinetics**: the rate is proportional to the amount present, giving an **exponential decline**. The **half-life** — the time to fall to one-half — is constant and independent of the starting concentration.",
    formulaMatrix: [
      "**First-order decay**: $C=C_0\\,e^{-kt}$",
      "",
      "**Rate law**: $-\\dfrac{dC}{dt}=kC$",
      "",
      "**Half-life**: $t_{1/2}=\\dfrac{\\ln 2}{k}=\\dfrac{0.693}{k}$",
      "",
      "**Rate constant from half-life**: $k=\\dfrac{0.693}{t_{1/2}}$",
    ].join("\n"),
    traps: [
      "**Half-life is independent of $C_0$** for first-order reactions only.",
      "**Use natural log (ln)**, not log₁₀, in $C=C_0e^{-kt}$.",
      "**k carries units of time⁻¹** (e.g. d⁻¹); keep time units consistent.",
    ],
  },
  questions: [
    {
      id: "es-kin-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A first-order reaction has a rate constant $k=0.231\\,\\text{d}^{-1}$. Its half-life is _____ days.",
      natAnswer: 3, acceptedRange: [2.95, 3.05],
      solution: { given: "$k=0.231\\,\\text{d}^{-1}$.", derivation: "$$t_{1/2}=\\dfrac{0.693}{0.231}=3.0\\,\\text{d}$$", target: "≈ 3 days." },
    },
    {
      id: "es-kin-q2", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A pollutant decays first-order with $k=0.2\\,\\text{d}^{-1}$ from $C_0=100\\,\\text{mg/L}$. After 5 days the concentration is _____ mg/L.",
      natAnswer: 36.79, acceptedRange: [36.0, 37.5],
      solution: { given: "$C_0=100,\\ k=0.2,\\ t=5$.", derivation: "$$C=100\\,e^{-0.2\\times5}=100\\,e^{-1}=36.8$$", target: "≈ 36.8 mg/L." },
    },
    {
      id: "es-kin-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "For a first-order reaction, the time required for the concentration to fall to one-quarter of its initial value equals:",
      options: ["two half-lives", "one half-life", "four half-lives", "ln 4 half-lives"], answer: 0,
      solution: { given: "Quarter = (1/2)².", derivation: "$\\tfrac14=\\left(\\tfrac12\\right)^2$ ⇒ two successive half-lives.", target: "Correct option: two half-lives." },
    },
  ],
};

const esWaterQuality: LearnTopic = {
  slug: "es-ch-water-quality",
  subject: "Environmental Chemistry",
  title: "Hardness, Alkalinity & the Carbonate System",
  tier: "free",
  blurb:
    "Total hardness as CaCO₃, alkalinity end-points and carbonate equilibria — the inorganic chemistry of natural waters.",
  module: {
    principle:
      "**Hardness** is caused mainly by $\\text{Ca}^{2+}$ and $\\text{Mg}^{2+}$ and is expressed as an equivalent concentration of $\\text{CaCO}_3$. **Alkalinity** is the acid-neutralising capacity, contributed by $\\text{HCO}_3^-$, $\\text{CO}_3^{2-}$ and $\\text{OH}^-$. In the pH range of most natural waters (≈ 6.3–10.3) the **carbonate system is dominated by bicarbonate**.",
    formulaMatrix: [
      "**Ion as CaCO₃**: $\\text{mg/L as CaCO}_3=\\text{mg/L of ion}\\times\\dfrac{50}{\\text{equivalent weight}}$",
      "",
      "**Equivalent weights**: Ca = 20, Mg = 12.15, CaCO₃ = 50.",
      "",
      "**Total hardness** $=$ (Ca as CaCO₃) $+$ (Mg as CaCO₃).",
      "",
      "**Alkalinity** $=$ acid-neutralising capacity (mainly $\\text{HCO}_3^-$ between pH 6.3–10.3).",
    ].join("\n"),
    traps: [
      "**Always convert each ion to CaCO₃ equivalents** before summing hardness.",
      "**Alkalinity neutralises acid**, not base.",
      "**Bicarbonate dominates** the carbonate system in typical natural waters, not carbonate or hydroxide.",
    ],
  },
  questions: [
    {
      id: "es-wq-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "Water contains 40 mg/L Ca²⁺ and 12.15 mg/L Mg²⁺. The total hardness as CaCO₃ (eq. wt Ca = 20, Mg = 12.15, CaCO₃ = 50) is _____ mg/L.",
      natAnswer: 150, acceptedRange: [148, 152],
      solution: { given: "Ca = 40, Mg = 12.15 mg/L.", derivation: "$$40\\times\\dfrac{50}{20}+12.15\\times\\dfrac{50}{12.15}=100+50=150$$", target: "150 mg/L as CaCO₃." },
    },
    {
      id: "es-wq-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "Alkalinity of a natural water is a measure of its capacity to:",
      options: ["neutralise acid", "neutralise base", "conduct electricity", "absorb oxygen"], answer: 0,
      solution: { given: "Alkalinity = acid-neutralising capacity.", derivation: "Carbonate/bicarbonate/hydroxide species buffer added acid.", target: "Correct option: neutralise acid." },
    },
    {
      id: "es-wq-q3", difficulty: "hard", marks: 1, type: "MCQ",
      stem: "In the pH range 6.3–10.3 of most natural waters, alkalinity is predominantly due to:",
      options: ["bicarbonate (HCO₃⁻)", "hydroxide (OH⁻)", "dissolved CO₂", "carbonate only (CO₃²⁻)"], answer: 0,
      solution: { given: "Carbonate-system speciation vs pH.", derivation: "Between pK₁ (6.3) and pK₂ (10.3), HCO₃⁻ is the dominant species.", target: "Correct option: bicarbonate." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 3 — Environmental Microbiology                                */
/* ════════════════════════════════════════════════════════════════════ */

const esMicrobeGrowth: LearnTopic = {
  slug: "es-mb-growth",
  subject: "Environmental Microbiology",
  title: "Microbial Growth Kinetics",
  tier: "free",
  blurb:
    "Exponential growth, generation time and the Monod model — the microbiology that drives biological treatment.",
  module: {
    principle:
      "Under unlimited substrate, microbial populations grow **exponentially**: the number doubles every **generation (doubling) time**. When substrate limits growth, the specific growth rate follows the **Monod equation**, saturating at $\\mu_{max}$. The growth curve has **lag, exponential (log), stationary and death** phases.",
    formulaMatrix: [
      "**Exponential growth**: $N=N_0\\,2^{\\,t/t_g}$  ($t_g$ = generation time)",
      "",
      "**Specific growth rate**: $\\mu=\\dfrac{\\ln 2}{t_g}$",
      "",
      "**Monod model**: $\\mu=\\mu_{max}\\dfrac{S}{K_s+S}$  ($S$ = substrate, $K_s$ = half-saturation constant)",
      "",
      "**Phases**: lag → exponential (log) → stationary → death.",
    ].join("\n"),
    traps: [
      "**At $S=K_s$, $\\mu=\\mu_{max}/2$** — that is the definition of the half-saturation constant.",
      "**Generation time is constant** only during the exponential phase.",
      "**Use base-2 for doublings** but base-e for the specific growth rate.",
    ],
  },
  questions: [
    {
      id: "es-mg-q1", difficulty: "basic", marks: 1, type: "NAT",
      stem: "A bacterial culture has a generation (doubling) time of 30 min. Starting from one cell, after 3 hours the number of cells is _____.",
      natAnswer: 64, acceptedRange: [63, 65],
      solution: { given: "$t_g=0.5\\,\\text{h},\\ t=3\\,\\text{h}$.", derivation: "$$N=2^{3/0.5}=2^6=64$$", target: "64 cells." },
    },
    {
      id: "es-mg-q2", difficulty: "medium", marks: 2, type: "MCQ",
      stem: "In the Monod equation, when the substrate concentration $S$ equals the half-saturation constant $K_s$, the specific growth rate $\\mu$ is:",
      options: ["$\\mu_{max}/2$", "$\\mu_{max}$", "$2\\mu_{max}$", "zero"], answer: 0,
      solution: { given: "$\\mu=\\mu_{max}\\dfrac{S}{K_s+S}$, set $S=K_s$.", derivation: "$$\\mu=\\mu_{max}\\dfrac{K_s}{2K_s}=\\dfrac{\\mu_{max}}{2}$$", target: "Correct option: $\\mu_{max}/2$." },
    },
    {
      id: "es-mg-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "The phase of the bacterial growth curve in which the death rate balances the growth rate, giving a constant viable population, is the:",
      options: ["stationary phase", "lag phase", "log phase", "decline phase"], answer: 0,
      solution: { given: "Growth-curve phases.", derivation: "When nutrients deplete, growth and death balance — the stationary phase.", target: "Correct option: stationary phase." },
    },
  ],
};

const esIndicatorOrganisms: LearnTopic = {
  slug: "es-mb-indicators",
  subject: "Environmental Microbiology",
  title: "Indicator Organisms & Pathogens",
  tier: "free",
  blurb:
    "Coliforms, MPN and faecal indicators — how microbiological water safety is assessed.",
  module: {
    principle:
      "Direct testing for every waterborne pathogen is impractical, so **indicator organisms** signal faecal contamination. **Total** and **faecal (thermotolerant) coliforms**, especially *Escherichia coli*, are the classic indicators: abundant in faeces, easily detected, and non-pathogenic themselves. Counts are reported as the **Most Probable Number (MPN)** per 100 mL. Drinking water must contain **zero** *E. coli* per 100 mL.",
    formulaMatrix: [
      "**Indicator criteria**: present whenever pathogens are, abundant in faeces, easily measured, survives like pathogens, non-pathogenic.",
      "",
      "**Reporting unit**: MPN (Most Probable Number) per 100 mL.",
      "",
      "**Drinking-water standard**: 0 *E. coli* / 100 mL (must be absent).",
      "",
      "**Faecal coliform** tests incubate at 44.5 °C (thermotolerant).",
    ].join("\n"),
    traps: [
      "**The indicator is non-pathogenic** — it flags risk, it is not the disease agent.",
      "**MPN is a statistical estimate**, not a direct plate count.",
      "***E. coli* is the most specific** faecal indicator; total coliforms include environmental species.",
    ],
  },
  questions: [
    {
      id: "es-io-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The most widely used indicator organism for faecal contamination of drinking water is:",
      options: ["Escherichia coli", "Bacillus subtilis", "Nitrosomonas", "Saccharomyces cerevisiae"], answer: 0,
      solution: { given: "Faecal indicator criteria.", derivation: "E. coli is abundant in faeces, easily detected and non-pathogenic — the standard indicator.", target: "Correct option: Escherichia coli." },
    },
    {
      id: "es-io-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "Microbiological water-quality results for coliforms are commonly expressed as:",
      options: ["MPN per 100 mL", "mg/L", "NTU", "dB(A)"], answer: 0,
      solution: { given: "Coliform enumeration.", derivation: "The Most Probable Number (MPN) per 100 mL is the standard reporting unit.", target: "Correct option: MPN per 100 mL." },
    },
    {
      id: "es-io-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "Which property disqualifies an organism from being a good faecal indicator?",
      options: ["It is itself strongly pathogenic", "It is abundant in faeces", "It is easily detected", "It survives like the pathogens"], answer: 0,
      solution: { given: "Ideal indicator must be non-pathogenic.", derivation: "A good indicator flags risk without being the disease agent itself.", target: "Correct option: it is itself strongly pathogenic." },
    },
  ],
};

const esBiogeochemical: LearnTopic = {
  slug: "es-mb-nitrogen-cycle",
  subject: "Environmental Microbiology",
  title: "Nitrogen Cycle & Biological N-Removal",
  tier: "free",
  blurb:
    "Nitrification, denitrification and the microbial nitrogen transformations exploited in wastewater treatment.",
  module: {
    principle:
      "Microorganisms drive the **nitrogen cycle**. **Nitrification** is the aerobic, autotrophic oxidation of ammonia → nitrite (*Nitrosomonas*) → nitrate (*Nitrobacter*); it consumes oxygen and alkalinity. **Denitrification** is the anoxic reduction of nitrate to nitrogen gas by heterotrophs, recovering some alkalinity. Engineered nutrient removal sequences these two steps.",
    formulaMatrix: [
      "**Nitrification**: $\\text{NH}_4^+\\xrightarrow{Nitrosomonas}\\text{NO}_2^-\\xrightarrow{Nitrobacter}\\text{NO}_3^-$ (aerobic, autotrophic).",
      "",
      "**Oxygen demand**: ≈ 4.57 g O₂ per g of NH₄⁺-N oxidised to nitrate.",
      "",
      "**Alkalinity consumed**: ≈ 7.14 g as CaCO₃ per g N nitrified.",
      "",
      "**Denitrification**: $\\text{NO}_3^-\\to\\text{N}_2$ (anoxic, heterotrophic) — recovers ≈ 3.57 g alkalinity/g N.",
    ].join("\n"),
    traps: [
      "**Nitrifiers are autotrophs** (use CO₂ as carbon source) and slow-growing — they govern sludge age.",
      "**Nitrification consumes alkalinity**; denitrification recovers about half of it.",
      "**Denitrification needs anoxic (not anaerobic) conditions** and an organic carbon source.",
    ],
  },
  questions: [
    {
      id: "es-bg-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "Nitrification is the microbial conversion of:",
      options: ["ammonia to nitrate", "nitrate to nitrogen gas", "nitrogen gas to ammonia", "organic N to ammonia"], answer: 0,
      solution: { given: "Nitrogen-cycle steps.", derivation: "Nitrification = NH₄⁺ → NO₂⁻ → NO₃⁻ (aerobic, autotrophic).", target: "Correct option: ammonia to nitrate." },
    },
    {
      id: "es-bg-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "Denitrification, which removes nitrogen as N₂ gas, requires:",
      options: ["anoxic conditions and an organic carbon source", "aerobic conditions only", "high light intensity", "an autotrophic ammonia source"], answer: 0,
      solution: { given: "Denitrification environment.", derivation: "Heterotrophs reduce NO₃⁻ to N₂ under anoxic conditions using organic carbon.", target: "Correct option: anoxic + organic carbon." },
    },
    {
      id: "es-bg-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "Compared with heterotrophs, nitrifying bacteria in an activated-sludge plant are:",
      options: ["slow-growing autotrophs that need a long sludge age", "fast-growing heterotrophs", "obligate anaerobes", "photosynthetic"], answer: 0,
      solution: { given: "Nitrifier physiology.", derivation: "Nitrosomonas/Nitrobacter are slow autotrophs, so adequate solids retention time (sludge age) is essential.", target: "Correct option: slow-growing autotrophs needing long sludge age." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 4 — Ecology & Biodiversity                                    */
/* ════════════════════════════════════════════════════════════════════ */

const esEcosystems: LearnTopic = {
  slug: "es-ec-ecosystems",
  subject: "Ecology & Biodiversity",
  title: "Ecosystems & Energy Flow",
  tier: "free",
  blurb:
    "Trophic levels, the 10 % rule and ecological pyramids — how energy and matter move through ecosystems.",
  module: {
    principle:
      "Energy enters an ecosystem through **primary producers** and flows one-way through **trophic levels** (producer → herbivore → carnivore). By **Lindeman's 10 % law**, only about one-tenth of the energy at one level is passed to the next; the rest is lost as **respiration heat**. This limits food chains to a few links and makes the **pyramid of energy always upright**.",
    formulaMatrix: [
      "**Ten-percent law**: energy to next level $\\approx 10\\%$ of the present level.",
      "",
      "**Trophic levels**: T1 producers → T2 primary consumers → T3 secondary consumers → …",
      "",
      "**Gross vs net primary productivity**: $NPP=GPP-\\text{respiration}$.",
      "",
      "**Pyramid of energy** is always upright; pyramids of number/biomass can invert.",
    ].join("\n"),
    traps: [
      "**Energy flow is one-way**; only nutrients cycle.",
      "**The energy pyramid is never inverted**, unlike number/biomass pyramids.",
      "**NPP = GPP − respiration**, the energy actually available to consumers.",
    ],
  },
  questions: [
    {
      id: "es-es-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "If primary producers fix 10,000 kJ/m² of energy, the energy available to secondary consumers (third trophic level) under the 10 % law is _____ kJ/m².",
      natAnswer: 100, acceptedRange: [99, 101],
      solution: { given: "Producers = 10000 kJ/m².", derivation: "$$10000\\times0.1\\times0.1=100\\,\\text{kJ/m}^2$$", target: "100 kJ/m²." },
    },
    {
      id: "es-es-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "Net primary productivity (NPP) equals:",
      options: ["GPP − respiration", "GPP + respiration", "respiration − GPP", "GPP × respiration"], answer: 0,
      solution: { given: "Productivity definitions.", derivation: "NPP is the energy left after producers' own respiration.", target: "Correct option: GPP − respiration." },
    },
    {
      id: "es-es-q3", difficulty: "hard", marks: 1, type: "MCQ",
      stem: "Which ecological pyramid is always upright?",
      options: ["Pyramid of energy", "Pyramid of numbers", "Pyramid of biomass", "All can invert"], answer: 0,
      solution: { given: "Pyramid types.", derivation: "Because energy is lost at each transfer, the energy pyramid is always upright.", target: "Correct option: pyramid of energy." },
    },
  ],
};

const esPopulation: LearnTopic = {
  slug: "es-ec-population",
  subject: "Ecology & Biodiversity",
  title: "Population Dynamics",
  tier: "free",
  blurb:
    "Exponential vs logistic growth, carrying capacity and the growth-rate curve.",
  module: {
    principle:
      "With unlimited resources a population grows **exponentially** ($J$-curve). Real environments impose a **carrying capacity (K)**, producing **logistic** ($S$-shaped) growth: the rate rises, peaks at $K/2$, then falls to zero at $K$. The logistic model captures **density-dependent** limitation through the $(1-N/K)$ term.",
    formulaMatrix: [
      "**Exponential growth**: $\\dfrac{dN}{dt}=rN$",
      "",
      "**Logistic growth**: $\\dfrac{dN}{dt}=rN\\left(1-\\dfrac{N}{K}\\right)$",
      "",
      "**Maximum growth rate** occurs at $N=K/2$.",
      "",
      "**Intrinsic rate**: $r=b-d$ (birth rate − death rate).",
    ].join("\n"),
    traps: [
      "**Maximum growth rate is at K/2**, not at K (where it is zero).",
      "**The $(1-N/K)$ factor** makes growth density-dependent.",
      "**At N = K the population is stable** (dN/dt = 0), not declining.",
    ],
  },
  questions: [
    {
      id: "es-pop-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "For logistic growth with carrying capacity K = 1000, the population size at which the growth rate dN/dt is maximum is _____.",
      natAnswer: 500, acceptedRange: [499, 501],
      solution: { given: "Logistic model.", derivation: "Maximum $dN/dt$ at $N=K/2=1000/2=500$.", target: "N = 500." },
    },
    {
      id: "es-pop-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The S-shaped curve characteristic of population growth with a finite carrying capacity is the:",
      options: ["logistic curve", "exponential curve", "J-curve", "survivorship curve"], answer: 0,
      solution: { given: "Growth models.", derivation: "Resource-limited growth gives the sigmoid (logistic) curve.", target: "Correct option: logistic curve." },
    },
    {
      id: "es-pop-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "In the logistic equation, the term $(1-N/K)$ represents:",
      options: ["density-dependent environmental resistance", "the intrinsic growth rate", "immigration", "the doubling time"], answer: 0,
      solution: { given: "$\\dfrac{dN}{dt}=rN(1-N/K)$.", derivation: "As N approaches K, $(1-N/K)$ shrinks, slowing growth — environmental resistance.", target: "Correct option: density-dependent resistance." },
    },
  ],
};

const esBiodiversity: LearnTopic = {
  slug: "es-ec-biodiversity",
  subject: "Ecology & Biodiversity",
  title: "Biodiversity & Conservation",
  tier: "free",
  blurb:
    "Species diversity indices, hotspots and in-situ vs ex-situ conservation strategies.",
  module: {
    principle:
      "**Biodiversity** spans genetic, species and ecosystem levels. **Species diversity** combines *richness* (number of species) and *evenness* (relative abundances), captured by indices such as **Shannon–Wiener (H)** and **Simpson's**. Conservation is **in-situ** (protecting species in their habitat — national parks, sanctuaries, biosphere reserves) or **ex-situ** (zoos, seed/gene banks). **Biodiversity hotspots** are biologically rich, highly threatened regions.",
    formulaMatrix: [
      "**Shannon–Wiener index**: $H=-\\sum_{i} p_i\\ln p_i$  ($p_i$ = proportion of species $i$)",
      "",
      "**Simpson's index**: $D=1-\\sum p_i^2$",
      "",
      "**In-situ**: national parks, wildlife sanctuaries, biosphere reserves.",
      "",
      "**Ex-situ**: zoos, botanical gardens, gene/seed banks, cryopreservation.",
    ].join("\n"),
    traps: [
      "**Higher H means greater diversity** (richness *and* evenness).",
      "**In-situ ≠ ex-situ.** In-situ protects within the natural habitat; ex-situ removes organisms from it.",
      "**A hotspot must be both species-rich and threatened**, not merely diverse.",
    ],
  },
  questions: [
    {
      id: "es-bd-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A community has two species in equal proportions ($p_1=p_2=0.5$). Its Shannon–Wiener index H (using ln) is _____.",
      natAnswer: 0.693, acceptedRange: [0.68, 0.70],
      solution: { given: "$p_1=p_2=0.5$.", derivation: "$$H=-(0.5\\ln0.5+0.5\\ln0.5)=-\\ln0.5=0.693$$", target: "H ≈ 0.693." },
    },
    {
      id: "es-bd-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "Conservation of a species in its natural habitat (e.g. a national park) is termed:",
      options: ["in-situ conservation", "ex-situ conservation", "cryopreservation", "captive breeding"], answer: 0,
      solution: { given: "Conservation strategies.", derivation: "Protecting species within their habitat is in-situ conservation.", target: "Correct option: in-situ conservation." },
    },
    {
      id: "es-bd-q3", difficulty: "hard", marks: 1, type: "MCQ",
      stem: "To qualify as a biodiversity hotspot, a region must be:",
      options: ["species-rich (high endemism) and highly threatened", "species-rich only", "threatened only", "large in area"], answer: 0,
      solution: { given: "Hotspot criteria (Myers).", derivation: "A hotspot has exceptional endemism and has lost most of its primary habitat.", target: "Correct option: rich in endemics and threatened." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 5 — Air & Noise Pollution                                     */
/* ════════════════════════════════════════════════════════════════════ */

const esDispersion: LearnTopic = {
  slug: "es-ap-dispersion",
  subject: "Air & Noise Pollution",
  title: "Atmospheric Dispersion & Stack Plumes",
  tier: "free",
  blurb:
    "Effective stack height, lapse rates, stability classes and the Gaussian plume — predicting ground-level pollutant concentrations.",
  module: {
    principle:
      "Pollutants released from a stack disperse by advection (wind) and turbulent diffusion. The **effective stack height** $H$ is the physical height plus **plume rise**. The **Gaussian plume model** predicts concentration assuming normal spreading in the horizontal and vertical. Atmospheric **stability** — set by comparing the **environmental lapse rate (ELR)** with the **dry adiabatic lapse rate (DALR ≈ 9.8 °C/km)** — controls plume shape (looping, coning, fanning).",
    formulaMatrix: [
      "**Ground-level concentration (plume centreline, Gaussian)**: $C=\\dfrac{Q}{\\pi u\\,\\sigma_y\\sigma_z}\\exp\\!\\left(-\\dfrac{H^2}{2\\sigma_z^2}\\right)$",
      "",
      "**Maximum GLC** $\\propto \\dfrac{Q}{u\\,H^2}$ — doubling H quarters the peak concentration.",
      "",
      "**Lapse-rate stability**: ELR > DALR ⇒ unstable (superadiabatic); ELR < DALR ⇒ stable; inversion ⇒ very stable.",
      "",
      "**DALR** ≈ 9.8 °C/km (≈ 1 °C per 100 m).",
    ].join("\n"),
    traps: [
      "**Ground-level concentration ∝ 1/H².** Taller stacks cut peaks sharply.",
      "**Inversion (temperature rising with height) traps pollutants** — worst dispersion.",
      "**Effective height = physical height + plume rise**, not just the chimney height.",
    ],
  },
  questions: [
    {
      id: "es-dp-q1", difficulty: "medium", marks: 2, type: "MCQ",
      stem: "If the effective stack height is doubled (all else constant), the maximum ground-level concentration becomes approximately:",
      options: ["one-quarter", "one-half", "double", "unchanged"], answer: 0,
      solution: { given: "Max GLC ∝ Q/(u H²).", derivation: "Doubling H multiplies H² by 4, so GLC falls to 1/4.", target: "Correct option: one-quarter." },
    },
    {
      id: "es-dp-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "A temperature inversion in the atmosphere produces conditions that are:",
      options: ["very stable, trapping pollutants near the ground", "very unstable, dispersing pollutants rapidly", "neutral", "always turbulent"], answer: 0,
      solution: { given: "Inversion = temperature rises with height.", derivation: "Stable stratification suppresses vertical mixing, trapping pollutants.", target: "Correct option: very stable, trapping pollutants." },
    },
    {
      id: "es-dp-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "The atmosphere is classified as unstable (superadiabatic) when the environmental lapse rate is:",
      options: ["greater than the dry adiabatic lapse rate", "equal to the DALR", "less than the DALR", "zero"], answer: 0,
      solution: { given: "ELR vs DALR.", derivation: "ELR > DALR ⇒ a rising parcel stays warmer/buoyant ⇒ unstable.", target: "Correct option: ELR greater than DALR." },
    },
  ],
};

const esAirControl: LearnTopic = {
  slug: "es-ap-control",
  subject: "Air & Noise Pollution",
  title: "Particulate Control Devices",
  tier: "free",
  blurb:
    "Cyclones, electrostatic precipitators, fabric filters and the Deutsch–Anderson efficiency model.",
  module: {
    principle:
      "Particulates are removed by **gravity settling, cyclonic (centrifugal) separation, fabric filtration (bag-houses), wet scrubbing and electrostatic precipitation (ESP)**. ESPs charge particles and collect them on plates; their efficiency follows the **Deutsch–Anderson equation**. Cyclones are cheap but poor for fine particles; ESPs and bag-houses achieve > 99 % on fine dust.",
    formulaMatrix: [
      "**Deutsch–Anderson (ESP)**: $\\eta=1-e^{-wA/Q}$  ($w$ = drift velocity, $A$ = collection area, $Q$ = gas flow)",
      "",
      "**Cyclone cut size** $d_{50}$: the particle diameter collected at 50 % efficiency.",
      "",
      "**Selection by size**: cyclones for coarse (> 10 µm); ESP/bag-house for fine (< 1 µm).",
      "",
      "**Settling velocity (Stokes)**: $v_s=\\dfrac{g\\,d^2(\\rho_p-\\rho)}{18\\mu}$.",
    ].join("\n"),
    traps: [
      "**ESP efficiency depends on A/Q (specific collection area)** — larger area or lower flow raises η.",
      "**Cyclones are inefficient for fine particles**; don't use them for PM₂.₅.",
      "**Drift velocity w**, not gas velocity, drives the Deutsch–Anderson equation.",
    ],
  },
  questions: [
    {
      id: "es-ac-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "An ESP has collection area A = 200 m², drift velocity w = 0.1 m/s and gas flow Q = 50 m³/s. By Deutsch–Anderson, its efficiency is _____ %.",
      natAnswer: 32.97, acceptedRange: [32, 34],
      solution: { given: "$w=0.1,\\ A=200,\\ Q=50$.", derivation: "$$\\eta=1-e^{-(0.1)(200)/50}=1-e^{-0.4}=0.330$$", target: "≈ 33 %." },
    },
    {
      id: "es-ac-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "Which control device is least effective for fine (sub-micron) particulate matter?",
      options: ["Cyclone separator", "Electrostatic precipitator", "Fabric (bag) filter", "Venturi scrubber"], answer: 0,
      solution: { given: "Device performance vs particle size.", derivation: "Centrifugal cyclones efficiently remove coarse particles only.", target: "Correct option: cyclone separator." },
    },
    {
      id: "es-ac-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "In the Deutsch–Anderson equation, ESP efficiency increases when:",
      options: ["the specific collection area A/Q increases", "the gas flow rate Q increases", "the drift velocity decreases", "the collection area decreases"], answer: 0,
      solution: { given: "$\\eta=1-e^{-wA/Q}$.", derivation: "Larger wA/Q (higher A/Q or w) raises the exponent magnitude, increasing η.", target: "Correct option: A/Q increases." },
    },
  ],
};

const esNoise: LearnTopic = {
  slug: "es-ap-noise",
  subject: "Air & Noise Pollution",
  title: "Noise Pollution & Decibel Addition",
  tier: "free",
  blurb:
    "Sound pressure level, logarithmic decibel addition, Leq and noise standards.",
  module: {
    principle:
      "Sound level is measured on the logarithmic **decibel (dB)** scale. Because dB is logarithmic, **levels do not add arithmetically**: two equal sources combine to give **+3 dB**, ten equal sources **+10 dB**. The **A-weighted** scale dB(A) approximates human hearing, and the **equivalent continuous level $L_{eq}$** represents fluctuating noise as a steady value of equal energy.",
    formulaMatrix: [
      "**Sound pressure level**: $L_p=20\\log_{10}\\dfrac{p}{p_0}$  ($p_0=20\\,\\mu\\text{Pa}$)",
      "",
      "**Decibel addition**: $L_{total}=10\\log_{10}\\sum_i 10^{L_i/10}$",
      "",
      "**Doubling rule**: two equal sources ⇒ +3 dB; ten equal ⇒ +10 dB.",
      "",
      "**Equivalent level**: $L_{eq}=10\\log_{10}\\!\\left(\\dfrac{1}{T}\\int 10^{L(t)/10}\\,dt\\right)$.",
    ].join("\n"),
    traps: [
      "**60 dB + 60 dB = 63 dB**, not 120 dB — add on an energy (logarithmic) basis.",
      "**dB(A) ≠ dB.** A-weighting de-emphasises low frequencies to match hearing.",
      "**Distance doubling in free field** drops a point source by 6 dB.",
    ],
  },
  questions: [
    {
      id: "es-no-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "Two machines each produce 70 dB at a point. Their combined sound level is _____ dB.",
      natAnswer: 73, acceptedRange: [72.8, 73.2],
      solution: { given: "Two equal 70 dB sources.", derivation: "$$L=10\\log(2\\times10^{7})=70+10\\log2=73\\,\\text{dB}$$", target: "73 dB." },
    },
    {
      id: "es-no-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The A-weighted decibel scale dB(A) is used because it:",
      options: ["approximates the frequency response of the human ear", "measures only low frequencies", "removes all weighting", "doubles the measured value"], answer: 0,
      solution: { given: "Weighting networks.", derivation: "A-weighting mimics the ear's reduced sensitivity to low frequencies.", target: "Correct option: approximates human hearing." },
    },
    {
      id: "es-no-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "Ten identical sources each emit 60 dB at a receiver. The combined level is _____ dB.",
      natAnswer: 70, acceptedRange: [69.8, 70.2],
      solution: { given: "Ten equal 60 dB sources.", derivation: "$$L=60+10\\log_{10}10=60+10=70\\,\\text{dB}$$", target: "70 dB." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 6 — Water & Wastewater Treatment                              */
/* ════════════════════════════════════════════════════════════════════ */

const esBOD: LearnTopic = {
  slug: "es-ww-bod",
  subject: "Water & Wastewater Treatment",
  title: "BOD, COD & Oxygen Demand",
  tier: "free",
  blurb:
    "First-order BOD kinetics, ultimate BOD and the BOD/COD relationship — quantifying organic pollution.",
  module: {
    principle:
      "**Biochemical Oxygen Demand (BOD)** is the oxygen consumed by microorganisms degrading organic matter; it is exerted as a **first-order** reaction approaching the **ultimate BOD ($L_0$)**. The standard test is **BOD₅ at 20 °C**. **COD** measures total chemically oxidisable matter and is always **≥ BOD**; the BOD/COD ratio indicates biodegradability.",
    formulaMatrix: [
      "**BOD exerted**: $\\text{BOD}_t=L_0\\left(1-e^{-k_d t}\\right)=L_0\\left(1-10^{-K t}\\right)$",
      "",
      "**Remaining (ultimate) demand**: $L_t=L_0\\,e^{-k_d t}$",
      "",
      "**Rate constants**: $k_d=2.303\\,K$ (base-e vs base-10).",
      "",
      "**Biodegradability**: BOD ≤ COD; high BOD/COD ⇒ readily biodegradable.",
    ].join("\n"),
    traps: [
      "**BOD₅ is not the ultimate BOD.** At $k_d=0.23\\,\\text{d}^{-1}$, BOD₅ ≈ 0.68 $L_0$.",
      "**COD ≥ BOD always** — chemical oxidation captures more matter.",
      "**Watch the rate-constant base**: $k_d$ (ln) vs $K$ (log₁₀) differ by 2.303.",
    ],
  },
  questions: [
    {
      id: "es-bod-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A wastewater has ultimate BOD $L_0=300\\,\\text{mg/L}$ and $k_d=0.23\\,\\text{d}^{-1}$. The 5-day BOD is _____ mg/L.",
      natAnswer: 205, acceptedRange: [202, 208],
      solution: { given: "$L_0=300,\\ k_d=0.23,\\ t=5$.", derivation: "$$\\text{BOD}_5=300(1-e^{-0.23\\times5})=300(1-0.3166)=205$$", target: "≈ 205 mg/L." },
    },
    {
      id: "es-bod-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "For the same wastewater, which relationship is always true?",
      options: ["COD ≥ BOD", "BOD ≥ COD", "COD = BOD", "COD = 5 × BOD"], answer: 0,
      solution: { given: "COD oxidises more than biology alone.", derivation: "Chemical oxidation captures non-biodegradable matter too, so COD ≥ BOD.", target: "Correct option: COD ≥ BOD." },
    },
    {
      id: "es-bod-q3", difficulty: "hard", marks: 2, type: "NAT",
      stem: "With $k_d=0.23\\,\\text{d}^{-1}$ the fraction of ultimate BOD exerted in 5 days (BOD₅/L₀) is _____.",
      natAnswer: 0.684, acceptedRange: [0.67, 0.70],
      solution: { given: "$k_d=0.23,\\ t=5$.", derivation: "$$\\dfrac{\\text{BOD}_5}{L_0}=1-e^{-1.15}=1-0.3166=0.684$$", target: "≈ 0.68." },
    },
  ],
};

const esSedimentation: LearnTopic = {
  slug: "es-ww-sedimentation",
  subject: "Water & Wastewater Treatment",
  title: "Sedimentation & Overflow Rate",
  tier: "free",
  blurb:
    "Surface overflow rate, settling velocity and removal efficiency in primary clarifiers.",
  module: {
    principle:
      "In an **ideal settling tank**, a particle is removed if its **settling velocity exceeds the surface overflow rate (SOR)** — the design flow divided by the plan (surface) area. Remarkably, ideal removal depends on **surface area, not depth**. Discrete particles settle by **Stokes' law**; the **detention time** sizes the tank volume.",
    formulaMatrix: [
      "**Surface overflow rate**: $v_o=\\dfrac{Q}{A_{surface}}$  (also the critical settling velocity)",
      "",
      "**Removal**: particles with $v_s\\ge v_o$ are fully removed; partial removal $=v_s/v_o$.",
      "",
      "**Detention time**: $t=\\dfrac{V}{Q}=\\dfrac{A\\,H}{Q}$",
      "",
      "**Stokes settling velocity**: $v_s=\\dfrac{g\\,d^2(\\rho_p-\\rho)}{18\\mu}$.",
    ].join("\n"),
    traps: [
      "**Ideal removal depends on surface area, not depth.** A bigger footprint settles more.",
      "**SOR has velocity units** (m/s or m³/m²·s), despite the 'rate' name.",
      "**Stokes' law assumes laminar (small-particle) settling**; large particles deviate.",
    ],
  },
  questions: [
    {
      id: "es-sed-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "A clarifier treats Q = 4000 m³/day through a surface area of 200 m². Its surface overflow rate is _____ m³/m²·day.",
      natAnswer: 20, acceptedRange: [19.8, 20.2],
      solution: { given: "$Q=4000,\\ A=200$.", derivation: "$$v_o=\\dfrac{4000}{200}=20\\,\\text{m}^3/\\text{m}^2\\!\\cdot\\!\\text{day}$$", target: "20 m³/m²·day." },
    },
    {
      id: "es-sed-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "In an ideal horizontal-flow settling tank, the removal efficiency of discrete particles depends primarily on:",
      options: ["the surface (plan) area", "the tank depth", "the inlet velocity", "the water colour"], answer: 0,
      solution: { given: "Ideal settling theory.", derivation: "Removal is governed by surface overflow rate (Q/A), independent of depth.", target: "Correct option: surface area." },
    },
    {
      id: "es-sed-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "A discrete particle has settling velocity $v_s$ less than the overflow rate $v_o$. Its fractional removal in an ideal basin is:",
      options: ["$v_s/v_o$", "$1$", "$0$", "$v_o/v_s$"], answer: 0,
      solution: { given: "$v_s<v_o$.", derivation: "Such particles are removed only if they enter low enough; fraction removed = $v_s/v_o$.", target: "Correct option: $v_s/v_o$." },
    },
  ],
};

const esActivatedSludge: LearnTopic = {
  slug: "es-ww-activated-sludge",
  subject: "Water & Wastewater Treatment",
  title: "Activated Sludge & Biological Treatment",
  tier: "free",
  blurb:
    "F/M ratio, sludge age, MLSS and the aeration-tank design parameters of secondary treatment.",
  module: {
    principle:
      "The **activated-sludge process** uses a suspended microbial culture (MLSS) in an aerated tank to oxidise organic matter, followed by a clarifier that settles and recycles the biomass. Performance is governed by the **food-to-microorganism (F/M) ratio** and the **mean cell residence time (sludge age, $\\theta_c$)**. Low F/M / high sludge age gives high-quality, well-nitrified effluent.",
    formulaMatrix: [
      "**F/M ratio**: $\\dfrac{F}{M}=\\dfrac{Q\\,S_0}{V\\,X}$  ($S_0$ = influent BOD, $X$ = MLSS, $V$ = tank volume)",
      "",
      "**Sludge age (MCRT)**: $\\theta_c=\\dfrac{V X}{Q_w X_r + Q_e X_e}$",
      "",
      "**Hydraulic retention time**: $\\tau=\\dfrac{V}{Q}$",
      "",
      "**Recycle ratio**: $R=\\dfrac{Q_r}{Q}$, set by the MLSS and settled-sludge concentrations.",
    ].join("\n"),
    traps: [
      "**Low F/M ⇒ extended aeration**, more stable, better nitrification; high F/M ⇒ high-rate.",
      "**Sludge age, not HRT, controls which organisms survive** (slow nitrifiers need long θc).",
      "**MLSS (X) is mixed-liquor solids**, distinct from influent BOD.",
    ],
  },
  questions: [
    {
      id: "es-as-q1", difficulty: "hard", marks: 2, type: "NAT",
      stem: "An aeration tank has volume V = 1000 m³ and MLSS X = 2500 mg/L, treating Q = 5000 m³/day of wastewater with influent BOD S₀ = 200 mg/L. The F/M ratio (per day) is _____.",
      natAnswer: 0.4, acceptedRange: [0.39, 0.41],
      solution: { given: "$Q=5000,\\ S_0=200,\\ V=1000,\\ X=2500$.", derivation: "$$\\dfrac{F}{M}=\\dfrac{5000\\times200}{1000\\times2500}=\\dfrac{10^6}{2.5\\times10^6}=0.4$$", target: "F/M = 0.4 d⁻¹." },
    },
    {
      id: "es-as-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "In the activated-sludge process, the parameter that determines whether slow-growing nitrifiers are retained is the:",
      options: ["sludge age (mean cell residence time)", "influent temperature", "tank colour", "pipe diameter"], answer: 0,
      solution: { given: "Solids retention governs microbial selection.", derivation: "Long sludge age retains slow nitrifiers; short θc washes them out.", target: "Correct option: sludge age." },
    },
    {
      id: "es-as-q3", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "A very low F/M ratio in an activated-sludge plant corresponds to:",
      options: ["extended aeration with stable, well-oxidised sludge", "high-rate, under-loaded biomass", "septic anaerobic conditions", "no biological activity"], answer: 0,
      solution: { given: "F/M loading regimes.", derivation: "Low F/M = extended aeration: long detention, endogenous, well-nitrified.", target: "Correct option: extended aeration." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 7 — Solid & Hazardous Waste Management                        */
/* ════════════════════════════════════════════════════════════════════ */

const esMSW: LearnTopic = {
  slug: "es-sw-msw",
  subject: "Solid & Hazardous Waste Management",
  title: "MSW Characteristics & Calorific Value",
  tier: "free",
  blurb:
    "Moisture content, compaction, density and the Dulong calorific-value estimate for municipal solid waste.",
  module: {
    principle:
      "Designing MSW systems needs the waste's **physical composition, moisture content, density and energy content**. **Compaction** reduces volume for transport and landfilling; **calorific (heating) value** decides the feasibility of energy recovery and is estimated from the elemental composition by the **modified Dulong formula**.",
    formulaMatrix: [
      "**Moisture content (wet basis)**: $MC=\\dfrac{w_{wet}-w_{dry}}{w_{wet}}\\times100\\%$",
      "",
      "**Volume reduction by compaction**: $VR=\\left(1-\\dfrac{\\rho_{loose}}{\\rho_{compact}}\\right)\\times100\\%$",
      "",
      "**Modified Dulong HHV** (kJ/kg): $HHV=337C+1419\\!\\left(H-\\tfrac{O}{8}\\right)+93S$  (C,H,O,S as % mass)",
      "",
      "**Dry solids**: $w_{dry}=w_{wet}(1-MC)$.",
    ].join("\n"),
    traps: [
      "**Higher moisture lowers the net calorific value** (latent heat penalty).",
      "**Compaction ratio compares densities**, not volumes directly.",
      "**Use elemental %s in Dulong** — and the $(H-O/8)$ correction for bound oxygen.",
    ],
  },
  questions: [
    {
      id: "es-msw-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "1000 kg of wet MSW has a moisture content of 50 % (wet basis). The mass of dry solids is _____ kg.",
      natAnswer: 500, acceptedRange: [498, 502],
      solution: { given: "$w_{wet}=1000,\\ MC=0.5$.", derivation: "$$w_{dry}=1000(1-0.5)=500\\,\\text{kg}$$", target: "500 kg." },
    },
    {
      id: "es-msw-q2", difficulty: "hard", marks: 2, type: "NAT",
      stem: "Loose MSW density is 100 kg/m³ and compacted density is 500 kg/m³. The volume reduction achieved is _____ %.",
      natAnswer: 80, acceptedRange: [79.5, 80.5],
      solution: { given: "$\\rho_{loose}=100,\\ \\rho_{compact}=500$.", derivation: "$$VR=\\left(1-\\dfrac{100}{500}\\right)\\times100=80\\%$$", target: "80 %." },
    },
    {
      id: "es-msw-q3", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "Increasing the moisture content of municipal solid waste generally:",
      options: ["lowers its net calorific value", "raises its net calorific value", "has no effect on heating value", "removes the need for combustion air"], answer: 0,
      solution: { given: "Energy penalty of water.", derivation: "Latent heat to vaporise moisture reduces the net heating value.", target: "Correct option: lowers net calorific value." },
    },
  ],
};

const esLandfill: LearnTopic = {
  slug: "es-sw-landfill",
  subject: "Solid & Hazardous Waste Management",
  title: "Sanitary Landfills & Landfill Gas",
  tier: "free",
  blurb:
    "Landfill phases, leachate, gas generation and the engineered containment of municipal waste.",
  module: {
    principle:
      "A **sanitary landfill** isolates waste from the environment with a **liner, leachate collection, gas extraction and a final cover**. Buried waste decomposes through **aerobic → acidogenic → methanogenic** phases; the stable methanogenic phase generates **landfill gas (≈ 50 % CH₄, 50 % CO₂)**, a usable energy source and a greenhouse hazard. **Leachate** — contaminated liquid — must be collected and treated.",
    formulaMatrix: [
      "**Phases**: I aerobic → II acid (anaerobic) → III methanogenic → IV maturation.",
      "",
      "**Landfill gas**: roughly 50 % CH₄ + 50 % CO₂ (by volume) at the methanogenic phase.",
      "",
      "**Gas yield**: $V_{gas}=m_{decomposable}\\times \\text{yield (m}^3/\\text{kg)}$.",
      "",
      "**Liner + leachate collection**: prevents groundwater contamination.",
    ].join("\n"),
    traps: [
      "**Methane (~50 %) is the energy and explosion/GHG concern**, not CO₂.",
      "**Leachate is liquid**, landfill gas is the gaseous product — don't confuse them.",
      "**Methanogenesis is anaerobic** and follows the acid phase, not the first phase.",
    ],
  },
  questions: [
    {
      id: "es-lf-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "2000 kg of decomposable waste yields 0.15 m³ of landfill gas per kg. The total gas generated is _____ m³.",
      natAnswer: 300, acceptedRange: [298, 302],
      solution: { given: "$m=2000,\\ \\text{yield}=0.15$.", derivation: "$$V=2000\\times0.15=300\\,\\text{m}^3$$", target: "300 m³." },
    },
    {
      id: "es-lf-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The principal combustible component of landfill gas, valuable for energy recovery, is:",
      options: ["methane (CH₄)", "carbon dioxide (CO₂)", "nitrogen (N₂)", "hydrogen sulphide (H₂S)"], answer: 0,
      solution: { given: "Landfill gas ≈ 50 % CH₄ + 50 % CO₂.", derivation: "Methane is combustible and is the recoverable energy fraction.", target: "Correct option: methane." },
    },
    {
      id: "es-lf-q3", difficulty: "hard", marks: 1, type: "MCQ",
      stem: "Sustained generation of methane in a sanitary landfill occurs during the:",
      options: ["methanogenic (anaerobic) phase", "initial aerobic phase", "acidogenic phase", "final cover placement"], answer: 0,
      solution: { given: "Landfill decomposition phases.", derivation: "Methanogens dominate after the acid phase, producing steady CH₄.", target: "Correct option: methanogenic phase." },
    },
  ],
};

const esHazardous: LearnTopic = {
  slug: "es-sw-hazardous",
  subject: "Solid & Hazardous Waste Management",
  title: "Hazardous & Biomedical Waste",
  tier: "free",
  blurb:
    "Hazard characteristics, treatment hierarchy, incineration and colour-coded biomedical-waste segregation.",
  module: {
    principle:
      "**Hazardous waste** exhibits **ignitability, corrosivity, reactivity or toxicity** and demands special handling, treatment and secure disposal. The preferred hierarchy is **reduce → recycle → treat → secure landfill**. **Incineration** destroys organic and infectious wastes at high temperature with adequate residence time. **Biomedical waste** is segregated at source by a **colour-coded** system under the BMW Rules.",
    formulaMatrix: [
      "**Hazard characteristics**: ignitable, corrosive, reactive, toxic.",
      "",
      "**Management hierarchy**: minimisation → recycling → treatment → secure landfill.",
      "",
      "**Incinerator**: ≈ 850–1100 °C with ~2 s residence to destroy pathogens/dioxins.",
      "",
      "**BMW colour codes**: yellow (incinerable/anatomical), red (contaminated plastics), white (sharps), blue (glass/metals).",
    ].join("\n"),
    traps: [
      "**Yellow bag = anatomical/incinerable**, red = contaminated recyclable plastics — don't swap.",
      "**Adequate temperature AND residence time** are both needed to destroy dioxins.",
      "**Secure landfill is the last resort**, after minimisation/recycling/treatment.",
    ],
  },
  questions: [
    {
      id: "es-hz-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "Which of the following is NOT a defining characteristic of hazardous waste?",
      options: ["Biodegradability", "Ignitability", "Corrosivity", "Toxicity"], answer: 0,
      solution: { given: "Hazard characteristics.", derivation: "The four hazard traits are ignitability, corrosivity, reactivity, toxicity — not biodegradability.", target: "Correct option: biodegradability." },
    },
    {
      id: "es-hz-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "Under colour-coded biomedical-waste segregation, anatomical and soiled waste destined for incineration is placed in the:",
      options: ["yellow bag", "blue bag", "red bag", "white container"], answer: 0,
      solution: { given: "BMW Rules colour coding.", derivation: "Yellow = incinerable anatomical/soiled waste.", target: "Correct option: yellow bag." },
    },
    {
      id: "es-hz-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "Maintaining ~1000 °C with ~2 s gas residence time in a hazardous-waste incinerator is essential primarily to:",
      options: ["ensure complete combustion and destroy dioxins/pathogens", "minimise the ash volume", "avoid the need for air-pollution control", "increase moisture content"], answer: 0,
      solution: { given: "Incinerator design basis.", derivation: "High temperature plus adequate residence ensures complete burnout and dioxin/pathogen destruction.", target: "Correct option: complete combustion and dioxin destruction." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  SECTION 8 — Global & Regional Environmental Issues                    */
/* ════════════════════════════════════════════════════════════════════ */

const esClimate: LearnTopic = {
  slug: "es-gl-climate",
  subject: "Global & Regional Environmental Issues",
  title: "Greenhouse Effect & Global Warming Potential",
  tier: "free",
  blurb:
    "Greenhouse gases, radiative forcing, GWP and CO₂-equivalent accounting of emissions.",
  module: {
    principle:
      "**Greenhouse gases (GHGs)** are largely transparent to incoming short-wave solar radiation but **absorb outgoing long-wave (infrared)** radiation, warming the surface — the **greenhouse effect**. Each gas's warming impact relative to CO₂ over a time horizon is its **Global Warming Potential (GWP)**. Emissions are aggregated as **CO₂-equivalent** by multiplying each gas's mass by its GWP.",
    formulaMatrix: [
      "**CO₂-equivalent**: $\\text{CO}_2\\text{-e}=\\sum_i m_i\\times \\text{GWP}_i$",
      "",
      "**Approx. 100-yr GWPs**: CO₂ = 1, CH₄ ≈ 28, N₂O ≈ 265, many HFCs ≫ 1000.",
      "",
      "**Mechanism**: GHGs absorb terrestrial IR, re-emitting toward the surface.",
      "",
      "**Key GHGs**: CO₂, CH₄, N₂O, water vapour, halocarbons.",
    ].join("\n"),
    traps: [
      "**GHGs absorb long-wave IR**, not incoming visible/UV solar radiation.",
      "**GWP is relative to CO₂ (= 1)** over a stated horizon (usually 100 yr).",
      "**Methane has a high GWP** (~28) despite a shorter atmospheric lifetime.",
    ],
  },
  questions: [
    {
      id: "es-cl-q1", difficulty: "medium", marks: 2, type: "NAT",
      stem: "Emissions consist of 50 t CO₂, 4 t CH₄ (GWP 28) and 1 t N₂O (GWP 265). The total carbon footprint is _____ t CO₂-e.",
      natAnswer: 427, acceptedRange: [425, 429],
      solution: { given: "Masses × GWPs.", derivation: "$$50(1)+4(28)+1(265)=50+112+265=427$$", target: "427 t CO₂-e." },
    },
    {
      id: "es-cl-q2", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The greenhouse effect arises because GHGs are largely transparent to incoming solar radiation but absorb outgoing:",
      options: ["long-wave infrared radiation", "ultraviolet radiation", "visible light", "microwave radiation"], answer: 0,
      solution: { given: "Radiative mechanism.", derivation: "GHGs trap terrestrial long-wave (IR) radiation.", target: "Correct option: long-wave infrared." },
    },
    {
      id: "es-cl-q3", difficulty: "hard", marks: 1, type: "MCQ",
      stem: "The Global Warming Potential (GWP) of a greenhouse gas is defined relative to:",
      options: ["CO₂ (taken as 1)", "CH₄", "water vapour", "CFC-11"], answer: 0,
      solution: { given: "GWP definition.", derivation: "GWP is normalised to CO₂ = 1 over a chosen time horizon.", target: "Correct option: CO₂ = 1." },
    },
  ],
};

const esOzone: LearnTopic = {
  slug: "es-gl-ozone",
  subject: "Global & Regional Environmental Issues",
  title: "Ozone Depletion & Acid Rain",
  tier: "free",
  blurb:
    "Stratospheric ozone, ODP, the Montreal Protocol and the chemistry of acid deposition.",
  module: {
    principle:
      "**Stratospheric ozone** shields the surface from harmful UV-B. **Chlorofluorocarbons (CFCs), halons and CCl₄** release chlorine/bromine that catalytically destroy ozone; their potency is the **Ozone Depletion Potential (ODP)**, normalised to **CFC-11 = 1**. The **Montreal Protocol** phases out these substances. **Acid rain** forms when SO₂ and NOₓ oxidise to sulphuric and nitric acids, lowering precipitation pH below the natural ≈ 5.6.",
    formulaMatrix: [
      "**Ozone Depletion Potential**: ODP defined relative to **CFC-11 = 1.0**.",
      "",
      "**Montreal Protocol (1987)**: phases out ozone-depleting substances (ODS).",
      "",
      "**Natural rain pH ≈ 5.6** (dissolved CO₂ → carbonic acid).",
      "",
      "**Acid rain precursors**: SO₂ → H₂SO₄; NOₓ → HNO₃ (pH < 5.6).",
    ].join("\n"),
    traps: [
      "**ODP is referenced to CFC-11**, while GWP is referenced to CO₂ — different baselines.",
      "**CO₂ is a GHG, not an ozone-depleting substance.**",
      "**Even clean rain is mildly acidic (pH ≈ 5.6)** from dissolved CO₂ — acid rain is below that.",
    ],
  },
  questions: [
    {
      id: "es-oz-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The Ozone Depletion Potential (ODP) of a substance is measured relative to:",
      options: ["CFC-11 (taken as 1.0)", "CO₂", "methane", "ozone itself"], answer: 0,
      solution: { given: "ODP baseline.", derivation: "ODP is normalised to CFC-11 = 1.0.", target: "Correct option: CFC-11." },
    },
    {
      id: "es-oz-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "The international agreement responsible for phasing out ozone-depleting substances is the:",
      options: ["Montreal Protocol", "Kyoto Protocol", "Basel Convention", "Paris Agreement"], answer: 0,
      solution: { given: "Treaty mapping.", derivation: "The Montreal Protocol (1987) phases out CFCs, halons and other ODS.", target: "Correct option: Montreal Protocol." },
    },
    {
      id: "es-oz-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "Unpolluted rainwater is naturally mildly acidic (pH ≈ 5.6) because of dissolved:",
      options: ["carbon dioxide forming carbonic acid", "sulphur dioxide forming sulphuric acid", "nitric acid", "ammonia"], answer: 0,
      solution: { given: "Baseline rain chemistry.", derivation: "Atmospheric CO₂ dissolves to carbonic acid, giving pH ≈ 5.6; acid rain (SO₂/NOₓ) goes lower.", target: "Correct option: carbon dioxide / carbonic acid." },
    },
  ],
};

const esProtocols: LearnTopic = {
  slug: "es-gl-protocols",
  subject: "Global & Regional Environmental Issues",
  title: "International Protocols & Eutrophication",
  tier: "free",
  blurb:
    "Kyoto, Paris, Basel and Ramsar conventions, plus the nutrient-driven process of eutrophication.",
  module: {
    principle:
      "International environmental governance proceeds through **conventions and protocols**, each targeting a specific issue: **Montreal** (ozone), **Kyoto/Paris** (climate), **Basel** (transboundary hazardous-waste movement), **Ramsar** (wetlands) and **CBD** (biodiversity). At the regional scale, **eutrophication** — nutrient (N, P) enrichment of water bodies — triggers algal blooms whose decay depletes dissolved oxygen.",
    formulaMatrix: [
      "**Montreal Protocol** → ozone-depleting substances.",
      "**Kyoto Protocol (1997)** → binding GHG targets for developed (Annex-I) countries.",
      "**Paris Agreement (2015)** → keep warming well below 2 °C (pursue 1.5 °C).",
      "**Basel Convention** → control transboundary movement of hazardous wastes.",
      "**Eutrophication**: nutrient enrichment → algal bloom → decay → DO depletion → fish kills.",
    ].join("\n"),
    traps: [
      "**Kyoto set binding targets for developed countries; Paris is nationally-determined for all.**",
      "**Basel = hazardous-waste movement**, not climate or ozone.",
      "**Phosphorus is usually the limiting nutrient** for freshwater eutrophication.",
    ],
  },
  questions: [
    {
      id: "es-pr-q1", difficulty: "basic", marks: 1, type: "MCQ",
      stem: "The 2015 agreement aiming to hold the global temperature rise well below 2 °C is the:",
      options: ["Paris Agreement", "Montreal Protocol", "Basel Convention", "Ramsar Convention"], answer: 0,
      solution: { given: "Climate treaties.", derivation: "The Paris Agreement (2015) targets <2 °C, pursuing 1.5 °C.", target: "Correct option: Paris Agreement." },
    },
    {
      id: "es-pr-q2", difficulty: "medium", marks: 1, type: "MCQ",
      stem: "The convention that controls the transboundary movement of hazardous wastes is the:",
      options: ["Basel Convention", "Ramsar Convention", "Kyoto Protocol", "Vienna Convention"], answer: 0,
      solution: { given: "Treaty mapping.", derivation: "The Basel Convention regulates international shipment of hazardous waste.", target: "Correct option: Basel Convention." },
    },
    {
      id: "es-pr-q3", difficulty: "hard", marks: 2, type: "MCQ",
      stem: "The most immediate water-quality consequence of eutrophication is:",
      options: ["dissolved-oxygen depletion from decaying algal blooms", "increased water clarity", "reduced nutrient loading", "lower BOD"], answer: 0,
      solution: { given: "Eutrophication sequence.", derivation: "Nutrient enrichment → algal bloom → decomposition consumes DO, raising BOD and killing fish.", target: "Correct option: DO depletion." },
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  TOPIC REFERENCES                                                      */
/* ════════════════════════════════════════════════════════════════════ */

const ES_TOPIC_REFERENCES: Record<string, LearnReference[]> = {
  "es-mg-eia": [
    { book: "Environmental Impact Assessment", author: "Larry W. Canter" },
    { book: "Environmental Studies", author: "Erach Bharucha", chapter: "Environmental Management" },
  ],
  "es-mg-economics": [
    { book: "Environmental Economics", author: "Charles D. Kolstad" },
    { book: "Economics of the Environment", author: "Tom Tietenberg & Lynne Lewis" },
  ],
  "es-mg-ems": [
    { book: "Environmental Engineering and Management", author: "Suresh K. Dhameja" },
    { book: "ISO 14001 Environmental Management Systems", author: "Bureau of Indian Standards" },
  ],
  "es-ch-acid-base": [
    { book: "Environmental Chemistry", author: "A.K. De" },
    { book: "Chemistry for Environmental Engineering and Science", author: "Sawyer, McCarty & Parkin" },
  ],
  "es-ch-kinetics": [
    { book: "Chemistry for Environmental Engineering and Science", author: "Sawyer, McCarty & Parkin", chapter: "Reaction Kinetics" },
  ],
  "es-ch-water-quality": [
    { book: "Environmental Chemistry", author: "A.K. De", chapter: "Water Chemistry" },
    { book: "Standard Methods for the Examination of Water and Wastewater", author: "APHA-AWWA-WEF" },
  ],
  "es-mb-growth": [
    { book: "Environmental Microbiology", author: "Ian L. Pepper, Charles P. Gerba & Terry J. Gentry" },
    { book: "Brock Biology of Microorganisms", author: "Madigan et al." },
  ],
  "es-mb-indicators": [
    { book: "Environmental Microbiology", author: "Ian L. Pepper et al.", chapter: "Indicator Microorganisms" },
  ],
  "es-mb-nitrogen-cycle": [
    { book: "Wastewater Engineering: Treatment and Resource Recovery", author: "Metcalf & Eddy", chapter: "Biological Nutrient Removal" },
  ],
  "es-ec-ecosystems": [
    { book: "Fundamentals of Ecology", author: "Eugene P. Odum" },
    { book: "Ecology and Environment", author: "P.D. Sharma" },
  ],
  "es-ec-population": [
    { book: "Fundamentals of Ecology", author: "Eugene P. Odum", chapter: "Population Ecology" },
  ],
  "es-ec-biodiversity": [
    { book: "Conservation Biology", author: "Richard B. Primack" },
    { book: "Environmental Studies", author: "Erach Bharucha", chapter: "Biodiversity" },
  ],
  "es-ap-dispersion": [
    { book: "Air Pollution Control Engineering", author: "Noel de Nevers" },
    { book: "Environmental Engineering Vol. II", author: "S.K. Garg", chapter: "Air Pollution" },
  ],
  "es-ap-control": [
    { book: "Air Pollution Control Engineering", author: "Noel de Nevers", chapter: "Particulate Control" },
    { book: "Environmental Pollution Control Engineering", author: "C.S. Rao" },
  ],
  "es-ap-noise": [
    { book: "Environmental Pollution Control Engineering", author: "C.S. Rao", chapter: "Noise Pollution" },
  ],
  "es-ww-bod": [
    { book: "Wastewater Engineering: Treatment and Resource Recovery", author: "Metcalf & Eddy" },
    { book: "Environmental Engineering Vol. II", author: "S.K. Garg" },
  ],
  "es-ww-sedimentation": [
    { book: "Water and Wastewater Engineering", author: "Davis & Cornwell", chapter: "Sedimentation" },
  ],
  "es-ww-activated-sludge": [
    { book: "Wastewater Engineering: Treatment and Resource Recovery", author: "Metcalf & Eddy", chapter: "Activated Sludge" },
  ],
  "es-sw-msw": [
    { book: "Integrated Solid Waste Management", author: "Tchobanoglous, Theisen & Vigil" },
    { book: "Solid Waste Management", author: "C.S. Rao / S.K. Garg" },
  ],
  "es-sw-landfill": [
    { book: "Integrated Solid Waste Management", author: "Tchobanoglous, Theisen & Vigil", chapter: "Landfills" },
  ],
  "es-sw-hazardous": [
    { book: "Hazardous Waste Management", author: "LaGrega, Buckingham & Evans" },
  ],
  "es-gl-climate": [
    { book: "IPCC Assessment Reports", author: "Intergovernmental Panel on Climate Change" },
    { book: "Environmental Studies", author: "Erach Bharucha", chapter: "Global Environmental Issues" },
  ],
  "es-gl-ozone": [
    { book: "Environmental Chemistry", author: "A.K. De", chapter: "Atmospheric Chemistry" },
  ],
  "es-gl-protocols": [
    { book: "Environmental Studies", author: "Erach Bharucha", chapter: "International Conventions" },
  ],
};

/* ════════════════════════════════════════════════════════════════════ */
/*  RECOMMENDED BOOKS & RESOURCES (Learn index panel)                     */
/* ════════════════════════════════════════════════════════════════════ */

export type EsResourceGroup = { subject: string; books: LearnReference[] };

export const ES_RESOURCES: EsResourceGroup[] = [
  {
    subject: "Environmental Management & Ethics",
    books: [
      { book: "Environmental Impact Assessment", author: "Larry W. Canter" },
      { book: "Environmental Studies", author: "Erach Bharucha" },
    ],
  },
  {
    subject: "Environmental Chemistry",
    books: [
      { book: "Environmental Chemistry", author: "A.K. De" },
      { book: "Chemistry for Environmental Engineering and Science", author: "Sawyer, McCarty & Parkin" },
    ],
  },
  {
    subject: "Environmental Microbiology",
    books: [
      { book: "Environmental Microbiology", author: "Pepper, Gerba & Gentry" },
    ],
  },
  {
    subject: "Ecology & Biodiversity",
    books: [
      { book: "Fundamentals of Ecology", author: "Eugene P. Odum" },
      { book: "Conservation Biology", author: "Richard B. Primack" },
    ],
  },
  {
    subject: "Air & Noise Pollution",
    books: [
      { book: "Air Pollution Control Engineering", author: "Noel de Nevers" },
      { book: "Environmental Pollution Control Engineering", author: "C.S. Rao" },
    ],
  },
  {
    subject: "Water & Wastewater Treatment",
    books: [
      { book: "Wastewater Engineering: Treatment and Resource Recovery", author: "Metcalf & Eddy" },
      { book: "Environmental Engineering Vol. I & II", author: "S.K. Garg" },
    ],
  },
  {
    subject: "Solid & Hazardous Waste Management",
    books: [
      { book: "Integrated Solid Waste Management", author: "Tchobanoglous, Theisen & Vigil" },
      { book: "Hazardous Waste Management", author: "LaGrega, Buckingham & Evans" },
    ],
  },
  {
    subject: "Global & Regional Environmental Issues",
    books: [
      { book: "IPCC Assessment Reports", author: "Intergovernmental Panel on Climate Change" },
      { book: "Environmental Studies", author: "Erach Bharucha" },
    ],
  },
];

export const ES_RESOURCE_LINKS: { label: string; href: string; note: string }[] = [
  { label: "NPTEL–GATE PYQ portal", href: "https://gate.nptel.ac.in", note: "Subject-wise previous-year questions with solutions and full-length mock tests." },
  { label: "CPCB — Central Pollution Control Board", href: "https://cpcb.nic.in", note: "Indian air/water quality standards, NAAQS, effluent norms and guidance documents." },
];

export const ES_LEARN_TOPICS: LearnTopic[] = [
  esEIA,
  esEnvEconomics,
  esEMS,
  esAcidBase,
  esKinetics,
  esWaterQuality,
  esMicrobeGrowth,
  esIndicatorOrganisms,
  esBiogeochemical,
  esEcosystems,
  esPopulation,
  esBiodiversity,
  esDispersion,
  esAirControl,
  esNoise,
  esBOD,
  esSedimentation,
  esActivatedSludge,
  esMSW,
  esLandfill,
  esHazardous,
  esClimate,
  esOzone,
  esProtocols,
].map((t) => ({ ...t, references: t.references ?? ES_TOPIC_REFERENCES[t.slug] }));

export function getEnvLearnTopic(slug: string): LearnTopic | undefined {
  return ES_LEARN_TOPICS.find((t) => t.slug === slug);
}

/* ════════════════════════════════════════════════════════════════════ */
/*  GATE ES SYLLABUS MAP                                                  */
/* ════════════════════════════════════════════════════════════════════ */

export const ES_LEARN_SYLLABUS: LearnSyllabusSection[] = [
  {
    id: 1,
    title: "Environmental Management & Ethics",
    summary: "EIA, environmental management systems, economics and the ethics of decision-making.",
    subtopics: [
      { title: "Environmental Impact Assessment (EIA)", slug: "es-mg-eia", highlight: "Screening, scoping, EMP, Leopold matrix, EIA Notification 2006" },
      { title: "Environmental Economics & Ethics", slug: "es-mg-economics", highlight: "Externalities, polluter-pays, discounting, cost–benefit analysis" },
      { title: "EMS, ISO 14000 & Sustainability", slug: "es-mg-ems", highlight: "PDCA cycle, carrying capacity, sustainable development, LCA" },
    ],
  },
  {
    id: 2,
    title: "Environmental Chemistry",
    summary: "Acid–base equilibria, kinetics and the inorganic chemistry of natural waters.",
    subtopics: [
      { title: "Acid–Base Equilibria & pH", slug: "es-ch-acid-base", highlight: "pH, pOH, ion product of water, logarithmic scale" },
      { title: "Reaction Kinetics & Decay", slug: "es-ch-kinetics", highlight: "First-order decay, half-life, rate constants" },
      { title: "Hardness, Alkalinity & Carbonate System", slug: "es-ch-water-quality", highlight: "Hardness as CaCO₃, alkalinity, carbonate speciation" },
    ],
  },
  {
    id: 3,
    title: "Environmental Microbiology",
    summary: "Microbial growth, indicator organisms and the nitrogen-cycle microbiology of treatment.",
    subtopics: [
      { title: "Microbial Growth Kinetics", slug: "es-mb-growth", highlight: "Exponential growth, generation time, Monod model, growth phases" },
      { title: "Indicator Organisms & Pathogens", slug: "es-mb-indicators", highlight: "Coliforms, MPN, E. coli, drinking-water standards" },
      { title: "Nitrogen Cycle & Biological N-Removal", slug: "es-mb-nitrogen-cycle", highlight: "Nitrification, denitrification, autotrophs, alkalinity" },
    ],
  },
  {
    id: 4,
    title: "Ecology & Biodiversity",
    summary: "Energy flow, population dynamics and the conservation of biological diversity.",
    subtopics: [
      { title: "Ecosystems & Energy Flow", slug: "es-ec-ecosystems", highlight: "Trophic levels, 10 % law, ecological pyramids, NPP" },
      { title: "Population Dynamics", slug: "es-ec-population", highlight: "Exponential vs logistic growth, carrying capacity" },
      { title: "Biodiversity & Conservation", slug: "es-ec-biodiversity", highlight: "Shannon index, hotspots, in-situ vs ex-situ" },
    ],
  },
  {
    id: 5,
    title: "Air & Noise Pollution",
    summary: "Dispersion, particulate control and the assessment of noise pollution.",
    subtopics: [
      { title: "Atmospheric Dispersion & Stack Plumes", slug: "es-ap-dispersion", highlight: "Effective stack height, lapse rates, Gaussian plume, stability" },
      { title: "Particulate Control Devices", slug: "es-ap-control", highlight: "Cyclones, ESP, bag-houses, Deutsch–Anderson" },
      { title: "Noise Pollution & Decibel Addition", slug: "es-ap-noise", highlight: "SPL, logarithmic addition, Leq, dB(A), standards" },
    ],
  },
  {
    id: 6,
    title: "Water & Wastewater Treatment",
    summary: "Oxygen demand, sedimentation and the biological processes of secondary treatment.",
    subtopics: [
      { title: "BOD, COD & Oxygen Demand", slug: "es-ww-bod", highlight: "First-order BOD kinetics, ultimate BOD, BOD/COD ratio" },
      { title: "Sedimentation & Overflow Rate", slug: "es-ww-sedimentation", highlight: "Surface overflow rate, settling velocity, removal efficiency" },
      { title: "Activated Sludge & Biological Treatment", slug: "es-ww-activated-sludge", highlight: "F/M ratio, sludge age, MLSS, aeration design" },
    ],
  },
  {
    id: 7,
    title: "Solid & Hazardous Waste Management",
    summary: "MSW characteristics, sanitary landfills and the handling of hazardous & biomedical waste.",
    subtopics: [
      { title: "MSW Characteristics & Calorific Value", slug: "es-sw-msw", highlight: "Moisture content, compaction, density, Dulong HHV" },
      { title: "Sanitary Landfills & Landfill Gas", slug: "es-sw-landfill", highlight: "Phases, leachate, methanogenesis, gas yield" },
      { title: "Hazardous & Biomedical Waste", slug: "es-sw-hazardous", highlight: "Hazard traits, incineration, colour-coded segregation" },
    ],
  },
  {
    id: 8,
    title: "Global & Regional Environmental Issues",
    summary: "Climate change, ozone depletion, acid rain and international environmental governance.",
    subtopics: [
      { title: "Greenhouse Effect & Global Warming Potential", slug: "es-gl-climate", highlight: "GHGs, radiative forcing, GWP, CO₂-equivalent" },
      { title: "Ozone Depletion & Acid Rain", slug: "es-gl-ozone", highlight: "ODP, CFC-11, Montreal Protocol, acid deposition" },
      { title: "International Protocols & Eutrophication", slug: "es-gl-protocols", highlight: "Kyoto, Paris, Basel, Ramsar; nutrient enrichment" },
    ],
  },
];

/** A syllabus sub-topic resolved against the authored ES LearnTopic bank. */
export type EsResolvedSubtopic = LearnSyllabusSubtopic & { topic?: LearnTopic };

/** The full ES syllabus with each sub-topic's authored LearnTopic attached. */
export function getEnvLearnSyllabus(): (Omit<LearnSyllabusSection, "subtopics"> & {
  subtopics: EsResolvedSubtopic[];
  liveCount: number;
})[] {
  return ES_LEARN_SYLLABUS.map((sec) => {
    const subtopics: EsResolvedSubtopic[] = sec.subtopics.map((st) => ({
      ...st,
      topic: st.slug ? getEnvLearnTopic(st.slug) : undefined,
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
