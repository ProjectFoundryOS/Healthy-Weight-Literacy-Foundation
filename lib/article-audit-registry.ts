// V5 Stage 4 (Issue #17): legacy article corpus audit registry.
//
// This registry records the audit and disposition of every currently
// published article — it does NOT rewrite article prose. Article bodies
// stay in content/snapshot/articles/**, frozen exactly as Stage 1 left
// them; this module only ever reads that snapshot (via content-registry's
// manifest) to check that an audit record still refers to the exact
// revision it was performed against.
//
// Mirrors the established pattern from lib/claim-registry.ts et al.: a
// pure validator that takes already-loaded arrays (so it is directly
// unit-testable), plus a thin real-file loader.
//
// Hard rule inherited from CLAUDE_CONTENT_FACTORY_V5.md: an AI audit is
// not an editorial_review, clinical_evidence_review, or
// licensed_medical_review. Nothing in this module writes to
// content/reviews/registry.json or content/reviews/verified-reviewers.json,
// and no field here should ever be read as if it were one of those review
// types.

import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { isValidDateString } from "./date-validation"
import type { ClaimRecord, ClaimType } from "./claim-registry"
import type { SourceRecord } from "./source-registry"
import type { ManifestArticleEntry } from "./content-registry"
import type { ReaderStage } from "./topic-registry"
import type { YmylRisk } from "./evidence-support-policy"

export type Disposition = "KEEP" | "REFRESH" | "MERGE" | "REDIRECT" | "NOINDEX" | "RETIRE"

export const VALID_DISPOSITIONS: Disposition[] = ["KEEP", "REFRESH", "MERGE", "REDIRECT", "NOINDEX", "RETIRE"]

export type RewritePriority = "P0" | "P1" | "P2" | "none"

export const VALID_REWRITE_PRIORITIES: RewritePriority[] = ["P0", "P1", "P2", "none"]

export type ClaimMappingStatus =
  | "mapped_existing_claim"
  | "new_verified_claim"
  | "unsupported"
  | "outdated"
  | "overbroad"
  | "mis_scoped"
  | "contradicted"
  | "needs_semantic_review"

export const VALID_CLAIM_MAPPING_STATUSES: ClaimMappingStatus[] = [
  "mapped_existing_claim",
  "new_verified_claim",
  "unsupported",
  "outdated",
  "overbroad",
  "mis_scoped",
  "contradicted",
  "needs_semantic_review",
]

export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical"

export const VALID_FINDING_SEVERITIES: FindingSeverity[] = ["info", "low", "medium", "high", "critical"]

/** Mapping statuses that represent a genuine, currently-unresolved evidence problem with the claim as stated. */
const PROBLEM_MAPPING_STATUSES: ClaimMappingStatus[] = ["unsupported", "contradicted"]

export type AdGrantFit = "high" | "medium" | "low" | "not_suitable"

export const VALID_AD_GRANT_FITS: AdGrantFit[] = ["high", "medium", "low", "not_suitable"]

export type AuthorType = "organization" | "human" | "unknown"

export const VALID_AUTHOR_TYPES: AuthorType[] = ["organization", "human", "unknown"]

export interface ArticleClaimAudit {
  article_claim_id: string
  proposition: string
  claim_type: ClaimType
  ymyl_risk: YmylRisk
  mapping_status: ClaimMappingStatus
  registry_claim_id?: string
  source_ids?: string[]
  article_location: string
  severity: FindingSeverity
  recommended_action: string
}

export interface EvidenceSummary {
  material_claim_count: number
  mapped_claim_count: number
  unsupported_count: number
  outdated_count: number
  overbroad_count: number
  high_or_critical_findings: number
}

export interface ArticleScores {
  reader_intent: number
  evidence_quality: number
  claim_traceability: number
  ymyl_safety: number
  freshness: number
  trust_integrity: number
  cannibalization_distinctness: number
  usefulness: number
  internal_linking: number
  ad_grant_fit: number
  total: number
}

