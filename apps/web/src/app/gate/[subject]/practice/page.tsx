import Link from "next/link";
import { notFound } from "next/navigation";
import { getGateSubject } from "@/data/gate/registry";
import { auth } from "@/lib/auth";
import { hasEntitlement } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) return { title: "Practice" };
  return { title: `Practice — GATE ${meta.code}` };
}

export default async function SubjectPracticeIndex(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) notFound();

  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const unlocked = isAdmin || (uid ? await hasEntitlement(uid, meta.accessExam, meta.accessSubject) : false);

  // General Aptitude is shared across all subjects and lives in its own legacy
  // track — keep the per-subject practice page focused on technical subjects.
  const subjects = meta.practice.filter((s) => s.slug !== "general-aptitude");
  const payHref = `/pay/upi?plan=pro&exam=${meta.accessExam}&subject=${meta.accessSubject}`;

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <header className="mb-8">
        <Link href={`/gate/${subject}`} className="text-sm text-muted hover:text-ink">← {meta.label} home</Link>
        <h1 className="text-3xl lg:text-4xl font-extrabold mt-4">Subject-wise Practice</h1>
        <p className="text-muted mt-3 max-w-3xl">
          Topic-wise practice across {subjects.length} {meta.code} subjects — every question is graded
          instantly with a worked solution. Choose difficulty and session length inside each subject.
        </p>
      </header>

      {!unlocked && (
        <div className="card p-5 mb-8 border-2 border-brand/40 bg-brand/5">
          <div className="font-bold text-lg">🔒 Unlock the full {meta.code} question bank</div>
          <p className="text-sm text-muted mt-2">
            Subject-wise practice is part of the <b>GATE {meta.label}</b> pass. Unlock once to get the
            entire bank with instant solutions through GATE 2027.
          </p>
          <Link href={payHref} className="btn btn-primary mt-3 inline-flex">⭐ Unlock {meta.code}</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((s) => {
          const easy = s.questions.filter((q) => q.difficulty === "easy").length;
          const med = s.questions.filter((q) => q.difficulty === "medium").length;
          const hard = s.questions.filter((q) => q.difficulty === "hard").length;
          const href = unlocked ? `/gate/${subject}/practice/${s.slug}` : payHref;
          return (
            <Link
              key={s.slug}
              href={href}
              className={`group card p-5 flex flex-col hover:border-brand hover:shadow-sm transition ${unlocked ? "" : "opacity-75"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold leading-snug group-hover:text-brand">
                  {unlocked ? "" : "🔒 "}{s.name}
                </h3>
                <span className="badge badge-free shrink-0">{s.questions.length} Q</span>
              </div>
              <div className="mt-4 pt-4 border-t border-line flex gap-3 text-xs text-muted">
                <span className="text-ok">● {easy} easy</span>
                <span className="text-amber-600">● {med} med</span>
                <span className="text-rose-600">● {hard} hard</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
