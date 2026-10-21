import Link from "next/link"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Contribute & volunteer",
  description: "Share your skills to support accessible education.",
  path: "/volunteer",
})
export default function Page() {
  return (
    <InfoPage
      title={"Contribute & volunteer"}
      description={"Share your skills to support accessible education."}
    >
      <h2>Tell us how you would like to help</h2>
      <p>
        Interested in writing, checking sources, improving accessibility, or
        helping people find useful information? Get in touch with a short
        description of your experience and the time you may be able to offer.
      </p>
      <p>
        Specific roles and projects are discussed individually. An inquiry does
        not commit you to a schedule.
      </p>
      <p>
        <a href="mailto:info@weightliteracy.org?subject=Volunteer%20inquiry">
          Email a volunteer inquiry
        </a>{" "}
        or <Link href="/contact">visit our contact page</Link>.
      </p>
    </InfoPage>
  )
}
