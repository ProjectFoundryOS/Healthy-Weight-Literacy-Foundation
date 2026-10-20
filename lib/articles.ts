import "server-only"
import { cache } from "react"
import catalog from "@/content/articles/catalog.json"
import { readPublishedCatalog, resolveArticleCatalog } from "./article-publication"
import { isEditorialPreview } from "./editorial-preview-mode.mjs"
import { readDraftPreview } from "./editorial-preview"

// Source selection is owned by the repository. Old hosting variables cannot
// reconnect the retired database reader or override the approved file catalog.
export const getBlogPosts = cache(async () => {
  const published = resolveArticleCatalog(readPublishedCatalog(catalog))
  if (isEditorialPreview()) {
    const drafts = await readDraftPreview()
    const draftSlugs = new Set(drafts.map((post) => post.slug))
    // Local review includes the existing library so related-article links work.
    // A draft can preview an edit without changing its approved catalog entry.
    return [...drafts, ...published.filter((post) => !draftSlugs.has(post.slug))]
  }
  return published
})

export async function getBlogPost(slug: string) {
  return (await getBlogPosts()).find((post) => post.slug === slug) || null
}
