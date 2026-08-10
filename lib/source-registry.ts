// V5 Stage 3 (Issue #16): source registry.
//
// This is the foundation of the evidence dependency chain:
//   source -> atomic claim -> evidence packet -> article
// A source record must exist, and must have actually been verified,
// before any claim may cite it. A URL merely existing in a record is not
// proof that it supports anything — the `verification` block records what
// was actually checked (URL reachable, title matched, publication
// metadata matched, and a durable identifier checked when one exists).
//
// This registry is deliberately separate from content/reviews/**, which
// remains the authoritative article-review layer (Stage 2A/#26). Sources
// are evidence about the world; reviews are events about an article.
//
// content/sources/registry.json is seeded with only a small number of
// real, independently verified sources (see STAGE3_EVIDENCE_REGISTRY_AUDIT.md)
// — never with fabricated bulk records. No model may add a source record
// here that was not actually checked against the cited URL/identifier.

import { readFileSync } from "node:fs"
import path from "node:path"
import { isValidDateString } from "./date-validation"

export type SourceType =
  | "FDA_label"
  | "FDA_safety_communication"
  | "FDA_regulatory"
  | "NIH"
  | "CDC"
  | "peer_reviewed_RCT"
  | "peer_reviewed_observational"
  | "systematic_review"
  | "meta_analysis"
  | "clinical_guideline"
  | "professional_society_guideline"
  | "government_health_authority"
  | "consensus_statement"
  | "peer_reviewed_review"
  | "manufacturer_primary_document"
  | "secondary_reference"
  | "other"

export type TrustTier = "A" | "B" | "C" | "D"

export type SourceStatus = "current" | "superseded" | "corrected" | "retracted" | "unavailable"

export const VALID_SOURCE_TYPES: SourceType[] = [
  "FDA_label",
  "FDA_safety_communication",
  "FDA_regulatory",
  "NIH",
  "CDC",
  "peer_reviewed_RCT",
  "peer_reviewed_observational",
  "systematic_review",
  "meta_analysis",
  "clinical_guideline",
  "professional_society_guideline",
  "government_health_authority",
  "consensus_statement",
  "peer_reviewed_review",
  "manufacturer_primary_document",
  "secondary_reference",
  "other",
]

export const VALID_TRUST_TIERS: TrustTier[] = ["A", "B", "C", "D"]
export const VALID_SOURCE_STATUSES: SourceStatus[] = ["current", "superseded", "corrected", "retracted", "unavailable"]

/** Lower rank = more trustworthy. Used to compare tiers (e.g. "is this at least Tier B?"). */
const TIER_RANK: Record<TrustTier, number> = { A: 0, B: 1, C: 2, D: 3 }

export function isAtLeastTier(tier: TrustTier, minimum: TrustTier): boolean {
  return TIER_RANK[tier] <= TIER_RANK[minimum]
}

export interface SourceVerification {
  url_checked: boolean
  identifier_checked: boolean
  title_matched: boolean
  publication_metadata_matched: boolean
  verified_at: string
  verification_method: string
}

/**
 * A published erratum/correction against this source, recorded so the
 * relationship is auditable rather than left implicit. Recording a
 * correction here does NOT by itself mean any claim citing this source is
 * affected — `affects_existing_claims` and `checked_claim_ids` say
 * explicitly whether the claims that cite this source were actually
 * checked against this specific correction, and what was found. A source
 * with real, non-retraction corrections should generally carry
 * `status: "corrected"` rather than "current" — see ACTIVE_SOURCE_STATUSES
 * in lib/evidence-support-policy.ts for why "corrected" still counts as
 * valid, current support.
 */
export interface SourceCorrection {
  correction_doi?: string
  correction_pmid?: string
  published_at: string
  description: string
  affects_existing_claims: boolean
  checked_claim_ids: string[]
  checked_at: string
  notes?: string
}

export interface SourceRecord {
  source_id: string
  title: string
  publisher_or_journal: string
  authors?: string[]
  publication_date: string
  source_type: SourceType
  canonical_url: string
  doi?: string
  pmid?: string
  other_identifier?: string
  retrieved_at: string
  trust_tier: TrustTier
  status: SourceStatus
  /** superseded/corrected/retracted status should point at a replacement when one is known. Optional: may be genuinely unresolved. */
  superseded_by_source_id?: string
  topics: string[]
  notes?: string
  verification: SourceVerification
  /** Published errata/corrections against this exact source, each with an explicit checked-against-claims determination. See SourceCorrection. */
  corrections?: SourceCorrection[]
}

interface SourceRegistryFile {
  schema_version: number
  sources: SourceRecord[]
}

