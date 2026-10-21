import { test, mock } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { z } from "zod"
import {
  normalizeSearch,
  getSearchIndex,
  searchContent,
} from "../lib/search-index.ts"
import {
  articleTopics,
  relatedArticleSlugs,
  articleOutline,
} from "../lib/article-topics.ts"
import { handleForm } from "../lib/form-handler.ts"
import { sendAdminNotification } from "../lib/resend.ts"

const catalog = JSON.parse(
  readFileSync(
    new URL("../content/articles/catalog.json", import.meta.url),
    "utf8",
  ),
)
const articles = catalog.articles.map((item: any) => item.metadata)
const index = getSearchIndex(articles, [], [])
test("common medicine spellings lead to the same published search results", () => {
  const resultSlugs = (query: string) =>
    searchContent(query, index).map((item) => item.slug)
  assert.ok(resultSlugs("GLP1").length > 0)
  assert.deepEqual(resultSlugs("GLP1"), resultSlugs("GLP-1"))
  assert.deepEqual(resultSlugs("glp 1"), resultSlugs("GLP-1"))
  assert.deepEqual(resultSlugs("Ozempic"), resultSlugs("semaglutide"))
  assert.deepEqual(resultSlugs("Zepbound"), resultSlugs("tirzepatide"))
  assert.deepEqual(resultSlugs("retratrutide"), resultSlugs("retatrutide"))
  assert.equal(
    normalizeSearch("Wegovy vs Zepbound"),
    "semaglutide vs tirzepatide",
  )
  assert.deepEqual(resultSlugs("zzzznomatch"), [])
})
test("every published article has a topic and three valid, distinct related guides", () => {
  const published = new Set(articles.map((item: any) => item.slug))
  const assigned = articleTopics.flatMap((topic) => [...topic.slugs])
  assert.equal(assigned.length, published.size)
  assert.equal(new Set(assigned).size, assigned.length)
  assigned.forEach((slug) => assert.ok(published.has(slug)))
  for (const slug of published as Set<string>) {
    const related = relatedArticleSlugs(slug)
    assert.equal(related.length, 3)
    assert.equal(new Set(related).size, 3)
    assert.ok(!related.includes(slug))
    related.forEach((value) => assert.ok(published.has(value)))
  }
})
test("article outline preserves repeated headings with unique stable destinations", () => {
  assert.deepEqual(
    articleOutline("Intro\n## First\nText\n### Detail\n## First\nMore"),
    [
      { id: "section-1", text: "First" },
      { id: "section-2", text: "First" },
    ],
  )
})
const schema = z.object({ email: z.string().email() })
const request = (body: string, origin = "https://www.weightliteracy.org") =>
  new Request("https://www.weightliteracy.org/api/contact", {
    method: "POST",
    headers: { origin },
    body,
  })
test("forms cannot report success when delivery rejects", async () => {
  const response = await handleForm(
    request('{"email":"reader@example.invalid"}'),
    schema,
    async () => {
      throw Error("provider rejected")
    },
  )
  assert.equal(response.status, 503)
  assert.equal((await response.json()).ok, false)
})
test("forms validate payload and origin before invoking delivery", async () => {
  let calls = 0
  const delivery = async () => {
    calls++
  }
  for (const req of [
    request("bad JSON"),
    request('{"email":"wrong"}'),
    request('{"email":"reader@example.invalid"}', "https://another.example"),
  ]) {
    const response = await handleForm(req, schema, delivery)
    assert.ok(response.status >= 400)
  }
  assert.equal(calls, 0)
})
test("a provider acceptance permits the accurate success message", async () => {
  let calls = 0
  const response = await handleForm(
    request('{"email":"reader@example.invalid"}'),
    schema,
    async () => {
      calls++
    },
    "Signup request sent.",
  )
  assert.equal(calls, 1)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    ok: true,
    message: "Signup request sent.",
  })
})
test("Resend resolved error responses and missing receipts are treated as failures", async () => {
  const previous = process.env.RESEND_API_KEY
  process.env.RESEND_API_KEY = "re_test_dummy_not_a_real_key"
  try {
    for (const [body, status] of [
      [{ name: "validation_error", message: "sender invalid" }, 400],
      [{}, 200],
    ] as const) {
      const stub = mock.method(globalThis, "fetch", async () =>
        Response.json(body, { status }),
      )
      await assert.rejects(
        sendAdminNotification({ subject: "Test", html: "<p>Test</p>" }),
        /did not accept/,
      )
      assert.equal(stub.mock.calls.length, 1)
      stub.mock.restore()
    }
    const stub = mock.method(globalThis, "fetch", async () =>
      Response.json({ id: "mock-receipt" }),
    )
    assert.deepEqual(
      await sendAdminNotification({
        subject: "Test",
        html: "<p>Test</p>",
        replyTo: "reader@example.invalid",
      }),
      { id: "mock-receipt" },
    )
    stub.mock.restore()
  } finally {
    mock.restoreAll()
    if (previous === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = previous
  }
})
