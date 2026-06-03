import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fmtDate } from "@/lib/utils";

export const metadata = { title: "Account Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/settings");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const plan = user.plan;
  const planClass = plan === "premium" ? "badge-premium" : plan === "pro" ? "badge-pro" : "badge-free";

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold">Account Settings</h1>
      <p className="text-muted mt-1">Manage your profile, subscription and preferences.</p>

      {/* Profile */}
      <Section title="Profile" subtitle="How you appear on CrackGate.">
        <Field label="Full name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="Phone" value={user.phone ?? "—"} verified={!!user.phoneVerified} />
        <Field label="Target year" value={user.targetYear ?? "—"} />
        <Field label="Current status" value={user.currentStatus ?? "—"} />
        <p className="text-xs text-muted">Profile editing UI is coming soon. Reach out at <Link href="/contact" className="underline">/contact</Link> to update fields meanwhile.</p>
      </Section>

      {/* Subscription */}
      <Section title="Subscription" subtitle="Your current plan and renewal status.">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-gradient-to-br from-brand/5 to-accent/5 border border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className={`badge ${planClass}`}>{plan.toUpperCase()}</span>
              {plan === "free" && <span className="text-xs text-muted">No active subscription</span>}
            </div>
            {user.planExpiry && plan !== "free" && (
              <p className="text-xs text-muted mt-1">Renews / expires on <b>{fmtDate(user.planExpiry)}</b></p>
            )}
          </div>
          {plan === "free" ? (
            <Link href="/pricing" className="btn btn-accent text-sm">Upgrade</Link>
          ) : (
            <Link href="/pricing" className="btn btn-ghost text-sm">Manage plan</Link>
          )}
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" subtitle="How we reach you.">
        <Field label="Email notifications" value="Receipts, weekly digest (Premium)" />
        <Field label="WhatsApp notifications" value={user.phone ? "Receipts & OTP enabled" : "Add a phone to enable"} />
      </Section>

      {/* Account meta */}
      <Section title="Account">
        <Field label="Account created" value={fmtDate(user.createdAt)} />
        <Field label="Last login" value={user.lastLoginAt ? fmtDate(user.lastLoginAt) : "—"} />
        <Field label="Role" value={user.role} />
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone" subtitle="Irreversible actions.">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-900">Delete account</p>
          <p className="text-xs text-rose-800/80 mt-1">
            Permanently delete your CrackGate account, attempts, and personal data. This cannot be undone.
            Contact <Link href="/contact" className="underline">/contact</Link> to request deletion.
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 mt-6">
      <h2 className="font-bold text-lg">{title}</h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm gap-3">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-right">
        {value}
        {verified && <span className="ml-2 text-ok text-xs">✓ verified</span>}
      </span>
    </div>
  );
}
