# CrackGate — Next.js + AWS App

Production-grade rewrite of the static CrackGate site as a true 3-tier app.

| Layer    | Tech                                              |
|----------|---------------------------------------------------|
| Frontend | Next.js 15 (App Router) · React 19 · Tailwind 3   |
| Backend  | Next.js Route Handlers (API routes) · NextAuth v5 |
| Database | PostgreSQL via Prisma                             |
| Hosting  | AWS Amplify (SSR) · Cognito · Aurora Serverless   |
| Payments | Razorpay (HMAC-verified webhook)                  |

---

## Quick start (local)

### 0. Prereqs

- Node 20+
- Docker (for local Postgres)

### 1. Install

```bash
cd apps/web
npm install
```

### 2. Start local Postgres

```bash
docker run --name cg-pg -e POSTGRES_PASSWORD=pg -p 5432:5432 -d postgres:16
```

### 3. Configure env

```bash
cp .env.example .env.local
# Edit .env.local:
#   DATABASE_URL=postgresql://postgres:pg@localhost:5432/postgres?schema=public
#   AUTH_SECRET=$(openssl rand -base64 32)
#   COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, COGNITO_ISSUER — from `cdk deploy` outputs
#   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET — from Razorpay dashboard
```

### 4. Initialise DB

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run

```bash
npm run dev
# → http://localhost:3000
```

Sign in with Google (via the Cognito hosted UI). Demo accounts seeded:
- `admin@crackgate.in` — role `admin`, plan `premium`
- `demo@crackgate.in`  — role `user`, plan `free`

---

## Deploy to AWS

See [`../infra/README.md`](../infra/README.md) for the CDK stack. Short version:

```bash
cd ../infra && npm ci && npx cdk deploy --all \
  --context domain=crackgate.in \
  --context ghOwner=<you> --context ghRepo=crackgate
```

Then push `main` to GitHub → Amplify builds and deploys automatically.

---

## How the old site maps to the new app

| Old static URL                  | New Next.js route                       |
|---------------------------------|-----------------------------------------|
| `/index.html`                   | `/`                                     |
| `/pages/login.html`             | `/login`                                |
| `/pages/dashboard.html`         | `/dashboard`                            |
| `/pages/pyq.html`               | `/pyq` · `/pyq/[year]`                  |
| `/pages/mocks.html`             | `/mocks` · `/mocks/[id]`                |
| `/pages/pricing.html`           | `/pricing`                              |
| `/pages/privacy.html`           | `/privacy`                              |
| `/pages/terms.html`             | `/terms`                                |
| `/pages/refund.html`            | `/refund`                               |
| `/pages/contact.html`           | `/contact`                              |
| `/pages/faq.html`               | `/faq`                                  |
| `/pages/study-material.html`    | `/study` (stub)                         |
| `/pages/resources.html`         | `/resources` (stub)                     |

---

## Where things live now

```
apps/web/
├── prisma/
│   ├── schema.prisma       ← User, Attempt, Activity, Payment, NextAuth tables
│   └── seed.ts             ← demo data
├── src/
│   ├── app/
│   │   ├── api/            ← BACKEND
│   │   │   ├── auth/[...nextauth]/      ← Cognito sign-in
│   │   │   ├── attempts/                ← Submit + grade (server-side)
│   │   │   ├── razorpay/order, webhook  ← Payments
│   │   │   ├── me/                      ← Profile read/write
│   │   │   └── activity/                ← Activity feed
│   │   ├── (pages)         ← FRONTEND server components
│   │   └── result/[id]/    ← Post-exam analytics
│   ├── components/
│   │   ├── exam-portal.tsx ← NTA-style live test UI
│   │   ├── site-header.tsx, site-footer.tsx
│   ├── data/
│   │   ├── pyq.ts          ← 12 years · 780 questions (ported from static)
│   │   └── mocks.ts        ← 10 mocks · 200 questions
│   ├── lib/
│   │   ├── auth.ts         ← NextAuth config
│   │   ├── db.ts           ← Prisma singleton
│   │   └── grading.ts      ← MCQ/MSQ/NAT scoring rules
│   └── middleware.ts       ← Route protection
└── public/                 ← favicon, robots.txt
```

---

## Plan-gating

Server enforces in [`src/app/api/attempts/route.ts`](src/app/api/attempts/route.ts):
- **free** plan → only `mock-01` and PYQ years `2024`/`2025`
- everything else returns **HTTP 402** → client redirects to `/pricing`

---

## Razorpay flow

1. Client `POST /api/razorpay/order` → server creates Razorpay order, persists `Payment` row.
2. Client opens Razorpay Checkout with returned `orderId`.
3. On payment, Razorpay POSTs to `/api/razorpay/webhook`.
4. Server verifies HMAC-SHA256 signature (timing-safe), flips `users.plan`, sets `planExpiry`.
5. Client polls `/dashboard?upgrade=success`.

The webhook URL to register in Razorpay dashboard:
`https://crackgate.in/api/razorpay/webhook` with the same secret as `RAZORPAY_WEBHOOK_SECRET`.

---

## Scripts

```bash
npm run dev          # local dev server
npm run build        # production build
npm start            # serve production build
npx prisma studio    # GUI to inspect the DB
npx prisma migrate dev --name <change>  # create a new migration
```
