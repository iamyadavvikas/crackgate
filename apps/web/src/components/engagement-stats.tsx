"use client";

import { useEffect, useState } from "react";

type Resp = {
  currentStreak: number;
  longestStreak: number;
  daysActive: number;
  questionsThisWeek: number;
  questionsThisMonth: number;
  avgPerActiveDay: number;
};

export function EngagementStats() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/engagement")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-8 w-40 bg-slate-200 rounded mt-3" />
      </div>
    );
  }
  if (!data) return null;

  const streakEmoji =
    data.currentStreak >= 14 ? "🔥🔥" : data.currentStreak >= 3 ? "🔥" : data.currentStreak >= 1 ? "✨" : "🌱";

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted uppercase tracking-wide">Engagement</div>
          <div className="text-3xl font-extrabold mt-1">
            {streakEmoji} {data.currentStreak}
            <span className="text-base font-semibold text-muted"> day streak</span>
          </div>
          <div className="text-xs text-muted mt-1">
            Longest: {data.longestStreak} d · {data.daysActive} active days in 90
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <Stat label="This week" value={data.questionsThisWeek} />
        <Stat label="This month" value={data.questionsThisMonth} />
        <Stat label="Avg / day" value={data.avgPerActiveDay} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <div className="text-lg font-bold text-brand">{value}</div>
      <div className="text-[11px] text-muted uppercase tracking-wide">{label}</div>
    </div>
  );
}
