/** Keep campaign attribution while excluding search queries and unrelated form data. */
export function analyticsPageLocation(href: string): string {
  const source = new URL(href)
  const safe = new URL(source.origin + source.pathname)
  const keys = [
    "gclid", "gbraid", "wbraid", "gad_source", "gad_campaignid",
    "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_content",
  ]
  for (const key of keys) {
    const value = source.searchParams.get(key)
    // Campaign metadata must never contain subscriber addresses or free-form search text.
    if (value && /^[a-zA-Z0-9._~ -]{1,300}$/.test(value)) {
      safe.searchParams.set(key, value)
    }
  }
  return safe.href
}
