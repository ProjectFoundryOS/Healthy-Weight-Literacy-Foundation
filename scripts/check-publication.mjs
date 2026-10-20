import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { readPublishedCatalog, resolveArticleCatalog } from "../lib/article-publication.ts"
import { verifyArticleAssets } from "../lib/article-assets.ts"
import { articleImages } from "../lib/article-visuals.ts"

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const catalog = JSON.parse(await readFile(path.join(website, "content/articles/catalog.json"), "utf8"))
const articles = resolveArticleCatalog(readPublishedCatalog(catalog))
const images = new Set()
for (const article of articles) {
  await verifyArticleAssets(article.visuals, path.join(website, "public"))
  for (const image of articleImages(article.visuals)) images.add(image.src)
}
console.log(`Publication check passed: ${articles.length} articles, ${images.size} verified image files.`)
