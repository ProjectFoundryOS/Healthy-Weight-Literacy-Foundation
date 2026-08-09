#!/usr/bin/env node

/**
 * Read-only production content snapshot exporter.
 *
 * Purpose:
 * - Pull the current Supabase blog_posts rows into version-control-friendly files.
 * - Create one JSON file per slug plus a manifest with hashes.
 * - Establish a deterministic baseline before any V5 article rewrite.
 *
 * This script NEVER writes to Supabase.
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY
 *
 * Usage:
 *   node scripts/export-content-snapshot.mjs
 *   node scripts/export-content-snapshot.mjs --all
 */

import { createClient } from "@supabase/supabase-js"
import { createHash } from "node:crypto"
import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

const includeUnpublished = process.argv.includes("--all")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

if (!url || !key) {
  console.error("Missing Supabase URL or anon key. No snapshot was created.")
  process.exit(1)
}

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

let query = client.from("blog_posts").select("*").order("slug", { ascending: true })
if (!includeUnpublished) query = query.eq("is_published", true)

const { data, error } = await query
if (error) {
  console.error(`Supabase read failed: ${error.message}`)
  process.exit(1)
}

if (!Array.isArray(data) || data.length === 0) {
  console.error("Supabase returned zero blog posts. Refusing to create an empty baseline.")
  process.exit(1)
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonicalize(value[k])]))
  }
  return value
}

function stableJson(value) {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex")
}

function safeSlug(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Unsafe or invalid slug: ${String(slug)}`)
  }
  return slug
}

const root = path.resolve("content/snapshot")
const articleDir = path.join(root, "articles")

// Deliberately replace the prior generated snapshot so deleted/renamed slugs cannot linger.
await rm(articleDir, { recursive: true, force: true })
await mkdir(articleDir, { recursive: true })

const manifestArticles = []
for (const post of data) {
  const slug = safeSlug(post.slug)
  const serialized = stableJson(post)
  const hash = sha256(serialized)
  await writeFile(path.join(articleDir, `${slug}.json`), serialized, "utf8")
  manifestArticles.push({
    slug,
    id: post.id ?? null,
    is_published: Boolean(post.is_published),
    published_at: post.published_at ?? null,
    updated_at: post.updated_at ?? null,
    sha256: hash,
  })
}

const manifest = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source: "supabase.blog_posts",
  mode: includeUnpublished ? "all" : "published_only",
  article_count: data.length,
  articles: manifestArticles,
}

await writeFile(path.join(root, "manifest.json"), stableJson(manifest), "utf8")

console.log(`Snapshot complete: ${data.length} article records`)
console.log(`Output: ${root}`)
console.log("No Supabase writes were performed.")
