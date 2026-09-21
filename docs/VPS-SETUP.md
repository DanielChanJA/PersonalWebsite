# Portfolio VPS setup

This runbook rebuilds the production origin as a single-purpose portfolio host. The target is a minimal Ubuntu 26.04.1 LTS installation serving static Astro output with Apache. It intentionally has no Node.js runtime, PM2, database, container engine, mail server, or unrelated application.

The origin IP, provider credentials, certificate keys, and Tailscale credentials must remain outside this repository.

## Target state

```text
Public visitor -> Cloudflare -> ports 80/443 -> Apache -> static release
Administrator  -> Tailscale SSH -> portfolio VPS
```

- Cloudflare is the only public web client permitted at the origin.
- Administration is available only through Tailscale SSH; public OpenSSH is stopped and disabled.
- Apache serves `/var/www/danielchan.me/current`, an atomic symlink to an immutable release.
- Let's Encrypt renewal and Ubuntu security updates are automatic.
- Provider console access and snapshots are the recovery paths.

## Rebuild, do not chain-upgrade

The current legacy host runs Ubuntu 16.04.7. Reaching Ubuntu 26.04.1 through sequential in-place LTS upgrades would cross several unsupported application and configuration generations. Because this VPS has one reconstructible purpose, use a fresh provider reimage.

Reimaging destroys the VPS disk. Before starting:

1. Create and verify a provider snapshot.
2. Confirm provider console or serial-console access.
3. Record the active release target and verify the public site still works.
4. Keep a local validated checkout and production build.
5. Confirm the existing SSH public key is available locally; never copy a private key to the VPS.

Choose the minimal Ubuntu Server 26.04.1 LTS image in the provider panel. Keep the previous snapshot until the rebuilt site has passed the complete acceptance checklist.

## 1. Bootstrap the operating system

Use the provider console or its temporary key-based SSH access for the initial session:

```sh
apt update
apt full-upgrade -y
apt install -y apache2 ca-certificates certbot curl iptables python3-certbot-apache rsync unattended-upgrades
timedatectl set-timezone UTC
hostnamectl set-hostname personalwebsite-vps
dpkg-reconfigure -plow unattended-upgrades
reboot
```

After reconnecting, verify `uname -r`, `lsb_release -a`, time synchronization, and that no unexpected package service is listening. Do not install Node.js or PM2 on the origin.

## 2. Enroll Tailscale before closing public SSH

Install Tailscale using its current official Ubuntu instructions, review the installer before running it, then enroll this one host:

```sh
tailscale up --ssh --hostname=personalwebsite-vps
tailscale status
tailscale ip
```

In the tailnet policy, grant Tailscale SSH only to Daniel's administrator identity and trusted devices, preferably with check mode. Do not commit an auth key or tailnet policy export.

From a separate authorized device, open and complete a new session before changing SSH services:

```sh
ssh root@personalwebsite-vps
```

Now that the private administration path works, disable multicast LLMNR discovery, which is unnecessary on an internet server and otherwise creates a wildcard TCP/UDP 5355 listener:

```sh
scp ops/systemd/resolved.conf.d/99-portfolio.conf root@personalwebsite-vps:/tmp/99-portfolio-resolved.conf
ssh root@personalwebsite-vps "install -d -o root -g root -m 755 /etc/systemd/resolved.conf.d && install -o root -g root -m 644 /tmp/99-portfolio-resolved.conf /etc/systemd/resolved.conf.d/99-portfolio.conf && systemctl restart systemd-resolved && getent hosts danielchan.me"
```

Keep that verified session open. Install the defense-in-depth OpenSSH policy, validate it, then stop both service and socket activation:

```sh
scp ops/ssh/99-portfolio-hardening.conf root@personalwebsite-vps:/tmp/99-portfolio-hardening.conf
ssh root@personalwebsite-vps "install -o root -g root -m 644 /tmp/99-portfolio-hardening.conf /etc/ssh/sshd_config.d/99-portfolio-hardening.conf && sshd -t"
ssh root@personalwebsite-vps "systemctl disable --now ssh.service ssh.socket"
```

