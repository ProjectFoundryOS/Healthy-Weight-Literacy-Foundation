import { createClient } from "@supabase/supabase-js"
import { getContentSnapshot, type ContentSnapshot } from "./content-snapshot"

// Read env vars at call time (not module init) to avoid stale singleton issues
// in environments where the Supabase project may have been paused/resumed.
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

  if (!url) {
    console.error("[Supabase] CONFIG ERROR: NEXT_PUBLIC_SUPABASE_URL is not set")
    return null
  }

  if (!key) {
    console.error("[Supabase] CONFIG ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")
    return null
  }

  try {
    new URL(url)
  } catch {
    console.error("[Supabase] CONFIG ERROR: NEXT_PUBLIC_SUPABASE_URL is not a valid URL:", url)
    return null
  }

  console.log("[Supabase] Client created for host:", new URL(url).hostname)
  return createClient(url, key)
}

export interface Citation {
  title: string
  url: string
  /** e.g. "clinical-trial" | "peer-reviewed" | "fda" | "health-authority" | "guideline" */
  type: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  // Author identity
  author: string
  author_image: string
  /** Professional title, e.g. "Registered Dietitian, MPH" */
  author_title: string | null
  /** Author biography shown on article page */
  author_bio: string | null
  /** Credentials array, e.g. ["RD", "MPH"] */
  author_credentials: string[] | null
  // Medical review
  /** Name of the medical reviewer */
  medical_reviewer: string | null
  /** Reviewer's credentials, e.g. "MD, Obesity Medicine Specialist" */
  reviewer_credentials: string | null
  /** Date of last medical review */
  reviewed_at: string | null
  /** Date when next review is due */
  next_review_date: string | null
  // Content quality
  /** Structured citations array stored as JSONB */
  citations: Citation[] | null
  /** Whether the article includes the required medical disclaimer */
  has_medical_disclaimer: boolean
  // Dates
  published_at: string
  updated_at: string
  created_at: string
  // Content
  hero_image: string
  tags: string[]
  category: string
  reading_time: string
  content: string
  is_published: boolean
}

// --- Build-time fail-closed / validated-snapshot fallback -----------------
//
// A green production build must never silently generate zero article slugs
// because a live Supabase fetch failed. getBlogPosts()/getBlogPost() fall
// back to the committed, integrity-checked snapshot (lib/content-snapshot.ts)
// when live retrieval fails or unexpectedly returns nothing, and throw
// (failing the build closed) only when neither source has any content.

export class BuildContentIntegrityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BuildContentIntegrityError"
  }
}

type LiveFetchResult<T> = { ok: true; data: T } | { ok: false; reason: string }

async function fetchLivePublishedPosts(): Promise<LiveFetchResult<BlogPost[]>> {
  const client = getSupabaseClient()
  if (!client) {
    return { ok: false, reason: "Supabase client not configured" }
  }

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })

    if (error) {
      return { ok: false, reason: `query error: ${error.message} (code: ${error.code})` }
    }

    return { ok: true, data: data ?? [] }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: `network error: ${msg}` }
  }
}

async function fetchLiveSinglePost(slug: string): Promise<LiveFetchResult<BlogPost | null>> {
  const client = getSupabaseClient()
  if (!client) {
    return { ok: false, reason: "Supabase client not configured" }
  }

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()

    if (error) {
      // PGRST116 = no row matched .single() — a genuine "not found", not a failure.
      if (error.code === "PGRST116") {
        return { ok: true, data: null }
      }
      return { ok: false, reason: `query error: ${error.message} (code: ${error.code})` }
    }

    return { ok: true, data }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: `network error: ${msg}` }
  }
}

export interface ResolvedBlogPosts {
  posts: BlogPost[]
  source: "live" | "snapshot"
  warnings: string[]
}

/**
 * Pure resolution logic (exported for unit testing) deciding how to answer
 * "what are the published posts?" given a live fetch outcome and the
 * validated snapshot. Throws BuildContentIntegrityError only when neither
 * source has any content, unless explicitly overridden.
 */
