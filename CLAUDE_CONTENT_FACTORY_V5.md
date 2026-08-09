# Claude Content Factory V5 — Operating Rules

This file governs AI-assisted WeightLiteracy article research, revision, and drafting.

## Mission

Create useful, evidence-backed health literacy content for people. Search demand may prioritize work, but search ranking is never sufficient reason to create an article.

## Role separation

- Sonnet/writer: research extraction, structured briefs, revisions, drafting.
- Opus/auditor: independent claim, YMYL, intent/cannibalization, and trust audit.
- Human editor/owner: final publication decision.
- Licensed medical reviewer: only a real human with verified identity/credentials when such review is actually obtained.

The writer must never grade itself into publication.

## Evidence before prose

For YMYL/health claims, do not begin with a blank-page article prompt.

Use this order:

```text
verified sources
  -> atomic claims
  -> claim classifications
  -> limitations + wording boundaries
  -> article intent/brief
  -> outline
  -> draft
  -> independent audit
```

If a claim cannot be mapped to verified evidence, generalize it, explicitly mark it unresolved, or remove it.

## Source priorities

Prefer, as applicable:

1. FDA/regulatory documents and prescribing information.
2. Current professional/clinical guidelines from authoritative bodies.
3. Systematic reviews and meta-analyses.
4. Peer-reviewed randomized trials.
5. High-quality observational research for questions not answerable by trials.
6. Major public-health authority educational material.

Do not use a commercial product page, manufacturer press release, influencer content, SEO article, or AI-generated summary as the sole authority for a clinical claim.

## Claim language

### Established

Use direct factual language within the supported population/context.

### Qualified

State the limitation or qualifier locally. Do not hide it in a disclaimer at the bottom.

### Preliminary

State that evidence is early/limited and do not imply settled consensus.

### Disputed

Represent material competing interpretations fairly and identify the evidence behind them.

### Individualized medical

Explain the issue and what a reader may discuss with a qualified professional. Do not tell an individual to diagnose themselves, start/stop a prescription medication, change a dose, or substitute the article for care.

## No fake authority

Never invent or infer:

- author credentials;
- reviewer names;
- reviewer credentials;
- medical advisory panels;
- `medically reviewed` labels;
- clinical-review dates;
- board/advisor identities;
- partnerships;
- clinical experience.

A real review event is external evidence, not generated copy.

## Review dates

Never treat `updated_at` as proof of medical review.

Keep distinct:

- content/editorial update;
- evidence/claim review;
- licensed medical review.

## AI disclosure

Keep public disclosures consistent with actual process. Do not imply a human performed work that was performed only by AI. Do not remove the site's AI-assistance disclosure during stylistic rewrites.

## YMYL safety

For medication, treatment, clinical outcome, diagnosis, contraindication, adverse-effect, or metabolic-disease content:

- identify material safety limitations;
- distinguish general education from individualized advice;
- do not imply guaranteed outcomes;
- do not omit material contraindications/precautions when the article's scope reasonably requires them;
- do not use a generic disclaimer as a substitute for fixing unsafe prose.

Hedging is claim-driven, not paragraph-count-driven.

## Cannibalization / article creation gate

Before creating a new URL compare it with the existing article registry across:

- exact question;
- reader intent;
- claim set;
- outline;
- target query cluster;
- expected reader outcome.

If the same user job is already served, improve or merge the existing article rather than creating a synonym URL.

## Existing article revisions

Preserve a legacy URL unless a deliberate merge/redirect decision is approved.

For each article produce:

```text
Article ID / slug
Primary question
Reader intent
YMYL class
Decay class
Source score
Claim traceability score
Safety score
Trust/reviewer-integrity score
Freshness score
Cannibalization score
Internal-link score
Ad Grant landing-page fit
Decision: KEEP / REFRESH / MERGE / REDIRECT / NOINDEX / RETIRE
```

## Writing quality

Write clear, human, specific educational prose. Avoid boilerplate compliance language, repetitive provider deferrals, and formulaic AI transitions.

Do not force a fixed word count. Length should match the reader's question and evidence complexity.

FAQ sections are optional and should exist only when they answer genuinely separate, useful questions.

## Internal linking

Internal links must have a reader reason, not an SEO quota. Prefer:

- prerequisite concepts;
- next-step reader journey;
- safety/supporting context;
- comparison/clarification.

Never link to a nonexistent placeholder article from published content.

## Ad Grant content alignment

Ad Grant landing pages must be mission-aligned, substantial, and directly relevant to the query/ad group. Do not create thin pages just to host grant traffic.

Do not optimize articles around prohibited/generic keywords. Map campaigns to specific educational intent clusters and meaningful conversion actions.

## Status authority

AI may recommend status transitions but cannot perform these without the relevant external gate:

- `licensed_medical_review` requires a verified human reviewer.
- `approved` requires human editorial/owner approval.
- `published` requires an explicit publication action.

## Audit independence

The writer may run self-checks, but final claim/YMYL/cannibalization audit must be performed independently from the writing pass and against a frozen article revision/hash.

Do not modify the audit rubric to make a draft pass.
