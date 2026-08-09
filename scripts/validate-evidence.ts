import { loadSources } from "../lib/source-registry"
import { loadClaims } from "../lib/claim-registry"
import { loadTopics } from "../lib/topic-registry"
import { loadPackets, validatePacketRecord, findDuplicatePacketIds, isPacketStale } from "../lib/evidence-packet-registry"

function main() {
  console.log("Validating content/evidence-packets/registry.json...\n")

  const sources = loadSources()
  const claims = loadClaims(sources)
  const topics = loadTopics(claims)
  const packets = loadPackets(topics, claims)

  let failures = 0
  for (const packet of packets) {
    const { valid, errors } = validatePacketRecord(packet, topics, claims)
    if (!valid) {
      failures++
      console.error(`FAIL ${packet.packet_id}: ${errors.join("; ")}`)
      continue
    }
    if (isPacketStale(packet, sources, claims)) {
      failures++
      console.error(`FAIL ${packet.packet_id}: stale — frozen registry revision no longer matches the live source/claim registries`)
      continue
    }
    console.log(`OK   ${packet.packet_id} (topic: ${packet.topic_id})`)
  }

  const duplicates = findDuplicatePacketIds(packets)
  if (duplicates.length > 0) {
    failures++
    console.error(`FAIL duplicate packet_id value(s): ${duplicates.join(", ")}`)
  }

  console.log(`\n${packets.length} packet(s) checked, ${failures} failure(s).`)
  if (failures > 0) process.exit(1)
}

try {
  main()
} catch (error) {
  console.error("[validate-evidence] " + (error instanceof Error ? error.message : String(error)))
  process.exit(1)
}
