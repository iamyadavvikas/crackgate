import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { grade, type Question, type AnswerMap } from "@/lib/grading";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PYQ } from "@/data/pyq";
import { MOCKS } from "@/data/mocks";

const SubmitSchema = z.object({
  kind: z.enum(["mock", "pyq"]),
  refId: z.string().min(1).max(50),
  answers: z.record(z.string(), z.union([
    z.number(), z.array(z.number()), z.string(), z.null(),
  ])),
  durationSec: z.number().int().nonnegative().max(60 * 60 * 6),
});

function loadBank(kind: "mock" | "pyq", refId: string): { title: string; questions: Question[] } | null {
  if (kind === "pyq") {
    const year = parseInt(refId.replace(/[^0-9]/g, ""), 10);
    const p = PYQ.find((y) => y.year === year);
    return p ? { title: `GATE ${year} — Full Paper`, questions: p.questions as unknown as Question[] } : null;
  }
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

  // Plan-gate: free users can take only `free`-tier mocks and the 2 most
  // recent PYP years. `pro` users get free + subject-tier mocks; `premium`
  // users get everything. Source of truth is the tier on the mock itself,
  // never a hard-coded id list.
  const me = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
  const plan = me?.plan ?? "free";
  if (parsed.data.kind === "mock") {
    const m = MOCKS.find((x) => x.id === parsed.data.refId) as { tier?: "free" | "subject" | "premium" } | undefined;
    const tier = m?.tier ?? "premium";
    const allowed =
      tier === "free" ||
      (tier === "subject" && (plan === "pro" || plan === "premium")) ||
      (tier === "premium" && plan === "premium");
    if (!allowed) {
      return NextResponse.json({ error: "upgrade_required", requires: tier === "premium" ? "premium" : "pro" }, { status: 402 });
    }
  } else if (parsed.data.kind === "pyq") {
    const isFreePyq = ["pyq-2024", "pyq-2025"].includes(parsed.data.refId);
    if (plan === "free" && !isFreePyq) {
      return NextResponse.json({ error: "upgrade_required", requires: "pro" }, { status: 402 });
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
