"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, ArrowRight, Target, BookOpen, PlayCircle } from "lucide-react";
import type { SubjectMastery } from "@/lib/dashboard-data";

/**
 * Slide-in drawer with subject detail.
 *
 *   ≥ sm : right-side drawer (max-w-md)
 *   < sm : bottom sheet (full-width, max 85vh)
 *
 * Controlled by the parent via `subject` (null = closed) and `onClose`.
 * Escape key + overlay click close. Body scroll-lock while open.
 */
export function SubjectDrawer({
  subject,
  onClose,
}: {
  subject: SubjectMastery | null;
  onClose: () => void;
}) {
  const open = subject !== null;

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !subject) return null;

  const tone =
    subject.status === "strong" ? "var(--ok)" :
    subject.status === "ok"     ? "var(--accent)" :
    subject.status === "weak"   ? "var(--bad)" : "rgb(148 163 184)";

  const peerTarget = 72;
  const gap = subject.attempted > 0 ? Math.max(0, peerTarget - subject.accuracy) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end sm:items-stretch items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subject-drawer-title"
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close subject details"
        onClick={onClose}
        className="cg-overlay absolute inset-0 bg-ink/40 backdrop-blur-sm cursor-default"
      />

      {/* Panel: bottom sheet on mobile, right drawer on >= sm */}
      <div
        className="relative bg-surface text-ink shadow-pop
                   w-full sm:w-[420px] sm:h-full
                   max-h-[85vh] sm:max-h-none
                   rounded-t-2xl sm:rounded-t-none sm:rounded-l-2xl
                   overflow-hidden flex flex-col
                   cg-sheet sm:!animate-none sm:cg-drawer"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-line">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-muted">
              <span
                aria-hidden
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: tone }}
              />
              {subject.status === "untouched" ? "Not started" : `${subject.status} subject`}
            </div>
            <h2 id="subject-drawer-title" className="text-xl sm:text-2xl font-extrabold mt-1 text-ink">
              {subject.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-line text-muted hover:text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Accuracy" value={subject.attempted > 0 ? `${subject.accuracy}%` : "—"} tone={tone} />
            <Stat label="Attempted" value={subject.attempted} />
            <Stat label="Target" value={`${peerTarget}%`} hint="top 10%" />
          </div>

          {/* Why this matters */}
          {subject.attempted > 0 && gap !== null && gap > 0 && (
            <div
              className="rounded-xl border p-4 text-sm leading-relaxed"
              style={{
                borderColor: `color-mix(in srgb, ${tone} 30%, transparent)`,
                background:  `color-mix(in srgb, ${tone} 8%,  transparent)`,
              }}
            >
              <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: tone }}>
                Diagnosis
              </div>
              You&apos;re <b className="tabular-nums">{gap}</b> percentage points below top scorers in {subject.name}.
              A focused drill of 25 questions can move the needle meaningfully.
            </div>
          )}

          {subject.attempted === 0 && (
            <div className="rounded-xl border border-line bg-canvas/40 p-4 text-sm text-muted">
              You haven&apos;t practised {subject.name} yet. Take a 15-minute baseline to calibrate your level.
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider font-bold text-muted">What to do</div>

            <ActionRow
              href={`/practice/${subject.slug}?minutes=15`}
              icon={<Target size={18} />}
              title="Quick drill"
              sub="10 questions · ~15 min"
            />
            <ActionRow
              href={`/practice/${subject.slug}`}
              icon={<PlayCircle size={18} />}
              title="Full practice session"
              sub="30 questions · ~45 min"
              primary
            />
            <ActionRow
              href={`/study/${subject.slug}`}
              icon={<BookOpen size={18} />}
              title="Open study notes"
              sub="Theory · formulas · solved examples"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="text-[10px] uppercase tracking-wider font-bold text-muted">{label}</div>
      <div className="text-xl font-extrabold tabular-nums mt-1" style={tone ? { color: tone } : undefined}>
        {value}
      </div>
      {hint && <div className="text-[10px] text-muted">{hint}</div>}
    </div>
  );
}

function ActionRow({
  href, icon, title, sub, primary = false,
}: { href: string; icon: React.ReactNode; title: string; sub: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors group
        ${primary
          ? "border-brand bg-brand text-white hover:bg-brand-2"
          : "border-line hover:border-brand hover:bg-canvas/40"}`}
    >
      <span className={`shrink-0 w-9 h-9 rounded-lg inline-flex items-center justify-center
        ${primary ? "bg-white/15 text-white" : "bg-brand/10 text-brand"}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-bold ${primary ? "text-white" : "text-ink"}`}>{title}</div>
        <div className={`text-xs ${primary ? "text-white/85" : "text-muted"}`}>{sub}</div>
      </div>
      <ArrowRight size={16} className={primary ? "text-white" : "text-muted group-hover:text-brand"} aria-hidden />
    </Link>
  );
}
