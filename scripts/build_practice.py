#!/usr/bin/env python3
"""
CrackGate — Subject-wise PRACTICE bank generator.

Generates ~150 questions per subject across difficulty tiers (easy/medium/hard).
Total: ~1500 questions across 10 subjects covering the GATE Mining Engineering
syllabus (which is the union of B.Tech Mining curricula from IIT(ISM) Dhanbad,
IIT-BHU, IIT-KGP, NIT-Rourkela, IIT-Roorkee).

Output: crackgate-app/src/data/practice.ts as a typed const.
Deterministic — re-runs produce the same bank (seeded with subject name + tier).
"""
import os
import sys

# ============================================================
# RETIRED — DO NOT RUN.
# ------------------------------------------------------------
# This generator produced the original auto-generated practice bank, whose
# questions were single-step formula plug-ins (several with degenerate
# Infinity / NaN / null answers). That bank has been fully REPLACED by a hand-
# authored, IIT/GATE-standard bank under:
#     apps/web/src/data/questions/practice/<slug>.json
# Running this script again would regenerate the low-quality content and
# overwrite hand-authored work, so it is disabled. To intentionally revive it
# for archival purposes only, set CRACKGATE_ALLOW_LEGACY_GENERATOR=1.
# ============================================================
if os.environ.get("CRACKGATE_ALLOW_LEGACY_GENERATOR") != "1":
    sys.exit(
        "build_practice.py is RETIRED. The practice bank is now hand-authored "
        "JSON under apps/web/src/data/questions/practice/. Refusing to run."
    )

import json
import random
from pathlib import Path
from itertools import product


OUT = Path(__file__).resolve().parents[1] / "crackgate-app" / "src" / "data" / "practice.ts"

# ============================================================
# Helpers
# ============================================================
def mcq(subject, difficulty, stem, options, ans_idx, soln, topic=""):
    return dict(subject=subject, topic=topic, difficulty=difficulty, type="MCQ",
                stem=stem, options=options, answer=ans_idx, solution=soln)

def nat(subject, difficulty, stem, ans, tol, soln, topic=""):
    return dict(subject=subject, topic=topic, difficulty=difficulty, type="NAT",
                answer=round(float(ans), 3), tolerance=tol, stem=stem, solution=soln)

def msq(subject, difficulty, stem, options, ans_list, soln, topic=""):
    return dict(subject=subject, topic=topic, difficulty=difficulty, type="MSQ",
                stem=stem, options=options, answer=sorted(ans_list), solution=soln)

def take(rng, items, n):
    """Sample n unique items deterministically."""
    arr = list(items)
    rng.shuffle(arr)
    return arr[:n]

