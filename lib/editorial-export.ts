import { z } from "zod"
import { digest, metadataDigest, publicMetadataSchema, validatePublishedEntry } from "./article-publication.ts"

const name = z.string().trim().min(1)
const timestamp = z.string().datetime({ offset: true })
const approvalSchema = z.object({
  editor_approval: z.object({ name, approved_at: timestamp }),
  subject_approval: z.object({ name, credentials: name, reviewed_at: timestamp }),
  approved_at: timestamp,
  approved_body_sha256: z.string(), approved_metadata_sha256: z.string(),
})
export const recordSchema = z.object({
  article_id: name, slug: name, title: name, description: name, author: name,
  category: name, tags: z.array(name), source_ids: z.array(name).min(1),
  body_path: name, published_at: timestamp, updated_at: timestamp, next_review_at: timestamp,
  status: z.literal("approved"), publish: z.literal(true),
  provenance: z.object({ ai_assisted: z.boolean() }), public_disclosure: name,
  approval: approvalSchema,
})
const sourceSchema = z.object({ id: name, title: name, url: z.string().url().startsWith("https://") })

export function exportArticle(record: unknown, body: string, sources: unknown[]) {
  const r = recordSchema.parse(record)
  const checkedSources = sources.map((source) => sourceSchema.parse(source))
  const byId = new Map(checkedSources.map((source) => [source.id, source]))
  if (byId.size !== checkedSources.length) throw new Error("Duplicate source IDs")
  const metadata = publicMetadataSchema.parse({
    article_id: r.article_id, slug: r.slug, title: r.title, description: r.description,
    author: r.author, category: r.category, tags: r.tags,
    citations: r.source_ids.map((id) => {
      const source = byId.get(id)
      if (!source) throw new Error(`Unknown source: ${id}`)
      if (!body.includes(`](${source.url})`)) throw new Error(`Source missing from article: ${id}`)
      return { title: source.title, url: source.url, type: "reference" }
    }),
    published_at: r.published_at, updated_at: r.updated_at, next_review_date: r.next_review_at,
    editor_name: r.approval.editor_approval.name, reviewer_name: r.approval.subject_approval.name,
    reviewer_credentials: r.approval.subject_approval.credentials,
    reviewed_at: r.approval.subject_approval.reviewed_at, approved_at: r.approval.approved_at,
    ai_assisted: r.provenance.ai_assisted, disclosure: r.public_disclosure,
  })
  if (r.approval.editor_approval.approved_at !== r.approval.approved_at) throw new Error("Editor approval timestamp mismatch")
  return validatePublishedEntry({
    metadata, content: body,
    body_sha256: r.approval.approved_body_sha256,
    metadata_sha256: r.approval.approved_metadata_sha256,
  })
}

export { digest, metadataDigest }
