import Link from "next/link"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Careers",
  description: "Working with WeightLiteracy.",
  path: "/careers",
})
export default function Page() {
  return (
    <InfoPage title={"Careers"} description={"Working with WeightLiteracy."}>
      <h2>Open positions</h2>
      <p>No open positions are listed on this website at this time.</p>
      <p>
        Interested in contributing to our educational work? Visit{" "}
        <Link href="/volunteer">contributing &amp; volunteering</Link> to learn
        how to get in touch.
      </p>
    </InfoPage>
  )
}
