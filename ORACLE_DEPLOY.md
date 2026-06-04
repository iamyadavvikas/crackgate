# Deploying CrackGate to Oracle Cloud (Always Free)

End-to-end guide to ship **crackgate.in** on an Oracle Cloud Infrastructure
(OCI) **Ampere A1** ARM VM — the same Docker Compose + Caddy stack from
[DEPLOY.md](DEPLOY.md), adapted for OCI's quirks.

> **Cost:** ₹0/mo forever (Always Free tier) + your existing GoDaddy domain.
> **Capacity:** 4 OCPU / 24 GB RAM / 200 GB disk / 10 TB egress per month —
> roughly **10× the headroom of the Contabo VPS 10**, for free.

---

## 0. What you need before you start

- [ ] A credit/debit card (OCI verifies it during signup; no charges on Always Free)
- [ ] A SSH public key on your laptop: `cat ~/.ssh/id_ed25519.pub`
- [ ] Domain **crackgate.in** at GoDaddy (you have this)
- [ ] Razorpay LIVE API keys
- [ ] Google OAuth Client (Web) — redirect URI: `https://crackgate.in/api/auth/callback/google`

---

## 1. Sign up for Oracle Cloud (Always Free)

1. Go to <https://signup.cloud.oracle.com/> → start free.
2. **Home region** = **Mumbai (ap-mumbai-1)** or **Hyderabad (ap-hyderabad-1)**
   — pick one close to your users. ⚠️ **Home region is permanent** for the
   free tenancy; you can't change it later.
3. Verify email → phone OTP → enter card (no charge; ₹1 hold is refunded).
4. Wait 5–15 min for the tenancy to provision.
5. Sign in to <https://cloud.oracle.com/>.

> **Why a paid region matters:** Always Free Ampere A1 quota lives in your
> home region. Mumbai/Hyderabad capacity has been tight historically — if
> instance creation fails with "Out of host capacity", retry every few hours
> or try the other Indian region during signup. There is no fix once the
> home region is set.

---

## 2. Create the Ampere A1 ARM VM

1. **☰ menu → Compute → Instances → Create instance**.
2. **Name:** `crackgate-prod`
3. **Image & shape → Change shape:**
   - Shape series: **Ampere**
   - Shape: **VM.Standard.A1.Flex**
   - **OCPUs: 4**, **Memory: 24 GB** (the full Always Free allowance — use
     it all on one VM so the build finishes in ~2 min instead of 10).
4. **Image:** Change → **Canonical Ubuntu 22.04** (aarch64). Do **not** pick
   "Minimal" — the regular image has `cloud-init` configured for SSH out
   of the box.
5. **Primary VNIC → Subnet:** keep the default public subnet in the default
   VCN (OCI created one for you).
6. **Public IPv4:** **Assign a public IPv4 address** = Yes.
7. **SSH keys:** paste the contents of `~/.ssh/id_ed25519.pub`.
8. **Boot volume:** 100 GB (free tier allows up to 200 GB across all VMs).
   Tick **Use in-transit encryption**.
9. **Create**. Provisioning takes ~60 s.
10. Note the **Public IP** from the instance detail page.

### 2.1 Reserve the public IP (so it survives stop/start)

By default the public IP is **ephemeral** — it can change if you stop the
instance. Make it permanent:

1. Instance details → **Attached VNICs → (primary VNIC) → IP Addresses**.
2. Public IP → **Edit** → Type = **Reserved public IP** → **Create new
   reserved public IP** → name it `crackgate-prod-ip` → **Update**.

The IP itself doesn't change — only its lifecycle does. Free tier includes
2 reserved public IPs.

---

## 3. Open ports 80 and 443 (two layers)

OCI has **two firewalls in front of every VM**. You must open both or the
site will silently fail to load.

### 3.1 VCN Security List (the OCI cloud firewall)

1. Instance details → **Primary VNIC → Subnet** (click the subnet name).
2. **Security Lists → Default Security List for vcn-…**.
3. **Add Ingress Rules:**

   | Source CIDR | IP Protocol | Source Port | Destination Port |
   |-------------|-------------|-------------|------------------|
   | `0.0.0.0/0` | TCP         | All         | **80**           |
   | `0.0.0.0/0` | TCP         | All         | **443**          |

   (Port 22 is already open from the default rules.)

### 3.2 Host iptables (the Ubuntu image's firewall) — done automatically

Oracle's Ubuntu cloud image ships with an `iptables` `REJECT` rule on the
`INPUT` chain that blocks every port except 22, **even if UFW says
ALLOW**. The `oci-bootstrap.sh` script in §5 handles this for you.

> If you skip the script and configure manually, run:
> ```bash
> sudo iptables  -I INPUT 6 -m state --state NEW -p tcp --dport 80  -j ACCEPT
> sudo iptables  -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
> sudo netfilter-persistent save
> ```

---

## 4. Point GoDaddy DNS at the VM

1. Log in to <https://dcc.godaddy.com/control/portfolio> → click
   **crackgate.in** → **DNS**.
2. Delete any existing `A` records for `@` and `www` that point at the
   GoDaddy parking page.
3. **Add → A record:**

   | Type | Name | Value (your OCI public IP) | TTL    |
   |------|------|----------------------------|--------|
   | A    | `@`  | `<oci-public-ip>`          | 600 s  |
   | A    | `www`| `<oci-public-ip>`          | 600 s  |

4. Save. Propagation usually takes 5–30 min (TTL was probably 1 h before
   you reduced it).
