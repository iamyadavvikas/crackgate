# CrackGate.in — Launch Checklist

Everything below is what **you** need to do before going live. The application
itself is production-ready (Next.js 15 + Postgres on AWS); the items here are
external dependencies (domain, payment gateway, OAuth, email) and operational
sign-off.

See **[DEPLOY.md](DEPLOY.md)** for infra/deploy mechanics and **[STAGING.md](STAGING.md)**
for the staging environment.

---

## 1. Things only YOU can do (blockers for launch)

### 1.1 Domain & hosting
- [ ] Domain `crackgate.in` registered (GoDaddy).
- [ ] `A` record → EC2 Elastic IP (see DEPLOY.md §2).
- [ ] TLS issued by Caddy (auto Let's Encrypt) — confirm `https://crackgate.in` loads with a valid cert.
- [ ] Verify security headers at https://securityheaders.com (target A/A+) and TLS at https://ssllabs.com (target A).

### 1.2 Google OAuth (Sign-in with Google)
- [ ] Google Cloud Console → APIs & Services → **OAuth consent screen** (external, brand "CrackGate").
- [ ] Credentials → Create OAuth Client ID → Web application.
- [ ] Authorised redirect URI: `https://crackgate.in/api/auth/callback/google` (+ `http://localhost:3000/...` for dev).
- [ ] Store `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in Secrets Manager (`crackgate/prod/env`).

### 1.3 Phone / WhatsApp OTP
- [ ] Confirm the OTP provider credentials are set in Secrets Manager and OTP delivery works end-to-end on staging.

### 1.4 Razorpay (paid plans)
- [ ] Razorpay account → KYC → activate LIVE mode.
- [ ] Create the plans (Subject Mastery, Premium All-Access) in the dashboard.
- [ ] Store `RAZORPAY_KEY_ID` / `RAZORPAY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` in Secrets Manager.
- [ ] Register the webhook (`/api/razorpay/webhook`) and store `RAZORPAY_WEBHOOK_SECRET` — see DEPLOY.md §6.
- [ ] Verify a real ₹1 test payment upgrades the user's plan server-side (via webhook, not the client).

### 1.5 Contact & legal
- [ ] Provision real inboxes: `support@`, `hello@`, `grievance@`, `legal@`, `billing@crackgate.in`.
- [ ] Update Contact / Privacy / Terms / Refund pages with the real company name, registered address, and CIN/GST.
- [ ] Have a lawyer review the legal pages before launch.

### 1.6 Content review
- [ ] Subject-matter expert (mining faculty) reviews mock/practice/PYQ questions in `apps/web/src/data/` for technical accuracy.
- [ ] Replace any placeholder testimonials/team bios with real, consented content.

---

## 2. Things you should do soon (recommended, not blockers)

### 2.1 Analytics & monitoring
- [ ] Google Analytics 4 wired into the app.
- [ ] Google Search Console — verify ownership, submit `sitemap.xml`.
- [ ] **Sentry** — confirm the DSN is set and errors are flowing (already integrated via `@sentry/nextjs`).
- [ ] Confirm the Route 53 health check + CloudWatch alarms page the right channel (Slack/SNS).

### 2.2 Transactional email
Wire up via Resend / Postmark / AWS SES (nodemailer is already a dependency):
- [ ] Welcome email on signup
- [ ] Payment receipt
- [ ] Result email after each mock

### 2.3 Social proof & marketing
- [ ] Create Instagram / YouTube / Telegram for daily MCQs; link them in the footer.
- [ ] Provide a real Open Graph banner image (1200×630 PNG) in `apps/web/public/`.

---

## 3. Security & operational sign-off

The app uses a real backend — auth via NextAuth v5 (bcrypt password hashing,
Google OAuth, phone OTP), Postgres for persistence, and server-side grading and
plan validation. Confirm the following before launch:

| Check | Status |
|-------|--------|
| Plan upgrades validated **server-side** via Razorpay webhook (never trusted from the client) | ☐ |
| Passwords hashed with bcrypt (no plaintext / reversible encoding anywhere) | ☐ |
| Admin routes behind real role-based auth (no hardcoded codes) | ☐ |
| Secrets only in Secrets Manager / GitHub Actions secrets — none committed | ☐ |
| Rate-limiting / CAPTCHA (Turnstile) on signup + OTP endpoints | ☐ |
| Email verification on signup | ☐ |
| RDS not publicly accessible; security group scoped to the app SG | ☐ |
| Nightly `pg_dump` backups landing in S3 (DEPLOY.md §7) — restore tested once | ☐ |
| Staging `noindex` confirmed; prod indexable | ☐ |

---

## 4. Pre-launch QA checklist

Test on Chrome (desktop + mobile), Firefox, Safari — against **staging** first.

### Functionality
- [ ] Sign up (email + Google + phone OTP) → land on dashboard
- [ ] Logout → log back in → dashboard remembers attempts
- [ ] Take a free mock → submit → server-graded report with charts
- [ ] Open a PYQ → run timer → submit → see solution
- [ ] Purchase a plan (test mode) → webhook upgrades plan → paywalled content unlocks
- [ ] Admin panel → role-gated, export works
- [ ] Cookie banner appears once, dismisses on accept
- [ ] "Delete my data" wipes the account (GDPR)
- [ ] 404: visit `/garbage-url` → branded 404 page
- [ ] Resize to 360px wide — no horizontal scroll on any page
- [ ] Keyboard-tab the homepage — visible focus ring; skip-link works

### Performance
- [ ] Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO (mobile).
- [ ] securityheaders.com ≥ A; ssllabs.com ≥ A.

### Content
- [ ] Spell-check every page.
- [ ] All nav/footer links resolve (no dead `#`).
- [ ] All contact emails deliverable.
- [ ] Pricing matches the live Razorpay plans.

---

## 5. What's already done (no action needed)

✅ Next.js 15 app (App Router) — home, GATE branch hubs, practice, mocks, AITS, PYQ, pricing, dashboard, admin
✅ NTA-style live exam portal (palette, mark-for-review, timer, auto-submit)
✅ Server-side grading + detailed reports; SWOT analytics (Recharts)
✅ Auth via NextAuth v5 — Google + phone OTP, bcrypt-hashed passwords
✅ Postgres persistence via Prisma (`packages/database`)
✅ Razorpay payments + webhook plan upgrades
✅ AWS infra as Terraform (`infra-tf/` prod + staging) with prod + staging environments
✅ CI/CD via GitHub Actions → ECR → EC2, with Playwright smoke tests
✅ Sentry, CloudWatch alarms, Route 53 uptime check
✅ Nightly DB backups to S3
✅ `robots.txt`, `sitemap.xml`, branded `404`, Open Graph / Twitter / JSON-LD
✅ Skip-to-content + `:focus-visible` rings (WCAG 2.1 AA)

---

## 6. Quick deploy

Deployment is automatic on merge — there is no manual deploy command:

```
PR → develop ─▶ staging.crackgate.in
PR → main    ─▶ crackgate.in
```

See **[DEPLOY.md](DEPLOY.md)** for the full pipeline and break-glass paths.

— Updated 2026
