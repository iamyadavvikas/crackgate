"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  refId: string;
  refTitle: string;
  kind: string;
  myBest: number;
  total: number;
  myPct: number;
  peerCount: number;
  percentile: number | null;
};

export function PercentilePanel() {
  const [data, setData] = useState<{ isPremium: boolean; rows: Row[]; capped?: boolean; totalRows?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attempts/percentile")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="font-bold text-lg">Percentile vs Peers</h2>
        <p className="text-sm text-muted mt-2">Loading…</p>
      </div>
    );
  }
  if (!data || data.rows.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="font-bold text-lg">Percentile vs Peers</h2>
        <p className="text-sm text-muted mt-2">Submit a mock or PYQ to see how you rank against other CrackGate users.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-bold text-lg">Percentile vs Peers</h2>
          <p className="text-sm text-muted">Where you rank against everyone else who took the same test.</p>
        </div>
        {!data.isPremium && <span className="badge badge-premium text-xs">💎 PREMIUM</span>}
      </div>

      <ul className="mt-5 space-y-3">
        {data.rows.map((r) => (
          <li key={r.refId} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{r.refTitle}</div>
              <div className="text-xs text-muted">{r.myBest}/{r.total} · {r.myPct}% · {r.peerCount} peer{r.peerCount === 1 ? "" : "s"}</div>
            </div>
            {r.percentile === null ? (
              <span className="text-xs text-muted">No peers yet</span>
            ) : (
              <span className={
                "text-lg font-extrabold tabular-nums " +
                (r.percentile >= 90 ? "text-ok" : r.percentile >= 50 ? "text-brand" : "text-bad")
              }>{r.percentile}<span className="text-xs font-semibold">th</span></span>
            )}
          </li>
        ))}
      </ul>

      {data.capped && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
          Showing 1 of {data.totalRows} tests. <Link href="/pricing" className="font-bold underline">Upgrade to Premium</Link> to see percentile for every attempt.
        </div>
      )}
    </div>
  );
}
