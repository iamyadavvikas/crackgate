/** Thin wrapper around the WhatsApp Business Cloud API (Meta, Graph v21.0).
 *  Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 *  Two send modes:
 *   - sendTemplate(): for cold messages (OTP, payment confirmation). REQUIRED outside the
 *     24-hour session window. Templates must be pre-approved in WhatsApp Manager.
 *   - sendText(): freeform reply. Only works within 24h of the user messaging us. */

const GRAPH = "https://graph.facebook.com/v21.0";

function cfg() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token         = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) {
    throw new Error("WhatsApp not configured: set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN");
  }
  return { phoneNumberId, token };
}

async function call(path: string, body: unknown) {
  const { phoneNumberId, token } = cfg();
  const res = await fetch(`${GRAPH}/${phoneNumberId}/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json as { error?: { message?: string } }).error?.message ?? res.statusText;
    throw new Error(`WhatsApp API ${res.status}: ${msg}`);
  }
  return json as { messages?: Array<{ id: string }> };
}

/** E.164 without '+'. Strips spaces, hyphens; auto-prefixes 91 if 10 digits. */
export function normalizePhone(input: string): string {
  const d = input.replace(/[^\d]/g, "");
  if (d.length === 10) return "91" + d;          // assume India
  if (d.startsWith("0") && d.length === 11) return "91" + d.slice(1);
  return d;
}

export function isValidPhone(input: string): boolean {
  const d = normalizePhone(input);
  return /^[1-9]\d{9,14}$/.test(d);
}

/** Send a template message (the only thing allowed for cold contact / OTP). */
export async function sendTemplate(opts: {
  to: string;                  // E.164 without '+'
  template: string;            // approved template name
  language?: string;           // default "en"
  bodyVars?: string[];         // ordered {{1}}, {{2}}, ...
  buttonOtp?: string;          // if template has an OTP url/copy-code button
}) {
  const components: Array<Record<string, unknown>> = [];
  if (opts.bodyVars?.length) {
    components.push({
      type: "body",
      parameters: opts.bodyVars.map((t) => ({ type: "text", text: t })),
    });
  }
  if (opts.buttonOtp) {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: opts.buttonOtp }],
    });
  }
  return call("messages", {
    messaging_product: "whatsapp",
    to: opts.to,
    type: "template",
    template: {
      name: opts.template,
      language: { code: opts.language ?? "en" },
      ...(components.length ? { components } : {}),
    },
  });
}

/** Freeform text reply (only valid in active 24h session). */
export async function sendText(to: string, body: string) {
  return call("messages", {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body, preview_url: false },
  });
}

// ============================================================================
// High-level helpers used by the app
// ============================================================================

export async function sendOtp(phone: string, code: string) {
  return sendTemplate({
    to: phone,
    template: process.env.WHATSAPP_TEMPLATE_OTP ?? "crackgate_otp",
    bodyVars: [code],
    buttonOtp: code,           // for "copy code" button templates; ignored otherwise
  });
}

export async function sendPaymentReceipt(phone: string, opts: {
  name: string;
  plan: string;
  amountRupees: number;
  months: number;
}) {
  return sendTemplate({
    to: phone,
    template: process.env.WHATSAPP_TEMPLATE_PAYMENT ?? "crackgate_payment_success",
    bodyVars: [
      opts.name,
      opts.plan.toUpperCase(),
      `\u20B9${opts.amountRupees.toLocaleString("en-IN")}`,
      String(opts.months),
    ],
  });
}

/** Weekly progress digest — sent every Monday morning to Pro/Premium users
 *  with a phone number. Template body should accept 5 variables:
 *   {{1}} name, {{2}} attempts (week), {{3}} avg accuracy %,
 *   {{4}} weakest subject, {{5}} suggestion line. */
export async function sendWeeklyDigest(phone: string, opts: {
  name: string;
  attemptsThisWeek: number;
  avgAccuracyPct: number;
  weakestSubject: string;
  suggestion: string;
}) {
  return sendTemplate({
    to: phone,
    template: process.env.WHATSAPP_TEMPLATE_DIGEST ?? "crackgate_weekly_digest",
    bodyVars: [
      opts.name,
      String(opts.attemptsThisWeek),
      `${opts.avgAccuracyPct}%`,
      opts.weakestSubject || "—",
      opts.suggestion,
    ],
  });
}
