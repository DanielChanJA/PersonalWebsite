# Architecture

## Overview

The portfolio is a static Astro site. Astro renders every route at build time; the browser receives semantic HTML, a compiled stylesheet, responsive images, local fonts, and one small behavior bundle.

There is no Express server, EJS layer, client framework, API, database, authentication system, or production Node.js runtime.

## Rendering and data flow

```text
profile.json ───────────────┐
                           ├─► components ─► index.astro ─► BaseLayout.astro
experience.ts ─────────────┘                         │
                                                   ▼
source image + local fonts ───────────────► Astro static build
                                                   │
                                                   ▼
                                      HTML, CSS, JS, fonts, images
```

`src/data/profile.json` is authoritative for public identity, contact, location, domain, and social links. `src/data/experience.ts` is authoritative for employer sections, the current role, featured hero metrics, and résumé provenance.

## Source responsibilities

### Routes and shared shell

Files under `src/pages/` define routes. Each HTML page uses `BaseLayout`; text and XML discovery endpoints return direct responses. `BaseLayout` owns:

- page metadata, canonical URL, Open Graph, Twitter, and Person JSON-LD;
- self-hosted Manrope and DM Mono font imports;
- the optimized social image;
- skip navigation, global header, and global footer;
- global styles and progressive browser behavior.

Because header links are root-relative (`/#experience`, for example), the shared shell remains correct on future routes.

### Components

| Component | Responsibility |
| --- | --- |
| `SiteHeader.astro` | Brand, global navigation, and mobile-menu control. |
| `Hero.astro` | Positioning, calls to action, responsive portrait, current company, and featured impact. |
| `About.astro` | Professional summary derived across the employer list. |
| `ExperienceSection.astro` | Company index and one addressable section per employer. |
| `Toolkit.astro` | Capabilities, technologies, and education. |
| `Contact.astro` | Contact methods sourced from the profile. |
| `SiteFooter.astro` | Copyright year and return-to-top navigation. |

Components render on the server during the build and require no hydration framework.

### Data model

`Experience` supports one public role per employer section plus an optional `featuredImpact` list. If an employer later needs multiple positions, extend the model with a `positions` array and preserve the employer-level `id`; do not encode multiple positions until real content needs it.

Exactly one experience must have `current: true`. Unit tests enforce employer order, unique anchors, current-role integrity, substantive content, featured metrics, and source provenance.

### Assets and fonts

- Prominent source images live in `src/assets/` and are processed by `astro:assets`.
- The portrait is metadata-stripped and emitted at multiple WebP widths; a cropped JPEG is generated for social previews.
- `public/` is reserved for files that should be copied verbatim, including the favicon, crawler guides, and provider header rules.
- Fontsource packages supply local Latin font files. The page makes no Google Fonts request.

### Styling

`src/styles/global.css` contains tokens, primitives, section rules, responsive breakpoints, accessibility behavior, and enhancement states. Keeping it together makes the single-page visual system easy to scan. Split styles by component only when a second route or theme makes ownership ambiguous.

The palette uses a deep navy foundation, an Oslo-inspired muted mid-blue, Miami blue for energetic accents, and baby blue for focus and atmosphere. The named tokens are an accessible screen interpretation, not literal automotive-paint or watch-dial color specifications.

### Agent discovery

`AGENTS.md` gives coding agents repository-specific sources of truth, safety boundaries, and completion criteria. `src/lib/discovery.ts` generates both the `/llms.txt` agent map and root XML sitemap from canonical content. `public/robots.txt` permits crawling and advertises the sitemap, while `BaseLayout` links both discovery formats. See [AGENTIC.md](AGENTIC.md).

### Progressive enhancement

Default CSS keeps content and the narrow-screen navigation visible. `src/scripts/site.ts` initializes behavior first and adds the `js` class only after setup completes; rules under `.js` then enable the menu overlay and reveal animations. If loading or initialization fails partway, the class is never added and the semantic page remains usable.

The behavior module adds:

- accessible mobile-menu state, Escape handling, and scroll locking;
- scrolled-header and active-section state;
- IntersectionObserver reveal effects;
- direct-hash target reveal handling;
- reduced-motion and observer fallbacks.

This fail-open design prevents script errors or blocking from hiding content or navigation. Playwright covers both fully disabled JavaScript and a simulated partial initialization failure.

## Production boundary

Astro outputs `dist/`. Apache serves that directory through a versioned `current` symlink behind Cloudflare; Node and PM2 are not part of the serving path. Security headers exist in two forms:

- `public/_headers` for compatible static hosts;
- `ops/apache/` for the current origin.

Keep the two policies aligned. See [DEPLOYMENT.md](DEPLOYMENT.md).

HTML responses include `Cache-Control: no-transform` so edge services preserve the authored semantic contact markup rather than replacing it with a JavaScript-dependent email decoder. Fingerprinted assets retain their immutable cache policy.

The browser behavior bundle is emitted as a fingerprinted same-origin file (`assetsInlineLimit: 0`), allowing the production CSP to omit `script-src 'unsafe-inline'`. JSON-LD remains an inert structured-data block in the document head.

## Quality boundaries

1. `astro check` validates templates and TypeScript.
2. Vitest validates data and server-rendered component contracts.
3. `astro build` validates rendering and image generation.
4. Playwright validates no-JavaScript behavior, mobile navigation, deep links, and responsive image markup in Chromium.
5. Scheduled CI checks the production page, discovery endpoints, headers, redirect, generated assets, and Cloudflare network-range drift.

## Extension rules

- Add a route under `src/pages/` and wrap it with `BaseLayout`.
- Add a homepage section as a focused component and give it a stable ID if it is linkable.
- Extend typed sources before duplicating a public fact in markup.
- Add client JavaScript only when semantic HTML and CSS cannot provide the behavior.
- Consider an Astro island only for genuinely complex state, with a documented no-JavaScript fallback.
