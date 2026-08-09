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
import { getBlogPost, getBlogPosts } from "@/lib/content-registry"
import { generatePageMetadata, siteConfig } from "@/lib/seo"
import { formatDate } from "@/lib/utils"
import { ArticleSchema } from "@/components/seo/article-schema"
import { ArticleRenderer } from "@/components/content/article-renderer"
import { Clock } from "lucide-react"

// Legacy HTML rows are normalized to Markdown once, at content-registry
// load time (see lib/content-normalize.ts). By the time content reaches
// this page it is always Markdown, so no jsdom-backed sanitizer runs in
// this server route (Issue #24). react-markdown does not execute raw HTML
// embedded in its input without the (unused) rehype-raw plugin, so this
// path has no DOM-parsing dependency at request time.

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

  return (
    <>
      <ArticleSchema
        title={post.title}
        description={post.description}
        slug={post.slug}
        publishedAt={post.published_at}
        updatedAt={post.updated_at ?? undefined}
        category={post.category}
      />

      <PageHeader title={post.title} breadcrumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            <Image
              src={post.author_image || "/placeholder.svg?height=40&width=40&query=author+portrait"}
              alt={post.author}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-medium text-secondary">{post.author}</p>
              <p className="text-sm text-muted-foreground">{formatDate(post.published_at)}</p>
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
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            {/* Main Content */}
            <div>
              <Image
                src={post.hero_image || "/placeholder.svg?height=600&width=1200&query=article+hero+image"}
                alt={post.title}
                width={1200}
                height={600}
                className="rounded-2xl shadow-card mb-8 w-full h-auto"
                priority
                loading="eager"
              />

              {/* Article Content */}
              <ArticleRenderer content={post.content} />

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-secondary mb-6">Related Articles</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {relatedPosts.map((relatedPost) => (
                      <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                        <Card className="hover-lift h-full">
                          <CardContent className="p-6">
                            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                              <Image
                                src={relatedPost.hero_image || "/placeholder.svg?height=200&width=400&query=blog+post"}
                                alt={relatedPost.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <Badge variant="secondary" className="mb-2">
                              {relatedPost.category}
                            </Badge>
                            <h3 className="font-bold text-lg mb-2 text-secondary line-clamp-2">{relatedPost.title}</h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{relatedPost.description}</p>
                            <span className="text-primary font-medium text-sm">Read more →</span>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Author Bio */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-secondary mb-4">About the Author</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={post.author_image || "/placeholder.svg?height=60&width=60&query=author+portrait"}
                      alt={post.author}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
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
              </Card>

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
                    <Badge variant="outline">Nutrition</Badge>
                    <Badge variant="outline">Exercise</Badge>
                    <Badge variant="outline">Mental Health</Badge>
                    <Badge variant="outline">Wellness</Badge>
                    <Badge variant="outline">Prevention</Badge>
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