5. Verify from your laptop:
   ```bash
   dig crackgate.in +short
   dig www.crackgate.in +short
   ```
   Both should return your OCI public IP before you continue. If they
   don't, **stop and wait** — Caddy's first HTTPS handshake (§6) needs
   correct DNS to obtain a Let's Encrypt cert.

> **Cloudflare is optional.** GoDaddy DNS + Caddy auto-TLS is enough to
> launch. If you want a CDN + DDoS later, follow §7 of
> [DEPLOY.md](DEPLOY.md) — just change nameservers at GoDaddy from the
> default to Cloudflare's.

---

## 5. Bootstrap the VM (one-time)

SSH in as the default `ubuntu` user (Oracle's Ubuntu image uses `ubuntu`,
not `root`):

```bash
ssh ubuntu@<oci-public-ip>
```

Run the OCI-aware bootstrap. Replace `<your-ssh-pubkey>` with the contents
of your local `~/.ssh/id_ed25519.pub`:

```bash
export DEPLOY_USER=deploy
export SSH_PUBKEY="ssh-ed25519 AAAA... you@laptop"
curl -fsSL https://raw.githubusercontent.com/ydvikasiitkgp-arch/crackgate/main/scripts/oci-bootstrap.sh | sudo -E bash
```

This installs Docker + Compose, creates a non-root `deploy` user, **patches
the Oracle iptables REJECT rule** to allow 80/443, enables UFW + fail2ban,
creates a 4 GB swapfile, and clones the repo into `/home/deploy/crackgate`.

Disconnect and reconnect as `deploy`:

```bash
exit
ssh deploy@<oci-public-ip>
```

---

## 6. Configure secrets and deploy

```bash
cd ~/crackgate
cp .env.production.example .env.production
nano .env.production
```

Fill in the same values as §4 of [DEPLOY.md](DEPLOY.md) — `DOMAIN`,
`POSTGRES_PASSWORD` (hex only, `openssl rand -hex 32`), `AUTH_SECRET`
(`openssl rand -base64 48`), Google + Razorpay credentials, `ACME_EMAIL`.

Then:

```bash
chmod 600 .env.production
./scripts/deploy.sh
```

First build takes ~3 min on the 4 OCPU ARM. Verify:

```bash
curl -fsS http://<oci-public-ip>/api/healthz   # 200 OK once Next.js is up
docker compose logs -f caddy                   # watch the LE cert handshake
```

Within ~30 s of DNS being correct, **https://crackgate.in** should serve a
valid Let's Encrypt cert.

---

## 7. Hook up Razorpay webhook

Same as §6 of [DEPLOY.md](DEPLOY.md) — set the webhook URL to
`https://crackgate.in/api/razorpay/webhook` and copy the secret into
`RAZORPAY_WEBHOOK_SECRET`.

---

## 8. Nightly backups

```bash
crontab -e
```

```cron
0 3 * * * /home/deploy/crackgate/scripts/backup.sh >> /home/deploy/backup.log 2>&1
```

For off-box backups, OCI gives you 20 GB of free Object Storage in your
home region — `rclone` has an `oracleobjectstorage` backend. Or use
Cloudflare R2 (free 10 GB) as the existing script supports.

---

## 9. OCI-specific gotchas (read this once)

| Problem | Symptom | Fix |
|---------|---------|-----|
| **Out of host capacity** when creating the A1 VM | Error pop-up during instance create | Retry every few hours — Mumbai A1 is oversubscribed. Use Hyderabad if available. |
| **Site loads on `http://<ip>` from the VM but not from outside** | `curl http://<ip>` works locally but times out from your laptop | You forgot the VCN Security List rule (§3.1) OR the iptables `REJECT` rule (§3.2). |
| **Public IP changes after a reboot** | DNS suddenly points to a dead IP | You skipped §2.1 — reserve the IP. |
| **VM gets "reclaimed" after 7 days idle** | Instance is gone | Always Free A1 needs ≥ 20 % monthly CPU OR a paid upgrade. Production traffic comfortably clears this; a dormant test VM may get reclaimed. Either add light synthetic traffic or upgrade to "Pay As You Go" (still ₹0 as long as you stay in free tier limits). |
| **Build OOM-killed during `npm run build`** | Dockerfile step 2 dies with exit 137 | You picked < 8 GB RAM on the flex shape. Resize to 24 GB (free). |
| **Caddy can't get a cert** | Logs show `no IP address found for ...` or `connection refused` | DNS isn't pointing at the VM yet (§4), or §3 ports aren't open. |
| **Prisma engine "Unknown OS"** | `web` container crashloops with `Cannot find module … linux-musl-arm64` | Shouldn't happen — `schema.prisma` already lists the ARM target. If it does, run `docker compose build --no-cache web`. |

---

## 10. Day-2 ops

Identical to §9 of [DEPLOY.md](DEPLOY.md). The Docker stack doesn't know
or care that it's on Oracle.

---

## 11. Migrating off Contabo (if applicable)

If you've already deployed on Contabo and want to move:

```bash
# On Contabo:
./scripts/backup.sh
scp /home/deploy/backups/crackgate-*.sql.gz deploy@<oci-ip>:~/

# On OCI (after §6 deploy succeeds):
gunzip -c crackgate-*.sql.gz | docker compose exec -T db psql -U crackgate crackgate

# Then update GoDaddy A records to the OCI IP and shut down the Contabo VPS.
```

---

That's it. Welcome to free production. 🚀
