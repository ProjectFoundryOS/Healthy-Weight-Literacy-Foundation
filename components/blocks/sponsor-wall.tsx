import Image from "next/image"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"

const sponsors = [
  { name: "Health Partners Inc", logo: "/placeholder.svg?height=60&width=150" },
  { name: "Community Foundation", logo: "/placeholder.svg?height=60&width=150" },
  { name: "Wellness Corp", logo: "/placeholder.svg?height=60&width=150" },
  { name: "United Health", logo: "/placeholder.svg?height=60&width=150" },
  { name: "Care Foundation", logo: "/placeholder.svg?height=60&width=150" },
  { name: "Active Living", logo: "/placeholder.svg?height=60&width=150" },
]

export function SponsorWall() {
  return (
    <Section>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-secondary sm:text-3xl">Our Partners & Supporters</h2>
          <p className="mt-3 text-muted-foreground">Together, we&apos;re making a difference in community health.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex items-center justify-center grayscale hover:grayscale-0 transition-all"
            >
              <Image
                src={sponsor.logo || "/placeholder.svg"}
                alt={sponsor.name}
                width={150}
                height={60}
                className="max-h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
