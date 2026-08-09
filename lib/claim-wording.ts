// V5 Stage 3 (Issue #16): mechanical claim-wording contract checker.
//
// IMPORTANT SCOPE LIMIT: this module is a mechanical phrase-contract
// checker, not a semantic-accuracy checker. It can reliably catch two
// things:
//   1. Prose contains a claim's (or packet's) exact prohibited phrase.
//   2. Prose is missing the exact text of a required qualifier.
// It CANNOT determine whether prose is scientifically accurate, whether
// a paraphrase of a required qualifier preserves its meaning, or whether
// a claim is represented in a misleading way that avoids every listed
// prohibited string. A clean mechanical result is necessary but not
// sufficient — semantic accuracy review remains an Opus/human
// responsibility (see STAGE3_EVIDENCE_REGISTRY_AUDIT.md). This module
// exists so that later audit tooling has *something* mechanical to run
// before that human/Opus review, not to replace it.

import type { ClaimRecord } from "./claim-registry"
import type { ArticleEvidencePacket } from "./evidence-packet-registry"

export type WordingViolationType = "prohibited_phrase_found" | "required_qualifier_missing"

export interface WordingViolation {
  type: WordingViolationType
  phrase: string
  detail: string
}

export interface WordingCheckResult {
  claimId: string
  violations: WordingViolation[]
}

function containsPhrase(haystackLower: string, phrase: string): boolean {
  return haystackLower.includes(phrase.toLowerCase())
}

/**
 * Checks prose against a single claim's allowed/prohibited wording
 * contract. Pure string matching — see module-level scope-limit note.
 */
export function checkProseAgainstClaim(prose: string, claim: ClaimRecord): WordingViolation[] {
  const violations: WordingViolation[] = []
  const lowerProse = prose.toLowerCase()

  for (const phrase of claim.prohibited_wording ?? []) {
    if (containsPhrase(lowerProse, phrase)) {
      violations.push({
        type: "prohibited_phrase_found",
        phrase,
        detail: `Prose contains a phrase prohibited for claim "${claim.claim_id}": "${phrase}"`,
      })
    }
  }

  for (const qualifier of claim.required_qualifiers ?? []) {
    if (!containsPhrase(lowerProse, qualifier)) {
      violations.push({
        type: "required_qualifier_missing",
        phrase: qualifier,
        detail:
          `Prose does not contain the exact required-qualifier text for claim "${claim.claim_id}": "${qualifier}" ` +
          `— this may be a real omission, or the qualifier may be present in different wording; either way it needs manual/semantic review.`,
      })
    }
  }

  return violations
}

/**
 * Checks prose against every mandatory claim in an evidence packet, plus
 * the packet's own prohibited_claims phrases. Returns one result entry
 * per claim (and one synthetic "(packet)" entry for packet-level
 * prohibited phrases) that has at least one violation — a clean article
 * produces an empty array.
 */
export function checkProseAgainstPacket(
  prose: string,
  packet: ArticleEvidencePacket,
  claims: ClaimRecord[],
): WordingCheckResult[] {
  const results: WordingCheckResult[] = []
  const lowerProse = prose.toLowerCase()

  const packetViolations: WordingViolation[] = []
  for (const phrase of packet.prohibited_claims) {
    if (containsPhrase(lowerProse, phrase)) {
      packetViolations.push({
        type: "prohibited_phrase_found",
        phrase,
        detail: `Prose contains a phrase prohibited by evidence packet "${packet.packet_id}": "${phrase}"`,
      })
    }
  }
  if (packetViolations.length > 0) {
    results.push({ claimId: "(packet)", violations: packetViolations })
  }

  for (const claimId of packet.mandatory_claim_ids) {
    const claim = claims.find((c) => c.claim_id === claimId)
    if (!claim) continue
    const violations = checkProseAgainstClaim(prose, claim)
    if (violations.length > 0) {
      results.push({ claimId, violations })
    }
  }

  return results
}

export function isPassingWordingCheck(results: WordingCheckResult[]): boolean {
  return results.length === 0
}
