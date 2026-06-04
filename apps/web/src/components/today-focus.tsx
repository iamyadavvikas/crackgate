import Link from "next/link";
import { ArrowRight, AlertTriangle, Compass, Target, RotateCcw } from "lucide-react";
import type { TodayFocus } from "@/lib/dashboard-data";

/**
 * Tier 2 (left) — the single focused recommendation for now.
 * One CTA, one "Why" sentence, one time selector. No menu of options.
 */
export function TodayFocusCard({
  focus,
  followUps,
}: {
  focus: TodayFocus;
  followUps: { href: string; label: string; sub: string }[];
}) {
  const Icon =
    focus.kind === "drill"      ? AlertTriangle :
    focus.kind === "diagnostic" ? Compass :
    focus.kind === "revise"     ? RotateCcw : Target;

  const href = ctaHrefFor(focus);
  const ctaLabel =
    focus.kind === "diagnostic" ? "Start diagnostic" :
    focus.kind === "revise"     ? "Begin revision"   : "Begin drill";

  return (
    <article className="rounded-2xl border border-line bg-surface shadow-card p-6 sm:p-7 flex flex-col gap-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted">
            Today&apos;s focus
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-ink leading-tight flex items-center gap-2">
            <Icon size={20} className="text-brand shrink-0" aria-hidden />
            <span className="truncate">{focus.subjectName}</span>
          </h2>
          <p className="text-xs text-muted mt-1 tabular-nums">
            {focus.questionCount} Q · {focus.minutes} min
          </p>
        </div>
      </header>

      {/* Why */}
      <p className="text-sm text-ink/85 leading-relaxed">
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted mr-2">Why</span>
        {focus.reason}
      </p>

      {/* CTA + time selector */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-lg bg-brand text-white px-5 py-2.5
                     text-sm font-bold hover:bg-brand-2 transition-colors"
        >
          {ctaLabel}
          <ArrowRight size={16} aria-hidden />
        </Link>

        <fieldset className="flex items-center gap-1 text-xs">
          <legend className="sr-only">Adjust session length</legend>
          <span className="text-muted mr-1">Less time?</span>
          {dedupeByMins([
            { mins: 15, label: "15m" },
            { mins: focus.minutes, label: `${focus.minutes}m`, recommended: true },
            { mins: 90, label: "90m" },
          ]).map((opt) => (
            <Link
              key={opt.mins}
              href={`${href}${opt.mins === focus.minutes ? "" : `?minutes=${opt.mins}`}`}
              className={`px-2.5 py-1 rounded-md border transition-colors
                ${opt.recommended
                  ? "border-brand bg-brand/5 text-brand font-bold"
                  : "border-line text-muted hover:border-brand hover:text-ink"}`}
              aria-current={opt.recommended ? "true" : undefined}
            >
              {opt.label}
            </Link>
          ))}
        </fieldset>
      </div>

      {/* Follow-ups */}
      {followUps.length > 0 && (
        <div className="pt-4 border-t border-line">
          <div className="text-[10px] uppercase tracking-wider font-bold text-muted mb-2">
            Up next today
          </div>
          <ul className="grid sm:grid-cols-2 gap-2">
            {followUps.map((f) => (
              <li key={f.href}>
                <Link
                  href={f.href}
                  className="group flex items-center justify-between gap-2 rounded-lg
                             border border-line px-3 py-2 hover:border-brand hover:bg-brand/5 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{f.label}</div>
                    <div className="text-xs text-muted truncate">{f.sub}</div>
                  </div>
                  <ArrowRight size={14} className="text-muted group-hover:text-brand shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function ctaHrefFor(focus: TodayFocus): string {
  if (focus.kind === "diagnostic") return "/mocks/mn-mock-01";
  if (focus.kind === "revise")     return "/practice?mode=revise";
  if (focus.subjectSlug)           return `/practice/${focus.subjectSlug}`;
  return "/practice";
}

type Opt = { mins: number; label: string; recommended?: boolean };

function dedupeByMins(opts: Opt[]): Opt[] {
  const seen = new Map<number, Opt>();
  for (const o of opts) {
    const existing = seen.get(o.mins);
    // Prefer the recommended one when minutes collide
    if (!existing || (o.recommended && !existing.recommended)) seen.set(o.mins, o);
  }
  return Array.from(seen.values()).sort((a, b) => a.mins - b.mins);
}
