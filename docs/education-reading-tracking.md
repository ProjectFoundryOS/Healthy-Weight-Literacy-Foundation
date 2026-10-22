# Qualified article reading

`article_read_qualified` measures a conservative proxy for useful educational reading. It does not establish comprehension, medical needs or a diagnosis.

- Requires at least 90 accumulated active seconds and reaching 75% of the article body.
- Counts only with analytics consent, a visible focused document, the body in view, and trusted reader interaction within 30 seconds. Header/hero, related links, editorial information and footer are excluded from body progress.
- Long suspended timer gaps and time before consent do not count. Consent changes reset progress.
- One event per tab session across article navigation/reloads, with a 30-minute inactivity timeout. Configure GA4 key-event counting Once per session as the additional cross-tab/session counting guard, and Google Ads Count One.
- No event on draft previews. No audience lists, personal data, article-title parameters, subscriber uploads or monetary values. The event uses the existing sanitized page-location helper for attribution and keeps ad personalization disabled.
- `?reading_qa=1` exercises exactly the same detector but sends only `article_read_qualified_qa`, with separate session suppression. Never mark the QA event as a key event or import it into Ads. QA must not be reported as real education impact or ad-attributed conversions.

Google's [Ad Grants conversion guidance](https://support.google.com/nonprofits/answer/9841491?hl=en) says time-based conversions should not be added to every campaign. Keep this engagement goal out of account-default goals. Use campaign-specific goals for GLP-1 Education: qualified reading plus the existing Newsletter signup request. Weight & Metabolism retains newsletter bidding while reading remains available in reporting. Preserve both budgets and all privacy/targeting settings.

Deployment, GA4 registration, Google Ads import, and actual attributed results are separate verification steps. An event queued in a browser is not proof of Google receiving it. Confirm the QA event in GA4 Realtime and record final platform settings in the operational advertising evidence.
