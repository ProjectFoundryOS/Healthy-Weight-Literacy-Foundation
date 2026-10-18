import assert from "node:assert/strict"

// Run against the loopback server started from test-publishing-build.mjs.
const origin = "http://127.0.0.1:3100"
const slug = "local-publishing-check"
for (const route of ["/", "/blog", "/education", "/sitemap.xml", `/blog/${slug}`]) {
  const response = await fetch(origin + route)
  const body = await response.text()
  assert.equal(response.status, 200, route)
  assert.ok(body.includes(slug), `Missing sample article: ${route}`)
  if (route === "/sitemap.xml") {
    assert.match(response.headers.get("content-type"), /xml/)
    assert.ok(body.includes(`<loc>https://weightliteracy.org/blog/${slug}</loc>`))
  }
  if (route === `/blog/${slug}`) {
    assert.ok(body.includes("<table"), "Markdown table must render")
    assert.ok(body.includes("Test data; no human review"), "Fixture must identify itself")
  }
  console.log(`PASS ${route}`)
}
const absent = await fetch(`${origin}/blog/unpublished-local-draft`)
assert.equal(absent.status, 404, "Unpublished slugs must not render")
console.log("PASS unpublished article returns 404")
