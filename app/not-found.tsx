import Link from "next/link"
import { Search, Home } from "lucide-react"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <Section className="min-h-[60vh] flex items-center">
      <Container size="sm" className="text-center">
        <div className="mb-8">
          <span
            className="text-8xl font-bold text-primary/20"
            aria-hidden="true"
          >
            404
          </span>
        </div>
        <h1 className="text-3xl font-bold text-secondary mb-4">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
          have been moved or no longer exists.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search Our Site
            </Link>
          </Button>
        </div>
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/programs"
              className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Programs
            </Link>
            <Link
              href="/education"
              className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Education
            </Link>
            <Link
              href="/about"
              className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Contact
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
