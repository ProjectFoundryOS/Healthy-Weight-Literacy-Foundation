"use client";
import { useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/learning/content";
export function StartPaths() {
  const [selected, setSelected] = useState<string>(paths[0].id);
  const path = paths.find((p) => p.id === selected)!;
  return (
    <>
      <fieldset className="learning-grid">
        <legend className="sr-only">Choose your starting point</legend>
        {paths.map((p) => (
          <label
            key={p.id}
            className={`learning-card cursor-pointer ${selected === p.id ? "selected-card" : ""}`}
          >
            <input
              type="radio"
              name="path"
              value={p.id}
              checked={selected === p.id}
              onChange={() => setSelected(p.id)}
              className="accent-primary"
            />
            <h2 className="mt-5 text-xl font-semibold">{p.title}</h2>
            <p className="mt-3 text-muted-foreground">{p.description}</p>
          </label>
        ))}
      </fieldset>
      <section className="learning-card mt-8" aria-live="polite">
        <p className="eyebrow">Your suggested starting points</p>
        <h2 className="mt-3 text-2xl font-semibold">{path.title}</h2>
        <ol className="mt-6 divide-y">
          {path.steps.map((step, i) => (
            <li key={step.url}>
              <Link
                href={step.url}
                className="flex items-center gap-5 py-5 hover:text-primary"
              >
                <span className="step-number">{i + 1}</span>
                <span>
                  <strong className="block">{step.title}</strong>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {step.detail}
                  </span>
                </span>
                <span className="ml-auto" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          Follow this order or choose any starting point. No account, personal
          health details or email required.
        </p>
      </section>
    </>
  );
}
