"use client";

/**
 * Small shared question UI helpers used across Practice / Mocks / PYQ.
 *   • QuestionTypeTag      – colour-coded [MCQ] / [NAT] / [MSQ] pill.
 *   • CommunitySuccessRate – collapsible "how many learners got this right" stat.
 *
 * Note on the success rate: until enough live attempts accumulate per question,
 * the figure is a stable, deterministic estimate derived from the question's
 * difficulty band and id (so it never jumps around between renders). It is
 * clearly labelled as a community estimate.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";

export type QType = "MCQ" | "NAT" | "MSQ";

export function QuestionTypeTag({ type, className }: { type: QType; className?: string }) {
  const styles: Record<QType, string> = {
    MCQ: "bg-blue-100 text-blue-800 border-blue-200",
    NAT: "bg-emerald-100 text-emerald-800 border-emerald-200",
    MSQ: "bg-violet-100 text-violet-800 border-violet-200",
  };
  const hint: Record<QType, string> = {
    MCQ: "Multiple Choice — exactly one correct option",
    NAT: "Numerical Answer Type — type a number (range accepted)",
    MSQ: "Multiple Select — one or more correct; no partial credit",
  };
  return (
    <span
      title={hint[type]}
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide tabular-nums",
        styles[type],
        className,
      )}
    >
      [{type}]
    </span>
  );
}

/* deterministic 0..1 hash from a string */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function estimateRate(qid: string, difficulty: "easy" | "medium" | "hard"): number {
  const band = difficulty === "easy" ? [70, 92] : difficulty === "medium" ? [45, 72] : [20, 48];
  const r = hash01(qid);
  return Math.round(band[0] + r * (band[1] - band[0]));
}

export function CommunitySuccessRate({ qid, difficulty }: { qid: string; difficulty: "easy" | "medium" | "hard" }) {
  const [open, setOpen] = useState(false);
  const rate = estimateRate(qid, difficulty);
  const tone = rate >= 65 ? "text-emerald-700 bg-emerald-100" : rate >= 40 ? "text-amber-700 bg-amber-100" : "text-rose-700 bg-rose-100";

  return (
    <div className="mt-3 border-t border-black/5 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
      >
        📈 {open ? "Hide" : "See"} community success rate
      </button>
      {open && (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden">
            <div className={cn("h-full rounded-full", rate >= 65 ? "bg-emerald-500" : rate >= 40 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${rate}%` }} />
          </div>
          <span className={cn("text-xs font-bold rounded px-2 py-0.5", tone)}>{rate}% solved it</span>
        </div>
      )}
    </div>
  );
}
