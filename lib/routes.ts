/**
 * Canonical route paths for the application
 * This is the single source of truth for all internal navigation
 */

export const ROUTES = {
  // Main pages
  HOME: "/",
  ABOUT: "/about",
  PROGRAMS: "/programs",
  EDUCATION: "/education",
  CITY_RESOURCES: "/city-resources",
  CONTACT: "/contact",
  DONATE: "/donate",
  SEARCH: "/search",
  
  // Content pages
  BLOG: "/blog",
  EVENTS: "/events",
  
  // Get Involved
  VOLUNTEER: "/volunteer",
  PARTNER: "/partner",
  
  // Information pages
  IMPACT: "/impact",
  CAREERS: "/careers",
  PRESS: "/press",
  FINANCIALS: "/financials",
  FAQ: "/faq",
  
  // Legal
  PRIVACY: "/privacy",
  TERMS: "/terms",
  COOKIES: "/cookies",
  ACCESSIBILITY: "/accessibility",

  // Trust & Policy
  TRANSPARENCY: "/transparency",
  EDITORIAL_POLICY: "/editorial-policy",
  MEDICAL_DISCLAIMER: "/medical-disclaimer",
  MEDICAL_REVIEW: "/medical-review",
  HOW_WE_CREATE_CONTENT: "/how-we-create-content",
} as const

/**
 * Dynamic route generators
 */
export const dynamicRoutes = {
  blogPost: (slug: string) => `/blog/${slug}`,
  program: (slug: string) => `/programs/${slug}`,
  resource: (slug: string) => `/resources/${slug}`,
}

/**
 * All valid static routes (for validation)
 */
export const VALID_ROUTES = Object.values(ROUTES)
