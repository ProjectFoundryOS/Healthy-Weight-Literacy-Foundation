export const articleTopics = [
  {
    id: "basics",
    title: "Understand the medicines",
    description:
      "How GLP-1 medicines work, how they differ, and what is still being studied.",
    slugs: [
      "how-glp-1-weight-loss-medicines-work",
      "semaglutide-vs-tirzepatide",
      "glp-1-pills-vs-injections",
      "what-is-retatrutide",
    ],
  },
  {
    id: "treatment",
    title: "Starting & living with treatment",
    description:
      "Questions to ask, side effects to understand, and decisions along the way.",
    slugs: [
      "before-starting-glp-1-medicine",
      "glp-1-side-effects",
      "stopping-glp-1-medicine",
    ],
  },
  {
    id: "food",
    title: "Food, appetite & strength",
    description:
      "Make sense of appetite changes, eating well, and protecting muscle.",
    slugs: [
      "what-to-eat-on-glp-1",
      "what-is-food-noise",
      "glp-1-medicines-muscle-loss",
      "sleep-appetite-and-weight",
    ],
  },
  {
    id: "access",
    title: "Finding care & understanding options",
    description:
      "Look beyond the sales pitch when comparing services and medicine sources.",
    slugs: [
      "choosing-telehealth-weight-loss-service",
      "compounded-vs-approved-weight-loss-medicines",
    ],
  },
  {
    id: "weight",
    title: "Understand your weight & metabolism",
    description:
      "The bigger picture behind changes on the scale and metabolic health.",
    slugs: [
      "why-weight-changes-day-to-day",
      "why-weight-loss-slows-down",
      "insulin-resistance-explained",
      "what-bmi-can-and-cannot-tell-you",
      "metabolic-health-beyond-weight",
    ],
  },
] as const
export function topicForArticle(slug: string) {
  return articleTopics.find((topic) =>
    (topic.slugs as readonly string[]).includes(slug),
  )
}
const related: Record<string, string[]> = {
  "metabolic-health-beyond-weight": [
    "what-bmi-can-and-cannot-tell-you",
    "insulin-resistance-explained",
    "why-weight-changes-day-to-day",
  ],
  "how-glp-1-weight-loss-medicines-work": [
    "semaglutide-vs-tirzepatide",
    "before-starting-glp-1-medicine",
    "glp-1-side-effects",
  ],
  "what-bmi-can-and-cannot-tell-you": [
    "why-weight-changes-day-to-day",
    "insulin-resistance-explained",
    "why-weight-loss-slows-down",
  ],
  "sleep-appetite-and-weight": [
    "what-is-food-noise",
    "why-weight-changes-day-to-day",
    "insulin-resistance-explained",
  ],
  "before-starting-glp-1-medicine": [
    "glp-1-side-effects",
    "what-to-eat-on-glp-1",
    "choosing-telehealth-weight-loss-service",
  ],
  "what-is-retatrutide": [
    "semaglutide-vs-tirzepatide",
    "compounded-vs-approved-weight-loss-medicines",
    "how-glp-1-weight-loss-medicines-work",
  ],
  "semaglutide-vs-tirzepatide": [
    "how-glp-1-weight-loss-medicines-work",
    "before-starting-glp-1-medicine",
    "glp-1-pills-vs-injections",
  ],
  "stopping-glp-1-medicine": [
    "why-weight-loss-slows-down",
    "what-to-eat-on-glp-1",
    "what-is-food-noise",
  ],
  "glp-1-side-effects": [
    "before-starting-glp-1-medicine",
    "what-to-eat-on-glp-1",
    "stopping-glp-1-medicine",
  ],
  "glp-1-medicines-muscle-loss": [
    "what-to-eat-on-glp-1",
    "why-weight-loss-slows-down",
    "before-starting-glp-1-medicine",
  ],
  "choosing-telehealth-weight-loss-service": [
    "before-starting-glp-1-medicine",
    "compounded-vs-approved-weight-loss-medicines",
    "glp-1-side-effects",
  ],
}
export function relatedArticleSlugs(slug: string) {
  return [
    ...new Set([
      ...(related[slug] ?? []),
      ...(topicForArticle(slug)?.slugs ?? []),
      "before-starting-glp-1-medicine",
      "how-glp-1-weight-loss-medicines-work",
    ]),
  ]
    .filter((value) => value !== slug)
    .slice(0, 3)
}
export function articleOutline(content: string) {
  return [...content.matchAll(/^## (.+)$/gm)].map((match, index) => ({
    id: `section-${index + 1}`,
    text: match[1].replace(/\*\*/g, ""),
  }))
}
