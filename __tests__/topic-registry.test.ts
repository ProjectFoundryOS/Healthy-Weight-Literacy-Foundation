import { describe, it, expect } from "vitest"
import { validateTopicRecord, findDuplicateTopicIds, loadTopics, type TopicRecord } from "@/lib/topic-registry"
import { loadClaims, type ClaimRecord } from "@/lib/claim-registry"
import { loadSources } from "@/lib/source-registry"

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

describe("validateTopicRecord", () => {
  it("PASSES a topic whose required claims all exist", () => {
    const { valid, errors } = validateTopicRecord(makeTopic(), [makeClaim()])
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS a topic referencing an unknown required claim_id (negative test required by Issue #16)", () => {
    const { valid, errors } = validateTopicRecord(makeTopic({ required_claim_ids: ["claim-does-not-exist"] }), [])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown claim_id/)
  })

  it("FAILS a topic referencing an unknown optional claim_id", () => {
    const { valid, errors } = validateTopicRecord(makeTopic({ optional_claim_ids: ["claim-nope"] }), [makeClaim()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/optional_claim_ids references unknown/)
  })

  it("FAILS an evidence_ready topic with zero required claims", () => {
    const { valid, errors } = validateTopicRecord(makeTopic({ status: "evidence_ready", required_claim_ids: [] }), [])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/requires at least one required_claim_id/)
  })

  it("allows a research-stage topic to have zero required claims (still gathering evidence)", () => {
    const { valid } = validateTopicRecord(makeTopic({ status: "research", required_claim_ids: [] }), [])
    expect(valid).toBe(true)
  })

  it("FAILS an unknown reader_stage", () => {
    const record = { ...makeTopic(), reader_stage: "curiosity" } as unknown as TopicRecord
    const { valid, errors } = validateTopicRecord(record, [makeClaim()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown reader_stage/)
  })

  it("FAILS an unknown status", () => {
    const record = { ...makeTopic(), status: "published" } as unknown as TopicRecord
    const { valid, errors } = validateTopicRecord(record, [makeClaim()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown status/)
  })

  it("FAILS query_evidence represented as measured data with no source or measured_at (negative test required by Issue #16)", () => {
    const record = makeTopic({
      query_evidence: [{ query: "how much water should I drink", source: "", measurement_type: "", value: 10, measured_at: "" }],
    })
    const { valid, errors } = validateTopicRecord(record, [makeClaim()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/missing source/)
    expect(errors.join(" ")).toMatch(/missing or invalid measured_at/)
  })

  it("FAILS query_evidence with an impossible calendar measured_at date (Issue #27)", () => {
    const record = makeTopic({
      query_evidence: [
        { query: "q", source: "Google Keyword Planner", measurement_type: "search volume", value: 100, measured_at: "2026-02-31" },
      ],
    })
    const { valid, errors } = validateTopicRecord(record, [makeClaim()])
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/measured_at/)
  })

  it("PASSES query_evidence that carries a real source, type, value, and measured_at", () => {
    const record = makeTopic({
      query_evidence: [
        {
          query: "how much water should I drink a day",
          source: "Google Keyword Planner",
          measurement_type: "average monthly search volume",
          value: 12000,
          measured_at: "2026-06-01",
          geography: "United States",
        },
      ],
    })
    const { valid } = validateTopicRecord(record, [makeClaim()])
    expect(valid).toBe(true)
  })
})

describe("findDuplicateTopicIds", () => {
  it("FAILS registry validation by flagging a duplicate topic_id", () => {
    const records = [makeTopic({ topic_id: "dup" }), makeTopic({ topic_id: "dup" })]
    expect(findDuplicateTopicIds(records)).toEqual(["dup"])
  })
})

describe("real content/topics/registry.json", () => {
  it("loads and validates cleanly against the real claim registry", () => {
    const sources = loadSources()
    const claims = loadClaims(sources)
    const topics = loadTopics(claims)
    expect(topics.length).toBeGreaterThan(0)
    for (const t of topics) {
      const { valid, errors } = validateTopicRecord(t, claims)
      expect(valid, `${t.topic_id}: ${errors.join("; ")}`).toBe(true)
    }
  })

  it("has no duplicate topic_id values", () => {
    const sources = loadSources()
    const claims = loadClaims(sources)
    expect(findDuplicateTopicIds(loadTopics(claims))).toEqual([])
  })

  it("does not fabricate any query_evidence — the seed set has none (only qualitative notes)", () => {
    const sources = loadSources()
    const claims = loadClaims(sources)
    const topics = loadTopics(claims)
    for (const t of topics) {
      expect(t.query_evidence ?? [], t.topic_id).toEqual([])
    }
  })
})
