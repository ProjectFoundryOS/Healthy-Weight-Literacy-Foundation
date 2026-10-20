import { createHash } from "node:crypto"
import { readFile, realpath } from "node:fs/promises"
import { resolve, relative, isAbsolute } from "node:path"
import { articleImages, articleVisualSetSchema, type ArticleVisualSet } from "./article-visuals.ts"

/** Run at export/build time; production requests need no filesystem or database. */
export async function verifyArticleAssets(visuals: ArticleVisualSet | undefined, publicDirectory: string) {
  if (!visuals) return
  const checked = articleVisualSetSchema.parse(visuals)
  const root = await realpath(publicDirectory)
  for (const image of articleImages(checked)) {
    const file = await realpath(resolve(root, `.${image.src}`))
    const fromRoot = relative(root, file)
    if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) throw new Error(`Image must stay inside public: ${image.src}`)
    const bytes = await readFile(file)
    if (!bytes.length || createHash("sha256").update(bytes).digest("hex") !== image.sha256) {
      throw new Error(`Image integrity check failed: ${image.src}`)
    }
  }
}
