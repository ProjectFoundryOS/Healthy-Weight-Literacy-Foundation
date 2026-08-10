import { describe, it, expect } from "vitest"
import {
  validateUnpublishedRowAudit,
  findDuplicateUnpublishedSlugs,
  loadUnpublishedRowAudits,
  type UnpublishedRowAudit,
} from "@/lib/unpublished-audit-registry"

function makeRow(overrides: Partial<UnpublishedRowAudit> = {}): UnpublishedRowAudit {
  return {
    slug: "example-unpublished-slug",
    category: "Telehealth Education",
    content_sha256: "a".repeat(64),
    is_published: false,
    inspected_at: "2026-08-10",
    disposition: "REPUBLISH_AFTER_REFRESH",
    reason: "Reasonable draft that needs a sourcing refresh before republishing.",
    ...overrides,
  }
}

describe("validateUnpublishedRowAudit", () => {
  it("PASSES a well-formed row", () => {
    const { valid, errors } = validateUnpublishedRowAudit(makeRow())
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS a row missing slug/category/content_sha256/reason", () => {
    const row = { ...makeRow(), slug: "", category: "", content_sha256: "", reason: "" }
    const { valid, errors } = validateUnpublishedRowAudit(row)
    expect(valid).toBe(false)
    expect(errors).toEqual(
      expect.arrayContaining(["missing slug", "missing category", "missing content_sha256", "missing reason"]),
    )
  })

  it("FAILS a row where is_published is not exactly false", () => {
    const row = { ...makeRow(), is_published: true as unknown as false }
    const { valid, errors } = validateUnpublishedRowAudit(row)
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("is_published must be exactly false"))).toBe(true)
  })

  it("FAILS a row with an invalid inspected_at date", () => {
    const { valid, errors } = validateUnpublishedRowAudit(makeRow({ inspected_at: "not-a-date" }))
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("inspected_at"))).toBe(true)
  })

  it("FAILS a row with an unknown disposition", () => {
    const row = { ...makeRow(), disposition: "DELETE" as unknown as UnpublishedRowAudit["disposition"] }
    const { valid, errors } = validateUnpublishedRowAudit(row)
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("unknown disposition"))).toBe(true)
  })

  it('FAILS a "MERGE" row with no overlap_target_slug', () => {
    const { valid, errors } = validateUnpublishedRowAudit(makeRow({ disposition: "MERGE" }))
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('"MERGE" requires overlap_target_slug'))).toBe(true)
  })

  it('FAILS a "REDIRECT" row with no overlap_target_slug', () => {
    const { valid, errors } = validateUnpublishedRowAudit(makeRow({ disposition: "REDIRECT" }))
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('"REDIRECT" requires overlap_target_slug'))).toBe(true)
  })

  it('PASSES a "MERGE" row that includes overlap_target_slug', () => {
    const { valid } = validateUnpublishedRowAudit(makeRow({ disposition: "MERGE", overlap_target_slug: "some-live-slug" }))
    expect(valid).toBe(true)
  })

  it("PASSES a KEEP_UNPUBLISHED row with no overlap_target_slug", () => {
    const { valid } = validateUnpublishedRowAudit(makeRow({ disposition: "KEEP_UNPUBLISHED" }))
    expect(valid).toBe(true)
  })

  it("never carries a title or body field on its type (privacy contract)", () => {
    const row = makeRow()
    expect("title" in row).toBe(false)
    expect("content" in row).toBe(false)
    expect("body" in row).toBe(false)
  })
})

describe("findDuplicateUnpublishedSlugs", () => {
  it("flags a duplicate slug", () => {
    const rows = [makeRow({ slug: "a" }), makeRow({ slug: "a" }), makeRow({ slug: "b" })]
    expect(findDuplicateUnpublishedSlugs(rows)).toEqual(["a"])
  })

  it("returns empty when slugs are unique", () => {
    const rows = [makeRow({ slug: "a" }), makeRow({ slug: "b" })]
    expect(findDuplicateUnpublishedSlugs(rows)).toEqual([])
  })
})

describe("real content/audits/stage4/unpublished-summary.json", () => {
  it("loads and validates cleanly, with exactly 5 rows and no duplicates", () => {
    const rows = loadUnpublishedRowAudits()
    expect(rows.length).toBe(5)
    expect(findDuplicateUnpublishedSlugs(rows)).toEqual([])

    for (const row of rows) {
      const { valid, errors } = validateUnpublishedRowAudit(row)
      expect(valid, `${row.slug}: ${errors.join("; ")}`).toBe(true)
    }
  })

  it("every real row is_published is exactly false", () => {
    const rows = loadUnpublishedRowAudits()
    for (const row of rows) {
      expect(row.is_published).toBe(false)
    }
  })

  it("no real row carries a title, content, or body field (privacy contract)", () => {
    const rows = loadUnpublishedRowAudits() as unknown as Record<string, unknown>[]
    for (const row of rows) {
      expect("title" in row).toBe(false)
      expect("content" in row).toBe(false)
      expect("body" in row).toBe(false)
      expect("draft_body" in row).toBe(false)
    }
  })

  it("every content_sha256 is a real 64-character hex sha256 digest", () => {
    const rows = loadUnpublishedRowAudits()
    for (const row of rows) {
      expect(row.content_sha256).toMatch(/^[0-9a-f]{64}$/)
    }
  })
})
