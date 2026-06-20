/**
 * CrackGate — CIL Management Trainee (Mechanical) Paper-II generator.
 *
 *   npx tsx scripts/cil/mechanical.ts                 # sets 1..15
 *   npx tsx scripts/cil/mechanical.ts --only=11,12
 *   npx tsx scripts/cil/mechanical.ts --from=1 --to=10
 *
 * Paper-I (100 Q) is the shared CIL core. This file supplies only Paper-II
 * (Professional Knowledge, 100 Q = ~60 theory + ~40 numerical) for Mechanical
 * Engineering, authored to be conceptual and fundamentals-first: many items use
 * "which statement is INCORRECT", compare-two-cases and limiting-case framing,
 * and a block of questions carry SVG figures (beams, P–V diagrams, stress–strain
 * curves, Mohr's circle) rendered by the app's QuestionFigure engine.
 */
import {
  mcqFrom,
  fillSpecs,
  rotateSlice,
  drawDistinct,
  shuffleInPlace,
  SUBJ,
  r2,
  r1,
  pick,
} from "../build_cil_civil";
import type { FactQ, Q, SpecGen } from "../build_cil_civil";
import { runDiscipline } from "./core";

// ─── Curated Mechanical theory pool (base: easy / medium) ────────────────────
const MECH_THEORY_POOL: FactQ[] = [
  // Thermodynamics
  { topic: "Thermodynamics", difficulty: "easy", stem: "The first law of thermodynamics is essentially a statement of the conservation of:", correct: "Energy", distractors: ["Mass", "Momentum", "Entropy"], solution: "ΔU = Q − W; energy is conserved as it changes between heat and work." },
  { topic: "Thermodynamics", difficulty: "easy", stem: "The zeroth law of thermodynamics defines the concept of:", correct: "Temperature (thermal equilibrium)", distractors: ["Entropy", "Internal energy", "Enthalpy"], solution: "If two bodies are each in thermal equilibrium with a third, they are with each other — the basis of temperature." },
  { topic: "Thermodynamics", difficulty: "medium", stem: "The second law of thermodynamics implies that heat, on its own, flows from:", correct: "A hotter body to a colder body", distractors: ["A colder body to a hotter body", "Either direction equally", "Low to high pressure only"], solution: "Spontaneous heat flow is from high to low temperature; the reverse needs work (Clausius statement)." },
  { topic: "Thermodynamics", difficulty: "medium", stem: "The efficiency of a Carnot engine operating between T₁ (hot) and T₂ (cold), in kelvin, is:", correct: "1 − T₂/T₁", distractors: ["1 − T₁/T₂", "T₂/T₁", "T₁/(T₁−T₂)"], solution: "Carnot efficiency η = 1 − T₂/T₁ with temperatures in kelvin." },
  { topic: "Thermodynamics", difficulty: "medium", stem: "Enthalpy h is defined as:", correct: "u + pv", distractors: ["u − pv", "u + Ts", "pv − u"], solution: "Enthalpy h = u + pv, a convenient property for flow processes." },
  { topic: "Thermodynamics", difficulty: "easy", stem: "In an isothermal process the property held constant is:", correct: "Temperature", distractors: ["Pressure", "Volume", "Entropy"], solution: "Iso-thermal means constant temperature." },
  { topic: "Thermodynamics", difficulty: "medium", stem: "In an adiabatic process the quantity that is zero is:", correct: "Heat transfer", distractors: ["Work done", "Temperature change", "Pressure change"], solution: "Adiabatic ⇒ Q = 0; the gas may still do work and change temperature." },
  { topic: "Thermodynamics", difficulty: "medium", stem: "In a constant-volume (isochoric) process the work done by a closed system is:", correct: "Zero", distractors: ["Maximum", "Equal to heat added", "Negative"], solution: "W = ∫p dV = 0 when volume is constant, so all heat changes internal energy." },
  { topic: "Thermodynamics", difficulty: "medium", stem: "The ratio of specific heats γ for a gas equals:", correct: "Cp/Cv", distractors: ["Cv/Cp", "Cp − Cv", "Cp·Cv"], solution: "γ = Cp/Cv; for air ≈ 1.4." },
  { topic: "Thermodynamics", difficulty: "easy", stem: "The ideal-gas equation of state is:", correct: "pV = mRT", distractors: ["pV = mRT²", "p/V = mRT", "pV² = mRT"], solution: "pV = mRT relates pressure, volume and absolute temperature for an ideal gas." },
  // Fluid mechanics
  { topic: "Fluid Mechanics", difficulty: "easy", stem: "For steady incompressible flow in a pipe, the continuity equation gives:", correct: "A₁V₁ = A₂V₂", distractors: ["A₁/V₁ = A₂/V₂", "A₁V₁² = A₂V₂²", "A₁ + V₁ = A₂ + V₂"], solution: "Mass conservation for constant density: A₁V₁ = A₂V₂." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "Bernoulli's equation is fundamentally a statement of:", correct: "Conservation of energy along a streamline", distractors: ["Conservation of mass", "Conservation of momentum", "Newton's third law"], solution: "It balances pressure, kinetic and potential energy per unit weight along a streamline (no losses)." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "The Reynolds number represents the ratio of:", correct: "Inertia forces to viscous forces", distractors: ["Viscous to gravity forces", "Pressure to inertia forces", "Surface tension to inertia"], solution: "Re = ρVD/μ = inertia/viscous; it indicates laminar vs turbulent flow." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "Flow in a circular pipe is generally laminar when the Reynolds number is below about:", correct: "2000", distractors: ["200", "20000", "100000"], solution: "Below Re ≈ 2000 pipe flow is laminar; above ~4000 it is turbulent." },
  { topic: "Fluid Mechanics", difficulty: "easy", stem: "The gauge pressure at depth h in a liquid of density ρ is:", correct: "ρgh", distractors: ["ρg/h", "ρh/g", "ρ²gh"], solution: "Hydrostatic pressure p = ρgh increases linearly with depth." },
  { topic: "Fluid Mechanics", difficulty: "easy", stem: "Pascal's law states that pressure applied to a confined fluid is transmitted:", correct: "Equally in all directions", distractors: ["Only downward", "Only along the flow", "Proportional to depth"], solution: "Pressure in a confined static fluid acts equally in every direction — basis of hydraulics." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "A venturimeter is primarily used to measure:", correct: "Flow rate", distractors: ["Viscosity", "Density", "Surface tension"], solution: "It uses the pressure drop at a throat (Bernoulli) to find discharge." },
  { topic: "Fluid Mechanics", difficulty: "medium", stem: "A pitot tube measures the:", correct: "Stagnation (and hence flow) velocity", distractors: ["Density", "Viscosity", "Mass flow only"], solution: "It senses stagnation pressure; the difference from static pressure gives velocity." },
  // Strength of materials
  { topic: "Strength of Materials", difficulty: "easy", stem: "Hooke's law states that, within the elastic limit, stress is:", correct: "Directly proportional to strain", distractors: ["Inversely proportional to strain", "Independent of strain", "Proportional to strain squared"], solution: "σ = Eε within the elastic range; E is Young's modulus." },
  { topic: "Strength of Materials", difficulty: "easy", stem: "Young's modulus is the ratio of:", correct: "Normal stress to normal strain", distractors: ["Shear stress to shear strain", "Stress to volume change", "Lateral to longitudinal strain"], solution: "E = σ/ε for axial loading within the elastic limit." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "Poisson's ratio is the ratio of:", correct: "Lateral strain to longitudinal strain", distractors: ["Longitudinal to lateral strain", "Stress to strain", "Shear to normal stress"], solution: "ν = −(lateral strain)/(longitudinal strain); for metals ≈ 0.3." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "The bending stress in a beam varies with distance y from the neutral axis as:", correct: "σ = My/I", distractors: ["σ = MI/y", "σ = M/(yI)", "σ = y/(MI)"], solution: "Flexure formula σ = My/I; stress is maximum at the outermost fibre." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "For a circular shaft in torsion, the relation T/J = τ/r = Gθ/L is the:", correct: "Torsion equation", distractors: ["Bending equation", "Euler equation", "Continuity equation"], solution: "The torsion equation links torque, polar moment J, shear stress and twist." },
  { topic: "Strength of Materials", difficulty: "easy", stem: "Factor of safety is defined as:", correct: "Ultimate (or yield) stress ÷ working stress", distractors: ["Working stress ÷ ultimate stress", "Strain ÷ stress", "Load ÷ area"], solution: "FoS = failure stress/allowable working stress; it is always greater than 1." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "The moment of inertia of a rectangular section (width b, depth d) about its centroidal horizontal axis is:", correct: "bd³/12", distractors: ["b³d/12", "bd²/6", "bd³/3"], solution: "I = bd³/12 about the centroidal axis parallel to the width." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "A material that undergoes large plastic deformation before fracture is described as:", correct: "Ductile", distractors: ["Brittle", "Elastic", "Isotropic"], solution: "Ductile materials (e.g. mild steel) show significant elongation before failure." },
  { topic: "Strength of Materials", difficulty: "medium", stem: "Resilience of a material refers to its capacity to absorb energy:", correct: "Within the elastic limit", distractors: ["Up to fracture", "Beyond yield only", "During creep"], solution: "Resilience = strain energy stored up to the elastic limit; toughness is up to fracture." },
  // Theory of machines
  { topic: "Theory of Machines", difficulty: "easy", stem: "The velocity ratio of a simple gear train depends on the:", correct: "Number of teeth on the gears", distractors: ["Module only", "Material of gears", "Pressure angle only"], solution: "Speed ratio = N_driver/N_driven = (teeth on driven)/(teeth on driver)." },
  { topic: "Theory of Machines", difficulty: "medium", stem: "The main function of a flywheel is to:", correct: "Reduce fluctuation of speed over a cycle", distractors: ["Control mean speed for load change", "Increase the mean torque", "Eliminate friction"], solution: "A flywheel stores/returns energy to smooth speed fluctuations; a governor controls mean speed." },
  { topic: "Theory of Machines", difficulty: "medium", stem: "The function of a governor is to:", correct: "Keep the mean speed nearly constant under varying load", distractors: ["Smooth cyclic speed fluctuation", "Increase power", "Balance rotating masses"], solution: "A governor adjusts fuel/working-fluid supply to maintain mean speed as load changes." },
  { topic: "Theory of Machines", difficulty: "medium", stem: "The whirling (critical) speed of a shaft corresponds to its:", correct: "Natural frequency of transverse vibration", distractors: ["Maximum torque", "Maximum power", "Zero deflection"], solution: "At the critical speed the rotational speed matches a natural frequency, causing large deflections." },
  { topic: "Theory of Machines", difficulty: "easy", stem: "A cam-and-follower mechanism is used to obtain a:", correct: "Prescribed follower motion from a rotating cam", distractors: ["Constant velocity ratio", "Pure rolling only", "Uniform torque"], solution: "The cam profile dictates the desired displacement–time motion of the follower." },
  { topic: "Theory of Machines", difficulty: "medium", stem: "Balancing of rotating masses is done primarily to:", correct: "Eliminate unbalanced centrifugal forces", distractors: ["Increase speed", "Reduce gear ratio", "Increase inertia"], solution: "Unbalanced rotating masses create centrifugal forces causing vibration; balancing cancels them." },
  // Heat transfer
  { topic: "Heat Transfer", difficulty: "medium", stem: "Fourier's law governs heat transfer by:", correct: "Conduction", distractors: ["Convection", "Radiation", "Evaporation"], solution: "q = −kA dT/dx is the law of heat conduction." },
  { topic: "Heat Transfer", difficulty: "medium", stem: "Newton's law of cooling describes heat transfer by:", correct: "Convection", distractors: ["Conduction", "Radiation", "Diffusion"], solution: "q = hAΔT relates convective heat transfer to the surface–fluid temperature difference." },
  { topic: "Heat Transfer", difficulty: "medium", stem: "The Stefan–Boltzmann law states that radiated energy is proportional to:", correct: "The fourth power of absolute temperature", distractors: ["Temperature", "Square of temperature", "Cube of temperature"], solution: "E = σT⁴ for a black body; radiation rises steeply with temperature." },
  { topic: "Heat Transfer", difficulty: "easy", stem: "The SI unit of thermal conductivity is:", correct: "W/(m·K)", distractors: ["W/m²", "J/kg·K", "W·m·K"], solution: "Thermal conductivity k is measured in watt per metre per kelvin." },
  { topic: "Heat Transfer", difficulty: "medium", stem: "In a heat exchanger, LMTD stands for the log-mean of the:", correct: "Temperature differences at the two ends", distractors: ["Mass flow rates", "Heat capacities", "Pressure drops"], solution: "LMTD averages the end temperature differences for the heat-transfer rate Q = UA·LMTD." },
  // IC engines / refrigeration
  { topic: "IC Engines", difficulty: "medium", stem: "The air-standard cycle for a spark-ignition (petrol) engine is the:", correct: "Otto cycle", distractors: ["Diesel cycle", "Rankine cycle", "Brayton cycle"], solution: "SI engines approximate the constant-volume heat-addition Otto cycle." },
  { topic: "IC Engines", difficulty: "medium", stem: "The air-standard cycle for a compression-ignition (diesel) engine is the:", correct: "Diesel cycle", distractors: ["Otto cycle", "Rankine cycle", "Stirling cycle"], solution: "CI engines approximate the constant-pressure heat-addition Diesel cycle." },
  { topic: "IC Engines", difficulty: "easy", stem: "A four-stroke engine completes one power stroke every:", correct: "Two revolutions of the crankshaft", distractors: ["One revolution", "Four revolutions", "Half a revolution"], solution: "Suction, compression, power and exhaust occupy two crankshaft revolutions." },
  { topic: "Refrigeration", difficulty: "medium", stem: "The coefficient of performance (COP) of a refrigerator is:", correct: "Refrigerating effect ÷ work input", distractors: ["Work input ÷ refrigerating effect", "Heat rejected ÷ work input", "Work ÷ heat rejected"], solution: "COP_ref = Q_absorbed/W_input, and can be greater than 1." },
  // Power plant / Rankine
  { topic: "Power Engineering", difficulty: "medium", stem: "The Rankine cycle is the ideal cycle for a:", correct: "Steam power plant", distractors: ["Gas turbine", "Petrol engine", "Refrigerator"], solution: "The Rankine cycle (boiler–turbine–condenser–pump) models vapour power plants." },
  { topic: "Power Engineering", difficulty: "medium", stem: "The Brayton cycle is the ideal cycle for a:", correct: "Gas turbine", distractors: ["Steam turbine", "Diesel engine", "Refrigerator"], solution: "The Brayton (Joule) cycle models gas-turbine plants with constant-pressure heat addition." },
  // Manufacturing / materials
  { topic: "Manufacturing", difficulty: "easy", stem: "In a lathe, the principal cutting operation produces a surface of revolution by:", correct: "Turning", distractors: ["Milling", "Drilling", "Grinding"], solution: "Turning removes material from a rotating workpiece using a single-point tool." },
  { topic: "Engineering Materials", difficulty: "medium", stem: "The heat-treatment process used to soften steel and relieve internal stresses is:", correct: "Annealing", distractors: ["Hardening", "Tempering after quench only", "Nitriding"], solution: "Annealing heats and slowly cools steel, softening it and relieving stresses." },
  { topic: "Engineering Materials", difficulty: "easy", stem: "The Brinell and Rockwell tests are used to measure a material's:", correct: "Hardness", distractors: ["Toughness", "Ductility", "Density"], solution: "Both are indentation hardness tests." },
  { topic: "Engineering Materials", difficulty: "medium", stem: "Slow, continuous deformation of a material under constant load at high temperature is called:", correct: "Creep", distractors: ["Fatigue", "Yielding", "Resilience"], solution: "Creep is time-dependent plastic strain that becomes significant at high temperature." },
  { topic: "Machine Design", difficulty: "medium", stem: "The endurance (fatigue) limit of a material is the stress below which it:", correct: "Can endure virtually infinite load cycles", distractors: ["Fails in one cycle", "Yields immediately", "Creeps rapidly"], solution: "Below the endurance limit, ferrous materials survive an effectively unlimited number of cycles." },
  { topic: "Machine Design", difficulty: "medium", stem: "A sudden change of cross-section in a loaded part causes:", correct: "Stress concentration", distractors: ["Stress relief", "Uniform stress", "Lower local stress"], solution: "Geometric discontinuities raise local stress well above the nominal value." },
];