# ============================================================
# 1. ENGINEERING MATHEMATICS
# ============================================================
def gen_math(rng, d):
    qs = []
    # Linear equation (easy)
    if d == "easy":
        for a, b, c in take(rng, list(product([2,3,4,5,6], [3,5,7,9,11], [12,15,20,24,30])), 30):
            x = (c - b) / a
            qs.append(nat("Engineering Mathematics", d,
                f"Solve for x: {a}x + {b} = {c}.", x, 0.01,
                f"x = ({c} − {b}) / {a} = {x:g}.", "Linear Algebra"))
        for a, b in take(rng, list(product([2,3,4,5,6], [3,5,7,8,10])), 20):
            qs.append(nat("Engineering Mathematics", d,
                f"Differentiate y = {a}x² + {b}x with respect to x at x = 2.",
                2*a*2 + b, 0.01,
                f"dy/dx = {2*a}x + {b}. At x=2: {2*a*2+b}.", "Calculus"))
    # Determinant 2x2, simple integral (medium)
    if d == "medium":
        for a, b, c, e in take(rng, list(product([2,3,4,5], [1,2,3], [1,2,3,4], [5,6,7])), 35):
            det = a*e - b*c
            qs.append(nat("Engineering Mathematics", d,
                f"Determinant of [[{a},{b}],[{c},{e}]] is:", det, 0,
                f"det = ({a})({e}) − ({b})({c}) = {det}.", "Linear Algebra"))
        for n in take(rng, range(2, 8), 6):
            for k in take(rng, [1,2,3,4,5], 3):
                val = k * (3**(n+1) - 1) / (n+1)
                qs.append(nat("Engineering Mathematics", d,
                    f"Evaluate ∫₀³ {k}x^{n} dx.", val, 0.05,
                    f"= {k}·x^{n+1}/{n+1} from 0 to 3 = {k}·3^{n+1}/{n+1} = {val:.3f}.",
                    "Integral Calculus"))
    # Eigenvalues, ODE, complex (hard)
    if d == "hard":
        for a, d_ in take(rng, list(product([2,3,4,5,6], [1,2,3,4])), 20):
            # eigenvalues of [[a, 0], [0, d]] = a, d
            qs.append(msq("Engineering Mathematics", d,
                f"Eigenvalues of the matrix [[{a},0],[0,{d_}]] are:",
                [str(a), str(d_), str(a+d_), str(a*d_)], [0, 1],
                f"Diagonal matrix → eigenvalues are the diagonal entries: {a} and {d_}.",
                "Linear Algebra"))
        for k in take(rng, [2,3,4,5], 4):
            for c in take(rng, [1,2,3], 3):
                # dy/dx = ky, y(0)=c → y = c·e^(kx); at x=1 → c·e^k
                val = c * (2.71828 ** k)
                qs.append(nat("Engineering Mathematics", d,
                    f"Solve dy/dx = {k}y with y(0)={c}. Find y(1).", val, 0.5,
                    f"Solution: y = {c}·e^({k}x). At x=1, y = {c}·e^{k} ≈ {val:.3f}.",
                    "Differential Equations"))
    return qs

# ============================================================
# 2. GENERAL APTITUDE
# ============================================================
def gen_aptitude(rng, d):
    qs = []
    if d == "easy":
        # percentages, simple ratios
        for x, p in take(rng, list(product([50,80,100,150,200,250], [10,20,25,30,40,50])), 36):
            qs.append(nat("General Aptitude", d,
                f"{p}% of {x} is:", x*p/100, 0,
                f"{p}/100 × {x} = {x*p/100:g}.", "Percentages"))
        # simple averages
        for trio in take(rng, [(2,4,6),(10,20,30),(5,10,15),(3,9,12),(7,14,21)], 5):
            avg = sum(trio)/3
            qs.append(nat("General Aptitude", d,
                f"Average of {trio[0]}, {trio[1]}, {trio[2]} is:", avg, 0.01,
                f"({trio[0]}+{trio[1]}+{trio[2]})/3 = {avg:g}.", "Averages"))
    if d == "medium":
        # speed-distance-time
        for s, t in take(rng, list(product([40,50,60,72,90,100], [1.5,2,2.5,3,3.5,4])), 30):
            qs.append(nat("General Aptitude", d,
                f"A train moves at {s} km/h for {t} h. Distance covered (km):",
                s*t, 0, f"d = s·t = {s}×{t} = {s*t:g} km.", "Speed-Distance-Time"))
        # ratio sharing
        for a, b, tot in take(rng, [(3,5,80),(2,7,90),(4,9,130),(5,8,260),(7,11,360)], 5):
            share = tot * a // (a+b)
            qs.append(nat("General Aptitude", d,
                f"₹{tot} shared in ratio {a}:{b}. Smaller share (₹):",
                share, 0, f"= {tot}×{a}/({a+b}) = {share}.", "Ratios"))
        # series next-term
        for start, step in take(rng, list(product([2,3,5,7,11], [2,3,4,5])), 15):
            seq = [start + i*step for i in range(4)]
            nxt = start + 4*step
            qs.append(nat("General Aptitude", d,
                f"Next term in the AP {seq[0]}, {seq[1]}, {seq[2]}, {seq[3]}, ?",
                nxt, 0, f"Common difference = {step}. Next = {seq[-1]} + {step} = {nxt}.",
                "Number Series"))
    if d == "hard":
        # compound interest
        for p, r, n in take(rng, list(product([1000,2000,5000,10000], [5,10,12], [2,3,4])), 24):
            amt = p * (1 + r/100)**n
            qs.append(nat("General Aptitude", d,
                f"₹{p} at {r}% CI for {n} years. Amount (₹):", amt, 1,
                f"A = P(1+r/100)^n = {p}·({1+r/100})^{n} ≈ {amt:.2f}.",
                "Compound Interest"))
        # work-time
        for a, b in take(rng, [(6,12),(8,24),(10,15),(12,20),(9,18)], 5):
            t = (a*b)/(a+b)
            qs.append(nat("General Aptitude", d,
                f"A alone finishes a job in {a} days, B in {b} days. Together they take (days):",
                t, 0.05,
                f"Rate = 1/{a}+1/{b} = ({a+b})/({a*b}). Time = {a*b}/({a+b}) = {t:.2f}.",
                "Work-Time"))
    return qs

