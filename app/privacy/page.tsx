import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { generatePageMetadata, siteConfig } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy",
  description:
    "Learn how the Healthy Weight Literacy Foundation collects, uses, and protects your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        description="Last updated: October 22, 2026"
        breadcrumbs={[{ label: "Privacy Policy" }]}
      />

      <Section>
        <Container size="md">
          <div className="prose prose-slate max-w-none">
            <h2>Introduction</h2>
            <p>
              The Healthy Weight Literacy Foundation (&ldquo;HWLF,&rdquo;
              &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is
              committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you visit our website at <strong>weightliteracy.org</strong> or
              use our services.
            </p>

            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide
              to us when you:
            </p>
            <ul>
              <li>Subscribe to our newsletter</li>
              <li>Complete forms on our website</li>
              <li>Make a donation</li>
              <li>Contact us with inquiries</li>
            </ul>
            <p>
              This information may include your name, email address, and mailing
              address.
            </p>

            <h3>Automatically Collected Information</h3>
            <p>
              When you visit our website, we may automatically collect certain
              information about your device and usage patterns, including IP
              address, browser type, pages visited, and time spent on our site
              through cookies and similar technologies. For more information,
              see our{" "}
              <Link href="/cookies" className="text-primary underline">
                Cookie Policy
              </Link>
              .
            </p>

            <h2>Learning tools and reader voting</h2>
            <p>
              Appointment-planner notes and lesson answers stay in the open page
              and are not sent to us. Reloading or leaving clears them. With
              analytics consent, we may record a completed lesson and its topic,
              without individual answers.
            </p>
            <p>
              Reader topic voting stores your selected editorial topic and a
              one-way identifier for the voting browser in our database. It does
              not require your name, email or health information. A functional
              voting cookie lasts up to 180 days. To limit spam, the server
              derives a daily, one-way identifier from the network address; it
              does not store the raw address in the voting database. Expired
              rate-limit records are removed during subsequent voting activity.
              Our hosting providers may separately process request logs as
              described in this policy.
            </p>
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>
                Provide and improve our educational resources and services
              </li>
              <li>Process donations and send tax receipts</li>
              <li>
                Communicate with you about our programs and educational content
              </li>
              <li>Send newsletters and updates (with your consent)</li>
              <li>Respond to your inquiries and provide support</li>
              <li>Analyze website usage to improve user experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information with:
            </p>
            <ul>
              <li>
                Service providers who assist in our operations (e.g., payment
                processors, email services)
              </li>
              <li>
                Legal authorities when required by law or to protect our rights
              </li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet is 100% secure.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>
                Request deletion of your information (subject to legal
                requirements)
              </li>
              <li>Opt-out of marketing communications at any time</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>

            <h3>California Privacy Rights (CCPA)</h3>
            <p>
              If you are a California resident, you have additional rights under
              the California Consumer Privacy Act (CCPA), including the right to
              know what personal information we collect, the right to delete
              personal information, and the right to opt-out of the sale of
              personal information. We do not sell personal information.
            </p>

            <h3>European Privacy Rights (GDPR)</h3>
            <p>
              If you are located in the European Union, you have rights under
              the General Data Protection Regulation (GDPR), including the right
              to access, rectify, erase, restrict processing, data portability,
              and object to processing of your personal data.
            </p>

            <h2>Analytics</h2>
            <p>
              We use Google Analytics 4 (GA4) to understand how visitors
              interact with our website. GA4 collects information such as pages
              visited, time spent on pages, and how visitors arrived at our
              site. This information is used in aggregate to improve our website
              and content.
            </p>

            <h2>Cookies</h2>
            <p>
              Our website uses cookies to enhance your browsing experience. For
              detailed information about how we use cookies, please see our{" "}
              <Link href="/cookies" className="text-primary underline">
                Cookie Policy
              </Link>
              .
            </p>

            <h2>Children&apos;s Privacy</h2>
            <p>
              Our website is not intended for children under 13. We do not
              knowingly collect personal information from children under 13
              without parental consent. If you believe we have collected
              information from a child under 13, please contact us immediately.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in technology, legislation, or our practices. The updated
              version will be indicated by an updated &ldquo;Last Updated&rdquo;
              date at the top of this page. We encourage you to review this
              policy periodically.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us at:
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
  );
}