// ─── Hard Mechanical theory (conceptual, multi-idea) ─────────────────────────
const MECH_HARD_THEORY: FactQ[] = [
  { topic: "Thermodynamics", difficulty: "hard", stem: "Between two fixed temperature reservoirs, the Carnot engine is special because it has:", correct: "The maximum possible efficiency, being fully reversible", distractors: ["The maximum work but lower efficiency than real engines", "Efficiency independent of the temperatures", "100% efficiency"], solution: "No engine between the same two temperatures can exceed Carnot efficiency, because Carnot is reversible." },
  { topic: "Thermodynamics", difficulty: "hard", stem: "For any irreversible process in an isolated system, the total entropy:", correct: "Increases", distractors: ["Decreases", "Stays constant", "May increase or decrease"], solution: "The second law: entropy of an isolated system increases for irreversible processes (= 0 only if reversible)." },
  { topic: "Thermodynamics", difficulty: "hard", stem: "The Clausius inequality ∮ dQ/T ≤ 0 is satisfied with the equality sign only for:", correct: "A reversible cycle", distractors: ["An irreversible cycle", "An adiabatic cycle", "Any real cycle"], solution: "∮dQ/T = 0 for reversible cycles and < 0 for irreversible ones." },
  { topic: "Thermodynamics", difficulty: "hard", stem: "A throttling (Joule–Thomson) process across a valve is characterised by constant:", correct: "Enthalpy", distractors: ["Temperature", "Entropy", "Internal energy"], solution: "Adiabatic throttling with negligible KE/PE keeps h₁ = h₂; temperature usually changes." },
  { topic: "Thermodynamics", difficulty: "hard", stem: "The COP of a reversed Carnot refrigerator working between T₁ (hot) and T₂ (cold) is:", correct: "T₂/(T₁ − T₂)", distractors: ["T₁/(T₁ − T₂)", "(T₁ − T₂)/T₂", "1 − T₂/T₁"], solution: "COP_ref = T_cold/(T_hot − T_cold), with absolute temperatures." },
  { topic: "IC Engines", difficulty: "hard", stem: "The air-standard efficiency of the Otto cycle with compression ratio r is:", correct: "1 − 1/r^(γ−1)", distractors: ["1 − 1/r^γ", "1 − r^(γ−1)", "1 − 1/r"], solution: "η_Otto = 1 − 1/r^(γ−1); efficiency rises with compression ratio." },
  { topic: "Fluid Mechanics", difficulty: "hard", stem: "Boundary-layer separation on a body occurs primarily because of:", correct: "An adverse pressure gradient", distractors: ["A favourable pressure gradient", "Constant pressure", "Laminar flow only"], solution: "When pressure rises in the flow direction, near-wall fluid decelerates and reverses, separating the layer." },
  { topic: "Fluid Mechanics", difficulty: "hard", stem: "For a flow with Mach number greater than 1, the flow is described as:", correct: "Supersonic", distractors: ["Subsonic", "Incompressible", "Laminar"], solution: "Mach number M = V/a; M > 1 is supersonic, where compressibility effects dominate." },
  { topic: "Fluid Mechanics", difficulty: "hard", stem: "In a converging subsonic nozzle, as area decreases the velocity ____ and pressure ____:", correct: "Increases; decreases", distractors: ["Decreases; increases", "Increases; increases", "Decreases; decreases"], solution: "Continuity speeds up the flow; Bernoulli then drops the pressure as velocity rises." },
  { topic: "Strength of Materials", difficulty: "hard", stem: "On Mohr's circle for plane stress, the principal stresses are located at:", correct: "The points where the circle crosses the normal-stress axis (shear = 0)", distractors: ["The top and bottom of the circle", "The centre of the circle", "Where shear is maximum"], solution: "Principal stresses occur where shear stress is zero — the circle's intersections with the σ axis." },
  { topic: "Strength of Materials", difficulty: "hard", stem: "A long, slender column under axial compression is most likely to fail by:", correct: "Buckling", distractors: ["Crushing", "Shear", "Torsion"], solution: "Slender columns fail by elastic buckling (Euler) well before the crushing stress is reached." },
  { topic: "Strength of Materials", difficulty: "hard", stem: "Euler's critical buckling load of a column is proportional to:", correct: "EI and inversely to the square of effective length", distractors: ["EI and inversely to the length", "Cross-section area only", "The yield stress"], solution: "P_cr = π²EI/L_e²; it depends on flexural rigidity and end conditions, not directly on yield stress." },
  { topic: "Machine Design", difficulty: "hard", stem: "The maximum-shear-stress (Tresca) theory of failure compares the maximum shear stress with:", correct: "Half the yield stress in simple tension", distractors: ["The full yield stress", "The ultimate stress", "Twice the yield stress"], solution: "Tresca predicts yielding when τ_max = σ_yield/2 (the shear at yield in a tensile test)." },
  { topic: "Heat Transfer", difficulty: "hard", stem: "Adding a fin to a surface improves heat dissipation only when the fin's:", correct: "Effectiveness is greater than one", distractors: ["Length is maximum", "Conductivity is low", "Base temperature is low"], solution: "A fin helps only if it transfers more heat than the bare base area it covers (effectiveness > 1)." },
  { topic: "Heat Transfer", difficulty: "hard", stem: "In the effectiveness–NTU method, NTU (number of transfer units) is defined as:", correct: "UA/C_min", distractors: ["C_min/UA", "UA·C_min", "Q/ΔT"], solution: "NTU = UA/C_min characterises the heat-exchanger size relative to the minimum heat-capacity rate." },
  { topic: "Theory of Machines", difficulty: "hard", stem: "The gyroscopic couple acting on a rotating disc of moment of inertia I, spin ω and precession Ω is:", correct: "I·ω·Ω", distractors: ["I·ω/Ω", "½I·ω²", "I·Ω/ω"], solution: "Gyroscopic couple C = Iω·Ω, perpendicular to both spin and precession axes." },
  { topic: "Machine Design", difficulty: "hard", stem: "Fatigue failure of a component typically occurs at a stress that is:", correct: "Below the static yield stress, after many cycles", distractors: ["Above the ultimate stress in one cycle", "Equal to the yield stress every time", "Only at very low cycles"], solution: "Repeated/fluctuating loads cause crack growth and failure below the static yield strength." },
  { topic: "Strength of Materials", difficulty: "hard", stem: "For most engineering metals, the theoretical upper limit of Poisson's ratio is:", correct: "0.5", distractors: ["0.3", "1.0", "0.0"], solution: "ν = 0.5 corresponds to an incompressible material; real metals are ≈ 0.25–0.35." },
];

