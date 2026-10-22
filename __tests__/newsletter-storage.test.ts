import { test, mock } from "node:test"
import assert from "node:assert/strict"
import { handleForm } from "../lib/form-handler.ts"
import { newsletterFormSchema } from "../lib/validators.ts"
import { saveNewsletterSignup, NEWSLETTER_CONSENT_VERSION } from "../lib/newsletter-storage.ts"

test("newsletter storage validates consent, saves privately, and fails honestly", async () => {
  const originalUrl = process.env.SUPABASE_URL
  const originalKey = process.env.SUPABASE_SECRET_KEY
  const originalLegacyKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  process.env.SUPABASE_URL = "https://newsletter-fixture.supabase.co"
  process.env.SUPABASE_SECRET_KEY = "fixture-key-not-a-real-secret"
  let providerStatus = 201
  const requests: { url: string; init?: RequestInit }[] = []
  const fetchStub = mock.method(globalThis, "fetch", async (input: any, init?: RequestInit) => {
    requests.push({ url: String(input), init })
    if (providerStatus >= 400) return Response.json({ code: "42501", message: "denied" }, { status: providerStatus })
    return new Response(null, { status: providerStatus })
  })
  const submit = (body: unknown, origin = "https://www.weightliteracy.org") =>
    handleForm(new Request("https://www.weightliteracy.org/api/newsletter", {
      method: "POST", headers: { origin }, body: JSON.stringify(body),
    }), newsletterFormSchema, (data) => saveNewsletterSignup(String(data.email)),
    "Your newsletter signup has been saved.", "Your signup could not be saved.")
  try {
    for (const body of [
      { email: "reader@example.invalid", consent: false },
      { email: "reader@example.invalid" },
      { email: "invalid", consent: true },
      { email: "x".repeat(255) + "@example.invalid", consent: true },
    ]) assert.equal((await submit(body)).status, 400)
    assert.equal((await submit({ email: "reader@example.invalid", consent: true }, "https://unrelated.example")).status, 403)
    assert.equal(requests.length, 0)

    const result = await submit({ email: " Reader@Example.invalid ", consent: true, medicalDetails: "must not be stored" })
    assert.equal(result.status, 200)
    assert.equal((await result.json()).ok, true)
    assert.equal(requests.length, 1)
    assert.equal(new URL(requests[0].url).pathname, "/rest/v1/newsletter_signups")
    assert.match(new Headers(requests[0].init?.headers).get("Prefer") || "", /resolution=ignore-duplicates/)
    assert.deepEqual(Object.keys(JSON.parse(String(requests[0].init?.body))).sort(), ["consent", "consent_text", "consent_version", "email"])
    assert.equal(JSON.parse(String(requests[0].init?.body)).email, "reader@example.invalid")
    assert.equal(JSON.parse(String(requests[0].init?.body)).consent_version, NEWSLETTER_CONSENT_VERSION)

    // PostgREST returns success for an ignored duplicate; the row is never updated.
    providerStatus = 201
    assert.equal((await submit({ email: "reader@example.invalid", consent: true })).status, 200)
    providerStatus = 403
    const rejected = await submit({ email: "reader@example.invalid", consent: true })
    assert.equal(rejected.status, 503)
    assert.deepEqual(await rejected.json(), { ok: false, message: "Your signup could not be saved." })
    delete process.env.SUPABASE_SECRET_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const before = requests.length
    assert.equal((await submit({ email: "reader@example.invalid", consent: true })).status, 503)
    assert.equal(requests.length, before)
    assert.ok(requests.every((r) => new URL(r.url).hostname === "newsletter-fixture.supabase.co"))
  } finally {
    fetchStub.mock.restore()
    for (const [key, value] of Object.entries({ SUPABASE_URL: originalUrl, SUPABASE_SECRET_KEY: originalKey, SUPABASE_SERVICE_ROLE_KEY: originalLegacyKey })) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
