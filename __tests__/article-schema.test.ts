import { describe, it, expect, vi, beforeEach } from "vitest"

const mockDisclosure = vi.fn()
const mockRevisionHash = vi.fn()

vi.mock("@/lib/review-registry", () => ({
  getArticleReviewDisclosure: (...args: unknown[]) => mockDisclosure(...args),
}))
vi.mock("@/lib/content-registry", () => ({
  getRevisionHash: (...args: unknown[]) => mockRevisionHash(...args),
}))

const baseProps = {
  title: "Sample Article",
  description: "A sample article for tests.",
  slug: "sample-article",
  publishedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
  category: "Metabolic Health", // a MEDICAL_CATEGORIES entry
  author: "Healthy Weight Literacy Foundation",
}

const NO_REVIEW = { reviewType: null, reviewerType: null, reviewerName: null, credentials: null, reviewedAt: null }

beforeEach(() => {
  mockDisclosure.mockReset()
  mockRevisionHash.mockReset()
  mockRevisionHash.mockReturnValue("current-hash")
})

describe("ArticleSchema JSON-LD (Issue #15)", () => {
  it("omits reviewedBy/lastReviewed entirely when no review record exists — updatedAt alone must never produce lastReviewed", async () => {
    mockDisclosure.mockReturnValue(NO_REVIEW)
    const { buildArticleSchema } = await import("@/components/seo/article-schema")

    const schema = buildArticleSchema(baseProps)

    expect(schema["@type"]).toBe("MedicalWebPage")
    expect(schema.reviewedBy).toBeUndefined()
    expect(schema.lastReviewed).toBeUndefined()
    // dateModified is a distinct, always-true content_update fact and is fine to keep.
    expect(schema.dateModified).toBe(baseProps.updatedAt)
  })

  it("omits reviewedBy/lastReviewed for a plain editorial_review — editorial review may display in the visible UI, but must never appear as a schema.org medical review claim", async () => {
    mockDisclosure.mockReturnValue({
      reviewType: "editorial_review",
      reviewerType: "organization",
      reviewerName: "Healthy Weight Literacy Foundation Editorial Team",
      credentials: null,
      reviewedAt: "2026-03-01T00:00:00.000Z",
    })
    const { buildArticleSchema } = await import("@/components/seo/article-schema")

    const schema = buildArticleSchema(baseProps)

    expect(schema.reviewedBy).toBeUndefined()
    expect(schema.lastReviewed).toBeUndefined()
  })

  it("emits reviewedBy/lastReviewed for a clinical_evidence_review with a matching revision hash", async () => {
    mockDisclosure.mockReturnValue({
      reviewType: "clinical_evidence_review",
      reviewerType: "organization",
      reviewerName: "HWLF Evidence Review Team",
      credentials: null,
      reviewedAt: "2026-03-01T00:00:00.000Z",
    })
    const { buildArticleSchema } = await import("@/components/seo/article-schema")

    const schema = buildArticleSchema(baseProps)

    expect(schema.lastReviewed).toBe("2026-03-01T00:00:00.000Z")
    expect(schema.reviewedBy).toMatchObject({ "@type": "Organization", name: "HWLF Evidence Review Team" })
  })

  it("emits a Person reviewedBy with hasCredential only for a real, verified licensed_medical_review", async () => {
    mockDisclosure.mockReturnValue({
      reviewType: "licensed_medical_review",
      reviewerType: "human",
      reviewerName: "Jane Example, MD",
      credentials: ["MD", "Board Certified — Obesity Medicine"],
      reviewedAt: "2026-04-01T00:00:00.000Z",
    })
    const { buildArticleSchema } = await import("@/components/seo/article-schema")

    const schema = buildArticleSchema(baseProps)

    expect(schema.reviewedBy).toMatchObject({
      "@type": "Person",
      name: "Jane Example, MD",
      hasCredential: [
        { "@type": "EducationalOccupationalCredential", credentialCategory: "MD" },
        { "@type": "EducationalOccupationalCredential", credentialCategory: "Board Certified — Obesity Medicine" },
      ],
    })
    expect(schema.lastReviewed).toBe("2026-04-01T00:00:00.000Z")
  })

  it("JSON-LD author always matches the article's real visible author field, not a hardcoded organization name", async () => {
    mockDisclosure.mockReturnValue(NO_REVIEW)
    const { buildArticleSchema } = await import("@/components/seo/article-schema")

    const schema = buildArticleSchema({ ...baseProps, author: "A Different Org Name" })

    expect(schema.author).toMatchObject({ "@type": "Organization", name: "A Different Org Name" })
  })

  it("a non-medical category still gets a plain Article type with the same author-fidelity and no review claims", async () => {
    mockDisclosure.mockReturnValue(NO_REVIEW)
    const { buildArticleSchema } = await import("@/components/seo/article-schema")

    const schema = buildArticleSchema({ ...baseProps, category: "Family" })

    expect(schema["@type"]).toBe("Article")
    expect(schema.reviewedBy).toBeUndefined()
    expect(schema.lastReviewed).toBeUndefined()
  })
})
