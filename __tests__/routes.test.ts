import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ROUTES, VALID_ROUTES } from "../lib/routes.ts"

describe("Route Validation", () => {
  it("should have all routes defined", () => {
    assert.equal(ROUTES.HOME, "/")
    assert.equal(ROUTES.ABOUT, "/about")
    assert.equal(ROUTES.PROGRAMS, "/programs")
    assert.equal(ROUTES.EDUCATION, "/education")
    assert.equal(ROUTES.CITY_RESOURCES, "/city-resources")
    assert.equal(ROUTES.CONTACT, "/contact")
    assert.equal(ROUTES.DONATE, "/donate")
  })

  it("should have valid routes array", () => {
    assert.ok(VALID_ROUTES.includes("/"))
    assert.ok(VALID_ROUTES.includes("/about"))
    assert.ok(VALID_ROUTES.includes("/programs"))
    assert.ok(VALID_ROUTES.includes("/education"))
    assert.ok(VALID_ROUTES.includes("/city-resources"))
    assert.ok(VALID_ROUTES.includes("/contact"))
    assert.ok(VALID_ROUTES.includes("/donate"))
  })

  it("should not contain invalid routes", () => {
    // These are common typos or old routes that should not exist
    assert.ok(!VALID_ROUTES.includes("/cityresources"))
    assert.ok(!VALID_ROUTES.includes("/resources")) // This redirects to /city-resources
    assert.ok(!VALID_ROUTES.includes("/articles")) // This redirects to /education
    assert.ok(!VALID_ROUTES.includes("/learn")) // This redirects to /education
  })
})
