import { describe, it, expect } from "vitest"
import {
  validateArticleAuditRecord,
  findDuplicateAuditIds,
  findMissingAudits,
  loadArticleAudits,
  getArticleAudit,
  listAuditArticleFiles,
  type ArticleAuditRecord,
} from "@/lib/article-audit-registry"
import { loadClaims, type ClaimRecord } from "@/lib/claim-registry"
import { loadSources, type SourceRecord } from "@/lib/source-registry"
import { getManifestArticles, type ManifestArticleEntry } from "@/lib/content-registry"
import { loadCannibalizationClusters, getClusterIds } from "@/lib/cannibalization-registry"

function makeManifestEntry(overrides: Partial<ManifestArticleEntry> = {}): ManifestArticleEntry {
  return {
    slug: "example-slug",
    id: "id-1",
    is_published: true,
    published_at: "2025-01-01",
    updated_at: "2025-01-01",
    sha256: "hash-current",
    ...overrides,
  }
}

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

function makeAuditRecord(overrides: Partial<ArticleAuditRecord> = {}): ArticleAuditRecord {
  return {
    audit_id: "audit-example-slug",
    slug: "example-slug",
    snapshot_hash: "hash-current",
    audited_at: "2026-08-10",
    audit_version: "stage4-v1",
    title: "Example Article",
    category: "General",
    authorship: {
      current_visible_author: "Healthy Weight Literacy Foundation",
      author_type: "organization",
      consistency_issue: false,
    },
    primary_question: "What does this article help the reader do?",
    reader_intent: "Understand a topic.",
    reader_stage: "understanding",
    desired_reader_outcome: "Reader understands the topic.",
    ymyl_class: "low",
    medical_risk: "low",
    decay_class: "nutrition_physiology",
    claims: [],
    evidence_summary: {
      material_claim_count: 0,
      mapped_claim_count: 0,
      unsupported_count: 0,
      outdated_count: 0,
      overbroad_count: 0,
      high_or_critical_findings: 0,
    },
    scores: {
      reader_intent: 8,
      evidence_quality: 12,
      claim_traceability: 12,
      ymyl_safety: 12,
      freshness: 8,
      trust_integrity: 8,
      cannibalization_distinctness: 8,
      usefulness: 4,
      internal_linking: 3,
      ad_grant_fit: 4,
      total: 79,
    },
    cannibalization_cluster_ids: [],
    internal_link_recommendations: [],
    ad_grant_fit: "medium",
    disposition: "KEEP",
    disposition_reason: "Article is accurate, current, and distinct from the rest of the corpus.",
    rewrite_priority: "none",
    blocking_findings: [],
    required_research: [],
    recommended_rewrite_scope: [],
    safety_language_findings: [],
    evidence_registry_revision: {
      source_registry_revision: "rev-source-1",
      claim_registry_revision: "rev-claim-1",
    },
    ...overrides,
  }
}

