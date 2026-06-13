import Link from "next/link";
import { MathText } from "@/components/math-text";
import type { FormulaEntry, StudyNote, WorkedExample } from "@/data/study-notes";

/**
 * StudyNoteView — renders one premium revision note in its four high-yield
 * sections. Section 1 (Trend Analysis) always shows as a free teaser; sections
 * 2–4 render only when `unlocked` is true, otherwise an upsell card is shown.
 *
 * All surfaces use the theme tokens (card / bg-surface / border-line / text-ink
 * / text-muted) so the note stays readable in both light and dark mode.
 */
export function StudyNoteView({ note, unlocked }: { note: StudyNote; unlocked: boolean }) {
  return (
    <div className="space-y-6">
      {/* Section 1 — Recent Trend Analysis (always visible) */}
      <Section icon="📈" label="Section 1" title="Recent Trend Analysis (2017–2026)">
        <MathText className="cg-prose leading-relaxed">{note.trend}</MathText>
      </Section>

      {unlocked ? (
        <>
          {/* Section 2 — Master Formula Matrix & Derivations */}
          <Section icon="🧮" label="Section 2" title="Master Formula Matrix & Derivations">
            <div className="space-y-6">
              {note.formulaMatrix.map((f) => (
                <FormulaCard key={f.name} entry={f} />
              ))}
            </div>
          </Section>

          {/* Section 3 — The "IIT Trap" Warning System */}
          <Section icon="⚠️" label="Section 3" title='The "IIT Trap" Warning System'>
            <ul className="space-y-3">
              {note.traps.map((t, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-lg border border-amber-300/40 bg-amber-500/10 p-3.5 text-sm"
                >
                  <span aria-hidden className="shrink-0 text-amber-500">⚠</span>
                  <MathText className="cg-prose">{t}</MathText>
                </li>
              ))}
            </ul>
          </Section>

          {/* Section 4 — High-Fidelity Core Examples */}
          <Section icon="🧠" label="Section 4" title="High-Fidelity Core Examples">
            <div className="space-y-6">
              {note.examples.map((ex, i) => (
                <ExampleCard key={i} index={i + 1} example={ex} />
              ))}
            </div>
          </Section>
        </>
      ) : (
        <LockedUpsell tier={note.tier} />
      )}
    </div>
  );
}

/* ─── Section shell ───────────────────────────────────────────────────── */

function Section({
  icon, label, title, children,
}: {
  icon: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand/10 text-lg" aria-hidden>
          {icon}
        </span>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted font-semibold">{label}</div>
          <h2 className="text-lg font-extrabold leading-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

/* ─── Formula card + SI Variable Index table ──────────────────────────── */

function FormulaCard({ entry }: { entry: FormulaEntry }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/50 p-4">
      <h3 className="font-bold text-base">{entry.name}</h3>
      <MathText className="cg-prose text-sm text-muted mt-1.5 leading-relaxed">{entry.law}</MathText>

      <div className="mt-3 rounded-lg bg-surface border border-line p-3 overflow-x-auto">
        <MathText className="cg-solution">{entry.equation}</MathText>
      </div>

      {entry.shortcut && (
        <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
          <span className="font-semibold text-brand">⚡ Exam shortcut · </span>
          <MathText className="cg-prose inline-block align-top">{entry.shortcut}</MathText>
        </div>
      )}

      <div className="mt-3 overflow-x-auto">
        <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-1.5">
          Variable Index (SI units)
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="border border-line bg-canvas px-3 py-2 font-semibold w-16">Symbol</th>
              <th className="border border-line bg-canvas px-3 py-2 font-semibold">Meaning</th>
              <th className="border border-line bg-canvas px-3 py-2 font-semibold w-40">SI unit</th>
            </tr>
          </thead>
          <tbody>
            {entry.variables.map((v, i) => (
              <tr key={i}>
                <td className="border border-line px-3 py-2 align-top">
                  <MathText>{v.sym}</MathText>
                </td>
                <td className="border border-line px-3 py-2 align-top">
                  <MathText className="cg-prose">{v.meaning}</MathText>
                </td>
                <td className="border border-line px-3 py-2 align-top text-muted">
                  <MathText>{v.unit}</MathText>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Worked example card ─────────────────────────────────────────────── */

function ExampleCard({ index, example }: { index: number; example: WorkedExample }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="badge bg-brand/10 text-brand font-bold">Example {index}</span>
        <span className="text-[11px] text-muted">2-mark complexity</span>
      </div>

      <MathText className="cg-prose text-[15px] leading-relaxed font-medium">{example.prompt}</MathText>

      {/* Given Parameters Matrix */}
      <div className="mt-3 overflow-x-auto">
        <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-1.5">
          Given Parameters Matrix (clean SI)
        </div>
        <table className="w-full text-sm border-collapse">
          <tbody>
            {example.given.map((g, i) => (
              <tr key={i}>
                <td className="border border-line bg-canvas px-3 py-2 align-top w-1/2">
                  <MathText className="cg-prose">{g.label}</MathText>
                </td>
                <td className="border border-line px-3 py-2 align-top font-mono">
                  <MathText>{g.value}</MathText>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Algebraic Derivation Track */}
      <div className="mt-3 rounded-lg bg-surface border border-line p-3.5">
        <div className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-1.5">
          Algebraic Derivation Track
        </div>
        <MathText className="cg-solution leading-relaxed">{example.derivation}</MathText>
      </div>

      {/* Final Target Value & Rounding */}
      <div className="mt-3 rounded-lg border border-ok/40 bg-emerald-500/10 p-3.5 text-sm">
        <span className="font-semibold text-ok">🎯 Final target &amp; accepted range · </span>
        <MathText className="cg-prose inline-block align-top">{example.target}</MathText>
      </div>
    </div>
  );
}

/* ─── Locked upsell (gated sections) ──────────────────────────────────── */

function LockedUpsell({ tier }: { tier: StudyNote["tier"] }) {
  const requires = tier === "premium" ? "premium" : "pro";
  return (
    <section className="card p-8 text-center">
      <div className="text-4xl" aria-hidden>🔒</div>
      <h2 className="text-xl font-extrabold mt-3">Unlock the full note</h2>
      <p className="text-muted mt-2 max-w-md mx-auto">
        You&apos;ve read the free <b>Trend Analysis</b> teaser. The Master Formula Matrix,
        the IIT Trap Warning System and the worked Core Examples are part of the{" "}
        <b className="text-brand">{requires.toUpperCase()}</b> plan.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link href={`/pricing?gated=study&requires=${requires}`} className="btn btn-primary">
          Upgrade to {requires.toUpperCase()}
        </Link>
        <Link href="/study" className="btn btn-ghost">← All notes</Link>
      </div>
    </section>
  );
}
