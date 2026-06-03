"use client";

import { useEffect, useState } from "react";

type Resp = { currentStreak: number };

/**
 * Compact streak indicator rendered in the dashboard top rail. Fetches the
 * existing /api/analytics/engagement endpoint, no extra route required.
 */
export function InlineStreak() {
  const [streak, setStreak] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/analytics/engagement")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Resp | null) => d && setStreak(d.currentStreak))
      .catch(() => {});
  }, []);
  if (streak === null) return <span className="text-muted text-sm">·</span>;
  const emoji = streak >= 14 ? "🔥🔥" : streak >= 3 ? "🔥" : streak >= 1 ? "✨" : "🌱";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{emoji}</span>
      <span className="font-semibold">{streak}</span>
      <span className="text-muted">day streak</span>
    </span>
  );
}
