import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { grade, type Question, type AnswerMap } from "@/lib/grading";
import { NextResponse } from "next/server";
import { z } from "zod";
import { MOCKS } from "@/data/mocks";

const SubmitSchema = z.object({
  kind: z.enum(["mock"]),
  refId: z.string().min(1).max(50),
  answers: z.record(z.string(), z.union([
    z.number(), z.array(z.number()), z.string(), z.null(),
  ])),
  durationSec: z.number().int().nonnegative().max(60 * 60 * 6),
});

function loadBank(kind: "mock", refId: string): { title: string; questions: Question[] } | null {
  const m = MOCKS.find((x) => x.id === refId);
  return m ? { title: m.title, questions: m.questions as unknown as Question[] } : null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const attempts = await db.attempt.findMany({
    where: { userId: session.user.id },
    orderBy: { takenAt: "desc" },
    take: 100,
    select: {
      id: true, kind: true, refId: true, refTitle: true, score: true, total: true,
      correct: true, wrong: true, skipped: true, durationSec: true, takenAt: true, breakdown: true,
    },
  });
  return NextResponse.json({ attempts });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const parsed = SubmitSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const bank = loadBank(parsed.data.kind, parsed.data.refId);
  if (!bank) return NextResponse.json({ error: "unknown refId" }, { status: 404 });

  // Plan-gate: free users (and Pro) can take only `free`-tier mocks. The full
  // mock series (subject + premium tiers) is Premium-only. Source of truth is
  // the tier on the mock itself, never a hard-coded id list.
  const me = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
  const plan = me?.plan ?? "free";
  // Founders (admins) bypass the submission plan-gate, mirroring the page gates.
  const isAdmin = (session.user as { role?: string }).role === "admin";
  {
    const m = MOCKS.find((x) => x.id === parsed.data.refId) as { tier?: "free" | "subject" | "premium" } | undefined;
    const tier = m?.tier ?? "premium";
    const allowed =
      isAdmin ||
      tier === "free" ||
      plan === "premium";
    if (!allowed) {
      return NextResponse.json({ error: "upgrade_required", requires: "premium" }, { status: 402 });
    }
  }

  // Normalise the answers map to numeric keys for grading
  const answersByIdx: AnswerMap = {};
  for (const [k, v] of Object.entries(parsed.data.answers)) {
    const i = parseInt(k, 10);
    if (!Number.isNaN(i)) answersByIdx[i] = v;
  }

  const result = grade(bank.questions, answersByIdx);

  const att = await db.attempt.create({
    data: {
      userId: session.user.id,
      kind: parsed.data.kind,
      refId: parsed.data.refId,
      refTitle: bank.title,
      score: result.scored,
      total: result.total,
      correct: result.correct,
      wrong: result.wrong,
      skipped: result.skipped,
      breakdown: result.breakdown,
      answersJson: parsed.data.answers,
      durationSec: parsed.data.durationSec,
    },
  });

  await db.activity.create({
    data: {
      userId: session.user.id,
      type: `${parsed.data.kind}_submit`,
      payload: { refId: parsed.data.refId, score: result.scored, total: result.total },
    },
  });

  return NextResponse.json({ attempt: att, result });
}
