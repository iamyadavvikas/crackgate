import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DashboardTrack } from "@/lib/dashboard-tracks";

/**
 * Track switcher shown at the top of the dashboard when a user owns more than
 * one track (or is an admin previewing all). Each pill links to
 * `/dashboard?track=<key>`; the page re-renders scoped to that track. Hidden
 * when there is only a single track to avoid noise.
 */
export function TrackSwitcher({
  tracks,
  activeKey,
}: {
  tracks: DashboardTrack[];
  activeKey: string;
}) {
  if (tracks.length <= 1) return null;

  return (
    <nav
      aria-label="Your exam tracks"
      className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-muted shrink-0 mr-1">
        Track
      </span>
      {tracks.map((t) => {
        const active = t.key === activeKey;
        return (
          <Link
            key={t.key}
            href={`/dashboard?track=${t.key}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition border",
              active
                ? "bg-brand text-white border-brand"
                : "bg-canvas text-ink border-line hover:border-brand hover:bg-brand/10",
            )}
          >
            {t.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
