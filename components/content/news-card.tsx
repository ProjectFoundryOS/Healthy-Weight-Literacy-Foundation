import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { formatNewsDate, getNewsGuide, type NewsUpdate } from "@/lib/news"

export function NewsCard({ item, compact = false }: { item: NewsUpdate; compact?: boolean }) {
  const guide = getNewsGuide(item.relatedSlug)
  const Heading = compact ? "h3" : "h2"
  return (
    <article id={compact ? undefined : item.id} className="flex h-full min-w-0 scroll-mt-24 flex-col rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="font-semibold text-primary">{item.category}</span>
        <time dateTime={item.source.publishedOn} className="text-muted-foreground">{formatNewsDate(item.source.publishedOn)}</time>
      </div>
      <Heading className={`mt-4 font-bold tracking-tight text-secondary ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
        {compact ? <Link href={`/news#${item.id}`} className="hover:text-primary hover:underline">{item.title}</Link> : item.title}
      </Heading>
      <p className="mt-3 text-sm text-muted-foreground">{item.source.name} · {item.evidenceType}</p>
      <p className="mt-5 leading-relaxed text-foreground">{item.summary}</p>
      {compact ? (
        <Link href={`/news#${item.id}`} className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-5 font-semibold text-primary underline underline-offset-4">
          Read the context <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <>
          <div className="mt-6 space-y-4 border-l-2 border-primary/30 pl-4">
            <p className="leading-relaxed"><strong className="block mb-1 text-secondary">Why it matters</strong>{item.context}</p>
            <p className="leading-relaxed"><strong className="block mb-1 text-secondary">Keep in mind</strong>{item.limitation}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4">
            <a href={item.source.url} target="_blank" rel="noopener noreferrer" aria-label={`Read original source: ${item.source.title} (opens in a new tab)`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline underline-offset-4">
              Read original source <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link href={guide.href} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">Our guide: {guide.title}</Link>
          </div>
        </>
      )}
    </article>
  )
}
