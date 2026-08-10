# V5 Stage 4 — Legacy Published-Corpus Audit

Working branch: `claude/content-factory-v5-corpus-audit`
Base SHA (Stage 3 closure, independently cleared): `45e1342a478fce908a9234778c4aa8bc6e3479f8`

Scope: Issue #17 — a structured, evidence-backed audit and disposition
(KEEP/REFRESH/MERGE/REDIRECT/NOINDEX/RETIRE) for all 34 currently published
articles, plus a read-only, privacy-conscious disposition pass over the 5
unpublished historical Supabase rows. **Out of scope, absolutely**: rewriting any
article body, republishing any of the 5 unpublished rows, writing to production
Supabase, changing any article's `is_published` status, and creating any
`editorial_review`/`clinical_evidence_review`/`licensed_medical_review` record on
the strength of this AI audit alone. Nothing in this stage touches
`content/snapshot/**`. This stage tells the next rewrite stage (Issue #18) *what*
should happen to each article and *why* — it does not perform the rewrite.

## 1. Why this stage exists

Stage 3 built a real evidence layer (sources → claims → topics → evidence packets)
and seeded a small, genuinely verified set spanning 7 domains. It deliberately did
not check that seed against the 34 already-published legacy articles — those
articles were written before the evidence layer existed, so their claims have never
been individually traced to a verified source, their disposition (should this page
even keep existing in its current form?) has never been decided from evidence, and
the corpus has never been checked for near-duplicate pages competing against each
other in search.

Stage 4 closes that gap for every currently published article, without touching a
single word of any article's frozen prose. The rule enforced throughout this stage
mirrors Stage 3's own: an audit finding is only ever recorded if it is genuinely
grounded — in the frozen snapshot content, in a real (already-registered or newly
verified) source, or in an explicit, honestly-labeled absence of evidence
(`needs_semantic_review`, `packet_status` incompleteness, `null` query evidence).
Nothing here is invented to make the corpus look more finished than it is.

## 2. What was built

| Module | Registry file(s) | Purpose |
|---|---|---|
| `lib/article-audit-registry.ts` | `content/audits/stage4/manifest.json`, `content/audits/stage4/articles/<slug>.json` | Per-article `ArticleAuditRecord`: disposition, scores, claim audit, authorship/safety findings |
| `lib/cannibalization-registry.ts` | `content/audits/stage4/cannibalization.json` | Genuine content-overlap clusters and their recommended resolution |
| `lib/unpublished-audit-registry.ts` | `content/audits/stage4/unpublished-summary.json` | Minimal, privacy-safe disposition metadata for the 5 unpublished rows |
| `scripts/validate-stage4-audit.ts` | — | Cross-validates all three registries against each other, the manifest, and the claim/source registries; recomputes and diff-checks `corpus-summary.json` |

Each module follows the established codebase pattern: a pure `validateXRecord`
function that takes already-loaded arrays (directly unit-testable, see
`__tests__/article-audit-registry.test.ts`, `__tests__/cannibalization-registry.test.ts`,
`__tests__/unpublished-audit-registry.test.ts`), plus a thin `loadX` wrapper that
reads the committed JSON and throws on the first integrity failure. `content/audits/
stage4/corpus-summary.json` is a **derived report only** — `validate-stage4-audit.ts`
recomputes every one of its aggregate fields from the three source-of-truth
registries and fails the build if the committed summary has drifted from them, so it
can never silently go stale the way a hand-maintained summary could.

`npm run validate:stage4-audit` is wired as the sixth and final step of `npm run
validate:evidence-all`, which is itself chained into `prebuild` — a SHA where this
audit registry does not validate cleanly can never reach `next build`.

## 3. Scorecard rubric

Each article received a 0–100 score across ten weighted categories:

| Category | Weight |
|---|---|
| Reader intent match | 10 |
| Evidence quality | 15 |
| Claim traceability | 15 |
| YMYL / medical safety | 15 |
| Freshness | 10 |
| Authorship / trust integrity | 10 |
| Cannibalization distinctness | 10 |
| Usefulness | 5 |
| Internal linking | 5 |
| Ad Grant fit | 5 |

`validateArticleAuditRecord` independently re-sums the ten category scores and
fails any record whose `scores.total` does not match, and separately fails any
record whose `disposition` is `KEEP` while `blocking_findings` is non-empty or any
of its claims is a high/critical-severity `unsupported`/`contradicted` finding —
**this check never consults the numeric score at all**, so a high total can never
be used to argue past an unresolved medical-evidence problem. This is the mechanical
enforcement of the rule "a high score cannot compensate for a serious medical-
evidence problem."

## 4. Claim-mapping taxonomy

Every material claim extracted from an article's frozen prose was assigned exactly
one `mapping_status`:

- `mapped_existing_claim` — matches an already-registered claim (requires `registry_claim_id`)
- `new_verified_claim` — a genuinely new claim, independently source-checked this stage
- `unsupported` — no real source found; a blocking finding if severity is high/critical
- `outdated` — was once accurate but current evidence has moved
- `overbroad` — the underlying evidence is real but narrower than the article's wording
- `mis_scoped` — applies the right evidence to the wrong population/condition
- `contradicted` — current evidence actively disagrees with the claim
- `needs_semantic_review` — the claim looks reasonable, but confirming its exact wording against a specific source is a prose-level semantic judgment this stage's mechanical validators cannot make

Across the 34 articles, 36 material claims were extracted: 8 `mapped_existing_claim`,
3 `unsupported`, 1 `outdated`, and 24 `needs_semantic_review`. **The
`needs_semantic_review` majority is an intended output of this stage, not a gap** —
see §9 (Limitations) for exactly why, and each such claim's `recommended_action`
names the specific check a human/Opus reviewer should perform next.

## 5. P0/P1/P2 rewrite-priority ordering

- **P0** (medications/GLP-1/compounded drugs/telehealth/prescribing/contraindications/
  safety): `compounded-vs-fda-approved-glp1-medications`,
  `science-of-glp1-how-medications-affect-your-body` — 2 articles.
- **P1** (metabolic health/fasting/physiology/protein/hydration/set-point):
  `physical-activity-for-health-beyond-weight-loss`,
  `science-of-sustainable-weight-management`,
  `set-point-theory-why-body-resists-weight-loss`,
  `sleep-and-weight-understanding-the-connection`,
  `understanding-metabolic-health` — 5 articles.
- **P2** (lower-risk behavioral/general wellness needing REFRESH for other reasons,
  chiefly cannibalization): 14 articles.
- **none** (KEEP, no rewrite needed): 13 articles.

`questions-to-ask-doctor-about-glp1-medications` was deliberately **not** placed in
P0 despite its subject matter: it makes no drug-mechanism or efficacy claim of its
own (it is a "questions to bring to your doctor" checklist), so its audit found no
claim requiring evidence-registry work and its disposition is KEEP.

The single `blocking_finding` in the entire corpus is on
`set-point-theory-why-body-resists-weight-loss`: its "defended weight range of 10–15
pounds" figure has no supporting source and must be sourced or generalized before
this article could be reconsidered for KEEP — this is why its disposition is REFRESH
(P1) rather than KEEP even though nothing else about the article is disqualifying.

## 6. Corpus-wide disposition summary

| Disposition | Count |
|---|---|
| KEEP | 13 |
| REFRESH | 16 |
| MERGE | 5 |
| REDIRECT | 0 |
| NOINDEX | 0 |
| RETIRE | 0 |

Average total score: 65.0 (min 51, max 83). YMYL class distribution: 17 low, 14
medium, 2 high, 1 critical. Ad Grant fit (qualitative only — no invented search
volume/CPC/competition figures; every `ad_grant_fit` classification is a judgment
call, and no article carries a `query_evidence`-style measured number that isn't
genuinely sourced): 5 high, 18 medium, 11 low, 0 not_suitable.

No article received REDIRECT, NOINDEX, or RETIRE. This reflects what the audit
actually found, not a scoring artifact or a reluctance to flag problems: the corpus's
real defects are duplication (resolved via MERGE) and evidence/currentness gaps
(resolved via REFRESH's `required_research`), not content that is actively harmful
or valueless. A future re-audit that finds different evidence remains free to use
any of the six dispositions.

Full machine-readable detail for every one of the 34 articles — per-claim audits,
authorship findings, safety-language findings, internal-link recommendations, and
`required_research` — lives in `content/audits/stage4/articles/<slug>.json`; the
independently recomputed aggregate is `content/audits/stage4/corpus-summary.json`.

## 7. Cannibalization analysis

Every cluster below reflects an actual comparison of the member articles' canonical
reader question, reader intent/stage, claim set, outline, likely query cluster, and
reader outcome — never title similarity alone (`content/audits/stage4/
cannibalization.json`, each cluster carries an explicit `overlap_dimensions` and
`meaningful_differences` list).

**5 genuine near-duplicate pairs (MERGE):**

| Non-survivor | Survivor |
|---|---|
| `added-sugars-hidden-sources-and-health-effects` | `understanding-food-labels-added-sugars` |
| `how-sleep-affects-weight-health-daily-functioning` | `sleep-and-weight-understanding-the-connection` |
| `hydration-weight-health-daily-functioning` | `hydration-and-health-how-much-water-do-you-need` |
| `reading-nutrition-labels-what-to-look-for` | `reading-nutrition-labels-weight-health` |
| `understanding-physical-activity-weight-health` | `physical-activity-for-health-beyond-weight-loss` |

Each MERGE record names specific content-worth-preserving from the non-survivor (a
label-reading structure, a safety caution, a weight-inclusive framing point, etc.)
and a redirect plan (the non-survivor's slug should 301 to the survivor once merged)
— see each non-survivor's own `articles/<slug>.json` for the exact list.

**2 pairs that looked similar but are genuinely distinct reader jobs
(differentiate_and_keep_both):**

- `understanding-bmi-what-it-really-means` (a focused single-metric explainer) vs.
  `understanding-healthy-weight` (a broader concept piece that only uses BMI as one
  example) — different search intents, both independently REFRESH-worthy.
- `building-healthy-habits-takes-time-patience` (habit-formation psychology/pacing)
  vs. `understanding-weight-health-everyday-habits` (a broader multi-domain habit
  survey) — no shared claim set or outline. `building-healthy-habits-family-wellness`
  was explicitly considered for this cluster and excluded: its household/family-
  environment framing is a third, genuinely distinct reader job, not a duplicate
  angle on either sibling.

## 8. Authorship and safety-language findings

Every article's `authorship` block records the currently visible author, whether it
is an organization or an individual, and whether a normalization issue exists (e.g.
an organization-name variant) — **no new review-registry entry, and no invented
human author, was created anywhere in this stage**, per the hard prohibition in
`CLAUDE_CONTENT_FACTORY_V5.md`. Any recommended author-name normalization is a note
only; the frozen snapshot was not touched to apply it.

`safety_language_findings` records medical-disclaimer/safety-language deficiencies
found per article (e.g. a missing emergency-care callout, a disclaimer that could be
more specific to the article's own risk level) without mechanically inserting
boilerplate text — each finding names what is missing so a future rewrite can address
it deliberately rather than by template.

## 9. Limitations — what this stage's validators can and cannot check

`validateArticleAuditRecord` mechanically verifies: the audit's `snapshot_hash`
matches the live manifest (catching a stale audit before it can be trusted), every
`registry_claim_id`/`source_id` reference resolves to a real registry entry, every
`cannibalization_cluster_ids` reference resolves to a real cluster, MERGE/REDIRECT
dispositions name a real target, RETIRE carries a substantive reason, scores sum
correctly and stay within their weight caps, and — the one rule that can never be
overridden by score — KEEP never coexists with an unresolved high/critical evidence
problem.

**What it cannot check**: whether an article's prose actually says what its
`ArticleClaimAudit.proposition` claims it says, whether a `needs_semantic_review`
claim's underlying source genuinely supports the specific wording used, or whether a
qualitative Ad Grant fit judgment is the right one. These are semantic, prose-level
judgments that require a human or Opus-level reviewer reading the actual article
text against the actual cited source — this audit's validators can catch structural
and referential integrity failures, not meaning. Every `needs_semantic_review` claim
and every `required_research` entry in the per-article records is this stage's
explicit, honest flag for exactly that follow-up work; treating a clean validator run
as proof of semantic accuracy would be a false confidence this document explicitly
disclaims.

## 10. Topic and evidence-packet growth

Two new topics were added this stage, each reflecting a genuinely distinct reader
job surfaced by the audit (not "one topic per article"):

- `topic-does-metabolism-slow-with-normal-aging` — "does resting metabolism decline
  meaningfully between roughly age 20 and 60, independent of weight-loss history" —
  distinct from the existing `topic-why-body-resists-weight-loss` (which is about
  post-weight-loss adaptation, not normal aging).
- `topic-how-much-added-sugar-is-too-much` — distinct from all 7 pre-existing topics,
  and tied directly to the `cluster-added-sugars-duplicate` MERGE finding.

**No new evidence packet was created for either topic.** Each currently has exactly
one verified claim behind it (`claim-metabolic-rate-stable-20-to-60` and
`claim-aha-added-sugar-limit` respectively, added this stage after independent
WebFetch verification of the Pontzer et al. 2021 *Science* life-course energy-
expenditure study and the AHA's 2009 *Circulation* scientific statement on dietary
sugars) — nowhere near a complete claim set for a full metabolism-myths or added-
sugars rewrite. Per the explicit instruction to gate packet creation on claim-set
completeness rather than invent facts to fill the gap, this is a deliberate
`packet_status`-incomplete outcome, documented in each topic's own `notes` field
and in the relevant articles' `required_research`, not an oversight.

The claims registry's `notes` field, which previously hard-coded a now-stale "11
claims" count (already once wrong after the Fothergill split), was rewritten this
stage to point at the authoritative live count instead of hard-coding a number that
will drift again.

Adding these 2 sources and 2 claims changed the live source/claim registries'
revision hashes, which made all 7 pre-existing Stage 3 evidence packets stale by the
existing `isPacketStale` check (their frozen hashes no longer matched the live
registries) even though none of their own claims changed. All 7 packets'
`source_registry_revision`/`claim_registry_revision` were regenerated against the
live registries; `npm run validate:evidence-all` (dependency audit step) confirms
zero stale packets before this SHA was frozen.

## 11. The 5 unpublished historical rows

All 5 rows were inspected read-only via the Supabase service-role key already
present in `.env.local` — **zero writes occurred**, and no `is_published` value was
changed. Every temporary inspection script used was deleted before this document was
written; `git status` was confirmed clean of any such script at every checkpoint.

Per this stage's own privacy constraint, `content/audits/stage4/unpublished-
summary.json` records only: slug, category, a sha256 of the draft body, `is_published:
false`, an inspection date, a disposition, and a reason. **Titles are deliberately
omitted** even though the task's own threshold would permit a historically/publicly-
known title — none of these 5 titles were ever public prior to this audit, so
omitting them is a stricter reading of the privacy rule than the minimum required.
Full draft bodies were read in-session, in memory, for disposition purposes only, and
were never written to any file in this repository.

All 5 rows are Telehealth Education drafts (`privacy-security-telehealth-what-you-
should-know`, `telehealth-vs-in-person-care-right-choice`, `understanding-telehealth-
weight-management-guide`, `understanding-online-prescriptions-safety-best-practices`,
`how-to-evaluate-telehealth-weight-management-provider`) and all received disposition
`REPUBLISH_AFTER_REFRESH` — each is reasonably well-written, appropriately
disclaimed, and free of fabricated statistics, but every one cites either bare
organization homepages (rather than specific guidance documents) or has no Sources
section at all, and none has any source/claim-registry backing yet. Two
(`understanding-online-prescriptions-safety-best-practices`,
`how-to-evaluate-telehealth-weight-management-provider`) are flagged P0-equivalent
given their prescribing/telehealth-safety subject matter and specifically need a
currentness re-check of the named verification programs (NABP VIPPS, FDA BeSafeRx)
before republishing. See each row's `reason` field for the specific gap.

## 12. Verification suite

The following were run against the frozen SHA before this document was finalized:

- `npm test` — 305/305 tests pass (25 files), including the 57 new tests across
  `__tests__/article-audit-registry.test.ts`,
  `__tests__/cannibalization-registry.test.ts`, and
  `__tests__/unpublished-audit-registry.test.ts`, covering every required negative/
  adversarial case: missing audit, unknown slug, duplicate audit id/slug, stale
  snapshot hash, invalid disposition, MERGE/REDIRECT missing target, RETIRE without a
  substantive reason, KEEP-with-blocker (both via `blocking_findings` and via a
  high-severity unresolved claim), unknown `claim_id`/`source_id` reference, unknown
  cannibalization `cluster_id` reference, duplicate cluster id, cluster with fewer
  than two articles, invalid unpublished disposition, MERGE/REDIRECT unpublished row
  missing overlap target, and the privacy-contract check that no title/body/content
  field exists anywhere on the unpublished-row type or any real row.
- `npm run lint` — 0 errors.
- `npm run validate:articles` — unchanged, still passes (frozen snapshot untouched).
- `npm run validate:evidence-all` — all six steps pass in order (sources, claims,
  topics, evidence packets, dependency audit, stage4 corpus audit), zero stale
  packets, zero dangling references.
- `npm run validate:stage4-audit` — 34 article audits + 7 cannibalization clusters +
  5 unpublished rows checked, 0 failures; `corpus-summary.json` independently
  recomputed and confirmed to match the source-of-truth registries exactly.
- `npm run build` — succeeds (prebuild gate, which now includes
  `validate:stage4-audit`, passes).

The fail-fast behavior of `validate-stage4-audit.ts` was deliberately verified by
temporarily corrupting `corpus-summary.json`'s `published_article_count` field,
confirming the command exits non-zero with a specific drift message, then restoring
the file and reconfirming a clean pass.

## 13. What did not change

`content/snapshot/**` (all 34 published article bodies, and the manifest's
`is_published` values) is byte-for-byte unchanged from the Stage 3 closure SHA. No
Supabase write occurred. No `content/reviews/**` file was touched. No article's
visible author/reviewer disclosure changed. The only content changes in this stage
are: 2 new sources, 2 new claims, and a documentation-only note rewrite in the claims
registry (all carried over from work already validated at the top of this session);
2 new topics; 7 evidence packets' revision-hash fields (mechanical regeneration only,
no wording changed); and the entirely new `content/audits/stage4/**` registry tree,
`lib/article-audit-registry.ts`, `lib/cannibalization-registry.ts`,
`lib/unpublished-audit-registry.ts`, `lib/content-registry.ts`'s new
`getManifestArticles()` export, `scripts/validate-stage4-audit.ts`, three new test
files, and this document.

## 14. Handoff

Stage 4 (Issue #17) is complete: all 34 published articles carry a structured,
evidence-backed audit and disposition; the corpus's real duplication has been
mapped via genuine content comparison, not title matching; the 5 unpublished rows
have a privacy-conscious, evidence-grounded disposition with zero Supabase writes;
and every mechanical integrity rule the task required is enforced by a validator
gate wired into every build.

**Stop. Do not begin article rewrite batches or Issue #18 until this SHA is
independently reviewed.**
