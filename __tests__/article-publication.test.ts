import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { digest, metadataDigest, readPublishedCatalog, resolveArticleCatalog, validatePublishedEntry } from "../lib/article-publication.ts"
import { exportArticle } from "../lib/editorial-export.ts"
import { getSearchIndex, searchContent } from "../lib/search-index.ts"
import { buildArticleSchema, serializeStructuredData } from "../lib/article-structured-data.ts"
import { fixture, editorialFixture } from "./fixtures/publication.ts"

const catalog = (entries = [fixture()]) => ({ schema_version: 1, purpose: "publication", articles: entries })
const posts = () => readPublishedCatalog(catalog())

describe("approved publication", () => {
  it("exports only public fields and does not invent a medical reviewer", () => {
    const { record, entry, sources } = editorialFixture()
    const exported = exportArticle({ ...record, private_notes: "Never publish" }, entry.content, sources)
    assert.deepEqual(exported, entry)
    assert.ok(!JSON.stringify(exported).includes("private_notes"))
    assert.equal(posts()[0].medical_reviewer, null)
  })
  it("rejects drafts and missing approvals", () => {
    const { record, entry, sources } = editorialFixture()
    assert.throws(() => exportArticle({ ...record, status: "draft" }, entry.content, sources))
    assert.throws(() => exportArticle({ ...record, approval: null }, entry.content, sources))
  })
  it("invalidates approval when text or public metadata changes", () => {
    const { record, entry, sources } = editorialFixture()
    assert.throws(() => exportArticle(record, entry.content + "Changed", sources), /integrity/)
    for (const field of ["title", "author"] as const) {
      assert.throws(() => exportArticle({ ...record, [field]: "Changed" }, entry.content, sources), /integrity/)
    }
    record.approval.editor_approval.name = "Changed"
    assert.throws(() => exportArticle(record, entry.content, sources), /integrity/)
  })
  it("allows editorial approval without a clinician or public process disclosures", () => {
    const { record, entry, sources } = editorialFixture()
    delete entry.metadata.disclosure
    entry.metadata_sha256 = metadataDigest(entry.metadata)
    const exported = exportArticle({
      ...record, provenance: { ai_assisted: true, source_check: "Private method" },
      public_disclosure: null, private_review_report: "Private findings",
      approval: { ...record.approval, subject_approval: undefined, approved_metadata_sha256: entry.metadata_sha256 },
    }, entry.content, sources)
    assert.deepEqual(exported, entry)
    assert.equal(exported.metadata.medical_review, undefined)
    assert.equal(exported.metadata.disclosure, undefined)
    assert.ok(!JSON.stringify(exported).match(/ai_assisted|provenance|Private method|Private findings/))
    const article = readPublishedCatalog(catalog([exported]))[0]
    assert.equal(article.medical_reviewer, null)
    const schema = buildArticleSchema({ title: article.title, description: article.description, slug: article.slug,
      publishedAt: article.published_at, category: article.category, reviewerName: article.editorial?.medical_review?.name,
      reviewedAt: article.editorial?.medical_review?.reviewed_at }, { name: "Foundation", url: "https://example.com" })
    assert.equal(schema.reviewedBy, undefined)
    assert.equal(schema.lastReviewed, undefined)
  })
  it("retains an optional actual medical review with its own date and integrity checks", () => {
    const { record, entry, sources } = editorialFixture()
    const medical = { name: "Optional test reviewer", credentials: "Synthetic test credential", reviewed_at: "2026-09-30T00:00:00Z" }
    entry.metadata.medical_review = medical
    entry.metadata_sha256 = metadataDigest(entry.metadata)
    const reviewedRecord = { ...record, approval: { ...record.approval, subject_approval: medical, approved_metadata_sha256: entry.metadata_sha256 } }
    assert.deepEqual(exportArticle(reviewedRecord, entry.content, sources), entry)
    assert.equal(readPublishedCatalog(catalog([entry]))[0].medical_reviewer, medical.name)
    assert.throws(() => exportArticle({ ...reviewedRecord, approval: { ...reviewedRecord.approval,
      subject_approval: { ...medical, name: "Changed" } } }, entry.content, sources), /integrity/)
    entry.metadata.medical_review = { ...medical, reviewed_at: "2026-10-02T00:00:00Z" }
    entry.metadata_sha256 = metadataDigest(entry.metadata)
    assert.throws(() => validatePublishedEntry(entry), /must precede/)
    assert.throws(() => exportArticle({ ...record, approval: { ...record.approval, subject_approval: {} } }, entry.content, sources))
  })
  it("requires registered sources to appear in the article", () => {
    const { record, entry, sources } = editorialFixture()
    assert.throws(() => exportArticle(record, entry.content, []), /Unknown source/)
    assert.throws(() => exportArticle(record, entry.content.replace("https://example.com/", "https://example.org/"), sources), /Source missing/)
  })
  it("rejects raw HTML, draft markers, and empty bodies", () => {
    for (const suffix of ["<script>alert(1)</script>", "Review draft"]) {
      const entry = fixture(); entry.content += suffix; entry.body_sha256 = digest(entry.content)
      assert.throws(() => validatePublishedEntry(entry))
    }
    const entry = fixture(); entry.content = ""; entry.body_sha256 = digest("")
    assert.throws(() => validatePublishedEntry(entry))
  })
  it("rejects future and inconsistent review dates", () => {
    const entry = fixture(); entry.metadata.approved_at = "2099-01-01T00:00:00Z"
    entry.metadata_sha256 = metadataDigest(entry.metadata)
    assert.throws(() => validatePublishedEntry(entry), /Future/)
    entry.metadata.approved_at = "2026-09-01T00:00:00Z"
    entry.metadata_sha256 = metadataDigest(entry.metadata)
    assert.throws(() => validatePublishedEntry(entry), /Inconsistent/)
  })
  it("rejects duplicate articles and prevents test bundles in CI or Vercel", () => {
    assert.throws(() => readPublishedCatalog(catalog([fixture(), fixture()])), /Duplicate/)
    const testCatalog = { ...catalog(), purpose: "local-test" }
    for (const env of [{}, { HWLF_LOCAL_CONTENT_TEST: "1", CI: "true" }, { HWLF_LOCAL_CONTENT_TEST: "1", VERCEL: "1" }]) {
      assert.throws(() => readPublishedCatalog(testCatalog, env), /only/)
    }
    assert.equal(readPublishedCatalog(testCatalog, { HWLF_LOCAL_CONTENT_TEST: "1" }).length, 1)
  })
})

