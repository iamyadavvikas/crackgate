import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const u = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, email: true, name: true, picture: true, plan: true, planExpiry: true,
      role: true, targetYear: true, currentStatus: true, createdAt: true,
    },
  });
  return NextResponse.json({ user: u });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json();
  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      name: body.name?.slice(0, 80),
      targetYear: body.targetYear?.slice(0, 40),
      currentStatus: body.currentStatus?.slice(0, 40),
      phone: body.phone?.slice(0, 20),
    },
  });
  return NextResponse.json({ user: updated });
}