const REGISTRY_PATH = path.join(process.cwd(), "content", "sources", "registry.json")

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Validates a single source record. Pure — takes no filesystem
 * dependency, so it is directly unit-testable against fixtures.
 *
 * Deliberately strict about the verification block: a source is not
 * "verified" merely because it has a canonical_url field. At minimum the
 * URL must actually have been checked and the title must actually have
 * been matched against the cited source; when a durable identifier
 * (doi/pmid/other_identifier) is present, it must also have been checked.
 */
export function validateSourceRecord(record: SourceRecord): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(record.source_id)) errors.push("missing source_id")
  if (!isNonEmptyString(record.title)) errors.push("missing title")
  if (!isNonEmptyString(record.publisher_or_journal)) errors.push("missing publisher_or_journal")
  if (!isNonEmptyString(record.canonical_url)) errors.push("missing canonical_url")

  if (!isValidDateString(record.publication_date)) errors.push("missing or invalid publication_date")
  if (!isValidDateString(record.retrieved_at)) errors.push("missing or invalid retrieved_at")

  if (
    isValidDateString(record.publication_date) &&
    isValidDateString(record.retrieved_at) &&
    new Date(record.retrieved_at).getTime() < new Date(record.publication_date).getTime()
  ) {
    errors.push("retrieved_at cannot be earlier than publication_date")
  }

  if (!VALID_SOURCE_TYPES.includes(record.source_type)) {
    errors.push(`unknown source_type "${String(record.source_type)}"`)
  }
  if (!VALID_TRUST_TIERS.includes(record.trust_tier)) {
    errors.push(`unknown trust_tier "${String(record.trust_tier)}"`)
  }
  if (!VALID_SOURCE_STATUSES.includes(record.status)) {
    errors.push(`unknown status "${String(record.status)}"`)
  }

  if (!Array.isArray(record.topics)) {
    errors.push("missing topics array")
  }

  const v = record.verification
  if (!v) {
    errors.push("missing verification block")
  } else {
    if (v.url_checked !== true) errors.push("verification.url_checked must be true — a URL that was never checked is not evidence")
    if (v.title_matched !== true) errors.push("verification.title_matched must be true")
    if (v.publication_metadata_matched !== true) errors.push("verification.publication_metadata_matched must be true")
    if (!isValidDateString(v.verified_at)) errors.push("missing or invalid verification.verified_at")
    if (!isNonEmptyString(v.verification_method)) errors.push("missing verification.verification_method")

    const hasIdentifier = isNonEmptyString(record.doi) || isNonEmptyString(record.pmid) || isNonEmptyString(record.other_identifier)
    if (hasIdentifier && v.identifier_checked !== true) {
      errors.push("a durable identifier (doi/pmid/other_identifier) is present but verification.identifier_checked is not true")
    }
  }

  for (const [i, correction] of (record.corrections ?? []).entries()) {
    if (!isValidDateString(correction.published_at)) errors.push(`corrections[${i}] missing or invalid published_at`)
    if (!isNonEmptyString(correction.description)) errors.push(`corrections[${i}] missing description`)
    if (typeof correction.affects_existing_claims !== "boolean") {
      errors.push(`corrections[${i}] missing affects_existing_claims boolean — whether this correction was checked against citing claims must be explicit, not implied`)
    }
    if (!Array.isArray(correction.checked_claim_ids)) {
      errors.push(`corrections[${i}] missing checked_claim_ids array`)
    }
    if (!isValidDateString(correction.checked_at)) errors.push(`corrections[${i}] missing or invalid checked_at`)
  }

  return { valid: errors.length === 0, errors }
}

/** Pure: returns every source_id that appears more than once. Empty means the registry is clean. */
export function findDuplicateSourceIds(records: SourceRecord[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const record of records) {
    if (seen.has(record.source_id)) duplicates.add(record.source_id)
    seen.add(record.source_id)
  }
  return [...duplicates]
}

let cachedSources: SourceRecord[] | null = null

function loadSourcesFromDisk(): SourceRecord[] {
  if (cachedSources) return cachedSources

  let raw: string
  try {
    raw = readFileSync(REGISTRY_PATH, "utf8")
  } catch {
    cachedSources = []
    return cachedSources
  }

  const parsed = JSON.parse(raw) as SourceRegistryFile
  const sources = Array.isArray(parsed.sources) ? parsed.sources : []

  const duplicates = findDuplicateSourceIds(sources)
  if (duplicates.length > 0) {
    throw new Error(`[source-registry] Duplicate source_id value(s): ${duplicates.join(", ")}`)
  }

  for (const record of sources) {
    const { valid, errors } = validateSourceRecord(record)
    if (!valid) {
      throw new Error(`[source-registry] Invalid source record "${record.source_id ?? "(no id)"}": ${errors.join("; ")}`)
    }
  }

  cachedSources = sources
  return cachedSources
}

export function loadSources(): SourceRecord[] {
  return loadSourcesFromDisk()
}

export function getSource(sources: SourceRecord[], sourceId: string): SourceRecord | null {
  return sources.find((s) => s.source_id === sourceId) ?? null
}
