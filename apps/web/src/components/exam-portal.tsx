"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { secondsToHMS, cn } from "@/lib/utils";

type Question =
  | { type: "MCQ"; marks: number; subject: string; stem: string; options: string[]; answer: number; solution?: string }
  | { type: "MSQ"; marks: number; subject: string; stem: string; options: string[]; answer: number[]; solution?: string }
  | { type: "NAT"; marks: number; subject: string; stem: string; answer: number; tolerance?: number; solution?: string };

type Status = "nv" | "not" | "ans" | "mark" | "marka";
type Answer = number | number[] | string | undefined;

interface State {
  idx: number;
  answers: Record<number, Answer>;
  status: Record<number, Status>;
  showSoln: boolean;
}

type Action =
  | { type: "go"; i: number }
  | { type: "set"; idx: number; answer: Answer }
  | { type: "mark"; idx: number; status: Status }
  | { type: "clear"; idx: number }
  | { type: "soln"; show: boolean };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "go":    return { ...s, idx: a.i, showSoln: false };
    case "set":   return { ...s, answers: { ...s.answers, [a.idx]: a.answer } };
    case "mark":  return { ...s, status: { ...s.status, [a.idx]: a.status } };
    case "clear": return { ...s, answers: { ...s.answers, [a.idx]: undefined }, status: { ...s.status, [a.idx]: "not" } };
    case "soln":  return { ...s, showSoln: a.show };
  }
}

function isAnswered(a: Answer) {
  if (a === undefined || a === null || a === "") return false;
  if (Array.isArray(a) && a.length === 0) return false;
  return true;
}

