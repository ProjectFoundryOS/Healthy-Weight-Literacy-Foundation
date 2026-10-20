/** Draft access is a local development feature, never a publication mode. */
export function isEditorialPreview(env = process.env) {
  if (!env.HWLF_EDITORIAL_PREVIEW_DIR) return false
  if (env.NODE_ENV !== "development" || env.VERCEL || env.CI) {
    throw new Error("Editorial previews require local development; builds and hosted runs are not allowed")
  }
  return true
}
