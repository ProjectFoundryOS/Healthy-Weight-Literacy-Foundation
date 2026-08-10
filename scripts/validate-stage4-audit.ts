// V5 Stage 4 (Issue #17): legacy article corpus audit gate.
//
// Validates the three Stage 4 registries (article audits, cannibalization
// clusters, unpublished-row summary) against each other and against the
// live source/claim/manifest registries, then independently recomputes
// content/audits/stage4/corpus-summary.json from the same source-of-truth
// files and fails if the committed summary has drifted from them — the
// summary is a derived report, never a second source of truth.
//
// This is deliberately a separate command from validate:evidence-all
// (Stage 3's gate) because it depends on the Stage 3 registries plus the
// frozen article snapshot manifest; it is chained as an additional step
// at the end of validate-evidence-all.ts so both run before every build.

import { getManifestArticles } from "../lib/content-registry"
import { loadSources } from "../lib/source-registry"
import { loadClaims } from "../lib/claim-registry"
import {
  loadCannibalizationClusters,
  getClusterIds,
  type CannibalizationRecommendedAction,
} from "../lib/cannibalization-registry"
import {
  loadArticleAudits,
  findMissingAudits,
  type ArticleAuditRecord,
  type Disposition,
  type RewritePriority,
  type AdGrantFit,
  type ClaimMappingStatus,
  type FindingSeverity,
} from "../lib/article-audit-registry"
import { loadUnpublishedRowAudits, type UnpublishedDisposition } from "../lib/unpublished-audit-registry"
import { readFileSync } from "node:fs"
import path from "node:path"

const CORPUS_SUMMARY_PATH = path.join(process.cwd(), "content", "audits", "stage4", "corpus-summary.json")

function countBy<T extends string>(values: T[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1
  return counts
}

function shallowRecordEqual(a: Record<string, number>, b: Record<string, number>): string[] {
  const errors: string[] = []
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const av = a[key] ?? 0
    const bv = b[key] ?? 0
    if (av !== bv) errors.push(`"${key}": expected ${av}, summary has ${bv}`)
  }
  return errors
}

