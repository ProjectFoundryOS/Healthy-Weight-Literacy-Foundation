# Sonnet V5 Stage 1 execution handoff

Repository: `TheRealSynth/Healthy-Weight-Literacy-Foundation`

Working branch: `claude/content-factory-v5-audit`

Do not merge to `main`. Do not write to production Supabase. Do not publish or unpublish articles.

## Read first

1. `CONTENT_FACTORY_V5_AUDIT.md`
2. `CONTENT_FACTORY_V5_SCHEMA.md`
3. `CLAUDE_CONTENT_FACTORY_V5.md`
4. `LIVE_CONTENT_PRELIMINARY_AUDIT_2026-08-09.md`
5. GitHub Issues #14, #15, #16, #17, #18, #19, #20, #21, #23, #24
6. Draft PR #22

## Current verified environment

Vercel project: `v0-healthyweightliteracyfoundation`

Production domains:
- `weightliteracy.org`
- `www.weightliteracy.org`

Historical April audit reported 39 published articles. Public `/blog` observed on 2026-08-09 currently displays 34 article cards. Do not assume either count is the database truth until reconciled.

## Stage 1A — authoritative content snapshot

Goal: complete Issue #14.

Use a read-only production Supabase connection available through the authorized Vercel/local environment.

Run:

```bash
npm run content:snapshot
```

Expected output:

```text
content/snapshot/manifest.json
content/snapshot/articles/<slug>.json
```

Requirements:
- SELECT/read only.
- No inserts, updates, deletes, RPC writes, schema changes, publication changes, or service-role operations beyond what is strictly necessary for read access.
- Confirm every `is_published=true` row is represented exactly once.
- Reconcile database count against the 34 public `/blog` cards and historical 39 count.
- Explain missing/unpublished/duplicate/redirected rows.
- Verify no secrets or keys are written into snapshot files.
- Hash each article record and the manifest.
- Commit the snapshot and freeze the resulting SHA.

If production environment variables are not locally available, use Vercel CLI authenticated to the verified project to pull environment configuration into an ignored local file. Never commit environment files or print secret values.

## Stage 1B — deterministic Vercel article builds

Goal: complete Issue #23 after the snapshot exists.

Current problem:
- fresh Vercel preview logs show Supabase `fetch failed` during `next build`;
- `getBlogPosts()` catches the error and returns `[]`;
- build still succeeds;
- `generateStaticParams()` can therefore produce zero blog slugs in a green deployment.

Preferred architecture:
- committed V5 article records become the build-time source of truth;
- blog index, article routes, search, sitemap and related links consume that registry;
- Supabase becomes an import/publishing mirror rather than a required network dependency during `next build`.

Do not make a partial architecture that leaves search on `lib/mdx.ts` while article pages use a different source.

Add integrity checks so an established corpus cannot silently become zero in a successful build.

## Stage 1C — fix production `/blog` jsdom crash

Goal: complete Issue #24.

Current production Vercel runtime evidence:
- repeated `ERR_REQUIRE_ESM` failures under `/blog/[slug]`;
- root chain: `isomorphic-dompurify -> jsdom -> html-encoding-sniffer -> @exodus/bytes`;
- known affected examples include telehealth and online-prescription safety pages.

Preferred fix:
1. normalize legacy HTML to committed Markdown during migration; and
2. remove jsdom-backed sanitization from ordinary article rendering.

If temporary HTML compatibility is necessary, use a Node-native sanitizer with explicit tag/attribute allowlists and XSS regression tests. Do not render unsanitized database HTML.

Verify affected routes in a real Vercel preview.

## Stage 2 trust prerequisite

Do not fabricate author or reviewer credentials.

`lib/mdx.ts` currently contains sample identities such as credentialed doctors/dietitians. These must not remain in any user-facing search/article path unless independently verified as real contributors.

A model may create:
- editorial audit;
- source audit;
- evidence audit;
- compliance audit.

A model may not create a `licensed_medical_review` event or public `medically reviewed by` claim.

## Content changes during this stage

Do not mass-rewrite articles yet.

You may:
- normalize formatting necessary for deterministic migration;
- produce audit metadata;
- create source/claim registry scaffolding;
- identify KEEP / REFRESH / MERGE / REDIRECT / NOINDEX / RETIRE candidates.

Do not change live publication state.

## Verification

Before handoff, run at minimum:

```bash
npm install
npm run build
npm run lint
```

Also add and run tests for:
- snapshot manifest/article count integrity;
- duplicate slug detection;
- article registry nonzero/minimum-count guard;
- search/sitemap/article route registry consistency;
- HTML sanitizer XSS fixtures if HTML compatibility remains;
- reviewer-state integrity;
- no credential/sample identity leakage in live search content.

Deploy the branch to Vercel preview and verify:
- `/blog` renders the full reconciled candidate/approved corpus;
- representative Markdown articles render;
- known legacy HTML articles render after normalization/compatibility fix;
- `/blog/understanding-telehealth-weight-management-guide` no longer triggers the jsdom error;
- `/blog/understanding-online-prescriptions-safety-best-practices` no longer triggers the jsdom error;
- search results agree with the same article registry;
- sitemap article URLs agree with the same registry;
- zero Supabase write calls were introduced.

## Handoff

When complete, stop before mass content rewriting.

Return:

```text
V5 Stage 1 complete

Frozen SHA:

Production snapshot:
- published DB rows:
- public blog cards:
- reconciled count:
- discrepancy explanation:

Build-time Supabase dependency:
- fixed/not fixed
- architecture:

Legacy HTML/jsdom blocker:
- fixed/not fixed
- affected route verification:

Trust/search cleanup:
- sample credential identities removed from user-facing paths: yes/no

Vercel preview:
- URL:
- build: PASS/FAIL
- representative article routes: PASS/FAIL

Tests:

Known limitations:
```

Do not proceed to the Sonnet article rewrite batches until this Stage 1 SHA is independently reviewed.
