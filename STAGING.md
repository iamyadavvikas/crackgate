# Staging environment (staging.crackgate.in)

A lightweight, cost-conscious pre-prod environment for testing mocks, timers,
palette, auto-submit and migrations against real infra **before** they reach
crackgate.in.

## Architecture

Staging is intentionally *not* a full parallel stack. It reuses prod's shared
infrastructure and only adds a small app server:

| Resource            | Staging                                                        |
| ------------------- | ------------------------------------------------------------- |
| Compute             | **new** `t4g.micro` EC2 (auto stop/start)                     |
| VPC / subnet / SG   | **shared** with prod (reuses prod's web SG → reaches RDS)      |
| Database            | **shared** prod RDS, separate `crackgate_staging` database     |
| ECR                 | **new** `crackgate-staging-web` repo                          |
| Secrets Manager     | **new** `crackgate/staging/env`                               |
| Uploads bucket      | **new** `crackgate-staging-uploads`                          |
| Terraform state     | **separate** — `staging/terraform.tfstate` (prod untouched)   |
| Deploy trigger      | push to `develop` → `.github/workflows/deploy-staging.yml`     |

> **Tradeoff:** staging shares prod's VPC and RDS instance. A heavy load test
> on staging *can* affect prod's RDS CPU/connections. Use a separate dedicated
> RDS (`db.t4g.micro`, ~₹1,000/mo) if you ever need hard isolation — bump
> `infra-tf/staging` to declare its own `aws_db_instance`.

## Cost

~₹450/mo for the `t4g.micro` if always-on; the EventBridge schedule stops it
nightly + on weekends, so realistically **~₹250–300/mo** plus the EIP (~₹300/mo
since AWS bills all public IPv4). Everything else is shared with prod.

Auto stop/start (Asia/Kolkata):
- **Stop:** 20:00 daily (`auto_stop_cron`)
- **Start:** 09:00 Mon–Fri (`auto_start_cron`)

Start it manually any time:
```bash
AWS_PROFILE=crackgate aws ec2 start-instances --region ap-south-1 \
  --instance-ids "$(cd infra-tf/staging && AWS_PROFILE=crackgate /opt/homebrew/bin/terraform output -raw ec2_instance_id)"
```

## One-time setup

All Terraform commands use the static IAM user and the native arm64 binary:

```bash
cd infra-tf/staging
cp terraform.tfvars.example terraform.tfvars   # paste the deploy SSH pubkey
AWS_PROFILE=crackgate /opt/homebrew/bin/terraform init
AWS_PROFILE=crackgate /opt/homebrew/bin/terraform plan
AWS_PROFILE=crackgate /opt/homebrew/bin/terraform apply
```

Then, in order (the `apply` output's `next_steps` prints the exact values):

1. **DNS** — add an A-record at GoDaddy:
   `staging.crackgate.in  A  <ec2_public_ip>` (no proxy; Caddy needs HTTP-01).

2. **Create the staging database** on the shared RDS. RDS is private, so run
   this from the **prod** EC2 box (which can reach RDS), using the master
   credentials already in `crackgate/prod/env`:
   ```bash
   # on the prod box:
   source /opt/crackgate/.env.production
   PGPASSWORD="$POSTGRES_PASSWORD" psql \
     "host=$RDS_HOST user=crackgate dbname=crackgate sslmode=require" \
     -c "CREATE DATABASE crackgate_staging;"
   ```

3. **Build `.env.staging`** (copy `apps/web/.env.example`, then override the
   values printed by `next_steps`):
   ```
   RDS_HOST=<shared rds endpoint>
   POSTGRES_DB=crackgate_staging
   DATABASE_URL=postgres://crackgate:<pw>@<rds>:5432/crackgate_staging?...
   DIRECT_URL=...crackgate_staging...
   DOMAIN=staging.crackgate.in
   ECR_REGISTRY=<registry>
   ECR_REPO=<staging ecr uri>
   UPLOADS_BUCKET=crackgate-staging-uploads
   AWS_LOG_GROUP_WEB=/crackgate/staging/web
   AWS_LOG_GROUP_CADDY=/crackgate/staging/caddy
   NEXT_PUBLIC_SITE_ENV=staging
   ACME_EMAIL=<your email>
   AUTH_SECRET=<openssl rand -base64 48>
   ```
   Upload it:
   ```bash
   AWS_PROFILE=crackgate aws secretsmanager put-secret-value --region ap-south-1 \
     --secret-id crackgate/staging/env --secret-string file://.env.staging
   ```

4. **GitHub repo secrets/variables** (Settings → Secrets and variables → Actions):
   - secret `AWS_DEPLOY_ROLE_ARN_STAGING` = `gha_deploy_role_arn` output
   - secret `STAGING_EC2_HOST` = `ec2_public_ip` output
   - reuse existing `EC2_SSH_KEY`, `ECR_REGISTRY`, `SLACK_WEBHOOK_URL`,
     `NEXT_PUBLIC_*` vars/secrets
   - The `staging` GitHub **Environment** is referenced by the deploy job;
     create it (no required reviewers needed).

5. **Create the `develop` branch** off `main` and push:
   ```bash
   git checkout -b develop main && git push -u origin develop
   ```
   This triggers `deploy-staging.yml`: verify → build → deploy → smoke.

## Daily workflow

```
feature branch ─▶ PR to develop ─▶ deploys to staging (auto)
                                     │  test on staging.crackgate.in
                                     ▼
                  PR develop ─▶ main ─▶ deploys to prod (auto)
```

- Push/merge to `develop` → staging deploy.
- Merge to `main` → prod deploy (unchanged).
- `workflow_dispatch` on `deploy-staging.yml` for manual redeploys.

## Teardown

Staging is disposable (buckets `force_destroy`, EBS `delete_on_termination`):
```bash
cd infra-tf/staging
AWS_PROFILE=crackgate /opt/homebrew/bin/terraform destroy
```
Then drop the staging DB on the shared RDS and remove the GoDaddy A-record.
Prod is in a separate state and is never affected.
