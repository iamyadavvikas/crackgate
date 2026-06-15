#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# CrackGate STAGING EC2 user-data bootstrap (Ubuntu 22.04 ARM64 on t4g.micro)
#
# Near-identical to scripts/ec2-bootstrap.sh (prod) with three deltas:
#   1. SECRET_ID points at crackgate/staging/env
#   2. NO nightly pg_dump → S3 timer (staging is disposable; it shares the prod
#      RDS instance but uses a separate `crackgate_staging` database).
#   3. Smaller box (t4g.micro, 1 GB RAM) → 1 GB swap instead of 2 GB.
#
# Idempotent — safe to re-run (e.g. via `cloud-init clean && cloud-init init`).
# ──────────────────────────────────────────────────────────────────────────────

set -euxo pipefail

AWS_REGION="ap-south-1"
APP_DIR="/opt/crackgate"
APP_USER="deploy"
SECRET_ID="crackgate/staging/env"

# ─── 1. Base packages ────────────────────────────────────────────────────────
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg jq unzip git ufw fail2ban unattended-upgrades

# ─── 2. AWS CLI v2 (arm64) ───────────────────────────────────────────────────
if ! command -v aws >/dev/null; then
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o /tmp/awscliv2.zip
  unzip -q /tmp/awscliv2.zip -d /tmp
  /tmp/aws/install
  rm -rf /tmp/aws /tmp/awscliv2.zip
fi

# ─── 3. Docker Engine + compose plugin ───────────────────────────────────────
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=arm64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5"
  },
  "default-ulimits": {
    "nofile": { "Name": "nofile", "Hard": 65536, "Soft": 65536 }
  }
}
JSON
systemctl restart docker

# ─── 4. deploy user ──────────────────────────────────────────────────────────
if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "$APP_USER"
  usermod -aG docker "$APP_USER"
fi
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# Public SSH key for GitHub Actions deploys (pasted as instance tag at launch)
IMDS_TOKEN="$(curl -fsS -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)"
INSTANCE_ID="$(curl -fsS -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null || true)"
AUTHORIZED_KEY="$(aws ec2 describe-tags --region "$AWS_REGION" \
  --filters "Name=resource-id,Values=$INSTANCE_ID" \
            "Name=key,Values=DeploySshKey" \
  --query 'Tags[0].Value' --output text 2>/dev/null || true)"
if [ -n "$AUTHORIZED_KEY" ] && [ "$AUTHORIZED_KEY" != "None" ]; then
  install -m 700 -o "$APP_USER" -g "$APP_USER" -d "/home/$APP_USER/.ssh"
  echo "$AUTHORIZED_KEY" >> "/home/$APP_USER/.ssh/authorized_keys"
  chmod 600 "/home/$APP_USER/.ssh/authorized_keys"
  chown "$APP_USER:$APP_USER" "/home/$APP_USER/.ssh/authorized_keys"
fi

# ─── 5. Pull .env.production from Secrets Manager (staging secret) ────────────
aws secretsmanager get-secret-value \
  --region "$AWS_REGION" --secret-id "$SECRET_ID" \
  --query SecretString --output text \
  > "$APP_DIR/.env.production"
chmod 600 "$APP_DIR/.env.production"
chown "$APP_USER:$APP_USER" "$APP_DIR/.env.production"

# ─── 6. systemd timer: refresh ECR auth every 6h ─────────────────────────────
cat > /usr/local/bin/ecr-login.sh <<EOF
#!/usr/bin/env bash
set -e
REGISTRY=\$(grep -E '^ECR_REGISTRY=' $APP_DIR/.env.production | cut -d= -f2)
aws ecr get-login-password --region $AWS_REGION \\
  | docker login --username AWS --password-stdin "\$REGISTRY"
EOF
chmod +x /usr/local/bin/ecr-login.sh

cat > /etc/systemd/system/ecr-login.service <<'EOF'
[Unit]
Description=Refresh ECR docker login
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/ecr-login.sh
EOF

cat > /etc/systemd/system/ecr-login.timer <<'EOF'
[Unit]
Description=Refresh ECR docker login every 6h

[Timer]
OnBootSec=2min
OnUnitActiveSec=6h
Persistent=true

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now ecr-login.timer

# ─── 7. systemd unit: crackgate compose stack (auto-start on boot) ───────────
# Staging is auto-stopped/started on a schedule (EventBridge Scheduler), so the
# stack must come up cleanly on every boot.
cat > /etc/systemd/system/crackgate.service <<EOF
[Unit]
Description=CrackGate docker compose stack (staging)
After=docker.service ecr-login.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStartPre=/usr/local/bin/ecr-login.sh
ExecStart=/usr/bin/docker compose -f docker-compose.aws.yml --env-file .env.production up -d
ExecStop=/usr/bin/docker compose -f docker-compose.aws.yml --env-file .env.production down
TimeoutStartSec=5min

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable crackgate.service
# Started by GitHub Actions on first deploy, not at bootstrap — compose file
# isn't on disk yet.

# ─── 8. Firewall (defense-in-depth; SG is primary) ───────────────────────────
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

# ─── 9. Unattended security upgrades ─────────────────────────────────────────
dpkg-reconfigure -f noninteractive unattended-upgrades
cat > /etc/apt/apt.conf.d/51-crackgate-reboot <<'EOF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "20:00";
EOF

# ─── 10. CloudWatch agent (host-level metrics) ───────────────────────────────
curl -fsSL "https://amazoncloudwatch-agent.s3.${AWS_REGION}.amazonaws.com/ubuntu/arm64/latest/amazon-cloudwatch-agent.deb" \
  -o /tmp/cwagent.deb
dpkg -i /tmp/cwagent.deb || apt-get install -fy
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<'JSON'
{
  "metrics": {
    "namespace": "CrackGate/EC2",
    "append_dimensions": { "Env": "staging" },
    "metrics_collected": {
      "mem":  { "measurement": ["mem_used_percent"], "metrics_collection_interval": 60 },
      "disk": { "measurement": ["used_percent"], "resources": ["/"], "metrics_collection_interval": 60 },
      "swap": { "measurement": ["swap_used_percent"] }
    }
  }
}
JSON
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# ─── 11. Swap (RAM = 1 GB on t4g.micro; give Node room for migrate/start) ────
if ! swapon --show | grep -q .; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf
  sysctl -p /etc/sysctl.d/99-swap.conf
fi

echo "✓ Staging EC2 bootstrap complete. Trigger first deploy by pushing to develop."
