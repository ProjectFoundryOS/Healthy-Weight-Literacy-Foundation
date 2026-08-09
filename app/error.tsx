"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Section className="min-h-[60vh] flex items-center">
      <Container size="sm" className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle className="h-10 w-10 text-danger" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-secondary mb-4">Something Went Wrong</h1>
        <p className="text-muted-foreground mb-8">
          We apologize for the inconvenience. An unexpected error has occurred. Please try again or contact us if the
          problem persists.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/")}>
            Return Home
          </Button>
        </div>
        {error.digest && <p className="mt-8 text-xs text-muted-foreground">Error ID: {error.digest}</p>}
      </Container>
    </Section>
  )
}
