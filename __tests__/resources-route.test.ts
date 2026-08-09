import { describe, it, expect } from "vitest"
import { existsSync } from "node:fs"
import path from "node:path"
import { ROUTES, VALID_ROUTES, dynamicRoutes } from "@/lib/routes"
import nextConfig from "../next.config.mjs"

// Issue #25: the repo previously had a contradiction — app/resources/page.tsx
// was a real page, ROUTES.RESOURCES/VALID_ROUTES treated "/resources" as
// valid, next.config.mjs permanently redirected "/resources" away, and
// __tests__/routes.test.ts expected it to be invalid. Investigation of
// navigation (components/layout/header.tsx), the footer
// (components/layout/footer.tsx), and app/sitemap.ts found that none of
// them ever linked to "/resources" — only to "/city-resources" — and the
// redirect already made the index page unreachable in practice.
//
// Decision: "/resources" (a static guides/workbooks index, unrelated to the
// city resource directory) is INTENTIONALLY RETIRED, superseded by
// "/city-resources". The page, its route constant, its dynamic-route
// helper, and its dead-code dependencies (lib/mdx.ts Resource
// interface/array, components/blocks/resource-grid.tsx) were removed. The
// redirect to "/city-resources" is preserved for both the index and any
// individual guide URL, so existing external links/bookmarks land
// somewhere useful instead of 404ing.
describe("/resources routing decision (Issue #25)", () => {
  it("has no ROUTES.RESOURCES constant and is absent from VALID_ROUTES", () => {
    expect((ROUTES as Record<string, unknown>).RESOURCES).toBeUndefined()
    expect(VALID_ROUTES).not.toContain("/resources")
  })

  it("has no dynamicRoutes.resource() helper", () => {
    expect((dynamicRoutes as Record<string, unknown>).resource).toBeUndefined()
  })

  it("has no app/resources page files on disk", () => {
    const root = path.join(process.cwd(), "app", "resources")
    expect(existsSync(root)).toBe(false)
  })

  it("has no dead ResourceGrid component on disk", () => {
    const componentPath = path.join(process.cwd(), "components", "blocks", "resource-grid.tsx")
    expect(existsSync(componentPath)).toBe(false)
  })

  it("permanently redirects /resources and /resources/:slug to /city-resources", async () => {
    const redirects = await nextConfig.redirects()
    const indexRedirect = redirects.find((r: { source: string }) => r.source === "/resources")
    const slugRedirect = redirects.find((r: { source: string }) => r.source === "/resources/:slug")

    expect(indexRedirect).toMatchObject({ destination: "/city-resources", permanent: true })
    expect(slugRedirect).toMatchObject({ destination: "/city-resources", permanent: true })
  })

  it("city-resources remains the canonical, linked page", () => {
    expect(ROUTES.CITY_RESOURCES).toBe("/city-resources")
    expect(VALID_ROUTES).toContain("/city-resources")
    const pagePath = path.join(process.cwd(), "app", "city-resources", "page.tsx")
    expect(existsSync(pagePath)).toBe(true)
  })
})