// ─── Tricky conceptual pool (INCORRECT / compare / limiting case) ────────────
const MECH_TRICKY_POOL: FactQ[] = [
  { topic: "IC Engines", difficulty: "hard", stem: "Which statement about engine cycles is INCORRECT?", correct: "Increasing the compression ratio decreases the Otto-cycle efficiency", distractors: ["Otto efficiency rises with compression ratio", "Diesel engines use higher compression ratios than petrol engines", "Knock limits the compression ratio of SI engines"], solution: "η_Otto = 1 − 1/r^(γ−1) increases with r — so the 'decreases' statement is wrong." },
  { topic: "Refrigeration", difficulty: "hard", stem: "For the same machine, the COP of a heat pump and that of a refrigerator are related by:", correct: "COP_heat-pump = COP_refrigerator + 1", distractors: ["They are always equal", "COP_heat-pump = COP_refrigerator − 1", "COP_heat-pump is always less than 1"], solution: "Heat rejected = heat absorbed + work, so COP_HP = COP_ref + 1." },
  { topic: "Thermodynamics", difficulty: "hard", stem: "Which statement is INCORRECT for an adiabatic process?", correct: "The temperature of the gas cannot change", distractors: ["No heat crosses the boundary", "Work can still be done", "Internal energy can change"], solution: "Adiabatic means Q = 0, but expansion/compression changes temperature and internal energy." },
  { topic: "Thermodynamics", difficulty: "hard", stem: "During throttling of a real gas through a valve, the quantity that stays essentially constant is:", correct: "Enthalpy (temperature generally changes)", distractors: ["Temperature", "Entropy", "Volume"], solution: "Throttling is isenthalpic; the Joule–Thomson effect generally changes temperature." },
  { topic: "Strength of Materials", difficulty: "hard", stem: "If the diameter of a solid circular shaft is doubled (same material, same shear stress), the torque it can transmit increases by a factor of about:", correct: "8", distractors: ["2", "4", "16"], solution: "Torque capacity ∝ d³ (T = τ·πd³/16), so doubling d gives 2³ = 8×." },
  { topic: "Strength of Materials", difficulty: "hard", stem: "If the depth of a rectangular beam is doubled (same width and load), its bending strength (resisting moment) increases by a factor of:", correct: "4", distractors: ["2", "8", "16"], solution: "Section modulus Z = bd²/6 ∝ d², so the moment capacity rises 2² = 4×." },
  { topic: "Fluid Mechanics", difficulty: "hard", stem: "Which statement about pipe flow is INCORRECT?", correct: "Doubling the mean velocity halves the frictional head loss in turbulent flow", distractors: ["Turbulent head loss roughly varies with velocity squared", "Reynolds number rises with velocity", "Laminar flow has a parabolic velocity profile"], solution: "In turbulent flow head loss ∝ V², so doubling V roughly quadruples it — the statement is wrong." },
  { topic: "Heat Transfer", difficulty: "hard", stem: "Rank the typical thermal conductivities from highest to lowest:", correct: "Metals > liquids > gases", distractors: ["Gases > liquids > metals", "Liquids > metals > gases", "Gases > metals > liquids"], solution: "Free electrons make metals best conductors; gases, with sparse molecules, are poorest." },
  { topic: "Strength of Materials", difficulty: "hard", stem: "A short, stocky member under axial compression most likely fails by ____, while a long slender one fails by ____:", correct: "Crushing; buckling", distractors: ["Buckling; crushing", "Shear; torsion", "Fatigue; creep"], solution: "Stocky columns crush at the yield stress; slender columns buckle elastically first." },
  { topic: "Thermodynamics", difficulty: "hard", stem: "Which comparison of specific heats is correct for a gas?", correct: "Cp is greater than Cv", distractors: ["Cv is greater than Cp", "Cp equals Cv", "Cp = 2Cv always"], solution: "At constant pressure some heat does expansion work, so Cp > Cv (Cp − Cv = R for an ideal gas)." },
  { topic: "Thermodynamics", difficulty: "hard", stem: "During the melting of ice at atmospheric pressure, while heat is being added the temperature:", correct: "Stays constant (latent heat)", distractors: ["Rises steadily", "Falls", "Rises then falls"], solution: "Latent heat of fusion changes phase at constant temperature." },
  { topic: "Refrigeration", difficulty: "hard", stem: "Which statement about a refrigerator's COP is correct?", correct: "It can exceed 1", distractors: ["It can never exceed 1", "It equals the Carnot engine efficiency", "It is always less than 0.5"], solution: "COP_ref = Q_cold/W can be well above 1 because it moves more heat than the work supplied." },
  { topic: "Machine Design", difficulty: "hard", stem: "Stress concentration at a notch is most severe when the notch is:", correct: "Sharp (small fillet radius)", distractors: ["Smooth with a large radius", "Absent", "Filled with material"], solution: "The stress-concentration factor rises sharply as the fillet radius decreases." },
  { topic: "Theory of Machines", difficulty: "hard", stem: "Two springs of stiffness k each are connected in series. The combined stiffness is:", correct: "k/2 (softer)", distractors: ["2k (stiffer)", "k", "4k"], solution: "Series springs: 1/k_eq = 1/k + 1/k ⇒ k_eq = k/2, so the combination is softer." },
  { topic: "Fluid Mechanics", difficulty: "hard", stem: "In a flowing fluid, the static pressure is lowest where the velocity is:", correct: "Highest", distractors: ["Lowest", "Zero", "Constant"], solution: "By Bernoulli, higher velocity along a streamline corresponds to lower static pressure." },
  { topic: "Heat Transfer", difficulty: "hard", stem: "Heat transfer by radiation becomes the dominant mode when the temperatures are:", correct: "Very high", distractors: ["Very low", "Near absolute zero", "Around room temperature only"], solution: "Radiation ∝ T⁴, so it dominates at high temperatures (furnaces, the sun)." },
  { topic: "Thermodynamics", difficulty: "hard", stem: "Comparing engines between identical temperature limits, which is true?", correct: "No real engine can exceed the Carnot efficiency", distractors: ["A real engine can exceed Carnot if well designed", "All engines have the same efficiency", "Carnot efficiency depends on the working fluid"], solution: "Carnot efficiency is the upper bound and is independent of the working substance." },
  { topic: "Strength of Materials", difficulty: "hard", stem: "Resilience and toughness differ because resilience is energy absorbed ____ whereas toughness is energy absorbed ____:", correct: "Up to the elastic limit; up to fracture", distractors: ["Up to fracture; up to the elastic limit", "During creep; during fatigue", "In tension; in compression"], solution: "Resilience = elastic strain energy; toughness = total energy absorbed up to fracture." },
];

