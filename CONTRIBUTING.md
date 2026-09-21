# Contributing

This is a personal portfolio. Changes must preserve Daniel's voice, résumé accuracy, privacy choices, accessibility, and visual identity.

## Workflow

1. Install dependencies with `npm install` and browser support with `npx playwright install chromium`.
2. Run `npm run dev` while editing.
3. Update tests whenever content contracts or behavior change.
4. Run `npm run validate`.
5. Review the result at desktop and mobile widths.

CI runs the same validation gate for pushes to `master` and pull requests.

## Conventions

### Content

- Keep public identity and contact facts in `src/data/profile.json`.
- Keep professional experience in `src/data/experience.ts`, in reverse chronological order.
- Preserve stable section IDs and exactly one current role.
- Record the source filename and synchronization date in `resumeSync` whenever résumé content is refreshed.
- Do not publish private infrastructure details, unapproved claims, or the origin address.
- Follow the [content guide](docs/CONTENT.md).

### Astro and TypeScript

- Prefer typed data and props over duplicated facts or markup.
- Use Astro for build-time content and small browser TypeScript modules for progressive enhancement.
- Keep essential content and navigation usable when JavaScript is disabled, blocked, or fails during initialization.
- Do not suppress strict TypeScript diagnostics without explaining why.

### CSS and assets

- Reuse the tokens in `src/styles/global.css`.
- Preserve keyboard focus, narrow-screen navigation, and reduced-motion behavior.
- Put processable images in `src/assets/` and render them with `astro:assets`.
- Keep third-party font requests out of the production page.
- Split global styles only when a second page or visual variant creates a real ownership boundary.

### Tests

- Put unit and component tests beside the source they protect; put browser journeys in `tests/e2e/`.
- Prefer targeted assertions over large snapshots.
- Add Playwright coverage for behavior that depends on JavaScript, CSS, or browser navigation.
- Test both the enhanced experience and the no-JavaScript fallback when changing critical navigation or visibility.

### Dependencies and operations

- Use maintained dependencies compatible with `package.json` and commit `package-lock.json`.
- Review dependency install scripts and record only narrow, version-pinned entries in `allowScripts`; never blanket-approve them.
- Keep host-neutral settings in `public/_headers` and Apache settings in `ops/apache/` aligned.
- Do not commit server IPs, keys, tokens, or generated `dist/` files.
- Update documentation when commands, paths, architecture, content ownership, or deployment behavior changes.
