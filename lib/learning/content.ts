export const checkedOn = "2026-10-22";
export const sources = {
  liraglutide: {name: "MedlinePlus · Liraglutide", url: "https://medlineplus.gov/druginfo/meds/a611003.html"},
  tirzepatide: {name: "MedlinePlus · Tirzepatide", url: "https://medlineplus.gov/druginfo/meds/a622044.html"},
  bmi: {
    name: "CDC · BMI explained",
    url: "https://www.cdc.gov/bmi/faq/index.html",
  },
  sleep: {
    name: "NHLBI · Sleep and health",
    url: "https://www.nhlbi.nih.gov/health/sleep-deprivation/health-effects",
  },
  medicines: {
    name: "NIDDK · Prescription weight medicines",
    url: "https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity",
  },
  fda: {
    name: "FDA · Unapproved GLP-1 products",
    url: "https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss",
  },
};
export const experiences = [
  {
    slug: "appointment-planner",
    title: "Make room for your questions",
    short: "Appointment planner",
    description:
      "Choose what matters to you and leave with a printable conversation guide.",
    kind: "Prepare",
    mark: "01",
    url: "/tools/appointment-planner",
  },
  {
    slug: "lessons",
    title: "One idea. A little clearer.",
    short: "Short lessons",
    description:
      "Explore a visual explanation, then put it into practice with three questions.",
    kind: "Learn",
    mark: "02",
    url: "/education/lessons",
  },
  {
    slug: "medicine-explorer",
    title: "Untangle the medicine names",
    short: "Medicine explorer",
    description:
      "Connect ingredients, brand names and research status without the sales pitch.",
    kind: "Explore",
    mark: "03",
    url: "/tools/medicine-explorer",
  },
  {
    slug: "myth-check",
    title: "Myth, or more complicated?",
    short: "Myth check",
    description:
      "Take a closer look at familiar claims about weight and health.",
    kind: "Discover",
    mark: "04",
    url: "/tools/myth-check",
  },
  {
    slug: "toolkits",
    title: "Something useful to take away",
    short: "Printable toolkits",
    description:
      "Simple worksheets for appointments, everyday observations and reading health news.",
    kind: "Keep",
    mark: "05",
    url: "/tools/toolkits",
  },
  {
    slug: "topic-vote",
    title: "Help shape what comes next",
    short: "Reader topic vote",
    description: "Tell us which question deserves our next explainer.",
    kind: "Contribute",
    mark: "06",
    url: "/tools/topic-vote",
  },
] as const;
export const paths = [
  {
    id: "understanding",
    title: "I want to understand my weight",
    description: "Start with the bigger picture behind a number.",
    steps: [
      {
        title: "What BMI can—and cannot—tell you",
        url: "/education/lessons/bmi-in-context",
        detail: "A short lesson + three questions",
      },
      {
        title: "Why weight changes day to day",
        url: "/blog/why-weight-changes-day-to-day",
        detail: "A guide to everyday fluctuations",
      },
      {
        title: "Prepare for a useful conversation",
        url: "/tools/appointment-planner",
        detail: "Your questions, on one page",
      },
    ],
  },
  {
    id: "medicines",
    title: "I have questions about medicines",
    description:
      "Get your bearings before making treatment decisions with a clinician.",
    steps: [
      {
        title: "Explore ingredients and brand names",
        url: "/tools/medicine-explorer",
        detail: "An educational comparison",
      },
      {
        title: "What to know before starting a GLP-1",
        url: "/blog/before-starting-glp-1-medicine",
        detail: "Questions worth bringing to an appointment",
      },
      {
        title: "Build your appointment guide",
        url: "/tools/appointment-planner",
        detail: "Choose the questions that matter to you",
      },
    ],
  },
  {
    id: "everyday",
    title: "I want to make sense of everyday patterns",
    description:
      "Explore appetite and sleep without turning life into a scorecard.",
    steps: [
      {
        title: "Sleep and appetite, connected",
        url: "/education/lessons/sleep-and-appetite",
        detail: "A short lesson + three questions",
      },
      {
        title: "What is food noise?",
        url: "/blog/what-is-food-noise",
        detail: "Language for a common experience",
      },
      {
        title: "Try a simple observation sheet",
        url: "/tools/toolkits",
        detail: "Optional notes to support a conversation",
      },
    ],
  },
] as const;
export const plannerGroups = [
  {
    title: "My priorities",
    questions: [
      "What should we focus on first, and why?",
      "Which health measures matter beyond my weight?",
      "How can we make a plan that fits my everyday life?",
    ],
  },
  {
    title: "Treatment options",
    questions: [
      "What options could help, including options without medicine?",
      "What benefits and risks should I understand?",
      "How could my other medicines or health history affect this choice?",
    ],
  },
  {
    title: "If medicine is part of the conversation",
    questions: [
      "What is the exact medicine and brand being prescribed?",
      "Which side effects need a call, and which need urgent care?",
      "What should I do if I miss a dose, become ill or cannot get a refill?",
    ],
  },
  {
    title: "Cost and follow-up",
    questions: [
      "What will treatment and follow-up cost with my coverage?",
      "When will we review how the plan is working?",
      "Who should I contact between appointments?",
    ],
  },
] as const;
export type Lesson = {
  slug: string;
  title: string;
  intro: string;
  visual: string[];
  takeaway: string;
  source: keyof typeof sources;
  article: string;
  questions: {
    prompt: string;
    answers: string[];
    correct: number;
    explanation: string;
  }[];
};
export const lessons: Lesson[] = [
  {
    slug: "bmi-in-context",
    title: "BMI is a starting point",
    intro:
      "BMI relates weight to height. It is a screening measure, not a complete description of a person’s health.",
    visual: ["Height + weight", "A screening number", "A wider conversation"],
    takeaway:
      "BMI does not directly measure body fat or separate fat from muscle and bone. Medical history, an examination and other findings add context.",
    source: "bmi",
    article: "what-bmi-can-and-cannot-tell-you",
    questions: [
      {
        prompt: "What information goes into BMI?",
        answers: [
          "Height and weight",
          "Blood pressure and sleep",
          "Body fat and muscle measurements",
        ],
        correct: 0,
        explanation: "BMI is calculated from weight relative to height.",
      },
      {
        prompt: "Two adults have the same BMI. What can we conclude?",
        answers: [
          "They have identical health risks",
          "They have the same amount of muscle",
          "Their health still needs individual context",
        ],
        correct: 2,
        explanation:
          "The same BMI does not establish the same body composition or overall health.",
      },
      {
        prompt: "What is a useful next question?",
        answers: [
          "Can this number tell me everything?",
          "What other information helps put this in context?",
          "Should I ignore all other measures?",
        ],
        correct: 1,
        explanation: "BMI belongs alongside a broader health assessment.",
      },
    ],
  },
  {
    slug: "sleep-and-appetite",
    title: "Sleep and appetite are connected",
    intro:
      "Sleep is part of health, including the signals involved in hunger and fullness. Feeling hungrier after too little sleep is not a character flaw.",
    visual: ["Sleep", "Hunger + fullness signals", "Everyday experience"],
    takeaway:
      "Sleep deficiency can affect appetite and how the body responds to insulin. A personal pattern can be worth discussing, but a few nights of notes cannot diagnose its cause or predict weight loss.",
    source: "sleep",
    article: "sleep-appetite-and-weight",
    questions: [
      {
        prompt: "Can insufficient sleep affect hunger?",
        answers: [
          "Yes, sleep interacts with appetite signals",
          "No, sleep and appetite are unrelated",
          "Only if someone takes medicine",
        ],
        correct: 0,
        explanation:
          "Sleep helps regulate signals involved in hunger and fullness.",
      },
      {
        prompt:
          "You notice more hunger after short nights. What do those notes establish?",
        answers: [
          "A confirmed diagnosis",
          "A guaranteed explanation for weight change",
          "An observation to discuss, not proof of cause",
        ],
        correct: 2,
        explanation:
          "An observation can start a conversation without proving why it happened.",
      },
      {
        prompt: "What is a reasonable goal for a sleep observation sheet?",
        answers: [
          "Diagnose a sleep disorder yourself",
          "Bring a clearer account to a healthcare conversation",
          "Guarantee a particular weight change",
        ],
        correct: 1,
        explanation:
          "Use notes to communicate experiences, not to replace an assessment.",
      },
    ],
  },
  {
    slug: "medicine-labels",
    title: "An ingredient is not the whole story",
    intro:
      "A familiar ingredient name is only one part of a medicine’s identity. The brand, formulation and approved uses matter too.",
    visual: ["Ingredient", "Specific product", "Approved uses + instructions"],
    takeaway:
      "Wegovy and Ozempic contain semaglutide, but the products do not have identical approved uses or instructions. Check the specific prescription with a clinician or pharmacist.",
    source: "medicines",
    article: "semaglutide-vs-tirzepatide",
    questions: [
      {
        prompt:
          "Two products share an ingredient. Does that mean their instructions are identical?",
        answers: [
          "Always",
          "No—check the exact product",
          "Brand names remove the need to check",
        ],
        correct: 1,
        explanation:
          "An ingredient alone does not establish the product’s approved uses or instructions.",
      },
      {
        prompt: "Where should you confirm instructions for your prescription?",
        answers: [
          "A social media dosing chart",
          "Another person’s prescription",
          "Your pharmacist or prescriber and the product information",
        ],
        correct: 2,
        explanation: "Use guidance specific to the medicine prescribed to you.",
      },
      {
        prompt: "What belongs on an appointment question list?",
        answers: [
          "What exact product are we discussing, and why?",
          "Can I assume all versions are interchangeable?",
          "Can I choose a dose from a comparison chart?",
        ],
        correct: 0,
        explanation:
          "Clarifying the exact product supports a better treatment conversation.",
      },
    ],
  },
];
export function lessonPassed(lesson: Lesson, answers: Record<number, number>) {
  return lesson.questions.every(
    (q, i) => Object.hasOwn(answers, i) && answers[i] === q.correct,
  );
}
export const medicines = [
  {
    id: "semaglutide",
    ingredient: "Semaglutide",
    brands: "Wegovy · Ozempic · Rybelsus",
    status: "Approved products",
    note: "Wegovy has a weight-management indication. Ozempic and Rybelsus have type 2 diabetes indications. This is a brief orientation, not a complete list of approved uses.",
    question: "Which exact product and formulation are we discussing?",
    source: "medicines" as const,
  },
  {
    id: "tirzepatide",
    ingredient: "Tirzepatide",
    brands: "Zepbound · Mounjaro",
    status: "Approved products",
    note: "Zepbound has a weight-management indication; Mounjaro has a type 2 diabetes indication. Individual products may have additional approved uses.",
    question: "What makes this product appropriate for my situation?",
    source: "tirzepatide" as const,
  },
  {
    id: "liraglutide",
    ingredient: "Liraglutide",
    brands: "Saxenda · Victoza",
    status: "Approved products",
    note: "Saxenda is used for weight management. Victoza has a type 2 diabetes indication. These products have different prescribing instructions.",
    question:
      "What should I know about this product’s benefits, risks and instructions?",
    source: "liraglutide" as const,
  },
  {
    id: "retatrutide",
    ingredient: "Retatrutide",
    brands: "Investigational compound",
    status: "Not FDA-approved",
    note: "Retatrutide is not an FDA-approved medicine. Research results do not make a product sold online an approved treatment.",
    question: "How can I distinguish a clinical trial from a seller’s claims?",
    source: "fda" as const,
  },
];
export const myths = [
  {
    claim: "BMI measures body fat directly.",
    answer: "It doesn’t.",
    explanation:
      "BMI uses height and weight; it cannot separate fat from muscle and bone.",
    source: "bmi" as const,
    article: "what-bmi-can-and-cannot-tell-you",
  },
  {
    claim: "Sleep has nothing to do with hunger.",
    answer: "There is a connection.",
    explanation:
      "Sleep interacts with hunger and fullness signals. That does not mean better sleep guarantees weight loss.",
    source: "sleep" as const,
    article: "sleep-appetite-and-weight",
  },
  {
    claim: "The same ingredient means the same medicine instructions.",
    answer: "The product matters.",
    explanation:
      "Brand, formulation and approved uses can differ. Confirm the exact product with your pharmacist or prescriber.",
    source: "medicines" as const,
    article: "semaglutide-vs-tirzepatide",
  },
  {
    claim: "A research-only label means a product is safe to use.",
    answer: "That label is not an approval.",
    explanation:
      "FDA warns about unapproved products marketed as research chemicals. Retatrutide is not FDA-approved.",
    source: "fda" as const,
    article: "what-is-retatrutide",
  },
];
export const voteTopics = [
  {
    id: "health-headlines",
    title: "How to read a health headline",
    detail: "What a study can actually tell you.",
  },
  {
    id: "care-questions",
    title: "Getting more from a healthcare visit",
    detail: "Making space for questions and follow-up.",
  },
  {
    id: "food-labels",
    title: "Making sense of food labels",
    detail: "A practical guide to the information on a package.",
  },
  {
    id: "research-words",
    title: "The language of health research",
    detail: "Trials, averages, risk and uncertainty in plain English.",
  },
] as const;
export const supportResources = [
  {
    name: "HRSA Find a Health Center",
    category: "Healthcare",
    description:
      "Find federally supported health centers near you. Ask the center about services, appointments and sliding-fee options.",
    url: "https://findahealthcenter.hrsa.gov/",
  },
  {
    name: "Feeding America",
    category: "Food support",
    description:
      "Use the national food-bank directory to find local food assistance by ZIP code.",
    url: "https://www.feedingamerica.org/find-your-local-foodbank",
  },
  {
    name: "211",
    category: "Everyday support",
    description:
      "Connect with local services for food, housing, utility bills and other practical needs.",
    url: "https://211.org/",
  },
  {
    name: "HealthCare.gov",
    category: "Health coverage",
    description:
      "Explore health insurance options and find local help with Marketplace coverage.",
    url: "https://www.healthcare.gov/",
  },
];
