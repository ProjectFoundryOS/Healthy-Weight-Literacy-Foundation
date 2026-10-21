import { trackEvent } from "@/components/analytics/ga4-provider"

export const trackNewsletterSignup = (method: string = "footer") => {
  trackEvent(
    "newsletter_signup_request",
    "engagement",
    `Newsletter Subscription - ${method}`,
  )
}

export const trackContactFormSubmit = (source: string = "contact_page") => {
  trackEvent(
    "contact_form_submit",
    "lead_generation",
    `Contact Form - ${source}`,
  )
}

export const trackVolunteerFormSubmit = () => {
  trackEvent("volunteer_form_submit", "engagement", "Volunteer Interest")
}

export const trackPartnerFormSubmit = () => {
  trackEvent("partner_form_submit", "partnership", "Partnership Inquiry")
}

export const trackDonationIntent = (method: string) => {
  trackEvent("donation_intent", "conversion", `Donation Interest - ${method}`)
}

export const trackArticleView = (articleTitle: string) => {
  trackEvent("article_view", "content", articleTitle)
}

export const trackResourceDownload = (resourceName: string) => {
  trackEvent("resource_download", "engagement", resourceName)
}
