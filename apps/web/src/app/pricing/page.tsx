"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window { Razorpay: new (opts: Record<string, unknown>) => { open: () => void }; }
}

const PLANS = [
  { id: "free",    name: "Free",     price: 0,    period: "forever",    cta: "Current plan", highlight: false,
    perks: [
      "Mock 01 — full exam-portal experience",
      "GATE 2024 & 2025 PYQs (2 papers)",
      "Practice preview: 20 Qs per subject, all 10 subjects",
      "Basic dashboard with score trend",
      "Server-side grading & per-Q solutions",
    ] },
  { id: "pro",     name: "Pro",      price: 499,  period: "/ GATE 2027 cycle",    cta: "Get Pro",     highlight: true,
    perks: [
      "All subject-wise mocks + free FLT (9 tests)",
      "All 12 PYQ papers (2014–2025)",
      "🔓 Full 906-question practice bank — no per-session limits",
      "Subject SWOT + Mastery analytics",
      "WhatsApp payment receipts & email support",
      "Mobile + desktop sync",
      "Valid through GATE 2027 exam day",
    ] },
  { id: "premium", name: "Premium · All-Access",  price: 899,  period: "/ GATE 2027 cycle", cta: "Get Premium", highlight: false,
    perks: [
      "Everything in Pro",
      "💎 All 10 mocks including final full-syllabus FLT",
      "💎 Topic-wise PYP filter (every Ventilation Q since 2010, etc.)",
      "💎 Adaptive practice from your weak topics",
      "Weekly progress digest on WhatsApp",
      "Priority support + 1:1 doubt clearance",
      "Early access to GATE 2028 prep content",
    ] },
] as const;

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold">Simple, honest pricing.</h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          Start free. Upgrade when you want all mocks & PYQs unlocked. Cancel any time — no auto-renewal traps.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {PLANS.map((p) => <PlanCard key={p.id} plan={p} />)}
      </div>

      <FeatureMatrix />

      <p className="text-center text-xs text-muted mt-12">
        Prices in ₹ INR · GST extra where applicable · See our <a href="/refund" className="underline">refund policy</a>.
      </p>
    </div>
  );
}

const MATRIX: { feature: string; free: string | boolean; pro: string | boolean; premium: string | boolean }[] = [
  // Tests
  { feature: "Full-length mock tests",          free: "1 (Mock 01)",  pro: "9 of 10",        premium: "All 10"           },
  { feature: "Previous Year Papers (PYQs)",     free: "2 papers",     pro: "All 12 papers",  premium: "All 12 papers"    },
  { feature: "Topic-wise PYP filter",           free: false,          pro: false,            premium: true               },

  // Practice
  { feature: "Practice Qs per subject",         free: "20 preview",   pro: "Full subject",   premium: "Full subject"     },
  { feature: "Total practice questions",        free: "200",          pro: "906 (full bank)",premium: "906 (full bank)"  },
  { feature: "Adaptive weak-topic mode",        free: false,          pro: false,            premium: true               },

  // Analytics
  { feature: "Subject Mastery dashboard",       free: "Basic",        pro: "Full",           premium: "Full + trends"    },
  { feature: "SWOT analytics",                  free: "Basic",        pro: "Detailed",       premium: "Detailed + percentile" },
  { feature: "Score Trend chart",               free: true,           pro: true,             premium: "+ peer comparison" },

  // Support / extras
  { feature: "WhatsApp payment receipts",       free: false,          pro: true,             premium: true               },
  { feature: "Weekly progress digest",          free: false,          pro: false,            premium: true               },
  { feature: "1:1 doubt clearance",             free: false,          pro: false,            premium: true               },
  { feature: "Support",                         free: "Community",    pro: "Email",          premium: "WhatsApp + email" },
  { feature: "Validity",                        free: "Forever",      pro: "GATE 2027 cycle",premium: "GATE 2027 + 2028 early access" },
];

