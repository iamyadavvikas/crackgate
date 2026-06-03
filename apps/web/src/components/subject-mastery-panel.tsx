"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Mastery = {
  slug: string; name: string;
  attempts: number; correct: number; pct: number;
  byDiff: Record<"easy" | "medium" | "hard", { attempts: number; correct: number }>;
};

export function SubjectMasteryPanel() {
  const [data, setData] = useState<{ subjects: Mastery[]; totals: { attempts: number; correct: number; pct: number } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/practice/mastery")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mt-10 card p-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-lg">Subject Mastery</h2>
          <p className="text-sm text-muted">Live accuracy from your practice attempts (906-question bank).</p>
        </div>
        <div className="flex gap-2 items-center">
          {data && (
            <span className="text-sm">
              <b>{data.totals.attempts}</b> attempts ·{" "}
              <b className={data.totals.pct >= 60 ? "text-ok" : data.totals.pct >= 40 ? "text-accent" : "text-bad"}>
                {data.totals.pct}%
              </b>{" "}
              accuracy
            </span>
          )}
          <Link href="/practice" className="btn btn-primary text-sm">Practice now →</Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted mt-6 text-center py-4">Loading mastery…</p>
      ) : !data || data.subjects.length === 0 ? (
        <div className="mt-6 text-center py-8 border-2 border-dashed border-line rounded-xl">
          <p className="text-3xl">🎯</p>
          <p className="font-semibold mt-2">No practice attempts yet.</p>
          <p className="text-sm text-muted mt-1">Solve a few questions and your subject mastery shows up here.</p>
          <Link href="/practice" className="btn btn-accent text-sm mt-4 inline-flex">Start practising</Link>
        </div>
      ) : (
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          {data.subjects.map((s) => (
            <Link key={s.slug} href={`/practice/${s.slug}`} className="rounded-xl border border-line p-4 hover:border-brand hover:shadow-pop transition block">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted mt-0.5">{s.attempts} attempts · {s.correct} correct</div>
                </div>
                <div className={`text-2xl font-extrabold ${s.pct >= 70 ? "text-ok" : s.pct >= 40 ? "text-accent" : "text-bad"}`}>
                  {s.pct}%
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div className="h-full" style={{
                  width: `${Math.max(2, s.pct)}%`,
                  background: s.pct >= 70 ? "var(--ok)" : s.pct >= 40 ? "var(--accent)" : "var(--bad)",
                }} />
              </div>
              <div className="grid grid-cols-3 gap-1 mt-3 text-[11px]">
                {(["easy", "medium", "hard"] as const).map((d) => {
                  const x = s.byDiff[d];
                  const pct = x.attempts ? Math.round((x.correct / x.attempts) * 100) : 0;
                  return (
                    <div key={d} className="bg-slate-50 rounded px-2 py-1 text-center">
                      <div className="text-muted capitalize">{d}</div>
                      <div className="font-bold">{x.attempts ? `${pct}%` : "—"}</div>
                    </div>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
