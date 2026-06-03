import Link from "next/link";
import { PYQ } from "@/data/pyq";

export const metadata = {
  title: "Previous Year Papers — 12 Full GATE MN Papers (2014–2025)",
};

export default function PyqIndex() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <header className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-extrabold">GATE Mining Engineering — Previous Year Papers</h1>
        <p className="text-muted mt-3 max-w-2xl mx-auto">
          12 full GATE-pattern papers · 65 questions / 100 marks / 180 minutes each · NTA-style live exam portal · server-side grading.
        </p>
        <div className="mt-5">
          <Link href="/pyq/topics" className="btn btn-accent inline-flex items-center gap-2">
            💎 Browse by subject (topic-wise) →
          </Link>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PYQ.map((y) => {
          const total = y.questions.reduce((s: number, q: { marks: number }) => s + q.marks, 0);
          const isFree = y.year >= 2024;
          return (
            <div key={y.year} className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold">GATE {y.year}</h2>
                {isFree ? <span className="badge badge-pro">FREE</span> : <span className="badge">PRO</span>}
              </div>
              <p className="text-sm text-muted mt-2">
                {y.questions.length} questions · {total} marks · 180 min
              </p>
              <Link href={`/pyq/${y.year}`} className="btn btn-primary w-full mt-5">
                Start Paper →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
