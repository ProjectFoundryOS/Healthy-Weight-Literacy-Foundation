"use client"
import { useState } from "react"
import Link from "next/link"
import { MapPin, ArrowUpRight, Apple, Stethoscope } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { ohioResources } from "@/lib/ohio-resources"
export default function CityResourcesPage() {
  const [city, setCity] = useState("All cities")
  const [category, setCategory] = useState("All resources")
  const resources = ohioResources.filter(
    (item) =>
      (city === "All cities" || item.city === city) &&
      (category === "All resources" || item.category === category),
  )
  return (
    <>
      <PageHeader
        title="A helping hand, closer to home."
        description="Find food assistance and health services in Dayton, Columbus, Cincinnati, and Cleveland."
        breadcrumbs={[{ label: "Ohio Resources" }]}
      />
      <Section>
        <Container>
          <div className="mb-8 flex flex-wrap items-end gap-5">
            <div>
              <label
                htmlFor="resource-city"
                className="mb-2 block text-sm font-semibold"
              >
                Choose a city
              </label>
              <select
                id="resource-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="min-h-12 min-w-52 rounded-lg border border-input bg-white px-4"
              >
                {[
                  "All cities",
                  "Dayton",
                  "Columbus",
                  "Cincinnati",
                  "Cleveland",
                ].map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">
                What do you need?
              </legend>
              <div className="flex flex-wrap gap-2">
                {["All resources", "Food assistance", "Health services"].map(
                  (value) => (
                    <button
                      type="button"
                      key={value}
                      aria-pressed={category === value}
                      onClick={() => setCategory(value)}
                      className={`topic-pill ${category === value ? "topic-pill-active" : ""}`}
                    >
                      {value}
                    </button>
                  ),
                )}
              </div>
            </fieldset>
          </div>
          <p
            className="mb-5 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {resources.length} {resources.length === 1 ? "resource" : "resources"}
            {city === "All cities" ? " across four Ohio cities" : ` in ${city}`}
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {resources.map((item) => {
              const Icon =
                item.category === "Food assistance" ? Apple : Stethoscope
              return (
                <article
                  key={item.url}
                  className="flex flex-col rounded-2xl border bg-white p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      {item.city}
                    </span>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold">{item.name}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${item.name} (opens in a new tab)`}
                    className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 font-semibold text-primary underline underline-offset-4"
                  >
                    Visit official website{" "}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Source checked October 20, 2026
                  </p>
                </article>
              )
            })}
          </div>
          <div className="mt-8 rounded-xl bg-primary-soft p-6">
            <h2 className="font-semibold">Before you visit</h2>
            <p className="mt-2 max-w-4xl leading-relaxed text-muted-foreground">
              These organizations operate independently of WeightLiteracy. Check
              their websites or contact them directly for current hours, costs,
              eligibility, and appointments.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
            >
              Suggest a resource or correction
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}
