# ─── Secrets Manager: holds the entire staging .env.production ────────────
resource "aws_secretsmanager_secret" "env" {
  name                    = "${var.project}/${var.env}/env"
  description             = "CrackGate staging runtime env (entire .env.production)"
  recovery_window_in_days = 0 # staging is disposable; allow immediate delete
}

# Seed an empty placeholder so the resource doesn't drift on first apply.
# Populate by running:
#   aws secretsmanager put-secret-value \
#     --secret-id crackgate/staging/env --secret-string file://.env.staging
resource "aws_secretsmanager_secret_version" "env_placeholder" {
  secret_id     = aws_secretsmanager_secret.env.id
  secret_string = "# placeholder — populate via aws secretsmanager put-secret-value"

  lifecycle {
    ignore_changes = [secret_string] # never overwrite real value
  }
}

# ─── ECR: separate staging registry (keeps prod images uncluttered) ───────
resource "aws_ecr_repository" "web" {
  name                 = "${local.name}-web"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "web" {
  repository = aws_ecr_repository.web.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 tagged images"
        selection = {
          tagStatus      = "tagged"
          tagPatternList = ["sha-*"]
          countType      = "imageCountMoreThan"
          countNumber    = 5
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Expire untagged after 3 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 3
        }
        action = { type = "expire" }
      }
    ]
  })
}

# ─── S3: staging uploads (kept separate from prod uploads) ────────────────
resource "aws_s3_bucket" "uploads" {
  bucket        = "${local.name}-uploads"
  force_destroy = true # disposable env — allow terraform destroy to clean up
  tags          = { Name = "${local.name}-uploads" }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    id     = "expire-everything-90d"
    status = "Enabled"
    filter {}
    expiration { days = 90 }
    abort_incomplete_multipart_upload { days_after_initiation = 7 }
  }
}

# ─── CloudWatch log groups (matches prod /crackgate/* convention) ─────────
# Set AWS_LOG_GROUP_WEB / AWS_LOG_GROUP_CADDY in the staging .env to these.
resource "aws_cloudwatch_log_group" "web" {
  name              = "/${var.project}/staging/web"
  retention_in_days = 7
  tags              = { Name = "${local.name}-web-logs" }
}

resource "aws_cloudwatch_log_group" "caddy" {
  name              = "/${var.project}/staging/caddy"
  retention_in_days = 7
  tags              = { Name = "${local.name}-caddy-logs" }
}
