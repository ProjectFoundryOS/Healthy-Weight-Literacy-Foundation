import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { SearchContent } from "@/components/content/search-content"
import { getBlogPosts } from "@/lib/articles"
import { programs, resources } from "@/lib/mdx"
import { getNewsUpdates } from "@/lib/news"
import { getSearchIndex } from "@/lib/search-index"

export default async function SearchPage() {
  const posts = await getBlogPosts()
  const news = getNewsUpdates().map((item) => ({ type: "news" as const, slug: item.id, title: item.title, description: item.summary, tags: [item.category, item.evidenceType, item.source.name], category: "News & Research", url: `/news#${item.id}` }))
  const index = getSearchIndex(posts, programs, resources, news)
  return (
    <>
      <PageHeader title="Search" description="Find educational resources, articles, and programs to support informed health decisions." breadcrumbs={[{ label: "Search" }]} />
      <Suspense fallback={<p role="status" className="p-8 text-center">Loading search…</p>}>
        <SearchContent index={index} />
      </Suspense>
    </>
  )
}
