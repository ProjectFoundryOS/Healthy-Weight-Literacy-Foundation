import Link from "next/link";
import { BmiCalculator } from "@/components/learning/bmi-calculator";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Free Adult BMI Calculator — Understand Your Result",
  description: "Calculate adult BMI in US or metric units, understand its limits, and try a short lesson. No signup. Measurements stay in your browser.",
  path: "/tools/bmi-calculator",
});
export default function Page() {
  return <div className="learning-page bmi-page"><div className="learning-wrap">
    <nav aria-label="Breadcrumb" className="mb-4 text-sm"><Link href="/tools">Tools & activities</Link><span aria-hidden="true"> / </span>BMI calculator</nav>
    <header className="mb-6 max-w-3xl">
      <p className="eyebrow">Free adult BMI calculator</p>
      <h1 className="font-editorial mt-3 text-3xl tracking-tight sm:text-5xl">Your BMI, with the context.</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">Body mass index (BMI) compares weight with height. Calculate it, then see what it leaves out.</p>
    </header>
    <BmiCalculator />
    <section className="mt-10 grid gap-6 lg:grid-cols-2" aria-label="Understanding adult BMI">
      <div className="learning-card">
        <h2 className="font-editorial text-3xl">What the categories mean</h2>
        <p className="mt-3 leading-relaxed">These standard CDC categories apply to adults 20 and older. Category boundaries are screening cutoffs, not sudden changes in someone’s health.</p>
        <table className="mt-5 w-full text-left text-sm"><caption className="sr-only">CDC adult BMI categories in kilograms per square meter</caption>
          <thead><tr className="border-b"><th scope="col" className="py-3">Category</th><th scope="col" className="py-3">BMI (kg/m²)</th></tr></thead>
          <tbody>{[["Underweight","Below 18.5"],["Healthy weight","18.5 to below 25"],["Overweight","25 to below 30"],["Obesity","30 or above"]].map(([category,range])=><tr className="border-b" key={category}><th scope="row" className="py-3 pr-3 font-medium">{category}</th><td className="py-3">{range}</td></tr>)}</tbody>
        </table>
        <p className="mt-4 text-sm leading-relaxed">Within the obesity category: class 1 is 30 to below 35; class 2 is 35 to below 40; class 3 is 40 or above.</p>
      </div>
      <div className="learning-card">
        <h2 className="font-editorial text-3xl">Keep the whole person in view</h2>
        <p className="mt-4 leading-relaxed">BMI is useful for screening, but a full assessment also considers medical history, daily habits, physical examination and laboratory findings. Two people with the same BMI can have different body composition and health circumstances.</p>
        <Link className="tool-button mt-6" href="/blog/what-bmi-can-and-cannot-tell-you">Read what BMI can and cannot tell you →</Link>
        <Link className="mt-4 block py-2 font-semibold underline underline-offset-4" href="/blog/metabolic-health-beyond-weight">Explore health measures beyond weight →</Link>
      </div>
    </section>
    <section className="mt-8 text-sm leading-relaxed text-muted-foreground" aria-label="Sources and scope">
      <h2 className="font-semibold text-secondary">Sources & scope</h2>
      <p className="mt-2">General education, not a diagnosis or a treatment recommendation. Sources checked October 26, 2026.</p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li><a className="underline" href="https://www.cdc.gov/bmi/faq/index.html">CDC: BMI formulas and limitations</a></li>
        <li><a className="underline" href="https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html">CDC: Adult BMI categories</a></li>
        <li><a className="underline" href="https://www.cdc.gov/bmi/about/index.html">CDC: BMI and individual health</a></li>
        <li><a className="underline" href="https://www.cdc.gov/bmi/adult-calculator/index.html">CDC: Adult calculator and input ranges</a></li>
        <li><a className="underline" href="https://www.nhs.uk/health-assessment-tools/calculate-your-body-mass-index/calculate-bmi-for-adults">NHS: When a BMI calculator may not be appropriate</a> (UK guidance; this tool uses CDC’s US adult categories and age range).</li>
      </ul>
    </section>
  </div></div>;
}
