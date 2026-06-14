/** Manual UPI claim — after paying to our VPA the user submits their name,
 *  phone and email. Creates a PENDING UpiPayment row. Admin verifies the
 *  payment (by phone + amount) and approves via /admin/upi to flip the plan. */
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidPhone, normalizePhone } from "@/lib/whatsapp";
import { hasEntitlement } from "@/lib/entitlements";

export const runtime = "nodejs";

const PLANS = {
  pro:     { amountPaise: 49900, months: 18 },
  premium: { amountPaise: 89900, months: 18 },
} as const;

const Body = z.object({
  plan: z.enum(["pro", "premium"]),
  payerName: z.string().trim().min(2, "Please enter your full name").max(80),
  payerPhone: z.string().trim().min(10, "Enter a valid phone number").max(20),
  payerEmail: z.string().trim().email("Enter a valid email").max(120),
  examName: z.enum(["GATE", "PSU", "State Level", "Diploma"]),
  subject: z.string().trim().min(2, "Please enter the subject").max(80),
  upiApp: z.enum(["PhonePe", "GPay", "Paytm", "BHIM", "Other"]).optional(),
  payerNote: z.string().trim().max(280).optional(),
});

// Map the user-facing exam label to a catalog ExamTrack code.
const EXAM_CODE: Record<string, string> = {
  GATE: "GATE",
  PSU: "PSU",
  "State Level": "STATE",
  Diploma: "DIPLOMA",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { plan, payerName, payerPhone, payerEmail, examName, subject, upiApp, payerNote } =
    parsed.data;
  const cfg = PLANS[plan];

  const phone = normalizePhone(payerPhone);
  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { error: "invalid_phone", message: "Please enter a valid phone number." },
      { status: 400 },
    );
  }

  // Block stacking: if user already has the same (or higher) plan still valid,
  // tell them. They can extend by buying again *after* current expiry — keeps
  // Tier 0 simple. Premium > pro > free.
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiry: true, phone: true },
  });
  const rank = { free: 0, pro: 1, premium: 2 } as const;
  const targetExam = EXAM_CODE[examName] ?? examName;

  if (examName === "GATE") {
    // GATE → Mining is the only track that drives the global User.plan, so its
    // dedup is plan-based.
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
  } else if (await hasEntitlement(session.user.id, targetExam, subject, plan)) {
    // Other tracks (e.g. PSU · CIL) are gated per exam+subject Entitlement —
    // don't block a buyer just because their global plan is already pro/premium.
    return NextResponse.json(
      {
        error: "already_subscribed",
        message: "You already have active access to this track.",
      },
      { status: 409 },
    );
  }

  // One pending claim at a time — replaces the old UTR-uniqueness dedup and
  // stops accidental double submissions / spam.
  const pending = await db.upiPayment.findFirst({
    where: { userId: session.user.id, status: "pending" },
    select: { id: true },
  });
  if (pending) {
    return NextResponse.json(
      {
        error: "claim_pending",
        message:
          "You already have a payment under review. Hang tight — we'll unlock your access shortly. Message us on WhatsApp if it's urgent.",
      },
      { status: 409 },
    );
  }

  try {
    // Fold exam + subject into the stored note so admins see them without a
    // schema change. Keeps any free-form note the user added.
    const noteWithExam = [
      `Exam: ${examName}`,
      `Subject: ${subject}`,
      payerNote,
    ]
      .filter(Boolean)
      .join(" · ")
      .slice(0, 280);

    const row = await db.upiPayment.create({
      data: {
        userId: session.user.id,
        plan,
        exam: EXAM_CODE[examName] ?? examName,
        subject,
        amountPaise: cfg.amountPaise,
        periodMonths: cfg.months,
        payerName,
        payerPhone: phone,
        payerEmail,
        upiApp,
        payerNote: noteWithExam,
        status: "pending",
      },
      select: { id: true, status: true, createdAt: true },
    });

    // Backfill the user's phone if we don't have one (ignore unique conflicts).
    if (!me?.phone) {
      await db.user
        .update({ where: { id: session.user.id }, data: { phone } })
        .catch(() => {});
    }

    return NextResponse.json({ ok: true, claim: row });
  } catch (e) {
    console.error("[upi/submit]", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
