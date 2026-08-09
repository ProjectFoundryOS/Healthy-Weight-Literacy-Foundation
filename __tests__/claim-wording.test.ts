import { describe, it, expect } from "vitest"
import { checkProseAgainstClaim, checkProseAgainstPacket, isPassingWordingCheck } from "@/lib/claim-wording"
import type { ClaimRecord } from "@/lib/claim-registry"
import type { ArticleEvidencePacket } from "@/lib/evidence-packet-registry"

function makeClaim(overrides: Partial<ClaimRecord> = {}): ClaimRecord {
  return {
    claim_id: "claim-x",
    canonical_claim: "Example claim.",
    claim_type: "efficacy",
    classification: "established",
    ymyl_risk: "low",
    source_ids: ["src-a"],
    primary_source_ids: ["src-a"],
    support_strength: "single RCT",
    last_verified_at: "2026-01-01",
    review_due_at: "2026-06-01",
    decay_class: "clinical_efficacy",
    prohibited_wording: ["cures obesity"],
    required_qualifiers: ["specific to the STEP 1 trial population"],
    ...overrides,
  }
}

function makePacket(overrides: Partial<ArticleEvidencePacket> = {}): ArticleEvidencePacket {
  return {
    packet_id: "packet-1",
    topic_id: "topic-1",
    canonical_question: "Example question?",
    reader_intent: "Understand something.",
    approved_claim_ids: ["claim-x"],
    mandatory_claim_ids: ["claim-x"],
    optional_claim_ids: [],
    source_ids: ["src-a"],
    required_limitations: [],
    required_safety_context: [],
    prohibited_claims: ["guarantees weight loss"],
    allowed_conclusions: [],
    uncertainty_notes: [],
    related_articles: [],
    generated_at: "2026-01-01",
    source_registry_revision: "hash-a",
    claim_registry_revision: "hash-b",
    ...overrides,
  }
}

describe("checkProseAgainstClaim", () => {
  it("flags a prohibited phrase that appears in prose (case-insensitive)", () => {
    const violations = checkProseAgainstClaim("Semaglutide literally CURES OBESITY for everyone.", makeClaim())
    expect(violations.some((v) => v.type === "prohibited_phrase_found")).toBe(true)
  })

  it("flags a missing required qualifier", () => {
    const violations = checkProseAgainstClaim("Semaglutide produced significant weight loss.", makeClaim())
    expect(violations.some((v) => v.type === "required_qualifier_missing")).toBe(true)
  })

  it("passes clean prose containing the qualifier and no prohibited phrase", () => {
    const prose = "This result is specific to the STEP 1 trial population and should not be generalized."
    const violations = checkProseAgainstClaim(prose, makeClaim())
    expect(violations).toEqual([])
  })

  it("does not flag anything when the claim has no wording contract at all", () => {
    const violations = checkProseAgainstClaim("Anything goes here.", makeClaim({ prohibited_wording: undefined, required_qualifiers: undefined }))
    expect(violations).toEqual([])
  })
})

describe("checkProseAgainstPacket", () => {
  it("flags a packet-level prohibited phrase even if no individual claim mentions it", () => {
    const results = checkProseAgainstPacket("This treatment guarantees weight loss.", makePacket(), [
      makeClaim({ prohibited_wording: [], required_qualifiers: [] }),
    ])
    expect(results.some((r) => r.claimId === "(packet)")).toBe(true)
    expect(isPassingWordingCheck(results)).toBe(false)
  })

  it("aggregates violations from every mandatory claim in the packet", () => {
    const results = checkProseAgainstPacket("No qualifiers here.", makePacket(), [makeClaim()])
    expect(results.some((r) => r.claimId === "claim-x")).toBe(true)
  })

  it("PASSES clean prose satisfying both the packet and every mandatory claim", () => {
    const prose = "This result is specific to the STEP 1 trial population."
    const results = checkProseAgainstPacket(prose, makePacket(), [makeClaim({ prohibited_wording: [] })])
    expect(isPassingWordingCheck(results)).toBe(true)
  })

  it("skips a mandatory claim_id that does not resolve, rather than throwing", () => {
    const packet = makePacket({ mandatory_claim_ids: ["claim-does-not-exist"] })
    expect(() => checkProseAgainstPacket("anything", packet, [])).not.toThrow()
  })
})