All `scp` commands run on the trusted workstation; commands inside quoted `ssh` arguments run on the VPS. Tailscale SSH is provided by `tailscaled`, not the disabled OpenSSH daemon. If the new Tailscale session fails, stop and recover through the still-open session or provider console.

## 3. Build and stage the first release

On the trusted workstation:

```sh
npm ci
npx playwright install chromium
npm run validate
test -z "$(git status --porcelain)"
commit_sha="$(git rev-parse --short=12 HEAD)"
release_id="$(date -u +%Y%m%dT%H%M%SZ)-$commit_sha"
ssh root@personalwebsite-vps "test ! -e /var/www/danielchan.me/releases/$release_id && install -d -o root -g www-data -m 755 /var/www/danielchan.me/releases/$release_id"
rsync -az --exclude=_headers dist/ "root@personalwebsite-vps:/var/www/danielchan.me/releases/$release_id/"
ssh root@personalwebsite-vps "test -s /var/www/danielchan.me/releases/$release_id/index.html && test -s /var/www/danielchan.me/releases/$release_id/llms.txt && test -s /var/www/danielchan.me/releases/$release_id/sitemap.xml"
ssh root@personalwebsite-vps "chown -R root:www-data /var/www/danielchan.me/releases/$release_id && find /var/www/danielchan.me/releases/$release_id -type d -exec chmod 755 {} + && find /var/www/danielchan.me/releases/$release_id -type f -exec chmod 644 {} +"
ssh root@personalwebsite-vps "ln -s releases/$release_id /var/www/danielchan.me/.current-$release_id && mv -Tf /var/www/danielchan.me/.current-$release_id /var/www/danielchan.me/current"
```

Treat release directories as immutable. Correct a bad deployment by publishing a new release or moving `current` back to a known-good one.

## 4. Configure Apache and obtain the certificate

Copy the HTTP and global-hardening configuration first:

```sh
scp ops/apache/danielchan.me.conf root@personalwebsite-vps:/etc/apache2/sites-available/danielchan.me.conf
scp ops/apache/zzz-portfolio-hardening.conf root@personalwebsite-vps:/etc/apache2/conf-available/zzz-portfolio-hardening.conf
ssh root@personalwebsite-vps "a2enmod headers ssl && a2dissite 000-default && a2ensite danielchan.me && a2enconf zzz-portfolio-hardening && apache2ctl configtest && systemctl reload apache2"
```

Confirm the proxied DNS records for the apex and `www` names point to this origin. Obtain the initial certificate with the Apache authenticator:

```sh
ssh root@personalwebsite-vps "certbot certonly --apache --non-interactive --agree-tos --email iam@danielchan.me -d danielchan.me -d www.danielchan.me"
```

Then copy and enable the reviewed TLS virtual host:

```sh
scp ops/apache/danielchan.me.ssl.conf root@personalwebsite-vps:/etc/apache2/sites-available/danielchan.me.ssl.conf
ssh root@personalwebsite-vps "a2ensite danielchan.me.ssl && apache2ctl configtest && systemctl reload apache2"
```

Never copy a certificate private key into the repository. A disaster-recovery host should normally request a fresh certificate.

## 5. Restrict the origin network

Before installation, compare the pinned ranges in `ops/firewall/apply-cloudflare-origin.sh` with Cloudflare's authoritative IPv4 and IPv6 lists. Copy the reviewed files and enable the persistent unit:

```sh
scp ops/firewall/apply-cloudflare-origin.sh root@personalwebsite-vps:/tmp/apply-cloudflare-origin-firewall
scp ops/firewall/portfolio-origin-firewall.service root@personalwebsite-vps:/tmp/portfolio-origin-firewall.service
scp ops/systemd/apache2.service.d/portfolio-origin-firewall.conf root@personalwebsite-vps:/tmp/portfolio-origin-firewall-apache.conf
ssh root@personalwebsite-vps "install -o root -g root -m 755 /tmp/apply-cloudflare-origin-firewall /usr/local/sbin/apply-cloudflare-origin-firewall && install -o root -g root -m 644 /tmp/portfolio-origin-firewall.service /etc/systemd/system/portfolio-origin-firewall.service && install -d -o root -g root -m 755 /etc/systemd/system/apache2.service.d && install -o root -g root -m 644 /tmp/portfolio-origin-firewall-apache.conf /etc/systemd/system/apache2.service.d/portfolio-origin-firewall.conf && systemctl daemon-reload && systemctl enable --now portfolio-origin-firewall.service"
```

