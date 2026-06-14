import Link from "next/link";
import { CIL_ROWS, CIL_RECRUITMENT_URL } from "@/data/cil";
import { CIL_PATTERN } from "@/data/cil-mocks";
import { CilAdBanner } from "@/components/cil-ad-banner";

export const metadata = { title: "PSU · Coal India Limited (CIL) · CrackGate" };

export default function PsuCilPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-5 py-16 lg:py-24">
          <span className="badge border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
            PSU Recruitment · Coal India Limited
          </span>
          <h1 className="mt-4 text-4xl lg:text-6xl font-extrabold leading-[1.05]">
            Coal India Limited
            <span className="block text-cyan-300">Management Trainee</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            Maximize your rank for MT positions. Discipline-wise mock series targeting mining legislation,
            DGMS safety guidelines and historical PSU weightage matrices.
          </p>

          {/* pattern strip */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Stat value={`${CIL_PATTERN.questions}`} label="MCQs" />
            <Stat value={`${CIL_PATTERN.durationMin / 60} hrs`} label="Duration" />
            <Stat value="2" label="Papers (Tech + Aptitude)" />
            <Stat value="15" label="Mocks / discipline" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={CIL_RECRUITMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cg-neon inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-cyan-400/10 px-6 py-3.5 text-base font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
            >
              View Official Notification <span aria-hidden>↗</span>
            </a>
            <a href="#disciplines" className="btn bg-white/10 text-white border border-white/25 hover:bg-white/20 btn-lg">
              Choose your discipline
            </a>
          </div>
        </div>
      </section>

      {/* DISCIPLINE CARDS */}
      <section id="disciplines" className="max-w-7xl mx-auto px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">Eligibility &amp; mock series by discipline</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Pick your discipline to open its dedicated <b>15-mock CIL series</b> in the official{" "}
              {CIL_PATTERN.questions} Q · {CIL_PATTERN.durationMin / 60} hr pattern.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CIL_ROWS.map((r) => (
            <Link
              key={r.code}
              href={`/psu/cil/${r.slug}`}
              className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-pop"
            >
              <div className="flex items-center justify-between">
                <span className="badge bg-cyan-400/15 text-cyan-700 dark:text-cyan-300">Post Code {r.code}</span>
                <span className="badge badge-pro">15 mocks</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{r.discipline}</h3>
              <p className="mt-2 flex-1 text-sm text-muted leading-snug">{r.qualification}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Open mock series <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CilAdBanner className="pb-16" />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}
