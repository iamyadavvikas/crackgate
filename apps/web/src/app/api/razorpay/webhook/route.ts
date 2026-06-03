/** Razorpay webhook — the ONLY trusted way to upgrade a user's plan.
 *  Configure in Razorpay dashboard: events = payment.captured + payment.failed,
 *  URL = https://<your-domain>/api/razorpay/webhook,
 *  secret = RAZORPAY_WEBHOOK_SECRET. */
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { sendPaymentReceipt } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text(); // raw body for HMAC
  const sig  = req.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  // Timing-safe compare
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  const evt = JSON.parse(body) as {
    event: string;
    payload: { payment: { entity: {
      id: string;
      order_id: string;
      status: string;
      amount: number;
      notes?: Record<string, string>;
    } } };
  };

  const p = evt.payload.payment.entity;
  const payment = await db.payment.findUnique({ where: { razorpayOrderId: p.order_id } });
  if (!payment) {
    // Unknown order — accept 200 so Razorpay doesn't retry forever; log instead.
    console.warn("[rzp-webhook] unknown order", p.order_id);
    return NextResponse.json({ ok: true });
  }

  if (evt.event === "payment.captured") {
    const months = payment.periodMonths;
    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + months);

    await db.$transaction([
      db.payment.update({
        where: { id: payment.id },
        data: {
          status: "captured",
          razorpayPaymentId: p.id,
          capturedAt: now,
          raw: evt as object,
        },
      }),
      db.user.update({
        where: { id: payment.userId },
        data: { plan: payment.plan, planExpiry: expiry },
      }),
      db.activity.create({
        data: {
          userId: payment.userId,
          type: "plan_upgrade",
          payload: { plan: payment.plan, months, amount: p.amount },
        },
      }),
    ]);

    // Fire-and-forget WhatsApp receipt — never block the webhook response.
    try {
      const u = await db.user.findUnique({
        where: { id: payment.userId },
        select: { phone: true, name: true },
      });
      if (u?.phone) {
        await sendPaymentReceipt(u.phone, {
          name: u.name,
          plan: payment.plan,
          amountRupees: Math.round(p.amount / 100),
          months,
        });
      }
    } catch (e) {
      console.warn("[rzp-webhook] WhatsApp receipt failed:", (e as Error).message);
    }
  } else if (evt.event === "payment.failed") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "failed", raw: evt as object },
    });
  }

  return NextResponse.json({ ok: true });
}
