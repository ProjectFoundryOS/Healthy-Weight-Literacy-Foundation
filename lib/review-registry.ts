// Stage 2A review registry (Issue #15).
//
// Core invariant: content_update, editorial_review, clinical_evidence_review,
// and licensed_medical_review are four distinct event types. A date or
// person attached to one must never automatically populate another.
//
// content_update is not tracked here — it already exists truthfully as
// each article's published_at/updated_at field in the Stage #14 snapshot
// (see lib/content-registry.ts). This module tracks only the three review
// event types, each tied to the exact article revision hash it was
// performed against (the same sha256 the Stage #14/#23 snapshot already
// uses — see getRevisionHash in lib/content-registry.ts).
//
// This registry is deliberately separate from content/snapshot/**: the
// frozen Stage #14 snapshot and its hashes must never be hand-edited to
// make review metadata "look" cleaner. Review records live here, as an
// overlay referencing a slug + revision hash, so snapshot provenance stays
// intact regardless of how much review metadata accumulates over time.
//
// registry.json currently has zero entries. That is the truthful state:
// no article has completed a documented review under this process yet.
// Issue #17 (legacy article audit) is what will add real records — this
// file must never contain a record that doesn't correspond to a review
// that actually happened. No model may add a record here to make an
// article "look" reviewed.

import { readFileSync } from "node:fs"
import path from "node:path"

export type ReviewType = "editorial_review" | "clinical_evidence_review" | "licensed_medical_review"
export type ReviewerType = "organization" | "human"

export interface ReviewRecord {
  review_id: string
  article_slug: string
  review_type: ReviewType
  reviewer_type: ReviewerType
  reviewer_name: string
  /** Required and non-empty when review_type is "licensed_medical_review". */
  reviewer_credentials?: string[]
  /** Must be true for a "licensed_medical_review" record to be valid. */
  reviewer_identity_verified: boolean
  /** The exact article revision (Stage #14 manifest sha256) this review was performed against. */
  reviewed_revision_hash: string
  reviewed_at: string
  evidence?: string[]
  notes?: string
}

interface ReviewRegistryFile {
  schema_version: number
  reviews: ReviewRecord[]
}

const REGISTRY_PATH = path.join(process.cwd(), "content", "reviews", "registry.json")

/**
 * Validates a single review record against the hard rules from
 * CLAUDE_CONTENT_FACTORY_V5.md / CONTENT_FACTORY_V5_SCHEMA.md. A
 * "licensed_medical_review" is invalid unless every one of these holds:
 * a real identifiable human reviewer, verified identity, recorded
 * credentials, the exact revision hash, and a review date.
 */
export function validateReviewRecord(record: ReviewRecord): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!record.review_id) errors.push("missing review_id")
  if (!record.article_slug) errors.push("missing article_slug")
  if (!record.reviewer_name) errors.push("missing reviewer_name")
  if (!record.reviewed_revision_hash) errors.push("missing reviewed_revision_hash")
  if (!record.reviewed_at) errors.push("missing reviewed_at")

  if (record.review_type === "licensed_medical_review") {
    if (record.reviewer_type !== "human") {
      errors.push('licensed_medical_review requires reviewer_type "human"')
    }
    if (record.reviewer_identity_verified !== true) {
      errors.push("licensed_medical_review requires reviewer_identity_verified === true")
    }
    if (!record.reviewer_credentials || record.reviewer_credentials.length === 0) {
      errors.push("licensed_medical_review requires at least one recorded, verified credential")
    }
  }

  return { valid: errors.length === 0, errors }
}

let cachedReviews: ReviewRecord[] | null = null

/**
 * Loads and validates every record in the registry. A record that fails
 * validation throws rather than being silently trusted or silently
 * dropped — an invalid "licensed_medical_review" claim reaching a build is
 * exactly the failure mode this whole registry exists to prevent.
 */
function loadReviews(): ReviewRecord[] {
  if (cachedReviews) return cachedReviews

  let raw: string
  try {
    raw = readFileSync(REGISTRY_PATH, "utf8")
  } catch {
    cachedReviews = []
    return cachedReviews
  }

  const parsed = JSON.parse(raw) as ReviewRegistryFile
  const reviews = Array.isArray(parsed.reviews) ? parsed.reviews : []

  for (const record of reviews) {
    const { valid, errors } = validateReviewRecord(record)
    if (!valid) {
      throw new Error(
        `[review-registry] Invalid review record "${record.review_id ?? "(no id)"}" for slug ` +
          `"${record.article_slug ?? "(no slug)"}": ${errors.join("; ")}`,
      )
    }
  }

  cachedReviews = reviews
  return cachedReviews
}

