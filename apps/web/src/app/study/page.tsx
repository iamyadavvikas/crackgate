export const metadata = { title: "Study Material" };
export default function Study() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <h1 className="text-3xl font-extrabold">Study Material</h1>
      <p className="text-muted mt-2">Curated revision notes, formula sheets and recommended books for GATE MN.</p>
      <p className="mt-8 text-sm text-muted">Detailed material lives in the legacy static site at <a className="underline" href="/pages/study-material.html">/pages/study-material.html</a> until migration is complete.</p>
    </div>
  );
}
