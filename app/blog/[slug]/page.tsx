import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getBlogPost, getBlogPosts } from "@/lib/articles"
import { generatePageMetadata } from "@/lib/seo"
import { formatDate } from "@/lib/utils"
import { ArticleSchema } from "@/components/seo/article-schema"
import { ArticleRenderer } from "@/components/content/article-renderer"
import { prepareArticleContent } from "@/lib/article-content"
import { Clock } from "lucide-react"
import { BlogCard } from "@/components/blocks/blog-card"
import { ArticleFigure } from "@/components/content/article-figure"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import {
  articleOutline,
  relatedArticleSlugs,
  topicForArticle,
} from "@/lib/article-topics"
import { articleSections } from "@/lib/article-visuals"
import { ArticleReadingTracker } from "@/components/analytics/article-reading-tracker"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getBlogPost(resolvedParams.slug)
  if (!post) return {}

  return generatePageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.hero_image,
    imageAlt: post.visuals?.hero.alt,
    imageWidth: post.visuals?.hero.width,
    imageHeight: post.visuals?.hero.height,
    noIndex: post.draft_preview,
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()
  const allPosts = await getBlogPosts()
  const relatedPosts = relatedArticleSlugs(post.slug)
    .map((slug) => allPosts.find((post) => post.slug === slug))
    .filter((post) => !!post)
  let body =
    post.editorial || post.draft_preview
      ? post.content.replace(/^# [^\n]+\n+/, "")
      : post.content
  if (post.draft_preview)
    body = body.replace(/^\*(?:Article draft|Editorial sample)[^\n]+\*\n+/, "")
  const { content, isHtml } = prepareArticleContent(body, post.slug)
  const outline = isHtml ? [] : articleOutline(content)
  let sectionIndex = 0
  const topic = topicForArticle(post.slug)
  const toc = (
    <ol className="mt-3 space-y-1">
      {outline.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="block rounded-sm py-2 text-sm leading-snug text-[#455953] hover:text-primary hover:underline"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  )
  return (
    <>
      {!post.draft_preview ? (
        <ArticleSchema
          title={post.title}
          description={post.description}
          slug={post.slug}
          publishedAt={post.published_at}
          updatedAt={post.updated_at ?? undefined}
          category={post.category}
          image={post.hero_image}
          authorName={post.author}
          reviewerName={post.editorial?.medical_review?.name}
          reviewedAt={post.editorial?.medical_review?.reviewed_at}
        />
      ) : null}
      <div className="border-b bg-[#F1F4ED] py-7 sm:py-10">
        <Container className="max-w-6xl">
          <Breadcrumbs items={[{ label: "Articles", href: "/blog" }]} />
          {topic ? (
            <Link
              href={`/blog?topic=${topic.id}`}
              className="mt-5 inline-flex min-h-10 items-center text-sm font-semibold text-primary underline underline-offset-4"
            >
              {topic.title}
            </Link>
          ) : null}
          <h1 className="mt-3 max-w-4xl text-[clamp(2rem,3.8vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.035em]">
            {post.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#455953]">
            {post.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <p>{post.draft_preview ? "Draft for review" : post.author}</p>
            <p>
              {post.draft_preview ? "Draft updated" : "Published"}{" "}
              {formatDate(post.published_at)}
            </p>
            <p>{post.reading_time}</p>
          </div>
        </Container>
      </div>
      <Section className="pt-8 sm:pt-10">
        <Container className="max-w-6xl">
          <div className="article-layout grid items-start gap-10 lg:grid-cols-[minmax(0,740px)_240px] lg:gap-12">
            <article className="min-w-0 max-w-[740px]">
              {outline.length ? (
                <details className="mb-6 rounded-xl border bg-white p-4 lg:hidden">
                  <summary className="cursor-pointer py-1 font-semibold">
                    In this guide
                  </summary>
                  <nav aria-label="Article sections">{toc}</nav>
                </details>
              ) : null}
              {post.visuals ? (
                <ArticleFigure
                  visual={post.visuals.hero}
                  overlay={post.visuals.hero.overlay}
                  priority
                />
              ) : post.hero_image ? (
                <Image
                  src={post.hero_image}
                  alt={post.title}
                  width={1200}
                  height={600}
                  className="mb-8 h-auto w-full rounded-2xl"
                  priority
                />
              ) : null}
              <div id="article-reading-content">
              {!post.draft_preview ? <ArticleReadingTracker key={post.slug} /> : null}
              {post.visuals && !isHtml ? (
                articleSections(content, post.visuals).map((section, index) => {
                  const id = /^## /m.test(section.markdown)
                    ? `section-${++sectionIndex}`
                    : undefined
                  return (
                    <div key={index} id={id} className="article-section">
                      {section.figures.map((visual) => (
                        <ArticleFigure key={visual.src} visual={visual} />
                      ))}
                      <ArticleRenderer
                        content={section.markdown}
                        className="text-[17px] sm:text-lg"
                      />
                    </div>
                  )
                })
              ) : (
                <ArticleRenderer
                  content={content}
                  isHtml={isHtml}
                  className="text-[17px] sm:text-lg"
                />
              )}
              </div>
              {post.editorial ? (
                <section
                  aria-label="Editorial information"
                  className="mt-10 space-y-3 border-t pt-6 text-sm leading-relaxed text-muted-foreground"
                >
                  <h2 className="font-semibold text-secondary">
                    About this article
                  </h2>
                  <p>
                    Edited by {post.editorial.editor_name}. Editorial review:{" "}
                    {formatDate(post.editorial.reviewed_at)}.
                  </p>
                  {post.editorial.medical_review ? (
                    <p>
                      Medical review: {post.editorial.medical_review.name},{" "}
                      {post.editorial.medical_review.credentials},{" "}
                      {formatDate(post.editorial.medical_review.reviewed_at)}.
                    </p>
                  ) : null}
                  {post.editorial.disclosure ? (
                    <p>{post.editorial.disclosure}</p>
                  ) : null}
                  <p>
                    <Link
                      href="/editorial-policy"
                      className="underline underline-offset-4"
                    >
                      Our editorial standards
                    </Link>{" "}
                    ·{" "}
                    <Link
                      href="/contact"
                      className="underline underline-offset-4"
                    >
                      Suggest a correction
                    </Link>
                  </p>
                </section>
              ) : null}
            </article>
            <aside className="article-aside hidden lg:block lg:sticky lg:top-24">
              <nav
                aria-label="In this guide"
                className="max-h-[calc(100dvh-140px)] overflow-y-auto border-l-2 border-primary/20 pl-5"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  In this guide
                </h2>
                {toc}
              </nav>
            </aside>
          </div>
          {relatedPosts.length ? (
            <section className="related-articles mt-14 border-t pt-10">
              <h2 className="mb-6 text-2xl font-semibold tracking-tight">
                Keep exploring
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.slug} post={relatedPost} />
                ))}
              </div>
            </section>
          ) : null}
          <div className="article-newsletter mt-10 flex flex-wrap items-center justify-between gap-5 rounded-xl bg-primary-soft p-6">
            <div>
              <h2 className="text-xl font-semibold">
                A clearer view, in your inbox.
              </h2>
              <p className="mt-2 text-muted-foreground">
                New guides and selected updates from WeightLiteracy.
              </p>
            </div>
            <Button asChild>
              <Link href="/#newsletter">Join the newsletter</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
