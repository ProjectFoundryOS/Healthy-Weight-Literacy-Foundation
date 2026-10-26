import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SearchContent } from "@/components/content/search-content";
import { getBlogPosts } from "@/lib/articles";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Search WeightLiteracy",
  description: "Find articles, tools and research updates on weight health.",
  path: "/search",
  noIndex: true,
});
import { getNewsUpdates } from "@/lib/news";
import { experiences, lessons } from "@/lib/learning/content";
import { getSearchIndex } from "@/lib/search-index";

export default async function SearchPage() {
  const posts = await getBlogPosts();
  const news = getNewsUpdates().map((item) => ({
    type: "news" as const,
    slug: item.id,
    title: item.title,
    description: item.summary,
    tags: [item.category, item.evidenceType, item.source.name],
    category: "News & Research",
    url: `/news#${item.id}`,
  }));
  const toolItems = [
    { slug: "bmi-calculator", title: "Adult BMI calculator", description: "Calculate body mass index in US or metric units and understand its limits. No signup.", url: "/tools/bmi-calculator" },
    ...experiences.map((x) => ({
      slug: x.slug,
      title: x.short,
      description: x.description,
      url: x.url,
    })),
    ...lessons.map((x) => ({
      slug: x.slug,
      title: x.title,
      description: x.intro,
      url: `/education/lessons/${x.slug}`,
    })),
    {
      slug: "start-here",
      title: "Start here",
      description: "Guided paths to understand weight health",
      url: "/start-here",
    },
    {
      slug: "find-support",
      title: "Find support nationwide",
      description: "Healthcare food assistance insurance and everyday support",
      url: "/find-support",
    },
  ].map((x) => ({
    ...x,
    type: "resource" as const,
    tags: ["tools", "learning"],
    category: "Tools & activities",
  }));
  const index = [...getSearchIndex(posts, [], [], news), ...toolItems];
  return (
    <>
      <PageHeader
        title="Search"
        description="Find clear answers in our articles, tools and selected research updates."
        breadcrumbs={[{ label: "Search" }]}
      />
      <Suspense
        fallback={
          <p role="status" className="p-8 text-center">
            Loading search…
          </p>
        }
      >
        <SearchContent index={index} />
      </Suspense>
    </>
  );
}