# ============================================================
# 3. MINE VENTILATION
# ============================================================
def gen_ventilation(rng, d):
    qs = []
    if d == "easy":
        # Atkinson's friction pressure: P = K L O Q² / A³
        for K, L, O, A, Q in take(rng, list(product([0.012,0.015], [200,400,600], [10,12], [12,15], [20,30])), 36):
            P = K * L * O * Q**2 / A**3
            qs.append(nat("Mine Ventilation", d,
                f"Friction pressure (Pa) for K={K}, L={L} m, perimeter O={O} m, area A={A} m², Q={Q} m³/s? Use P = KLOQ²/A³.",
                P, P*0.05,
                f"P = {K}·{L}·{O}·{Q}²/{A}³ = {P:.2f} Pa.", "Friction Pressure"))
    if d == "medium":
        # air power = P × Q
        for P, Q in take(rng, list(product([500,800,1200,1500,2000,2500], [20,30,40,50,60,80])), 36):
            ap = P*Q/1000
            qs.append(nat("Mine Ventilation", d,
                f"Air power (kW) for pressure {P} Pa and quantity {Q} m³/s:",
                ap, 0.1, f"AP = PQ = {P}×{Q}/1000 = {ap:g} kW.", "Air Power"))
        # CH4 threshold MCQ
        for limit, ans in take(rng, [(1.25,1),(2.0,2),(5.0,3)], 3):
            qs.append(mcq("Mine Ventilation", d,
                "DGMS allowable methane (CH₄) percentage in general body of return air before withdrawal of workers is:",
                ["0.25","0.75","1.25","2.00"], 2,
                "DGMS norm: 1.25% in general body of return; withdrawal at 2%.",
                "Statutory Limits"))
    if d == "hard":
        # Series & parallel resistance combination
        for R1, R2, Q in take(rng, list(product([0.5,1.0,2.0,3.0], [0.5,1.0,2.0,3.0], [40,60,80])), 36):
            R_ser = R1 + R2
            P = R_ser * Q**2
            qs.append(nat("Mine Ventilation", d,
                f"Two airways in series with resistances {R1} and {R2} N·s²/m⁸ carry Q={Q} m³/s. Pressure loss (Pa):",
                P, P*0.02, f"R_total = {R_ser}. P = R·Q² = {R_ser}·{Q}² = {P:g} Pa.",
                "Network Analysis"))
    return qs

