import { describe, it, expect } from "vitest"
import {
  validateReviewRecord,
  buildDisclosureFromReviews,
  getArticleReviewDisclosure,
  type ReviewRecord,
} from "@/lib/review-registry"

function makeRecord(overrides: Partial<ReviewRecord> = {}): ReviewRecord {
  return {
    review_id: "rev-1",
    article_slug: "sample-article",
    review_type: "editorial_review",
    reviewer_type: "organization",
    reviewer_name: "Healthy Weight Literacy Foundation Editorial Team",
    reviewer_identity_verified: false,
    reviewed_revision_hash: "hash-a",
    reviewed_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("review record validation — the licensed_medical_review hard gate (Issue #15)", () => {
  it("accepts a complete, verified licensed medical review record", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "human",
      reviewer_name: "Jane Example, MD",
      reviewer_credentials: ["MD", "Board Certified — Obesity Medicine"],
      reviewer_identity_verified: true,
    })
    const { valid, errors } = validateReviewRecord(record)
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS a licensed medical review with a missing revision hash", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "human",
      reviewer_name: "Jane Example, MD",
      reviewer_credentials: ["MD"],
      reviewer_identity_verified: true,
      reviewed_revision_hash: "",
    })
    const { valid, errors } = validateReviewRecord(record)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/revision_hash/)
  })

  it("FAILS a licensed medical review with missing credentials", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "human",
      reviewer_name: "Jane Example, MD",
      reviewer_identity_verified: true,
      reviewer_credentials: [],
    })
    const { valid, errors } = validateReviewRecord(record)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/credential/)
  })

  it("FAILS a licensed medical review whose reviewer identity is not verified", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "human",
      reviewer_name: "Jane Example, MD",
      reviewer_credentials: ["MD"],
      reviewer_identity_verified: false,
    })
    const { valid, errors } = validateReviewRecord(record)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/identity_verified/)
  })

  it("FAILS a licensed medical review claimed by an organization rather than a real human — an AI/automated/editorial audit can never satisfy this gate merely by evaluating an article", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "organization",
      reviewer_name: "Healthy Weight Literacy Foundation Editorial Team",
      reviewer_identity_verified: true,
      reviewer_credentials: ["N/A"],
    })
    const { valid, errors } = validateReviewRecord(record)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/reviewer_type "human"/)
  })

  it("does not require credentials/identity-verification for an editorial_review (organization reviewer is legitimate for this type)", () => {
    const record = makeRecord({ review_type: "editorial_review", reviewer_type: "organization" })
    const { valid } = validateReviewRecord(record)
    expect(valid).toBe(true)
  })
})

describe("review disclosure precedence and hash-matching (adversarial)", () => {
  const HASH = "current-hash-abc"

  it("updatedAt/content_update alone never produces a review disclosure — an empty registry means no review claim of any kind", () => {
    const disclosure = buildDisclosureFromReviews([], "some-slug", HASH)
    expect(disclosure.reviewType).toBeNull()
    expect(disclosure.reviewerName).toBeNull()
    expect(disclosure.reviewedAt).toBeNull()
  })

  it("an editorial_review record may be disclosed, but never as a licensed review claim", () => {
    const reviews = [
      makeRecord({ article_slug: "a", review_type: "editorial_review", reviewed_revision_hash: HASH }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, "a", HASH)
    expect(disclosure.reviewType).toBe("editorial_review")
    expect(disclosure.reviewType).not.toBe("licensed_medical_review")
    expect(disclosure.credentials).toBeNull()
  })

  it("an AI/automated audit record (organization reviewer, unverified identity) never surfaces as a licensed reviewer claim, even when it is the only record present", () => {
    const reviews = [
      makeRecord({
        article_slug: "a",
        review_type: "editorial_review",
        reviewer_type: "organization",
        reviewer_name: "Automated QA",
        reviewer_identity_verified: false,
        reviewed_revision_hash: HASH,
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, "a", HASH)
    expect(disclosure.reviewType).not.toBe("licensed_medical_review")
    expect(disclosure.reviewerType).not.toBe("human")
  })

  it("a complete, verified licensed_medical_review record is eligible to be disclosed as such", () => {
    const reviews = [
      makeRecord({
        article_slug: "a",
        review_type: "licensed_medical_review",
        reviewer_type: "human",
        reviewer_name: "Jane Example, MD",
        reviewer_credentials: ["MD"],
        reviewer_identity_verified: true,
        reviewed_revision_hash: HASH,
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, "a", HASH)
    expect(disclosure.reviewType).toBe("licensed_medical_review")
    expect(disclosure.reviewerName).toBe("Jane Example, MD")
    expect(disclosure.credentials).toEqual(["MD"])
  })

  it("a licensed review record does NOT apply once the article's content has changed (hash mismatch) — a stale review can never be shown as current", () => {
    const reviews = [
      makeRecord({
        article_slug: "a",
        review_type: "licensed_medical_review",
        reviewer_type: "human",
        reviewer_name: "Jane Example, MD",
        reviewer_credentials: ["MD"],
        reviewer_identity_verified: true,
        reviewed_revision_hash: "old-hash",
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, "a", "new-hash-after-content-update")
    expect(disclosure.reviewType).toBeNull()
  })

  it("prefers licensed_medical_review over clinical_evidence_review over editorial_review when multiple current records exist", () => {
    const reviews = [
      makeRecord({ article_slug: "a", review_type: "editorial_review", reviewed_revision_hash: HASH }),
      makeRecord({
        article_slug: "a",
        review_type: "clinical_evidence_review",
        reviewer_name: "Evidence Team",
        reviewed_revision_hash: HASH,
      }),
      makeRecord({
        article_slug: "a",
        review_type: "licensed_medical_review",
        reviewer_type: "human",
        reviewer_name: "Jane Example, MD",
        reviewer_credentials: ["MD"],
        reviewer_identity_verified: true,
        reviewed_revision_hash: HASH,
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, "a", HASH)
    expect(disclosure.reviewType).toBe("licensed_medical_review")
  })

  it("reviews for a different slug never leak into this article's disclosure", () => {
    const reviews = [
      makeRecord({
        article_slug: "other-article",
        review_type: "licensed_medical_review",
        reviewer_type: "human",
        reviewer_name: "Jane Example, MD",
        reviewer_credentials: ["MD"],
        reviewer_identity_verified: true,
        reviewed_revision_hash: HASH,
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, "this-article", HASH)
    expect(disclosure.reviewType).toBeNull()
  })
})

describe("real registry (content/reviews/registry.json) current state", () => {
  it("currently discloses no review of any type for any article — the honest state before Issue #17's audit", () => {
    const disclosure = getArticleReviewDisclosure("set-point-theory-why-body-resists-weight-loss", "any-hash")
    expect(disclosure.reviewType).toBeNull()
    expect(disclosure.reviewerName).toBeNull()
    expect(disclosure.credentials).toBeNull()
  })
})
