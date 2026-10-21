import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { BlogCard } from "@/components/blocks/blog-card"
import { NewsCard } from "@/components/content/news-card"
import { ArticleCoverOverlay } from "@/components/content/article-cover-overlay"
import { SiteSearch } from "@/components/content/site-search"
import { NewsletterForm } from "@/components/forms/newsletter-form"
import { getBlogPosts } from "@/lib/articles"
import { getNewsUpdates } from "@/lib/news"

export default async function HomePage() {
  const posts = await getBlogPosts()
  const featured =
    posts.find((post) => post.slug === "before-starting-glp-1-medicine") ??
    posts[0]
  const latest = posts
    .filter((post) => post.slug !== featured?.slug)
    .slice(0, 3)
  const news = getNewsUpdates().slice(0, 3)
  const paths = [
    {
      title: "Making sense of GLP-1 medicines",
      text: "Understand the options and the science behind them.",
      href: "/blog?topic=basics",
      color: "bg-[#E4EEE7]",
    },
    {
      title: "Considering your next step",
      text: "Prepare questions about treatment, side effects, and care.",
      href: "/blog?topic=treatment",
      color: "bg-[#F7E5D7]",
    },
    {
      title: "Looking at the bigger picture",
      text: "Explore appetite, nutrition, weight changes, and metabolism.",
      href: "/education#weight",
      color: "bg-[#EEE9F3]",
    },
  ]
  return (
    <>
      <section className="relative overflow-hidden bg-[#F5F1E8] py-10 sm:py-14 lg:py-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">
                <span className="inline-block h-2 w-2 rounded-full bg-[#BD6749]" />{" "}
                A little clarity goes a long way
              </p>
              <h1 className="mt-5 max-w-xl text-[clamp(2.5rem,4.5vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-secondary">
                Weight health.
                <br />
                <span className="font-editorial italic text-primary">
                  Better understood.
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#455953]">
                Clear answers about medicines, food, and metabolic health—so you
                can understand the evidence and ask the questions that matter to
                you.
              </p>
              <div className="mt-7">
                <SiteSearch id="home-search" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free to explore. Grounded in sources. Made for real life.
              </p>
            </div>
            {featured ? (
              <Link
                href={`/blog/${featured.slug}`}
                className="group overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-[0_15px_45px_-25px_#173e3955]"
              >
                <div className="relative aspect-[4/3] w-full max-h-[360px] overflow-hidden">
                  <Image
                    src={featured.hero_image}
                    alt={featured.visuals?.hero.alt ?? featured.title}
                    fill
                    priority
                    sizes="(max-width: 1023px) calc(100vw - 32px), 520px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                  {featured.visuals?.hero.overlay ? (
                    <ArticleCoverOverlay
                      overlay={featured.visuals.hero.overlay}
                      compact
                    />
                  ) : null}
                </div>
                <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                  <div>
                    <p className="eyebrow">A good place to start</p>
                    <h2 className="mt-2 text-xl font-semibold leading-snug tracking-tight">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {featured.reading_time} · Practical guide
                    </p>
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-6 h-6 w-6 shrink-0 text-primary"
                  />
                </div>
              </Link>
            ) : null}
          </div>
        </Container>
      </section>
      <Section className="py-10 sm:py-12">
        <Container>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Start with what’s on your mind
            </h2>
            <Link
              href="/education"
              className="hidden min-h-11 items-center gap-2 text-sm font-semibold text-primary sm:inline-flex"
            >
              Explore all topics <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {paths.map((path, i) => (
              <Link
                key={path.href}
                href={path.href}
                className={`group rounded-xl p-6 transition-transform hover:-translate-y-1 ${path.color}`}
              >
                <div className="flex items-center justify-between text-primary">
                  <span className="font-mono text-sm">0{i + 1}</span>
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <h3 className="mt-5 max-w-[23ch] text-xl font-semibold leading-snug">
                  {path.title}
                </h3>
                <p className="mt-3 leading-relaxed text-[#455953]">
                  {path.text}
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/education"
            className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary sm:hidden"
          >
            Explore all topics →
          </Link>
        </Container>
      </Section>
      <Section className="border-t border-primary/10">
        <Container>
          <div className="section-heading">
            <div>
              <p className="eyebrow">The reading room</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Worth understanding.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Thoughtful guides for the questions behind the headlines.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blog">
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latest.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </Container>
      </Section>
      <Section background="muted">
        <Container>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stay curious</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                News &amp; Research
              </h2>
              <p className="mt-3 text-muted-foreground">
                What’s new, what it means, and what’s still uncertain.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/news">
                Explore the updates <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} compact />
            ))}
          </div>
        </Container>
      </Section>
      <Section id="newsletter">
        <Container>
          <div className="grid gap-8 rounded-2xl bg-[#E4EEE7] p-6 sm:p-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Sparkles className="h-7 w-7 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                A clearer view, in your inbox.
              </h2>
              <p className="mt-3 max-w-md leading-relaxed text-[#455953]">
                Join our newsletter for new guides and selected updates on
                weight and metabolic health.
              </p>
            </div>
            <div className="self-center">
              <NewsletterForm />
              <p className="mt-4 text-sm text-muted-foreground">
                We respect your inbox.{" "}
                <Link href="/privacy" className="underline underline-offset-4">
                  Privacy policy
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </Section>
      <Section className="border-t border-primary/10 bg-[#FAF7F1]">
        <Container>
          <div className="grid gap-7 md:grid-cols-[1fr_1.6fr] md:gap-16">
            <div>
              <BookOpen className="h-7 w-7 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Knowledge should
                <br />
                feel within reach.
              </h2>
            </div>
            <div>
              <p className="text-lg leading-relaxed text-[#455953]">
                WeightLiteracy is a project of Healthy Weight Literacy
                Foundation. We make health information easier to understand,
                with free education, clear sources, and respect for the person
                behind every question.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href="/about">Meet the Foundation</Link>
                </Button>
                <Button asChild variant="link">
                  <Link href="/donate">
                    Support free education <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
