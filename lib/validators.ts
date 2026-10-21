import { z } from "zod"

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .max(5000)
    .min(2, "Name must be at least 2 characters"),
  email: z.string().trim().max(254).email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z
    .string()
    .trim()
    .max(5000)
    .min(5, "Subject must be at least 5 characters"),
  message: z
    .string()
    .trim()
    .max(5000)
    .min(20, "Message must be at least 20 characters"),
})

export const newsletterFormSchema = z.object({
  email: z.string().trim().max(254).email("Please enter a valid email address"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to receive emails",
  }),
})

export const volunteerFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(5000)
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .trim()
    .max(5000)
    .min(2, "Last name must be at least 2 characters"),
  email: z.string().trim().max(254).email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(5000)
    .min(10, "Please enter a valid phone number"),
  role: z.string().trim().max(5000).min(1, "Please select a volunteer role"),
  availability: z
    .string()
    .trim()
    .max(5000)
    .min(1, "Please select your availability"),
  experience: z.string().optional(),
  motivation: z
    .string()
    .trim()
    .max(5000)
    .min(20, "Please tell us more about your motivation"),
})

export const partnerFormSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .max(5000)
    .min(2, "Organization name must be at least 2 characters"),
  organizationType: z
    .string()
    .trim()
    .max(5000)
    .min(1, "Please select organization type"),
  contactName: z
    .string()
    .trim()
    .max(5000)
    .min(2, "Contact name must be at least 2 characters"),
  email: z.string().trim().max(254).email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(5000)
    .min(10, "Please enter a valid phone number"),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  partnershipType: z
    .string()
    .trim()
    .max(5000)
    .min(1, "Please select partnership type"),
  description: z
    .string()
    .trim()
    .max(5000)
    .min(20, "Please provide more details about your organization"),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
export type NewsletterFormData = z.infer<typeof newsletterFormSchema>
export type VolunteerFormData = z.infer<typeof volunteerFormSchema>
export type PartnerFormData = z.infer<typeof partnerFormSchema>
