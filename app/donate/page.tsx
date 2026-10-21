import type { Metadata } from "next"
import Link from "next/link"
import {
  Heart,
  CheckCircle,
  Mail,
  BookOpen,
  Users,
  GraduationCap,
  Phone,
  Building,
} from "lucide-react"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generatePageMetadata, siteConfig } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Donate - Support Evidence-Based Health Education",
  description:
    "Your tax-deductible donation to HWLF supports free, evidence-based health literacy resources for communities in need.",
  path: "/donate",
})

const impactAreas = [
  {
    icon: BookOpen,
    title: "Educational Resources",
    description:
      "Fund development of evidence-based articles, guides, and community health materials available free of charge",
  },
  {
    icon: Users,
    title: "Community Access",
    description: "Make online health literacy resources easier to find and use",
  },
  {
    icon: GraduationCap,
    title: "Program Development",
    description:
      "Support development and maintenance of accessible educational materials",
  },
]

export default function DonatePage() {
  return (
    <>
      <PageHeader
        title="Support Evidence-Based Health Education"
        description="Your generosity helps us provide free, accessible health literacy resources to communities that need them most."
        breadcrumbs={[{ label: "Donate" }]}
      />

      {/* Donation Box */}
      <Section>
        <Container size="sm">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-secondary">
                  Support Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Your donation helps us continue our mission to improve health
                  literacy by creating, maintaining, and sharing clear,
                  evidence-based educational resources. Contributions support
                  educational content development, website operations, outreach,
                  and general nonprofit expenses that allow our work to remain
                  accessible to the public.
                </p>
                <div className="flex justify-center">
                  <Button size="lg" className="px-8" asChild>
                    <a
                      href="https://www.paypal.com/donate/?hosted_button_id=3SF3DQVJ7EA66"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Donate via PayPal
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center italic">
                  Healthy Weight Literacy Foundation is a U.S.-based 501(c)(3)
                  nonprofit. Donations are generally tax-deductible as allowed
                  by law.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Impact Section */}
      <Section>
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
              Where Your Donation Goes
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Contributions help sustain the work behind our free resources
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {impactAreas.map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary-soft flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Tax Information */}
      <Section background="muted">
        <Container size="sm">
          <Card className="bg-secondary text-secondary-foreground">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Tax-Deductible Giving
                  </h3>
                  <p className="text-secondary-foreground/80 mb-4 leading-relaxed">
                    {siteConfig.name} is a registered 501(c)(3) nonprofit
                    organization. All contributions are tax-deductible to the
                    fullest extent allowed by law. Please contact us if you need
                    documentation for your records.
                  </p>
                  <div className="flex flex-col gap-1 text-sm text-secondary-foreground/70">
                    <span>
                      <strong>EIN:</strong> {siteConfig.ein}
                    </span>
                    <span>
                      <strong>Organization:</strong> {siteConfig.name}
                    </span>
                    <span>
                      <strong>Location:</strong> Dayton, Ohio
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section>
        <Container size="sm" className="text-center">
          <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-4">
            Questions About Donating?
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed max-w-lg mx-auto">
            Our team is happy to discuss donation options, answer questions
            about our programs, or help you find the best way to support our
            mission.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Our Team</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/impact">See Our Impact</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
