#!/usr/bin/env node
// Read-only Supabase exporter that captures a validated, version-controlled
// snapshot of the published article corpus. This snapshot is used at build
// time as a fallback when live Supabase retrieval fails or unexpectedly
// returns nothing, so a Vercel deployment can never silently ship zero
// article pages. See lib/content-snapshot.ts for the loader and
// lib/supabase-blog.ts for how the fallback is applied.
//
// Usage:
//   npm run content:snapshot
//   npm run content:snapshot -- --allow-empty   (permit writing a 0-row snapshot)
//
// Requires NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and a readable key
// (SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_ANON_KEY).
// Never writes to Supabase.

import { createClient } from "@supabase/supabase-js"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const OUT_DIR = path.join(process.cwd(), "lib", "content-snapshot-data")
const SNAPSHOT_FILE = path.join(OUT_DIR, "blog-posts.snapshot.json")
const MANIFEST_FILE = path.join(OUT_DIR, "manifest.json")

const allowEmpty = process.argv.includes("--allow-empty")

function fail(message) {
  console.error(`[content-snapshot] ERROR: ${message}`)
  process.exit(1)
}

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex")
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!url) fail("NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) is not set.")
  if (!key) fail("No Supabase key found (SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY).")

  const client = createClient(url, key)

  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error) {
    fail(`Supabase query failed: ${error.message} (code: ${error.code ?? "unknown"})`)
  }

  const posts = data ?? []

  if (posts.length === 0 && !allowEmpty) {
    fail(
      "Query returned 0 published posts. Refusing to overwrite the committed snapshot with an empty one " +
        "(this usually means a transient connection/config problem, not an empty corpus). " +
        "Re-run with --allow-empty if a zero-article snapshot is genuinely intended.",
    )
  }

  if (existsSync(MANIFEST_FILE)) {
    const previousManifest = JSON.parse(readFileSync(MANIFEST_FILE, "utf-8"))
    if (posts.length < previousManifest.count && !allowEmpty) {
      console.warn(
        `[content-snapshot] WARNING: new snapshot has fewer posts (${posts.length}) than the previous one ` +
          `(${previousManifest.count}, generated ${previousManifest.generatedAt}). Proceeding, but verify this drop is expected.`,
      )
    }
  }

  mkdirSync(OUT_DIR, { recursive: true })

  const snapshotJson = JSON.stringify(posts, null, 2)
  writeFileSync(SNAPSHOT_FILE, snapshotJson)

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: posts.length,
    sha256: sha256(snapshotJson),
    sourceTable: "blog_posts",
  }
  writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2))

  console.log(`[content-snapshot] Wrote ${posts.length} posts to ${path.relative(process.cwd(), SNAPSHOT_FILE)}`)
  console.log(`[content-snapshot] Manifest: ${path.relative(process.cwd(), MANIFEST_FILE)} (sha256 ${manifest.sha256.slice(0, 12)}...)`)
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err))
})
