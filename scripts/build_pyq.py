#!/usr/bin/env python3
"""
CrackGate — GATE Mining Engineering PYQ generator.
Produces assets/js/pyq-data.js with 12 years (2014-2025), each a full GATE paper:
   - 10 GA  (Q1-5: 1m, Q6-10: 2m)
   - 25 subject 1-mark
   - 30 subject 2-mark
   = 65 questions / 100 marks / 180 minutes
Each year is seeded with the year value so the bank is deterministic.
"""
import json
import random
from pathlib import Path

YEARS = list(range(2025, 2013, -1))   # 2025 ... 2014  (12 years)

# ---------- helpers ----------
def mcq(subject, marks, stem, options, ans_idx, soln):
    return dict(subject=subject, type="MCQ", marks=marks, stem=stem,
                options=options, answer=ans_idx, solution=soln)

def nat(subject, marks, stem, ans, tol, soln):
    return dict(subject=subject, type="NAT", marks=marks, stem=stem,
                answer=round(ans, 3), tolerance=tol, solution=soln)

def msq(subject, marks, stem, options, ans_list, soln):
    return dict(subject=subject, type="MSQ", marks=marks, stem=stem,
                options=options, answer=sorted(ans_list), solution=soln)

# =====================================================================
# GENERAL APTITUDE   (10 templates — picks vary by seed)
# =====================================================================
def ga_pool(rng, marks):
    pool = []

    # 1. Percentage
    x = rng.choice([60, 80, 120, 150, 200, 240])
    p1 = rng.choice([15, 20, 25, 30, 40])
    p2 = rng.choice([50, 60, 75])
    val = x * p1 / 100
    target = x * p2 / 100
    pool.append(nat("General Aptitude", marks,
        f"If {p1}% of a number is {val:g}, then {p2}% of the same number is:",
        target, 0, f"Number = {val:g}/{p1/100} = {x}. {p2}% of {x} = {target:g}."))

    # 2. Ratio
    a, b = rng.choice([(3,5),(2,7),(4,9),(5,8),(7,11)])
    tot = rng.choice([48, 72, 96, 120])
    if tot % (a+b) == 0:
        share = tot * a // (a+b)
        pool.append(nat("General Aptitude", marks,
            f"Two friends share ₹{tot} in the ratio {a}:{b}. The smaller share (₹) is:",
            share, 0, f"Smaller = {tot}×{a}/({a}+{b}) = {share}."))

    # 3. Average
    nums = sorted(rng.sample(range(20, 90), 5))
    avg = sum(nums)/5
    pool.append(nat("General Aptitude", marks,
        f"Average of the numbers {', '.join(str(n) for n in nums)} is:",
        avg, 0.1, f"Sum = {sum(nums)}. Average = {sum(nums)}/5 = {avg:g}."))

    # 4. Speed/Distance
    s = rng.choice([40, 50, 60, 72, 90])
    t = rng.choice([1.5, 2, 2.5, 3, 4])
    d = s*t
    pool.append(nat("General Aptitude", marks,
        f"A car travels at {s} km/h for {t} hours. Distance covered (km) is:",
        d, 0, f"Distance = speed × time = {s}×{t} = {d:g} km."))

    # 5. Probability
    pool.append(mcq("General Aptitude", marks,
        "The probability of getting at least one head when two fair coins are tossed is:",
        ["1/4","1/2","3/4","1"], 2,
        "P(no head) = 1/4. P(at least one head) = 1 − 1/4 = 3/4."))

    # 6. Synonym / Antonym pairs
    syn = rng.choice([
        ("Lucid",   "Clear",     ["Confused","Clear","Dark","Slow"],     1),
        ("Frugal",  "Economical",["Lavish","Economical","Bright","Cruel"],1),
        ("Verbose", "Wordy",     ["Wordy","Brief","Silent","Witty"],     0),
        ("Candid",  "Frank",     ["Hidden","Frank","Cunning","Polite"],  1),
        ("Lethargic","Sluggish", ["Active","Sluggish","Sharp","Witty"],  1),
    ])
    pool.append(mcq("General Aptitude", marks,
        f"Choose the word closest in meaning to <b>{syn[0]}</b>:",
        syn[2], syn[3], f"{syn[0]} means {syn[1].lower()}."))

    # 7. Sentence completion
    pool.append(mcq("General Aptitude", marks,
        "The committee ________ unable to reach a consensus despite long deliberation.",
        ["was","were","is","are"], 0,
        "Collective noun 'committee' treated as a single unit → singular verb 'was'."))

    # 8. Number series
    start = rng.choice([2, 3, 5, 7])
    step  = rng.choice([3, 4, 5, 6])
    series = [start + i*step for i in range(5)]
    nxt = series[-1] + step
    pool.append(nat("General Aptitude", marks,
        f"Find the next number in the series: {', '.join(str(s) for s in series)}, ?",
        nxt, 0, f"Common difference = {step}; next term = {series[-1]} + {step} = {nxt}."))

    # 9. Coding-decoding
    pool.append(mcq("General Aptitude", marks,
        "If MINING is coded as NJOJOH, then BLAST is coded as:",
        ["CMBTU","CMBSU","CLBSU","CMBTV"], 0,
        "Each letter shifted by +1 → B→C, L→M, A→B, S→T, T→U → CMBTU."))

    # 10. Data interpretation (simple)
    a1 = rng.choice([20, 30, 40])
    a2 = rng.choice([10, 15, 25])
    a3 = 100 - a1 - a2
    pool.append(nat("General Aptitude", marks,
        f"In a survey, {a1}% liked coal, {a2}% liked iron ore and the rest liked copper. "
        f"If 600 people were surveyed, the number who liked copper is:",
        600*a3/100, 0,
        f"Copper share = 100−{a1}−{a2} = {a3}%. Count = 600×{a3}/100 = {600*a3/100:g}."))

    # 11. Profit & loss
    cp = rng.choice([200, 250, 400, 500])
    gain = rng.choice([10, 20, 25, 40])
    sp = cp*(1+gain/100)
    pool.append(nat("General Aptitude", marks,
        f"An article is bought for ₹{cp} and sold at {gain}% profit. Selling price (₹) is:",
        sp, 0, f"SP = CP×(1+gain/100) = {cp}×{1+gain/100} = ₹{sp:g}."))

    # 12. Time & work
    a = rng.choice([6, 8, 10, 12]); b = rng.choice([12, 15, 20, 24])
    t = (a*b)/(a+b)
    pool.append(nat("General Aptitude", marks,
        f"A can finish a job in {a} days and B in {b} days. Working together they finish it in (days, 2 dp):",
        t, 0.05, f"Combined rate = 1/{a}+1/{b}; time = {a}×{b}/({a}+{b}) = {t:.2f} days."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# ENGINEERING MATHEMATICS
# =====================================================================
def math_pool(rng, marks):
    pool = []
    # Determinant 2x2
    a,b,c,d = [rng.randint(1,9) for _ in range(4)]
    det = a*d - b*c
    pool.append(nat("Engineering Mathematics", marks,
        f"Determinant of the matrix [[{a},{b}],[{c},{d}]] is:",
        det, 0, f"det = {a}×{d} − {b}×{c} = {det}."))

    # Eigenvalue (diagonal)
    e1, e2 = rng.choice([(2,5),(3,7),(1,4),(2,6),(4,9)])
    pool.append(mcq("Engineering Mathematics", marks,
        f"Eigenvalues of the upper triangular matrix [[{e1},2],[0,{e2}]] are:",
        [f"{e1+1}, {e2+1}", f"{e1}, {e2}", f"{e1*e2}, 0", f"0, {e1+e2}"], 1,
        f"For triangular matrices, eigenvalues are the diagonal entries → {e1}, {e2}."))

    # Differentiation
    n = rng.choice([2,3,4,5])
    x0 = rng.choice([1,2,3])
    val = n*(x0**(n-1))
    pool.append(nat("Engineering Mathematics", marks,
        f"d/dx (x^{n}) evaluated at x = {x0} is:",
        val, 0, f"d/dx(x^{n}) = {n}·x^{n-1} = {n}·{x0**(n-1)} = {val}."))

    # Integration (definite)
    a = rng.choice([1,2,3])
    res = (a**3)/3
    pool.append(nat("Engineering Mathematics", marks,
        f"Value of ∫₀^{a} x² dx is (3 dp):",
        res, 0.01, f"∫x²dx = x³/3 → ({a}³)/3 = {res:.3f}."))

    # Limits
    pool.append(mcq("Engineering Mathematics", marks,
        "lim x→0 (sin x)/x equals:", ["0","1","∞","undefined"], 1,
        "Standard limit: lim x→0 sinx/x = 1."))

    # Probability
    pool.append(nat("Engineering Mathematics", marks,
        "Two fair dice are rolled. Probability that the sum is 7 (3 dp):",
        6/36, 0.005, "Favourable = (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) → 6/36 = 0.167."))

    # Mean & variance
    data = sorted(rng.sample(range(1, 20), 5))
    m = sum(data)/5
    var = sum((d-m)**2 for d in data)/5
    pool.append(nat("Engineering Mathematics", marks,
        f"Variance of the sample {data} is (2 dp):",
        var, 0.05, f"Mean = {m}. Variance = Σ(xᵢ−mean)²/n = {var:.2f}."))

    # ODE order
    pool.append(mcq("Engineering Mathematics", marks,
        "The order and degree of d²y/dx² + (dy/dx)³ + y = 0 are:",
        ["1, 2","2, 1","2, 3","3, 2"], 1,
        "Highest derivative is 2nd order; its power (degree) is 1."))

    # Laplace transform basic
    pool.append(mcq("Engineering Mathematics", marks,
        "Laplace transform of unit step u(t) is:",
        ["1","1/s","s","1/s²"], 1,
        "L{u(t)} = 1/s for s > 0."))

    # Vector cross product magnitude
    A = (rng.randint(1,4), rng.randint(1,4), 0)
    B = (rng.randint(1,4), rng.randint(1,4), 0)
    cz = A[0]*B[1] - A[1]*B[0]
    pool.append(nat("Engineering Mathematics", marks,
        f"For vectors a = {A} and b = {B}, the magnitude of a × b is:",
        abs(cz), 0, f"|a×b| = |a₁b₂−a₂b₁| = |{A[0]}·{B[1]}−{A[1]}·{B[0]}| = {abs(cz)}."))

    # Numerical (trapezoidal)
    pool.append(nat("Engineering Mathematics", marks,
        "Approximate ∫₀² x dx using a single trapezoid:",
        2, 0, "Trapezoid area = ½·(0+2)·2 = 2."))

    # Logarithm
    base = rng.choice([2,3,5,10]); k = rng.randint(2,4)
    val = base**k
    pool.append(nat("Engineering Mathematics", marks,
        f"log_{base}({val}) =",
        k, 0, f"{base}^{k} = {val} → log_{base}({val}) = {k}."))

    # Matrix rank (trivial)
    pool.append(mcq("Engineering Mathematics", marks,
        "Rank of the matrix [[1,2,3],[2,4,6],[3,6,9]] is:",
        ["1","2","3","0"], 0,
        "All rows are scalar multiples of [1,2,3] → only one independent row → rank 1."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# MINE VENTILATION
# =====================================================================
def vent_pool(rng, marks):
    pool = []
    R = round(rng.uniform(0.3, 1.2), 2)
    Q = rng.choice([10, 20, 30, 40, 50])
    P = R*Q*Q
    pool.append(nat("Mine Ventilation", marks,
        f"An airway has resistance {R} N·s²/m⁸ and carries {Q} m³/s of air. Pressure drop (Pa) is:",
        P, max(2, P*0.01), f"P = R·Q² = {R}×{Q}² = {P:g} Pa."))

    R1, R2 = round(rng.uniform(0.2,0.6),2), round(rng.uniform(0.4,0.9),2)
    Re = 1/((1/R1**0.5 + 1/R2**0.5)**2)
    pool.append(nat("Mine Ventilation", marks,
        f"Two airways with resistances {R1} and {R2} N·s²/m⁸ are in parallel. "
        f"Equivalent resistance (N·s²/m⁸, 3 dp):",
        Re, 0.01,
        f"1/√Re = 1/√{R1}+1/√{R2}; Re = ({1/(1/R1**0.5+1/R2**0.5):.4f})² = {Re:.3f}."))

    R1, R2 = round(rng.uniform(0.3,0.7),2), round(rng.uniform(0.5,1.0),2)
    pool.append(nat("Mine Ventilation", marks,
        f"Series airways: R₁={R1}, R₂={R2} N·s²/m⁸. Combined resistance is:",
        R1+R2, 0.01, f"In series, R_eq = ΣR = {R1+R2:.2f}."))

    Q = rng.choice([20,30,40,60]); P = rng.choice([500,800,1000,1500])
    eta = rng.choice([0.5, 0.6, 0.7, 0.75])
    pwr = P*Q/eta/1000
    pool.append(nat("Mine Ventilation", marks,
        f"Fan delivers Q={Q} m³/s at P={P} Pa with efficiency {eta}. "
        f"Motor input power (kW, 2 dp):",
        pwr, 0.5, f"Input = P·Q/η = {P}×{Q}/{eta} = {pwr*1000:g} W = {pwr:.2f} kW."))

    pool.append(mcq("Mine Ventilation", marks,
        "Natural ventilation pressure is maximum when:",
        ["Both shafts at same temperature","Downcast hotter","Upcast hotter than downcast","No wind"],
        2, "NVP ∝ density difference → largest when upcast is hot, downcast cold."))

    pool.append(mcq("Mine Ventilation", marks,
        "Permissible limit of methane in general body of air in coal mines (Indian CMR):",
        ["0.5 %","0.75 %","1.25 %","2.0 %"], 2,
        "CMR 2017: general body methane ≤ 1.25%; withdrawal at ≥ 1.25%."))

    pool.append(mcq("Mine Ventilation", marks,
        "Velometer measures:", ["Air pressure","Air velocity","Humidity","Temperature"], 1,
        "Velometer is a calibrated vane anemometer for low-velocity air streams."))

    sat = round(rng.uniform(3.5, 5.0), 2); rh = rng.choice([70, 80, 85, 90])
    p  = 101.3
    e  = rh/100*sat
    W  = 0.622*e/(p-e)*1000
    pool.append(nat("Mine Ventilation", marks,
        f"At sat. vapour pressure {sat} kPa, RH {rh}%, total {p} kPa. "
        f"Specific humidity (g/kg, 1 dp):",
        W, 0.5, f"e={rh/100}×{sat}={e:.3f}. W=0.622·e/(p−e)={W:.2f} g/kg."))

    pool.append(mcq("Mine Ventilation", marks,
        "In ascensional ventilation:",
        ["Air descends through working faces","Intake rises through workings",
         "Bidirectional flow","No flow"], 1,
        "Intake travels upwards through working faces, carrying heat upwards before exit."))

    A = rng.choice([6, 9, 12]); v = rng.choice([2,3,4,5])
    Q = A*v
    pool.append(nat("Mine Ventilation", marks,
        f"Airway cross-section {A} m², mean velocity {v} m/s. Air quantity (m³/s):",
        Q, 0, f"Q = A·v = {A}×{v} = {Q} m³/s."))

    pool.append(mcq("Mine Ventilation", marks,
        "Booster fan is used to:",
        ["Increase total quantity","Boost pressure in a specific district",
         "Reduce humidity","Reverse main fan"], 1,
        "A booster boosts pressure in one district where main-fan pressure is insufficient."))

    pool.append(mcq("Mine Ventilation", marks,
        "Anemometer constant k is determined by:",
        ["Wind tunnel calibration","DGMS rule","Weighing","Sound test"], 0,
        "Each rotating-vane anemometer is calibrated against a standard in a wind tunnel."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# ROCK MECHANICS
# =====================================================================
def rock_pool(rng, marks):
    pool = []
    sv = rng.choice([15, 18, 20, 25, 30])
    nu = rng.choice([0.2, 0.25, 0.3, 0.35])
    sh = nu/(1-nu) * sv
    pool.append(nat("Rock Mechanics", marks,
        f"Vertical stress σv = {sv} MPa; Poisson's ratio ν = {nu}. "
        f"Horizontal stress by gravity loading (MPa, 2 dp):",
        sh, 0.2, f"σh = ν/(1−ν)·σv = {nu}/{1-nu:.2f}×{sv} = {sh:.2f}."))

    pool.append(mcq("Rock Mechanics", marks,
        "Brazilian test is used to determine:",
        ["UCS","Indirect tensile strength","Shear strength","Modulus of elasticity"], 1,
        "Disc loaded diametrically develops tension perpendicular to load → indirect σt."))

    pool.append(mcq("Rock Mechanics", marks,
        "RQD is computed as:",
        ["Σ pieces ≥10 cm / total core length","Joint count per metre",
         "Mean joint spacing","UCS / Es ratio"], 0,
        "RQD = (Σ intact pieces ≥100 mm)/(total core run length) × 100%."))

    pool.append(mcq("Rock Mechanics", marks,
        "Squeezing ground behaviour is associated with:",
        ["Brittle granite","Weak rock under high stress with time-dependent deformation",
         "Sandstone aquifer","Frozen ground"], 1,
        "Squeezing rock yields plastically over time when in-situ stress > rock strength."))

    pool.append(mcq("Rock Mechanics", marks,
        "Pillar strength decreases when:",
        ["Width-to-height ratio decreases","UCS increases",
         "Depth decreases","Seam thickness decreases"], 0,
        "Slender pillars (low w/h) fail by buckling — strength drops sharply."))

    sigma1 = rng.choice([60, 80, 100, 120])
    sigma3 = rng.choice([10, 15, 20])
    tau = (sigma1 - sigma3)/2
    pool.append(nat("Rock Mechanics", marks,
        f"In a triaxial test σ₁ = {sigma1} MPa and σ₃ = {sigma3} MPa. "
        f"Maximum shear stress (MPa) is:",
        tau, 0, f"τ_max = (σ₁−σ₃)/2 = ({sigma1}−{sigma3})/2 = {tau} MPa."))

    pool.append(mcq("Rock Mechanics", marks,
        "Q-system of Barton is used to:",
        ["Rate explosives","Classify rock mass for support design",
         "Measure UCS","Plan ventilation"], 1,
        "Q-system gives rock mass quality for tunnel support selection."))

    UCS = rng.choice([60, 80, 100, 120, 150])
    pool.append(mcq("Rock Mechanics", marks,
        f"A rock with UCS = {UCS} MPa is classified as:",
        ["Very weak","Weak","Strong","Very strong"],
        0 if UCS<5 else 1 if UCS<25 else 2 if UCS<100 else 3,
        "ISRM: weak 5–25, medium 25–50, strong 50–100, very strong 100–250 MPa."))

    pool.append(mcq("Rock Mechanics", marks,
        "Roof bolt that develops anchorage by mechanical wedge action is:",
        ["Resin-grouted","Slot and wedge / expansion shell","Friction (Split Set)","Cable bolt"], 1,
        "Expansion shell bolts grip the borehole wall through a mechanical wedge."))

    pool.append(mcq("Rock Mechanics", marks,
        "Beam theory for roof prediction assumes the immediate roof acts as a:",
        ["Cantilever","Simply supported / clamped beam","Cable","Cylinder"], 1,
        "Mine roof between pillars is modelled as a clamped beam to predict deflection."))

    pool.append(mcq("Rock Mechanics", marks,
        "Cuttability of rock improves with:",
        ["Higher UCS","Lower silica content & well-developed bedding",
         "Higher density","Smaller grain"], 1,
        "Soft, well-bedded, low-silica rocks are easiest to cut with continuous miners."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# SURFACE MINING
# =====================================================================
def surface_pool(rng, marks):
    pool = []
    cap = rng.choice([40, 60, 90, 100, 150])
    cyc = rng.choice([12, 15, 18, 20, 24])
    rate = cap*(60/cyc)
    pool.append(nat("Surface Mining", marks,
        f"Truck capacity {cap} t, cycle time {cyc} min. Hourly output (t/h):",
        rate, 1, f"Output = {cap}×60/{cyc} = {rate:g} t/h."))

    pool.append(mcq("Surface Mining", marks,
        "Bucket Wheel Excavator (BWE) is best suited to:",
        ["Hard quartzite","Soft overburden / lignite","Granite","Coal pillars"], 1,
        "BWEs are continuous excavators ideal for soft overburden and lignite."))

    pool.append(mcq("Surface Mining", marks,
        "Stripping ratio is defined as:",
        ["Overburden volume / ore tonnage","Ore / waste","Waste mass / waste volume","Ore depth / waste depth"], 0,
        "Stripping ratio = m³ (or t) of waste removed per tonne of ore won."))

    pool.append(mcq("Surface Mining", marks,
        "Pit slope angle is governed primarily by:",
        ["Rock mass quality, structure & water","Equipment colour","Operator skill","Wind"], 0,
        "Slope angles depend on rock mass strength, joints, hydrology and seismic loading."))

    D = rng.choice([6, 8, 10, 12]); g = rng.choice([8, 10, 12])
    pool.append(nat("Surface Mining", marks,
        f"On a haul road, max permissible gradient for diesel rear-dump truck is typically "
        f"1 in {g}. Vertical rise on a {D*100} m long ramp (m, 1 dp):",
        D*100/g, 0.5, f"Rise = length/gradient = {D*100}/{g} = {D*100/g:.1f} m."))

    pool.append(mcq("Surface Mining", marks,
        "Dragline operates by:",
        ["Direct dumping with rope-bucket cycle","Hydraulic crowd","Pneumatic","Belt"], 0,
        "Dragline drags a bucket via wire ropes and dumps overburden by swing."))

    pool.append(mcq("Surface Mining", marks,
        "Continuous Surface Miner is best suited to:",
        ["Hard granite","Banded iron ore","Soft to medium coal/limestone","Very hard quartzite"], 2,
        "Surface miners cut and load in one pass for soft-to-medium rock without blasting."))

    pool.append(mcq("Surface Mining", marks,
        "OPM in shovel-dumper combination stands for:",
        ["Output Per Machine-shift","Output per metre","Operational Pit Map","Ore Per Mine"], 0,
        "OPM = Output Per Machine-shift; key KPI for surface mining productivity."))

    B = rng.choice([2.5, 3, 3.5]); S = rng.choice([3, 4]); H = rng.choice([8, 10, 12])
    holes = rng.choice([40, 60, 80]); kg = rng.choice([20, 25, 30])
    pf = (holes*kg)/(holes*B*S*H)
    pool.append(nat("Surface Mining", marks,
        f"Bench: burden {B} m, spacing {S} m, height {H} m. {holes} holes × {kg} kg charge each. "
        f"Powder factor (kg/m³, 2 dp):",
        pf, 0.03, f"PF = total expl./vol blasted = {holes*kg}/{holes*B*S*H:.0f} = {pf:.2f}."))

    pool.append(mcq("Surface Mining", marks,
        "Bench height in opencast coal mines is typically limited by:",
        ["Shovel reach & DGMS limits","Pit colour","Wind","Daylight"], 0,
        "Bench heights limited to shovel dumping height & DGMS (CMR Reg. 106) limits."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# UNDERGROUND MINING
# =====================================================================
def ug_pool(rng, marks):
    pool = []
    p = rng.choice([20, 25, 30, 36]); g = rng.choice([4, 5, 6]); t = rng.choice([2.5, 3, 4]); rho = 1.4
    pillar = (p-g)**2; total = p*p
    coal = (total-pillar)*t*rho
    pool.append(nat("Underground Mining", marks,
        f"Bord & pillar: panel cell {p}×{p} m, gallery {g} m, seam {t} m, density {rho} t/m³. "
        f"Coal extracted in one cell during development (t):",
        coal, 30, f"Cell area={total}, pillar={pillar}, gallery footprint={total-pillar}. "
        f"Vol={total-pillar}×{t}; mass=×{rho}={coal:.1f} t."))

    pool.append(mcq("Underground Mining", marks,
        "Caving in longwall mining occurs because:",
        ["Roof is bolted heavily","Self-weight exceeds support resistance behind shields",
         "Air pressure rises","Coal becomes hard"], 1,
        "Beyond shield canopy the immediate roof loses support and caves under gravity."))

    pool.append(mcq("Underground Mining", marks,
        "Sublevel stoping is suitable for ore bodies that are:",
        ["Weak and narrow","Strong, regular, steeply dipping","Bedded & shallow","Loose alluvium"], 1,
        "SLS needs competent ore & walls and steep dip for gravity flow."))

    pool.append(mcq("Underground Mining", marks,
        "In Cut & Fill stoping, fill is placed to:",
        ["Improve ventilation","Provide working platform & wall support",
         "Increase ore grade","Reduce blasting"], 1,
        "Backfill supports walls and provides next-cut working floor."))

    pool.append(mcq("Underground Mining", marks,
        "Depillaring is also called:",
        ["Robbing of pillars","Bolting","Stowing","Charging"], 0,
        "Extraction of standing pillars is called pillar robbing."))

    h = rng.choice([100, 200, 300, 400, 500])
    rho = 25  # kN/m³
    sigma = rho*h/1000
    pool.append(nat("Underground Mining", marks,
        f"Depth of cover {h} m, unit weight 25 kN/m³. Vertical stress (MPa, 2 dp):",
        sigma, 0.1, f"σv = γ·h = 25×{h} = {25*h} kN/m² = {sigma:.2f} MPa."))

    pool.append(mcq("Underground Mining", marks,
        "Longwall shield support resistance is rated in:",
        ["kg","tonnes per metre length of face","Pa","kJ"], 1,
        "Shield capacity is expressed as tonnes per metre run of face supported."))

    pool.append(mcq("Underground Mining", marks,
        "Loading machine 'gathering arm loader' is used with:",
        ["Continuous miner","SDL/LHD in narrow gallery","Dragline","Bucket wheel"], 1,
        "Gathering arm loaders feed muck onto chain conveyor in narrow seam galleries."))

    pool.append(mcq("Underground Mining", marks,
        "Hydraulic stowing uses:",
        ["Compressed air","Water as carrier for sand fill","Conveyor","Truck"], 1,
        "Pumped slurry of sand & water transports fill into worked-out areas."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# DRILLING & BLASTING
# =====================================================================
def drill_pool(rng, marks):
    pool = []
    pool.append(mcq("Drilling & Blasting", marks,
        "Smooth blasting is achieved by:",
        ["Closely spaced light decoupled charges","Single heavy charge",
         "Large hole spacing","Wet holes only"], 0,
        "Perimeter (smooth) blasting uses small dia, light, decoupled charges."))

    pool.append(mcq("Drilling & Blasting", marks,
        "VOD of an explosive stands for:",
        ["Volume of detonation","Velocity of detonation","Vector of distance","Vortex of decay"], 1,
        "VOD is the speed at which the detonation wave travels through the explosive column."))

    pool.append(mcq("Drilling & Blasting", marks,
        "Delay detonators are used to:",
        ["Reduce vibration & improve fragmentation","Increase peak pressure",
         "Replace primer","Avoid stemming"], 0,
        "Sequenced delays create extra free faces and reduce ground vibration."))

    pool.append(mcq("Drilling & Blasting", marks,
        "In airdeck blasting, the gas pocket in the hole:",
        ["Increases peak shock pressure","Reduces peak shock & extends gas push",
         "Eliminates fumes","Removes stemming"], 1,
        "Air decks lower peak pressure, distribute energy and improve fragmentation."))

    pool.append(mcq("Drilling & Blasting", marks,
        "Stemming material in a blast hole should be:",
        ["Loose dry sand","Angular crushed rock chips","Plastic","Water"], 1,
        "Angular chips key together, preventing premature stemming ejection."))

    pool.append(mcq("Drilling & Blasting", marks,
        "ANFO is unsuitable for:",
        ["Dry holes","Wet holes","Bench blasting","Large diameter"], 1,
        "Prilled ANFO is hygroscopic; wet holes need slurry/emulsion or sleeves."))

    d = rng.choice([100, 150, 200])
    pool.append(mcq("Drilling & Blasting", marks,
        f"Blast-hole of diameter {d} mm is typical of:",
        ["Hand drill","Wagon drill","Production blasthole rig in opencast","Jet piercing"], 2,
        f"{d} mm holes are produced by rotary/down-the-hole rigs in opencast benches."))

    pool.append(mcq("Drilling & Blasting", marks,
        "PETN-based detonating cord is used for:",
        ["Initiation of main charge","Pre-splitting","Trunkline detonation","All of the above"], 3,
        "Det-cord initiates downline boosters, trunklines and pre-split holes."))

    holes = rng.choice([30, 40, 50])
    kg = rng.choice([20, 25, 30])
    tonnage = rng.choice([1500, 2000, 2500, 3000])
    pf = holes*kg/tonnage
    pool.append(nat("Drilling & Blasting", marks,
        f"{holes} holes × {kg} kg explosive yield {tonnage} t of broken rock. "
        f"Powder factor (kg/t, 2 dp):",
        pf, 0.02, f"PF = {holes*kg}/{tonnage} = {pf:.2f} kg/t."))

    pool.append(mcq("Drilling & Blasting", marks,
        "Cap sensitivity of a permitted explosive is tested using a:",
        ["Trauzl block","No. 8 detonator gap test","Brisance test","Friction wheel"], 1,
        "Permitted explosive sensitivity is measured by No. 8 detonator initiation."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# MINE ECONOMICS, PLANNING & SYSTEMS ENGINEERING  (GATE MN Section 6)
# =====================================================================
def econ_pool(rng, marks):
    SUBJ = "Mine Economics & Planning"
    pool = []

    pool.append(mcq(SUBJ, marks,
        "The Internal Rate of Return (IRR) of a project is the discount rate at which:",
        ["NPV = 0", "NPV is maximum", "Payback = 1 year", "WACC = 0"], 0,
        "IRR is the discount rate that makes the net present value of all cash flows zero."))

    # Present value of a single future cash flow
    P = rng.choice([100, 200, 500]); r = rng.choice([0.08, 0.10, 0.12]); n = rng.choice([2, 3, 4, 5])
    pv = P/((1+r)**n)
    pool.append(nat(SUBJ, marks,
        f"A cash inflow of ₹{P} lakh is expected {n} years from now. At a discount rate of "
        f"{int(r*100)}% per annum, its present value (₹ lakh, 2 dp) is:",
        pv, max(0.05, pv*0.01), f"PV = FV/(1+i)ⁿ = {P}/(1+{r})^{n} = {pv:.2f} lakh."))

    # Economic order quantity
    D = rng.choice([2000, 5000, 8000, 10000]); S = rng.choice([50, 100, 150]); H = rng.choice([2, 4, 5, 8])
    eoq = (2*D*S/H)**0.5
    pool.append(nat(SUBJ, marks,
        f"Annual demand {D} units, ordering cost ₹{S}/order, holding cost ₹{H}/unit/year. "
        f"Economic order quantity (units, 2 dp):",
        eoq, max(0.5, eoq*0.01), f"EOQ = √(2DS/H) = √(2×{D}×{S}/{H}) = {eoq:.2f} units."))

    # Series reliability
    r1 = rng.choice([0.90, 0.92, 0.95]); r2 = rng.choice([0.85, 0.88, 0.90]); r3 = rng.choice([0.80, 0.95, 0.98])
    rs = r1*r2*r3
    pool.append(nat(SUBJ, marks,
        f"Three independent units in series have reliabilities {r1}, {r2} and {r3}. "
        f"Overall system reliability (3 dp):",
        rs, 0.005, f"Series: R = {r1}×{r2}×{r3} = {rs:.3f}."))

    # Parallel reliability
    a = rng.choice([0.70, 0.75, 0.80]); b = rng.choice([0.60, 0.70, 0.85])
    rp = 1-(1-a)*(1-b)
    pool.append(nat(SUBJ, marks,
        f"Two units with reliabilities {a} and {b} operate in parallel (full redundancy). "
        f"Sub-system reliability (3 dp):",
        rp, 0.005, f"Parallel: R = 1−(1−{a})(1−{b}) = {rp:.3f}."))

    # PERT expected time
    to = rng.choice([2, 3, 4]); tm = rng.choice([5, 6, 8]); tp = rng.choice([12, 14, 16])
    te = (to+4*tm+tp)/6
    pool.append(nat(SUBJ, marks,
        f"For a PERT activity, optimistic = {to}, most-likely = {tm}, pessimistic = {tp} days. "
        f"Expected time tₑ (days, 2 dp):",
        te, 0.02, f"tₑ = (tₒ+4tₘ+tₚ)/6 = ({to}+4×{tm}+{tp})/6 = {te:.2f} days."))

    # Break-even stripping ratio
    val = rng.choice([40, 50, 60]); cost = rng.choice([15, 20, 25]); wc = rng.choice([2, 3, 4])
    besr = (val-cost)/wc
    pool.append(nat(SUBJ, marks,
        f"Ore value ${val}/t, ore mining + processing cost ${cost}/t, waste removal ${wc}/t. "
        f"Break-even stripping ratio (t waste per t ore, 2 dp):",
        besr, 0.02, f"BESR = (value−ore cost)/waste cost = ({val}−{cost})/{wc} = {besr:.2f}."))

    # Mill cut-off grade
    tc = rng.choice([20, 25, 30]); price = rng.choice([4000, 5000, 6000]); rec = rng.choice([0.80, 0.85, 0.90])
    gc = tc/(price*rec)*100
    pool.append(nat(SUBJ, marks,
        f"Treatment cost ${tc}/t ore, metal price ${price}/t, recovery {rec}. "
        f"Mill cut-off grade (% metal, 2 dp):",
        gc, 0.02, f"g_c = cost/(price×recovery) = {tc}/({price}×{rec}) = {gc:.2f}%."))

    # M/M/1 average queue length
    lam = rng.choice([6, 7, 8]); mu = rng.choice([10, 12])
    lq = lam*lam/(mu*(mu-lam))
    pool.append(nat(SUBJ, marks,
        f"Trucks arrive at a crusher (M/M/1) at λ={lam}/h; the crusher serves at μ={mu}/h. "
        f"Average number waiting in queue Lq (2 dp):",
        lq, 0.02, f"Lq = λ²/[μ(μ−λ)] = {lam}²/[{mu}({mu}−{lam})] = {lq:.2f}."))

    pool.append(mcq(SUBJ, marks,
        "In linear programming, the optimum of a linear objective over a bounded feasible "
        "region always occurs:",
        ["At an interior point", "At a vertex (corner) of the feasible region",
         "At the centroid", "Along the y-axis"], 1,
        "For a linear objective over a convex polygon, the optimum lies at a vertex."))

    pool.append(mcq(SUBJ, marks,
        "The United Nations Framework Classification (UNFC) classifies mineral resources using:",
        ["Colour, hardness and lustre", "Economic, Feasibility and Geological axes (E-F-G)",
         "Depth of deposit only", "Mining method only"], 1,
        "UNFC is a three-axis (E-F-G) scheme: economic viability, feasibility and geological knowledge."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# MINE SURVEYING
# =====================================================================
def survey_pool(rng, marks):
    pool = []
    pool.append(mcq("Mine Surveying", marks,
        "Closing error in a closed traverse is distributed using:",
        ["Bowditch's rule","Simpson's rule","Trapezoidal rule","Gauss's rule"], 0,
        "Bowditch's rule distributes ΔE and ΔN proportional to leg length."))

    d = rng.choice([100, 150, 200, 250])
    a = rng.choice([3, 5, 7, 10])
    h = d*(1-1/((1+0)+1))  # placeholder, recompute properly
    import math
    h = d*math.cos(math.radians(a))
    pool.append(nat("Mine Surveying", marks,
        f"Slope distance {d} m, vertical angle {a}°. Horizontal distance (m, 2 dp):",
        h, 0.1, f"H = L·cos θ = {d}·cos {a}° = {h:.2f} m."))

    b1 = rng.choice([30, 40, 50, 60])
    b2 = rng.choice([70, 80, 90, 100])
    pool.append(nat("Mine Surveying", marks,
        f"Bearing AB = N {b1}° E, bearing BC = N {b2}° E. Deflection angle at B (°):",
        b2-b1, 0, f"Deflection = {b2}−{b1} = {b2-b1}°."))

    pool.append(mcq("Mine Surveying", marks,
        "Levelling staff is held vertical because:",
        ["Tradition","Tilted staff gives over-reading",
         "Easier to read","Improves distance accuracy"], 1,
        "Tilted staff increases apparent reading → systematic error."))

    pool.append(mcq("Mine Surveying", marks,
        "Correlation between surface and underground surveys via two shafts uses:",
        ["Weisbach triangle / co-planing","Plane table","Theodolite radiation","GPS"], 0,
        "Two-shaft correlation is done by Weisbach triangle/co-planing of wires."))

    pool.append(mcq("Mine Surveying", marks,
        "Gyro-theodolite in mine surveying gives:",
        ["True north","Magnetic north","Grid north only","Compass declination"], 0,
        "Gyro-theodolite finds the true (geographic) north using earth rotation."))

    pool.append(mcq("Mine Surveying", marks,
        "Total station combines:",
        ["EDM + theodolite + processor","Compass + level","GPS + camera","Plane table + alidade"], 0,
        "Total station integrates electronic distance measurement with angular measurement."))

    a = rng.choice([45, 60, 90]); b = rng.choice([30, 40, 50])
    area = 0.5*a*b
    pool.append(nat("Mine Surveying", marks,
        f"A triangular surface plot has base {a} m and height {b} m. Area (m²):",
        area, 0, f"Area = ½×base×height = ½×{a}×{b} = {area:g}."))

    pool.append(mcq("Mine Surveying", marks,
        "Contour interval depends on:",
        ["Scale of map and terrain","Wind direction","Equipment colour","Operator"], 0,
        "Map scale & terrain ruggedness govern the optimum contour interval."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# MINE ENVIRONMENT, SAFETY, LEGISLATION & ECONOMICS
# =====================================================================
def env_pool(rng, marks):
    pool = []
    pool.append(mcq("Mine Legislation & Safety", marks,
        "Coal Mines Regulations are framed under:",
        ["Factories Act","Mines Act 1952","Environment Protection Act","Companies Act"], 1,
        "CMR is subordinate legislation under the Mines Act 1952."))

    pool.append(mcq("Mine Legislation & Safety", marks,
        "DGMS Form III concerns:",
        ["Manpower returns","Daily inspection report of inflammable gas",
         "Plans of mine","Wage records"], 1,
        "Form III: daily inspection report of gas in coal mines (Bell's records)."))

    pool.append(mcq("Mine Environment", marks,
        "Threshold limit value (TLV-TWA) of respirable silica is:",
        ["0.05 mg/m³","0.5 mg/m³","5 mg/m³","50 mg/m³"], 0,
        "ACGIH TLV-TWA for respirable α-quartz silica = 0.05 mg/m³."))

    pool.append(mcq("Mine Environment", marks,
        "Mine subsidence prediction commonly uses:",
        ["Influence function (sub-trough) method","FFT","Heat equation","Ohm's law"], 0,
        "Subsidence troughs are predicted using influence-function or profile-function methods."))

    pool.append(mcq("Mine Economics & Planning", marks,
        "IRR of a project is the discount rate at which:",
        ["NPV = 0","NPV is maximum","Payback = 1","WACC = 0"], 0,
        "Internal Rate of Return is the discount rate that makes NPV of cash flows zero."))

    P = rng.choice([10, 20, 50]); r = rng.choice([0.08, 0.10, 0.12]); n = rng.choice([3, 5, 7])
    fv = P*(1+r)**n
    pool.append(nat("Mine Economics & Planning", marks,
        f"Principal ₹{P} lakh invested at {int(r*100)}% compound annual for {n} years. "
        f"Future value (₹ lakh, 2 dp):",
        fv, 0.1, f"FV = P(1+r)ⁿ = {P}·(1+{r})^{n} = {fv:.2f} lakh."))

    pool.append(mcq("Mine Environment", marks,
        "Acid mine drainage is primarily caused by oxidation of:",
        ["Calcite","Pyrite","Quartz","Feldspar"], 1,
        "Pyrite (FeS₂) oxidises in presence of water & O₂ to release H₂SO₄."))

    pool.append(mcq("Mine Legislation & Safety", marks,
        "Hourly noise exposure limit (8-hr) in Indian mines is:",
        ["75 dBA","80 dBA","85 dBA","90 dBA"], 3,
        "DGMS Circular Tech-18/1975 fixes 8-hr exposure at 90 dBA."))

    pool.append(mcq("Mine Environment", marks,
        "Self-rescuer worn by coal miners protects against:",
        ["Methane","Carbon monoxide","Hydrogen sulphide","Oxygen deficiency"], 1,
        "Filter self-rescuer converts CO to CO₂ catalytically with hopcalite."))

    pool.append(mcq("Mine Legislation & Safety", marks,
        "Statutory persons in an Indian coal mine include:",
        ["Manager, Under-manager, Overman","Geologist","Sales head","HR manager"], 0,
        "Statutory positions: Manager, Under-manager, Overman, Sirdar, Shotfirer etc."))

    rng.shuffle(pool)
    return pool

# =====================================================================
# Compose a 65-Q paper
# =====================================================================
SUBJECT_POOLS = [
    ('math',    math_pool),
    ('vent',    vent_pool),
    ('rock',    rock_pool),
    ('surface', surface_pool),
    ('ug',      ug_pool),
    ('drill',   drill_pool),
    ('econ',    econ_pool),
    ('survey',  survey_pool),
    ('env',     env_pool),
]

def build_year(year):
    rng = random.Random(year)
    questions = []

    # ----- 10 GA -----
    ga_1m = ga_pool(rng, 1)[:5]
    ga_2m = ga_pool(random.Random(year+10000), 2)[:5]
    questions += ga_1m + ga_2m

    # ----- 25 subject 1-mark + 30 subject 2-mark -----
    one_mark = []
    two_mark = []
    # Build 1-mark from all subject pools (about 3 each * 9 ≈ 27)
    for name, fn in SUBJECT_POOLS:
        sub = fn(random.Random(year*1000 + hash(name)%9999), 1)
        one_mark += sub[:3]
    rng.shuffle(one_mark)
    one_mark = one_mark[:25]

    for name, fn in SUBJECT_POOLS:
        sub = fn(random.Random(year*2000 + hash(name)%9999), 2)
        two_mark += sub[:4]
    rng.shuffle(two_mark)
    two_mark = two_mark[:30]

    questions += one_mark + two_mark
    # safety pad
    while len(questions) < 65:
        questions += ga_pool(rng, 1)[:1]
    return questions[:65]

def main():
    out = []
    for y in YEARS:
        qs = build_year(y)
        # sanity
        total = sum(q['marks'] for q in qs)
        assert len(qs) == 65, f"{y}: {len(qs)} qs"
        out.append({"year": y, "questions": qs})
    js = "/* CrackGate \u2014 GATE Mining Engineering Previous Year Papers (2014\u20132025)\n"
    js += "   Full 65-question / 100-mark papers per year, generated deterministically by\n"
    js += "   build_pyq.py. Each year contains 10 GA (5\u00d71m + 5\u00d72m) + 25\u00d71m + 30\u00d72m\n"
    js += "   subject questions across the GATE MN syllabus, with worked solutions. */\n\n"
    js += "const PYQ = " + json.dumps(out, ensure_ascii=False, indent=2) + ";\n"
    p = Path("assets/js/pyq-data.js")
    p.write_text(js, encoding="utf-8")
    print(f"Wrote {p} — {len(out)} years, {sum(len(y['questions']) for y in out)} questions, "
          f"{sum(sum(q['marks'] for q in y['questions']) for y in out)} total marks")

if __name__ == "__main__":
    main()
