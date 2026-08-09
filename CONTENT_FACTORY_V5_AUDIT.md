# WeightLiteracy Content Factory V5 Audit

Audit branch: `claude/content-factory-v5-audit`
Baseline repository SHA: `fd31e2bee29661cb63d3a16567e1e43819c2475e`

## Executive decision

Do not mass-rewrite or republish the existing articles from the historical SQL seed files.

The production site reads published content from Supabase `blog_posts`, while this repository contains a migration/seed history. Production has also changed beyond the current GitHub `main` branch. The safe sequence is therefore:

1. Export the current production `blog_posts` table into version-controlled article records.
2. Freeze that snapshot and inventory the actual live corpus by slug.
3. Build topic, source, claim, reviewer, and article registries.
4. Audit every existing article against those registries.
5. Revise in controlled batches.
6. Run an independent YMYL/claim/cannibalization audit.
7. Stage approved changes before any Supabase write or public publication.

The current V4 article-ops prototype is useful as a strategy prototype, but it is not safe to use as an automatic health-content publication system without these changes.

## What exists today

### Production content source

`lib/supabase-blog.ts` reads live articles from Supabase `blog_posts`. The database currently supports author identity, reviewer identity, review dates, citations, disclaimer state, tags, category, and article content.

### Repository content source

The article corpus is represented historically through SQL files under `scripts/`, including the initial article seed and later GLP-1, telehealth, metabolic-health, and nutrition batches. These files are migration history, not a clean editorial corpus. Later seed scripts may revise or replace earlier records by slug.

### V4 article-ops prototype

The V4 artifact is not present as a separate GitHub repository or branch in the connected account. It currently exists as a standalone `hwlf-article-ops-v4.jsx` prototype outside this repository.

Its strongest concepts should be retained:

- topic clusters;
- reader journey stages;
- content-decay classes;
- internal-link planning;
- benefit/limitation balancing;
- explicit YMYL handling;
- structured article quality audit;
- human review gate;
- prompt versioning.

Its unsafe assumptions must not be carried forward.

## Critical findings

### V5-001 — Production and GitHub are not synchronized

Severity: Critical governance/reproducibility

The current public site contains disclosures and content that are not present in GitHub `main`. Therefore the SQL seed history cannot be treated as the authoritative state of the 39 live articles.

Required fix:

- export current Supabase rows before rewriting anything;
- version one article per record;
- create a snapshot manifest with hashes;
- make future database publication originate from reviewed version-controlled content rather than ad-hoc seed history.

### V5-002 — Reviewer identity must never be invented or auto-stamped

Severity: Critical trust/YMYL

The live About page states that the editorial team does not include licensed medical professionals and that content is evaluated against published clinical sources rather than independent clinical expertise.

The V4 prototype, however, contains role strings such as a licensed healthcare professional on a medical advisory panel and automatically writes `Medically reviewed` plus the current date into generated drafts.

The repository also has pages describing a medical-review process for clinical content.

Required fix:

- no draft generator may populate a medical reviewer, credential, or medical-review date automatically;
- `licensed_medical_review` may be recorded only after a real named reviewer performs and approves that review;
- otherwise use accurate states such as `editorial_review` or `clinical_evidence_review`;
- public schema, article UI, policy pages, and structured data must reflect the same verified review state.

### V5-003 — V4 asks Claude for sources but does not ground source selection

Severity: Critical evidence integrity

The V4 prompt requires named sources and inline attribution, but the prototype has no retrieval layer, source registry, URL verification, claim-source mapping, or primary-source allowlist enforcement before drafting.

That allows plausible but fabricated or mischaracterized citations.

Required fix:

`source registry -> atomic claim registry -> approved wording -> article draft`

The article writer must consume approved source/claim records. It must not be the authority that invents its own evidence packet during prose generation.

### V5-004 — Medical-review schema can overstate review status

Severity: High

