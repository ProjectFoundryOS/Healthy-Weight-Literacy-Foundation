import { siteConfig } from "@/lib/seo"
import { getRevisionHash } from "@/lib/content-registry"
import { getArticleReviewDisclosure } from "@/lib/review-registry"

// Categories that require MedicalWebPage schema instead of Article.
// Values must match exactly the category strings stored in the blog_posts DB table.
const MEDICAL_CATEGORIES = new Set([
  "Metabolic Health",       // DB: confirmed present
  "Medication Literacy",    // DB: confirmed present (covers GLP-1, obesity drugs)
  "Weight Literacy",        // DB: confirmed present (obesity education equivalent)
  "Education",              // DB: confirmed present (general obesity education)
])

function isMedicalCategory(category: string): boolean {
  return MEDICAL_CATEGORIES.has(category)
}

export interface ArticleSchemaProps {
  title: string
  description: string
  slug: string
  publishedAt: string
  updatedAt?: string
  category: string
  /** Visible author name from the article record (post.author) — used here so JSON-LD authorship always matches what the page displays. */
  author: string
  /** Pass true to force MedicalWebPage regardless of category (e.g. article has medical disclaimer) */
  hasMedicalDisclaimer?: boolean
}

function buildAuthorNode(author: string): Record<string, unknown> {
  // Every current article's author field is an organizational name (see
  // Issue #15 audit — no human author identity exists in the corpus), so
  // this is always emitted as an Organization, not a Person.
  return { "@type": "Organization", name: author }
}

/**
 * Issue #15 fix: `reviewedBy`/`lastReviewed` are schema.org's way of
 * claiming a health page was reviewed for medical accuracy. They must
 * never be inferred from `updatedAt` or emitted for an organization simply
 * because it edited/published the article — that overstates an ordinary
 * content update into an implied clinical review. This function reads the
 * same review registry the visible article page reads
 * (lib/review-registry.ts), so JSON-LD can never disagree with what's
 * shown on the page. It only ever reflects a `clinical_evidence_review`
 * or `licensed_medical_review` record whose revision hash matches the
 * article's current content — a plain `editorial_review` (structure/
 * clarity, not medical accuracy) is intentionally never surfaced as a
 * schema.org medical review claim, even though it may be shown in the
 * visible UI (see components/content/article-review-status.tsx).
 */
function buildReviewProperties(slug: string): Record<string, unknown> {
  const revisionHash = getRevisionHash(slug)
  const disclosure = getArticleReviewDisclosure(slug, revisionHash)

  if (disclosure.reviewType !== "clinical_evidence_review" && disclosure.reviewType !== "licensed_medical_review") {
    return {}
  }

  const reviewerNode: Record<string, unknown> =
    disclosure.reviewerType === "human"
      ? {
          "@type": "Person",
          name: disclosure.reviewerName,
          ...(disclosure.credentials && disclosure.credentials.length > 0
            ? {
                hasCredential: disclosure.credentials.map((credential) => ({
                  "@type": "EducationalOccupationalCredential",
                  credentialCategory: credential,
                })),
              }
            : {}),
        }
      : { "@type": "Organization", name: disclosure.reviewerName }

  return {
    reviewedBy: reviewerNode,
    lastReviewed: disclosure.reviewedAt,
  }
}

/** Exported for direct unit testing (see __tests__/article-schema.test.ts). */
export function buildArticleSchema(props: ArticleSchemaProps): Record<string, unknown> {
  const { title, description, slug, publishedAt, updatedAt, category, author, hasMedicalDisclaimer } = props
  const url = `${siteConfig.url}/blog/${slug}`
  const useMedical = isMedicalCategory(category) || hasMedicalDisclaimer === true

  if (useMedical) {
    return {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      headline: title,
      description,
      url,
      datePublished: publishedAt,
      dateModified: updatedAt || publishedAt,
      author: buildAuthorNode(author),
      ...buildReviewProperties(slug),
      medicalAudience: {
        "@type": "MedicalAudience",
        audienceType: "Patient",
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/logo.png`,
        },
      },
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: buildAuthorNode(author),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
  }
}

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
  const articleSchema = buildArticleSchema(props)
  const breadcrumbSchema = buildBreadcrumbSchema(props)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
