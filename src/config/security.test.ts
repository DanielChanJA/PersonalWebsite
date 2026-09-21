import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function normalizeHeaderValue(name: string, value: string): string {
  if (name !== "Content-Security-Policy") return value.trim();

  return value
    .split(";")
    .map((directive) => directive.trim())
    .filter(Boolean)
    .sort()
    .join("; ");
}

function portableSecurityHeaders(content: string): Map<string, string> {
  const rootBlock = content.split("\n/_astro/")[0];
  return new Map(
    rootBlock
      .split("\n")
      .map((line) => line.match(/^\s{2}([\w-]+):\s*(.+)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1], normalizeHeaderValue(match[1], match[2])])
  );
}

function apacheSecurityHeaders(content: string): Map<string, string> {
  return new Map(
    [...content.matchAll(/^\s*Header always set ([\w-]+) "([^"]+)"$/gm)]
      .map((match) => [match[1], normalizeHeaderValue(match[1], match[2])])
  );
}

describe("deployment security policy", () => {
  it("keeps CI on the declared Node and npm toolchain", () => {
    const manifest = JSON.parse(readProjectFile("package.json")) as { packageManager: string };
    const npmVersion = manifest.packageManager.split("@")[1];
    const workflow = readProjectFile(".github/workflows/ci.yml");

    expect(readProjectFile(".node-version").trim()).toMatch(/^24\.\d+\.\d+$/);
    expect(workflow).toContain("node-version-file: .node-version");
    expect(workflow).toContain(`npm install --global npm@${npmVersion}`);
    expect(workflow).toContain(`test "$(npm --version)" = "${npmVersion}"`);
  });

  it("keeps portable static-host security headers enabled", () => {
    const headers = readProjectFile("public/_headers");

    for (const directive of [
      "Content-Security-Policy",
      "Cross-Origin-Opener-Policy",
      "Cross-Origin-Resource-Policy",
      "Permissions-Policy",
      "Referrer-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "X-Frame-Options"
    ]) {
      expect(headers).toContain(`${directive}:`);
    }
    expect(headers).not.toContain("'unsafe-inline'");
  });

  it("keeps shared Apache and portable security-header values aligned", () => {
    const portable = portableSecurityHeaders(readProjectFile("public/_headers"));
    const apache = apacheSecurityHeaders(readProjectFile("ops/apache/danielchan.me.ssl.conf"));

    expect(Object.fromEntries(apache)).toEqual(Object.fromEntries(portable));
  });

  it("serves the production origin as static files rather than a Node proxy", () => {
    const httpsConfig = readProjectFile("ops/apache/danielchan.me.ssl.conf");

    expect(httpsConfig).toContain("DocumentRoot /var/www/danielchan.me/current");
    expect(httpsConfig).toContain("SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1");
    expect(httpsConfig).not.toContain("ProxyPass");
    expect(httpsConfig).not.toContain(":3000");
    expect(httpsConfig).not.toContain("'unsafe-inline'");
    expect(httpsConfig).toContain("must-revalidate, no-transform");
  });

  it("prevents edge transforms from rewriting semantic contact markup", () => {
    const headers = readProjectFile("public/_headers");
    const httpsConfig = readProjectFile("ops/apache/danielchan.me.ssl.conf");

    expect(headers).toContain("must-revalidate, no-transform");
    expect(httpsConfig).toContain("must-revalidate, no-transform");
  });

  it("redirects cleartext traffic only to the canonical domain", () => {
    const httpConfig = readProjectFile("ops/apache/danielchan.me.conf");

    expect(httpConfig).toContain("Redirect permanent / https://danielchan.me/");
    expect(httpConfig).not.toContain("subdomain.me.com");
  });

  it("limits origin web traffic to Cloudflare while preserving Tailscale access", () => {
    const firewall = readProjectFile("ops/firewall/apply-cloudflare-origin.sh");
    const service = readProjectFile("ops/firewall/portfolio-origin-firewall.service");
    const apacheDependency = readProjectFile(
      "ops/systemd/apache2.service.d/portfolio-origin-firewall.conf"
    );

    expect(firewall).toContain("173.245.48.0/20");
    expect(firewall).toContain("2a06:98c0::/29");
    expect(firewall).toContain('-i tailscale0 -j ACCEPT');
    expect(firewall).toContain('--dports 80,443');
    expect(firewall).toContain('--dport 41641');
    expect(firewall).toContain('PORTFOLIO_INPUT6');
    expect(firewall).toContain('--ctstate ESTABLISHED,RELATED');
    expect(firewall).toContain('iptables-restore --noflush');
    expect(firewall).toContain("-j DROP");
    expect(service).toContain("After=network-online.target tailscaled.service");
    expect(service).toContain("Before=apache2.service");
    expect(apacheDependency).toContain("Requires=portfolio-origin-firewall.service");
    expect(apacheDependency).toContain("After=portfolio-origin-firewall.service");
  });

  it("keeps a reproducible single-purpose VPS runbook without origin secrets", () => {
    const runbook = readProjectFile("docs/VPS-SETUP.md");
    const sshPolicy = readProjectFile("ops/ssh/99-portfolio-hardening.conf");
    const resolverPolicy = readProjectFile("ops/systemd/resolved.conf.d/99-portfolio.conf");
    const ipv4Address = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/;

    expect(runbook).toContain("single-purpose portfolio host");
    expect(runbook).toContain("Ubuntu 26.04.1 LTS");
    expect(runbook).toContain("tailscale up --ssh");
    expect(runbook).toContain("certbot renew --dry-run");
    expect(runbook).toContain("unattended-upgrades");
    expect(runbook).not.toMatch(ipv4Address);
    expect(runbook).not.toMatch(/BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/i);
    expect(sshPolicy).toContain("PermitRootLogin no");
    expect(sshPolicy).toContain("PasswordAuthentication no");
    expect(sshPolicy).toContain("AllowTcpForwarding no");
    expect(resolverPolicy).toContain("LLMNR=no");
    expect(runbook).toContain("nothing listens on port 5355");
  });

  it("checks origin-certificate expiry independently of the Cloudflare edge", () => {
    const checker = readProjectFile("ops/tls/check-origin-certificate.sh");
    const service = readProjectFile("ops/tls/portfolio-certificate-health.service");
    const timer = readProjectFile("ops/tls/portfolio-certificate-health.timer");

    expect(checker).toContain("openssl x509 -checkend");
    expect(checker).toContain("PORTFOLIO_CERTIFICATE_WARNING_DAYS:-30");
    expect(service).toContain("ExecStart=/usr/local/sbin/check-portfolio-origin-certificate");
    expect(timer).toContain("OnCalendar=daily");
    expect(timer).toContain("Persistent=true");
  });
});