/** Max points per rubric category — see STAGE4_LEGACY_CORPUS_AUDIT.md section 4. */
export const SCORE_WEIGHTS: Record<keyof Omit<ArticleScores, "total">, number> = {
  reader_intent: 10,
  evidence_quality: 15,
  claim_traceability: 15,
  ymyl_safety: 15,
  freshness: 10,
  trust_integrity: 10,
  cannibalization_distinctness: 10,
  usefulness: 5,
  internal_linking: 5,
  ad_grant_fit: 5,
}

export interface AuthorshipAudit {
  current_visible_author: string
  author_type: AuthorType
  consistency_issue: boolean
  recommended_normalized_author?: string
}

export interface InternalLinkRecommendation {
  target_slug: string
  reason: string
  reader_stage: ReaderStage
}

export interface EvidenceRegistryRevision {
  source_registry_revision: string
  claim_registry_revision: string
}

export interface ArticleAuditRecord {
  audit_id: string
  slug: string
  snapshot_hash: string
  audited_at: string
  audit_version: string

  title: string
  category: string
  authorship: AuthorshipAudit

  primary_question: string
  reader_intent: string
  reader_stage: ReaderStage
  desired_reader_outcome: string

  ymyl_class: YmylRisk
  medical_risk: YmylRisk
  decay_class: string

  claims: ArticleClaimAudit[]

  evidence_summary: EvidenceSummary

  scores: ArticleScores

  cannibalization_cluster_ids: string[]

  internal_link_recommendations: InternalLinkRecommendation[]

  ad_grant_fit: AdGrantFit

  disposition: Disposition
  disposition_reason: string

  merge_target_slug?: string
  redirect_target_slug?: string

  rewrite_priority: RewritePriority

  blocking_findings: string[]
  required_research: string[]
  recommended_rewrite_scope: string[]

  safety_language_findings: string[]

  evidence_registry_revision: EvidenceRegistryRevision

  notes?: string
}

interface ArticleAuditManifestEntry {
  slug: string
  audit_id: string
  snapshot_hash: string
}

interface ArticleAuditManifestFile {
  schema_version: number
  audit_version: string
  generated_at: string
  article_count: number
  articles: ArticleAuditManifestEntry[]
}

const AUDIT_ROOT = path.join(process.cwd(), "content", "audits", "stage4")
const MANIFEST_PATH = path.join(AUDIT_ROOT, "manifest.json")
const ARTICLES_DIR = path.join(AUDIT_ROOT, "articles")

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Validates a single article audit record against the frozen article
 * snapshot manifest and the evidence registries it cites. Pure — takes
 * already-loaded arrays/maps, so it is directly unit-testable.
 */
