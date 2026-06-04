"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Tab = "google" | "whatsapp";

// Provider toggles — each defaults to ON unless explicitly disabled with "0".
// In production set NEXT_PUBLIC_WHATSAPP_ENABLED="0" to show only Google.
const GOOGLE_ENABLED   = process.env.NEXT_PUBLIC_GOOGLE_ENABLED   === "1";
const WHATSAPP_ENABLED = process.env.NEXT_PUBLIC_WHATSAPP_ENABLED !== "0";

export function LoginForms({ safeNext }: { safeNext: string }) {
  const initialTab: Tab = GOOGLE_ENABLED ? "google" : "whatsapp";
  const [tab, setTab] = useState<Tab>(initialTab);

  const bothOn = GOOGLE_ENABLED && WHATSAPP_ENABLED;
  const onlyGoogle   = GOOGLE_ENABLED && !WHATSAPP_ENABLED;
  const onlyWhatsApp = !GOOGLE_ENABLED && WHATSAPP_ENABLED;
  const neither      = !GOOGLE_ENABLED && !WHATSAPP_ENABLED;

  return (
    <div className="mt-7">
      {bothOn && (
        <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-1 text-sm font-semibold">
          <TabBtn active={tab === "google"}   onClick={() => setTab("google")}>Google</TabBtn>
          <TabBtn active={tab === "whatsapp"} onClick={() => setTab("whatsapp")}>WhatsApp</TabBtn>
        </div>
      )}
      {onlyWhatsApp && (
        <div className="bg-slate-100 rounded-lg p-3 text-xs text-muted text-center">
          📱 Sign in with WhatsApp OTP. Google sign-in not configured in this environment.
        </div>
      )}
      {neither && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 text-center">
          ⚠ No sign-in providers configured. Set <code>NEXT_PUBLIC_GOOGLE_ENABLED=1</code> or <code>NEXT_PUBLIC_WHATSAPP_ENABLED=1</code>.
        </div>
      )}

      <div className="mt-5">
        {onlyGoogle && <GoogleForm safeNext={safeNext} />}
        {onlyWhatsApp && <WhatsAppForm safeNext={safeNext} />}
        {bothOn && (tab === "google" ? <GoogleForm safeNext={safeNext} /> : <WhatsAppForm safeNext={safeNext} />)}
      </div>

      <DevDemoLogin safeNext={safeNext} />
    </div>
  );
}

