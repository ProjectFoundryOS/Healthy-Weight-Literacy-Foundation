import { getRevisionHash } from "@/lib/content-registry"
import { getArticleReviewDisclosure } from "@/lib/review-registry"
import { formatDate } from "@/lib/utils"

interface ArticleReviewStatusProps {
  slug: string
  /** Content-update date (published_at/updated_at) — always real, never a review claim. */
  contentUpdatedAt: string
}

/**
 * Issue #15: the single visible place an article's review status is
 * shown. It reads the same lib/review-registry.ts disclosure that
 * components/seo/article-schema.tsx uses for JSON-LD, so the two can never
 * disagree. "Content last updated" (content_update) is always true and
 * always shown — it is never conflated with an editorial, evidence, or
 * licensed medical review, which are separate event types that only
 * display here when a real, hash-matched record exists.
 */
export function ArticleReviewStatus({ slug, contentUpdatedAt }: ArticleReviewStatusProps) {
  const revisionHash = getRevisionHash(slug)
  const disclosure = getArticleReviewDisclosure(slug, revisionHash)

  return (
    <div className="text-sm text-muted-foreground space-y-1">
      <p>Content last updated: {formatDate(contentUpdatedAt)}</p>
      {disclosure.reviewType === "licensed_medical_review" && (
        <p>
          Medically reviewed by {disclosure.reviewerName}
          {disclosure.credentials && disclosure.credentials.length > 0 ? `, ${disclosure.credentials.join(", ")}` : ""}
          {" "}on {formatDate(disclosure.reviewedAt as string)}.
        </p>
      )}
      {disclosure.reviewType === "clinical_evidence_review" && (
        <p>
          Evidence reviewed by {disclosure.reviewerName} on {formatDate(disclosure.reviewedAt as string)}.
        </p>
      )}
      {disclosure.reviewType === "editorial_review" && (
        <p>Editorially reviewed on {formatDate(disclosure.reviewedAt as string)}.</p>
      )}
      {disclosure.reviewType === null && (
        <p>
          This article has not yet completed a dedicated evidence or clinical review under our V5 editorial process.
          See our{" "}
          <a href="/medical-review" className="underline hover:text-primary">
            Medical Review Process
          </a>{" "}
          page for what that means.
        </p>
      )}
    </div>
  )
}
