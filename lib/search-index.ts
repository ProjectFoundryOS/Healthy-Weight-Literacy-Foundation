// Server-only search index builder. Imports lib/content-registry.ts,
// which reads the committed snapshot via node:fs — this module must only
// ever be imported from server components/routes, never from a "use
// client" component (see lib/search-filter.ts for the client-safe half).

import { getBlogPosts } from "./content-registry"
import { programs, resources } from "./mdx"
import { filterSearchIndex, type SearchItem, type SearchResult } from "./search-filter"

export type { SearchItem, SearchResult }
export { filterSearchIndex }

export function getSearchIndex(): SearchItem[] {
  // Blog entries come from the same committed content registry that backs
  // /blog and the sitemap (Issue #15/#23), so search can never disagree
  // with the live corpus or surface stale/sample article metadata.
  const blogItems: SearchItem[] = getBlogPosts().map((post) => ({
    type: "blog",
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    category: post.category,
    url: `/blog/${post.slug}`,
  }))

  const programItems: SearchItem[] = programs.map((program) => ({
    type: "program",
    slug: program.slug,
    title: program.title,
    description: program.description,
    tags: program.tags,
    category: program.category,
    url: `/programs/${program.slug}`,
  }))

  const resourceItems: SearchItem[] = resources.map((resource) => ({
    type: "resource",
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    tags: resource.tags,
    category: resource.category,
    url: `/resources/${resource.slug}`,
  }))

  return [...blogItems, ...programItems, ...resourceItems]
}

/** Server-only convenience wrapper: builds the index and filters it in one call. */
export function searchContent(query: string): SearchResult[] {
  return filterSearchIndex(getSearchIndex(), query)
}