The policy transactionally installs effective default-deny IPv4/IPv6 chains. It allows established traffic, loopback, `tailscale0`, Tailscale's UDP transport, DHCP, required ICMP, and web traffic on ports 80/443 from Cloudflare, then drops everything else. The Apache drop-in makes web startup fail if the firewall unit fails. Do not add a broad public SSH rule.

## 6. Verify automatic maintenance

Install the independent origin-certificate health check and timer:

```sh
scp ops/tls/check-origin-certificate.sh root@personalwebsite-vps:/tmp/check-origin-certificate
scp ops/tls/portfolio-certificate-health.service root@personalwebsite-vps:/tmp/portfolio-certificate-health.service
scp ops/tls/portfolio-certificate-health.timer root@personalwebsite-vps:/tmp/portfolio-certificate-health.timer
ssh root@personalwebsite-vps "install -o root -g root -m 755 /tmp/check-origin-certificate /usr/local/sbin/check-portfolio-origin-certificate && install -o root -g root -m 644 /tmp/portfolio-certificate-health.service /etc/systemd/system/portfolio-certificate-health.service && install -o root -g root -m 644 /tmp/portfolio-certificate-health.timer /etc/systemd/system/portfolio-certificate-health.timer && systemctl daemon-reload && systemctl enable --now portfolio-certificate-health.timer && systemctl start portfolio-certificate-health.service"
```

Connect provider or host-monitoring alerts to a failed `portfolio-certificate-health.service`; the repository intentionally contains no notification credential.

```sh
systemctl enable --now certbot.timer
certbot renew --dry-run --no-random-sleep-on-renew
systemctl list-timers certbot.timer
systemctl status unattended-upgrades
systemctl is-enabled apache2 certbot.timer tailscaled portfolio-origin-firewall.service portfolio-certificate-health.timer
systemctl is-enabled ssh.service ssh.socket
```

All five listed portfolio services should be enabled; OpenSSH service and socket should be disabled. Review `/etc/apt/apt.conf.d/20auto-upgrades` and the distribution's unattended-upgrades policy to confirm daily package-list refresh and security upgrades.

Schedule regular provider snapshots before risky operating-system changes. Keep snapshots short-lived and documented because they may contain certificate material and public content.

## Acceptance checklist

- `https://danielchan.me` and `https://www.danielchan.me` reach the canonical site through Cloudflare.
- HTTP redirects to canonical HTTPS.
- The certificate covers both names and `certbot renew --dry-run` succeeds.
- Local origin handshakes succeed with both `openssl s_client -tls1_2` and `-tls1_3`, and Cloudflare SSL/TLS mode is **Full (strict)**.
- Security headers match `ops/apache/` at the edge and origin.
- A Tailscale SSH session works from an authorized device.
- Public TCP port 22 and direct-origin ports 80/443 are unreachable.
- `ss -lntup` shows no unexpected public application listener and nothing on port 3000.
- LLMNR is disabled and nothing listens on port 5355.
- Apache, Tailscale, the firewall unit, Certbot and certificate-health timers, and unattended upgrades are healthy; the certificate-health failure alert is tested.
- Mobile navigation, no-JavaScript rendering, company anchors, fonts, and responsive images work.
- The production smoke workflow is green.
- The provider snapshot is retained until a later explicit cleanup decision.

## Recovery

- Bad site release: repoint `current` to the prior immutable release and reload Apache.
- Bad Apache configuration: use `apache2ctl configtest`, restore the checked-in file, and reload.
- Lost Tailscale access: use the provider console; do not reopen public password SSH as a routine fix.
- Failed reimage or boot: restore the provider snapshot, then investigate off the production path.
- Lost certificate: reissue with Certbot; do not retrieve an unencrypted private key from source control.

See [DEPLOYMENT.md](DEPLOYMENT.md) for normal releases and rollback after the host is established.
