"use client";

import { useEffect, useState } from "react";

/**
 * Daily-target radial ring. Goal lives in localStorage so we don't need a
 * migration; progress comes via prop (questions answered today).
 */
export function DailyTargetRing({ done }: { done: number }) {
  const [goal, setGoal] = useState<number>(30);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("30");

  useEffect(() => {
    const stored = Number(localStorage.getItem("cg.dailyGoal"));
    if (Number.isFinite(stored) && stored > 0) {
      setGoal(stored);
      setDraft(String(stored));
    }
  }, []);

  function save() {
    const n = Math.max(5, Math.min(500, Number(draft) || 30));
    setGoal(n);
    localStorage.setItem("cg.dailyGoal", String(n));
    setEditing(false);
  }

  const pct = Math.min(100, Math.round((done / goal) * 100));
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  const dash = (circ * pct) / 100;
  const done100 = done >= goal;

  return (
    <div className="card p-5 flex gap-5 items-center">
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgb(226,232,240)" strokeWidth="12" />
          <circle
            cx="70" cy="70" r={radius} fill="none"
            stroke={done100 ? "var(--ok)" : "var(--brand)"}
            strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: "stroke-dasharray 400ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-extrabold leading-none">{done}<span className="text-base text-muted">/{goal}</span></div>
          <div className="text-[10px] uppercase tracking-wide text-muted mt-1">Today</div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted uppercase tracking-wide">Daily target</div>
        <div className="font-bold mt-1">
          {done100 ? "🎉 Goal smashed!" : `${goal - done} more to close the ring`}
        </div>
        <p className="text-xs text-muted mt-1 leading-snug">
          Solve {goal} questions today — every active day extends your streak.
        </p>
        {editing ? (
          <div className="mt-3 flex gap-2 items-center">
            <input
              type="number" min={5} max={500}
              value={draft} onChange={(e) => setDraft(e.target.value)}
              className="w-20 px-2 py-1 border border-line rounded text-sm"
            />
            <button onClick={save} className="btn btn-primary text-xs">Save</button>
            <button onClick={() => setEditing(false)} className="text-xs text-muted hover:underline">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="mt-3 text-xs text-brand hover:underline">
            Adjust goal →
          </button>
        )}
      </div>
    </div>
  );
}
