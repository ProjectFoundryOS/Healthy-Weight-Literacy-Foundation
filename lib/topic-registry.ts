// V5 Stage 3 (Issue #16): topic registry.
//
// A topic here represents a genuine reader job — a real question a real
// reader is trying to answer, at a specific stage of understanding — not
// a keyword or a hand-picked phrase. `query_evidence` may only claim to be
// measured search demand if it actually carries a source, measurement
// type, and measurement date; a hardcoded, timeless number like
// `search_demand: 10` with no provenance is exactly the failure mode this
// registry exists to prevent. Qualitative opportunity notes are welcome,
// but must not be dressed up as measured data.
//
// `required_claim_ids` is the bridge to the claim registry: a topic may
// only require claims that actually exist there. This is what lets an
// evidence packet (lib/evidence-packet-registry.ts) deterministically
// assemble "what this article is allowed to assert" from the topic's
// required claims, rather than a writer model querying the whole claim
// registry ad hoc.

import { readFileSync } from "node:fs"
import path from "node:path"
import { isValidDateString } from "./date-validation"
import { VALID_CLAIM_TYPES, VALID_DECAY_CLASSES, type ClaimRecord, type ClaimType, type DecayClass } from "./claim-registry"

export type ReaderStage = "awareness" | "understanding" | "evaluation" | "decision_support" | "ongoing_management"
export type YmylClass = "low" | "medium" | "high" | "critical"
export type MedicalRisk = "low" | "medium" | "high" | "critical"
export type TopicStatus = "research" | "evidence_ready" | "article_candidate" | "existing_article" | "hold" | "rejected"

export const VALID_READER_STAGES: ReaderStage[] = [
  "awareness",
  "understanding",
  "evaluation",
  "decision_support",
  "ongoing_management",
]

export const VALID_YMYL_CLASSES: YmylClass[] = ["low", "medium", "high", "critical"]
export const VALID_MEDICAL_RISKS: MedicalRisk[] = ["low", "medium", "high", "critical"]

export const VALID_TOPIC_STATUSES: TopicStatus[] = [
  "research",
  "evidence_ready",
  "article_candidate",
  "existing_article",
  "hold",
  "rejected",
]

/** Statuses at which a topic is expected to already name the claims an article on it would need. */
const STATUSES_REQUIRING_CLAIMS: TopicStatus[] = ["evidence_ready", "article_candidate", "existing_article"]

export interface QueryEvidence {
  query: string
  source: string
  measurement_type: string
  value: number | string
  measured_at: string
  geography?: string
}

export interface TopicRecord {
  topic_id: string
  canonical_question: string
  reader_intent: string
  reader_stage: ReaderStage
  cluster: string
  subcluster?: string
  target_reader: string
  what_reader_already_knows?: string
  desired_reader_outcome: string
  ymyl_class: YmylClass
  medical_risk: MedicalRisk
  decay_class: DecayClass
  required_claim_ids: string[]
  optional_claim_ids?: string[]
  prohibited_claim_types?: ClaimType[]
  related_topic_ids?: string[]
  existing_article_slugs?: string[]
  cannibalization_candidates?: string[]
  query_evidence?: QueryEvidence[]
  priority?: string
  status: TopicStatus
  notes?: string
}

interface TopicRegistryFile {
  schema_version: number
  topics: TopicRecord[]
}

const REGISTRY_PATH = path.join(process.cwd(), "content", "topics", "registry.json")

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Validates a single topic record, including that every claim_id it
 * requires or optionally allows actually exists in the claim registry.
 * Pure — takes the already-loaded claims array as a parameter.
 */
