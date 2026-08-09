"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ArticleRendererProps {
  /** Markdown content. Legacy HTML rows are normalized to Markdown at
   *  content-registry load time (lib/content-normalize.ts), so this
   *  component only ever renders Markdown — no dangerouslySetInnerHTML,
   *  no jsdom-backed sanitizer (Issue #24). */
  content: string
  className?: string
}

export function ArticleRenderer({ content, className }: ArticleRendererProps) {
  const baseClass = `prose prose-lg max-w-none font-sans ${className ?? ""}`.trim()

  if (!content) {
    return (
      <div className={baseClass}>
        <p className="text-muted-foreground italic">No content available.</p>
      </div>
    )
  }

  return (
    <article className={baseClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  )
}
