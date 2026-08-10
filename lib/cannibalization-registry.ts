// V5 Stage 4 (Issue #17): cannibalization cluster registry.
//
// A cluster is never inferred from title similarity alone — each record
// here reflects an actual comparison of canonical reader question, reader
// intent/stage, claim set, outline, query cluster, and reader outcome
// across the member articles (see STAGE4_LEGACY_CORPUS_AUDIT.md section
// 11 for the specific comparison performed for each cluster below).

import { readFileSync } from "node:fs"
import path from "node:path"
import type { ManifestArticleEntry } from "./content-registry"

export type OverlapConfidence = "low" | "medium" | "high"

export const VALID_OVERLAP_CONFIDENCES: OverlapConfidence[] = ["low", "medium", "high"]

export type CannibalizationRecommendedAction =
  | "keep_both_distinct"
  | "merge"
  | "differentiate_and_keep_both"
  | "redirect_one"
  | "needs_further_review"

export const VALID_RECOMMENDED_ACTIONS: CannibalizationRecommendedAction[] = [
  "keep_both_distinct",
  "merge",
  "differentiate_and_keep_both",
  "redirect_one",
  "needs_further_review",
]

export interface CannibalizationCluster {
  cluster_id: string
  article_slugs: string[]
  shared_question: string
  overlap_dimensions: string[]
  meaningful_differences: string[]
  recommended_survivor_slug?: string
  recommended_action: CannibalizationRecommendedAction
  confidence: OverlapConfidence
  notes?: string
}

interface CannibalizationRegistryFile {
  schema_version: number
  clusters: CannibalizationCluster[]
}

const REGISTRY_PATH = path.join(process.cwd(), "content", "audits", "stage4", "cannibalization.json")

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export function validateCannibalizationCluster(
  record: CannibalizationCluster,
  manifestArticles: ManifestArticleEntry[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(record.cluster_id)) errors.push("missing cluster_id")
  if (!isNonEmptyString(record.shared_question)) errors.push("missing shared_question")

  if (!Array.isArray(record.article_slugs) || record.article_slugs.length < 2) {
    errors.push("article_slugs must list at least two articles — a cluster of one is not cannibalization")
  } else {
    for (const slug of record.article_slugs) {
      if (!manifestArticles.some((a) => a.slug === slug)) {
        errors.push(`article_slugs references unknown slug "${slug}"`)
      }
    }
  }

  if (!Array.isArray(record.overlap_dimensions) || record.overlap_dimensions.length === 0) {
    errors.push("missing overlap_dimensions — a cluster must name what was actually compared (question/intent/claims/outline/query/outcome)")
  }
  if (!Array.isArray(record.meaningful_differences)) {
    errors.push("missing meaningful_differences array (may be empty if genuinely none were found)")
  }

  if (!VALID_RECOMMENDED_ACTIONS.includes(record.recommended_action)) {
    errors.push(`unknown recommended_action "${String(record.recommended_action)}"`)
  }
  if (!VALID_OVERLAP_CONFIDENCES.includes(record.confidence)) {
    errors.push(`unknown confidence "${String(record.confidence)}"`)
  }

  if (record.recommended_survivor_slug && Array.isArray(record.article_slugs) && !record.article_slugs.includes(record.recommended_survivor_slug)) {
    errors.push(`recommended_survivor_slug "${record.recommended_survivor_slug}" is not one of this cluster's own article_slugs`)
  }
  if (record.recommended_action === "merge" && !isNonEmptyString(record.recommended_survivor_slug)) {
    errors.push('recommended_action "merge" requires recommended_survivor_slug')
  }

  return { valid: errors.length === 0, errors }
}

export function findDuplicateClusterIds(records: CannibalizationCluster[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const record of records) {
    if (seen.has(record.cluster_id)) duplicates.add(record.cluster_id)
    seen.add(record.cluster_id)
  }
  return [...duplicates]
}

let cachedClusters: CannibalizationCluster[] | null = null

function loadCannibalizationClustersFromDisk(manifestArticles: ManifestArticleEntry[]): CannibalizationCluster[] {
  if (cachedClusters) return cachedClusters

  let raw: string
  try {
    raw = readFileSync(REGISTRY_PATH, "utf8")
  } catch {
    cachedClusters = []
    return cachedClusters
  }

  const parsed = JSON.parse(raw) as CannibalizationRegistryFile
  const clusters = Array.isArray(parsed.clusters) ? parsed.clusters : []

  const duplicates = findDuplicateClusterIds(clusters)
  if (duplicates.length > 0) {
    throw new Error(`[cannibalization-registry] Duplicate cluster_id value(s): ${duplicates.join(", ")}`)
  }

  for (const record of clusters) {
    const { valid, errors } = validateCannibalizationCluster(record, manifestArticles)
    if (!valid) {
      throw new Error(`[cannibalization-registry] Invalid cluster "${record.cluster_id ?? "(no id)"}": ${errors.join("; ")}`)
    }
  }

  cachedClusters = clusters
  return cachedClusters
}

export function loadCannibalizationClusters(manifestArticles: ManifestArticleEntry[]): CannibalizationCluster[] {
  return loadCannibalizationClustersFromDisk(manifestArticles)
}

export function getClusterIds(clusters: CannibalizationCluster[]): Set<string> {
  return new Set(clusters.map((c) => c.cluster_id))
}