export function getReviewsForSlug(allReviews: ReviewRecord[], slug: string): ReviewRecord[] {
  return allReviews.filter((r) => r.article_slug === slug)
}

/** Latest record of a given type for a slug, or null if none exists. */
export function getLatestReviewByType(allReviews: ReviewRecord[], slug: string, type: ReviewType): ReviewRecord | null {
  const matches = getReviewsForSlug(allReviews, slug).filter((r) => r.review_type === type)
  if (matches.length === 0) return null
  return matches.reduce((latest, r) => (new Date(r.reviewed_at) > new Date(latest.reviewed_at) ? r : latest))
}

/**
 * A review record is only truthful evidence about the exact content it
 * names. If the article's current revision hash no longer matches the
 * hash the review was performed against, the review no longer applies —
 * this function returns null rather than surfacing a stale claim.
 */
function getCurrentReview(
  allReviews: ReviewRecord[],
  slug: string,
  type: ReviewType,
  currentRevisionHash: string | null,
): ReviewRecord | null {
  const review = getLatestReviewByType(allReviews, slug, type)
  if (!review) return null
  if (!currentRevisionHash || review.reviewed_revision_hash !== currentRevisionHash) return null
  return review
}

export interface ReviewDisclosure {
  reviewType: ReviewType | null
  reviewerType: ReviewerType | null
  reviewerName: string | null
  credentials: string[] | null
  reviewedAt: string | null
}

const NO_REVIEW: ReviewDisclosure = {
  reviewType: null,
  reviewerType: null,
  reviewerName: null,
  credentials: null,
  reviewedAt: null,
}

/**
 * Pure core: given an already-loaded (and already-validated) list of
 * review records, returns "what review status may this article truthfully
 * display or emit as structured data right now." Contains no filesystem
 * knowledge, so it is directly unit-testable against in-memory fixtures
 * (see __tests__/review-registry.test.ts) — including adversarial fixtures
 * that a real, validated registry could never contain, to prove the
 * precedence and hash-matching logic itself is sound.
 *
 * This is the single source of truth consumed by both the visible article
 * UI (components/content/article-review-status.tsx) and the JSON-LD
 * builder (components/seo/article-schema.tsx), so the two can never
 * disagree (Issue #15 gate: visible metadata and JSON-LD agree).
 *
 * Precedence: licensed_medical_review > clinical_evidence_review >
 * editorial_review > no review. A higher review type does not need a
 * separate record of every lower type to be disclosed — but each type
 * disclosed must itself be a real, hash-matched record.
 */
export function buildDisclosureFromReviews(
  allReviews: ReviewRecord[],
  slug: string,
  currentRevisionHash: string | null,
): ReviewDisclosure {
  const licensed = getCurrentReview(allReviews, slug, "licensed_medical_review", currentRevisionHash)
  if (licensed) {
    return {
      reviewType: "licensed_medical_review",
      reviewerType: licensed.reviewer_type,
      reviewerName: licensed.reviewer_name,
      credentials: licensed.reviewer_credentials ?? null,
      reviewedAt: licensed.reviewed_at,
    }
  }

  const clinical = getCurrentReview(allReviews, slug, "clinical_evidence_review", currentRevisionHash)
  if (clinical) {
    return {
      reviewType: "clinical_evidence_review",
      reviewerType: clinical.reviewer_type,
      reviewerName: clinical.reviewer_name,
      credentials: clinical.reviewer_credentials ?? null,
      reviewedAt: clinical.reviewed_at,
    }
  }

  const editorial = getCurrentReview(allReviews, slug, "editorial_review", currentRevisionHash)
  if (editorial) {
    return {
      reviewType: "editorial_review",
      reviewerType: editorial.reviewer_type,
      reviewerName: editorial.reviewer_name,
      credentials: null,
      reviewedAt: editorial.reviewed_at,
    }
  }

  return NO_REVIEW
}

/** Server-only convenience wrapper: loads the real registry and applies buildDisclosureFromReviews. */
export function getArticleReviewDisclosure(slug: string, currentRevisionHash: string | null): ReviewDisclosure {
  return buildDisclosureFromReviews(loadReviews(), slug, currentRevisionHash)
}
