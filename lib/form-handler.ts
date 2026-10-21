import { z } from "zod"

type Delivery = (data: Record<string, unknown>) => Promise<unknown>

export async function handleForm(
  request: Request,
  schema: z.ZodTypeAny,
  deliver: Delivery,
  successMessage = "Your message has been sent. Thank you for getting in touch.",
) {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin)
    return Response.json(
      { ok: false, message: "Please submit this form from our website." },
      { status: 403 },
    )
  let data: Record<string, unknown>
  try {
    const body = await request.text()
    if (body.length > 16000)
      return Response.json(
        { ok: false, message: "Please shorten your message." },
        { status: 413 },
      )
    data = schema.parse(JSON.parse(body))
  } catch {
    return Response.json(
      { ok: false, message: "Please check the form and try again." },
      { status: 400 },
    )
  }
  try {
    await deliver(data)
    return Response.json({ ok: true, message: successMessage })
  } catch {
    // Do not log form contents, email addresses, or provider credentials.
    console.error("Contact delivery unavailable")
    return Response.json(
      {
        ok: false,
        message:
          "Your message was not sent. Please email info@weightliteracy.org instead.",
      },
      { status: 503 },
    )
  }
}
