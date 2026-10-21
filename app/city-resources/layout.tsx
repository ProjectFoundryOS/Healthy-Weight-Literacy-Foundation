import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Ohio Community Resources",
  description:
    "Find local health, nutrition, and community resources in Dayton, Columbus, Cincinnati, and Cleveland.",
  path: "/city-resources",
})

export default function CityResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
