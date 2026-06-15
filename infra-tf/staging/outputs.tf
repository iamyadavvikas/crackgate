output "ec2_public_ip" {
  description = "Staging Elastic IP. Point the staging.crackgate.in A-record here."
  value       = aws_eip.web.public_ip
}

output "ec2_instance_id" {
  description = "Staging EC2 instance id (for manual start/stop)."
  value       = aws_instance.web.id
}

output "ec2_ssh" {
  description = "SSH to the staging box."
  value       = "ssh -i ~/.ssh/id_ed25519 ubuntu@${aws_eip.web.public_ip}  # then: sudo -iu deploy"
}

output "ecr_registry" {
  description = "ECR registry host (same account as prod)."
  value       = split("/", aws_ecr_repository.web.repository_url)[0]
}

output "ecr_repo_uri" {
  description = "Staging ECR repo URI."
  value       = aws_ecr_repository.web.repository_url
}

output "uploads_bucket" {
  description = "Staging S3 uploads bucket."
  value       = aws_s3_bucket.uploads.bucket
}

output "secret_id" {
  description = "Secrets Manager secret holding the staging .env.production."
  value       = aws_secretsmanager_secret.env.name
}

output "gha_deploy_role_arn" {
  description = "Set as the AWS_DEPLOY_ROLE_ARN_STAGING GitHub Actions secret."
  value       = aws_iam_role.gha_deploy.arn
}

output "rds_endpoint" {
  description = "Shared RDS endpoint (staging uses the crackgate_staging database)."
  value       = data.terraform_remote_state.prod.outputs.rds_endpoint
}

output "next_steps" {
  description = "Staging hand-off checklist."
  value       = <<-EOT

    ✓ Staging infra provisioned. Now (see STAGING.md for detail):

    1. DNS — add an A-record (GoDaddy):
         staging.crackgate.in   A   ${aws_eip.web.public_ip}

    2. One-time DB bootstrap on the SHARED RDS (run from prod EC2 which can
       reach RDS, using the master creds in crackgate/prod/env):
         CREATE DATABASE crackgate_staging;

    3. Build .env.staging and upload it:
         aws secretsmanager put-secret-value --region ${var.aws_region} \\
           --secret-id ${aws_secretsmanager_secret.env.name} \\
           --secret-string file://.env.staging
       Key values:
         RDS_HOST        = ${data.terraform_remote_state.prod.outputs.rds_endpoint}
         POSTGRES_DB     = crackgate_staging
         ECR_REGISTRY    = ${split("/", aws_ecr_repository.web.repository_url)[0]}
         ECR_REPO        = ${aws_ecr_repository.web.repository_url}
         DOMAIN          = ${var.domain}
         UPLOADS_BUCKET  = ${aws_s3_bucket.uploads.bucket}
         AWS_LOG_GROUP_WEB   = /${var.project}/staging/web
         AWS_LOG_GROUP_CADDY = /${var.project}/staging/caddy

    4. GitHub repo secrets/vars for the staging workflow:
         secret  AWS_DEPLOY_ROLE_ARN_STAGING = ${aws_iam_role.gha_deploy.arn}
         secret  STAGING_EC2_HOST            = ${aws_eip.web.public_ip}
         (reuse  EC2_SSH_KEY, ECR_REGISTRY, SLACK_WEBHOOK_URL)

    5. Create the `develop` branch and push → deploy-staging.yml runs.
  EOT
}