`components/seo/article-schema.tsx` currently uses `MedicalWebPage` for broad category/disclaimer conditions, sets `lastReviewed` from the article update timestamp, and represents `reviewedBy` as the editorial organization. This can blur editorial updates and actual clinical review.

Required fix:

- distinguish content update from evidence review and licensed medical review;
- only emit review properties supported by a verified review record;
- do not infer medical review from category or disclaimer state.

### V5-005 — Current article validator validates rendering, not truth

Severity: High

`scripts/validate-articles.ts` checks article format, empty content, escaped HTML, and short content. It does not validate:

- source existence;
- citation URL resolution;
- numerical claims;
- mechanistic claims;
- reviewer integrity;
- review-date integrity;
- article intent overlap;
- stale evidence;
- conflicting claims across articles;
- unsupported medical advice language.

Required fix: replace it with layered structural, evidence, YMYL, reviewer, freshness, and cannibalization gates.

### V5-006 — V4 cannibalization detection is title-word overlap only

Severity: High SEO

The V4 prototype compares title words and warns only when overlap exceeds a threshold. Two articles can target the same user intent with very different titles and still cannibalize one another.

Required fix: compare at least:

- primary question;
- reader intent;
- claim set;
- proposed outline;
- target query cluster;
- expected reader outcome;
- canonical/merge relationship.

### V5-007 — V4 strategy demand/competition scores are hard-coded

Severity: Medium

Search-demand and competition scores are constants in code, not measured data. They should not be represented as current search evidence.

Required fix: separate `editorial priority` from `measured demand`, and attach provenance/date to any Search Console, Google Ads, or keyword data used for prioritization.

### V5-008 — Mechanical hedging rules should become claim-driven

Severity: Medium editorial quality

Rules such as hedging every third paragraph or inserting a provider prompt in every H2 can produce compliance theater rather than accurate calibration.

Required fix: wording should be controlled by claim classification:

- `established` — direct factual wording;
- `qualified` — qualifier required;
- `preliminary` — explicit uncertainty;
- `disputed` — explain disagreement;
- `individualized_medical` — no individualized recommendation.

### V5-009 — V4 prototype is not a production workflow application

Severity: Medium

The prototype keeps article state in React local state, uses three demo seed articles, calls an older Claude model directly from the browser, and does not import the live 39-article corpus. It is an excellent product specification/prototype, not a durable content system.

Required fix: move model calls server-side; persist jobs and audit state; import the production snapshot; use frozen article/source/audit revisions.

### V5-010 — Historical seed articles contain claims and identities that require re-audit

Severity: High

The earliest seed content contains credentialed author names and simplified medical/nutrition assertions that cannot be presumed verified. Later GLP-1 content also contains terminology that requires claim-level review. Historical metadata must not be treated as verified identity or evidence merely because it exists in SQL.

Required fix: all 39 live records enter the V5 system as `published_legacy` until evidence, identity, and review metadata have been audited.

## Recommended V5 architecture

```text
Production Supabase snapshot
        ↓
Existing Article Registry
        ↓
Topic / Search Intent Registry
        ↓
Evidence Source Registry
        ↓
Atomic Claim Registry
        ↓
Claude Research / Extraction
        ↓
Claude Writer
        ↓
Source Validator
        ↓
Claim Validator
        ↓
YMYL Safety Audit
        ↓
Cannibalization Audit
        ↓
Internal Link Graph
        ↓
Human Editorial Approval
        ↓
Licensed Review only when actually performed
        ↓
Candidate
        ↓
Staged CMS/Supabase publication
```

## V5 article lifecycle

```text
published_legacy
  -> snapshot_verified
  -> evidence_audit
  -> revision_candidate
  -> claim_audited
  -> editorial_review
  -> licensed_medical_review (optional, only when real)
  -> candidate
  -> approved
  -> staged
  -> published
```

No model may move an article directly from draft/revision to published.

## Core registries

### Topic registry

Each article/topic needs:

