// MDX content types and utilities for statically-defined Programs.
//
// Blog articles are NOT defined here. The blog corpus is owned by the
// Stage #14/#23 committed content registry (see lib/content-registry.ts),
// which is hash-verified against the production Supabase snapshot. A
// static/sample blog array previously lived in this file and was consumed
// by lib/search-index.ts, which meant search could surface stale content
// and unverifiable credentialed sample authors (e.g. "Dr. Sarah Johnson")
// that disagreed with the real Supabase-backed blog (Issue #15). Do not
// reintroduce a parallel blog data source here — add real articles through
// the snapshot/registry pipeline instead.

export interface Program {
  slug: string
  title: string
  description: string
  heroImage: string
  tags: string[]
  category: string
  duration: string
  format: string
  audience: string
  content: string
}

// Sample programs data
export const programs: Program[] = [
  {
    slug: "nutrition-basics-workshop",
    title: "Nutrition Basics Workshop",
    description:
      "A comprehensive 6-week program teaching fundamental nutrition concepts, meal planning, and healthy cooking skills for sustainable weight management.",
    heroImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=600&fit=crop",
    tags: ["nutrition", "education", "beginner"],
    category: "Education",
    duration: "6 weeks",
    format: "In-person & Virtual",
    audience: "Adults",
    content: `
# Nutrition Basics Workshop

Transform your relationship with food through evidence-based nutrition education.

## Program Overview

This 6-week program covers:
- **Week 1:** Understanding macronutrients and micronutrients
- **Week 2:** Reading nutrition labels effectively
- **Week 3:** Meal planning and prep strategies
- **Week 4:** Healthy cooking techniques
- **Week 5:** Eating mindfully and intuitively
- **Week 6:** Building sustainable habits

## Who It's For

This program is perfect for:
- Beginners starting their health journey
- Anyone confused by conflicting nutrition information
- People wanting to improve their cooking skills
- Families looking to eat healthier together

## What You'll Learn

- How to create balanced meals
- Strategies for grocery shopping on a budget
- Tips for meal prepping efficiently
- Ways to make healthy eating enjoyable

## Program Format

Choose the format that works best for you:
- **In-Person:** Small group sessions at our community centers
- **Virtual:** Interactive online classes via Zoom

## How to Join

1. Complete our online interest form
2. Attend a free orientation session
3. Select your preferred session time
4. Begin your transformation!
    `,
  },
  {
    slug: "family-fit-program",
    title: "Family Fit Program",
    description:
      "An engaging 8-week program designed for families with children ages 5-12, featuring fun activities, cooking classes, and family wellness coaching.",
    heroImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop",
    tags: ["family", "children", "activity"],
    category: "Programs",
    duration: "8 weeks",
    format: "In-person",
    audience: "Families with children 5-12",
    content: `
# Family Fit Program

Make healthy living a family adventure with our award-winning program.

## Program Overview

The Family Fit Program brings families together through:
- Interactive cooking classes
- Fun physical activities
- Family wellness coaching
- Take-home challenges and games

## Weekly Schedule

Each week includes:
- **Family Activity Session (60 min):** Fun games and exercises
- **Cooking Class (45 min):** Prepare healthy recipes together
- **Family Discussion (30 min):** Share wins and problem-solve challenges

## Key Benefits

### For Children
- Develop positive attitudes toward healthy food
- Learn cooking skills and kitchen safety
- Build confidence through physical activity
- Make new friends with similar interests

### For Parents
- Learn strategies for picky eaters
- Get tips for active family time
- Connect with other families on similar journeys
- Receive professional guidance and support

## Success Stories

> "Our kids now ask for vegetables! The program made healthy eating fun instead of a battle." - The Martinez Family

## How to Enroll

Contact us to learn about upcoming sessions and registration.
    `,
  },
  {
    slug: "workplace-wellness",
    title: "Workplace Wellness Initiative",
    description:
      "Comprehensive corporate wellness program offering lunch-and-learns, fitness challenges, and health coaching for employee well-being.",
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop",
    tags: ["corporate", "workplace", "wellness"],
    category: "Programs",
    duration: "Ongoing",
    format: "On-site & Virtual",
    audience: "Organizations & Businesses",
    content: `
# Workplace Wellness Initiative

Invest in your most valuable asset—your employees.

## Why Workplace Wellness?

Healthy employees are:
- More productive and engaged
- Less likely to take sick days
- More satisfied with their jobs
- Better collaborators and innovators

## Program Components

### Lunch & Learn Sessions
Monthly educational sessions on topics like:
- Stress management
- Healthy eating at work
- Desk exercises and ergonomics
- Sleep and recovery

### Fitness Challenges
Quarterly team-based challenges:
- Step competitions
- Hydration challenges
- Healthy habit streaks
- Movement minutes

### Health Coaching
One-on-one sessions with certified coaches:
- Goal setting and accountability
- Personalized nutrition guidance
- Stress management strategies
- Work-life balance support

### Wellness Resources
Access to our comprehensive library:
- Healthy recipes and meal plans
- Exercise videos and guides
- Mental wellness tools
- Health trackers and apps

## Implementation

We work with your HR team to:
1. Assess current wellness needs
2. Customize program components
3. Launch with employee engagement events
4. Measure and report outcomes

## Get Started

Contact our partnerships team to discuss how we can support your organization.
    `,
  },
]

export function getPrograms(): Program[] {
  return programs
}

export function getProgram(slug: string): Program | undefined {
  return programs.find((program) => program.slug === slug)
}
