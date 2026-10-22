import { test } from "node:test"
import assert from "node:assert/strict"
import { ArticleReadingMeter, articleReadingPosition, readReadingSession, READING_SESSION_MS } from "../lib/article-reading.ts"

function sample(meter: ArticleReadingMeter, now: number, overrides = {}) {
  return meter.sample({ now, consent: true, visible: true, focused: true,
    inArticle: true, progress: 0.8, lastInteraction: now, ...overrides })
}
function read(meter: ArticleReadingMeter, seconds: number, overrides = {}) {
  let result = false
  for (let i = 0; i <= seconds; i++) result = sample(meter, i * 1000, overrides)
  return result
}

test("requires both 90 seconds of activity and 75 percent article progress", () => {
  const meter = new ArticleReadingMeter()
  assert.equal(read(meter, 89), false)
  assert.equal(sample(meter, 90_000), true)
  const shortRead = new ArticleReadingMeter()
  assert.equal(read(shortRead, 100, { progress: 0.74 }), false)
  assert.equal(sample(shortRead, 101_000, { progress: 0.75 }), true)
})

test("page views, scrolling straight to the end and idle tabs do not qualify", () => {
  const meter = new ArticleReadingMeter()
  assert.equal(read(meter, 120, { lastInteraction: 0, progress: 1 }), false)
  assert.equal(meter.activeMs, 29_000)
  assert.equal(read(new ArticleReadingMeter(), 120, { lastInteraction: -Infinity }), false)
})

for (const field of ["visible", "focused", "inArticle", "consent"]) {
  test(`no reading accumulates without ${field}`, () => {
    const meter = new ArticleReadingMeter()
    assert.equal(read(meter, 120, { [field]: false }), false)
    assert.equal(meter.activeMs, 0)
  })
}

test("a long throttled timer interval does not count as reading", () => {
  const meter = new ArticleReadingMeter()
  sample(meter, 0)
  assert.equal(sample(meter, 120_000), false)
  assert.equal(meter.activeMs, 0)
})

test("hidden intervals pause reading and do not count when focus returns", () => {
  const meter = new ArticleReadingMeter()
  read(meter, 45)
  sample(meter, 46_000, { visible: false })
  sample(meter, 106_000)
  assert.equal(meter.activeMs, 45_000)
  for (let t = 107_000; t <= 151_000; t += 1000) sample(meter, t)
  assert.equal(meter.activeMs, 90_000)
})

test("withdrawal clears time and scroll; later consent starts fresh", () => {
  const meter = new ArticleReadingMeter()
  read(meter, 89)
  sample(meter, 90_000, { consent: false })
  assert.equal(sample(meter, 91_000), false)
  assert.equal(meter.activeMs, 0)
})

test("body progress excludes header and footer and clamps invalid geometry", () => {
  assert.deepEqual(articleReadingPosition(1000, 3000, 800), { inArticle: false, progress: 0 })
  assert.deepEqual(articleReadingPosition(-700, 1300, 800), { inArticle: true, progress: 0.75 })
  assert.deepEqual(articleReadingPosition(-3000, -1000, 800), { inArticle: false, progress: 0 })
  assert.deepEqual(articleReadingPosition(100, 100, 800), { inArticle: false, progress: 0 })
})

test("the session-wide reported flag survives another article and reload", () => {
  const stored = JSON.stringify({ lastActiveAt: 1000, reported: true })
  assert.equal(readReadingSession(stored, 2000).reported, true)
  assert.equal(readReadingSession(stored, 1000 + READING_SESSION_MS).reported, false)
})

test("invalid, future and missing session state start fresh", () => {
  for (const raw of [null, "broken", "{}", '{"lastActiveAt":9999999,"reported":true}', '{"lastActiveAt":1,"reported":"yes"}']) {
    assert.deepEqual(readReadingSession(raw, 100), { lastActiveAt: 100, reported: false })
  }
})