export function validateArticleAuditRecord(
  record: ArticleAuditRecord,
  manifestArticles: ManifestArticleEntry[],
  claims: ClaimRecord[],
  sources: SourceRecord[],
  knownClusterIds: Set<string>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(record.audit_id)) errors.push("missing audit_id")
  if (!isNonEmptyString(record.slug)) errors.push("missing slug")
  if (!isNonEmptyString(record.snapshot_hash)) errors.push("missing snapshot_hash")
  if (!isValidDateString(record.audited_at)) errors.push("missing or invalid audited_at")
  if (!isNonEmptyString(record.audit_version)) errors.push("missing audit_version")
  if (!isNonEmptyString(record.title)) errors.push("missing title")
  if (!isNonEmptyString(record.primary_question)) errors.push("missing primary_question")
  if (!isNonEmptyString(record.disposition_reason)) errors.push("missing disposition_reason")

  const manifestEntry = manifestArticles.find((a) => a.slug === record.slug)
  if (!manifestEntry) {
    errors.push(`references unknown slug "${record.slug}" — not present in the published article manifest`)
  } else if (manifestEntry.sha256 !== record.snapshot_hash) {
    errors.push(
      `snapshot hash mismatch for "${record.slug}": audit recorded "${record.snapshot_hash}" but the frozen manifest currently has "${manifestEntry.sha256}" — this article's audit is stale and must be redone against the current revision`,
    )
  }

  if (!VALID_DISPOSITIONS.includes(record.disposition)) {
    errors.push(`unknown disposition "${String(record.disposition)}"`)
  }
  if (!VALID_REWRITE_PRIORITIES.includes(record.rewrite_priority)) {
    errors.push(`unknown rewrite_priority "${String(record.rewrite_priority)}"`)
  }
  if (!VALID_AD_GRANT_FITS.includes(record.ad_grant_fit)) {
    errors.push(`unknown ad_grant_fit "${String(record.ad_grant_fit)}"`)
  }

  if (record.disposition === "MERGE" && !isNonEmptyString(record.merge_target_slug)) {
    errors.push('disposition "MERGE" requires merge_target_slug')
  }
  if (record.disposition === "REDIRECT" && !isNonEmptyString(record.redirect_target_slug)) {
    errors.push('disposition "REDIRECT" requires redirect_target_slug')
  }
  if (record.disposition === "RETIRE" && (!isNonEmptyString(record.disposition_reason) || record.disposition_reason.trim().length < 20)) {
    errors.push('disposition "RETIRE" requires a substantive disposition_reason (published-article retirement cannot be unexplained)')
  }

  // A KEEP disposition can never coexist with an unresolved high/critical
  // evidence blocker — regardless of how high the numeric score is. This
  // is the mechanical enforcement of "a high score can't compensate for a
  // serious medical-evidence problem."
  const hasUnresolvedHighRiskBlocker = record.claims.some(
    (c) => (c.severity === "high" || c.severity === "critical") && PROBLEM_MAPPING_STATUSES.includes(c.mapping_status),
  )
  if (record.disposition === "KEEP" && (hasUnresolvedHighRiskBlocker || record.blocking_findings.length > 0)) {
    errors.push('disposition "KEEP" is not allowed while blocking_findings is non-empty or a claim has an unresolved high/critical evidence problem')
  }

  for (const [i, claim] of record.claims.entries()) {
    if (!isNonEmptyString(claim.article_claim_id)) errors.push(`claims[${i}] missing article_claim_id`)
    if (!isNonEmptyString(claim.proposition)) errors.push(`claims[${i}] missing proposition`)
    if (!isNonEmptyString(claim.article_location)) errors.push(`claims[${i}] missing article_location`)
    if (!isNonEmptyString(claim.recommended_action)) errors.push(`claims[${i}] missing recommended_action`)
    if (!VALID_CLAIM_MAPPING_STATUSES.includes(claim.mapping_status)) {
      errors.push(`claims[${i}] unknown mapping_status "${String(claim.mapping_status)}"`)
    }
    if (!VALID_FINDING_SEVERITIES.includes(claim.severity)) {
      errors.push(`claims[${i}] unknown severity "${String(claim.severity)}"`)
    }

    if (claim.registry_claim_id) {
      if (!claims.some((c) => c.claim_id === claim.registry_claim_id)) {
        errors.push(`claims[${i}] references unknown claim_id "${claim.registry_claim_id}"`)
      }
    }
    if (claim.mapping_status === "mapped_existing_claim" && !claim.registry_claim_id) {
      errors.push(`claims[${i}] mapping_status "mapped_existing_claim" requires registry_claim_id`)
    }

    for (const srcId of claim.source_ids ?? []) {
      if (!sources.some((s) => s.source_id === srcId)) {
        errors.push(`claims[${i}] references unknown source_id "${srcId}"`)
      }
    }
  }

  for (const clusterId of record.cannibalization_cluster_ids) {
    if (!knownClusterIds.has(clusterId)) {
      errors.push(`cannibalization_cluster_ids references unknown cluster_id "${clusterId}"`)
    }
  }

  const weights = SCORE_WEIGHTS
  let computedTotal = 0
  for (const key of Object.keys(weights) as (keyof typeof weights)[]) {
    const value = record.scores[key]
    if (typeof value !== "number" || value < 0 || value > weights[key]) {
      errors.push(`scores.${key} must be a number between 0 and ${weights[key]}`)
    } else {
      computedTotal += value
    }
  }
  if (record.scores.total !== computedTotal) {
    errors.push(`scores.total (${record.scores.total}) does not equal the sum of its category scores (${computedTotal})`)
  }

  if (!record.evidence_registry_revision || !isNonEmptyString(record.evidence_registry_revision.source_registry_revision)) {
    errors.push("missing evidence_registry_revision.source_registry_revision")
  }
  if (!record.evidence_registry_revision || !isNonEmptyString(record.evidence_registry_revision.claim_registry_revision)) {
    errors.push("missing evidence_registry_revision.claim_registry_revision")
  }

  return { valid: errors.length === 0, errors }
}