function DevDemoLogin({ safeNext }: { safeNext: string }) {
  // Double-gated: NODE_ENV must be non-prod AND the explicit dev-tools flag set.
  // This guarantees the block can never render in a production build, even if
  // someone mistakenly leaves NEXT_PUBLIC_DEV_TOOLS=1 in the prod env.
  const enabled =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_TOOLS === "1";
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  if (!enabled) return null;

  async function loginAs(email: string) {
    setBusy(email);
    const res = await signIn("dev-demo", { email, redirect: false, callbackUrl: safeNext });
    setBusy(null);
    if (res && !res.error) { router.push(safeNext); router.refresh(); }
    else alert("Demo login failed — make sure the user is seeded (npm run db:seed).");
  }

  return (
    <div className="mt-6 border-t border-dashed border-line pt-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-purple-700">⚙ Dev mode · skip auth</p>
      <p className="text-xs text-muted mt-1 mb-2">Instantly sign in as a seeded demo user. Hidden in production.</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => loginAs("demo@crackgate.in")}  disabled={!!busy} className="btn btn-ghost text-xs justify-center border border-line">
          {busy === "demo@crackgate.in" ? "…" : "👤 Demo user"}
        </button>
        <button onClick={() => loginAs("admin@crackgate.in")} disabled={!!busy} className="btn btn-ghost text-xs justify-center border border-line">
          {busy === "admin@crackgate.in" ? "…" : "🛡️ Admin"}
        </button>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "py-2 rounded-md transition " +
        (active ? "bg-white shadow text-ink" : "text-muted hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

function GoogleForm({ safeNext }: { safeNext: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => { setBusy(true); signIn("google", { callbackUrl: safeNext }); }}
      className="btn btn-lg w-full bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 justify-center font-semibold"
    >
      <GoogleIcon /> {busy ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

function WhatsAppForm({ safeNext }: { safeNext: string }) {
  const router = useRouter();
  const [stage, setStage]   = useState<"phone" | "otp">("phone");
  const [phone, setPhone]   = useState("");
  const [code, setCode]     = useState("");
  const [err, setErr]       = useState<string | null>(null);
  const [busy, setBusy]     = useState(false);
  const [resendIn, setResendIn] = useState(0);

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setErr(null); setBusy(true);
    try {
      const res = await fetch("/api/whatsapp/otp/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(prettyError(j.error));
      setStage("otp");
      setResendIn(30);
      const t = setInterval(() => setResendIn((s) => (s <= 1 ? (clearInterval(t), 0) : s - 1)), 1000);
    } catch (e) { setErr((e as Error).message); }
    finally    { setBusy(false); }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const res = await signIn("whatsapp", { phone, code, redirect: false, callbackUrl: safeNext });
      if (!res || res.error) throw new Error("Wrong or expired code. Please try again.");
      router.push(safeNext);
      router.refresh();
    } catch (e) { setErr((e as Error).message); }
    finally    { setBusy(false); }
  }

  if (stage === "phone") {
    return (
      <form onSubmit={sendOtp} className="text-left space-y-3">
        <label className="block">
          <span className="text-sm font-semibold">WhatsApp number</span>
          <div className="mt-1 flex items-center rounded-lg border border-line bg-white focus-within:border-brand">
            <span className="px-3 text-muted text-sm border-r border-line">+91</span>
            <input
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit number"
              className="flex-1 px-3 py-3 outline-none rounded-r-lg"
            />
          </div>
        </label>
        <button disabled={busy || phone.length !== 10} className="btn w-full bg-[#25D366] text-white hover:bg-[#1ebe57]">
          {busy ? "Sending\u2026" : "Send OTP on WhatsApp"}
        </button>
        {err && <p className="text-sm text-bad">{err}</p>}
        <p className="text-xs text-muted text-center">We'll send a 6-digit code to your WhatsApp. Standard message rates may apply.</p>
      </form>
    );
  }

  return (
    <form onSubmit={verifyOtp} className="text-left space-y-3">
      <p className="text-sm text-muted">Code sent to <b>+91 {phone}</b>. <button type="button" onClick={() => { setStage("phone"); setCode(""); }} className="underline">change</button></p>
      <label className="block">
        <span className="text-sm font-semibold">Enter 6-digit OTP</span>
        <input
          required
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="input mt-1 text-center text-lg tracking-[0.5em] font-mono"
          placeholder="\u2022\u2022\u2022\u2022\u2022\u2022"
        />
      </label>
      <button disabled={busy || code.length !== 6} className="btn btn-primary w-full">
        {busy ? "Verifying\u2026" : "Verify & continue"}
      </button>
      {err && <p className="text-sm text-bad">{err}</p>}
      <button
        type="button"
        disabled={resendIn > 0 || busy}
        onClick={() => sendOtp()}
        className="text-xs text-muted hover:text-ink disabled:opacity-50 w-full text-center"
      >
        {resendIn > 0 ? `Resend in ${resendIn}s` : "Didn't get it? Resend"}
      </button>
    </form>
  );
}

function prettyError(code?: string) {
  switch (code) {
    case "invalid_phone":   return "That number doesn't look right.";
    case "rate_limited":    return "Too many requests. Try again in 10 minutes.";
    case "send_failed":     return "Couldn't deliver the OTP on WhatsApp right now.";
    case "no_active_code":  return "No active code. Request a new OTP.";
    case "too_many_attempts": return "Too many wrong attempts. Request a new OTP.";
    case "wrong_code":      return "Wrong code.";
    default:                return code ?? "Something went wrong.";
  }
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.3 5.3C40.8 35.6 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
