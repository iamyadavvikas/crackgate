# ─── AMI: Canonical Ubuntu 22.04 ARM64 ────────────────────────────────────
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

# ─── SSH keypair for deploy user ──────────────────────────────────────────
resource "aws_key_pair" "deploy" {
  key_name   = "${local.name}-deploy"
  public_key = var.deploy_ssh_pubkey
}

# ─── EC2 instance ─────────────────────────────────────────────────────────
resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = aws_key_pair.deploy.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  associate_public_ip_address = false # we attach an EIP instead

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = false # protect against accidental terraform destroy
    encrypted             = true
  }

  metadata_options {
    http_tokens                 = "required" # IMDSv2 only
    http_put_response_hop_limit = 2          # so containers can reach IMDS
    http_endpoint               = "enabled"
  }

  user_data_replace_on_change = false # editing user-data should not destroy the box

  # Bootstrap script lives in repo. We render it inline so the EC2 picks it up
  # on first boot. Idempotent — safe even if the instance reboots later.
  user_data = file("${path.module}/../scripts/ec2-bootstrap.sh")

  tags = {
    Name         = "${local.name}-web"
    DeploySshKey = var.deploy_ssh_pubkey # picked up by bootstrap script
    SsmManaged   = "true"
  }

  lifecycle {
    ignore_changes = [
      ami,       # so we don't recreate the box when Canonical publishes a new AMI
      user_data, # edit script + re-run on box; don't trigger replacement
    ]
  }
}

# ─── Elastic IP (so DNS points at a stable address across reboots) ────────
resource "aws_eip" "web" {
  domain = "vpc"
  tags   = { Name = "${local.name}-web-eip" }
}

resource "aws_eip_association" "web" {
  instance_id   = aws_instance.web.id
  allocation_id = aws_eip.web.id
}

# ─── CloudWatch alarms (free tier covers 10 alarms) ───────────────────────
resource "aws_cloudwatch_metric_alarm" "ec2_cpu_high" {
  alarm_name          = "${local.name}-ec2-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "EC2 CPU > 80% for 15 min"

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  dimensions = {
    InstanceId = aws_instance.web.id
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${local.name}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 75
  alarm_description   = "RDS CPU > 75% for 15 min"

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.identifier
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {
  alarm_name          = "${local.name}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 2 * 1024 * 1024 * 1024 # 2 GB free
  alarm_description   = "RDS free storage < 2 GB"

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.identifier
  }
}