export function resolveBlogPosts(
  live: LiveFetchResult<BlogPost[]>,
  snapshot: ContentSnapshot,
): ResolvedBlogPosts {
  const warnings: string[] = []
  if (snapshot.integrityError) {
    warnings.push(snapshot.integrityError)
  }

  if (live.ok && live.data.length > 0) {
    if (snapshot.manifest && live.data.length < snapshot.manifest.count) {
      warnings.push(
        `Live Supabase fetch returned ${live.data.length} posts, fewer than the validated snapshot (${snapshot.manifest.count} as of ${snapshot.manifest.generatedAt}). Using live data, but this drop should be investigated.`,
      )
    }
    return { posts: live.data, source: "live", warnings }
  }

  warnings.push(
    !live.ok
      ? `Live Supabase fetch failed (${live.reason}); falling back to the validated content snapshot.`
      : "Live Supabase fetch returned zero published posts; falling back to the validated content snapshot.",
  )

  if (snapshot.posts.length > 0) {
    return { posts: snapshot.posts, source: "snapshot", warnings }
  }

  if (process.env.ALLOW_EMPTY_ARTICLE_BUILD === "true") {
    warnings.push("ALLOW_EMPTY_ARTICLE_BUILD=true is set; proceeding with zero articles.")
    return { posts: [], source: "snapshot", warnings }
  }

  throw new BuildContentIntegrityError(
    [
      "Refusing to build with zero article slugs.",
      live.ok ? "Live Supabase fetch returned 0 published posts." : `Live Supabase fetch failed: ${live.reason}.`,
      snapshot.manifest
        ? `The committed content snapshot also has 0 posts (generated ${snapshot.manifest.generatedAt}).`
        : "No validated content snapshot is committed to fall back to (see scripts/export-content-snapshot.mjs).",
      "Run `npm run content:snapshot` against a healthy Supabase connection to refresh the snapshot, or set ALLOW_EMPTY_ARTICLE_BUILD=true if a zero-article corpus is genuinely expected.",
    ].join(" "),
  )
}

// Fetch all published blog posts sorted by published_at.
// Falls back to the validated snapshot on failure/empty; fails closed if
// neither source has content — see resolveBlogPosts() above.
export async function getBlogPosts(): Promise<BlogPost[]> {
  const live = await fetchLivePublishedPosts()
  const snapshot = getContentSnapshot()
  const resolved = resolveBlogPosts(live, snapshot)

  for (const warning of resolved.warnings) {
    console.warn("[Supabase][content-safety] getBlogPosts:", warning)
  }
  console.log(`[Supabase] getBlogPosts: returned ${resolved.posts.length} posts (source: ${resolved.source})`)

  return resolved.posts
}

// Fetch a single blog post by slug. Falls back to the validated snapshot
// only when the live fetch itself fails (network/query error) — a genuine
// "not found" from a healthy live fetch is respected as-is.
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const live = await fetchLiveSinglePost(slug)

  if (live.ok) {
    return live.data
  }

  console.error("[Supabase] getBlogPost:", slug, "live fetch failed:", live.reason)

  const snapshot = getContentSnapshot()
  const fromSnapshot = snapshot.posts.find((post) => post.slug === slug) ?? null

  if (fromSnapshot) {
    console.warn(
      `[Supabase][content-safety] getBlogPost: serving "${slug}" from validated snapshot after live fetch failure.`,
    )
  }

  return fromSnapshot
}

// Fetch blog posts by category
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const client = getSupabaseClient()
  if (!client) {
    return []
  }

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("category", category)
      .eq("is_published", true)
      .order("published_at", { ascending: false })

    if (error) {
      console.error("Error fetching blog posts by category:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("Error fetching blog posts by category:", err)
    return []
  }
}

// Fetch blog posts by tag
export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const client = getSupabaseClient()
  if (!client) {
    return []
  }

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .contains("tags", [tag])
      .eq("is_published", true)
      .order("published_at", { ascending: false })

    if (error) {
      console.error("Error fetching blog posts by tag:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("Error fetching blog posts by tag:", err)
    return []
  }
}

// Create a new blog post (for future admin functionality)
export async function createBlogPost(
  post: Omit<BlogPost, "id" | "created_at" | "updated_at">,
): Promise<BlogPost | null> {
  const client = getSupabaseClient()
  if (!client) {
    return null
  }

  const { data, error } = await client.from("blog_posts").insert([post]).select().single()

  if (error) {
    console.error("Error creating blog post:", error)
    return null
  }

  return data
}

// Update a blog post (for future admin functionality)
export async function updateBlogPost(slug: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  const client = getSupabaseClient()
  if (!client) {
    return null
  }

  const { data, error } = await client.from("blog_posts").update(updates).eq("slug", slug).select().single()

  if (error) {
    console.error("Error updating blog post:", error)
    return null
  }

  return data
}

// Delete a blog post (for future admin functionality)
export async function deleteBlogPost(slug: string): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) {
    return false
  }

  const { error } = await client.from("blog_posts").delete().eq("slug", slug)

  if (error) {
    console.error("Error deleting blog post:", error)
    return false
  }

  return true
}
