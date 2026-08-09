import { loadSources } from "../lib/source-registry"
import { loadClaims } from "../lib/claim-registry"
import { loadTopics, validateTopicRecord, findDuplicateTopicIds } from "../lib/topic-registry"

function main() {
  console.log("Validating content/topics/registry.json...\n")

  const sources = loadSources()
  const claims = loadClaims(sources)
  const topics = loadTopics(claims)

  let failures = 0
  for (const topic of topics) {
    const { valid, errors } = validateTopicRecord(topic, claims)
    if (!valid) {
      failures++
      console.error(`FAIL ${topic.topic_id}: ${errors.join("; ")}`)
    } else {
      console.log(`OK   ${topic.topic_id} (${topic.status})`)
    }
  }

  const duplicates = findDuplicateTopicIds(topics)
  if (duplicates.length > 0) {
    failures++
    console.error(`FAIL duplicate topic_id value(s): ${duplicates.join(", ")}`)
  }

  console.log(`\n${topics.length} topic(s) checked, ${failures} failure(s).`)
  if (failures > 0) process.exit(1)
}

try {
  main()
} catch (error) {
  console.error("[validate-topics] " + (error instanceof Error ? error.message : String(error)))
  process.exit(1)
}
