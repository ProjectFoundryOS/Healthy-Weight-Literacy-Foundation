import type { Metadata } from "next"

export const siteConfig = {
  name: "Healthy Weight Literacy Foundation",
  shortName: "WeightLiteracy",
  description:
    "Healthy Weight Literacy Foundation exists to improve public health by providing clear, evidence-based education on nutrition, weight management, and metabolic health so individuals and communities can make informed, sustainable lifestyle decisions.",
  url: "https://weightliteracy.org",
  ogImage: "https://www.weightliteracy.org/opengraph-image",
  email: "info@weightliteracy.org",
  phone: "",
  address: {
    street: "736 Miami Chapel Rd",
    city: "Dayton",
    state: "OH",
    zip: "45417-4651",
    country: "United States",
  },
  ein: "41-2983678",
  social: {
    twitter: "https://twitter.com/hwlfoundation",
    facebook: "https://www.facebook.com/weightliteracy",
    instagram: "https://www.instagram.com/weight.literacy",
    linkedin: "https://www.linkedin.com/company/weightliteracy",
    youtube: "",
  },
}

export function generatePageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  noIndex?: boolean
}): Metadata {
  const url = `${siteConfig.url}${path}`
  const ogImage = new URL(image || siteConfig.ogImage, siteConfig.url).href

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: imageWidth ?? 1200,
          height: imageHeight ?? 630,
          alt: imageAlt ?? title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: siteConfig.name,
  alternateName: siteConfig.shortName,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.svg`,
  description: siteConfig.description,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.zip,
    addressCountry: siteConfig.address.country,
  },
  nonprofitStatus: "Nonprofit501c3",
}

export function generateArticleJsonLd({
  title,
  description,
  publishedTime,
  modifiedTime,
  author,
  image,
  url,
}: {
  title: string
  description: string
  publishedTime: string
  modifiedTime?: string
  author: string
  image: string
  url: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  }
}

export function generateFAQJsonLd(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export const generateFAQSchema = generateFAQJsonLd
