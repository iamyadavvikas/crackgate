import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { AdminCharts } from "@/components/admin-charts";

export const dynamic = "force-dynamic";

function inr(paise: number): string {
  return "₹" + Math.round(paise / 100).toLocaleString("en-IN");
}

export default async function AdminPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/login?next=/admin");
  }

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 86400_000);
  const since7 = new Date(now.getTime() - 7 * 86400_000);
  const since1 = new Date(now.getTime() - 86400_000);

  const [
    totalUsers,
    usersByPlan,
    signups1,
    signups7,
    signups30,
    activeUsers7,
    attempts1,
    attempts7,
    attempts30,
    revenue30,
    revenueLifetime,
    recentUsers,
    recentPayments,
    recentActivity,
  ] = await Promise.all([
    db.user.count(),
    db.user.groupBy({ by: ["plan"], _count: { _all: true } }),
    db.user.count({ where: { createdAt: { gte: since1 } } }),
    db.user.count({ where: { createdAt: { gte: since7 } } }),
    db.user.count({ where: { createdAt: { gte: since30 } } }),
    db.user.count({ where: { lastLoginAt: { gte: since7 } } }),
    db.attempt.count({ where: { takenAt: { gte: since1 } } }),
    db.attempt.count({ where: { takenAt: { gte: since7 } } }),
    db.attempt.count({ where: { takenAt: { gte: since30 } } }),
    db.payment.aggregate({
      where: { status: "captured", capturedAt: { gte: since30 } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.payment.aggregate({
      where: { status: "captured" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, email: true, name: true, plan: true, createdAt: true, lastLoginAt: true },
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { email: true, name: true } } },
    }),
    db.activity.findMany({
      orderBy: { ts: "desc" },
      take: 15,
      include: { user: { select: { email: true } } },
    }),
  ]);

  const planMap: Record<string, number> = { free: 0, pro: 0, premium: 0 };
  for (const r of usersByPlan) planMap[r.plan] = r._count._all;
  const paidUsers = planMap.pro + planMap.premium;
  const conversionPct = totalUsers ? Math.round((paidUsers / totalUsers) * 1000) / 10 : 0;

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Founder Console</h1>
          <p className="text-muted mt-1">
            Logged in as <b>{admin.email}</b> ·{" "}
            <span className="text-xs">access via {admin.source === "env" ? "ADMIN_EMAILS" : "User.role"}</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap text-sm">
          <Link href="/admin/questions" className="btn btn-primary text-sm">📚 Question bank</Link>
          <ExportBtn dataset="users" label="📥 Users CSV" />
          <ExportBtn dataset="payments" label="💰 Payments CSV" />
          <ExportBtn dataset="attempts" label="🧪 Attempts CSV" />
          <ExportBtn dataset="activity" label="📜 Activity CSV" />
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Kpi label="Total users" value={totalUsers} sub={`${signups1} today · ${signups7} this week`} icon="👥" />
        <Kpi label="Paid users" value={paidUsers} sub={`${planMap.pro} Pro · ${planMap.premium} Premium · ${conversionPct}% conversion`} icon="💎" tone="ok" />
        <Kpi label="Active (7d)" value={activeUsers7} sub={`${attempts7} attempts in last 7 days`} icon="📈" />
        <Kpi
          label="Revenue (30d)"
          value={inr(revenue30._sum.amount ?? 0)}
          sub={`${revenue30._count._all} payments · lifetime ${inr(revenueLifetime._sum.amount ?? 0)}`}
          icon="🪙"
          tone="ok"
        />
      </div>

      <AdminCharts />

      {/* Plan breakdown + funnel */}
      <section className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-lg">Plan breakdown</h2>
          <div className="mt-4 space-y-3">
            {(["free", "pro", "premium"] as const).map((plan) => {
              const n = planMap[plan];
              const pct = totalUsers ? Math.round((n / totalUsers) * 100) : 0;
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-semibold">{plan}</span>
                    <span className="text-muted">
                      {n} <span className="text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.max(2, pct)}%`,
                        background: plan === "premium" ? "var(--brand-2, #7c3aed)" : plan === "pro" ? "var(--brand, #4f46e5)" : "var(--muted, #94a3b8)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg">Engagement</h2>
          <ul className="text-sm mt-4 space-y-2">
            <li className="flex justify-between"><span>Attempts today</span><b>{attempts1}</b></li>
            <li className="flex justify-between"><span>Attempts last 7d</span><b>{attempts7}</b></li>
            <li className="flex justify-between"><span>Attempts last 30d</span><b>{attempts30}</b></li>
            <li className="flex justify-between"><span>New signups today</span><b>{signups1}</b></li>
            <li className="flex justify-between"><span>New signups last 30d</span><b>{signups30}</b></li>
          </ul>
        </div>
      </section>

      {/* Recent users */}
      <section className="mt-10 card p-6 overflow-x-auto">
        <div className="flex justify-between items-end flex-wrap gap-2">
          <h2 className="font-bold text-lg">Recent signups</h2>
          <a href="/api/admin/export?dataset=users" className="text-sm text-brand hover:underline">Download all users (CSV) →</a>
        </div>
        <table className="w-full text-sm mt-4">
          <thead className="text-muted text-left border-b border-line">
            <tr>
              <th className="py-2">Email</th>
              <th className="py-2">Name</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Joined</th>
              <th className="py-2">Last login</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u.id} className="border-b border-line/60">
                <td className="py-2.5 font-medium">{u.email}</td>
                <td className="py-2.5">{u.name}</td>
                <td className="py-2.5">
                  <span className={`badge ${u.plan !== "free" ? "badge-pro" : ""}`}>{u.plan.toUpperCase()}</span>
                </td>
                <td className="py-2.5 text-muted">{fmtDate(u.createdAt)}</td>
                <td className="py-2.5 text-muted">{u.lastLoginAt ? fmtDate(u.lastLoginAt) : "—"}</td>
              </tr>
            ))}
            {recentUsers.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-muted">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Recent payments */}
      <section className="mt-10 card p-6 overflow-x-auto">
        <div className="flex justify-between items-end flex-wrap gap-2">
          <h2 className="font-bold text-lg">Recent payments</h2>
          <a href="/api/admin/export?dataset=payments" className="text-sm text-brand hover:underline">Download all payments (CSV) →</a>
        </div>
        <table className="w-full text-sm mt-4">
          <thead className="text-muted text-left border-b border-line">
            <tr>
              <th className="py-2">Email</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
              <th className="py-2">Created</th>
              <th className="py-2">Captured</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((p) => (
              <tr key={p.id} className="border-b border-line/60">
                <td className="py-2.5 font-medium">{p.user.email}</td>
                <td className="py-2.5"><span className="badge">{p.plan.toUpperCase()}</span></td>
                <td className="py-2.5">{inr(p.amount)}</td>
                <td className="py-2.5">
                  <span className={p.status === "captured" ? "text-ok" : p.status === "failed" ? "text-bad" : "text-accent"}>
                    {p.status}
                  </span>
                </td>
                <td className="py-2.5 text-muted">{fmtDate(p.createdAt)}</td>
                <td className="py-2.5 text-muted">{p.capturedAt ? fmtDate(p.capturedAt) : "—"}</td>
              </tr>
            ))}
            {recentPayments.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-muted">No payments yet — once Razorpay is live, captures show here.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Recent activity */}
      <section className="mt-10 card p-6 overflow-x-auto">
        <div className="flex justify-between items-end flex-wrap gap-2">
          <h2 className="font-bold text-lg">Recent activity</h2>
          <a href="/api/admin/export?dataset=activity" className="text-sm text-brand hover:underline">Download activity log (CSV) →</a>
        </div>
        <table className="w-full text-sm mt-4">
          <thead className="text-muted text-left border-b border-line">
            <tr>
              <th className="py-2">When</th>
              <th className="py-2">User</th>
              <th className="py-2">Event</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((a) => (
              <tr key={a.id} className="border-b border-line/60">
                <td className="py-2.5 text-muted">{fmtDate(a.ts)}</td>
                <td className="py-2.5">{a.user.email}</td>
                <td className="py-2.5"><span className="badge">{a.type}</span></td>
              </tr>
            ))}
            {recentActivity.length === 0 && (
              <tr><td colSpan={3} className="py-6 text-center text-muted">No activity yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-muted mt-10 text-center">
        Founder-only view · grant access by setting <code>ADMIN_EMAILS=&quot;you@example.com&quot;</code> in <code>.env.local</code> or
        updating <code>User.role = &quot;admin&quot;</code> in the database.
        <br />
        <Link href="/dashboard" className="text-brand hover:underline">← Back to user dashboard</Link>
      </p>
    </div>
  );
}

function Kpi({
  label, value, sub, icon, tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  tone?: "ok" | "accent" | "bad";
}) {
  const toneClass = tone === "ok" ? "text-ok" : tone === "bad" ? "text-bad" : tone === "accent" ? "text-accent" : "";
  return (
    <div className="card p-5">
      <div className="text-2xl">{icon}</div>
      <div className={`text-3xl font-extrabold mt-2 ${toneClass}`}>{value}</div>
      <div className="text-sm text-muted mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted mt-2">{sub}</div>}
    </div>
  );
}

function ExportBtn({ dataset, label }: { dataset: string; label: string }) {
  return (
    <a href={`/api/admin/export?dataset=${dataset}`} className="btn btn-ghost text-sm">
      {label}
    </a>
  );
}
