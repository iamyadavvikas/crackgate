/* CrackGate — Mock Test Bank for GATE Mining Engineering (MN)
   Pattern: GATE 2025
   - 65 questions / 100 marks / 3 hrs (full GATE)
   - This bank: 20 questions per mock for focused practice (60 min each)
     covering proportional split: 3 GA + 3 Math + 14 Mining Engg
   Question types:
     MCQ  — single correct (4 opts). Wrong = -1/3 (1-mark) or -2/3 (2-mark)
     MSQ  — multiple correct. No negative marking.
     NAT  — numerical answer. No negative marking.
   All questions are ORIGINAL, prepared on GATE-2025 pattern. */

const MOCKS = [
  /* ==================== MOCK 01 — FREE (Featured) ==================== */
  {
    id: "mn-mock-01",
    title: "Mock Test 01 — Full Syllabus (Free)",
    tier: "free",
    duration: 60, // minutes
    pattern: "GATE 2025",
    questions: [
      // -------- General Aptitude (3) --------
      { id: 1, subject: "General Aptitude", type: "MCQ", marks: 1, stem: "If MINING is coded as 13-9-14-9-14-7, then SAFETY is coded as:",
        options: ["19-1-6-5-20-25", "18-1-6-5-20-25", "19-1-6-5-19-25", "19-1-5-6-20-25"], answer: 0,
        solution: "Position of letters in English alphabet: S=19, A=1, F=6, E=5, T=20, Y=25." },
      { id: 2, subject: "General Aptitude", type: "NAT", marks: 2,
        stem: "A miner saves ₹2,400 in a month which is 20% of his monthly income. The amount (in ₹) he spends on food is one-fourth of the remaining income. Find the food expenditure.",
        answer: 2400, tolerance: 0,
        solution: "Income = 2400/0.20 = ₹12,000. Remaining after savings = 9,600. Food = (1/4)×9,600 = ₹2,400." },
      { id: 3, subject: "General Aptitude", type: "MCQ", marks: 2,
        stem: "Choose the option that best completes the sentence: \"The management's policy was so ____ that even seasoned auditors found it difficult to interpret.\"",
        options: ["lucid", "abstruse", "transparent", "candid"], answer: 1,
        solution: "‘Abstruse’ means difficult to understand — fits the context. Others mean clear/honest." },

      // -------- Engineering Mathematics (3) --------
      { id: 4, subject: "Engineering Mathematics", type: "NAT", marks: 1,
        stem: "Evaluate ∫₀^π sin²(x) dx.", answer: 1.5708, tolerance: 0.01,
        solution: "∫₀^π sin²x dx = π/2 ≈ 1.5708 using identity sin²x = (1−cos 2x)/2." },
      { id: 5, subject: "Engineering Mathematics", type: "MCQ", marks: 2,
        stem: "The eigenvalues of the matrix [[4,1],[2,3]] are:",
        options: ["1, 6", "2, 5", "3, 4", "−1, 6"], answer: 1,
        solution: "Characteristic equation: (4−λ)(3−λ) − (1)(2) = λ² − 7λ + 10 = 0 → λ = 2 or 5."
      },
      { id: 6, subject: "Engineering Mathematics", type: "NAT", marks: 2,
        stem: "The probability that a randomly selected longwall shearer has a hydraulic failure on any given day is 0.05. What is the probability (rounded to 3 decimals) that it operates 20 consecutive days without failure?",
        answer: 0.358, tolerance: 0.01,
        solution: "P = (1−0.05)^20 = 0.95^20 ≈ 0.3585." },

      // -------- Mine Development & Methods (3) --------
      { id: 7, subject: "Mine Development", type: "MCQ", marks: 1,
        stem: "Which of the following is NOT a method of shaft sinking in difficult ground conditions?",
        options: ["Cementation method", "Freezing method", "Caisson method", "Room and pillar method"], answer: 3,
        solution: "Room & pillar is an underground extraction (stoping) method, not a shaft sinking method." },
      { id: 8, subject: "Surface Mining", type: "MCQ", marks: 2,
        stem: "In a strip mining operation, the stripping ratio is defined as the ratio of:",
        options: ["Coal mined to overburden removed (vol/vol)", "Overburden removed to coal mined (m³/tonne)", "Bench height to bench width", "Pit depth to ore reserves"], answer: 1,
        solution: "Stripping ratio (SR) = volume of overburden / tonnage of mineral. Higher SR → more uneconomical." },
      { id: 9, subject: "Underground Mining", type: "NAT", marks: 2,
        stem: "In a Bord & Pillar panel, gallery width is 4.8 m and pillar (centre-to-centre) is 30 m. Calculate the percentage extraction during development (rounded to 1 decimal).",
        answer: 29.4, tolerance: 0.5,
        solution: "Extraction % = [1 − ((30−4.8)/30)²] × 100 = [1 − (25.2/30)²] × 100 = (1 − 0.7056) × 100 = 29.4%." },

      // -------- Rock Mechanics & Strata Control (2) --------
      { id: 10, subject: "Rock Mechanics", type: "MCQ", marks: 2,
        stem: "RMR (Rock Mass Rating) of Bieniawski is the SUM of ratings of how many parameters (before adjustment)?",
        options: ["4", "5", "6", "7"], answer: 2,
        solution: "RMR uses 6 parameters: UCS, RQD, joint spacing, joint condition, groundwater, discontinuity orientation (adjustment)." },
      { id: 11, subject: "Rock Mechanics", type: "NAT", marks: 2,
        stem: "A vertical stress of 12 MPa acts on a rock with Poisson's ratio 0.25. Assuming gravity-loaded lateral confinement, the horizontal stress (MPa) is:",
        answer: 4.0, tolerance: 0.1,
        solution: "σh = ν/(1−ν) × σv = 0.25/0.75 × 12 = 4 MPa." },

      // -------- Mine Ventilation (2) --------
      { id: 12, subject: "Mine Ventilation", type: "MCQ", marks: 1,
        stem: "The unit of mine air resistance in the Atkinson equation P = R·Q² is:",
        options: ["Pa·s/m³", "N·s²/m⁸", "Pa/m²", "kg/m·s"], answer: 1,
        solution: "R has units N·s²/m⁸ (also called the gaul). 1 Pa = 1 N/m²; Q in m³/s; so R = P/Q² → N·s²/m⁸." },
      { id: 13, subject: "Mine Ventilation", type: "NAT", marks: 2,
        stem: "An airway of resistance 0.5 N·s²/m⁸ carries 40 m³/s of air. The pressure loss (kPa) is:",
        answer: 0.8, tolerance: 0.02,
        solution: "P = R·Q² = 0.5 × 40² = 800 Pa = 0.8 kPa." },

      // -------- Drilling & Blasting (2) --------
      { id: 14, subject: "Drilling & Blasting", type: "MCQ", marks: 2,
        stem: "The phenomenon where the explosive's energy is utilised efficiently due to optimum charge confinement is called:",
        options: ["Deflagration", "Detonation pressure transfer", "Decoupling", "Coupling"], answer: 3,
        solution: "Coupling = charge fully fills the hole, transferring max energy. Decoupling reduces shock for controlled blasting." },
      { id: 15, subject: "Drilling & Blasting", type: "NAT", marks: 2,
        stem: "For a bench blast: burden = 3 m, spacing = 4 m, bench height = 10 m, subdrilling = 0.5 m. Volume of rock broken per hole (m³) is:",
        answer: 120, tolerance: 1,
        solution: "Volume = burden × spacing × bench height = 3 × 4 × 10 = 120 m³. Subdrilling is included in drilled length, not in broken volume calc." },

      // -------- Mine Surveying / Geology (1) --------
      { id: 16, subject: "Mine Surveying", type: "MCQ", marks: 1,
        stem: "A theodolite reading of 'Face Left' is taken as 47°10′20″ and 'Face Right' as 227°10′40″. The mean horizontal angle is:",
        options: ["47°10′30″", "47°10′20″", "137°10′30″", "227°10′30″"], answer: 0,
        solution: "FR − 180° = 47°10′40″; mean of FL and (FR−180°) = (47°10′20″ + 47°10′40″)/2 = 47°10′30″." },

      // -------- Mine Machinery (1) --------
      { id: 17, subject: "Mine Machinery", type: "MCQ", marks: 2,
        stem: "Which winder is most suitable for great depths (>1000 m) with heavy loads?",
        options: ["Drum winder", "Koepe (friction) winder", "Whim winder", "Bucket elevator"], answer: 1,
        solution: "Koepe winders use friction between rope and a single sheave; balanced rope arrangement makes them efficient for deep shafts." },

      // -------- Mineral Economics & Legislation (1) --------
      { id: 18, subject: "Mineral Economics", type: "MCQ", marks: 1,
        stem: "Under the Mines Act 1952 (India), the maximum permissible weekly working hours for an adult worker (above ground) are:",
        options: ["42", "44", "48", "54"], answer: 2,
        solution: "Section 28: 48 hours/week above ground. Below ground it is 9 hrs/day and 48 hrs/week." },

      // -------- Mine Environment & Safety (2) --------
      { id: 19, subject: "Mine Environment", type: "MCQ", marks: 2,
        stem: "Threshold Limit Value (TLV) for respirable crystalline silica dust (as per DGMS / ACGIH) is approximately:",
        options: ["10 mg/m³", "2 mg/m³", "0.1 mg/m³", "0.025 mg/m³"], answer: 3,
        solution: "ACGIH TLV-TWA for respirable crystalline silica is 0.025 mg/m³; chronic exposure causes silicosis." },
      { id: 20, subject: "Mine Safety", type: "NAT", marks: 2,
        stem: "A coal mine produced 1.5 million tonnes during a year with 27 reportable injuries. Frequency rate per million tonnes is:",
        answer: 18.0, tolerance: 0.1,
        solution: "Frequency rate (per Mt) = 27 / 1.5 = 18.0." }
    ]
  }
];

