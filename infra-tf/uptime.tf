# ─── Uptime monitoring ────────────────────────────────────────────────────
# External black-box check of the public site. Route 53 health checkers probe
# https://<domain>/api/healthz from multiple AWS regions; if it stops returning
# 2xx/3xx we get an email. This catches whole-host / DNS / TLS / app-down events
# that the in-container healthcheck (which only runs ON the box) cannot see.
#
# Route 53 health-check metrics are published only in us-east-1, so the alarm
# and its SNS topic use the aws.us_east_1 provider alias (see versions.tf).

resource "aws_route53_health_check" "healthz" {
  fqdn              = var.domain
  port              = 443
  type              = "HTTPS"
  resource_path     = "/api/healthz"
  failure_threshold = 3
  request_interval  = 30
  measure_latency   = true

  tags = { Name = "${local.name}-healthz" }
}

# Separate SNS topic in us-east-1 (the ap-south-1 alerts topic can't be targeted
# by a us-east-1 alarm). Same email — you'll confirm a second subscription.
resource "aws_sns_topic" "uptime_alerts" {
  provider = aws.us_east_1
  name     = "${local.name}-uptime-alerts"
  tags     = { Name = "${local.name}-uptime-alerts" }
}

resource "aws_sns_topic_subscription" "uptime_email" {
  provider  = aws.us_east_1
  topic_arn = aws_sns_topic.uptime_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_metric_alarm" "healthz_down" {
  provider            = aws.us_east_1
  alarm_name          = "${local.name}-healthz-down"
  alarm_description   = "Public ${var.domain}/api/healthz is failing health checks (site likely down)."
  namespace           = "AWS/Route53"
  metric_name         = "HealthCheckStatus"
  dimensions          = { HealthCheckId = aws_route53_health_check.healthz.id }
  statistic           = "Minimum"
  comparison_operator = "LessThanThreshold"
  threshold           = 1
  period              = 60
  evaluation_periods  = 2
  treat_missing_data  = "breaching"
  alarm_actions       = [aws_sns_topic.uptime_alerts.arn]
  ok_actions          = [aws_sns_topic.uptime_alerts.arn]

  tags = { Name = "${local.name}-healthz-down" }
}
