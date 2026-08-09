import { getBlogPosts } from "../lib/content-registry"

const HTML_PATTERN = /<\/?[a-z][^>]*>/i
const MARKDOWN_HEADING = /^#+ /m
const MARKDOWN_BOLD = /\*\*[^*]+\*\*/

interface ValidationResult {
  slug: string
  category: string
  format: "HTML" | "Markdown" | "Unknown"
  length: number
  hasContent: boolean
  suspiciousPatterns: string[]
}

async function validateArticles() {
  console.log("🔍 Scanning the committed content registry...\n")

  const posts = getBlogPosts()
  const results: ValidationResult[] = []
  
  for (const post of posts) {
    const suspiciousPatterns: string[] = []
    let format: "HTML" | "Markdown" | "Unknown" = "Unknown"
    
    if (!post.content || post.content.length === 0) {
      suspiciousPatterns.push("EMPTY_CONTENT")
    }
    
    if (HTML_PATTERN.test(post.content)) {
      format = "HTML"
      // Check if HTML tags are being rendered as literal text
      if (post.content.includes("&lt;") || post.content.includes("&gt;")) {
        suspiciousPatterns.push("ESCAPED_HTML")
      }
    } else if (MARKDOWN_HEADING.test(post.content) || MARKDOWN_BOLD.test(post.content)) {
      format = "Markdown"
    }
    
    if (post.content.length < 100 && post.content.length > 0) {
      suspiciousPatterns.push("TOO_SHORT")
    }
    
    results.push({
      slug: post.slug,
      category: post.category,
      format,
      length: post.content.length,
      hasContent: post.content.length > 0,
      suspiciousPatterns,
    })
  }
  
  // Summary stats
  const total = results.length
  const byFormat = {
    HTML: results.filter(r => r.format === "HTML").length,
    Markdown: results.filter(r => r.format === "Markdown").length,
    Unknown: results.filter(r => r.format === "Unknown").length,
  }
  const issues = results.filter(r => r.suspiciousPatterns.length > 0)
  
  console.log("📊 SUMMARY")
  console.log("=".repeat(60))
  console.log(`Total articles: ${total}`)
  console.log(`  HTML: ${byFormat.HTML}`)
  console.log(`  Markdown: ${byFormat.Markdown}`)
  console.log(`  Unknown: ${byFormat.Unknown}`)
  console.log(`\nArticles with issues: ${issues.length}`)
  console.log("=".repeat(60))
  
  if (issues.length > 0) {
    console.log("\n⚠️  ARTICLES WITH ISSUES:")
    issues.forEach(issue => {
      console.log(`\n  ${issue.slug}`)
      console.log(`    Format: ${issue.format}`)
      console.log(`    Length: ${issue.length} chars`)
      console.log(`    Issues: ${issue.suspiciousPatterns.join(", ")}`)
    })
  }
  
  console.log("\n✅ Validation complete")
  
  return { total, byFormat, issues }
}

validateArticles().catch(console.error)
