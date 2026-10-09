import type { BlogPost } from "./supabase-blog"
import type { ContentSnapshot } from "./content-snapshot"
export class BuildContentIntegrityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BuildContentIntegrityError"
  }
}

export type LiveFetchResult<T> = { ok: true; data: T } | { ok: false; reason: string }

export interface ResolvedBlogPosts {
  posts: BlogPost[]
  source: "live" | "snapshot"
  warnings: string[]
}

/**
 * Pure resolution logic (exported for unit testing) deciding how to answer
 * "what are the published posts?" given a live fetch outcome and the
 * validated snapshot. Throws BuildContentIntegrityError only when neither
 * source has any content.
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


  throw new BuildContentIntegrityError(
    [
      "Refusing to build with zero article slugs.",
      live.ok ? "Live Supabase fetch returned 0 published posts." : `Live Supabase fetch failed: ${live.reason}.`,
      snapshot.manifest
        ? `The committed content snapshot also has 0 posts (generated ${snapshot.manifest.generatedAt}).`
        : "No validated content snapshot is committed to fall back to (see scripts/export-content-snapshot.mjs).",
      "Run `npm run content:snapshot` against a healthy Supabase connection to refresh the snapshot, and verify the corpus before building.",
    ].join(" "),
  )
}

