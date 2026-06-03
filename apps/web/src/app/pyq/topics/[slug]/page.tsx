"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Q = {
  year: number;
  subject: string;
  type: "MCQ" | "MSQ" | "NAT";
  marks: number;
  stem: string;
  options?: string[];
  answer: number | number[];
  tolerance?: number;
  solution: string;
};

type Resp = {
  subject: string;
  plan: string;
  isPremium: boolean;
  total: number;
  returned: number;
  capped: boolean;
  questions: Q[];
};

export default function PyqTopicPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [typeFilter,  setTypeFilter]  = useState<string>("");
  const [marksFilter, setMarksFilter] = useState<string>("");
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (typeFilter)  q.set("type", typeFilter);
    if (marksFilter) q.set("marks", marksFilter);
    fetch(`/api/pyq/topics/${slug}?${q}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [slug, typeFilter, marksFilter]);

  if (loading) return <div className="max-w-4xl mx-auto px-5 py-20 text-center text-muted">Loading…</div>;
  if (!data) return <div className="max-w-4xl mx-auto px-5 py-20 text-center text-bad">Failed to load.</div>;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <header className="mb-6">
        <Link href="/pyq/topics" className="text-sm text-muted hover:text-brand">← All subjects</Link>
        <h1 className="text-3xl font-extrabold mt-2">{data.subject}</h1>
        <p className="text-muted mt-1">
          Showing {data.returned} of {data.total} questions across all PYQ papers.
        </p>
      </header>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center text-sm">
        <span className="font-semibold">Filter:</span>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-line rounded px-2 py-1">
          <option value="">All types</option>
          <option value="MCQ">MCQ</option>
          <option value="MSQ">MSQ</option>
          <option value="NAT">NAT</option>
        </select>
        <select value={marksFilter} onChange={(e) => setMarksFilter(e.target.value)} className="border border-line rounded px-2 py-1">
          <option value="">All marks</option>
          <option value="1">1 mark</option>
          <option value="2">2 marks</option>
        </select>
        {(typeFilter || marksFilter) && (
          <button onClick={() => { setTypeFilter(""); setMarksFilter(""); }} className="text-brand hover:underline">Clear</button>
        )}
      </div>

      {/* Paywall */}
      {data.capped && (
        <div className="card p-5 mb-6 border-2 border-amber-400 bg-amber-50">
          <div className="font-bold text-amber-900">💎 Premium-only feature</div>
          <p className="text-sm text-amber-900 mt-1">
            You&apos;re seeing 5 of {data.total} questions. Upgrade to Premium to unlock the full topic-wise browser.
          </p>
          <Link href="/pricing" className="btn btn-accent mt-3 inline-block">Upgrade to Premium</Link>
        </div>
      )}

      {/* Questions */}
      <ol className="space-y-4">
        {data.questions.map((q, i) => (
          <li key={i} className="card p-5">
            <div className="flex justify-between text-xs text-muted mb-2">
              <span><b className="text-brand">GATE {q.year}</b> · {q.type} · {q.marks} mark{q.marks > 1 ? "s" : ""}</span>
            </div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: q.stem }} />
            {q.options && (
              <ol className="mt-3 space-y-1 text-sm" type="A">
                {q.options.map((o, oi) => (
                  <li key={oi} className={
                    revealed[i] && (Array.isArray(q.answer) ? q.answer.includes(oi + 1) : q.answer === oi + 1)
                      ? "text-ok font-semibold" : ""
                  }>{o}</li>
                ))}
              </ol>
            )}
            {q.type === "NAT" && revealed[i] && (
              <p className="mt-3 text-sm text-ok font-semibold">Answer: {q.answer}{q.tolerance ? ` (±${q.tolerance})` : ""}</p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
                className="btn btn-ghost text-xs"
              >{revealed[i] ? "Hide solution" : "Show solution"}</button>
            </div>
            {revealed[i] && (
              <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                <b>Solution:</b> {q.solution}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
