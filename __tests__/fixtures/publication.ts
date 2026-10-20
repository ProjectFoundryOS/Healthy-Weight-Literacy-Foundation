import { digest, metadataDigest, type PublishedEntry } from "../../lib/article-publication.ts"
import type { ArticleVisualSet } from "../../lib/article-visuals.ts"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"

export function fixture(slug = "local-publishing-check", visuals?: ArticleVisualSet): PublishedEntry {
  const metadata = {
    article_id: `TEST-${slug}`, slug, title: "Local publishing check",
    description: "Non-health test content for the article publishing connection.",
    author: "Local test fixture", category: "Nutrition Education" as const, tags: ["local-test"],
    citations: [{ title: "Example reference", url: "https://example.com/", type: "reference" }],
    published_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-01T00:00:00Z",
    reviewed_at: "2026-10-01T00:00:00Z", approved_at: "2026-10-01T00:00:00Z",
    next_review_date: "2027-10-01T00:00:00Z",
    editor_name: "Local test fixture",
    disclosure: "This is synthetic software test content for local verification only.",
    ...(visuals ? { visuals } : {}),
  }
  const content = "# Local publishing check\n\nThis synthetic page checks that article titles, links, tables, and editorial details render correctly. It contains no medical guidance.\n\n## Image placement check\n\nThe image above this section is part of the article record. Images have no visible captions.\n\n| Item | Value |\n|---|---|\n| Local check | Visible |\n\n[Example reference](https://example.com/)\n"
  return { metadata, content, body_sha256: digest(content), metadata_sha256: metadataDigest(metadata) }
}

export function editorialFixture(visuals?: ArticleVisualSet) {
  const entry = fixture("local-publishing-check", visuals)
  const m = entry.metadata
  return {
    entry,
    sources: [{ id: "example", title: "Example reference", url: "https://example.com/" }],
    record: {
      article_id: m.article_id, slug: m.slug, title: m.title, description: m.description,
      author: m.author, category: m.category, tags: m.tags, source_ids: ["example"],
      body_path: "articles/test.md", published_at: m.published_at, updated_at: m.updated_at,
      next_review_at: m.next_review_date, status: "approved", publish: true,
      provenance: { ai_assisted: false }, public_disclosure: m.disclosure,
      ...(visuals ? { visuals } : {}),
      approval: {
        editor_approval: { name: m.editor_name, approved_at: m.approved_at },
        subject_approval: null,
        approved_at: m.approved_at, approved_body_sha256: entry.body_sha256,
        approved_metadata_sha256: entry.metadata_sha256,
      },
    },
  }
}

/** Real local media, attached only to explicitly synthetic software test content. */
export function visualFixture(): PublishedEntry {
  const image = (name: string, alt: string) => ({
    src: `/images/editorial/${name}.png`, alt, width: 1536, height: 1024,
    sha256: createHash("sha256").update(readFileSync(new URL(`../../public/images/editorial/${name}.png`, import.meta.url))).digest("hex"),
  })
  return fixture("local-publishing-check", {
    hero: image("starting-treatment", "A woman walking along a garden path."),
    body: [{ ...image("everyday-meal", "A meal on a table."), before_heading: "Image placement check" }],
  })
}
