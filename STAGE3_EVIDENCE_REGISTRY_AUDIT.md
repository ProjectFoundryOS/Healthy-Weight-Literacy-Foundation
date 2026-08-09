# V5 Stage 3 — Source, Claim, Topic & Evidence-Registry Foundation Audit

Working branch: `claude/content-factory-v5-evidence`
Base SHA (Stage 2A closure, independently cleared): `ae3a616ccf28604a382d7576c84f74e46197d010`

Scope: Issue #16 (source/claim/topic/evidence-packet architecture) plus a small,
non-blocking slice of Issue #27 (strict calendar-date validation; `/medical-review`
structured-data wording). **Out of scope**: rewriting any of the 34 published
articles, republishing the 5 historical unpublished rows, and the full legacy-corpus
audit (Issue #17). Nothing in this stage touches `content/snapshot/**`.

## 1. Why this stage exists

Stage 1 made the build deterministic. Stage 2A made review claims truthful (a review
is only ever disclosed if a real, hash-matched record exists). Neither stage gave the
corpus a structured, independently-verifiable evidence layer: before Stage 3, "this
article cites a source" meant a citation living inside article prose, with no
separate record of what was actually checked, when, or against what durable
identifier.

Stage 3 inverts that dependency. The rule enforced everywhere in this stage is:

```
source  →  atomic claim  →  evidence packet  →  article
```

Never the reverse. A source record is never created by pointing at existing article
prose and asserting it must have come from somewhere — every source in this seed set
was independently looked up and verified (PubMed, DailyMed, nationalacademies.org)
during this stage, with the verification method recorded on the record itself. A
generated paragraph is not evidence; the registries below are.

## 2. What was built

| Module | Registry file | Purpose |
|---|---|---|
| `lib/date-validation.ts` | — | Strict calendar-date validation shared by every registry (Issue #27 item 1) |
| `lib/source-registry.ts` | `content/sources/registry.json` | Verified source records + trust tiers |
| `lib/claim-registry.ts` | `content/claims/registry.json` | Atomic claims + claim-source contract |
| `lib/topic-registry.ts` | `content/topics/registry.json` | Reader-job topics + required-claim mapping |
| `lib/evidence-packet-registry.ts` | `content/evidence-packets/registry.json` | Deterministic per-topic writer boundary |
| `lib/claim-wording.ts` | — | Mechanical allowed/prohibited-phrase checker |
| `lib/evidence-dependency-audit.ts` | — | Retraction/supersession cascade + decay reporting |

Each registry follows the established codebase pattern: a **pure core function**
(`validateXRecord`, `buildX`) that takes already-loaded arrays and is directly
unit-testable, plus a **thin real-file-loading wrapper** (`loadX`) that reads the
committed JSON, validates every record, and throws on the first integrity failure
rather than silently returning an empty or partial array. This mirrors
`buildRegistryFromManifest`/`loadRegistry` in `lib/content-registry.ts` and
`buildDisclosureFromReviews`/`getArticleReviewDisclosure` in `lib/review-registry.ts`.

`content/reviews/registry.json` and `content/reviews/verified-reviewers.json` — the
Stage 2A review layer — were **not** touched or overloaded. They remain the sole
authority on article reviews; this stage's registries are evidence about the world,
not events about an article.

## 3. Issue #27 item 1 — strict calendar dates

`isValidDateString` (previously defined in `lib/verified-reviewer-registry.ts`)
accepted any `YYYY-MM-DD`-shaped string that JavaScript's `Date` parser could turn
into *some* instant. `new Date("2026-02-31")` does not throw — it silently rolls over
to March 3, 2026 — so a record claiming `"verified_at": "2026-02-31"` passed the old
check while asserting a date that never existed.

`lib/date-validation.ts` now round-trips the parsed UTC year/month/day back against
the original string's own digits and rejects any mismatch. `2025-02-29` (not a leap
year), `2026-13-01`, and `2026-01-00` are all rejected; `2024-02-29` (a real leap day)
is accepted. `lib/verified-reviewer-registry.ts` re-exports this implementation
(`export { isValidDateString } from "./date-validation"`) so every existing Stage
2A/#26 call site (`lib/review-registry.ts`) keeps working unchanged while gaining the
stricter check — no import path anywhere in the codebase needed to change. Every new
registry in this stage (sources, claims, topics, packets) uses the same shared
validator for every date field it stores.

## 4. Source registry (`lib/source-registry.ts`)

A `SourceRecord` is never trusted merely because it has a `canonical_url`. The
`verification` block records what was actually checked: `url_checked`,
`identifier_checked` (required `true` whenever `doi`/`pmid`/`other_identifier` is
present), `title_matched`, `publication_metadata_matched`, plus `verified_at` and
`verification_method`. `validateSourceRecord` rejects a record where any of these is
missing or false — a URL that was never actually fetched cannot be evidence.

**Trust tiers** are an explicit, non-domain-based ladder (`isAtLeastTier` compares
them): **A** — FDA/NIH/CDC/regulators, major peer-reviewed primary research
(RCTs/observational cohorts), systematic reviews/meta-analyses, current clinical
guidelines. **B** — peer-reviewed narrative reviews, professional-society educational
material. **C** — secondary educational sources. **D** — manufacturer marketing,
press releases, news, unsourced web content — useful for discovery only, never
sufficient to independently support a clinical claim. `source_type` is a 17-value
enum (`FDA_label`, `peer_reviewed_RCT`, `meta_analysis`, `government_health_authority`,
etc.) and is validated against that enum, not inferred from the URL's domain.

`status` (`current`/`superseded`/`corrected`/`retracted`/`unavailable`) plus an
optional `superseded_by_source_id` are the hook the dependency-audit module (§8) walks
to detect invalidation and circular-supersession chains.

### Seed data (9 real, independently verified sources)

Deliberately small — **9 sources**, not hundreds — chosen to exercise every domain
Issue #16 named:

| Domain | Source | Tier | Verified via |
|---|---|---|---|
| A. Weight vs. fat loss | Prentice & Jebb, *Obesity Reviews* 2001 (PMID 12120099) | B | PubMed |
| B. Fasting | de Cabo & Mattson, *NEJM* 2019 (PMID 31881139) | B | PubMed |
| C. GLP-1/semaglutide | Wilding et al., STEP 1, *NEJM* 2021 (PMID 33567185, NCT03548935) | A | PubMed |
| C. GLP-1/semaglutide | Wegovy FDA prescribing information | A | DailyMed |
| D. Tirzepatide | Jastreboff et al., SURMOUNT-1, *NEJM* 2022 (PMID 35658024, NCT04184622) | A | PubMed |
| D. Tirzepatide | Zepbound FDA prescribing information | A | DailyMed |
| E. Protein/lean mass | Hudson et al., *Adv Nutr* 2020 meta-analysis (PMID 31794597) | A | PubMed |
| F. Hydration | NASEM/IOM 2005 Water DRI report | A | nationalacademies.org |
| G. Weight regulation | Fothergill et al., *Obesity* 2016, Biggest Loser follow-up (PMID 27136388) | A | PubMed |

Every row's `verification.verification_method` names the exact tool call and page
used; none of these bibliographic details were taken from model memory. The two FDA
labels were verified via DailyMed (NIH's structured mirror of the FDA label) after
`accessdata.fda.gov` returned an anti-bot 404 to direct fetches. Every day-of-month
defaulted to "01" where the source's own page did not display one is called out
explicitly in that record's `notes` field — never silently invented.

## 5. Atomic claim registry (`lib/claim-registry.ts`)

A claim is the smallest independently assessable factual proposition — never a
paragraph's worth of bundled assertions. `"GLP-1 medications are safe and effective"`
is not a claim in this registry; `"In the STEP 1 trial, once-weekly subcutaneous
semaglutide 2.4 mg produced a mean body-weight change of -14.9% at week 68, compared
with -2.4% for placebo"` is.

**Claim-source contract**, enforced in `validateClaimRecord`:

- Every claim, regardless of `claim_type`, must have ≥ 1 `source_id`. There is no
  claim type exempt from this — an unsourced claim is inherently invalid.
- `classification: "established"` requires ≥ 1 `primary_source_ids` entry resolving
  to a **current**, **Tier A or B** source. Tier C/D can never carry an established
  claim.
- If `ymyl_risk` is `"high"` or `"critical"`, that primary source must specifically be
  **Tier A** — a Tier B narrative review is not enough for a critical medical claim.
- If every primary source for an active (non-superseded), high/critical-risk claim has
  `status: "retracted"`, the claim fails — a retracted source can never be a
  high-risk claim's sole support.
- `claim_type: "statistical_result"` requires a `statistical_detail` block
  (`value`/`unit`/`measure_type`/`population`/`sample_size`/`confidence_interval`/
  `comparison`/`time_point`/`source_location`) — this is what stops "14.9%" from
  drifting into "about 20%" in some future draft without an explicit, auditable
  transformation.
- An optional `trial_detail` block preserves trial name, registration ID, population,
  N, intervention/dose, duration, primary endpoint, result, major exclusions, and the
  regulatory relationship — so a trial result can never be silently generalized beyond
  the population it was measured in. `primary_publication_source_id` must be one of
  the claim's own `source_ids`.

### Seed data (11 real claims)

11 claims across the same 7 domains, all resolving cleanly against the 9 seed
sources: BMI-as-surrogate (definition), the fasting metabolic switch (mechanism,
classified `"qualified"` rather than `"established"` — a single narrative review
synthesizing many studies is real support but not the same tier of evidence as a
dedicated trial), the STEP 1 and SURMOUNT-1 headline results (`statistical_result` +
full `trial_detail`), the Wegovy and Zepbound boxed-warning and regulatory-status
claims (`critical`/`high` risk, Tier A FDA labels), protein/lean-mass preservation, the
NASEM hydration Adequate Intake figures, and the Biggest Loser 6-year metabolic
adaptation finding (with its very small n=14 cohort called out in `limitations` and
`required_qualifiers`, precisely so an article can't silently generalize it). **6 of
the 11 claims are `high`/`critical` risk** — all 6 resolve to a Tier A primary source,
as the contract requires.

## 6. Topic registry (`lib/topic-registry.ts`)

A `TopicRecord` names a genuine reader job (`canonical_question`, `reader_intent`,
`reader_stage`, `target_reader`, `desired_reader_outcome`) — not a keyword.
`required_claim_ids`/`optional_claim_ids` must resolve against the claim registry
(`validateTopicRecord` fails a topic that requires an unknown claim); a topic at
`status: "evidence_ready"`, `"article_candidate"`, or `"existing_article"` must name
at least one required claim (a `"research"`-status topic may legitimately have zero —
it's still gathering evidence).

`query_evidence` entries may only claim to be measured search demand if they carry a
real `source`, `measurement_type`, and `measured_at` date — an entry missing any of
these fails validation rather than silently passing as data. **This seed set contains
zero `query_evidence` entries.** No Ad Grant or Keyword Planner measurement was
actually taken during this stage, so none is recorded — inventing a plausible-looking
number here would be exactly the fabrication Issue #16 prohibits. `notes` fields
instead carry qualitative observations, clearly framed as such.

### Seed data (7 topics)

One topic per domain except weight-regulation (G) and hydration (F), which pull from
the same claim. Cross-referencing the topics against the real 34-article snapshot
surfaced a genuine, unplanned finding: **`hydration-and-health-how-much-water-do-you-
need` and `hydration-weight-health-daily-functioning` are near-duplicate legacy
articles covering the same reader question** — flagged on the hydration topic's
`cannibalization_candidates` for Issue #17 to resolve. No article content was changed
to surface or act on this finding.

## 7. Evidence packets (`lib/evidence-packet-registry.ts`)

A writer must never query the whole claim/source registry ad hoc. An
`ArticleEvidencePacket` is the deterministic, pre-assembled boundary of what an
article on a topic may state: `mandatory_claim_ids` (non-negotiable),
`optional_claim_ids`, `source_ids` (every source any approved claim needs, so a
writer never has to reach outside the packet), `required_limitations`,
`required_safety_context`, `prohibited_claims`, `allowed_conclusions`, and
`uncertainty_notes`.

`validatePacketRecord` fails a packet that: references an unknown topic or claim;
includes a claim classified `"superseded"` in `approved_claim_ids`; is missing a
source a claim it approves actually depends on; or silently drops a claim its own
topic requires.

**Staleness**: `computeRegistryRevisionHash` produces an order-independent sha256 of
an entire registry array (the same pattern the Stage 1/#14 manifest already uses for
article content). Each packet freezes `source_registry_revision` and
`claim_registry_revision` at generation time. `isPacketStale` recomputes both hashes
against the live registries — if either has changed since generation, the packet is
stale regardless of whether the specific claim it cites was the one that changed.

### Seed data (7 packets)

One packet per seed topic, all currently **not stale** against the live registries
(verified by `npm run validate:evidence` and by a dedicated test).

## 8. Claim wording contracts (`lib/claim-wording.ts`)

**Explicit scope limit, stated in the module itself**: this is a mechanical
phrase-contract checker, not a semantic-accuracy checker. `checkProseAgainstClaim`
and `checkProseAgainstPacket` can reliably catch an exact prohibited phrase appearing
in prose, or the exact text of a required qualifier being absent. They **cannot**
determine whether prose is scientifically accurate, whether a paraphrase preserves a
qualifier's meaning, or whether a claim is stated misleadingly while avoiding every
listed prohibited string. A clean mechanical result is necessary, never sufficient —
semantic accuracy remains an Opus/human review responsibility. This module exists so
a later audit pass has *something* mechanical to run first, not to replace that
review.

## 9. Retraction/supersession safety & decay (`lib/evidence-dependency-audit.ts`)

This module demonstrates, mechanically, the exact invalidation path Issue #16
requires: **source retracted → claim loses required support → evidence packet
referencing that claim goes stale → topic/article flagged**. A dedicated test
(`__tests__/evidence-dependency-audit.test.ts`, "end-to-end retraction/supersession
cascade") builds a clean fixture, asserts it passes every check, then flips a single
source's `status` to `"retracted"` and asserts the same fixture now fails
`findClaimsWithoutCurrentSupport`, `findHighRiskClaimsLackingCurrentPrimarySupport`,
`findStalePackets`, and `findTopicsWithStalePacket` — proving the cascade is real, not
just independently-testable functions that happen to share names. A second test
proves the same cascade fires when a claim is directly reclassified `"superseded"`
without any source change.

The module also detects **circular supersession chains** (a source or claim
transitively superseded-by itself) via a single forward walk per node — each record
has at most one outgoing `superseded_by_*` edge, so the graph is a functional graph
and a general-purpose cycle-detection library isn't needed — and **dangling
supersession references** (`superseded_by_source_id`/`superseded_by_claim_id` pointing
at an ID that doesn't exist).

**Decay reporting** is informational, not an integrity failure:
`findClaimsDueForReview` reports claims whose `review_due_at` has arrived;
`findSourcesDueForVerification` reports sources that are primary support for a due
claim (sources don't carry their own review-due date — they inherit the schedule of
the claims that depend on them). Suggested per-category ceilings
(`DECAY_CLASS_MAX_DAYS` in `lib/claim-registry.ts`) are advisory only:
`regulatory_drug_access` 30–90 days, `medication_safety_active` 90 days,
`clinical_efficacy` 6–12 months, `nutrition_physiology` 12–24 months,
`basic_definition` unbounded. Every claim's actual `review_due_at` is authoritative
and may override the category default in either direction. As of this stage's
generation date (2026-08-09), **0 seed claims and 0 seed sources are currently due**.

## 10. Validators

Five new `npm run` scripts, following the existing `scripts/validate-articles.ts`
pattern of importing directly from `lib/*.ts` (never reimplementing validation logic
in the script itself) and exiting non-zero on any failure:

```
npm run validate:sources               # 9/9  OK
npm run validate:claims                # 11/11 OK
npm run validate:topics                # 7/7  OK
npm run validate:evidence              # 7/7  OK, 0 stale
npm run audit:evidence-dependencies    # clean — 0 violations of any kind
```

## 11. Negative/adversarial tests

Every negative test Issue #16 explicitly requires has a corresponding, currently
passing test (file: assertion):

| Required negative test | Where it's proven |
|---|---|
| Clinical claim + zero sources → FAIL | `claim-registry.test.ts` |
| Statistical claim + generic org-homepage source → FAIL | `claim-registry.test.ts` |
| High-risk established claim + only Tier C source → FAIL | `claim-registry.test.ts` |
| Claim references unknown source_id → FAIL | `claim-registry.test.ts` |
| Topic references unknown claim_id → FAIL | `topic-registry.test.ts` |
| Evidence packet references superseded claim → FAIL | `evidence-packet-registry.test.ts` |
| Active claim's sole source retracted → stale/FAIL | `evidence-dependency-audit.test.ts` (end-to-end cascade) |
| Search-demand value with no source/date → FAIL | `topic-registry.test.ts` |
| Duplicate source_id / claim_id / topic_id / packet_id → FAIL | one test per registry |
| Invalid enum (any registry) → FAIL | one test per registry |
| Impossible calendar date → FAIL | `date-validation.test.ts` + a dedicated test in every registry that stores a date |
| Valid source + properly scoped claim + topic + packet → PASS | "real registries" describe block in every registry test file, plus the full clean-report test in `evidence-dependency-audit.test.ts` |

## 12. What is mechanically verified vs. what still needs human/Opus review

**Mechanically verified by this stage's code** (throws/fails on violation, exercised
by the negative tests above): registry shape and enum validity; duplicate-ID
detection; every date field's calendar validity; the claim-source contract (source
existence, trust-tier floor by classification and risk, retracted-source-as-sole-
support); topic → claim referential integrity; packet → topic/claim/source
referential integrity, including "does the packet carry every source its claims
need" and "does the packet respect the claim's supersession state"; the full
retraction/supersession → stale-packet → flagged-topic cascade; circular and
dangling supersession references; exact prohibited-phrase presence and exact
required-qualifier absence in prose.

**Explicitly not mechanically verified — requires human/Opus review**:

- Whether a claim's `canonical_claim` text is itself scientifically accurate, beyond
  the fact that it's traceable to a verified source.
- Whether prose that avoids every listed prohibited phrase is nonetheless misleading
  in a way no phrase list anticipated.
- Whether a paraphrased required qualifier preserves the original's meaning (the
  wording checker can only detect the exact string's absence, not a semantically
  equivalent substitute).
- Whether the trust tier assigned to a source is correct in a genuinely borderline
  case (tiers are structural, not automatically derived from domain name or venue
  prestige, and a human editorial judgment call is still the final word).
- Whether any of the 34 existing published articles' prose actually complies with the
  claims/wording contracts recorded here — that audit is explicitly Issue #17's job.
  Recording `existing_article_slugs` on a topic states only that a legacy article
  covers the same reader question, never that its prose has been checked against the
  linked claims.

## 13. Preserved gates from Stage 1 / Stage 2A

Reconfirmed at this stage's frozen SHA, not merely assumed: 34 published article
records with valid content hashes (`npm run validate:articles`, `check-content-
registry.mjs` prebuild step); zero duplicate slugs; zero build-time Supabase article
reads (`/api/v5/content-inventory` remains the only Supabase read, and is a dynamic
route, not part of static generation); `/resources` retired; no fabricated authors;
`content/reviews/registry.json` and `content/reviews/verified-reviewers.json` remain
untouched and empty (Issue #16 does not constitute an article review); review status
disclosure logic and its adversarial tests (`review-registry.test.ts`,
`verified-reviewer-registry.test.ts`, `reviewer-state-integrity.test.ts`,
`no-credential-leakage.test.ts`) all still pass unmodified.

## 14. Known limitations

- The seed set is intentionally small (9 sources, 11 claims, 7 topics, 7 packets).
  This proves the architecture works end-to-end; it is not a claim that these 7
  domains are "done" or that the registries are anywhere near covering the 34-article
  corpus. That growth is Issue #17's explicit job.
- No `query_evidence` entries exist yet because no real search-demand measurement was
  taken. The topic registry can represent one correctly; none is recorded until one is
  actually measured.
- `lib/claim-wording.ts` is exact-substring matching (case-insensitive). It will miss
  a prohibited claim phrased in synonyms, and will flag a required qualifier as
  "missing" even if a semantically equivalent sentence is present in different words.
  Both failure modes are called out in the module's own doc comment; a positive result
  from this checker should never be read as "this prose is accurate."
- Two source-label revision dates (Wegovy, Zepbound) show only month/year on their
  DailyMed pages, so `publication_date` defaults the day-of-month to `01`; this is
  disclosed in each record's `notes`, not silently assumed.
- `DECAY_CLASS_MAX_DAYS` ceilings are advisory constants, not enforced by any
  validator — a claim's own `review_due_at` can currently be set arbitrarily far out
  without the system objecting. Enforcing the ceiling (or at least warning when a
  claim's schedule exceeds its category's suggested maximum) is a reasonable future
  hardening pass, not done in this stage.
- None of this runs as background automation. The validators and the dependency audit
  are on-demand scripts; wiring `audit:evidence-dependencies` into CI or a scheduled
  job is future work, not part of this stage's scope.

## 15. Verification performed

```
npm test                             211/211 tests passed (21 files)
npm run lint                         0 errors, 0 warnings
npm run build                        succeeded (Next.js 16.0.10, Turbopack)
npm run validate:articles             34/34 articles OK
npm run validate:sources              9/9 OK
npm run validate:claims               11/11 OK
npm run validate:topics               7/7 OK
npm run validate:evidence             7/7 OK, 0 stale
npm run audit:evidence-dependencies   clean, 0 violations
```

34 published articles unchanged (content hashes verified against
`content/snapshot/manifest.json`); 5 historical unpublished rows untouched; 0
build-time Supabase article reads; 0 article bodies rewritten; 0 new review records
(`content/reviews/registry.json` still has zero entries); 0 new verified reviewers.
