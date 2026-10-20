import Image from "next/image"
import type { ArticleVisual } from "@/lib/article-visuals"

export function ArticleFigure({ visual, priority = false }: { visual: ArticleVisual; priority?: boolean }) {
  return (
    <figure className="my-10 first:mt-0">
      <Image
        src={visual.src} alt={visual.alt} width={visual.width} height={visual.height}
        sizes="(max-width: 1023px) calc(100vw - 48px), 850px"
        className="h-auto w-full rounded-2xl" priority={priority}
      />
    </figure>
  )
}
