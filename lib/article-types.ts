import type { ArticleVisualSet } from "./article-visuals"

// Shared article display fields. Publishing reads approved repository files.
export interface Citation {
  title: string
  url: string
  /** e.g. "clinical-trial" | "peer-reviewed" | "fda" | "health-authority" | "guideline" */
  type: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  // Author identity
  author: string
  author_image: string
  /** Professional title, e.g. "Registered Dietitian, MPH" */
  author_title: string | null
  /** Author biography shown on article page */
  author_bio: string | null
  /** Credentials array, e.g. ["RD", "MPH"] */
  author_credentials: string[] | null
  // Medical review
  /** Name of the medical reviewer */
  medical_reviewer: string | null
  /** Reviewer's credentials, e.g. "MD, Obesity Medicine Specialist" */
  reviewer_credentials: string | null
  /** Date of last editorial review; this alone does not indicate clinical review. */
  reviewed_at: string | null
  /** Date when next review is due */
  next_review_date: string | null
  // Content quality
  /** Structured citations array stored as JSONB */
  citations: Citation[] | null
  /** Whether the article includes the required medical disclaimer */
  has_medical_disclaimer: boolean
  // Dates
  published_at: string
  updated_at: string
  created_at: string
  // Content
  hero_image: string
  tags: string[]
  category: string
  reading_time: string
  content: string
  is_published: boolean
  /** Local development display only; never denotes publication or approval. */
  draft_preview?: boolean
  visuals?: ArticleVisualSet
}

