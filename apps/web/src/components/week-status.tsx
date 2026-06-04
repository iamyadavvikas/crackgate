import Link from "next/link";
import { Flame, CalendarClock, BookmarkPlus } from "lucide-react";
import type { WeekActivity, ScheduledMock } from "@/lib/dashboard-data";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Tier 2 (right) — at-a-glance week status:
 *   - Mon-Sun intensity dots (today highlighted)
 *   - Streak count
 *   - Revision queue size
 *   - Next scheduled mock
 */
export function WeekStatus({
  week,
  streak,
  revisionQueueCount,
  nextMock,
}: {
  week: WeekActivity;
  streak: number;
  revisionQueueCount: number;
  nextMock: ScheduledMock | null;
}) {
  return (
    <aside className="rounded-2xl border border-line bg-surface shadow-card p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[11px] uppercase tracking-wider font-semibold text-muted">
          This week
        </h2>
        <span className="text-[11px] text-muted tabular-nums">
          {week.totalCount} session{week.totalCount === 1 ? "" : "s"}
        </span>
      </div>

      {/* Weekday strip */}
      <div className="flex items-end justify-between gap-1.5" aria-label="Activity this week, Monday to Sunday">
        {week.days.map((d, i) => {
          const isToday = i === week.todayIndex;
          const isPast = i < week.todayIndex;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <DayCell intensity={d.intensity} isToday={isToday} isPast={isPast} count={d.count} />
              <span
                className={`text-[10px] font-bold tabular-nums
                  ${isToday ? "text-brand" : "text-muted"}`}
              >
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats stack */}
      <ul className="divide-y divide-line text-sm">
        <li className="py-2.5 flex items-center gap-2.5">
          <Flame size={16} className="text-accent shrink-0" aria-hidden />
          <span className="font-semibold tabular-nums">{streak}</span>
          <span className="text-muted">day{streak === 1 ? "" : "s"} streak</span>
          {streak === 0 && <span className="text-xs text-muted ml-auto">start one today</span>}
        </li>

        <li className="py-2.5 flex items-center gap-2.5">
          <BookmarkPlus size={16} className="text-bad shrink-0" aria-hidden />
          <span className="font-semibold tabular-nums">{revisionQueueCount}</span>
          <span className="text-muted">Q to revise</span>
          {revisionQueueCount > 0 && (
            <Link
              href="/dashboard?tab=mistakes"
              className="ml-auto text-xs font-semibold text-brand hover:underline"
            >
              Open vault
            </Link>
          )}
        </li>

        <li className="py-2.5 flex items-center gap-2.5">
          <CalendarClock size={16} className="text-brand shrink-0" aria-hidden />
          <span className="text-muted">Next mock:</span>
          {nextMock ? (
            <Link
              href={`/mocks/${nextMock.id}`}
              className="font-semibold text-ink hover:text-brand truncate"
              title={nextMock.title}
            >
              {shortMockLabel(nextMock.title)}
            </Link>
          ) : (
            <span className="text-muted text-xs">all attempted ✓</span>
          )}
          {nextMock && (
            <span className="ml-auto text-[11px] text-muted tabular-nums shrink-0">
              {formatSat(nextMock.suggestedAt)}
            </span>
          )}
        </li>
      </ul>
    </aside>
  );
}

function DayCell({
  intensity,
  isToday,
  isPast,
  count,
}: {
  intensity: 0 | 1 | 2 | 3;
  isToday: boolean;
  isPast: boolean;
  count: number;
}) {
  // Heights for filled bars: 0/none, 1/light, 2/med, 3/heavy
  const heights = ["h-2", "h-3", "h-5", "h-7"];
  const fills =
    intensity === 0
      ? "bg-line"
      : intensity === 1
        ? "bg-brand/30"
        : intensity === 2
          ? "bg-brand/60"
          : "bg-brand";

  const ring = isToday ? "ring-2 ring-brand ring-offset-2 ring-offset-white" : "";
  const dim  = !isPast && !isToday ? "opacity-60" : "";

  return (
    <div
      className={`w-full max-w-[18px] rounded-md ${heights[intensity]} ${fills} ${ring} ${dim} transition-colors`}
      title={`${count} session${count === 1 ? "" : "s"}`}
      aria-label={`${count} sessions`}
    />
  );
}

function shortMockLabel(title: string): string {
  // "Mock Test 04 — Full Syllabus" → "Mock 04"
  const m = title.match(/(?:Mock(?:\s*Test)?)\s*0?(\d+)/i);
  return m ? `Mock ${m[1].padStart(2, "0")}` : title.slice(0, 18);
}

function formatSat(d: Date): string {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}
