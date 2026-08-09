import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { getBlogPosts } from "@/lib/content-registry"

// Issue #15/Stage 2A must not regress any Stage 1 (#14/#23/#24) guarantee.
// These tests prove the frozen production snapshot is untouched byte-for-
// byte, so no article body content was mass-rewritten and no publication
// state changed, alongside the registry-level counts already covered by
// __tests__/content-registry.test.ts.
describe("Stage 1 preservation (no regression from Stage 2A trust work)", () => {
  it("content/snapshot/manifest.json is byte-identical to the Stage 1 frozen baseline (918a6f7)", () => {
    const manifestPath = path.join(process.cwd(), "content", "snapshot", "manifest.json")
    const raw = readFileSync(manifestPath, "utf8")
    const hash = createHash("sha256").update(raw).digest("hex")
    // Recorded once, from the Stage 1 closure commit (918a6f7), and never
    // updated for Stage 2A — Stage 2A adds a separate review registry
    // overlay (content/reviews/registry.json) instead of touching this file.
    expect(hash).toBe("fa0f856b957656c36b9ca1b85d35cc3a969865058ea9644cf07199a8982f2e89")
  })

  it("every committed article file's content is unchanged (hash-verified) — no article body was mass-rewritten", () => {
    // getBlogPosts() re-verifies every article's sha256 against the
    // manifest on every load (Issue #23); it not throwing already proves
    // no snapshot file was hand-edited. This assertion also pins the
    // count so a partial/mass edit that somehow preserved individual
    // hashes but dropped/added files would still be caught.
    const posts = getBlogPosts()
    expect(posts).toHaveLength(34)
  })

  it("the committed snapshot still has no unpublished rows — the 5 historical unpublished rows were never added here (they must stay unpublished in Supabase, not merely absent from this repo)", () => {
    const manifestPath = path.join(process.cwd(), "content", "snapshot", "manifest.json")
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
    expect(manifest.mode).toBe("published_only")
    expect(manifest.article_count).toBe(34)
    expect(manifest.articles.every((a: { is_published: boolean }) => a.is_published === true)).toBe(true)
  })

  it("no new Supabase write call site was introduced outside the pre-existing admin functions in lib/supabase-blog.ts", () => {
    const root = process.cwd()
    // Matches an actual Supabase query-builder write chain, e.g.
    // `.from("blog_posts")...insert(/update(/delete(` — not just any
    // unrelated `.update(`/`.delete(` call (e.g. a Map or a crypto hash)
    // that happens to share a file with the word "supabase" in a comment.
    const writeChainPattern = /\.from\(["'`]blog_posts["'`]\)[\s\S]{0,300}?\.(insert|update|delete)\(/
    const skipDirs = new Set(["node_modules", ".next", ".git"])
    const allowedFiles = new Set([
      path.join(root, "lib", "supabase-blog.ts"),
      path.join(root, "scripts", "migrate-html-to-markdown.ts"), // pre-existing, unused-by-build, out of Stage 2A scope
    ])

    function scanDir(dir: string, offenders: string[]) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (skipDirs.has(entry.name)) continue
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scanDir(fullPath, offenders)
          continue
        }
        if (!/\.(ts|tsx|mjs|js)$/.test(entry.name)) continue
        if (allowedFiles.has(fullPath)) continue
        if (fullPath.includes(`${path.sep}__tests__${path.sep}`)) continue

        const content = readFileSync(fullPath, "utf8")
        if (writeChainPattern.test(content)) {
          offenders.push(fullPath)
        }
      }
    }

    const offenders: string[] = []
    scanDir(root, offenders)
    expect(offenders).toEqual([])
  })
})