// ─── Mechanical numerical generators (parametric) ────────────────────────────
const MECH_NUM_GENERATORS: SpecGen[] = [
  // Carnot efficiency
  (rand) => {
    const t1 = pick(rand, [600, 700, 800, 900]);
    const t2 = pick(rand, [300, 350, 400]);
    const eff = r1((1 - t2 / t1) * 100);
    return {
      topic: "Thermodynamics", difficulty: "medium",
      stem: `A Carnot engine works between ${t1} K and ${t2} K. Its efficiency is about:`,
      correct: `${eff}%`, distractors: [`${r1((t2 / t1) * 100)}%`, `${r1((1 - t1 / t2) * 100)}%`, `${r1(eff + 5)}%`],
      solution: `η = 1 − T₂/T₁ = 1 − ${t2}/${t1} = ${eff}%.`,
    };
  },
  // Continuity V2
  (rand) => {
    const a1 = pick(rand, [20, 30, 40]);
    const a2 = pick(rand, [5, 10, 15]);
    const v1 = pick(rand, [2, 3, 4]);
    const v2 = r2((a1 * v1) / a2);
    return {
      topic: "Fluid Mechanics", difficulty: "medium",
      stem: `Water flows from a ${a1} cm² pipe (velocity ${v1} m/s) into a ${a2} cm² pipe. The new velocity is:`,
      correct: `${v2} m/s`, distractors: [`${r2((a2 * v1) / a1)} m/s`, `${r2(v1)} m/s`, `${r2(v2 + 1)} m/s`],
      solution: `A₁V₁ = A₂V₂ ⇒ V₂ = ${a1}×${v1}/${a2} = ${v2} m/s.`,
    };
  },
  // Hydrostatic pressure
  (rand) => {
    const h = pick(rand, [5, 10, 15, 20]);
    const rho = 1000;
    const p = r1((rho * 9.81 * h) / 1000);
    return {
      topic: "Fluid Mechanics", difficulty: "easy",
      stem: `The gauge pressure at a depth of ${h} m in water (ρ = 1000 kg/m³) is about:`,
      correct: `${p} kPa`, distractors: [`${r1(p * 2)} kPa`, `${r1(p / 2)} kPa`, `${r1(p + 10)} kPa`],
      solution: `p = ρgh = 1000×9.81×${h} ≈ ${p} kPa.`,
    };
  },
  // Stress = F/A
  (rand) => {
    const f = pick(rand, [10, 20, 40, 50]); // kN
    const a = pick(rand, [100, 200, 400]); // mm²
    const s = r2((f * 1000) / a);
    return {
      topic: "Strength of Materials", difficulty: "easy",
      stem: `An axial load of ${f} kN acts on a bar of ${a} mm² cross-section. The normal stress is:`,
      correct: `${s} MPa`, distractors: [`${r2(s * 2)} MPa`, `${r2(s / 2)} MPa`, `${r2(s + 10)} MPa`],
      solution: `σ = F/A = ${f}kN/${a}mm² = ${s} MPa.`,
    };
  },
  // Young's modulus
  (rand) => {
    const s = pick(rand, [100, 150, 200]); // MPa
    const e = pick(rand, [0.0005, 0.001, 0.002]);
    const E = r1(s / e / 1000);
    return {
      topic: "Strength of Materials", difficulty: "medium",
      stem: `A specimen shows a stress of ${s} MPa at a strain of ${e}. Its Young's modulus is:`,
      correct: `${E} GPa`, distractors: [`${r1(E / 2)} GPa`, `${r1(E * 2)} GPa`, `${r1(E + 20)} GPa`],
      solution: `E = σ/ε = ${s}MPa/${e} = ${E} GPa.`,
    };
  },
  // Gear output speed
  (rand) => {
    const td = pick(rand, [20, 25, 30]);
    const tn = pick(rand, [40, 50, 60, 75]);
    const ni = pick(rand, [600, 900, 1200]);
    const no = r1((ni * td) / tn);
    return {
      topic: "Theory of Machines", difficulty: "easy",
      stem: `A driver gear (${td} teeth) at ${ni} rpm meshes with a ${tn}-tooth gear. The driven gear speed is:`,
      correct: `${no} rpm`, distractors: [`${r1((ni * tn) / td)} rpm`, `${r1(ni)} rpm`, `${r1(no + 50)} rpm`],
      solution: `N_out = N_in·(T_driver/T_driven) = ${ni}×${td}/${tn} = ${no} rpm.`,
    };
  },
  // Power = T × ω
  (rand) => {
    const T = pick(rand, [50, 100, 150, 200]); // Nm
    const N = pick(rand, [600, 900, 1200, 1500]); // rpm
    const P = r2((2 * Math.PI * N * T) / 60 / 1000);
    return {
      topic: "Theory of Machines", difficulty: "medium",
      stem: `A shaft transmits a torque of ${T} N·m at ${N} rpm. The power transmitted is about:`,
      correct: `${P} kW`, distractors: [`${r2(P * 2)} kW`, `${r2(P / 2)} kW`, `${r2(P + 2)} kW`],
      solution: `P = 2πNT/60 = 2π×${N}×${T}/60 ≈ ${P} kW.`,
    };
  },
  // Reynolds number
  (rand) => {
    const v = pick(rand, [1, 2, 3]); // m/s
    const d = pick(rand, [0.05, 0.1, 0.2]); // m
    const nu = 1e-6; // water
    const Re = r1((v * d) / nu);
    return {
      topic: "Fluid Mechanics", difficulty: "medium",
      stem: `Water (ν = 10⁻⁶ m²/s) flows at ${v} m/s in a ${d} m pipe. The Reynolds number is:`,
      correct: `${Re}`, distractors: [`${r1(Re / 2)}`, `${r1(Re * 2)}`, `${r1(Re + 1000)}`],
      solution: `Re = VD/ν = ${v}×${d}/10⁻⁶ = ${Re}.`,
    };
  },
  // COP refrigerator
  (rand) => {
    const q = pick(rand, [200, 300, 400]); // W
    const w = pick(rand, [50, 100, 150]); // W
    const cop = r2(q / w);
    return {
      topic: "Refrigeration", difficulty: "medium",
      stem: `A refrigerator extracts ${q} W of heat using ${w} W of work. Its COP is:`,
      correct: `${cop}`, distractors: [`${r2(w / q)}`, `${r2((q + w) / w)}`, `${r2(cop + 1)}`],
      solution: `COP = Q/W = ${q}/${w} = ${cop}.`,
    };
  },
  // Heat conduction
  (rand) => {
    const k = pick(rand, [50, 200, 400]); // W/mK
    const a = pick(rand, [0.5, 1, 2]); // m²
    const dt = pick(rand, [50, 100, 150]); // K
    const L = pick(rand, [0.05, 0.1, 0.2]); // m
    const Q = r1((k * a * dt) / L / 1000);
    return {
      topic: "Heat Transfer", difficulty: "medium",
      stem: `A wall (k = ${k} W/m·K, area ${a} m², thickness ${L} m) has a ${dt} K temperature difference. The conduction rate is about:`,
      correct: `${Q} kW`, distractors: [`${r1(Q * 2)} kW`, `${r1(Q / 2)} kW`, `${r1(Q + 5)} kW`],
      solution: `Q = kAΔT/L = ${k}×${a}×${dt}/${L} ≈ ${Q} kW.`,
    };
  },
  // Spring force
  (rand) => {
    const kk = pick(rand, [200, 500, 1000]); // N/m
    const x = pick(rand, [0.02, 0.05, 0.1]); // m
    const F = r1(kk * x);
    return {
      topic: "Theory of Machines", difficulty: "easy",
      stem: `A spring of stiffness ${kk} N/m is stretched ${x} m. The restoring force is:`,
      correct: `${F} N`, distractors: [`${r1(kk / x)} N`, `${r1(F * 2)} N`, `${r1(F + 5)} N`],
      solution: `F = kx = ${kk}×${x} = ${F} N.`,
    };
  },
  // Kinetic energy
  (rand) => {
    const m = pick(rand, [2, 5, 10]); // kg
    const v = pick(rand, [4, 6, 10]); // m/s
    const ke = r1(0.5 * m * v * v);
    return {
      topic: "Engineering Mechanics", difficulty: "easy",
      stem: `A ${m} kg body moves at ${v} m/s. Its kinetic energy is:`,
      correct: `${ke} J`, distractors: [`${r1(m * v)} J`, `${r1(m * v * v)} J`, `${r1(ke + 10)} J`],
      solution: `KE = ½mv² = 0.5×${m}×${v}² = ${ke} J.`,
    };
  },
  // Otto efficiency from r
  (rand) => {
    const r = pick(rand, [6, 8, 10]);
    const g = 1.4;
    const eff = r1((1 - 1 / Math.pow(r, g - 1)) * 100);
    return {
      topic: "IC Engines", difficulty: "medium",
      stem: `An Otto-cycle engine has a compression ratio of ${r} (γ = 1.4). Its air-standard efficiency is about:`,
      correct: `${eff}%`, distractors: [`${r1(eff - 8)}%`, `${r1(eff + 8)}%`, `${r1((1 - 1 / r) * 100)}%`],
      solution: `η = 1 − 1/r^(γ−1) = 1 − 1/${r}^0.4 ≈ ${eff}%.`,
    };
  },
  // Strain
  (rand) => {
    const dl = pick(rand, [0.5, 1, 2]); // mm
    const L = pick(rand, [500, 1000, 2000]); // mm
    const e = r2((dl / L) * 1000);
    return {
      topic: "Strength of Materials", difficulty: "easy",
      stem: `A ${L} mm bar elongates by ${dl} mm under load. Its strain (×10⁻³) is:`,
      correct: `${e}`, distractors: [`${r2(e * 2)}`, `${r2(e / 2)}`, `${r2(e + 0.5)}`],
      solution: `ε = δL/L = ${dl}/${L} = ${e}×10⁻³.`,
    };
  },
  // Flow rate Q=AV
  (rand) => {
    const a = pick(rand, [0.01, 0.02, 0.05]); // m²
    const v = pick(rand, [2, 3, 5]); // m/s
    const Q = r2(a * v * 1000);
    return {
      topic: "Fluid Mechanics", difficulty: "easy",
      stem: `Water flows at ${v} m/s through a pipe of area ${a} m². The volume flow rate is:`,
      correct: `${Q} L/s`, distractors: [`${r2(a / v * 1000)} L/s`, `${r2(Q * 2)} L/s`, `${r2(Q + 5)} L/s`],
      solution: `Q = A·V = ${a}×${v} = ${r2(a * v)} m³/s = ${Q} L/s.`,
    };
  },
];

