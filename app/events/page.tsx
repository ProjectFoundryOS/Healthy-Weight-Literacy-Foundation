import Link from "next/link"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Events",
  description: "Learning together, online and in the community.",
  path: "/events",
})
export default function Page() {
  return (
    <InfoPage
      title={"Events"}
      description={"Learning together, online and in the community."}
    >
      <h2>Upcoming events</h2>
      <p>
        No upcoming events are listed on this website at this time. When an
        event is confirmed, we will publish its date, location, accessibility
        information, and registration details here.
      </p>
      <h2>Learn at your own pace</h2>
      <p>
        Our <Link href="/education">learning guides</Link> and{" "}
        <Link href="/blog">article library</Link> are free to read now.
      </p>
      <p>
        To suggest an educational event or discuss an idea,{" "}
        <Link href="/contact">contact us</Link>.
      </p>
    </InfoPage>
  )
}
