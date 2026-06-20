import Link from "next/link";
import { notFound } from "next/navigation";
import { getGateSubject, KNOWN_COMING_SOON } from "@/data/gate/registry";
import { TrackHub, GATE_MODULES } from "@/components/track-hub";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (meta) return { title: `GATE ${meta.label} (${meta.code}) · CrackGate` };
  const label = subject.charAt(0).toUpperCase() + subject.slice(1);
  return { title: `GATE ${label} · CrackGate` };
}

export default async function GateSubjectHome(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);

  // Coming-soon subjects render the dimmed discipline hub.
  if (!meta) {
    if (!KNOWN_COMING_SOON.has(subject)) notFound();
    const label = subject.charAt(0).toUpperCase() + subject.slice(1);
    return (
      <TrackHub
        discipline={`${label} (${subject === "geology" ? "GG" : "ES"})`}
        tagline={`Full GATE ${label} preparation is being authored right now — learn, practice, mocks and AITS, all in one place.`}
        live={false}
        modules={GATE_MODULES}
      />
    );
  }

  // Live subject home — stats + module cards.
  const practiceQs = meta.practice.reduce((s, sub) => s + sub.questions.length, 0);
  const subjectsCount = meta.practice.length;
  const mocksCount = meta.mocks.length;
  const learnCount = meta.learnTopics.length;
  const aitsCount = meta.aits.length;

  const modules = [
    { href: `/gate/${subject}/learn`, icon: "📚", title: "Learn & Solve", desc: `${learnCount} topic-wise modules with formula matrices, traps and worked 3-tier question suites.` },
    { href: `/gate/${subject}/practice`, icon: "✍️", title: "Practice", desc: `${practiceQs}+ exam-grade questions across ${subjectsCount} subjects, instantly graded with solutions.` },
    { href: `/gate/${subject}/mocks`, icon: "🧪", title: "Mock Tests", desc: `${mocksCount} full-length papers on the official GATE pattern — 65 Q · 100 marks · 3 hours.` },
    { href: `/gate/${subject}/aits`, icon: "💎", title: "All India Test Series", desc: `${aitsCount} scheduled tests with All-India percentile rankings.` },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-2 text-white">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-5 py-16 lg:py-24">
          <span className="badge bg-white/10 text-amber-300 border border-amber-300/30">
            GATE 2027 · {meta.code}
          </span>
          <h1 className="mt-4 text-4xl lg:text-6xl font-extrabold leading-[1.05]">
            GATE {meta.label}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">{meta.blurb}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/gate/${subject}/mocks`} className="btn btn-accent btn-lg">Start free mock →</Link>
            <Link href={`/gate/${subject}/practice`} className="btn bg-white/10 text-white border border-white/25 hover:bg-white/20 btn-lg">
              Practice questions
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
            <span><b className="text-white text-lg">{practiceQs}+</b> practice questions</span>
            <span><b className="text-white text-lg">{mocksCount}</b> full-length mocks</span>
            <span><b className="text-white text-lg">{learnCount}</b> learn modules</span>
            <span><b className="text-white text-lg">{aitsCount}</b> AITS tests</span>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="max-w-7xl mx-auto px-5 py-16 lg:py-20">
        <h2 className="text-3xl font-extrabold text-center">Your complete GATE {meta.code} track.</h2>
        <p className="mt-3 text-muted text-center max-w-2xl mx-auto">
          Everything is built specifically for {meta.label} — no generic padding. Every question is
          auto-graded with a detailed solution.
        </p>
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group card p-6 flex items-start gap-4 hover:border-brand hover:shadow-sm transition"
            >
              <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-brand/10 text-2xl">{m.icon}</div>
              <div>
                <h3 className="font-bold group-hover:text-brand">{m.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{m.desc}</p>
              </div>
              <span className="ml-auto text-brand text-xl shrink-0 group-hover:translate-x-0.5 transition">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-3xl font-extrabold">Start your free mock now.</h2>
          <p className="mt-3 text-slate-300">No credit card. Takes 5 seconds with Google.</p>
          <Link href="/login" className="btn btn-accent btn-lg mt-6 inline-flex">Continue with Google →</Link>
        </div>
      </section>
    </>
  );
}
