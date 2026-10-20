import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { visualFixture } from "../__tests__/fixtures/publication.ts"

// Run against the loopback server started from test-publishing-build.mjs.
const origin = process.env.HWLF_TEST_ORIGIN || "http://127.0.0.1:3101"
const endpoint = new URL(origin)
assert.ok(endpoint.hostname === "127.0.0.1" && endpoint.protocol === "http:", "Checks must stay on loopback")
const visuals = visualFixture().metadata.visuals
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
    assert.ok(body.includes("This is synthetic software test content"), "Fixture must identify itself")
    assert.ok(body.includes("Editorial review:"), "Article must show its actual editorial review")
    assert.ok(!body.includes('"reviewedBy"'), "Editorial-only approval must not create a medical reviewer")
    assert.ok(!body.includes("ai_assisted"), "Internal review provenance must stay private")
    assert.ok(body.includes(encodeURIComponent(visuals.hero.src)), "Hero image must render")
    assert.ok(body.includes(encodeURIComponent(visuals.body[0].src)), "Body image must render")
    assert.ok(!body.includes("<figcaption"), "Images must remain caption-free")
    assert.ok(body.includes(`content="https://weightliteracy.org${visuals.hero.src}"`), "Share image must use the absolute live URL")
    assert.ok(body.includes('property="og:image:width" content="1536"'), "Share image dimensions must match the asset")
    assert.ok(body.includes(`"image":"https://weightliteracy.org${visuals.hero.src}"`), "Structured data must include the hero image")
  }
  console.log(`PASS ${route}`)
}
for (const image of [visuals.hero, ...visuals.body]) {
  const response = await fetch(origin + image.src)
  assert.equal(response.status, 200, image.src)
  assert.match(response.headers.get("content-type"), /image\/png/)
  assert.equal(createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex"), image.sha256)
  console.log(`PASS image bytes ${image.src}`)
}
for (const route of ["/medical-review", "/how-we-create-content", "/editorial-policy"]) {
  const response = await fetch(origin + route)
  const body = await response.text()
  assert.equal(response.status, 200, route)
  assert.ok(!/Medical Review Process|Clinical review pending|not medically reviewed|automated checks|AI-assisted/i.test(body),
    `Public policy must use neutral editorial wording: ${route}`)
  if (route === "/medical-review") assert.ok(body.includes("Evidence &amp; Editorial Standards"))
  console.log(`PASS editorial policy ${route}`)
}
const optimized = await fetch(`${origin}/_next/image?url=${encodeURIComponent(visuals.hero.src)}&w=640&q=75`)
assert.equal(optimized.status, 200, "Responsive image optimizer must serve the hero")
assert.match(optimized.headers.get("content-type"), /image\//)
console.log("PASS responsive image optimization")
const absent = await fetch(`${origin}/blog/unpublished-local-draft`)
assert.equal(absent.status, 404, "Unpublished slugs must not render")
console.log("PASS unpublished article returns 404")
