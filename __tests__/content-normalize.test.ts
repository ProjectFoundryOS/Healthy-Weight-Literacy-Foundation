import { describe, it, expect } from "vitest"
import { isLegacyHtml, normalizeToMarkdown } from "@/lib/content-normalize"

// Regression fixtures for Issue #24: legacy HTML rows must never reach the
// render path with executable content intact. react-markdown does not
// execute raw HTML by default, but normalizeToMarkdown is defense-in-depth
// applied before that, so we assert directly on its output.
describe("content normalization XSS fixtures (Issue #24)", () => {
  it("detects legacy HTML vs. already-Markdown content", () => {
    expect(isLegacyHtml("<p>Hello</p>")).toBe(true)
    expect(isLegacyHtml("# Hello\n\nBody text.")).toBe(false)
    expect(isLegacyHtml("")).toBe(false)
  })

  it("strips <script> tags and their contents", () => {
    const out = normalizeToMarkdown('<p>Safe</p><script>alert("xss")</script>')
    expect(out).not.toMatch(/<script/i)
    expect(out).not.toContain("alert(")
  })

  it("strips inline event-handler attributes", () => {
    const out = normalizeToMarkdown('<img src="x.png" onerror="alert(1)">')
    expect(out).not.toMatch(/onerror/i)
  })

  it("strips javascript: URLs", () => {
    const out = normalizeToMarkdown('<a href="javascript:alert(1)">click</a>')
    expect(out.toLowerCase()).not.toContain("javascript:")
  })

  it("removes iframe/object/embed/form/style tags", () => {
    const out = normalizeToMarkdown(
      '<iframe src="evil.example"></iframe><object data="x"></object><embed src="x"><form action="x"><input></form><style>body{}</style>',
    )
    expect(out).not.toMatch(/<iframe|<object|<embed|<form|<input|<style/i)
  })

  it("converts ordinary legacy HTML structure to equivalent Markdown", () => {
    const out = normalizeToMarkdown("<h2>Heading</h2><p>Para with <strong>bold</strong> and <em>italic</em>.</p>")
    expect(out).toContain("## Heading")
    expect(out).toContain("**bold**")
    expect(out).toContain("_italic_")
  })

  it("leaves already-Markdown content untouched", () => {
    const markdown = "# Title\n\nSome **bold** text with a [link](https://example.com)."
    expect(normalizeToMarkdown(markdown)).toBe(markdown)
  })

  it("leaves empty content untouched", () => {
    expect(normalizeToMarkdown("")).toBe("")
  })
})