describe("validateArticleAuditRecord", () => {
  it("PASSES a well-formed KEEP record with no blockers", () => {
    const record = makeAuditRecord()
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS a record referencing a slug not present in the manifest", () => {
    const record = makeAuditRecord({ slug: "does-not-exist" })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("unknown slug"))).toBe(true)
  })

  it("FAILS a record whose snapshot_hash no longer matches the live manifest (stale audit)", () => {
    const record = makeAuditRecord({ snapshot_hash: "hash-old" })
    const { valid, errors } = validateArticleAuditRecord(
      record,
      [makeManifestEntry({ sha256: "hash-new" })],
      [],
      [],
      new Set(),
    )
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("stale"))).toBe(true)
  })

  it("FAILS a record with an unknown disposition value", () => {
    const record = { ...makeAuditRecord(), disposition: "ARCHIVE" as unknown as ArticleAuditRecord["disposition"] }
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("unknown disposition"))).toBe(true)
  })

  it("FAILS a MERGE record with no merge_target_slug", () => {
    const record = makeAuditRecord({ disposition: "MERGE" })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('"MERGE" requires merge_target_slug'))).toBe(true)
  })

  it("PASSES a MERGE record that includes merge_target_slug", () => {
    const record = makeAuditRecord({ disposition: "MERGE", merge_target_slug: "survivor-slug" })
    const { valid } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(true)
  })

  it("FAILS a REDIRECT record with no redirect_target_slug", () => {
    const record = makeAuditRecord({ disposition: "REDIRECT" })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('"REDIRECT" requires redirect_target_slug'))).toBe(true)
  })

  it("FAILS a RETIRE record with no substantive disposition_reason", () => {
    const record = makeAuditRecord({ disposition: "RETIRE", disposition_reason: "bad" })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('"RETIRE" requires a substantive disposition_reason'))).toBe(true)
  })

  it("PASSES a RETIRE record with a substantive disposition_reason", () => {
    const record = makeAuditRecord({
      disposition: "RETIRE",
      disposition_reason: "Content is superseded by current guidance and no longer accurate enough to keep live.",
    })
    const { valid } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(true)
  })

  it("FAILS a KEEP record that has a non-empty blocking_findings array, regardless of score", () => {
    const record = makeAuditRecord({
      disposition: "KEEP",
      blocking_findings: ["Unresolved high-risk claim."],
      scores: { ...makeAuditRecord().scores, total: 95 },
    })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('"KEEP" is not allowed'))).toBe(true)
  })

  it("FAILS a KEEP record with an unresolved high-severity unsupported claim, even with a high total score", () => {
    const record = makeAuditRecord({
      disposition: "KEEP",
      scores: { ...makeAuditRecord().scores, total: 90 },
      claims: [
        {
          article_claim_id: "ac-1",
          proposition: "Unsupported high-risk medical claim.",
          claim_type: "efficacy",
          ymyl_risk: "high",
          mapping_status: "unsupported",
          article_location: "paragraph 2",
          severity: "high",
          recommended_action: "Remove or source this claim before republishing.",
        },
      ],
    })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('"KEEP" is not allowed'))).toBe(true)
  })

  it("PASSES a KEEP record whose claims are all resolved/low-severity even though some need semantic review", () => {
    const record = makeAuditRecord({
      disposition: "KEEP",
      claims: [
        {
          article_claim_id: "ac-1",
          proposition: "A claim worth a human semantic check.",
          claim_type: "efficacy",
          ymyl_risk: "low",
          mapping_status: "needs_semantic_review",
          article_location: "paragraph 2",
          severity: "low",
          recommended_action: "Have a reviewer confirm prose matches the cited claim exactly.",
        },
      ],
    })
    const { valid } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(true)
  })

  it("FAILS a claim referencing an unknown registry_claim_id", () => {
    const record = makeAuditRecord({
      claims: [
        {
          article_claim_id: "ac-1",
          proposition: "A claim.",
          claim_type: "efficacy",
          ymyl_risk: "low",
          mapping_status: "mapped_existing_claim",
          registry_claim_id: "claim-does-not-exist",
          article_location: "paragraph 1",
          severity: "info",
          recommended_action: "None.",
        },
      ],
    })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [makeClaim({ claim_id: "claim-real" })], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("unknown claim_id"))).toBe(true)
  })

  it('FAILS a claim with mapping_status "mapped_existing_claim" but no registry_claim_id', () => {
    const record = makeAuditRecord({
      claims: [
        {
          article_claim_id: "ac-1",
          proposition: "A claim.",
          claim_type: "efficacy",
          ymyl_risk: "low",
          mapping_status: "mapped_existing_claim",
          article_location: "paragraph 1",
          severity: "info",
          recommended_action: "None.",
        },
      ],
    })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('requires registry_claim_id'))).toBe(true)
  })

  it("FAILS a claim referencing an unknown source_id", () => {
    const record = makeAuditRecord({
      claims: [
        {
          article_claim_id: "ac-1",
          proposition: "A claim.",
          claim_type: "efficacy",
          ymyl_risk: "low",
          mapping_status: "new_verified_claim",
          source_ids: ["src-does-not-exist"],
          article_location: "paragraph 1",
          severity: "info",
          recommended_action: "None.",
        },
      ],
    })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [makeSource({ source_id: "src-real" })], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("unknown source_id"))).toBe(true)
  })

  it("FAILS a record referencing an unknown cannibalization cluster_id", () => {
    const record = makeAuditRecord({ cannibalization_cluster_ids: ["cluster-does-not-exist"] })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set(["cluster-real"]))
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("unknown cluster_id"))).toBe(true)
  })

  it("PASSES a record referencing a known cannibalization cluster_id", () => {
    const record = makeAuditRecord({ cannibalization_cluster_ids: ["cluster-real"] })
    const { valid } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set(["cluster-real"]))
    expect(valid).toBe(true)
  })

  it("FAILS a record whose scores.total does not equal the sum of its category scores", () => {
    const record = makeAuditRecord({ scores: { ...makeAuditRecord().scores, total: 999 } })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("does not equal the sum"))).toBe(true)
  })

  it("FAILS a record with a category score above its weight cap", () => {
    const record = makeAuditRecord({ scores: { ...makeAuditRecord().scores, reader_intent: 999 } })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("scores.reader_intent"))).toBe(true)
  })

  it("FAILS a record missing evidence_registry_revision hashes", () => {
    const record = makeAuditRecord({
      evidence_registry_revision: { source_registry_revision: "", claim_registry_revision: "" },
    })
    const { valid, errors } = validateArticleAuditRecord(record, [makeManifestEntry()], [], [], new Set())
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("source_registry_revision"))).toBe(true)
    expect(errors.some((e) => e.includes("claim_registry_revision"))).toBe(true)
  })
})

