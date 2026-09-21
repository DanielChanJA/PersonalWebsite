# Origin configuration

This directory contains reviewable, non-secret configuration for the production origin.

## Apache

- `apache/danielchan.me.conf` redirects cleartext traffic to the canonical HTTPS URL.
- `apache/danielchan.me.ssl.conf` serves the versioned static release and applies response security and cache policy.
- `apache/zzz-portfolio-hardening.conf` applies global disclosure and protocol hygiene settings after distribution defaults.

Install these through Tailscale SSH, validate with `apache2ctl configtest`, and reload rather than restart. Certificate private keys, host addresses, and Tailscale credentials are deliberately excluded.

## SSH

The legacy public OpenSSH daemon is stopped and disabled. Administration uses Tailscale SSH at the untracked MagicDNS host alias `personalwebsite-vps`, with tailnet identity policy and check mode. `ssh/99-portfolio-hardening.conf` denies root/password access, forwarding, and X11 if the distribution OpenSSH daemon is accidentally re-enabled. The firewall separately rejects port 22 outside loopback and `tailscale0`.

Provider console access remains the recovery path if Tailscale is unavailable. Recreate this policy during the planned Ubuntu 26.04.1 LTS replacement rather than copying the legacy Ubuntu 16.04 configuration wholesale.

## Firewall

`firewall/apply-cloudflare-origin.sh` transactionally restores dedicated IPv4 and IPv6 input chains. They allow established traffic, loopback, `tailscale0`, Tailscale's UDP transport, DHCP, required ICMP, and web traffic from pinned official Cloudflare ranges, then drop everything else. This is an effective default-deny boundary even though the distribution's ambient `INPUT` policy remains untouched.

The systemd unit reapplies the policy after Tailscale networking is available and before Apache. `systemd/apache2.service.d/portfolio-origin-firewall.conf` also makes Apache require the firewall unit, so an enforcement failure prevents the public web service from starting on boot.

Review Cloudflare's authoritative `ips-v4` and `ips-v6` lists before changing the pinned ranges. After every update, verify DNS and DHCP, Tailscale SSH, the public Cloudflare URL, a local-origin request over Tailscale, direct-origin rejection for arbitrary ports, and a Certbot staging renewal.

The full fresh-host procedure is in [`docs/VPS-SETUP.md`](../docs/VPS-SETUP.md).

## System services

`systemd/resolved.conf.d/99-portfolio.conf` disables LLMNR with a scoped drop-in because the public, single-purpose host has no need for local multicast name discovery. This closes the default TCP/UDP 5355 wildcard listener without replacing distribution DNS settings or disabling ordinary resolution.

## TLS health

`tls/check-origin-certificate.sh` fails when the Let's Encrypt origin certificate has fewer than 30 days remaining. Its persistent daily systemd timer makes origin expiry visible independently of Cloudflare's edge certificate. Connect failed-unit monitoring from the provider or an existing alerting service to `portfolio-certificate-health.service`; no notification credential belongs in this repository.
