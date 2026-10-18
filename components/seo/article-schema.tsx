import { siteConfig } from "@/lib/seo"
import { buildArticleSchema, serializeStructuredData, type ArticleSchemaProps } from "@/lib/article-structured-data"

function buildBreadcrumbSchema(props: Pick<ArticleSchemaProps, "title" | "slug">): Record<string, unknown> {
  const { title, slug } = props
  const articleUrl = `${siteConfig.url}/blog/${slug}`

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Education",
        item: `${siteConfig.url}/education`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: articleUrl,
      },
    ],
  }
}

/**
 * ArticleSchema — renders Article (or MedicalWebPage) + BreadcrumbList JSON-LD
 * into the document <head> via Next.js script tags.
 *
 * Place this component inside the page that renders a blog article.
 * It is a Server Component — no client bundle overhead.
 */
export function ArticleSchema(props: ArticleSchemaProps) {
  const articleSchema = buildArticleSchema(props, siteConfig)
  const breadcrumbSchema = buildBreadcrumbSchema(props)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(breadcrumbSchema) }}
      />
    </>
  )
}
