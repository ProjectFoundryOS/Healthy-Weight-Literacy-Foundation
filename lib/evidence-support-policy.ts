// V5 Stage 3 closure (Issue #28 closure item 6): single shared
// active-support policy.
//
// Before this module existed, creation-time validation
// (lib/claim-registry.ts's validateClaimRecord) and dependency-time
// validation (lib/evidence-dependency-audit.ts's
// findHighRiskClaimsLackingCurrentPrimarySupport) had silently drifted:
// validateClaimRecord required a Tier A primary source for both "high"
// and "critical" ymyl_risk, while the dependency audit only required
// Tier B for "high". A claim could pass creation-time validation and
// still be reported clean by the dependency audit under a materially
// weaker bar — two gates that were supposed to enforce the same contract
// silently disagreeing. This module is now the only place either rule is
// allowed to live; both call sites import it rather than each keeping
// their own copy.
//
// This module intentionally has no dependency on lib/claim-registry.ts
// (only on lib/source-registry.ts) so that claim-registry.ts can import
// from here without a circular import — YmylRisk itself is defined here
// and re-exported from claim-registry.ts for backward compatibility.

import { isAtLeastTier, type SourceRecord, type SourceStatus, type TrustTier } from "./source-registry"

export type YmylRisk = "low" | "medium" | "high" | "critical"

export const VALID_YMYL_RISKS: YmylRisk[] = ["low", "medium", "high", "critical"]

/**
 * Statuses that count as "currently active" support for a claim.
 * "corrected" is included deliberately: a source that has published a
 * correction is still the authoritative, current version of the
 * record — the correction improves its accuracy, it does not withdraw
 * it. "superseded", "retracted", and "unavailable" are excluded: none of
 * those states describe a source that can still be trusted as current,
 * regardless of how strong the underlying trust tier was when the
 * relationship was first recorded.
 */
export const ACTIVE_SOURCE_STATUSES: SourceStatus[] = ["current", "corrected"]

export function isActiveSourceStatus(status: SourceStatus): boolean {
  return ACTIVE_SOURCE_STATUSES.includes(status)
}

export function isActiveSource(source: SourceRecord | null | undefined): boolean {
  return Boolean(source) && isActiveSourceStatus(source!.status)
}

/**
 * The minimum trust tier a claim's primary support must meet, driven by
 * its ymyl_risk. An "established" classification's baseline floor is
 * Tier B (an established claim can never rest on Tier C/D alone); high
 * or critical medical risk raises that floor to Tier A regardless of
 * classification. This single function is the one place both the
 * established-classification tier gate and the risk-driven tier gate are
 * expressed, so a "high"-risk claim is held to the same Tier A bar
 * whether it's checked at creation time or at dependency-audit time.
 */
export function requiredActiveTierForRisk(ymylRisk: YmylRisk): TrustTier {
  return ymylRisk === "high" || ymylRisk === "critical" ? "A" : "B"
}

/**
 * True if at least one of the given primary source_ids resolves to a
 * source that is both currently active (see ACTIVE_SOURCE_STATUSES) and
 * at least the required trust tier. A source_id that does not resolve at
 * all never counts.
 */
export function hasQualifyingActivePrimarySupport(
  primarySourceIds: string[],
  sources: SourceRecord[],
  requiredTier: TrustTier,
): boolean {
  return primarySourceIds.some((id) => {
    const src = sources.find((s) => s.source_id === id)
    return isActiveSource(src) && isAtLeastTier(src!.trust_tier, requiredTier)
  })
}
