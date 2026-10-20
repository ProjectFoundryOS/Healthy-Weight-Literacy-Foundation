import { readFile, writeFile } from "node:fs/promises"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { visualFixture } from "../__tests__/fixtures/publication.ts"
import { verifyArticleAssets } from "../lib/article-assets.ts"

// A non-health fixture exercises full rendering without approving real drafts.
// This script must never be a deployment build command.
if (process.env.CI || process.env.VERCEL) throw new Error("Local publishing smoke build cannot run in CI or Vercel")
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const file = path.join(root, "content/articles/catalog.json")
const original = await readFile(file)
try {
  const entry = visualFixture()
  await verifyArticleAssets(entry.metadata.visuals, path.join(root, "public"))
  await writeFile(file, JSON.stringify({ schema_version: 1, purpose: "local-test", articles: [entry] }, null, 2) + "\n")
  const code = await new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "build", "--", "--webpack"], {
      cwd: root, stdio: "inherit",
      // Deliberately stale/invalid legacy settings prove they cannot select
      // the old reader. This build must work without any database connection.
      env: {
        ...process.env, HWLF_ARTICLE_SOURCE: "hybrid", HWLF_LOCAL_CONTENT_TEST: "1",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:1", SUPABASE_URL: "http://127.0.0.1:1",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "unused-test-value", SUPABASE_ANON_KEY: "unused-test-value",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    })
    child.once("error", reject)
    child.once("exit", (code) => resolve(code ?? 1))
  })
  process.exitCode = code
} finally {
  await writeFile(file, original)
  console.log("Restored the original public catalog. Build output contains local test content only.")
}
