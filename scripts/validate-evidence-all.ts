// V5 Stage 3 closure (Issue #28 closure item 8): one mandatory evidence
// gate. Runs every evidence validator, in dependency order, and stops at
// the first failure — a broken source registry should never let claims
// or topics get checked against garbage, and any failure anywhere fails
// this whole command with a non-zero exit status.
//
// Wired into `prebuild` (see package.json), so it runs automatically
// before every `next build` — the same mechanism that already gates the
// build on `scripts/check-content-registry.mjs` (Stage 1's article
// snapshot integrity check). A SHA where this gate did not run must never
// be treated as green, regardless of what any other test suite reports.

import { spawnSync } from "node:child_process"

const STEPS: { name: string; script: string }[] = [
  { name: "sources", script: "scripts/validate-sources.ts" },
  { name: "claims", script: "scripts/validate-claims.ts" },
  { name: "topics", script: "scripts/validate-topics.ts" },
  { name: "evidence packets", script: "scripts/validate-evidence.ts" },
  { name: "dependency audit", script: "scripts/audit-evidence-dependencies.ts" },
]

console.log("Running the full evidence gate (validate:evidence-all), in dependency order...\n")

for (const step of STEPS) {
  console.log(`--- ${step.name} (${step.script}) ---`)
  const result = spawnSync("npx", ["tsx", step.script], { stdio: "inherit" })

  if (result.error) {
    console.error(`\n[validate-evidence-all] FAILED to run ${step.script}: ${result.error.message}`)
    process.exit(1)
  }

  if (result.status !== 0) {
    console.error(`\n[validate-evidence-all] FAIL at step "${step.name}" — stopping here (fail fast). Fix this before continuing.`)
    process.exit(result.status ?? 1)
  }

  console.log("")
}

console.log("OK: every evidence validator passed, in order — sources, claims, topics, evidence packets, dependency audit.")