- stable topic ID;
- canonical question;
- reader intent;
- audience;
- topic cluster;
- reader journey stage;
- YMYL class;
- decay class;
- target query cluster;
- related topics;
- canonical/merge relationships.

### Source registry

Each source needs:

- stable source ID;
- title;
- URL/DOI;
- publisher/journal;
- publication date;
- source type;
- primary/secondary status;
- retrieved/verified date;
- trust tier;
- superseded/retracted state.

### Claim registry

Each health claim needs:

- stable claim ID;
- exact proposition;
- classification (`established`, `qualified`, `preliminary`, `disputed`, `individualized_medical`);
- source IDs;
- supported population/context;
- allowed wording;
- prohibited/overstated wording;
- limitations;
- last verified date;
- next review date;
- article IDs using the claim.

### Review registry

Each review event needs:

- reviewer identity or editorial role;
- review type;
- credentials when applicable;
- identity verification state;
- article revision SHA/hash;
- review date;
- decision;
- findings;
- next review date.

A `licensed_medical_review` event requires a verified real reviewer identity. Claude cannot create this state.

## Article publication hard gates

An article cannot become `approved` unless:

1. every clinical/statistical/mechanistic claim maps to approved claim IDs;
2. every claim has sufficient current evidence for its classification;
3. source URLs/identifiers resolve or have a documented archival exception;
4. no reviewer identity or credential is unverified;
5. YMYL safety audit has no blocking finding;
6. cannibalization audit finds a distinct reader job or recommends merge/canonicalization;
7. content-update date and review date are not conflated;
8. article disclosures accurately describe AI assistance and actual human review;
9. internal links resolve to current articles;
10. publication remains a separate explicit action.

## Google Ad Grant implications

The content factory should support the grant rather than optimize purely for traffic. Campaign landing pages should remain tightly aligned with mission-specific queries and provide substantial original educational value.

Recommended campaign/content clusters:

- GLP-1 literacy and patient questions;
- telehealth safety and provider evaluation;
- obesity/weight-health literacy;
- nutrition-label and food literacy;
- scam and misinformation awareness;
- Ohio/community health-literacy resources where relevant.

Ad traffic should land on genuinely useful educational pages, not thin SEO variants. Conversion tracking should measure meaningful actions such as newsletter signup, resource download, volunteer/contact completion, or donation completion—not ordinary page views.

## Immediate implementation order

### Gate A — snapshot and provenance

- export current Supabase rows;
- write one record per slug;
- generate manifest and hashes;
- reconcile live slug count with public site and seed history;
- freeze baseline SHA.

### Gate B — identity and trust integrity

- remove/fix unverifiable credentialed authorship in source records;
- reconcile About, Editorial Policy, Medical Review, schema, and article UI;
- prohibit automatic medical-review stamping.

### Gate C — evidence system

- build source and claim registries;
- classify every existing article claim;
- identify stale/unsupported claims.

### Gate D — 39-article audit

For every article produce:

- intent uniqueness score;
- source quality score;
- claim traceability score;
- YMYL safety score;
- trust/reviewer integrity score;
- freshness score;
- readability/usefulness score;
- internal-link score;
- Ad Grant landing-page suitability;
- decision: KEEP / REFRESH / MERGE / REDIRECT / NOINDEX / RETIRE.

### Gate E — controlled revision

Sonnet can revise at scale from approved evidence packets. Opus performs the independent claim/YMYL/cannibalization audit. Human approval controls publication.

## Audit score of current V4 concept

| Dimension | Score / 10 |
|---|---:|
| Topic/cluster strategy | 9 |
| Reader journey | 9 |
| Decay/review concept | 8 |
| Draft structure | 8 |
| Evidence grounding | 4 |
| Claim traceability | 3 |
| Reviewer integrity | 2 |
| Cannibalization protection | 4 |
| Production persistence | 3 |
| Human gate concept | 8 |
| Overall production readiness | 5.8 |

V4 should be treated as the design ancestor of V5, not as the production publishing authority.
