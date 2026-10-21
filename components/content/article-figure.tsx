import Image from "next/image"
import type {
  ArticleVisual,
  ArticleCoverOverlay as CoverOverlay,
} from "@/lib/article-visuals"
import { ArticleCoverOverlay } from "./article-cover-overlay"

export function ArticleFigure({
  visual,
  priority = false,
  overlay,
}: {
  visual: ArticleVisual
  priority?: boolean
  overlay?: CoverOverlay
}) {
  return (
    <figure className="relative my-10 overflow-hidden rounded-2xl first:mt-0">
      <Image
        src={visual.src}
        alt={visual.alt}
        width={visual.width}
        height={visual.height}
        sizes="(max-width: 1023px) calc(100vw - 32px), 740px"
        className={
          priority
            ? "h-auto max-h-[440px] w-full rounded-2xl object-cover"
            : "h-auto w-full rounded-2xl"
        }
        priority={priority}
      />
      {overlay ? <ArticleCoverOverlay overlay={overlay} /> : null}
    </figure>
  )
}
