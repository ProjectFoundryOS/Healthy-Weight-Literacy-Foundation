import { ContactForm } from "@/components/forms/contact-form"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata, siteConfig } from "@/lib/seo"
import { contactDeliveryConfigured } from "@/lib/resend"
export const metadata = generatePageMetadata({
  title: "Contact WeightLiteracy",
  description:
    "Questions, corrections, and inquiries for Healthy Weight Literacy Foundation.",
  path: "/contact",
})
export const dynamic = "force-dynamic"
export default function ContactPage() {
  return (
    <InfoPage
      title="Get in touch"
      description="Questions, corrections, and ideas are welcome."
    >
      <h2>Email the Foundation</h2>
      <p>
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </p>
      <p>
        For an article correction, include the page link and the passage you
        want us to check. For partnership, volunteer, or media inquiries,
        include a little background and the best way to reach you.
      </p>
      <p>
        Please do not send medical records or sensitive health information. We
        cannot provide personal medical advice through this inbox.
      </p>
      {contactDeliveryConfigured() ? (
        <div className="not-prose mt-8 rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Send a message</h2>
          <ContactForm />
        </div>
      ) : (
        <p className="rounded-lg bg-muted p-4 text-base">
          The website contact form is temporarily unavailable. Please use the
          email link above.
        </p>
      )}
      <h2>Our location</h2>
      <p>
        {siteConfig.name}
        <br />
        {siteConfig.address.city}, {siteConfig.address.state}
      </p>
    </InfoPage>
  )
}
