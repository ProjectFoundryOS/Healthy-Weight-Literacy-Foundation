import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Press & media",
  description: "Information and inquiries about WeightLiteracy.",
  path: "/press",
});
export default function Page() {
  return (
    <InfoPage
      title={"Press & media"}
      description={"Information and inquiries about WeightLiteracy."}
    >
      <h2>About the Foundation</h2>
      <p>
        WeightLiteracy is the educational website of Healthy Weight Literacy
        Foundation, a nonprofit providing education across the United States.
        Our focus is clear information about weight health, nutrition, and
        metabolic health.
      </p>
      <h2>Media inquiries</h2>
      <p>
        For questions about the Foundation or permission to use our materials,{" "}
        <a href="mailto:info@weightliteracy.org?subject=Media%20inquiry">
          email info@weightliteracy.org
        </a>
        . Include your outlet, topic, deadline, and contact details.
      </p>
      <p>
        <Link href="/about">About WeightLiteracy</Link> ·{" "}
        <Link href="/editorial-policy">Editorial policy</Link>
      </p>
    </InfoPage>
  );
}
