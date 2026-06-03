/** GET /api/practice/list
 *  Returns all subjects with question counts by difficulty.
 *  Public — no auth required, used to render the /practice grid. */
import { NextResponse } from "next/server";
import { PRACTICE } from "@/data/practice";

export const dynamic = "force-static";

export async function GET() {
  const subjects = PRACTICE.map((s) => {
    const easy   = s.questions.filter((q) => q.difficulty === "easy").length;
    const medium = s.questions.filter((q) => q.difficulty === "medium").length;
    const hard   = s.questions.filter((q) => q.difficulty === "hard").length;
    return { slug: s.slug, name: s.name, easy, medium, hard, total: easy + medium + hard };
  });
  return NextResponse.json({ subjects });
}
