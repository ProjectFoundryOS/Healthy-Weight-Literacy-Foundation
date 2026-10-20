import { z } from "zod"

export const articleVisualSchema = z.object({
  src: z.string().regex(/^\/images\/editorial\/[a-z0-9-]+\.(png|webp|jpe?g)$/),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  source: z.object({ title: z.string().min(1), url: z.string().url().startsWith("https://") }).optional(),
}).strict()

export const articleCoverOverlaySchema = z.object({
  title: z.string().min(1).max(64),
  subtitle: z.string().min(1).max(80).optional(),
  attribution: z.object({
    label: z.string().min(1).max(40),
    logo: articleVisualSchema,
  }).strict().optional(),
}).strict()

export const articleVisualSetSchema = z.object({
  hero: articleVisualSchema.extend({ overlay: articleCoverOverlaySchema.optional() }),
  body: z.array(articleVisualSchema.extend({ before_heading: z.string().min(1) })),
}).strict()

export type ArticleVisual = z.infer<typeof articleVisualSchema>
export type ArticleCoverOverlay = z.infer<typeof articleCoverOverlaySchema>
export type ArticleVisualSet = z.infer<typeof articleVisualSetSchema>

export function articleImages(visuals?: ArticleVisualSet): ArticleVisual[] {
  return visuals ? [visuals.hero, ...visuals.body, ...(visuals.hero.overlay?.attribution ? [visuals.hero.overlay.attribution.logo] : [])] : []
}

/** A renamed or ambiguous section must not silently lose an approved image. */
export function validateVisualPlacements(content: string, visuals?: ArticleVisualSet): void {
  const lines = content.split(/\r?\n/)
  for (const image of visuals?.body ?? []) {
    const matches = lines.filter((line) => line === `## ${image.before_heading}`).length
    if (matches !== 1) throw new Error(`Image placement heading must appear exactly once: ${image.before_heading}`)
  }
}

/** Insert figures between complete sections, preserving the original Markdown. */
export function articleSections(content: string, visuals?: ArticleVisualSet) {
  return content.split(/(?=^## )/m).map((markdown) => ({
    markdown,
    figures: visuals?.body.filter((image) => markdown.split(/\r?\n/, 1)[0] === `## ${image.before_heading}`) ?? [],
  }))
}
