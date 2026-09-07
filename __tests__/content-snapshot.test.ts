import { describe, expect, it } from "vitest"
import { mkdtempSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { createHash } from "crypto"
import { loadContentSnapshotFrom } from "@/lib/content-snapshot"

function writeFixtureSnapshot(dir: string, posts: unknown[], overrides: Partial<{ sha256: string; count: number }> = {}) {
  const snapshotJson = JSON.stringify(posts, null, 2)
  writeFileSync(path.join(dir, "blog-posts.snapshot.json"), snapshotJson)
  const manifest = {
    generatedAt: "2026-01-01T00:00:00.000Z",
    count: overrides.count ?? posts.length,
    sha256: overrides.sha256 ?? createHash("sha256").update(snapshotJson).digest("hex"),
    sourceTable: "blog_posts",
  }
  writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2))
}

describe("loadContentSnapshotFrom", () => {
  it("returns an empty, untrusted-free snapshot when the directory has no files", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "snapshot-missing-"))
    const result = loadContentSnapshotFrom(dir)
    expect(result).toEqual({ posts: [], manifest: null, integrityError: null })
  })

  it("loads posts when the manifest hash matches the snapshot contents", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "snapshot-valid-"))
    const posts = [{ slug: "a" }, { slug: "b" }]
    writeFixtureSnapshot(dir, posts)

    const result = loadContentSnapshotFrom(dir)

    expect(result.integrityError).toBeNull()
    expect(result.posts).toHaveLength(2)
    expect(result.manifest?.count).toBe(2)
  })

  it("rejects the snapshot when the sha256 does not match (tampered/corrupt file)", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "snapshot-tampered-"))
    writeFixtureSnapshot(dir, [{ slug: "a" }], { sha256: "0".repeat(64) })

    const result = loadContentSnapshotFrom(dir)

    expect(result.posts).toEqual([])
    expect(result.manifest).toBeNull()
    expect(result.integrityError).toMatch(/does not match/)
  })

  it("rejects the snapshot when the manifest count disagrees with the file contents", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "snapshot-miscount-"))
    writeFixtureSnapshot(dir, [{ slug: "a" }], { count: 99 })

    const result = loadContentSnapshotFrom(dir)

    expect(result.posts).toEqual([])
    expect(result.integrityError).toMatch(/manifest count/)
  })

  it("rejects a snapshot file that is not a JSON array", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "snapshot-notarray-"))
    const snapshotJson = JSON.stringify({ not: "an array" })
    writeFileSync(path.join(dir, "blog-posts.snapshot.json"), snapshotJson)
    writeFileSync(
      path.join(dir, "manifest.json"),
      JSON.stringify({
        generatedAt: "2026-01-01T00:00:00.000Z",
        count: 0,
        sha256: createHash("sha256").update(snapshotJson).digest("hex"),
        sourceTable: "blog_posts",
      }),
    )

    const result = loadContentSnapshotFrom(dir)

    expect(result.posts).toEqual([])
    expect(result.integrityError).toMatch(/not a JSON array/)
  })
})
