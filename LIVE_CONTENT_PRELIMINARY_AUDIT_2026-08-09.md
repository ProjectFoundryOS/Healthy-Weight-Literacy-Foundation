# WeightLiteracy live content preliminary audit — 2026-08-09

Status: preliminary public-site audit. This is not a substitute for the Stage #14 Supabase snapshot.

## Current inventory signal

- Historical April audit: 39 published articles.
- Public `/blog` index observed 2026-08-09: 34 article cards.
- Treat 34 as the current public-index baseline, but do not declare the authoritative database count until Stage #14 reconciles Supabase.

## Immediate conclusions

1. Do not rewrite historical SQL seeds as if they are the production source of truth.
2. Preserve existing public slugs by default.
3. Audit duplicate reader intent before refreshing prose; several topic clusters appear to contain near-duplicate pages.
4. High-risk medication/metabolic pages need claim-level source mapping before publication-state changes.
5. Visible `Last reviewed` labels must be reconciled with the actual review event. An editorial update is not automatically a licensed medical review.

## Highest-priority cannibalization clusters

### Hydration

- `Hydration and Health: How Much Water Do You Really Need?` (2026)
- `How Hydration Supports Weight Health and Everyday Functioning` (2025)

Likely action: compare question/intent/claim set. The newer page appears to answer hydration requirements and myths; the older page is broad weight-health hydration education. If the older page lacks a distinct reader job, merge/redirect rather than maintain two broad hydration explainers.

### Nutrition-label literacy

- `Reading Nutrition Labels: What to Actually Look For` (2026)
- `Understanding Food Labels: Added Sugars and Hidden Ingredients` (2026)
- `How to Read Nutrition Labels for Better Weight Health Understanding` (2025)

Likely action: retain one canonical broad Nutrition Facts/label-reading guide. Keep a second page only if it is narrowly centered on added-sugar/ingredient identification with materially different examples and reader outcome. Merge/redirect generic overlap.

### Sleep and weight

- `Sleep and Weight: Understanding the Connection` (2026)
- `How Sleep Affects Weight Health and Daily Functioning` (2025)

Likely action: strong merge/redirect candidate unless the older page can be given a genuinely different job without manufacturing a doorway page.

### Physical activity

- `Physical Activity for Health: Beyond Weight Loss` (2026)
- `Understanding Physical Activity and Its Role in Weight Health` (2025)

Likely action: strong merge/redirect candidate. Prefer the framing that best matches the Foundation mission and current evidence.

### Added sugars

- `Added Sugars: Hidden Sources and Their Effects on Health` (2026)
- `Understanding Food Labels: Added Sugars and Hidden Ingredients` (2026)

Potentially defensible as two pages only if one is health-effects education and the other is a practical label-identification workflow. Otherwise merge.

### Habit literacy

- `Understanding Weight Health and Everyday Habits` (2025)
- `How Building Healthy Habits Takes Time and Patience` (2025)
- `Building Healthy Habits: A Family Wellness Guide` (2024)

Potentially defensible because the family page has a distinct audience. The two general habit pages need intent comparison.

## Sample YMYL/source findings

### Set Point Theory: Why Your Body Resists Weight Loss

Priority: HIGH refresh.

Observed issues:
- Presents `set point theory` in relatively settled language even though body-weight regulation is more nuanced than a single fixed defended set point model.
- States a typical defended range of about `10–15 pounds` without inline source attribution.
- States that gradual approaches `tend to work better` in a way that needs a precise evidence basis and definition of outcome.
- Uses a `Last reviewed` label that must be tied to a truthful review event.

V5 requirement: map each mechanistic/quantitative claim to an atomic claim record and primary/authoritative evidence before rewriting.

### Hydration and Health: How Much Water Do You Really Need?

Priority: HIGH refresh.

Observed issues:
- Legacy raw HTML remains in the rendered content path.
- Contains several quantitative claims (body-water percentage, dehydration thresholds, intake amounts, food-water percentage) in prose.
- The publicly rendered version observed during this audit did not show a dedicated source list before the share block.
- This article should be converted to normalized Markdown/article content and every quantitative claim mapped to source IDs.

### Questions to Ask Your Doctor About GLP-1 Medications

Priority: HIGH refresh.

Observed issues:
- Useful and distinct reader job; likely KEEP + REFRESH rather than merge.
- Includes medication-safety statements and emergency symptom framing without a visible source section in the observed rendered page.
- Long-term-use, discontinuation, interaction and anesthesia questions are time-sensitive clinical subjects.

V5 requirement: preserve the practical checklist intent while grounding every medication-specific safety/long-term statement in current authoritative sources.

### Understanding Macronutrients: A Practical Guide to Proteins, Carbs, and Fats

Priority: MEDIUM/HIGH refresh.

Observed strengths:
- Clear practical organization.
- Contains a source list with federal/academic/professional-health organizations.

Observed issues:
- Sources are mostly end-of-article references rather than claim-level attribution.
- Protein intake numbers and population-specific higher-needs statements need direct source mapping.
- Broad statements about satiety, blood sugar and dietary fat should be tied to claims/evidence rather than generic source lists.

### Understanding BMI: What It Really Means for Your Health

Priority: MEDIUM/HIGH refresh.

Observed strengths:
- Distinct reader job and useful explanation of limitations.

Observed issues:
- No visible source section in the observed rendered page.
- Historical and population-specific claims need direct evidence.
- Avoid implying that every higher-BMI association applies uniformly to individuals.

### The Science of Sustainable Weight Management

Priority: HIGH refresh.

Observed issues:
- Contains broad claims about diet failure/regain, metabolic adaptation, restrictive dieting and set point theory without visible source attribution in the observed rendered page.
- Some claims are worded more strongly than the evidence warrants without population/context qualifiers.
- Should likely be a pillar page, but only after a full evidence packet and cannibalization comparison with the dedicated set-point/metabolism pages.

## Authorship/reviewer integrity

Current article UI frequently displays generic labels such as `Health Writer` and a generic bio. This is acceptable only if it is represented as organizational editorial authorship rather than a credentialed individual author.

Do not populate medical-review dates or reviewer credentials automatically.

Required event types:
- content update
- editorial review
- evidence review
- licensed medical review

Only the last type may support public language such as `medically reviewed by`, and only when a verified human reviewer reviewed the exact revision.

## Recommended audit order

1. GLP-1 medication pages
2. set-point / metabolism / sustainable-weight pages
3. duplicated nutrition-label pages
4. duplicated hydration pages
5. duplicated sleep/activity pages
6. remaining metabolic pages
7. nutrition literacy
8. lower-risk evergreen education

## Publication dispositions

For each reconciled live article choose exactly one:

- KEEP
- REFRESH
- MERGE
- REDIRECT
- NOINDEX
- RETIRE

Do not create a new URL merely to target another keyword if an existing page can answer that intent well.

## Ad Grant integration

Use Google Ads search-term/conversion data to prioritize which useful article gets refreshed next. Do not use Ad Grant demand as justification for thin duplicate pages.

Best early landing-page clusters after evidence refresh:
- GLP-1 medication literacy
- questions to ask a provider
- compounded vs FDA-approved medication literacy
- weight vs fat / scale literacy
- nutrition-label literacy
- hydration literacy
- metabolic health basics
- weight stigma / public education

## Next gate

Stage #14 must capture the current production Supabase rows, reconcile the public 34-card inventory with the historical 39 count, and freeze the authoritative article baseline before any batch rewrite is approved.
