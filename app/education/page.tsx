import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generatePageMetadata } from "@/lib/seo"
import { BookOpen, Heart, Activity, Brain, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getBlogPosts } from "@/lib/content-registry"
import { ROUTES, dynamicRoutes } from "@/lib/routes"

export const metadata: Metadata = generatePageMetadata({
  title: "Education",
  description:
    "Access evidence-based educational resources on nutrition, weight management, and metabolic health from Healthy Weight Literacy Foundation.",
  path: "/education",
})

const categories = [
  {
    icon: BookOpen,
    title: "Nutrition Education",
    description: "Evidence-based information on nutrition science, healthy eating patterns, and dietary choices.",
    matchCategories: ["Nutrition Education", "Nutrition Literacy", "Nutrition"],
  },
  {
    icon: Activity,
    title: "Metabolic Health",
    description: "Understanding metabolism, energy balance, and factors affecting metabolic wellness.",
    matchCategories: ["Metabolic Health"],
  },
  {
    icon: Brain,
    title: "Weight Literacy",
    description: "Science-based education on weight management and sustainable lifestyle decisions.",
    matchCategories: ["Weight Literacy", "Medication Literacy"],
  },
  {
    icon: Heart,
    title: "Public Health Awareness",
    description: "Resources focused on community health, prevention, and health literacy.",
    matchCategories: ["Public Health Awareness"],
  },
]

export default async function EducationPage() {
  const allArticles = await getBlogPosts()
  const recentArticles = allArticles.slice(0, 6)

  return (
    <>
      <PageHeader
        title="Educational Resources"
        description="Evidence-based education to support informed health decisions"
        breadcrumbs={[{ label: "Education" }]}
      />

      {/* Introduction */}
      <Section>
        <Container size="md">
          <div className="text-center">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Our educational resources provide clear, scientifically-grounded information to help you make informed
              decisions about nutrition, weight management, and metabolic health.
            </p>
          </div>
        </Container>
      </Section>

      {/* Categories with Articles */}
      {categories.map((category) => {
        const categoryArticles = allArticles.filter((a) =>
          category.matchCategories.some((c) => c.toLowerCase() === a.category.toLowerCase())
        )
        return (
          <Section key={category.title} background="muted" id={category.title.toLowerCase().replace(/\s+/g, "-")}>
            <Container>
              <div className="flex items-start gap-4 mb-8">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-primary-soft flex items-center justify-center">
                  <category.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">{category.title}</h2>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{category.description}</p>
                </div>
              </div>
              {categoryArticles.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryArticles.slice(0, 3).map((article) => (
                    <Link key={article.slug} href={dynamicRoutes.blogPost(article.slug)} className="group">
                      <Card className="hover:shadow-card-hover transition-shadow flex flex-col h-full">
                        <CardContent className="p-6 flex flex-col flex-1">
                          <div className="mb-3">
                            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary-soft text-primary">
                              {article.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors mb-2 leading-tight line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
                            {article.description}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm text-muted-foreground">{article.reading_time}</span>
                            <span className="text-sm text-primary font-medium group-hover:underline flex items-center gap-1">
                              Read <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Articles for this category are coming soon.
                </p>
              )}
              {categoryArticles.length > 3 && (
                <div className="text-center mt-6">
                  <Button variant="outline" asChild>
                    <Link href={ROUTES.BLOG}>
                      View all {categoryArticles.length} articles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </Container>
          </Section>
        )
      })}

      <Section>
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">Educational Articles</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Evidence-based content on nutrition, weight health, and metabolic wellness
            </p>
          </div>

          {recentArticles.length > 0 ? (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {recentArticles.map((article) => (
                  <Link key={article.slug} href={dynamicRoutes.blogPost(article.slug)} className="group">
                    <Card className="hover:shadow-card-hover transition-shadow flex flex-col h-full">
                      <CardContent className="p-6 flex flex-col flex-1">
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary-soft text-primary">
                            {article.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors mb-3 leading-tight line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
                          {article.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="text-sm text-muted-foreground">{article.reading_time}</span>
                          <span className="text-sm text-primary font-medium group-hover:underline">Read article →</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <Button size="lg" asChild>
                  <Link href={ROUTES.BLOG}>View All Articles</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-lg text-muted-foreground mb-4">
                Educational articles are being prepared and will be published soon.
              </p>
              <p className="text-sm text-muted-foreground">
                Check back regularly for new evidence-based content on nutrition, weight health, and metabolic wellness.
              </p>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
