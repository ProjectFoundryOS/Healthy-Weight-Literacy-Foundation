// V5 Stage 3 (Issue #16): evidence dependency + decay audit.
//
// This module demonstrates and mechanically checks the invalidation path
// the architecture is built around: source retracted -> claim loses
// required support -> evidence packet referencing that claim becomes
// stale -> topic/article depending on the packet is flagged for review.
// It also detects circular supersession chains and dangling
// cross-registry references, and reports claims/sources due for
// scheduled review under the evidence-decay framework. None of this runs
// as background automation yet — it is exposed as pure functions plus a
// script (scripts/audit-evidence-dependencies.ts) that a human/CI job
// can run on demand.

import { isAtLeastTier, type SourceRecord, type TrustTier } from "./source-registry"
import type { ClaimRecord } from "./claim-registry"
import type { TopicRecord } from "./topic-registry"
import { isPacketStale, type ArticleEvidencePacket } from "./evidence-packet-registry"

const ACTIVE_SOURCE_STATUSES: SourceRecord["status"][] = ["current", "corrected"]

function isActiveSource(source: SourceRecord | undefined): boolean {
  return Boolean(source) && ACTIVE_SOURCE_STATUSES.includes(source!.status)
}

/** Claims with zero source_ids resolving to a currently-active (non-retracted/superseded/unavailable) source. */
export function findClaimsWithoutCurrentSupport(claims: ClaimRecord[], sources: SourceRecord[]): string[] {
  return claims
    .filter((claim) => !claim.source_ids.some((id) => isActiveSource(sources.find((s) => s.source_id === id))))
    .map((c) => c.claim_id)
}

/**
 * High/critical-risk claims whose primary sources, as they currently
 * stand, no longer include an active source meeting the required trust
 * tier (Tier B minimum for "high", Tier A for "critical"). This re-derives
 * the tier gate dynamically against the *current* source registry, unlike
 * validateClaimRecord's static check — a source that was Tier A and
 * current when the claim was authored, but has since been retracted,
 * shows up here even if the claim record itself was never edited.
 */
export function findHighRiskClaimsLackingCurrentPrimarySupport(claims: ClaimRecord[], sources: SourceRecord[]): string[] {
  return claims
    .filter((c) => c.ymyl_risk === "high" || c.ymyl_risk === "critical")
    .filter((claim) => {
      const requiredTier: TrustTier = claim.ymyl_risk === "critical" ? "A" : "B"
      return !claim.primary_source_ids.some((id) => {
        const src = sources.find((s) => s.source_id === id)
        return isActiveSource(src) && isAtLeastTier(src!.trust_tier, requiredTier)
      })
    })
    .map((c) => c.claim_id)
}

export interface DanglingReference {
  id: string
  missingTargetId: string
}

export function findDanglingSourceSupersessionReferences(sources: SourceRecord[]): DanglingReference[] {
  const ids = new Set(sources.map((s) => s.source_id))
  return sources
    .filter((s) => s.superseded_by_source_id && !ids.has(s.superseded_by_source_id))
    .map((s) => ({ id: s.source_id, missingTargetId: s.superseded_by_source_id as string }))
}

export function findDanglingClaimSupersessionReferences(claims: ClaimRecord[]): DanglingReference[] {
  const ids = new Set(claims.map((c) => c.claim_id))
  return claims
    .filter((c) => c.superseded_by_claim_id && !ids.has(c.superseded_by_claim_id))
    .map((c) => ({ id: c.claim_id, missingTargetId: c.superseded_by_claim_id as string }))
}

/**
 * Each node has at most one outgoing "superseded by" edge, so the graph
 * is a functional graph — a simple forward walk per unvisited start node
 * finds every cycle without needing general-purpose graph libraries.
 */
function findCycles(edges: Map<string, string>): string[][] {
  const visited = new Set<string>()
  const cycles: string[][] = []

  for (const start of edges.keys()) {
    if (visited.has(start)) continue

    const path: string[] = []
    const indexOnPath = new Map<string, number>()
    let current: string | undefined = start

    while (current !== undefined && !visited.has(current)) {
      if (indexOnPath.has(current)) {
        cycles.push(path.slice(indexOnPath.get(current)!).concat(current))
        break
      }
      indexOnPath.set(current, path.length)
      path.push(current)
      current = edges.get(current)
    }

    for (const id of path) visited.add(id)
  }

  return cycles
}

export function findCircularSourceSupersessionChains(sources: SourceRecord[]): string[][] {
  const edges = new Map<string, string>()
  for (const s of sources) {
    if (s.superseded_by_source_id) edges.set(s.source_id, s.superseded_by_source_id)
  }
  return findCycles(edges)
}

export function findCircularClaimSupersessionChains(claims: ClaimRecord[]): string[][] {
  const edges = new Map<string, string>()
  for (const c of claims) {
    if (c.superseded_by_claim_id) edges.set(c.claim_id, c.superseded_by_claim_id)
  }
  return findCycles(edges)
}

