"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { cn, secondsToHMS } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Q =
  | { id: string; subject: string; topic: string; difficulty: "easy" | "medium" | "hard"; type: "MCQ"; stem: string; options: string[]; answer: number; solution: string }
  | { id: string; subject: string; topic: string; difficulty: "easy" | "medium" | "hard"; type: "MSQ"; stem: string; options: string[]; answer: number[]; solution: string }
  | { id: string; subject: string; topic: string; difficulty: "easy" | "medium" | "hard"; type: "NAT"; stem: string; answer: number; tolerance: number; solution: string };

type Difficulty = "mixed" | "easy" | "medium" | "hard";
type Answer = number | number[] | string | undefined;

/**
 * Palette colours follow GATE NTA convention:
 *   nv     – Not visited                  (grey)
 *   not    – Visited, not answered        (rose)
 *   ans    – Answered (submitted)         (emerald)
 *   mark   – Marked for review, no answer (violet)
 *   marka  – Marked & answered            (violet + emerald ring)
 */
type Status = "nv" | "not" | "ans" | "mark" | "marka";

interface State {
  idx: number;
  answers:   Record<number, Answer>;
  status:    Record<number, Status>;
  submitted: Record<number, boolean>;
}

type Action =
  | { type: "go"; i: number }
  | { type: "set"; idx: number; answer: Answer }
  | { type: "mark"; idx: number; status: Status }
  | { type: "submit"; idx: number }
  | { type: "clear"; idx: number };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "go":     return { ...s, idx: a.i };
    case "set":    return { ...s, answers: { ...s.answers, [a.idx]: a.answer } };
    case "mark":   return { ...s, status:  { ...s.status,  [a.idx]: a.status } };
    case "submit": return { ...s, submitted: { ...s.submitted, [a.idx]: true } };
    case "clear":  return { ...s, answers: { ...s.answers, [a.idx]: undefined }, status: { ...s.status, [a.idx]: "not" } };
  }
}

/* ------------------------------------------------------------------ */
/* GATE marking helpers                                               */
/* ------------------------------------------------------------------ */

/** Practice bank lacks a `marks` field — derive: easy = 1, otherwise 2. */
function marksFor(q: Q): number {
  return q.difficulty === "easy" ? 1 : 2;
}
function negativeFor(q: Q): number {
  if (q.type !== "MCQ") return 0;
  return marksFor(q) === 1 ? 1 / 3 : 2 / 3;
}
function isAnswered(a: Answer): boolean {
  if (a === undefined || a === null || a === "") return false;
  if (Array.isArray(a) && a.length === 0) return false;
  return true;
}
function gradeAnswer(q: Q, a: Answer): boolean {
  if (!isAnswered(a)) return false;
  if (q.type === "NAT") {
    const num = typeof a === "number" ? a : parseFloat(String(a));
    if (!Number.isFinite(num)) return false;
    return Math.abs(num - q.answer) <= (q.tolerance ?? 0);
  }
  if (q.type === "MSQ") {
    const arr = Array.isArray(a) ? [...a].sort() : [];
    return arr.length === q.answer.length && arr.every((v, i) => v === q.answer[i]);
  }
  return a === q.answer;
}
function scoreFor(q: Q, a: Answer): number {
  if (!isAnswered(a)) return 0;
  return gradeAnswer(q, a) ? marksFor(q) : -negativeFor(q);
}

/* ------------------------------------------------------------------ */
/* Top-level: loader + portal                                         */
/* ------------------------------------------------------------------ */

