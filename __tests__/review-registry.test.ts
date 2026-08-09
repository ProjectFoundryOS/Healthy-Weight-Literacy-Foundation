import { describe, it, expect } from "vitest"
import {
  validateReviewRecord,
  buildDisclosureFromReviews,
  getArticleReviewDisclosure,
  findDuplicateReviewIds,
  type ReviewRecord,
} from "@/lib/review-registry"
import type { VerifiedReviewer } from "@/lib/verified-reviewer-registry"

function makeRecord(overrides: Partial<ReviewRecord> = {}): ReviewRecord {
  return {
    review_id: "rev-1",
    article_slug: "sample-article",
    review_type: "editorial_review",
    reviewer_type: "organization",
    reviewer_name: "Healthy Weight Literacy Foundation Editorial Team",
    reviewed_revision_hash: "hash-a",
    reviewed_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

function makeVerifiedReviewer(overrides: Partial<VerifiedReviewer> = {}): VerifiedReviewer {
  return {
    reviewer_id: "rev-jane-example",
    reviewer_type: "human",
    name: "Jane Example, MD",
    identity_verification: {
      method: "government_id_plus_medical_board_lookup",
      source: "State Medical Board of Example",
      verified_at: "2026-06-01",
    },
    credentials: [
      {
        credential: "MD",
        issuer: "Example State Medical Board",
        verification_source: "https://example-medical-board.gov/verify",
        verified_at: "2026-06-01",
      },
    ],
    status: "active",
    ...overrides,
  }
}

describe("review record validation — the licensed_medical_review provenance gate (Issue #15/#26)", () => {
  it("accepts a licensed review record whose reviewer_id resolves to a fully-provenanced verified reviewer", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "human",
      reviewer_id: "rev-jane-example",
    })
    const { valid, errors } = validateReviewRecord(record, [makeVerifiedReviewer()])
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS a licensed review that only self-asserts identity_verified=true plus credential strings and has no reviewer_id — this is exactly the fixture a model could otherwise fabricate", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "human",
      reviewer_name: "Jane Example, MD",
      reviewer_credentials: ["MD"],
      reviewer_identity_verified: true, // self-asserted; must never be trusted alone
      // no reviewer_id at all
    })
    const { valid, errors } = validateReviewRecord(record, [])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/reviewer_id/)
  })

  it("FAILS when reviewer_id does not exist in the verified-reviewer registry", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "human",
      reviewer_id: "rev-does-not-exist",
    })
    const { valid, errors } = validateReviewRecord(record, [makeVerifiedReviewer()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/does not exist/)
  })

  it("FAILS when the resolved reviewer has no identity-verification provenance", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "human",
      reviewer_id: "rev-no-identity",
    })
    const reviewer = makeVerifiedReviewer({
      reviewer_id: "rev-no-identity",
      identity_verification: { method: "", source: "", verified_at: "" },
    })
    const { valid, errors } = validateReviewRecord(record, [reviewer])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/identity-verification/)
  })

  it("FAILS when the resolved reviewer's credentials lack verification provenance", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "human",
      reviewer_id: "rev-no-cred-provenance",
    })
    const reviewer = makeVerifiedReviewer({
      reviewer_id: "rev-no-cred-provenance",
      credentials: [{ credential: "MD", issuer: "", verification_source: "", verified_at: "" }],
    })
    const { valid, errors } = validateReviewRecord(record, [reviewer])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/credential/)
  })

  it("FAILS a licensed review claimed by an organization reviewer_type, even with a valid reviewer_id somehow attached", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "organization",
      reviewer_id: "rev-jane-example",
    })
    const { valid, errors } = validateReviewRecord(record, [makeVerifiedReviewer()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/reviewer_type "human"/)
  })

  it("FAILS an AI/automated-audit-shaped licensed review claim (organization reviewer, no reviewer_id) outright", () => {
    const record = makeRecord({
      review_type: "licensed_medical_review",
      reviewer_type: "organization",
      reviewer_name: "Automated QA",
    })
    const { valid, errors } = validateReviewRecord(record, [])
    expect(valid).toBe(false)
    expect(errors.length).toBeGreaterThan(0)
  })

  it("FAILS a record with an invalid reviewed_at date", () => {
    const record = makeRecord({ reviewed_at: "not a date" })
    const { valid, errors } = validateReviewRecord(record, [])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/reviewed_at/)
  })

  it("FAILS a record with an unknown review_type", () => {
    const record = { ...makeRecord(), review_type: "ai_vibe_check" } as unknown as ReviewRecord
    const { valid, errors } = validateReviewRecord(record, [])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown review_type/)
  })

  it("FAILS a record with an unknown reviewer_type", () => {
    const record = { ...makeRecord(), reviewer_type: "chatbot" } as unknown as ReviewRecord
    const { valid, errors } = validateReviewRecord(record, [])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown reviewer_type/)
  })

  it("does not require reviewer_id/credentials for an editorial_review (organization reviewer is legitimate for this type)", () => {
    const record = makeRecord({ review_type: "editorial_review", reviewer_type: "organization" })
    const { valid } = validateReviewRecord(record, [])
    expect(valid).toBe(true)
  })
})

