import { loadSources } from "../lib/source-registry"
import { loadClaims, validateClaimRecord, findDuplicateClaimIds } from "../lib/claim-registry"

function main() {
  console.log("Validating content/claims/registry.json...\n")

  const sources = loadSources()
  const claims = loadClaims(sources)

  let failures = 0
  for (const claim of claims) {
    const { valid, errors } = validateClaimRecord(claim, sources)
    if (!valid) {
      failures++
      console.error(`FAIL ${claim.claim_id}: ${errors.join("; ")}`)
    } else {
      console.log(`OK   ${claim.claim_id} (${claim.classification}, ymyl_risk=${claim.ymyl_risk})`)
    }
  }

  const duplicates = findDuplicateClaimIds(claims)
  if (duplicates.length > 0) {
    failures++
    console.error(`FAIL duplicate claim_id value(s): ${duplicates.join(", ")}`)
  }

  const highRisk = claims.filter((c) => c.ymyl_risk === "high" || c.ymyl_risk === "critical").length
  console.log(`\n${claims.length} claim(s) checked (${highRisk} high/critical risk), ${failures} failure(s).`)
  if (failures > 0) process.exit(1)
}

try {
  main()
} catch (error) {
  console.error("[validate-claims] " + (error instanceof Error ? error.message : String(error)))
  process.exit(1)
}
