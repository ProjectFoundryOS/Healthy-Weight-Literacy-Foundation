import { test } from "node:test"
import assert from "node:assert/strict"
import { analyticsPageLocation } from "../lib/analytics-location.ts"

test("ad landing pages preserve click identifiers and campaign attribution", () => {
  const input = "https://www.weightliteracy.org/blog/guide?gclid=TEST_click-123&gbraid=TEST_braid&wbraid=TEST_web&gad_source=1&gad_campaignid=123&utm_source=google&utm_medium=cpc&utm_campaign=weight_education&utm_id=123&utm_content=guide"
  assert.equal(analyticsPageLocation(input), input)
})

test("search terms, form data, fragments and email-shaped campaign values are excluded", () => {
  const input = "https://www.weightliteracy.org/search?q=personal-health-question&email=reader%40example.com&utm_term=health-question&utm_content=reader%40example.com&utm_source=google#reader-details"
  assert.equal(analyticsPageLocation(input), "https://www.weightliteracy.org/search?utm_source=google")
})

test("untagged visits keep the original public page URL", () => {
  assert.equal(analyticsPageLocation("https://www.weightliteracy.org/blog/guide"), "https://www.weightliteracy.org/blog/guide")
})

test("malformed and duplicate campaign inputs do not add arbitrary URL data", () => {
  const input = "https://www.weightliteracy.org/?utm_source=google&utm_source=reader%40example.com&gclid=%3Cscript%3E&utm_medium=" + "x".repeat(301)
  assert.equal(analyticsPageLocation(input), "https://www.weightliteracy.org/?utm_source=google")
})
