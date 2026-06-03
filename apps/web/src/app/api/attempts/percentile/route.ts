/** GET /api/attempts/percentile
 *  Returns the current user's percentile vs all other users for each
 *  ref (mock/pyq) they've attempted. Uses each user's BEST score per
 *  ref to avoid penalising people who retake.
 *
 *  Premium-only feature; pro+free get an empty array + paywall flag.
 *
 *  Response: {
 *    isPremium: boolean,
 *    rows: [{ refId, refTitle, kind, myBest, total, myPct, peerCount, percentile }]
 *  }
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ isPremium: false, rows: [], reason: "unauthenticated" }, { status: 401 });
  }

  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  const isPremium = me?.plan === "premium";

  // Find every refId the current user has attempted
  const myAttempts = await db.attempt.findMany({
    where: { userId: session.user.id },
    select: { refId: true, refTitle: true, kind: true, score: true, total: true },
    orderBy: { takenAt: "desc" },
  });
  if (myAttempts.length === 0) {
    return NextResponse.json({ isPremium, rows: [] });
  }

  // Reduce to my best score per ref
  const myBestMap = new Map<string, { refTitle: string; kind: string; score: number; total: number }>();
  for (const a of myAttempts) {
    const cur = myBestMap.get(a.refId);
    if (!cur || a.score > cur.score) {
      myBestMap.set(a.refId, { refTitle: a.refTitle, kind: a.kind, score: a.score, total: a.total });
    }
  }
  const refIds = [...myBestMap.keys()];

  // Pull all attempts for those refs (capped — safety)
  const peerAttempts = await db.attempt.findMany({
    where: { refId: { in: refIds } },
    select: { refId: true, userId: true, score: true, total: true },
    take: 50_000,
  });

  // For each ref, group peer best scores
  const peerByRef = new Map<string, Map<string, number>>(); // refId -> userId -> bestScore
  for (const a of peerAttempts) {
    const m = peerByRef.get(a.refId) ?? new Map<string, number>();
    const cur = m.get(a.userId);
    if (cur === undefined || a.score > cur) m.set(a.userId, a.score);
    peerByRef.set(a.refId, m);
  }

  const rows = refIds.map((refId) => {
    const me = myBestMap.get(refId)!;
    const peers = [...(peerByRef.get(refId)?.values() ?? [])];
    // Percentile = % of users you scored strictly above
    const beaten = peers.filter((s) => me.score > s).length;
    const peerCount = peers.length; // includes self
    const percentile = peerCount > 1 ? Math.round((beaten / (peerCount - 1)) * 100) : null;
    return {
      refId,
      refTitle: me.refTitle,
      kind: me.kind,
      myBest: me.score,
      total: me.total,
      myPct: me.total ? Math.round((me.score / me.total) * 100) : 0,
      peerCount,
      percentile, // null if no peers
    };
  }).sort((a, b) => (b.percentile ?? -1) - (a.percentile ?? -1));

  // Non-premium users get a single-row preview
  const visible = isPremium ? rows : rows.slice(0, 1);
  return NextResponse.json({
    isPremium,
    rows: visible,
    totalRows: rows.length,
    capped: !isPremium && rows.length > 1,
  });
}
