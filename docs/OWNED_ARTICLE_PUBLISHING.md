# Owned article publishing: local implementation

Status: repository-owned publishing is active. The October 20, 2026 release includes fifteen owner-approved articles with their selected imagery. The original five publication dates are preserved; the other ten receive their first publication dates. Articles are linked in desktop/mobile navigation and the footer. No new paid services or AI API calls. This is an agent-assisted editorial workflow, not an unattended content generator.

## Content flow

Private Markdown drafts and JSON review records, including image placement → evidence checks and genuine editorial approval → local approved-content export → reviewed Git change with image files → existing deployment → live verification.

`content/articles/catalog.json` is the public inventory. It contains the approved release inventory. The private editorial workspace stays outside this website checkout; do not commit private reviewer details here. Historical display-only review snapshots in `content/article-drafts/` are not used by production. Adding random Markdown files does not publish them. The old private `publish-manifest.json` is an obsolete planning example, not a second publication switch.

The adapter in `lib/articles.ts` supplies the homepage, education page, blog index, article pages, related articles, search, and sitemap. Only public search summaries reach the search component. The stale `public/sitemap.xml` was removed because it shadowed the generated sitemap at the same URL. Existing HTML sanitation remains in place; the file format accepts plain Markdown without embedded HTML.

## Preparing an approved release

An agent can handle the file operations; the organization supplies actual editorial approval. As of October 19, 2026, clinician signoff is optional. The private `editorial/EVIDENCE-REVIEW-STANDARD.md` defines current checks and the planned agent routine; that automation is not running. The owner need not operate Git or compute hashes manually.

1. Check the private draft and source passages against the evidence standard. Complete the private `editorial/review-checklist.md` image-uniqueness section against the full current library: distinct covers and interior images, path/hash comparisons, visual near-duplicate checks, browser presentation, and saved evidence. Resolve duplicates before marking ready for editorial approval. This is a required editorial check; the exporter does not currently enforce library-wide image uniqueness. Record findings, corrections, and the actual editorial decision. Remove the draft banner only after review. Writing-style feedback alone is not a final release decision.
2. Set a truthful public author, publication/update timestamps, and next review date. Populate `approval.editor_approval` with `{name, approved_at}`. The overall `approval.approved_at` must equal that time; public `reviewed_at` records this editorial review. Leave `approval.subject_approval` null or absent unless an actual qualified clinical review occurred; only then provide `{name, credentials, reviewed_at}`. It exports as optional `medical_review` with its own date. Use ISO timestamps with time zones. Review methods and AI provenance stay private. Public process disclosures are not required by this system; `public_disclosure` is optional and must not be auto-filled.
3. Record `approved_body_sha256` for the exact Markdown bytes and `approved_metadata_sha256` for the canonical public metadata, including `visuals` when present. The helpers `digest` and `metadataDigest` in `lib/article-publication.ts` compute these; the field mapping is defined once in `lib/editorial-export.ts`. Image paths, alternative text, dimensions, section placements, source links, and image-file hashes are part of the approved metadata. Bind the review record to those versions. Any substantive text or public metadata change requires review again.
4. Set `status: "approved"` and `publish: true` only when the recorded approval is real. The record must include `updated_at`; legacy draft-only date fields are not substitutes. `public_disclosure` may be null or omitted. Required fields and types are enforced in `recordSchema`.
5. Run `node scripts/export-articles.mjs /absolute/path/to/editorial` to check without writing. Then use the same command with `--write` to replace the local public catalog. Export requires every selected source in `sources.json` to appear as a direct Markdown link in the body. It verifies all referenced image files before writing. Existing exported slugs cannot silently disappear; withdrawal requires a separately reviewed explicit catalog change.
6. Review the complete diff and verify the intended deployment branch. Publish only with the real corpus preserved, human article approvals complete, and hosting settings confirmed. Verify the resulting live URLs, search, sitemap, source links, and mobile presentation.

Hashes detect changes; they are not identity verification, authentication, signatures, or proof of scientific correctness. Enforce actual authorization with repository permissions and human review. The exporter does not verify credentials, source truth, completion of the planned agent routine, or whether a reader understood the article. It checks the publication structure and integrity; private evidence findings still require editorial assessment. Expired review dates do not automatically withdraw pages; the editorial owner must track review due dates.

## Article source and cutover

The user chose on October 18, 2026 to retire the unfinished external article pipeline. `lib/articles.ts` reads only `content/articles/catalog.json`; there is no runtime database read, fallback, or environment-controlled source selection. `HWLF_ARTICLE_SOURCE` and the old Supabase variables cannot reconnect the old article feed. No Vercel setting change is required for this switch.

The former `lib/supabase-blog.ts` reader and unused write helpers were removed; display types now live in `lib/article-types.ts`. Historical SQL and the standalone database migration script remain for recovery/reference and are never invoked by the site build or this publishing workflow. No external database or infrastructure was deleted or modified.

A normal release still requires at least one genuinely approved article. An empty catalog deliberately fails with `No approved articles available; refusing an empty publication`. Do not use test content to make a hosted build pass.

