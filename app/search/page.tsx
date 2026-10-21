import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { SearchContent } from "@/components/content/search-content"
import { getBlogPosts } from "@/lib/articles"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Search WeightLiteracy",
  description: "Find articles and research updates on weight health.",
  path: "/search",
  noIndex: true,
})
import { getNewsUpdates } from "@/lib/news"
import { getSearchIndex } from "@/lib/search-index"

export default async function SearchPage() {
  const posts = await getBlogPosts()
  const news = getNewsUpdates().map((item) => ({
    type: "news" as const,
    slug: item.id,
    title: item.title,
    description: item.summary,
    tags: [item.category, item.evidenceType, item.source.name],
    category: "News & Research",
    url: `/news#${item.id}`,
  }))
  const index = getSearchIndex(posts, [], [], news)
  return (
    <>
      <PageHeader
        title="Search"
        description="Find clear answers in our articles and selected research updates."
        breadcrumbs={[{ label: "Search" }]}
      />
      <Suspense
        fallback={
          <p role="status" className="p-8 text-center">
            Loading search…
          </p>
        }
      >
        <SearchContent index={index} />
      </Suspense>
    </>
  )
}
