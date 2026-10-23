"use client";
import { useState } from "react";
import { supportResources, checkedOn } from "@/lib/learning/content";
export function SupportFinder() {
  const [category, setCategory] = useState("All support");
  const resources = supportResources.filter(
    (r) => category === "All support" || r.category === category,
  );
  return (
    <>
      <div className="mb-7">
        <label htmlFor="support-category" className="block font-semibold">
          What kind of support are you looking for?
        </label>
        <select
          id="support-category"
          className="learning-input mt-3 max-w-md"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {[
            "All support",
            ...new Set(supportResources.map((r) => r.category)),
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <p className="mb-5 text-sm" aria-live="polite">
        {resources.length} national{" "}
        {resources.length === 1 ? "directory" : "directories"}
      </p>
      <div className="learning-grid">
        {resources.map((r) => (
          <article className="learning-card" key={r.name}>
            <p className="eyebrow">{r.category}</p>
            <h2 className="mt-5 text-2xl font-semibold">{r.name}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {r.description}
            </p>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link mt-6"
            >
              Visit the official directory ↗
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </article>
        ))}
      </div>
      <p className="learning-note mt-8">
        These independent directories serve people across the United States.
        Enter your location on the provider’s website to find nearby options.
        Services, costs and eligibility vary; confirm details with the
        organization. Listing is not a partnership or endorsement. Links checked{" "}
        {checkedOn}.
      </p>
    </>
  );
}
