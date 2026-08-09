# V5 Stage 2A — Trust/Reviewer/Authorship Reconciliation Audit

Working branch: `claude/content-factory-v5-trust`
Base SHA (Stage 1, independently cleared): `918a6f7e5e62a831633d4e16a14ebeb6a67a1c09`

Scope: Issue #15 (trust/reviewer/authorship integrity) only. Issue #16 (claim/source
registry), Issue #17 (39/34-article audit), and article prose are explicitly out of
scope for this stage.

## Contradictions found

### 1. `components/seo/article-schema.tsx` fabricated review claims (critical)

For every article in a "medical" category (`Metabolic Health`, `Medication Literacy`,
`Weight Literacy`, `Education` — in practice, most of the corpus), the JSON-LD builder
unconditionally emitted:

```
lastReviewed: updatedAt || publishedAt
reviewedBy: { "@type": "Organization", name: "Healthy Weight Literacy Foundation Editorial Team" }
```

This is exactly the fabrication `CLAUDE_CONTENT_FACTORY_V5.md` prohibits: treating
`updated_at` as proof of review, and claiming a review occurred merely because an
organization edited/published the article. Verified against the data: **0 of the 34
published articles have `medical_reviewer`, `reviewer_credentials`, `reviewed_at`, or
`next_review_date` populated** — the schema was inventing a claim the underlying data
never made.

The `Article` (non-medical) branch also hardcoded `author: siteConfig.name` instead of
the article's real `author` field, so JSON-LD authorship could silently disagree with
the visible byline.

### 2. `/medical-review` and `/how-we-create-content` described a process that doesn't exist (critical)

Both pages asserted, in confident present tense, that a rigorous licensed/clinical
medical review already happens before publication:

- "Clinical content ... receives the most rigorous review process."
- "Published articles are assigned a review schedule ... reviewed on an annual basis
  at minimum."
- "The review date shown in each article footer reflects the most recent medical
  review."
- "Sources are listed at the end of every clinical article."
- "All articles covering medications, clinical conditions, or health decisions include
  this disclaimer."
- A pre-publish checklist item asserting review dates are "set correctly" for every
  article.

None of this was true. Verified against the data and code:

| Claim | Actual state |
|---|---|
| Per-article review date shown in footer | **No such UI existed at all** |
| Medical reviewer / credentials / review date recorded | **0 / 34 articles** |
| Citations listed at end of clinical articles | **0 / 34 articles** (`citations` field empty on every row; never rendered anywhere) |
| `has_medical_disclaimer` true | **0 / 34 articles** |
| Licensed clinical reviewer on staff/contract | **No evidence anywhere in the repository** |

This is precisely what `CONTENT_FACTORY_V5_AUDIT.md` (V5-002) and the Stage 2A brief
warn against: claiming a medical-review program, footer review dates, or disclaimer
presence that isn't backed by real data or a real process.

### 3. `/about` was missing the licensed-reviewer disclosure `CONTENT_FACTORY_V5_AUDIT.md` referenced

The audit doc describes the live About page as stating the editorial team does not
include licensed medical professionals. The current About page contained no such
statement at all — an omission that, combined with `/medical-review`'s overclaiming,
left no page anywhere telling readers the true reviewer status.

### 4. `/editorial-policy` also claimed the (nonexistent) footer review-date feature

"Review dates are shown in the article footer" and specific annual/12-month/3-month/
monthly cadences were stated as already-operating facts, contradicting the same "no
footer exists, no review dates exist" reality above.

### 5. Minor: inconsistent organization-name spelling across authors

`content/snapshot/articles/*.json` authors are one of `"HWLF Editorial Team"`,
`"Healthy Weight Literacy Foundation Editorial Team"`, or
`"Healthy Weight Literacy Foundation"` — three org-name variants, not a fabricated
identity. Per the Stage 2A constraint not to hand-edit the frozen snapshot, this was
left as-is and is noted here for a future editorial pass (Issue #17), not fixed now.

### What was already clean

- All 34 published articles' `author` field is organizational (no fabricated human
  names — no "Dr. Sarah Johnson"-style identity anywhere in the live corpus).