# ============================================================
# 4. ROCK MECHANICS
# ============================================================
def gen_rock(rng, d):
    qs = []
    if d == "easy":
        # vertical stress = γ·H
        for gamma, H in take(rng, list(product([0.025,0.027,0.030], [100,200,300,400,500,600])), 36):
            sv = gamma * H
            qs.append(nat("Rock Mechanics", d,
                f"Vertical stress (MPa) at depth {H} m for unit weight γ={gamma*1000:g} kN/m³:",
                sv, 0.01, f"σ_v = γH = {gamma}·{H} = {sv:.2f} MPa.",
                "In-situ Stress"))
    if d == "medium":
        # Young's modulus from σ and ε
        for sigma, eps in take(rng, list(product([20,50,80,100,150], [0.001,0.002,0.003,0.0005])), 30):
            E = sigma/eps/1000
            qs.append(nat("Rock Mechanics", d,
                f"A rock sample shows axial stress {sigma} MPa at strain {eps}. Young's modulus (GPa):",
                E, E*0.02, f"E = σ/ε = {sigma}/{eps} = {sigma/eps:g} MPa = {E:.2f} GPa.",
                "Elastic Constants"))
        # Poisson's ratio identification
        qs.append(mcq("Rock Mechanics", "medium",
            "Typical Poisson's ratio for intact hard rocks lies in the range:",
            ["0.05–0.10","0.15–0.30","0.40–0.45","0.50–0.60"], 1,
            "Most hard rocks (granite, basalt) have ν between 0.15 and 0.30.",
            "Elastic Constants"))
    if d == "hard":
        # Pillar safety factor (tributary area)
        for w_p, w_o, sigma_p, H in take(rng, list(product([4,6,8], [4,6,8], [40,60,80], [200,300,400])), 36):
            sigma_v = 0.027*H
            sigma_pillar = sigma_v * (1 + w_o/w_p)**2
            sf = sigma_p / sigma_pillar
            qs.append(nat("Rock Mechanics", d,
                f"Tributary-area pillar load: depth {H} m (γ=27 kN/m³), pillar width {w_p} m, opening {w_o} m, pillar strength {sigma_p} MPa. Safety factor:",
                sf, sf*0.02,
                f"σ_v = 0.027×{H} = {sigma_v:.2f} MPa. σ_p = σ_v(1+w_o/w_p)² = {sigma_pillar:.2f}. SF = {sigma_p}/{sigma_pillar:.2f} = {sf:.2f}.",
                "Pillar Design"))
    return qs

# ============================================================
# 5. SURFACE MINING
# ============================================================
def gen_surface(rng, d):
    qs = []
    if d == "easy":
        # Stripping ratio = waste / ore
        for w, ore in take(rng, list(product([1000,2000,5000,8000,10000,15000], [500,800,1200,2000,3000])), 30):
            sr = w/ore
            qs.append(nat("Surface Mining", d,
                f"Stripping ratio when {w} m³ of waste is removed for {ore} t of coal (assume 1 t = 1 m³ for SR units of m³/t):",
                sr, 0.01, f"SR = waste/ore = {w}/{ore} = {sr:.2f} m³/t.",
                "Stripping Ratio"))
    if d == "medium":
        # Truck cycle time → trips/hr
        for load, haul, dump, ret in take(rng, list(product([2,3,4], [10,12,15], [1.5,2], [8,10,12])), 36):
            cycle = load + haul + dump + ret
            trips = 60/cycle
            qs.append(nat("Surface Mining", d,
                f"Dumper cycle: load {load} min, haul {haul} min, dump {dump} min, return {ret} min. Trips per hour:",
                trips, 0.05,
                f"Cycle = {cycle} min. Trips/hr = 60/{cycle} = {trips:.2f}.",
                "Equipment Productivity"))
    if d == "hard":
        # Dragline production: bucket × cycles/hr × swell × fill × avail
        for B, cph, fill, swell, avail in take(rng, list(product([30,40,50], [50,55,60], [0.85,0.9], [0.75,0.8], [0.85,0.9])), 36):
            prod = B * cph * fill * swell * avail
            qs.append(nat("Surface Mining", d,
                f"Dragline: bucket {B} m³, {cph} cycles/hr, fill factor {fill}, swell factor {swell}, availability {avail}. Bank m³/hr:",
                prod, prod*0.02,
                f"Q = B·N·F·S·A = {B}·{cph}·{fill}·{swell}·{avail} ≈ {prod:.1f} bcm/hr.",
                "Dragline Sizing"))
    return qs

