# CrackGate AWS Infrastructure (CDK v2)

Provisions:

- **VPC** — 2 AZs, public + isolated subnets, no NAT
- **Cognito User Pool** with Google as the only identity provider
- **Aurora Serverless v2 Postgres** (0.5 → 4 ACU autoscale)
- **Amplify Hosting** for the Next.js app (`apps/web/`) with auto-deploy from GitHub
- **Route 53** alias for `crackgate.in` and `www.crackgate.in`

## One-time setup (do these in the AWS Console first)

1. Buy / transfer the domain into Route 53 → note the hosted zone ID.
2. Create the secrets in **AWS Secrets Manager** (Mumbai region):
   - `/crackgate/google`     → `{ "clientId": "...", "clientSecret": "..." }`
   - `/crackgate/razorpay`   → `{ "keyId": "...", "keySecret": "...", "webhookSecret": "..." }`
   - `/crackgate/nextauth`   → `{ "secret": "<openssl rand -base64 32>" }`
3. Create a **CodeStar Connection** to your GitHub repo. Copy its ARN.
4. Install AWS CLI, run `aws configure` once with an admin profile.

## Deploy

```bash
cd infra
npm ci

# bootstrap CDK in your AWS account (once per region)
npx cdk bootstrap aws://<account-id>/ap-south-1

# deploy everything
npx cdk deploy --all \
  --context domain=crackgate.in \
  --context ghOwner=<your-github-username> \
  --context ghRepo=crackgate \
  --context ghBranch=main \
  --context ghConnectionArn=arn:aws:codestar-connections:ap-south-1:<acct>:connection/<uuid>
```

Outputs:
- `CognitoDomain` — paste into `COGNITO_ISSUER` for local dev
- `UserPoolClientId` + secret — into `apps/web/.env`
- `DbEndpoint` — combine with the `/crackgate/db/master` secret to form your `DATABASE_URL`
- `AmplifyUrl` — temporary URL until Route 53 finishes verifying the domain

## Destroying

```bash
npx cdk destroy --all
```

This will **retain** the database (snapshot) and Cognito user pool by default. Remove the
`RemovalPolicy.RETAIN` / `SNAPSHOT` in `lib/*-stack.ts` if you really want to nuke them.

## Cost estimate

| Resource | Idle / launch | Notes |
|----------|---------------|-------|
| Aurora Serverless v2 (0.5 ACU) | ~₹3,500 / mo | Largest fixed cost |
| Amplify Hosting | ~₹400 / mo (build min + 5 GB egress) | Scales with traffic |
| Cognito  | ₹0 (≤ 50K MAU) | |
| Secrets Manager | ~₹35 / mo per secret × 3 | |
| Route 53 | ~₹50 / mo per hosted zone | |
| SES | ~₹0.10 / email | |
| **Total (idle)** | **~₹4,000 / mo** | |
