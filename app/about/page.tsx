import type { Metadata } from "next"
import Image from "next/image"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { Card, CardContent } from "@/components/ui/card"
import { generatePageMetadata } from "@/lib/seo"
import { BookOpen, Users, Target, Shield } from "lucide-react"

export const metadata: Metadata = generatePageMetadata({
  title: "About Weight Literacy Foundation | Mission and Public Education",
  description:
    "Learn about Weight Literacy Foundation, our mission, and our commitment to improving public understanding of weight health and evidence-based education.",
  path: "/about",
})

const whatWeDo = [
  {
    icon: BookOpen,
    title: "Publish Educational Resources",
    description:
      "We develop and share clear, accurate information on weight health and obesity for general audiences.",
  },
  {
    icon: Target,
    title: "Translate Complex Medical Topics",
    description:
      "We take evidence-based clinical information and make it accessible to people without a medical background.",
  },
  {
    icon: Shield,
    title: "Support Informed Decision-Making",
    description:
      "We provide people with the information they need to ask better questions and have more productive conversations with their healthcare providers.",
  },
  {
    icon: Users,
    title: "Promote Awareness of Evidence-Based Options",
    description:
      "We highlight the difference between evidence-based health information and misleading or unverified health claims.",
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1600&h=900&fit=crop"
            alt="Healthcare professionals collaborating on community education"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <Container className="relative z-10">
          <div className="py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-white text-balance">
              About Weight Literacy Foundation
            </h1>
            <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto text-balance">
              Weight Literacy Foundation exists to improve public understanding of weight health, obesity, and
              evidence-based health information. Our goal is to make complex health information easier to understand so
              individuals and families can make more informed decisions.
            </p>
          </div>
        </Container>
      </div>

      {/* Mission */}
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl text-center mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-balance">
              We focus on health literacy in the area of weight health. That includes helping people better understand
              obesity, patient questions, available options, and the difference between evidence-based information
              and misleading claims.
            </p>
          </div>
        </Container>
      </Section>

      {/* What We Do */}
      <Section background="muted">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">What We Do</h2>
            <p className="mt-3 text-lg text-muted-foreground text-balance">
              Accessible, responsible health education for the public
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whatWeDo.map((item) => (
              <Card key={item.title} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary-soft flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Who We Serve */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">Who We Serve</h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Our work is intended for individuals seeking reliable health education, families supporting loved ones,
                and communities with limited access to clear, trustworthy information about weight health and their
                available options.
              </p>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&h=500&fit=crop"
                alt="Diverse community members accessing health education resources"
                width={700}
                height={500}
                className="rounded-lg shadow-card"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* How We Operate */}
      <Section background="muted">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl text-center mb-6">
              How We Operate
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-balance">
              Weight Literacy Foundation is an education-first organization. We do not provide direct medical care,
              diagnosis, or individualized medical advice. Our content is designed for general informational purposes
              and should be used as a starting point for more informed conversations with qualified healthcare
              professionals.
            </p>
          </div>
        </Container>
      </Section>

      {/* Transparency */}
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl text-center mb-6">
              Our Commitment to Transparency
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-balance">
              We are committed to maintaining a clear separation between educational content, organizational
              governance, and any future partnerships or funding sources. Our goal is to serve the public with
              information that is accessible, responsible, and mission aligned.
            </p>
          </div>
        </Container>
      </Section>

      {/* Governance */}
      <Section background="muted">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl mb-6">
              Governance &amp; Compliance
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Weight Literacy Foundation is governed by a nonprofit board and operated in accordance with all
              applicable 501(c)(3) requirements.
            </p>
          </div>
        </Container>
      </Section>

      {/* Who Reviews Our Content */}
      <Section>
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl mb-6">
              Who Reviews Our Content
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our editorial team does not currently include licensed medical professionals, and we do not have a
              licensed clinician review program in place today. Articles are researched and edited by our editorial
              team, with AI tools assisting with drafting and research support, and are evaluated against published
              clinical sources rather than independent clinical expertise. If and when a specific article completes
              a documented evidence review or an actual review by a verified, licensed reviewer, that is shown on the
              article itself — see our{" "}
              <a href="/medical-review" className="text-primary underline">
                Medical Review Process
              </a>{" "}
              page for what each type of review does and does not mean, and{" "}
              <a href="/how-we-create-content" className="text-primary underline">
                How We Create Content
              </a>{" "}
              for how AI tools are used in our editorial process.
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}
