/** GET /api/pyq/topics
 *  Returns a roll-up of every PYQ question grouped by subject across all
 *  12 papers (2014–2025). Used by the premium topic-wise PYP browser.
 *
 *  Response: { subjects: [{ subject, count, years: number[] }], totalYears }
 */
import { NextResponse } from "next/server";
import { PYQ } from "@/data/pyq";

export const runtime = "nodejs";

export async function GET() {
  const acc = new Map<string, { count: number; years: Set<number> }>();
  for (const paper of PYQ) {
    for (const q of paper.questions as unknown as { subject: string }[]) {
      const cur = acc.get(q.subject) ?? { count: 0, years: new Set<number>() };
      cur.count += 1;
      cur.years.add(paper.year);
      acc.set(q.subject, cur);
    }
  }
  const subjects = [...acc.entries()]
    .map(([subject, v]) => ({ subject, count: v.count, years: [...v.years].sort((a, b) => b - a) }))
    .sort((a, b) => b.count - a.count);
  return NextResponse.json({ subjects, totalYears: PYQ.length });
}
