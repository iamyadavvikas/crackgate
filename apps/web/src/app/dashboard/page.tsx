import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { fmtDate } from "@/lib/utils";
import { SubjectMasteryPanel } from "@/components/subject-mastery-panel";
import { ScoreTrendChart } from "@/components/score-trend-chart";
import { PercentilePanel } from "@/components/percentile-panel";
import { SwotAnalysisPanel } from "@/components/swot-analysis-panel";
import { EngagementStats } from "@/components/engagement-stats";
import { TimePerformanceChart } from "@/components/time-performance-chart";
import { DailyTargetRing } from "@/components/daily-target-ring";
import { Sparkline } from "@/components/sparkline";
import { InlineStreak } from "@/components/inline-streak";
import {
  buildSyllabusMap,
  nextBestActions,
  miniSwot,
  trendDelta,
  daysUntilGate,
  type SubjectMastery,
} from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const since90 = new Date(Date.now() - 90 * 86_400_000);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [attempts, activityCount, latest, practiceToday, practiceBySubject] = await Promise.all([
    db.attempt.findMany({
      where: { userId },
      orderBy: { takenAt: "desc" },
      take: 50,
    }),
    db.activity.count({ where: { userId } }),
    db.user.findUnique({ where: { id: userId } }),
    db.activity.count({
      where: { userId, type: "practice_attempt", ts: { gte: startOfToday } },
    }),
    db.activity.findMany({
      where: { userId, type: "practice_attempt", ts: { gte: since90 } },
      select: { payload: true, ts: true },
    }),
  ]);

  // ---------- Aggregations ----------
  const totalAttempts = attempts.length;
  const avgScore = totalAttempts
    ? Math.round(attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts
    ? Math.round(Math.max(...attempts.map((a) => (a.score / a.total) * 100)))
    : 0;

  const subjMap: Record<string, { scored: number; total: number }> = {};
  for (const a of attempts) {
    const b = (a.breakdown as Record<string, { scored: number; total: number }>) ?? {};
    for (const [k, v] of Object.entries(b)) {
      subjMap[k] ??= { scored: 0, total: 0 };
      subjMap[k].scored += v.scored;
      subjMap[k].total += v.total;
    }
  }

  const practiceCounts: Record<string, number> = {};
  let questionsToday = practiceToday;
  for (const row of practiceBySubject) {
    const p = (row.payload as { subject?: string } | null) ?? {};
    const slug = (p.subject ?? "").toString().toLowerCase().replace(/\s+/g, "-");
    if (slug) practiceCounts[slug] = (practiceCounts[slug] ?? 0) + 1;
  }
  for (const a of attempts) {
    if (a.takenAt >= startOfToday) questionsToday += a.total;
  }

  const syllabus = buildSyllabusMap(subjMap, practiceCounts);

  const attemptedMockIds = new Set(attempts.filter((a) => a.kind === "mock").map((a) => a.refId));
  const attemptedPyqYears = new Set(
    attempts
      .filter((a) => a.kind === "pyq")
      .map((a) => Number(a.refId.replace(/[^0-9]/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0),
  );
  const actions = nextBestActions(attemptedMockIds, attemptedPyqYears, syllabus);
  const swot = miniSwot(syllabus);
  const delta = trendDelta(attempts.map((a) => ({ takenAt: a.takenAt, score: a.score, total: a.total })));

  const trendPoints = [...attempts]
    .reverse()
    .slice(-12)
    .map((a) => (a.total ? Math.round((a.score / a.total) * 100) : 0));

  const planLabel = (latest?.plan ?? "free").toString().toUpperCase();
  const firstName = latest?.name?.split(" ")[0] ?? "Aspirant";
  const gateDays = daysUntilGate();

  const lastMockAttempt = attempts.find((a) => a.kind === "mock");
  const continueCard = totalAttempts === 0
    ? { href: "/mocks/mn-mock-01", title: "Start with Mock 01", subtitle: "Free · 65 Q · 3 hours · full GATE pattern", cta: "Begin first mock" }
    : lastMockAttempt
      ? { href: `/mocks/${lastMockAttempt.refId}`, title: `Resume ${lastMockAttempt.refTitle}`, subtitle: `Last attempted ${fmtDate(lastMockAttempt.takenAt)} · scored ${Math.round((lastMockAttempt.score / lastMockAttempt.total) * 100)}%`, cta: "Reopen" }
      : { href: "/practice", title: "Continue practising", subtitle: `${activityCount} sessions logged`, cta: "Open practice" };

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">
      {/* ────────── Top rail ────────── */}
      <section className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-line">
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="inline-flex items-center gap-1.5 font-bold">
            <span className="text-lg">👋</span>{firstName}
          </span>
          <span className="text-muted">·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-base">📅</span>
            <span className="font-semibold">{gateDays}</span>
            <span className="text-muted">days to GATE 2027</span>
          </span>
          <span className="text-muted hidden sm:inline">·</span>
          <InlineStreak />
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${planLabel === "FREE" ? "" : "badge-pro"}`}>{planLabel}</span>
          {planLabel === "FREE" && (
            <Link href="/pricing" className="text-xs font-semibold text-brand hover:underline">Upgrade →</Link>
          )}
          <Link href="/profile" className="btn btn-ghost btn-sm" aria-label="Settings">⚙</Link>
        </div>
      </section>

      {/* ────────── Hero: Continue + Today's target ────────── */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mt-6">
        <Link
          href={continueCard.href}
          className="rounded-2xl p-7 relative overflow-hidden group hover:shadow-lg transition block"
          style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)" }}
        >
          <div className="relative z-10 text-white">
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">
              {totalAttempts === 0 ? "Start here" : "Pick up where you left off"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 leading-tight">{continueCard.title}</h2>
            <p className="text-sm text-white/85 mt-2">{continueCard.subtitle}</p>
            <span className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-white text-[color:var(--brand)] rounded-lg font-bold text-sm group-hover:gap-3 transition-all">
              ▶ {continueCard.cta}
            </span>
          </div>
          <div aria-hidden className="absolute -right-8 -bottom-8 text-[180px] opacity-15 select-none">⛏️</div>
        </Link>

        <DailyTargetRing done={questionsToday} />
      </section>

      {/* ────────── Next best actions ────────── */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold">📍 Next best actions</h2>
          <span className="text-xs text-muted">Picked for you</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <ActionCard
            href={`/mocks/${actions.recommendedMockId}`}
            icon="📝"
            tag={attemptedMockIds.has(actions.recommendedMockId) ? "Retry" : "Recommended"}
            title={actions.recommendedMockTitle.replace(/^Mock Test \d+\s*[—-]\s*/, "")}
            sub="65 Q · 3 hours · GATE pattern"
          />
          {actions.weakestSubject ? (
            <ActionCard
              href={`/practice/${actions.weakestSubject.slug}`}
              icon="🧠"
              tag="Weak area"
              title={actions.weakestSubject.name}
              sub={`Current accuracy ${actions.weakestSubject.accuracy}% · drill 10 Qs`}
              tone="bad"
            />
          ) : (
            <ActionCard href="/practice" icon="🎯" tag="Explore" title="Browse practice bank" sub="906 Qs across 10 subjects" />
          )}
          {actions.nextPyqYear ? (
            <ActionCard
              href={`/pyq/${actions.nextPyqYear}`}
              icon="📚"
              tag={attemptedPyqYears.has(actions.nextPyqYear) ? "Re-attempt" : "Not started"}
              title={`GATE ${actions.nextPyqYear} paper`}
              sub="Full 65-Q PYQ · 3 hours"
            />
          ) : (
            <ActionCard href="/pyq" icon="📚" tag="Browse" title="All PYQ papers" sub="12 years · 2014–2025" />
          )}
          <ActionCard
            href="/practice?mode=daily10"
            icon="🔥"
            tag="Quick win"
            title="Daily 10"
            sub="Mixed quiz · ~7 minutes"
            tone="accent"
          />
        </div>
      </section>

      {/* ────────── Syllabus map + Your Edge ────────── */}
      <section className="grid lg:grid-cols-[2fr_1fr] gap-5 mt-8">
        <div className="card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-extrabold">🗺 Syllabus map</h2>
            <span className="text-xs text-muted">Tap a subject to practise</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
            {syllabus.map((s) => <SyllabusTile key={s.slug} s={s} />)}
          </div>
        </div>

        <aside className="card p-6">
          <h2 className="text-lg font-extrabold">💪 Your edge</h2>
          {swot.strengths.length === 0 && swot.weaknesses.length === 0 ? (
            <p className="text-sm text-muted mt-3">Take one mock or PYQ to see your strongest and weakest subjects.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-ok font-semibold">Strengths</div>
                {swot.strengths.length === 0 && <div className="text-sm text-muted mt-2">—</div>}
                <ul className="mt-2 space-y-1.5 text-sm">
                  {swot.strengths.map((s) => (
                    <li key={s.name} className="flex justify-between gap-2">
                      <span className="truncate">{s.name}</span>
                      <span className="font-semibold text-ok shrink-0">{s.accuracy}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-bad font-semibold">Focus on</div>
                {swot.weaknesses.length === 0 && <div className="text-sm text-muted mt-2">—</div>}
                <ul className="mt-2 space-y-1.5 text-sm">
                  {swot.weaknesses.map((s) => (
                    <li key={s.name} className="flex justify-between gap-2">
                      <span className="truncate">{s.name}</span>
                      <span className="font-semibold text-bad shrink-0">{s.accuracy}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {delta && (
            <div className="mt-5 pt-5 border-t border-line">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted">7-day trend</div>
                  <div className="text-2xl font-extrabold mt-0.5">
                    {delta.thisWeekAvg}%
                    <span className={`text-sm font-semibold ml-2 ${delta.delta >= 0 ? "text-ok" : "text-bad"}`}>
                      {delta.delta >= 0 ? "▲" : "▼"} {Math.abs(delta.delta)} pts
                    </span>
                  </div>
                </div>
                <Sparkline values={trendPoints} />
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* ────────── Detailed analytics (collapsed by default) ────────── */}
      <details className="mt-8 group">
        <summary className="cursor-pointer flex items-center justify-between p-4 rounded-xl border border-line hover:bg-slate-50 list-none">
          <div className="flex items-center gap-3">
            <span className="text-lg">📊</span>
            <div>
              <div className="font-bold">Detailed analytics</div>
              <p className="text-xs text-muted">Full SWOT 2×2 · score trend · percentile · peak hours · recent attempts</p>
            </div>
          </div>
          <span className="text-muted text-sm group-open:rotate-180 transition-transform">▼</span>
        </summary>

        <div className="mt-6 space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Attempts" value={totalAttempts} icon="🧪" />
            <StatCard label="Avg Score" value={`${avgScore}%`} icon="📈" />
            <StatCard label="Best Score" value={`${bestScore}%`} icon="🏆" />
            <StatCard label="Activity events" value={activityCount} icon="⚡" />
          </div>

          <EngagementStats />
          <SwotAnalysisPanel />

          <div className="card p-6">
            <div className="flex justify-between items-end flex-wrap gap-2">
              <div>
                <h2 className="font-bold text-lg">Score trend</h2>
                <p className="text-sm text-muted">Mock + PYQ accuracy over time, with running average.</p>
              </div>
              <span className="text-xs text-muted">Last {Math.min(attempts.length, 50)} attempts</span>
            </div>
            <div className="mt-4">
              <ScoreTrendChart data={[...attempts].reverse().map((a) => ({
                date: fmtDate(a.takenAt),
                pct: a.total ? Math.round((a.score / a.total) * 100) : 0,
                score: a.score,
                total: a.total,
                title: a.refTitle,
              }))} />
            </div>
          </div>

          <SubjectMasteryPanel />
          <PercentilePanel />
          <TimePerformanceChart />

          <div className="card p-6 overflow-x-auto">
            <h2 className="font-bold text-lg">Recent attempts</h2>
            <table className="w-full text-sm mt-4">
              <thead className="text-muted text-left border-b border-line">
                <tr>
                  <th className="py-2">Paper</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Accuracy</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.slice(0, 20).map((a) => {
                  const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
                  return (
                    <tr key={a.id} className="border-b border-line/60">
                      <td className="py-2.5 font-medium">{a.refTitle}</td>
                      <td className="py-2.5"><span className="badge">{a.kind.toUpperCase()}</span></td>
                      <td className="py-2.5">{a.score} / {a.total}</td>
                      <td className="py-2.5">
                        <span className={pct >= 60 ? "text-ok" : pct >= 40 ? "text-accent" : "text-bad"}>{pct}%</span>
                      </td>
                      <td className="py-2.5 text-muted">{fmtDate(a.takenAt)}</td>
                    </tr>
                  );
                })}
                {attempts.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-sm text-muted">No attempts yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
}

// ────────── small server components ──────────

function SyllabusTile({ s }: { s: SubjectMastery }) {
  const dots = 5;
  const filled = s.attempted === 0 ? 0 : Math.max(1, Math.round((s.accuracy / 100) * dots));
  const tone =
    s.status === "strong" ? "var(--ok)" :
    s.status === "ok"     ? "var(--accent)" :
    s.status === "weak"   ? "var(--bad)" : "rgb(148,163,184)";
  return (
    <Link
      href={`/practice/${s.slug}`}
      className="rounded-xl border border-line p-3.5 hover:border-brand hover:shadow-sm transition block"
    >
      <div className="text-sm font-bold leading-tight line-clamp-2 min-h-[2.5rem]">{s.name}</div>
      <div className="flex gap-1 mt-2.5">
        {Array.from({ length: dots }).map((_, i) => (
          <span
            key={i}
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: i < filled ? tone : "rgb(226,232,240)" }}
          />
        ))}
      </div>
      <div className="text-xs text-muted mt-2">
        {s.attempted === 0
          ? <span>Not started</span>
          : <span><span className="font-semibold" style={{ color: tone }}>{s.accuracy}%</span> · {s.attempted} Qs</span>}
      </div>
    </Link>
  );
}

function ActionCard({
  href, icon, tag, title, sub, tone = "brand",
}: { href: string; icon: string; tag: string; title: string; sub: string; tone?: "brand" | "accent" | "bad" }) {
  const tagColor = tone === "bad" ? "text-bad" : tone === "accent" ? "text-accent" : "text-brand";
  return (
    <Link href={href} className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition block group">
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${tagColor}`}>{tag}</span>
      </div>
      <div className="font-bold mt-3 leading-tight line-clamp-2">{title}</div>
      <p className="text-xs text-muted mt-1.5">{sub}</p>
      <span className="text-xs font-semibold text-brand mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
        Start <span>→</span>
      </span>
    </Link>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="card p-5">
      <div className="text-2xl">{icon}</div>
      <div className="text-3xl font-extrabold mt-2">{value}</div>
      <div className="text-sm text-muted mt-0.5">{label}</div>
    </div>
  );
}
