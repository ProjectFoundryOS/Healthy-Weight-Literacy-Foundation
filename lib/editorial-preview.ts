import { readFile, realpath } from "node:fs/promises"
import { resolve, relative, isAbsolute } from "node:path"
import { createHash } from "node:crypto"
import { z } from "zod"
import type { Article } from "./article-publication"
import { isEditorialPreview } from "./editorial-preview-mode.mjs"
import { articleVisualSetSchema, validateVisualPlacements } from "./article-visuals.ts"

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const recordSchema = z.object({
  article_id: z.string().min(1), slug, title: z.string().min(1),
  description: z.string().min(1), body_path: z.string().min(1),
  draft_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  status: z.literal("draft"), publish: z.literal(false),
  created_on: day, updated_on: day, category: z.string().min(1),
  tags: z.array(z.string()),
  visuals: articleVisualSetSchema.optional(),
})

async function readInside(root: string, name: string) {
  const path = await realpath(resolve(root, name))
  const fromRoot = relative(root, path)
  if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) throw new Error("Preview path must stay in the editorial folder")
  return readFile(path, "utf8")
}

/** Only display fields are returned. Review records and identities stay private. */
export async function readDraftPreview(env: NodeJS.ProcessEnv = process.env): Promise<Article[]> {
  if (!isEditorialPreview(env)) throw new Error("Editorial preview is not enabled")
  const root = await realpath(env.HWLF_EDITORIAL_PREVIEW_DIR!)
  const manifest = z.object({
    article_slugs: z.array(slug).min(1),
  }).strict()
    .parse(JSON.parse(await readInside(root, "preview.json")))
  if (new Set(manifest.article_slugs).size !== manifest.article_slugs.length) throw new Error("Duplicate preview slug")
  return Promise.all(manifest.article_slugs.map(async (selectedSlug): Promise<Article> => {
    const record = recordSchema.parse(JSON.parse(await readInside(root, `records/${selectedSlug}.json`)))
    if (record.slug !== selectedSlug || record.body_path !== `articles/${selectedSlug}.md`) {
      throw new Error(`Preview record does not match selection: ${selectedSlug}`)
    }
    const content = await readInside(root, record.body_path)
    if (createHash("sha256").update(content).digest("hex") !== record.draft_sha256) {
      throw new Error(`Draft changed without updating its editorial record: ${selectedSlug}`)
    }
    const visuals = record.visuals
    validateVisualPlacements(content, visuals)
    const words = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim().split(/\s+/).length
    return {
      id: record.article_id, slug: record.slug, title: record.title, description: record.description,
      author: "Editorial draft", author_image: "", author_title: null, author_bio: null,
      author_credentials: null, medical_reviewer: null, reviewer_credentials: null,
      reviewed_at: null, next_review_date: null, citations: null, has_medical_disclaimer: false,
      published_at: "", updated_at: `${record.updated_on}T12:00:00Z`, created_at: `${record.created_on}T12:00:00Z`,
      hero_image: visuals?.hero.src ?? "", visuals, tags: record.tags, category: record.category,
      reading_time: `${Math.max(1, Math.ceil(words / 225))} min read`,
      content, is_published: false, draft_preview: true,
    }
  }))
}
