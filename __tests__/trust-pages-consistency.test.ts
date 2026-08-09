import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"

function readPage(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8")
}

const about = readPage("app/about/page.tsx")
const editorialPolicy = readPage("app/editorial-policy/page.tsx")
const medicalReview = readPage("app/medical-review/page.tsx")
const howWeCreateContent = readPage("app/how-we-create-content/page.tsx")
const medicalDisclaimer = readPage("app/medical-disclaimer/page.tsx")

// Issue #15: About, Editorial Policy, Medical Review, and How We Create
// Content previously contradicted each other and the actual data — most
// seriously, Medical Review and How We Create Content described a
// rigorous, already-operating licensed medical review process with
// per-article footer review dates, while no article had any reviewer,
// credential, or review date recorded anywhere, and no footer UI existed
// at all. These tests lock in the corrected, truthful state and catch a
// regression back to overclaiming.
describe("trust/policy page consistency (Issue #15)", () => {
  it("About and Medical Review agree that no licensed clinical reviewer program currently exists", () => {
    const SHARED_TRUTH = "does not currently include licensed medical professionals"
    expect(about).toContain(SHARED_TRUTH)
    expect(medicalReview).toContain(SHARED_TRUTH)
  })

  it("Medical Review states its current status plainly, via a data-driven, non-hand-written count", () => {
    expect(medicalReview).toContain("Current Status")
    expect(medicalReview).toContain("stats.unreviewedCount")
  })

  it("Editorial Policy no longer claims review dates are unconditionally shown in an article footer", () => {
    expect(editorialPolicy).not.toContain("Review dates are shown in the article footer")
  })

  it("Medical Review no longer claims a footer review date reflects an actual review that may not exist", () => {
    expect(medicalReview).not.toContain(
      "The review date shown in each article footer reflects the most recent medical review",
    )
  })

  it("Medical Review no longer claims clinical content already receives review on a present-tense, unconditional basis", () => {
    // The old text asserted medications are "reviewed on an annual basis at minimum" as a
    // present-tense fact about what already happens. The corrected text frames this as a
    // target applied once a first review is complete.
    expect(medicalReview).not.toMatch(/are reviewed on an annual basis at minimum/)
  })

  it("How We Create Content no longer unconditionally claims sources are listed on every clinical article", () => {
    expect(howWeCreateContent).not.toContain("Sources are listed at the end of every clinical article.")
  })

  it("How We Create Content no longer unconditionally claims every relevant article already carries a disclaimer", () => {
    expect(howWeCreateContent).not.toContain(
      "All articles covering medications, clinical conditions, or health decisions include this disclaimer",
    )
  })

  it("How We Create Content's review-process section points readers to the real per-article review status", () => {
    expect(howWeCreateContent).toContain("Content Review Status")
  })

  it("no policy page claims a medical advisory panel or licensed clinician review program exists", () => {
    for (const [name, text] of [
      ["about", about],
      ["editorial-policy", editorialPolicy],
      ["medical-review", medicalReview],
      ["how-we-create-content", howWeCreateContent],
    ] as const) {
      expect(text.toLowerCase(), `${name} should not claim a medical advisory panel`).not.toMatch(
        /medical advisory panel/,
      )
    }
  })

  it("Medical Disclaimer remains a liability disclaimer only — it never claims a review process occurred", () => {
    expect(medicalDisclaimer.toLowerCase()).not.toMatch(/reviewed by|medical review process|licensed reviewer/)
  })
})

// Issue #26 closure: Stage 2A materially rewrote Medical Review, Editorial
// Policy, and How We Create Content, but all three still displayed the
// stale `lastUpdated="June 2025"` value from before those rewrites. These
// tests pin the corrected date and prevent a future edit to these three
// specific files from silently reintroducing the known-stale value —
// this is intentionally narrow to these three pages, not a blanket rule
// requiring every page's lastUpdated to track git history.
describe("stale trust-page update dates (Issue #26)", () => {
  const materiallyRevisedPages = {
    "editorial-policy": editorialPolicy,
    "medical-review": medicalReview,
    "how-we-create-content": howWeCreateContent,
  }

  for (const [name, text] of Object.entries(materiallyRevisedPages)) {
    it(`${name} no longer displays the known-stale "June 2025" lastUpdated value`, () => {
      expect(text).not.toContain('lastUpdated="June 2025"')
    })

    it(`${name} displays a truthful Stage 2A/closure update date`, () => {
      expect(text).toContain('lastUpdated="August 2026"')
    })
  }
})

// Issue #26 closure: residual current-state overclaims. Stage 2A already
// distinguished "current verified state" from "V5 standard/target" in
// several places, but a few corpus-wide absolutes and one contradictory
// metadata description survived. These tests lock in the corrected text.
describe("residual current-state overclaims removed (Issue #26)", () => {
  it("Medical Review's metadata no longer implies an already-operating pre-publication review gate", () => {
    expect(medicalReview).not.toContain(
      "How WeightLiteracy.org reviews clinical content before publication and keeps it current",
    )
  })

  it("How We Create Content frames corpus-wide sourcing claims as the V5 standard, not an unconditional current fact", () => {
    expect(howWeCreateContent).toContain("Our V5 editorial standard")
    expect(howWeCreateContent).not.toMatch(/^\s*Every factual claim in a published article is either:/m)
  })

  it("How We Create Content names a specific, concrete example of the legacy corpus not yet meeting the sourcing standard", () => {
    expect(howWeCreateContent.toLowerCase()).toMatch(/set point theory/)
  })

  it("Editorial Policy frames medical-claims requirements as the V5 standard being audited against, not a completed fact", () => {
    expect(editorialPolicy).toContain("Our V5 editorial standard requires")
    expect(editorialPolicy.toLowerCase()).toMatch(/actively\s+auditing\s+our\s+existing\s+published\s+corpus/)
  })

  it("Medical Review's current status is computed from the real registries, not a hand-written sentence", () => {
    expect(medicalReview).toContain("getReviewRegistryStats")
    expect(medicalReview).toContain("stats.unreviewedCount")
  })
})