# ============================================================
# 6. UNDERGROUND MINING
# ============================================================
def gen_underground(rng, d):
    qs = []
    if d == "easy":
        # Bord-and-pillar % extraction (first workings) = (w_o)²/(w_o+w_p)² roughly
        qs.append(mcq("Underground Mining", d,
            "In bord-and-pillar mining, FIRST WORKINGS typically extract what % of the seam?",
            ["10–15%","20–35%","50–60%",">75%"], 1,
            "Typically 20–35% extraction during development; balance recovered during depillaring.",
            "Bord & Pillar"))
        qs.append(mcq("Underground Mining", d,
            "Longwall face is supported by which type of support?",
            ["Cog & chock","Wooden props","Powered roof support (chock-shield)","Rock bolts only"], 2,
            "Modern longwall faces use hydraulic powered roof supports (chock-shields).",
            "Longwall"))
        # Padding
        for h, l in take(rng, list(product([2,3,4], [60,80,100,120])), 12):
            qs.append(mcq("Underground Mining", d,
                f"For a longwall panel of height {h} m and length {l} m, which method of caving is most common in Indian coal mines?",
                ["Stowing","Hydraulic fill","Caving (allowed)","Backfill with mill tailings"], 2,
                "Most Indian longwalls operate with caving allowed behind shields.",
                "Longwall"))
    if d == "medium":
        # Output per shift in B&P
        for face, A, p, eff in take(rng, list(product([4,6,8], [12,15], [0.8,0.85,0.9], [0.8,0.85])), 36):
            output = face * A * p * eff
            qs.append(nat("Underground Mining", d,
                f"B&P face: {face} m web cut, {A} m² section, density 1.5 t/m³, advance efficiency {p}, time util {eff}. Tonnes per cycle:",
                output * 1.5, output*0.1,
                f"Volume = web×area×eff×util = {face}·{A}·{p}·{eff} = {output:.2f} m³ → ×1.5 t/m³ ≈ {output*1.5:.2f} t.",
                "Production Calculation"))
    if d == "hard":
        # Longwall daily production
        for face_len, web, h, density, cycles in take(rng, list(product([150,180,200], [0.8,1.0], [2,3,4], [1.4,1.5], [3,4,5])), 36):
            t = face_len * web * h * density * cycles
            qs.append(nat("Underground Mining", d,
                f"Longwall: face {face_len} m, web {web} m, height {h} m, density {density} t/m³, {cycles} cycles/day. Daily output (t):",
                t, t*0.02,
                f"Tonnes = L·web·h·ρ·n = {face_len}·{web}·{h}·{density}·{cycles} = {t:.1f} t/day.",
                "Longwall Output"))
    return qs