/**
 * A packet is stale if its frozen registry-revision hashes no longer
 * match the live registries (isPacketStale), OR — belt-and-suspenders,
 * in case a hash somehow stayed stable — if any claim it approved is
 * missing entirely or has since been classified "superseded". This is
 * the concrete "source retracted -> claim invalidated -> packet stale"
 * mechanical check Issue #16 requires.
 */
export function findStalePackets(packets: ArticleEvidencePacket[], sources: SourceRecord[], claims: ClaimRecord[]): string[] {
  return packets
    .filter((packet) => {
      if (isPacketStale(packet, sources, claims)) return true
      return packet.approved_claim_ids.some((id) => {
        const claim = claims.find((c) => c.claim_id === id)
        return !claim || claim.classification === "superseded"
      })
    })
    .map((p) => p.packet_id)
}

/** Topics whose evidence packet(s) are stale — the last hop in the invalidation chain: source -> claim -> packet -> topic/article. */
export function findTopicsWithStalePacket(
  topics: TopicRecord[],
  packets: ArticleEvidencePacket[],
  sources: SourceRecord[],
  claims: ClaimRecord[],
): string[] {
  const staleIds = new Set(findStalePackets(packets, sources, claims))
  const staleTopicIds = new Set<string>()
  for (const packet of packets) {
    if (staleIds.has(packet.packet_id) && topics.some((t) => t.topic_id === packet.topic_id)) {
      staleTopicIds.add(packet.topic_id)
    }
  }
  return [...staleTopicIds]
}

/** Claims whose review_due_at has arrived, as of `asOf` (defaults to now). Informational, not itself a failure. */
export function findClaimsDueForReview(claims: ClaimRecord[], asOf: Date = new Date()): string[] {
  return claims.filter((c) => new Date(c.review_due_at).getTime() <= asOf.getTime()).map((c) => c.claim_id)
}

/** Sources that are primary support for a claim currently due for review — inherits the claim's decay schedule rather than needing a separate per-source schedule. */
export function findSourcesDueForVerification(sources: SourceRecord[], claims: ClaimRecord[], asOf: Date = new Date()): string[] {
  const dueClaimIds = new Set(findClaimsDueForReview(claims, asOf))
  const dueSourceIds = new Set<string>()
  for (const claim of claims) {
    if (!dueClaimIds.has(claim.claim_id)) continue
    for (const srcId of claim.primary_source_ids) dueSourceIds.add(srcId)
  }
  return sources.filter((s) => dueSourceIds.has(s.source_id)).map((s) => s.source_id)
}

export interface DependencyAuditReport {
  claimsWithoutCurrentSupport: string[]
  highRiskClaimsLackingCurrentPrimarySupport: string[]
  danglingSourceSupersessionReferences: DanglingReference[]
  danglingClaimSupersessionReferences: DanglingReference[]
  circularSourceSupersessionChains: string[][]
  circularClaimSupersessionChains: string[][]
  stalePacketIds: string[]
  topicsWithStalePacket: string[]
  claimsDueForReview: string[]
  sourcesDueForVerification: string[]
}

export function buildDependencyAuditReport(
  sources: SourceRecord[],
  claims: ClaimRecord[],
  topics: TopicRecord[],
  packets: ArticleEvidencePacket[],
  asOf: Date = new Date(),
): DependencyAuditReport {
  return {
    claimsWithoutCurrentSupport: findClaimsWithoutCurrentSupport(claims, sources),
    highRiskClaimsLackingCurrentPrimarySupport: findHighRiskClaimsLackingCurrentPrimarySupport(claims, sources),
    danglingSourceSupersessionReferences: findDanglingSourceSupersessionReferences(sources),
    danglingClaimSupersessionReferences: findDanglingClaimSupersessionReferences(claims),
    circularSourceSupersessionChains: findCircularSourceSupersessionChains(sources),
    circularClaimSupersessionChains: findCircularClaimSupersessionChains(claims),
    stalePacketIds: findStalePackets(packets, sources, claims),
    topicsWithStalePacket: findTopicsWithStalePacket(topics, packets, sources, claims),
    claimsDueForReview: findClaimsDueForReview(claims, asOf),
    sourcesDueForVerification: findSourcesDueForVerification(sources, claims, asOf),
  }
}

/**
 * True if there are no integrity violations. claimsDueForReview and
 * sourcesDueForVerification are intentionally excluded — those describe
 * scheduled maintenance, not a broken dependency.
 */
export function isReportClean(report: DependencyAuditReport): boolean {
  return (
    report.claimsWithoutCurrentSupport.length === 0 &&
    report.highRiskClaimsLackingCurrentPrimarySupport.length === 0 &&
    report.danglingSourceSupersessionReferences.length === 0 &&
    report.danglingClaimSupersessionReferences.length === 0 &&
    report.circularSourceSupersessionChains.length === 0 &&
    report.circularClaimSupersessionChains.length === 0 &&
    report.stalePacketIds.length === 0 &&
    report.topicsWithStalePacket.length === 0
  )
}
