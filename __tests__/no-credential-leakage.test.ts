import { describe, it, expect } from "vitest"
import { programs, resources } from "@/lib/mdx"

// Issue #15: lib/mdx.ts previously shipped a stale sample blog corpus with
// unverifiable credentialed identities ("Dr. Sarah Johnson", "Maria Chen,
// RD", "James Wilson, MPH") that fed the client-side search index and could
// surface alongside (and disagree with) the real Supabase-backed blog. The
// entire sample blog array was removed; this test locks that removal in and
// extends the same check to the remaining static Program/Resource content,
// which also shipped one fabricated credentialed identity
// ("Dr. Emily Roberts, PhD" on the mindful-eating-workbook resource).
const FABRICATED_IDENTITY_PATTERN = /\bDr\.\s|,\s*(MD|RD|RN|DO|MPH|PhD|NP)\b/

describe("no fabricated credentialed identities in user-facing content (Issue #15)", () => {
  it("lib/mdx.ts no longer exports a sample blog corpus", async () => {
    const mdxModule = await import("@/lib/mdx")
    expect((mdxModule as Record<string, unknown>).blogPosts).toBeUndefined()
    expect((mdxModule as Record<string, unknown>).getBlogPosts).toBeUndefined()
    expect((mdxModule as Record<string, unknown>).getBlogPost).toBeUndefined()
    expect((mdxModule as Record<string, unknown>).getRelatedPosts).toBeUndefined()
  })

  it("no Program author-like field carries a fabricated credentialed identity", () => {
    for (const program of programs) {
      const haystack = `${program.title} ${program.description}`
      expect(haystack).not.toMatch(FABRICATED_IDENTITY_PATTERN)
    }
  })

  it("no Resource author carries a fabricated credentialed identity", () => {
    for (const resource of resources) {
      expect(resource.author).not.toMatch(FABRICATED_IDENTITY_PATTERN)
    }
  })

  it("known removed sample identities do not appear anywhere in static content modules", async () => {
    const mdxModule = await import("@/lib/mdx")
    const serialized = JSON.stringify(mdxModule)
    for (const name of ["Dr. Sarah Johnson", "Maria Chen, RD", "James Wilson, MPH", "Dr. Emily Roberts"]) {
      expect(serialized).not.toContain(name)
    }
  })
})
