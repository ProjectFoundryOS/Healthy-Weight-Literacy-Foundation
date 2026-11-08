import { trackEvent } from "@/components/analytics/ga4-provider";

const SESSION_KEY = "wl-question-guide-download-requested";

// Called only after a deliberate, nonempty guide download has been initiated.
// No guide topic, selected questions, answers, notes or measurements are sent.
export function trackQuestionGuideDownloadRequest() {
  try {
    if (typeof window === "undefined" ||
        !["weightliteracy.org", "www.weightliteracy.org"].includes(window.location.hostname) ||
        typeof (window as unknown as { gtag?: unknown }).gtag !== "function" ||
        localStorage.getItem("hwlf-cookie-consent") !== "accepted" ||
        sessionStorage.getItem(SESSION_KEY)) return;
    // Fail closed if storage is unavailable; the download itself still works.
    sessionStorage.setItem(SESSION_KEY, "1");
    trackEvent("question_guide_download_requested", "education", "question_guide");
  } catch {
    // Analytics must never prevent access to the guide.
  }
}
