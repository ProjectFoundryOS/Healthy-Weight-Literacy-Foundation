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
import { articleSections } from "@/lib/article-visuals"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
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
  const resolvedParams = await params
  const post = await getBlogPost(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  const allPosts = await getBlogPosts()
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2)
  let body = post.editorial || post.draft_preview ? post.content.replace(/^# [^\n]+\n+/, "") : post.content
  // The preview banner presents draft status without duplicating the document heading.
  if (post.draft_preview) body = body.replace(/^\*(?:Article draft|Editorial sample)[^\n]+\*\n+/, "")
  const { content, isHtml } = prepareArticleContent(body, post.slug)

  return (
    <>
      {!post.draft_preview ? <ArticleSchema
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
      /> : null}

      <PageHeader title={post.title} breadcrumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            {post.author_image ? <Image src={post.author_image} alt="" width={40} height={40} className="rounded-full" /> : null}
            <div>
              <p className="font-medium text-secondary">{post.draft_preview ? "Draft for review" : post.author}</p>
              <p className="text-sm text-muted-foreground">{post.draft_preview ? `Draft updated ${formatDate(post.updated_at)}` : formatDate(post.published_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {post.reading_time}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary">{post.category}</Badge>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </PageHeader>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* Main Content */}
            <div className="min-w-0">
              {post.visuals ? <ArticleFigure visual={post.visuals.hero} priority /> : post.hero_image ? (
                <Image src={post.hero_image} alt={post.title} width={1200} height={600} className="rounded-2xl shadow-card mb-8 w-full h-auto" priority />
              ) : null}

              {/* Article Content */}
              {post.visuals && !isHtml ? articleSections(content, post.visuals).map((section, index) => (
                <div key={index}>
                  {section.figures.map((visual) => <ArticleFigure key={visual.src} visual={visual} />)}
                  <ArticleRenderer content={section.markdown} className="text-[17px] sm:text-lg break-words" />
                </div>
              )) : <ArticleRenderer content={content} isHtml={isHtml} className="text-[17px] sm:text-lg break-words" />}

              {post.editorial ? (
                <section aria-label="Editorial information" className="mt-10 border-t pt-6 text-sm text-muted-foreground space-y-2">
                  <h2 className="font-semibold text-secondary">About this article</h2>
                  <p>Edited by {post.editorial.editor_name}. Editorial review: {formatDate(post.editorial.reviewed_at)}.</p>
                  {post.editorial.medical_review ? <p>Medical review: {post.editorial.medical_review.name}, {post.editorial.medical_review.credentials}, {formatDate(post.editorial.medical_review.reviewed_at)}.</p> : null}
                  {post.editorial.disclosure ? <p>{post.editorial.disclosure}</p> : null}
                </section>
              ) : null}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-secondary mb-6">Related Articles</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {relatedPosts.map((relatedPost) => <BlogCard key={relatedPost.slug} post={relatedPost} />)}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Author Bio */}
              {post.draft_preview ? <Card>
                <CardContent className="p-6">
                  <h2 className="font-bold text-secondary mb-3">In this collection</h2>
                  <nav aria-label="Article collection" className="space-y-4">
                    {allPosts.map((article) => (
                      <Link key={article.slug} href={`/blog/${article.slug}`} aria-current={article.slug === post.slug ? "page" : undefined}
                        className={`block text-sm leading-relaxed hover:underline ${article.slug === post.slug ? "font-semibold text-primary" : "text-secondary"}`}>
                        {article.title}
                      </Link>
                    ))}
                  </nav>
                </CardContent>
              </Card> : <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-secondary mb-4">About the Author</h3>
                  <div className="flex items-center gap-3 mb-3">
                    {post.author_image ? <Image src={post.author_image} alt="" width={60} height={60} className="rounded-full" /> : null}
                    <div>
                      <p className="font-medium text-secondary">{post.author}</p>
                      {post.author_title && (
                        <p className="text-sm text-muted-foreground">{post.author_title}</p>
                      )}
                    </div>
                  </div>
                  {post.author_bio && (
                    <p className="text-sm text-muted-foreground">{post.author_bio}</p>
                  )}
                </CardContent>
              </Card>}

              {/* Newsletter CTA */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-bold text-secondary mb-2">Stay Informed</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get the latest health insights delivered to your inbox.
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/#newsletter">Subscribe</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-secondary mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  )
}
