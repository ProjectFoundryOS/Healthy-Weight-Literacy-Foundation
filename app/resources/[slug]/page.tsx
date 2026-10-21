import { notFound, permanentRedirect } from "next/navigation"
import { getResource } from "@/lib/mdx"
export default async function LegacyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await getResource(slug)
  if (!item) notFound()
  permanentRedirect("/education")
}
