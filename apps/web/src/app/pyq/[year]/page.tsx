import { notFound, redirect } from "next/navigation";
import { PYQ } from "@/data/pyq";
import { ExamPortal } from "@/components/exam-portal";
import { auth } from "@/lib/auth";

const FREE_YEARS = new Set([2024, 2025]);

export default async function PyqYearPage(props: { params: Promise<{ year: string }> }) {
  const { year } = await props.params;
  const paper = PYQ.find((p) => String(p.year) === year);
  if (!paper) notFound();

  // Server-side plan gate: free users can only open the 2 most recent papers.
  const session = await auth();
  const plan = ((session?.user as { plan?: string } | undefined)?.plan) ?? "free";
  if (plan === "free" && !FREE_YEARS.has(paper.year)) {
    redirect(`/pricing?gated=pyq-${year}&requires=pro`);
  }

  return (
    <ExamPortal
      kind="pyq"
      refId={`pyq-${year}`}
      title={`GATE ${year} — Full Paper`}
      questions={paper.questions as never}
      durationSec={180 * 60}
    />
  );
}

export function generateStaticParams() {
  return PYQ.map((p) => ({ year: String(p.year) }));
}
