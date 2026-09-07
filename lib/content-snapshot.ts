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
    cached = loadContentSnapshotFrom(SNAPSHOT_DIR)
  }
  return cached
}

/** Test-only: clears the in-process snapshot cache so tests can reload from disk fixtures. */
export function __resetContentSnapshotCacheForTests() {
  cached = null
}
