import sanitizeHtml from "sanitize-html"

/**
 * Sanitizes and classifies raw article content (legacy HTML or Markdown) for
 * rendering. Uses `sanitize-html` (pure JS, no native/ESM-only transitive
 * dependencies) instead of `isomorphic-dompurify`, whose `jsdom` dependency
 * chain pulls in `html-encoding-sniffer` -> `@exodus/bytes`, an ESM-only
 * package. On Node runtimes that don't support synchronous `require()` of ESM
 * (Node < 20.19 / < 22.12), that chain throws `ERR_REQUIRE_ESM` at request
 * time, crashing every `/blog/[slug]` render for legacy HTML articles.
 */

export const HTML_PATTERN = /<\/?[a-z][^>]*>/i

export const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "b", "i", "u", "s",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "hr", "sup", "sub", "span", "div",
]

export const ALLOWED_ATTR = ["href", "src", "alt", "title", "class", "id", "target", "rel"]

export interface PreparedArticleContent {
  content: string
  isHtml: boolean
}

function sanitizeStrict(raw: string): string {
  return sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { "*": ALLOWED_ATTR },
  })
}

/**
 * Fallback used only when the strict allowlist strips a legacy article down
 * to nothing (e.g. content wrapped in a tag outside ALLOWED_TAGS). Re-runs
 * sanitize-html with its permissive built-in safe defaults so *something*
 * renders — never falls back to the raw, unsanitized database value, which
 * would defeat sanitization entirely for exactly the malformed-content case
 * where it matters most.
 */
function sanitizePermissiveFallback(raw: string): string {
  return sanitizeHtml(raw)
}

export function prepareArticleContent(raw: string, slug: string): PreparedArticleContent {
  if (!raw) {
    console.error(`[v0] Article ${slug}: empty content`)
    return { content: "", isHtml: false }
  }

  const isHtml = HTML_PATTERN.test(raw)
  const preview = raw.slice(0, 100).replace(/\n/g, " ")
  console.log(`[v0] Article ${slug}: format=${isHtml ? "HTML" : "Markdown"}, length=${raw.length}, preview="${preview}..."`)

  if (!isHtml) {
    return { content: raw, isHtml: false }
  }

  try {
    const sanitized = sanitizeStrict(raw)

    if (sanitized.length === 0 && raw.length > 0) {
      console.error(`[v0] Article ${slug}: strict sanitize stripped all content; retrying with safe defaults.`)
      const fallback = sanitizePermissiveFallback(raw)
      console.log(`[v0] Article ${slug}: fallback-sanitized HTML length=${fallback.length} (original=${raw.length})`)
      return { content: fallback, isHtml: true }
    }

    console.log(`[v0] Article ${slug}: sanitized HTML length=${sanitized.length} (original=${raw.length})`)
    return { content: sanitized, isHtml: true }
  } catch (err) {
    console.error(`[v0] Article ${slug}: sanitize-html error:`, err)
    return { content: "", isHtml: false }
  }
}
