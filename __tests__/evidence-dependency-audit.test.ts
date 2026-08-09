import { describe, it, expect } from "vitest"
import {
  findClaimsWithoutCurrentSupport,
  findHighRiskClaimsLackingCurrentPrimarySupport,
  findDanglingSourceSupersessionReferences,
  findDanglingClaimSupersessionReferences,
  findCircularSourceSupersessionChains,
  findCircularClaimSupersessionChains,
  findStalePackets,
  findTopicsWithStalePacket,
  findClaimsDueForReview,
  findSourcesDueForVerification,
  buildDependencyAuditReport,
  isReportClean,
} from "@/lib/evidence-dependency-audit"
import type { SourceRecord } from "@/lib/source-registry"
import type { ClaimRecord } from "@/lib/claim-registry"
import type { TopicRecord } from "@/lib/topic-registry"
import type { ArticleEvidencePacket } from "@/lib/evidence-packet-registry"
import { computeRegistryRevisionHash } from "@/lib/evidence-packet-registry"

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    source_id: "src-a",
    title: "Example",
    publisher_or_journal: "Example Journal",
    publication_date: "2020-01-01",
    source_type: "peer_reviewed_RCT",
    canonical_url: "https://pubmed.ncbi.nlm.nih.gov/1/",
    retrieved_at: "2026-01-01",
    trust_tier: "A",
    status: "current",
    topics: [],
    verification: {
      url_checked: true,
      identifier_checked: false,
      title_matched: true,
      publication_metadata_matched: true,
      verified_at: "2026-01-01",
      verification_method: "fixture",
    },
    ...overrides,
  }
}

function makeClaim(overrides: Partial<ClaimRecord> = {}): ClaimRecord {
  return {
    claim_id: "claim-a",
    canonical_claim: "Example claim.",
    claim_type: "efficacy",
    classification: "established",
    ymyl_risk: "high",
    source_ids: ["src-a"],
    primary_source_ids: ["src-a"],
    support_strength: "single RCT",
    last_verified_at: "2026-01-01",
    review_due_at: "2026-06-01",
    decay_class: "clinical_efficacy",
    ...overrides,
  }
}

function makeTopic(overrides: Partial<TopicRecord> = {}): TopicRecord {
  return {
    topic_id: "topic-a",
    canonical_question: "Q?",
    reader_intent: "intent",
    reader_stage: "understanding",
    cluster: "cluster",
    target_reader: "reader",
    desired_reader_outcome: "outcome",
    ymyl_class: "high",
    medical_risk: "high",
    decay_class: "clinical_efficacy",
    required_claim_ids: ["claim-a"],
    status: "existing_article",
    ...overrides,
  }
}

function makePacket(sources: SourceRecord[], claims: ClaimRecord[], overrides: Partial<ArticleEvidencePacket> = {}): ArticleEvidencePacket {
  return {
    packet_id: "packet-a",
    topic_id: "topic-a",
    canonical_question: "Q?",
    reader_intent: "intent",
    approved_claim_ids: ["claim-a"],
    mandatory_claim_ids: ["claim-a"],
    optional_claim_ids: [],
    source_ids: ["src-a"],
    required_limitations: [],
    required_safety_context: [],
    prohibited_claims: [],
    allowed_conclusions: [],
    uncertainty_notes: [],
    related_articles: [],
    generated_at: "2026-01-01",
    source_registry_revision: computeRegistryRevisionHash(sources),
    claim_registry_revision: computeRegistryRevisionHash(claims),
    ...overrides,
  }
}

describe("end-to-end retraction/supersession cascade (Issue #16 required dependency path)", () => {
  it("source retracted -> claim loses current support -> packet goes stale -> topic flagged", () => {
    const activeSource = makeSource({ status: "current" })
    const claim = makeClaim()
    const topic = makeTopic()
    const packet = makePacket([activeSource], [claim])

    // Before retraction: everything is clean.
    expect(findClaimsWithoutCurrentSupport([claim], [activeSource])).toEqual([])
    expect(findStalePackets([packet], [activeSource], [claim])).toEqual([])
    expect(findTopicsWithStalePacket([topic], [packet], [activeSource], [claim])).toEqual([])

    // The source gets retracted.
    const retractedSource = { ...activeSource, status: "retracted" as const }

    expect(findClaimsWithoutCurrentSupport([claim], [retractedSource])).toEqual(["claim-a"])
    expect(findHighRiskClaimsLackingCurrentPrimarySupport([claim], [retractedSource])).toEqual(["claim-a"])
    // The packet's frozen claim_registry_revision/source_registry_revision no longer
    // match the live (now-retracted) source, so it is stale even though the claim
    // record itself was never edited.
    expect(findStalePackets([packet], [retractedSource], [claim])).toEqual(["packet-a"])
    expect(findTopicsWithStalePacket([topic], [packet], [retractedSource], [claim])).toEqual(["topic-a"])
  })

  it("a claim explicitly marked superseded also cascades to a stale packet and flagged topic", () => {
    const source = makeSource()
    const claim = makeClaim()
    const topic = makeTopic()
    const packet = makePacket([source], [claim])

    const supersededClaim = { ...claim, classification: "superseded" as const }
    expect(findStalePackets([packet], [source], [supersededClaim])).toEqual(["packet-a"])
    expect(findTopicsWithStalePacket([topic], [packet], [source], [supersededClaim])).toEqual(["topic-a"])
  })
})