Preserve the URL of any existing article selected for migration; recover its content and obtain truthful review before exporting it. An empty public listing does not prove the old database is empty. Record the current public URL checks and outstanding preservation decisions in `docs/ARTICLE_SOURCE_CUTOVER.md`. PR #32's database/snapshot implementation is superseded by this source choice; do not merge it into the active reader. The PR itself and existing infrastructure are left intact.

## Verification

### Images in the publication record

Each private `records/<slug>.json` can contain `visuals: { hero, body }`. Each image has `src`, `alt`, `width`, `height`, and the SHA-256 of the actual image file; a body image also has `before_heading`, matching exactly one Markdown `##` heading. A chart may include a source link. PNG, JPEG, and WebP assets live in `public/images/editorial/` and must accompany the catalog in the Git change. Original SVG chart sources can stay alongside their rendered PNG, but SVG is not an accepted publication-image type.

A hero can additionally contain `overlay: { title, subtitle?, attribution?: { label, logo } }`. The logo uses the same file/dimension/hash/source fields as other assets. The renderer displays selectable cover text and authentic attributed logos on article heroes and cards. Overlay wording, attribution and logo bytes are covered by approval and asset-integrity checks. Body figures cannot carry cover overlays. Overlays are HTML; downloaded originals and Open Graph images currently remain uncomposited.

Preview and publication now read the same record's visual data. `preview.json` selects slugs only. Captions and credits are not rendered; internal provenance belongs in `visual_provenance`, which the exporter excludes. Alternative text remains available for accessibility. Approved visual data supplies article heroes, body figures, collection and related-article thumbnails, Open Graph/Twitter images, and article structured data. Sharing URLs are absolute and use the actual hero dimensions.

Missing or modified image files stop export and the release preflight. Missing or ambiguous placement headings stop article validation. Changing the visual metadata invalidates its recorded approval hash. The checks detect changes; they do not prove image licensing or medical accuracy.

`npm run build` runs `scripts/check-publication.mjs` before Next.js. Use that package build command for deployment, not a custom command that skips it. `npm run publication:check` runs the same preflight without building. Asset file checks run during preparation/build, so production page requests do not need access to private editorial files or the public image directory on disk. Node.js is pinned to `24.x`, matching the tested local runtime and a [supported Vercel runtime](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

### Local editorial preview

To inspect the real drafts in the website's layout, run `npm run preview:articles` from this checkout. It starts Next.js development on `http://127.0.0.1:3100/blog`, bound to this Mac. An optional absolute editorial folder may be passed as the script argument. The private folder's `preview.json` explicitly selects the articles to display; the selection is controlled by the private workspace. The committed historical snapshots contain fifteen draft display versions; production uses the approved catalog.

This preview reads local drafts and their visual metadata directly and checks their recorded body hashes and image placement headings. It does not write the publication catalog, alter approval records, or invent a reviewer. The pages carry a draft banner, omit article publication structured data, suppress analytics, send no-index headers, and return an empty sitemap. Drafts remain `is_published: false`, with no publication date, and cannot pass the existing publication resolver. Only display fields leave the server.

`HWLF_EDITORIAL_PREVIEW_DIR` is a development-only switch. CI, Vercel, production builds, and production servers reject it. Preview output uses a separate ignored `.next-editorial-preview` directory. Do not upload the private editorial folder or set this variable on a hosted environment. Stop the local preview with Ctrl+C when finished.

### Publication checks

Use Node 24, the checked-in pnpm lockfile, and installed dependencies.

```sh
node --test __tests__/*.test.ts
node node_modules/typescript/bin/tsc --noEmit
node scripts/export-articles.mjs /absolute/path/to/editorial
node scripts/check-publication.mjs
node scripts/test-publishing-build.mjs
```

The unit-test command explicitly selects test files so it cannot accidentally discover the separate build/HTTP scripts. The last command temporarily inserts one visibly synthetic, non-health fixture with a hero and body image, then runs the real package build command and Next.js webpack build. It deliberately supplies invalid legacy database settings and `HWLF_ARTICLE_SOURCE=hybrid` to verify those settings cannot affect the new reader. It restores the original catalog in `finally`. Test catalogs require `HWLF_LOCAL_CONTENT_TEST=1` and are rejected when `CI` or `VERCEL` is set. Never use this test script as a deployment command or deploy its `.next` output. If the process is forcibly killed, inspect the catalog before any subsequent build; a remaining `purpose: "local-test"` must be removed/restored.

To inspect that build locally, start Next on loopback with `HWLF_LOCAL_CONTENT_TEST=1 node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3101`, leaving the article preview on 3100. Check `/blog/local-publishing-check`, `/blog`, `/education`, `/search?q=publishing`, and `/sitemap.xml`. Run `node scripts/test-publishing-http.mjs` to verify the served inventory, sitemap, table, caption-free figures, social/structured image metadata, original image bytes, responsive image optimization, and an unpublished URL. A private draft slug must return 404. Stop the local server afterward.

The fixture proves rendering and wiring; it does not prove production database connectivity, deployment permissions, real article approval, newsletter storage, or grant readiness. Newsletter persistence and educational analytics remain separate work.
