// Issue #27 item 1: strict calendar-date validation, shared across every
// registry that records a date (reviews, verified reviewers, sources,
// claims, topics, evidence packets).
//
// The previous isValidDateString (formerly defined in
// lib/verified-reviewer-registry.ts) accepted any string with a
// YYYY-MM-DD prefix that JavaScript's Date parser could turn into *some*
// valid instant. That is not the same as the string naming a real
// calendar date: `new Date("2026-02-31")` does not throw — it silently
// rolls over to March 3, 2026. A record claiming "verified_at:
// 2026-02-31" or "retrieved_at: 2025-02-29" (not a leap year) would pass
// the old check while asserting a date that never existed.
//
// Fix: round-trip the parsed year/month/day back against the original
// string's own digits. If Date normalized the value to a different
// calendar date, reject it.

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * True only for a string that names a real calendar date — either a bare
 * `YYYY-MM-DD` date or a full ISO-8601 timestamp — rejecting both
 * malformed strings and impossible dates that JS's Date constructor would
 * otherwise silently normalize (e.g. "2026-02-31", "2025-02-29" in a
 * non-leap year, "2026-13-01").
 */
export function isValidDateString(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false

  const match = DATE_ONLY.exec(value) ?? DATE_TIME.exec(value)
  if (!match) return false

  const [, yearStr, monthStr, dayStr] = match
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false

  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() + 1 === month && parsed.getUTCDate() === day
}

/** Same validity rule as isValidDateString, but also requires the date not be in the future relative to `now` (defaults to real current time). Used where a "retrieved_at"/"verified_at" claim about the past must not be dated impossibly ahead. */
export function isValidPastOrPresentDateString(value: unknown, now: Date = new Date()): value is string {
  if (!isValidDateString(value)) return false
  return new Date(value).getTime() <= now.getTime()
}
