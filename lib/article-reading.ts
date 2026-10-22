export const READING_ACTIVE_MS = 90_000
export const READING_PROGRESS = 0.75
export const READING_IDLE_MS = 30_000
export const READING_SESSION_MS = 30 * 60_000
export const READING_STORAGE_KEY = "wl-qualified-reading-v1"

export type ReadingSample = {
  now: number
  consent: boolean
  visible: boolean
  focused: boolean
  inArticle: boolean
  progress: number
  lastInteraction: number
}

/** A conservative engagement proxy, not evidence that a reader understood the article. */
export class ArticleReadingMeter {
  activeMs = 0
  maxProgress = 0
  private previous: ReadingSample | null = null

  sample(current: ReadingSample): boolean {
    if (!current.consent) {
      this.activeMs = 0
      this.maxProgress = 0
      this.previous = null
      return false
    }
    const active = (s: ReadingSample) =>
      s.visible && s.focused && s.inArticle &&
      s.now >= s.lastInteraction && s.now - s.lastInteraction < READING_IDLE_MS

    if (active(current)) {
      this.maxProgress = Math.max(this.maxProgress, Math.min(1, Math.max(0, current.progress)))
      if (this.previous && active(this.previous)) {
        // Never count a long suspended/throttled timer gap as reading.
        const elapsed = current.now - this.previous.now
        if (elapsed > 0 && elapsed <= 2_000) this.activeMs += elapsed
      }
    }
    this.previous = current
    return active(current) && this.activeMs >= READING_ACTIVE_MS && this.maxProgress >= READING_PROGRESS
  }
}

export type ReadingSession = { lastActiveAt: number; reported: boolean }

export function readReadingSession(raw: string | null, now: number): ReadingSession {
  try {
    const value = JSON.parse(raw ?? "null")
    if (value && Number.isFinite(value.lastActiveAt) &&
      typeof value.reported === "boolean" && value.lastActiveAt <= now &&
      now - value.lastActiveAt < READING_SESSION_MS) return value
  } catch { /* Invalid/old storage starts a new measurement session. */ }
  return { lastActiveAt: now, reported: false }
}

/** Progress through the body, excluding the header, hero, related links and footer. */
export function articleReadingPosition(top: number, bottom: number, viewport: number) {
  const height = bottom - top
  const inArticle = Number.isFinite(height) && height > 0 && top < viewport && bottom > 0
  return {
    inArticle,
    progress: inArticle ? Math.min(1, Math.max(0, (viewport - top) / height)) : 0,
  }
}
