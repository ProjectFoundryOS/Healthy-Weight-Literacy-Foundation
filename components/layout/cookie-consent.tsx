"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
export function CookiePreferences() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event("weightliteracy-cookie-settings"))
      }
      className="min-h-10 text-left underline underline-offset-4"
    >
      Cookie preferences
    </button>
  )
}
export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    try {
      setVisible(!localStorage.getItem("hwlf-cookie-consent"))
    } catch {
      setVisible(true)
    }
    const open = () => setVisible(true)
    window.addEventListener("weightliteracy-cookie-settings", open)
    return () =>
      window.removeEventListener("weightliteracy-cookie-settings", open)
  }, [])
  function choose(value: "accepted" | "declined") {
    let previous: string | null = null
    try {
      previous = localStorage.getItem("hwlf-cookie-consent")
      localStorage.setItem("hwlf-cookie-consent", value)
    } catch {
      /* Reading remains available without storage. */
    }
    window.dispatchEvent(new Event("weightliteracy-consent"))
    setVisible(false)
    // Remove already-loaded analytics scripts by starting a fresh, declined session.
    if (previous === "accepted" && value === "declined")
      window.location.reload()
  }
  if (!visible) return null
  return (
    <div
      className="cookie-banner fixed inset-x-0 bottom-0 z-50 border-t bg-white p-4 shadow-lg"
      role="region"
      aria-label="Cookie preferences"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Help us understand which resources are useful. Optional analytics run
          only if you accept. You can change your choice in the footer.{" "}
          <Link
            href="/cookies"
            className="text-primary underline underline-offset-4"
          >
            Cookie policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="outline" onClick={() => choose("declined")}>
            Decline
          </Button>
          <Button onClick={() => choose("accepted")}>Accept analytics</Button>
        </div>
      </div>
    </div>
  )
}
