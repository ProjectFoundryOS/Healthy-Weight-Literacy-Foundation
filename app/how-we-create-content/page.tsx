import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import { PolicyLayout } from "@/components/layout/policy-layout"
import type { TocItem } from "@/components/layout/policy-layout"

export const metadata: Metadata = generatePageMetadata({
  title: "How We Create Content | WeightLiteracy.org",
  description:
    "How articles on WeightLiteracy.org are created, sourced, reviewed, and published — including our editorial brief process, sourcing standards, and pre-publication checklist.",
  path: "/how-we-create-content",
})

const toc: TocItem[] = [
  { id: "where-articles-come-from", label: "Where Articles Come From" },
  { id: "how-articles-are-structured", label: "How Articles Are Structured" },
  { id: "sourcing-standards", label: "Sourcing Standards" },
  { id: "the-review-process", label: "The Review Process" },
  { id: "pre-publish-checklist", label: "What We Check Before Publishing" },
  { id: "medical-disclaimers", label: "Medical Disclaimers" },
  { id: "corrections-and-updates", label: "Corrections and Updates" },
  { id: "what-we-do-not-do", label: "What We Do Not Do" },
  { id: "our-standard", label: "Our Standard in Plain Language" },
]

export default function HowWeCreateContentPage() {
  return (
    <PolicyLayout
      title="How We Create Content"
      lastUpdated="October 19, 2026"
      toc={toc}
    >
      <p>
        This page describes how articles on WeightLiteracy.org are created, reviewed, and published. We publish this
        because transparency about editorial process is part of what makes health content trustworthy.
      </p>

      <h2 id="where-articles-come-from">Where Articles Come From</h2>
      <p>
        Articles begin as topics selected by our editorial team based on what our readers actually need to know.
      </p>
      <p>
        Topic selection is driven by three questions: Is this something patients, caregivers, or consumers are
        genuinely confused about? Is accurate, non-promotional information on this topic hard to find? Does this fit
        our educational mission?
      </p>
      <p>
        We do not accept topic suggestions from commercial entities. Topics are not chosen based on advertising
        relationships, affiliate arrangements, or external promotional pressure.
      </p>

      <h2 id="how-articles-are-structured">How Articles Are Structured</h2>
      <p>
        Before any article is written, the editorial team produces a brief that defines:
      </p>
      <ul>
        <li>The specific question the article answers</li>
        <li>Who the intended reader is and what they already know</li>
        <li>What the article must not claim, imply, or promise</li>
        <li>Which published sources are expected to support the key claims</li>
        <li>What the reader should understand or be able to do after reading</li>
      </ul>
      <p>
        This brief governs the entire article. An article that drifts from its brief — into overclaiming,
        underclaiming, or serving a different purpose than the one it was assigned — is revised before it advances.
      </p>

      <h2 id="sourcing-standards">Sourcing Standards</h2>
      <p>Consequential health claims need identifiable supporting evidence. We use:</p>
      <ul>
        <li>
          Current prescribing information and FDA documents for product-specific approval, uses, and warnings
        </li>
        <li>Relevant research, systematic reviews, professional guidelines, and public health resources for other health claims</li>
      </ul>
      <p>
        We do not publish specific statistics, outcome figures, or mechanistic claims without inline attribution. If a
        claim cannot be supported, it is removed or rewritten to match evidence we can verify.
      </p>
      <p>
        Sources are linked alongside relevant claims. Company announcements may be used to explain newly reported
        research, with their origin and limitations made clear. They do not substitute for complete study results
        or establish regulatory approval.
      </p>

      <h2 id="the-review-process">The Review Process</h2>
      <p>Our publication standard combines evidence checks, safety checks, and editorial approval.</p>
      <p>
        <strong>Editorial review</strong> covers structure, clarity, tone, and adherence to the brief. Reviewers
        check that the article does not overstate evidence, does not present uncertain findings as established fact,
        and does not contain language that could be read as directing a specific person toward a specific clinical
        decision.
      </p>
      <p>
        <strong>Evidence checks</strong> examine whether the sources support the claims, whether numbers and
        comparisons are accurate, and whether important limitations are explained. Our{" "}
        <a href="/medical-review">Evidence &amp; Editorial Standards</a> describe this approach.
      </p>
      <p>
        <strong>Safety checks</strong> look for absolute claims that should be qualified, statistics without
        attribution, language that could constitute individual medical advice, and omissions that could mislead
        readers about risk or appropriate use.
      </p>
      <p>
        Unresolved problems must be corrected before an article is approved for publication.
      </p>

      <h2 id="pre-publish-checklist">What We Check Before Publishing</h2>
      <p>Before an article is published, we confirm:</p>
      <ul>
        <li>All major claims are attributed to named sources</li>
        <li>Medical disclaimers are present where required</li>
        <li>
          The article includes a &ldquo;Who This May Not Be Appropriate For&rdquo; section where relevant
        </li>
        <li>
          The article distinguishes between what evidence has established and what remains uncertain
        </li>
        <li>
          Every benefit or positive finding described in a clinical context is accompanied by a relevant limitation,
          exception, or uncertainty in the same section
        </li>
        <li>
          The review date and next scheduled review date are set correctly based on how quickly the content is likely
          to change
        </li>
        <li>
          The article does not contain content that could cause a reader to delay appropriate care or make a clinical
          decision without provider guidance
        </li>
      </ul>

      <h2 id="medical-disclaimers">Medical Disclaimers</h2>
      <p>
        All articles covering medications, clinical conditions, or health decisions include this disclaimer or a close
        equivalent:
      </p>
      <blockquote>
        This article is for educational purposes only. It is not medical advice, diagnosis, or a recommendation for
        any specific course of action. Talk to a qualified healthcare provider before making any changes to your
        health plan.
      </blockquote>
      <p>
        The presence of a disclaimer does not make a harmful article safe. Our review process is designed to ensure
        that the article itself is sound — the disclaimer is not a substitute for accuracy.
      </p>

      <h2 id="corrections-and-updates">Corrections and Updates</h2>
      <p>
        Health information changes. When an article contains an error or when the underlying evidence has materially
        changed, we update it.
      </p>
      <p>
        Our approach to corrections is described in our{" "}
        <a href="/editorial-policy">Editorial Policy</a>. Our approach to scheduled content review — including how
        often different types of articles are re-reviewed — is also described there.
      </p>

      <h2 id="what-we-do-not-do">What We Do Not Do</h2>
      <p>
        We do not publish sponsored content. We do not write promotional articles in exchange for payment or other
        consideration. We do not allow advertisers or commercial partners to influence editorial decisions, topic
        selection, or article framing.
      </p>
      <p>
        We do not use patient testimonials as evidence of efficacy. We do not use before-and-after narratives to
        imply results. We do not publish content that presents anecdote as data.
      </p>
      <p>
        We do not publish articles that cannot be sourced, hedged, and reviewed to our editorial standard —
        regardless of how useful the topic might otherwise be to cover.
      </p>

      <h2 id="our-standard">Our Standard in Plain Language</h2>
      <p>
        We publish content we would want a family member to read before making a health decision. That means it needs
        to be accurate, honest about uncertainty, clear about what it is and is not, and free of any incentive to
        mislead.
      </p>
      <p>When an article falls short of that standard, it does not get published.</p>
    </PolicyLayout>
  )
}
