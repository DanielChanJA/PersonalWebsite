# Agent-readable interfaces

The portfolio supports two kinds of agents without adding a runtime dependency or parallel content system.

## Coding agents

`AGENTS.md` is the repository entry point. It identifies authoritative data, architecture and operations references, validation commands, accessibility expectations, and secrets that must never be committed.

Keep it concise and operational. When a source of truth, validation command, deployment boundary, or safety constraint changes, update `AGENTS.md` in the same change.

## Site-reading agents

`src/pages/llms.txt.ts` emits `/llms.txt` and the document head links to it as an alternate Markdown representation. Its content is generated from `profile.json` and `experience.ts`, so employer, date, anchor, and profile changes do not create a parallel manual résumé. `public/robots.txt` explicitly permits public indexing.

The semantic website remains authoritative. `llms.txt` summarizes and links to the page rather than becoming a second full résumé. Update the renderer only when its presentation or surrounding guidance changes.

## Structured discovery

The page also exposes:

- semantic headings and landmark elements;
- stable section and employer anchor IDs;
- canonical and social metadata;
- WebSite, ProfilePage, and Person JSON-LD sourced from typed content;
- a generated root-level XML sitemap referenced by `robots.txt`;
- readable content without client-side JavaScript.

Tests in `src/config/agentic.test.ts` protect discovery, employer links, infrastructure privacy, and the visual token contract.