function main() {
  console.log("Validating Stage 4 legacy corpus audit registry...\n")

  let failures = 0
  const fail = (msg: string) => {
    failures++
    console.error(`FAIL ${msg}`)
  }

  const manifestArticles = getManifestArticles()
  const publishedCount = manifestArticles.filter((a) => a.is_published).length

  const sources = loadSources()
  const claims = loadClaims(sources)

  // --- cannibalization clusters ---
  let clusters: ReturnType<typeof loadCannibalizationClusters> = []
  try {
    clusters = loadCannibalizationClusters(manifestArticles)
    console.log(`OK   cannibalization.json: ${clusters.length} cluster(s), all internally valid`)
  } catch (err) {
    fail(`cannibalization.json: ${(err as Error).message}`)
  }
  const clusterIds = getClusterIds(clusters)

  // --- article audits ---
  let audits: ArticleAuditRecord[] = []
  try {
    audits = loadArticleAudits(manifestArticles, claims, sources, clusterIds)
    console.log(`OK   article audits: ${audits.length} record(s), all internally valid against manifest/claims/sources/clusters`)
  } catch (err) {
    fail(`article audits: ${(err as Error).message}`)
  }

  if (audits.length > 0) {
    const missing = findMissingAudits(manifestArticles, audits)
    if (missing.length > 0) {
      fail(`published article(s) missing an audit record: ${missing.join(", ")}`)
    }
    if (audits.length !== publishedCount) {
      fail(`audit record count (${audits.length}) does not equal published article count (${publishedCount})`)
    }
  }

  // --- unpublished row audits ---
  let unpublishedRows: ReturnType<typeof loadUnpublishedRowAudits> = []
  try {
    unpublishedRows = loadUnpublishedRowAudits()
    console.log(`OK   unpublished-summary.json: ${unpublishedRows.length} row(s), all internally valid`)
  } catch (err) {
    fail(`unpublished-summary.json: ${(err as Error).message}`)
  }

  // Privacy gate: this registry must never carry a body/title field. This
  // check is deliberately mechanical (property-name based) so an
  // accidental future field addition is caught even though the current
  // UnpublishedRowAudit type has no such field to begin with.
  for (const row of unpublishedRows as unknown as Record<string, unknown>[]) {
    for (const forbiddenKey of ["title", "content", "body", "draft_body", "raw_content"]) {
      if (forbiddenKey in row) {
        fail(`unpublished-summary.json row "${String((row as { slug?: string }).slug)}" carries a forbidden "${forbiddenKey}" field — unpublished draft bodies/titles must never be committed`)
      }
    }
  }

  if (failures > 0) {
    console.log(`\n${failures} failure(s) before corpus-summary cross-check — stopping (fail fast).`)
    process.exit(1)
  }

  // --- corpus-summary.json cross-check: recompute from source-of-truth, diff against committed file ---
  let summary: any
  try {
    summary = JSON.parse(readFileSync(CORPUS_SUMMARY_PATH, "utf8"))
  } catch (err) {
    fail(`content/audits/stage4/corpus-summary.json: ${(err as Error).message}`)
    console.log(`\n${failures} failure(s).`)
    process.exit(1)
  }

  const dispositionCounts = countBy(audits.map((a) => a.disposition as Disposition))
  const priorityCounts = countBy(audits.map((a) => a.rewrite_priority as RewritePriority))
  const ymylCounts = countBy(audits.map((a) => a.ymyl_class))
  const adGrantCounts = countBy(audits.map((a) => a.ad_grant_fit as AdGrantFit))

  const allClaimAudits = audits.flatMap((a) => a.claims)
  const mappingStatusCounts = countBy(allClaimAudits.map((c) => c.mapping_status as ClaimMappingStatus))
  const severityCounts = countBy(allClaimAudits.map((c) => c.severity as FindingSeverity))

  const scoresTotals = audits.map((a) => a.scores.total)
  const avgTotal = scoresTotals.length > 0 ? Math.round((scoresTotals.reduce((s, v) => s + v, 0) / scoresTotals.length) * 10) / 10 : 0
  const minTotal = scoresTotals.length > 0 ? Math.min(...scoresTotals) : 0
  const maxTotal = scoresTotals.length > 0 ? Math.max(...scoresTotals) : 0

  const articlesWithBlocking = audits.filter((a) => a.blocking_findings.length > 0)
  const totalBlockingFindings = audits.reduce((s, a) => s + a.blocking_findings.length, 0)

  const mergeAudits = audits.filter((a) => a.disposition === "MERGE")
  const mergePairs = mergeAudits.map((a) => ({ from_slug: a.slug, into_slug: a.merge_target_slug ?? null }))

  const clusterActionCounts = countBy(clusters.map((c) => c.recommended_action as CannibalizationRecommendedAction))

  const unpublishedDispositionCounts = countBy(unpublishedRows.map((r) => r.disposition as UnpublishedDisposition))

  const checks: { label: string; errors: string[] }[] = [
    { label: "published_article_count", errors: summary.published_article_count === publishedCount ? [] : [`expected ${publishedCount}, summary has ${summary.published_article_count}`] },
    { label: "unpublished_row_count", errors: summary.unpublished_row_count === unpublishedRows.length ? [] : [`expected ${unpublishedRows.length}, summary has ${summary.unpublished_row_count}`] },
    { label: "disposition_counts", errors: shallowRecordEqual(dispositionCounts, summary.disposition_counts ?? {}) },
    { label: "rewrite_priority_counts", errors: shallowRecordEqual(priorityCounts, summary.rewrite_priority_counts ?? {}) },
    { label: "ymyl_class_counts", errors: shallowRecordEqual(ymylCounts, summary.ymyl_class_counts ?? {}) },
    { label: "ad_grant_fit_counts", errors: shallowRecordEqual(adGrantCounts, summary.ad_grant_fit_counts ?? {}) },
    {
      label: "scores",
      errors: [
        summary.scores?.average_total === avgTotal ? null : `average_total: expected ${avgTotal}, summary has ${summary.scores?.average_total}`,
        summary.scores?.min_total === minTotal ? null : `min_total: expected ${minTotal}, summary has ${summary.scores?.min_total}`,
        summary.scores?.max_total === maxTotal ? null : `max_total: expected ${maxTotal}, summary has ${summary.scores?.max_total}`,
      ].filter((e): e is string => e !== null),
    },
    {
      label: "claim_audit_totals.material_claims_extracted",
      errors: summary.claim_audit_totals?.material_claims_extracted === allClaimAudits.length ? [] : [`expected ${allClaimAudits.length}, summary has ${summary.claim_audit_totals?.material_claims_extracted}`],
    },
    { label: "claim_audit_totals.mapping_status_counts", errors: shallowRecordEqual(mappingStatusCounts, summary.claim_audit_totals?.mapping_status_counts ?? {}) },
    { label: "claim_audit_totals.severity_counts", errors: shallowRecordEqual(severityCounts, summary.claim_audit_totals?.severity_counts ?? {}) },
    {
      label: "blocking_findings",
      errors: [
        summary.blocking_findings?.articles_with_at_least_one_blocking_finding === articlesWithBlocking.length
          ? null
          : `articles_with_at_least_one_blocking_finding: expected ${articlesWithBlocking.length}, summary has ${summary.blocking_findings?.articles_with_at_least_one_blocking_finding}`,
        summary.blocking_findings?.total_blocking_findings === totalBlockingFindings
          ? null
          : `total_blocking_findings: expected ${totalBlockingFindings}, summary has ${summary.blocking_findings?.total_blocking_findings}`,
      ].filter((e): e is string => e !== null),
    },
    {
      label: "cannibalization.cluster_count",
      errors: summary.cannibalization?.cluster_count === clusters.length ? [] : [`expected ${clusters.length}, summary has ${summary.cannibalization?.cluster_count}`],
    },
    {
      label: "cannibalization.merge_clusters",
      errors: summary.cannibalization?.merge_clusters === (clusterActionCounts["merge"] ?? 0) ? [] : [`expected ${clusterActionCounts["merge"] ?? 0}, summary has ${summary.cannibalization?.merge_clusters}`],
    },
    {
      label: "cannibalization.differentiate_and_keep_both_clusters",
      errors:
        summary.cannibalization?.differentiate_and_keep_both_clusters === (clusterActionCounts["differentiate_and_keep_both"] ?? 0)
          ? []
          : [`expected ${clusterActionCounts["differentiate_and_keep_both"] ?? 0}, summary has ${summary.cannibalization?.differentiate_and_keep_both_clusters}`],
    },
    { label: "unpublished_row_disposition_counts", errors: shallowRecordEqual(unpublishedDispositionCounts, summary.unpublished_row_disposition_counts ?? {}) },
  ]

  for (const check of checks) {
    if (check.errors.length > 0) {
      fail(`corpus-summary.json "${check.label}" has drifted from the source-of-truth files: ${check.errors.join("; ")}`)
    } else {
      console.log(`OK   corpus-summary.json "${check.label}" matches recomputed values`)
    }
  }

  // merge_pairs: order-independent set comparison
  const summaryMergePairs: { from_slug: string; into_slug: string | null }[] = Array.isArray(summary.merge_pairs) ? summary.merge_pairs : []
  const normalize = (pairs: { from_slug: string; into_slug: string | null }[]) =>
    pairs.map((p) => `${p.from_slug}->${p.into_slug}`).sort().join(",")
  if (normalize(mergePairs) !== normalize(summaryMergePairs)) {
    fail(`corpus-summary.json "merge_pairs" has drifted from the source-of-truth files: expected ${JSON.stringify(mergePairs)}, summary has ${JSON.stringify(summaryMergePairs)}`)
  } else {
    console.log(`OK   corpus-summary.json "merge_pairs" matches recomputed values`)
  }

  console.log(`\n${audits.length} article audit(s), ${clusters.length} cannibalization cluster(s), ${unpublishedRows.length} unpublished row(s) checked, ${failures} failure(s).`)
  if (failures > 0) process.exit(1)
}

try {
  main()
} catch (error) {
  console.error("[validate-stage4-audit] " + (error instanceof Error ? error.message : String(error)))
  process.exit(1)
}
