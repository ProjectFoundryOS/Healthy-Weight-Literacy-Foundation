// Stage 2A review registry (Issue #15, hardened in Issue #26).
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
//
// Issue #26 hardening: a licensed_medical_review record no longer carries
// its own identity/credential assertions. It references a `reviewer_id`,
// which must resolve to a real, actively-provenanced entry in
// lib/verified-reviewer-registry.ts. Self-asserting
// `reviewer_identity_verified: true` plus a credential string is no longer
// sufficient — an agent (or anyone) writing a review record cannot also
// be the one who certifies that record's reviewer is real.

import { readFileSync } from "node:fs"
import path from "node:path"
import {
  getVerifiedCredentials,
  isValidDateString,
  loadVerifiedReviewers,
  resolveVerifiedReviewer,
  type VerifiedReviewer,
} from "./verified-reviewer-registry"

export type ReviewType = "editorial_review" | "clinical_evidence_review" | "licensed_medical_review"
export type ReviewerType = "organization" | "human"

const VALID_REVIEW_TYPES: ReviewType[] = ["editorial_review", "clinical_evidence_review", "licensed_medical_review"]
const VALID_REVIEWER_TYPES: ReviewerType[] = ["organization", "human"]

export interface ReviewRecord {
  review_id: string
  article_slug: string
  review_type: ReviewType
  reviewer_type: ReviewerType
  /** Display name for editorial_review/clinical_evidence_review. Ignored for licensed_medical_review — see reviewer_id. */
  reviewer_name: string
  /** Display credentials for clinical_evidence_review. Ignored for licensed_medical_review — see reviewer_id. */
  reviewer_credentials?: string[]
  /**
   * Required when review_type is "licensed_medical_review". Resolved
   * against lib/verified-reviewer-registry.ts; the record's own
   * reviewer_name/reviewer_credentials/reviewer_identity_verified are never
   * trusted for the licensed gate, since those can be self-asserted by
   * whoever writes this record.
   */
  reviewer_id?: string
  /** @deprecated Retained for non-licensed record types only; never sufficient evidence on its own. Ignored entirely for licensed_medical_review. */
  reviewer_identity_verified?: boolean
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Validates a single review record against the hard rules from
 * CLAUDE_CONTENT_FACTORY_V5.md / CONTENT_FACTORY_V5_SCHEMA.md, hardened
 * per Issue #26. Rejects unknown review_type/reviewer_type enum values
 * and malformed dates rather than trusting the JSON's shape. A
 * "licensed_medical_review" is invalid unless its reviewer_id resolves to
 * an active, fully-provenanced human reviewer in the verified-reviewer
 * registry — never merely because the record itself claims verification.
 */
export function validateReviewRecord(
  record: ReviewRecord,
  verifiedReviewers: VerifiedReviewer[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(record.review_id)) errors.push("missing review_id")
  if (!isNonEmptyString(record.article_slug)) errors.push("missing article_slug")
  if (!isNonEmptyString(record.reviewed_revision_hash)) errors.push("missing reviewed_revision_hash")
  if (!isValidDateString(record.reviewed_at)) errors.push("missing or invalid reviewed_at date")

  if (!VALID_REVIEW_TYPES.includes(record.review_type)) {
    errors.push(`unknown review_type "${String(record.review_type)}"`)
  }
  if (!VALID_REVIEWER_TYPES.includes(record.reviewer_type)) {
    errors.push(`unknown reviewer_type "${String(record.reviewer_type)}"`)
  }

  if (record.review_type === "licensed_medical_review") {
    const { errors: resolutionErrors } = resolveVerifiedReviewer(verifiedReviewers, record.reviewer_id)
    errors.push(...resolutionErrors)
    // A licensed review is never valid as an organization/AI/editorial
    // record, regardless of what reviewer_id resolution found — this is
    // belt-and-suspenders with resolveVerifiedReviewer's own human check.
    if (record.reviewer_type !== "human") {
      errors.push('licensed_medical_review requires reviewer_type "human"')
    }
  } else {
    if (!isNonEmptyString(record.reviewer_name)) errors.push("missing reviewer_name")
  }

  return { valid: errors.length === 0, errors }
}

/** Pure: returns every review_id that appears more than once. Empty means the registry is clean. */
export function findDuplicateReviewIds(records: ReviewRecord[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const record of records) {
    if (seen.has(record.review_id)) {
      duplicates.add(record.review_id)
    }
    seen.add(record.review_id)
  }
  return [...duplicates]
}

let cachedReviews: ReviewRecord[] | null = null

/**
 * Loads and validates every record in the registry, resolving licensed
 * reviews against the verified-reviewer registry as part of validation. A
 * record that fails validation throws rather than being silently trusted
 * or silently dropped — an invalid "licensed_medical_review" claim
 * reaching a build is exactly the failure mode this registry exists to
 * prevent. Duplicate review_id values are rejected outright.
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

  const duplicates = findDuplicateReviewIds(reviews)
  if (duplicates.length > 0) {
    throw new Error(`[review-registry] Duplicate review_id value(s): ${duplicates.join(", ")}`)
  }

  const verifiedReviewers = loadVerifiedReviewers()
  for (const record of reviews) {
    const { valid, errors } = validateReviewRecord(record, verifiedReviewers)
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
 * review records plus the verified-reviewer registry, returns "what
 * review status may this article truthfully display or emit as
 * structured data right now." Contains no filesystem knowledge, so it is
 * directly unit-testable against in-memory fixtures (see
 * __tests__/review-registry.test.ts) — including adversarial fixtures
 * that a real, validated registry could never contain, to prove the
 * precedence and hash-matching logic itself is sound.
 *
 * This is the single source of truth consumed by both the visible article
 * UI (components/content/article-review-status.tsx) and the JSON-LD
 * builder (components/seo/article-schema.tsx), so the two can never
 * disagree (Issue #15 gate: visible metadata and JSON-LD agree).
 *
 * A licensed_medical_review's disclosed name/credentials always come from
 * the resolved VerifiedReviewer record, never from the review record's
 * own fields — even if a review record somehow carried inline
 * name/credential strings, they are not the authoritative source for
 * disclosure.
 *
 * Precedence: licensed_medical_review > clinical_evidence_review >
 * editorial_review > no review. A higher review type does not need a
 * separate record of every lower type to be disclosed — but each type
 * disclosed must itself be a real, hash-matched record.
 */
export function buildDisclosureFromReviews(
  allReviews: ReviewRecord[],
  verifiedReviewers: VerifiedReviewer[],
  slug: string,
  currentRevisionHash: string | null,
): ReviewDisclosure {
  const licensed = getCurrentReview(allReviews, slug, "licensed_medical_review", currentRevisionHash)
  if (licensed) {
    const { reviewer } = resolveVerifiedReviewer(verifiedReviewers, licensed.reviewer_id)
    if (reviewer) {
      return {
        reviewType: "licensed_medical_review",
        reviewerType: "human",
        reviewerName: reviewer.name,
        credentials: getVerifiedCredentials(reviewer),
        reviewedAt: licensed.reviewed_at,
      }
    }
    // Defensive: a licensed review that fails to resolve at disclosure
    // time (e.g. the verified-reviewer registry changed after this
    // registry was cached) is never surfaced — fall through instead of
    // trusting the review record's own claim.
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

/** Server-only convenience wrapper: loads the real registries and applies buildDisclosureFromReviews. */
export function getArticleReviewDisclosure(slug: string, currentRevisionHash: string | null): ReviewDisclosure {
  return buildDisclosureFromReviews(loadReviews(), loadVerifiedReviewers(), slug, currentRevisionHash)
}
