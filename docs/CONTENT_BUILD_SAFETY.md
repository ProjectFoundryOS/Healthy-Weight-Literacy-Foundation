# Content build safety (WL-BUILD-001)

## Problem

`getBlogPosts()`/`getBlogPost()` in `lib/supabase-blog.ts` used to catch every
Supabase configuration/query/network error and return `[]` / `null`. Every
build-time consumer of article data (`app/blog/[slug]/page.tsx`'s
`generateStaticParams`, `app/blog/page.tsx`, `app/education/page.tsx`,
`app/page.tsx`, `app/sitemap.ts`) treated an empty result as "no articles yet"
rather than "retrieval failed." A `next build` where Supabase was unreachable
would therefore complete successfully while silently generating **zero**
article routes and shipping an empty sitemap — a green deploy with no
articles.

## Fix

- `lib/content-snapshot.ts` loads a committed, integrity-checked snapshot of
  published posts from `lib/content-snapshot-data/` (a JSON array plus a
  manifest recording its row count and sha256). A missing, corrupt, or
  tampered snapshot is treated as empty/untrusted rather than throwing or
  being silently accepted.
- `scripts/export-content-snapshot.mjs` (`npm run content:snapshot`) is a
  read-only exporter an operator runs against a healthy Supabase connection to
  refresh that snapshot. It refuses to overwrite a non-empty snapshot with an
  empty one unless `--allow-empty` is passed.
- `lib/supabase-blog.ts`'s `getBlogPosts()`/`getBlogPost()` now:
  1. use live Supabase data when the live fetch succeeds with content;
  2. fall back to the validated snapshot when the live fetch fails, or
     succeeds but returns nothing;
  3. **fail the build closed** (throw `BuildContentIntegrityError`) when
     neither live data nor the snapshot has any content, instead of silently
     returning an empty list.
- The escape hatch `ALLOW_EMPTY_ARTICLE_BUILD=true` lets an operator
  explicitly opt into a zero-article build (e.g. a genuinely new site before
  any content exists).
- `app/sitemap.ts` no longer swallows `getBlogPosts()` errors in a bare
  `try/catch` — that catch was silently producing a sitemap with zero blog
  URLs, defeating the fail-closed behavior for exactly the surface it's meant
  to protect.
- The resolution logic (`resolveBlogPosts` in `lib/supabase-blog.ts`) is a
  pure function covered by unit tests in `__tests__/supabase-blog-resolution.test.ts`,
  and the snapshot loader is covered by `__tests__/content-snapshot.test.ts`.

## Current state

No snapshot is committed yet (`lib/content-snapshot-data/` does not exist in
this change) — this repository sandbox has no live Supabase credentials to
export one safely. Until an operator runs `npm run content:snapshot` once
against a healthy connection, a Supabase outage during build will fail the
build closed rather than silently shipping zero articles. That is a strictly
safer default than before; populating the snapshot is a non-blocking
follow-up that adds graceful degradation on top of it.

## Verification performed

- `npm run test` (vitest): 17/17 passing, including the new resolution and
  snapshot-integrity tests.
- `npx tsc --noEmit`: clean.
- `npx next build --webpack --debug-build-paths "app/page.tsx"` exercised all
  three real code paths against the actual Next.js build pipeline:
  - no live Supabase, no snapshot → build fails with `BuildContentIntegrityError`
    (previously this silently succeeded);
  - same, with `ALLOW_EMPTY_ARTICLE_BUILD=true` → succeeds with 0 articles;
  - no live Supabase, a temporary fixture snapshot present → succeeds, serving
    the snapshot's posts (fixture removed afterward, nothing fabricated is
    committed).
- A full, unrestricted `next build` (all routes) could not be exercised in
  this sandbox: it fails before reaching any of this mission's code, on two
  pre-existing, unrelated issues — a Turbopack `NftJsonAsset` panic in this
  sandbox, and the already-tracked `isomorphic-dompurify`/jsdom
  `default-stylesheet.css` crash on `/blog/[slug]` (upstream issue #24, not
  part of this mission). `--debug-build-paths` was used to build the
  unaffected routes directly against the real pipeline instead.
- `pnpm lint` currently fails repo-wide with "ESLint couldn't find an
  eslint.config.js" (ESLint 9 requires flat config) — pre-existing, unrelated
  to this change, not fixed here to keep this mission's diff scoped.
