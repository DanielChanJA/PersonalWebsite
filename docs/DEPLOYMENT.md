# Deployment and operations

## Production topology

```text
Visitor ─► Cloudflare DNS/proxy ─► Apache HTTPS origin ─► versioned static Astro release
```

The edge and origin were verified on 2026-09-20. Apache serves static files directly; the legacy root-owned Express/PM2 process is retired and port 3000 is closed. No production Node.js runtime is required.

The origin IP is intentionally absent from this public repository. Administrative SSH must use the VPS's Tailscale/MagicDNS identity, not `danielchan.me`, because the public hostname resolves to Cloudflare.

## Build contract

| Setting | Value |
| --- | --- |
| Install | `npm ci` |
| Validate | `npm run validate` |
| Build | Included in the Playwright production-preview run, or `npm run build` directly |
| Output | `dist/` |
| Node.js | 24.15 or newer |
| Runtime environment variables | None |

Do not commit or edit `dist/`; it is generated and ignored.

## Release layout

```text
/var/www/danielchan.me/
├── current -> releases/<release-id>
└── releases/
    └── <release-id>/
```

Apache configuration is version-controlled in `ops/apache/`. The enabled origin config must match these files. `public/_headers` carries the equivalent portable policy for static platforms but Apache does not interpret it.

## Release procedure

1. From a clean checkout, install and validate:

   ```sh
   npm ci
   npx playwright install chromium
   npm run validate
   ```

2. In the same shell, confirm the tree is clean, derive a traceable UTC/commit release ID, and create a new directory only if it does not already exist:

   ```sh
   test -z "$(git status --porcelain)"
   commit_sha="$(git rev-parse --short=12 HEAD)"
   release_id="$(date -u +%Y%m%dT%H%M%SZ)-$commit_sha"
   ssh root@personalwebsite-vps "test ! -e /var/www/danielchan.me/releases/$release_id && install -d -o root -g www-data -m 755 /var/www/danielchan.me/releases/$release_id"
   ```

3. Upload `dist/`. `_headers` is unnecessary on Apache and should not be publicly served:

   ```sh
   rsync -az --exclude=_headers dist/ "root@personalwebsite-vps:/var/www/danielchan.me/releases/$release_id/"
   ```

4. Verify the required output, normalize ownership and permissions, capture the rollback target, test Apache, and atomically rename a sibling symlink over `current`:

   ```sh
   previous_release="$(ssh root@personalwebsite-vps 'readlink /var/www/danielchan.me/current')"
   ssh root@personalwebsite-vps "test -s /var/www/danielchan.me/releases/$release_id/index.html && test -s /var/www/danielchan.me/releases/$release_id/llms.txt && test -s /var/www/danielchan.me/releases/$release_id/sitemap.xml"
   ssh root@personalwebsite-vps "chown -R root:www-data /var/www/danielchan.me/releases/$release_id && find /var/www/danielchan.me/releases/$release_id -type d -exec chmod 755 {} + && find /var/www/danielchan.me/releases/$release_id -type f -exec chmod 644 {} +"
   ssh root@personalwebsite-vps "apache2ctl configtest && ln -s releases/$release_id /var/www/danielchan.me/.current-$release_id && mv -Tf /var/www/danielchan.me/.current-$release_id /var/www/danielchan.me/current && systemctl reload apache2"
   printf 'Previous release: %s\nCurrent release: releases/%s\n' "$previous_release" "$release_id"
   ```

5. Smoke-test direct origin service from the host and public service through Cloudflare. Check the homepage, an `_astro` asset, `/#coreweave`, `/llms.txt`, `/sitemap.xml`, HTTP-to-HTTPS redirect, and response security headers.

Release directories are write-once and their names identify the source commit. Retain the current release and at least three known-good predecessors. Prune older inactive releases only after resolving `current`, recording the targets, and confirming rollback coverage; never reuse a release ID.

Do not include the origin address in scripts, commit history, CI logs, or documentation. Use an untracked local SSH alias or Tailscale MagicDNS name.

## Apache policy

The checked-in configuration provides:

