# Daniel Chan's Portfolio

Source for [danielchan.me](https://danielchan.me), a static portfolio focused on security engineering, identity, infrastructure, and Daniel's employer-by-employer experience.

The former Express/EJS application has been replaced by Astro and TypeScript. Production is plain HTML, CSS, local fonts, optimized images, and one small progressive-enhancement script—there is no Node.js application server.

## Highlights

- One addressable section per company, generated from typed résumé data.
- Public profile and contact facts maintained in one JSON source.
- Responsive, accessible design that remains usable if JavaScript fails.
- Self-hosted fonts and build-time responsive WebP/JPEG image generation.
- Canonical, sitemap, crawler, Open Graph, and WebSite/ProfilePage/Person structured metadata.
- Agent-friendly repository guidance and a discoverable `/llms.txt` site map.
- Unit, Astro component, and Playwright browser coverage.
- CI, Dependabot, production smoke monitoring, and security-header templates.

## Stack

- Astro 7 and TypeScript 6
- Vitest 5 with Astro's component container
- Playwright with Chromium
- Plain CSS and framework-free browser TypeScript

## Requirements

- Node.js 24.15 or newer
- npm 12 (the exact expected version is recorded in `package.json`)

Version managers can read the tested Node patch from `.node-version`; CI uses the same file.

## Getting started

```sh
npm install
npx playwright install chromium
npm run dev
```

Astro serves the development site at `http://localhost:4321` by default.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with hot reload. |
| `npm test` | Run unit and Astro component tests once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Build the site and run browser tests against a production preview. |
| `npm run check` | Run Astro and TypeScript diagnostics. |
| `npm run build` | Generate the static site in `dist/`. |
| `npm run preview` | Serve an existing production build locally. |
| `npm run validate` | Run the complete type, unit, build, and browser gate. |

## Project structure

```text
.github/             CI, dependency updates, and production smoke checks
docs/                Architecture, content, testing, and operations guides
ops/apache/          Version-controlled production Apache configuration
public/              Verbatim favicon, crawler guides, and host headers
src/
├── assets/          Source images processed by Astro
├── components/      Page sections and component tests
├── data/            Profile and typed résumé data with contract tests
├── layouts/         Shared document shell, navigation, metadata, and footer
├── pages/           File-based routes
├── scripts/         Progressive browser behavior
└── styles/          Design system and responsive styles
tests/e2e/           Playwright browser tests
```

The homepage composition is in [`src/pages/index.astro`](src/pages/index.astro). Public facts are in [`src/data/profile.json`](src/data/profile.json), and every employer section is generated from [`src/data/experience.ts`](src/data/experience.ts).

## Editing and validation

Follow [`docs/CONTENT.md`](docs/CONTENT.md) for copy, résumé, profile, and image changes. Before merging or deploying, run:

```sh
npm run validate
```

## Deployment

The production origin serves versioned static releases directly through Apache behind Cloudflare. The origin address is intentionally not stored in this public repository. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the topology, release procedure, rollback, and host-security requirements.

## Documentation

- [`docs/README.md`](docs/README.md) — documentation index
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — rendering, data flow, progressive enhancement, and extension points
- [`docs/CONTENT.md`](docs/CONTENT.md) — résumé, profile, copy, and asset maintenance
- [`docs/TESTING.md`](docs/TESTING.md) — unit, component, browser, and CI strategy
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — production releases, server operations, and rollback
- [`docs/VPS-SETUP.md`](docs/VPS-SETUP.md) — fresh single-purpose VPS build, hardening, and recovery
- [`docs/AGENTIC.md`](docs/AGENTIC.md) — coding-agent and site-reading-agent interfaces
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution workflow and conventions
- [`AGENTS.md`](AGENTS.md) — concise repository instructions for coding agents

## License

[MIT](LICENSE)
