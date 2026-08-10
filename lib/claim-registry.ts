// V5 Stage 3 (Issue #16): atomic claim registry.
//
// A claim here must be the smallest independently assessable factual
// proposition — never a whole paragraph's worth of assertions bundled
// together. Bad: "GLP-1 medications are safe and effective for weight
// loss." Good: "Semaglutide 2.4 mg produced greater mean body-weight
// reduction than placebo at 68 weeks in STEP 1."
//
// The claim-source contract enforced here: every claim must have at
// least one mapped, real source_id (source -> claim is one-directional;
// a claim is never used to retroactively justify inventing a source). A
// claim classified "established" needs at least one Tier A/B primary
// source; if it also carries high/critical YMYL risk, that primary
// source must be Tier A specifically — a generic homepage or a Tier C/D
// source can never carry an "established," high-risk medical claim.

import { readFileSync } from "node:fs"
import path from "node:path"
import { isValidDateString } from "./date-validation"
import type { SourceRecord } from "./source-registry"
import {
  hasQualifyingActivePrimarySupport,
  isActiveSource,
  requiredActiveTierForRisk,
  VALID_YMYL_RISKS,
  type YmylRisk,
} from "./evidence-support-policy"

// YmylRisk now lives in ./evidence-support-policy (so that module can
// define the shared active-support policy without importing back from
// here). Re-exported unchanged so every existing import of YmylRisk /
// VALID_YMYL_RISKS from "./claim-registry" keeps working.
export type { YmylRisk }
export { VALID_YMYL_RISKS }

export type ClaimType =
  | "definition"
  | "mechanism"
  | "efficacy"
  | "safety"
  | "contraindication"
  | "prevalence"
  | "statistical_result"
  | "association"
  | "recommendation"
  | "regulatory_status"
  | "eligibility"
  | "dosing"
  | "interaction"
  | "behavioral"
  | "nutrition"
  | "physiology"
  | "other"

export type ClaimClassification = "established" | "qualified" | "preliminary" | "uncertain" | "disputed" | "superseded"

export type DecayClass =
  | "regulatory_drug_access" // 30-90 days
  | "medication_safety_active" // 90 days
  | "clinical_efficacy" // 6-12 months
  | "nutrition_physiology" // 12-24 months
  | "basic_definition" // 24+ months
  | "custom" // per-claim override; review_due_at is authoritative regardless of category default

export const VALID_CLAIM_TYPES: ClaimType[] = [
  "definition",
  "mechanism",
  "efficacy",
  "safety",
  "contraindication",
  "prevalence",
  "statistical_result",
  "association",
  "recommendation",
  "regulatory_status",
  "eligibility",
  "dosing",
  "interaction",
  "behavioral",
  "nutrition",
  "physiology",
  "other",
]

export const VALID_CLASSIFICATIONS: ClaimClassification[] = [
  "established",
  "qualified",
  "preliminary",
  "uncertain",
  "disputed",
  "superseded",
]

export const VALID_DECAY_CLASSES: DecayClass[] = [
  "regulatory_drug_access",
  "medication_safety_active",
  "clinical_efficacy",
  "nutrition_physiology",
  "basic_definition",
  "custom",
]

/** Suggested maximum days-until-review-due per decay class, per Issue #16. Advisory only — review_due_at on the record is authoritative. */
export const DECAY_CLASS_MAX_DAYS: Record<DecayClass, number | null> = {
  regulatory_drug_access: 90,
  medication_safety_active: 90,
  clinical_efficacy: 365,
  nutrition_physiology: 730,
  basic_definition: null,
  custom: null,
}

export interface StatisticalDetail {
  value: number
  unit: string
  measure_type: string
  population: string
  sample_size?: number
  confidence_interval?: string
  comparison?: string
  time_point?: string
  source_location: string
}

export interface TrialDetail {
  trial_name?: string
  registration_id?: string
  population: string
  sample_size: number
  intervention: string
  dose?: string
  duration: string
  primary_endpoint: string
  result: string
  major_exclusions?: string[]
  /** Must be one of the claim's own source_ids — the trial's own primary publication, not a secondary mention. */
  primary_publication_source_id: string
  regulatory_relationship?: string
}

