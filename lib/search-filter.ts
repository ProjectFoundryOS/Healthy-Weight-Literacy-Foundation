// Client-safe search types/filter. This module must never import
// lib/content-registry.ts (or anything else that touches node:fs) — it is
// imported directly by the client-side search page component, and any
// fs-backed import here would get pulled into the browser bundle and fail
// Turbopack's "chunking context does not support external modules"
// (node:fs cannot be bundled for the browser).
//
// lib/search-index.ts is the server-only counterpart: it builds the
// SearchItem[] index from the content registry + static programs/resources
// and is imported only by server components/routes.

export interface SearchItem {
  type: "blog" | "program" | "resource"
  slug: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
}

export interface SearchResult {
  type: "blog" | "programs" | "resources"
  slug: string
  title: string
  excerpt: string
  tags: string[]
}

/** Pure, filesystem-free filter over an already-built SearchItem[] index. */
export function filterSearchIndex(searchIndex: SearchItem[], query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase()

  const results = searchIndex.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(lowerQuery)
    const descriptionMatch = item.description.toLowerCase().includes(lowerQuery)
    const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    return titleMatch || descriptionMatch || tagMatch
  })

  return results.map((item) => ({
    type: item.type === "blog" ? "blog" : item.type === "program" ? "programs" : "resources",
    slug: item.slug,
    title: item.title,
    excerpt: item.description,
    tags: item.tags,
  }))
}
