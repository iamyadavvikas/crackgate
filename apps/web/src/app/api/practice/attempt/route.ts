/** POST /api/practice/attempt — log a single practice attempt.
 *  Stored in Activity table (type=practice_attempt) so we don't need
 *  a new model. Used to build the Subject Mastery panel on dashboard.
 *
 *  body: { subjectSlug, subjectName, qid, topic, difficulty, correct }
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  let body: {
    subjectSlug?: string; subjectName?: string;
    qid?: string; topic?: string;
    difficulty?: "easy" | "medium" | "hard";
    correct?: boolean;
  };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  if (!body.subjectSlug || !body.qid || typeof body.correct !== "boolean") {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }

  await db.activity.create({
    data: {
      userId: session.user.id,
      type: "practice_attempt",
      payload: {
        subjectSlug: body.subjectSlug,
        subjectName: body.subjectName ?? body.subjectSlug,
        qid: body.qid,
        topic: body.topic ?? null,
        difficulty: body.difficulty ?? "medium",
        correct: body.correct,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
