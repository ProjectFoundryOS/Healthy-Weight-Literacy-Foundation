import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"
import { isLegacyHtml, normalizeToMarkdown } from "@/lib/content-normalize"

// Issue #24 named two specific slugs as observed production crash examples:
// `/blog/understanding-telehealth-weight-management-guide` and
// `/blog/understanding-online-prescriptions-safety-best-practices`
// (ERR_REQUIRE_ESM via isomorphic-dompurify -> jsdom -> html-encoding-sniffer
// -> @exodus/bytes). Both rows are currently unpublished in production (a
// prior stopgap mitigation, discovered during the Stage #14 all-rows
// reconciliation read — see handoff), so they are correctly absent from the
// live content registry and are not reachable at /blog/<slug> right now.
//
// This fixture freezes their exact article content (extracted once via a
// read-only, --all Supabase read; no write was made) so the fix can be
// regression-tested against the exact content that caused the original
// crash, independent of whether/when the articles are ever republished.
const FIXTURE_PATH = path.join(process.cwd(), "__tests__", "fixtures", "issue-24-known-affected-articles.json")
const fixtures = JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as Record<string, { slug: string; content: string }>

describe("Issue #24 known-affected article content", () => {
  it("has fixtures for both named slugs", () => {
    expect(Object.keys(fixtures).sort()).toEqual(
      [
        "understanding-online-prescriptions-safety-best-practices",
        "understanding-telehealth-weight-management-guide",
      ].sort(),
    )
  })

  for (const slug of Object.keys(fixtures)) {
    it(`normalizes "${slug}" to safe Markdown with no residual HTML/script constructs`, () => {
      const { content } = fixtures[slug]
      const normalized = normalizeToMarkdown(content)

      expect(isLegacyHtml(normalized)).toBe(false)
      expect(normalized).not.toMatch(/<script|<iframe|<object|<embed|on[a-z]+\s*=/i)
      expect(normalized.length).toBeGreaterThan(0)
    })
  }
})
