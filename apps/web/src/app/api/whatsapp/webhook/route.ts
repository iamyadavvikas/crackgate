/** GET  /api/whatsapp/webhook — Meta verification handshake
 *  POST /api/whatsapp/webhook — inbound messages + delivery status
 *
 *  Configure in Meta App Dashboard \u2192 WhatsApp \u2192 Configuration:
 *   - Callback URL: https://<your-domain>/api/whatsapp/webhook
 *   - Verify token: same value as WHATSAPP_VERIFY_TOKEN env var
 *   - Subscribe to: messages, message_status */

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

/** Verify Meta's X-Hub-Signature-256 header against the raw request body. */
function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signature) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode      = url.searchParams.get("hub.mode");
  const token     = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new Response("forbidden", { status: 403 });
  }
  // For now: acknowledge only. Hook your support workflow / auto-reply here later.
  // Payload intentionally not logged — it can contain PII (phone numbers, message text).
  return NextResponse.json({ ok: true });
}
