import { describe, it, expect } from "vitest"
import { buildReviewRegistryStats, getReviewRegistryStats } from "@/lib/review-stats"
import type { ReviewType } from "@/lib/review-registry"

function stubResolver(bySlug: Record<string, ReviewType | null>) {
  return (slug: string) => ({ reviewType: bySlug[slug] ?? null })
}

describe("buildReviewRegistryStats (Issue #26 data-driven policy status)", () => {
  it("truthfully reports zero reviews of every type when nothing has been reviewed — the empty-registry case", () => {
    const articles = [
      { slug: "a", revisionHash: "h1" },
      { slug: "b", revisionHash: "h2" },
      { slug: "c", revisionHash: "h3" },
    ]
    const stats = buildReviewRegistryStats(articles, stubResolver({}))

    expect(stats).toEqual({
      publishedArticleCount: 3,
      editoriallyReviewedCount: 0,
      clinicalEvidenceReviewedCount: 0,
      licensedMedicalReviewedCount: 0,
      unreviewedCount: 3,
    })
  })

  it("changes automatically when one valid clinical-evidence review fixture is introduced — no policy prose is hand-edited", () => {
    const articles = [
      { slug: "a", revisionHash: "h1" },
      { slug: "b", revisionHash: "h2" },
      { slug: "c", revisionHash: "h3" },
    ]

    const before = buildReviewRegistryStats(articles, stubResolver({}))
    const after = buildReviewRegistryStats(articles, stubResolver({ b: "clinical_evidence_review" }))

    expect(before.clinicalEvidenceReviewedCount).toBe(0)
    expect(before.unreviewedCount).toBe(3)

    expect(after.clinicalEvidenceReviewedCount).toBe(1)
    expect(after.unreviewedCount).toBe(2)
    expect(after.publishedArticleCount).toBe(3) // total is unaffected
  })

  it("counts each review type independently and correctly across a mixed corpus", () => {
    const articles = [
      { slug: "a", revisionHash: "h1" },
      { slug: "b", revisionHash: "h2" },
      { slug: "c", revisionHash: "h3" },
      { slug: "d", revisionHash: "h4" },
    ]
    const stats = buildReviewRegistryStats(
      articles,
      stubResolver({
        a: "licensed_medical_review",
        b: "clinical_evidence_review",
        c: "editorial_review",
        // d: unreviewed
      }),
    )

    expect(stats.licensedMedicalReviewedCount).toBe(1)
    expect(stats.clinicalEvidenceReviewedCount).toBe(1)
    expect(stats.editoriallyReviewedCount).toBe(1)
    expect(stats.unreviewedCount).toBe(1)
    expect(stats.publishedArticleCount).toBe(4)
  })
})

describe("getReviewRegistryStats — real registry integration", () => {
  it("reflects the real, currently-empty review registry: all 34 published articles unreviewed", () => {
    const stats = getReviewRegistryStats()
    expect(stats.publishedArticleCount).toBe(34)
    expect(stats.licensedMedicalReviewedCount).toBe(0)
    expect(stats.clinicalEvidenceReviewedCount).toBe(0)
    expect(stats.editoriallyReviewedCount).toBe(0)
    expect(stats.unreviewedCount).toBe(34)
  })
})