export function validateTopicRecord(record: TopicRecord, claims: ClaimRecord[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(record.topic_id)) errors.push("missing topic_id")
  if (!isNonEmptyString(record.canonical_question)) errors.push("missing canonical_question")
  if (!isNonEmptyString(record.reader_intent)) errors.push("missing reader_intent")
  if (!isNonEmptyString(record.cluster)) errors.push("missing cluster")
  if (!isNonEmptyString(record.target_reader)) errors.push("missing target_reader")
  if (!isNonEmptyString(record.desired_reader_outcome)) errors.push("missing desired_reader_outcome")

  if (!VALID_READER_STAGES.includes(record.reader_stage)) {
    errors.push(`unknown reader_stage "${String(record.reader_stage)}"`)
  }
  if (!VALID_YMYL_CLASSES.includes(record.ymyl_class)) errors.push(`unknown ymyl_class "${String(record.ymyl_class)}"`)
  if (!VALID_MEDICAL_RISKS.includes(record.medical_risk)) errors.push(`unknown medical_risk "${String(record.medical_risk)}"`)
  if (!VALID_DECAY_CLASSES.includes(record.decay_class)) errors.push(`unknown decay_class "${String(record.decay_class)}"`)
  if (!VALID_TOPIC_STATUSES.includes(record.status)) errors.push(`unknown status "${String(record.status)}"`)

  const requiredClaimIds = Array.isArray(record.required_claim_ids) ? record.required_claim_ids : []
  if (!Array.isArray(record.required_claim_ids)) errors.push("missing required_claim_ids array")

  if (STATUSES_REQUIRING_CLAIMS.includes(record.status) && requiredClaimIds.length === 0) {
    errors.push(`status "${record.status}" requires at least one required_claim_id`)
  }

  for (const id of requiredClaimIds) {
    if (!claims.some((c) => c.claim_id === id)) {
      errors.push(`required_claim_ids references unknown claim_id "${id}"`)
    }
  }

  for (const id of record.optional_claim_ids ?? []) {
    if (!claims.some((c) => c.claim_id === id)) {
      errors.push(`optional_claim_ids references unknown claim_id "${id}"`)
    }
  }

  for (const claimType of record.prohibited_claim_types ?? []) {
    if (!VALID_CLAIM_TYPES.includes(claimType)) {
      errors.push(`prohibited_claim_types references unknown claim_type "${String(claimType)}"`)
    }
  }

  for (const [i, qe] of (record.query_evidence ?? []).entries()) {
    if (!isNonEmptyString(qe.query)) errors.push(`query_evidence[${i}] missing query`)
    if (!isNonEmptyString(qe.source)) errors.push(`query_evidence[${i}] missing source — a measured value must name where it came from`)
    if (!isNonEmptyString(qe.measurement_type)) errors.push(`query_evidence[${i}] missing measurement_type`)
    if (qe.value === undefined || qe.value === null || qe.value === "") {
      errors.push(`query_evidence[${i}] missing value`)
    }
    if (!isValidDateString(qe.measured_at)) {
      errors.push(`query_evidence[${i}] missing or invalid measured_at — an undated value cannot be represented as measured data`)
    }
  }

  return { valid: errors.length === 0, errors }
}

/** Pure: returns every topic_id that appears more than once. Empty means the registry is clean. */
export function findDuplicateTopicIds(records: TopicRecord[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const record of records) {
    if (seen.has(record.topic_id)) duplicates.add(record.topic_id)
    seen.add(record.topic_id)
  }
  return [...duplicates]
}

let cachedTopics: TopicRecord[] | null = null

function loadTopicsFromDisk(claims: ClaimRecord[]): TopicRecord[] {
  if (cachedTopics) return cachedTopics

  let raw: string
  try {
    raw = readFileSync(REGISTRY_PATH, "utf8")
  } catch {
    cachedTopics = []
    return cachedTopics
  }

  const parsed = JSON.parse(raw) as TopicRegistryFile
  const topics = Array.isArray(parsed.topics) ? parsed.topics : []

  const duplicates = findDuplicateTopicIds(topics)
  if (duplicates.length > 0) {
    throw new Error(`[topic-registry] Duplicate topic_id value(s): ${duplicates.join(", ")}`)
  }

  for (const record of topics) {
    const { valid, errors } = validateTopicRecord(record, claims)
    if (!valid) {
      throw new Error(`[topic-registry] Invalid topic record "${record.topic_id ?? "(no id)"}": ${errors.join("; ")}`)
    }
  }

  cachedTopics = topics
  return cachedTopics
}

export function loadTopics(claims: ClaimRecord[]): TopicRecord[] {
  return loadTopicsFromDisk(claims)
}

export function getTopic(topics: TopicRecord[], topicId: string): TopicRecord | null {
  return topics.find((t) => t.topic_id === topicId) ?? null
}
