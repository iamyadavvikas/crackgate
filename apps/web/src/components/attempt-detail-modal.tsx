"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { X, BarChart3, Repeat, Eye } from "lucide-react";

export type AttemptRow = {
  id: string;
  kind: "mock" | "pyq";
  refId: string;
  refTitle: string;
  score: number;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  durationSec: number;
  takenAt: string;        // ISO string (serialised)
  breakdown: Record<string, { scored: number; total: number }>;
};

/**
 * Attempt detail modal — URL-synced via `?attempt=<id>`.
 *
 * Used inside the Mocks tab on the dashboard. Doesn't fetch anything — it
 * receives the (already-loaded) attempts list as a prop and looks up by id.
 * Shows per-subject breakdown, scoring stats, and quick links to retry the
 * paper or open mistakes from this attempt.
 */
export function AttemptDetailModal({ attempts }: { attempts: AttemptRow[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const openId = params.get("attempt");

  const attempt = useMemo(
    () => (openId ? attempts.find((a) => a.id === openId) ?? null : null),
    [openId, attempts],
  );

  const close = useCallback(() => {
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.delete("attempt");
    const qs = sp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [router, params]);

  useEffect(() => {
    if (!attempt) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [attempt, close]);

  if (!attempt) return null;

  const pct = attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0;
  const tone = pct >= 60 ? "text-ok" : pct >= 40 ? "text-accent" : "text-bad";
  const date = new Date(attempt.takenAt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const minutes = Math.floor((attempt.durationSec ?? 0) / 60);
  const breakdownEntries = Object.entries(attempt.breakdown ?? {})
    .filter(([, v]) => v && v.total > 0)
    .sort((a, b) => (b[1].scored / b[1].total) - (a[1].scored / a[1].total));

  const retryHref = attempt.kind === "mock" ? `/mocks/${attempt.refId}` : `/pyq/${attempt.refId.replace(/^pyq-/, "")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attempt-modal-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="cg-overlay absolute inset-0 bg-ink/40 backdrop-blur-sm cursor-default"
      />

      <div className="cg-drawer relative bg-surface text-ink shadow-pop rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-hidden flex flex-col">
        <header className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-line">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider font-bold text-muted">
              {attempt.kind === "mock" ? "Mock test" : "PYQ paper"} · {date}
            </div>
            <h2 id="attempt-modal-title" className="text-lg sm:text-xl font-extrabold mt-1 text-ink truncate">
              {attempt.refTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-line text-muted hover:text-ink shrink-0"
          >
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Score" value={`${Math.round(attempt.score)} / ${Math.round(attempt.total)}`} />
            <Stat label="Accuracy" value={`${pct}%`} tone={tone} />
            <Stat label="Correct / Wrong" value={`${attempt.correct} / ${attempt.wrong}`} />
            <Stat label="Time" value={minutes > 0 ? `${minutes} min` : "—"} />
          </div>

          {/* Per-subject breakdown */}
          <div>
            <h3 className="text-sm font-extrabold text-ink mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-brand" aria-hidden />
              Subject breakdown
            </h3>
            {breakdownEntries.length === 0 ? (
              <p className="text-sm text-muted">No per-subject data recorded for this attempt.</p>
            ) : (
              <ul className="space-y-2">
                {breakdownEntries.map(([name, v]) => {
                  const subPct = Math.round((v.scored / v.total) * 100);
                  const subTone = subPct >= 60 ? "var(--ok)" : subPct >= 40 ? "var(--accent)" : "var(--bad)";
                  return (
                    <li key={name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold text-ink truncate">{name}</span>
                        <span className="tabular-nums text-xs text-muted">
                          <span className="font-bold" style={{ color: subTone }}>{subPct}%</span>
                          {" · "}{v.scored.toFixed(1)} / {v.total}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-canvas overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.max(0, Math.min(100, subPct))}%`, background: subTone }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="grid sm:grid-cols-2 gap-2 pt-3 border-t border-line">
            <Link
              href={retryHref}
              className="btn btn-ghost btn-sm justify-center"
              onClick={close}
            >
              <Repeat size={14} aria-hidden /> Re-attempt
            </Link>
            <Link
              href="/dashboard?tab=mistakes"
              className="btn btn-primary btn-sm justify-center"
              onClick={close}
            >
              <Eye size={14} aria-hidden /> Review mistakes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="text-[10px] uppercase tracking-wider font-bold text-muted">{label}</div>
      <div className={`text-lg font-extrabold tabular-nums mt-0.5 ${tone ?? "text-ink"}`}>{value}</div>
    </div>
  );
}
