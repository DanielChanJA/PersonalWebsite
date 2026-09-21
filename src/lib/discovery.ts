import { experiences, resumeSync } from "../data/experience";
import profile from "../data/profile.json";

const canonicalUrl = profile.url.replace(/\/$/, "");

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function renderLlmsTxt(): string {
  const roles = experiences
    .map(
      (experience) =>
        `- [${experience.company}](${canonicalUrl}/#${experience.id}): ${experience.role}, ${experience.dates}. Focus: ${experience.tags.join(", ")}.`
    )
    .join("\n");

  return `# ${profile.name}

> ${profile.description}

This is the machine-readable guide to ${profile.name}'s portfolio. The canonical human-readable site is ${canonicalUrl}/.

## Portfolio sections

- [About](${canonicalUrl}/#about): Professional focus and engineering approach.
- [Experience](${canonicalUrl}/#experience): Reverse-chronological employment history, with one addressable section per company.
- [Toolkit](${canonicalUrl}/#toolkit): Security, identity, platform engineering, technologies, and education.
- [Contact](${canonicalUrl}/#contact): Public contact methods and social profiles.

## Professional experience

${roles}

## Public profiles

- [GitHub](${profile.social.github}): Public code and engineering projects.
- [LinkedIn](${profile.social.linkedin}): Professional profile.
- [Email ${profile.firstName}](mailto:${profile.email}): Direct contact.

## Content notes

- The website's semantic HTML and ProfilePage JSON-LD are authoritative.
- Résumé content was synchronized from ${resumeSync.source} on ${resumeSync.synchronizedOn}.
- The source repository intentionally excludes private infrastructure details and the résumé PDF.
`;
}

export function renderSitemapXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(`${canonicalUrl}/`)}</loc>
    <lastmod>${profile.contentModifiedOn}</lastmod>
  </url>
</urlset>
`;
}