describe("catalog inventory", () => {
  it("reads approved files without a database and refuses an empty release", () => {
    assert.deepEqual(resolveArticleCatalog(posts()), posts())
    assert.throws(() => resolveArticleCatalog([]), /No approved/)
  })
  it("blocks conflicting slugs and unpublished or malformed records", () => {
    assert.throws(() => resolveArticleCatalog([...posts(), ...posts()]), /conflict/)
    for (const override of [{ is_published: false }, { content: "" }, { slug: "../draft" }, { published_at: "invalid" }]) {
      assert.throws(() => resolveArticleCatalog([{ ...posts()[0], ...override }]), /Invalid/)
    }
  })
  it("orders articles by publication date and slug without mutating the input", () => {
    const input = readPublishedCatalog(catalog([fixture("z-article"), fixture("a-article"), fixture("latest-article")]))
    input[2].published_at = "2026-10-02T00:00:00Z"
    assert.deepEqual(resolveArticleCatalog(input).map(p => p.slug), ["latest-article", "a-article", "z-article"])
    assert.deepEqual(input.map(p => p.slug), ["z-article", "a-article", "latest-article"])
  })
})

describe("discovery and attribution", () => {
  it("searches the supplied public inventory, without hardcoded articles", () => {
    const index = getSearchIndex(posts(), [], [])
    assert.equal(searchContent("publishing", index)[0].slug, "local-publishing-check")
    assert.deepEqual(searchContent("nutrition myths", index), [])
    assert.deepEqual(searchContent(" ", index), [])
    assert.ok(!JSON.stringify(index).includes("contains no medical guidance"))
  })
  it("never claims review based only on category or an update date", () => {
    const props = { title: "Test", description: "Test", slug: "test", publishedAt: "2026-10-01", category: "Metabolic Health" }
    const site = { name: "Foundation", url: "https://example.com" }
    const schema = buildArticleSchema(props, site)
    assert.equal(schema.reviewedBy, undefined); assert.equal(schema.lastReviewed, undefined)
    const reviewed = buildArticleSchema({ ...props, reviewerName: "Named reviewer", reviewedAt: "2026-10-01" }, site)
    assert.equal(reviewed.lastReviewed, "2026-10-01")
  })
  it("prevents JSON-LD strings from closing a script element", () => {
    const value = { title: "</script><script>alert(1)</script>" }
    const serialized = serializeStructuredData(value)
    assert.ok(!serialized.includes("<")); assert.deepEqual(JSON.parse(serialized), value)
  })
})
