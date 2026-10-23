import { isEditorialPreview } from "./lib/editorial-preview-mode.mjs"

const editorialPreview = isEditorialPreview()

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  distDir: editorialPreview ? ".next-editorial-preview" : ".next",
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
    ],
  },
  async redirects() {
    return [
      // Keep old directory links useful without a geographic service-area claim.
      { source: "/city-resources", destination: "/find-support", permanent: true },
      // Common slug variations
      {
        source: "/cityresources",
        destination: "/find-support",
        permanent: true,
      },
      {
        source: "/resources",
        destination: "/education",
        permanent: true,
      },
      {
        source: "/articles",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/learn",
        destination: "/education",
        permanent: true,
      },
      {
        source: "/telehealth",
        destination: "/blog/choosing-telehealth-weight-loss-service",
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...(editorialPreview
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]
            : []),
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
