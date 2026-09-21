import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeEach, describe, expect, it } from "vitest";
import Contact from "./Contact.astro";
import ExperienceSection from "./ExperienceSection.astro";
import SiteHeader from "./SiteHeader.astro";

describe("portfolio components", () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  it("renders one standalone section and index link for every employer", async () => {
    const html = await container.renderToString(ExperienceSection);
    const companySections = html.match(/data-company=/g) ?? [];

    expect(companySections).toHaveLength(6);
    expect(html).toContain('id="coreweave"');
    expect(html).toContain('id="verily"');
    expect(html).toContain('id="shipt"');
    expect(html).toContain('id="tiktok"');
    expect(html).toContain('id="slync"');
    expect(html).toContain('id="freshbooks"');
    expect(html).toContain('href="#coreweave"');
    expect(html).toContain('href="#freshbooks"');
  });

  it("renders current-role details from the résumé", async () => {
    const html = await container.renderToString(ExperienceSection);

    expect(html).toContain("Senior Security Software Engineer");
    expect(html).toContain("15TB of logs daily");
    expect(html).toContain("Current");
  });

  it("exposes accessible primary navigation targets", async () => {
    const html = await container.renderToString(SiteHeader);

    expect(html).toContain('aria-label="Main navigation"');
    expect(html).toContain('aria-label="Open navigation"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('href="/#about"');
    expect(html).toContain('href="/#experience"');
    expect(html).toContain('href="/#toolkit"');
    expect(html).toContain('href="/#contact"');
  });

  it("renders the current contact methods", async () => {
    const html = await container.renderToString(Contact);

    expect(html).toContain("iam@danielchan.me");
    expect(html).toContain('href="tel:+16503079260"');
    expect(html).toContain("Bay Area, California");
    expect(html).toContain("github.com/DanielChanJA");
    expect(html).toContain("linkedin.com/in/DanielChanJA");
  });
});
