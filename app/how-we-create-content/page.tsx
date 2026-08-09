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
      lastUpdated="August 2026"
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
      <p>
        Our V5 editorial standard, applied to new and revised content, is that every factual claim in a published
        article is either:
      </p>
      <ul>
        <li>
          Attributed to a named published source inline — a clinical trial, FDA document, peer-reviewed journal
          article, or major health authority publication — or
        </li>
        <li>Stated as general medical consensus and qualified accordingly</li>
      </ul>
      <p>
        Under this standard, we do not publish new or revised content containing specific statistics, outcome
        figures, or mechanistic claims without inline attribution. If a claim cannot be sourced, it is generalized or
        removed.
      </p>
      <p>
        Our standard is that sources are listed at the end of every clinical article, following a hierarchy:
        peer-reviewed primary research, systematic reviews, FDA prescribing information and regulatory documents,
        major health authority publications. Manufacturer materials, press releases, and secondary aggregators are
        not used as primary sources.
      </p>
      <p>
        This is the standard against which we are actively auditing our existing published corpus — it is not yet
        true of every currently published article. For example, our Set Point Theory article currently states a
        specific defended-weight range without inline claim-level attribution, backed only by a generic source list
        further down the page. We are not going to claim our legacy corpus already meets this standard, and we will
        not represent an individual article as meeting it until it actually does (see Current Status on our{" "}
        <a href="/medical-review">Medical Review Process</a> page).
      </p>

      <h2 id="the-review-process">The Review Process</h2>
      <p>
        This is the review process we apply, and the process our published corpus is being progressively audited
        against. It has three intended stages, described below. Not every currently published article has completed
        all three — see{" "}
        <a href="/medical-review">Medical Review Process</a> for the real, current review status framework, and each
        article&apos;s own Content Review Status section for that article&apos;s actual status.
      </p>
      <p>
        <strong>Editorial review</strong> covers structure, clarity, tone, and adherence to the brief. Reviewers
        check that the article does not overstate evidence, does not present uncertain findings as established fact,
        and does not contain language that could be read as directing a specific person toward a specific clinical
        decision.
      </p>
      <p>
        <strong>Clinical-evidence / medical review</strong> for clinical content covers claim accuracy, source
        quality, contraindication completeness, harm risk, and appropriate hedging. This requires either a documented
        evidence review or, for a &ldquo;licensed medical review&rdquo; claim specifically, a real, verified, credentialed human
        reviewer — never an assumption based on category or an AI audit. The specific scope of this review is
        described on our <a href="/medical-review">Medical Review Process</a> page.
      </p>
      <p>
        <strong>Compliance review</strong> checks for absolute claims that should be hedged, statistics without
        attribution, language that could constitute individual medical advice, and omissions that could mislead
        readers about risk or appropriate use.
      </p>
      <p>
        Our standard is that an article which does not pass all applicable stages is revised, not published with
        known problems and corrected afterward. Articles already public before this standard existed are being
        brought into compliance with it in stages, not all at once.
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
          If the article has completed a clinical-evidence or licensed medical review, the review date and next
          scheduled review date are set correctly based on how quickly the content is likely to change; if it has
          not, no review date is shown
        </li>
        <li>
          The article does not contain content that could cause a reader to delay appropriate care or make a clinical
          decision without provider guidance
        </li>
      </ul>

      <h2 id="medical-disclaimers">Medical Disclaimers</h2>
      <p>
        Our standard is that every article covering medications, clinical conditions, or health decisions includes
        this disclaimer or a close equivalent:
      </p>
      <blockquote>
        This article is for educational purposes only. It is not medical advice, diagnosis, or a recommendation for
        any specific course of action. Talk to a qualified healthcare provider before making any changes to your
        health plan.
      </blockquote>
      <p>
        The site-wide{" "}
        <a href="/medical-disclaimer">Medical Disclaimer</a> applies to all content regardless of whether an
        individual article also carries this notice inline. We are auditing our published corpus to confirm the
        inline disclaimer is present everywhere our standard requires it.
      </p>
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