- `medical_reviewer`, `reviewer_credentials`, `reviewed_at`, `next_review_date`,
  `author_credentials`, `author_title`, `author_bio` were all empty/null on every
  article — i.e., the raw data itself never made a false claim; the fabrication was
  entirely in the rendering/schema layer synthesizing claims on top of clean data.
- `/medical-disclaimer` was already accurate (a liability disclaimer that claims no
  review process) and needed no changes.
- The Stage 1 sample-identity removal (`lib/mdx.ts`) from Issue #15's first pass held;
  no regression found.

## Public copy changed

- **`app/about/page.tsx`** — added a "Who Reviews Our Content" section stating the
  editorial team does not currently include licensed medical professionals, no
  licensed clinician review program exists today, and content is evaluated against
  published sources rather than independent clinical expertise. Links to Medical
  Review Process and How We Create Content for detail.
- **`app/editorial-policy/page.tsx`** — "Content Review and Updates" rewritten to
  describe the real "Content last updated" + Content Review Status mechanism instead
  of a footer feature that didn't exist; review cadences reframed as targets applied
  once a first review is complete, not an already-running schedule.
- **`app/medical-review/page.tsx`** — added a "Current Status" section stating plainly
  that no licensed clinical review program exists and 0 articles have completed a
  documented review; "What Gets Reviewed"/"What Review Covers" reframed as the
  definition of the process rather than an assertion it already happened; "Review
  Frequency" reframed as a target cadence starting after first review; footer-date
  claim corrected to describe the real per-article Content Review Status section.
- **`app/how-we-create-content/page.tsx`** — "The Review Process" reframed as the
  process the corpus is being audited against (not a completed fact for every
  article); "Sourcing Standards" and "Medical Disclaimers" claims qualified as our
  standard/target with an explicit admission that not every currently published
  article yet meets it; pre-publish checklist item corrected to say "no review date is
  shown" when a review hasn't happened.

No article body prose was touched. No claim about the Foundation's nonprofit status,
independence from advertisers/sponsors, or editorial topic-selection process was
changed — those were accurate and unrelated to reviewer/authorship trust.

## Data-model changes

New, separate, version-controlled overlay — the frozen Stage 1 snapshot
(`content/snapshot/**`) was never touched:

- **`content/reviews/registry.json`** — the review record store. Currently `{ "reviews": [] }`.
  Zero entries is the truthful state: no article has completed a documented review yet.
  This file must only ever contain a record that corresponds to a review that actually
  happened (Issue #17 will add real entries as audits complete).
- **`lib/review-registry.ts`** — `ReviewRecord`/`ReviewType`
  (`editorial_review | clinical_evidence_review | licensed_medical_review`)/
  `ReviewerType` (`organization | human`) types, `validateReviewRecord()` (enforces the
  hard `licensed_medical_review` gate: human reviewer, verified identity, recorded
  credentials, revision hash, review date — all required), and
  `getArticleReviewDisclosure()` / pure `buildDisclosureFromReviews()` — the single
  function both the visible UI and the JSON-LD builder call, so they cannot disagree.
  A review only counts if its recorded `reviewed_revision_hash` matches the article's
  *current* Stage 1 manifest hash (via the new `getRevisionHash()` export added to
  `lib/content-registry.ts`) — content changing after a review silently invalidates
  the stale claim rather than letting it survive.
- `content_update` (the fourth event type) was deliberately **not** added as a new
  record type — it already exists truthfully as each article's `published_at`/
  `updated_at` field in the Stage 1 snapshot. Adding a parallel tracker for it would
  have been redundant and risked drifting from the real value.

## Structured-data changes

`components/seo/article-schema.tsx`:

- `reviewedBy`/`lastReviewed` are now emitted **only** when
  `getArticleReviewDisclosure()` returns a current, hash-matched
  `clinical_evidence_review` or `licensed_medical_review` record. A plain
  `editorial_review` may be shown in the visible UI but is intentionally never surfaced
  as a schema.org medical-review claim, since `reviewedBy` on a `MedicalWebPage` is
  read by consumers as a medical-accuracy signal, not a copyediting one.
- A human reviewer is emitted as `{"@type": "Person", name, hasCredential: [...]}` ;
  an organization reviewer (`clinical_evidence_review` performed by the editorial team
  rather than a licensed individual) as `{"@type": "Organization", name}`. Neither can
  appear unless `validateReviewRecord()` already accepted the underlying record.
  `licensed_medical_review` can never resolve to an `Organization` reviewer — the
  validator rejects that record before it ever reaches the schema.
- `author` on both the `Article` and `MedicalWebPage` branches now uses the article's
  real `author` field (passed in from `app/blog/[slug]/page.tsx`) instead of a
  hardcoded organization name, so JSON-LD authorship always matches the visible byline.
- `dateModified` is unchanged (still `updatedAt || publishedAt`) — that property
  legitimately represents a content-update fact and was never the problem;
  `lastReviewed` was.
- The category → `MedicalWebPage` vs. `Article` decision itself (`MEDICAL_CATEGORIES`)
  was left unchanged — no evidence it's wrong, and it's an orthogonal, separate
  question from whether review properties are truthful.

## Author/reviewer disposition

- **34/34 published articles**: organizational authorship only (three name variants,
  no human identity, no fabricated credential) — verified clean, left untouched.
- **Reviewer fields**: 0/34 have any reviewer/credential/date populated — verified
  clean at the data layer.
- **Fabricated identities removed in Stage 1** (`lib/mdx.ts` — "Dr. Sarah Johnson",
  "Maria Chen, RD", "James Wilson, MPH", "Dr. Emily Roberts, PhD") remain removed;
  re-verified with no regression.
- **New visible surface**: `components/content/article-review-status.tsx` — a
  server component rendered on every article page showing the real "Content last
  updated" date plus, only when a real record exists, the review type/reviewer/date;
  otherwise a plain statement that the article "has not yet completed a dedicated
  evidence or clinical review," linking to `/medical-review`.

## Automated gates added

12 files, 34 new tests, on top of the 38 preserved from Stage 1 (72 total):

- `__tests__/review-registry.test.ts` (14 tests) — `validateReviewRecord()` hard-gate
  adversarial cases (missing hash, missing credentials, unverified identity,
  organization claiming a licensed review, AI/automated-audit-shaped record never
  reaching licensed status), plus `buildDisclosureFromReviews()` precedence/hash-
  matching/cross-slug-isolation cases, plus a check against the *real* registry
  proving it currently discloses nothing for any article.
- `__tests__/article-schema.test.ts` (6 tests) — `updatedAt` alone never produces
  `lastReviewed`; an `editorial_review` record never produces a schema.org review
  claim; a `clinical_evidence_review`/`licensed_medical_review` record does, correctly
  shaped; JSON-LD `author` always matches the passed-in visible author.
- `__tests__/trust-pages-consistency.test.ts` (10 tests) — About and Medical Review
  agree on the no-licensed-reviewer statement; the specific false footer/cadence/
  sourcing/disclaimer claims are confirmed absent from the corrected pages; no page
  claims a "medical advisory panel"; the Medical Disclaimer stays a pure liability
  notice.
- `__tests__/stage1-preservation.test.ts` (4 tests) — manifest.json byte-identical to
  the Stage 1 baseline hash; registry still resolves to exactly 34 articles; the
  committed snapshot is still `published_only`/34 (never gained the 5 historical
  unpublished rows); a repo-wide scan confirms no new Supabase write call site exists
  outside the pre-existing `lib/supabase-blog.ts` admin functions.

All existing Stage 1 tests (38) re-verified passing with no modification to their
assertions.

## Remaining limitations

- **Issue #16/#17 are still ahead of us.** The review registry is real machinery, but
  it is empty by design — no article has been through an actual editorial/evidence
  audit yet. This stage proves the model is truthful and enforced; it does not perform
  the audit.
- **No licensed medical reviewer exists.** This document does not claim otherwise, and
  the codebase now actively prevents any model or process from fabricating that state
  (`validateReviewRecord()` rejects it structurally).
- **Minor author-name inconsistency** (three organization-name spellings across the
  34 articles) was identified but intentionally not touched, per the constraint
  against hand-editing the frozen snapshot outside a real editorial pass.
- **`MEDICAL_CATEGORIES` category→schema-type mapping** was not re-evaluated — it was
  out of scope for a trust-integrity pass and no evidence surfaced that it's wrong.
- **The five historical unpublished rows** were not touched, inspected for content, or
  republished. They remain exactly as Stage 1 left them.
