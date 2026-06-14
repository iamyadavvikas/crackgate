"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CIL_ROWS } from "@/data/cil";

type Props = {
  practiceQs: number;
  mocksCount: number;
  subjectsCount: number;
};

const AUTOPLAY_MS = 3000;
const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroCarousel({ practiceQs, mocksCount, subjectsCount }: Props) {
  const [[active, direction], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setState(([cur]) => {
      const target = (next + 2) % 2;
      return [target, target > cur || (cur === 1 && target === 0) ? 1 : -1];
    });
  }, []);

  const goRel = useCallback((delta: number) => {
    setState(([cur]) => [(cur + delta + 2) % 2, delta]);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    timer.current = setInterval(() => {
      setState(([cur]) => [(cur + 1) % 2, 1]);
    }, AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduceMotion]);

  const variants = {
    enter: (dir: number) => ({ x: reduceMotion ? 0 : dir > 0 ? "100%" : "-100%", opacity: reduceMotion ? 0 : 1 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduceMotion ? 0 : dir > 0 ? "-100%" : "100%", opacity: reduceMotion ? 0 : 1 }),
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="CrackGate exam tracks"
      className="relative overflow-hidden bg-slate-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative min-h-[600px] lg:min-h-[620px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={active}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0.3 : 0.8, ease: EASE }}
            className="absolute inset-0"
            aria-roledescription="slide"
            aria-label={active === 0 ? "GATE MN 2027 — Academic track" : "PSU recruitment — Coal India Limited"}
          >
            {active === 0 ? (
              <GateWindow practiceQs={practiceQs} mocksCount={mocksCount} subjectsCount={subjectsCount} />
            ) : (
              <PsuWindow />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => goRel(-1)}
        aria-label="Previous slide"
        className="group absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur-md transition hover:bg-white/20 sm:left-5"
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        onClick={() => goRel(1)}
        aria-label="Next slide"
        className="group absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur-md transition hover:bg-white/20 sm:right-5"
      >
        <ChevronRight />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {[0, 1].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active === i}
            className={`h-2 rounded-full transition-all duration-300 ${
              active === i ? "w-7 bg-accent" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── WINDOW 1 — GATE MN ───────────────────────── */

export function GateWindow({ practiceQs, mocksCount, subjectsCount }: Props) {
  return (
    <div className="relative h-full w-full">
      <IitBackdrop />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-950" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-amber-300/30 bg-amber-300/10 text-amber-300">
            GATE 2027 · Mining Engineering (MN)
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-6xl">
            Conquer GATE MN 2027.{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Secure Your Seat at the Premier IITs.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Engineered by elite IITians. Master Geomechanics, Advanced Ventilation, and Math through
            high-fidelity, TCS iON-standard exam simulations.
          </p>
          <div className="mt-8">
            <Link href="/login" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:brightness-105">
              Launch Free Exam Portal <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
            <Stat n={`${practiceQs}+`} label="Practice Questions" />
            <Stat n="200+" label="Mock Questions" />
            <Stat n={`${mocksCount}`} label="Full-length Mocks" />
            <Stat n={`${subjectsCount}`} label="Subjects" />
          </div>
        </div>
        <div className="hidden lg:flex lg:justify-center">
          <StudentScene />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── WINDOW 2 — PSU / CIL ───────────────────────── */

function PsuWindow() {
  return (
    <div className="relative h-full w-full">
      <OpencastBackdrop />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 to-slate-900" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
            PSU Recruitment · Coal India Limited
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-6xl">
            Crack the PSU Exams.{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Direct Route to Coal India Limited (CIL).
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Maximize your rank for Management Trainee (MT) positions. Tailored question banks targeting
            mining legislation, DGMS safety guidelines, and historical PSU weightage matrices.
          </p>
          <div className="mt-8">
            <Link href="/psu/cil" className="cg-neon inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-cyan-400/10 px-6 py-3.5 text-base font-semibold text-cyan-200 transition hover:bg-cyan-400/20">
              Explore PSU Prep Modules <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <div className="lg:pl-4">
          <CilEligibilityCard />
        </div>
      </div>
    </div>
  );
}

function CilEligibilityCard() {
  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4 shadow-pop backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          CIL Management Trainee · Eligibility
        </div>
        <span className="badge bg-cyan-400/10 text-cyan-200">Codes 11–17</span>
      </div>
      <div className="max-h-[300px] overflow-y-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-800/90 text-cyan-200 backdrop-blur">
            <tr>
              <th className="px-2 py-2 font-semibold">Code</th>
              <th className="px-2 py-2 font-semibold">Discipline</th>
              <th className="px-2 py-2 font-semibold">Minimum Qualification</th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            {CIL_ROWS.map((r) => (
              <tr key={r.code} className="border-t border-white/5 align-top">
                <td className="px-2 py-2 font-mono text-cyan-300">{r.code}</td>
                <td className="px-2 py-2 font-medium text-white">{r.discipline}</td>
                <td className="px-2 py-2 leading-snug">{r.qualification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────────── Shared bits ───────────────────────── */

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-white">{n}</div>
      <div className="text-xs uppercase tracking-wide">{label}</div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* Faint heritage-building line art for the GATE window */
function IitBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute right-0 top-0 h-full w-full opacity-[0.12]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#e2e8f0" strokeWidth="2" aria-hidden>
        <rect x="120" y="220" width="560" height="300" />
        <rect x="360" y="120" width="80" height="100" />
        <path d="M340 120 L400 60 L460 120 Z" />
        <line x1="120" y1="300" x2="680" y2="300" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1={150 + i * 50} y1="300" x2={150 + i * 50} y2="520" />
        ))}
        <line x1="120" y1="430" x2="680" y2="430" />
        <circle cx="400" cy="170" r="14" />
      </svg>
    </div>
  );
}

/* Opencast shovel-dumper bench line art for the PSU window */
function OpencastBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.14]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#67e8f9" strokeWidth="2" aria-hidden>
        {/* stepped benches */}
        <path d="M0 520 H300 V440 H520 V360 H720 V280 H800" />
        <path d="M0 560 H360 V480 H560 V400 H760 V320 H800" />
        {/* dumper truck */}
        <g transform="translate(120 470)">
          <path d="M0 0 H120 L150 -40 H40 L0 0 Z" />
          <circle cx="35" cy="14" r="16" />
          <circle cx="110" cy="14" r="16" />
        </g>
        {/* shovel */}
        <g transform="translate(560 320)">
          <rect x="0" y="0" width="60" height="50" />
          <path d="M60 10 L120 -20 L150 0 L120 30 Z" />
        </g>
      </svg>
    </div>
  );
}

/* Lightweight animated student-at-laptop with floating mining symbols */
function StudentScene() {
  const float = (delay: number) => ({
    animate: { y: [0, -10, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const, delay },
  });
  return (
    <div className="relative h-[360px] w-[360px]">
      {/* glow */}
      <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-3xl" />

      {/* student card */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden>
          <circle cx="110" cy="70" r="34" fill="#fbbf24" />
          <rect x="64" y="104" width="92" height="64" rx="14" fill="#6366f1" />
          <rect x="40" y="168" width="140" height="14" rx="6" fill="#1e293b" />
          <rect x="56" y="150" width="108" height="22" rx="4" fill="#334155" />
          <rect x="70" y="120" width="80" height="34" rx="4" fill="#0ea5e9" />
          <line x1="78" y1="130" x2="142" y2="130" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
          <line x1="78" y1="140" x2="120" y2="140" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* floating safety helmet */}
      <motion.div {...float(0)} className="absolute left-2 top-6">
        <Holo>
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
            <path d="M6 26 a14 14 0 0 1 28 0 Z" fill="#f59e0b" />
            <rect x="4" y="26" width="32" height="5" rx="2.5" fill="#fcd34d" />
            <rect x="18" y="6" width="4" height="8" rx="2" fill="#fde68a" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating ventilation fan */}
      <motion.div {...float(0.8)} className="absolute right-2 top-12">
        <Holo>
          <motion.svg
            width="42" height="42" viewBox="0 0 42 42" aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="21" cy="21" r="20" stroke="#38bdf8" strokeWidth="2" fill="none" />
            {[0, 120, 240].map((a) => (
              <path key={a} d="M21 21 C 28 8, 36 14, 21 21" fill="#7dd3fc" transform={`rotate(${a} 21 21)`} />
            ))}
            <circle cx="21" cy="21" r="3.5" fill="#0ea5e9" />
          </motion.svg>
        </Holo>
      </motion.div>

      {/* floating coordinate grid */}
      <motion.div {...float(1.6)} className="absolute bottom-4 left-10">
        <Holo>
          <svg width="48" height="40" viewBox="0 0 48 40" aria-hidden fill="none" stroke="#34d399" strokeWidth="1.5">
            <rect x="2" y="2" width="44" height="36" rx="3" />
            <line x1="14" y1="2" x2="14" y2="38" />
            <line x1="26" y1="2" x2="26" y2="38" />
            <line x1="38" y1="2" x2="38" y2="38" />
            <line x1="2" y1="14" x2="46" y2="14" />
            <line x1="2" y1="26" x2="46" y2="26" />
            <circle cx="26" cy="14" r="3" fill="#34d399" stroke="none" />
          </svg>
        </Holo>
      </motion.div>
    </div>
  );
}

function Holo({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-2 shadow-lg backdrop-blur-md">
      {children}
    </div>
  );
}
