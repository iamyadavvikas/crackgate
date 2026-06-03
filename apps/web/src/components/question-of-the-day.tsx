"use client";

import { useState } from "react";
import Link from "next/link";

type Q =
  | { id: string; type: "MCQ"; subject: string; stem: string; options: string[]; answer: number; solution: string }
  | { id: string; type: "MSQ"; subject: string; stem: string; options: string[]; answer: number[]; solution: string }
  | { id: string; type: "NAT"; subject: string; stem: string; answer: number; tolerance: number; solution: string };

export function QuestionOfTheDayCard({ q, dateLabel }: { q: Q; dateLabel: string }) {
  const [pick, setPick] = useState<Set<number>>(new Set());
  const [nat, setNat] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggle(i: number) {
    if (submitted) return;
    if (q.type === "MCQ") setPick(new Set([i]));
    else if (q.type === "MSQ") {
      const next = new Set(pick);
      next.has(i) ? next.delete(i) : next.add(i);
      setPick(next);
    }
  }

  let isCorrect = false;
  if (submitted) {
    if (q.type === "MCQ") isCorrect = pick.has(q.answer);
    else if (q.type === "MSQ") {
      const want = new Set(q.answer);
      isCorrect = want.size === pick.size && [...want].every((x) => pick.has(x));
    } else {
      const v = Number(nat);
      isCorrect = Number.isFinite(v) && Math.abs(v - q.answer) <= q.tolerance;
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-5 py-12">
      <div className="card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-[140px] opacity-5 select-none" aria-hidden>💡</div>
        <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-brand">💡 Question of the Day</div>
            <p className="text-xs text-muted mt-0.5">{dateLabel} · {q.subject} · {q.type}</p>
          </div>
          <Link href="/practice" className="text-xs font-semibold text-brand hover:underline">
            See full practice bank →
          </Link>
        </div>

        <p
          className="mt-5 text-base sm:text-lg font-medium leading-relaxed relative z-10"
          dangerouslySetInnerHTML={{ __html: q.stem }}
        />

        {q.type !== "NAT" ? (
          <div className="mt-5 grid sm:grid-cols-2 gap-2 relative z-10">
            {q.options.map((opt, i) => {
              const chosen = pick.has(i);
              const correctIdx = q.type === "MCQ" ? [q.answer] : (q as { answer: number[] }).answer;
              const isAns = correctIdx.includes(i);
              const cls = submitted
                ? isAns
                  ? "border-ok bg-ok/10 text-ink"
                  : chosen
                    ? "border-bad bg-bad/10 text-ink"
                    : "border-line text-muted"
                : chosen
                  ? "border-brand bg-brand/5 text-ink font-semibold"
                  : "border-line hover:border-brand hover:bg-slate-50";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  disabled={submitted}
                  className={`text-left rounded-lg border-2 px-4 py-3 text-sm transition ${cls}`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                  <span dangerouslySetInnerHTML={{ __html: opt }} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 relative z-10">
            <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">Your answer (numerical)</label>
            <input
              type="number"
              step="any"
              value={nat}
              onChange={(e) => setNat(e.target.value)}
              disabled={submitted}
              className="w-full sm:w-64 px-3 py-2.5 border-2 border-line rounded-lg text-sm focus:border-brand outline-none disabled:opacity-60"
              placeholder="e.g. 6.25"
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 items-center relative z-10">
          {!submitted ? (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={q.type === "NAT" ? !nat.trim() : pick.size === 0}
              className="btn btn-primary disabled:opacity-50"
            >
              Submit answer
            </button>
          ) : (
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${
                isCorrect ? "bg-ok/10 text-ok" : "bg-bad/10 text-bad"
              }`}
            >
              {isCorrect ? "🎉 Correct!" : "❌ Not quite"}
            </span>
          )}
          <Link href="/login?next=/practice" className="text-sm text-muted hover:text-brand hover:underline">
            Track your streak → sign in
          </Link>
        </div>

        {submitted && (
          <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-line relative z-10">
            <div className="text-xs uppercase tracking-wide text-muted font-semibold">Solution</div>
            <p className="text-sm mt-1.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.solution }} />
          </div>
        )}
      </div>
    </section>
  );
}
