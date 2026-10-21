"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
interface ArticleRendererProps {
  content: string
  isHtml?: boolean
  className?: string
}
export function ArticleRenderer({
  content,
  isHtml = false,
  className,
}: ArticleRendererProps) {
  const baseClass = `prose font-sans ${className ?? ""}`
  if (isHtml)
    return (
      <div
        className={baseClass}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  return (
    <div className={baseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="article-table">
              <p>On a small screen, scroll sideways to read the full table.</p>
              <div
                tabIndex={0}
                role="region"
                aria-label="Article comparison table, scroll horizontally"
              >
                <table>{children}</table>
              </div>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
