import type { AirPrediction } from "@/lib/dashboard-data";

/**
 * Tier 1 — always-visible single line. Answers "Where do I stand?"
 *
 * Three slots: predicted AIR (with delta), target gap, days-to-GATE.
 * Falls back to em-dashes when too few attempts to predict.
 */
export function RankLine({
  prediction,
  targetAir = 100,
  daysToGate,
  examName = "GATE 2027",
}: {
  prediction: AirPrediction | null;
  targetAir?: number;
  daysToGate: number;
  examName?: string;
}) {
  const air = prediction?.air ?? null;
  const delta = prediction?.delta ?? null;
  const gap = air !== null ? Math.max(0, air - targetAir) : null;

  return (
    <section
      aria-label="Your rank summary"
      className="rounded-2xl border border-line bg-surface shadow-card px-5 sm:px-6 py-3.5
                 flex flex-wrap items-center gap-x-8 gap-y-2 tabular-nums"
    >
      {/* Predicted AIR */}
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-muted">
          Predicted AIR
        </span>
        <span className="text-2xl font-extrabold text-ink leading-none">
          {air !== null ? air : "—"}
        </span>
        {delta !== null && delta !== 0 && (
          <span
            className={`text-xs font-bold ${delta < 0 ? "text-ok" : "text-bad"}`}
            title={delta < 0 ? "Rank improving" : "Rank slipping"}
          >
            {delta < 0 ? "▲" : "▼"} {Math.abs(delta)}
          </span>
        )}
        {prediction && (
          <span className="text-[10px] uppercase tracking-wider text-muted font-medium ml-1">
            {prediction.confidence}
          </span>
        )}
      </div>

      <span className="hidden sm:inline text-line">│</span>

      {/* Target gap */}
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-muted">
          Target
        </span>
        <span className="text-sm font-bold text-ink">AIR {targetAir}</span>
        {gap !== null && (
          <span className="text-xs text-muted">
            · gap <span className={`font-bold ${gap === 0 ? "text-ok" : "text-ink"}`}>{gap}</span>
          </span>
        )}
      </div>

      <span className="hidden sm:inline text-line">│</span>

      {/* Days to GATE */}
      <div className="flex items-baseline gap-2 ml-auto">
        <span className="text-sm font-bold text-ink">{examName}</span>
        <span className="text-xs text-muted">·</span>
        <span className="text-sm font-bold text-ink">{daysToGate}</span>
        <span className="text-xs text-muted">days</span>
      </div>
    </section>
  );
}
