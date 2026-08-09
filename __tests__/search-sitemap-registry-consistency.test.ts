import { describe, it, expect } from "vitest"
import { existsSync } from "node:fs"
import path from "node:path"

// These tests exercise the real, committed content/snapshot (Issue #14).
// Until the Stage #14 snapshot exists on this branch, there is nothing to
// consume and the pure integrity logic is already covered by
// content-registry.test.ts against in-memory fixtures — so we skip rather
// than fail on a precondition this suite cannot create for itself (it must
// not fabricate production data).
const SNAPSHOT_MANIFEST = path.join(process.cwd(), "content", "snapshot", "manifest.json")
const hasSnapshot = existsSync(SNAPSHOT_MANIFEST)

describe.skipIf(!hasSnapshot)("search / sitemap / article-route registry consistency (Issue #23)", () => {
  it("search index blog entries match the content registry slug-for-slug", async () => {
    const { getBlogPosts } = await import("@/lib/content-registry")
    const { getSearchIndex } = await import("@/lib/search-index")

    const registrySlugs = new Set(getBlogPosts().map((p) => p.slug))
    const searchBlogSlugs = getSearchIndex()
      .filter((item) => item.type === "blog")
      .map((item) => item.slug)

    expect(searchBlogSlugs.length).toBe(registrySlugs.size)
    for (const slug of searchBlogSlugs) {
      expect(registrySlugs.has(slug)).toBe(true)
    }
  })

  it("sitemap article URLs match the content registry slug-for-slug", async () => {
    const { getBlogPosts } = await import("@/lib/content-registry")
    const sitemapModule = await import("@/app/sitemap")
    const entries = await sitemapModule.default()

    const registrySlugs = new Set(getBlogPosts().map((p) => p.slug))
    const sitemapBlogSlugs = entries
      .map((e) => e.url)
      .filter((url) => url.includes("/blog/"))
      .map((url) => url.split("/blog/")[1])

    expect(sitemapBlogSlugs.length).toBe(registrySlugs.size)
    for (const slug of sitemapBlogSlugs) {
      expect(registrySlugs.has(slug)).toBe(true)
    }
  })

  it("every registry article slug is a safe, resolvable route segment", async () => {
    const { getBlogPosts } = await import("@/lib/content-registry")
    for (const post of getBlogPosts()) {
      expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })
})

if (!hasSnapshot) {
  describe("search / sitemap / article-route registry consistency (Issue #23)", () => {
    it("is skipped pending the Stage #14 production snapshot commit", () => {
      expect(hasSnapshot).toBe(false)
    })
  })
}
