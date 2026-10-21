import { test } from "node:test"
import assert from "node:assert/strict"
import { getNewsUpdates, validateNewsUpdates, formatNewsDate } from "../lib/news.ts"
import { getSearchIndex, searchContent } from "../lib/search-index.ts"

test("news inventory links to published guides and sorts by original source date", () => {
  const items = getNewsUpdates()
  assert.equal(items.length, 3)
  assert.equal(items[0].source.publishedOn, "2026-10-14")
  assert.equal(items[2].source.publishedOn, "2026-01-13")
  assert.equal(formatNewsDate("2026-01-13"), "Jan 13, 2026")
})
test("search preserves news anchor destinations instead of inventing article pages", () => {
  const item = getNewsUpdates()[0]
  const index = getSearchIndex([], [], [], [{type: "news", slug: item.id, title: item.title, description: item.summary, tags: [], category: item.category, url: `/news#${item.id}`}])
  assert.equal(searchContent("brown-fat", index)[0].url, `/news#${item.id}`)
})
test("news validation refuses duplicated sources, unpublished guide links, and invalid dates", () => {
  const item = getNewsUpdates()[0]
  assert.throws(() => validateNewsUpdates([item, { ...item, id: "another-id" }], [item.relatedSlug]), /Duplicate/)
  assert.throws(() => validateNewsUpdates([item], []), /must be published/)
  assert.throws(() => validateNewsUpdates([{ ...item, checkedOn: "2026-02-30" }], [item.relatedSlug]), /Invalid calendar date/)
  assert.throws(() => validateNewsUpdates([{ ...item, checkedOn: "2026-10-21" }], [item.relatedSlug], "2026-10-20"), /future/)
  assert.throws(() => validateNewsUpdates([{ ...item, source: { ...item.source, url: "http://example.org" } }], [item.relatedSlug]))
})
