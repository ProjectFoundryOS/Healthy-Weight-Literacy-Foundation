// V5 Stage 4 (Issue #17): unpublished historical row audit registry.
//
// The five unpublished Supabase rows are inspected read-only (no writes,
// ever) for disposition purposes, but their full draft bodies are
// deliberately never committed to this public repository — only safe,
// minimal metadata (slug, category, content hash, disposition, reason).
// This registry uses a disposition taxonomy distinct from the six live
// dispositions in lib/article-audit-registry.ts, because an unpublished
// row's possible outcomes are different in kind from a live page's.
//
// Nothing here changes is_published in Supabase. This module only ever
// records what a read-only inspection found.

import { readFileSync } from "node:fs"
import path from "node:path"
import { isValidDateString } from "./date-validation"

export type UnpublishedDisposition = "REPUBLISH_AFTER_REFRESH" | "MERGE" | "REDIRECT" | "RETIRE" | "KEEP_UNPUBLISHED"

export const VALID_UNPUBLISHED_DISPOSITIONS: UnpublishedDisposition[] = [
  "REPUBLISH_AFTER_REFRESH",
  "MERGE",
  "REDIRECT",
  "RETIRE",
  "KEEP_UNPUBLISHED",
]

export interface UnpublishedRowAudit {
  slug: string
  category: string
  content_sha256: string
  is_published: false
  inspected_at: string
  disposition: UnpublishedDisposition
  overlap_target_slug?: string
  reason: string
}

interface UnpublishedSummaryFile {
  schema_version: number
  notes: string
  rows: UnpublishedRowAudit[]
}

const REGISTRY_PATH = path.join(process.cwd(), "content", "audits", "stage4", "unpublished-summary.json")

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export function validateUnpublishedRowAudit(record: UnpublishedRowAudit): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(record.slug)) errors.push("missing slug")
  if (!isNonEmptyString(record.category)) errors.push("missing category")
  if (!isNonEmptyString(record.content_sha256)) errors.push("missing content_sha256")
  if (record.is_published !== false) errors.push('is_published must be exactly false — this registry only ever describes unpublished rows')
  if (!isValidDateString(record.inspected_at)) errors.push("missing or invalid inspected_at")
  if (!isNonEmptyString(record.reason)) errors.push("missing reason")

  if (!VALID_UNPUBLISHED_DISPOSITIONS.includes(record.disposition)) {
    errors.push(`unknown disposition "${String(record.disposition)}"`)
  }
  if ((record.disposition === "MERGE" || record.disposition === "REDIRECT") && !isNonEmptyString(record.overlap_target_slug)) {
    errors.push(`disposition "${record.disposition}" requires overlap_target_slug`)
  }

  return { valid: errors.length === 0, errors }
}

export function findDuplicateUnpublishedSlugs(records: UnpublishedRowAudit[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const record of records) {
    if (seen.has(record.slug)) duplicates.add(record.slug)
    seen.add(record.slug)
  }
  return [...duplicates]
}

let cachedRows: UnpublishedRowAudit[] | null = null

function loadUnpublishedRowAuditsFromDisk(): UnpublishedRowAudit[] {
  if (cachedRows) return cachedRows

  let raw: string
  try {
    raw = readFileSync(REGISTRY_PATH, "utf8")
  } catch {
    cachedRows = []
    return cachedRows
  }

  const parsed = JSON.parse(raw) as UnpublishedSummaryFile
  const rows = Array.isArray(parsed.rows) ? parsed.rows : []

  const duplicates = findDuplicateUnpublishedSlugs(rows)
  if (duplicates.length > 0) {
    throw new Error(`[unpublished-audit-registry] Duplicate slug value(s): ${duplicates.join(", ")}`)
  }

  for (const record of rows) {
    const { valid, errors } = validateUnpublishedRowAudit(record)
    if (!valid) {
      throw new Error(`[unpublished-audit-registry] Invalid row "${record.slug ?? "(no slug)"}": ${errors.join("; ")}`)
    }
  }

  cachedRows = rows
  return cachedRows
}

export function loadUnpublishedRowAudits(): UnpublishedRowAudit[] {
  return loadUnpublishedRowAuditsFromDisk()
}
