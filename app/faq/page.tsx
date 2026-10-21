import Link from "next/link"
import { InfoPage } from "@/components/layout/info-page"
import { generatePageMetadata } from "@/lib/seo"
export const metadata = generatePageMetadata({
  title: "Common questions",
  description: "Finding and using WeightLiteracy resources.",
  path: "/faq",
})
export default function Page() {
  return (
    <InfoPage
      title={"Common questions"}
      description={"Finding and using WeightLiteracy resources."}
    >
      <h2>Is the content free?</h2>
      <p>
        Yes. Our articles, guides, and news selections are free to read. You do
        not need an account.
      </p>
      <h2>Where should I start?</h2>
      <p>
        Visit <Link href="/education">Learn</Link> to choose a topic, or{" "}
        <Link href="/search">search</Link> for a medicine or question.
      </p>
      <h2>Can you recommend a treatment for me?</h2>
      <p>
        We provide education, not personal medical advice or prescriptions. A
        clinician who knows your health history can help you decide what is
        appropriate for you.
      </p>
      <h2>Do you offer classes or appointments?</h2>
      <p>
        Our current resources are published online. Confirmed events will appear
        on the <Link href="/events">events page</Link>. We do not book medical
        appointments.
      </p>
      <h2>How do I report an error?</h2>
      <p>
        <Link href="/contact">Contact us</Link> with the article link, the
        passage in question, and a source if you have one. Please avoid sharing
        personal medical records.
      </p>
      <h2>How can I support the work?</h2>
      <p>
        You can share a useful article,{" "}
        <Link href="/volunteer">offer your skills</Link>, or{" "}
        <Link href="/donate">make a donation</Link>.
      </p>
    </InfoPage>
  )
}
