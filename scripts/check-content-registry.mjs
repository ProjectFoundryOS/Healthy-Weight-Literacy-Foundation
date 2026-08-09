#!/usr/bin/env node

/**
 * Vercel build safeguard (Issue #23).
 *
 * Runs as the npm "prebuild" lifecycle script, before `next build`. Fails
 * fast with a clear message if the committed content registry is missing,
 * malformed, has duplicate slugs, has a hash mismatch against its own
 * manifest, or has fewer published articles than the configured floor.
 *
 * This exists so a broken/missing snapshot fails the build immediately
 * instead of letting `next build` run for minutes before failing inside
 * page generation, and so CI output plainly states the reason.
 *
 * This script performs no network access and no Supabase calls.
 */

import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"

const root = path.resolve("content/snapshot")
const manifestPath = path.join(root, "manifest.json")
const articlesDir = path.join(root, "articles")
const configPath = path.join(root, "registry.config.json")

function fail(message) {
  console.error(`\n[check-content-registry] BUILD BLOCKED\n${message}\n`)
  process.exit(1)
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex")
}

let config
try {
  config = JSON.parse(readFileSync(configPath, "utf8"))
} catch (err) {
  fail(`Could not read ${configPath}: ${err.message}`)
}

if (typeof config.minExpectedArticles !== "number" || config.minExpectedArticles < 1) {
  fail(`registry.config.json must set a positive "minExpectedArticles". Got: ${JSON.stringify(config.minExpectedArticles)}`)
}

let manifest
try {
  const raw = readFileSync(manifestPath, "utf8")
  manifest = JSON.parse(raw)
} catch (err) {
  fail(
    `Missing or unreadable content/snapshot/manifest.json.\n` +
      `Run "npm run content:snapshot" against a read-only production Supabase connection and commit the result (Issue #14) before building.\n` +
      `Original error: ${err.message}`,
  )
}

if (!Array.isArray(manifest.articles)) {
  fail(`manifest.json has no "articles" array.`)
}

const seenSlugs = new Set()
let publishedCount = 0

for (const entry of manifest.articles) {
  if (seenSlugs.has(entry.slug)) {
    fail(`Duplicate slug in manifest: "${entry.slug}"`)
  }
  seenSlugs.add(entry.slug)

  const filePath = path.join(articlesDir, `${entry.slug}.json`)
  let raw
  try {
    raw = readFileSync(filePath, "utf8")
  } catch {
    fail(`manifest.json references "${entry.slug}" but content/snapshot/articles/${entry.slug}.json is missing.`)
  }

  const actualHash = sha256(raw)
  if (actualHash !== entry.sha256) {
    fail(
      `Hash mismatch for "${entry.slug}": manifest expects ${entry.sha256}, file hashes to ${actualHash}.\n` +
        `Re-run "npm run content:snapshot" rather than editing snapshot files by hand.`,
    )
  }

  if (entry.is_published) publishedCount++
}

if (publishedCount === 0) {
  fail(`Registry resolved to zero published articles. Refusing to build with an empty corpus.`)
}

if (publishedCount < config.minExpectedArticles) {
  fail(
    `Registry has ${publishedCount} published articles, below the configured floor of ${config.minExpectedArticles} ` +
      `(content/snapshot/registry.config.json). Refusing to build silently on a likely partial/broken snapshot.`,
  )
}

console.log(`[check-content-registry] OK: ${publishedCount} published articles, ${manifest.articles.length} total manifest entries, all hashes verified.`)
