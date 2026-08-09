// MDX content types and utilities for statically-defined Programs/Resources.
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

export interface Resource {
  slug: string
  title: string
  description: string
  author: string
  heroImage: string
  tags: string[]
  category: string
  type: string
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

// Sample resources data
export const resources: Resource[] = [
  {
    slug: "healthy-meal-planning-guide",
    title: "Healthy Meal Planning Guide",
    description:
      "A comprehensive guide to planning nutritious meals for the week, including templates, shopping lists, and budget-friendly tips.",
    author: "HWLF Nutrition Team",
    heroImage: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1200&h=600&fit=crop",
    tags: ["meal-planning", "nutrition", "budget"],
    category: "Nutrition",
    type: "Guide",
    content: `
# Healthy Meal Planning Guide

Master the art of meal planning to save time, money, and stress while eating well.

## Why Meal Plan?

Benefits of weekly meal planning:
- **Save Money:** Reduce food waste and impulse purchases
- **Save Time:** Know exactly what to cook each day
- **Eat Healthier:** Plan balanced meals in advance
- **Reduce Stress:** No more "what's for dinner?" panic

## Getting Started

### Step 1: Assess Your Week
Look at your calendar and note:
- Busy nights needing quick meals
- Days with more cooking time
- Social events or eating out
- Lunch situations (pack or buy)

### Step 2: Choose Your Meals
Select 5-7 dinners that include:
- 2-3 quick meals (under 30 minutes)
- 1-2 batch cooking recipes
- 1 new recipe to try
- 1 leftover night

### Step 3: Make Your List
Organize by store section:
- Produce
- Proteins
- Dairy
- Pantry staples
- Frozen items

## Sample Weekly Plan

| Day | Breakfast | Lunch | Dinner |
|-----|-----------|-------|--------|
| Mon | Oatmeal | Salad + soup | Sheet pan chicken |
| Tue | Smoothie | Leftovers | Taco bowl |
| Wed | Yogurt parfait | Sandwich | Pasta primavera |
| Thu | Eggs + toast | Salad | Stir fry |
| Fri | Oatmeal | Leftovers | Pizza night |

## Budget Tips

- Buy seasonal produce
- Use frozen fruits and vegetables
- Buy whole grains in bulk
- Plan around sales
- Use meat as a side, not main

## Download Resources

- Weekly planning template (PDF)
- Master grocery list
- 50 quick dinner ideas
    `,
  },
  {
    slug: "mindful-eating-workbook",
    title: "Mindful Eating Workbook",
    description:
      "An interactive workbook with exercises and reflections to help develop a healthier, more intuitive relationship with food.",
    author: "HWLF Wellness Team",
    heroImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=600&fit=crop",
    tags: ["mindfulness", "mental-health", "habits"],
    category: "Mindset",
    type: "Workbook",
    content: `
# Mindful Eating Workbook

Develop a peaceful, intuitive relationship with food through mindfulness practices.

## What is Mindful Eating?

Mindful eating is:
- Paying full attention to the eating experience
- Noticing physical hunger and fullness cues
- Eating without judgment or guilt
- Appreciating food with all senses

## The Hunger-Fullness Scale

Rate your hunger before, during, and after meals:

1. **Ravenous** - Uncomfortably hungry
2. **Very Hungry** - Ready to eat
3. **Hungry** - Stomach starting to signal
4. **Slightly Hungry** - Could eat
5. **Neutral** - Neither hungry nor full
6. **Satisfied** - Comfortable
7. **Full** - Stomach feels stretched
8. **Very Full** - Uncomfortable
9. **Stuffed** - Very uncomfortable
10. **Painfully Full** - Physical discomfort

**Goal:** Start eating at 3-4, stop at 6-7

## Daily Reflection Exercise

Each day, reflect on:
1. What did I eat today that nourished my body?
2. How did I feel before, during, and after eating?
3. Did I eat in response to physical hunger or emotions?
4. What am I grateful for about my food today?

## Mindful Eating Practice

Try this with one meal:
1. Remove distractions (phone, TV)
2. Take three deep breaths
3. Notice the food's appearance and smell
4. Take small bites and chew thoroughly
5. Put down utensils between bites
6. Check in with fullness midway through

## Weekly Exercises

- **Week 1:** Hunger/fullness tracking
- **Week 2:** Emotional eating awareness
- **Week 3:** Savoring practices
- **Week 4:** Challenging food rules
    `,
  },
  {
    slug: "family-activity-ideas",
    title: "100 Family Activity Ideas",
    description:
      "A collection of fun, active family activities for all seasons and fitness levels, designed to get everyone moving together.",
    author: "HWLF Activity Team",
    heroImage: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=600&fit=crop",
    tags: ["family", "activity", "fitness"],
    category: "Activity",
    type: "Guide",
    content: `
# 100 Family Activity Ideas

Get the whole family moving with these fun, accessible activities!

## Indoor Activities

### Active Games
1. Dance party with favorite music
2. Indoor obstacle course
3. Balloon volleyball
4. Yoga for kids videos
5. Hide and seek active version

### Creative Movement
6. Animal movement game (hop like a frog, etc.)
7. Freeze dance
8. Musical chairs with exercises
9. Indoor bowling with water bottles
10. Paper airplane distance contest

## Outdoor Activities

### Backyard Fun
11. Tag variations (freeze tag, blob tag)
12. Frisbee
13. Kickball
14. Jump rope challenges
15. Hula hoop contests

### Nature Adventures
16. Family hikes
17. Nature scavenger hunts
18. Bird watching walks
19. Park playground visits
20. Beach or lake swimming

## Seasonal Ideas

### Spring
- Gardening together
- Bike rides
- Kite flying
- Outdoor cleanup walks

### Summer
- Swimming
- Camping
- Water balloon activities
- Outdoor movie nights with stretch breaks

### Fall
- Apple picking
- Leaf pile jumping
- Football or soccer
- Halloween activity walk

### Winter
- Sledding
- Snow fort building
- Ice skating
- Indoor fitness games

## Making It Work

### Tips for Success
- Let kids choose activities
- Keep it fun, not competitive
- Adapt for all abilities
- Celebrate participation, not performance

### Sample Weekly Schedule
- **Mon/Wed/Fri:** 30-min family walks
- **Tuesday:** Dance party
- **Thursday:** Backyard games
- **Weekend:** Longer outdoor adventure

## Track Your Progress

Use our family activity tracker to:
- Log activities together
- Earn badges for consistency
- Celebrate milestones
- Set family goals
    `,
  },
]

export function getPrograms(): Program[] {
  return programs
}

export function getProgram(slug: string): Program | undefined {
  return programs.find((program) => program.slug === slug)
}

export function getResources(): Resource[] {
  return resources
}

export function getResource(slug: string): Resource | undefined {
  return resources.find((resource) => resource.slug === slug)
}

