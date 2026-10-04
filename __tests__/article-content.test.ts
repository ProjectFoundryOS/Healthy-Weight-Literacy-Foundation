import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { prepareArticleContent } from "../lib/article-content.ts"

describe("prepareArticleContent", () => {
  it("does not require any ESM-only jsdom dependency at runtime", () => {
    // Regression guard for the production ERR_REQUIRE_ESM crash: on Node
    // runtimes that can't synchronously require() ESM (< 20.19 / < 22.12),
    // isomorphic-dompurify's jsdom -> html-encoding-sniffer -> @exodus/bytes
    // chain threw on every legacy HTML article. Merely importing this module
    // (done above) and calling it must never touch that chain again.
    const result = prepareArticleContent("<p>hello</p>", "esm-guard")
    assert.equal(result.isHtml, true)
  })

  it("passes new-format Markdown articles through unchanged for ReactMarkdown", () => {
    const markdown = "# Title\n\nSome **bold** text and a [link](https://example.com)."
    const result = prepareArticleContent(markdown, "new-markdown-article")
    assert.equal(result.isHtml, false)
    assert.equal(result.content, markdown)
  })

  it("strips <script> tags and event-handler attributes from legacy HTML articles", () => {
    const legacyHtml =
      '<p onclick="alert(1)">Legacy telehealth guidance</p><script>alert(document.cookie)</script>'
    const result = prepareArticleContent(legacyHtml, "understanding-telehealth-weight-management-guide")

    assert.equal(result.isHtml, true)
    assert.ok(!result.content.includes("<script"))
    assert.ok(!result.content.includes("onclick"))
    assert.ok(result.content.includes("Legacy telehealth guidance"))
  })

  it("strips javascript: URLs from legacy anchor/image attributes", () => {
    const legacyHtml = '<p><a href="javascript:alert(1)">click</a><img src="javascript:alert(2)"></p>'
    const result = prepareArticleContent(legacyHtml, "online-prescriptions-safety")

    assert.ok(!result.content.includes("javascript:"))
  })

  it("preserves benign formatting allowed by the legacy tag/attribute allowlist", () => {
    const legacyHtml =
      '<h2>Heading</h2><p>Some <strong>bold</strong> and <em>italic</em> text.</p>' +
      '<ul><li>one</li><li>two</li></ul>' +
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">a link</a>' +
      '<img src="https://example.com/hero.jpg" alt="hero">'
    const result = prepareArticleContent(legacyHtml, "well-formed-legacy-article")

    assert.ok(result.content.includes("<h2>Heading</h2>"))
    assert.ok(result.content.includes("<strong>bold</strong>"))
    assert.ok(result.content.includes("<em>italic</em>"))
    assert.ok(result.content.includes("<li>one</li>"))
    assert.ok(result.content.includes('href="https://example.com"'))
    assert.ok(result.content.includes('src="https://example.com/hero.jpg"'))
  })

  it("falls back to safe permissive sanitization instead of raw HTML when the strict allowlist strips everything", () => {
    // <section> is outside ALLOWED_TAGS, so the strict pass would previously
    // strip this down to "" and the old code fell back to *raw*, unsanitized
    // HTML -- including the script tag. The fallback must still remove it.
    const legacyHtml = '<section><script>alert(document.cookie)</script>Some legacy body copy</section>'
    const result = prepareArticleContent(legacyHtml, "disallowed-wrapper-tag-article")

    assert.equal(result.isHtml, true)
    assert.ok(!result.content.includes("<script"))
    assert.ok(result.content.includes("Some legacy body copy"))
  })

  it("treats empty content as empty Markdown rather than throwing", () => {
    const result = prepareArticleContent("", "empty-article")
    assert.deepEqual(result, { content: "", isHtml: false })
  })
})
