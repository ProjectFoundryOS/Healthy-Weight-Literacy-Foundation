import { it } from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { articleSections, articleVisualSetSchema } from "../lib/article-visuals.ts"
import { verifyArticleAssets } from "../lib/article-assets.ts"
import { digest, metadataDigest, readPublishedCatalog, validatePublishedEntry } from "../lib/article-publication.ts"
import { exportArticle } from "../lib/editorial-export.ts"
import { generatePageMetadata } from "../lib/seo.ts"
import { buildArticleSchema } from "../lib/article-structured-data.ts"
import { editorialFixture } from "./fixtures/publication.ts"

const bytes = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n0kAAAAASUVORK5CYII=", "base64")
const image = { src: "/images/editorial/test.png", alt: "Test image", width: 1, height: 1, sha256: createHash("sha256").update(bytes).digest("hex") }
const visuals = { hero: image, body: [{ ...image, before_heading: "Image placement check" }] }

it("carries approved images from the editorial record through the public catalog and section renderer", () => {
  const { entry, record, sources } = editorialFixture(visuals)
  const exported = exportArticle({ ...record, visual_provenance: [{ credit: "PRIVATE IMAGE NOTES" }] }, entry.content, sources)
  assert.ok(!JSON.stringify(exported).includes("PRIVATE IMAGE NOTES"))
  const [post] = readPublishedCatalog({ schema_version: 1, purpose: "publication", articles: [exported] })
  assert.deepEqual(post.visuals, visuals)
  assert.equal(post.hero_image, image.src)
  const sections = articleSections(post.content, post.visuals)
  assert.equal(sections.map(section => section.markdown).join(""), post.content)
  assert.equal(sections.filter(section => section.figures.length)[0].markdown.split("\n")[0], "## Image placement check")
})

it("requires renewed metadata approval if the image, description, placement, or file digest changes", () => {
  for (const mutate of [
    (v: typeof visuals) => { v.hero.src = "/images/editorial/replacement.png" },
    (v: typeof visuals) => { v.hero.alt = "Changed image description" },
    (v: typeof visuals) => { v.hero.sha256 = "a".repeat(64) },
    (v: typeof visuals) => { v.body[0].before_heading = "Another heading" },
  ]) {
    const { entry, record, sources } = editorialFixture(structuredClone(visuals))
    mutate(record.visuals!)
    assert.throws(() => exportArticle(record, entry.content, sources), /integrity/)
  }
})

it("rejects lost or ambiguous image placements even after metadata is rehashed", () => {
  for (const content of ["# Test\n\n" + "Long article without the target section. ".repeat(5), "## Image placement check\n\n".repeat(6)]) {
    const { entry } = editorialFixture(visuals)
    entry.content = content; entry.body_sha256 = digest(content)
    assert.throws(() => validatePublishedEntry(entry), /heading must appear exactly once/)
  }
})

it("validates image files and refuses missing files, changed bytes, and symlinks outside public", async () => {
  const root = await mkdtemp(join(tmpdir(), "hwlf-media-"))
  const publicRoot = join(root, "public")
  const file = join(publicRoot, "images/editorial/test.png")
  try {
    await mkdir(join(publicRoot, "images/editorial"), { recursive: true })
    await assert.rejects(verifyArticleAssets(visuals, publicRoot), /ENOENT/)
    await writeFile(file, bytes)
    await verifyArticleAssets(visuals, publicRoot)
    await writeFile(file, "changed bytes")
    await assert.rejects(verifyArticleAssets(visuals, publicRoot), /Image integrity/)
    await rm(file)
    await writeFile(join(root, "outside.png"), bytes)
    await symlink(join(root, "outside.png"), file)
    await assert.rejects(verifyArticleAssets(visuals, publicRoot), /inside public/)
  } finally { await rm(root, { recursive: true, force: true }) }
})

it("rejects external or traversing image paths and display captions in public visual data", () => {
  for (const src of ["https://example.com/test.png", "/images/editorial/../private.png", "/images/editorial/%2e%2e.png"]) {
    assert.equal(articleVisualSetSchema.safeParse({ ...visuals, hero: { ...image, src } }).success, false)
  }
  assert.equal(articleVisualSetSchema.safeParse({ ...visuals, hero: { ...image, caption: "Visible caption" } }).success, false)
})

it("supports the current article categories and excludes document draft banners from publication", () => {
  for (const category of ["Weight-Loss Medicines", "Understanding Weight"] as const) {
    const { entry } = editorialFixture(visuals)
    entry.metadata.category = category
    entry.metadata_sha256 = metadataDigest(entry.metadata)
    validatePublishedEntry(entry)
  }
  for (const marker of ["*Article draft — pending*", "*Editorial sample — pending*"]) {
    const { entry } = editorialFixture(visuals)
    entry.content = `${marker}\n\n${entry.content}`; entry.body_sha256 = digest(entry.content)
    assert.throws(() => validatePublishedEntry(entry), /Draft cannot/)
  }
})

it("uses the article hero and actual dimensions for sharing and structured data", () => {
  const metadata = generatePageMetadata({ title: "Test", description: "Test", path: "/blog/test", image: image.src, imageWidth: 1536, imageHeight: 1024, imageAlt: image.alt })
  assert.deepEqual(metadata.openGraph?.images, [{ url: `https://weightliteracy.org${image.src}`, width: 1536, height: 1024, alt: image.alt }])
  const schema = buildArticleSchema({ title: "Test", description: "Test", slug: "test", category: "Weight-Loss Medicines", publishedAt: "2026-10-01", image: image.src }, { name: "Foundation", url: "https://weightliteracy.org" })
  assert.equal(schema.image, `https://weightliteracy.org${image.src}`)
})
