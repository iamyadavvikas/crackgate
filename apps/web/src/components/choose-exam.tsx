import Link from "next/link";

type ExamCard = {
  href: string;
  eyebrow: string;
  title: string;
  blurb: string;
  cta: string;
};

const EXAM_CARDS: ExamCard[] = [
  {
    href: "/gate/mining",
    eyebrow: "GATE",
    title: "Mining Engineering (MN)",
    blurb: "Full-length mocks, 900+ topic-wise practice questions, PYQ analytics and SWOT.",
    cta: "Explore GATE Mining",
  },
  {
    href: "/gate/civil",
    eyebrow: "GATE",
    title: "Civil Engineering (CE)",
    blurb: "20 full-length mocks, 600+ topic-wise practice questions, Learn & Solve modules and AITS.",
    cta: "Explore GATE Civil",
  },
  {
    href: "/psu/cil",
    eyebrow: "PSU",
    title: "Coal India (CIL) MT",
    blurb: "Discipline-wise 15-mock series for Civil, Electrical, Mechanical, System, E&T, Geology & IE.",
    cta: "Explore PSU · CIL",
  },
];

/**
 * Neutral dashboard state for a logged-in user who hasn't unlocked any track.
 * No exam-specific branding — just a prompt to pick an exam, which seeds their
 * personalised dashboard once they start (or unlock a track).
 */
export function ChooseExam({ firstName }: { firstName: string }) {
  return (
    <section className="max-w-3xl mx-auto text-center">
      <h1 className="text-2xl sm:text-3xl font-extrabold">
        Welcome, {firstName} 👋
      </h1>
      <p className="text-muted mt-2">
        Pick the exam you&apos;re preparing for to unlock your personalised dashboard —
        mocks, practice and analytics tuned to that track.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-8 text-left">
        {EXAM_CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card p-6 hover:border-brand hover:shadow-pop transition block"
          >
            <div className="text-xs font-bold uppercase tracking-wide text-brand">
              {c.eyebrow}
            </div>
            <h2 className="text-lg font-extrabold mt-1">{c.title}</h2>
            <p className="text-sm text-muted mt-2">{c.blurb}</p>
            <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-brand">
              {c.cta} →
            </span>
          </Link>
        ))}
      </div>

      <p className="text-xs text-muted mt-6">
        More tracks (GATE Geology &amp; State PSUs) are on the way.
      </p>
    </section>
  );
}
