export const metadata = { title: "FAQ" };
const QAs = [
  { q: "Is CrackGate only for GATE Mining?",       a: "Yes — we don't dilute focus. Every mock and PYQ is for the GATE MN paper." },
  { q: "Is the first mock really free?",            a: "Yes. Sign in with Google and Mock 01 + GATE 2024/2025 PYQs are unlocked." },
  { q: "How is scoring done?",                      a: "Server-side. MCQ: +marks / −marks/3. NAT: ±tolerance, no negative. MSQ: all-or-nothing, no negative." },
  { q: "Will my progress sync across devices?",     a: "Yes. Once you sign in, all your attempts and analytics live in our database." },
  { q: "Can I get a refund?",                       a: "Yes — within 7 days if you've attempted ≤ 1 paid paper. See refund policy." },
];
export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <h1 className="text-3xl font-extrabold">Frequently asked questions</h1>
      <div className="mt-8 space-y-3">
        {QAs.map((x) => (
          <details key={x.q} className="card p-5">
            <summary className="font-semibold cursor-pointer">{x.q}</summary>
            <p className="text-sm text-muted mt-3">{x.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
