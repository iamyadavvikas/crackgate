# ─── SSH keypair for the staging deploy user ──────────────────────────────
resource "aws_key_pair" "deploy" {
  key_name   = "${local.name}-deploy"
  public_key = var.deploy_ssh_pubkey
}

# ─── Staging EC2 ──────────────────────────────────────────────────────────
# Lives in PROD's VPC/public subnet and reuses PROD's web security group, so
# it can reach the shared RDS (whose SG already allows the web SG) without any
# change to prod's Terraform. Cost-conscious staging, full prod isolation of
# state.
resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.ec2_instance_type
  subnet_id              = data.terraform_remote_state.prod.outputs.public_subnet_ids[0]
  vpc_security_group_ids = [data.terraform_remote_state.prod.outputs.web_security_group_id]
  key_name               = aws_key_pair.deploy.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  associate_public_ip_address = false # EIP attached instead

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    delete_on_termination = true # staging is disposable
    encrypted             = true
  }

  metadata_options {
    http_tokens                 = "required" # IMDSv2 only
    http_put_response_hop_limit = 2
    http_endpoint               = "enabled"
  }

  user_data_replace_on_change = false
  user_data                   = file("${path.module}/../../scripts/ec2-bootstrap-staging.sh")

  tags = {
    Name         = "${local.name}-web"
    DeploySshKey = var.deploy_ssh_pubkey
    SsmManaged   = "true"
  }

  lifecycle {
    ignore_changes = [
      ami,
      user_data,
      associate_public_ip_address,
    ]
  }
}

# ─── Elastic IP (stable address for staging.crackgate.in) ─────────────────
resource "aws_eip" "web" {
  domain = "vpc"
  tags   = { Name = "${local.name}-web-eip" }
}

resource "aws_eip_association" "web" {
  instance_id   = aws_instance.web.id
  allocation_id = aws_eip.web.id
}

# ─── Auto stop/start to save cost ("stop when idle") ──────────────────────
# EventBridge Scheduler stops the box nightly and starts it weekday mornings,
# so staging runs only ~13h on weekdays (~60% cheaper than always-on).
data "aws_iam_policy_document" "scheduler_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "scheduler" {
  name               = "${local.name}-scheduler"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume.json
}

data "aws_iam_policy_document" "scheduler_inline" {
  statement {
    sid       = "StartStopStaging"
    actions   = ["ec2:StartInstances", "ec2:StopInstances"]
    resources = ["arn:aws:ec2:${var.aws_region}:${data.aws_caller_identity.current.account_id}:instance/${aws_instance.web.id}"]
  }
}

resource "aws_iam_role_policy" "scheduler_inline" {
  name   = "${local.name}-scheduler-inline"
  role   = aws_iam_role.scheduler.id
  policy = data.aws_iam_policy_document.scheduler_inline.json
}

resource "aws_scheduler_schedule" "stop" {
  name = "${local.name}-stop"
  flexible_time_window {
    mode = "OFF"
  }
  schedule_expression          = var.auto_stop_cron
  schedule_expression_timezone = "Asia/Kolkata"

  target {
    arn      = "arn:aws:scheduler:::aws-sdk:ec2:stopInstances"
    role_arn = aws_iam_role.scheduler.arn
    input    = jsonencode({ InstanceIds = [aws_instance.web.id] })
  }
}

resource "aws_scheduler_schedule" "start" {
  name = "${local.name}-start"
  flexible_time_window {
    mode = "OFF"
  }
  schedule_expression          = var.auto_start_cron
  schedule_expression_timezone = "Asia/Kolkata"

  target {
    arn      = "arn:aws:scheduler:::aws-sdk:ec2:startInstances"
    role_arn = aws_iam_role.scheduler.arn
    input    = jsonencode({ InstanceIds = [aws_instance.web.id] })
  }
}