describe("review disclosure precedence and hash-matching (adversarial)", () => {
  const HASH = "current-hash-abc"
  const VERIFIED = makeVerifiedReviewer()

  it("updatedAt/content_update alone never produces a review disclosure — an empty registry means no review claim of any kind", () => {
    const disclosure = buildDisclosureFromReviews([], [], "some-slug", HASH)
    expect(disclosure.reviewType).toBeNull()
    expect(disclosure.reviewerName).toBeNull()
    expect(disclosure.reviewedAt).toBeNull()
  })

  it("an editorial_review record may be disclosed, but never as a licensed review claim", () => {
    const reviews = [
      makeRecord({ article_slug: "a", review_type: "editorial_review", reviewed_revision_hash: HASH }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, [], "a", HASH)
    expect(disclosure.reviewType).toBe("editorial_review")
    expect(disclosure.reviewType).not.toBe("licensed_medical_review")
    expect(disclosure.credentials).toBeNull()
  })

  it("a complete, verified-provenance licensed_medical_review record is eligible to be disclosed, with name/credentials sourced from the verified-reviewer registry", () => {
    const reviews = [
      makeRecord({
        article_slug: "a",
        review_type: "licensed_medical_review",
        reviewer_type: "human",
        reviewer_id: "rev-jane-example",
        reviewed_revision_hash: HASH,
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, [VERIFIED], "a", HASH)
    expect(disclosure.reviewType).toBe("licensed_medical_review")
    expect(disclosure.reviewerName).toBe("Jane Example, MD")
    expect(disclosure.credentials).toEqual(["MD"])
  })

  it("never discloses a licensed review whose reviewer_id fails to resolve, even if the record itself claims a name inline — falls through to a lower review type or no review", () => {
    const reviews = [
      makeRecord({
        article_slug: "a",
        review_type: "licensed_medical_review",
        reviewer_type: "human",
        reviewer_id: "rev-does-not-exist",
        reviewer_name: "Someone Claimed Inline, MD",
        reviewed_revision_hash: HASH,
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, [], "a", HASH)
    expect(disclosure.reviewType).toBeNull()
    expect(disclosure.reviewerName).not.toBe("Someone Claimed Inline, MD")
  })

  it("a licensed review record does NOT apply once the article's content has changed (hash mismatch) — a stale review can never be shown as current", () => {
    const reviews = [
      makeRecord({
        article_slug: "a",
        review_type: "licensed_medical_review",
        reviewer_type: "human",
        reviewer_id: "rev-jane-example",
        reviewed_revision_hash: "old-hash",
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, [VERIFIED], "a", "new-hash-after-content-update")
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
        reviewer_id: "rev-jane-example",
        reviewed_revision_hash: HASH,
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, [VERIFIED], "a", HASH)
    expect(disclosure.reviewType).toBe("licensed_medical_review")
  })

  it("reviews for a different slug never leak into this article's disclosure", () => {
    const reviews = [
      makeRecord({
        article_slug: "other-article",
        review_type: "licensed_medical_review",
        reviewer_type: "human",
        reviewer_id: "rev-jane-example",
        reviewed_revision_hash: HASH,
      }),
    ]
    const disclosure = buildDisclosureFromReviews(reviews, [VERIFIED], "this-article", HASH)
    expect(disclosure.reviewType).toBeNull()
  })
})

describe("duplicate review_id detection (Issue #26 registry-level validation)", () => {
  it("finds no duplicates in a clean list", () => {
    const records = [makeRecord({ review_id: "a" }), makeRecord({ review_id: "b" })]
    expect(findDuplicateReviewIds(records)).toEqual([])
  })

  it("FAILS registry validation by flagging a duplicate review_id", () => {
    const records = [
      makeRecord({ review_id: "dup-1", article_slug: "x" }),
      makeRecord({ review_id: "dup-1", article_slug: "y" }),
    ]
    expect(findDuplicateReviewIds(records)).toEqual(["dup-1"])
  })
})

describe("real registries (content/reviews/registry.json + verified-reviewers.json) current state", () => {
  it("currently discloses no review of any type for any article — the honest state before Issue #17's audit", () => {
    const disclosure = getArticleReviewDisclosure("set-point-theory-why-body-resists-weight-loss", "any-hash")
    expect(disclosure.reviewType).toBeNull()
    expect(disclosure.reviewerName).toBeNull()
    expect(disclosure.credentials).toBeNull()
  })
})
