import { contactFormSchema } from "@/lib/validators"
import { handleForm } from "@/lib/form-handler"
import { sendAdminNotification, escapeHtml } from "@/lib/resend"

export async function POST(request: Request) {
  return handleForm(request, contactFormSchema, async (data) => {
    await sendAdminNotification({
      subject: "[WeightLiteracy] Contact inquiry",
      replyTo: String(data.email),
      html: Object.entries(data)
        .map(
          ([key, value]) =>
            `<p><strong>${escapeHtml(key)}:</strong><br />${escapeHtml(String(value ?? "")).replace(/\n/g, "<br />")}</p>`,
        )
        .join(""),
    })
  })
}
