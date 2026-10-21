import Link from "next/link"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Work with us",
  description: "Help make clear health information easier to find.",
  path: "/partner",
})
export default function Page() {
  return (
    <InfoPage
      title={"Work with us"}
      description={"Help make clear health information easier to find."}
    >
      <h2>Start a conversation</h2>
      <p>
        We welcome inquiries from organizations interested in health literacy
        and public education. Tell us about your organization, the people you
        serve, and the idea you would like to discuss.
      </p>
      <p>
        <a href="mailto:info@weightliteracy.org?subject=Partnership%20inquiry">
          Email a partnership inquiry
        </a>{" "}
        or <Link href="/contact">visit our contact page</Link>.
      </p>
      <h2>Our editorial commitment</h2>
      <p>
        We keep educational content grounded in its sources. Any financial
        relationship relevant to a recommendation must be disclosed where
        readers encounter it.
      </p>
      <p>
        <Link href="/transparency">Read our transparency information</Link>.
      </p>
    </InfoPage>
  )
}
