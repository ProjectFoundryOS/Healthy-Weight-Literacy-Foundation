import { describe, it, expect } from "vitest"
import { isValidDateString, isValidPastOrPresentDateString } from "@/lib/date-validation"

describe("isValidDateString (Issue #27 item 1: strict calendar dates)", () => {
  it("accepts a real bare date", () => {
    expect(isValidDateString("2026-06-01")).toBe(true)
  })

  it("accepts a real ISO timestamp", () => {
    expect(isValidDateString("2026-01-01T00:00:00.000Z")).toBe(true)
  })

  it("accepts a leap-year Feb 29", () => {
    expect(isValidDateString("2024-02-29")).toBe(true)
  })

  it("REJECTS Feb 31 — a date that never exists in any year", () => {
    expect(isValidDateString("2026-02-31")).toBe(false)
  })

  it("REJECTS Feb 29 in a non-leap year, even though Date would silently roll it to March 1", () => {
    expect(isValidDateString("2025-02-29")).toBe(false)
  })

  it("REJECTS month 13", () => {
    expect(isValidDateString("2026-13-01")).toBe(false)
  })

  it("REJECTS day 00", () => {
    expect(isValidDateString("2026-01-00")).toBe(false)
  })

  it("REJECTS a non-date string", () => {
    expect(isValidDateString("not a date")).toBe(false)
  })

  it("REJECTS an empty string", () => {
    expect(isValidDateString("")).toBe(false)
  })

  it("REJECTS undefined/null/non-string values", () => {
    expect(isValidDateString(undefined)).toBe(false)
    expect(isValidDateString(null)).toBe(false)
    expect(isValidDateString(12345)).toBe(false)
  })

  it("REJECTS a free-text month name that Date could otherwise parse", () => {
    expect(isValidDateString("June 2025")).toBe(false)
  })
})

describe("isValidPastOrPresentDateString", () => {
  const now = new Date("2026-08-09T00:00:00.000Z")

  it("accepts a past date", () => {
    expect(isValidPastOrPresentDateString("2026-01-01", now)).toBe(true)
  })

  it("accepts the exact current instant", () => {
    expect(isValidPastOrPresentDateString("2026-08-09T00:00:00.000Z", now)).toBe(true)
  })

  it("REJECTS a future date", () => {
    expect(isValidPastOrPresentDateString("2027-01-01", now)).toBe(false)
  })

  it("REJECTS an impossible date even if it would otherwise be in the past", () => {
    expect(isValidPastOrPresentDateString("2025-02-30", now)).toBe(false)
  })
})
