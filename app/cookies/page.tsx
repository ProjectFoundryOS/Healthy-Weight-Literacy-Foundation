import type { Metadata } from "next"
import Link from "next/link"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { generatePageMetadata, siteConfig } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Cookie Policy",
  description:
    "Learn about how Healthy Weight Literacy Foundation uses cookies and similar technologies.",
  path: "/cookies",
})

export default function CookiesPage() {
  return (
    <>
      <PageHeader
        title="Cookie Policy"
        description="Last updated: October 20, 2026"
        breadcrumbs={[{ label: "Cookie Policy" }]}
      />

      <Section>
        <Container size="md">
          <div className="prose prose-slate max-w-none">
            <h2>What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your device
              (computer, smartphone, or tablet) when you visit a website. They
              are widely used to make websites work more efficiently and provide
              information to website owners.
            </p>

            <h2>How We Use Cookies</h2>
            <p>
              Healthy Weight Literacy Foundation uses cookies to enhance your
              browsing experience and improve our website functionality. We use
              the following types of cookies:
            </p>

            <h3>Your preferences</h3>
            <p>
              We store your analytics choice in your browser under
              hwlf-cookie-consent. Reading articles and searching the site do
              not require you to accept analytics. Use Cookie preferences in the
              footer to change your choice.
            </p>

            <h3>Analytics Cookies</h3>
            <p>
              With your consent, we use analytics to understand how visitors
              interact with our website. This information helps us improve the
              website and user experience.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_ga</td>
                  <td>
                    Google Analytics 4 - Used to distinguish unique users by
                    assigning a randomly generated number as a client identifier
                  </td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td>{"_ga_<container-id>"}</td>
                  <td>Google Analytics 4 - Used to persist session state</td>
                  <td>2 years</td>
                </tr>
              </tbody>
            </table>
            <ul>
              <li>
                <strong>Vercel Analytics</strong> - Collects anonymous usage
                data to help us understand website performance and visitor
                behavior
              </li>
            </ul>
            <p>
              Analytics cookies collect information in aggregate form to give us
              insight into how visitors use our website and how we can improve
              it.
            </p>

            <h2>External services</h2>
            <p>
              Donation links take you to PayPal, where PayPal’s own cookie and
              privacy policies apply. Other external resources also have their
              own policies.
            </p>
            <h2>Managing Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their
              settings. You can set your browser to refuse cookies or to alert
              you when cookies are being sent. However, if you disable cookies,
              some features of our website may not function properly.
            </p>

            <h3>Browser Controls</h3>
            <p>
              You can control and/or delete cookies through your browser
              settings:
            </p>
            <ul>
              <li>
                <strong>Google Chrome</strong> - Settings &gt; Privacy and
                Security &gt; Cookies
              </li>
              <li>
                <strong>Mozilla Firefox</strong> - Options &gt; Privacy &
                Security &gt; Cookies and Site Data
              </li>
              <li>
                <strong>Safari</strong> - Preferences &gt; Privacy &gt; Cookies
                and website data
              </li>
              <li>
                <strong>Microsoft Edge</strong> - Settings &gt; Privacy, search,
                and services &gt; Cookies
              </li>
            </ul>

            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect
              changes in technology, legislation, or our practices. The updated
              version will be indicated by an updated &ldquo;Last Updated&rdquo;
              date at the top of this page.
            </p>

            <h2>More Information</h2>
            <p>
              For more information about how we collect and use your personal
              data, please see our{" "}
              <Link href="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>
              .
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us
              at:
            </p>
            <p>
              {siteConfig.name}
              <br />
              {siteConfig.address.city}, {siteConfig.address.state}
              <br />
              Email: {siteConfig.email}
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}