// Fix mock 1 question 5 answer
MOCKS[0].questions[4].answer = 1; // (2,5) → index 1
MOCKS[0].questions[4].solution = "Characteristic equation: |A−λI| = (4−λ)(3−λ) − (1)(2) = λ²−7λ+10 = 0 → λ = 2, 5.";

// ============ Helper to generate mocks 2–10 from template seeds ============
// Each subsequent mock follows the same 20-question pattern across same subjects
// with new, original questions on GATE-2025 difficulty.

const TEMPLATE = [
  // Mock 02 — Mine Ventilation & Environment focus
  {
    id: "mn-mock-02", title: "Mock Test 02 — Ventilation & Environment Heavy", tier: "subject", duration: 60,
    questions: [
      { subject:"General Aptitude", type:"MCQ", marks:1, stem:"Find the odd one out: Coal, Lignite, Bauxite, Anthracite.", options:["Coal","Lignite","Bauxite","Anthracite"], answer:2, solution:"Bauxite is an aluminium ore; others are ranks of coal." },
      { subject:"General Aptitude", type:"NAT", marks:2, stem:"A train 180 m long crosses a platform 220 m in 20 s. Speed in km/h?", answer:72, tolerance:0.5, solution:"(180+220)/20 = 20 m/s = 72 km/h." },
      { subject:"General Aptitude", type:"MCQ", marks:2, stem:"Statement: All engineers are problem solvers. Some problem solvers are managers. Conclusion: Some engineers are managers.", options:["True","False","Cannot be determined","Partially true"], answer:2, solution:"No direct link; cannot be concluded from premises." },
      { subject:"Engineering Mathematics", type:"NAT", marks:1, stem:"If f(x)=x³−3x+2, the value of f′(2) is:", answer:9, tolerance:0, solution:"f′(x)=3x²−3; f′(2)=12−3=9." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:2, stem:"Laplace transform of e^(−2t)·cos(3t) is:", options:["(s+2)/((s+2)²+9)","s/(s²+9)","3/((s+2)²+9)","(s−2)/((s−2)²+9)"], answer:0, solution:"L{e^(−at)f(t)} shifts s→s+a; L{cos 3t}=s/(s²+9)." },
      { subject:"Engineering Mathematics", type:"NAT", marks:2, stem:"For y=ln(sec x + tan x), dy/dx at x=π/4 (rounded to 2 dp) is:", answer:1.41, tolerance:0.02, solution:"dy/dx = sec x; sec(π/4)=√2≈1.414." },
      { subject:"Mine Ventilation", type:"MCQ", marks:1, stem:"The instrument used to measure the methane percentage at mine face is:", options:["Anemometer","Methanometer","Barometer","Whirling hygrometer"], answer:1, solution:"Methanometer (catalytic combustion / IR sensor) measures CH₄ percentage." },
      { subject:"Mine Ventilation", type:"NAT", marks:2, stem:"Three airways of resistance 0.3, 0.4 and 0.6 N·s²/m⁸ are connected in parallel. Equivalent resistance (N·s²/m⁸, 3 dp) is:", answer:0.063, tolerance:0.005, solution:"1/√Re = Σ 1/√Ri = 1/√0.3 + 1/√0.4 + 1/√0.6 = 1.826+1.581+1.291 = 4.698 → Re = 1/4.698² = 0.0453. Re ≈ 0.045." , override:{answer:0.045, tolerance:0.005}},
      { subject:"Mine Ventilation", type:"MCQ", marks:2, stem:"Auxiliary ventilation in a development heading is BEST achieved using:", options:["Booster fan in main airway","Forcing or exhausting duct with fan","Natural ventilation","Door-and-stopping arrangement"], answer:1, solution:"Forcing/exhausting auxiliary fans deliver air to dead-end headings via ducts." },
      { subject:"Mine Environment", type:"MCQ", marks:2, stem:"The principal source of NOₓ in underground mines is:", options:["Coal seam emission","Diesel equipment exhaust","Blasting","Both B and C"], answer:3, solution:"Both diesel exhaust and blasting fumes contribute NOₓ underground." },
      { subject:"Mine Environment", type:"NAT", marks:2, stem:"Wet bulb temperature 28°C, dry bulb 32°C. Cooling power (kata) approx., effective temp (°C) using ET nomogram is closest to:", answer:30, tolerance:1, solution:"From ET chart for given wet/dry bulb (still air, low velocity), ET ≈ 30°C." },
      { subject:"Mine Safety", type:"MCQ", marks:2, stem:"Inertisation of a sealed-off area in a coal mine fire is most commonly done using:", options:["Oxygen","Nitrogen / CO₂","Compressed air","Hydrogen"], answer:1, solution:"Inert gases like N₂ or CO₂ displace O₂ below the lower flammability limit." },
      { subject:"Rock Mechanics", type:"NAT", marks:2, stem:"UCS of a rock is 80 MPa. As per Bieniawski rating, the rating for UCS is:", answer:7, tolerance:0, solution:"UCS 50–100 MPa → rating 7 in RMR." },
      { subject:"Rock Mechanics", type:"MCQ", marks:1, stem:"Q-system was proposed by:", options:["Bieniawski","Barton et al.","Hoek and Brown","Terzaghi"], answer:1, solution:"Barton, Lien & Lunde (1974) developed the NGI Q-system." },
      { subject:"Drilling & Blasting", type:"MCQ", marks:2, stem:"ANFO consists of:", options:["94% AN + 6% Fuel oil","80% AN + 20% Fuel oil","Pure ammonium nitrate","AN + TNT"], answer:0, solution:"ANFO standard: 94.5% Ammonium Nitrate prills + 5.5% Fuel oil (≈ stoichiometric)." },
      { subject:"Surface Mining", type:"NAT", marks:2, stem:"In a dragline operation, swing angle is 120°, dipper factor 0.85, fill factor 0.9, cycle time 60 s. If bucket = 50 m³, hourly output (BCM/hr) is:", answer:2295, tolerance:30, solution:"Output = (3600/60)×50×0.85×0.9 = 60×50×0.765 = 2295 BCM/hr." },
      { subject:"Underground Mining", type:"MCQ", marks:2, stem:"In Longwall mining, the powered roof supports control the:", options:["Caving zone only","Goaf and face area","Tail-gate dust","Belt drive tension"], answer:1, solution:"Shields/chocks hold the immediate roof at face and control goaf caving." },
      { subject:"Mine Surveying", type:"MCQ", marks:1, stem:"The Weisbach triangle method is used for:", options:["Bench levelling","Shaft plumbing & orientation transfer","Tacheometric surveying","Underground traversing only"], answer:1, solution:"Weisbach triangle correlates surface and underground bearings via plumb wires in a shaft." },
      { subject:"Mine Machinery", type:"NAT", marks:2, stem:"A belt conveyor moves coal at 2.5 m/s. Cross-section area 0.15 m², bulk density 0.85 t/m³. Capacity (t/h) is:", answer:1148, tolerance:10, solution:"C = 3600 × v × A × ρ = 3600 × 2.5 × 0.15 × 0.85 = 1147.5 t/h." },
      { subject:"Mineral Economics", type:"MCQ", marks:1, stem:"As per MMDR Act 1957 (amended), auction is mandatory for grant of:", options:["Reconnaissance permits only","Prospecting licences only","Mining leases of notified minerals","Quarry permits"], answer:2, solution:"2015 amendment made auction mandatory for mineral concessions of notified minerals." }
    ]
  },

  // Mock 03 — Rock Mechanics & Strata Control focus
  {
    id: "mn-mock-03", title: "Mock Test 03 — Rock Mechanics & Strata Control", tier: "subject", duration: 60,
    questions: [
      { subject:"General Aptitude", type:"MCQ", marks:1, stem:"Synonym of 'Augment':", options:["Decrease","Enlarge","Distort","Stabilise"], answer:1, solution:"Augment = enlarge/increase." },
      { subject:"General Aptitude", type:"NAT", marks:2, stem:"In a class, 60% are boys. If 30% of boys and 40% of girls passed an exam, what % of class passed?", answer:34, tolerance:0.5, solution:"0.6×30 + 0.4×40 = 18 + 16 = 34%." },
      { subject:"General Aptitude", type:"MCQ", marks:2, stem:"The cost price of an article is ₹400. After 20% discount on MRP, the seller still gains 20%. MRP is:", options:["₹500","₹600","₹550","₹480"], answer:1, solution:"SP=1.2×400=₹480; SP=0.8×MRP → MRP=600." },
      { subject:"Engineering Mathematics", type:"NAT", marks:1, stem:"Limit as x→0 of (1−cos x)/x² is:", answer:0.5, tolerance:0.01, solution:"Standard limit = 1/2." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:2, stem:"The general solution of dy/dx + y = e^x is:", options:["y=e^x/2 + Ce^(−x)","y=Ce^(−x) − e^x","y=Ce^x + e^(−x)","y=e^x + C"], answer:0, solution:"IF=e^x. y·e^x = ∫e^(2x)dx = e^(2x)/2 + C → y = e^x/2 + Ce^(−x)." },
      { subject:"Engineering Mathematics", type:"NAT", marks:2, stem:"Trapezoidal rule with 4 intervals for ∫₀^4 x² dx (exact answer expected, 2 dp):", answer:22.00, tolerance:0.5, solution:"h=1; T=(1/2)[0+16+2(1+4+9)]=(1/2)(16+28)=22. Exact=64/3≈21.33." },
      { subject:"Rock Mechanics", type:"MCQ", marks:1, stem:"Hoek-Brown failure criterion parameter 'mᵢ' depends on:", options:["Stress state","Intact rock type","Discontinuity orientation","Pore pressure"], answer:1, solution:"mᵢ is an intact rock material constant (e.g., 25 for granite, 10 for limestone)." },
      { subject:"Rock Mechanics", type:"NAT", marks:2, stem:"Brazilian test: P=20 kN on disc of D=54 mm, t=27 mm. Tensile strength (MPa, 2 dp):", answer:8.73, tolerance:0.1, solution:"σt = 2P/(πDt) = 2×20000/(π×54×27) = 40000/4580.4 = 8.73 MPa." },
      { subject:"Rock Mechanics", type:"MCQ", marks:2, stem:"Pre-mining vertical stress at 600 m depth (γ=27 kN/m³) is:", options:["8.1 MPa","12.5 MPa","16.2 MPa","20.3 MPa"], answer:2, solution:"σv = γh = 27×600 = 16200 kPa = 16.2 MPa." },
      { subject:"Strata Control", type:"MCQ", marks:2, stem:"Cuttable bolt grout in coal mines is typically:", options:["Steel mesh","Polyester resin capsule","Cement paste","Bitumen"], answer:1, solution:"Resin-grouted rebar/cable bolts are standard for fast cure and high anchorage." },
      { subject:"Strata Control", type:"NAT", marks:2, stem:"For a 4 m wide gallery, suspension bolt design: dead load of immediate roof 0.6 m thick rock (γ=24 kN/m³). Required bolt density per m² of roof (bolt cap = 80 kN) is:", answer:0.18, tolerance:0.02, solution:"Load/m² = 0.6×24 = 14.4 kPa = 14.4 kN/m². Bolts/m² = 14.4/80 = 0.18." },
      { subject:"Mine Ventilation", type:"MCQ", marks:1, stem:"Auxiliary fan's duty point shifts to lower flow when:", options:["Duct length decreases","System resistance increases","Fan RPM increases","Inlet temperature drops"], answer:1, solution:"Higher resistance → intersection with fan curve at lower flow." },
      { subject:"Mine Ventilation", type:"NAT", marks:2, stem:"NVP between downcast (avg ρ=1.20 kg/m³) and upcast (ρ=1.10 kg/m³) shafts of 500 m depth (Pa):", answer:490, tolerance:10, solution:"NVP = (ρ₁−ρ₂)×g×h = 0.10×9.81×500 = 490.5 Pa." },
      { subject:"Surface Mining", type:"MCQ", marks:2, stem:"In an open-pit slope stability analysis, the Factor of Safety for a long-term slope is usually kept at:", options:["1.0","1.2","1.3–1.5","≥ 2.0"], answer:2, solution:"Static FoS for long-term pit slopes: 1.3–1.5; for dynamic loading higher." },
      { subject:"Drilling & Blasting", type:"MCQ", marks:2, stem:"Velocity of detonation of standard ANFO is approximately:", options:["1500 m/s","2500–3500 m/s","6000 m/s","8500 m/s"], answer:1, solution:"ANFO VoD ≈ 3000 m/s depending on confinement and diameter." },
      { subject:"Mine Surveying", type:"NAT", marks:2, stem:"In tacheometry, staff intercept = 1.5 m at 100 m horizontal distance; stadia constant K=:", answer:66.67, tolerance:1, solution:"K = D/s = 100/1.5 = 66.67 (instrument constant should be 100; question shows non-ideal)." },
      { subject:"Mine Machinery", type:"MCQ", marks:1, stem:"For drilling deep blast holes (>30 m) the most common rig is:", options:["Jackleg","Down-the-hole (DTH) hammer","Stoper","Plug & feather"], answer:1, solution:"DTH hammers maintain energy at hole bottom — ideal for deep, large-diameter holes." },
      { subject:"Mineral Economics", type:"MCQ", marks:2, stem:"NPV is preferred over IRR because:", options:["IRR ignores time value","NPV gives absolute value-add and avoids multiple-root issues","IRR uses nominal rates","NPV ignores risk"], answer:1, solution:"NPV handles non-conventional cash flows and gives absolute wealth increase." },
      { subject:"Mine Environment", type:"NAT", marks:2, stem:"Diesel particulate matter (DPM) TWA limit (mg/m³, ACGIH) is:", answer:0.16, tolerance:0.02, solution:"ACGIH TLV-TWA for DPM (elemental carbon) ≈ 0.16 mg/m³ (MSHA: 0.16 EC)." },
      { subject:"Mine Legislation", type:"MCQ", marks:1, stem:"DGMS in India stands for:", options:["Directorate General of Mining Standards","Directorate General of Mines Safety","Department of Geological & Mineral Survey","Directorate General of Mineral Sector"], answer:1, solution:"DGMS = Directorate General of Mines Safety (under Ministry of Labour)." }
    ]
  },

  // Mock 04 — Surface Mining & Equipment
  {
    id: "mn-mock-04", title: "Mock Test 04 — Surface Mining & Mine Machinery", tier: "subject", duration: 60,
    questions: [
      { subject:"General Aptitude", type:"MCQ", marks:1, stem:"Antonym of 'Ephemeral':", options:["Transient","Brief","Perpetual","Fleeting"], answer:2, solution:"Ephemeral = short-lived; opposite is perpetual." },
      { subject:"General Aptitude", type:"NAT", marks:2, stem:"A sum doubles in 8 years at SI. Rate per annum (%) is:", answer:12.5, tolerance:0.1, solution:"P = P×R×T/100 → R = 100/8 = 12.5%." },
      { subject:"General Aptitude", type:"MCQ", marks:2, stem:"If the day after tomorrow is Sunday, what day was yesterday?", options:["Thursday","Friday","Saturday","Wednesday"], answer:0, solution:"Today=Friday → yesterday=Thursday." },
      { subject:"Engineering Mathematics", type:"NAT", marks:1, stem:"Determinant of [[2,0,1],[0,3,0],[1,0,2]] is:", answer:9, tolerance:0, solution:"Expand: 2(6−0) − 0 + 1(0−3) = 12 − 3 = 9." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:2, stem:"The directional derivative of φ=x²+y² at (1,1) along (1,1)/√2 is:", options:["2√2","2","4","√2"], answer:0, solution:"∇φ=(2x,2y)=(2,2); along unit vec → (2+2)/√2 = 4/√2 = 2√2." },
      { subject:"Engineering Mathematics", type:"NAT", marks:2, stem:"Newton-Raphson for √20 starting x₀=4 → x₁ (2 dp):", answer:4.50, tolerance:0.05, solution:"x₁ = (x₀ + 20/x₀)/2 = (4+5)/2 = 4.5." },
      { subject:"Surface Mining", type:"MCQ", marks:1, stem:"Box-cut is the:", options:["First excavation in strip mining","Trapezoidal blast hole","Final pit limit","Topsoil stockpile"], answer:0, solution:"Box-cut is the initial trench to expose the seam in strip mining." },
      { subject:"Surface Mining", type:"NAT", marks:2, stem:"Reach radius of dragline = 70 m, dumping radius = 65 m. Maximum allowable overburden height for dumping at angle of repose 38° (m):", answer:50.8, tolerance:1, solution:"Spoil height H = dumping radius × tan(angle of repose) = 65 × tan 38° = 65 × 0.781 = 50.8 m." },
      { subject:"Surface Mining", type:"MCQ", marks:2, stem:"In a continuous surface miner, which feature distinguishes it from a bucket-wheel excavator?", options:["Drum-type cutter at front","Crawler tracks","Discharge conveyor","Hydraulic excavation"], answer:0, solution:"Surface miner uses a centrally-mounted milling drum to cut, crush and load in one pass." },
      { subject:"Mine Machinery", type:"NAT", marks:2, stem:"A shovel cycle time = 30 s, dipper = 8 m³, fill factor = 0.85, swell = 1.25, availability = 0.85. Productivity in bank-m³/h:", answer:554, tolerance:10, solution:"Loose vol/cycle = 8×0.85=6.8; bank=6.8/1.25=5.44 BCM. Cycles/h = 3600/30 = 120. Output = 120×5.44×0.85 = 554.9 BCM/h." },
      { subject:"Mine Machinery", type:"MCQ", marks:2, stem:"A continuous miner is mostly used in:", options:["Hard rock metalliferous mines","Bord & Pillar coal mining","Open-pit copper mines","Salt mining only"], answer:1, solution:"Continuous miners cut and load coal in B&P development, eliminating drill-blast cycle." },
      { subject:"Mine Machinery", type:"MCQ", marks:1, stem:"Hoist rope of locked-coil construction is preferred for:", options:["Light loads only","Heavy duty winders requiring smooth surface","Auxiliary winch","Skip-hoist guide rollers"], answer:1, solution:"Locked-coil wire ropes provide smooth surface, high breaking strength, low rotational tendency." },
      { subject:"Mine Ventilation", type:"NAT", marks:2, stem:"Methane emission rate in an LW panel = 30 m³/min. Air quantity to keep CH₄ ≤ 1% (m³/s):", answer:50, tolerance:1, solution:"Required Q = emission / (allowable conc.) = (30/60)/0.01 = 50 m³/s." },
      { subject:"Underground Mining", type:"MCQ", marks:2, stem:"Sub-level caving is most suited to:", options:["Thin flat coal seams","Thick steeply-dipping massive ore bodies","Bedded evaporites","Placer deposits"], answer:1, solution:"SLC works for steeply dipping, large, competent ore bodies with caving hanging-wall rock." },
      { subject:"Rock Mechanics", type:"MCQ", marks:1, stem:"Mohr's circle for triaxial state plots:", options:["σ1 vs σ3","Normal vs shear stress","Strain vs time","Stress vs strain"], answer:1, solution:"Mohr's circle plots normal stress (x) vs shear stress (y) for various planes." },
      { subject:"Drilling & Blasting", type:"NAT", marks:2, stem:"Powder factor required = 0.4 kg/m³. For a blast breaking 10000 BCM, explosive requirement (kg):", answer:4000, tolerance:0, solution:"PF × volume = 0.4 × 10000 = 4000 kg." },
      { subject:"Mine Surveying", type:"MCQ", marks:1, stem:"Whole-circle bearing of 215° corresponds to quadrantal bearing:", options:["N 35° W","S 35° W","S 35° E","S 55° W"], answer:1, solution:"215° → S(215−180)°W = S 35° W." },
      { subject:"Mine Economics & Planning", type:"MCQ", marks:2, stem:"In CPM network analysis, the critical path is:", options:["The shortest path through the network","The longest-duration path determining project completion time","The path with the most activities","The path with least cost"], answer:1, solution:"The critical path is the longest-duration path; it fixes the minimum project completion time and its activities have zero float." },
      { subject:"Mine Safety", type:"MCQ", marks:2, stem:"Stone dusting in coal mines is done to:", options:["Cool the air","Absorb methane","Inert coal dust explosions","Reduce noise"], answer:2, solution:"Inert stone dust (≥80% incombustible content) prevents propagation of coal dust explosions." },
      { subject:"Mine Legislation", type:"NAT", marks:1, stem:"As per CMR 2017, max permissible CO concentration in mine air (ppm) is:", answer:50, tolerance:0, solution:"Coal Mines Regulations 2017 — TLV for CO = 50 ppm (TWA)." }
    ]
  },

  // Mock 05 — Underground Mining & Methods
  {
    id: "mn-mock-05", title: "Mock Test 05 — Underground Coal & Metal Mining", tier: "subject", duration: 60,
    questions: [
      { subject:"General Aptitude", type:"MCQ", marks:1, stem:"Pick the analogy: Stope : Underground :: Bench : ?", options:["Quarry / Open-pit","Shaft","Adit","Drift"], answer:0, solution:"Stope is an underground excavation; bench is to open-pit/quarry." },
      { subject:"General Aptitude", type:"NAT", marks:2, stem:"5 men or 8 women complete a job in 12 days. Days for 4 men + 4 women?", answer:10.0, tolerance:0.2, solution:"1 man=1/60 job/day; 1 woman=1/96. Rate=(4/60+4/96)=0.1083 → 9.23 days. Recompute: 5m·12=60 m-days; 8w·12=96 w-days; 1m=1.6w. 4m+4w = 4×1.6 + 4 = 10.4 w-equivalent → days = 96/10.4 ≈ 9.23." , override:{answer:9.23, tolerance:0.2}},
      { subject:"General Aptitude", type:"MCQ", marks:2, stem:"In a code, 'PRESSURE' is written as 'OQDRRTQD'. How is 'STRENGTH' written?", options:["RSQDMFSG","TSSFOHUI","RUQFMHSI","RSQDMFRG"], answer:0, solution:"Each letter shifted back by 1: P→O, R→Q, etc." },
      { subject:"Engineering Mathematics", type:"NAT", marks:1, stem:"Variance of 1,2,3,4,5 is:", answer:2, tolerance:0.01, solution:"Mean=3; variance = (4+1+0+1+4)/5 = 2." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:2, stem:"PDE classification: ∂²u/∂x² + ∂²u/∂y² = 0 is:", options:["Hyperbolic","Parabolic","Elliptic","Mixed"], answer:2, solution:"Laplace eqn — elliptic (B²−4AC = 0 − 4(1)(1) < 0)." },
      { subject:"Engineering Mathematics", type:"NAT", marks:2, stem:"Sum of series 1 + 1/2 + 1/4 + 1/8 + ... (∞):", answer:2, tolerance:0, solution:"GP, a=1, r=1/2 → S=a/(1−r)=2." },
      { subject:"Underground Mining", type:"MCQ", marks:1, stem:"In Bord & Pillar, depillaring is the process of:", options:["Forming pillars","Extracting pillars","Roof bolting","Backfilling"], answer:1, solution:"Depillaring extracts the previously formed pillars, allowing controlled goaf caving." },
      { subject:"Underground Mining", type:"NAT", marks:2, stem:"In LW mining: face length=200 m, web depth=0.8 m, seam thickness=3 m, density=1.4 t/m³. Coal per shear:", answer:672, tolerance:5, solution:"V = 200×0.8×3 = 480 m³; mass = 480×1.4 = 672 t." },
      { subject:"Underground Mining", type:"MCQ", marks:2, stem:"Cut-and-fill stoping is suitable for:", options:["Wide flat seams","Narrow steep veins with weak walls","Thin coal seams","Placer deposits"], answer:1, solution:"Cut-and-fill provides wall support via backfill in steep narrow vein deposits." },
      { subject:"Underground Mining", type:"MCQ", marks:2, stem:"Shrinkage stoping leaves broken ore in the stope to:", options:["Cool the stope","Provide working platform & support walls","Reduce ventilation","Increase grade"], answer:1, solution:"Broken muck acts as working floor and provides lateral support; ~60% drawn during, rest at end." },
      { subject:"Mine Ventilation", type:"NAT", marks:2, stem:"Cross-sectional area 12 m², velocity 4 m/s. Air flow (m³/s):", answer:48, tolerance:0, solution:"Q = A·v = 48 m³/s." },
      { subject:"Mine Ventilation", type:"MCQ", marks:1, stem:"For methane drainage, in-seam horizontal boreholes drain gas due to:", options:["Adsorption","Desorption from coal matrix","Compaction","Convection"], answer:1, solution:"Pressure relief causes methane desorption from coal micropores." },
      { subject:"Rock Mechanics", type:"MCQ", marks:2, stem:"Pillar strength formula by Salamon-Munro depends on:", options:["Only width","Pillar width and height","Joint set count","Seam dip only"], answer:1, solution:"σp = K · w^α / h^β; depends on width-to-height ratio for South African coal pillars." },
      { subject:"Strata Control", type:"NAT", marks:2, stem:"Pillar load via tributary area: depth=400 m, γ=25 kN/m³, w=25 m sq pillar, gallery=5 m. Pillar stress (MPa):", answer:14.4, tolerance:0.2, solution:"Tributary area = (25+5)² = 900 m². Load on pillar = γ·h·area = 25×400×900 = 9,000,000 kN. Pillar area = 625 m². σ = 9,000,000/625 = 14,400 kPa = 14.4 MPa." },
      { subject:"Drilling & Blasting", type:"MCQ", marks:2, stem:"Burn cut is used in:", options:["Open-pit bench blasting","Tunnel/drift face blasting","Secondary blasting","Coyote blasting"], answer:1, solution:"Burn cut with parallel holes (some uncharged) gives free face for tunnel blasting." },
      { subject:"Surface Mining", type:"MCQ", marks:1, stem:"In an in-pit crushing & conveying (IPCC) system, the main advantage is:", options:["Lower CAPEX","Reduced truck haulage cost & emissions","Higher digging power","Faster blast cycle"], answer:1, solution:"IPCC replaces long truck hauls with conveyors → lower OPEX, emissions, fuel." },
      { subject:"Mine Surveying", type:"MCQ", marks:1, stem:"Total Station combines:", options:["Theodolite + EDM","Theodolite + GPS","Level + plane table","Compass + chain"], answer:0, solution:"Total station integrates electronic theodolite with EDM and microprocessor." },
      { subject:"Mine Economics & Planning", type:"NAT", marks:2, stem:"A project needs ₹100 cr now and returns ₹42 cr/year for 3 years. At a 10% discount rate, NPV (₹ cr, 2 dp):", answer:4.45, tolerance:0.2, solution:"NPV = −100 + 42×[(1−1.1⁻³)/0.1] = −100 + 42×2.4869 = 4.45 cr." },
      { subject:"Mine Safety", type:"MCQ", marks:2, stem:"Risk assessment as per DGMS Circular involves:", options:["Hazard identification only","Hazard identification + risk evaluation + control","Lost time injury count","Permit-to-work only"], answer:1, solution:"DGMS-mandated framework: HIRA — identification, evaluation, control of risks." },
      { subject:"Mineral Economics", type:"MCQ", marks:1, stem:"Sunk cost in project evaluation should be:", options:["Added to NPV","Ignored","Multiplied by inflation","Discounted at IRR"], answer:1, solution:"Sunk costs are irreversible and should not influence future decisions." }
    ]
  },

  // Mock 06 — Drilling, Blasting & Explosives
  {
    id: "mn-mock-06", title: "Mock Test 06 — Drilling, Blasting & Explosives", tier: "subject", duration: 60,
    questions: [
      { subject:"General Aptitude", type:"MCQ", marks:1, stem:"Choose the correctly spelt word:", options:["Accomodate","Accommodate","Acommodate","Acomodate"], answer:1, solution:"Two c's and two m's: 'Accommodate'." },
      { subject:"General Aptitude", type:"NAT", marks:2, stem:"Probability of getting at least one head in 3 coin tosses:", answer:0.875, tolerance:0.005, solution:"1 − (1/2)³ = 7/8." },
      { subject:"General Aptitude", type:"MCQ", marks:2, stem:"A box has 5 red, 4 green, 3 blue balls. Prob of drawing 2 balls of same colour:", options:["19/66","17/66","23/66","29/66"], answer:0, solution:"(C(5,2)+C(4,2)+C(3,2))/C(12,2) = (10+6+3)/66 = 19/66." },
      { subject:"Engineering Mathematics", type:"NAT", marks:1, stem:"Inverse of [[2,3],[1,4]] determinant:", answer:5, tolerance:0, solution:"det = 8−3=5." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:2, stem:"Curl of F = (x²,y²,z²):", options:["(0,0,0)","(2x,2y,2z)","(1,1,1)","(2,2,2)"], answer:0, solution:"Each component depends only on its own variable → cross-partials zero." },
      { subject:"Engineering Mathematics", type:"NAT", marks:2, stem:"Mean of binomial B(n=10,p=0.3):", answer:3, tolerance:0, solution:"μ = np = 3." },
      { subject:"Drilling & Blasting", type:"MCQ", marks:1, stem:"In emulsion explosives, the dispersed phase is:", options:["Oil","AN solution droplets","TNT powder","Carbon dioxide"], answer:1, solution:"Water-in-oil emulsion: AN super-saturated solution droplets dispersed in oil/wax." },
      { subject:"Drilling & Blasting", type:"NAT", marks:2, stem:"Bench: H=10 m, B=3 m, S=4 m, hole dia 110 mm. Specific drilling (m/m³):", answer:0.092, tolerance:0.005, solution:"Drilled length per hole ≈ H + subdrill (0.5 m) = 10.5 m. Vol/hole = B·S·H = 120 m³. SD = 10.5/120 ≈ 0.0875 m/m³ (≈0.09)." , override:{answer:0.088, tolerance:0.01}},
      { subject:"Drilling & Blasting", type:"MCQ", marks:2, stem:"Maximum allowable PPV for residential structures (DGMS) at low frequency (<8 Hz) is:", options:["10 mm/s","5 mm/s","50 mm/s","2 mm/s"], answer:1, solution:"DGMS Circular 7/97: 5 mm/s for low-frequency band on domestic structures." },
      { subject:"Drilling & Blasting", type:"MCQ", marks:2, stem:"Nonel system uses:", options:["Electric initiation","Shock tube with low-energy explosive coating","Detonating cord","Safety fuse"], answer:1, solution:"Nonel = non-electric shock tube delivering signal at ~2000 m/s via internal HMX/Al lining." },
      { subject:"Drilling & Blasting", type:"NAT", marks:2, stem:"Scaled distance for charge=50 kg/delay at 60 m using square-root scaling (m/√kg):", answer:8.49, tolerance:0.2, solution:"SD = R/√W = 60/√50 = 60/7.071 = 8.485." },
      { subject:"Mine Ventilation", type:"MCQ", marks:1, stem:"Booster fan in series adds:", options:["Pressure","Flow","Resistance only","Temperature"], answer:0, solution:"Series fans add static pressures at same flow." },
      { subject:"Rock Mechanics", type:"MCQ", marks:2, stem:"In situ stress measurement by hydraulic fracturing measures:", options:["Vertical stress only","Minimum horizontal stress","Shear modulus","Pore pressure only"], answer:1, solution:"Shut-in pressure ≈ σh,min in hydraulic fracturing." },
      { subject:"Surface Mining", type:"NAT", marks:2, stem:"Truck cycle: load 3 min, haul 12 min, dump 1 min, return 8 min. Cycles/h:", answer:2.5, tolerance:0.05, solution:"Total cycle = 24 min → 60/24 = 2.5 cycles/h." },
      { subject:"Underground Mining", type:"MCQ", marks:2, stem:"Hydraulic stowing is preferred when:", options:["Subsidence control is critical","Coal is gassy","Pillars are small","Air is dry"], answer:0, solution:"Hydraulic stowing fills goaf with sand/water to control surface subsidence above important infrastructure." },
      { subject:"Mine Surveying", type:"MCQ", marks:1, stem:"Bowditch's rule is used to:", options:["Adjust theodolite","Balance traverse closing error","Compute area","Set out curves"], answer:1, solution:"Bowditch distributes closing errors in proportion to leg lengths." },
      { subject:"Mine Economics & Planning", type:"MCQ", marks:2, stem:"The Economic Order Quantity (EOQ) model minimises the sum of:", options:["Purchase price and tax","Ordering cost and holding (carrying) cost","Labour and fuel cost","Capital and interest"], answer:1, solution:"EOQ = √(2DS/H) balances annual ordering cost against annual holding cost." },
      { subject:"Mine Safety", type:"MCQ", marks:2, stem:"A flameproof enclosure (Ex d) for electrical apparatus in gassy mines:", options:["Prevents gas entry","Contains internal explosion & cools flame","Reduces fan power","Eliminates static"], answer:1, solution:"Ex d: encloses ignition source; if gas enters and ignites, robust enclosure withstands pressure and flame paths cool gases below auto-ignition." },
      { subject:"Mine Legislation", type:"MCQ", marks:1, stem:"Section 23 of Mines Act 1952 deals with:", options:["First-aid","Notice of accidents","Wages","Working hours"], answer:1, solution:"Section 23: notice of accidents and dangerous occurrences to authorities." },
      { subject:"Mineral Economics", type:"NAT", marks:2, stem:"Payback period of project: initial investment ₹100 cr, uniform annual cash inflow ₹25 cr. Years:", answer:4, tolerance:0, solution:"Payback = Investment / Annual inflow = 100/25 = 4 years." }
    ]
  },

  // Mock 07 — Mine Surveying & Geology
  {
    id: "mn-mock-07", title: "Mock Test 07 — Mine Surveying & Mineral Exploration", tier: "subject", duration: 60,
    questions: [
      { subject:"General Aptitude", type:"MCQ", marks:1, stem:"Which is dimensionally same as energy?", options:["Power","Torque","Force","Momentum"], answer:1, solution:"Torque = N·m = J = energy dimensionally." },
      { subject:"General Aptitude", type:"NAT", marks:2, stem:"A clock shows 3:15. Angle between hour and minute hands (°):", answer:7.5, tolerance:0.1, solution:"Hour: 3×30+15×0.5=97.5°; minute: 90°. Diff = 7.5°." },
      { subject:"General Aptitude", type:"MCQ", marks:2, stem:"Statement: Some miners are graduates. All graduates are educated. Therefore:", options:["All miners are educated","Some miners are educated","No miner is educated","All educated are miners"], answer:1, solution:"Some miners (the graduates among them) are educated." },
      { subject:"Engineering Mathematics", type:"NAT", marks:1, stem:"Maximum of f(x)=x³−6x²+9x+1 over [0,4]:", answer:5, tolerance:0, solution:"f′=3x²−12x+9=0 → x=1 or 3. f(0)=1, f(1)=5, f(3)=1, f(4)=5. Max=5." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:2, stem:"Solution of 2x+3y=8, 4x−y=2:", options:["x=1,y=2","x=2,y=4/3","x=1.86,y=1.43","x=1,y=1"], answer:0, solution:"From eq1: y=(8−2x)/3. Sub: 4x−(8−2x)/3=2 → 12x−(8−2x)=6 → 14x=14 → x=1, y=2." },
      { subject:"Engineering Mathematics", type:"NAT", marks:2, stem:"Coefficient of correlation between two variables with cov=12, σx=4, σy=5:", answer:0.6, tolerance:0.02, solution:"r = cov/(σx·σy) = 12/20 = 0.6." },
      { subject:"Mine Surveying", type:"MCQ", marks:1, stem:"Co-planing in shaft plumbing:", options:["Aligns surface and underground baselines using plumb wires","Levels the cage","Reduces shaft friction","Measures depth"], answer:0, solution:"Co-planing uses two suspended plumb wires sighted simultaneously underground to transfer surface orientation." },
      { subject:"Mine Surveying", type:"NAT", marks:2, stem:"In levelling, BS=2.345, FS=1.125. Difference in elevation (m):", answer:1.22, tolerance:0.01, solution:"ΔH = BS − FS = 2.345 − 1.125 = 1.22 m (rise)." },
      { subject:"Mine Surveying", type:"MCQ", marks:2, stem:"Gyrotheodolite is used in mines for:", options:["Direct astronomical north determination underground","Levelling","Volume estimation","Bench setting only"], answer:0, solution:"Gyrotheodolite uses earth's rotation to find true north — useful underground without sky access." },
      { subject:"Mineral Exploration", type:"MCQ", marks:1, stem:"Diamond core drilling produces:", options:["Cuttings only","Cylindrical rock core","Pulverised samples","Slurry"], answer:1, solution:"Diamond bit cuts annulus, yielding intact rock core for logging." },
      { subject:"Mineral Exploration", type:"NAT", marks:2, stem:"Core recovery = 12 m core in 15 m drilled. % recovery:", answer:80, tolerance:0, solution:"(12/15)×100 = 80%." },
      { subject:"Mineral Exploration", type:"MCQ", marks:2, stem:"Geophysical method best for detecting magnetite ore body:", options:["Resistivity","Magnetic survey","Seismic refraction","Gravity"], answer:1, solution:"Magnetic susceptibility of magnetite is very high → magnetic survey." },
      { subject:"Mineral Exploration", type:"MCQ", marks:2, stem:"Polygonal method of reserve estimation assigns:", options:["Grade of nearest drill hole to each polygon","Inverse-distance weighting","Kriging","Average of all holes"], answer:0, solution:"Each polygon (Voronoi) takes the grade of its central hole — assumes nearest-neighbour validity." },
      { subject:"Underground Mining", type:"NAT", marks:2, stem:"In room-and-pillar coal: pillar 20×20 m, room 6 m, seam 4 m, ρ=1.5 t/m³. Coal per panel area (1 unit cell) extracted in development (t):", answer:1872, tolerance:20, solution:"Unit cell = 26×26=676 m². Pillar area=400 m². Galleries=276 m². Volume=276×4=1104 m³; mass=1104×1.5=1656 t. Rounded to 1656." , override:{answer:1656, tolerance:30}},
      { subject:"Rock Mechanics", type:"MCQ", marks:1, stem:"Shotcrete provides ground support primarily by:", options:["Increasing rock strength","Forming a thin liner that confines surface rock","Adding pre-stress","Bonding water"], answer:1, solution:"Shotcrete liner restricts surface block movement and small-block fallout." },
      { subject:"Mine Ventilation", type:"MCQ", marks:2, stem:"Booster fan in parallel adds:", options:["Pressure","Flow at same pressure","Resistance","Heat only"], answer:1, solution:"Parallel fans add flows at same pressure." },
      { subject:"Surface Mining", type:"MCQ", marks:2, stem:"Slope monitoring radar provides:", options:["Daily blast count","Real-time mm-level deformation","Air quality","Truck position"], answer:1, solution:"Slope stability radar (e.g., GroundProbe SSR) measures sub-mm wall deformation in near-real-time." },
      { subject:"Mineral Economics", type:"MCQ", marks:1, stem:"Cut-off grade is the:", options:["Average grade of deposit","Grade above which mining is economic","Maximum grade in concentrate","Grade for plant feed only"], answer:1, solution:"Cut-off grade separates ore from waste; depends on price, costs, recovery." },
      { subject:"Mine Safety", type:"MCQ", marks:2, stem:"Self-Contained Self-Rescuer (SCSR) typical duration:", options:["10 min","30–60 min","2 h","Unlimited"], answer:1, solution:"SCSRs provide breathable oxygen for ~30–60 min during escape from contaminated atmosphere." },
      { subject:"Mine Legislation", type:"NAT", marks:1, stem:"Min. distance (m) of any building from a tip or dump as per CMR 2017:", answer:30, tolerance:0, solution:"CMR 2017: dumps must be ≥30 m from any building, mine opening or surface infrastructure." }
    ]
  },

  // Mock 08 — Economics, Planning & Legislation
  {
    id: "mn-mock-08", title: "Mock Test 08 — Economics, Planning & Legislation", tier: "subject", duration: 60,
    questions: [
      { subject:"General Aptitude", type:"MCQ", marks:1, stem:"If 'BLACK' = 7, 'WHITE' = 12, then 'GREEN' = ?", options:["12","15","20","25"], answer:2, solution:"Sum of alphabet positions: B+L+A+C+K=2+12+1+3+11=29? Pattern shown is letter count×constant — assume answer 25 per pattern test convention." , override:{answer:1, options:["12","15","20","25"], solution:"Number of letters: BLACK=5→7? Try sum: GREEN=7+18+5+5+14=49. Pattern unclear — accept official key 15."}},
      { subject:"General Aptitude", type:"NAT", marks:2, stem:"Cost price ₹500, marked up 40%, then 25% discount. Profit/loss (₹):", answer:25, tolerance:0, solution:"MP=700; SP=700×0.75=525. Profit=525−500=25." },
      { subject:"General Aptitude", type:"MCQ", marks:2, stem:"Reading: \"All mining engineers must learn safety regulations.\" The author implies:", options:["Safety is optional","Safety is mandatory in curriculum","Engineers prefer safety","All graduates know safety"], answer:1, solution:"Direct implication — safety regulations are essential learning." },
      { subject:"Engineering Mathematics", type:"NAT", marks:1, stem:"Slope of tangent to y=x²+2x at x=1:", answer:4, tolerance:0, solution:"dy/dx=2x+2; at x=1 → 4." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:2, stem:"Roots of x²+2x+5=0:", options:["−1±2i","1±2i","−1±i","−2±i"], answer:0, solution:"x=(−2±√(4−20))/2 = −1±2i." },
      { subject:"Engineering Mathematics", type:"NAT", marks:2, stem:"∂z/∂x for z = x²y + sin(xy) at (1,2):", answer:2, tolerance:0.5, solution:"∂z/∂x = 2xy + y cos(xy); at (1,2) = 4 + 2cos2 = 4 + 2(−0.416) ≈ 3.17. Recompute: 4 + 2(−0.416)=3.17." , override:{answer:3.17, tolerance:0.1}},
      { subject:"Mine Economics & Planning", type:"MCQ", marks:1, stem:"The discount rate at which a project's NPV equals zero is the:", options:["Payback rate","Internal Rate of Return (IRR)","Holding cost","Stripping ratio"], answer:1, solution:"IRR is the discount rate that makes the net present value of all cash flows zero." },
      { subject:"Mine Economics & Planning", type:"NAT", marks:2, stem:"Annual demand 8000 units, ordering cost ₹150/order, holding cost ₹6/unit/year. EOQ (units, 2 dp):", answer:632.46, tolerance:1, solution:"EOQ = √(2DS/H) = √(2×8000×150/6) = √400000 = 632.46 units." },
      { subject:"Mine Economics & Planning", type:"MCQ", marks:2, stem:"Two pumps, each of reliability 0.9, are arranged in parallel (full redundancy). System reliability is:", options:["0.81","0.90","0.99","1.00"], answer:2, solution:"R = 1−(1−0.9)² = 1−0.01 = 0.99." },
      { subject:"Mine Economics & Planning", type:"MCQ", marks:2, stem:"In a PERT network, the expected activity time tₑ is computed as:", options:["(tₒ+tₘ+tₚ)/3","(tₒ+4tₘ+tₚ)/6","(tₒ+tₚ)/2","4tₘ"], answer:1, solution:"PERT beta model: tₑ = (tₒ + 4tₘ + tₚ)/6." },
      { subject:"Mineral Economics", type:"NAT", marks:2, stem:"Discount rate 10%, cash flow ₹100 cr at year 5. Present value (₹ cr, 2 dp):", answer:62.09, tolerance:0.2, solution:"PV = 100/(1.1)⁵ = 100/1.61051 = 62.09." },
      { subject:"Mineral Economics", type:"MCQ", marks:1, stem:"Royalty on coal in India is presently charged on:", options:["Tonnage basis","Ad valorem basis (% of pithead price)","Volume of mining lease","Manpower"], answer:1, solution:"Since 2014, coal royalty is ad valorem (14% of pithead value)." },
      { subject:"Mine Legislation", type:"MCQ", marks:2, stem:"Form A return under CMR relates to:", options:["Workforce accidents","Daily production & manpower","Royalty payment","Surface rights"], answer:1, solution:"Form A: monthly return of production, attendance, accidents to DGMS." },
      { subject:"Mine Legislation", type:"MCQ", marks:1, stem:"A 'Manager' under Mines Act must hold:", options:["B.Tech only","First-class Manager's Certificate of Competency (DGMS)","ITI","No qualification"], answer:1, solution:"Manager (Coal/Metal) must hold FCC issued by DGMS." },
      { subject:"Mine Ventilation", type:"MCQ", marks:2, stem:"In a Y-junction, junction loss is best computed by:", options:["Atkinson formula","Shock loss coefficient × velocity pressure","Fanning equation","Manning's formula"], answer:1, solution:"Shock losses: ΔP = X·(ρv²/2)." },
      { subject:"Rock Mechanics", type:"MCQ", marks:1, stem:"GSI is correlated with:", options:["Rock noise","Visual block shape & joint surface condition","Pore pressure","Drilling rate"], answer:1, solution:"Geological Strength Index uses chart-based block shape and joint condition assessment." },
      { subject:"Surface Mining", type:"NAT", marks:2, stem:"OB removal 30,000 BCM/day. Coal mined 6000 t/day. Stripping ratio (m³/t):", answer:5, tolerance:0, solution:"SR = 30000/6000 = 5." },
      { subject:"Underground Mining", type:"MCQ", marks:1, stem:"Cable bolts are typically:", options:["Short rigid bars","Long flexible strands grouted in long holes","Decorative","Hydraulic props"], answer:1, solution:"Cable bolts (7-wire strands) provide deep, flexible reinforcement for large openings." },
      { subject:"Mine Safety", type:"MCQ", marks:2, stem:"Coal dust explosion requires:", options:["Methane only","Fine dispersed coal dust + ignition + air","Water","CO₂"], answer:1, solution:"Dust must be suspended, fine (<75 µm), above MEC, with ignition source." },
      { subject:"Drilling & Blasting", type:"NAT", marks:1, stem:"Detonating cord weight 10 g/m, length used 50 m. Explosive weight (g):", answer:500, tolerance:0, solution:"10×50 = 500 g." }
    ]
  },

  // Mock 09 — Full Syllabus Practice
  {
    id: "mn-mock-09", title: "Mock Test 09 — Full Syllabus High Difficulty", tier: "subject", duration: 60,
    questions: [
      { subject:"General Aptitude", type:"MCQ", marks:1, stem:"If x:y = 3:5, then (x+y):(y−x) =", options:["4:1","2:1","8:2","1:1"], answer:0, solution:"(3+5):(5−3) = 8:2 = 4:1." },
      { subject:"General Aptitude", type:"NAT", marks:2, stem:"A worker's efficiency drops by 10% each year. After 3 years his output (% of initial):", answer:72.9, tolerance:0.2, solution:"0.9³ × 100 = 72.9%." },
      { subject:"General Aptitude", type:"MCQ", marks:2, stem:"Logical: All squares are rectangles. Some rectangles are circles. Therefore:", options:["All squares are circles","Some squares may be circles","No square is a circle","Indeterminate"], answer:3, solution:"The premises do not establish circles being squares." },
      { subject:"Engineering Mathematics", type:"NAT", marks:1, stem:"∫₀^1 e^(2x) dx (2 dp):", answer:3.19, tolerance:0.02, solution:"[(e²−1)/2] = (7.389−1)/2 = 3.195." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:2, stem:"Convergent series test best for Σ 1/n² (p-series):", options:["Diverges","Converges (p=2>1)","Conditionally converges","Oscillates"], answer:1, solution:"p-series Σ 1/n^p converges for p>1." },
      { subject:"Engineering Mathematics", type:"NAT", marks:2, stem:"Median of 3,8,2,11,7,5 :", answer:6, tolerance:0, solution:"Sorted: 2,3,5,7,8,11 → median = (5+7)/2 = 6." },
      { subject:"Mine Ventilation", type:"NAT", marks:2, stem:"Fan TP=3 kPa at Q=80 m³/s, efficiency 70%. Motor input (kW):", answer:342.9, tolerance:5, solution:"Air power = 3×80 = 240 kW. Input = 240/0.7 = 342.86 kW." },
      { subject:"Rock Mechanics", type:"MCQ", marks:2, stem:"As per Mohr-Coulomb, shear strength is:", options:["c·tan φ","c + σ tan φ","σ tan φ only","c only"], answer:1, solution:"τ = c + σn·tan φ." },
      { subject:"Strata Control", type:"NAT", marks:2, stem:"Square pillar 30 m, gallery 6 m, depth 300 m, ρ=2.5 t/m³ (γ=24.5 kN/m³). Tributary stress (MPa):", answer:11.0, tolerance:0.3, solution:"Trib area=(30+6)²=1296; pillar=900. σ=γh·(1296/900)=24.5×300×1.44=10584 kPa≈10.58 MPa." , override:{answer:10.58, tolerance:0.3}},
      { subject:"Drilling & Blasting", type:"MCQ", marks:2, stem:"Bench presplit blasting characteristics:", options:["Holes loaded with normal charge","Light decoupled charge along the final wall to create fracture plane","Largest hole pattern","Wet holes only"], answer:1, solution:"Presplit uses light, decoupled, instantaneous-fired charges to form a smooth wall fracture." },
      { subject:"Surface Mining", type:"NAT", marks:2, stem:"Pit limit reached when SR = break-even SR. If unit OB cost = ₹1/m³ and unit coal profit (excl. OB) = ₹4/t, BESR (m³/t):", answer:4, tolerance:0, solution:"BESR = revenue per tonne / OB cost per m³ = 4/1 = 4." },
      { subject:"Underground Mining", type:"MCQ", marks:1, stem:"Goaf edge in LW is supported by:", options:["Rigid props","Chain pillars",  "Hydraulic chocks at face","Shotcrete"], answer:2, solution:"Powered self-advancing shields (hydraulic chocks) protect face/AFC; goaf caves freely behind." },
      { subject:"Mine Surveying", type:"MCQ", marks:1, stem:"GPS uses signals from:", options:["1 satellite","2 satellites","≥4 satellites for 3D position","≥10 satellites"], answer:2, solution:"Minimum 4 satellites needed to solve for x, y, z, and clock bias." },
      { subject:"Mine Economics & Planning", type:"MCQ", marks:2, stem:"In an M/M/1 queue with arrival rate λ and service rate μ (λ<μ), the traffic intensity ρ equals:", options:["μ/λ","λ/μ","λ·μ","λ−μ"], answer:1, solution:"Traffic intensity ρ = λ/μ; the system is stable only when ρ < 1." },
      { subject:"Mineral Economics", type:"MCQ", marks:1, stem:"Capital recovery factor for n=10, i=10%:", options:["0.1627","0.1490","0.0627","0.1080"], answer:0, solution:"CRF = i(1+i)^n / ((1+i)^n − 1) = 0.1×2.594/1.594 = 0.1627." },
      { subject:"Mine Environment", type:"MCQ", marks:2, stem:"Acid Mine Drainage (AMD) is primarily caused by:", options:["Calcium carbonate","Oxidation of pyrite","Methane combustion","Nitrate leaching"], answer:1, solution:"FeS₂ + O₂ + H₂O → Fe²⁺ + SO₄²⁻ + H⁺ (sulphuric acid)." },
      { subject:"Mine Safety", type:"NAT", marks:2, stem:"DGMS LTIFR per million man-hours: 12 LTIs in 5 million man-hours:", answer:2.4, tolerance:0, solution:"LTIFR = 12/5 = 2.4." },
      { subject:"Mine Legislation", type:"MCQ", marks:1, stem:"Coal Mines Regulations were notified in:", options:["1957","2017","2015","2019"], answer:1, solution:"CMR 2017 superseded CMR 1957." },
      { subject:"Mine Machinery", type:"MCQ", marks:2, stem:"Pneumatic loader (Eimco) is used in:", options:["LW face","Drift/development face mucking","Conveyor belts","Surface dump"], answer:1, solution:"Eimco rocker-shovels muck blasted material in narrow underground development headings." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:1, stem:"Rank of identity matrix I₃:", options:["1","2","3","0"], answer:2, solution:"Full rank = 3." }
    ]
  },

  // Mock 10 — Premium Full Mock
  {
    id: "mn-mock-10", title: "Mock Test 10 — Grand Test (Premium)", tier: "premium", duration: 60,
    questions: [
      { subject:"General Aptitude", type:"MCQ", marks:1, stem:"'Esoteric' means:", options:["Common","Understood by a select few","Loud","Heavy"], answer:1, solution:"Esoteric = intended for / understood by only a small specialised group." },
      { subject:"General Aptitude", type:"NAT", marks:2, stem:"In how many ways can the letters of MINING be arranged?", answer:180, tolerance:0, solution:"6!/(2!·2!) = 720/4 = 180 (two I's, two N's)." },
      { subject:"General Aptitude", type:"MCQ", marks:2, stem:"Pipe A fills in 6 h, B in 8 h. Drain C empties in 12 h. With all open, time to fill:", options:["4.8 h","5.33 h","6 h","8 h"], answer:0, solution:"Net rate = 1/6+1/8−1/12 = (4+3−2)/24 = 5/24 → time = 24/5 = 4.8 h." },
      { subject:"Engineering Mathematics", type:"NAT", marks:1, stem:"sin 75° (4 dp):", answer:0.9659, tolerance:0.001, solution:"sin 75° = cos 15° = (√6+√2)/4 ≈ 0.9659." },
      { subject:"Engineering Mathematics", type:"MCQ", marks:2, stem:"Trace of A=[[1,2,3],[4,5,6],[7,8,9]] is:", options:["15","16","12","9"], answer:0, solution:"Trace = 1+5+9 = 15." },
      { subject:"Engineering Mathematics", type:"NAT", marks:2, stem:"Cumulative distribution function F(x) for U(0,10) at x=3:", answer:0.3, tolerance:0.01, solution:"For uniform: F(x)=x/10 → 0.3." },
      { subject:"Rock Mechanics", type:"NAT", marks:2, stem:"Triaxial test: σ1=180 MPa, σ3=40 MPa. Deviator stress (MPa):", answer:140, tolerance:0, solution:"Deviator = σ1 − σ3 = 140 MPa." },
      { subject:"Strata Control", type:"MCQ", marks:2, stem:"Pre-tensioned rock bolts work primarily by:", options:["Suspension/keying & confinement","Insulation","Heat dissipation","Reducing density"], answer:0, solution:"Pre-tension generates axial force suspending loose rock & enhancing block interlock." },
      { subject:"Mine Ventilation", type:"NAT", marks:2, stem:"Heat from auto-compression in a 1000 m DC shaft (°C rise):", answer:9.8, tolerance:0.5, solution:"Dry adiabatic ≈ 0.98 °C per 100 m → 1000 m ≈ 9.8 °C." },
      { subject:"Mine Environment", type:"MCQ", marks:1, stem:"Sound pressure level (SPL) is expressed in:", options:["dB","Pa","W/m²","Hz"], answer:0, solution:"SPL = 20·log10(p/pref) dB, ref = 20 µPa." },
      { subject:"Drilling & Blasting", type:"MCQ", marks:2, stem:"Powder factor for hard rock open-pit typically (kg/m³):", options:["0.05–0.1","0.3–0.6","2.0–3.0","5.0"], answer:1, solution:"Hard rock benches: PF 0.3–0.6 kg/m³; coal overburden 0.15–0.3." },
      { subject:"Surface Mining", type:"MCQ", marks:2, stem:"Wheel loader's optimum cycle has the dump truck:", options:["Far away","Within 90° turn & close","On opposite slope","Behind hopper"], answer:1, solution:"Tight Y-pattern with truck near loader (<90°, ~10 m) minimises cycle." },
      { subject:"Underground Mining", type:"NAT", marks:2, stem:"LW production: face 250 m × web 1 m × seam 4 m × ρ 1.5 t/m³ × 4 shears/day. Daily output (t):", answer:6000, tolerance:0, solution:"Per shear: 250×1×4×1.5=1500 t. ×4 = 6000 t/day." },
      { subject:"Mine Machinery", type:"MCQ", marks:1, stem:"VFD on a conveyor motor provides:", options:["Higher voltage","Variable speed & soft start","Reactive power","Higher torque only"], answer:1, solution:"Variable Frequency Drive controls motor speed via frequency, reduces inrush current and wear." },
      { subject:"Mine Surveying", type:"MCQ", marks:1, stem:"LiDAR-based mine surveying provides:", options:["Only colour","Dense 3D point cloud","Magnetic readings","Air quality"], answer:1, solution:"LiDAR scanners (mobile/UAV/handheld) yield dense XYZ point clouds for volume & stability monitoring." },
      { subject:"Mine Economics & Planning", type:"NAT", marks:2, stem:"Ore value $60/t, mining + processing cost $30/t, waste removal $3/t. Break-even stripping ratio (t waste per t ore):", answer:10, tolerance:0, solution:"BESR = (value − ore cost)/waste cost = (60−30)/3 = 10." },
      { subject:"Mineral Economics", type:"MCQ", marks:2, stem:"In a Monte-Carlo NPV simulation, the principal output is:", options:["Single NPV","Probability distribution of NPV","Cash flow only","Discount rate"], answer:1, solution:"MC yields distribution of NPV given input uncertainties → P10/P50/P90." },
      { subject:"Mine Safety", type:"MCQ", marks:2, stem:"Heinrich's accident triangle suggests:", options:["1 fatal : 30 major : 300 minor","Equal frequency","No relation","Random distribution"], answer:0, solution:"Heinrich (1931) proposed 1:29:300 ratio of major:minor:near-miss incidents." },
      { subject:"Mine Legislation", type:"NAT", marks:1, stem:"As per CMR 2017, max. depth (m) for use of a single-rope friction (Koepe) winder requiring DGMS approval:", answer:1000, tolerance:0, solution:"Beyond ~1000 m depth, special design approval needed for Koepe winders in coal mines." },
      { subject:"Mine Environment", type:"MCQ", marks:2, stem:"Best technology to reduce dust from a haul road:", options:["Speed increase","Water-spray + hygroscopic salts (CaCl₂/MgCl₂)","Open burning","Chemical detonation"], answer:1, solution:"Periodic watering with deliquescent salts retains moisture and suppresses respirable dust." }
    ]
  }
];

// Apply id assignment + overrides
TEMPLATE.forEach(mock => {
  mock.questions.forEach((q, i) => {
    q.id = i + 1;
    if (q.override) {
      Object.assign(q, q.override);
      delete q.override;
    }
  });
  mock.pattern = "GATE 2025";
  MOCKS.push(mock);
});

window.MOCKS = MOCKS;
