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
  const totalQs = subjects.reduce((n, s) => n + s.questions.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <header className="mb-8">
        <Link href={`/gate/${subject}`} className="text-sm text-muted hover:text-ink">← {meta.label} home</Link>
        <h1 className="text-3xl lg:text-4xl font-extrabold mt-4">Subject-wise Practice</h1>
        <p className="text-muted mt-3 max-w-3xl">
          {totalQs}+ exam-grade questions across {subjects.length} {meta.code} subjects — every question is
          graded instantly with a worked solution. Choose difficulty and session length inside each subject.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
          <span><b className="text-ink">{subjects.length}</b> subjects</span>
          <span><b className="text-ink">{totalQs}+</b> questions</span>
          <span className="inline-flex items-center gap-1.5">
            {unlocked
              ? <><span className="text-ok">●</span> Your {meta.code} pass is active — everything unlocked</>
              : <><span className="text-amber-600">●</span> Premium unlocks every subject</>}
          </span>
        </div>
      </header>

      {!unlocked && (
        <div className="card p-6 mb-8 border-2 border-brand/40 bg-gradient-to-br from-brand/5 to-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="font-extrabold text-lg flex items-center gap-2">
                <span>🔒</span> Unlock the full {meta.code} question bank
              </div>
              <p className="text-sm text-muted mt-1.5 max-w-2xl">
                Subject-wise practice is a <b>premium</b> feature. Unlock once to get all {totalQs}+ questions
                across {subjects.length} subjects — with instant solutions — through GATE 2027.
              </p>
            </div>
            <Link href={payHref} className="btn btn-accent btn-lg shrink-0 self-start sm:self-auto">⭐ Unlock {meta.code}</Link>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((s) => {
          const easy = s.questions.filter((q) => q.difficulty === "easy").length;
          const med = s.questions.filter((q) => q.difficulty === "medium").length;
          const hard = s.questions.filter((q) => q.difficulty === "hard").length;
          return (
            <PracticeCard
              key={s.slug}
              href={`/gate/${subject}/practice/${s.slug}`}
              payHref={payHref}
              name={s.name}
              code={meta.code}
              count={s.questions.length}
              easy={easy}
              med={med}
              hard={hard}
              unlocked={unlocked}
            />
          );
        })}
      </div>
    </div>
  );
}

function PracticeCard({
  href, payHref, name, code, count, easy, med, hard, unlocked,
}: {
  href: string;
  payHref: string;
  name: string;
  code: string;
  count: number;
  easy: number;
  med: number;
  hard: number;
  unlocked: boolean;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className={`font-bold leading-snug ${unlocked ? "group-hover:text-brand" : ""}`}>
          {unlocked ? name : <span className="inline-flex items-center gap-1.5"><span aria-hidden>🔒</span>{name}</span>}
        </h3>
        {unlocked
          ? <span className="badge badge-free shrink-0">{count} Q</span>
          : <span className="badge badge-premium shrink-0">PREMIUM</span>}
      </div>

      <div className={`mt-4 pt-4 border-t border-line flex flex-wrap gap-x-3 gap-y-1 text-xs ${unlocked ? "text-muted" : "text-muted/60"}`}>
        <span className={unlocked ? "text-ok" : ""}>● {easy} easy</span>
        <span className={unlocked ? "text-amber-600" : ""}>● {med} med</span>
        <span className={unlocked ? "text-rose-600" : ""}>● {hard} hard</span>
      </div>

      <div className="mt-4">
        {unlocked ? (
          <span className="text-sm font-semibold text-brand inline-flex items-center gap-1 group-hover:gap-1.5 transition-[gap]">
            Start practice <span aria-hidden>→</span>
          </span>
        ) : (
          <span className="btn btn-accent w-full">⭐ Unlock {code}</span>
        )}
      </div>
    </>
  );

  if (unlocked) {
    return (
      <Link href={href} className="group card p-5 flex flex-col hover:border-brand hover:shadow-sm transition">
        {body}
      </Link>
    );
  }
  return (
    <Link href={payHref} className="group card p-5 flex flex-col opacity-90 hover:opacity-100 hover:border-brand/50 transition">
      {body}
    </Link>
  );
}
