import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Clock, ArrowRight } from "lucide-react"
import type { BlogPost } from "@/lib/article-types"

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group bg-surface rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.hero_image || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white text-[#222222] font-medium shadow-sm border-0">
              {post.category}
            </Badge>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <span>{formatDate(post.published_at)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {post.reading_time}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-2 text-muted-foreground line-clamp-2">{post.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <Image
              src={post.author_image || "/placeholder.svg"}
              alt={post.author}
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm text-muted-foreground">{post.author}</span>
          </div>
          <div className="mt-4 flex items-center text-primary font-medium">
            Read Article
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </div>
      </Link>
    </article>
  )
}
