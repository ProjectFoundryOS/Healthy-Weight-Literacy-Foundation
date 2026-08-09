/** @type {import('next').NextConfig} */
const nextConfig = {
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
      // Common slug variations
      {
        source: "/cityresources",
        destination: "/city-resources",
        permanent: true,
      },
      // Issue #25: "/resources" (a static guides/workbooks index, unrelated
      // to the city resource directory) was retired — no navigation,
      // footer, or sitemap entry ever pointed to it, and this redirect
      // already made the index page unreachable. The page, its route
      // constant, and its dead-code dependencies were removed; this
      // redirect is preserved so any existing external links/bookmarks
      // still land somewhere useful rather than 404ing.
      {
        source: "/resources",
        destination: "/city-resources",
        permanent: true,
      },
      {
        source: "/resources/:slug",
        destination: "/city-resources",
        permanent: true,
      },
      {
        source: "/articles",
        destination: "/education",
        permanent: true,
      },
      {
        source: "/learn",
        destination: "/education",
        permanent: true,
      },
      {
        source: "/telehealth",
        destination: "/telehealth-intake",
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
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
