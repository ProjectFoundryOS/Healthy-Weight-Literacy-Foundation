import type { Metadata } from "next"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { generatePageMetadata, siteConfig } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Transparency | Healthy Weight Literacy Foundation",
  description:
    "Learn how Healthy Weight Literacy Foundation operates, uses resources, and upholds its commitment to public benefit and responsible stewardship.",
  path: "/transparency",
})

export default function TransparencyPage() {
  return (
    <>
      <PageHeader
        title="Transparency"
        description="Our commitment to clear, responsible, and mission-aligned operations."
        breadcrumbs={[{ label: "Transparency" }]}
      />

      <Section>
        <Container size="md">
          <div className="prose prose-slate max-w-none">
            <h2>Our Public-Benefit Purpose</h2>
            <p>
              Healthy Weight Literacy Foundation is organized and operated
              exclusively for educational and public-benefit purposes. Our work
              is focused on improving public understanding of weight health,
              obesity, and evidence-based health information. We exist to make
              accurate health information more accessible — not to generate
              revenue, sell products, or provide individualized medical
              services.
            </p>

            <h2>How We Use Our Resources</h2>
            <p>
              Resources received by the Foundation are directed toward
              activities consistent with our educational mission. These include:
            </p>
            <ul>
              <li>
                Developing and maintaining educational content on weight health
                topics
              </li>
              <li>Public outreach and awareness efforts</li>
              <li>Website operations and content accessibility</li>
              <li>Organizational governance and compliance</li>
            </ul>
            <p>
              We currently have no telehealth referral or affiliate arrangement.
              If that changes, any relevant financial relationship will be
              disclosed alongside the affected links and recommendations.
            </p>

            <h2>Nonprofit Status</h2>
            <p>
              Healthy Weight Literacy Foundation is a 501(c)(3) nonprofit
              organization. Our EIN is <strong>{siteConfig.ein}</strong>.
              Contributions to the Foundation may be tax-deductible to the
              extent allowed by law. We encourage donors and the public to
              consult a qualified tax advisor regarding deductibility.
            </p>

            <h2>Organization information</h2>
            <p>
              For questions about governance or available financial records, see
              our <a href="/financials">financial information page</a> or
              contact the Foundation.
            </p>

            <h2>Separation of Content and Funding</h2>
            <p>
              We are committed to maintaining a clear separation between our
              educational content and any organizational funding sources or
              partnerships. Our editorial and content decisions are guided by
              our educational mission, not by funding relationships. For more on
              how we develop content, see our{" "}
              <a href="/editorial-policy" className="text-primary underline">
                Editorial Policy
              </a>
              .
            </p>

            <h2>Our Commitment</h2>
            <p>
              We are committed to operating with integrity, maintaining public
              trust, and serving the communities we exist to support. If you
              have questions about our operations, governance, or use of
              resources, you may contact us directly.
            </p>

            <h2>Contact</h2>
            <p>
              {siteConfig.name}
              <br />
              {siteConfig.address.city}, {siteConfig.address.state}
              <br />
              Email:{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-primary underline"
              >
                {siteConfig.email}
              </a>
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}
