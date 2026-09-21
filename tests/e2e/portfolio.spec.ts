import { expect, test } from "@playwright/test";

test("renders core content and navigation when JavaScript is disabled", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "I build secure systems that scale." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();
  await expect(page.locator("#coreweave")).toBeVisible();

  await context.close();
});

test("fails open when progressive enhancement initialization throws", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: class {
        constructor() {
          throw new Error("Simulated enhancement failure");
        }
      }
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("html")).not.toHaveClass(/js/);
  await expect(page.getByRole("heading", { name: "I build secure systems that scale." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();
  await expect(page.locator("#coreweave")).toBeVisible();
});

test("opens and closes the mobile menu accessibly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.locator(".nav-toggle");
  await expect(toggle).toHaveAccessibleName("Open navigation");
  await toggle.click();

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle).toHaveAccessibleName("Close navigation");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();

  await page.getByRole("link", { name: "Experience", exact: true }).click();
  await expect(page).toHaveURL(/#experience$/);
  await expect(page.locator("#experience")).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/nav-open/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveAccessibleName("Open navigation");
});

test("reveals a directly linked company section", async ({ page }) => {
  await page.goto("/#coreweave");

  const currentRole = page.locator("#coreweave");
  await expect(currentRole).toBeVisible();
  await expect(currentRole.getByRole("heading", { name: "CoreWeave" })).toBeVisible();
  await expect(currentRole).toContainText("15TB of logs daily");
});

test("serves optimized responsive portrait imagery", async ({ page }) => {
  await page.goto("/");

  const portrait = page.getByAltText("Daniel Chan smiling beside an alpaca");
  await expect(portrait).toHaveAttribute("srcset", /_astro\//);
  await expect(portrait).toHaveAttribute("sizes", /82vw/);
});

test("publishes search and agent discovery metadata", async ({ page, request }) => {
  await page.goto("/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://danielchan.me/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  );
  await expect(page.locator('link[rel="alternate"][type="text/plain"][href="/llms.txt"]')).toHaveCount(1);
  await expect(page.locator('link[rel="sitemap"][href="/sitemap.xml"]')).toHaveCount(1);
  await expect(page.locator('script[type="module"][src^="/_astro/"]')).toHaveCount(1);

  const structuredData = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}"
  );
  expect(structuredData["@graph"].map((entry: { "@type": string }) => entry["@type"]))
    .toEqual(["WebSite", "ProfilePage", "Person"]);

  const [robots, sitemap, llms] = await Promise.all([
    request.get("/robots.txt"),
    request.get("/sitemap.xml"),
    request.get("/llms.txt")
  ]);

  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Sitemap: https://danielchan.me/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(sitemap.headers()["content-type"]).toContain("application/xml");
  expect(await sitemap.text()).toContain("<loc>https://danielchan.me/</loc>");
  expect(llms.ok()).toBeTruthy();
  expect(llms.headers()["content-type"]).toContain("text/plain");
  expect(await llms.text()).toContain("https://danielchan.me/#coreweave");
});
