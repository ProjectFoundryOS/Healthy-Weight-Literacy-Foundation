import { describe, it, expect } from "vitest"
import { createHash } from "node:crypto"
import { buildRegistryFromManifest, type Manifest, type ManifestArticleEntry } from "@/lib/content-registry"
import type { BlogPost } from "@/lib/supabase-blog"

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: "1",
    slug: "sample-article",
    title: "Sample Article",
    description: "A sample article for tests.",
    author: "Healthy Weight Literacy Foundation Editorial Team",
    author_image: "",
    author_title: null,
    author_bio: null,
    author_credentials: null,
    medical_reviewer: null,
    reviewer_credentials: null,
    reviewed_at: null,
    next_review_date: null,
    citations: null,
    has_medical_disclaimer: false,
    published_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    created_at: "2025-01-01T00:00:00.000Z",
    hero_image: "",
    tags: ["education"],
    category: "Education",
    reading_time: "5 min read",
    content: "# Sample\n\nBody text.",
    is_published: true,
    ...overrides,
  }
}

function toManifest(posts: BlogPost[]): { manifest: Manifest; reader: (slug: string) => string } {
  const files = new Map<string, string>()
  const articles: ManifestArticleEntry[] = posts.map((post) => {
    const serialized = `${JSON.stringify(post, null, 2)}\n`
    files.set(post.slug, serialized)
    return {
      slug: post.slug,
      id: post.id,
      is_published: post.is_published,
      published_at: post.published_at,
      updated_at: post.updated_at,
      sha256: sha256(serialized),
    }
  })
  return {
    manifest: {
      schema_version: 1,
      generated_at: new Date().toISOString(),
      source: "supabase.blog_posts",
      mode: "published_only",
      article_count: posts.length,
      articles,
    },
    reader: (slug: string) => {
      const c = files.get(slug)
      if (c === undefined) throw new Error("missing")
      return c
    },
  }
}

// Hard rule from CLAUDE_CONTENT_FACTORY_V5.md: no model or pipeline stage
// may auto-populate a medical reviewer, credentials, or review date. The
// content registry must be a pure passthrough of whatever the snapshot
// already recorded — it must never fill in, infer, or stamp these fields.
describe("reviewer-state integrity (Issue #15 / V5-002)", () => {
  it("never populates reviewer fields on an article that has none", () => {
    const post = makePost({
      slug: "no-reviewer",
      medical_reviewer: null,
      reviewer_credentials: null,
      reviewed_at: null,
      next_review_date: null,
    })
    const { manifest, reader } = toManifest([post])
    const [result] = buildRegistryFromManifest(manifest, reader, { minExpectedArticles: 1 })

    expect(result.medical_reviewer).toBeNull()
    expect(result.reviewer_credentials).toBeNull()
    expect(result.reviewed_at).toBeNull()
    expect(result.next_review_date).toBeNull()
  })

  it("passes through existing reviewer fields unchanged, never mutating them", () => {
    const post = makePost({
      slug: "has-reviewer",
      medical_reviewer: "Jane Example, MD",
      reviewer_credentials: "MD, Obesity Medicine Specialist",
      reviewed_at: "2025-06-01T00:00:00.000Z",
      next_review_date: "2026-06-01T00:00:00.000Z",
    })
    const { manifest, reader } = toManifest([post])
    const [result] = buildRegistryFromManifest(manifest, reader, { minExpectedArticles: 1 })

    expect(result.medical_reviewer).toBe("Jane Example, MD")
    expect(result.reviewer_credentials).toBe("MD, Obesity Medicine Specialist")
    expect(result.reviewed_at).toBe("2025-06-01T00:00:00.000Z")
    expect(result.next_review_date).toBe("2026-06-01T00:00:00.000Z")
  })

  it("does not conflate content-update date with reviewer date", () => {
    const post = makePost({
      slug: "distinct-dates",
      updated_at: "2026-01-01T00:00:00.000Z",
      reviewed_at: null,
    })
    const { manifest, reader } = toManifest([post])
    const [result] = buildRegistryFromManifest(manifest, reader, { minExpectedArticles: 1 })

    expect(result.updated_at).toBe("2026-01-01T00:00:00.000Z")
    expect(result.reviewed_at).toBeNull()
  })
})
