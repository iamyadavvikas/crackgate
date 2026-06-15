# Deploying CrackGate on AWS

Production and staging for **crackgate.in** run on **AWS** (`ap-south-1` / Mumbai),
provisioned with **Terraform** and deployed via **GitHub Actions**. EC2 runs the app
as Docker Compose behind **Caddy** (auto-HTTPS), backed by **RDS Postgres**.

> **Day-to-day you don't SSH or run Terraform** — you merge a PR and CI ships it.
> This guide covers the one-time infra bootstrap and the manual break-glass paths.

---

## Architecture

| Component        | Production                                   |
| ---------------- | -------------------------------------------- |
| Compute          | EC2 `t4g.small` (arm64), Elastic IP          |
| Database         | RDS PostgreSQL 16, `db.t4g.micro`, single-AZ |
| Container images | ECR `crackgate-prod-web`                      |
| Secrets          | Secrets Manager `crackgate/prod/env`         |
| Storage          | S3 (uploads + nightly DB backups)            |
| TLS / proxy      | Caddy on the instance (Let's Encrypt)        |
| DNS              | `crackgate.in` → A record → Elastic IP (GoDaddy) |
| Region           | `ap-south-1`                                 |

Staging (`staging.crackgate.in`) is a lighter clone sharing the prod VPC/RDS — see **[STAGING.md](STAGING.md)**.

---

## Prerequisites (one-time, local)

- [ ] AWS CLI configured with profile **`crackgate`** (static IAM user, `ap-south-1`).
      **Always prefix Terraform/AWS commands with `AWS_PROFILE=crackgate`.**
- [ ] Terraform ≥ 1.6 — invoke the native arm64 binary explicitly: `/opt/homebrew/bin/terraform`.
- [ ] An SSH keypair for the EC2 deploy user (`~/.ssh/id_ed25519.pub`).
- [ ] Razorpay LIVE keys, Google OAuth client, `AUTH_SECRET` (`openssl rand -base64 48`).

Terraform state lives in S3 bucket `crackgate-tfstate` with DynamoDB lock `crackgate-tflock`
(prod key `prod/terraform.tfstate`).

---

## 1. Provision infrastructure (Terraform)

```bash
cd infra-tf
AWS_PROFILE=crackgate /opt/homebrew/bin/terraform init
AWS_PROFILE=crackgate /opt/homebrew/bin/terraform plan
AWS_PROFILE=crackgate /opt/homebrew/bin/terraform apply
```

This creates the VPC, subnets, security groups, EC2 + Elastic IP, RDS, S3, ECR,
Secrets Manager, the EC2 instance IAM profile, the GitHub OIDC deploy role, and
CloudWatch alarms / Route 53 uptime check. Note the outputs (instance ID, EIP,
ECR registry, deploy role ARN).

---

## 2. DNS

At the registrar (GoDaddy), point the domain at the Elastic IP:

| Type | Name | Content        |
| ---- | ---- | -------------- |
| A    | @    | `<elastic-ip>` |
| A    | www  | `<elastic-ip>` |

`dig crackgate.in +short` should return the EIP. Caddy obtains the Let's Encrypt
cert automatically once DNS resolves.

---

## 3. Application secrets

Populate the runtime env in Secrets Manager (`crackgate/prod/env`). Required keys:

| Key                           | How to get it                                          |
| ----------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`                | RDS endpoint + the master password set in Terraform    |
| `AUTH_SECRET`                 | `openssl rand -base64 48`                              |
| `AUTH_URL`                    | `https://crackgate.in`                                 |
| `GOOGLE_CLIENT_ID/SECRET`     | Google Cloud Console → OAuth 2.0 Client (Web)          |
| `RAZORPAY_KEY_ID/SECRET`      | Razorpay Dashboard → Settings → API Keys (LIVE)        |
| `RAZORPAY_WEBHOOK_SECRET`     | Generated when you register the webhook (§6)           |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` — baked into the client bundle at build time |

> ⚠️ **`NEXT_PUBLIC_*` are build-time.** Changing them requires a fresh image
> build (a new CI run), not just a container restart.

---

## 4. GitHub Actions secrets

In the repo settings, add the secrets the workflows consume:

- `AWS_DEPLOY_ROLE_ARN` / `AWS_DEPLOY_ROLE_ARN_STAGING` — OIDC deploy roles
- `ECR_REGISTRY`
- `EC2_SSH_KEY` — private key for the deploy user
- `PROD_EC2_HOST` / `STAGING_EC2_HOST` — instance IPs
- `SLACK_WEBHOOK_URL` — deploy notifications

Create the `staging` GitHub Environment (used by `deploy-staging.yml`).

---

## 5. Deploy

Deployment is automatic on merge:

```
PR → develop ─▶ deploy-staging.yml ─▶ staging.crackgate.in
PR → main    ─▶ deploy.yml         ─▶ crackgate.in
```

Each run: **verify** (lint + typecheck + Vitest) → **build** (arm64 image → ECR via OIDC)
→ **deploy** (SSH to EC2, `prisma migrate deploy`, container swap, healthcheck + rollback)
→ **smoke** (Playwright against the live URL).

Manual trigger: run the workflow from the Actions tab (`workflow_dispatch`).

---

## 6. Razorpay webhook

1. Razorpay Dashboard → Webhooks → **Add New Webhook**
2. URL: `https://crackgate.in/api/razorpay/webhook`
3. Secret: generate a strong random string → store in Secrets Manager as `RAZORPAY_WEBHOOK_SECRET`.
4. Events: `payment.captured`, `payment.failed`, `order.paid`, `subscription.*`
5. Re-deploy (merge to `main` or re-run the workflow).
6. Use Razorpay's "Send test event" to confirm 200 OK.

---

## 7. Backups

A nightly `pg_dump` runs on the prod instance (systemd timer) and uploads to the
S3 backups bucket. Verify with:

```bash
aws --profile crackgate s3 ls s3://crackgate-prod-backups/
```

Restore (break-glass):

```bash
gunzip -c backup.sql.gz | docker compose exec -T web psql "$DATABASE_URL"
```

---

## 8. Day-2 operations (break-glass SSH)

| Task                | Command                                                            |
| ------------------- | ------------------------------------------------------------------ |
| SSH in              | `ssh deploy@<elastic-ip>`                                          |
| Tail app logs       | `docker compose logs -f web` (or CloudWatch `/crackgate/prod/web`)  |
| Tail Caddy logs     | `docker compose logs -f caddy`                                     |
| Restart web         | `docker compose restart web`                                       |
| DB shell            | `psql "$DATABASE_URL"`                                             |
| Apply migrations    | `docker compose exec web npm run db:deploy`                        |
| Stop/start instance | EC2 console, or via the EventBridge schedules (staging only)       |

Prefer CloudWatch for logs/alarms; SSH is for break-glass only.

---

## 9. Rollback

The deploy job keeps the previous image tagged and rolls back automatically on a
failed healthcheck. Manual rollback: re-run a previous successful deploy from the
Actions tab, or on the box re-tag the last-good image in ECR and
`docker compose pull web && docker compose up -d web`.

Schema rollback: restore the most recent good dump (see §7).

---

That's it. Welcome to production. 🚀
