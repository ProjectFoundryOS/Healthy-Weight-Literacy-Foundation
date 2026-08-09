import { describe, it, expect } from "vitest"
import {
  validateVerifiedReviewer,
  resolveVerifiedReviewer,
  getVerifiedCredentials,
  isValidDateString,
  loadVerifiedReviewers,
  type VerifiedReviewer,
} from "@/lib/verified-reviewer-registry"

function makeReviewer(overrides: Partial<VerifiedReviewer> = {}): VerifiedReviewer {
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

describe("isValidDateString (Issue #26 date hardening)", () => {
  it("accepts ISO date strings", () => {
    expect(isValidDateString("2026-06-01")).toBe(true)
    expect(isValidDateString("2026-06-01T00:00:00.000Z")).toBe(true)
  })

  it("rejects non-ISO-shaped strings even if the JS Date constructor could parse them", () => {
    expect(isValidDateString("June 2025")).toBe(false)
    expect(isValidDateString("06/01/2026")).toBe(false)
  })

  it("rejects garbage, empty, and non-string values", () => {
    expect(isValidDateString("not a date")).toBe(false)
    expect(isValidDateString("")).toBe(false)
    expect(isValidDateString(undefined)).toBe(false)
    expect(isValidDateString(12345)).toBe(false)
  })
})

describe("validateVerifiedReviewer", () => {
  it("accepts a complete, fully-provenanced human reviewer", () => {
    const { valid, errors } = validateVerifiedReviewer(makeReviewer())
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS when identity_verification provenance is absent", () => {
    const reviewer = makeReviewer({
      identity_verification: { method: "", source: "", verified_at: "" },
    })
    const { valid, errors } = validateVerifiedReviewer(reviewer)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/identity_verification/)
  })

  it("FAILS when no credential has verification provenance", () => {
    const reviewer = makeReviewer({
      credentials: [{ credential: "MD", issuer: "", verification_source: "", verified_at: "" }],
    })
    const { valid, errors } = validateVerifiedReviewer(reviewer)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/credential/)
  })

  it("FAILS with an invalid verified_at date on the credential", () => {
    const reviewer = makeReviewer({
      credentials: [
        { credential: "MD", issuer: "Board", verification_source: "https://board.example", verified_at: "not-a-date" },
      ],
    })
    const { valid } = validateVerifiedReviewer(reviewer)
    expect(valid).toBe(false)
  })

  it("FAILS for a non-human reviewer_type", () => {
    const reviewer = { ...makeReviewer(), reviewer_type: "organization" } as unknown as VerifiedReviewer
    const { valid, errors } = validateVerifiedReviewer(reviewer)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/human/)
  })

  it("FAILS for an unknown status", () => {
    const reviewer = { ...makeReviewer(), status: "pending" } as unknown as VerifiedReviewer
    const { valid, errors } = validateVerifiedReviewer(reviewer)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/status/)
  })
})

describe("resolveVerifiedReviewer (the licensed-review provenance gate)", () => {
  it("PASSES for an active reviewer with full identity and credential provenance, matched by reviewer_id", () => {
    const reviewers = [makeReviewer()]
    const { reviewer, errors } = resolveVerifiedReviewer(reviewers, "rev-jane-example")
    expect(errors).toEqual([])
    expect(reviewer?.name).toBe("Jane Example, MD")
  })

  it("FAILS when reviewer_id is missing entirely", () => {
    const { reviewer, errors } = resolveVerifiedReviewer([makeReviewer()], undefined)
    expect(reviewer).toBeNull()
    expect(errors.join(" ")).toMatch(/reviewer_id/)
  })

  it("FAILS for an unknown reviewer_id — a self-asserted name cannot manufacture a registry entry", () => {
    const { reviewer, errors } = resolveVerifiedReviewer([makeReviewer()], "rev-does-not-exist")
    expect(reviewer).toBeNull()
    expect(errors.join(" ")).toMatch(/does not exist/)
  })

  it("FAILS for a reviewer with status other than active", () => {
    const reviewers = [makeReviewer({ reviewer_id: "rev-revoked", status: "revoked" })]
    const { reviewer, errors } = resolveVerifiedReviewer(reviewers, "rev-revoked")
    expect(reviewer).toBeNull()
    expect(errors.join(" ")).toMatch(/status/)
  })

  it("FAILS for a reviewer missing identity-verification provenance even if credentials look fine", () => {
    const reviewers = [
      makeReviewer({
        reviewer_id: "rev-no-identity",
        identity_verification: { method: "", source: "", verified_at: "" },
      }),
    ]
    const { reviewer, errors } = resolveVerifiedReviewer(reviewers, "rev-no-identity")
    expect(reviewer).toBeNull()
    expect(errors.join(" ")).toMatch(/identity-verification/)
  })

  it("FAILS for a reviewer whose only credential lacks verification provenance", () => {
    const reviewers = [
      makeReviewer({
        reviewer_id: "rev-no-credential-provenance",
        credentials: [{ credential: "MD", issuer: "", verification_source: "", verified_at: "" }],
      }),
    ]
    const { reviewer, errors } = resolveVerifiedReviewer(reviewers, "rev-no-credential-provenance")
    expect(reviewer).toBeNull()
    expect(errors.join(" ")).toMatch(/credential/)
  })
})

describe("getVerifiedCredentials", () => {
  it("returns only credentials with complete verification provenance, excluding unprovenanced ones on the same reviewer", () => {
    const reviewer = makeReviewer({
      credentials: [
        { credential: "MD", issuer: "Board", verification_source: "https://board.example", verified_at: "2026-06-01" },
        { credential: "Unverified Claim", issuer: "", verification_source: "", verified_at: "" },
      ],
    })
    expect(getVerifiedCredentials(reviewer)).toEqual(["MD"])
  })
})

describe("real verified-reviewer registry (content/reviews/verified-reviewers.json) current state", () => {
  it("is currently empty — no verified reviewer exists yet", () => {
    expect(loadVerifiedReviewers()).toEqual([])
  })
})
