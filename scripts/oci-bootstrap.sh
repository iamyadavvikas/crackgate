#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# CrackGate OCI bootstrap — run ONCE on a fresh Oracle Cloud
# Ampere A1 (Ubuntu 22.04, aarch64) instance.
#
# Differences vs. scripts/vps-bootstrap.sh:
#   • Patches Oracle's iptables INPUT REJECT rule (ports 80/443 blocked
#     by default on OCI Ubuntu images even when UFW allows them).
#   • Runs as the `ubuntu` user with sudo (OCI images disable root login).
#   • Larger swap (4 GB) to give Next.js + Prisma builds headroom on ARM.
#   • Persists iptables changes via netfilter-persistent so they survive
#     reboots.
#
# Usage (from your laptop):
#     ssh ubuntu@<oci-public-ip>
#     export DEPLOY_USER=deploy
#     export SSH_PUBKEY="ssh-ed25519 AAAA... you@laptop"
#     curl -fsSL https://raw.githubusercontent.com/ydvikasiitkgp-arch/crackgate/main/scripts/oci-bootstrap.sh | sudo -E bash
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "❌ Run this script with sudo (e.g. 'sudo -E bash ...')." >&2
  exit 1
fi

DEPLOY_USER="${DEPLOY_USER:-deploy}"
SSH_PUBKEY="${SSH_PUBKEY:-}"

log() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }

# ── 1. Base packages ────────────────────────────────────────────
log "Updating apt + installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  ca-certificates curl gnupg lsb-release \
  ufw fail2ban unattended-upgrades \
  iptables-persistent netfilter-persistent \
  htop git jq rsync tzdata

timedatectl set-timezone Asia/Kolkata

# ── 2. Fix Oracle's iptables INPUT REJECT rule (OCI-specific) ───
# Oracle's Ubuntu image ships with:
#   -A INPUT -j REJECT --reject-with icmp-host-prohibited
# at the end of the INPUT chain, which blocks 80/443 even when UFW
# allows them. Insert ACCEPT rules above the REJECT and persist.
log "Patching iptables for ports 80/443 (OCI Ubuntu image fix)"
for port in 80 443; do
  if ! iptables -C INPUT -p tcp --dport "$port" -m state --state NEW -j ACCEPT 2>/dev/null; then
    # Insert BEFORE the REJECT rule. Position 6 works on the stock OCI image
    # (rules 1-5 are SSH/ICMP/established). If the chain has been customized,
    # fall back to inserting at the top of INPUT.
    iptables -I INPUT 6 -p tcp --dport "$port" -m state --state NEW -j ACCEPT 2>/dev/null \
      || iptables -I INPUT   -p tcp --dport "$port" -m state --state NEW -j ACCEPT
  fi
done
netfilter-persistent save

# ── 3. Docker Engine + Compose plugin ───────────────────────────
if ! command -v docker >/dev/null; then
  log "Installing Docker (arm64)"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

# ── 4. Deploy user ──────────────────────────────────────────────
if ! id "$DEPLOY_USER" &>/dev/null; then
  log "Creating user '$DEPLOY_USER'"
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  usermod -aG docker,sudo "$DEPLOY_USER"
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/bin/docker, /usr/bin/apt-get" \
    > "/etc/sudoers.d/$DEPLOY_USER"
fi

if [[ -n "$SSH_PUBKEY" ]]; then
  log "Installing SSH key for $DEPLOY_USER"
  install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
  echo "$SSH_PUBKEY" > "/home/$DEPLOY_USER/.ssh/authorized_keys"
  chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
  chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi

# ── 5. SSH hardening (only if deploy user has a working key) ────
AUTH_KEYS="/home/$DEPLOY_USER/.ssh/authorized_keys"
if [[ -s "$AUTH_KEYS" ]] && grep -qE '^(ssh-(rsa|ed25519|ecdsa)|ecdsa-sha2)' "$AUTH_KEYS"; then
  log "Hardening SSH (disable root + password login)"
  sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/'           /etc/ssh/sshd_config
  sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
  sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/'    /etc/ssh/sshd_config
  systemctl restart ssh || systemctl restart sshd
else
  echo "⚠️  SKIPPING SSH hardening — no authorized_keys for '$DEPLOY_USER'."
  echo "    Re-run with SSH_PUBKEY=\"<your-public-key>\" to harden."
fi

# ── 6. UFW (belt + suspenders alongside iptables fix) ───────────
log "Configuring UFW"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     comment 'SSH'
ufw allow 80/tcp     comment 'HTTP'
ufw allow 443/tcp    comment 'HTTPS'
ufw --force enable

# ── 7. fail2ban + auto-updates ─────────────────────────────────
log "Enabling fail2ban + unattended-upgrades"
systemctl enable --now fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades

# ── 8. Swap (4 GB on ARM — Next.js builds spike on aarch64) ────
if [[ ! -f /swapfile ]]; then
  log "Creating 4 GB swapfile"
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl vm.swappiness=10 >/dev/null
  grep -q '^vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

# ── 9. App directory ───────────────────────────────────────────
APP_DIR="/home/$DEPLOY_USER/crackgate"
if [[ ! -d "$APP_DIR" ]]; then
  log "Cloning repo into $APP_DIR (read-only HTTPS)"
  sudo -u "$DEPLOY_USER" git clone https://github.com/ydvikasiitkgp-arch/crackgate.git "$APP_DIR"
fi

cat <<EOF

✅ OCI bootstrap complete.

  Architecture : $(dpkg --print-architecture)
  Docker       : $(docker --version 2>/dev/null || echo 'not installed')
  Public ports : 22, 80, 443 (UFW + iptables)

Next steps:
  1. exit
  2. ssh ${DEPLOY_USER}@<oci-public-ip>
  3. cd ~/crackgate
  4. cp .env.production.example .env.production && nano .env.production
  5. ./scripts/deploy.sh

See ORACLE_DEPLOY.md for the full walkthrough.

EOF
