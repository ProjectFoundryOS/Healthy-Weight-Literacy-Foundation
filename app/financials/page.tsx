import Link from "next/link"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Financial information",
  description: "Questions about funding and how resources are used.",
  path: "/financials",
})
export default function Page() {
  return (
    <InfoPage
      title={"Financial information"}
      description={"Questions about funding and how resources are used."}
    >
      <h2>Supporting public education</h2>
      <p>
        Contributions support the Foundation’s educational mission, including
        content development, website operations, outreach, and organizational
        expenses.
      </p>
      <h2>Financial documents</h2>
      <p>
        To request financial records or ask about a contribution,{" "}
        <Link href="/contact">contact the Foundation</Link>.
      </p>
      <p>
        <Link href="/transparency">
          Read about our approach to transparency
        </Link>
        .
      </p>
    </InfoPage>
  )
}
