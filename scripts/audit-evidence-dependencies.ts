import { loadSources } from "../lib/source-registry"
import { loadClaims } from "../lib/claim-registry"
import { loadTopics } from "../lib/topic-registry"
import { loadPackets } from "../lib/evidence-packet-registry"
import { buildDependencyAuditReport, isReportClean } from "../lib/evidence-dependency-audit"

function main() {
  console.log("Auditing evidence dependency chain (source -> claim -> evidence packet -> topic)...\n")

  const sources = loadSources()
  const claims = loadClaims(sources)
  const topics = loadTopics(claims)
  const packets = loadPackets(topics, claims, sources)

  const report = buildDependencyAuditReport(sources, claims, topics, packets)

  console.log(`Claims without current source support:        ${report.claimsWithoutCurrentSupport.length}`)
  console.log(`High/critical-risk claims lacking Tier support: ${report.highRiskClaimsLackingCurrentPrimarySupport.length}`)
  console.log(`Dangling source supersession references:       ${report.danglingSourceSupersessionReferences.length}`)
  console.log(`Dangling claim supersession references:        ${report.danglingClaimSupersessionReferences.length}`)
  console.log(`Circular source supersession chains:           ${report.circularSourceSupersessionChains.length}`)
  console.log(`Circular claim supersession chains:             ${report.circularClaimSupersessionChains.length}`)
  console.log(`Stale evidence packets:                        ${report.stalePacketIds.length}`)
  console.log(`Topics with a stale evidence packet:           ${report.topicsWithStalePacket.length}`)
  console.log(`\n(informational, not integrity failures)`)
  console.log(`Claims due for review:                         ${report.claimsDueForReview.length}${report.claimsDueForReview.length ? ` (${report.claimsDueForReview.join(", ")})` : ""}`)
  console.log(`Sources due for re-verification:                ${report.sourcesDueForVerification.length}${report.sourcesDueForVerification.length ? ` (${report.sourcesDueForVerification.join(", ")})` : ""}`)

  if (!isReportClean(report)) {
    console.error("\nFAIL: dependency audit found integrity violation(s) above.")
    console.error(JSON.stringify(report, null, 2))
    process.exit(1)
  }

  console.log("\nOK: dependency chain is clean — no invalidated claims, no stale packets, no dangling/circular supersession references.")
}

try {
  main()
} catch (error) {
  console.error("[audit-evidence-dependencies] " + (error instanceof Error ? error.message : String(error)))
  process.exit(1)
}
