locals {
  name = "${var.project}-${var.env}" # crackgate-staging
}

# ─── Read prod's shared infra (read-only — never mutates prod state) ───────
data "terraform_remote_state" "prod" {
  backend = "s3"
  config = {
    bucket = "crackgate-tfstate"
    key    = "prod/terraform.tfstate"
    region = var.aws_region
  }
}

data "aws_caller_identity" "current" {}

# ─── AMI: Canonical Ubuntu 22.04 ARM64 (same as prod) ─────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

# Shared OIDC provider created once per account (declared in prod too — both
# reference the same physical provider via this data source).
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}
