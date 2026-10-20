import Image from "next/image"
import type { ArticleCoverOverlay as CoverOverlay } from "@/lib/article-visuals"

/** Selectable cover text and a locally stored, attributed brand asset. */
export function ArticleCoverOverlay({ overlay, compact = false }: { overlay: CoverOverlay; compact?: boolean }) {
  return <>
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#102c2e]/95 via-[#102c2e]/35 to-transparent" />
    {overlay.attribution ? <div className={`absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[#173e40] shadow-sm ${compact ? "text-[10px]" : "text-xs sm:right-6 sm:top-6 sm:px-4 sm:py-3 sm:text-sm"}`}>
      <span>{overlay.attribution.label}</span>
      <Image src={overlay.attribution.logo.src} alt={overlay.attribution.logo.alt}
        width={overlay.attribution.logo.width} height={overlay.attribution.logo.height}
        className={compact ? "h-6 w-auto" : "h-6 w-auto sm:h-9"} sizes="80px" />
    </div> : null}
    <div className={`absolute inset-x-0 bottom-0 text-white ${compact ? "p-5" : "p-5 sm:p-9"}`}>
      <p className={`max-w-[22ch] font-bold tracking-tight text-balance ${compact ? "text-[27px] leading-[1.1]" : "text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.05]"}`}>{overlay.title}</p>
      {overlay.subtitle ? <p className={`mt-2 max-w-[40ch] text-white/95 ${compact ? "text-[13px] leading-snug" : "text-sm sm:text-xl"}`}>{overlay.subtitle}</p> : null}
    </div>
  </>
}
