variable "aws_region" {
  description = "AWS region (must match prod — staging shares its VPC/RDS)."
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Project name prefix used in resource names."
  type        = string
  default     = "crackgate"
}

variable "env" {
  description = "Environment suffix."
  type        = string
  default     = "staging"
}

variable "domain" {
  description = "Public hostname for the staging site."
  type        = string
  default     = "staging.crackgate.in"
}

variable "ec2_instance_type" {
  description = "ARM64 instance type for the staging app server (smaller than prod)."
  type        = string
  default     = "t4g.micro"
}

variable "deploy_ssh_pubkey" {
  description = "Public SSH key authorized as the deploy user (reuse the prod key is fine)."
  type        = string
}

variable "github_org" {
  description = "GitHub org/user owning the repo (for OIDC trust on the deploy role)."
  type        = string
  default     = "iamyadavvikas"
}

variable "github_repo" {
  description = "GitHub repo name."
  type        = string
  default     = "crackgate"
}

variable "deploy_branch" {
  description = "Branch whose pushes are allowed to deploy to staging via OIDC."
  type        = string
  default     = "develop"
}

variable "auto_stop_cron" {
  description = "EventBridge Scheduler cron (Asia/Kolkata) to STOP staging nightly."
  type        = string
  default     = "cron(0 20 * * ? *)" # 20:00 IST daily
}

variable "auto_start_cron" {
  description = "EventBridge Scheduler cron (Asia/Kolkata) to START staging on weekday mornings."
  type        = string
  default     = "cron(0 9 ? * MON-FRI *)" # 09:00 IST Mon-Fri
}