// ─── Hard Mechanical numerical generators (multi-step) ───────────────────────
const MECH_HARD_NUM: SpecGen[] = [
  // Shaft torsion shear stress 16T/πd³
  (rand) => {
    const T = pick(rand, [200, 400, 600]); // Nm
    const d = pick(rand, [30, 40, 50]); // mm
    const tau = r1((16 * T * 1000) / (Math.PI * Math.pow(d, 3)));
    return {
      topic: "Strength of Materials", difficulty: "hard",
      stem: `A solid shaft of ${d} mm diameter transmits a torque of ${T} N·m. The maximum shear stress is about:`,
      correct: `${tau} MPa`, distractors: [`${r1(tau / 2)} MPa`, `${r1(tau * 2)} MPa`, `${r1(tau + 10)} MPa`],
      solution: `τ = 16T/(πd³) = 16×${T}×10³/(π×${d}³) ≈ ${tau} MPa.`,
    };
  },
  // Cantilever max bending stress
  (rand) => {
    const W = pick(rand, [2, 4, 6]); // kN
    const L = pick(rand, [1, 1.5, 2]); // m
    const b = 50, h = 100; // mm
    const M = W * 1000 * L; // Nm
    const Z = (b * h * h) / 6; // mm³
    const sig = r1((M * 1000) / Z);
    return {
      topic: "Strength of Materials", difficulty: "hard",
      stem: `A cantilever (50×100 mm section) of length ${L} m carries an end load of ${W} kN. The maximum bending stress is about:`,
      correct: `${sig} MPa`, distractors: [`${r1(sig / 2)} MPa`, `${r1(sig * 2)} MPa`, `${r1(sig + 15)} MPa`],
      solution: `M = WL = ${W}kN×${L}m; Z = bh²/6 = ${Z} mm³; σ = M/Z ≈ ${sig} MPa.`,
    };
  },
  // Reversed Carnot COP
  (rand) => {
    const t1 = pick(rand, [300, 310, 320]); // hot K
    const t2 = pick(rand, [260, 270, 280]); // cold K
    const cop = r2(t2 / (t1 - t2));
    return {
      topic: "Refrigeration", difficulty: "hard",
      stem: `A reversed Carnot refrigerator works between ${t1} K and ${t2} K. Its COP is about:`,
      correct: `${cop}`, distractors: [`${r2(t1 / (t1 - t2))}`, `${r2((t1 - t2) / t2)}`, `${r2(cop + 1)}`],
      solution: `COP = T_cold/(T_hot − T_cold) = ${t2}/(${t1}−${t2}) = ${cop}.`,
    };
  },
  // LMTD
  (rand) => {
    const dt1 = pick(rand, [60, 80, 100]);
    const dt2 = pick(rand, [20, 30, 40]);
    const lmtd = r1((dt1 - dt2) / Math.log(dt1 / dt2));
    return {
      topic: "Heat Transfer", difficulty: "hard",
      stem: `A heat exchanger has end temperature differences of ${dt1} K and ${dt2} K. The LMTD is about:`,
      correct: `${lmtd} K`, distractors: [`${r1((dt1 + dt2) / 2)} K`, `${r1(dt1 - dt2)} K`, `${r1(lmtd + 8)} K`],
      solution: `LMTD = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂) = (${dt1}−${dt2})/ln(${dt1}/${dt2}) ≈ ${lmtd} K.`,
    };
  },
  // Carnot work output
  (rand) => {
    const q = pick(rand, [1000, 1500, 2000]); // kJ
    const t1 = pick(rand, [800, 900, 1000]);
    const t2 = pick(rand, [300, 400]);
    const w = r1(q * (1 - t2 / t1));
    return {
      topic: "Thermodynamics", difficulty: "hard",
      stem: `A Carnot engine takes ${q} kJ from a source at ${t1} K and rejects to ${t2} K. The work output is about:`,
      correct: `${w} kJ`, distractors: [`${r1(q * (t2 / t1))} kJ`, `${r1(q)} kJ`, `${r1(w + 100)} kJ`],
      solution: `W = Q·η = ${q}×(1 − ${t2}/${t1}) ≈ ${w} kJ.`,
    };
  },
  // Euler buckling load
  (rand) => {
    const E = 200e9;
    const I = pick(rand, [4, 8, 16]); // ×10⁶ mm⁴... use cm scale
    const L = pick(rand, [2, 3, 4]); // m
    const Pcr = r1((Math.PI * Math.PI * E * (I * 1e-6)) / (L * L) / 1000);
    return {
      topic: "Strength of Materials", difficulty: "hard",
      stem: `A pin-ended column (E = 200 GPa, I = ${I}×10⁻⁶ m⁴, length ${L} m) has an Euler buckling load of about:`,
      correct: `${Pcr} kN`, distractors: [`${r1(Pcr / 2)} kN`, `${r1(Pcr * 2)} kN`, `${r1(Pcr + 50)} kN`],
      solution: `P_cr = π²EI/L² = π²×200e9×${I}e-6/${L}² ≈ ${Pcr} kN.`,
    };
  },
  // Bernoulli velocity from head
  (rand) => {
    const h = pick(rand, [5, 10, 20, 45]); // m
    const v = r2(Math.sqrt(2 * 9.81 * h));
    return {
      topic: "Fluid Mechanics", difficulty: "hard",
      stem: `Water issues from an orifice under a head of ${h} m. The ideal jet velocity (Torricelli) is about:`,
      correct: `${v} m/s`, distractors: [`${r2(Math.sqrt(9.81 * h))} m/s`, `${r2(2 * 9.81 * h)} m/s`, `${r2(v + 3)} m/s`],
      solution: `V = √(2gh) = √(2×9.81×${h}) ≈ ${v} m/s.`,
    };
  },
  // Reheat? simple: Diesel-ish efficiency vs Otto comparison numeric
  (rand) => {
    const q1 = pick(rand, [800, 1000, 1200]); // kJ added
    const q2 = pick(rand, [400, 500, 600]); // kJ rejected
    const eff = r1((1 - q2 / q1) * 100);
    return {
      topic: "Thermodynamics", difficulty: "hard",
      stem: `In a cycle, ${q1} kJ of heat is added and ${q2} kJ rejected per cycle. The thermal efficiency is:`,
      correct: `${eff}%`, distractors: [`${r1((q2 / q1) * 100)}%`, `${r1((q1 / q2) * 100)}%`, `${r1(eff + 6)}%`],
      solution: `η = 1 − Q_rejected/Q_added = 1 − ${q2}/${q1} = ${eff}%.`,
    };
  },
];

