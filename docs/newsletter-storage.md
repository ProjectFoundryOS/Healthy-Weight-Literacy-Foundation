# Newsletter collection

Newsletter requests are saved in the site's existing Supabase project, in
`public.newsletter_signups`. This path sends no emails. Other contact forms retain
their existing email delivery behavior.

Apply `supabase/migrations/20261022003646_newsletter_signups.sql` to the existing
project before deploying the endpoint. The API uses server-only `SUPABASE_URL`
and `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` as a fallback). Never put
these credentials in public environment variables or source control.

The table records the normalized email, exact consent text and version, signup
time, and pending/subscribed/unsubscribed status. It does not collect IP addresses,
article history, medical information, or advertising identifiers. A pending request
does not verify ownership of the email address. Repeated submissions leave the
existing row and unsubscribe status unchanged.

RLS is enabled and anonymous/authenticated roles have no table access. The site
server has insert/read permission; no public listing or export endpoint exists.
Authorized administrators can inspect/export requests through the Supabase dashboard.
Export only pending contacts when connecting the future newsletter provider, honor
the recorded consent, and preserve all unsubscribe suppression records.

Until the email provider is connected, handle requests arriving at
info@weightliteracy.org by setting the matching record to `unsubscribed` and
`unsubscribed_at` to the current time in the authenticated dashboard. Do not delete
suppression records merely to allow a repeated form submission.

The free database may pause after inactivity. If saves fail, the form reports an
error and does not emit the signup conversion. Resume through the existing Vercel
Supabase integration; do not upgrade or add paid services without authorization.

Deployment verification: submit the approved test address through the live form,
confirm a private database record with consent, verify anonymous reads fail, and
check the consented `newsletter_signup_request` event in GA4. A QA visit is not an
ad-attributed conversion.
