import { describe, it, expect } from "vitest"
import {
  validatePacketRecord,
  findDuplicatePacketIds,
  loadPackets,
  computeRegistryRevisionHash,
  isPacketStale,
  type ArticleEvidencePacket,
} from "@/lib/evidence-packet-registry"
import { loadClaims, type ClaimRecord } from "@/lib/claim-registry"
import { loadSources } from "@/lib/source-registry"
import { loadTopics, type TopicRecord } from "@/lib/topic-registry"

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
    ...overrides,
  }
}

function makeTopic(overrides: Partial<TopicRecord> = {}): TopicRecord {
  return {
    topic_id: "topic-1",
    canonical_question: "Example question?",
    reader_intent: "Understand something.",
    reader_stage: "understanding",
    cluster: "example-cluster",
    target_reader: "A general adult reader.",
    desired_reader_outcome: "Reader understands the thing.",
    ymyl_class: "low",
    medical_risk: "low",
    decay_class: "clinical_efficacy",
    required_claim_ids: ["claim-x"],
    status: "evidence_ready",
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
    prohibited_claims: [],
    allowed_conclusions: [],
    uncertainty_notes: [],
    related_articles: [],
    generated_at: "2026-01-01",
    source_registry_revision: "hash-a",
    claim_registry_revision: "hash-b",
    ...overrides,
  }
}

describe("validatePacketRecord", () => {
  it("PASSES a packet whose claims/sources/topic all resolve", () => {
    const { valid, errors } = validatePacketRecord(makePacket(), [makeTopic()], [makeClaim()])
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS a packet referencing an unknown topic_id", () => {
    const { valid, errors } = validatePacketRecord(makePacket({ topic_id: "topic-nope" }), [], [makeClaim()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown topic_id/)
  })

  it("FAILS a packet referencing an unknown claim_id in approved_claim_ids", () => {
    const { valid, errors } = validatePacketRecord(
      makePacket({ approved_claim_ids: ["claim-nope"], mandatory_claim_ids: ["claim-nope"] }),
      [makeTopic({ required_claim_ids: [] })],
      [],
    )
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown claim_id/)
  })

  it("FAILS a packet that references a superseded claim (negative test required by Issue #16)", () => {
    const superseded = makeClaim({ classification: "superseded" })
    const { valid, errors } = validatePacketRecord(makePacket(), [makeTopic()], [superseded])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/superseded/)
  })

  it("FAILS a packet missing a source_id required by one of its approved claims", () => {
    const claim = makeClaim({ source_ids: ["src-a", "src-b"] })
    const { valid, errors } = validatePacketRecord(makePacket({ source_ids: ["src-a"] }), [makeTopic()], [claim])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/source_ids is missing "src-b"/)
  })

  it("FAILS a packet that drops a claim its own topic requires", () => {
    const topic = makeTopic({ required_claim_ids: ["claim-x", "claim-y"] })
    const claims = [makeClaim({ claim_id: "claim-x" }), makeClaim({ claim_id: "claim-y" })]
    const { valid, errors } = validatePacketRecord(makePacket({ mandatory_claim_ids: ["claim-x"] }), [topic], claims)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/requires claim_id "claim-y"/)
  })

  it("FAILS a mandatory claim not present in approved_claim_ids", () => {
    const { valid, errors } = validatePacketRecord(
      makePacket({ approved_claim_ids: [], mandatory_claim_ids: ["claim-x"] }),
      [makeTopic({ required_claim_ids: [] })],
      [makeClaim()],
    )
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/mandatory or optional but not present in approved_claim_ids/)
  })
})

describe("findDuplicatePacketIds", () => {
  it("FAILS registry validation by flagging a duplicate packet_id", () => {
    const records = [makePacket({ packet_id: "dup" }), makePacket({ packet_id: "dup" })]
    expect(findDuplicatePacketIds(records)).toEqual(["dup"])
  })
})

describe("computeRegistryRevisionHash / isPacketStale", () => {
  it("produces the same hash for the same records regardless of array order", () => {
    const a = [makeClaim({ claim_id: "1" }), makeClaim({ claim_id: "2" })]
    const b = [makeClaim({ claim_id: "2" }), makeClaim({ claim_id: "1" })]
    expect(computeRegistryRevisionHash(a)).toBe(computeRegistryRevisionHash(b))
  })

  it("produces a different hash when a record changes", () => {
    const a = [makeClaim({ claim_id: "1" })]
    const b = [makeClaim({ claim_id: "1", classification: "superseded" })]
    expect(computeRegistryRevisionHash(a)).not.toBe(computeRegistryRevisionHash(b))
  })

  it("isPacketStale is FAIL/true once the live claim registry no longer matches the packet's frozen hash (retraction/supersession safety)", () => {
    const sources = [{ source_id: "src-a" } as never]
    const originalClaims = [makeClaim()]
    const packet = makePacket({
      source_registry_revision: computeRegistryRevisionHash(sources),
      claim_registry_revision: computeRegistryRevisionHash(originalClaims),
    })
    expect(isPacketStale(packet, sources, originalClaims)).toBe(false)

    const changedClaims = [makeClaim({ classification: "superseded" })]
    expect(isPacketStale(packet, sources, changedClaims)).toBe(true)
  })
})

describe("real content/evidence-packets/registry.json", () => {
  it("loads and validates cleanly against the real topic/claim registries", () => {
    const sources = loadSources()
    const claims = loadClaims(sources)
    const topics = loadTopics(claims)
    const packets = loadPackets(topics, claims)
    expect(packets.length).toBeGreaterThan(0)
    for (const p of packets) {
      const { valid, errors } = validatePacketRecord(p, topics, claims)
      expect(valid, `${p.packet_id}: ${errors.join("; ")}`).toBe(true)
    }
  })

  it("has no duplicate packet_id values", () => {
    const sources = loadSources()
    const claims = loadClaims(sources)
    const topics = loadTopics(claims)
    expect(findDuplicatePacketIds(loadPackets(topics, claims))).toEqual([])
  })

  it("every real packet is currently NOT stale against the live registries it was generated from", () => {
    const sources = loadSources()
    const claims = loadClaims(sources)
    const topics = loadTopics(claims)
    const packets = loadPackets(topics, claims)
    for (const p of packets) {
      expect(isPacketStale(p, sources, claims), p.packet_id).toBe(false)
    }
  })
})
