"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { contactFormSchema, type ContactFormData } from "@/lib/validators"
import { trackContactFormSubmit } from "@/lib/analytics-events"

export function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [message, setMessage] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle")
        setMessage("")
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [status])

  async function onSubmit(data: ContactFormData) {
    setStatus("loading")
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (response.ok && result.ok) {
        setStatus("success")
        setMessage(
          "Thank you for your message! We'll get back to you as soon as we can.",
        )
        trackContactFormSubmit("contact_page")
        reset()
      } else {
        throw new Error(result.message)
      }
    } catch {
      setStatus("error")
      setMessage(
        "Your message was not sent. Please try again or email info@weightliteracy.org.",
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {status === "success" && (
        <Alert className="bg-success/10 border-success text-success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-danger">*</span>
          </Label>
          <Input
            id="name"
            autoComplete="name"
            {...register("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-required="true"
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-danger" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-danger">*</span>
          </Label>
          <Input
            id="email"
            autoComplete="email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-required="true"
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-danger" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          autoComplete="tel"
          type="tel"
          {...register("phone")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">
          Subject <span className="text-danger">*</span>
        </Label>
        <Input
          id="subject"
          {...register("subject")}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "subject-error" : undefined}
          aria-required="true"
        />
        {errors.subject && (
          <p id="subject-error" className="text-sm text-danger" role="alert">
            {errors.subject.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-danger">*</span>
        </Label>
        <Textarea
          id="message"
          rows={5}
          {...register("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-required="true"
        />
        {errors.message && (
          <p id="message-error" className="text-sm text-danger" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  )
}
