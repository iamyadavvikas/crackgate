import { notFound, redirect } from "next/navigation";
import { MOCKS } from "@/data/mocks";
import { ExamPortal } from "@/components/exam-portal";
import { auth } from "@/lib/auth";

type Plan = "free" | "pro" | "premium";
type Tier = "free" | "subject" | "premium";

function canAccess(tier: Tier, plan: Plan): boolean {
  if (tier === "free") return true;
  if (tier === "subject") return plan === "pro" || plan === "premium";
  return plan === "premium";
}

export default async function MockPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const m = MOCKS.find((x) => x.id === id) as
    | { id: string; title: string; tier: Tier; duration?: number; questions: unknown[] }
    | undefined;
  if (!m) notFound();

  // Server-side plan gate: don't let a free user spend an hour on a premium
  // mock just to be 402'd at submission. Middleware already enforces auth.
  const session = await auth();
  const plan = ((session?.user as { plan?: Plan } | undefined)?.plan) ?? "free";
  if (!canAccess(m.tier, plan)) {
    const required = m.tier === "premium" ? "premium" : "pro";
    redirect(`/pricing?gated=${m.id}&requires=${required}`);
  }

  return (
    <ExamPortal
      kind="mock"
      refId={m.id}
      title={m.title}
      questions={m.questions as never}
      durationSec={(m.duration ?? 180) * 60}
    />
  );
}

export function generateStaticParams() {
  return MOCKS.map((m) => ({ id: m.id }));
}
