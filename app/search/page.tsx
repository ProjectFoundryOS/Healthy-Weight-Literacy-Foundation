import { getSearchIndex } from "@/lib/search-index"
import { SearchPageClient } from "./search-page-client"

// Server Component: builds the search index (content-registry + programs +
// resources) once per request using node:fs, then hands the plain,
// serializable array to the client component for interactive filtering.
// The index itself must never be built in the browser bundle — the
// registry it draws from reads the committed snapshot from disk.
export default function SearchPage() {
  const searchIndex = getSearchIndex()
  return <SearchPageClient searchIndex={searchIndex} />
}
