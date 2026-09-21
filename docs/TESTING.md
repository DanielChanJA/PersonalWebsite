# Testing

## Test layers

The project combines static diagnostics, fast unit/component coverage, a production build, and real-browser tests.

```sh
npm run check       # Astro and TypeScript
npm test            # Vitest data and rendered-component contracts
npm run test:e2e    # Production build + Playwright Chromium suite
npm run validate    # All required checks
```

Install the pinned browser once with `npx playwright install chromium`. CI uses `--with-deps` on Linux.

## Unit and component suites

Vitest configuration lives in `vitest.config.ts`; tests use `.test.ts` beside the source they protect.

### Experience data

`src/data/experience.test.ts` verifies employer order, unique anchors, exactly one current role, substantive accomplishments and tags, featured impact metrics, and résumé provenance.

### Profile data

`src/data/profile.test.ts` verifies secure URLs, link-safe contact details, and required page metadata.

### Rendered components

`src/components/components.test.ts` uses Astro's component container to verify standalone company sections, current-role content, route-safe navigation, and rendered profile contact methods.

Prefer targeted assertions over broad snapshots:

```ts
const container = await AstroContainer.create();
const html = await container.renderToString(Example);
expect(html).toContain('aria-label="Main navigation"');
```

### Agent and operations contracts

`src/config/agentic.test.ts` protects repository guidance, generated discovery output, indexing privacy, palette contrast, and date-rail readability. `src/config/security.test.ts` protects portable/Apache header parity, static-origin configuration, Cloudflare-only firewalling, VPS privacy and hardening, and independent certificate-expiry monitoring. Update these suites with any corresponding discovery, design-system, hosting, or operational policy change.

## Browser suite

`tests/e2e/portfolio.spec.ts` runs against the built `dist/` directory through the small foreground server in `tests/serve-dist.mjs`, not Astro's development transform server. It currently verifies:

- core content and narrow-screen navigation remain usable with JavaScript disabled or blocked during initialization;
- mobile-menu names, expanded state, link behavior, and scroll-lock cleanup;
- direct company anchors reveal their target;
- the portrait uses a production responsive source set and sizes hint;
- discovery endpoints expose the expected résumé and sitemap content; and
- browser behavior ships as a same-origin external module compatible with the production CSP.

Add Playwright coverage when a change relies on browser JavaScript, CSS visibility, focus/state interaction, URL navigation, or production asset output.

## CI and monitoring

`.github/workflows/ci.yml` runs `npm run validate` for pull requests and pushes to `master`. Dependabot checks npm and workflow dependencies. A daily production workflow checks the public HTML, discovery files, security headers, canonical redirect, and a generated asset. A weekly drift workflow compares the firewall's pinned Cloudflare networks with Cloudflare's published ranges.

The VPS separately runs `portfolio-certificate-health.timer` each day. It fails when the origin certificate has fewer than 30 days remaining so external infrastructure monitoring can alert on the failed unit.

## Troubleshooting

- If Playwright cannot find Chromium, run `npx playwright install chromium`.
- If port 4173 is occupied, stop the unrelated local process or temporarily change both Playwright `baseURL` and `webServer` port.
- Image optimization warnings are build failures in practice even if a tool returns success; ensure every referenced `_astro` image exists in `dist/`.
- A passing development page does not replace a production build or browser run.

No change is ready while `npm run validate` reports an error or warning that affects emitted assets.
