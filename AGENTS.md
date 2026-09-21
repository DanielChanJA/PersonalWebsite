# Agent guide

This repository builds Daniel Chan's static portfolio with Astro and TypeScript. Treat the checked-in source as authoritative; `dist/` is generated and must not be edited directly.

## Start here

- Read `README.md` for setup and commands.
- Read `docs/ARCHITECTURE.md` before changing structure or browser behavior.
- Read `docs/CONTENT.md` before changing résumé copy, profile facts, or images.
- Read `docs/DEPLOYMENT.md` before normal production work and `docs/VPS-SETUP.md` before host provisioning, reimages, or recovery.

## Sources of truth

- `src/data/profile.json`: identity, contact, location, canonical URL, social links, and site-content modification date.
- `src/data/experience.ts`: employer sections, résumé claims, featured impact, and résumé provenance.
- `src/styles/global.css`: the Oslo, Miami, and baby-blue visual system.
- `src/layouts/BaseLayout.astro`: shared metadata, structured data, fonts, and document shell.
- `src/lib/discovery.ts`: generated `/llms.txt` and XML sitemap content.
- `ops/`: reviewed Apache and origin-firewall configuration.

Do not duplicate public facts when an existing typed source can supply them. Preserve employer IDs because they are public deep links.

## Working rules

- Keep the site statically rendered and usable when JavaScript is disabled, blocked, or fails during enhancement initialization.
- Prefer semantic HTML and CSS; add client code only for progressive enhancement.
- Keep navigation links route-safe and all fonts and first-party assets self-hosted.
- Preserve accessible focus, motion, color contrast, and narrow-screen behavior.
- Update tests and documentation with behavioral, content-model, or operational changes.
- Never commit the origin IP, credentials, private keys, Tailscale data, or the private résumé PDF.
- Do not mutate production unless the user explicitly requests a deployment or operational change.

## Validation

Install with `npm install` and `npx playwright install chromium`. Run `npm run validate` before handing off a change; it covers Astro/TypeScript diagnostics, unit and component tests, a production build, and Playwright checks.

A change is complete when its source, tests, and relevant documentation agree, the full validation gate passes, and the generated page still works with JavaScript disabled.
