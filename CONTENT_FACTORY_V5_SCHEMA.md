# WeightLiteracy Content Factory V5 — Registry Contract

This document defines the source-of-truth records for the V5 article system.

The governing principle is:

> Evidence is structured before prose is generated. Review state is recorded after a real review occurs. Publication is an explicit separate action.

## 1. Topic record

```ts
interface TopicRecord {
  topic_id: string
  canonical_question: string
  working_title: string
  primary_reader_intent: string
  audience: string[]
  topic_cluster: string
  reader_journey_stage: "awareness" | "understanding" | "evaluation" | "decision" | "ongoing"
  ymyl_class: "educational" | "health" | "clinical" | "medication" | "high_risk"
  decay_class: "evergreen" | "slow_decay" | "fast_decay" | "news_adjacent"
  target_query_cluster: string[]
  related_topic_ids: string[]
  canonical_topic_id?: string
  disposition: "active" | "merge" | "redirect" | "retire"
  demand_evidence?: DemandEvidence[]
}

interface DemandEvidence {
  source: "search_console" | "google_ads" | "keyword_research" | "editorial"
  measured_at: string
  metric: string
  value: number | string
  notes?: string
}
```

Hard rule: search demand is never a hard-coded timeless fact. Measured demand must carry source and date.

## 2. Source record

```ts
interface SourceRecord {
  source_id: string
  title: string
  url?: string
  doi?: string
  publisher_or_journal: string
  published_at?: string
  source_type:
    | "regulator"
    | "prescribing_information"
    | "guideline"
    | "systematic_review"
    | "meta_analysis"
    | "randomized_trial"
    | "observational_study"
    | "peer_reviewed_review"
    | "public_health_authority"
    | "other"
  evidence_tier: 1 | 2 | 3 | 4
  primary_source: boolean
  verified_at: string
  verification_method: string
  retracted_or_superseded: boolean
  superseded_by_source_id?: string
  notes?: string
}
```

Hard gates:

- a URL/DOI must resolve or have a documented archival exception;
- retracted/superseded sources cannot support current claims without explicit context;
- manufacturer marketing copy and press releases cannot serve as sole evidence for a clinical efficacy/safety claim.

## 3. Claim record

```ts
type ClaimClassification =
  | "established"
  | "qualified"
  | "preliminary"
  | "disputed"
  | "individualized_medical"

interface ClaimRecord {
  claim_id: string
  proposition: string
  classification: ClaimClassification
  source_ids: string[]
  supported_population?: string
  context?: string
  limitations: string[]
  allowed_wording: string[]
  prohibited_wording: string[]
  last_verified_at: string
  next_review_date: string
  decay_class: "evergreen" | "slow_decay" | "fast_decay" | "news_adjacent"
  article_ids: string[]
}
```

Wording behavior:

- `established`: direct factual wording is allowed within supported context.
- `qualified`: a qualifier/limitation is required in the same local context.
- `preliminary`: uncertainty and evidence maturity must be explicit.
- `disputed`: material disagreement must be represented fairly.
- `individualized_medical`: may educate about the question but may not direct a reader to a personal diagnosis, dose, treatment start/stop, or individualized decision.

## 4. Review record

```ts
type ReviewType =
  | "ai_claim_audit"
  | "editorial_review"
  | "clinical_evidence_review"
  | "licensed_medical_review"
  | "compliance_review"
  | "owner_approval"

interface ReviewRecord {
  review_id: string
  article_id: string
  article_revision_hash: string
  review_type: ReviewType
  reviewer_name?: string
  reviewer_role: string
  reviewer_credentials?: string[]
  reviewer_identity_verified: boolean
  performed_at: string
  decision: "pass" | "pass_with_changes" | "fail"
  findings: ReviewFinding[]
  next_review_date?: string
  evidence?: string[]
}
```

Critical hard rule:

`licensed_medical_review` is invalid unless all are true:

- `reviewer_name` identifies a real human;
- `reviewer_identity_verified === true`;
- appropriate credentials are recorded;
- the review is tied to the exact article revision hash;
- the review actually occurred.

Claude, Sonnet, Opus, or any other model may NEVER generate a licensed medical-review event merely because content passed an AI audit.

## 5. Article record

```ts
type ArticleStatus =
  | "published_legacy"
  | "snapshot_verified"
  | "evidence_audit"
  | "revision_candidate"
  | "claim_audited"
  | "editorial_review"
  | "candidate"
  | "approved"
  | "staged"
  | "published"
  | "merge"
  | "redirect"
  | "noindex"
  | "retired"

interface ArticleRecord {
  article_id: string
  slug: string
  topic_id: string
  title: string
  description: string
  primary_question: string
  primary_reader_intent: string
  status: ArticleStatus
  ymyl_class: TopicRecord["ymyl_class"]
  decay_class: TopicRecord["decay_class"]
  claim_ids: string[]
  source_ids: string[]
  review_ids: string[]
  internal_link_article_ids: string[]
  canonical_article_id?: string
  published_at?: string
  last_content_update?: string
  last_evidence_review?: string
  last_licensed_medical_review?: string
  next_review_date?: string
  ai_assistance_disclosed: boolean
  body_markdown: string
  revision_hash: string
}
```

Do not infer review dates:

- `last_content_update` = editorial/content change date.
- `last_evidence_review` = evidence/claim review date.
- `last_licensed_medical_review` = only when an actual licensed reviewer approved that exact revision.

These dates are distinct.

## 6. Intent/cannibalization record

```ts
interface IntentComparison {
  article_a: string
  article_b: string
  primary_question_similarity: number
  reader_intent_similarity: number
  claim_set_similarity: number
  outline_similarity: number
  query_cluster_similarity: number
  reader_outcome_similarity: number
  decision: "distinct" | "review" | "merge" | "canonicalize" | "redirect"
  rationale: string
}
```

A different title is never sufficient evidence of a different article job.

## 7. Publication gate

A V5 article may move from `candidate` to `approved` only when all applicable conditions pass:

```text
[ ] stable topic + primary question
[ ] distinct reader intent or approved merge/canonical disposition
[ ] claim IDs cover all clinical/statistical/mechanistic assertions
[ ] source IDs support every claim classification
[ ] all source records verified and current enough
[ ] no unsupported numerical outcome claims
[ ] no individualized diagnosis/dosing/treatment directive
[ ] benefit/limitation balance where relevant
[ ] reviewer identity fields truthful
[ ] no inferred/fabricated medical-review status
[ ] AI assistance disclosure remains accurate
[ ] content update/evidence review/medical review dates remain distinct
[ ] internal links resolve
[ ] next review date assigned from evidence decay
[ ] independent audit has no blocking issue
[ ] explicit owner/editorial approval recorded
```

Publication to Supabase is a separate operation after approval. The writer/research model never publishes directly.

## 8. Existing 39-article migration rule

Every article imported from current production begins as:

```text
status: published_legacy
```

This means only that it is currently public. It does NOT imply that its author identity, reviewer status, citations, claims, or review dates have been verified under V5.

Each legacy article receives a scorecard and one disposition:

```text
KEEP
REFRESH
MERGE
REDIRECT
NOINDEX
RETIRE
```

No legacy URL should be changed solely for style. Existing search equity and inbound links should be preserved unless there is a substantive reason to merge/redirect.
