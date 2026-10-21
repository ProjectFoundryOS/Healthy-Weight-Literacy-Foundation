import { z } from "zod"
import updates from "../content/news/updates.json" with { type: "json" }
import catalog from "../content/articles/catalog.json" with { type: "json" }

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}, "Invalid calendar date")
const text = z.string().trim().min(1)
const updateSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: text,
  evidenceType: text,
  title: text,
  summary: text,
  context: text,
  limitation: text,
  source: z.object({ name: text, title: text, url: z.string().url().startsWith("https://"), publishedOn: date }),
  checkedOn: date,
  relatedSlug: text,
})

export type NewsUpdate = z.infer<typeof updateSchema>

export function validateNewsUpdates(input: unknown, publishedSlugs: string[], today = new Date().toISOString().slice(0, 10)) {
  const items = z.array(updateSchema).parse(input)
  const ids = new Set<string>()
  const sources = new Set<string>()
  for (const item of items) {
    if (ids.has(item.id) || sources.has(item.source.url)) throw new Error("Duplicate news item or source")
    if (!publishedSlugs.includes(item.relatedSlug)) throw new Error("Related guide must be published")
    if (item.source.publishedOn > item.checkedOn || item.checkedOn > today) throw new Error("News dates are inconsistent or in the future")
    ids.add(item.id)
    sources.add(item.source.url)
  }
  return items.sort((a, b) => b.source.publishedOn.localeCompare(a.source.publishedOn) || a.id.localeCompare(b.id))
}

export function getNewsUpdates() {
  return validateNewsUpdates(updates, catalog.articles.map((article) => article.metadata.slug))
}

export function getNewsGuide(slug: string) {
  const article = catalog.articles.find((article) => article.metadata.slug === slug)
  if (!article) throw new Error("Related news guide is unavailable")
  return { title: article.metadata.title, href: `/blog/${article.metadata.slug}` }
}

export function formatNewsDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`))
}