# ============================================================
# 7. DRILLING & BLASTING
# ============================================================
def gen_blasting(rng, d):
    qs = []
    if d == "easy":
        # Powder factor
        for charge, vol in take(rng, list(product([50,100,150,200,300], [200,400,500,800,1000])), 25):
            pf = charge/vol
            qs.append(nat("Drilling & Blasting", d,
                f"Powder factor (kg/m³) for {charge} kg of explosive yielding {vol} m³ of broken rock:",
                pf, 0.01, f"PF = charge/volume = {charge}/{vol} = {pf:.3f} kg/m³.",
                "Powder Factor"))
        # ANFO composition
        qs.append(mcq("Drilling & Blasting", d,
            "Standard composition of ANFO (by mass) is:",
            ["94% AN + 6% FO","80% AN + 20% FO","50% AN + 50% FO","99% AN + 1% FO"], 0,
            "ANFO = 94% ammonium nitrate + 6% fuel oil.",
            "Explosives"))
    if d == "medium":
        # VOD relation, scaled distance
        for W, R in take(rng, list(product([50,100,200,300,500], [50,100,200,300,500])), 25):
            SD = R / (W**0.5)
            qs.append(nat("Drilling & Blasting", d,
                f"Scaled distance (m/√kg) for charge {W} kg at distance {R} m:",
                SD, SD*0.02, f"SD = R/√W = {R}/√{W} = {SD:.2f}.",
                "Vibration Control"))
        qs.append(mcq("Drilling & Blasting", "medium",
            "Detonator most commonly used with safety fuse in Indian metal mines is:",
            ["Plain detonator (#6 or #8)","Electric instantaneous","Electronic","Nonel only"], 0,
            "Plain detonators (#6/#8) crimped to safety fuse are standard.",
            "Initiation Systems"))
    if d == "hard":
        # Burden by Langefors-Kihlstrom formula (simplified): B = 0.014·d·√(ρ_e·s/c)
        for d_mm, rho_e, s_c in take(rng, list(product([89,115,165,200], [0.85,0.9], [0.4,0.5,0.6])), 24):
            B = 0.014 * d_mm * (rho_e * s_c)**0.5
            qs.append(nat("Drilling & Blasting", d,
                f"Approximate burden (m) for hole dia {d_mm} mm, ρ_e={rho_e} g/cc, weight-strength × rock factor = {s_c}, using B = 0.014·d·√(ρ·s/c):",
                B, B*0.05,
                f"B = 0.014×{d_mm}×√({rho_e}·{s_c}) = {B:.2f} m.",
                "Blast Design"))
    return qs

# ============================================================
# 8. MINERAL PROCESSING
# ============================================================
def gen_processing(rng, d):
    qs = []
    if d == "easy":
        # Recovery R = C·c/(F·f)
        for F, f, C, c in take(rng, list(product([100], [5,8,10], [10,15,20], [40,50,60])), 27):
            R = (C*c)/(F*f) * 100
            qs.append(nat("Mineral Processing", d,
                f"Recovery (%) for feed {F} t at {f}% metal, concentrate {C} t at {c}% metal:",
                R, R*0.02,
                f"R = (C·c)/(F·f)·100 = ({C}×{c})/({F}×{f})·100 = {R:.2f}%.",
                "Mass Balance"))
    if d == "medium":
        # Reduction ratio
        for F, P in take(rng, list(product([100,200,500,800,1000], [5,10,20,50,80])), 25):
            RR = F/P
            qs.append(nat("Mineral Processing", d,
                f"Reduction ratio for feed top size {F} mm and product top size {P} mm:",
                RR, 0.05, f"RR = F/P = {F}/{P} = {RR:.2f}.",
                "Comminution"))
        qs.append(mcq("Mineral Processing", "medium",
            "Bond's work index represents the energy needed to reduce a feed of:",
            ["1 cm to 1 mm","Infinite size to 100 µm","100 mm to 50 mm","1 mm to 100 µm"], 1,
            "Bond's law: W = 10Wi(1/√P − 1/√F) with sizes in µm; Wi corresponds to F→∞ and P=100 µm.",
            "Comminution"))
    if d == "hard":
        # Two-product formula for yield
        for f, c, t in take(rng, list(product([5,8,10,12], [40,50,60], [0.5,1,2])), 36):
            y = (f - t)/(c - t) * 100
            qs.append(nat("Mineral Processing", d,
                f"Two-product yield (%) for feed grade {f}%, concentrate grade {c}%, tailing grade {t}%:",
                y, y*0.02,
                f"Y = (f−t)/(c−t)·100 = ({f}−{t})/({c}−{t})·100 = {y:.2f}%.",
                "Mass Balance"))
    return qs

