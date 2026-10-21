import Link from "next/link"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Accessibility",
  description: "Making WeightLiteracy easier to read, navigate, and use.",
  path: "/accessibility",
})
export default function AccessibilityPage() {
  return (
    <InfoPage
      title="Information within reach"
      description="Our approach to making WeightLiteracy easier to read and use."
    >
      <h2>Designed for different ways of reading</h2>
      <p>
        We aim to make our educational resources usable with a keyboard, on a
        small screen, and with assistive technology. Our design uses labeled
        forms, visible keyboard focus, clear headings, descriptive image text,
        and a link to skip directly to the page content.
      </p>
      <h2>Reading tools</h2>
      <p>
        You can zoom using your browser. Article guides include links to
        individual sections, and wide tables can be scrolled horizontally. We
        respect your device’s reduced-motion preference.
      </p>
      <h2>Help us improve</h2>
      <p>
        If something is difficult to read or use,{" "}
        <Link href="/contact">let us know</Link>. Include the page address, what
        you were trying to do, and your browser or assistive technology if you
        are comfortable sharing it.
      </p>
      <p>Last updated October 20, 2026.</p>
    </InfoPage>
  )
}
