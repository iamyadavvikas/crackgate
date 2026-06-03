"use client";

import { useEffect, useState } from "react";

type HourStat = { hour: number; attempts: number; questions: number; avgAccuracy: number };
type Resp = {
  hourly: HourStat[];
  peakHour: number | null;
  peakAccuracy: number | null;
  totalAttempts: number;
  windowDays: number;
};

function fmtHour(h: number): string {
  const ampm = h < 12 ? "AM" : "PM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display} ${ampm}`;
}

function colorFor(acc: number, hasData: boolean): string {
  if (!hasData) return "bg-slate-100";
  if (acc >= 75) return "bg-emerald-500";
  if (acc >= 60) return "bg-emerald-400";
  if (acc >= 45) return "bg-amber-400";
  if (acc >= 30) return "bg-orange-400";
  return "bg-rose-400";
}

export function TimePerformanceChart() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/timing")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mt-10 card p-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-lg">Peak Performance Hours</h2>
          <p className="text-sm text-muted">
            When do you score best? Hour-of-day accuracy from the last 60 days (IST).
          </p>
        </div>
        {data?.peakHour != null && (
          <span className="text-sm">
            🏆 Best window: <b>{fmtHour(data.peakHour)}–{fmtHour((data.peakHour + 1) % 24)}</b>{" "}
            <span className="text-muted">({data.peakAccuracy}%)</span>
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted mt-6 text-center py-6">Loading…</p>
      ) : !data || data.totalAttempts === 0 ? (
        <div className="mt-6 text-center py-8 border-2 border-dashed border-line rounded-xl">
          <p className="text-3xl">⏰</p>
          <p className="font-semibold mt-2">Not enough attempts yet.</p>
          <p className="text-sm text-muted mt-1">
            Take a few mocks at different times of day to discover your peak hours.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-1 mt-6" role="img" aria-label="Hour of day accuracy heatmap">
            {data.hourly.map((h) => {
              const has = h.attempts > 0;
              return (
                <div key={h.hour} className="flex flex-col items-center">
                  <div
                    className={`w-full h-10 rounded ${colorFor(h.avgAccuracy, has)} relative group cursor-default`}
                    title={
                      has
                        ? `${fmtHour(h.hour)} — ${h.avgAccuracy}% over ${h.attempts} attempt${h.attempts === 1 ? "" : "s"}`
                        : `${fmtHour(h.hour)} — no attempts`
                    }
                  >
                    {has && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white drop-shadow">
                        {h.avgAccuracy}
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-muted mt-1">{h.hour}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-[11px] text-muted">
            <span>Lower</span>
            <div className="w-4 h-3 bg-rose-400 rounded" />
            <div className="w-4 h-3 bg-orange-400 rounded" />
            <div className="w-4 h-3 bg-amber-400 rounded" />
            <div className="w-4 h-3 bg-emerald-400 rounded" />
            <div className="w-4 h-3 bg-emerald-500 rounded" />
            <span>Higher</span>
          </div>
        </>
      )}
    </section>
  );
}
