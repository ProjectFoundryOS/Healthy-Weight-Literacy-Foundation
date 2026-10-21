import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { BlogCard } from "@/components/blocks/blog-card"
import { generatePageMetadata } from "@/lib/seo"
import { getBlogPosts } from "@/lib/articles"
import { articleTopics } from "@/lib/article-topics"
export const metadata = generatePageMetadata({
  title: "Articles on weight & metabolic health",
  description:
    "Clear, source-based guides to medicines, food, appetite, weight, and metabolic health.",
  path: "/blog",
})
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const [allPosts, query] = await Promise.all([getBlogPosts(), searchParams])
  const selected = articleTopics.find((topic) => topic.id === query.topic)
  const posts = selected
    ? allPosts.filter((post) =>
        (selected.slugs as readonly string[]).includes(post.slug),
      )
    : allPosts
  return (
    <>
      <PageHeader
        title="The reading room"
        description="Clear answers, useful context, and a little more confidence in your next conversation."
        breadcrumbs={[{ label: "Articles" }]}
      />
      <Section className="pt-8">
        <Container>
          <nav
            aria-label="Filter articles by topic"
            className="flex flex-wrap gap-2"
          >
            <Link
              href="/blog"
              aria-current={!selected ? "page" : undefined}
              className={`topic-pill ${!selected ? "topic-pill-active" : ""}`}
            >
              All articles
            </Link>
            {articleTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/blog?topic=${topic.id}`}
                aria-current={selected?.id === topic.id ? "page" : undefined}
                className={`topic-pill ${selected?.id === topic.id ? "topic-pill-active" : ""}`}
              >
                {topic.title}
              </Link>
            ))}
          </nav>
          <div className="my-7 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" role="status">
              {posts.length} articles
              {selected ? ` · ${selected.title}` : " to explore"}
            </p>
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4"
            >
              Search the library
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard
                key={post.slug}
                post={post}
                eager={index < 3}
                headingLevel="h2"
              />
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
