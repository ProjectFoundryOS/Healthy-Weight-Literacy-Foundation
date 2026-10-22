import { newsletterFormSchema } from "@/lib/validators"
import { handleForm } from "@/lib/form-handler"
import { saveNewsletterSignup } from "@/lib/newsletter-storage"

export const runtime = "nodejs"

export async function POST(request: Request) {
  return handleForm(
    request,
    newsletterFormSchema,
    (data) => saveNewsletterSignup(String(data.email)),
    "Thank you. Your newsletter signup has been saved.",
    "Your signup could not be saved. Please try again or email info@weightliteracy.org.",
  )
}
