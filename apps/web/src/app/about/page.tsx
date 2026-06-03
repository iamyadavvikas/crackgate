export const metadata = { title: "About" };
export default function About() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto px-5 py-16">
      <h1>About CrackGate</h1>
      <p className="lead">
        CrackGate is India's only test-prep platform built exclusively for GATE Mining Engineering (MN) aspirants.
        We exist because generic GATE coaching ignores the mining branch.
      </p>
      <h2>What we do</h2>
      <ul>
        <li>12 years of full GATE-pattern PYQ papers (2014–2025) with worked solutions.</li>
        <li>10 full-length mock papers built on the GATE 2025 syllabus & pattern.</li>
        <li>NTA-style live exam portal — identical UX to the real CBT.</li>
        <li>Server-side grading + subject-wise SWOT analytics.</li>
      </ul>
      <h2>Who builds it</h2>
      <p>A small team of mining engineering grads + ex-IIT software engineers based in Bengaluru.</p>
    </article>
  );
}
