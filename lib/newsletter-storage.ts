import { createClient } from "@supabase/supabase-js"

export const NEWSLETTER_CONSENT_VERSION = "2026-10-21"
export const NEWSLETTER_CONSENT_TEXT =
  "I agree to receive WeightLiteracy articles and updates. I can unsubscribe by emailing info@weightliteracy.org."

// Server use only: this module is imported by the newsletter API, never a client component.
export async function saveNewsletterSignup(email: string) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Newsletter storage is not configured")

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }),
    },
  })
  const { error } = await client.from("newsletter_signups").upsert(
    {
      email: email.trim().toLowerCase(),
      consent: true,
      consent_version: NEWSLETTER_CONSENT_VERSION,
      consent_text: NEWSLETTER_CONSENT_TEXT,
    },
    // A repeat submission must not reset consent dates or reactivate an unsubscribe.
    { onConflict: "email", ignoreDuplicates: true },
  )
  if (error) throw new Error("Newsletter signup could not be saved")
}
