import { it } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createHash } from "node:crypto"
import { isEditorialPreview } from "../lib/editorial-preview-mode.mjs"
import { readDraftPreview } from "../lib/editorial-preview.ts"
import { resolveArticleCatalog } from "../lib/article-publication.ts"

it("keeps drafts unavailable by default and refuses hosted or production preview settings", async () => {
  assert.equal(isEditorialPreview({}), false)
  for (const overrides of [{ NODE_ENV: "production" }, { VERCEL: "1" }, { CI: "true" }]) {
    const env = { NODE_ENV: "development", HWLF_EDITORIAL_PREVIEW_DIR: "/missing", ...overrides }
    assert.throws(() => isEditorialPreview(env), /local development/)
    await assert.rejects(readDraftPreview(env), /local development/)
  }
  await assert.rejects(readDraftPreview({}), /not enabled/)
})

it("renders only selected drafts without transferring private review fields or publication approval", async () => {
  const root = await mkdtemp(join(tmpdir(), "hwlf-preview-"))
  try {
    await mkdir(join(root, "records")); await mkdir(join(root, "articles"))
    const content = "# Sample\n\nUnpublished sample with no health claims.\n"
    const record = {
      article_id: "SAMPLE", slug: "sample", title: "Sample", description: "Preview only",
      body_path: "articles/sample.md", draft_sha256: createHash("sha256").update(content).digest("hex"),
      status: "draft", publish: false, created_on: "2026-10-19", updated_on: "2026-10-19",
      category: "Test", tags: ["sample"], private_notes: "PRIVATE REVIEW DETAILS",
    }
    await writeFile(join(root, "preview.json"), JSON.stringify({ article_slugs: ["sample"] }))
    await writeFile(join(root, "records/sample.json"), JSON.stringify(record))
    await writeFile(join(root, "records/excluded.json"), "Not part of the preview")
    await writeFile(join(root, "articles/sample.md"), content)
    const env = { NODE_ENV: "development", HWLF_EDITORIAL_PREVIEW_DIR: root }
    const posts = await readDraftPreview(env)
    assert.equal(posts.length, 1)
    assert.equal(posts[0].content, content)
    assert.equal(posts[0].is_published, false)
    assert.equal(posts[0].published_at, "")
    assert.equal(posts[0].editorial, undefined)
    assert.equal(posts[0].medical_reviewer, null)
    assert.ok(!JSON.stringify(posts).includes("PRIVATE REVIEW DETAILS"))
    assert.throws(() => resolveArticleCatalog(posts), /Invalid published/)
    await writeFile(join(root, "articles/sample.md"), content + "An unrecorded change")
    await assert.rejects(readDraftPreview(env), /Draft changed/)
    await writeFile(join(root, "preview.json"), JSON.stringify({ article_slugs: ["../outside"] }))
    await assert.rejects(readDraftPreview(env))
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
