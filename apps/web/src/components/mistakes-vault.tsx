"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Brain, CheckCircle2, RotateCcw, AlertCircle } from "lucide-react";
import type { MistakeItem } from "@/app/api/mistakes/route";
import { toHtml } from "@/components/math-text";

const LS_KEY = "cg.mistakes.understood";

/**
 * Mistakes Vault — fetches `/api/mistakes`, lets the user filter by subject,
 * mark items as understood (persisted to localStorage), and start a drill of
 * everything still un-mastered.
 */
export function MistakesVault() {
  const [items, setItems] = useState<MistakeItem[] | null>(null);
  const [subjects, setSubjects] = useState<{ name: string; count: number }[]>([]);
  const [understood, setUnderstood] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  // Load understood-set from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUnderstood(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  // Fetch items
  useEffect(() => {
    let cancelled = false;
    setItems(null);
    fetch("/api/mistakes?limit=80")
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: { items: MistakeItem[]; subjects: { name: string; count: number }[] }) => {
        if (cancelled) return;
        setItems(d.items);
        setSubjects(d.subjects);
      })
      .catch(() => setError("Could not load mistakes."));
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => {
    if (!items) return [];
    return items.filter((m) => {
      if (understood.has(m.key)) return false;
      if (filter !== "all" && m.subject !== filter) return false;
      return true;
    });
  }, [items, understood, filter]);

  const markUnderstood = (key: string) => {
    setUnderstood((prev) => {
      const next = new Set(prev);
      next.add(key);
      try { localStorage.setItem(LS_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const resetUnderstood = () => {
    setUnderstood(new Set());
    try { localStorage.removeItem(LS_KEY); } catch {}
  };

  if (error) {
    return (
      <div className="card p-8 text-center text-bad">
        <AlertCircle size={28} className="mx-auto mb-2" aria-hidden />
        {error}
      </div>
    );
  }

  if (items === null) {
    return (
      <div className="card p-10 text-center text-muted">
        <div className="inline-block w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm">Loading your mistakes…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <CheckCircle2 size={32} className="mx-auto text-ok" aria-hidden />
        <h3 className="text-lg font-extrabold mt-3 text-ink">No mistakes yet</h3>
        <p className="text-sm text-muted mt-2 max-w-md mx-auto">
          Take a mock and your wrong answers will queue up here for spaced-repetition review.
        </p>
        <Link href="/mocks" className="btn btn-primary btn-sm mt-5 inline-flex">Start a mock</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-extrabold text-ink flex items-center gap-2">
              <Brain size={20} className="text-brand" aria-hidden />
              Mistakes Vault
            </h2>
            <p className="text-sm text-muted mt-1 tabular-nums">
              {visible.length} pending · {understood.size} marked understood · {items.length} total
            </p>
          </div>

          <div className="flex items-center gap-2">
            {understood.size > 0 && (
              <button
                type="button"
                onClick={resetUnderstood}
                className="btn btn-ghost btn-sm"
                title="Restore all marked-understood items"
              >
                <RotateCcw size={14} aria-hidden /> Reset
              </button>
            )}
            <Link
              href={`/practice/mistakes${filter !== "all" ? `?subject=${encodeURIComponent(filter)}` : ""}`}
              className="btn btn-primary btn-sm"
              aria-disabled={visible.length === 0}
            >
              Drill {visible.length} now
            </Link>
          </div>
        </div>

        {/* Subject filter chips */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          <FilterChip label="All" active={filter === "all"} count={items.length - understood.size} onClick={() => setFilter("all")} />
          {subjects.map((s) => (
            <FilterChip
              key={s.name}
              label={s.name}
              count={s.count}
              active={filter === s.name}
              onClick={() => setFilter(s.name)}
            />
          ))}
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="card p-10 text-center">
          <CheckCircle2 size={28} className="mx-auto text-ok" aria-hidden />
          <p className="text-sm font-bold text-ink mt-3">All clear for this filter.</p>
          <p className="text-xs text-muted mt-1">Pick another subject or reset your progress.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((m) => (
            <MistakeRow key={m.key} m={m} onMark={() => markUnderstood(m.key)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label, count, active, onClick,
}: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors
        ${active
          ? "bg-brand text-white border-brand"
          : "bg-surface text-muted border-line hover:border-brand hover:text-ink"}`}
    >
      {label}
      <span className={`tabular-nums ${active ? "text-white/90" : "text-muted"}`}>{count}</span>
    </button>
  );
}

function MistakeRow({ m, onMark }: { m: MistakeItem; onMark: () => void }) {
  const [open, setOpen] = useState(false);
  const date = new Date(m.attemptDate).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short",
  });

  return (
    <li className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap text-[11px] uppercase tracking-wider font-bold text-muted">
            <span className="text-bad">{m.isSkipped ? "Skipped" : "Wrong"}</span>
            <span>·</span>
            <span>{m.subject}</span>
            {m.topic && <><span>·</span><span>{m.topic}</span></>}
            <span>·</span>
            <span className="text-muted/80">{m.type}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="block text-left w-full mt-1.5"
          >
            <p
              className={`text-sm text-ink leading-relaxed ${open ? "" : "line-clamp-2"}`}
              dangerouslySetInnerHTML={{ __html: toHtml(m.stem) }}
            />
          </button>
          <div className="text-[11px] text-muted mt-2 tabular-nums">
            {m.refTitle} · {date}
          </div>
        </div>

        <button
          type="button"
          onClick={onMark}
          className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-ok border border-ok/40 rounded-md px-2.5 py-1 hover:bg-ok/10"
          title="Mark as understood — removes from this list"
        >
          <CheckCircle2 size={14} aria-hidden /> Got it
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-line space-y-3 text-sm">
          {m.options && (
            <ol className="space-y-1.5">
              {m.options.map((opt, i) => {
                const isCorrect = Array.isArray(m.correct) ? m.correct.includes(i) : m.correct === i;
                const isUser = Array.isArray(m.userAnswer)
                  ? m.userAnswer.includes(i)
                  : m.userAnswer === i;
                return (
                  <li
                    key={i}
                    className={`rounded-md px-3 py-2 border text-sm flex items-start gap-2
                      ${isCorrect ? "bg-ok/10 border-ok/40 text-ink"
                       : isUser    ? "bg-bad/10 border-bad/40 text-ink"
                       :              "bg-canvas/40 border-line text-muted"}`}
                  >
                    <span className="font-bold tabular-nums">{String.fromCharCode(65 + i)}.</span>
                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: toHtml(opt) }} />
                    {isCorrect && <span className="text-[10px] font-bold text-ok uppercase tracking-wider">Correct</span>}
                    {!isCorrect && isUser && <span className="text-[10px] font-bold text-bad uppercase tracking-wider">Your pick</span>}
                  </li>
                );
              })}
            </ol>
          )}

          {m.type === "NAT" && (
            <div className="text-sm">
              <span className="text-muted">Correct: </span>
              <span className="font-bold text-ok tabular-nums">{String(m.correct)}</span>
              {!m.isSkipped && (
                <>
                  <span className="text-muted ml-3">You: </span>
                  <span className="font-bold text-bad tabular-nums">{String(m.userAnswer)}</span>
                </>
              )}
            </div>
          )}

          {m.solution && (
            <div className="rounded-md bg-canvas/40 border border-line p-3 text-sm text-ink/85 leading-relaxed">
              <div className="text-[10px] uppercase tracking-wider font-bold text-muted mb-1">Solution</div>
              <div dangerouslySetInnerHTML={{ __html: toHtml(m.solution) }} />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