// ─── Graphical (SVG) Mechanical figure generators ────────────────────────────
const svg = (markup: string): { kind: "svg"; markup: string } => ({ kind: "svg", markup });

const MECH_FIGURE_GENERATORS: ((rand: () => number) => FactQ)[] = [
  // Simply supported beam, central point load → max BM = WL/4
  (rand) => {
    const W = pick(rand, [10, 20, 30]); // kN
    const L = pick(rand, [4, 6, 8]); // m
    const M = r1((W * L) / 4);
    const markup = `<svg viewBox="0 0 300 110" width="300" height="110"><line x1="30" y1="60" x2="270" y2="60" stroke="#1e293b" stroke-width="3"/><polygon points="30,60 22,78 38,78" fill="none" stroke="#475569" stroke-width="1.5"/><polygon points="270,60 262,78 278,78" fill="none" stroke="#475569" stroke-width="1.5"/><line x1="150" y1="20" x2="150" y2="58" stroke="#dc2626" stroke-width="2"/><polygon points="150,58 145,48 155,48" fill="#dc2626"/><text x="150" y="16" font-size="11" text-anchor="middle" fill="#dc2626">W=${W}kN</text><text x="150" y="96" font-size="10" text-anchor="middle" fill="#475569">span L=${L} m (load at mid-span)</text></svg>`;
    return {
      topic: "Strength of Materials", difficulty: "medium",
      stem: `For the simply supported beam shown (central load W = ${W} kN, span L = ${L} m), the maximum bending moment is:`,
      correct: `${M} kN·m`, distractors: [`${r1((W * L) / 8)} kN·m`, `${r1((W * L) / 2)} kN·m`, `${r1(W * L)} kN·m`],
      solution: `For a central point load, M_max = WL/4 = ${W}×${L}/4 = ${M} kN·m.`,
      figure: { ...svg(markup), caption: "Simply supported beam, central load" },
    };
  },
  // Cantilever with end load → max BM = WL at fixed end
  (rand) => {
    const W = pick(rand, [5, 10, 15]); // kN
    const L = pick(rand, [2, 3, 4]); // m
    const M = r1(W * L);
    const markup = `<svg viewBox="0 0 300 110" width="300" height="110"><rect x="20" y="35" width="12" height="50" fill="#94a3b8"/><line x1="32" y1="60" x2="260" y2="60" stroke="#1e293b" stroke-width="3"/><line x1="260" y1="22" x2="260" y2="58" stroke="#dc2626" stroke-width="2"/><polygon points="260,58 255,48 265,48" fill="#dc2626"/><text x="260" y="18" font-size="11" text-anchor="middle" fill="#dc2626">W=${W}kN</text><text x="150" y="96" font-size="10" text-anchor="middle" fill="#475569">cantilever length L=${L} m (load at free end)</text></svg>`;
    return {
      topic: "Strength of Materials", difficulty: "medium",
      stem: `For the cantilever shown (end load W = ${W} kN, length L = ${L} m), the maximum bending moment (at the fixed end) is:`,
      correct: `${M} kN·m`, distractors: [`${r1((W * L) / 2)} kN·m`, `${r1((W * L) / 4)} kN·m`, `${r1(W * L * 2)} kN·m`],
      solution: `For a cantilever with an end load, M_max = WL = ${W}×${L} = ${M} kN·m at the fixed end.`,
      figure: { ...svg(markup), caption: "Cantilever with end load" },
    };
  },
  // Stress-strain curve → identify yield point
  (rand) => {
    const ys = pick(rand, [250, 300, 350]); // MPa marker label only
    const markup = `<svg viewBox="0 0 280 150" width="280" height="150"><line x1="30" y1="120" x2="260" y2="120" stroke="#94a3b8" stroke-width="1"/><line x1="30" y1="15" x2="30" y2="120" stroke="#94a3b8" stroke-width="1"/><path d="M30 120 L90 50 Q100 45 115 48 L150 40 Q190 30 210 55 L230 95" fill="none" stroke="#2563eb" stroke-width="2"/><circle cx="92" cy="49" r="4" fill="none" stroke="#dc2626" stroke-width="1.5"/><text x="100" y="44" font-size="9" fill="#dc2626">A</text><circle cx="172" cy="33" r="4" fill="none" stroke="#16a34a" stroke-width="1.5"/><text x="178" y="30" font-size="9" fill="#16a34a">B</text><text x="250" y="134" font-size="10" fill="#475569">strain</text><text x="34" y="14" font-size="10" fill="#475569">stress</text></svg>`;
    return {
      topic: "Strength of Materials", difficulty: "medium",
      stem: `On the tensile stress–strain curve shown for mild steel (yield ≈ ${ys} MPa), point A (end of the initial straight line) represents the:`,
      correct: `Yield point (onset of plastic deformation)`, distractors: [`Ultimate tensile strength`, `Fracture point`, `Proportional limit of zero stress`],
      solution: `Point A is the yield point where the linear elastic region ends; the peak (B) is the ultimate strength.`,
      figure: { ...svg(markup), caption: "Tensile stress–strain curve" },
    };
  },
  // P-V diagram → identify isothermal/adiabatic
  (rand) => {
    const v1 = pick(rand, [1, 2]); // marker
    const markup = `<svg viewBox="0 0 260 150" width="260" height="150"><line x1="30" y1="120" x2="240" y2="120" stroke="#94a3b8" stroke-width="1"/><line x1="30" y1="15" x2="30" y2="120" stroke="#94a3b8" stroke-width="1"/><path d="M50 30 C 90 70 140 100 220 112" fill="none" stroke="#2563eb" stroke-width="2"/><path d="M50 45 C 95 85 150 108 220 118" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 3"/><text x="150" y="60" font-size="9" fill="#2563eb">curve 1 (steeper)</text><text x="150" y="100" font-size="9" fill="#dc2626">curve 2 (flatter)</text><text x="232" y="134" font-size="10" fill="#475569">V</text><text x="34" y="14" font-size="10" fill="#475569">p</text></svg>`;
    return {
      topic: "Thermodynamics", difficulty: "hard",
      stem: `On the p–V diagram shown, two expansions start from the same state (V₁ ≈ ${v1}). The steeper curve (1) is the:`,
      correct: `Adiabatic process (pV^γ = const, steeper)`, distractors: [`Isothermal process (steeper than adiabatic)`, `Constant-pressure process`, `Constant-volume process`],
      solution: `Adiabatic curves (pV^γ) are steeper than isothermal curves (pV) on a p–V diagram because γ > 1.`,
      figure: { ...svg(markup), caption: "p–V diagram: adiabatic vs isothermal" },
    };
  },
  // Pipe contraction (continuity) → V2
  (rand) => {
    const d1 = pick(rand, [10, 12, 20]); // cm
    const d2 = pick(rand, [5, 6, 10]); // cm
    const v1 = pick(rand, [2, 3, 4]); // m/s
    const v2 = r2(v1 * (d1 * d1) / (d2 * d2));
    const markup = `<svg viewBox="0 0 300 110" width="300" height="110"><path d="M20 30 L150 30 L150 45 L280 45 L280 70 L150 70 L150 85 L20 85 Z" fill="none" stroke="#2563eb" stroke-width="2"/><text x="80" y="62" font-size="10" fill="#475569">d₁=${d1}cm</text><text x="210" y="62" font-size="10" fill="#475569">d₂=${d2}cm</text><line x1="60" y1="57" x2="100" y2="57" stroke="#dc2626" stroke-width="2"/><polygon points="100,57 93,53 93,61" fill="#dc2626"/><text x="60" y="48" font-size="9" fill="#dc2626">V₁=${v1}m/s</text></svg>`;
    return {
      topic: "Fluid Mechanics", difficulty: "medium",
      stem: `Water flows through the contracting pipe shown from diameter ${d1} cm (V₁ = ${v1} m/s) to ${d2} cm. The velocity in the smaller section is:`,
      correct: `${v2} m/s`, distractors: [`${r2(v1 * d2 / d1)} m/s`, `${r2(v1)} m/s`, `${r2(v2 + 2)} m/s`],
      solution: `A₁V₁ = A₂V₂ ⇒ V₂ = V₁(d₁/d₂)² = ${v1}×(${d1}/${d2})² = ${v2} m/s.`,
      figure: { ...svg(markup), caption: "Contracting pipe (continuity)" },
    };
  },
];

