import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/seo"
import { getBlogPosts } from "@/lib/supabase-blog"
import { ROUTES } from "@/lib/routes"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  // Core pages with assigned priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}${ROUTES.ABOUT}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}${ROUTES.PROGRAMS}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}${ROUTES.EDUCATION}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}${ROUTES.BLOG}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}${ROUTES.CITY_RESOURCES}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}${ROUTES.DONATE}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}${ROUTES.CONTACT}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}${ROUTES.VOLUNTEER}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}${ROUTES.PARTNER}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}${ROUTES.EVENTS}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}${ROUTES.IMPACT}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}${ROUTES.FAQ}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}${ROUTES.CAREERS}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}${ROUTES.FINANCIALS}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}${ROUTES.PRESS}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}${ROUTES.TRANSPARENCY}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}${ROUTES.EDITORIAL_POLICY}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}${ROUTES.MEDICAL_REVIEW}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}${ROUTES.HOW_WE_CREATE_CONTENT}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}${ROUTES.PRIVACY}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}${ROUTES.COOKIES}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}${ROUTES.ACCESSIBILITY}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}${ROUTES.TERMS}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]

  // Blog post dynamic routes. getBlogPosts() already falls back to the
  // validated content snapshot on failure and fails the build closed if
  // neither source has content — do not swallow that error here, or the
  // sitemap would silently ship with zero article URLs.
  const posts = await getBlogPosts()
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes]
}
