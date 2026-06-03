/** POST /api/dev/set-plan
 *  Body: { plan: "free" | "pro" | "premium" }
 *
 *  Dev / admin-only shortcut to flip the signed-in user's plan without paying.
 *  Active when:
 *    - NODE_ENV !== "production", OR
 *    - the signed-in user has role === "admin".
 *  Otherwise returns 404 (so prod scanners can't even detect it). */

import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const Body = z.object({ plan: z.enum(["free", "pro", "premium"]) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const isDev   = process.env.NODE_ENV !== "production";
  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isDev && !isAdmin) return new Response("Not found", { status: 404 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const plan = parsed.data.plan;
  const expiry = plan === "free" ? null
    : new Date(Date.now() + (plan === "premium" ? 90 : 30) * 24 * 60 * 60 * 1000);

  const user = await db.user.update({
    where: { id: session.user.id },
    data:  { plan, planExpiry: expiry },
    select: { id: true, plan: true, planExpiry: true },
  });
  await db.activity.create({
    data: { userId: user.id, type: "dev_plan_switch", payload: { plan } },
  });

  return NextResponse.json({ ok: true, user });
}
