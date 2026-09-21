# Content maintenance

## Public profile

`src/data/profile.json` is the single source for Daniel's name, title, description, contact details, location, canonical URL, GitHub, and LinkedIn.

Components and metadata import this file directly. Update the profile and its tests together; do not copy a changed email, phone number, title, or URL into individual components.

## Professional experience

`src/data/experience.ts` is the source of truth for employer sections and hero impact metrics. Entries remain in reverse chronological order and use this shape:

```ts
{
  id: "company-anchor",
  company: "Company name",
  role: "Job title · Team or specialty",
  dates: "Mon YYYY — Present",
  current: true,
  bullets: ["A specific accomplishment with measurable impact."],
  tags: ["Technology", "Capability", "Domain"],
  featuredImpact: [
    { value: "83%", label: "less critical ingestion latency" }
  ]
}
```

`featuredImpact` is optional and should normally appear only on the current role. `Hero.astro` derives both its current-company label and its metric cards from this data.

### Add or update an employer

1. Insert or edit the entry in reverse chronological order.
2. Keep existing lowercase, URL-safe IDs stable; they are public deep links.
3. Maintain exactly one `current: true` role.
4. Lead bullets with an action or outcome and retain the approved claim's scope.
5. Keep tags curated rather than repeating every noun in the bullets.
6. Update `src/data/experience.test.ts` when order, anchors, current role, or featured metrics change.
7. Run `npm run validate`.

`ExperienceSection.astro` automatically creates the company index, numbering, badge, bullets, tags, and anchors.

## Résumé provenance

`resumeSync` at the top of `src/data/experience.ts` records the source PDF filename and synchronization date. The PDF itself is private input and is not committed.

When refreshing from a résumé:

1. Compare every employer, title, date, and claim against the approved PDF.
2. Update the typed data and any affected About or Toolkit copy.
3. Set `resumeSync.source` to the source filename and `synchronizedOn` to the review date.
4. Update `profile.contentModifiedOn` when the refreshed public content changes.
5. Update assertions that intentionally protect changed public claims.
6. Run the complete validation gate and review every company section.

The current site was synchronized from `DANIELCHAN RESUME 2026-1.pdf` on 2026-09-20.

Employer, date, and anchor changes flow automatically into `/llms.txt` through `src/lib/discovery.ts`. The sitemap URL comes from the profile, while its `lastmod` and the ProfilePage `dateModified` use the manually maintained `profile.contentModifiedOn`. If the information architecture or positioning changes, review the generated guide's labels and descriptions.

## Other copy

- Positioning and introduction: `src/components/Hero.astro`
- Professional and personal summary: `src/components/About.astro`
- Skills and education: `src/components/Toolkit.astro`
- Contact invitation: `src/components/Contact.astro`

Avoid restating the full résumé in About. It should explain the thread connecting the roles.

## Metadata

Default metadata is derived from the profile in `BaseLayout.astro`. The `site` setting in `astro.config.mjs` also imports the profile URL, so domain ownership is not duplicated. Update `profile.json`'s `contentModifiedOn` after any significant public copy, profile, metadata, or design change; this drives ProfilePage `dateModified` and sitemap `lastmod` independently of résumé provenance.

## Images

Put images that Astro should optimize in `src/assets/` and import them into a component. Use `Image` or `Picture` from `astro:assets` with:

- descriptive alternative text;
- explicit responsive widths and `sizes`;
- eager loading only for above-the-fold images;
- a suitable quality setting and crop.

Strip camera metadata before committing photography. The active portrait is `src/assets/daniel-and-alpaca.jpg`; Astro creates the production variants. Put only truly verbatim assets in `public/`.

## Validation checklist

```sh
npm run validate
```

Then confirm the affected copy at wide and narrow widths. For experience changes, test the company index, a direct `/#company-id` URL, dates, current badge, featured metrics, bullets, and tags.
