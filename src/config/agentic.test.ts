import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderLlmsTxt, renderSitemapXml } from "../lib/discovery";

function readProjectFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function relativeLuminance(hex: string): number {
  const channels = hex
    .match(/[a-f\d]{2}/gi)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
    (a, b) => b - a
  );
  return (lighter + 0.05) / (darker + 0.05);
}

describe("agent and design contracts", () => {
  it("gives coding agents repository-specific, security-aware instructions", () => {
    const guide = readProjectFile("AGENTS.md");

    expect(guide).toContain("src/data/profile.json");
    expect(guide).toContain("src/data/experience.ts");
    expect(guide).toContain("npm run validate");
    expect(guide).toContain("usable when JavaScript is disabled, blocked, or fails");
    expect(guide).toContain("Never commit the origin IP");
  });

  it("publishes a discoverable, useful LLM-readable portfolio guide", () => {
    const llms = renderLlmsTxt();
    const layout = readProjectFile("src/layouts/BaseLayout.astro");

    expect(llms).toMatch(/^# Daniel Chan/m);
    expect(llms).toContain("https://danielchan.me/#coreweave");
    expect(llms).toContain("https://danielchan.me/#freshbooks");
    expect(llms).not.toMatch(/(?:\d{1,3}\.){3}\d{1,3}|tailscale|private key/i);
    expect(layout).toContain('href="/llms.txt"');
    expect(layout).toContain('type="text/plain"');
  });

  it("allows public indexing without exposing private infrastructure", () => {
    const robots = readProjectFile("public/robots.txt");
    const sitemap = renderSitemapXml();

    expect(robots).toContain("User-agent: *\nAllow: /");
    expect(robots).toContain("Sitemap: https://danielchan.me/sitemap.xml");
    expect(sitemap).toContain("<loc>https://danielchan.me/</loc>");
    expect(sitemap).toContain("<lastmod>2026-09-20</lastmod>");
  });

  it("uses the intentional Porsche-inspired blue palette", () => {
    const styles = readProjectFile("src/styles/global.css");

    expect(styles).toContain("--miami: #20c5e5");
    expect(styles).toContain("--baby: #a9ddf5");
    expect(styles).toContain("--oslo: #35657e");
    expect(styles).not.toMatch(/--acid|--aqua|#c7f36b|#69d9ca|#d0f788/i);
  });

  it("gives experience dates a readable visual hierarchy", () => {
    const styles = readProjectFile("src/styles/global.css");
    const dateRule = styles.match(/\.role-date\s*\{[^}]+\}/s)?.[0];
    const roleRule = styles.match(/\.role\s*\{[^}]+\}/s)?.[0];

    expect(dateRule).toContain("font-size: clamp(13px, 1vw, 15px)");
    expect(dateRule).toContain("font-weight: 500");
    expect(roleRule).toContain("grid-template-columns: minmax(150px, 0.2fr) 1fr");
  });

  it("keeps primary blue pairings above WCAG AA text contrast", () => {
    expect(contrastRatio("#071d31", "#20c5e5")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#071d31", "#a9ddf5")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#20c5e5", "#123b55")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#edf6fa", "#5d6e7e")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#edf6fa", "#35657e")).toBeGreaterThanOrEqual(4.5);
  });
});
