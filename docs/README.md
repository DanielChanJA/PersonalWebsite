# Project documentation

This directory contains the operational and maintenance documentation for Daniel Chan's portfolio.

## Guides

| Guide | Use it when… |
| --- | --- |
| [Architecture](ARCHITECTURE.md) | You need to understand how the page, components, content, styles, and browser behavior fit together. |
| [Content maintenance](CONTENT.md) | You are changing résumé entries, copy, contact details, skills, education, or images. |
| [Testing](TESTING.md) | You are adding behavior or content and need to update unit, component, browser, or CI coverage. |
| [Deployment and operations](DEPLOYMENT.md) | You are publishing, rolling back, maintaining the origin, or migrating the VPS. |
| [Portfolio VPS setup](VPS-SETUP.md) | You are rebuilding the single-purpose host, enrolling Tailscale, configuring TLS, or validating disaster recovery. |
| [Agent-readable interfaces](AGENTIC.md) | You are changing coding-agent guidance, `/llms.txt`, crawler discovery, or structured content. |

For setup, scripts, and a repository overview, start with the [project README](../README.md). Contribution expectations live in [CONTRIBUTING.md](../CONTRIBUTING.md).

## Documentation conventions

- Commands assume the repository root as the working directory.
- Paths are relative to the repository root unless stated otherwise.
- The checked-in source is authoritative; generated files under `dist/` are not edited directly.
- The origin IP, credentials, private keys, and Tailscale secrets never belong in the repository.
- Update these guides in the same change whenever architecture, commands, or content ownership changes.
