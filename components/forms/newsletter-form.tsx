"use client"

import { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2 } from "lucide-react"
import { newsletterFormSchema, type NewsletterFormData } from "@/lib/validators"
import { cn } from "@/lib/utils"
import { trackNewsletterSignup } from "@/lib/analytics-events"

interface NewsletterFormProps {
  variant?: "default" | "footer"
}

export function NewsletterForm({ variant = "default" }: NewsletterFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: { consent: false },
  })

  // useWatch (rather than the form instance's watch()) is the
  // React-Compiler-safe way to subscribe to a single field's value.
  const consent = useWatch({ control, name: "consent" })

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => setStatus("idle"), 10000)
      return () => clearTimeout(timer)
    }
  }, [status])

  async function onSubmit(data: NewsletterFormData) {
    if (!data.consent) return

    setStatus("loading")
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.ok) {
        setStatus("success")
        trackNewsletterSignup(variant)
        reset()
      } else {
        throw new Error(result.message)
      }
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  if (status === "success") {
    return (
      <div
        className={cn("flex items-center gap-2", variant === "footer" ? "text-secondary-foreground" : "text-success")}
      >
        <CheckCircle2 className="h-5 w-5" />
        <span>Thanks for subscribing!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className={cn("flex gap-2", variant === "footer" ? "flex-col sm:flex-row" : "")}>
        <Input
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "newsletter-email-error" : undefined}
          className={cn(
            variant === "footer" &&
              "bg-secondary-soft/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50",
          )}
        />
        <Button
          type="submit"
          disabled={status === "loading" || !consent}
          className={cn(variant === "footer" && "bg-primary hover:bg-primary/90")}
          aria-label="Subscribe to newsletter"
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Subscribe"}
        </Button>
      </div>
      {errors.email && (
        <p
          id="newsletter-email-error"
          className={cn("text-sm", variant === "footer" ? "text-warning" : "text-danger")}
          role="alert"
        >
          {errors.email.message}
        </p>
      )}
      {status === "error" && (
        <p className={cn("text-sm", variant === "footer" ? "text-warning" : "text-danger")} role="alert">
          Newsletter signup is being configured. Please check back soon.
        </p>
      )}

      <div className="flex items-start gap-2">
        <Checkbox
          id={`newsletter-consent-${variant}`}
          checked={consent}
          onCheckedChange={(checked) => setValue("consent", checked as boolean, { shouldValidate: true })}
          className={variant === "footer" ? "border-secondary-foreground/40" : ""}
          aria-invalid={!!errors.consent}
          aria-describedby={errors.consent ? "newsletter-consent-error" : undefined}
        />
        <Label
          htmlFor={`newsletter-consent-${variant}`}
          className={cn(
            "text-xs leading-tight cursor-pointer",
            variant === "footer" ? "text-secondary-foreground/70" : "text-muted-foreground",
          )}
        >
          I agree to receive health tips and updates. Unsubscribe anytime. <span className="text-danger">*</span>
        </Label>
      </div>
      {errors.consent && (
        <p
          id="newsletter-consent-error"
          className={cn("text-sm", variant === "footer" ? "text-warning" : "text-danger")}
          role="alert"
        >
          {errors.consent.message}
        </p>
      )}
    </form>
  )
}
