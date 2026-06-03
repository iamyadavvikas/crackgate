import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResultPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  if (!session?.user) return null;

  const att = await db.attempt.findUnique({ where: { id } });
  if (!att || att.userId !== session.user.id) notFound();

  const pct = att.total ? Math.round((att.score / att.total) * 100) : 0;
  const breakdown = (att.breakdown as Record<string, { scored: number; total: number }>) ?? {};

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="card p-10 text-center">
        <p className="text-xs uppercase tracking-wide text-muted">{att.kind.toUpperCase()} · Result</p>
        <h1 className="text-2xl font-extrabold mt-1">{att.refTitle}</h1>
        <div className="text-6xl font-extrabold text-accent mt-6">{att.score} <span className="text-2xl text-muted">/ {att.total}</span></div>
        <div className="text-lg mt-2">{pct}% accuracy</div>

        <div className="grid grid-cols-4 gap-3 mt-8">
          <Cell label="Correct" value={att.correct} color="text-ok" bg="bg-emerald-50" />
          <Cell label="Wrong" value={att.wrong} color="text-bad" bg="bg-rose-50" />
          <Cell label="Skipped" value={att.skipped} color="text-muted" bg="bg-slate-50" />
          <Cell label="Time" value={Math.round(att.durationSec / 60) + "m"} color="text-brand" bg="bg-blue-50" />
        </div>

        <div className="mt-8 text-left">
          <h3 className="font-bold mb-3">Subject SWOT</h3>
          <div className="space-y-2">
            {Object.entries(breakdown).map(([k, v]) => {
              const p = v.total ? Math.round((v.scored / v.total) * 100) : 0;
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{k}</span><span className="font-semibold">{v.scored} / {v.total}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full" style={{
                      width: `${Math.max(2, p)}%`,
                      background: p >= 70 ? "var(--ok)" : p >= 40 ? "var(--accent)" : "var(--bad)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/dashboard" className="btn btn-primary">📊 Dashboard</Link>
          <Link href={att.kind === "pyq" ? "/pyq" : "/mocks"} className="btn btn-ghost">↻ Try another</Link>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}
