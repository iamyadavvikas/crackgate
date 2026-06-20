/**
 * GATE subject registry — the single source of truth that maps a GATE subject
 * slug (e.g. "civil") to its content modules (practice, mocks, learn, aits) and
 * access metadata. New subjects (geology, environment) register here once their
 * content exists; until then they are absent and render as "coming soon".
 *
 * Mining keeps its legacy flat routes and is NOT registered here — these
 * generic `/gate/[subject]/*` routes are for the newer per-subject sites.
 */
import type { PracticeSubject } from "@/data/practice";
import type { LearnTopic, LearnSyllabusSection, LearnSyllabusSubtopic } from "@/data/learn";
import type { AitsTest } from "@/data/aits";

import { CE_PRACTICE } from "@/data/gate/civil/practice";
import { CE_MOCKS } from "@/data/gate/civil/mocks";
import { CE_LEARN_TOPICS, getCivilLearnTopic, getCivilLearnSyllabus } from "@/data/gate/civil/learn";
import { CE_AITS } from "@/data/gate/civil/aits";

export type GateMock = {
  id: string;
  title: string;
  tier: "free" | "subject" | "premium";
  duration?: number;
  totalMarks?: number;
  sections?: { name: string; count: number; marks: number }[];
  questions: unknown[];
};

export type CeResolvedSubtopic = LearnSyllabusSubtopic & { topic?: LearnTopic };
export type ResolvedSyllabusSection = Omit<LearnSyllabusSection, "subtopics"> & {
  subtopics: CeResolvedSubtopic[];
  liveCount: number;
};

export interface GateSubject {
  /** URL slug under /gate/<slug>. */
  slug: string;
  /** Display label, e.g. "Civil Engineering". */
  label: string;
  /** Short code shown in chips, e.g. "CE". */
  code: string;
  /** One-line description for the subject home hero. */
  blurb: string;
  /** Entitlement exam key for access checks. */
  accessExam: "GATE";
  /** Entitlement subject key for access checks. */
  accessSubject: string;
  /** Content modules. */
  practice: PracticeSubject[];
  mocks: readonly GateMock[];
  learnTopics: LearnTopic[];
  getLearnTopic: (topicSlug: string) => LearnTopic | undefined;
  getLearnSyllabus: () => ResolvedSyllabusSection[];
  aits: AitsTest[];
}

const SUBJECTS: Record<string, GateSubject> = {
  civil: {
    slug: "civil",
    label: "Civil Engineering",
    code: "CE",
    blurb:
      "Full GATE Civil (CE) preparation — topic-wise learning, an exam-grade practice bank, full-length mocks and a scheduled All India Test Series.",
    accessExam: "GATE",
    accessSubject: "civil",
    practice: CE_PRACTICE,
    mocks: CE_MOCKS as unknown as readonly GateMock[],
    learnTopics: CE_LEARN_TOPICS,
    getLearnTopic: getCivilLearnTopic,
    getLearnSyllabus: getCivilLearnSyllabus,
    aits: CE_AITS,
  },
};

/** Subjects that have a fully-built mini-site at /gate/<slug>. */
export function liveGateSubjects(): string[] {
  return Object.keys(SUBJECTS);
}

/** Resolve a subject slug to its registry entry (or undefined if not live). */
export function getGateSubject(slug: string): GateSubject | undefined {
  return SUBJECTS[slug];
}

/** Subjects known to the catalogue but not yet built (render "coming soon"). */
export const KNOWN_COMING_SOON = new Set<string>(["geology", "environment"]);