export function PracticeRunner({ slug, name }: { slug: string; name: string }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
  const [adaptive,   setAdaptive]   = useState(false);
  const [questions, setQuestions]   = useState<Q[]>([]);
  const [loading,   setLoading]     = useState(true);
  const [meta,      setMeta]        = useState<{ plan: string; cap: number; capped: boolean; totalAvailable: number; adaptive?: boolean; weakTopics?: string[] } | null>(null);

  useEffect(() => {
    setLoading(true);
    setQuestions([]);
    const params = new URLSearchParams({ difficulty, limit: "30" });
    if (adaptive) params.set("adaptive", "1");
    fetch(`/api/practice/${slug}?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions ?? []);
        setMeta({ plan: d.plan, cap: d.cap, capped: d.capped, totalAvailable: d.totalAvailable, adaptive: d.adaptive, weakTopics: d.weakTopics });
      })
      .finally(() => setLoading(false));
  }, [slug, difficulty, adaptive]);

  if (loading) return <LoadingScreen />;
  if (questions.length === 0) return <EmptyScreen difficulty={difficulty} setDifficulty={setDifficulty} />;

  return (
    <PracticePortal
      key={`${slug}-${difficulty}-${adaptive ? "a" : "r"}-${questions.length}`}
      slug={slug}
      subjectName={name}
      questions={questions}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      adaptive={adaptive}
      setAdaptive={setAdaptive}
      meta={meta}
    />
  );
}

function LoadingScreen() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted mt-3">Loading questions…</p>
    </div>
  );
}

function EmptyScreen({ difficulty, setDifficulty }: { difficulty: Difficulty; setDifficulty: (d: Difficulty) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-20 text-center">
      <p>No questions available for difficulty: <b>{difficulty}</b></p>
      <div className="mt-4 flex gap-2 justify-center">
        {(["mixed","easy","medium","hard"] as const).map((d) => (
          <button key={d} onClick={() => setDifficulty(d)} className="btn btn-ghost text-sm capitalize">{d}</button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GATE NTA-style practice portal                                     */
/* ------------------------------------------------------------------ */

function PracticePortal({
  slug, subjectName, questions, difficulty, setDifficulty, adaptive, setAdaptive, meta,
}: {
  slug: string;
  subjectName: string;
  questions: Q[];
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  adaptive: boolean;
  setAdaptive: (v: boolean) => void;
  meta: { plan: string; cap: number; capped: boolean; totalAvailable: number; adaptive?: boolean; weakTopics?: string[] } | null;
}) {
  const [state, dispatch] = useReducer(reducer, {
    idx: 0,
    answers:   {},
    status:    Object.fromEntries(questions.map((_, i) => [i, "nv" as Status])),
    submitted: {},
  });

  // Elapsed timer (counts up — practice is untimed)
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // First-visit → mark "not"
  useEffect(() => {
    if (state.status[state.idx] === "nv") {
      dispatch({ type: "mark", idx: state.idx, status: "not" });
    }
  }, [state.idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const q         = questions[state.idx];
  const a         = state.answers[state.idx];
  const submitted = !!state.submitted[state.idx];
  const correct   = submitted ? gradeAnswer(q, a) : null;
  const delta     = submitted ? scoreFor(q, a) : 0;

  const go = useCallback((i: number) => { if (i >= 0 && i < questions.length) dispatch({ type: "go", i }); }, [questions.length]);

  const totals = useMemo(() => {
    let score = 0, correctN = 0, wrongN = 0, attempted = 0;
    for (let i = 0; i < questions.length; i++) {
      if (!state.submitted[i]) continue;
      attempted++;
      const c = gradeAnswer(questions[i], state.answers[i]);
      if (c) correctN++; else wrongN++;
      score += scoreFor(questions[i], state.answers[i]);
    }
    const totalPossible = questions.reduce((s, qq) => s + marksFor(qq), 0);
    return { score, correctN, wrongN, attempted, totalPossible };
  }, [questions, state.submitted, state.answers]);

  const counts = useMemo(() => {
    const c = { nv: 0, not: 0, ans: 0, mark: 0, marka: 0 };
    for (const s of Object.values(state.status)) c[s]++;
    return c;
  }, [state.status]);

  function submit() {
    if (!isAnswered(a) || submitted) return;
    const isC = gradeAnswer(q, a);
    dispatch({ type: "submit", idx: state.idx });
    dispatch({ type: "mark", idx: state.idx, status: "ans" });

    fetch("/api/practice/attempt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subjectSlug: slug,
        subjectName,
        qid: q.id,
        topic: q.topic,
        difficulty: q.difficulty,
        correct: isC,
      }),
    }).catch(() => {});
  }

  const markAndNext = () => {
    dispatch({
      type: "mark",
      idx: state.idx,
      status: submitted || isAnswered(a) ? "marka" : "mark",
    });
    go(state.idx + 1);
  };
  const clear = () => { if (!submitted) dispatch({ type: "clear", idx: state.idx }); };

  const [finished, setFinished] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Auto-close drawer on question change; lock scroll while open
  useEffect(() => { setPaletteOpen(false); }, [state.idx]);
  useEffect(() => {
    if (!paletteOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [paletteOpen]);

  return (
    <div className="min-h-screen bg-slate-100 -mt-px pb-20 lg:pb-0">
      {/* ---------- Top bar ---------- */}
      <header className="bg-gradient-to-r from-brand-2 to-brand text-white px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="w-9 h-9 bg-white/15 grid place-items-center rounded-lg font-bold shrink-0">CG</div>
        <div className="min-w-0">
          <div className="text-xs sm:text-sm opacity-80">GATE Practice · Untimed</div>
          <div className="font-semibold text-sm sm:text-base truncate">{subjectName}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Difficulty switcher */}
          <div className="hidden sm:flex gap-0.5 bg-white/15 rounded-md p-0.5 text-xs font-semibold">
            {(["mixed","easy","medium","hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => {
                  if (d === difficulty) return;
                  if (totals.attempted > 0 && !confirm("Start a new session? Current progress will be lost.")) return;
                  setDifficulty(d);
                }}
                className={cn(
                  "px-2.5 py-1 rounded transition capitalize",
                  difficulty === d ? "bg-white text-brand" : "text-white/80 hover:text-white"
                )}
              >{d}</button>
            ))}
          </div>
          {/* Adaptive (premium) */}
          {meta?.plan === "premium" ? (
            <button
              onClick={() => {
                if (totals.attempted > 0 && !confirm("Start a new session? Current progress will be lost.")) return;
                setAdaptive(!adaptive);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                adaptive ? "bg-amber-400 text-ink" : "bg-white/15 text-white hover:bg-white/25"
              )}
              title="Bias selection toward your weak topics"
            >💎 Adaptive {adaptive ? "ON" : "OFF"}</button>
          ) : (
            <a
              href="/pricing"
              className="rounded-md px-3 py-1.5 text-xs font-semibold bg-white/10 text-white/70 hover:bg-white/20"
              title="Unlock Adaptive practice with Premium"
            >💎 Adaptive · Upgrade</a>
          )}
          {/* Running score */}
          <div className="bg-white/15 text-white rounded-md px-3 py-1.5 text-sm font-bold tabular-nums">
            {totals.score >= 0 ? "+" : ""}{totals.score.toFixed(2)} / {totals.totalPossible}
          </div>
          {/* Elapsed timer */}
          <div className="bg-amber-400 text-ink rounded-md px-3 py-1.5 text-sm font-bold tabular-nums">
            ⏱ {secondsToHMS(elapsed)}
          </div>
        </div>
      </header>

      {/* ---------- Adaptive banner ---------- */}
      {meta?.adaptive && meta.weakTopics && meta.weakTopics.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-900 flex flex-wrap items-center gap-2">
          <span className="font-semibold">💎 Adaptive mode:</span>
          <span>focusing on your weak topics —</span>
          {meta.weakTopics.map((t) => (
            <span key={t} className="bg-white border border-amber-300 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      {/* ---------- Status band ---------- */}
      <div className="bg-slate-800 text-slate-100 px-5 py-2 text-xs flex flex-wrap gap-x-6 gap-y-1">
        <span>Topic · <b>{q.topic}</b></span>
        <span>Type · <b>{q.type}</b></span>
        <span>Difficulty · <b className="capitalize">{q.difficulty}</b></span>
        <span>
          <span className="text-emerald-300">+{marksFor(q)}</span>
          <span className="text-rose-300"> · −{negativeFor(q).toFixed(2)}</span>
        </span>
        <span className="ml-auto">Question <b>{state.idx + 1}</b> / {questions.length}</span>
      </div>

      {meta?.capped && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-5 py-2 text-xs">
          Showing {questions.length} of {meta.totalAvailable} questions ({meta.plan} plan).{" "}
          <Link href="/pricing" className="underline font-semibold">Upgrade to unlock all</Link>.
        </div>
      )}

      {/* ---------- Two-column body ---------- */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 px-4 sm:px-5 py-4 sm:py-5">
        {/* Question column */}
        <section className="bg-white rounded-xl border border-line p-6">
          <div className="flex items-center justify-between text-sm mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge bg-brand/10 text-brand">{q.subject}</span>
              <span className="badge bg-slate-100 text-ink/80">{q.type}</span>
              <span className="badge bg-slate-100 text-ink/80 font-bold">
                {marksFor(q)} mark{marksFor(q) > 1 ? "s" : ""}
              </span>
            </div>
            {q.type === "MSQ" && (
              <span className="text-[11px] text-muted">select all that apply</span>
            )}
          </div>

          <div className="text-base leading-relaxed">{q.stem}</div>

          <div className="mt-5">
            {q.type === "NAT" ? (
              <NatInput
                value={a as number | string | undefined}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
                tolerance={q.tolerance}
                disabled={submitted}
              />
            ) : q.type === "MSQ" ? (
              <Options
                options={q.options}
                multi
                selected={(a as number[]) ?? []}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
                correct={submitted ? q.answer : undefined}
                disabled={submitted}
              />
            ) : (
              <Options
                options={q.options}
                multi={false}
                selected={a as number | undefined}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v as number })}
                correct={submitted ? [q.answer] : undefined}
                disabled={submitted}
              />
            )}
          </div>

          {/* Verdict — only after submit */}
          {submitted && (
            <div className={cn(
              "mt-5 rounded-lg p-4 text-sm",
              correct ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"
            )}>
              <p className="font-bold flex items-center gap-2 flex-wrap">
                <span>{correct ? "✓ Correct!" : "✗ Incorrect"}</span>
                <span className="px-2 py-0.5 rounded bg-white/60 text-xs tabular-nums">
                  {delta >= 0 ? "+" : ""}{delta.toFixed(2)} mark{Math.abs(delta) === 1 ? "" : "s"}
                </span>
                {!correct && q.type === "NAT" && (
                  <span className="font-normal">— answer is {q.answer}</span>
                )}
              </p>
              <p className="mt-2 leading-relaxed">{q.solution}</p>
            </div>
          )}

          {/* Action row */}
          <div className="mt-7 flex flex-wrap gap-2">
            {!submitted ? (
              <>
                <button
                  onClick={submit}
                  disabled={!isAnswered(a)}
                  className="btn btn-primary text-sm"
                >Submit answer</button>
                <button
                  onClick={markAndNext}
                  className="btn bg-amber-500 text-white hover:bg-amber-600 text-sm"
                >Mark &amp; Next</button>
                <button
                  onClick={clear}
                  disabled={!isAnswered(a)}
                  className="btn btn-ghost text-sm"
                >Clear</button>
              </>
            ) : (
              <button
                onClick={() => go(state.idx + 1)}
                disabled={state.idx === questions.length - 1}
                className="btn btn-primary text-sm"
              >Save &amp; Next</button>
            )}
            <span className="flex-1" />
            <button onClick={() => go(state.idx - 1)} disabled={state.idx === 0} className="btn btn-ghost text-sm">‹ Prev</button>
            <button onClick={() => go(state.idx + 1)} disabled={state.idx === questions.length - 1} className="btn btn-ghost text-sm">Next ›</button>
          </div>
        </section>

        {/* Palette — desktop sticky sidebar */}
        <aside className="hidden lg:block bg-white rounded-xl border border-line p-5 lg:sticky lg:top-20 h-fit">
          <Legend counts={counts} />
          <div className="mt-4 font-semibold text-sm text-muted">Choose a question</div>
          <div className="mt-2 grid grid-cols-5 sm:grid-cols-6 gap-1.5">
            {questions.map((_, i) => {
              const s = state.status[i] ?? "nv";
              return (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className={cn(
                    "h-10 sm:h-9 text-xs font-semibold rounded transition",
                    s === "nv"    && "bg-slate-200 text-slate-700",
                    s === "not"   && "bg-rose-200 text-rose-900",
                    s === "ans"   && "bg-emerald-500 text-white",
                    s === "mark"  && "bg-violet-500 text-white",
                    s === "marka" && "bg-violet-700 text-white ring-2 ring-emerald-400",
                    i === state.idx && "ring-2 ring-brand"
                  )}
                  title={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setFinished(true)}
            className="btn btn-accent w-full mt-5 text-sm"
          >
            Finish session
          </button>
        </aside>
      </div>

      {/* ---------- Mobile bottom action bar ---------- */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line px-3 py-2 grid grid-cols-2 gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setPaletteOpen(true)}
          className="btn btn-ghost border border-line h-12 justify-center font-semibold"
        >
          🗂 Palette ({state.idx + 1}/{questions.length})
        </button>
        <button
          onClick={() => setFinished(true)}
          className="btn btn-accent h-12 justify-center font-semibold"
        >
          Finish
        </button>
      </div>

      {/* ---------- Mobile palette drawer ---------- */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition",
          paletteOpen ? "visible" : "invisible pointer-events-none",
        )}
        aria-hidden={!paletteOpen}
      >
        <div
          onClick={() => setPaletteOpen(false)}
          className={cn("absolute inset-0 bg-ink/40 transition-opacity", paletteOpen ? "opacity-100" : "opacity-0")}
        />
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-[88%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-200",
            paletteOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="h-14 flex items-center justify-between px-5 border-b border-line">
            <span className="font-bold">Question palette</span>
            <button
              type="button"
              aria-label="Close palette"
              onClick={() => setPaletteOpen(false)}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-slate-100"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12" /><path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <Legend counts={counts} />
            <div className="mt-4 font-semibold text-sm text-muted">Choose a question</div>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => {
                const s = state.status[i] ?? "nv";
                return (
                  <button
                    key={i}
                    onClick={() => { go(i); setPaletteOpen(false); }}
                    className={cn(
                      "h-10 text-xs font-semibold rounded transition",
                      s === "nv"    && "bg-slate-200 text-slate-700",
                      s === "not"   && "bg-rose-200 text-rose-900",
                      s === "ans"   && "bg-emerald-500 text-white",
                      s === "mark"  && "bg-violet-500 text-white",
                      s === "marka" && "bg-violet-700 text-white ring-2 ring-emerald-400",
                      i === state.idx && "ring-2 ring-brand"
                    )}
                    title={`Question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {finished && (
        <FinishModal
          totals={totals}
          elapsed={elapsed}
          onClose={() => setFinished(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Legend({ counts }: { counts: Record<string, number> }) {
  const items: [string, string, number][] = [
    ["bg-slate-200",   "Not visited",       counts.nv],
    ["bg-rose-200",    "Not answered",      counts.not],
    ["bg-emerald-500", "Answered",          counts.ans],
    ["bg-violet-500",  "Marked",            counts.mark],
    ["bg-violet-700",  "Marked & answered", counts.marka],
  ];
  return (
    <ul className="text-xs space-y-1.5">
      {items.map(([bg, label, n]) => (
        <li key={label} className="flex items-center gap-2">
          <span className={cn("inline-block w-4 h-4 rounded", bg)} />
          <span className="flex-1">{label}</span>
          <span className="font-semibold">{n ?? 0}</span>
        </li>
      ))}
    </ul>
  );
}

function Options({
  options, selected, multi, onChange, correct, disabled,
}: {
  options: string[];
  selected: number | number[] | undefined;
  multi: boolean;
  onChange: (v: number | number[]) => void;
  correct?: number[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const isSel = multi
          ? Array.isArray(selected) && selected.includes(i)
          : selected === i;
        const isRight     = correct?.includes(i);
        const isWrongPick = correct && isSel && !isRight;
        return (
          <label
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 transition",
              disabled ? "cursor-default" : "cursor-pointer hover:bg-slate-50",
              !correct && isSel && "border-brand bg-brand/5",
              correct && isRight && "border-ok bg-emerald-50",
              correct && isWrongPick && "border-bad bg-rose-50",
              !correct && !isSel && "border-line",
            )}
          >
            <input
              type={multi ? "checkbox" : "radio"}
              checked={!!isSel}
              disabled={disabled}
              onChange={() => {
                if (!multi) return onChange(i);
                const cur = Array.isArray(selected) ? [...selected] : [];
                const ix = cur.indexOf(i);
                if (ix >= 0) cur.splice(ix, 1); else cur.push(i);
                onChange(cur);
              }}
              className="mt-0.5"
            />
            <span className="font-bold w-5">{String.fromCharCode(65 + i)}.</span>
            <span className="flex-1 text-sm">{opt}</span>
            {correct && isRight     && <span className="text-ok font-bold text-sm">✓</span>}
            {correct && isWrongPick && <span className="text-bad font-bold text-sm">✗</span>}
          </label>
        );
      })}
    </div>
  );
}

function NatInput({
  value, onChange, tolerance, disabled,
}: {
  value: number | string | undefined;
  onChange: (v: number | string | undefined) => void;
  tolerance: number;
  disabled?: boolean;
}) {
  return (
    <div className="max-w-sm">
      <label className="text-sm font-semibold">Your answer (numerical)</label>
      <input
        type="number"
        step="any"
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
        className="input mt-1.5 font-mono"
        placeholder="e.g. 12.5"
      />
      <p className="text-xs text-muted mt-1">Accepted tolerance: ±{tolerance}</p>
    </div>
  );
}

function FinishModal({
  totals, elapsed, onClose,
}: {
  totals: { score: number; correctN: number; wrongN: number; attempted: number; totalPossible: number };
  elapsed: number;
  onClose: () => void;
}) {
  const pct = totals.totalPossible > 0 ? (totals.score / totals.totalPossible) * 100 : 0;
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-extrabold">Session summary</h2>
        <p className="text-sm text-muted mt-1">Per-question attempts are already saved to your profile.</p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Score" value={`${totals.score >= 0 ? "+" : ""}${totals.score.toFixed(2)} / ${totals.totalPossible}`} />
          <Stat label="Percentage" value={`${pct.toFixed(1)}%`} />
          <Stat label="Attempted" value={`${totals.attempted}`} />
          <Stat label="Time" value={secondsToHMS(elapsed)} />
          <Stat label="Correct" value={`${totals.correctN}`} tone="ok" />
          <Stat label="Wrong"   value={`${totals.wrongN}`}   tone="bad" />
        </div>

        <div className="mt-6 flex gap-2 justify-end flex-wrap">
          <button onClick={onClose} className="btn btn-ghost text-sm">Keep practising</button>
          <Link href="/practice" className="btn btn-primary text-sm">Back to subjects</Link>
          <Link href="/dashboard" className="btn btn-accent text-sm">View dashboard</Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={cn(
        "font-bold tabular-nums mt-0.5",
        tone === "ok"  && "text-ok",
        tone === "bad" && "text-bad",
      )}>{value}</div>
    </div>
  );
}
