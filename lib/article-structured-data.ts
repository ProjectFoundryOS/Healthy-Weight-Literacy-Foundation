export interface ArticleSchemaProps {
  title: string
  description: string
  slug: string
  publishedAt: string
  updatedAt?: string
  category: string
  hasMedicalDisclaimer?: boolean
  authorName?: string
  reviewerName?: string
  reviewedAt?: string
}

export function buildArticleSchema(props: ArticleSchemaProps, site: { name: string; url: string }): Record<string, unknown> {
  const medical = new Set(["Metabolic Health", "Medication Literacy", "Weight Literacy", "Education"])
  return {
    "@context": "https://schema.org",
    "@type": medical.has(props.category) || props.hasMedicalDisclaimer ? "MedicalWebPage" : "Article",
    headline: props.title, description: props.description,
    url: `${site.url}/blog/${props.slug}`,
    datePublished: props.publishedAt, dateModified: props.updatedAt || props.publishedAt,
    ...(props.authorName ? { author: { "@type": props.authorName === site.name ? "Organization" : "Person", name: props.authorName } } : {}),
    ...(props.reviewerName && props.reviewedAt ? {
      reviewedBy: { "@type": "Person", name: props.reviewerName }, lastReviewed: props.reviewedAt,
    } : {}),
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  }
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}
