/** GET  /api/whatsapp/webhook — Meta verification handshake
 *  POST /api/whatsapp/webhook — inbound messages + delivery status
 *
 *  Configure in Meta App Dashboard \u2192 WhatsApp \u2192 Configuration:
 *   - Callback URL: https://<your-domain>/api/whatsapp/webhook
 *   - Verify token: same value as WHATSAPP_VERIFY_TOKEN env var
 *   - Subscribe to: messages, message_status */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
  const payload = await req.json().catch(() => null);
  // For now: log only. Hook your support workflow / auto-reply here later.
  console.log("[whatsapp-webhook]", JSON.stringify(payload));
  return NextResponse.json({ ok: true });
}
