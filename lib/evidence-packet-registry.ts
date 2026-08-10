// V5 Stage 3 (Issue #16): evidence packet registry.
//
// A writer model must never query the whole claim/source registry ad
// hoc. Instead, a deterministic ArticleEvidencePacket is assembled per
// topic ahead of time, naming exactly which claims may be asserted as
// fact, which are mandatory vs. optional, which sources back them, and
// what limitations/safety context/uncertainty notes must accompany them.
// The packet is the boundary of what an article is allowed to state.
//
// Staleness: each packet freezes a `source_registry_revision` and
// `claim_registry_revision` hash at generation time (the same sha256
// pattern the Stage #14 content snapshot already uses — see
// lib/content-registry.ts). If either live registry hash no longer
// matches, the packet is stale and any article built from it needs
// review before being trusted again. See lib/evidence-dependency-audit.ts
// for the cascading retraction/supersession -> stale-packet detection
// that builds on this.

import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { isValidDateString } from "./date-validation"
import type { ClaimRecord } from "./claim-registry"
import type { SourceRecord } from "./source-registry"
import type { TopicRecord } from "./topic-registry"

export interface ArticleEvidencePacket {
  packet_id: string
  topic_id: string
  canonical_question: string
  reader_intent: string
  approved_claim_ids: string[]
  mandatory_claim_ids: string[]
  optional_claim_ids: string[]
  source_ids: string[]
  required_limitations: string[]
  required_safety_context: string[]
  prohibited_claims: string[]
  allowed_conclusions: string[]
  uncertainty_notes: string[]
  related_articles: string[]
  generated_at: string
  source_registry_revision: string
  claim_registry_revision: string
}

interface EvidencePacketRegistryFile {
  schema_version: number
  packets: ArticleEvidencePacket[]
}

const REGISTRY_PATH = path.join(process.cwd(), "content", "evidence-packets", "registry.json")

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>
    const keys = Object.keys(record).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(record[k])}`).join(",")}}`
  }
  return JSON.stringify(value)
}

/**
 * Deterministic revision hash for a registry array. Order-independent
 * (keys within each record and records-by-canonical-form are both
 * normalized), so a re-export or re-serialization of the same underlying
 * data does not spuriously mark every packet stale.
 */
export function computeRegistryRevisionHash(records: unknown[]): string {
  const canonicalRecords = [...records].sort((a, b) => stableStringify(a).localeCompare(stableStringify(b)))
  return createHash("sha256").update(stableStringify(canonicalRecords)).digest("hex")
}

/**
 * Validates a single evidence packet against the topic/claim/source
 * registries it draws from. Pure — takes already-loaded arrays.
 *
 * Issue #28 closure item 7: `sources` is required so every entry in
 * `source_ids` can be checked against the real source registry — an
 * invented source_id that resolves to nothing must fail, not silently
 * pass. Additionally, `source_ids` must be exactly the union of sources
 * required by `approved_claim_ids` — no extra, unaccounted-for source may
 * ride along in a packet (no "supporting-source" role is modeled here;
 * if one is ever introduced, this exact-union check is the place to
 * relax).
 */
