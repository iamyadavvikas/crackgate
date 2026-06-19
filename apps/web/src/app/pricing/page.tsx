"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLANS = [
  { id: "free",    name: "Free",     price: 0,    period: "forever",    cta: "Current plan", highlight: false, badge: "",
    perks: [
      "All Learn concept lessons — free forever",
      "Insights dashboard — track scores & progress",
      "Complete study Notes — free forever",
      "Mock 01 free — full exam-portal experience",
    ] },
  { id: "pro",     name: "Pro",      price: 499,  period: "/ GATE 2027 cycle",    cta: "Get Pro",     highlight: false, badge: "Most popular",
    perks: [
      "Everything in Free (Learn, Insights & Notes)",
      "🔓 All 2,061 practice questions — fully unlocked",
      "9 mock tests — every subject-wise mock + FLT",
      "Subject-wise SWOT & Mastery analytics",
      "Email support",
      "Access through GATE 2027 exam day",
    ] },
  { id: "premium", name: "Premium · All-Access",  price: 899,  period: "/ GATE 2027 cycle", cta: "Get Premium", highlight: true, badge: "Best value · Go all-in",
    perks: [
      "Everything in Pro, plus:",
      "💎 All 10 mocks — incl. final full-syllabus FLT",
      "Weekly progress digest on WhatsApp",
      "Priority support",
      "Early access to GATE 2028 prep content",
    ] },
] as const;

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold">Simple, honest pricing.</h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          Start free. Upgrade when you want all mocks unlocked. Cancel any time — no auto-renewal traps.
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
  // Content — free for everyone
  { feature: "Learn — concept lessons",         free: true,           pro: true,             premium: true               },
  { feature: "Study Notes",                     free: true,           pro: true,             premium: true               },
  { feature: "Insights dashboard",              free: true,           pro: true,             premium: "+ trends"         },

  // Tests
  { feature: "Full-length mock tests",          free: "1 (Mock 01)",  pro: "9 of 10",        premium: "All 10"           },

  // Practice
  { feature: "Practice Qs per subject",         free: "🔒 Pro only",  pro: "Full subject",   premium: "Full subject"     },
  { feature: "Total practice questions",        free: "🔒 Pro only",  pro: "2,061 (all free)", premium: "2,061 (all free)"   },

  // Analytics
  { feature: "Subject Mastery dashboard",       free: "Basic",        pro: "Full",           premium: "Full + trends"    },
  { feature: "SWOT analytics",                  free: "Basic",        pro: "Detailed",       premium: "Detailed + percentile" },
  { feature: "Score Trend chart",               free: true,           pro: true,             premium: "+ peer comparison" },

  // Support / extras
  { feature: "Weekly progress digest",          free: false,          pro: false,            premium: true               },
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

    // Dev-mode shortcut: skip checkout, flip the plan via the dev API.
    if (devMode) {
      setLoading(true);
      try {
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
      } catch (e) {
        alert((e as Error).message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Single checkout path for everyone else: UPI (scan & pay → submit UTR).
    router.push(`/pay/upi?plan=${plan.id}`);
  }

  return (
    <div className={`card p-8 flex flex-col ${plan.highlight ? "border-accent shadow-pop ring-2 ring-accent/40" : ""}`}>
      {plan.badge && <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${plan.highlight ? "text-accent" : "text-brand"}`}>{plan.badge}</div>}
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
        <p className="text-[11px] text-muted mt-2 text-center">Pay via UPI · QR / GPay / PhonePe / Paytm</p>
      )}
      {devMode && plan.id !== "free" && (
        <p className="text-[11px] text-muted mt-2 text-center">Skips checkout · dev tools enabled</p>
      )}
    </div>
  );
}

function safeJson(t: string): { error?: string; message?: string } | null {
  try { return JSON.parse(t); } catch { return null; }
}