/** Pure: returns every audit_id (and, separately, every slug) that appears more than once. */
export function findDuplicateAuditIds(records: ArticleAuditRecord[]): { duplicateAuditIds: string[]; duplicateSlugs: string[] } {
  const seenIds = new Set<string>()
  const dupIds = new Set<string>()
  const seenSlugs = new Set<string>()
  const dupSlugs = new Set<string>()

  for (const record of records) {
    if (seenIds.has(record.audit_id)) dupIds.add(record.audit_id)
    seenIds.add(record.audit_id)
    if (seenSlugs.has(record.slug)) dupSlugs.add(record.slug)
    seenSlugs.add(record.slug)
  }

  return { duplicateAuditIds: [...dupIds], duplicateSlugs: [...dupSlugs] }
}

/** Pure: every published-article slug in the manifest that has no corresponding audit record. */
export function findMissingAudits(manifestArticles: ManifestArticleEntry[], records: ArticleAuditRecord[]): string[] {
  const auditedSlugs = new Set(records.map((r) => r.slug))
  return manifestArticles.filter((a) => a.is_published && !auditedSlugs.has(a.slug)).map((a) => a.slug)
}

let cachedAudits: ArticleAuditRecord[] | null = null

function loadArticleAuditsFromDisk(
  manifestArticles: ManifestArticleEntry[],
  claims: ClaimRecord[],
  sources: SourceRecord[],
  knownClusterIds: Set<string>,
): ArticleAuditRecord[] {
  if (cachedAudits) return cachedAudits

  let manifestRaw: string
  try {
    manifestRaw = readFileSync(MANIFEST_PATH, "utf8")
  } catch {
    cachedAudits = []
    return cachedAudits
  }

  const manifest = JSON.parse(manifestRaw) as ArticleAuditManifestFile
  const entries = Array.isArray(manifest.articles) ? manifest.articles : []

  const records: ArticleAuditRecord[] = []
  for (const entry of entries) {
    const filePath = path.join(ARTICLES_DIR, `${entry.slug}.json`)
    const raw = readFileSync(filePath, "utf8")
    records.push(JSON.parse(raw) as ArticleAuditRecord)
  }

  const { duplicateAuditIds, duplicateSlugs } = findDuplicateAuditIds(records)
  if (duplicateAuditIds.length > 0) {
    throw new Error(`[article-audit-registry] Duplicate audit_id value(s): ${duplicateAuditIds.join(", ")}`)
  }
  if (duplicateSlugs.length > 0) {
    throw new Error(`[article-audit-registry] Duplicate audit slug value(s): ${duplicateSlugs.join(", ")}`)
  }

  const missing = findMissingAudits(manifestArticles, records)
  if (missing.length > 0) {
    throw new Error(`[article-audit-registry] Published article(s) with no audit record: ${missing.join(", ")}`)
  }

  for (const record of records) {
    const { valid, errors } = validateArticleAuditRecord(record, manifestArticles, claims, sources, knownClusterIds)
    if (!valid) {
      throw new Error(`[article-audit-registry] Invalid audit record for "${record.slug}": ${errors.join("; ")}`)
    }
  }

  cachedAudits = records
  return cachedAudits
}

export function loadArticleAudits(
  manifestArticles: ManifestArticleEntry[],
  claims: ClaimRecord[],
  sources: SourceRecord[],
  knownClusterIds: Set<string>,
): ArticleAuditRecord[] {
  return loadArticleAuditsFromDisk(manifestArticles, claims, sources, knownClusterIds)
}

export function getArticleAudit(records: ArticleAuditRecord[], slug: string): ArticleAuditRecord | null {
  return records.find((r) => r.slug === slug) ?? null
}

/** Test/audit helper: lists the audit JSON filenames actually present on disk, for cross-checking against the manifest. */
export function listAuditArticleFiles(): string[] {
  try {
    return readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json"))
  } catch {
    return []
  }
}