describe("findDuplicateAuditIds", () => {
  it("flags duplicate audit_id and duplicate slug independently", () => {
    const records = [
      makeAuditRecord({ audit_id: "audit-1", slug: "slug-a" }),
      makeAuditRecord({ audit_id: "audit-1", slug: "slug-b" }),
      makeAuditRecord({ audit_id: "audit-2", slug: "slug-a" }),
    ]
    const { duplicateAuditIds, duplicateSlugs } = findDuplicateAuditIds(records)
    expect(duplicateAuditIds).toEqual(["audit-1"])
    expect(duplicateSlugs).toEqual(["slug-a"])
  })

  it("returns empty arrays when there are no duplicates", () => {
    const records = [makeAuditRecord({ audit_id: "audit-1", slug: "slug-a" }), makeAuditRecord({ audit_id: "audit-2", slug: "slug-b" })]
    const { duplicateAuditIds, duplicateSlugs } = findDuplicateAuditIds(records)
    expect(duplicateAuditIds).toEqual([])
    expect(duplicateSlugs).toEqual([])
  })
})

describe("findMissingAudits", () => {
  it("flags a published manifest slug with no audit record", () => {
    const manifest = [makeManifestEntry({ slug: "audited" }), makeManifestEntry({ slug: "not-audited" })]
    const records = [makeAuditRecord({ slug: "audited" })]
    expect(findMissingAudits(manifest, records)).toEqual(["not-audited"])
  })

  it("does not flag an unpublished manifest entry with no audit record", () => {
    const manifest = [makeManifestEntry({ slug: "draft", is_published: false })]
    expect(findMissingAudits(manifest, [])).toEqual([])
  })
})

describe("real content/audits/stage4 registry", () => {
  it("loads and validates cleanly against the real manifest/claims/sources/clusters", () => {
    const manifestArticles = getManifestArticles()
    const sources = loadSources()
    const claims = loadClaims(sources)
    const clusters = loadCannibalizationClusters(manifestArticles)
    const clusterIds = getClusterIds(clusters)

    const audits = loadArticleAudits(manifestArticles, claims, sources, clusterIds)
    expect(audits.length).toBe(34)
    expect(findMissingAudits(manifestArticles, audits)).toEqual([])

    const { duplicateAuditIds, duplicateSlugs } = findDuplicateAuditIds(audits)
    expect(duplicateAuditIds).toEqual([])
    expect(duplicateSlugs).toEqual([])
  })

  it("has one audit JSON file per manifest entry, with no orphan files", () => {
    const manifestArticles = getManifestArticles()
    const files = listAuditArticleFiles()
    expect(files.length).toBe(manifestArticles.filter((a) => a.is_published).length)
  })

  it("getArticleAudit resolves a known slug and returns null for an unknown one", () => {
    const manifestArticles = getManifestArticles()
    const sources = loadSources()
    const claims = loadClaims(sources)
    const clusters = loadCannibalizationClusters(manifestArticles)
    const audits = loadArticleAudits(manifestArticles, claims, sources, getClusterIds(clusters))

    expect(getArticleAudit(audits, "understanding-healthy-weight")).not.toBeNull()
    expect(getArticleAudit(audits, "this-slug-does-not-exist")).toBeNull()
  })

  it("no real KEEP-disposition record has a non-empty blocking_findings array", () => {
    const manifestArticles = getManifestArticles()
    const sources = loadSources()
    const claims = loadClaims(sources)
    const clusters = loadCannibalizationClusters(manifestArticles)
    const audits = loadArticleAudits(manifestArticles, claims, sources, getClusterIds(clusters))

    for (const audit of audits) {
      if (audit.disposition === "KEEP") {
        expect(audit.blocking_findings).toEqual([])
      }
    }
  })
})
