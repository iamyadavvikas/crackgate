// Unified mock resolver — bridges the GATE mock catalogue (`MOCKS`) and the CIL
// MT question bank (`CIL_MOCK_BANK`) behind one lookup. Used by the runner page
// and the attempts grading API so both exam families share one code path while
// keeping their distinct gating (plan-tier vs per-discipline entitlement) and
// marking rules (GATE negative marking vs CIL none).

import { MOCKS } from "@/data/mocks";
import { CIL_MOCK_BANK, cilMockIds } from "@/data/cil-mock-bank";
import type { Question } from "@/lib/grading";

export type MockGate =
  | { type: "plan"; tier: "free" | "subject" | "premium" }
  | { type: "entitlement"; exam: "PSU"; subject: string };

export type ResolvedMock = {
  id: string;
  title: string;
  questions: Question[];
  durationSec: number;
  negativeMarking: boolean;
  gate: MockGate;
};

/** Resolve a mock id to its questions, duration, marking rule and access gate. */
export function resolveMock(id: string): ResolvedMock | null {
  if (id.startsWith("cil-")) {
    const set = CIL_MOCK_BANK.get(id);
    if (!set) return null;
    return {
      id,
      title: set.title,
      questions: set.questions,
      durationSec: (set.durationMin ?? 180) * 60,
      negativeMarking: set.negativeMarking ?? false,
      gate: { type: "entitlement", exam: "PSU", subject: set.slug },
    };
  }

  const m = MOCKS.find((x) => (x as { id: string }).id === id) as
    | { id: string; title: string; tier: "free" | "subject" | "premium"; duration?: number; questions: unknown[] }
    | undefined;
  if (!m) return null;
  return {
    id: m.id,
    title: m.title,
    questions: m.questions as unknown as Question[],
    durationSec: (m.duration ?? 180) * 60,
    negativeMarking: true,
    gate: { type: "plan", tier: m.tier },
  };
}

/** Every resolvable mock id (GATE catalogue + shipped CIL sets). */
export function allMockIds(): string[] {
  return [...MOCKS.map((m) => (m as { id: string }).id), ...cilMockIds()];
}
