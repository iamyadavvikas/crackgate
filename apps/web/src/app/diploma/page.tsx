import { Metadata } from "next";

export const metadata: Metadata = { title: "Diploma Level Exams · CrackGate" };

export default function DiplomaExamsPage() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-24 text-center">
      <span className="badge bg-brand/10 text-brand">Diploma Level Exams</span>
      <h1 className="mt-4 text-4xl font-extrabold text-ink">Diploma exam prep.</h1>
      <p className="mt-4 text-lg text-muted">
        Preparation for diploma-level mining &amp; engineering recruitment — polytechnic boards, DGMS competency
        certificates and junior-level technical roles. We&apos;re actively curating syllabi and question banks
        for these exams.
      </p>
    </section>
  );
}
