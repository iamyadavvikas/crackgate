"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CIL_RECRUITMENT_URL, CIL_TOTAL_SEATS } from "@/data/cil";
import { CIL_PATTERN } from "@/data/cil-mocks";
import { PsuWindow } from "@/components/hero-carousel";

const AUTOPLAY_MS = 3000;
const EASE = [0.16, 1, 0.3, 1] as const;
const SLIDE_COUNT = 2;

/**
 * PSU > CIL page hero rendered as a 2-slide carousel:
 *   slide 1 — the CIL Management Trainee hero (pattern + seats + CTAs)
 *   slide 2 — the shared homepage PSU/CIL window (eligibility & seats table)
 */
export function PsuCilHero() {
  const [[active, direction], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setState(([cur]) => {
      const target = (next + SLIDE_COUNT) % SLIDE_COUNT;
      return [target, target > cur || (cur === SLIDE_COUNT - 1 && target === 0) ? 1 : -1];
    });
  }, []);

  const goRel = useCallback((delta: number) => {
    setState(([cur]) => [(cur + delta + SLIDE_COUNT) % SLIDE_COUNT, delta]);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    timer.current = setInterval(() => {
      setState(([cur]) => [(cur + 1) % SLIDE_COUNT, 1]);
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
      aria-label="Coal India Limited Management Trainee"
      className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative min-h-[560px] lg:min-h-[600px]">
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
            aria-label={active === 0 ? "CIL Management Trainee — overview" : "CIL eligibility & seats"}
          >
            {active === 0 ? <CilOverviewSlide /> : <PsuWindow />}
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
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active === i}
            className={`h-2 rounded-full transition-all duration-300 ${
              active === i ? "w-7 bg-cyan-400" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── Slide 1 — overview ─────────────────────────── */

function CilOverviewSlide() {
  return (
    <div className="relative h-full w-full">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <span className="badge border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
          PSU Recruitment · Coal India Limited
        </span>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] lg:text-6xl">
          Coal India Limited
          <span className="block text-cyan-300">Management Trainee</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/80">
          Maximize your rank for MT positions. Discipline-wise mock series targeting mining legislation,
          DGMS safety guidelines and historical PSU weightage matrices.
        </p>

        {/* pattern strip */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Stat value={`${CIL_TOTAL_SEATS}`} label="Total seats advertised" />
          <Stat value={`${CIL_PATTERN.questions}`} label="MCQs" />
          <Stat value={`${CIL_PATTERN.durationMin / 60} hrs`} label="Duration" />
          <Stat value="2" label="Papers (Tech + Aptitude)" />
          <Stat value="15" label="Mocks / discipline" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={CIL_RECRUITMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cg-neon inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-cyan-400/10 px-6 py-3.5 text-base font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            View Official Notification <span aria-hidden>↗</span>
          </a>
          <a href="#disciplines" className="btn bg-white/10 text-white border border-white/25 hover:bg-white/20 btn-lg">
            Choose your discipline
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Shared bits ─────────────────────────────── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
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
