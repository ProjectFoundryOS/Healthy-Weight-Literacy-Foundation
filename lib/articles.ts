import "server-only"
import { cache } from "react"
import catalog from "@/content/articles/catalog.json"
import { readPublishedCatalog, resolveArticleCatalog } from "./article-publication"

// Source selection is owned by the repository. Old hosting variables cannot
// reconnect the retired database reader or override the approved file catalog.
export const getBlogPosts = cache(async () => resolveArticleCatalog(readPublishedCatalog(catalog)))

export async function getBlogPost(slug: string) {
  return (await getBlogPosts()).find((post) => post.slug === slug) || null
}
