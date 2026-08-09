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

  it("Medical Review states its current status plainly, including a zero-reviews admission", () => {
    expect(medicalReview).toContain("Current Status")
    expect(medicalReview.toLowerCase()).toMatch(/no article in our published corpus has yet completed/)
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
