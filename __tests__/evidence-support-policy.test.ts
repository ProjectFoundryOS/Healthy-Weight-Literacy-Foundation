import { describe, it, expect } from "vitest"
import {
  isActiveSourceStatus,
  isActiveSource,
  requiredActiveTierForRisk,
  hasQualifyingActivePrimarySupport,
  ACTIVE_SOURCE_STATUSES,
} from "@/lib/evidence-support-policy"
import type { SourceRecord, SourceStatus } from "@/lib/source-registry"

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

describe("Issue #28 closure item 6: single shared active-support policy", () => {
  it("ACTIVE_SOURCE_STATUSES is exactly current + corrected", () => {
    expect([...ACTIVE_SOURCE_STATUSES].sort()).toEqual(["corrected", "current"])
  })

  it.each<SourceStatus>(["current", "corrected"])("isActiveSourceStatus(%s) is true", (status) => {
    expect(isActiveSourceStatus(status)).toBe(true)
  })

  it.each<SourceStatus>(["superseded", "retracted", "unavailable"])(
    "isActiveSourceStatus(%s) is FAIL/false — a %s source must never satisfy current primary support",
    (status) => {
      expect(isActiveSourceStatus(status)).toBe(false)
    },
  )

  it("isActiveSource is false for a null/undefined source (unresolved reference)", () => {
    expect(isActiveSource(null)).toBe(false)
    expect(isActiveSource(undefined)).toBe(false)
  })

  it("requiredActiveTierForRisk requires Tier A for high and critical risk, Tier B otherwise", () => {
    expect(requiredActiveTierForRisk("critical")).toBe("A")
    expect(requiredActiveTierForRisk("high")).toBe("A")
    expect(requiredActiveTierForRisk("medium")).toBe("B")
    expect(requiredActiveTierForRisk("low")).toBe("B")
  })

  describe("hasQualifyingActivePrimarySupport — one negative test per non-current status", () => {
    it.each<SourceStatus>(["superseded", "retracted", "unavailable"])(
      "FAILS (false) when the only Tier A primary source has status %s",
      (status) => {
        const source = makeSource({ status, trust_tier: "A" })
        expect(hasQualifyingActivePrimarySupport(["src-a"], [source], "A")).toBe(false)
      },
    )

    it("PASSES (true) when the source is current and meets the tier", () => {
      const source = makeSource({ status: "current", trust_tier: "A" })
      expect(hasQualifyingActivePrimarySupport(["src-a"], [source], "A")).toBe(true)
    })

    it("PASSES (true) when the source is corrected and meets the tier — corrected is handled explicitly, not silently excluded", () => {
      const source = makeSource({ status: "corrected", trust_tier: "A" })
      expect(hasQualifyingActivePrimarySupport(["src-a"], [source], "A")).toBe(true)
    })

    it("FAILS (false) when the source_id does not resolve to any source at all", () => {
      expect(hasQualifyingActivePrimarySupport(["src-does-not-exist"], [], "B")).toBe(false)
    })

    it("FAILS (false) when the source is active but below the required tier", () => {
      const source = makeSource({ status: "current", trust_tier: "C" })
      expect(hasQualifyingActivePrimarySupport(["src-a"], [source], "A")).toBe(false)
    })
  })
})
