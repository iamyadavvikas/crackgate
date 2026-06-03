import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as amplify from "aws-cdk-lib/aws-amplify";
import * as sm  from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";

interface Props extends cdk.StackProps {
  domainName: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  cognitoIssuer: string;
  dbSecret: sm.ISecret;
  dbUrlSecret: sm.Secret;
}

/** AWS Amplify Hosting for the Next.js app + Route 53 alias.
 *
 *  Pre-requisites you create ONCE in the console (not in CDK):
 *   1. Secrets Manager secret  /crackgate/google         { clientId, clientSecret }
 *   2. Secrets Manager secret  /crackgate/razorpay       { keyId, keySecret, webhookSecret }
 *   3. Secrets Manager secret  /crackgate/nextauth       { secret }
 *   4. AWS CodeStar / GitHub App connection to your repo, ARN passed via context.
 *   5. Route 53 hosted zone for the domain.
 *
 *  After `cdk deploy`, push to `main` triggers an Amplify build that runs
 *  `npm ci && npx prisma migrate deploy && npm run build`. */
export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    // Resolve the GitHub connection ARN you created manually.
    const ghConnArn = this.node.tryGetContext("ghConnectionArn") as string | undefined;
    if (!ghConnArn) {
      cdk.Annotations.of(this).addWarning(
        "Set context ghConnectionArn=<arn> (CodeStar connection) to enable auto-deploy."
      );
    }

    const app = new amplify.CfnApp(this, "AmplifyApp", {
      name: "crackgate",
      repository: `https://github.com/${props.githubOwner}/${props.githubRepo}`,
      oauthToken: undefined,
      iamServiceRole: this.amplifyRole().roleArn,
      buildSpec: this.buildSpec(),
      platform: "WEB_COMPUTE", // Next.js SSR on Amplify hosting Lambda
      enableBranchAutoDeletion: true,
      customRules: [
        { source: "/<*>", target: "/index.html", status: "404-200" },
      ],
      environmentVariables: this.envVars(props),
      ...(ghConnArn ? {
        repository: `https://github.com/${props.githubOwner}/${props.githubRepo}`,
        accessToken: undefined,
        // Modern Amplify uses GitHub App via repository + access token; for
        // CodeStar connection you wire it through the console once.
      } : {}),
    });

    new amplify.CfnBranch(this, "MainBranch", {
      appId: app.attrAppId,
      branchName: props.githubBranch,
      enableAutoBuild: true,
      stage: "PRODUCTION",
    });

    // Route 53 alias (assumes hosted zone already exists)
    const zone = route53.HostedZone.fromLookup(this, "Zone", { domainName: props.domainName });
    new amplify.CfnDomain(this, "Domain", {
      appId: app.attrAppId,
      domainName: props.domainName,
      subDomainSettings: [
        { branchName: props.githubBranch, prefix: "" },
        { branchName: props.githubBranch, prefix: "www" },
      ],
    });

    new cdk.CfnOutput(this, "AmplifyAppId", { value: app.attrAppId });
    new cdk.CfnOutput(this, "AmplifyUrl",   { value: `https://${props.githubBranch}.${app.attrAppId}.amplifyapp.com` });
    new cdk.CfnOutput(this, "ZoneName",     { value: zone.zoneName });
  }

  private amplifyRole() {
    const role = new iam.Role(this, "AmplifyServiceRole", {
      assumedBy: new iam.ServicePrincipal("amplify.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess-Amplify")],
    });
    return role;
  }

  private buildSpec() {
    return JSON.stringify({
      version: "1.0",
      applications: [{
        appRoot: "apps/web",
        frontend: {
          phases: {
            preBuild: { commands: ["npm ci"] },
            build:    { commands: ["npx prisma generate", "npx prisma migrate deploy", "npm run build"] },
          },
          artifacts: { baseDirectory: ".next", files: ["**/*"] },
          cache:     { paths: ["node_modules/**/*", ".next/cache/**/*"] },
        },
      }],
    });
  }

  private envVars(p: Props) {
    return [
      { name: "AUTH_URL",              value: `https://${p.domainName}` },
      { name: "AUTH_TRUST_HOST",       value: "true" },
      { name: "AUTH_SECRET",           value: `secret://aws/secretsmanager:/crackgate/nextauth:secret` },
      { name: "COGNITO_CLIENT_ID",     value: p.userPoolClient.userPoolClientId },
      { name: "COGNITO_CLIENT_SECRET", value: p.userPoolClient.userPoolClientSecret.unsafeUnwrap() },
      { name: "COGNITO_ISSUER",        value: p.cognitoIssuer },
      { name: "RAZORPAY_KEY_ID",       value: `secret://aws/secretsmanager:/crackgate/razorpay:keyId` },
      { name: "RAZORPAY_KEY_SECRET",   value: `secret://aws/secretsmanager:/crackgate/razorpay:keySecret` },
      { name: "RAZORPAY_WEBHOOK_SECRET", value: `secret://aws/secretsmanager:/crackgate/razorpay:webhookSecret` },
      { name: "NEXT_PUBLIC_RAZORPAY_KEY_ID", value: `secret://aws/secretsmanager:/crackgate/razorpay:keyId` },
      { name: "AWS_REGION",            value: this.region },
      { name: "SES_FROM_EMAIL",        value: `noreply@${p.domainName}` },
      // Database URL must be assembled at build time from Secrets Manager —
      // simplest is a custom Amplify build step that reads the secret with
      // the AWS CLI and writes .env.production before npm run build.
      { name: "DATABASE_SECRET_ARN",   value: p.dbSecret.secretArn },
    ];
  }
}
