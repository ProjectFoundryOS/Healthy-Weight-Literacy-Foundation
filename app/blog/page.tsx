import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { BlogCard } from "@/components/blocks/blog-card"
import { generatePageMetadata } from "@/lib/seo"
import { getBlogPosts } from "@/lib/content-registry"

export const metadata: Metadata = generatePageMetadata({
  title: "Educational Articles",
  description:
    "Evidence-based educational articles on nutrition, weight health, metabolic wellness, and health literacy from Healthy Weight Literacy Foundation.",
  path: "/blog",
})

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <>
      <PageHeader
        title="Educational Articles"
        description="Evidence-based insights to support informed health decisions and health literacy."
        breadcrumbs={[{ label: "Articles" }]}
      />

      <Section>
        <Container>
          {posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Educational articles will begin publishing soon. Check back for evidence-based content on nutrition,
                weight health, and metabolic wellness.
              </p>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
