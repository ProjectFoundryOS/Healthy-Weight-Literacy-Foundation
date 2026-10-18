import { Suspense } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { SearchContent } from "@/components/content/search-content"
import { getBlogPosts } from "@/lib/articles"
import { programs, resources } from "@/lib/mdx"
import { getSearchIndex } from "@/lib/search-index"

export default async function SearchPage() {
  const posts = await getBlogPosts()
  const index = getSearchIndex(posts, programs, resources)
  return (
    <>
      <PageHeader title="Search" description="Find educational resources, articles, and programs to support informed health decisions." breadcrumbs={[{ label: "Search" }]} />
      <Suspense fallback={<p role="status" className="p-8 text-center">Loading search…</p>}>
        <SearchContent index={index} />
      </Suspense>
    </>
  )
}