function FeatureMatrix() {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-extrabold text-center">What's in each plan</h2>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-4">Feature</th>
              <th className="p-4 text-center">Free</th>
              <th className="p-4 text-center bg-brand/5">Pro</th>
              <th className="p-4 text-center bg-accent/5">Premium</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row) => (
              <tr key={row.feature} className="border-b border-line/60">
                <td className="p-4 font-medium">{row.feature}</td>
                <Cell v={row.free} />
                <Cell v={row.pro} highlight />
                <Cell v={row.premium} highlight accent />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Cell({ v, highlight, accent }: { v: string | boolean; highlight?: boolean; accent?: boolean }) {
  const bg = accent ? "bg-accent/5" : highlight ? "bg-brand/5" : "";
  return (
    <td className={`p-4 text-center ${bg}`}>
      {v === true  ? <span className="text-ok font-bold">✓</span>
       : v === false ? <span className="text-muted">—</span>
       : <span>{v}</span>}
    </td>
  );
}

function PlanCard({ plan }: { plan: typeof PLANS[number] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const devMode = process.env.NEXT_PUBLIC_DEV_TOOLS === "1";

  async function buy() {
    if (plan.id === "free") return router.push("/login");
    setLoading(true);
    try {
      // Dev-mode shortcut: skip Razorpay, flip the plan via the dev API.
      if (devMode) {
        const r = await fetch("/api/dev/set-plan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan: plan.id }),
        });
        if (r.status === 401) return router.push(`/login?next=/pricing`);
        const t = await r.text();
        const data = t ? safeJson(t) : null;
        if (!r.ok) throw new Error(data?.error ?? data?.message ?? `Dev set-plan failed (HTTP ${r.status})`);
        return router.push(`/dashboard?upgrade=success&dev=1`);
      }

      const r = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });
      if (r.status === 401) return router.push(`/login?next=/pricing`);
      const text = await r.text();
      const data = text ? safeJson(text) : null;
      if (!r.ok) {
        throw new Error(
          data?.message ?? data?.error ??
          `Payment service error (HTTP ${r.status}). Try again in a moment.`,
        );
      }
      if (!data?.orderId || !data?.keyId) {
        throw new Error("Payment provider isn't configured. Use the ⚙ DEV switcher to test premium features locally.");
      }

      await loadRazorpay();
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "CrackGate.in",
        description: `${plan.name} plan`,
        theme: { color: "#1e3a8a" },
        handler: () => router.push("/dashboard?upgrade=success"),
      });
      rzp.open();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`card p-8 flex flex-col ${plan.highlight ? "border-accent shadow-pop ring-2 ring-accent/40" : ""}`}>
      {plan.highlight && <div className="text-xs font-bold text-accent uppercase tracking-wide mb-2">Most popular</div>}
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <div className="mt-3">
        <span className="text-4xl font-extrabold">₹{plan.price}</span>
        <span className="text-sm text-muted ml-1">{plan.period}</span>
      </div>
      <ul className="mt-6 space-y-2 text-sm">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex gap-2"><span className="text-ok">✓</span> {perk}</li>
        ))}
      </ul>
      <button
        onClick={buy}
        disabled={loading || plan.id === "free"}
        className={`btn ${plan.highlight ? "btn-accent" : "btn-primary"} mt-8`}
      >
        {loading ? "Loading…" : devMode && plan.id !== "free" ? `⚙ Dev: switch to ${plan.name}` : plan.cta}
      </button>
      {plan.id !== "free" && !devMode && (
        <a
          href={`/pay/upi?plan=${plan.id}`}
          className="block text-center text-xs text-muted mt-3 underline hover:text-fg"
        >
          Or pay directly via UPI ↗
        </a>
      )}
      {devMode && plan.id !== "free" && (
        <p className="text-[11px] text-muted mt-2 text-center">Skips Razorpay · dev tools enabled</p>
      )}
    </div>
  );
}

function safeJson(t: string): { error?: string; message?: string; orderId?: string; keyId?: string; amount?: number; currency?: string } | null {
  try { return JSON.parse(t); } catch { return null; }
}

function loadRazorpay() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(s);
  });
}