describe("findClaimsWithoutCurrentSupport", () => {
  it("FAILS a claim whose only source is unavailable", () => {
    const source = makeSource({ status: "unavailable" })
    expect(findClaimsWithoutCurrentSupport([makeClaim()], [source])).toEqual(["claim-a"])
  })

  it("passes a claim with at least one current source among several", () => {
    const retracted = makeSource({ source_id: "src-old", status: "retracted" })
    const current = makeSource({ source_id: "src-new", status: "current" })
    const claim = makeClaim({ source_ids: ["src-old", "src-new"] })
    expect(findClaimsWithoutCurrentSupport([claim], [retracted, current])).toEqual([])
  })
})

describe("findDanglingSourceSupersessionReferences / findDanglingClaimSupersessionReferences", () => {
  it("FAILS a source pointing at a superseded_by_source_id that does not exist", () => {
    const source = makeSource({ superseded_by_source_id: "src-does-not-exist" })
    expect(findDanglingSourceSupersessionReferences([source])).toEqual([{ id: "src-a", missingTargetId: "src-does-not-exist" }])
  })

  it("FAILS a claim pointing at a superseded_by_claim_id that does not exist", () => {
    const claim = makeClaim({ superseded_by_claim_id: "claim-does-not-exist" })
    expect(findDanglingClaimSupersessionReferences([claim])).toEqual([{ id: "claim-a", missingTargetId: "claim-does-not-exist" }])
  })

  it("passes a valid supersession pointer", () => {
    const oldSource = makeSource({ source_id: "src-old", superseded_by_source_id: "src-new" })
    const newSource = makeSource({ source_id: "src-new" })
    expect(findDanglingSourceSupersessionReferences([oldSource, newSource])).toEqual([])
  })
})

describe("circular supersession detection", () => {
  it("FAILS a two-node circular source supersession chain", () => {
    const a = makeSource({ source_id: "src-a", superseded_by_source_id: "src-b" })
    const b = makeSource({ source_id: "src-b", superseded_by_source_id: "src-a" })
    const cycles = findCircularSourceSupersessionChains([a, b])
    expect(cycles.length).toBe(1)
    expect(cycles[0]).toContain("src-a")
    expect(cycles[0]).toContain("src-b")
  })

  it("FAILS a self-referential claim supersession", () => {
    const a = makeClaim({ claim_id: "claim-a", superseded_by_claim_id: "claim-a" })
    const cycles = findCircularClaimSupersessionChains([a])
    expect(cycles).toEqual([["claim-a", "claim-a"]])
  })

  it("finds no cycles in a clean linear supersession chain", () => {
    const a = makeSource({ source_id: "src-1", superseded_by_source_id: "src-2" })
    const b = makeSource({ source_id: "src-2", superseded_by_source_id: "src-3" })
    const c = makeSource({ source_id: "src-3" })
    expect(findCircularSourceSupersessionChains([a, b, c])).toEqual([])
  })
})

describe("decay reporting", () => {
  it("reports a claim as due for review once its review_due_at has arrived", () => {
    const claim = makeClaim({ review_due_at: "2026-01-01" })
    expect(findClaimsDueForReview([claim], new Date("2026-06-01"))).toEqual(["claim-a"])
    expect(findClaimsDueForReview([claim], new Date("2025-06-01"))).toEqual([])
  })

  it("reports a source as due for verification when it is primary support for a due claim", () => {
    const source = makeSource()
    const claim = makeClaim({ review_due_at: "2026-01-01" })
    expect(findSourcesDueForVerification([source], [claim], new Date("2026-06-01"))).toEqual(["src-a"])
  })
})

describe("buildDependencyAuditReport / isReportClean", () => {
  it("PASSES (clean report) for a fully valid, current source + properly scoped claim + topic + packet", () => {
    const source = makeSource({ status: "current" })
    const claim = makeClaim({ review_due_at: "2099-01-01" })
    const topic = makeTopic()
    const packet = makePacket([source], [claim])

    const report = buildDependencyAuditReport([source], [claim], [topic], [packet], new Date("2026-01-01"))
    expect(isReportClean(report)).toBe(true)
    expect(report.claimsDueForReview).toEqual([])
  })

  it("FAILS (dirty report) once the sole source is retracted", () => {
    const source = makeSource({ status: "retracted" })
    const claim = makeClaim()
    const topic = makeTopic()
    const packet = makePacket([makeSource({ status: "current" })], [claim])

    const report = buildDependencyAuditReport([source], [claim], [topic], [packet], new Date("2026-01-01"))
    expect(isReportClean(report)).toBe(false)
    expect(report.claimsWithoutCurrentSupport).toContain("claim-a")
  })
})

describe("real registries: end-to-end audit produces a clean report", () => {
  it("the seeded content/sources|claims|topics|evidence-packets registries produce a clean dependency report", async () => {
    const { loadSources } = await import("@/lib/source-registry")
    const { loadClaims } = await import("@/lib/claim-registry")
    const { loadTopics } = await import("@/lib/topic-registry")
    const { loadPackets } = await import("@/lib/evidence-packet-registry")

    const sources = loadSources()
    const claims = loadClaims(sources)
    const topics = loadTopics(claims)
    const packets = loadPackets(topics, claims)

    const report = buildDependencyAuditReport(sources, claims, topics, packets, new Date("2026-08-09"))
    expect(isReportClean(report), JSON.stringify(report, null, 2)).toBe(true)
  })
})
