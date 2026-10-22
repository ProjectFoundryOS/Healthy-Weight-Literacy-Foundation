"use client"

import { useEffect } from "react"
import { analyticsPageLocation } from "@/lib/analytics-location"
import {
  ArticleReadingMeter, articleReadingPosition, readReadingSession,
  READING_ACTIVE_MS, READING_PROGRESS, READING_STORAGE_KEY, READING_IDLE_MS,
} from "@/lib/article-reading"

/** No audience lists, identity fields, article titles or medical-topic parameters. */
export function ArticleReadingTracker() {
  useEffect(() => {
    const body = document.getElementById("article-reading-content")
    if (!body) return
    let meter = new ArticleReadingMeter()
    let lastInteraction = Number.NEGATIVE_INFINITY
    let sent = false
    const qa = new URLSearchParams(window.location.search).get("reading_qa") === "1"
    const storageKey = READING_STORAGE_KEY + (qa ? "-qa" : "")
    const consent = () => {
      try { return localStorage.getItem("hwlf-cookie-consent") === "accepted" }
      catch { return false }
    }

    const sample = () => {
      const allowed = consent()
      const now = performance.now()
      const rect = body.getBoundingClientRect()
      const position = articleReadingPosition(rect.top, rect.bottom, window.innerHeight)
      const visible = document.visibilityState === "visible"
      const focused = document.hasFocus()
      const qualified = meter.sample({
        now, consent: allowed, visible, focused, ...position, lastInteraction,
      })
      if (!allowed || !visible || !focused || !position.inArticle ||
          now - lastInteraction >= READING_IDLE_MS) return
      try {
        const wallTime = Date.now()
        const session = readReadingSession(sessionStorage.getItem(storageKey), wallTime)
        session.lastActiveAt = wallTime
        sessionStorage.setItem(storageKey, JSON.stringify(session))
        if (session.reported || sent) return
        const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
        if (!qualified || typeof gtag !== "function" || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return
        // QA exercises the same thresholds but can never create the bidding event.
        const eventName = qa ? "article_read_qualified_qa" : "article_read_qualified"
        gtag("event", eventName, {
          send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
          event_category: "education",
          active_reading_seconds: READING_ACTIVE_MS / 1000,
          article_progress_percent: READING_PROGRESS * 100,
          measurement_version: "active90_progress75_v1",
          page_location: analyticsPageLocation(window.location.href),
          page_path: window.location.pathname,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        })
        sessionStorage.setItem(storageKey, JSON.stringify({ ...session, reported: true }))
        sent = true
      } catch { /* Fail closed if session storage is blocked; do not inflate conversions. */ }
    }

    const interact = (event: Event) => {
      if (!event.isTrusted) return
      if (performance.now() - lastInteraction < 1000) return
      // Close the previous interval before activity can revive an idle timer.
      sample()
      lastInteraction = performance.now()
      sample()
    }
    const onConsent = () => {
      meter = new ArticleReadingMeter()
      lastInteraction = Number.NEGATIVE_INFINITY
      sample()
    }
    const activityEvents = ["scroll", "pointerdown", "pointermove", "keydown", "touchstart"]
    for (const name of activityEvents) window.addEventListener(name, interact, { passive: true })
    window.addEventListener("focus", sample)
    window.addEventListener("blur", sample)
    window.addEventListener("weightliteracy-consent", onConsent)
    document.addEventListener("visibilitychange", sample)
    const timer = window.setInterval(sample, 1000)
    sample()
    return () => {
      window.clearInterval(timer)
      for (const name of activityEvents) window.removeEventListener(name, interact)
      window.removeEventListener("focus", sample)
      window.removeEventListener("blur", sample)
      window.removeEventListener("weightliteracy-consent", onConsent)
      document.removeEventListener("visibilitychange", sample)
    }
  }, [])
  return null
}
