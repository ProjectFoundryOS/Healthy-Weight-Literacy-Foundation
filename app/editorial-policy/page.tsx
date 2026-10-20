import type { Metadata } from "next"
import { generatePageMetadata, siteConfig } from "@/lib/seo"
import { PolicyLayout } from "@/components/layout/policy-layout"
import type { TocItem } from "@/components/layout/policy-layout"

export const metadata: Metadata = generatePageMetadata({
  title: "Editorial Policy | WeightLiteracy.org",
  description:
    "The standards that govern what WeightLiteracy.org publishes, how editorial decisions are made, and what we will not publish.",
  path: "/editorial-policy",
})

const toc: TocItem[] = [
  { id: "mission-and-purpose", label: "Mission and Editorial Purpose" },
  { id: "what-we-cover", label: "What We Cover" },
  { id: "what-we-do-not-cover", label: "What We Do Not Cover" },
  { id: "medical-claims", label: "How We Handle Medical Claims" },
  { id: "corrections", label: "Corrections Policy" },
  { id: "content-review", label: "Content Review and Updates" },
  { id: "independence", label: "Independence Statement" },
]

export default function EditorialPolicyPage() {
  return (
    <PolicyLayout
      title="Editorial Policy"
      lastUpdated="October 19, 2026"
      toc={toc}
    >
      <p>
        The Healthy Weight Literacy Foundation publishes educational content about healthy weight, obesity as a chronic
        disease, metabolic health, weight-related conditions, nutrition, and related consumer health topics.
      </p>
      <p>
        This page describes the standards that govern what we publish, how we make editorial decisions, and what we will
        not publish.
      </p>

      <h2 id="mission-and-purpose">Our Mission and Editorial Purpose</h2>
      <p>Our purpose is education, not promotion.</p>
      <p>
        Every article we publish is intended to help patients, caregivers, and consumers make better-informed
        decisions — not to sell products, drive clinical referrals, or advance any commercial interest. The Foundation
        does not accept advertising, does not accept sponsored content, and does not receive compensation from
        pharmaceutical manufacturers, supplement companies, or any other commercial entity in exchange for editorial
        coverage.
      </p>
      <p>
        When we cover a medication, provider type, or product category, we do so because the topic is relevant to our
        readers&apos; health decisions — not because anyone paid us to cover it.
      </p>

      <h2 id="what-we-cover">What We Cover</h2>
      <p>We publish educational content across these topic areas:</p>
      <ul>
        <li>
          GLP-1 medications and other obesity medications — mechanisms, evidence, patient guidance, access, and cost
        </li>
        <li>
          Obesity as a chronic disease — biology, stigma, and the scientific evidence base
        </li>
        <li>
          Metabolic health — including blood sugar regulation, insulin resistance, and related conditions
        </li>
        <li>Nutrition and protein guidance for people managing their weight</li>
        <li>Exercise literacy for people with obesity or overweight</li>
        <li>
          Compound pharmacy literacy and what patients should understand about non-FDA-approved formulations
        </li>
        <li>Weight loss scams, deceptive marketing, and consumer protection</li>
        <li>Patient advocacy, weight stigma, and behavioral support</li>
        <li>Mindset and long-term weight management</li>
      </ul>

      <h2 id="what-we-do-not-cover">What We Do Not Cover</h2>
      <p>We do not publish:</p>
      <ul>
        <li>Sponsored or advertiser-influenced content of any kind</li>
        <li>Promotional reviews of specific commercial products or services</li>
        <li>Content that recommends a specific medication or intervention for a specific person</li>
        <li>Articles designed to generate leads for any commercial entity</li>
        <li>
          Miracle framing, before-and-after narratives designed to create false expectations, or sensationalized
          health claims
        </li>
        <li>Content that presents unproven approaches as established medical fact</li>
      </ul>

      <h2 id="medical-claims">How We Handle Medical Claims</h2>
      <p>We treat medical claim accuracy as the highest editorial priority.</p>
      <ul>
        <li>
          Claims about medication or intervention efficacy are attributed to named published sources (clinical trials,
          FDA prescribing information, peer-reviewed journals, major health authority publications)
        </li>
        <li>
          We distinguish between what the evidence establishes and what is still uncertain or debated
        </li>
        <li>We do not present off-label medication use as routine or universally safe</li>
        <li>
          We include medical disclaimers on all content involving clinical decisions or medications
        </li>
        <li>
          We identify the specific type of evidence behind major claims (clinical trial, meta-analysis, observational
          study, expert consensus, etc.)
        </li>
      </ul>
      <p>
        When evidence is limited or conflicting, we say so clearly rather than presenting false certainty.
      </p>

      <h2 id="corrections">Corrections Policy</h2>
      <p>
        When an error is identified in published content — factual, interpretive, or attributional — we correct it
        promptly.
      </p>
      <p>
        Corrections are made to the live article. Significant corrections include a correction notice at the top of the
        article describing what changed and when. Minor corrections (grammar, spelling, broken links) are made without
        notice.
      </p>
      <p>
        If you believe an article contains an error, contact us at{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
      </p>

      <h2 id="content-review">Content Review and Updates</h2>
      <p>
        Health information changes. Medications receive new warnings. Coverage policies shift. Clinical guidelines are
        revised.
      </p>
      <p>
        We plan review dates based on how quickly the underlying information is likely to change. Our target
        intervals are:
      </p>
      <ul>
        <li>
          Stable health-literacy lessons: every 12 months
        </li>
        <li>
          General weight and health education: every 6 months
        </li>
        <li>
          Medication evidence and patient guidance: every 3 months
        </li>
        <li>
          Rapidly changing drug access, regulatory developments, and investigational treatments: monthly
        </li>
      </ul>
      <p>
        These are planning targets. A significant warning or correction takes priority over the schedule.
        Editorial review dates record completed checks; publication dates are not refreshed simply to make a page
        appear newer. The editor checks review due dates before renewed promotion.
      </p>

      <h2 id="independence">Independence Statement</h2>
      <p>
        The Healthy Weight Literacy Foundation is a nonprofit organization. Our editorial decisions are made
        independently by our editorial team and are not influenced by donors, sponsors, pharmaceutical manufacturers,
        or any commercial partner.
      </p>
      <p>
        We do not sell advertising. We do not accept sponsored content. We do not participate in affiliate marketing
        programs on content that is eligible for our Google Ad Grant or similar nonprofit programs.
      </p>
      <p>
        If this policy changes in any material way, we will update this page and note the change date.
      </p>
    </PolicyLayout>
  )
}
