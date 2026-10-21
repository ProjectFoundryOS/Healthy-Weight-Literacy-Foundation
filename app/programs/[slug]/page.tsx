import { notFound, permanentRedirect } from "next/navigation"
import { getProgram } from "@/lib/mdx"
export default async function LegacyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await getProgram(slug)
  if (!item) notFound()
  permanentRedirect("/programs")
}
