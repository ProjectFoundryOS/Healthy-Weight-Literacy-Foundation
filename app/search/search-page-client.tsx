"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { SearchIcon } from "lucide-react"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { filterSearchIndex, type SearchItem, type SearchResult } from "@/lib/search-filter"

interface SearchContentProps {
  searchIndex: SearchItem[]
}

function SearchContent({ searchIndex }: SearchContentProps) {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const results = useMemo(
    () => (query.length >= 2 ? filterSearchIndex(searchIndex, query) : []),
    [query, searchIndex],
  )

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>,
  )

  return (
    <>
      {/* Search Input */}
      <Section>
        <Container size="sm">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search educational resources and articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
              autoFocus
            />
          </div>
          {query.length >= 2 && (
            <p className="mt-4 text-sm text-muted-foreground text-center">
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
          )}
        </Container>
      </Section>

      {/* Results */}
      <Section background="muted">
        <Container>
          {query.length < 2 ? (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Enter at least 2 characters to search educational content</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-muted-foreground">
                Try different keywords or browse our{" "}
                <Link href="/programs" className="text-primary hover:underline">
                  programs
                </Link>{" "}
                and{" "}
                <Link href="/education" className="text-primary hover:underline">
                  education
                </Link>{" "}
                sections.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <h2 className="text-xl font-bold text-secondary mb-4 capitalize">{type}</h2>
                  <div className="grid gap-4">
                    {items.map((result) => (
                      <Link key={result.slug} href={`/${result.type}/${result.slug}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-4">
                              <CardTitle className="text-lg">{result.title}</CardTitle>
                              <Badge variant="outline" className="capitalize shrink-0">
                                {result.type}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="line-clamp-2">{result.excerpt}</CardDescription>
                            {result.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}

interface SearchPageClientProps {
  searchIndex: SearchItem[]
}

export function SearchPageClient({ searchIndex }: SearchPageClientProps) {
  return (
    <>
      <PageHeader
        title="Search"
        description="Find educational resources, articles, and programs to support informed health decisions."
        breadcrumbs={[{ label: "Search" }]}
      />

      <Suspense
        fallback={
          <Section>
            <Container size="sm">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search educational resources and articles..."
                  className="pl-12 py-6 text-lg"
                  disabled
                />
              </div>
            </Container>
          </Section>
        }
      >
        <SearchContent searchIndex={searchIndex} />
      </Suspense>
    </>
  )
}
