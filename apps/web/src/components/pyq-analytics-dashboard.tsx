"use client";

/**
 * PyqAnalyticsDashboard — interactive analytics over the GATE MN PYQ metadata
 * catalog. Pure client component: all data is imported statically and every
 * chart reacts to the shared filter bar. No question text is shown — only
 * factual exam metadata (year, type, marks, section, subtopic).
 */
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  PYQ_RECORDS, PYQ_SECTIONS, PYQ_YEARS, MIN_YEAR, MAX_YEAR,
  filterRecords, bySection, bySubtopic, countByYear, byYearSection,
  byType, byMarks, sectionTrends, gapsSince, prepPlan, quickStats, toCsv,
  syllabusCoverage,
  sectionShort, sectionColor, sectionTitle,
  type PyqFilter, type PyqType,
} from "@/data/pyq-analytics";

const ALL_SECTIONS = PYQ_SECTIONS.map((s) => s.id);
const SYLLABUS_SECTIONS = [1, 2, 3, 4, 5, 6];
const TYPES: PyqType[] = ["MCQ", "MSQ", "NAT"];

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`card p-5 ${className}`}>
      <h2 className="font-bold text-lg">{title}</h2>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function downloadCsv(csv: string, name: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function PyqAnalyticsDashboard() {
  const [yearLo, setYearLo] = useState(MIN_YEAR);
  const [yearHi, setYearHi] = useState(MAX_YEAR);
  const [sections, setSections] = useState<number[]>(SYLLABUS_SECTIONS);
  const [types, setTypes] = useState<PyqType[]>([...TYPES]);
  const [marks, setMarks] = useState<(1 | 2)[]>([1, 2]);
  const [distMode, setDistMode] = useState<"bar" | "pie">("bar");
  const [drillSection, setDrillSection] = useState<number>(3); // Geomechanics by default

  const filter: PyqFilter = useMemo(
    () => ({ yearRange: [Math.min(yearLo, yearHi), Math.max(yearLo, yearHi)], sections, types, marks }),
    [yearLo, yearHi, sections, types, marks],
  );

  const filtered = useMemo(() => filterRecords(PYQ_RECORDS, filter), [filter]);
  const secData = useMemo(() => bySection(filtered), [filtered]);
  const yearCounts = useMemo(() => countByYear(filtered), [filtered]);
  const yearStack = useMemo(() => byYearSection(filtered), [filtered]);
  const typeData = useMemo(() => byType(filtered), [filtered]);
  const markData = useMemo(() => byMarks(filtered), [filtered]);
  const drillData = useMemo(() => bySubtopic(filtered, drillSection).slice(0, 14), [filtered, drillSection]);
  const trends = useMemo(() => sectionTrends(filterRecords(PYQ_RECORDS, { ...filter, sections: SYLLABUS_SECTIONS })), [filter]);
  const gaps = useMemo(() => gapsSince(PYQ_RECORDS, 2020), []);
  const coverage = useMemo(() => syllabusCoverage(filtered), [filtered]);
  const prep = useMemo(() => prepPlan(filterRecords(PYQ_RECORDS, { ...filter, sections: SYLLABUS_SECTIONS })), [filter]);
  const stats = useMemo(() => quickStats(filterRecords(PYQ_RECORDS, { yearRange: filter.yearRange, excludeAptitude: true })), [filter]);

  const totalQ = filtered.length;
  const totalMarks = filtered.reduce((s, r) => s + r.marks, 0);

  function toggle<T>(arr: T[], v: T, set: (x: T[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  return (
    <div className="space-y-6">
      {/* ─────────────  Filter bar  ───────────── */}
      <div className="card p-5 sticky top-2 z-10">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Year range</label>
            <div className="flex items-center gap-2">
              <select value={yearLo} onChange={(e) => setYearLo(+e.target.value)} className="border border-line rounded-lg px-2 py-1.5 text-sm bg-surface text-ink">
                {PYQ_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="text-muted text-sm">to</span>
              <select value={yearHi} onChange={(e) => setYearHi(+e.target.value)} className="border border-line rounded-lg px-2 py-1.5 text-sm bg-surface text-ink">
                {PYQ_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Sections</label>
            <div className="flex flex-wrap gap-1.5">
              {PYQ_SECTIONS.filter((s) => s.id !== 0).map((s) => {
                const on = sections.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(sections, s.id, setSections)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${on ? "text-white border-transparent" : "text-muted border-line bg-surface hover:border-brand"}`}
                    style={on ? { backgroundColor: s.color } : undefined}
                  >
                    {s.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Type</label>
            <div className="flex gap-1.5">
              {TYPES.map((t) => {
                const on = types.includes(t);
                return (
                  <button key={t} onClick={() => toggle(types, t, setTypes)} className={`text-xs px-2.5 py-1 rounded-full border transition ${on ? "bg-brand text-white border-transparent" : "text-muted border-line bg-surface hover:border-brand"}`}>{t}</button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Marks</label>
            <div className="flex gap-1.5">
              {([1, 2] as (1 | 2)[]).map((mk) => {
                const on = marks.includes(mk);
                return (
                  <button key={mk} onClick={() => toggle(marks, mk, setMarks)} className={`text-xs px-2.5 py-1 rounded-full border transition ${on ? "bg-brand text-white border-transparent" : "text-muted border-line bg-surface hover:border-brand"}`}>{mk}-mark</button>
                );
              })}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-extrabold leading-none">{totalQ}</div>
              <div className="text-[11px] text-muted">questions · {totalMarks} marks</div>
            </div>
            <button onClick={() => downloadCsv(toCsv(filtered), `gate-mn-pyq-${filter.yearRange?.[0]}-${filter.yearRange?.[1]}.csv`)} className="btn btn-ghost text-sm whitespace-nowrap">⬇ CSV</button>
          </div>
        </div>
      </div>

      {/* ─────────────  ⓪ Full syllabus coverage  ───────────── */}
      <Card
        title="Full syllabus coverage"
        subtitle="Every official GATE MN section and sub-topic — including those not yet asked in any available paper. Counts respect the current year / type / marks filters."
      >
        <div className="space-y-5">
          {coverage.map((sec) => (
            <div key={sec.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                <h3 className="font-semibold text-sm">{sec.title}</h3>
                <span className="text-[11px] text-muted tabular-nums">
                  {sec.count} Qs · {sec.marks} marks · {sec.askedTopicCount}/{sec.topicCount} topics seen
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sec.topics.map((t) => (
                  <span
                    key={t.slug ?? t.title}
                    title={t.asked ? `${t.count} questions · ${t.marks} marks · last asked ${t.lastYear}` : "Not yet asked in an available PYQ"}
                    className={`text-xs px-2.5 py-1 rounded-full border tabular-nums ${
                      t.asked
                        ? "bg-surface border-line text-ink"
                        : "bg-canvas border-dashed border-line text-muted"
                    }`}
                  >
                    {t.title}
                    {t.asked ? (
                      <span className="ml-1.5 font-semibold" style={{ color: sec.color }}>{t.count}</span>
                    ) : (
                      <span className="ml-1.5 italic opacity-70">not yet asked</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ─────────────  ① Topic-wise distribution  ───────────── */}
      <Card
        title="① Topic-wise distribution"
        subtitle="How questions split across the six syllabus sections (and Other)."
      >
        <div className="flex justify-end mb-2">
          <div className="inline-flex rounded-lg border border-line overflow-hidden text-xs">
            <button onClick={() => setDistMode("bar")} className={`px-3 py-1 ${distMode === "bar" ? "bg-brand text-white" : "bg-surface text-muted"}`}>Bar</button>
            <button onClick={() => setDistMode("pie")} className={`px-3 py-1 ${distMode === "pie" ? "bg-brand text-white" : "bg-surface text-muted"}`}>Pie</button>
          </div>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer>
            {distMode === "bar" ? (
              <BarChart data={secData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(v: number, n) => [v, n === "count" ? "Questions" : n]} />
                <Bar dataKey="count" name="Questions" radius={[0, 4, 4, 0]}>
                  {secData.map((d) => <Cell key={d.key} fill={d.color} />)}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie data={secData} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={(e) => `${e.label} (${e.count})`} labelLine={false}>
                  {secData.map((d) => <Cell key={d.key} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ─────────────  ② Year-by-year breakdown  ───────────── */}
      <Card title="② Year-by-year breakdown" subtitle="Questions per paper, and marks contributed by each section.">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="w-full h-64">
            <ResponsiveContainer>
              <LineChart data={yearCounts} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Questions" stroke="var(--brand, #4f46e5)" strokeWidth={2} />
                <Line type="monotone" dataKey="marks" name="Marks" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={yearStack.rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                {yearStack.sections.map((s) => (
                  <Bar key={s} dataKey={sectionShort(s)} stackId="m" fill={sectionColor(s)} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th className="py-1.5 pr-3">Year</th>
                {yearStack.sections.map((s) => <th key={s} className="py-1.5 px-2 text-right">{sectionShort(s)}</th>)}
                <th className="py-1.5 pl-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {yearStack.rows.map((row) => (
                <tr key={row.year} className="border-b border-line/50">
                  <td className="py-1.5 pr-3 font-medium">{row.year}</td>
                  {yearStack.sections.map((s) => <td key={s} className="py-1.5 px-2 text-right tabular-nums">{row[sectionShort(s)] || "·"}</td>)}
                  <td className="py-1.5 pl-2 text-right font-bold tabular-nums">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─────────────  ③ Subtopic deep dive  ───────────── */}
      <Card title="③ Subtopic deep dive" subtitle="Drill into one section to see which sub-topics are tested most.">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SYLLABUS_SECTIONS.map((s) => (
            <button key={s} onClick={() => setDrillSection(s)} className={`text-xs px-2.5 py-1 rounded-full border transition ${drillSection === s ? "text-white border-transparent" : "text-muted border-line bg-surface hover:border-brand"}`} style={drillSection === s ? { backgroundColor: sectionColor(s) } : undefined}>{sectionShort(s)}</button>
          ))}
        </div>
        <div className="w-full" style={{ height: Math.max(220, drillData.length * 26) }}>
          <ResponsiveContainer>
            <BarChart data={drillData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={200} />
              <Tooltip />
              <Bar dataKey="count" name="Questions" fill={sectionColor(drillSection)} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {drillData.length === 0 && <p className="text-sm text-muted text-center py-6">No questions match the current filters for {sectionTitle(drillSection)}.</p>}
      </Card>

      {/* ─────────────  ④ Question-type analysis  ───────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="④ Question format (MCQ · MSQ · NAT)">
          <div className="w-full h-60">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={typeData} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label={(e) => `${e.label} ${Math.round((e.count / (totalQ || 1)) * 100)}%`} labelLine={false}>
                  {typeData.map((d) => <Cell key={d.key} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="1-mark vs 2-mark split">
          <div className="w-full h-60">
            <ResponsiveContainer>
              <BarChart data={markData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Questions" radius={[4, 4, 0, 0]}>
                  {markData.map((d) => <Cell key={d.key} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ─────────────  ⑦ Trend prediction  ───────────── */}
      <Card title="⑦ Trend prediction" subtitle="Per-section trajectory and a naive projection for the next paper (least-squares slope over the selected years).">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {trends.map((t) => (
            <div key={t.section} className="rounded-xl border border-line p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{t.label}</span>
                <span className={`text-xs font-bold ${t.direction === "rising" ? "text-emerald-600" : t.direction === "falling" ? "text-red-500" : "text-muted"}`}>
                  {t.direction === "rising" ? "▲ rising" : t.direction === "falling" ? "▼ falling" : "▬ steady"}
                </span>
              </div>
              <div className="flex items-end gap-3 mt-2">
                <div><div className="text-2xl font-extrabold leading-none" style={{ color: t.color }}>{t.projectedNext}</div><div className="text-[10px] text-muted">projected next</div></div>
                <div className="text-[11px] text-muted">avg {t.avgPerYear.toFixed(1)}/yr · {t.total} total</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ─────────────  ⑥ Personalised prep target  ───────────── */}
      <Card title="⑥ Personalised prep target" subtitle="Priority weights recent papers more heavily. 200 study-hours and ~600 practice questions split by priority.">
        <div className="space-y-2.5">
          {prep.map((p) => (
            <div key={p.section} className="flex items-center gap-3">
              <div className="w-36 shrink-0 text-sm font-medium">{p.label}</div>
              <div className="flex-1 h-6 rounded-full bg-canvas border border-line overflow-hidden">
                <div className="h-full rounded-full flex items-center justify-end pr-2 text-[10px] font-bold text-white" style={{ width: `${p.priority}%`, backgroundColor: p.color }}>{p.priority}</div>
              </div>
              <div className="w-44 shrink-0 text-right text-xs text-muted tabular-nums">
                <span className="font-semibold text-ink">{p.studyHours} h</span> · {p.practiceTarget} Qs · {Math.round(p.share * 100)}% marks
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ─────────────  ⑤ Conceptual gap analysis  ───────────── */}
      <Card title="⑤ Conceptual gap analysis" subtitle="Syllabus sub-topics that have not appeared in a paper since 2020 (lowest-hanging differentiators, or safe to deprioritise — your call).">
        {gaps.length === 0 ? (
          <p className="text-sm text-muted">Every mapped sub-topic has appeared since 2020.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {gaps.map((g) => (
              <li key={g.key} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                <span className="min-w-0 truncate">{g.label}</span>
                <span className="text-[11px] text-muted shrink-0">{g.lastYear ? `last ${g.lastYear}` : "never"}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ─────────────  Quick answers  ───────────── */}
      <Card title="Quick answers" subtitle="Headline stats derived from the current year range (syllabus questions only).">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <div className="font-semibold mb-1">Top-5 sub-topics by frequency</div>
            <ol className="list-decimal list-inside text-muted space-y-0.5">
              {stats.topSubtopics.map((t) => <li key={t.label}><span className="text-ink">{t.label}</span> — {t.count}</li>)}
            </ol>
          </div>
          <div className="space-y-2">
            <div><span className="font-semibold">Peak Geomechanics year:</span> <span className="text-muted">{stats.rockMechanicsPeakYear ? `${stats.rockMechanicsPeakYear.year} (${stats.rockMechanicsPeakYear.count} Qs)` : "—"}</span></div>
            <div><span className="font-semibold">Avg Maths questions / paper:</span> <span className="text-muted">{stats.avgMathPerYear}</span></div>
            <div><span className="font-semibold">Most-repeated type (last 5 papers):</span> <span className="text-muted">{stats.mostRepeatedTypeLast5 ? `${stats.mostRepeatedTypeLast5.type} (${stats.mostRepeatedTypeLast5.count})` : "—"}</span></div>
          </div>
          <div>
            <div className="font-semibold mb-1">Predominantly 2-mark sub-topics</div>
            <p className="text-muted">{stats.twoMarkDominant.length ? stats.twoMarkDominant.map((t) => t.label).join(", ") : "—"}</p>
          </div>
          <div>
            <div className="font-semibold mb-1">Predominantly 1-mark sub-topics</div>
            <p className="text-muted">{stats.oneMarkDominant.length ? stats.oneMarkDominant.map((t) => t.label).join(", ") : "—"}</p>
          </div>
        </div>
      </Card>

      <p className="text-xs text-muted text-center">
        Based on factual metadata from {PYQ_YEARS.length} GATE MN papers ({MIN_YEAR}–{MAX_YEAR}; 2015, 2016 &amp; 2023 papers unavailable). Question text is not reproduced. Sub-topic tags are auto-classified and approximate.
      </p>
    </div>
  );
}
