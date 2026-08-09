import { describe, it, expect } from "vitest"
import { validateClaimRecord, findDuplicateClaimIds, loadClaims, type ClaimRecord } from "@/lib/claim-registry"
import { loadSources, type SourceRecord } from "@/lib/source-registry"

function makeTierASource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    source_id: "src-a",
    title: "Example RCT",
    publisher_or_journal: "Example Journal",
    publication_date: "2020-01-01",
    source_type: "peer_reviewed_RCT",
    canonical_url: "https://pubmed.ncbi.nlm.nih.gov/00000001/",
    pmid: "00000001",
    retrieved_at: "2026-01-01",
    trust_tier: "A",
    status: "current",
    topics: ["example"],
    verification: {
      url_checked: true,
      identifier_checked: true,
      title_matched: true,
      publication_metadata_matched: true,
      verified_at: "2026-01-01",
      verification_method: "test fixture",
    },
    ...overrides,
  }
}

function makeClaim(overrides: Partial<ClaimRecord> = {}): ClaimRecord {
  return {
    claim_id: "claim-1",
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
    ...overrides,
  }
}

describe("validateClaimRecord — claim-source contract", () => {
  it("PASSES a properly sourced established claim", () => {
    const { valid, errors } = validateClaimRecord(makeClaim(), [makeTierASource()])
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS a claim with zero sources (negative test required by Issue #16)", () => {
    const { valid, errors } = validateClaimRecord(makeClaim({ source_ids: [], primary_source_ids: [] }), [])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/zero mapped source_ids/)
  })

  it("FAILS a claim referencing an unknown source_id", () => {
    const { valid, errors } = validateClaimRecord(makeClaim({ source_ids: ["src-does-not-exist"], primary_source_ids: ["src-does-not-exist"] }), [])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown source_id/)
  })

  it("FAILS a statistical claim supported only by a generic organization-homepage-shaped source (negative test required by Issue #16)", () => {
    const homepage = makeTierASource({
      source_id: "src-homepage",
      title: "Homepage",
      source_type: "other",
      trust_tier: "D",
      doi: undefined,
      pmid: undefined,
    })
    const claim = makeClaim({
      claim_type: "statistical_result",
      ymyl_risk: "high",
      source_ids: ["src-homepage"],
      primary_source_ids: ["src-homepage"],
      statistical_detail: {
        value: 10,
        unit: "pounds",
        measure_type: "defended weight range",
        population: "general adults",
        source_location: "homepage",
      },
    })
    const { valid, errors } = validateClaimRecord(claim, [homepage])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/Tier A primary source/)
  })

  it("FAILS an established high-risk claim supported only by a Tier C source", () => {
    const tierC = makeTierASource({ source_id: "src-c", trust_tier: "C" })
    const claim = makeClaim({ ymyl_risk: "high", source_ids: ["src-c"], primary_source_ids: ["src-c"] })
    const { valid, errors } = validateClaimRecord(claim, [tierC])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/Tier A primary source/)
  })

  it("FAILS an established claim supported only by a Tier D source (below even the low-risk B/A bar)", () => {
    const tierD = makeTierASource({ source_id: "src-d", trust_tier: "D" })
    const claim = makeClaim({ ymyl_risk: "low", source_ids: ["src-d"], primary_source_ids: ["src-d"] })
    const { valid, errors } = validateClaimRecord(claim, [tierD])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/Tier A or B/)
  })

  it("PASSES a low-risk established claim supported by a Tier B source", () => {
    const tierB = makeTierASource({ source_id: "src-b", trust_tier: "B" })
    const claim = makeClaim({ ymyl_risk: "low", source_ids: ["src-b"], primary_source_ids: ["src-b"] })
    const { valid } = validateClaimRecord(claim, [tierB])
    expect(valid).toBe(true)
  })

  it("FAILS when a generic homepage-shaped source is cited for a statistical_result but statistical_detail is missing", () => {
    const claim = makeClaim({ claim_type: "statistical_result", statistical_detail: undefined })
    const { valid, errors } = validateClaimRecord(claim, [makeTierASource()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/statistical_detail/)
  })

  it("PASSES a statistical_result claim with a complete statistical_detail block", () => {
    const claim = makeClaim({
      claim_type: "statistical_result",
      statistical_detail: {
        value: 14.9,
        unit: "percent",
        measure_type: "mean percent change",
        population: "adults with obesity",
        sample_size: 100,
        source_location: "Table 1",
      },
    })
    const { valid } = validateClaimRecord(claim, [makeTierASource()])
    expect(valid).toBe(true)
  })

  it("FAILS a claim whose active, high-risk status rests solely on a retracted source", () => {
    const retracted = makeTierASource({ source_id: "src-retracted", status: "retracted" })
    const claim = makeClaim({ ymyl_risk: "high", source_ids: ["src-retracted"], primary_source_ids: ["src-retracted"] })
    const { valid, errors } = validateClaimRecord(claim, [retracted])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/retracted/)
  })

  it("FAILS an unknown claim_type", () => {
    const claim = { ...makeClaim(), claim_type: "vibes" } as unknown as ClaimRecord
    const { valid, errors } = validateClaimRecord(claim, [makeTierASource()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown claim_type/)
  })

  it("FAILS an impossible calendar last_verified_at date (Issue #27)", () => {
    const claim = makeClaim({ last_verified_at: "2026-02-31" })
    const { valid, errors } = validateClaimRecord(claim, [makeTierASource()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/last_verified_at/)
  })

  it("FAILS when review_due_at is not after last_verified_at", () => {
    const claim = makeClaim({ last_verified_at: "2026-06-01", review_due_at: "2026-01-01" })
    const { valid, errors } = validateClaimRecord(claim, [makeTierASource()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/review_due_at must be after/)
  })

  it("FAILS trial_detail.primary_publication_source_id pointing outside the claim's own source_ids", () => {
    const claim = makeClaim({
      trial_detail: {
        population: "adults",
        sample_size: 100,
        intervention: "drug",
        duration: "12 weeks",
        primary_endpoint: "weight change",
        result: "-10%",
        primary_publication_source_id: "src-not-in-list",
      },
    })
    const { valid, errors } = validateClaimRecord(claim, [makeTierASource()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/primary_publication_source_id must be one of/)
  })
})

describe("findDuplicateClaimIds", () => {
  it("FAILS registry validation by flagging a duplicate claim_id", () => {
    const records = [makeClaim({ claim_id: "dup" }), makeClaim({ claim_id: "dup" })]
    expect(findDuplicateClaimIds(records)).toEqual(["dup"])
  })
})

describe("real content/claims/registry.json", () => {
  it("loads and validates cleanly against the real source registry", () => {
    const sources = loadSources()
    const claims = loadClaims(sources)
    expect(claims.length).toBeGreaterThan(0)
    for (const c of claims) {
      const { valid, errors } = validateClaimRecord(c, sources)
      expect(valid, `${c.claim_id}: ${errors.join("; ")}`).toBe(true)
    }
  })

  it("has no duplicate claim_id values", () => {
    const sources = loadSources()
    expect(findDuplicateClaimIds(loadClaims(sources))).toEqual([])
  })

  it("every claim cites at least one real, verified source", () => {
    const sources = loadSources()
    const claims = loadClaims(sources)
    for (const c of claims) {
      expect(c.source_ids.length, c.claim_id).toBeGreaterThan(0)
    }
  })
})
