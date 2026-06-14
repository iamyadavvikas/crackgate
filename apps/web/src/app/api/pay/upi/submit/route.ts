/** Manual UPI claim — user submits the UPI Reference Number (UTR) after paying
 *  to our VPA. Creates a PENDING UpiPayment row. Admin verifies against the UPI
 *  app and approves via /admin/upi to flip the user's plan. */
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const PLANS = {
  pro:     { amountPaise: 49900, months: 18 },
  premium: { amountPaise: 89900, months: 18 },
} as const;

const Body = z.object({
  plan: z.enum(["pro", "premium"]),
  // UPI UTR / Reference Number — bank-issued, typically 12 digits but we accept
  // 10–22 alphanumeric to cover all PSP variants (GPay/PhonePe/Paytm/BHIM/etc).
  upiTxnRef: z
    .string()
    .trim()
    .min(10, "Transaction reference looks too short")
    .max(32, "Transaction reference looks too long")
    .regex(/^[A-Za-z0-9]+$/, "Only letters and digits"),
  upiApp: z.enum(["PhonePe", "GPay", "Paytm", "BHIM", "Other"]).optional(),
  payerNote: z.string().trim().max(280).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { plan, upiTxnRef, upiApp, payerNote } = parsed.data;
  const cfg = PLANS[plan];

  // Block stacking: if user already has the same (or higher) plan still valid,
  // tell them. They can extend by buying again *after* current expiry — keeps
  // Tier 0 simple. Premium > pro > free.
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiry: true },
  });
  const rank = { free: 0, pro: 1, premium: 2 } as const;
  if (
    me &&
    rank[me.plan] >= rank[plan] &&
    me.planExpiry &&
    me.planExpiry.getTime() > Date.now()
  ) {
    return NextResponse.json(
      {
        error: "already_subscribed",
        message: `You already have ${me.plan} access until ${me.planExpiry
          .toISOString()
          .slice(0, 10)}.`,
      },
      { status: 409 },
    );
  }

  try {
    const row = await db.upiPayment.create({
      data: {
        userId: session.user.id,
        plan,
        amountPaise: cfg.amountPaise,
        periodMonths: cfg.months,
        upiTxnRef: upiTxnRef.toUpperCase(),
        upiApp,
        payerNote,
        status: "pending",
      },
      select: { id: true, status: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, claim: row });
  } catch (e) {
    // Duck-type on the Prisma error code rather than `instanceof`. Next.js can
    // bundle `@crackgate/database` into separate chunks for the route and the
    // `db` singleton, which makes `instanceof Prisma.PrismaClientKnownRequestError`
    // fail across the chunk boundary even for a genuine P2002.
    if (
      typeof e === "object" &&
      e !== null &&
      (e as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "duplicate_ref",
          message:
            "This transaction reference has already been submitted. If that wasn't you, please double-check the UTR from your UPI app.",
        },
        { status: 409 },
      );
    }
    console.error("[upi/submit]", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
