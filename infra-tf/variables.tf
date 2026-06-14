variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Project name prefix used in resource names"
  type        = string
  default     = "crackgate"
}

variable "env" {
  description = "Environment suffix"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "admin_ip_cidr" {
  description = "Your home/office IP in CIDR form for SSH access (use 'curl ifconfig.me' to find it)"
  type        = string
  # No default — must be set in terraform.tfvars to avoid accidentally
  # exposing port 22 to the world.
}

variable "ec2_instance_type" {
  description = "ARM64 instance type for the app server"
  type        = string
  default     = "t4g.small"
}

variable "rds_instance_class" {
  description = "RDS instance class (ARM64)"
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_allocated_storage_gb" {
  description = "RDS storage in GB (gp3)"
  type        = number
  default     = 20
}

variable "rds_backup_retention_days" {
  description = "Days to retain automated RDS backups (1–35)"
  type        = number
  default     = 7
}

variable "domain" {
  description = "Public domain name (DNS managed in Cloudflare, not Route 53)"
  type        = string
  default     = "crackgate.in"
}

variable "alert_email" {
  description = "Email address that receives CloudWatch alarm notifications (SNS). Confirm the subscription via the email AWS sends after apply."
  type        = string
  # No default - set in terraform.tfvars so alarms always have a destination.
}

variable "github_org" {
  description = "GitHub org/user owning the repo (for OIDC trust on the deploy role)"
  type        = string
  default     = "iamyadavvikas"
}

variable "github_repo" {
  description = "GitHub repo name"
  type        = string
  default     = "crackgate"
}

variable "deploy_ssh_pubkey" {
  description = "Public SSH key authorized to log in as the deploy user (paste contents of ~/.ssh/id_ed25519.pub)"
  type        = string
}
