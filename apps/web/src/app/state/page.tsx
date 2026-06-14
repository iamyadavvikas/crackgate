import { Metadata } from "next";

export const metadata: Metadata = { title: "State Level Exams · CrackGate" };

export default function StateExamsPage() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-24 text-center">
      <span className="badge bg-brand/10 text-brand">State Level Exams</span>
      <h1 className="mt-4 text-4xl font-extrabold text-ink">State-level exam prep.</h1>
      <p className="mt-4 text-lg text-muted">
        Preparation for state-level mining &amp; engineering recruitment — state PSCs, state mining boards and
        DGMS-linked roles. We&apos;re actively curating syllabi and question banks for these exams.
      </p>
    </section>
  );
}
