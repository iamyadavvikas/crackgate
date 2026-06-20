import Link from "next/link";
import { notFound } from "next/navigation";
import { getGateSubject } from "@/data/gate/registry";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) return { title: "Learn & Solve" };
  return { title: `Learn & Solve — GATE ${meta.code} Syllabus, Section by Section` };
}

export default async function SubjectLearnIndex(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) notFound();

  const syllabus = meta.getLearnSyllabus();
  const totalLive = syllabus.reduce((n, s) => n + s.liveCount, 0);

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <header className="mb-10">
        <Link href={`/gate/${subject}`} className="text-sm text-muted hover:text-ink">← {meta.label} home</Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold mb-3 mt-4">
          📚 LEARN &amp; SOLVE ENGINE
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold">The GATE {meta.code} Syllabus, Section by Section</h1>
        <p className="text-muted mt-3 max-w-3xl">
          Organised exactly like the official syllabus. Every live sub-topic opens an{" "}
          <b>IIT-style module</b>: the core principle, a complete <b>formula matrix</b>, the common{" "}
          <b>traps</b>, and a progressive <b>3-tier question suite</b> (basic → medium → hard) with
          worked solutions revealed on submit.
        </p>
        <p className="text-xs text-muted mt-3">
          {totalLive} sub-topic{totalLive === 1 ? "" : "s"} live · more added every week across all sections.
        </p>
      </header>

      <div className="space-y-10">
        {syllabus.map((sec) => (
          <section key={sec.id} className="card p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-brand/10 text-brand font-extrabold text-lg">
                {sec.id}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold">{sec.title}</h2>
                  <span className="text-[11px] text-muted">
                    {sec.liveCount}/{sec.subtopics.length} live
                  </span>
                </div>
                <p className="text-sm text-muted mt-0.5">{sec.summary}</p>
              </div>
            </div>

            <ul className="mt-5 grid sm:grid-cols-2 gap-2.5">
              {sec.subtopics.map((st) => {
                const topic = st.topic;
                if (!topic) {
                  return (
                    <li
                      key={st.title}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line bg-canvas/40 px-3 py-2.5"
                    >
                      <span className="text-sm text-muted">{st.title}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted/70 shrink-0">
                        Coming soon
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={st.title}>
                    <Link
                      href={`/gate/${subject}/learn/${topic.slug}`}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 hover:border-brand hover:shadow-sm transition"
                    >
                      <span className="min-w-0">
                        <span className="text-sm font-medium group-hover:text-brand">
                          {st.title}
                          <span className="text-[11px] text-muted font-normal ml-1.5">
                            · {topic.questions.length} Q
                          </span>
                        </span>
                        {st.highlight && (
                          <span className="block text-[11px] text-muted mt-0.5 truncate">
                            {st.highlight}
                          </span>
                        )}
                      </span>
                      <span className="badge badge-free shrink-0">FREE</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
