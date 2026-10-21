import { Resend } from "resend"

export function contactDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

export async function sendAdminNotification({
  subject,
  html,
  replyTo,
}: {
  subject: string
  html: string
  replyTo?: string
}) {
  if (!contactDeliveryConfigured())
    throw new Error("Contact delivery is not configured")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const result = await resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ||
      "Healthy Weight Literacy Foundation <onboarding@resend.dev>",
    to: [process.env.ADMIN_EMAIL || "info@weightliteracy.org"],
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  })
  // The SDK resolves on provider errors; a resolved promise is not proof of acceptance.
  if (result.error || !result.data?.id)
    throw new Error("Email provider did not accept the message")
  return result.data
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function sendUserConfirmation({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!contactDeliveryConfigured())
    throw new Error("Email delivery is not configured")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const result = await resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ||
      "Healthy Weight Literacy Foundation <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
  })
  if (result.error || !result.data?.id)
    throw new Error("Email provider did not accept the confirmation")
  return result.data
}
