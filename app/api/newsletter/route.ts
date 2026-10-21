import { newsletterFormSchema } from "@/lib/validators"
import { handleForm } from "@/lib/form-handler"
import {
  sendAdminNotification,
  sendUserConfirmation,
  escapeHtml,
} from "@/lib/resend"

export async function POST(request: Request) {
  return handleForm(
    request,
    newsletterFormSchema,
    async (data) => {
      const email = String(data.email)
      // Preserve the existing email-based signup workflow. Admin acceptance is required.
      await sendAdminNotification({
        subject: "[WeightLiteracy Newsletter] Signup request",
        replyTo: email,
        html: `<h2>Newsletter signup request</h2><p>Email: ${escapeHtml(email)}</p><p>Explicit newsletter consent: yes</p><p>Received: ${new Date().toISOString()}</p><p>Add this request to the newsletter list through your existing workflow. This notification does not itself create a list contact.</p>`,
      })
      try {
        await sendUserConfirmation({
          to: email,
          subject: "Your WeightLiteracy newsletter signup request",
          html: `<h2>Thank you for your interest in WeightLiteracy.</h2><p>Your newsletter signup request has been sent to our team.</p><p>In the meantime, explore our <a href="https://www.weightliteracy.org/blog">free articles</a> and <a href="https://www.weightliteracy.org/news">News &amp; Research</a>.</p><p>To withdraw your request or unsubscribe, email <a href="mailto:info@weightliteracy.org?subject=Unsubscribe">info@weightliteracy.org</a>.</p>`,
        })
      } catch {
        console.error(
          "Newsletter receipt email unavailable; signup notification accepted",
        )
      }
    },
    "Thank you. Your newsletter signup request has been sent.",
  )
}
