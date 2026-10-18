import { createHash } from "node:crypto"
import { z } from "zod"
import type { BlogPost } from "./article-types"

const text = z.string().trim().min(1)
const date = z.string().datetime({ offset: true })
const sha = z.string().regex(/^[a-f0-9]{64}$/)
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const citation = z.object({ title: text, url: z.string().url().startsWith("https://"), type: text }).strict()

export const publicMetadataSchema = z.object({
  article_id: text, slug, title: text, description: text, author: text,
  category: z.enum(["Nutrition Education", "Metabolic Health", "Weight Literacy", "Public Health Awareness"]),
  tags: z.array(text).min(1), citations: z.array(citation).min(1),
  published_at: date, updated_at: date, next_review_date: date,
  editor_name: text, reviewer_name: text, reviewer_credentials: text,
  reviewed_at: date, approved_at: date, ai_assisted: z.boolean(),
  disclosure: text,
}).strict()

export type PublicMetadata = z.infer<typeof publicMetadataSchema>
export const publishedEntrySchema = z.object({
  metadata: publicMetadataSchema,
  content: z.string().min(100),
  body_sha256: sha,
  metadata_sha256: sha,
}).strict()
export type PublishedEntry = z.infer<typeof publishedEntrySchema>
export interface Article extends BlogPost { editorial?: PublicMetadata }

export function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

// Fixed schema ordering makes hashes independent of JSON property order.
export function metadataDigest(value: unknown): string {
  return digest(JSON.stringify(publicMetadataSchema.parse(value)))
}

export function validatePublishedEntry(value: unknown, now = Date.now()): PublishedEntry {
  const entry = publishedEntrySchema.parse(value)
  const m = entry.metadata
  if (digest(entry.content) !== entry.body_sha256 || metadataDigest(m) !== entry.metadata_sha256) {
    throw new Error(`Article integrity check failed: ${m.slug}`)
  }
  if (/review draft|review pending/i.test(entry.content)) throw new Error(`Draft cannot be published: ${m.slug}`)
  if (/<\/?[a-z][^>]*>/i.test(entry.content)) throw new Error(`Use Markdown without raw HTML: ${m.slug}`)
  for (const key of ["published_at", "updated_at", "reviewed_at", "approved_at"] as const) {
    if (Date.parse(m[key]) > now) throw new Error(`Future ${key}: ${m.slug}`)
  }
  if (Date.parse(m.reviewed_at) > Date.parse(m.approved_at) ||
      Date.parse(m.approved_at) > Date.parse(m.updated_at) ||
      Date.parse(m.updated_at) < Date.parse(m.published_at) ||
      Date.parse(m.next_review_date) <= Date.parse(m.reviewed_at)) {
    throw new Error(`Inconsistent review/publication dates: ${m.slug}`)
  }
  return entry
}

export function readPublishedCatalog(value: unknown, env: NodeJS.ProcessEnv = process.env): Article[] {
  const catalog = z.object({
    schema_version: z.literal(1), purpose: z.enum(["publication", "local-test"]),
    articles: z.array(z.unknown()),
  }).strict().parse(value)
  if (catalog.purpose === "local-test" &&
      (env.HWLF_LOCAL_CONTENT_TEST !== "1" || env.VERCEL || env.CI)) {
    throw new Error("Test content is allowed only in an explicitly enabled local run")
  }
  const seen = new Set<string>()
  const ids = new Set<string>()
  return catalog.articles.map((raw) => {
    const { content, metadata: m } = validatePublishedEntry(raw)
    if (seen.has(m.slug) || ids.has(m.article_id)) throw new Error(`Duplicate article: ${m.slug}`)
    seen.add(m.slug); ids.add(m.article_id)
    return {
      id: m.article_id, slug: m.slug, title: m.title, description: m.description,
      author: m.author, author_image: "", author_title: null, author_bio: null,
      author_credentials: null, medical_reviewer: null, reviewer_credentials: null,
      reviewed_at: m.reviewed_at, next_review_date: m.next_review_date,
      citations: m.citations, has_medical_disclaimer: false,
      published_at: m.published_at, updated_at: m.updated_at, created_at: m.published_at,
      hero_image: "", tags: m.tags, category: m.category,
      reading_time: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`,
      content, is_published: true, editorial: m,
    }
  })
}

/** Validate and order the complete approved repository inventory. */
export function resolveArticleCatalog(files: Article[]): Article[] {
  if (files.length === 0) throw new Error("No approved articles available; refusing an empty publication")
  const seen = new Set<string>()
  for (const post of files) {
    if (!post.is_published || !post.content?.trim() || !slug.safeParse(post.slug).success ||
        !post.title?.trim() || !post.author?.trim() || !Number.isFinite(Date.parse(post.published_at))) {
      throw new Error("Invalid published article in catalog")
    }
    if (seen.has(post.slug)) throw new Error(`Article slug conflict: ${post.slug}`)
    seen.add(post.slug)
  }
  return [...files].sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at) || a.slug.localeCompare(b.slug))
}
