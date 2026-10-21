import Link from "next/link"
import { siteConfig } from "@/lib/seo"
import { Brand } from "./brand"
import { CookiePreferences } from "./cookie-consent"
const groups = [
  {
    title: "Explore",
    links: [
      ["Learn by topic", "/education"],
      ["All articles", "/blog"],
      ["News & Research", "/news"],
      ["Ohio resources", "/city-resources"],
      ["Common questions", "/faq"],
    ],
  },
  {
    title: "The Foundation",
    links: [
      ["About us", "/about"],
      ["Our work", "/impact"],
      ["Contribute & volunteer", "/volunteer"],
      ["Work with us", "/partner"],
      ["Contact", "/contact"],
      ["Support us", "/donate"],
    ],
  },
  {
    title: "Our standards",
    links: [
      ["Editorial policy", "/editorial-policy"],
      ["How we create content", "/how-we-create-content"],
      ["Evidence standards", "/medical-review"],
      ["Transparency", "/transparency"],
      ["Financial information", "/financials"],
      ["Accessibility", "/accessibility"],
    ],
  },
]
export function Footer() {
  return (
    <footer className="bg-[#173E39] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.25fr_2fr]">
          <div>
            <Link href="/" aria-label="WeightLiteracy home">
              <Brand inverse />
            </Link>
            <p className="mt-4 text-lg text-[#D9E9E3]">
              Clear answers for weight health.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
              Free education to help you understand the evidence, ask better
              questions, and find your next step.
            </p>
            <Link
              href="/#newsletter"
              className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:text-[#F2C886]"
            >
              Get our updates
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="font-semibold text-[#F2C886]">{group.title}</h2>
                <ul className="mt-3 space-y-1">
                  {group.links.map(([title, href]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="inline-flex min-h-10 items-center text-sm leading-snug text-white/85 hover:text-white hover:underline underline-offset-4"
                      >
                        {title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-white/20 pt-7 text-sm text-white/80">
          <p className="font-semibold text-white">{siteConfig.name}</p>
          <p className="mt-2">
            {siteConfig.address.street}, {siteConfig.address.city},{" "}
            {siteConfig.address.state} {siteConfig.address.zip} · EIN{" "}
            {siteConfig.ein}
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white"
          >
            {siteConfig.email}
          </a>
          <p className="mt-2 max-w-4xl text-xs leading-relaxed">
            For education, not personal medical advice. Talk with a qualified
            healthcare professional about your health and treatment decisions.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
            <p>
              © {new Date().getFullYear()} Healthy Weight Literacy Foundation
            </p>
            {[
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
              ["Cookies", "/cookies"],
              ["Medical disclaimer", "/medical-disclaimer"],
            ].map(([title, href]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-10 items-center hover:underline"
              >
                {title}
              </Link>
            ))}
            <CookiePreferences />
          </div>
        </div>
      </div>
    </footer>
  )
}
