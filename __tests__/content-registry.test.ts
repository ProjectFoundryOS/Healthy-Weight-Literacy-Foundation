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

function buildFixture(posts: BlogPost[]): { manifest: Manifest; files: Map<string, string> } {
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

  const manifest: Manifest = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    source: "supabase.blog_posts",
    mode: "published_only",
    article_count: posts.length,
    articles,
  }

  return { manifest, files }
}

function readerFor(files: Map<string, string>) {
  return (slug: string) => {
    const content = files.get(slug)
    if (content === undefined) throw new Error(`missing fixture file for ${slug}`)
    return content
  }
}

describe("content registry integrity (Issue #23)", () => {
  it("returns every published article exactly once", () => {
    const posts = [
      makePost({ slug: "article-a" }),
      makePost({ slug: "article-b" }),
      makePost({ slug: "article-c" }),
    ]
    const { manifest, files } = buildFixture(posts)

    const registry = buildRegistryFromManifest(manifest, readerFor(files), { minExpectedArticles: 2 })

    expect(registry).toHaveLength(3)
    expect(registry.map((p) => p.slug).sort()).toEqual(["article-a", "article-b", "article-c"])
  })

  it("excludes unpublished rows from the registry", () => {
    const posts = [
      makePost({ slug: "published-one" }),
      makePost({ slug: "unpublished-one", is_published: false }),
      makePost({ slug: "published-two" }),
    ]
    const { manifest, files } = buildFixture(posts)

    const registry = buildRegistryFromManifest(manifest, readerFor(files), { minExpectedArticles: 1 })

    expect(registry.map((p) => p.slug).sort()).toEqual(["published-one", "published-two"])
  })

  it("rejects a manifest with duplicate slugs", () => {
    const posts = [makePost({ slug: "dup" }), makePost({ slug: "dup" })]
    const { manifest, files } = buildFixture(posts)

    expect(() => buildRegistryFromManifest(manifest, readerFor(files), { minExpectedArticles: 1 })).toThrow(
      /Duplicate slug/,
    )
  })

  it("rejects a hash mismatch between manifest and article file", () => {
    const posts = [makePost({ slug: "tampered" })]
    const { manifest, files } = buildFixture(posts)
    files.set("tampered", files.get("tampered")! + "\n// tampered after hashing")

    expect(() => buildRegistryFromManifest(manifest, readerFor(files), { minExpectedArticles: 1 })).toThrow(
      /Hash mismatch/,
    )
  })

  it("rejects a manifest entry with no corresponding article file", () => {
    const posts = [makePost({ slug: "orphan" })]
    const { manifest } = buildFixture(posts)
    const emptyFiles = new Map<string, string>()

    expect(() => buildRegistryFromManifest(manifest, readerFor(emptyFiles), { minExpectedArticles: 1 })).toThrow(
      /missing/,
    )
  })

  it("refuses to build with zero published articles", () => {
    const posts = [makePost({ slug: "only-one", is_published: false })]
    const { manifest, files } = buildFixture(posts)

    expect(() => buildRegistryFromManifest(manifest, readerFor(files), { minExpectedArticles: 1 })).toThrow(
      /zero published articles/,
    )
  })

  it("refuses to build below the configured minimum-article floor", () => {
    const posts = [makePost({ slug: "one" }), makePost({ slug: "two" })]
    const { manifest, files } = buildFixture(posts)

    expect(() => buildRegistryFromManifest(manifest, readerFor(files), { minExpectedArticles: 20 })).toThrow(
      /below the configured floor/,
    )
  })

  it("normalizes legacy HTML content to Markdown so no article reaches the render path as raw HTML", () => {
    const posts = [
      makePost({
        slug: "legacy-html-article",
        content: "<h1>Title</h1><p>Body text with <strong>emphasis</strong>.</p>",
      }),
    ]
    const { manifest, files } = buildFixture(posts)

    const registry = buildRegistryFromManifest(manifest, readerFor(files), { minExpectedArticles: 1 })

    expect(registry[0].content).not.toMatch(/<h1>|<p>|<strong>/)
    expect(registry[0].content).toContain("# Title")
  })
})
