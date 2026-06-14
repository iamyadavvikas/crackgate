// CIL Management Trainee mock-test plan.
//
// CIL MT is a single-paper CBT: 100 MCQs in 3 hours, split into
// Paper-I (discipline-specific Technical) and Paper-II (Aptitude / Reasoning /
// English / General Awareness). We model a 15-mock prep series per discipline,
// arranged into three progressive phases. Cards are "coming-soon" until the
// question banks are wired in.

export const CIL_PATTERN = {
  questions: 100,
  durationMin: 180,
  marks: 100,
  papers: [
    { name: "Paper-I · Technical", desc: "Discipline-specific technical knowledge" },
    { name: "Paper-II · Aptitude", desc: "Reasoning · Quantitative · English · General Awareness" },
  ],
} as const;

export type CilMockPhase = "foundation" | "aptitude" | "full";
export type CilMockStatus = "coming-soon" | "live";

export type CilMockSection = { name: string; count: number };

export type CilMock = {
  no: number;
  title: string;
  phase: CilMockPhase;
  questions: number;
  durationMin: number;
  sections: CilMockSection[];
  status: CilMockStatus;
};

export const CIL_PHASES: { id: CilMockPhase; label: string; blurb: string }[] = [
  {
    id: "foundation",
    label: "Phase 1 · Foundation (Paper-I Technical)",
    blurb: "Build core technical command — discipline-specific sectionals to lock down concepts.",
  },
  {
    id: "aptitude",
    label: "Phase 2 · Aptitude & GK (Paper-II)",
    blurb: "Reasoning, quantitative aptitude, English and current affairs — the score multipliers.",
  },
  {
    id: "full",
    label: "Phase 3 · Full-length CIL Simulations",
    blurb: "Exam-day rehearsal — full 100-question, 3-hour CIL MT papers under real timing.",
  },
];

const techSections = (label: string): CilMockSection[] => [
  { name: `Technical · ${label}`, count: 50 },
];

const aptSections = (label: string): CilMockSection[] => [
  { name: label, count: 50 },
];

const fullSections: CilMockSection[] = [
  { name: "Paper-I · Technical", count: 50 },
  { name: "Paper-II · Aptitude & GK", count: 50 },
];

export const CIL_MOCK_PLAN: CilMock[] = [
  // Phase 1 — Foundation (Paper-I Technical sectionals)
  { no: 1, title: "Technical Sectional 1 — Core Fundamentals", phase: "foundation", questions: 50, durationMin: 90, sections: techSections("Core Fundamentals"), status: "coming-soon" },
  { no: 2, title: "Technical Sectional 2 — Applied Concepts", phase: "foundation", questions: 50, durationMin: 90, sections: techSections("Applied Concepts"), status: "coming-soon" },
  { no: 3, title: "Technical Sectional 3 — Design & Analysis", phase: "foundation", questions: 50, durationMin: 90, sections: techSections("Design & Analysis"), status: "coming-soon" },
  { no: 4, title: "Technical Sectional 4 — Operations & Safety", phase: "foundation", questions: 50, durationMin: 90, sections: techSections("Operations & Safety"), status: "coming-soon" },
  { no: 5, title: "Technical Sectional 5 — Mixed Revision", phase: "foundation", questions: 50, durationMin: 90, sections: techSections("Mixed Revision"), status: "coming-soon" },

  // Phase 2 — Aptitude & GK (Paper-II sectionals)
  { no: 6, title: "Reasoning & Logical Ability", phase: "aptitude", questions: 50, durationMin: 90, sections: aptSections("Reasoning & Logical Ability"), status: "coming-soon" },
  { no: 7, title: "Quantitative Aptitude", phase: "aptitude", questions: 50, durationMin: 90, sections: aptSections("Quantitative Aptitude"), status: "coming-soon" },
  { no: 8, title: "English Language & Comprehension", phase: "aptitude", questions: 50, durationMin: 90, sections: aptSections("English Language"), status: "coming-soon" },
  { no: 9, title: "General Awareness & Current Affairs", phase: "aptitude", questions: 50, durationMin: 90, sections: aptSections("General Awareness"), status: "coming-soon" },
  { no: 10, title: "Aptitude Mixed Revision", phase: "aptitude", questions: 50, durationMin: 90, sections: aptSections("Aptitude Mixed"), status: "coming-soon" },

  // Phase 3 — Full-length CIL simulations (Paper-I + Paper-II)
  { no: 11, title: "Full-length CIL Simulation 1", phase: "full", questions: 100, durationMin: 180, sections: fullSections, status: "coming-soon" },
  { no: 12, title: "Full-length CIL Simulation 2", phase: "full", questions: 100, durationMin: 180, sections: fullSections, status: "coming-soon" },
  { no: 13, title: "Full-length CIL Simulation 3", phase: "full", questions: 100, durationMin: 180, sections: fullSections, status: "coming-soon" },
  { no: 14, title: "Full-length CIL Simulation 4", phase: "full", questions: 100, durationMin: 180, sections: fullSections, status: "coming-soon" },
  { no: 15, title: "Full-length CIL Simulation 5 — Final Boss", phase: "full", questions: 100, durationMin: 180, sections: fullSections, status: "coming-soon" },
];

export function cilMocksByPhase(phase: CilMockPhase): CilMock[] {
  return CIL_MOCK_PLAN.filter((m) => m.phase === phase);
}
