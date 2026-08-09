// Stage 2A closure (Issue #26): verified-reviewer provenance registry.
//
// Hardens the licensed_medical_review gate beyond a self-asserted
// `reviewer_identity_verified: true` boolean plus inline credential
// strings on a review record — which could previously be set unilaterally
// by whoever writes the review record, structurally passing validation
// without any real reviewer ever having existed.
//
// A licensed_medical_review record must now reference a `reviewer_id`
// that resolves to an entry here, and this entry must itself carry
// verification provenance (method/source/date) for identity and for at
// least one relevant credential. The review record no longer asserts its
// own reviewer's legitimacy — it borrows it from this separately
// maintained registry, which stays empty unless a real verified reviewer
// exists. No model may add an entry here that is not an actual verified
// human reviewer.
//
// Deliberately minimal: only enough fields to audit the verification
// claim (method/source/date), not to store unnecessary personal data.

import { readFileSync } from "node:fs"
import path from "node:path"
import { isValidDateString } from "./date-validation"

export type VerifiedReviewerStatus = "active" | "inactive" | "revoked"

export interface IdentityVerification {
  method: string
  source: string
  verified_at: string
}

export interface CredentialRecord {
  credential: string
  issuer: string
  verification_source: string
  verified_at: string
}

export interface VerifiedReviewer {
  reviewer_id: string
  reviewer_type: "human"
  name: string
  identity_verification: IdentityVerification
  credentials: CredentialRecord[]
  status: VerifiedReviewerStatus
}

interface VerifiedReviewerRegistryFile {
  schema_version: number
  reviewers: VerifiedReviewer[]
}

const REGISTRY_PATH = path.join(process.cwd(), "content", "reviews", "verified-reviewers.json")
const VALID_STATUSES: VerifiedReviewerStatus[] = ["active", "inactive", "revoked"]

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

// Issue #27 item 1: strict calendar-date validation now lives in
// ./date-validation (it also rejects impossible calendar dates like
// "2026-02-31" that JS's Date constructor would otherwise silently
// normalize). Re-exported here unchanged so every existing import of
// isValidDateString from this module keeps working.
export { isValidDateString } from "./date-validation"

export function validateVerifiedReviewer(record: VerifiedReviewer): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(record.reviewer_id)) errors.push("missing reviewer_id")
  if (record.reviewer_type !== "human") errors.push('reviewer_type must be "human"')
  if (!isNonEmptyString(record.name)) errors.push("missing name")

  const iv = record.identity_verification
  if (!iv || !isNonEmptyString(iv.method) || !isNonEmptyString(iv.source) || !isValidDateString(iv.verified_at)) {
    errors.push("missing or incomplete identity_verification provenance (method/source/verified_at)")
  }

  if (!Array.isArray(record.credentials) || record.credentials.length === 0) {
    errors.push("missing at least one credential")
  } else {
    const hasFullyProvenancedCredential = record.credentials.some(
      (c) =>
        isNonEmptyString(c.credential) &&
        isNonEmptyString(c.issuer) &&
        isNonEmptyString(c.verification_source) &&
        isValidDateString(c.verified_at),
    )
    if (!hasFullyProvenancedCredential) {
      errors.push("no credential has complete verification provenance (issuer/verification_source/verified_at)")
    }
  }

  if (!VALID_STATUSES.includes(record.status)) {
    errors.push(`unknown status "${String(record.status)}"`)
  }

  return { valid: errors.length === 0, errors }
}

let cachedReviewers: VerifiedReviewer[] | null = null

function loadVerifiedReviewersFromDisk(): VerifiedReviewer[] {
  if (cachedReviewers) return cachedReviewers

  let raw: string
  try {
    raw = readFileSync(REGISTRY_PATH, "utf8")
  } catch {
    cachedReviewers = []
    return cachedReviewers
  }

  const parsed = JSON.parse(raw) as VerifiedReviewerRegistryFile
  const reviewers = Array.isArray(parsed.reviewers) ? parsed.reviewers : []

  const seenIds = new Set<string>()
  for (const reviewer of reviewers) {
    if (seenIds.has(reviewer.reviewer_id)) {
      throw new Error(`[verified-reviewer-registry] Duplicate reviewer_id "${reviewer.reviewer_id}"`)
    }
    seenIds.add(reviewer.reviewer_id)

    const { valid, errors } = validateVerifiedReviewer(reviewer)
    if (!valid) {
      throw new Error(
        `[verified-reviewer-registry] Invalid verified reviewer "${reviewer.reviewer_id ?? "(no id)"}": ${errors.join("; ")}`,
      )
    }
  }

  cachedReviewers = reviewers
  return cachedReviewers
}

export function loadVerifiedReviewers(): VerifiedReviewer[] {
  return loadVerifiedReviewersFromDisk()
}

export function getVerifiedReviewer(reviewerId: string): VerifiedReviewer | null {
  return loadVerifiedReviewersFromDisk().find((r) => r.reviewer_id === reviewerId) ?? null
}

/** Only the credential strings that carry complete verification provenance — the only ones safe to disclose as "verified." */
export function getVerifiedCredentials(reviewer: VerifiedReviewer): string[] {
  return reviewer.credentials
    .filter(
      (c) =>
        isNonEmptyString(c.credential) &&
        isNonEmptyString(c.issuer) &&
        isNonEmptyString(c.verification_source) &&
        isValidDateString(c.verified_at),
    )
    .map((c) => c.credential)
}

/**
 * Pure core: does this reviewer_id resolve to an active, fully-provenanced
 * human verified reviewer? Accepts an already-loaded reviewers array so it
 * is directly unit-testable against fixtures (see
 * __tests__/verified-reviewer-registry.test.ts) without touching the
 * filesystem. This is what lib/review-registry.ts's licensed_medical_review
 * gate calls instead of trusting a self-asserted boolean.
 */
export function resolveVerifiedReviewer(
  reviewers: VerifiedReviewer[],
  reviewerId: string | undefined,
): { reviewer: VerifiedReviewer | null; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(reviewerId)) {
    errors.push("licensed_medical_review requires a reviewer_id")
    return { reviewer: null, errors }
  }

  const reviewer = reviewers.find((r) => r.reviewer_id === reviewerId) ?? null
  if (!reviewer) {
    errors.push(`reviewer_id "${reviewerId}" does not exist in the verified reviewer registry`)
    return { reviewer: null, errors }
  }

  if (reviewer.reviewer_type !== "human") {
    errors.push(`reviewer "${reviewerId}" is not a human reviewer`)
  }
  if (reviewer.status !== "active") {
    errors.push(`reviewer "${reviewerId}" status is "${reviewer.status}", not "active"`)
  }

  const iv = reviewer.identity_verification
  if (!iv || !isNonEmptyString(iv.method) || !isNonEmptyString(iv.source) || !isValidDateString(iv.verified_at)) {
    errors.push(`reviewer "${reviewerId}" is missing identity-verification provenance`)
  }

  if (getVerifiedCredentials(reviewer).length === 0) {
    errors.push(`reviewer "${reviewerId}" has no credential with complete verification provenance`)
  }

  return { reviewer: errors.length === 0 ? reviewer : null, errors }
}
