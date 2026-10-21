import Link from "next/link"
import { BookOpen, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import { siteConfig } from "@/lib/seo"
import { NewsletterForm } from "@/components/forms/newsletter-form"
import { ROUTES } from "@/lib/routes"

const footerNavigation = {
  about: [
    { name: "About", href: ROUTES.ABOUT },
    { name: "Programs", href: ROUTES.PROGRAMS },
    { name: "Education", href: ROUTES.EDUCATION },
    { name: "Articles", href: ROUTES.BLOG },
    { name: "News & Research", href: ROUTES.NEWS },
    { name: "City Resources", href: ROUTES.CITY_RESOURCES },
  ],
  legal: [
    { name: "Privacy Policy", href: ROUTES.PRIVACY },
    { name: "Terms of Use", href: ROUTES.TERMS },
    { name: "Editorial Policy", href: ROUTES.EDITORIAL_POLICY },
    { name: "Evidence & Editorial Standards", href: ROUTES.MEDICAL_REVIEW },
    { name: "How We Create Content", href: ROUTES.HOW_WE_CREATE_CONTENT },
    { name: "Medical Disclaimer", href: ROUTES.MEDICAL_DISCLAIMER },
    { name: "Transparency", href: ROUTES.TRANSPARENCY },
    { name: "Cookie Policy", href: ROUTES.COOKIES },
    { name: "Accessibility Statement", href: ROUTES.ACCESSIBILITY },
    { name: "Contact", href: ROUTES.CONTACT },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary text-secondary-foreground" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand and Newsletter */}
          <div className="space-y-8 xl:col-span-1">
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                <BookOpen className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold">HWLF</span>
            </Link>
            <p className="text-sm text-secondary-foreground/80 max-w-xs leading-relaxed">{siteConfig.description}</p>
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: Facebook, href: "https://www.facebook.com/weightliteracy", label: "Facebook" },
                { icon: Twitter, href: "https://twitter.com/hwlfoundation", label: "X (Twitter)" },
                { icon: Linkedin, href: "https://www.linkedin.com/company/weightliteracy", label: "LinkedIn" },
                { icon: Instagram, href: "https://www.instagram.com/weight.literacy", label: "Instagram" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/60 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label={`Follow us on ${social.label}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="pt-4">
              <h3 className="text-sm font-semibold mb-3">Stay Updated</h3>
              <NewsletterForm variant="footer" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold">Navigation</h3>
              <ul className="mt-4 space-y-3" role="list">
                {footerNavigation.about.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="mt-4 space-y-3" role="list">
                {footerNavigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-secondary-foreground/10 pt-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <p className="font-semibold text-secondary-foreground">{siteConfig.name}</p>
              <p>{siteConfig.address.street}</p>
              <p>
                {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
              </p>
              <p>{siteConfig.address.country}</p>
              <p>EIN: {siteConfig.ein}</p>
              <p>Email: {siteConfig.email}</p>
            </div>
            <p className="text-xs text-secondary-foreground/60 leading-relaxed max-w-3xl">
              <strong>Educational Disclaimer:</strong> The information provided by Healthy Weight Literacy Foundation is
              for educational purposes only and is not intended as medical advice. Consult with qualified healthcare
              professionals before making health-related decisions.
            </p>
            <p className="text-xs text-secondary-foreground/60">
              &copy; {currentYear} Healthy Weight Literacy Foundation. All rights reserved. 501(c)(3) Nonprofit
              Organization.
            </p>

          </div>
        </div>
      </div>
    </footer>
  )
}
