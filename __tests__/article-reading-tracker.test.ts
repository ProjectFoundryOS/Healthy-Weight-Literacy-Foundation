import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import ts from "typescript"
import * as reading from "../lib/article-reading.ts"
import { analyticsPageLocation } from "../lib/analytics-location.ts"

const code = ts.transpileModule(readFileSync(new URL("../components/analytics/article-reading-tracker.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

// Browser adapter fixture: no network, real GA client, cookies or subscriber data.
function harness({ qa = false, stored = new Map<string, string>(), wallStart = 1_000_000 } = {}) {
  let now = 0
  let consent = "accepted"
  let focused = true
  let visible = "visible"
  let failStorage = false
  let interval: (() => void) | undefined
  let cleanup: (() => void) | undefined
  const events = new Map<string, Set<(event: unknown) => void>>()
  const calls: unknown[][] = []
  const listen = (name: string, fn: (event: unknown) => void) => {
    if (!events.has(name)) events.set(name, new Set())
    events.get(name)!.add(fn)
  }
  const unlisten = (name: string, fn: (event: unknown) => void) => events.get(name)?.delete(fn)
  const storage = {
    getItem: (key: string) => { if (failStorage) throw new Error("blocked"); return stored.get(key) ?? null },
    setItem: (key: string, value: string) => { if (failStorage) throw new Error("blocked"); stored.set(key, value) },
  }
  const win = {
    innerHeight: 800,
    location: { href: "https://www.weightliteracy.org/blog/example?utm_source=google&email=private%40example.com" + (qa ? "&reading_qa=1" : ""), pathname: "/blog/example", search: qa ? "?reading_qa=1" : "" },
    gtag: (...args: unknown[]) => calls.push(args),
    addEventListener: listen, removeEventListener: unlisten,
    setInterval: (fn: () => void) => { interval = fn; return 1 },
    clearInterval: () => { interval = undefined },
  }
  const exports: { ArticleReadingTracker?: () => void } = {}
  runInNewContext(code, {
    exports, process: { env: { NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST-ONLY" } },
    require: (name: string) => {
      if (name === "react") return { useEffect: (effect: () => (() => void)) => { cleanup = effect() } }
      if (name === "@/lib/analytics-location") return { analyticsPageLocation }
      if (name === "@/lib/article-reading") return reading
      throw new Error(`Unexpected import ${name}`)
    },
    window: win,
    document: { getElementById: () => ({ getBoundingClientRect: () => ({ top: -700, bottom: 1300 }) }),
      get visibilityState() { return visible }, hasFocus: () => focused,
      addEventListener: listen, removeEventListener: unlisten },
    localStorage: { getItem: () => consent }, sessionStorage: storage,
    performance: { now: () => now }, Date: { now: () => now + wallStart }, URLSearchParams,
  })
  exports.ArticleReadingTracker!()
  const fire = (name: string, trusted = true) => { for (const fn of events.get(name) ?? []) fn({ isTrusted: trusted }) }
  return {
    calls, stored, fire, win,
    advance(seconds: number, activity = true) {
      fire("scroll", activity)
      for (let second = 0; second < seconds; second++) {
        now += 1000
        if (activity && second % 10 === 0) fire("scroll")
        interval?.()
      }
    },
    consent(value: string) { consent = value; fire("weightliteracy-consent") },
    focus(value: boolean) { focused = value; fire(value ? "focus" : "blur") },
    visibility(value: string) { visible = value; fire("visibilitychange") },
    blockStorage() { failStorage = true },
    close() { cleanup?.() },
  }
}

test("qualified browser reading emits one sanitized education event, including on reload", () => {
  const h = harness()
  h.advance(89)
  assert.equal(h.calls.length, 0)
  h.advance(1)
  assert.equal(h.calls.length, 1)
  const [kind, name, payload] = h.calls[0] as [string, string, Record<string, unknown>]
  assert.equal(kind, "event")
  assert.equal(name, "article_read_qualified")
  assert.equal(payload.page_location, "https://www.weightliteracy.org/blog/example?utm_source=google")
  assert.equal(payload.allow_ad_personalization_signals, false)
  assert.equal(payload.active_reading_seconds, 90)
  assert.equal(payload.article_progress_percent, 75)
  assert.equal("value" in payload, false)
  h.advance(120)
  assert.equal(h.calls.length, 1)
  h.close()
  const nextArticle = harness({ stored: h.stored, wallStart: 1_300_000 })
  nextArticle.advance(120)
  assert.equal(nextArticle.calls.length, 0)
})

test("declined consent and trusted-event filtering prevent measurements", () => {
  const h = harness()
  h.consent("declined")
  h.advance(100)
  assert.equal(h.calls.length, 0)
  assert.equal(h.stored.size, 0)
  h.consent("accepted")
  h.advance(100, false)
  assert.equal(h.calls.length, 0)
  h.advance(89)
  assert.equal(h.calls.length, 0)
  h.advance(1)
  assert.equal(h.calls.length, 1)
})

test("a hidden or unfocused tab cannot emit a reading conversion", () => {
  const h = harness()
  h.visibility("hidden")
  h.advance(120)
  h.visibility("visible")
  h.focus(false)
  h.advance(120)
  assert.equal(h.calls.length, 0)
})

test("blocked session storage fails closed", () => {
  const h = harness()
  h.blockStorage()
  h.advance(120)
  assert.equal(h.calls.length, 0)
})

test("QA runs the real detector but never emits the bidding event", () => {
  const h = harness({ qa: true })
  h.advance(90)
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0][1], "article_read_qualified_qa")
  assert.equal(h.stored.has(reading.READING_STORAGE_KEY), false)
})

test("an unavailable GA client retries after thresholds without premature suppression", () => {
  const h = harness()
  const send = h.win.gtag
  h.win.gtag = undefined as unknown as typeof send
  h.advance(100)
  assert.equal(h.calls.length, 0)
  h.win.gtag = send
  h.advance(1)
  assert.equal(h.calls.length, 1)
})

test("cleanup stops the timer and removes interaction listeners", () => {
  const h = harness()
  h.advance(89)
  h.close()
  h.advance(120)
  assert.equal(h.calls.length, 0)
})
