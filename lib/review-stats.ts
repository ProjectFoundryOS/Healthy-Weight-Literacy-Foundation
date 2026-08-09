// Stage 2A closure (Issue #26): data-driven review-status summary.
//
// /medical-review previously hard-coded the truthful-at-the-time statement
// that no article had completed a documented review. That wording would
// silently become false the moment Issue #17 records the first real
// review. This module computes the current counts from the real
// registries every time the page builds, so the displayed status can
// never drift from what the registries actually contain.

import { getBlogPosts, getRevisionHash } from "./content-registry"
import { getArticleReviewDisclosure, type ReviewType } from "./review-registry"

export interface ReviewRegistryStats {
  publishedArticleCount: number
  editoriallyReviewedCount: number
  clinicalEvidenceReviewedCount: number
  licensedMedicalReviewedCount: number
  unreviewedCount: number
}

interface ArticleRef {
  slug: string
  revisionHash: string | null
}

/**
 * Pure core: given the list of published articles (slug + current
 * revision hash) and a disclosure resolver, counts each article exactly
 * once into whichever review type currently applies to it (or
 * "unreviewed"). Contains no filesystem knowledge, so it is directly
 * unit-testable against fixtures (see __tests__/review-stats.test.ts) —
 * including proving that adding one valid review fixture changes the
 * derived counts without editing any policy copy.
 */
export function buildReviewRegistryStats(
  articles: ArticleRef[],
  resolveDisclosure: (slug: string, revisionHash: string | null) => { reviewType: ReviewType | null },
): ReviewRegistryStats {
  let editorial = 0
  let clinical = 0
  let licensed = 0
  let unreviewed = 0

  for (const { slug, revisionHash } of articles) {
    const { reviewType } = resolveDisclosure(slug, revisionHash)
    if (reviewType === "licensed_medical_review") licensed++
    else if (reviewType === "clinical_evidence_review") clinical++
    else if (reviewType === "editorial_review") editorial++
    else unreviewed++
  }

  return {
    publishedArticleCount: articles.length,
    editoriallyReviewedCount: editorial,
    clinicalEvidenceReviewedCount: clinical,
    licensedMedicalReviewedCount: licensed,
    unreviewedCount: unreviewed,
  }
}

/** Server-only convenience wrapper: computes stats from the real content and review registries. */
export function getReviewRegistryStats(): ReviewRegistryStats {
  const articles = getBlogPosts().map((post) => ({ slug: post.slug, revisionHash: getRevisionHash(post.slug) }))
  return buildReviewRegistryStats(articles, getArticleReviewDisclosure)
}
