import { createHash } from "crypto"
import { existsSync, readFileSync } from "fs"
import path from "path"
import type { BlogPost } from "./supabase-blog"

const SNAPSHOT_DIR = path.join(process.cwd(), "lib", "content-snapshot-data")
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, "blog-posts.snapshot.json")
const MANIFEST_FILE = path.join(SNAPSHOT_DIR, "manifest.json")

export interface SnapshotManifest {
  generatedAt: string
  count: number
  sha256: string
  sourceTable: string
  fixture?: boolean
}

export interface ContentSnapshot {
  posts: BlogPost[]
  manifest: SnapshotManifest | null
  /** Set when a snapshot file exists but failed integrity validation and was rejected. */
  integrityError: string | null
}

let cached: ContentSnapshot | null = null

function sha256(contents: string): string {
  return createHash("sha256").update(contents).digest("hex")
}

/**
 * Loads a content snapshot from a given directory. Exported (in addition to
 * getContentSnapshot()) so tests can point at fixture directories instead of
 * the real committed snapshot location.
 *
 * Never throws. A missing, unreadable, or tampered snapshot resolves to an
 * empty, untrusted snapshot so callers can decide whether to fail closed.
 */
export function loadContentSnapshotFrom(dir: string): ContentSnapshot {
  const snapshotFile = path.join(dir, "blog-posts.snapshot.json")
  const manifestFile = path.join(dir, "manifest.json")

  if (!existsSync(snapshotFile) || !existsSync(manifestFile)) {
    return { posts: [], manifest: null, integrityError: null }
  }

  try {
    const raw = readFileSync(snapshotFile, "utf-8")
    const manifest = JSON.parse(readFileSync(manifestFile, "utf-8")) as SnapshotManifest
    const fixtureAllowed = process.env.HWLF_LOCAL_STAGING_FIXTURE === "true" && !process.env.VERCEL && !process.env.CI
    if (manifest.fixture && !fixtureAllowed) throw new Error("TEST ONLY snapshot forbidden outside isolated local staging")
    if (manifest.sourceTable !== "blog_posts" || !Number.isFinite(Date.parse(manifest.generatedAt)) || Date.parse(manifest.generatedAt) > Date.now()) throw new Error("Invalid snapshot provenance")
    const actualHash = sha256(raw)

    if (actualHash !== manifest.sha256) {
      return {
        posts: [],
        manifest: null,
        integrityError: `Content snapshot rejected: manifest sha256 (${manifest.sha256}) does not match snapshot file contents (${actualHash}).`,
      }
    }

    const posts = JSON.parse(raw)

    if (!Array.isArray(posts)) {
      return { posts: [], manifest: null, integrityError: "Content snapshot rejected: snapshot file is not a JSON array." }
    }

    if (posts.length !== manifest.count) {
      return {
        posts: [],
        manifest: null,
        integrityError: `Content snapshot rejected: manifest count (${manifest.count}) does not match snapshot contents (${posts.length}).`,
      }
    }

    const seen = new Set<string>()
    for (const post of posts) {
      if (!post || typeof post.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || seen.has(post.slug) || typeof post.title !== "string" || !post.title.trim() || typeof post.content !== "string" || post.content.trim().length < 100 || (!manifest.fixture && post.is_published !== true)) throw new Error("Invalid, duplicate, empty or unpublished snapshot article")
      seen.add(post.slug)
    }
    return { posts: posts as BlogPost[], manifest, integrityError: null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { posts: [], manifest: null, integrityError: `Content snapshot rejected: failed to read/parse snapshot (${msg}).` }
  }
}

/**
 * Loads the committed, version-controlled content snapshot used as a build-time
 * fallback when live Supabase retrieval fails or unexpectedly returns nothing.
 * Result is cached for the lifetime of the process/build worker.
 */
export function getContentSnapshot(): ContentSnapshot {
  if (!cached) {
    const configured = process.env.HWLF_LOCAL_STAGING_SNAPSHOT_DIR
    if (configured && (process.env.HWLF_LOCAL_STAGING_FIXTURE !== "true" || process.env.VERCEL || process.env.CI)) throw new Error("Local staging snapshots cannot be used by deployments")
    cached = loadContentSnapshotFrom(configured ?? SNAPSHOT_DIR)
  }
  return cached
}

/** Test-only: clears the in-process snapshot cache so tests can reload from disk fixtures. */
export function __resetContentSnapshotCacheForTests() {
  cached = null
}
