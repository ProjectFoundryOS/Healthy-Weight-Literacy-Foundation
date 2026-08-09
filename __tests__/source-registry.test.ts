import { describe, it, expect } from "vitest"
import { validateSourceRecord, findDuplicateSourceIds, loadSources, isAtLeastTier, type SourceRecord } from "@/lib/source-registry"

function makeSource(overrides: Partial<SourceRecord> = {}): SourceRecord {
  return {
    source_id: "src-1",
    title: "Example Title",
    publisher_or_journal: "Example Journal",
    publication_date: "2020-01-01",
    source_type: "peer_reviewed_RCT",
    canonical_url: "https://pubmed.ncbi.nlm.nih.gov/00000000/",
    pmid: "00000000",
    retrieved_at: "2026-01-01",
    trust_tier: "A",
    status: "current",
    topics: ["example-topic"],
    verification: {
      url_checked: true,
      identifier_checked: true,
      title_matched: true,
      publication_metadata_matched: true,
      verified_at: "2026-01-01",
      verification_method: "Direct WebFetch of the PubMed abstract page.",
    },
    ...overrides,
  }
}

describe("validateSourceRecord", () => {
  it("PASSES a properly verified source", () => {
    const { valid, errors } = validateSourceRecord(makeSource())
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS when verification.url_checked is not true — a URL existing is not proof it was checked", () => {
    const { valid, errors } = validateSourceRecord(
      makeSource({ verification: { ...makeSource().verification, url_checked: false } }),
    )
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/url_checked/)
  })

  it("FAILS when a durable identifier is present but identifier_checked is not true", () => {
    const { valid, errors } = validateSourceRecord(
      makeSource({ verification: { ...makeSource().verification, identifier_checked: false } }),
    )
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/identifier_checked/)
  })

  it("FAILS an unknown source_type", () => {
    const record = { ...makeSource(), source_type: "blog_post" } as unknown as SourceRecord
    const { valid, errors } = validateSourceRecord(record)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown source_type/)
  })

  it("FAILS an unknown trust_tier", () => {
    const record = { ...makeSource(), trust_tier: "E" } as unknown as SourceRecord
    const { valid, errors } = validateSourceRecord(record)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown trust_tier/)
  })

  it("FAILS an unknown status", () => {
    const record = { ...makeSource(), status: "archived" } as unknown as SourceRecord
    const { valid, errors } = validateSourceRecord(record)
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/unknown status/)
  })

  it("FAILS an impossible calendar publication_date (Issue #27)", () => {
    const { valid, errors } = validateSourceRecord(makeSource({ publication_date: "2020-02-31" }))
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/publication_date/)
  })

  it("FAILS when retrieved_at predates publication_date", () => {
    const { valid, errors } = validateSourceRecord(
      makeSource({ publication_date: "2026-06-01", retrieved_at: "2020-01-01" }),
    )
    expect(valid).toBe(false)
    expect(errors.join(" ")).toMatch(/retrieved_at cannot be earlier/)
  })
})

describe("findDuplicateSourceIds", () => {
  it("FAILS registry validation by flagging a duplicate source_id", () => {
    const records = [makeSource({ source_id: "dup" }), makeSource({ source_id: "dup" })]
    expect(findDuplicateSourceIds(records)).toEqual(["dup"])
  })

  it("finds no duplicates in a clean list", () => {
    const records = [makeSource({ source_id: "a" }), makeSource({ source_id: "b" })]
    expect(findDuplicateSourceIds(records)).toEqual([])
  })
})

describe("isAtLeastTier", () => {
  it("A source counts as at least Tier B", () => {
    expect(isAtLeastTier("A", "B")).toBe(true)
  })
  it("a Tier C source does not count as at least Tier B", () => {
    expect(isAtLeastTier("C", "B")).toBe(false)
  })
})

describe("real content/sources/registry.json", () => {
  it("loads and validates cleanly with no fabricated/unverified records", () => {
    const sources = loadSources()
    expect(sources.length).toBeGreaterThan(0)
    for (const s of sources) {
      const { valid, errors } = validateSourceRecord(s)
      expect(valid, `${s.source_id}: ${errors.join("; ")}`).toBe(true)
    }
  })

  it("has no duplicate source_id values", () => {
    expect(findDuplicateSourceIds(loadSources())).toEqual([])
  })
})
