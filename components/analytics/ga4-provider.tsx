"use client"

import Script from "next/script"
import { useState, useEffect } from "react"
import { Analytics } from "@vercel/analytics/next"
import { analyticsPageLocation } from "@/lib/analytics-location"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function GA4Provider() {
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    const update = () => {
      try {
        setAllowed(localStorage.getItem("hwlf-cookie-consent") === "accepted")
      } catch {
        setAllowed(false)
      }
    }
    update()
    window.addEventListener("weightliteracy-consent", update)
    return () => window.removeEventListener("weightliteracy-consent", update)
  }, [])
  if (!allowed) return null
  if (!GA_MEASUREMENT_ID) return <Analytics />

  return (
    <>
      <Analytics />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            page_location: ${JSON.stringify(analyticsPageLocation(window.location.href))},
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
          });
        `}
      </Script>
    </>
  )
}

export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number,
) {
  if (typeof window !== "undefined" && "gtag" in window) {
    try {
      if (localStorage.getItem("hwlf-cookie-consent") !== "accepted") return
    } catch {
      return
    }
    ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      "event",
      action,
      {
        event_category: category,
        event_label: label,
        value: value,
      },
    )
  }
}
