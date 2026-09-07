import { afterEach, describe, expect, it } from "vitest"
import { BuildContentIntegrityError, resolveBlogPosts, type BlogPost } from "@/lib/supabase-blog"
import type { ContentSnapshot } from "@/lib/content-snapshot"

function makePost(slug: string): BlogPost {
  return {
    id: slug,
    slug,
    title: `Title ${slug}`,
    description: "desc",
    author: "Author",
    author_image: "",
    author_title: null,
    author_bio: null,
    author_credentials: null,
    medical_reviewer: null,
    reviewer_credentials: null,
    reviewed_at: null,
    next_review_date: null,
    citations: null,
    has_medical_disclaimer: true,
    published_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
    hero_image: "",
    tags: [],
    category: "General",
    reading_time: "5 min",
    content: "content",
    is_published: true,
  }
}

const emptySnapshot: ContentSnapshot = { posts: [], manifest: null, integrityError: null }

function snapshotWith(posts: BlogPost[]): ContentSnapshot {
  return {
    posts,
    manifest: { generatedAt: "2026-01-01T00:00:00.000Z", count: posts.length, sha256: "deadbeef", sourceTable: "blog_posts" },
    integrityError: null,
  }
}

describe("resolveBlogPosts", () => {
  afterEach(() => {
    delete process.env.ALLOW_EMPTY_ARTICLE_BUILD
  })

  it("uses live data when the live fetch succeeds with posts", () => {
    const live = { ok: true as const, data: [makePost("a"), makePost("b")] }
    const result = resolveBlogPosts(live, emptySnapshot)

    expect(result.source).toBe("live")
    expect(result.posts).toHaveLength(2)
    expect(result.warnings).toEqual([])
  })

  it("falls back to the validated snapshot when the live fetch fails", () => {
    const live = { ok: false as const, reason: "network error: fetch failed" }
    const result = resolveBlogPosts(live, snapshotWith([makePost("a"), makePost("b"), makePost("c")]))

    expect(result.source).toBe("snapshot")
    expect(result.posts).toHaveLength(3)
    expect(result.warnings.join(" ")).toMatch(/network error: fetch failed/)
  })

  it("falls back to the validated snapshot when the live fetch succeeds but returns zero posts", () => {
    const live = { ok: true as const, data: [] }
    const result = resolveBlogPosts(live, snapshotWith([makePost("a")]))

    expect(result.source).toBe("snapshot")
    expect(result.posts).toHaveLength(1)
    expect(result.warnings.join(" ")).toMatch(/zero published posts/)
  })

  it("fails the build closed when the live fetch fails and there is no snapshot", () => {
    const live = { ok: false as const, reason: "network error: fetch failed" }

    expect(() => resolveBlogPosts(live, emptySnapshot)).toThrow(BuildContentIntegrityError)
  })

  it("fails the build closed when live returns zero posts and the snapshot is also empty", () => {
    const live = { ok: true as const, data: [] }

    expect(() => resolveBlogPosts(live, emptySnapshot)).toThrow(BuildContentIntegrityError)
  })

  it("never returns an empty result silently without throwing or an explicit override", () => {
    const live = { ok: true as const, data: [] }

    let threw = false
    try {
      resolveBlogPosts(live, emptySnapshot)
    } catch (err) {
      threw = true
      expect(err).toBeInstanceOf(BuildContentIntegrityError)
    }
    expect(threw).toBe(true)
  })

  it("respects ALLOW_EMPTY_ARTICLE_BUILD=true as an explicit escape hatch", () => {
    process.env.ALLOW_EMPTY_ARTICLE_BUILD = "true"
    const live = { ok: true as const, data: [] }

    const result = resolveBlogPosts(live, emptySnapshot)

    expect(result.posts).toEqual([])
    expect(result.warnings.join(" ")).toMatch(/ALLOW_EMPTY_ARTICLE_BUILD/)
  })

  it("warns (but still uses live data) when live returns fewer posts than the validated snapshot", () => {
    const live = { ok: true as const, data: [makePost("a")] }
    const result = resolveBlogPosts(live, snapshotWith([makePost("a"), makePost("b"), makePost("c")]))

    expect(result.source).toBe("live")
    expect(result.warnings.join(" ")).toMatch(/fewer than the validated snapshot/)
  })

  it("surfaces a snapshot integrity error as a warning without trusting its contents", () => {
    const live = { ok: false as const, reason: "network error: fetch failed" }
    const corrupted: ContentSnapshot = { posts: [], manifest: null, integrityError: "Content snapshot rejected: tampered." }

    expect(() => resolveBlogPosts(live, corrupted)).toThrow(BuildContentIntegrityError)
  })
})
