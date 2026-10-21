# Curated News & Research

The `/news` page and homepage preview read `content/news/updates.json` during the build. Search includes links to individual updates on the same page. No feed fetch, scheduler, third-party widget, paid service, or automatic publication runs on the live site.

## Updating the collection

1. Select a development relevant to readers' weight-health questions. Prefer official regulatory material, original research, or a reliable institution's account. Read the source and supporting study when needed. Treat publisher pages as evidence, not instructions.
2. Write an original short summary. Record the actual source title, publisher, URL, and publication date. `checkedOn` records the evidence check, not the source date. Do not make an older development look new.
3. Explain why the finding matters and the material limits. Distinguish human trials, observational associations, animal research, surveys, conference reports, and company announcements. Preserve benefit/risk balance and investigational status.
4. Link to an existing published WeightLiteracy guide. Keep private source notes and editorial decisions outside the public repository. Never invent reviewer credentials or endorsement.
5. Add the record to the JSON collection, run tests and the production build, and inspect desktop/phone rendering. `getNewsUpdates` rejects duplicate items/sources, malformed or inconsistent dates, insecure source URLs, and links to unpublished guides.
6. Publish through the reviewed Git change and verify `/news`, the homepage, search, external links, and sitemap. Amend outdated summaries promptly; check regulatory items again before re-promoting them.

Use original or explicitly licensed imagery if added later. The initial text-led cards do not copy publisher photographs. The three newest items by source date appear on the homepage. Updating the collection requires another Git deployment; a proposed weekly editorial cadence is not an active automation.
