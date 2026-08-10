import { describe, it, expect } from "vitest"
import {
  validateCannibalizationCluster,
  findDuplicateClusterIds,
  loadCannibalizationClusters,
  getClusterIds,
  type CannibalizationCluster,
} from "@/lib/cannibalization-registry"
import { getManifestArticles, type ManifestArticleEntry } from "@/lib/content-registry"

function makeManifestEntry(overrides: Partial<ManifestArticleEntry> = {}): ManifestArticleEntry {
  return {
    slug: "slug-a",
    id: "id-1",
    is_published: true,
    published_at: "2025-01-01",
    updated_at: "2025-01-01",
    sha256: "hash-a",
    ...overrides,
  }
}

function makeCluster(overrides: Partial<CannibalizationCluster> = {}): CannibalizationCluster {
  return {
    cluster_id: "cluster-example",
    article_slugs: ["slug-a", "slug-b"],
    shared_question: "What is the shared reader question?",
    overlap_dimensions: ["claim_set", "reader_intent"],
    meaningful_differences: [],
    recommended_action: "merge",
    recommended_survivor_slug: "slug-a",
    confidence: "high",
    ...overrides,
  }
}

const manifest = [makeManifestEntry({ slug: "slug-a" }), makeManifestEntry({ slug: "slug-b" })]

describe("validateCannibalizationCluster", () => {
  it("PASSES a well-formed merge cluster", () => {
    const { valid, errors } = validateCannibalizationCluster(makeCluster(), manifest)
    expect(valid).toBe(true)
    expect(errors).toEqual([])
  })

  it("FAILS a cluster with fewer than two article_slugs", () => {
    const { valid, errors } = validateCannibalizationCluster(makeCluster({ article_slugs: ["slug-a"] }), manifest)
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("at least two articles"))).toBe(true)
  })

  it("FAILS a cluster referencing an unknown article slug", () => {
    const { valid, errors } = validateCannibalizationCluster(
      makeCluster({ article_slugs: ["slug-a", "slug-does-not-exist"] }),
      manifest,
    )
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('unknown slug "slug-does-not-exist"'))).toBe(true)
  })

  it("FAILS a cluster with an empty overlap_dimensions array", () => {
    const { valid, errors } = validateCannibalizationCluster(makeCluster({ overlap_dimensions: [] }), manifest)
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("overlap_dimensions"))).toBe(true)
  })

  it("FAILS a cluster with an unknown recommended_action", () => {
    const cluster = { ...makeCluster(), recommended_action: "delete" as unknown as CannibalizationCluster["recommended_action"] }
    const { valid, errors } = validateCannibalizationCluster(cluster, manifest)
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("unknown recommended_action"))).toBe(true)
  })

  it('FAILS a "merge" cluster with no recommended_survivor_slug', () => {
    const { valid, errors } = validateCannibalizationCluster(
      makeCluster({ recommended_action: "merge", recommended_survivor_slug: undefined }),
      manifest,
    )
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes('"merge" requires recommended_survivor_slug'))).toBe(true)
  })

  it("FAILS when recommended_survivor_slug is not one of the cluster's own article_slugs", () => {
    const { valid, errors } = validateCannibalizationCluster(
      makeCluster({ recommended_survivor_slug: "slug-not-in-cluster" }),
      manifest,
    )
    expect(valid).toBe(false)
    expect(errors.some((e) => e.includes("is not one of this cluster's own article_slugs"))).toBe(true)
  })

  it('PASSES a "differentiate_and_keep_both" cluster with no recommended_survivor_slug', () => {
    const { valid } = validateCannibalizationCluster(
      makeCluster({ recommended_action: "differentiate_and_keep_both", recommended_survivor_slug: undefined }),
      manifest,
    )
    expect(valid).toBe(true)
  })
})

describe("findDuplicateClusterIds", () => {
  it("flags a duplicate cluster_id", () => {
    const clusters = [makeCluster({ cluster_id: "cluster-1" }), makeCluster({ cluster_id: "cluster-1" })]
    expect(findDuplicateClusterIds(clusters)).toEqual(["cluster-1"])
  })

  it("returns empty when cluster ids are unique", () => {
    const clusters = [makeCluster({ cluster_id: "cluster-1" }), makeCluster({ cluster_id: "cluster-2" })]
    expect(findDuplicateClusterIds(clusters)).toEqual([])
  })
})

describe("getClusterIds", () => {
  it("returns a Set of every cluster_id", () => {
    const clusters = [makeCluster({ cluster_id: "cluster-1" }), makeCluster({ cluster_id: "cluster-2" })]
    expect(getClusterIds(clusters)).toEqual(new Set(["cluster-1", "cluster-2"]))
  })
})

describe("real content/audits/stage4/cannibalization.json", () => {
  it("loads and validates cleanly against the real manifest", () => {
    const manifestArticles = getManifestArticles()
    const clusters = loadCannibalizationClusters(manifestArticles)
    expect(clusters.length).toBe(7)

    expect(findDuplicateClusterIds(clusters)).toEqual([])
    for (const cluster of clusters) {
      const { valid, errors } = validateCannibalizationCluster(cluster, manifestArticles)
      expect(valid, `${cluster.cluster_id}: ${errors.join("; ")}`).toBe(true)
    }
  })

  it("every merge cluster names a real survivor among its own article_slugs", () => {
    const manifestArticles = getManifestArticles()
    const clusters = loadCannibalizationClusters(manifestArticles)
    for (const cluster of clusters.filter((c) => c.recommended_action === "merge")) {
      expect(cluster.recommended_survivor_slug).toBeTruthy()
      expect(cluster.article_slugs).toContain(cluster.recommended_survivor_slug)
    }
  })
})