# ============================================================
# 9. MINE SURVEYING
# ============================================================
def gen_surveying(rng, d):
    qs = []
    if d == "easy":
        # Levelling: RL2 = RL1 + BS − FS
        for RL, BS, FS in take(rng, list(product([100,150,200], [1.2,1.5,1.8,2.0,2.5], [0.5,0.8,1.0,1.2])), 30):
            new_RL = RL + BS - FS
            qs.append(nat("Mine Surveying", d,
                f"RL of A = {RL} m; BS on A = {BS:g}, FS on B = {FS:g}. RL of B (m):",
                new_RL, 0.01,
                f"RL_B = RL_A + BS − FS = {RL} + {BS} − {FS} = {new_RL:g}.",
                "Levelling"))
    if d == "medium":
        # Bearing → quadrant
        cases = [(40,"N40°E"),(120,"S60°E"),(210,"S30°W"),(300,"N60°W")]
        for whb, qb in cases:
            qs.append(mcq("Mine Surveying", d,
                f"WCB = {whb}°. Quadrantal bearing is:",
                ["N40°E","S60°E","S30°W","N60°W"],
                [a[1] for a in cases].index(qb),
                f"WCB {whb}° converts to {qb}.",
                "Compass Surveying"))
        # area of triangle from coords
        for x1,y1,x2,y2,x3,y3 in take(rng, [(0,0,4,0,0,3),(0,0,6,0,0,8),(0,0,10,0,5,12)], 3):
            A = abs(x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2))/2
            qs.append(nat("Mine Surveying", d,
                f"Area of triangle with vertices ({x1},{y1}),({x2},{y2}),({x3},{y3}):",
                A, 0.05, f"A = ½|Σx_i(y_{{i+1}}−y_{{i-1}})| = {A:g}.",
                "Coordinate Geometry"))
    if d == "hard":
        # Correction for slope
        for L, h in take(rng, list(product([30,50,100,200], [0.5,1,2,3,4])), 20):
            corr = h*h/(2*L)
            qs.append(nat("Mine Surveying", d,
                f"Slope correction (m) for measured length {L} m with elevation difference {h} m:",
                corr, 0.001, f"C = h²/(2L) = {h}²/(2×{L}) = {corr:.4f} m.",
                "Tape Corrections"))
        # bearing back-bearing
        for fb in take(rng, [30, 75, 110, 200, 285], 5):
            bb = fb + 180 if fb < 180 else fb - 180
            qs.append(nat("Mine Surveying", d,
                f"Back bearing (°) when fore bearing is {fb}°:", bb, 0,
                f"BB = FB ± 180°. Here BB = {bb}°.",
                "Compass Surveying"))
    return qs

# ============================================================
# 10. MINE ENVIRONMENT & SAFETY
# ============================================================
def gen_env(rng, d):
    qs = []
    if d == "easy":
        for limit, choices, idx in [
            ("CO TLV (ppm) – DGMS", ["10","25","50","100"], 1),
            ("NO₂ TLV (ppm)", ["1","3","5","10"], 1),
            ("H₂S TLV (ppm)", ["1","5","10","20"], 2),
            ("SO₂ TLV (ppm)", ["1","2","5","10"], 1),
        ]:
            qs.append(mcq("Mine Environment & Safety", d,
                f"What is the {limit}?", choices, idx,
                f"Statutory TLV per DGMS: option ({chr(65+idx)}).",
                "Gas Threshold Limits"))
        for h, ans in [("Wet bulb temp limit (°C) for normal work", "30.5"),
                       ("Min air velocity (m/s) at coal face", "1.0"),
                       ("Max ambient noise exposure (dBA) for 8 h", "90")]:
            qs.append(mcq("Mine Environment & Safety", d,
                f"{h}:",
                ["30.5","32","28","35"] if "Wet" in h else
                ["0.5","1.0","2.0","3.0"] if "velocity" in h else
                ["75","85","90","95"], 0 if "30.5" in ans else (1 if ans=="1.0" else 2),
                f"DGMS prescribed: {ans}.",
                "Workplace Norms"))
    if d == "medium":
        # Heat stress index (simple): WBGT = 0.7·Twb + 0.2·Tg + 0.1·Tdb
        for twb, tg, tdb in take(rng, list(product([26,28,30], [32,34,36], [28,30,32])), 27):
            w = 0.7*twb + 0.2*tg + 0.1*tdb
            qs.append(nat("Mine Environment & Safety", d,
                f"WBGT (°C) for Twb={twb}, Tg={tg}, Tdb={tdb}. (Indoor formula: 0.7Twb + 0.2Tg + 0.1Tdb).",
                w, 0.05, f"WBGT = 0.7×{twb}+0.2×{tg}+0.1×{tdb} = {w:.2f}.",
                "Heat Stress"))
    if d == "hard":
        # Dilution: Q = G / (C_set − C_in)
        for G, Cset, Cin in take(rng, list(product([0.1,0.2,0.5,1.0], [0.005,0.0125], [0,0.001])), 24):
            Q = G / (Cset - Cin)
            qs.append(nat("Mine Environment & Safety", d,
                f"Methane emission {G} m³/s, allowable concentration {Cset*100}%, inlet {Cin*100}%. Required dilution airflow (m³/s):",
                Q, Q*0.02,
                f"Q = G/(C_set − C_in) = {G}/({Cset}−{Cin}) = {Q:.2f} m³/s.",
                "Gas Dilution"))
    return qs

