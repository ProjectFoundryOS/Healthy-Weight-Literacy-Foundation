import { loadSources, validateSourceRecord, findDuplicateSourceIds } from "../lib/source-registry"

function main() {
  console.log("Validating content/sources/registry.json...\n")

  // loadSources() already throws on any invalid record or duplicate id;
  // re-run validateSourceRecord per-record here purely to print a clean
  // per-source summary rather than stopping at the first failure.
  const raw = loadSources()

  let failures = 0
  for (const source of raw) {
    const { valid, errors } = validateSourceRecord(source)
    if (!valid) {
      failures++
      console.error(`FAIL ${source.source_id}: ${errors.join("; ")}`)
    } else {
      console.log(`OK   ${source.source_id} (Tier ${source.trust_tier}, ${source.status})`)
    }
  }

  const duplicates = findDuplicateSourceIds(raw)
  if (duplicates.length > 0) {
    failures++
    console.error(`FAIL duplicate source_id value(s): ${duplicates.join(", ")}`)
  }

  console.log(`\n${raw.length} source(s) checked, ${failures} failure(s).`)
  if (failures > 0) process.exit(1)
}

try {
  main()
} catch (error) {
  console.error("[validate-sources] " + (error instanceof Error ? error.message : String(error)))
  process.exit(1)
}
