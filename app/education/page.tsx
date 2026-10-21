import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { SiteSearch } from "@/components/content/site-search"
import { articleTopics } from "@/lib/article-topics"
import { getBlogPosts } from "@/lib/articles"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Learn about weight health",
  description:
    "Choose a starting point: GLP-1 medicines, treatment, food and appetite, finding care, or metabolism.",
  path: "/education",
})
export default async function EducationPage() {
  const posts = await getBlogPosts()
  return (
    <>
      <PageHeader
        title="A little more understanding."
        description="Start where you are. Explore the questions that matter to you, one guide at a time."
        breadcrumbs={[{ label: "Learn" }]}
      >
        <div className="mt-6">
          <SiteSearch />
        </div>
      </PageHeader>
      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {articleTopics.map((topic, i) => (
              <section
                id={topic.id}
                key={topic.id}
                className="scroll-mt-28 rounded-2xl border bg-white p-6 sm:p-8"
              >
                <p className="eyebrow">Topic 0{i + 1}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  {topic.title}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {topic.description}
                </p>
                <ul className="mt-5 divide-y">
                  {topic.slugs
                    .map((slug) => posts.find((post) => post.slug === slug))
                    .filter((post) => !!post)
                    .map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="group flex items-center justify-between gap-4 rounded-sm py-4 font-medium leading-snug hover:text-primary"
                        >
                          <span>
                            {post.title}
                            <span className="mt-1 block text-sm font-normal text-muted-foreground">
                              {post.reading_time}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="h-5 w-5 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                </ul>
                <Link
                  href={`/blog?topic=${topic.id}`}
                  className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
                >
                  Browse this topic
                </Link>
              </section>
            ))}
          </div>
          <p className="mt-8 text-lg">
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
            >
              Explore the full article library →
            </Link>
          </p>
        </Container>
      </Section>
    </>
  )
}
