# Owned article publishing: local implementation

Status: repository-only publishing implemented on `codex/owned-article-publishing`, based on main `e919066f9e3748c83f537d783f8adea411a71fd7`. See the pull request for current remote status; no production release is included. No new paid services or AI API calls. This is an agent-assisted editorial workflow, not an unattended content generator.

## Content flow

Private Markdown drafts and JSON review records → genuine human review → local approved-content export → reviewed Git change → existing deployment → live verification.

`content/articles/catalog.json` is the public inventory. It starts empty. The private editorial workspace stays outside this website checkout; do not commit drafts or private reviewer details here. Adding random Markdown files does not publish them. The old private `publish-manifest.json` is an obsolete planning example, not a second publication switch.

The adapter in `lib/articles.ts` supplies the homepage, education page, blog index, article pages, related articles, search, and sitemap. Only public search summaries reach the search component. The stale `public/sitemap.xml` was removed because it shadowed the generated sitemap at the same URL. Existing HTML sanitation remains in place; the file format accepts plain Markdown without embedded HTML.

## Preparing an approved release

An agent can handle the file operations; the organization supplies actual editorial and subject approval. The owner need not operate Git or compute hashes manually.

1. Review the private draft and source passages. Record corrections, reader testing, reviewer name and relevant credentials. Remove the draft banner only after review. Do not treat an AI source check or approval of the writing style as subject review.
2. Set a truthful public author, publication/update timestamps, next review date, and AI-assistance disclosure. Populate the record's `approval.editor_approval` with `{name, approved_at}`, and `approval.subject_approval` with `{name, credentials, reviewed_at}`. The overall `approval.approved_at` must equal the editor approval time. Use ISO timestamps with time zones.
3. Record `approved_body_sha256` for the exact Markdown bytes and `approved_metadata_sha256` for the canonical public metadata. The helpers `digest` and `metadataDigest` in `lib/article-publication.ts` compute these; the field mapping is defined once in `lib/editorial-export.ts`. Bind the review record to those versions. Any substantive text or public metadata change requires review again.
4. Set `status: "approved"` and `publish: true` only when the recorded approval is real. Required additional record fields are `updated_at` and `public_disclosure`; legacy draft-only date fields are not substitutes. Required fields and types are enforced in `recordSchema`.
5. Run `node scripts/export-articles.mjs /absolute/path/to/editorial` to check without writing. Then use the same command with `--write` to replace the local public catalog. Export requires every selected source in `sources.json` to appear as a direct Markdown link in the body. Existing exported slugs cannot silently disappear; withdrawal requires a separately reviewed explicit catalog change.
6. Review the complete diff and verify the intended deployment branch. Publish only with the real corpus preserved, human article approvals complete, and hosting settings confirmed. Verify the resulting live URLs, search, sitemap, source links, and mobile presentation.

Hashes detect changes; they are not identity verification, authentication, signatures, or proof of scientific correctness. Enforce actual authorization with repository permissions and human review. The exporter does not verify credentials, source truth, or whether a reader understood the lesson. Expired review dates do not automatically withdraw pages; the editorial owner must track review due dates.

## Article source and cutover

The user chose on October 18, 2026 to retire the unfinished external article pipeline. `lib/articles.ts` reads only `content/articles/catalog.json`; there is no runtime database read, fallback, or environment-controlled source selection. `HWLF_ARTICLE_SOURCE` and the old Supabase variables cannot reconnect the old article feed. No Vercel setting change is required for this switch.

The former `lib/supabase-blog.ts` reader and unused write helpers were removed; display types now live in `lib/article-types.ts`. Historical SQL and the standalone database migration script remain for recovery/reference and are never invoked by the site build or this publishing workflow. No external database or infrastructure was deleted or modified.

A normal release still requires at least one genuinely approved article. The catalog is currently empty, so a normal build deliberately fails with `No approved articles available; refusing an empty publication`. The three private drafts have not been approved. Do not merge this branch with an empty catalog or use test content to make a hosted build pass.

Preserve the URL of any existing article selected for migration; recover its content and obtain truthful review before exporting it. An empty public listing does not prove the old database is empty. Record the current public URL checks and outstanding preservation decisions in `docs/ARTICLE_SOURCE_CUTOVER.md`. PR #32's database/snapshot implementation is superseded by this source choice; do not merge it into the active reader. The PR itself and existing infrastructure are left intact.

## Verification

Use Node with native TypeScript stripping (22.18+ or a supported later version), the checked-in pnpm lockfile, and installed dependencies.

```sh
node --test __tests__/*.test.ts
node node_modules/typescript/bin/tsc --noEmit
node scripts/export-articles.mjs /absolute/path/to/editorial
node scripts/test-publishing-build.mjs
```

The unit-test command explicitly selects test files so it cannot accidentally discover the separate build/HTTP scripts. The last command temporarily inserts one visibly synthetic, non-health fixture and performs a full local Next.js webpack build. It deliberately supplies invalid legacy database settings and `HWLF_ARTICLE_SOURCE=hybrid` to verify those settings cannot affect the new reader. It restores the original catalog in `finally`. Test catalogs require `HWLF_LOCAL_CONTENT_TEST=1` and are rejected when `CI` or `VERCEL` is set. Never use this test script as a deployment command or deploy its `.next` output. If the process is forcibly killed, inspect the catalog before any subsequent build; a remaining `purpose: "local-test"` must be removed/restored.

To inspect that build locally, start Next on loopback with `HWLF_LOCAL_CONTENT_TEST=1 node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100`. Check `/blog/local-publishing-check`, `/blog`, `/education`, `/search?q=publishing`, and `/sitemap.xml`. Run `node scripts/test-publishing-http.mjs` to verify the served inventory, sitemap, table, and an unpublished URL. A private draft slug must return 404. Stop the local server afterward.

The fixture proves rendering and wiring; it does not prove production database connectivity, deployment permissions, real article approval, newsletter storage, or grant readiness. Newsletter persistence and educational analytics remain separate work.
