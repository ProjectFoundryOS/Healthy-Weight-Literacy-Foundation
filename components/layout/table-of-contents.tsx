"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  className?: string
}

const EMPTY_HEADINGS: TOCItem[] = []

function readHeadingsFromDom(): TOCItem[] {
  const elements = document.querySelectorAll("article h2, article h3")
  return Array.from(elements).map((element) => ({
    id: element.id,
    text: element.textContent || "",
    level: element.tagName === "H2" ? 2 : 3,
  }))
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  // The article body is rendered by a sibling component, so the set of
  // headings is external state from this component's point of view — it
  // only changes once, when that sibling's markup lands in the DOM.
  // useSyncExternalStore reads it without ever calling setState from
  // inside an effect body: React re-renders this component itself once
  // the client snapshot differs from the (empty) server snapshot.
  const headingsRef = useRef<TOCItem[] | null>(null)
  const subscribe = useCallback(() => () => {}, [])
  const getSnapshot = useCallback(() => {
    if (headingsRef.current === null) {
      headingsRef.current = readHeadingsFromDom()
    }
    return headingsRef.current
  }, [])
  const getServerSnapshot = useCallback(() => EMPTY_HEADINGS, [])

  const headings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (headings.length === 0) return

    const elements = document.querySelectorAll("article h2, article h3")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0% -35% 0%" },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className={cn("sticky top-24", className)} aria-label="Table of contents">
      <h4 className="text-sm font-semibold text-secondary mb-4">On this page</h4>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block py-1 transition-colors hover:text-primary",
                activeId === heading.id ? "text-primary font-medium" : "text-muted-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