- canonical HTTP-to-HTTPS redirect;
- TLS 1.2 on the legacy origin and TLS 1.2/1.3 automatically on modern OpenSSL;
- CSP, HSTS, anti-framing, MIME, referrer, permissions, and cross-origin headers;
- no directory indexes or `.htaccess` overrides;
- immutable caching only for fingerprinted `/_astro/` assets;
- immediate HTML revalidation;
- reduced server-version disclosure.

Run `apache2ctl configtest` before every reload. Never replace a certificate private key from this repository.

## SSH and network policy

- Enroll the host in the `danielchan.me` tailnet.
- Verify a new Tailscale SSH session from an authorized device before changing the public listener.
- Permit SSH on port 22 only through `tailscale0`; reject it on the public interface.
- Stop and disable the public OpenSSH daemon. Its defense-in-depth config also disables root, password, X11, and TCP-forwarding access if it is accidentally restarted.
- Gate Tailscale SSH root sessions with tailnet identity policy and check mode; they do not use the public OpenSSH daemon or its passwords.
- Public listeners should be limited to HTTP 80 and HTTPS 443; there must be no listener on 3000.
- Tailnet ACLs should grant SSH only to the administrator identity/device and should prefer check mode if Tailscale SSH is enabled.
- The persistent `portfolio-origin-firewall` unit applies an effective default-deny IPv4/IPv6 boundary, with explicit allowances for established traffic, loopback, `tailscale0`, Tailscale transport, network configuration, ICMP, and Cloudflare web traffic. Apache requires this unit at startup; direct public origin requests must fail.

Keep provider-console access available for recovery. Tailscale does not replace a provider snapshot or serial console during an OS upgrade.

## Operating-system lifecycle

The legacy VPS was discovered on Ubuntu 16.04.7 with an obsolete kernel. Ubuntu 16.04 left normal ESM in April 2026 and requires paid Legacy coverage; it must be replaced.

The target is a fresh Ubuntu 26.04.1 LTS server. Do not attempt a direct in-place jump: Ubuntu supports LTS release upgrades only one LTS at a time. Use the hosting control panel to snapshot the existing disk and provision/reimage a replacement, then restore only:

- the current static release;
- the checked-in Apache configuration;
- Let's Encrypt or a new origin certificate;
- Tailscale enrollment and least-privilege SSH policy;
- automated security updates and a host firewall.

Validate the replacement through its Tailscale address and a temporary origin test before moving production traffic. Keep the old VPS stopped but recoverable until post-cutover checks pass.

Follow the complete single-purpose host build and acceptance procedure in [VPS-SETUP.md](VPS-SETUP.md).

## Certificates

The origin uses a Let's Encrypt certificate. `certbot.timer` is enabled and runs twice daily. Apache HTTP-01 staging renewals succeeded on 2026-09-20 for both the apex and `www` names, including after the Cloudflare-only origin firewall was enabled. Re-run the dry-run after web-server, Cloudflare, firewall, or OS changes:

```sh
sudo certbot renew --dry-run
```

Monitor expiry externally. A successful Cloudflare edge certificate does not prove that the edge-to-origin certificate is healthy.

The host also runs `portfolio-certificate-health.timer` daily. Its check fails with 30 days remaining, leaving a failed systemd unit for provider or host monitoring to alert on. Verify the timer and alert integration after a rebuild; notification credentials are intentionally external to this repository.

## Rollback

Releases are immutable. Roll back by repointing `current` to the previous known-good directory, testing Apache configuration, and reloading:

```sh
sudo ln -s releases/<previous-release> /var/www/danielchan.me/.rollback-current
sudo mv -Tf /var/www/danielchan.me/.rollback-current /var/www/danielchan.me/current
sudo apache2ctl configtest
sudo systemctl reload apache2
```

The original Apache, SSH, PM2, and legacy application state is stored in a root-only backup on the origin. Do not restore the root Node service except as an emergency bridge; the preferred rollback is a previous static release.

## Post-deployment checks

- `https://danielchan.me` returns 200 and current copy.
- `http://danielchan.me` redirects to the canonical HTTPS URL.
- security headers are present at both the origin and Cloudflare edge.
- the mobile menu, no-JavaScript fallback, and direct company anchors work.
- responsive portrait and font assets return 200 with long-lived cache headers only on fingerprinted paths.
- Apache is healthy, port 3000 is closed, and public SSH is unreachable.
- the scheduled production smoke workflow is green.
