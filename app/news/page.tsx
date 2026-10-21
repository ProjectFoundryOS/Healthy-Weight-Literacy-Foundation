import type { Metadata } from "next"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { PageHeader } from "@/components/layout/page-header"
import { NewsCard } from "@/components/content/news-card"
import { getNewsUpdates } from "@/lib/news"
import { generatePageMetadata } from "@/lib/seo"
import { ROUTES } from "@/lib/routes"

export const metadata: Metadata = generatePageMetadata({
  title: "News & Research",
  description: "Selected updates on weight, metabolic health, and medicines—with clear context, evidence limits, and links to original sources.",
  path: "/news",
})

export default function NewsPage() {
  const updates = getNewsUpdates()
  return (
    <>
      <PageHeader title="News & Research" description="What’s changing in weight health—and what it means for you." breadcrumbs={[{ label: "News & Research" }]} />
      <Section className="py-8 sm:py-12 lg:py-12">
        <Container size="md">
          <div className="mb-6 max-w-3xl">
            <p className="text-lg leading-relaxed text-foreground">Selected updates, with context from WeightLiteracy. Dates show when each source was published; evidence labels distinguish early findings from established care.</p>
            <Link href={ROUTES.EDITORIAL_POLICY} className="mt-3 inline-flex min-h-11 items-center text-primary underline underline-offset-4">Our editorial standards</Link>
          </div>
          <div className="space-y-6">{updates.map((item) => <NewsCard key={item.id} item={item} />)}</div>
          <div className="mt-10 rounded-xl bg-primary-soft p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-secondary">Looking for the bigger picture?</h2>
            <p className="mt-3 leading-relaxed">Our educational guides explain the basics behind the headlines, from appetite and metabolism to treatment decisions.</p>
            <Link href={ROUTES.BLOG} className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">Explore our articles</Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
