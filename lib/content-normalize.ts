// Legacy HTML -> Markdown normalization for article content.
//
// Rationale (Issue #24): the production `/blog/[slug]` route previously ran
// isomorphic-dompurify (jsdom) server-side to sanitize legacy HTML rows,
// which crashes under Next's server runtime (`ERR_REQUIRE_ESM` via
// html-encoding-sniffer -> @exodus/bytes). Normalizing legacy HTML to
// Markdown at content-registry load time removes jsdom from the ordinary
// article render path entirely: react-markdown does not execute embedded
// HTML without the (unused here) rehype-raw plugin, so no DOM parser is
// needed at request time.
//
// This module never mutates committed snapshot files — it runs in memory
// against the frozen, hash-verified snapshot content each time the
// registry loads, so the Stage #14 snapshot provenance/hashes stay intact.

import TurndownService from "turndown"

const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i

// Tags that must never survive normalization, regardless of Turndown's
// default handling, because they can carry executable behavior.
const DANGEROUS_TAGS: (keyof HTMLElementTagNameMap)[] = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "noscript",
  "link",
  "meta",
]

let turndownService: TurndownService | null = null

function getTurndownService(): TurndownService {
  if (turndownService) return turndownService

  const service = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  })

  service.remove(DANGEROUS_TAGS)

  turndownService = service
  return service
}

export function isLegacyHtml(content: string): boolean {
  return typeof content === "string" && HTML_TAG_PATTERN.test(content)
}

/**
 * Strip any residual executable HTML constructs that could survive an
 * imperfect Turndown conversion (malformed markup, stray attributes).
 * Applied as a defense-in-depth pass after Markdown conversion — the
 * primary safety property is that react-markdown never renders raw HTML.
 */
export function stripResidualDangerousMarkup(content: string): string {
  return content
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button|noscript|link|meta)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "")
}

/**
 * Normalize article content to Markdown. Content already in Markdown is
 * returned unchanged. Legacy HTML is converted via Turndown, then passed
 * through a dangerous-markup strip as defense in depth.
 */
export function normalizeToMarkdown(content: string): string {
  if (!content) return content
  if (!isLegacyHtml(content)) return content

  const service = getTurndownService()
  const converted = service.turndown(content)
  return stripResidualDangerousMarkup(converted)
}
