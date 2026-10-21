import Link from "next/link"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Our work",
  description: "Free education, with progress you can explore.",
  path: "/impact",
})
export default function Page() {
  return (
    <InfoPage
      title={"Our work"}
      description={"Free education, with progress you can explore."}
    >
      <h2>Start with what we publish</h2>
      <p>
        Our current work centers on free articles about weight health,
        medicines, nutrition, and metabolic health. Each article links to its
        sources and shows its editorial information.
      </p>
      <p>
        <Link href="/blog">Explore our article library</Link> or visit{" "}
        <Link href="/news">News &amp; Research</Link> for selected updates and
        context.
      </p>
      <h2>Help shape what comes next</h2>
      <p>
        If a guide helped you, or left a question unanswered,{" "}
        <Link href="/contact">tell us about it</Link>. Please do not send
        personal medical records.
      </p>
    </InfoPage>
  )
}
