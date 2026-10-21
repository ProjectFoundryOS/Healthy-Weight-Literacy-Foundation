interface SearchDocument {
  slug: string
  title: string
  description: string
  tags: string[]
  category: string
}

export interface SearchItem {
  type: "blog" | "program" | "resource" | "news"
  slug: string
  title: string
  description: string
  tags: string[]
  category: string
  url: string
}

export interface SearchResult {
  type: "blog" | "programs" | "resources" | "news"
  url: string
  slug: string
  title: string
  excerpt: string
  tags: string[]
}

export function getSearchIndex(
  blogPosts: SearchDocument[],
  programs: SearchDocument[],
  resources: SearchDocument[],
  news: SearchItem[] = [],
): SearchItem[] {
  const blogItems: SearchItem[] = blogPosts.map((post) => ({
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

  return [...blogItems, ...programItems, ...resourceItems, ...news]
}

// Aliases improve discovery; they do not imply identical indications or dosing.
export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/glp[\s-]*1/g, "glp 1")
    .replace(/\b(ozempic|wegovy|rybelsus)\b/g, "semaglutide")
    .replace(/\b(mounjaro|zepbound)\b/g, "tirzepatide")
    .replace(/\bretratrutide\b/g, "retatrutide")
    .replace(/\bversus\b/g, "vs")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}
export function searchContent(
  query: string,
  searchIndex: SearchItem[],
): SearchResult[] {
  const normalized = normalizeSearch(query)
  if (normalized.length < 2) return []
  const words = normalized.split(/\s+/)
  return searchIndex
    .map((item) => {
      const title = normalizeSearch(item.title)
      const text = normalizeSearch(
        `${item.title} ${item.description} ${item.category} ${item.tags.join(" ")}`,
      )
      return {
        item,
        match: words.every((word) => text.includes(word)),
        score: title.includes(normalized)
          ? 2
          : words.every((word) => title.includes(word))
            ? 1
            : 0,
      }
    })
    .filter((result) => result.match)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => ({
      type:
        item.type === "blog"
          ? "blog"
          : item.type === "program"
            ? "programs"
            : item.type === "news"
              ? "news"
              : "resources",
      url: item.url,
      slug: item.slug,
      title: item.title,
      excerpt: item.description,
      tags: item.tags,
    }))
}