// ─── Paper-II assembly (60 theory + 40 numerical, 3:2 interleave) ────────────
function genProfessional(rand: () => number, startId: number, setNo: number, tough: boolean): Q[] {
  const out: Q[] = [];
  const hardTheory = MECH_HARD_THEORY;
  const baseTheory = MECH_THEORY_POOL;
  const theorySlice: FactQ[] = tough
    ? [
        ...rotateSlice(MECH_TRICKY_POOL, setNo, 8, 7),
        ...rotateSlice(hardTheory, setNo, 12, 11),
        ...rotateSlice(baseTheory, setNo, 40, 44),
      ]
    : [
        ...rotateSlice(hardTheory, setNo, 16, 11),
        ...rotateSlice(baseTheory, setNo, 44, 44),
      ];
  shuffleInPlace(rand, theorySlice);

  const figItems = drawDistinct(rand, MECH_FIGURE_GENERATORS, 12);
  const numItems: FactQ[] = [
    ...figItems,
    ...fillSpecs(rand, MECH_HARD_NUM, MECH_NUM_GENERATORS, 28, tough ? 10 : 6),
  ];
  shuffleInPlace(rand, numItems);

  const merged: FactQ[] = [];
  let ti = 0;
  let ni = 0;
  for (let k = 0; k < 100; k++) {
    const wantNum = k % 5 === 2 || k % 5 === 4;
    if (wantNum && ni < numItems.length) merged.push(numItems[ni++]);
    else if (ti < theorySlice.length) merged.push(theorySlice[ti++]);
    else if (ni < numItems.length) merged.push(numItems[ni++]);
  }
  merged.forEach((f, i) => {
    const { options, answer } = mcqFrom(rand, f.correct, f.distractors);
    out.push({
      id: startId + i,
      subject: SUBJ.prof,
      topic: f.topic,
      section: "Paper-II",
      type: "MCQ",
      marks: 1,
      difficulty: f.difficulty,
      stem: f.stem,
      options,
      answer,
      solution: f.solution,
      figure: f.figure,
    });
  });
  return out;
}

runDiscipline({
  slug: "mechanical",
  discipline: "Mechanical",
  seedBase: 0x2020000,
  genProfessional,
});
