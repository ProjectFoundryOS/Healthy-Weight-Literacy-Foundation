# Article source cutover

Decision: on October 18, 2026, the owner authorized replacing the unfinished external article pipeline with the organization's agent-assisted, reviewed, repository-based workflow.

## Implemented

- The only active article source is `content/articles/catalog.json`. The reader never connects to Supabase, and old hosting variables cannot select a different feed.
- Homepage, article listing, education, related articles, search, and sitemap consume the same approved inventory.
- Approval records, exact content/metadata hashes, sources, public attribution, and draft exclusion remain required. The three private starter drafts have no approvals and are not included in this repository.
- The unused database reader/write helpers are removed. The display type is independent of the database. Historical SQL and manual migration scripts remain available for recovery; no database or hosting resource was changed.
- Existing PR #32 remains untouched. Its database/snapshot approach is superseded for this reader and should not be merged into it.

## Public content check

On October 18, the production article index displayed “Educational articles will begin publishing soon.” Its sitemap listed 24 general pages and no individual article URLs. A read-only HTTP audit checked 34 known slugs found in checked-in SQL/sample content and two historical rendering regressions; every request returned HTTP 404, with no network errors or readable article response to preserve. This is a bounded public URL check, not proof that the old database is empty or that no other URL was ever indexed.

Retain the old infrastructure while deciding whether historical content warrants recovery. Any recovered article should keep its existing slug if republished, with truthful review and source checks. No blanket redirects or deletions were made. This branch does not require recovering or adopting Terry's generator to publish new content.

## Verification and release state

- 23 unit tests passed; TypeScript passed.
- A full local webpack build generated 41 pages using one explicitly synthetic non-health fixture. The build deliberately supplied invalid database URLs and the obsolete `HWLF_ARTICLE_SOURCE=hybrid`; neither affected the new file reader.
- HTTP checks passed for the homepage, blog, education, sitemap, article rendering/table, and unpublished-slug 404. Browser inspection confirmed the rendered sample and search result.
- No Supabase/database reader strings were found in the compiled server JavaScript.
- A normal build compiled and typechecked, then deliberately stopped with `No approved articles available; refusing an empty publication`. Final `.next` output is from that refused build and is not deployable.
- Export dry-run: 0 approved articles, 3 skipped drafts. The real catalog was restored after the fixture build.
- Unit discovery is restricted to `__tests__/*.test.ts`, so Node does not accidentally launch the separate build/HTTP smoke scripts.

The committed catalog is empty. A normal production build must refuse it with `No approved articles available; refusing an empty publication`. Keep this change in draft until real articles receive the recorded editorial and subject approvals, are exported, and pass a real-content preview. Synthetic build output must never be deployed. Newsletter persistence and education conversion tracking remain separate unfinished work.

## Known URL results

These slugs are recovery candidates, not approved articles. Checked at UTC: 2026-10-18T19:49:25.749995+00:00.

| Slug | HTTP result |
| --- | --- |
| `added-sugars-hidden-sources-and-health-effects` | 404 |
| `compounded-vs-fda-approved-glp1-medications` | 404 |
| `family-wellness-guide` | 404 |
| `glp1-medications-benefits-risks-considerations` | 404 |
| `gut-microbiome-and-weight-what-science-says` | 404 |
| `hormones-and-weight-beyond-calories-in-calories-out` | 404 |
| `how-to-evaluate-telehealth-weight-management-provider` | 404 |
| `hydration-and-health-how-much-water-do-you-need` | 404 |
| `hydration-weight-health-everyday-functioning` | 404 |
| `insulin-resistance-what-it-is-why-it-matters` | 404 |
| `meal-planning-basics-eating-well-on-a-budget` | 404 |
| `metabolic-health-why-it-matters` | 404 |
| `nutrition-labels-weight-health-understanding` | 404 |
| `nutrition-myths-debunked` | 404 |
| `online-prescriptions-safety` | 404 |
| `physical-activity-for-health-beyond-weight-loss` | 404 |
| `privacy-security-telehealth-what-you-should-know` | 404 |
| `questions-to-ask-doctor-about-glp1-medications` | 404 |
| `reading-nutrition-labels-what-to-look-for` | 404 |
| `science-of-glp1-how-medications-affect-your-body` | 404 |
| `science-of-sustainable-weight-management` | 404 |
| `set-point-theory-why-body-resists-weight-loss` | 404 |
| `sleep-and-weight-understanding-the-connection` | 404 |
| `stress-weight-health-daily-well-being` | 404 |
| `telehealth-vs-in-person-care-right-choice` | 404 |
| `understanding-bmi-what-it-really-means` | 404 |
| `understanding-food-labels-added-sugars` | 404 |
| `understanding-glp1-medications-how-they-work` | 404 |
| `understanding-healthy-weight` | 404 |
| `understanding-macronutrients-proteins-carbs-fats` | 404 |
| `understanding-online-prescriptions-safety-best-practices` | 404 |
| `understanding-telehealth-weight-management-guide` | 404 |
| `understanding-weight-health-everyday-habits` | 404 |
| `understanding-your-metabolism-facts-vs-myths` | 404 |
