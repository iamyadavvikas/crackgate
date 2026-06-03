/** GET /api/pyq/topics/[slug]?type=MCQ|MSQ|NAT&marks=1|2
 *  Returns every PYQ question for a subject across all 12 papers,
 *  most-recent year first. Optional filters by type and marks.
 *
 *  Premium-gated: anonymous/free/pro users get a 5-question preview
 *  with a paywall flag; premium gets the full set.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PYQ } from "@/data/pyq";

export const runtime = "nodejs";

const PREVIEW = 5;

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const url = new URL(req.url);
  const typeFilter  = url.searchParams.get("type");
  const marksFilter = url.searchParams.get("marks");

  // slugified subject: lowercase, spaces+& → '-'
  const targetSlug = slug.toLowerCase();
  const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  type RawQ = { subject: string; type: string; marks: number; stem: string };
  const all: Array<RawQ & { year: number }> = [];
  let subjectName = slug;
  for (const paper of PYQ) {
    for (const q of paper.questions as unknown as RawQ[]) {
      if (slugify(q.subject) !== targetSlug) continue;
      subjectName = q.subject;
      if (typeFilter && q.type !== typeFilter) continue;
      if (marksFilter && String(q.marks) !== marksFilter) continue;
      all.push({ ...q, year: paper.year });
    }
  }
  // newest first
  all.sort((a, b) => b.year - a.year);

  const session = await auth();
  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  const isPremium = plan === "premium";

  const questions = isPremium ? all : all.slice(0, PREVIEW);
  return NextResponse.json({
    subject: subjectName,
    plan,
    isPremium,
    total: all.length,
    returned: questions.length,
    capped: !isPremium && all.length > PREVIEW,
    questions,
  });
}
