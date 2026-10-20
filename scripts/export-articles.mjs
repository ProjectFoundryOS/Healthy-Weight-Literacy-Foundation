import { readFile, readdir, realpath, writeFile, rename } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { exportArticle } from "../lib/editorial-export.ts"
import { readPublishedCatalog } from "../lib/article-publication.ts"
import { verifyArticleAssets } from "../lib/article-assets.ts"

// Local preparation only. No git push, API call, or deployment operation.
const args = process.argv.slice(2)
const write = args.includes("--write")
const input = args.filter((arg) => arg !== "--write")
if (input.length !== 1) throw new Error("Usage: node scripts/export-articles.mjs /path/to/private/editorial [--write]")
const root = await realpath(input[0])
const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const output = path.join(website, "content/articles/catalog.json")
const sources = JSON.parse(await readFile(path.join(root, "sources.json"), "utf8")).sources
const articles = []
let skipped = 0
for (const filename of (await readdir(path.join(root, "records"))).filter((f) => f.endsWith(".json")).sort()) {
  const record = JSON.parse(await readFile(path.join(root, "records", filename), "utf8"))
  if (record.status !== "approved" || record.publish !== true) { skipped++; continue }
  const bodyPath = await realpath(path.resolve(root, record.body_path))
  const relative = path.relative(root, bodyPath)
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Article body must stay inside the editorial workspace")
  const article = exportArticle(record, await readFile(bodyPath, "utf8"), sources)
  await verifyArticleAssets(article.metadata.visuals, path.join(website, "public"))
  articles.push(article)
}
const catalog = { schema_version: 1, purpose: "publication", articles }
readPublishedCatalog(catalog)
const previous = JSON.parse(await readFile(output, "utf8"))
const nextSlugs = new Set(articles.map((entry) => entry.metadata.slug))
const removed = previous.articles.filter((entry) => !nextSlugs.has(entry.metadata.slug))
if (removed.length) throw new Error("Export would withdraw existing articles. Use an explicit reviewed withdrawal change instead.")
console.log(JSON.stringify({ approved: articles.length, skipped_drafts: skipped, mode: write ? "write" : "dry-run" }))
if (write) {
  if (!articles.length) throw new Error("No approved articles; existing catalog left unchanged")
  await writeFile(`${output}.tmp`, JSON.stringify(catalog, null, 2) + "\n", { flag: "wx" })
  await rename(`${output}.tmp`, output)
  console.log("Wrote approved public content locally. Nothing was pushed or deployed.")
}