export function ExamPortal({
  kind, refId, title, questions, durationSec,
}: {
  kind: "mock" | "pyq";
  refId: string;
  title: string;
  questions: Question[];
  durationSec: number;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    idx: 0,
    answers: {},
    status: Object.fromEntries(questions.map((_, i) => [i, "nv" as Status])),
    showSoln: false,
  });
  const [secondsLeft, setSecondsLeft] = useState(durationSec);
  const [submitting, setSubmitting] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const startTime = useRef(Date.now());

  // Auto-close mobile palette whenever the question changes
  useEffect(() => { setPaletteOpen(false); }, [state.idx]);

  // Lock body scroll while drawer open
  useEffect(() => {
    if (!paletteOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [paletteOpen]);

  // Mark first-visit as 'not' on entry
  useEffect(() => {
    if (state.status[state.idx] === "nv") {
      dispatch({ type: "mark", idx: state.idx, status: "not" });
    }
  }, [state.idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick timer
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); void submit(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn on close
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const q = questions[state.idx];
  const counts = useMemo(() => {
    const c = { nv: 0, not: 0, ans: 0, mark: 0, marka: 0 };
    for (const s of Object.values(state.status)) c[s]++;
    return c;
  }, [state.status]);

  function setStatus(idx: number) {
    return isAnswered(state.answers[idx]) ? "ans" : "not";
  }

  const saveAndNext  = () => { dispatch({ type: "mark", idx: state.idx, status: setStatus(state.idx) }); go(state.idx + 1); };
  const markAndNext  = () => { dispatch({ type: "mark", idx: state.idx, status: isAnswered(state.answers[state.idx]) ? "marka" : "mark" }); go(state.idx + 1); };
  const clear        = () => dispatch({ type: "clear", idx: state.idx });
  const go = useCallback((i: number) => { if (i >= 0 && i < questions.length) dispatch({ type: "go", i }); }, [questions.length]);

  async function submit(auto = false) {
    if (!auto && !confirm("Submit this paper?")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind, refId,
          answers: state.answers,
          durationSec: Math.round((Date.now() - startTime.current) / 1000),
        }),
      });
      if (res.status === 401) return router.push(`/login?next=/${kind === "pyq" ? "pyq" : "mocks"}`);
      if (res.status === 402) { alert("Upgrade required to attempt this paper."); return router.push("/pricing"); }
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data?.error));
      router.push(`/result/${data.attempt.id}`);
    } catch (e) {
      alert((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 -mt-px pb-20 lg:pb-0">
      {/* ---------- Top bar ---------- */}
      <header className="bg-gradient-to-r from-brand-2 to-brand text-white px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="w-9 h-9 bg-white/15 grid place-items-center rounded-lg font-bold shrink-0">CG</div>
        <div className="min-w-0 flex-1">
          <div className="text-xs sm:text-sm opacity-80">GATE — Graduate Aptitude Test in Engineering</div>
          <div className="font-semibold text-sm sm:text-base truncate">{title}</div>
        </div>
        <div className="ml-auto bg-amber-400 text-ink rounded-md px-3 py-1.5 text-sm font-bold tabular-nums shrink-0">
          ⏱ {secondsToHMS(secondsLeft)}
        </div>
      </header>

      {/* ---------- Status band ---------- */}
      <div className="bg-slate-800 text-slate-100 px-4 sm:px-5 py-2 text-xs flex flex-wrap gap-x-4 gap-y-1 sm:gap-6">
        <span>Section · <b>{q.subject}</b></span>
        <span>Type · <b>{q.type}</b></span>
        <span className="hidden sm:inline">+{q.marks} <span className="text-bad">· −{q.type === "MCQ" ? (q.marks / 3).toFixed(2) : 0}</span></span>
        <span className="ml-auto">Q <b>{state.idx + 1}</b> / {questions.length}</span>
      </div>

      {/* ---------- Two-column body ---------- */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 px-4 sm:px-5 py-4 sm:py-5">

        {/* Question column */}
        <section className="bg-white rounded-xl border border-line p-4 sm:p-6">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="badge bg-brand/10 text-brand">{q.subject}</span>
            <span className="badge">{q.type}</span>
          </div>
          <div className="prose max-w-none text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: q.stem }} />

          <div className="mt-5">
            {q.type === "NAT" ? (
              <NatInput
                value={state.answers[state.idx] as number | string | undefined}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
                tolerance={q.tolerance ?? 0}
              />
            ) : q.type === "MSQ" ? (
              <Options
                options={q.options}
                multi
                selected={(state.answers[state.idx] as number[]) ?? []}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
              />
            ) : (
              <Options
                options={q.options}
                multi={false}
                selected={state.answers[state.idx] as number | undefined}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
              />
            )}
          </div>

          {/* actions */}
          <div className="mt-7 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <button onClick={saveAndNext}  className="btn btn-primary text-sm col-span-2 sm:col-span-1">Save &amp; Next</button>
            <button onClick={markAndNext} className="btn bg-amber-500 text-white hover:bg-amber-600 text-sm">Mark &amp; Next</button>
            <button onClick={clear}       className="btn btn-ghost text-sm">Clear</button>
            <span className="hidden sm:block sm:flex-1" />
            <button onClick={() => go(state.idx - 1)} className="btn btn-ghost text-sm">‹ Prev</button>
            <button onClick={() => go(state.idx + 1)} className="btn btn-ghost text-sm">Next ›</button>
          </div>

          {/* solution (study aid) */}
          <details
            className="mt-5 text-sm bg-slate-50 rounded-lg p-4"
            open={state.showSoln}
            onToggle={(e) => dispatch({ type: "soln", show: (e.currentTarget as HTMLDetailsElement).open })}
          >
            <summary className="cursor-pointer font-semibold text-brand">💡 View solution (you can still change your answer)</summary>
            <div className="mt-3 text-ink/90">{q.solution ?? "—"}</div>
          </details>
        </section>

        {/* Palette — desktop sticky sidebar */}
        <aside className="hidden lg:block bg-white rounded-xl border border-line p-5 lg:sticky lg:top-20 h-fit">
          <PaletteBody
            counts={counts}
            total={questions.length}
            currentIdx={state.idx}
            status={state.status}
            go={go}
            submitting={submitting}
            onSubmit={() => submit(false)}
          />
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
          disabled={submitting}
          onClick={() => submit(false)}
          className="btn btn-accent h-12 justify-center font-semibold"
        >
          {submitting ? "Submitting…" : "Submit"}
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
            <PaletteBody
              counts={counts}
              total={questions.length}
              currentIdx={state.idx}
              status={state.status}
              go={(i) => { go(i); setPaletteOpen(false); }}
              submitting={submitting}
              onSubmit={() => submit(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PaletteBody({
  counts, total, currentIdx, status, go, submitting, onSubmit,
}: {
  counts: Record<string, number>;
  total: number;
  currentIdx: number;
  status: Record<number, Status>;
  go: (i: number) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <>
      <Legend counts={counts} />
      <div className="mt-4 font-semibold text-sm text-muted">Choose a question</div>
      <div className="mt-2 grid grid-cols-5 sm:grid-cols-6 gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const s = status[i] ?? "nv";
          return (
            <button
              key={i}
              onClick={() => go(i)}
              className={cn(
                "h-10 sm:h-9 text-xs font-semibold rounded",
                s === "nv"    && "bg-slate-200 text-slate-700",
                s === "not"   && "bg-rose-200 text-rose-900",
                s === "ans"   && "bg-emerald-500 text-white",
                s === "mark"  && "bg-violet-500 text-white",
                s === "marka" && "bg-violet-700 text-white ring-2 ring-emerald-400",
                i === currentIdx && "ring-2 ring-brand",
              )}
              title={`Question ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <button
        disabled={submitting}
        onClick={onSubmit}
        className="btn btn-accent w-full mt-5 text-sm"
      >
        {submitting ? "Submitting…" : "Submit Paper"}
      </button>
    </>
  );
}

function Legend({ counts }: { counts: Record<string, number> }) {
  const items: [string, string, number][] = [
    ["bg-slate-200",    "Not visited",       counts.nv],
    ["bg-rose-200",     "Not answered",      counts.not],
    ["bg-emerald-500",  "Answered",          counts.ans],
    ["bg-violet-500",   "Marked",            counts.mark],
    ["bg-violet-700",   "Marked & answered", counts.marka],
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
  options, selected, multi, onChange,
}: {
  options: string[];
  selected: number | number[] | undefined;
  multi: boolean;
  onChange: (v: number | number[]) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const isSel = multi
          ? Array.isArray(selected) && selected.includes(i)
          : selected === i;
        return (
          <label
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition",
              isSel ? "border-brand bg-brand/5" : "border-line hover:bg-slate-50"
            )}
          >
            <input
              type={multi ? "checkbox" : "radio"}
              checked={!!isSel}
              onChange={() => {
                if (!multi) onChange(i);
                else {
                  const cur = Array.isArray(selected) ? [...selected] : [];
                  const idx = cur.indexOf(i);
                  if (idx >= 0) cur.splice(idx, 1); else cur.push(i);
                  onChange(cur);
                }
              }}
              className="mt-0.5"
            />
            <span className="font-bold w-5">{String.fromCharCode(65 + i)}.</span>
            <span className="flex-1 text-sm">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

function NatInput({
  value, onChange, tolerance,
}: {
  value: number | string | undefined;
  onChange: (v: number | string | undefined) => void;
  tolerance: number;
}) {
  return (
    <div className="max-w-sm">
      <label className="text-sm font-semibold">Your answer (numerical)</label>
      <input
        type="number"
        step="any"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
        className="input mt-1.5 font-mono"
        placeholder="e.g. 12.5"
      />
      <p className="text-xs text-muted mt-1">Accepted tolerance: ±{tolerance}</p>
    </div>
  );
}
