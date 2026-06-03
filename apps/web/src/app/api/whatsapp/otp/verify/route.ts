/** POST /api/whatsapp/otp/verify
 *  Body: { phone: string, code: string }
 *  Verifies the latest unconsumed OTP for the phone. On success returns
 *  { ok: true } and the client immediately calls signIn("whatsapp", ...) with
 *  the same code (which re-verifies once more inside the Credentials provider). */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { isValidPhone, normalizePhone } from "@/lib/whatsapp";

export const runtime = "nodejs";

const Body = z.object({ phone: z.string(), code: z.string().regex(/^\d{6}$/) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone)) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });

  const otp = await db.otpCode.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp)             return NextResponse.json({ error: "no_active_code" }, { status: 400 });
  if (otp.attempts >= 5) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const ok = await bcrypt.compare(parsed.data.code, otp.codeHash);
  if (!ok) {
    await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: "wrong_code" }, { status: 400 });
  }

  // Don't mark consumed yet — the Credentials provider will re-check + consume.
  return NextResponse.json({ ok: true });
}