export interface ClaimRecord {
  claim_id: string
  canonical_claim: string
  claim_type: ClaimType
  classification: ClaimClassification
  ymyl_risk: YmylRisk
  source_ids: string[]
  primary_source_ids: string[]
  support_strength: string
  population?: string
  intervention_or_exposure?: string
  comparator?: string
  outcome?: string
  timeframe?: string
  jurisdiction?: string
  limitations?: string[]
  confounders?: string[]
  allowed_wording?: string[]
  required_qualifiers?: string[]
  prohibited_wording?: string[]
  medical_advice_boundary?: string
  last_verified_at: string
  review_due_at: string
  decay_class: DecayClass
  superseded_by_claim_id?: string
  statistical_detail?: StatisticalDetail
  trial_detail?: TrialDetail
  notes?: string
}

interface ClaimRegistryFile {
  schema_version: number
  claims: ClaimRecord[]
}

const REGISTRY_PATH = path.join(process.cwd(), "content", "claims", "registry.json")

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Validates a single claim record against the source registry it cites.
 * Pure — takes the already-loaded sources array as a parameter, so it is
 * directly unit-testable against fixtures without touching the
 * filesystem.
 */
export function validateClaimRecord(record: ClaimRecord, sources: SourceRecord[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(record.claim_id)) errors.push("missing claim_id")
  if (!isNonEmptyString(record.canonical_claim)) errors.push("missing canonical_claim")

  if (!VALID_CLAIM_TYPES.includes(record.claim_type)) errors.push(`unknown claim_type "${String(record.claim_type)}"`)
  if (!VALID_CLASSIFICATIONS.includes(record.classification)) {
    errors.push(`unknown classification "${String(record.classification)}"`)
  }
  if (!VALID_YMYL_RISKS.includes(record.ymyl_risk)) errors.push(`unknown ymyl_risk "${String(record.ymyl_risk)}"`)
  if (!VALID_DECAY_CLASSES.includes(record.decay_class)) errors.push(`unknown decay_class "${String(record.decay_class)}"`)

  if (!isNonEmptyString(record.support_strength)) errors.push("missing support_strength")

  if (!isValidDateString(record.last_verified_at)) errors.push("missing or invalid last_verified_at")
  if (!isValidDateString(record.review_due_at)) errors.push("missing or invalid review_due_at")
  if (
    isValidDateString(record.last_verified_at) &&
    isValidDateString(record.review_due_at) &&
    new Date(record.review_due_at).getTime() <= new Date(record.last_verified_at).getTime()
  ) {
    errors.push("review_due_at must be after last_verified_at")
  }

  // The claim-source contract: every claim, regardless of type, requires
  // at least one mapped source. An unsourced atomic claim is inherently
  // invalid — there is no claim_type exempt from this.
  if (!Array.isArray(record.source_ids) || record.source_ids.length === 0) {
    errors.push("claim has zero mapped source_ids — every claim must cite at least one real source")
  }

  if (!Array.isArray(record.primary_source_ids) || record.primary_source_ids.length === 0) {
    errors.push("claim has zero primary_source_ids")
  }

  const sourceIds = Array.isArray(record.source_ids) ? record.source_ids : []
  const primaryIds = Array.isArray(record.primary_source_ids) ? record.primary_source_ids : []

  const resolvedSources: SourceRecord[] = []
  for (const id of sourceIds) {
    const src = sources.find((s) => s.source_id === id)
    if (!src) {
      errors.push(`source_ids references unknown source_id "${id}"`)
    } else {
      resolvedSources.push(src)
    }
  }

  for (const id of primaryIds) {
    if (!sourceIds.includes(id)) {
      errors.push(`primary_source_ids entry "${id}" is not also present in source_ids`)
    }
  }

  const resolvedPrimarySources = primaryIds
    .map((id) => sources.find((s) => s.source_id === id))
    .filter((s): s is SourceRecord => Boolean(s))

  // A generic homepage/organization citation is never sufficient for a
  // statistical/mechanistic result: the claim's own statistical_detail
  // (when present) must name where in the source the number actually
  // lives, which a homepage citation structurally cannot satisfy.
  if (record.claim_type === "statistical_result") {
    const sd = record.statistical_detail
    if (!sd) {
      errors.push("claim_type statistical_result requires a statistical_detail block")
    } else {
      if (typeof sd.value !== "number" || Number.isNaN(sd.value)) errors.push("statistical_detail.value must be a number")
      if (!isNonEmptyString(sd.unit)) errors.push("missing statistical_detail.unit")
      if (!isNonEmptyString(sd.measure_type)) errors.push("missing statistical_detail.measure_type")
      if (!isNonEmptyString(sd.population)) errors.push("missing statistical_detail.population")
      if (!isNonEmptyString(sd.source_location)) errors.push("missing statistical_detail.source_location")
    }
  }

  if (record.trial_detail) {
    const td = record.trial_detail
    if (!isNonEmptyString(td.population)) errors.push("missing trial_detail.population")
    if (typeof td.sample_size !== "number" || td.sample_size <= 0) errors.push("trial_detail.sample_size must be a positive number")
    if (!isNonEmptyString(td.intervention)) errors.push("missing trial_detail.intervention")
    if (!isNonEmptyString(td.duration)) errors.push("missing trial_detail.duration")
    if (!isNonEmptyString(td.primary_endpoint)) errors.push("missing trial_detail.primary_endpoint")
    if (!isNonEmptyString(td.result)) errors.push("missing trial_detail.result")
    if (!isNonEmptyString(td.primary_publication_source_id)) {
      errors.push("missing trial_detail.primary_publication_source_id")
    } else if (!sourceIds.includes(td.primary_publication_source_id)) {
      errors.push("trial_detail.primary_publication_source_id must be one of the claim's own source_ids")
    }
  }

  // classification/ymyl_risk vs. trust-tier gate — delegated to the
  // shared policy in lib/evidence-support-policy.ts so this rule cannot
  // silently drift from the one findHighRiskClaimsLackingCurrentPrimarySupport
  // (lib/evidence-dependency-audit.ts) applies at dependency-audit time.
  {
    if (record.classification === "established") {
      const requiredTier = requiredActiveTierForRisk(record.ymyl_risk)
      if (!hasQualifyingActivePrimarySupport(primaryIds, sources, requiredTier)) {
        errors.push(
          `classification "established" with ymyl_risk "${record.ymyl_risk}" requires at least one primary source that is ` +
            `both currently active (not superseded/retracted/unavailable) and at least Tier ${requiredTier}`,
        )
      }
    }

    // A source that is no longer active (superseded/retracted/unavailable)
    // can never be the sole primary support for an active (non-superseded)
    // high/critical-risk claim — even if it was Tier A when first cited.
    if (
      record.classification !== "superseded" &&
      (record.ymyl_risk === "high" || record.ymyl_risk === "critical") &&
      resolvedPrimarySources.length > 0 &&
      resolvedPrimarySources.every((s) => !isActiveSource(s))
    ) {
      errors.push(
        "every primary source for this active, high/critical-risk claim is no longer active (superseded/retracted/unavailable) — the claim has lost its support",
      )
    }
  }

  return { valid: errors.length === 0, errors }
}

