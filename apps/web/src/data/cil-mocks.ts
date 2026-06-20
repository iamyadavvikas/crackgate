// CIL Management Trainee mock-test plan.
//
// CIL MT is a single 3-hour CBT of 200 MCQs with NO negative marking, split
// into two papers taken in one window:
//   • Paper-I  · Non-Technical (100 Q): General Awareness, Numerical Ability,
//                Reasoning, General English — 25 questions each.
//   • Paper-II · Professional Knowledge (100 Q): the candidate's discipline.
//
// We model a 10 full-length mock series per discipline. Each set mirrors the
// real exam exactly (200 Q · 3 h · 1 mark each · no negative marking). Cards
// are "coming-soon" until the question bank for that set is wired in.

export const CIL_PATTERN = {
  questions: 200,
  durationMin: 180,
  marks: 200,
  negativeMarking: false,
  papers: [
    {
      name: "Paper-I · Non-Technical",
      desc: "General Awareness · Numerical Ability · Reasoning · General English",
    },
    {
      name: "Paper-II · Professional Knowledge",
      desc: "Discipline-specific technical paper",
    },
  ],
} as const;

export type CilMockStatus = "coming-soon" | "live";

export type CilMockSection = { name: string; count: number };

export type CilMock = {
  no: number;
  title: string;
  questions: number;
  durationMin: number;
  sections: CilMockSection[];
  status: CilMockStatus;
};

/** Section layout shared by every full-length CIL MT set. */
export const CIL_FULL_SECTIONS: CilMockSection[] = [
  { name: "Paper-I · General Awareness", count: 25 },
  { name: "Paper-I · Numerical Ability", count: 25 },
  { name: "Paper-I · Reasoning", count: 25 },
  { name: "Paper-I · General English", count: 25 },
  { name: "Paper-II · Professional Knowledge", count: 100 },
];

/**
 * Build the 10-set full-length plan for a discipline. Statuses are overlaid
 * from whichever set numbers have actually shipped (see the CIL mock bank).
 */
export function buildCilMockPlan(liveSetNos: ReadonlySet<number> = new Set()): CilMock[] {
  return Array.from({ length: 10 }, (_, i) => {
    const no = i + 1;
    return {
      no,
      title:
        no === 10
          ? "Full-length Mock 10 — Grand Finale"
          : `Full-length Mock ${String(no).padStart(2, "0")}`,
      questions: CIL_PATTERN.questions,
      durationMin: CIL_PATTERN.durationMin,
      sections: CIL_FULL_SECTIONS,
      status: liveSetNos.has(no) ? "live" : "coming-soon",
    };
  });
}

/** Default plan with no sets live yet (used where discipline is unknown). */
export const CIL_MOCK_PLAN: CilMock[] = buildCilMockPlan();

