import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import { PolicyLayout } from "@/components/layout/policy-layout"
import type { TocItem } from "@/components/layout/policy-layout"

export const metadata: Metadata = generatePageMetadata({
  title: "Evidence & Editorial Standards | WeightLiteracy.org",
  description: "How WeightLiteracy.org evaluates sources, checks health claims, and handles uncertainty and corrections.",
  path: "/medical-review",
})

const toc: TocItem[] = [
  { id: "sources", label: "Choosing Sources" },
  { id: "claims", label: "Checking Claims" },
  { id: "safety", label: "Safety and Context" },
  { id: "updates", label: "Updates and Corrections" },
]

export default function EvidenceStandardsPage() {
  return (
    <PolicyLayout title="Evidence & Editorial Standards" lastUpdated="October 19, 2026" toc={toc}>
      <p>
        Health information should help readers understand their options and prepare for conversations with their
        healthcare providers. These standards guide how we select sources, evaluate claims, and prepare articles
        for publication.
      </p>

      <h2 id="sources">Choosing Sources</h2>
      <p>
        For medication approval, approved uses, and product warnings, we consult current FDA information and
        prescribing information. For research findings, we examine the relevant study and consider its methods,
        participants, results, and limitations. Systematic reviews, professional guidelines, and public health
        resources provide additional context.
      </p>
      <p>
        Early results announced by a manufacturer are identified as company-reported findings. A press release
        cannot establish more than it reports, and a study listing does not establish that a treatment works.
        Where full results are unavailable, we make that limitation clear.
      </p>

      <h2 id="claims">Checking Claims</h2>
      <p>
        Our standard is to trace consequential health claims to supporting sources and check that the wording
        matches the evidence. This includes numbers, units, timeframes, study populations, and the distinction
        between an association and a cause.
      </p>
      <p>
        Group averages do not predict an individual&apos;s outcome. Results from separate studies are not a direct
        comparison between treatments. Charts follow the same sourcing and context requirements as the text.
        Claims with unresolved evidence problems must be corrected, narrowed, or removed before publication.
      </p>

      <h2 id="safety">Safety and Context</h2>
      <p>
        Medication articles should explain relevant risks alongside potential benefits, distinguish approved uses
        from investigational uses, and avoid instructions that invite readers to diagnose themselves or change
        treatment on their own. An educational article cannot replace the full prescribing information or a
        discussion with a healthcare professional who knows the reader&apos;s circumstances.
      </p>
      <p>
        Titles, summaries, illustrations, and related links must preserve the article&apos;s meaning. They should
        not imply guaranteed results, product endorsement, or certainty that the evidence does not support.
      </p>

      <h2 id="updates">Updates and Corrections</h2>
      <p>
        Publication and update dates reflect actual editorial activity. A new warning, regulatory decision, or
        important research finding may require an earlier update. Our <a href="/editorial-policy">Editorial Policy</a>
        {" "}describes how we handle corrections and review priorities. Readers can report a concern through our
        {" "}<a href="/contact">contact page</a>.
      </p>
    </PolicyLayout>
  )
}
