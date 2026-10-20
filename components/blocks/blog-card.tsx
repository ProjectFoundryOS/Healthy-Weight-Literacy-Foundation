import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Clock, ArrowRight } from "lucide-react"
import type { BlogPost } from "@/lib/article-types"
import { ArticleCoverOverlay } from "@/components/content/article-cover-overlay"

interface BlogCardProps {
  post: BlogPost
  eager?: boolean
}

export function BlogCard({ post, eager = false }: BlogCardProps) {
  return (
    <article className="group bg-surface rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        {post.hero_image ? <div className={`relative overflow-hidden ${post.visuals?.hero.overlay ? "h-56" : "h-48"}`}>
          <Image
            src={post.hero_image}
            alt={post.visuals?.hero.alt ?? post.title}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) 50vw, 400px"
            className="object-cover object-top transition-transform group-hover:scale-105"
          />
          {post.visuals?.hero.overlay ? <ArticleCoverOverlay overlay={post.visuals.hero.overlay} compact /> : <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white text-[#222222] font-medium shadow-sm border-0">
              {post.category}
            </Badge>
          </div>}
        </div> : null}
        <div className="p-6 flex flex-1 flex-col">
          {!post.hero_image || post.visuals?.hero.overlay ? <Badge variant="secondary" className="mb-3 self-start">{post.category}</Badge> : null}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <span>{post.draft_preview ? "Draft preview" : formatDate(post.published_at)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {post.reading_time}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-secondary group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="mt-3 text-muted-foreground leading-relaxed">{post.description}</p>
          {!post.draft_preview ? <div className="mt-4 flex items-center gap-3">
            {post.author_image ? <Image
              src={post.author_image}
              alt={post.author}
              width={32}
              height={32}
              className="rounded-full"
            /> : null}
            <span className="text-sm text-muted-foreground">{post.author}</span>
          </div> : null}
          <div className="mt-auto pt-6 flex items-center text-primary font-medium">
            Read Article
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </div>
      </Link>
    </article>
  )
}
