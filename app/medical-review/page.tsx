import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import { PolicyLayout } from "@/components/layout/policy-layout"
import type { TocItem } from "@/components/layout/policy-layout"
import { getReviewRegistryStats } from "@/lib/review-stats"

export const metadata: Metadata = generatePageMetadata({
  title: "Medical Review Process | WeightLiteracy.org",
  description:
    "Our review framework for clinical health content — what editorial, clinical-evidence, and licensed medical review each mean, our current review status, and what a completed review represents.",
  path: "/medical-review",
})

const toc: TocItem[] = [
  { id: "current-status", label: "Current Status" },
  { id: "what-gets-reviewed", label: "What Gets Reviewed" },
  { id: "what-review-covers", label: "What Review Covers" },
  { id: "what-review-does-not-cover", label: "What Review Does Not Cover" },
  { id: "review-frequency", label: "Review Frequency" },
  { id: "our-standard", label: "Our Standard" },
]

export default function MedicalReviewPage() {
  const stats = getReviewRegistryStats()

  return (
    <PolicyLayout
      title="Medical Review Process"
      lastUpdated="August 2026"
      toc={toc}
    >
      <p>
        The Healthy Weight Literacy Foundation publishes content that covers medications, metabolic conditions, and
        other topics where accuracy has real consequences for readers. This page describes our review framework —
        what each type of review means and what it evaluates when performed — and separately states our actual
        current review status, computed directly from our review records, so this page can never drift out of sync
        with what has actually been reviewed.
      </p>

      <h2 id="current-status">Current Status</h2>
      <p>
        Our editorial team does not currently include licensed medical professionals, and we do not have a licensed
        clinical review program in place today.
      </p>
      <p>
        Of {stats.publishedArticleCount} published articles: {stats.licensedMedicalReviewedCount} have completed a
        licensed medical review, {stats.clinicalEvidenceReviewedCount} have completed a clinical-evidence review,{" "}
        {stats.editoriallyReviewedCount} have completed an editorial review, and {stats.unreviewedCount} have not yet
        completed any documented review under this framework. These counts are computed from our review records
        every time this page is generated, not written by hand.
      </p>
      <p>
        Every published article shows its real review status — including &ldquo;not yet reviewed&rdquo; — in a Content Review
        Status section on the article itself, and in the same structured data search engines read. We do not display
        or emit a review claim that isn&apos;t backed by an actual, recorded review of that exact version of the
        article. We are auditing our published articles against this framework in stages; as reviews are completed,
        the counts above and the affected articles will update to show the real reviewer, review type, and date.
      </p>

      <h2 id="what-gets-reviewed">What Gets Reviewed</h2>
      <p>
        Not all content carries the same medical risk. This is how we categorize articles and the review depth each
        category is intended to receive once reviewed under this framework.
      </p>
      <p>
        <strong>Clinical content</strong> — articles covering specific medications, dosing, side effects,
        contraindications, or clinical outcomes — is intended to receive the most rigorous review. This includes all
        GLP-1 medication articles, compound pharmacy guidance, metabolic health content, and any article making
        specific claims about medication efficacy or safety.
      </p>
      <p>
        <strong>Patient guidance content</strong> — articles covering what to ask a provider, how to interpret a
        medical situation, or how to find reliable health information — is reviewed for accuracy, appropriate hedging,
        and absence of content that could be read as individual medical advice.
      </p>
      <p>
        <strong>Educational and consumer content</strong> — articles covering obesity as a chronic disease, nutrition
        basics, exercise guidance, or scam awareness — is reviewed for factual accuracy and for the absence of harmful
        claims or unsafe implications.
      </p>

      <h2 id="what-review-covers">What Review Covers</h2>
      <p>When a clinical-evidence or licensed medical review is performed on an article, it evaluates:</p>
      <p>
        <strong>Claim accuracy</strong> — Are the specific claims made in the article consistent with current
        published evidence? Are trial results cited correctly? Are mechanism descriptions accurate?
      </p>
      <p>
        <strong>Source quality</strong> — Are claims attributed to appropriate sources? Peer-reviewed trials, FDA
        prescribing information, major health authority publications, and established clinical guidelines are acceptable
        sources. Manufacturer press releases, non-peer-reviewed commentary, and secondary aggregators are not used as
        primary sources.
      </p>
      <p>
        <strong>Hedging appropriateness</strong> — Does the article correctly represent the certainty of the evidence?
        Claims that are well-established are presented as such. Claims that are preliminary, debated, or
        population-specific are qualified accordingly.
      </p>
      <p>
        <strong>Safety and harm risk</strong> — Could any passage be misread in a way that leads a patient to delay
        seeking care, make changes to their medication incorrectly, or make a clinical decision without appropriate
        provider guidance? Review identifies and corrects these passages.
      </p>
      <p>
        <strong>Contraindication completeness</strong> — For articles covering medications, review confirms that
        relevant contraindications, precautions, and populations for whom the medication is not appropriate are
        addressed.
      </p>
      <p>
        <strong>Disclaimer placement</strong> — Are medical disclaimers present at appropriate points in the article?
        Clinical content requires a disclaimer at both the top and bottom of the article at minimum.
      </p>

      <h2 id="what-review-does-not-cover">What Review Does Not Cover</h2>
      <p>
        Medical review is an accuracy and safety process. Our review process confirms that articles are factually
        sound and do not contain harmful guidance. It does not constitute a recommendation of any specific medication
        or approach for any specific person.
      </p>
      <p>
        Nothing published on WeightLiteracy.org is medical advice. Our content is educational. Readers should always
        work with a qualified healthcare provider for decisions about their own health.
      </p>

      <h2 id="review-frequency">Review Frequency</h2>
      <p>
        Once an article has completed its first clinical-evidence or licensed medical review, our target is to
        re-review it based on how quickly the relevant medical landscape is likely to change: at least annually for
        articles covering FDA-approved medications and clinical trial evidence, and more frequently for articles
        covering areas of active regulatory or policy change, such as drug access and compound pharmacy rules.
      </p>
      <p>
        When a significant development occurs in a covered area — a new FDA warning, a major trial publication, a
        guideline update — the relevant articles are intended to be flagged for out-of-cycle review regardless of
        their scheduled date.
      </p>
      <p>
        Any review date shown on an article reflects an actual completed clinical-evidence or licensed medical
        review of that exact version of the article, and is always distinct from the article&apos;s content-update
        date. An article that has not completed a review shows no review date.
      </p>

      <h2 id="our-standard">Our Standard</h2>
      <p>
        Our standard for publication is that a patient or caregiver who reads and follows the guidance in an article
        should be better prepared for a conversation with their healthcare provider — not harmed, misled, or left with
        false certainty about a complex clinical situation.
      </p>
      <p>When an article cannot meet that standard, it is revised or not published.</p>
    </PolicyLayout>
  )
}
