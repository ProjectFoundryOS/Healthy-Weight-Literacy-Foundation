import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"
import { organizationJsonLd } from "@/lib/seo"
import { GA4Provider } from "@/components/analytics/ga4-provider"
import { CookieConsent } from "@/components/layout/cookie-consent"
import { checkRequiredEnvVars } from "@/lib/check-env"
import { isEditorialPreview } from "@/lib/editorial-preview-mode.mjs"
import Link from "next/link"

if (process.env.NODE_ENV === "development") {
  checkRequiredEnvVars()
}

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://weightliteracy.org"),
  title: {
    default: "Healthy Weight Literacy Foundation | Evidence-Based Health Education",
    template: "%s | Healthy Weight Literacy Foundation",
  },
  description:
    "Improving public health through clear, evidence-based education on nutrition, weight management, and metabolic health. Empowering individuals and communities to make informed, sustainable lifestyle decisions.",
  keywords: [
    "health literacy",
    "nutrition education",
    "weight management",
    "metabolic health",
    "nonprofit",
    "evidence-based education",
    "public health",
    "weight literacy",
  ],
  authors: [{ name: "Healthy Weight Literacy Foundation" }],
  creator: "Healthy Weight Literacy Foundation",
  publisher: "Healthy Weight Literacy Foundation",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://weightliteracy.org",
    siteName: "Healthy Weight Literacy Foundation",
    title: "Healthy Weight Literacy Foundation | Evidence-Based Health Education",
    description:
      "Improving public health through clear, evidence-based education on nutrition, weight management, and metabolic health.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Healthy Weight Literacy Foundation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Healthy Weight Literacy Foundation",
    description:
      "Improving public health through clear, evidence-based education on nutrition, weight management, and metabolic health.",
    images: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=630&fit=crop"],
    creator: "@hwlfoundation",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "leBIqjXCkqYmnfmaruVk0B9tuMCsE6Pj2rZT16_9rWA",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const editorialPreview = isEditorialPreview()
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Header />
        {editorialPreview ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
            <strong>Article preview</strong> · Unpublished drafts
            <Link href="/blog" className="ml-3 font-semibold underline underline-offset-4">Browse all five articles</Link>
          </div>
        ) : null}
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
        {!editorialPreview ? <><Analytics /><GA4Provider /><CookieConsent /></> : null}

      </body>
    </html>
  )
}
