"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { SubjectMastery } from "@/lib/dashboard-data";
import { SubjectDrawer } from "@/components/subject-drawer";

/**
 * Compact chip grid for the Mastery tab. One row per chip:
 *   [name] [accuracy% • attempted]
 * Color = mastery tier. Clicking opens SubjectDrawer via `?subject=<slug>`.
 *
 * Renders the drawer itself for co-location — the drawer reads the same
 * URL param.
 */
export function SubjectChipGrid({ syllabus }: { syllabus: SubjectMastery[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const openSlug = params.get("subject");

  const open = useCallback((slug: string) => {
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.set("subject", slug);
    router.replace(`?${sp.toString()}`, { scroll: false });
  }, [router, params]);

  const close = useCallback(() => {
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.delete("subject");
    const qs = sp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [router, params]);

  const openSubject = openSlug ? syllabus.find((s) => s.slug === openSlug) ?? null : null;

  return (
    <>
      <div className="rounded-2xl border border-line bg-surface shadow-card p-5 sm:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-extrabold text-ink">Subjects</h2>
          <span className="text-xs text-muted">Tap a subject for detail · {syllabus.length} total</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {syllabus.map((s) => (
            <SubjectChip key={s.slug} s={s} onOpen={() => open(s.slug)} />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-line text-[11px] text-muted">
          <LegendDot color="var(--ok)"  label="Strong (≥70%)" />
          <LegendDot color="var(--accent)" label="OK (50–69%)" />
          <LegendDot color="var(--bad)" label="Weak (<50%)" />
          <LegendDot color="rgb(148 163 184)" label="Untouched" />
        </div>
      </div>

      <SubjectDrawer subject={openSubject} onClose={close} />
    </>
  );
}

function SubjectChip({ s, onOpen }: { s: SubjectMastery; onOpen: () => void }) {
  const tone =
    s.status === "strong" ? "var(--ok)"     :
    s.status === "ok"     ? "var(--accent)" :
    s.status === "weak"   ? "var(--bad)"    : "rgb(148 163 184)";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex items-center gap-2 rounded-full border bg-surface
                 px-3 py-1.5 text-sm font-semibold transition-colors hover:shadow-sm
                 hover:border-brand focus:border-brand"
      style={{ borderColor: `color-mix(in srgb, ${tone} 35%, transparent)` }}
      aria-label={`Open ${s.name} details`}
    >
      <span
        aria-hidden
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: tone }}
      />
      <span className="text-ink">{s.name}</span>
      {s.attempted > 0 ? (
        <span className="tabular-nums text-xs font-bold" style={{ color: tone }}>
          {s.accuracy}%
        </span>
      ) : (
        <span className="text-xs text-muted font-medium">new</span>
      )}
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </span>
  );
}