/** Pure: returns every claim_id that appears more than once. Empty means the registry is clean. */
export function findDuplicateClaimIds(records: ClaimRecord[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const record of records) {
    if (seen.has(record.claim_id)) duplicates.add(record.claim_id)
    seen.add(record.claim_id)
  }
  return [...duplicates]
}

let cachedClaims: ClaimRecord[] | null = null

function loadClaimsFromDisk(sources: SourceRecord[]): ClaimRecord[] {
  if (cachedClaims) return cachedClaims

  let raw: string
  try {
    raw = readFileSync(REGISTRY_PATH, "utf8")
  } catch {
    cachedClaims = []
    return cachedClaims
  }

  const parsed = JSON.parse(raw) as ClaimRegistryFile
  const claims = Array.isArray(parsed.claims) ? parsed.claims : []

  const duplicates = findDuplicateClaimIds(claims)
  if (duplicates.length > 0) {
    throw new Error(`[claim-registry] Duplicate claim_id value(s): ${duplicates.join(", ")}`)
  }

  for (const record of claims) {
    const { valid, errors } = validateClaimRecord(record, sources)
    if (!valid) {
      throw new Error(`[claim-registry] Invalid claim record "${record.claim_id ?? "(no id)"}": ${errors.join("; ")}`)
    }
  }

  cachedClaims = claims
  return cachedClaims
}

export function loadClaims(sources: SourceRecord[]): ClaimRecord[] {
  return loadClaimsFromDisk(sources)
}

export function getClaim(claims: ClaimRecord[], claimId: string): ClaimRecord | null {
  return claims.find((c) => c.claim_id === claimId) ?? null
}
