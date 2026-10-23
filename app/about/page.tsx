import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Health information you can use",
  description:
    "A clearer starting point for understanding weight and metabolic health.",
  path: "/about",
});
export default function Page() {
  return (
    <InfoPage
      title={"Health information you can use"}
      description={
        "A clearer starting point for understanding weight and metabolic health."
      }
    >
      <h2>Why WeightLiteracy exists</h2>
      <p>
        Questions about weight can come with confusing headlines, strong
        opinions, and a lot of pressure. We want to make the evidence easier to
        understand so you can ask better questions and make more informed
        decisions.
      </p>
      <p>
        WeightLiteracy is the educational website of Healthy Weight Literacy
        Foundation, serving readers across the United States. Our mission is to
        make clear information about nutrition, weight management, and metabolic
        health more accessible.
      </p>
      <h2>What you will find here</h2>
      <p>
        Our <Link href="/blog">articles</Link> explain common questions in
        everyday language, with links to the sources behind the claims.{" "}
        <Link href="/news">News &amp; Research</Link> adds context to selected
        developments. Our <Link href="/find-support">support directory</Link>{" "}
        helps readers find care and practical support nationwide.
      </p>
      <h2>How we approach the work</h2>
      <p>
        We distinguish what evidence shows from what remains uncertain. We aim
        to use respectful language, avoid weight stigma, and make room for
        different experiences. The site provides education; it does not diagnose
        conditions or prescribe treatment.
      </p>
      <p>
        <Link href="/editorial-policy">Read our editorial policy</Link> and{" "}
        <Link href="/how-we-create-content">how we create content</Link>.
      </p>
      <h2>Get to know the Foundation</h2>
      <p>
        <Link href="/transparency">Transparency</Link> ·{" "}
        <Link href="/financials">Financial information</Link> ·{" "}
        <Link href="/impact">Our work</Link> ·{" "}
        <Link href="/contact">Contact</Link>
      </p>
    </InfoPage>
  );
}
