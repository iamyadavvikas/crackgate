"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";
import { useMemo } from "react";

type Point = { date: string; pct: number; score: number; total: number; title: string };

export function ScoreTrendChart({ data }: { data: Point[] }) {
  const points = useMemo(() => data.map((d, i) => ({ ...d, n: i + 1 })), [data]);

  if (points.length === 0) {
    return (
      <div className="text-center text-sm text-muted py-10 border-2 border-dashed border-line rounded-xl">
        <p className="text-3xl">📈</p>
        <p className="mt-2 font-semibold">No score history yet</p>
        <p className="text-xs mt-1">Your mock + PYQ scores will plot here over time.</p>
      </div>
    );
  }

  // Running cumulative average
  let sumPct = 0;
  const withAvg = points.map((p) => {
    sumPct += p.pct;
    return { ...p, avg: Math.round(sumPct / p.n) };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <ComposedChart data={withAvg} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#1e3a8a" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="n" tick={{ fontSize: 11 }} label={{ value: "Attempt #", position: "insideBottom", offset: -2, fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0].payload as typeof withAvg[number];
              return (
                <div className="bg-white border border-line rounded-lg p-3 text-xs shadow-pop">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-muted">{p.date}</div>
                  <div className="mt-1">Score: <b>{p.score}/{p.total}</b> ({p.pct}%)</div>
                  <div>Running avg: <b>{p.avg}%</b></div>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="pct" name="Score %" stroke="#1e3a8a" fill="url(#scoreFill)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="avg" name="Running avg" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
