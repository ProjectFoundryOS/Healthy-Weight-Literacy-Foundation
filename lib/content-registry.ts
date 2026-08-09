// Build-time article registry (Issue #23).
//
// Problem this replaces: `next build` previously called live Supabase
// (`lib/supabase-blog.ts`) during static generation. A network/Supabase
// outage made `getBlogPosts()` catch its error and return `[]`, so
// `generateStaticParams()` produced zero article routes while the build
// still reported success — a green deployment with no articles.
//
// Fix: the committed, hash-verified Stage #14 snapshot
// (`content/snapshot/manifest.json` + `content/snapshot/articles/*.json`)
// becomes the build-time source of truth. Blog index, article routes,
// sitemap, related links, and search all read from this module so they
// can never disagree. Supabase remains the publishing/admin write path
// (see `lib/supabase-blog.ts`) and a live-audit mirror
// (`/api/v5/content-inventory`), but it is never required at build time.
//
// Any integrity failure here throws — it does not degrade to an empty
// array — so a broken/missing/tampered snapshot fails the build loudly
// instead of silently shipping a corpus of zero.

import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import type { BlogPost } from "./supabase-blog"
import { normalizeToMarkdown } from "./content-normalize"

const SNAPSHOT_ROOT = path.join(process.cwd(), "content", "snapshot")
const MANIFEST_PATH = path.join(SNAPSHOT_ROOT, "manifest.json")
const ARTICLES_DIR = path.join(SNAPSHOT_ROOT, "articles")
const REGISTRY_CONFIG_PATH = path.join(SNAPSHOT_ROOT, "registry.config.json")

export interface ManifestArticleEntry {
  slug: string
  id: string | null
  is_published: boolean
  published_at: string | null
  updated_at: string | null
  sha256: string
}

export interface Manifest {
  schema_version: number
  generated_at: string
  source: string
  mode: "all" | "published_only"
  article_count: number
  articles: ManifestArticleEntry[]
}

export interface RegistryConfig {
  minExpectedArticles: number
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}

/**
 * Pure integrity/build core: given a manifest, a config, and a way to read
 * an article's raw file contents by slug, either returns the validated,
 * normalized published-article list or throws. Contains no filesystem
 * path knowledge, so it is directly unit-testable against in-memory
 * fixtures (see __tests__/content-registry.test.ts) without needing a
 * real snapshot on disk.
 */
export function buildRegistryFromManifest(
  manifest: Manifest,
  readArticleFile: (slug: string) => string,
  config: RegistryConfig,
): BlogPost[] {
  if (!Array.isArray(manifest.articles)) {
    throw new Error('[content-registry] manifest.json is missing an "articles" array')
  }

  const seenSlugs = new Set<string>()
  const posts: BlogPost[] = []

  for (const entry of manifest.articles) {
    if (seenSlugs.has(entry.slug)) {
      throw new Error(`[content-registry] Duplicate slug in manifest: "${entry.slug}"`)
    }
    seenSlugs.add(entry.slug)

    let raw: string
    try {
      raw = readArticleFile(entry.slug)
    } catch {
      throw new Error(
        `[content-registry] manifest.json references slug "${entry.slug}" but content/snapshot/articles/${entry.slug}.json is missing.`,
      )
    }

    const actualHash = sha256(raw)
    if (actualHash !== entry.sha256) {
      throw new Error(
        `[content-registry] Hash mismatch for "${entry.slug}": manifest expects ${entry.sha256}, file hashes to ${actualHash}. ` +
          `The snapshot file may have been edited outside the exporter. Re-run "npm run content:snapshot".`,
      )
    }

    const post = JSON.parse(raw) as BlogPost
    if (!post.is_published) continue

    posts.push({
      ...post,
      content: normalizeToMarkdown(post.content),
    })
  }

  if (posts.length === 0) {
    throw new Error(
      "[content-registry] Registry resolved to zero published articles. Refusing to build with an empty corpus.",
    )
  }

  if (posts.length < config.minExpectedArticles) {
    throw new Error(
      `[content-registry] Registry has ${posts.length} published articles, below the configured floor of ` +
        `${config.minExpectedArticles} (content/snapshot/registry.config.json). This likely indicates a partial ` +
        `or broken snapshot export rather than a real drop in published articles. Refusing to build silently.`,
    )
  }

  posts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  return posts
}

function readRegistryConfig(): RegistryConfig {
  try {
    const raw = readFileSync(REGISTRY_CONFIG_PATH, "utf8")
    const parsed = JSON.parse(raw) as Partial<RegistryConfig>
    if (typeof parsed.minExpectedArticles !== "number" || parsed.minExpectedArticles < 1) {
      throw new Error("minExpectedArticles must be a positive number")
    }
    return { minExpectedArticles: parsed.minExpectedArticles }
  } catch (err) {
    throw new Error(
      `[content-registry] Could not read ${REGISTRY_CONFIG_PATH}: ${(err as Error).message}`,
    )
  }
}

function readManifest(): Manifest {
  let raw: string
  try {
    raw = readFileSync(MANIFEST_PATH, "utf8")
  } catch {
    throw new Error(
      `[content-registry] Missing content/snapshot/manifest.json. Run "npm run content:snapshot" ` +
        `against a read-only production Supabase connection and commit the result before building. ` +
        `The build-time article registry has no other source of truth (Issue #23).`,
    )
  }

  let manifest: Manifest
  try {
    manifest = JSON.parse(raw) as Manifest
  } catch (err) {
    throw new Error(`[content-registry] content/snapshot/manifest.json is not valid JSON: ${(err as Error).message}`)
  }

  if (!Array.isArray(manifest.articles)) {
    throw new Error("[content-registry] manifest.json is missing an \"articles\" array")
  }

  return manifest
}

let cachedPosts: BlogPost[] | null = null
let cachedManifest: Manifest | null = null

function loadRegistry(): BlogPost[] {
  if (cachedPosts) return cachedPosts

  const config = readRegistryConfig()
  const manifest = readManifest()
  cachedManifest = manifest

  const readArticleFile = (slug: string) => readFileSync(path.join(ARTICLES_DIR, `${slug}.json`), "utf8")

  cachedPosts = buildRegistryFromManifest(manifest, readArticleFile, config)
  return cachedPosts
}

/**
 * The Stage #14 manifest hash for a slug — the same sha256 already used to
 * verify snapshot integrity (Issue #23), reused here as the article
 * revision identifier for the Stage 2A review registry (Issue #15). A
 * review record is only valid evidence about the exact content it names;
 * this lets review lookups detect when an article's committed content has
 * changed since a review was recorded.
 */
export function getRevisionHash(slug: string): string | null {
  loadRegistry() // ensures cachedManifest is populated (and integrity-checked)
  const entry = cachedManifest?.articles.find((a) => a.slug === slug)
  return entry?.sha256 ?? null
}

export function getBlogPosts(): BlogPost[] {
  return loadRegistry()
}

export function getBlogPost(slug: string): BlogPost | null {
  return loadRegistry().find((post) => post.slug === slug) ?? null
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return loadRegistry().filter((post) => post.category === category)
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return loadRegistry().filter((post) => post.tags.includes(tag))
}

/** Test/audit helper: registry size and slug set without triggering caller-facing errors being swallowed. */
export function getRegistrySlugs(): string[] {
  return loadRegistry().map((post) => post.slug)
}
