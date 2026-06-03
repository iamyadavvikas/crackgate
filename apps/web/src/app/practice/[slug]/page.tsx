import { notFound } from "next/navigation";
import { PRACTICE } from "@/data/practice";
import { PracticeRunner } from "@/components/practice-runner";

export default async function PracticeSubjectPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const s = PRACTICE.find((x) => x.slug === slug);
  if (!s) notFound();
  return <PracticeRunner slug={s.slug} name={s.name} />;
}

export function generateStaticParams() {
  return PRACTICE.map((s) => ({ slug: s.slug }));
}
