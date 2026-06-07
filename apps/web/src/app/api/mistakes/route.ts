import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MOCKS } from "@/data/mocks";
import { PYQ } from "@/data/pyq";

export const runtime = "nodejs";

/**
 * GET /api/mistakes — returns wrong + skipped questions from recent attempts.
 *
 * Joins user's stored `answersJson` with the source bank (MOCKS / PYQ) so we
 * can show the actual question, options, and correct answer for review.
 *
 * Limited to the most recent N items (default 50) to keep the response
 * tight; the UI offers filter + mark-as-understood (local-only).
 */
export type MistakeItem = {
  key: string;                // unique key: `${attemptId}:${idx}`
  attemptId: string;
  attemptDate: string;        // ISO
  refTitle: string;
  refId: string;
  kind: "mock" | "pyq";
  idx: number;                // question index within the attempt
  subject: string;
  topic?: string | null;
  type: "MCQ" | "MSQ" | "NAT";
  stem: string;
  options?: string[];
  correct: number | number[]; // index | indices | numeric value
  userAnswer: number | number[] | string | null;
  isSkipped: boolean;
  solution?: string;
  marks: number;
};

type BankQ = {
  subject?: string;
  topic?: string;
  type?: string;
  stem?: string;
  options?: string[];
  answer?: number | number[];
  marks?: number;
  tolerance?: number;
  solution?: string;
};

function loadBank(kind: "mock" | "pyq", refId: string): BankQ[] | null {
  if (kind === "mock") {
    const m = MOCKS.find((x) => (x as { id: string }).id === refId) as { questions?: BankQ[] } | undefined;
    return m?.questions ?? null;
  }
  const year = parseInt(refId.replace(/[^0-9]/g, ""), 10);
  const p = PYQ.find((y) => y.year === year);
  return p ? (p.questions as unknown as BankQ[]) : null;
}

function isAnswered(a: unknown): boolean {
  if (a === undefined || a === null || a === "") return false;
  if (Array.isArray(a) && a.length === 0) return false;
  return true;
}

function isWrong(q: BankQ, a: unknown): boolean {
  if (q.type === "NAT") {
    const v = typeof a === "string" ? parseFloat(a) : (a as number);
    if (!Number.isFinite(v)) return true;
    return Math.abs(v - Number(q.answer)) > (q.tolerance ?? 0);
  }
  if (q.type === "MSQ") {
    const exp = Array.isArray(q.answer) ? [...q.answer].sort() : [];
    const got = Array.isArray(a) ? [...a].sort() : [];
    return exp.length !== got.length || !exp.every((v, i) => v === got[i]);
  }
  return a !== q.answer;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 200);
  const subjectFilter = url.searchParams.get("subject");

  const attempts = await db.attempt.findMany({
    where: { userId: session.user.id },
    orderBy: { takenAt: "desc" },
    take: 20,
    select: {
      id: true, kind: true, refId: true, refTitle: true, takenAt: true, answersJson: true,
    },
  });

  const out: MistakeItem[] = [];
  for (const att of attempts) {
    const bank = loadBank(att.kind as "mock" | "pyq", att.refId);
    if (!bank) continue;
    const answers = (att.answersJson as Record<string, unknown>) ?? {};

    bank.forEach((q, idx) => {
      const a = answers[String(idx)] ?? answers[idx as unknown as string];
      const skipped = !isAnswered(a);
      if (!skipped && !isWrong(q, a)) return; // correct → not a mistake

      if (subjectFilter && q.subject !== subjectFilter) return;

      out.push({
        key: `${att.id}:${idx}`,
        attemptId: att.id,
        attemptDate: att.takenAt.toISOString(),
        refTitle: att.refTitle,
        refId: att.refId,
        kind: att.kind as "mock" | "pyq",
        idx,
        subject: q.subject ?? "Unknown",
        topic: q.topic ?? null,
        type: (q.type ?? "MCQ") as "MCQ" | "MSQ" | "NAT",
        stem: q.stem ?? "",
        options: q.options,
        correct: q.answer as number | number[],
        userAnswer: skipped ? null : (a as number | number[] | string),
        isSkipped: skipped,
        solution: q.solution,
        marks: q.marks ?? 1,
      });

      if (out.length >= limit) return;
    });
    if (out.length >= limit) break;
  }

  // Subjects summary for filter chips
  const subjectCounts: Record<string, number> = {};
  for (const m of out) subjectCounts[m.subject] = (subjectCounts[m.subject] ?? 0) + 1;

  return NextResponse.json({
    items: out,
    total: out.length,
    subjects: Object.entries(subjectCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  });
}
