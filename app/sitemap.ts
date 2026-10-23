import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { getNewsUpdates } from "@/lib/news";
import { getBlogPosts } from "@/lib/articles";
import { experiences, lessons } from "@/lib/learning/content";
import { ROUTES } from "@/lib/routes";
import { isEditorialPreview } from "@/lib/editorial-preview-mode.mjs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isEditorialPreview()) return [];
  const baseUrl = siteConfig.url;
  const newsCheckedOn = getNewsUpdates()
    .map((item) => item.checkedOn)
    .sort()
    .at(-1);

  // Core pages with assigned priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    {
      url: `${baseUrl}${ROUTES.ABOUT}`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${ROUTES.PROGRAMS}`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${ROUTES.EDUCATION}`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${ROUTES.BLOG}`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${ROUTES.NEWS}`,
      lastModified: newsCheckedOn
        ? new Date(`${newsCheckedOn}T00:00:00Z`)
        : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${ROUTES.FIND_SUPPORT}`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${ROUTES.DONATE}`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${ROUTES.CONTACT}`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${ROUTES.VOLUNTEER}`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${ROUTES.PARTNER}`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${ROUTES.EVENTS}`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${ROUTES.IMPACT}`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${ROUTES.FAQ}`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}${ROUTES.CAREERS}`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}${ROUTES.FINANCIALS}`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}${ROUTES.PRESS}`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}${ROUTES.TRANSPARENCY}`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}${ROUTES.EDITORIAL_POLICY}`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}${ROUTES.MEDICAL_REVIEW}`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}${ROUTES.HOW_WE_CREATE_CONTENT}`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}${ROUTES.PRIVACY}`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}${ROUTES.COOKIES}`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}${ROUTES.ACCESSIBILITY}`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/medical-disclaimer`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}${ROUTES.TERMS}`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // A missing content source is a build error, not a successful empty sitemap.
  const posts = await getBlogPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...[
      "/start-here",
      "/tools",
      ...experiences.map((x) => x.url),
      ...lessons.map((x) => `/education/lessons/${x.slug}`),
    ].map((path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
