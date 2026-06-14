import { CIL_PATTERN, CIL_PHASES, cilMocksByPhase, type CilMock } from "@/data/cil-mocks";

/**
 * Renders the 15-mock CIL Management Trainee prep series for a discipline,
 * grouped into three progressive phases. Mocks are "coming soon" placeholders;
 * each card carries a disabled Start Mock control until question banks ship.
 */
export function CilMockPlan({ discipline }: { discipline: string }) {
  return (
    <section className="max-w-7xl mx-auto px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">{discipline} — 15-Mock Test Series</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            A structured CIL Management Trainee plan in the official pattern:{" "}
            <b>{CIL_PATTERN.questions} MCQs · {CIL_PATTERN.durationMin / 60} hours</b> · Paper-I (Technical) + Paper-II (Aptitude &amp; GK).
            Work through the phases in order for the best score trajectory.
          </p>
        </div>
        <span className="badge badge-pro shrink-0">Launching soon</span>
      </div>

      <div className="mt-8 space-y-10">
        {CIL_PHASES.map((phase, idx) => (
          <div key={phase.id} className="rounded-2xl border border-line bg-canvas/40 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {idx + 1}
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink">{phase.label}</h3>
                <p className="mt-0.5 text-sm text-muted">{phase.blurb}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cilMocksByPhase(phase.id).map((m) => (
                <MockCard key={m.no} mock={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MockCard({ mock }: { mock: CilMock }) {
  return (
    <div className="card relative flex flex-col p-5 opacity-90">
      <span className="badge badge-pro absolute right-4 top-4">Coming soon</span>
      <div className="text-xs font-mono text-brand">Mock {String(mock.no).padStart(2, "0")}</div>
      <h4 className="mt-1 pr-20 font-bold text-ink leading-snug">{mock.title}</h4>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-md bg-canvas px-2 py-1">{mock.questions} Q</span>
        <span className="rounded-md bg-canvas px-2 py-1">{mock.durationMin} min</span>
      </div>

      <ul className="mt-3 space-y-1 text-xs text-muted">
        {mock.sections.map((s) => (
          <li key={s.name}>▸ {s.name} · {s.count} Q</li>
        ))}
      </ul>

      <button
        type="button"
        disabled
        aria-disabled
        title="Coming soon"
        className="btn btn-ghost mt-4 w-full cursor-not-allowed justify-center opacity-60"
      >
        Start Mock
      </button>
    </div>
  );
}