export function validatePacketRecord(
  record: ArticleEvidencePacket,
  topics: TopicRecord[],
  claims: ClaimRecord[],
  sources: SourceRecord[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isNonEmptyString(record.packet_id)) errors.push("missing packet_id")
  if (!isNonEmptyString(record.canonical_question)) errors.push("missing canonical_question")
  if (!isNonEmptyString(record.reader_intent)) errors.push("missing reader_intent")
  if (!isValidDateString(record.generated_at)) errors.push("missing or invalid generated_at")
  if (!isNonEmptyString(record.source_registry_revision)) errors.push("missing source_registry_revision")
  if (!isNonEmptyString(record.claim_registry_revision)) errors.push("missing claim_registry_revision")

  const topic = topics.find((t) => t.topic_id === record.topic_id) ?? null
  if (!isNonEmptyString(record.topic_id)) {
    errors.push("missing topic_id")
  } else if (!topic) {
    errors.push(`references unknown topic_id "${record.topic_id}"`)
  }

  const approved = Array.isArray(record.approved_claim_ids) ? record.approved_claim_ids : []
  const mandatory = Array.isArray(record.mandatory_claim_ids) ? record.mandatory_claim_ids : []
  const optional = Array.isArray(record.optional_claim_ids) ? record.optional_claim_ids : []
  const sourceIds = Array.isArray(record.source_ids) ? record.source_ids : []

  for (const id of [...mandatory, ...optional]) {
    if (!approved.includes(id)) {
      errors.push(`claim_id "${id}" is mandatory or optional but not present in approved_claim_ids`)
    }
  }

  const resolvedApprovedClaims: ClaimRecord[] = []
  for (const id of approved) {
    const claim = claims.find((c) => c.claim_id === id)
    if (!claim) {
      errors.push(`approved_claim_ids references unknown claim_id "${id}"`)
      continue
    }
    resolvedApprovedClaims.push(claim)

    // A packet may never carry a claim that has itself been superseded —
    // this is the "packet references a superseded claim" failure mode
    // Issue #16 requires to be mechanically caught.
    if (claim.classification === "superseded") {
      errors.push(`approved_claim_ids includes "${id}", which is classified "superseded" and must not be assertable by an article`)
    }
  }

  // The packet must carry every source its approved claims depend on —
  // a writer must never need to reach outside the packet for support.
  const requiredSourceIds = new Set<string>()
  for (const claim of resolvedApprovedClaims) {
    for (const srcId of claim.source_ids) {
      requiredSourceIds.add(srcId)
      if (!sourceIds.includes(srcId)) {
        errors.push(`source_ids is missing "${srcId}", required by approved claim "${claim.claim_id}"`)
      }
    }
  }

  // Every source_ids entry must itself resolve to a real source record —
  // an invented/typo'd source_id must never silently pass validation.
  for (const srcId of sourceIds) {
    if (!sources.some((s) => s.source_id === srcId)) {
      errors.push(`source_ids references unknown source_id "${srcId}"`)
    }
  }

  // source_ids must be exactly the union of sources required by approved
  // claims — no unrelated or invented source may ride along in a packet
  // (no supporting-source role is modeled; see doc comment above).
  for (const srcId of sourceIds) {
    if (!requiredSourceIds.has(srcId)) {
      errors.push(
        `source_ids includes "${srcId}", which is not required by any approved claim — packet source_ids must be exactly the union of sources required by approved_claim_ids`,
      )
    }
  }

  // The packet must not silently drop a claim its own topic requires.
  if (topic) {
    for (const requiredId of topic.required_claim_ids) {
      if (!mandatory.includes(requiredId)) {
        errors.push(`topic "${topic.topic_id}" requires claim_id "${requiredId}", but it is missing from mandatory_claim_ids`)
      }
    }
  }

  for (const arrField of ["required_limitations", "required_safety_context", "prohibited_claims", "allowed_conclusions", "uncertainty_notes", "related_articles"] as const) {
    if (record[arrField] !== undefined && !Array.isArray(record[arrField])) {
      errors.push(`${arrField} must be an array when present`)
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * True if the packet's frozen registry-revision hashes no longer match
 * the live registries — i.e. sources or claims changed since this
 * packet was generated, and it must be regenerated/reviewed before an
 * article may trust it as current.
 */
export function isPacketStale(
  packet: ArticleEvidencePacket,
  liveSources: SourceRecord[],
  liveClaims: ClaimRecord[],
): boolean {
  return (
    packet.source_registry_revision !== computeRegistryRevisionHash(liveSources) ||
    packet.claim_registry_revision !== computeRegistryRevisionHash(liveClaims)
  )
}

/** Pure: returns every packet_id that appears more than once. */
export function findDuplicatePacketIds(records: ArticleEvidencePacket[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const record of records) {
    if (seen.has(record.packet_id)) duplicates.add(record.packet_id)
    seen.add(record.packet_id)
  }
  return [...duplicates]
}

let cachedPackets: ArticleEvidencePacket[] | null = null

function loadPacketsFromDisk(topics: TopicRecord[], claims: ClaimRecord[], sources: SourceRecord[]): ArticleEvidencePacket[] {
  if (cachedPackets) return cachedPackets

  let raw: string
  try {
    raw = readFileSync(REGISTRY_PATH, "utf8")
  } catch {
    cachedPackets = []
    return cachedPackets
  }

  const parsed = JSON.parse(raw) as EvidencePacketRegistryFile
  const packets = Array.isArray(parsed.packets) ? parsed.packets : []

  const duplicates = findDuplicatePacketIds(packets)
  if (duplicates.length > 0) {
    throw new Error(`[evidence-packet-registry] Duplicate packet_id value(s): ${duplicates.join(", ")}`)
  }

  for (const record of packets) {
    const { valid, errors } = validatePacketRecord(record, topics, claims, sources)
    if (!valid) {
      throw new Error(`[evidence-packet-registry] Invalid packet "${record.packet_id ?? "(no id)"}": ${errors.join("; ")}`)
    }
  }

  cachedPackets = packets
  return cachedPackets
}

export function loadPackets(topics: TopicRecord[], claims: ClaimRecord[], sources: SourceRecord[]): ArticleEvidencePacket[] {
  return loadPacketsFromDisk(topics, claims, sources)
}

export function getPacket(packets: ArticleEvidencePacket[], packetId: string): ArticleEvidencePacket | null {
  return packets.find((p) => p.packet_id === packetId) ?? null
}
