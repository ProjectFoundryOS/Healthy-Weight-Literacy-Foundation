import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { BookOpen, Users, GraduationCap, ArrowRight } from "lucide-react"
import { getBlogPosts } from "@/lib/content-registry"
import { ROUTES, dynamicRoutes } from "@/lib/routes"

export default async function HomePage() {
  const allPosts = await getBlogPosts()
  const recentPosts = allPosts.slice(0, 3)

  return (
    <>
      {/* Hero Section */}
      <Section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&h=900&fit=crop"
            alt="Healthcare professional providing education to diverse community members"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <Container className="relative z-10">
          <div className="py-20 text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-white">
              Building Health Literacy for Better Lives
            </h1>
            <p className="mt-6 text-xl text-white/90 leading-relaxed text-pretty max-w-3xl mx-auto">
              Clear, evidence-based education on nutrition, weight management, and metabolic health so individuals and
              communities can make informed, sustainable lifestyle decisions.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.EDUCATION}>
                <Button size="lg" variant="secondary" className="font-semibold">
                  Explore Education
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={ROUTES.CONTACT}>
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent-hover font-semibold"
                  aria-label="Contact us about our mission"
                >
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Mission Section */}
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">Our Mission</h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Healthy Weight Literacy Foundation exists to improve public health by providing clear, evidence-based
              education on nutrition, weight management, and metabolic health so individuals and communities can make
              informed, sustainable lifestyle decisions.
            </p>
          </div>
        </Container>
      </Section>

      {/* Our Programs Section */}
      <Section background="muted">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">Our Programs</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Evidence-based educational programs to improve health literacy
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Health Literacy Education",
                description: "Evidence-based education on nutrition, weight management, and metabolic health.",
                href: ROUTES.PROGRAMS,
                image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&h=500&fit=crop",
                imageAlt: "Health education workshop with diverse participants",
              },
              {
                icon: GraduationCap,
                title: "Public Resources & Guides",
                description: "Free, accessible educational materials designed for everyday understanding.",
                href: ROUTES.PROGRAMS,
                image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&h=500&fit=crop",
                imageAlt: "Educational resources and materials for health literacy",
              },
              {
                icon: Users,
                title: "Community Awareness",
                description: "Educational outreach focused on underserved and low-access communities.",
                href: ROUTES.PROGRAMS,
                image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=500&fit=crop",
                imageAlt: "Community health outreach program in action",
              },
            ].map((item) => (
              <Link key={item.title} href={item.href}>
                <Card className="hover:shadow-card-hover transition-shadow h-full overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image 
                      src={item.image || "/placeholder.svg"} 
                      alt={item.imageAlt} 
                      fill 
                      className="object-cover"
                      loading="eager"
                      priority
                    />
                  </div>
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-primary-soft flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Focus Areas */}
      <Section>
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">Our Focus</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Evidence-based education for everyone seeking credible health information
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Evidence-Based Education",
                description:
                  "Clear, scientifically-grounded information on nutrition, weight management, and metabolic health accessible to all.",
              },
              {
                icon: Users,
                title: "Community Support",
                description:
                  "Serving underserved and low-income communities with limited access to credible health education resources.",
              },
              {
                icon: GraduationCap,
                title: "Public Health Literacy",
                description:
                  "Empowering individuals to make informed decisions about their health through comprehensive educational resources.",
              },
            ].map((item) => (
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

      {/* Latest from Our Blog Section */}
      {recentPosts.length > 0 && (
        <Section background="muted">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
                Latest Educational Articles
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Evidence-based content to support your health literacy journey
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {recentPosts.map((post) => (
                <Link key={post.slug} href={dynamicRoutes.blogPost(post.slug)}>
                  <Card className="hover:shadow-card-hover transition-shadow h-full overflow-hidden">
                    {post.hero_image && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={post.hero_image || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="pt-6">
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary-soft text-primary">
                          {post.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-secondary mb-3 leading-tight">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{post.reading_time}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href={ROUTES.EDUCATION}>
                <Button variant="outline">
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      )}

      {/* CTA Section */}
      <Section background="muted">
        <Container>
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Support Evidence-Based Health Education</h2>
            <p className="mt-4 text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Your support helps us provide free, accessible health literacy resources to individuals and communities
              that need them most.
            </p>
            <div className="mt-8">
              <Link href={ROUTES.DONATE}>
                <Button size="lg" variant="secondary" className="font-semibold">
                  Learn About Supporting Our Mission
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
