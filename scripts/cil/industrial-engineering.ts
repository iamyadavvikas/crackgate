/**
 * CrackGate — CIL Management Trainee (Industrial Engineering) Paper-II generator.
 *
 *   npx tsx scripts/cil/industrial-engineering.ts                 # sets 1..15
 *   npx tsx scripts/cil/industrial-engineering.ts --only=11,12
 *   npx tsx scripts/cil/industrial-engineering.ts --from=1 --to=10
 *
 * Paper-I (100 Q) is the shared CIL core. This file supplies only Paper-II
 * (Professional Knowledge, 100 Q = ~60 theory + ~40 numerical) for Industrial
 * Engineering, authored to be conceptual and fundamentals-first, with SVG
 * figures (CPM networks, control charts, break-even and EOQ cost curves)
 * rendered by the app's QuestionFigure engine.
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

// ─── Curated IE theory pool (base: easy / medium) ────────────────────────────
const IE_THEORY_POOL: FactQ[] = [
  // Operations research
  { topic: "Operations Research", difficulty: "easy", stem: "Linear programming is a technique to optimize a linear objective function subject to:", correct: "Linear constraints", distractors: ["Non-linear constraints only", "No constraints", "Random constraints"], solution: "LP maximizes/minimizes a linear objective under a set of linear equality/inequality constraints." },
  { topic: "Operations Research", difficulty: "medium", stem: "In a linear programming problem, the set of all points satisfying the constraints is the:", correct: "Feasible region", distractors: ["Objective line", "Dual region", "Slack region"], solution: "The feasible region is the (convex) set of all solutions meeting every constraint." },
  { topic: "Operations Research", difficulty: "medium", stem: "The simplex method is used to solve:", correct: "Linear programming problems", distractors: ["Non-linear regression", "Differential equations", "Queuing networks"], solution: "Simplex moves along the vertices of the feasible polytope to the optimum of an LP." },
  { topic: "Operations Research", difficulty: "medium", stem: "The Hungarian method is an efficient algorithm for solving the:", correct: "Assignment problem", distractors: ["Transportation problem", "Knapsack problem", "Shortest-path problem"], solution: "The Hungarian algorithm optimally assigns n jobs to n workers (one-to-one) at minimum cost." },
  { topic: "Operations Research", difficulty: "medium", stem: "A transportation problem seeks to minimize cost of shipping from sources to destinations subject to:", correct: "Supply and demand constraints", distractors: ["Only supply constraints", "Only demand constraints", "No constraints"], solution: "It balances supplies at origins against demands at destinations at least total cost." },
  { topic: "Operations Research", difficulty: "medium", stem: "In an LP, the function being optimized (maximized or minimized) is the:", correct: "Objective function", distractors: ["Constraint", "Slack variable", "Basis"], solution: "The objective function expresses the goal (e.g. profit, cost) as a linear combination of decision variables." },
  // Inventory
  { topic: "Inventory Management", difficulty: "medium", stem: "The Economic Order Quantity (EOQ) minimizes the sum of:", correct: "Ordering cost and carrying (holding) cost", distractors: ["Purchase cost and selling cost", "Setup cost and labour cost", "Transport cost only"], solution: "EOQ balances annual ordering cost against annual holding cost to minimize total inventory cost." },
  { topic: "Inventory Management", difficulty: "medium", stem: "The reorder point (under constant demand) is given by:", correct: "Demand rate × lead time (+ safety stock)", distractors: ["Annual demand ÷ EOQ", "EOQ ÷ 2", "Carrying cost × demand"], solution: "Reorder point = demand during lead time, plus safety stock if demand/lead time vary." },
  { topic: "Inventory Management", difficulty: "medium", stem: "ABC analysis classifies inventory items by their:", correct: "Annual usage value", distractors: ["Physical weight", "Alphabetical order", "Shelf life only"], solution: "'A' items have high value and tight control; 'C' items are low value with loose control." },
  { topic: "Inventory Management", difficulty: "easy", stem: "Safety stock is held primarily to protect against:", correct: "Uncertainty in demand and lead time", distractors: ["Price increases", "Tax changes", "Machine layout"], solution: "Safety (buffer) stock cushions against variability so stockouts are avoided." },
  { topic: "Inventory Management", difficulty: "medium", stem: "The just-in-time (JIT) philosophy aims to:", correct: "Minimize inventory by producing only as needed", distractors: ["Maximize buffer stock", "Increase batch sizes", "Eliminate quality checks"], solution: "JIT pulls production to match demand, driving inventory (and waste) toward zero." },
  // Quality control
  { topic: "Quality Control", difficulty: "medium", stem: "An X̄ (X-bar) control chart is used to monitor the process:", correct: "Mean", distractors: ["Range", "Standard deviation only", "Defect type"], solution: "The X̄ chart tracks the central tendency (mean) of a process over time." },
  { topic: "Quality Control", difficulty: "medium", stem: "An R chart monitors the process:", correct: "Range (variability)", distractors: ["Mean", "Median", "Number of defects"], solution: "The R chart tracks dispersion via the sample range, complementing the X̄ chart." },
  { topic: "Quality Control", difficulty: "medium", stem: "The control limits on a Shewhart control chart are usually set at:", correct: "±3 standard deviations from the centre line", distractors: ["±1 standard deviation", "The specification limits", "±2 standard deviations"], solution: "3σ limits give ~99.7% of points inside when the process is in control (low false alarms)." },
  { topic: "Quality Control", difficulty: "medium", stem: "A Six Sigma process targets a defect level of about:", correct: "3.4 defects per million opportunities", distractors: ["3.4 defects per thousand", "34 defects per million", "340 per million"], solution: "Six Sigma (with 1.5σ shift) corresponds to ~3.4 DPMO." },
  { topic: "Quality Control", difficulty: "medium", stem: "Acceptance sampling is used to decide whether to accept or reject a:", correct: "Lot/batch based on a sample", distractors: ["Single unit only", "Whole production line forever", "Machine setting"], solution: "A sample is inspected and the lot accepted/rejected per the sampling plan." },
  { topic: "Quality Control", difficulty: "medium", stem: "Total Quality Management (TQM) emphasizes:", correct: "Continuous improvement involving everyone", distractors: ["Inspection only at the end", "Quality as the QC department's sole job", "Ignoring customer feedback"], solution: "TQM is an organization-wide, customer-focused, continuous-improvement culture." },
  // Work study
  { topic: "Work Study", difficulty: "medium", stem: "Method study (motion study) is primarily concerned with:", correct: "Finding the best way to do a job", distractors: ["Finding the time a job should take", "Setting wages", "Inspecting quality"], solution: "Method study analyses and improves work methods; time study establishes the standard time." },
  { topic: "Work Study", difficulty: "medium", stem: "Time study is used to establish the:", correct: "Standard time for a task", distractors: ["Best method", "Plant layout", "Selling price"], solution: "Time study (stopwatch) determines how long a qualified worker should take at a defined pace." },
  { topic: "Work Study", difficulty: "medium", stem: "Standard time is obtained from normal time by adding:", correct: "Allowances (rest, personal, contingency)", distractors: ["The rating factor again", "Only fatigue time", "Setup time only"], solution: "Standard time = normal time × (1 + allowance fraction)." },
  { topic: "Work Study", difficulty: "medium", stem: "Normal time is computed from the observed time using the:", correct: "Performance rating factor", distractors: ["Allowance factor", "Utilization factor", "Learning rate"], solution: "Normal time = observed time × performance rating (rating normalizes worker pace)." },
  { topic: "Work Study", difficulty: "easy", stem: "Productivity is defined as the ratio of:", correct: "Output to input", distractors: ["Input to output", "Profit to cost", "Defects to total"], solution: "Productivity = output produced ÷ resources (input) consumed." },
  // Project management
  { topic: "Project Management", difficulty: "medium", stem: "In CPM/PERT, the critical path is the:", correct: "Longest path through the network", distractors: ["Shortest path", "Cheapest path", "Path with the most activities"], solution: "The critical path's length sets the minimum project duration; its activities have zero float." },
  { topic: "Project Management", difficulty: "medium", stem: "Activities on the critical path have a total float of:", correct: "Zero", distractors: ["Maximum", "One day always", "Equal to project duration"], solution: "Any delay on a zero-float (critical) activity delays the whole project." },
  { topic: "Project Management", difficulty: "medium", stem: "PERT differs from CPM mainly in that PERT treats activity times as:", correct: "Probabilistic (three estimates)", distractors: ["Exactly known and deterministic", "Always equal", "Irrelevant"], solution: "PERT uses optimistic, most-likely and pessimistic estimates; CPM uses single deterministic times." },
  { topic: "Project Management", difficulty: "medium", stem: "Reducing an activity's duration by adding resources, at extra cost, is called:", correct: "Crashing", distractors: ["Floating", "Levelling", "Slipping"], solution: "Crashing shortens critical activities at the least incremental cost to compress the schedule." },
  { topic: "Project Management", difficulty: "easy", stem: "A Gantt chart primarily displays:", correct: "Activity schedules against a time axis", distractors: ["Cost vs quantity", "Defects vs cause", "Demand vs price"], solution: "A Gantt (bar) chart shows each task's start/finish along a timeline." },
  // PPC / forecasting
  { topic: "Forecasting", difficulty: "medium", stem: "A simple moving-average forecast gives:", correct: "Equal weight to each period in the window", distractors: ["More weight to older data", "Exponentially decaying weights", "Weight only to the latest period"], solution: "An n-period moving average averages the last n observations equally." },
  { topic: "Forecasting", difficulty: "medium", stem: "In exponential smoothing, a larger smoothing constant α makes the forecast:", correct: "More responsive to recent changes", distractors: ["Smoother and slower to react", "Independent of recent data", "Always constant"], solution: "Higher α weights the latest actual more, tracking changes faster (but noisier)." },
  { topic: "Production Planning", difficulty: "medium", stem: "MRP (Material Requirements Planning) explodes the master schedule using the:", correct: "Bill of materials and inventory records", distractors: ["Control charts", "Queuing model", "Break-even chart"], solution: "MRP nets requirements from the MPS, BOM and on-hand inventory to plan orders." },
  { topic: "Production Planning", difficulty: "medium", stem: "Aggregate planning sets production levels over a horizon of about:", correct: "Several months to a year (medium term)", distractors: ["A few seconds", "Ten years", "One shift only"], solution: "Aggregate (medium-term) planning balances capacity and demand over months." },
  // Layout / economics / reliability
  { topic: "Plant Layout", difficulty: "medium", stem: "In a product (line) layout, machines are arranged:", correct: "In the sequence of operations for the product", distractors: ["By machine function/type", "Randomly", "In a circle always"], solution: "Product layout lines up resources in process order for high-volume, standardized output." },
  { topic: "Plant Layout", difficulty: "medium", stem: "In a process (functional) layout, similar machines are grouped:", correct: "By function/type in departments", distractors: ["In product flow order", "Around a single conveyor", "By worker seniority"], solution: "Process layout suits low-volume, high-variety (job-shop) production." },
  { topic: "Production Planning", difficulty: "medium", stem: "Assembly-line balancing aims to:", correct: "Equalize workload across stations to minimize idle time", distractors: ["Maximize the number of stations", "Increase cycle time", "Eliminate the product"], solution: "Line balancing assigns tasks so station times are nearly equal, reducing bottlenecks and idle time." },
  { topic: "Engineering Economics", difficulty: "medium", stem: "The break-even point is the output level at which:", correct: "Total revenue equals total cost", distractors: ["Profit is maximum", "Fixed cost is zero", "Variable cost is zero"], solution: "At break-even, contribution covers fixed cost exactly, so profit is zero." },
  { topic: "Engineering Economics", difficulty: "medium", stem: "Depreciation in engineering economics represents:", correct: "The decline in value of an asset over time", distractors: ["An increase in asset value", "A type of interest", "A sunk revenue"], solution: "Depreciation allocates an asset's cost over its useful life as it loses value." },
  { topic: "Reliability", difficulty: "medium", stem: "The reliability of a system of components in series is:", correct: "The product of the component reliabilities", distractors: ["The sum of the reliabilities", "The average reliability", "The highest reliability"], solution: "Series system reliability Rs = R₁·R₂·…·Rn; it is lower than any single component." },
  { topic: "Reliability", difficulty: "medium", stem: "Adding components in parallel (redundancy) generally:", correct: "Increases system reliability", distractors: ["Decreases system reliability", "Has no effect", "Increases failure rate"], solution: "Parallel redundancy means the system works if any one path works, raising reliability." },
  { topic: "Operations Research", difficulty: "medium", stem: "Queuing theory analyses systems characterised by:", correct: "Arrivals, service and waiting lines", distractors: ["Only machine layout", "Only inventory levels", "Only depreciation"], solution: "Queuing models study arrival/service rates to predict waiting times and queue lengths." },
  { topic: "Work Study", difficulty: "medium", stem: "The basic fundamental motions identified by the Gilbreths are called:", correct: "Therbligs", distractors: ["Allowances", "Therms", "Microns"], solution: "Therbligs (Gilbreth reversed) are 17–18 elemental hand motions used in micromotion study." },
  { topic: "Material Handling", difficulty: "easy", stem: "A good material-handling system aims to:", correct: "Move material efficiently while minimizing handling", distractors: ["Maximize handling steps", "Increase work-in-process", "Add manual lifting"], solution: "The principle is least handling: move the right material efficiently and safely." },
  { topic: "Ergonomics", difficulty: "easy", stem: "Ergonomics (human factors) is mainly concerned with:", correct: "Fitting the job/workplace to the worker", distractors: ["Fitting the worker to the machine only", "Machine maintenance schedules", "Tax accounting"], solution: "Ergonomics designs tasks and workplaces around human capabilities to improve safety and efficiency." },
  { topic: "Forecasting", difficulty: "medium", stem: "A weighted moving average differs from a simple moving average by:", correct: "Assigning different weights to different periods", distractors: ["Using only one period", "Ignoring all recent data", "Always using equal weights"], solution: "Weighted MA typically gives more weight to recent periods, improving responsiveness." },
  { topic: "Quality Control", difficulty: "medium", stem: "A Pareto chart is used in quality control to:", correct: "Identify the vital few causes of most defects", distractors: ["Track process mean over time", "Show the assembly sequence", "Compute EOQ"], solution: "The Pareto (80/20) chart ranks defect causes so effort targets the most significant few." },
];

// ─── Hard IE theory (conceptual) ─────────────────────────────────────────────
const IE_HARD_THEORY: FactQ[] = [
  { topic: "Operations Research", difficulty: "hard", stem: "The feasible region of a linear program is always:", correct: "A convex set", distractors: ["A concave set", "A single point only", "Non-convex in general"], solution: "Intersection of half-spaces is convex, so the LP optimum lies at a vertex of the convex feasible region." },
  { topic: "Operations Research", difficulty: "hard", stem: "Every linear programming problem (the primal) has an associated:", correct: "Dual problem with related optimal value", distractors: ["No related problem", "Infinite duals with no meaning", "Non-linear equivalent only"], solution: "By LP duality, the primal and dual optima are equal (strong duality) when both are feasible." },
  { topic: "Inventory Management", difficulty: "hard", stem: "At the Economic Order Quantity, the annual ordering cost equals the:", correct: "Annual carrying cost", distractors: ["Annual purchase cost", "Total demand", "Setup time"], solution: "EOQ is where the rising holding-cost curve crosses the falling ordering-cost curve — the two are equal." },
  { topic: "Inventory Management", difficulty: "hard", stem: "If annual demand quadruples, the EOQ (other things equal) changes by a factor of:", correct: "2 (doubles)", distractors: ["4", "8", "16"], solution: "EOQ ∝ √D, so a 4× demand gives √4 = 2× the order quantity." },
  { topic: "Quality Control", difficulty: "hard", stem: "The process capability index Cpk, unlike Cp, accounts for:", correct: "Process centring relative to the specification limits", distractors: ["Only the spread", "Only the sample size", "The control-chart limits"], solution: "Cpk penalizes off-centre processes; Cp assumes perfect centring and uses only the spread." },
  { topic: "Quality Control", difficulty: "hard", stem: "In acceptance sampling, a Type I error (producer's risk) means:", correct: "Rejecting a good lot", distractors: ["Accepting a bad lot", "Inspecting too few units", "Setting wrong limits"], solution: "Type I (α): a genuinely acceptable lot is rejected; Type II (β): a bad lot is accepted." },
  { topic: "Project Management", difficulty: "hard", stem: "The PERT expected time of an activity (optimistic to, most-likely tm, pessimistic tp) is:", correct: "(to + 4·tm + tp)/6", distractors: ["(to + tm + tp)/3", "(to + tp)/2", "(to + 2·tm + tp)/4"], solution: "PERT uses a beta-distribution mean te = (to + 4tm + tp)/6." },
  { topic: "Project Management", difficulty: "hard", stem: "The variance of a PERT activity time is:", correct: "((tp − to)/6)²", distractors: ["((tp − to)/3)²", "(tp − to)/6", "((tp + to)/6)²"], solution: "Activity variance σ² = ((tp − to)/6)²; path variance is the sum along the critical path." },
  { topic: "Operations Research", difficulty: "hard", stem: "Little's law relates the average number in a system (L), arrival rate (λ) and time in system (W) as:", correct: "L = λ·W", distractors: ["L = λ/W", "L = W/λ", "L = λ + W"], solution: "Little's law: average inventory/queue L = arrival rate × average time in system." },
  { topic: "Reliability", difficulty: "hard", stem: "Two components each with reliability 0.9 in parallel give a system reliability of:", correct: "0.99", distractors: ["0.81", "0.90", "1.80"], solution: "Parallel: R = 1 − (1−0.9)(1−0.9) = 1 − 0.01 = 0.99." },
  { topic: "Production Planning", difficulty: "hard", stem: "The balance (line) efficiency of an assembly line is:", correct: "Sum of task times ÷ (number of stations × cycle time)", distractors: ["Cycle time ÷ task time", "Number of stations × cycle time", "Idle time ÷ cycle time"], solution: "Efficiency = Σti/(N·C); the complement is balance delay (idle fraction)." },
  { topic: "Forecasting", difficulty: "hard", stem: "In single exponential smoothing, the new forecast is:", correct: "α·(actual) + (1−α)·(previous forecast)", distractors: ["α·(previous forecast) + (1−α)·(actual)", "(actual + forecast)/2", "α·actual only"], solution: "Ft+1 = α·At + (1−α)·Ft; it is a weighted average favouring recent data as α rises." },
  { topic: "Engineering Economics", difficulty: "hard", stem: "The break-even quantity equals fixed cost divided by the:", correct: "Contribution margin per unit (price − variable cost)", distractors: ["Selling price", "Variable cost", "Total cost"], solution: "Q_BE = FC/(p − v); each unit's contribution covers fixed cost until break-even." },
  { topic: "Production Planning", difficulty: "hard", stem: "Johnson's rule is used to sequence n jobs through:", correct: "Two machines to minimize makespan", distractors: ["One machine for cost", "Three machines for cost", "Any number of machines for profit"], solution: "Johnson's rule gives the optimal job sequence on two machines minimizing total completion time." },
  { topic: "Work Study", difficulty: "hard", stem: "If the performance rating of a worker is above 100%, the normal time will be:", correct: "Greater than the observed time", distractors: ["Less than the observed time", "Equal to the observed time", "Zero"], solution: "Normal = observed × rating; a rating >100% (faster than standard pace) raises normal time above observed." },
  { topic: "Quality Control", difficulty: "hard", stem: "Using 3σ control limits, the probability of a point falling outside the limits when the process is in control is about:", correct: "0.27%", distractors: ["5%", "1%", "0.0027%"], solution: "About 99.73% lie within ±3σ, so ~0.27% fall outside by chance (false alarm)." },
];

// ─── Tricky conceptual pool (INCORRECT / compare / limiting) ─────────────────
const IE_TRICKY_POOL: FactQ[] = [
  { topic: "Project Management", difficulty: "hard", stem: "Which statement about the critical path is INCORRECT?", correct: "It is the shortest path through the network", distractors: ["It determines the minimum project duration", "Its activities have zero float", "It is the longest path through the network"], solution: "The critical path is the LONGEST path; calling it the shortest is wrong." },
  { topic: "Inventory Management", difficulty: "hard", stem: "Which statement about EOQ is INCORRECT?", correct: "EOQ increases in direct proportion to annual demand", distractors: ["At EOQ ordering cost equals carrying cost", "EOQ varies with the square root of demand", "EOQ minimizes total inventory cost"], solution: "EOQ ∝ √D, not D; doubling demand raises EOQ only by √2." },
  { topic: "Quality Control", difficulty: "hard", stem: "Which statement about control charts is correct?", correct: "Control limits are based on process variation, not on specifications", distractors: ["Control limits equal the specification limits", "Points within limits always mean zero defects", "Control limits are set at ±1σ"], solution: "Control limits (±3σ) come from the process itself; specification limits come from the customer — they are different." },
  { topic: "Reliability", difficulty: "hard", stem: "Which comparison of system reliability is correct?", correct: "A parallel arrangement is more reliable than the same components in series", distractors: ["Series is more reliable than parallel", "Both give equal reliability", "Series reliability exceeds each component's"], solution: "Series reliability is the product (lower than any part); parallel redundancy raises reliability." },
  { topic: "Project Management", difficulty: "hard", stem: "Which statement comparing PERT and CPM is correct?", correct: "PERT is probabilistic; CPM is deterministic", distractors: ["CPM is probabilistic; PERT is deterministic", "Both are probabilistic", "Neither models time"], solution: "PERT uses three time estimates (probabilistic); CPM uses single deterministic times." },
  { topic: "Operations Research", difficulty: "hard", stem: "Which statement about an LP feasible region is correct?", correct: "It is convex, and the optimum lies at a vertex", distractors: ["It is always non-convex", "The optimum lies at the centre", "It must be unbounded"], solution: "LP feasible regions are convex polytopes; an optimum (if it exists) occurs at a corner point." },
  { topic: "Forecasting", difficulty: "hard", stem: "Which statement about exponential smoothing is correct?", correct: "A higher α makes the forecast react faster to recent data", distractors: ["A higher α makes it smoother", "α must exceed 1", "α has no effect on responsiveness"], solution: "α ∈ (0,1); larger α weights the latest actual more, increasing responsiveness." },
  { topic: "Quality Control", difficulty: "hard", stem: "Which statement about Cp and Cpk is correct?", correct: "Cpk ≤ Cp, with equality only when the process is perfectly centred", distractors: ["Cpk is always greater than Cp", "Cp accounts for centring", "Cpk ignores the spread"], solution: "Cpk penalizes off-centre processes, so Cpk ≤ Cp; they are equal only at perfect centring." },
  { topic: "Plant Layout", difficulty: "hard", stem: "Which statement comparing layouts is correct?", correct: "Product layout suits high-volume standardized output; process layout suits high variety", distractors: ["Product layout suits high variety", "Process layout suits mass production best", "Both are identical"], solution: "Line/product layout = high volume, low variety; functional/process layout = low volume, high variety." },
  { topic: "Inventory Management", difficulty: "hard", stem: "Which statement about JIT is correct?", correct: "JIT reduces inventory by producing to actual demand", distractors: ["JIT maximizes buffer stock", "JIT increases batch sizes", "JIT ignores supplier reliability"], solution: "JIT pulls production to demand with small lots, cutting inventory and exposing waste." },
  { topic: "Quality Control", difficulty: "hard", stem: "In acceptance sampling, which pairing is correct?", correct: "Type I error → rejecting a good lot (producer's risk)", distractors: ["Type I error → accepting a bad lot", "Type II error → rejecting a good lot", "Type I error → no inspection"], solution: "Producer's risk (α) rejects good lots; consumer's risk (β) accepts bad lots." },
  { topic: "Project Management", difficulty: "hard", stem: "Which statement about float (slack) is correct?", correct: "Critical activities have zero total float", distractors: ["Critical activities have maximum float", "All activities have the same float", "Float increases project duration"], solution: "Zero float identifies critical activities; any delay there delays the project." },
  { topic: "Operations Research", difficulty: "hard", stem: "Which statement about Little's law is correct?", correct: "It holds for any stable queuing system regardless of distribution", distractors: ["It applies only to single-server queues", "It requires Poisson arrivals", "It gives L = λ/W"], solution: "L = λW is distribution-free; it applies to any stable system in steady state." },
  { topic: "Engineering Economics", difficulty: "hard", stem: "Which statement about the break-even point is correct?", correct: "Below it the firm makes a loss; above it a profit", distractors: ["At break-even, profit is maximum", "Below break-even there is profit", "Break-even is where variable cost is zero"], solution: "Break-even is zero profit; output above it yields profit, below it a loss." },
];

// ─── IE numerical generators (parametric) ────────────────────────────────────
const IE_NUM_GENERATORS: SpecGen[] = [
  // EOQ
  (rand) => {
    const D = pick(rand, [1000, 2000, 5000, 8000]);
    const S = pick(rand, [20, 40, 50, 100]);
    const H = pick(rand, [2, 4, 5, 8]);
    const eoq = r1(Math.sqrt((2 * D * S) / H));
    return {
      topic: "Inventory Management", difficulty: "medium",
      stem: `Annual demand = ${D} units, ordering cost = ₹${S}/order, holding cost = ₹${H}/unit/yr. The EOQ is about:`,
      correct: `${eoq} units`, distractors: [`${r1(eoq / 2)} units`, `${r1(eoq * 2)} units`, `${r1((D * S) / H)} units`],
      solution: `EOQ = √(2DS/H) = √(2×${D}×${S}/${H}) ≈ ${eoq} units.`,
    };
  },
  // Reorder point
  (rand) => {
    const d = pick(rand, [20, 30, 50, 80]); // per day
    const lt = pick(rand, [3, 5, 7, 10]);
    const rop = d * lt;
    return {
      topic: "Inventory Management", difficulty: "easy",
      stem: `A product is used at ${d} units/day with a lead time of ${lt} days. The reorder point (no safety stock) is:`,
      correct: `${rop} units`, distractors: [`${r1(d / lt)} units`, `${r1(rop / 2)} units`, `${rop + d} units`],
      solution: `ROP = demand rate × lead time = ${d}×${lt} = ${rop} units.`,
    };
  },
  // PERT expected time
  (rand) => {
    const to = pick(rand, [2, 3, 4]);
    const tm = pick(rand, [5, 6, 8]);
    const tp = pick(rand, [10, 12, 14]);
    const te = r2((to + 4 * tm + tp) / 6);
    return {
      topic: "Project Management", difficulty: "medium",
      stem: `A PERT activity has to = ${to}, tm = ${tm}, tp = ${tp} days. Its expected time is:`,
      correct: `${te} days`, distractors: [`${r2((to + tm + tp) / 3)} days`, `${r2((to + tp) / 2)} days`, `${r2(te + 1)} days`],
      solution: `te = (to + 4tm + tp)/6 = (${to} + 4×${tm} + ${tp})/6 = ${te} days.`,
    };
  },
  // PERT standard deviation
  (rand) => {
    const to = pick(rand, [2, 3, 4]);
    const tp = pick(rand, [8, 11, 14, 16]);
    const sd = r2((tp - to) / 6);
    return {
      topic: "Project Management", difficulty: "medium",
      stem: `A PERT activity has to = ${to} and tp = ${tp} days. Its standard deviation is:`,
      correct: `${sd} days`, distractors: [`${r2((tp - to) / 3)} days`, `${r2((tp + to) / 6)} days`, `${r2(sd * 2)} days`],
      solution: `σ = (tp − to)/6 = (${tp} − ${to})/6 = ${sd} days.`,
    };
  },
  // Moving average
  (rand) => {
    const a = pick(rand, [100, 120, 140]);
    const b = pick(rand, [110, 130, 150]);
    const c = pick(rand, [120, 140, 160]);
    const ma = r1((a + b + c) / 3);
    return {
      topic: "Forecasting", difficulty: "easy",
      stem: `The last three demands were ${a}, ${b} and ${c} units. The 3-period moving-average forecast is:`,
      correct: `${ma} units`, distractors: [`${r1((a + b + c) / 2)} units`, `${c} units`, `${r1(ma + 10)} units`],
      solution: `MA = (${a} + ${b} + ${c})/3 = ${ma} units.`,
    };
  },
  // Exponential smoothing
  (rand) => {
    const alpha = pick(rand, [0.1, 0.2, 0.3, 0.5]);
    const actual = pick(rand, [200, 250, 300]);
    const fprev = pick(rand, [180, 220, 280]);
    const f = r1(alpha * actual + (1 - alpha) * fprev);
    return {
      topic: "Forecasting", difficulty: "medium",
      stem: `With α = ${alpha}, last actual = ${actual} and last forecast = ${fprev}, the next exponential-smoothing forecast is:`,
      correct: `${f} units`, distractors: [`${r1((actual + fprev) / 2)} units`, `${actual} units`, `${r1(f + 15)} units`],
      solution: `F = α·A + (1−α)·F_prev = ${alpha}×${actual} + ${r2(1 - alpha)}×${fprev} = ${f} units.`,
    };
  },
  // Break-even quantity
  (rand) => {
    const fc = pick(rand, [10000, 20000, 50000]);
    const p = pick(rand, [50, 80, 100]);
    const v = pick(rand, [30, 50, 60]);
    const be = r1(fc / (p - v));
    return {
      topic: "Engineering Economics", difficulty: "medium",
      stem: `Fixed cost = ₹${fc}, price = ₹${p}/unit, variable cost = ₹${v}/unit. The break-even quantity is:`,
      correct: `${be} units`, distractors: [`${r1(fc / p)} units`, `${r1(fc / v)} units`, `${r1(be + 50)} units`],
      solution: `Q_BE = FC/(p − v) = ${fc}/(${p} − ${v}) = ${be} units.`,
    };
  },
  // Standard time
  (rand) => {
    const nt = pick(rand, [4, 5, 6, 8]);
    const allow = pick(rand, [10, 15, 20]);
    const st = r2(nt * (1 + allow / 100));
    return {
      topic: "Work Study", difficulty: "medium",
      stem: `A task has a normal time of ${nt} min with ${allow}% allowances. Its standard time is:`,
      correct: `${st} min`, distractors: [`${r2(nt * (1 - allow / 100))} min`, `${nt} min`, `${r2(st + 1)} min`],
      solution: `Standard time = normal × (1 + allowance) = ${nt}×(1 + ${allow}/100) = ${st} min.`,
    };
  },
  // Normal time
  (rand) => {
    const ot = pick(rand, [4, 5, 6]);
    const rating = pick(rand, [80, 100, 110, 120]);
    const nt = r2(ot * (rating / 100));
    return {
      topic: "Work Study", difficulty: "medium",
      stem: `A worker's observed time is ${ot} min at a performance rating of ${rating}%. The normal time is:`,
      correct: `${nt} min`, distractors: [`${r2(ot / (rating / 100))} min`, `${ot} min`, `${r2(nt + 1)} min`],
      solution: `Normal time = observed × rating = ${ot}×${rating}% = ${nt} min.`,
    };
  },
  // Productivity
  (rand) => {
    const out = pick(rand, [400, 600, 800]);
    const inp = pick(rand, [40, 50, 80]);
    const prod = r1(out / inp);
    return {
      topic: "Work Study", difficulty: "easy",
      stem: `A line makes ${out} units using ${inp} labour-hours. The labour productivity is:`,
      correct: `${prod} units/hour`, distractors: [`${r1(inp / out)} units/hour`, `${r1(prod / 2)} units/hour`, `${r1(prod + 2)} units/hour`],
      solution: `Productivity = output/input = ${out}/${inp} = ${prod} units/hour.`,
    };
  },
  // Series reliability
  (rand) => {
    const r1v = pick(rand, [0.9, 0.95]);
    const r2v = pick(rand, [0.8, 0.9]);
    const rs = r2(r1v * r2v);
    return {
      topic: "Reliability", difficulty: "medium",
      stem: `Two components of reliability ${r1v} and ${r2v} are in series. The system reliability is:`,
      correct: `${rs}`, distractors: [`${r2(r1v + r2v - 1)}`, `${r2((r1v + r2v) / 2)}`, `${r2(1 - (1 - r1v) * (1 - r2v))}`],
      solution: `Series: Rs = R₁×R₂ = ${r1v}×${r2v} = ${rs}.`,
    };
  },
  // Cycle time / output rate
  (rand) => {
    const ct = pick(rand, [2, 3, 4, 5]); // min
    const shift = pick(rand, [400, 420, 480]); // min
    const output = r1(shift / ct);
    return {
      topic: "Production Planning", difficulty: "medium",
      stem: `An assembly line has a cycle time of ${ct} min and runs for ${shift} min/shift. The shift output is:`,
      correct: `${output} units`, distractors: [`${r1(ct * shift)} units`, `${r1(output / 2)} units`, `${r1(output + 10)} units`],
      solution: `Output = available time / cycle time = ${shift}/${ct} = ${output} units.`,
    };
  },
  // Inventory total cost at EOQ-ish
  (rand) => {
    const D = pick(rand, [2000, 4000]);
    const S = pick(rand, [40, 50]);
    const Q = pick(rand, [200, 400]);
    const orderCost = r1((D / Q) * S);
    return {
      topic: "Inventory Management", difficulty: "medium",
      stem: `With demand ${D}/yr, order cost ₹${S} and order quantity ${Q}, the annual ordering cost is:`,
      correct: `₹${orderCost}`, distractors: [`₹${r1((Q / D) * S)}`, `₹${r1(orderCost * 2)}`, `₹${r1(D * S)}`],
      solution: `Annual ordering cost = (D/Q)×S = (${D}/${Q})×${S} = ₹${orderCost}.`,
    };
  },
  // Parallel reliability
  (rand) => {
    const r1v = pick(rand, [0.8, 0.9]);
    const r2v = pick(rand, [0.7, 0.85]);
    const rp = r2(1 - (1 - r1v) * (1 - r2v));
    return {
      topic: "Reliability", difficulty: "medium",
      stem: `Two components of reliability ${r1v} and ${r2v} are in parallel. The system reliability is:`,
      correct: `${rp}`, distractors: [`${r2(r1v * r2v)}`, `${r2((r1v + r2v) / 2)}`, `${r2(rp - 0.1)}`],
      solution: `Parallel: R = 1 − (1−${r1v})(1−${r2v}) = ${rp}.`,
    };
  },
];

// ─── Hard IE numerical generators (multi-step) ───────────────────────────────
const IE_HARD_NUM: SpecGen[] = [
  // EOQ with total relevant cost
  (rand) => {
    const D = pick(rand, [3600, 4900, 6400]);
    const S = pick(rand, [50, 80]);
    const H = pick(rand, [2, 4]);
    const eoq = r1(Math.sqrt((2 * D * S) / H));
    const tc = r1(Math.sqrt(2 * D * S * H));
    return {
      topic: "Inventory Management", difficulty: "hard",
      stem: `For D = ${D}/yr, S = ₹${S}, H = ₹${H}/unit/yr, the minimum total ordering-plus-holding cost (at EOQ ≈ ${eoq}) is about:`,
      correct: `₹${tc}`, distractors: [`₹${r1(tc / 2)}`, `₹${r1(tc * 2)}`, `₹${r1(D * H)}`],
      solution: `At EOQ, total cost = √(2·D·S·H) = √(2×${D}×${S}×${H}) ≈ ₹${tc}.`,
    };
  },
  // Reorder point with safety stock
  (rand) => {
    const d = pick(rand, [40, 60, 80]);
    const lt = pick(rand, [4, 5, 6]);
    const ss = pick(rand, [50, 80, 100]);
    const rop = d * lt + ss;
    return {
      topic: "Inventory Management", difficulty: "hard",
      stem: `Daily demand = ${d}, lead time = ${lt} days, safety stock = ${ss} units. The reorder point is:`,
      correct: `${rop} units`, distractors: [`${d * lt} units`, `${r1(d * lt - ss)} units`, `${rop + d} units`],
      solution: `ROP = (demand × lead time) + safety stock = ${d}×${lt} + ${ss} = ${rop} units.`,
    };
  },
  // Line balancing efficiency
  (rand) => {
    const sumt = pick(rand, [40, 48, 54]); // total task time
    const N = pick(rand, [5, 6]);
    const C = pick(rand, [10, 12]);
    const eff = r1((sumt / (N * C)) * 100);
    return {
      topic: "Production Planning", difficulty: "hard",
      stem: `An assembly line has total task time ${sumt} min, ${N} stations and a cycle time of ${C} min. Its balance efficiency is:`,
      correct: `${eff}%`, distractors: [`${r1((C / sumt) * 100)}%`, `${r1(eff + 12)}%`, `${r1((sumt / C) * 10)}%`],
      solution: `Efficiency = Σt/(N·C) = ${sumt}/(${N}×${C}) = ${eff}%.`,
    };
  },
  // Cpk calculation
  (rand) => {
    const usl = pick(rand, [110, 112]);
    const lsl = pick(rand, [88, 90]);
    const mean = pick(rand, [100, 102]);
    const sd = pick(rand, [2, 3]);
    const cpk = r2(Math.min((usl - mean) / (3 * sd), (mean - lsl) / (3 * sd)));
    return {
      topic: "Quality Control", difficulty: "hard",
      stem: `A process has USL = ${usl}, LSL = ${lsl}, mean = ${mean}, σ = ${sd}. Its Cpk is about:`,
      correct: `${cpk}`, distractors: [`${r2((usl - lsl) / (6 * sd))}`, `${r2(cpk + 0.3)}`, `${r2(cpk * 2)}`],
      solution: `Cpk = min[(USL−μ)/3σ, (μ−LSL)/3σ] = min[(${usl}−${mean})/${3 * sd}, (${mean}−${lsl})/${3 * sd}] = ${cpk}.`,
    };
  },
  // Little's law
  (rand) => {
    const lam = pick(rand, [10, 15, 20]); // per hour
    const W = pick(rand, [0.5, 0.75, 1]); // hours
    const L = r2(lam * W);
    return {
      topic: "Operations Research", difficulty: "hard",
      stem: `Customers arrive at ${lam}/hour and spend on average ${W} hour in the system. The average number in the system is:`,
      correct: `${L}`, distractors: [`${r2(lam / W)}`, `${r2(W / lam)}`, `${r2(L + 2)}`],
      solution: `Little's law: L = λ·W = ${lam}×${W} = ${L}.`,
    };
  },
  // Series-parallel reliability
  (rand) => {
    const ra = pick(rand, [0.9, 0.95]);
    const rb = pick(rand, [0.8, 0.85]);
    const rc = pick(rand, [0.9, 0.95]);
    // A in series with (B parallel C)
    const par = 1 - (1 - rb) * (1 - rc);
    const rs = r2(ra * par);
    return {
      topic: "Reliability", difficulty: "hard",
      stem: `Component A (R = ${ra}) is in series with a parallel pair B (${rb}) and C (${rc}). The system reliability is about:`,
      correct: `${rs}`, distractors: [`${r2(ra * rb * rc)}`, `${r2(ra * rb)}`, `${r2(rs + 0.1)}`],
      solution: `Parallel(B,C) = 1−(1−${rb})(1−${rc}) = ${r2(par)}; system = R_A × that = ${ra}×${r2(par)} = ${rs}.`,
    };
  },
  // Break-even with profit target
  (rand) => {
    const fc = pick(rand, [20000, 30000]);
    const p = pick(rand, [100, 120]);
    const v = pick(rand, [60, 70]);
    const profit = pick(rand, [10000, 20000]);
    const q = r1((fc + profit) / (p - v));
    return {
      topic: "Engineering Economics", difficulty: "hard",
      stem: `Fixed cost ₹${fc}, price ₹${p}, variable cost ₹${v}/unit. The output needed for a target profit of ₹${profit} is:`,
      correct: `${q} units`, distractors: [`${r1(fc / (p - v))} units`, `${r1(profit / (p - v))} units`, `${r1(q + 50)} units`],
      solution: `Q = (FC + target profit)/(p − v) = (${fc} + ${profit})/(${p} − ${v}) = ${q} units.`,
    };
  },
  // Crashing cost slope
  (rand) => {
    const cc = pick(rand, [5000, 8000]);
    const nc = pick(rand, [3000, 4000]);
    const ct = pick(rand, [4, 5]);
    const nt = pick(rand, [8, 10]);
    const slope = r1((cc - nc) / (nt - ct));
    return {
      topic: "Project Management", difficulty: "hard",
      stem: `An activity's normal time/cost are ${nt} days/₹${nc} and crash time/cost are ${ct} days/₹${cc}. Its crash cost slope is:`,
      correct: `₹${slope}/day`, distractors: [`₹${r1((cc - nc) / nt)}/day`, `₹${r1(cc - nc)}/day`, `₹${r1(slope * 2)}/day`],
      solution: `Cost slope = (crash − normal cost)/(normal − crash time) = (${cc}−${nc})/(${nt}−${ct}) = ₹${slope}/day.`,
    };
  },
];

// ─── Graphical (SVG) IE figure generators ────────────────────────────────────
const svg = (markup: string): { kind: "svg"; markup: string } => ({ kind: "svg", markup });

const IE_FIGURE_GENERATORS: ((rand: () => number) => FactQ)[] = [
  // CPM network (two parallel paths) → project duration / critical path
  (rand) => {
    const a = pick(rand, [3, 4, 5]);
    const b = pick(rand, [6, 7, 8]);
    const c = pick(rand, [2, 3]);
    const d = pick(rand, [5, 9, 10]);
    const top = a + b; // 1-2-4
    const bottom = c + d; // 1-3-4
    const dur = Math.max(top, bottom);
    const markup = `<svg viewBox="0 0 280 140" width="280" height="140"><circle cx="30" cy="70" r="14" fill="#dbeafe" stroke="#2563eb"/><text x="30" y="74" font-size="10" text-anchor="middle">1</text><circle cx="140" cy="30" r="14" fill="#dbeafe" stroke="#2563eb"/><text x="140" y="34" font-size="10" text-anchor="middle">2</text><circle cx="140" cy="110" r="14" fill="#dbeafe" stroke="#2563eb"/><text x="140" y="114" font-size="10" text-anchor="middle">3</text><circle cx="250" cy="70" r="14" fill="#dbeafe" stroke="#2563eb"/><text x="250" y="74" font-size="10" text-anchor="middle">4</text><line x1="42" y1="62" x2="128" y2="38" stroke="#475569" stroke-width="1.5"/><text x="80" y="42" font-size="9" fill="#dc2626">A=${a}</text><line x1="152" y1="36" x2="238" y2="62" stroke="#475569" stroke-width="1.5"/><text x="200" y="42" font-size="9" fill="#dc2626">B=${b}</text><line x1="42" y1="78" x2="128" y2="104" stroke="#475569" stroke-width="1.5"/><text x="80" y="108" font-size="9" fill="#16a34a">C=${c}</text><line x1="152" y1="104" x2="238" y2="78" stroke="#475569" stroke-width="1.5"/><text x="200" y="108" font-size="9" fill="#16a34a">D=${d}</text></svg>`;
    return {
      topic: "Project Management", difficulty: "hard",
      stem: `For the CPM network shown (path 1-2-4 = A+B = ${a}+${b}, path 1-3-4 = C+D = ${c}+${d}), the project duration (critical path) is:`,
      correct: `${dur} days`, distractors: [`${Math.min(top, bottom)} days`, `${top + bottom} days`, `${dur + 2} days`],
      solution: `Path durations: 1-2-4 = ${top}, 1-3-4 = ${bottom}. The critical path is the longest = ${dur} days.`,
      figure: { ...svg(markup), caption: "CPM activity-on-arrow network" },
    };
  },
  // Control chart → point out of control
  (rand) => {
    const cl = pick(rand, [50, 60, 70]);
    const spread = pick(rand, [9, 12]);
    const ucl = cl + spread;
    const lcl = cl - spread;
    const markup = `<svg viewBox="0 0 280 130" width="280" height="130"><line x1="20" y1="30" x2="260" y2="30" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 3"/><text x="262" y="33" font-size="8" fill="#dc2626">UCL</text><line x1="20" y1="70" x2="260" y2="70" stroke="#16a34a" stroke-width="1.5"/><text x="262" y="73" font-size="8" fill="#16a34a">CL</text><line x1="20" y1="110" x2="260" y2="110" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 3"/><text x="262" y="113" font-size="8" fill="#dc2626">LCL</text><polyline points="40,68 70,60 100,75 130,55 160,18 190,72 220,66" fill="none" stroke="#2563eb" stroke-width="1.5"/><circle cx="40" cy="68" r="3" fill="#2563eb"/><circle cx="70" cy="60" r="3" fill="#2563eb"/><circle cx="100" cy="75" r="3" fill="#2563eb"/><circle cx="130" cy="55" r="3" fill="#2563eb"/><circle cx="160" cy="18" r="4" fill="#dc2626"/><circle cx="190" cy="72" r="3" fill="#2563eb"/><circle cx="220" cy="66" r="3" fill="#2563eb"/></svg>`;
    return {
      topic: "Quality Control", difficulty: "medium",
      stem: `On the control chart shown (CL = ${cl}, UCL = ${ucl}, LCL = ${lcl}), the highlighted point lying above the UCL indicates that the process is:`,
      correct: "Out of control (an assignable cause is present)",
      distractors: ["In control with only chance variation", "Perfectly centred", "Within specification automatically"],
      solution: `A point beyond the ±3σ control limits (UCL = ${ucl}) signals an assignable cause — the process is out of statistical control.`,
      figure: { ...svg(markup), caption: "Shewhart control chart" },
    };
  },
  // Break-even chart → BEP
  (rand) => {
    const fc = pick(rand, [10000, 20000, 30000]);
    const p = pick(rand, [80, 100]);
    const v = pick(rand, [40, 60]);
    const be = r1(fc / (p - v));
    const markup = `<svg viewBox="0 0 260 140" width="260" height="140"><line x1="30" y1="120" x2="240" y2="120" stroke="#94a3b8" stroke-width="1"/><line x1="30" y1="15" x2="30" y2="120" stroke="#94a3b8" stroke-width="1"/><line x1="30" y1="80" x2="240" y2="80" stroke="#475569" stroke-width="1.5"/><text x="180" y="76" font-size="8" fill="#475569">total cost</text><line x1="30" y1="120" x2="220" y2="25" stroke="#2563eb" stroke-width="1.5"/><text x="180" y="40" font-size="8" fill="#2563eb">revenue</text><circle cx="120" cy="62" r="4" fill="#dc2626"/><line x1="120" y1="62" x2="120" y2="120" stroke="#dc2626" stroke-width="1" stroke-dasharray="3 2"/><text x="110" y="134" font-size="8" fill="#dc2626">BEP</text></svg>`;
    return {
      topic: "Engineering Economics", difficulty: "medium",
      stem: `On the break-even chart shown (fixed cost ₹${fc}, price ₹${p}, variable cost ₹${v}/unit), the marked point where revenue meets total cost occurs at:`,
      correct: `${be} units`, distractors: [`${r1(fc / p)} units`, `${r1(fc / v)} units`, `${r1(be + 40)} units`],
      solution: `BEP = FC/(p − v) = ${fc}/(${p} − ${v}) = ${be} units, where total revenue = total cost.`,
      figure: { ...svg(markup), caption: "Break-even chart" },
    };
  },
  // EOQ cost curve → optimal quantity
  (rand) => {
    const D = pick(rand, [2000, 4000]);
    const S = pick(rand, [40, 50]);
    const H = pick(rand, [4, 5]);
    const eoq = r1(Math.sqrt((2 * D * S) / H));
    const markup = `<svg viewBox="0 0 260 140" width="260" height="140"><line x1="30" y1="120" x2="240" y2="120" stroke="#94a3b8" stroke-width="1"/><line x1="30" y1="15" x2="30" y2="120" stroke="#94a3b8" stroke-width="1"/><path d="M40 25 C 90 90 110 100 240 112" fill="none" stroke="#16a34a" stroke-width="1.5"/><text x="60" y="40" font-size="8" fill="#16a34a">ordering</text><line x1="35" y1="118" x2="235" y2="40" stroke="#dc2626" stroke-width="1.5"/><text x="190" y="55" font-size="8" fill="#dc2626">holding</text><path d="M40 60 C 110 30 120 30 235 95" fill="none" stroke="#2563eb" stroke-width="2"/><text x="120" y="28" font-size="8" fill="#2563eb">total cost</text><line x1="120" y1="48" x2="120" y2="120" stroke="#475569" stroke-width="1" stroke-dasharray="3 2"/><text x="110" y="134" font-size="8" fill="#475569">Q*</text></svg>`;
    return {
      topic: "Inventory Management", difficulty: "medium",
      stem: `On the inventory cost curve shown (D = ${D}, S = ₹${S}, H = ₹${H}), the order size Q* that minimizes total cost (where ordering and holding costs are equal) is:`,
      correct: `${eoq} units`, distractors: [`${r1(eoq / 2)} units`, `${r1(eoq * 2)} units`, `${r1((D * S) / H)} units`],
      solution: `Total cost is minimum at the EOQ Q* = √(2DS/H) = √(2×${D}×${S}/${H}) ≈ ${eoq} units, where the two cost curves cross.`,
      figure: { ...svg(markup), caption: "Inventory total-cost curve" },
    };
  },
  // Pareto chart → vital few
  (rand) => {
    const top = pick(rand, ["A", "B", "C"]);
    const markup = `<svg viewBox="0 0 240 140" width="240" height="140"><line x1="30" y1="120" x2="220" y2="120" stroke="#94a3b8" stroke-width="1"/><line x1="30" y1="15" x2="30" y2="120" stroke="#94a3b8" stroke-width="1"/><rect x="45" y="35" width="28" height="85" fill="#2563eb"/><text x="59" y="132" font-size="9" text-anchor="middle">${top}</text><rect x="85" y="70" width="28" height="50" fill="#60a5fa"/><text x="99" y="132" font-size="9" text-anchor="middle">P</text><rect x="125" y="92" width="28" height="28" fill="#93c5fd"/><text x="139" y="132" font-size="9" text-anchor="middle">Q</text><rect x="165" y="105" width="28" height="15" fill="#bfdbfe"/><text x="179" y="132" font-size="9" text-anchor="middle">R</text><polyline points="59,40 99,60 139,85 179,100" fill="none" stroke="#dc2626" stroke-width="1.5"/></svg>`;
    return {
      topic: "Quality Control", difficulty: "medium",
      stem: `On the Pareto chart of defect causes shown (tallest bar = cause ${top}), the principle being applied says you should first address:`,
      correct: `Cause ${top} (the tallest bar — the vital few)`,
      distractors: ["The shortest bar (cause R)", "All causes equally", "Only the cumulative-line endpoint"],
      solution: `The Pareto (80/20) principle prioritizes the 'vital few' tallest bars; cause ${top} contributes the most defects and is tackled first.`,
      figure: { ...svg(markup), caption: "Pareto chart of defects" },
    };
  },
];

// ─── Paper-II assembly (60 theory + 40 numerical, 3:2 interleave) ────────────
function genProfessional(rand: () => number, startId: number, setNo: number, tough: boolean): Q[] {
  const out: Q[] = [];
  const hardTheory = IE_HARD_THEORY;
  const baseTheory = IE_THEORY_POOL;
  const theorySlice: FactQ[] = tough
    ? [
        ...rotateSlice(IE_TRICKY_POOL, setNo, 8, 7),
        ...rotateSlice(hardTheory, setNo, 12, 11),
        ...rotateSlice(baseTheory, setNo, 40, 44),
      ]
    : [
        ...rotateSlice(hardTheory, setNo, 16, 11),
        ...rotateSlice(baseTheory, setNo, 44, 44),
      ];
  shuffleInPlace(rand, theorySlice);

  const figItems = drawDistinct(rand, IE_FIGURE_GENERATORS, 12);
  const numItems: FactQ[] = [
    ...figItems,
    ...fillSpecs(rand, IE_HARD_NUM, IE_NUM_GENERATORS, 28, tough ? 10 : 6),
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
  slug: "industrial-engineering",
  discipline: "Industrial Engineering",
  seedBase: 0x2424000,
  genProfessional,
});
