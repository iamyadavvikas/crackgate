export const metadata = { title: "About" };
export default function About() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-16 text-ink">
      <h1 className="text-4xl font-extrabold tracking-tight">About CrackGate</h1>
      <p className="mt-4 text-lg text-ink/80 leading-relaxed">
        CrackGate is India&apos;s only test-prep platform built exclusively for GATE Mining Engineering (MN) aspirants.
        We exist because generic GATE coaching ignores the mining branch.
      </p>

      <h2 className="mt-10 text-2xl font-bold">What we do</h2>
      <ul className="mt-3 space-y-2 list-disc pl-6 text-ink/80 marker:text-muted">
        <li>10 full-length mock papers built on the GATE 2025 syllabus & pattern.</li>
        <li>NTA-style live exam portal — identical UX to the real CBT.</li>
        <li>Server-side grading + subject-wise SWOT analytics.</li>
      </ul>

      <h2 className="mt-10 text-2xl font-bold">Team</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Founder
          name="Vikas Yadav"
          role="Founder"
          credentials="M.Tech, IIT Kharagpur"
          blurb="Built CrackGate to give Mining Engineering aspirants the focused, branch-specific prep that generic GATE platforms don't offer."
        />
        <Founder
          name="Vishal Kumar"
          role="Co-founder"
          credentials="B.Tech, BIT Sindri · M.Tech, IIT Kharagpur"
          blurb="Working at Coal India Limited. Curates question banks and validates solutions against real industry practice."
        />
      </div>
    </article>
  );
}

function Founder({
  name,
  role,
  credentials,
  blurb,
}: {
  name: string;
  role: string;
  credentials: string;
  blurb: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="card p-5 flex gap-4">
      <div className="shrink-0 w-12 h-12 rounded-full bg-brand/10 text-brand grid place-items-center font-bold">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="font-bold text-ink">{name}</div>
        <div className="text-xs uppercase tracking-wider text-muted font-semibold">{role}</div>
        <div className="text-sm text-ink/80 mt-1">{credentials}</div>
        <p className="text-sm text-muted mt-2 leading-snug">{blurb}</p>
      </div>
    </div>
  );
}
