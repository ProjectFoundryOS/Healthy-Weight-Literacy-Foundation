# Source and implementation review — 2026-10-22

Primary sources opened and inspected:
- CDC BMI FAQ: height/weight screening measure, not direct fat measurement, contextual assessment. https://www.cdc.gov/bmi/faq/index.html
- NHLBI sleep deficiency and health: appetite signals and insulin response. No promised weight outcome; observation is not diagnosis. https://www.nhlbi.nih.gov/health/sleep-deprivation/health-effects
- NIDDK medicines overview: compound/brand distinctions. This is a selected collection and not a complete or exhaustive indication list. No doses or personal eligibility recommendation. https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity
- MedlinePlus liraglutide / tirzepatide / semaglutide product education: https://medlineplus.gov/druginfo/meds/a611003.html https://medlineplus.gov/druginfo/meds/a622044.html https://medlineplus.gov/druginfo/meds/a618008.html
- FDA unapproved GLP-1 products: retatrutide is unapproved, research label is not approval. https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss
- National service directories: HRSA https://findahealthcenter.hrsa.gov/ and https://www.hrsa.gov/get-health-care ; Feeding America https://www.feedingamerica.org/find-your-local-foodbank ; 211 https://211.org/ ; Marketplace https://www.healthcare.gov/ . Directory status does not imply a partnership, local availability or free care for everyone.

Design boundaries: private planner notes remain in React memory; quiz answers remain in memory. Production-only lesson completion telemetry requires consent and the actual analytics function, excludes localhost and counts once per lesson/session. No Google Ads conversion setup or campaign settings changed. Completion is a small learning check, not medical competence or evidence of long-term understanding.

Voting: four general editorial topics, no free-text health data. Dedicated owner project only; RLS on, anonymous and signed-in roles have no table or function privileges. Server role calls SECURITY INVOKER functions. Signed HttpOnly cookie, strict origin and input checks, atomic per-browser deduplication, 20 new voting attempts per daily keyed network bucket. IP addresses are not stored in the vote tables. Rate-limit records expire after two days and are purged on subsequent voting activity. Public results are only aggregate counts. Missing connection returns 503, never fabricated counts or a success message.

Known limitation: cookie-based editorial voting is not identity verified. A person can use a different device; shared networks may reach the abuse threshold. It is a directional editorial signal, not a scientific poll.

Registered address and legal jurisdiction remain accurate; Ohio is no longer positioned as a service area. Historical editorial source names such as Cleveland Clinic remain intact.
