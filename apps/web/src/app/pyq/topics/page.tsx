import Link from "next/link";
import { PYQ } from "@/data/pyq";

export const metadata = { title: "PYP Topic-wise Browser — GATE MN 2014–2025" };

function slugify(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PyqTopicsIndex() {
  // Aggregate at build time (server component) — same shape as the API.
  const acc = new Map<string, { count: number; years: Set<number> }>();
  for (const paper of PYQ) {
    for (const q of paper.questions as unknown as { subject: string }[]) {
      const cur = acc.get(q.subject) ?? { count: 0, years: new Set<number>() };
      cur.count += 1;
      cur.years.add(paper.year);
      acc.set(q.subject, cur);
    }
  }
  const subjects = [...acc.entries()]
    .map(([subject, v]) => ({ subject, count: v.count, years: [...v.years].sort((a, b) => b - a) }))
    .sort((a, b) => b.count - a.count);
  const totalQs = subjects.reduce((s, x) => s + x.count, 0);

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3">
          💎 PREMIUM
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold">Topic-wise PYP Browser</h1>
        <p className="text-muted mt-3 max-w-2xl mx-auto">
          Every GATE MN question from 2014–2025 ({totalQs} questions, {PYQ.length} papers), grouped by subject.
          Browse every Ventilation Q since 2014. Filter by type (MCQ/MSQ/NAT) and marks.
        </p>
        <div className="mt-5 flex gap-2 justify-center">
          <Link href="/pyq" className="btn btn-ghost text-sm">← Back to PYQ papers</Link>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((s) => (
          <Link key={s.subject} href={`/pyq/topics/${slugify(s.subject)}`} className="card p-6 hover:shadow-md transition block">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold text-lg">{s.subject}</h2>
              <span className="badge badge-premium">💎</span>
            </div>
            <p className="text-3xl font-extrabold text-brand mt-3">{s.count}</p>
            <p className="text-xs text-muted">questions across {s.years.length} papers</p>
            <p className="text-xs text-muted mt-2 truncate">
              Years: {s.years.slice(0, 6).join(", ")}{s.years.length > 6 ? "…" : ""}
            </p>
            <div className="mt-4 text-brand text-sm font-semibold">Browse →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
