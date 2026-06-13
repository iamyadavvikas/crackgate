"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Bucket = { name: string; value: string; hint: string; pct?: number; trend?: number };
type SwotResp = {
  strengths: Bucket[];
  weaknesses: Bucket[];
  opportunities: Bucket[];
  threats: Bucket[];
  windowDays: number;
};

const QUADRANTS: Array<{
  key: keyof Pick<SwotResp, "strengths" | "weaknesses" | "opportunities" | "threats">;
  title: string;
  emoji: string;
  border: string;
  accent: string;
  empty: string;
  cta: { href: string; text: string };
}> = [
  {
    key: "strengths", title: "Strengths", emoji: "💪",
    border: "border-l-4 border-emerald-400", accent: "text-emerald-700",
    empty: "Submit more mocks to surface your strongest subjects.",
    cta: { href: "/mocks", text: "Defend with a full mock →" },
  },
  {
    key: "weaknesses", title: "Weaknesses", emoji: "🎯",
    border: "border-l-4 border-rose-400", accent: "text-rose-700",
    empty: "Nothing scoring under 50% — keep it up.",
    cta: { href: "/practice", text: "Drill easy questions →" },
  },
  {
    key: "opportunities", title: "Opportunities", emoji: "🚀",
    border: "border-l-4 border-sky-400", accent: "text-sky-700",
    empty: "Practice a few more subjects to reveal opportunities.",
    cta: { href: "/practice", text: "Pick a topic →" },
  },
  {
    key: "threats", title: "Threats", emoji: "⚠️",
    border: "border-l-4 border-amber-400", accent: "text-amber-700",
    empty: "No subjects are slipping. Trend is stable.",
    cta: { href: "/mocks", text: "Re-test with a mock →" },
  },
];

export function SwotAnalysisPanel() {
  const [data, setData] = useState<SwotResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/analytics/swot")
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const isEmpty =
    !data ||
    (data.strengths.length +
      data.weaknesses.length +
      data.opportunities.length +
      data.threats.length ===
      0);

  return (
    <section className="mt-10 card p-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-lg">SWOT Analysis</h2>
          <p className="text-sm text-muted">
            Last 90 days of mocks, classified into Strengths · Weaknesses · Opportunities · Threats.
          </p>
        </div>
        {data && <span className="text-xs text-muted">Updated just now</span>}
      </div>

      {loading ? (
        <p className="text-sm text-muted mt-6 text-center py-6">Crunching your numbers…</p>
      ) : error ? (
        <p className="text-sm text-bad mt-6 text-center py-6">Couldn't load SWOT — try again in a moment.</p>
      ) : isEmpty ? (
        <div className="mt-6 text-center py-8 border-2 border-dashed border-line rounded-xl">
          <p className="text-3xl">🧭</p>
          <p className="font-semibold mt-2">Not enough data yet.</p>
          <p className="text-sm text-muted mt-1">
            Submit a mock and your personalized SWOT shows up here.
          </p>
          <Link href="/mocks" className="btn btn-primary mt-4 inline-flex">Take a mock →</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {QUADRANTS.map((q) => {
            const items = data![q.key];
            return (
              <div key={q.key} className={`rounded-xl bg-canvas/70 p-4 ${q.border}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${q.accent}`}>
                    {q.emoji} {q.title}
                  </h3>
                  <span className="text-xs text-muted">{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-muted mt-3 py-3">{q.empty}</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {items.map((it) => (
                      <li key={it.name} className="rounded-lg bg-surface p-3 border border-line/60">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold truncate pr-2">{it.name}</span>
                          <span className={`font-semibold ${q.accent}`}>{it.value}</span>
                        </div>
                        <p className="text-xs text-muted mt-1">{it.hint}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 text-right">
                  <Link href={q.cta.href} className="text-xs font-semibold text-brand hover:underline">
                    {q.cta.text}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
