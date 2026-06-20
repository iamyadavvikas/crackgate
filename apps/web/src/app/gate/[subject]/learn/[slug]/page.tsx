import Link from "next/link";
import { notFound } from "next/navigation";
import { getGateSubject } from "@/data/gate/registry";
import { LearnEngine } from "@/components/learn-engine";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ subject: string; slug: string }> }) {
  const { subject, slug } = await props.params;
  const meta = getGateSubject(subject);
  const t = meta?.getLearnTopic(slug);
  if (!t) return { title: "Learn & Solve" };
  return { title: `${t.title} — Learn & Solve`, description: t.blurb };
}

export default async function SubjectLearnTopicPage(
  props: { params: Promise<{ subject: string; slug: string }> },
) {
  const { subject, slug } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) notFound();
  const topic = meta.getLearnTopic(slug);
  if (!topic) notFound();

  // Learn modules are free for everyone — no plan or login required.
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="mb-6">
        <Link href={`/gate/${subject}/learn`} className="text-sm text-muted hover:text-ink">← All topics</Link>
        <div className="text-xs text-muted mt-3">{topic.subject}</div>
        <h1 className="text-2xl lg:text-3xl font-extrabold mt-0.5">{topic.title}</h1>
        <p className="text-muted mt-2">{topic.blurb}</p>
      </div>

      <LearnEngine topic={topic} />
    </div>
  );
}
