"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import type { MistakeItem } from "@/app/api/mistakes/route";
import { toHtml } from "@/components/math-text";

const LS_KEY = "cg.mistakes.understood";

/**
 * Self-contained drill UI for the Mistakes Vault.
 *
 * Loads `/api/mistakes`, presents one question at a time, lets the user
 * re-attempt and immediately see correctness + the original solution. A
 * single "Got it" button marks the item as understood (same localStorage
 * key as the vault list).
 */
export function MistakesDrill() {
  const params = useSearchParams();
  const subject = params.get("subject");

  const [items, setItems] = useState<MistakeItem[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | number[] | string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [understood, setUnderstood] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUnderstood(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  useEffect(() => {
    const qs = subject ? `?subject=${encodeURIComponent(subject)}` : "";
    fetch(`/api/mistakes${qs}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: { items: MistakeItem[] }) => setItems(d.items))
      .catch(() => setItems([]));
  }, [subject]);

  const queue = useMemo(() => (items ?? []).filter((m) => !understood.has(m.key)), [items, understood]);
  const current = queue[idx];

  // Reset picker state when moving to a new question
  useEffect(() => {
    setPicked(null);
    setSubmitted(false);
  }, [idx, current?.key]);

  function markUnderstood(key: string) {
    setUnderstood((prev) => {
      const next = new Set(prev);
      next.add(key);
      try { localStorage.setItem(LS_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  function isCorrect(q: MistakeItem, a: number | number[] | string | null): boolean {
    if (a === null) return false;
    if (q.type === "NAT") {
      const v = typeof a === "string" ? parseFloat(a) : Number(a);
      if (!Number.isFinite(v)) return false;
      return Math.abs(v - Number(q.correct)) < 0.001;
    }
    if (q.type === "MSQ") {
      const exp = Array.isArray(q.correct) ? [...q.correct].sort() : [];
      const got = Array.isArray(a) ? [...a].sort() : [];
      return exp.length === got.length && exp.every((v, i) => v === got[i]);
    }
    return a === q.correct;
  }

  if (items === null) {
    return <Centered><div className="inline-block w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></Centered>;
  }

  if (queue.length === 0) {
    return (
      <Centered>
        <CheckCircle2 size={36} className="mx-auto text-ok" aria-hidden />
        <h1 className="text-2xl font-extrabold mt-4 text-ink">Vault is clear!</h1>
        <p className="text-sm text-muted mt-2 max-w-md mx-auto">
          You&apos;ve worked through every pending mistake{subject ? ` in ${subject}` : ""}. Take a mock to surface more.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link href="/dashboard?tab=mistakes" className="btn btn-ghost btn-sm">Back to vault</Link>
          <Link href="/mocks" className="btn btn-primary btn-sm">Start a mock</Link>
        </div>
      </Centered>
    );
  }

  if (!current) {
    return (
      <Centered>
        <CheckCircle2 size={36} className="mx-auto text-ok" aria-hidden />
        <h1 className="text-2xl font-extrabold mt-4 text-ink">Drill complete</h1>
        <p className="text-sm text-muted mt-2">You finished {queue.length} mistakes. Nice work.</p>
        <Link href="/dashboard?tab=mistakes" className="btn btn-primary btn-sm mt-6 inline-flex">Back to vault</Link>
      </Centered>
    );
  }

  const correct = submitted ? isCorrect(current, picked) : null;

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard?tab=mistakes" className="text-sm text-muted hover:text-ink">← Vault</Link>
        <div className="text-sm text-muted tabular-nums">
          Question {idx + 1} of {queue.length}{subject && <> · <span className="text-ink">{subject}</span></>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-canvas rounded-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all"
          style={{ width: `${((idx) / queue.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="card p-6 sm:p-8">
        <div className="text-[11px] uppercase tracking-wider font-bold text-muted">
          {current.subject}{current.topic && <> · {current.topic}</>} · {current.type} · {current.marks} mark{current.marks === 1 ? "" : "s"}
        </div>
        <div
          className="text-lg font-semibold text-ink mt-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: toHtml(current.stem) }}
        />

        {/* Options */}
        {current.options && (current.type === "MCQ" || current.type === "MSQ") && (
          <ol className="mt-5 space-y-2">
            {current.options.map((opt, i) => {
              const isCorr = Array.isArray(current.correct) ? current.correct.includes(i) : current.correct === i;
              const isPicked = current.type === "MSQ"
                ? Array.isArray(picked) && picked.includes(i)
                : picked === i;

              let tone = "border-line hover:border-brand";
              if (submitted) {
                if (isCorr) tone = "border-ok bg-ok/10 text-ink";
                else if (isPicked) tone = "border-bad bg-bad/10 text-ink";
                else tone = "border-line opacity-60";
              } else if (isPicked) {
                tone = "border-brand bg-brand/5 text-ink";
              }

              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={submitted}
                    onClick={() => {
                      if (current.type === "MSQ") {
                        const arr = Array.isArray(picked) ? [...picked] : [];
                        const ix = arr.indexOf(i);
                        if (ix === -1) arr.push(i); else arr.splice(ix, 1);
                        setPicked(arr);
                      } else {
                        setPicked(i);
                      }
                    }}
                    className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors flex items-start gap-3 ${tone}`}
                  >
                    <span className="font-bold tabular-nums">{String.fromCharCode(65 + i)}.</span>
                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: toHtml(opt) }} />
                    {submitted && isCorr && <CheckCircle2 size={16} className="text-ok shrink-0" aria-hidden />}
                    {submitted && !isCorr && isPicked && <XCircle size={16} className="text-bad shrink-0" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {/* NAT input */}
        {current.type === "NAT" && (
          <div className="mt-5">
            <input
              type="number"
              step="any"
              disabled={submitted}
              value={typeof picked === "string" || typeof picked === "number" ? picked : ""}
              onChange={(e) => setPicked(e.target.value)}
              placeholder="Enter your numeric answer"
              className="input text-lg font-semibold tabular-nums"
            />
            {submitted && (
              <div className={`mt-3 text-sm font-bold ${correct ? "text-ok" : "text-bad"}`}>
                Correct answer: <span className="tabular-nums">{String(current.correct)}</span>
              </div>
            )}
          </div>
        )}

        {/* Submit / Next bar */}
        <div className="mt-6 pt-5 border-t border-line flex items-center justify-between gap-3 flex-wrap">
          {!submitted ? (
            <>
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                disabled={picked === null || picked === ""}
                className="btn btn-primary btn-sm"
              >
                Check answer
              </button>
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="text-sm text-muted hover:text-ink"
              >
                Skip & see solution
              </button>
            </>
          ) : (
            <>
              <div className={`text-sm font-bold flex items-center gap-2 ${correct ? "text-ok" : "text-bad"}`}>
                {correct ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
                {correct ? "Correct this time" : "Still wrong — review solution"}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    markUnderstood(current.key);
                    setIdx((i) => i + 1);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <CheckCircle2 size={14} aria-hidden /> Got it
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((i) => i + 1)}
                  className="btn btn-primary btn-sm"
                >
                  Next <ArrowRight size={14} aria-hidden />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Solution */}
        {submitted && current.solution && (
          <div className="mt-5 rounded-lg bg-canvas/40 border border-line p-4 text-sm leading-relaxed">
            <div className="text-[10px] uppercase tracking-wider font-bold text-muted mb-1">Solution</div>
            <div dangerouslySetInnerHTML={{ __html: toHtml(current.solution) }} />
          </div>
        )}
      </div>

      {/* Bottom retry */}
      {submitted && !correct && (
        <button
          type="button"
          onClick={() => {
            setPicked(null);
            setSubmitted(false);
          }}
          className="mx-auto flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink"
        >
          <RotateCcw size={12} aria-hidden /> Try this one again
        </button>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl mx-auto px-5 py-20 text-center">{children}</div>;
}
