import Link from "next/link"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Our educational work",
  description: "Free resources you can use today.",
  path: "/programs",
})
export default function Page() {
  return (
    <InfoPage
      title={"Our educational work"}
      description={"Free resources you can use today."}
    >
      <h2>Learn about weight health</h2>
      <p>
        Our current educational offering is this website: practical guides,
        explainers, and links to original research about weight medicines,
        nutrition, and metabolic health.
      </p>
      <p>
        <Link href="/education">Choose a learning topic</Link> or{" "}
        <Link href="/blog">browse every article</Link>.
      </p>
      <h2>Find local resources</h2>
      <p>
        Our <Link href="/city-resources">Ohio resource directory</Link> points
        to independent organizations offering food assistance, health services,
        and education. Contact each organization directly for availability and
        eligibility.
      </p>
      <h2>Community activities</h2>
      <p>
        Workshops and other community activities will be listed on our{" "}
        <Link href="/events">events page</Link> when confirmed. We do not offer
        individual medical care through this website.
      </p>
    </InfoPage>
  )
}
