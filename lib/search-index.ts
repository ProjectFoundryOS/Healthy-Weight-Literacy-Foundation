interface SearchDocument {
  slug: string; title: string; description: string; tags: string[]; category: string
}

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

export function getSearchIndex(blogPosts: SearchDocument[], programs: SearchDocument[], resources: SearchDocument[]): SearchItem[] {
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

  return [...blogItems, ...programItems, ...resourceItems]
}

export function searchContent(query: string, searchIndex: SearchItem[]): SearchResult[] {
  const lowerQuery = query.trim().toLowerCase()
  if (lowerQuery.length < 2) return []

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