# ============================================================
# Build full bank
# ============================================================
SUBJECTS = [
    ("engineering-mathematics", "Engineering Mathematics", gen_math),
    ("general-aptitude",        "General Aptitude",        gen_aptitude),
    ("mine-ventilation",        "Mine Ventilation",        gen_ventilation),
    ("rock-mechanics",          "Rock Mechanics",          gen_rock),
    ("surface-mining",          "Surface Mining",          gen_surface),
    ("underground-mining",      "Underground Mining",      gen_underground),
    ("drilling-blasting",       "Drilling & Blasting",     gen_blasting),
    ("mineral-processing",      "Mineral Processing",      gen_processing),
    ("mine-surveying",          "Mine Surveying",          gen_surveying),
    ("mine-environment",        "Mine Environment & Safety", gen_env),
]

bank = []
for slug, name, fn in SUBJECTS:
    subject_qs = []
    for tier in ("easy", "medium", "hard"):
        rng = random.Random(f"{slug}-{tier}")
        # Generate, then deterministically shuffle + cap
        qs = fn(rng, tier)
        rng.shuffle(qs)
        subject_qs.extend(qs)
    # Add a stable id per question
    for i, q in enumerate(subject_qs):
        q["id"] = f"{slug}-{q['difficulty']}-{i+1:04d}"
    bank.append({"slug": slug, "name": name, "questions": subject_qs})
    print(f"  {name:30s}  {len([q for q in subject_qs if q['difficulty']=='easy']):3d}E"
          f" {len([q for q in subject_qs if q['difficulty']=='medium']):3d}M"
          f" {len([q for q in subject_qs if q['difficulty']=='hard']):3d}H"
          f" = {len(subject_qs):3d} total")

total = sum(len(s['questions']) for s in bank)
print(f"\nTotal: {total} questions across {len(bank)} subjects")

# ============================================================
# Emit TypeScript
# ============================================================
header = """// AUTO-GENERATED by scripts/build_practice.py — do not edit by hand.
// Re-run: python3 scripts/build_practice.py
// Total: {total} questions, {n} subjects.

export type PracticeQuestion =
  | {{ id: string; subject: string; topic: string; difficulty: "easy"|"medium"|"hard"; type: "MCQ"; stem: string; options: string[]; answer: number; solution: string; }}
  | {{ id: string; subject: string; topic: string; difficulty: "easy"|"medium"|"hard"; type: "MSQ"; stem: string; options: string[]; answer: number[]; solution: string; }}
  | {{ id: string; subject: string; topic: string; difficulty: "easy"|"medium"|"hard"; type: "NAT"; stem: string; answer: number; tolerance: number; solution: string; }};

export interface PracticeSubject {{
  slug: string;
  name: string;
  questions: PracticeQuestion[];
}}

export const PRACTICE: PracticeSubject[] = """.format(total=total, n=len(bank))

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(header + json.dumps(bank, indent=2, ensure_ascii=False) + ";\n")
print(f"\nWrote {OUT}")
