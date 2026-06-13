"use client";

/**
 * LearnEngine — the interactive Topic-Wise Learn & Solve UI.
 *
 * Layout state machine (per the authoring spec):
 *   • Part 1 (module) is always expanded at the top.
 *   • Part 2 (the 3-tier question suite) is an active form: MCQ radios, MSQ
 *     checkboxes, NAT numeric input.
 *   • A single "Submit Answers & View Explanations" button at the base grades
 *     every question at once. Nothing is revealed line-by-line.
 *   • On submit the layout transitions: each question's Part 3 solution is
 *     appended underneath it, correct selections highlight green, wrong/skipped
 *     red, and NAT answers show the entered value against the accepted range.
 */

import { useMemo, useState } from "react";
import { MathText } from "@/components/math-text";
import { QuestionFigure } from "@/components/question-figure";
import type { LearnQuestion, LearnTopic } from "@/data/learn";
import { cn } from "@/lib/utils";

type Selection = number | number[] | string | null;

function isCorrect(q: LearnQuestion, sel: Selection): boolean {
  if (sel == null) return false;
  if (q.type === "MCQ") return sel === q.answer;
  if (q.type === "MSQ") {
    if (!Array.isArray(sel) || !Array.isArray(q.answer)) return false;
    const a = [...sel].sort((x, y) => x - y);
    const b = [...(q.answer as number[])].sort((x, y) => x - y);
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  // NAT
  const v = typeof sel === "string" ? parseFloat(sel) : NaN;
  if (Number.isNaN(v)) return false;
  const [lo, hi] = q.acceptedRange ?? [q.natAnswer ?? 0, q.natAnswer ?? 0];
  return v >= lo && v <= hi;
}

const DIFF_BADGE: Record<LearnQuestion["difficulty"], { label: string; cls: string }> = {
  basic: { label: "BASIC", cls: "bg-emerald-100 text-emerald-800" },
  medium: { label: "MEDIUM", cls: "bg-amber-100 text-amber-800" },
  hard: { label: "HARD", cls: "bg-rose-100 text-rose-800" },
};

export function LearnEngine({ topic }: { topic: LearnTopic }) {
  const [answers, setAnswers] = useState<Record<string, Selection>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return null;
    let got = 0;
    let max = 0;
    for (const q of topic.questions) {
      max += q.marks;
      if (isCorrect(q, answers[q.id] ?? null)) got += q.marks;
    }
    return { got, max };
  }, [submitted, answers, topic.questions]);

  function setMcq(qid: string, idx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: idx }));
  }
  function toggleMsq(qid: string, idx: number) {
    if (submitted) return;
    setAnswers((a) => {
      const cur = Array.isArray(a[qid]) ? (a[qid] as number[]) : [];
      const next = cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx];
      return { ...a, [qid]: next };
    });
  }
  function setNat(qid: string, val: string) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: val }));
  }

  return (
    <div className="space-y-8">
      {/* ─────────── PART 1 · TOPIC BREAKDOWN & TRAPS ─────────── */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge badge-pro text-xs">PART 1</span>
          <h2 className="font-bold text-lg">Topic Breakdown &amp; Traps</h2>
        </div>

        <h3 className="font-semibold text-brand mb-1">The Engineering Principle</h3>
        <MathText className="text-sm leading-relaxed text-ink/90">{topic.module.principle}</MathText>

        <h3 className="font-semibold text-brand mt-5 mb-1">The Core Formula Matrix</h3>
        <MathText className="text-sm leading-relaxed cg-solution">{topic.module.formulaMatrix}</MathText>

        {topic.module.figure && <QuestionFigure figure={topic.module.figure} />}

        <h3 className="font-semibold text-brand mt-5 mb-2">The &lsquo;IIT Traps&rsquo;</h3>
        <ul className="space-y-2">
          {topic.module.traps.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-bad shrink-0">⚠</span>
              <MathText className="flex-1">{t}</MathText>
            </li>
          ))}
        </ul>
      </section>

      {/* ─────────── PART 2 + PART 3 · QUESTION SUITE ─────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="badge badge-pro text-xs">PART 2</span>
          <h2 className="font-bold text-lg">Progressive 3-Tier Question Suite</h2>
        </div>

        <div className="space-y-5">
          {topic.questions.map((q, qi) => {
            const sel = answers[q.id] ?? null;
            const correct = submitted ? isCorrect(q, sel) : null;
            const badge = DIFF_BADGE[q.difficulty];

            return (
              <div
                key={q.id}
                className={cn(
                  "card p-6",
                  submitted && (correct ? "ring-2 ring-emerald-400" : "ring-2 ring-rose-400"),
                )}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-bold text-muted">Q{qi + 1}</span>
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded", badge.cls)}>{badge.label}</span>
                  <span className="text-xs text-muted">
                    {q.marks} Mark{q.marks > 1 ? "s" : ""} · {q.type}
                  </span>
                  {submitted && (
                    <span
                      className={cn(
                        "ml-auto text-xs font-bold px-2 py-0.5 rounded",
                        correct ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800",
                      )}
                    >
                      {correct ? `+${q.marks} ✓` : sel == null ? "Skipped" : "Incorrect ✗"}
                    </span>
                  )}
                </div>

                <MathText className="text-base leading-relaxed">{q.stem}</MathText>

                {q.figure && <QuestionFigure figure={q.figure} />}

                {/* ---- Inputs ---- */}
                {(q.type === "MCQ" || q.type === "MSQ") && q.options && (
                  <div className="mt-4 space-y-2">
                    {q.options.map((opt, oi) => {
                      const chosen = q.type === "MCQ" ? sel === oi : Array.isArray(sel) && sel.includes(oi);
                      const isAnswer =
                        q.type === "MCQ"
                          ? q.answer === oi
                          : Array.isArray(q.answer) && q.answer.includes(oi);
                      const state = !submitted
                        ? chosen
                          ? "chosen"
                          : "idle"
                        : isAnswer
                          ? "correct"
                          : chosen
                            ? "wrong"
                            : "idle";
                      return (
                        <button
                          key={oi}
                          type="button"
                          disabled={submitted}
                          onClick={() => (q.type === "MCQ" ? setMcq(q.id, oi) : toggleMsq(q.id, oi))}
                          className={cn(
                            "w-full flex items-center gap-3 text-left rounded-lg border px-4 py-2.5 transition",
                            state === "idle" && "border-line hover:border-brand/50",
                            state === "chosen" && "border-brand bg-brand/5",
                            state === "correct" && "border-emerald-400 bg-emerald-50",
                            state === "wrong" && "border-rose-400 bg-rose-50",
                            submitted && "cursor-default",
                          )}
                        >
                          <span
                            className={cn(
                              "shrink-0 w-6 h-6 grid place-items-center rounded text-xs font-bold border",
                              q.type === "MSQ" ? "rounded" : "rounded-full",
                              state === "correct" && "border-emerald-500 bg-emerald-500 text-white",
                              state === "wrong" && "border-rose-500 bg-rose-500 text-white",
                              state === "chosen" && "border-brand bg-brand text-white",
                              state === "idle" && "border-line text-muted",
                            )}
                          >
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <MathText className="flex-1 text-sm">{opt}</MathText>
                          {submitted && state === "correct" && <span className="text-emerald-600 text-sm">✓</span>}
                          {submitted && state === "wrong" && <span className="text-rose-600 text-sm">✗</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === "NAT" && (
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      disabled={submitted}
                      value={typeof sel === "string" ? sel : ""}
                      onChange={(e) => setNat(q.id, e.target.value)}
                      placeholder="Enter value"
                      className={cn(
                        "w-40 rounded-lg border px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/40",
                        submitted ? (correct ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50") : "border-line",
                      )}
                    />
                    {q.unit && <span className="text-sm text-muted">{q.unit}</span>}
                  </div>
                )}

                {/* ---- PART 3 · revealed solution ---- */}
                {submitted && (
                  <div className="mt-5 pt-5 border-t border-line">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge text-xs">PART 3</span>
                      <h4 className="font-semibold text-sm">Detailed Solution</h4>
                    </div>
                    {q.type === "NAT" && (
                      <p className="text-xs text-muted mb-3">
                        Your answer:{" "}
                        <b className={cn(correct ? "text-ok" : "text-bad")}>
                          {typeof sel === "string" && sel !== "" ? sel : "—"}
                        </b>{" "}
                        · Target: <b className="text-ink">{q.natAnswer}</b>
                        {q.acceptedRange && (
                          <>
                            {" "}
                            · Accepted: <b className="text-ink">{q.acceptedRange[0]} to {q.acceptedRange[1]}</b>
                          </>
                        )}
                        {q.unit ? ` ${q.unit}` : ""}
                      </p>
                    )}
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Given Parameters</div>
                        <MathText className="leading-relaxed">{q.solution.given}</MathText>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Derivation</div>
                        <MathText className="leading-relaxed cg-solution">{q.solution.derivation}</MathText>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Target &amp; Range</div>
                        <MathText className="leading-relaxed">{q.solution.target}</MathText>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ---- Submit / reset bar ---- */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          {!submitted ? (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="btn btn-primary w-full sm:w-auto"
            >
              Submit Answers &amp; View Explanations
            </button>
          ) : (
            <>
              <div className="text-lg font-extrabold">
                Score: <span className="text-accent">{score?.got}</span>
                <span className="text-muted text-base"> / {score?.max} marks</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                }}
                className="btn btn-ghost w-full sm:w-auto sm:ml-auto"
              >
                Reset &amp; try again
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
