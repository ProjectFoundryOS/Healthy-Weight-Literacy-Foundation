export type Companion = {
  slug: string; title: string; intro: string; exploreLabel: string;
  cards: { title: string; body: string; takeaway: string }[];
  scenario: { setup: string; question: string; options: string[]; correct: number; feedback: string[] };
  questions: string[];
  sources: { title: string; url: string }[];
  next: { title: string; href: string };
  safety?: string;
};
const medicineSource = { title: "NIDDK · Weight-management medicines", url: "https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity" };
const wegovy = { title: "Wegovy · Official prescribing information and Medication Guide", url: "https://www.novo-pi.com/wegovy.pdf" };
const zepbound = { title: "Zepbound · Official prescribing information", url: "https://pi.lilly.com/us/zepbound-uspi.pdf" };
const weighing = { title: "NHS · Consistent weighing conditions", url: "https://www.england.nhs.uk/wp-content/uploads/2021/06/PRN00916-how-to-record-your-weight.pdf" };

export const articleCompanions: Companion[] = [
  {
    slug: "why-weight-changes-day-to-day", title: "Make sense of a changing scale",
    intro: "Compare two fictional weigh-ins, explore what the number leaves out, and make a useful question list.", exploreLabel: "Compare readings",
    cards: [
      { title: "Different conditions", body: "Monday: 180 lb, before breakfast, light clothing. Tuesday: 182 lb, after dinner, shoes on. These invented readings compare different conditions.", takeaway: "The 2 lb difference does not measure a 2 lb change in body fat." },
      { title: "A fairer comparison", body: "If weighing is useful for you, use the same scale on a firm, level surface, at a similar time and in similar clothing.", takeaway: "Follow your care team's monitoring plan if you have one. Daily weighing is not required by this example." },
      { title: "What a scale leaves out", body: "A scale measures total weight. Fluid and the food and drink in your body can affect the reading. It does not identify the cause of a change.", takeaway: "Unexplained rapid gain, especially with swelling or shortness of breath, needs medical attention." },
    ],
    scenario: { setup: "A fictional reader sees a higher reading after dinner than they saw before breakfast.", question: "What can that comparison tell them?", options: ["They gained that exact amount of body fat.", "Their total measured weight differed; the cause is not established.", "They should skip their next meal."], correct: 1, feedback: ["A bathroom scale cannot separate fat from fluid or food. Compare conditions before drawing conclusions.", "Yes. The reading is real, but its cause cannot be identified from two different conditions.", "A single reading is not a reason to restrict food. Review the context and any concerning symptoms."] },
    questions: ["Would weight monitoring be useful for my care, and how often?", "Which measurement conditions should I keep consistent?", "What changes or accompanying symptoms should prompt me to call?", "Could we track energy, strength or another useful outcome too?"],
    sources: [weighing, { title: "Cleveland Clinic · Weight fluctuations", url: "https://health.clevelandclinic.org/weight-fluctuations" }, { title: "MedlinePlus · Unintentional weight gain", url: "https://medlineplus.gov/ency/article/003084.htm" }],
    next: { title: "Explore weight-loss plateaus", href: "/blog/why-weight-loss-slows-down" },
  },
  {
    slug: "why-weight-loss-slows-down", title: "Prepare for a plateau conversation",
    intro: "Sort the trend from a few isolated readings, then choose questions for a useful treatment review.", exploreLabel: "Review the context",
    cards: [
      { title: "Look at the time span", body: "A few similar readings cannot explain a slowdown. Bring the pattern and the conditions under which you measured it.", takeaway: "There is no universal count of unchanged weigh-ins that diagnoses the cause." },
      { title: "Consider the changing body", body: "Weight loss can change energy needs and appetite. Research models help explain average plateaus, but do not predict an individual's next step.", takeaway: "A slowdown is not evidence that your metabolism is broken." },
      { title: "Review the whole plan", body: "An appointment can cover side effects, interrupted access to treatment, everyday routines and health goals beyond the scale.", takeaway: "Do not add doses or intensify restriction to force a lower reading." },
    ],
    scenario: { setup: "A fictional reader's weight has stayed similar for several weeks. Treatment access and energy levels have also changed.", question: "What would make the follow-up most useful?", options: ["Bring the trend, treatment interruptions and changes in daily life.", "Assume the medicine has failed.", "Increase the dose without speaking to the prescriber."], correct: 0, feedback: ["Yes. That context helps the clinician review benefit, tolerability and an agreed next step.", "The scale alone cannot establish treatment failure or explain its cause.", "Dose changes need the prescriber's guidance. A plateau does not make extra doses safe."] },
    questions: ["What time span should we use to assess my trend?", "Are side effects or treatment interruptions affecting the plan?", "What health benefits are we measuring besides weight?", "What is our next step, and when will we reassess?"],
    sources: [{ title: "Hall, 2024 · Physiology of the weight-loss plateau (modeling study)", url: "https://pubmed.ncbi.nlm.nih.gov/38644683/" }, medicineSource],
    next: { title: "Put everyday fluctuations in context", href: "/blog/why-weight-changes-day-to-day" },
  },
  {
    slug: "insulin-resistance-explained", title: "Understand the test names",
    intro: "Explore what common blood-glucose tests measure, then prepare questions about your own results.", exploreLabel: "Choose a test",
    cards: [
      { title: "A1C", body: "A1C estimates average blood glucose over roughly the past three months. Some conditions can affect how accurately it reflects glucose.", takeaway: "Ask whether A1C is reliable for you. This page does not interpret a personal result." },
      { title: "Fasting glucose", body: "This measures blood glucose at the time of a blood draw after fasting. Follow the testing service's preparation instructions.", takeaway: "It is a glucose measurement, not a direct measure of insulin resistance." },
      { title: "Glucose tolerance test", body: "This examines glucose after a glucose drink, using timed blood samples. It is a different test from a fasting glucose or A1C.", takeaway: "A clinician chooses and interprets testing in the context of your health history." },
    ],
    scenario: { setup: "A fictional reader hears that their A1C is above the usual range and sees an online insulin-resistance quiz.", question: "What is the useful next question?", options: ["Does a quiz confirm the diagnosis?", "Which test was measured, what does it mean for me, and what follow-up is needed?", "Can body size tell me the exact result?"], correct: 1, feedback: ["An online quiz cannot replace clinical testing and interpretation.", "Yes. Name the test and ask about interpretation and follow-up, rather than substituting a quiz.", "Body size cannot tell you a blood-glucose result. Ask about the actual measurement."] },
    questions: ["Which test did I have, and what does it measure?", "Could anything make this result less reliable for me?", "Do I need a repeat or a different test?", "What follow-up and support would be appropriate?"],
    sources: [{ title: "NIDDK · Insulin resistance, prediabetes and blood tests", url: "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/prediabetes-insulin-resistance" }, { title: "NIDDK · The A1C test", url: "https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test" }, { title: "NIDDK · Diabetes tests and diagnosis", url: "https://www.niddk.nih.gov/health-information/diabetes/overview/tests-diagnosis" }],
    next: { title: "Explore health measures beyond weight", href: "/blog/metabolic-health-beyond-weight" },
  },
  {
    slug: "what-is-food-noise", title: "Find words for your experience",
    intro: "Explore fictional examples of food-related thoughts and prepare a conversation without a score or diagnosis.", exploreLabel: "Explore the differences",
    cards: [
      { title: "Planning and enjoyment", body: "Looking forward to a favorite meal or planning dinner does not, by itself, mean something is wrong.", takeaway: "The context and effect on daily life matter." },
      { title: "Intrusive thoughts", body: "Researchers use food noise to describe persistent, unwanted food-related thoughts that can interfere with life. The concept is still being studied.", takeaway: "Describe when thoughts occur, how distressing they feel and what they interrupt. These prompts are not a diagnostic test." },
      { title: "When support matters", body: "Loss-of-control eating, severe restriction or other distress deserve a direct conversation with a healthcare professional. Food noise and binge eating disorder are not interchangeable terms.", takeaway: "You do not need to prove that you fit an internet label to ask for help." },
    ],
    scenario: { setup: "A fictional reader enjoys planning meals but is worried that every thought about food counts as food noise.", question: "Which distinction is most useful?", options: ["Any thought about food is a symptom.", "A score can tell them whether they need medication.", "Consider whether thoughts are unwanted, intrusive or disruptive."], correct: 2, feedback: ["Ordinary food thoughts are part of life. Thinking about food alone is not enough to describe a problem.", "This exercise cannot diagnose a condition or determine treatment eligibility.", "Yes. The experience and its impact are more useful to describe than the label alone."] },
    questions: ["How can I describe the thoughts and what they interrupt?", "Could eating patterns or other circumstances be relevant?", "Who could help with distress or loss-of-control eating?", "What support options fit my needs and preferences?"],
    sources: [{ title: "Nutrition & Diabetes, 2025 · Food-noise definition and research boundaries", url: "https://www.nature.com/articles/s41387-025-00382-x" }, { title: "NIDDK · Binge eating disorder", url: "https://www.niddk.nih.gov/health-information/weight-management/binge-eating-disorder/definition-facts" }],
    next: { title: "Find national support resources", href: "/find-support" },
  },
  {
    slug: "how-glp-1-weight-loss-medicines-work", title: "Follow the signals",
    intro: "Explore appetite, blood glucose and digestion as three related parts of how these medicines work.", exploreLabel: "Explore a pathway",
    cards: [
      { title: "Appetite", body: "GLP-1 receptors are involved in appetite regulation. Semaglutide activates GLP-1 receptors; tirzepatide activates both GIP and GLP-1 receptors.", takeaway: "Related pathways do not make the medicines interchangeable." },
      { title: "Blood glucose", body: "Semaglutide and tirzepatide support insulin release in a glucose-dependent way and reduce glucagon secretion. Glucagon is a hormone involved in raising blood glucose.", takeaway: "The effect on blood glucose matters when a clinician reviews other medicines and your care plan." },
      { title: "Stomach emptying", body: "These medicines can delay movement of food out of the stomach. That is one part of their action, not a complete explanation of their effects.", takeaway: "An explanation of the pathway cannot predict your response or select a dose." },
    ],
    scenario: { setup: "A fictional reader hears that two medicines act on GLP-1 and assumes they can substitute one for the other.", question: "What is missing from that conclusion?", options: ["The actual product, its indications and the person's clinical circumstances.", "Nothing: shared pathways mean identical medicines.", "Only the brand's advertising."], correct: 0, feedback: ["Yes. The pathway is a starting point for understanding, not a substitution instruction.", "Medicines can share pathways while differing in ingredient, formulation, indications and instructions.", "Product information and clinical assessment matter; advertising does not establish interchangeability."] },
    questions: ["Which ingredient and product are we discussing?", "What benefit are we trying to achieve in my case?", "How could this affect my other medicines?", "How will we review benefit and side effects?"],
    sources: [wegovy, zepbound],
    next: { title: "Explore medicine names", href: "/tools/medicine-explorer" },
  },
  {
    slug: "before-starting-glp-1-medicine", title: "Build your first-visit checklist",
    intro: "Turn a general interest in treatment into concrete questions about the product, your health and ongoing care.", exploreLabel: "Plan the conversation",
    cards: [
      { title: "The health review", body: "Bring your medicine list and relevant health history. Ask about pregnancy plans, procedures and other circumstances that could affect the treatment discussion.", takeaway: "Eligibility and suitability require a clinician's assessment." },
      { title: "The actual product", body: "Ask for the ingredient, brand or formulation, pharmacy and written instructions. Read the Medication Guide for that exact product.", takeaway: "A program name or advertisement is not enough to identify a medicine." },
      { title: "The follow-up plan", body: "Ask who answers clinical questions, how to reach them, when follow-up happens and what the complete ongoing costs include.", takeaway: "Leave with a contact plan and the next review date, not just a prescription." },
    ],
    scenario: { setup: "A fictional reader sees a monthly program price and a promise of an easy start.", question: "What should they clarify before deciding?", options: ["Only whether the first month is discounted.", "The medicine, clinician assessment, total costs and follow-up arrangements.", "Whether an advertisement guarantees a prescription."], correct: 1, feedback: ["The ongoing medicine and care costs may matter more than an introductory price.", "Yes. Those details help make the offer and care relationship understandable.", "An advertisement cannot establish whether treatment is suitable for a particular person."] },
    questions: ["What health history and medicines do you need to review?", "Which exact product and pharmacy would be used?", "What should I know about side effects and urgent symptoms?", "Who do I contact between visits and outside office hours?", "What is the total ongoing cost, and what happens if access changes?", "When will we review whether treatment is helping?"],
    sources: [medicineSource, wegovy, zepbound],
    next: { title: "Understand common and serious side effects", href: "/blog/glp-1-side-effects" },
  },
  {
    slug: "glp-1-side-effects", title: "Prepare a clearer side-effect conversation",
    intro: "Find official medicine information and choose questions for your care team. This is not a symptom checker or treatment recommendation.", exploreLabel: "Find the next step",
    safety: "Trouble breathing or swelling of the face, lips, tongue or throat needs emergency help. Severe stomach pain that does not go away, or persistent vomiting or diarrhea, needs prompt medical advice. Do not wait to finish this tool. Follow your medicine's instructions and your care team's guidance.",
    cards: [
      { title: "Identify the medicine", body: "Use the exact product name to find its official Medication Guide. Different products and formulations have different instructions.", takeaway: "The source links below include official Wegovy and Zepbound information. Ask your pharmacist for other products." },
      { title: "Describe the pattern", body: "For a care-team conversation, be ready to explain what started, when it started, how it has changed and whether it affects eating or drinking.", takeaway: "This page does not collect or assess your symptoms." },
      { title: "Agree on a response", body: "Ask what warrants a same-day call, where to get urgent help and how to reach the team between visits. Check with the prescriber before making dose changes.", takeaway: "Common side effects still deserve attention if they are persistent, severe or interfering with daily life." },
    ],
    scenario: { setup: "A fictional reader taking Wegovy develops severe stomach pain that does not go away.", question: "What should they prioritize?", options: ["Wait for an online checklist to classify it.", "Assume all stomach symptoms are routine.", "Get prompt medical advice and follow the Medication Guide's instructions."], correct: 2, feedback: ["This tool cannot assess symptoms. Do not delay care to complete it.", "Severity and persistence matter. The Wegovy Medication Guide instructs stopping use and calling the healthcare provider right away for severe, persistent stomach pain.", "Yes. The Wegovy Medication Guide instructs stopping use and calling the healthcare provider right away for severe, persistent stomach pain. Do not use this exercise to assess yourself."] },
    questions: ["Which symptoms mean I should call immediately or get emergency help?", "What information should I have ready when I contact you?", "What should I do if eating or drinking becomes difficult?", "Who handles concerns outside office hours?", "When should we review tolerability before any treatment change?"],
    sources: [wegovy, zepbound, { title: "MedlinePlus · Tirzepatide patient information", url: "https://medlineplus.gov/druginfo/meds/a622044.html" }],
    next: { title: "Prepare for ongoing treatment", href: "/blog/before-starting-glp-1-medicine" },
  },
  {
    slug: "sleep-appetite-and-weight", title: "Plan one useful sleep conversation",
    intro: "Explore sleep and appetite, practice with a fictional example, and choose questions that fit everyday life.", exploreLabel: "Explore your starting point",
    cards: [
      { title: "Appetite and energy", body: "Sleep deficiency can affect appetite and daytime functioning. Sleep is a health priority even when weight does not change.", takeaway: "A sleep habit is not a promise of weight loss." },
      { title: "A workable routine", body: "A consistent sleep schedule can help. Work, caregiving and other constraints matter when choosing a change that is realistic.", takeaway: "Consider one manageable adjustment and discuss ongoing difficulty sleeping." },
      { title: "Symptoms to mention", body: "Loud snoring, breathing pauses or gasping during sleep and daytime sleepiness can be signs of sleep apnea. A professional can assess them.", takeaway: "Do not assume a bedtime change will address these symptoms. Avoid driving when sleepy." },
    ],
    scenario: { setup: "A fictional reader plans an earlier bedtime, but their partner has also noticed breathing pauses during sleep.", question: "What deserves attention?", options: ["Discuss the breathing pauses with a healthcare professional.", "Wait for weight loss to prove the sleep plan works.", "Assume earlier bedtime rules out a sleep problem."], correct: 0, feedback: ["Yes. Breathing pauses warrant a clinical conversation, even when someone is also improving their sleep routine.", "Weight change is not a test for a sleep disorder or the value of sleep.", "A routine change cannot rule out sleep apnea. Tell the clinician about the symptoms."] },
    questions: ["How can I make enough time for sleep within my schedule?", "Could my daytime sleepiness need an assessment?", "Do snoring, gasping or breathing pauses need testing?", "What is one realistic change to try, and when should we review it?"],
    sources: [{ title: "NHLBI · Sleep and health", url: "https://www.nhlbi.nih.gov/health/sleep-deprivation/health-effects" }, { title: "NHLBI · Healthy sleep habits", url: "https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits" }, { title: "NHLBI · Sleep apnea symptoms", url: "https://www.nhlbi.nih.gov/health/sleep-apnea/symptoms" }],
    next: { title: "Try the sleep and appetite lesson", href: "/education/lessons/sleep-and-appetite" },
  },
];

export function companionForArticle(slug: string) { return articleCompanions.find(c => c.slug === slug); }

// Only predefined questions can enter the printable output. Nothing is stored or sent.
export function selectedQuestions(companion: Companion, selected: number[]) {
  return companion.questions.filter((_, index) => selected.includes(index));
}
