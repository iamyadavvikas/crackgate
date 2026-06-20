import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { grade, type AnswerMap } from "@/lib/grading";
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveMock } from "@/lib/mock-registry";
import { hasEntitlement } from "@/lib/entitlements";

const SubmitSchema = z.object({
  kind: z.enum(["mock"]),
  refId: z.string().min(1).max(50),
  answers: z.record(z.string(), z.union([
    z.number(), z.array(z.number()), z.string(), z.null(),
  ])),
  durationSec: z.number().int().nonnegative().max(60 * 60 * 6),
});

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

  const bank = resolveMock(parsed.data.refId);
  if (!bank) return NextResponse.json({ error: "unknown refId" }, { status: 404 });

  // Access gate: mirror the runner page. GATE mocks are plan-gated (Premium-only
  // beyond the free tier); CIL MT sets are gated by a per-discipline PSU
  // entitlement. Founders (admins) bypass both.
  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isAdmin) {
    if (bank.gate.type === "plan") {
      const me = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
      const plan = me?.plan ?? "free";
      const allowed = bank.gate.tier === "free" || plan === "premium";
      if (!allowed) {
        return NextResponse.json({ error: "upgrade_required", requires: "premium" }, { status: 402 });
      }
    } else {
      const ok = await hasEntitlement(session.user.id, bank.gate.exam, bank.gate.subject);
      if (!ok) {
        return NextResponse.json({ error: "upgrade_required", requires: "entitlement", subject: bank.gate.subject }, { status: 402 });
      }
    }
  }

  // Normalise the answers map to numeric keys for grading
  const answersByIdx: AnswerMap = {};
  for (const [k, v] of Object.entries(parsed.data.answers)) {
    const i = parseInt(k, 10);
    if (!Number.isNaN(i)) answersByIdx[i] = v;
  }

  // CIL MT has no negative marking; GATE mocks do. The registry carries the rule.
  const result = grade(bank.questions, answersByIdx, { negativeMarking: bank.negativeMarking });

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
