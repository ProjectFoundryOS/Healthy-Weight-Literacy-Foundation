"use client";
import { useState } from "react";
import Link from "next/link";
import { medicines, checkedOn } from "@/lib/learning/content";
import { SourceNote } from "./tool-shell";
export function MedicineExplorer() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [compare, setCompare] = useState<string[]>([]);
  const visible = medicines.filter(
    (m) =>
      (filter === "All" || m.status === filter) &&
      `${m.ingredient} ${m.brands}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <p className="learning-note">
        A guide to selected medicines and compounds people ask about—not a
        complete drug directory or a recommendation for you. Approved uses, age
        limits, risks and instructions depend on the exact product. Check the
        current label with your clinician or pharmacist. Status checked{" "}
        {checkedOn}.
      </p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="medicine-search" className="font-semibold">
            Ingredient or brand
          </label>
          <input
            className="learning-input mt-2"
            id="medicine-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Try Wegovy or tirzepatide"
          />
        </div>
        <div>
          <label htmlFor="medicine-status" className="font-semibold">
            Research and approval status
          </label>
          <select
            id="medicine-status"
            className="learning-input mt-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Approved products</option>
            <option>Not FDA-approved</option>
          </select>
        </div>
      </div>
      <p className="my-5 text-sm" aria-live="polite">
        {visible.length} {visible.length === 1 ? "result" : "results"}. Select
        up to two to compare.
      </p>
      <div className="learning-grid">
        {visible.map((m) => (
          <article key={m.id} className="learning-card">
            <p
              className={`status-badge ${m.status === "Not FDA-approved" ? "research-badge" : ""}`}
            >
              {m.status}
            </p>
            <h2 className="mt-5 text-2xl font-semibold">{m.ingredient}</h2>
            <p className="mt-2 font-medium text-primary">{m.brands}</p>
            <p className="mt-5 leading-relaxed">{m.note}</p>
            <SourceNote source={m.source} />
            <label className="choice-row mt-5">
              <input
                type="checkbox"
                checked={compare.includes(m.id)}
                disabled={compare.length === 2 && !compare.includes(m.id)}
                onChange={() =>
                  setCompare((c) =>
                    c.includes(m.id)
                      ? c.filter((id) => id !== m.id)
                      : [...c, m.id],
                  )
                }
              />
              <span>Compare {m.ingredient}</span>
            </label>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="learning-card">
          <p>No matching entry in this selected collection.</p>
          <button
            className="text-link mt-3"
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {compare.length > 0 && (
        <section
          className="learning-card mt-8"
          aria-label="Medicine comparison"
        >
          <h2 className="text-2xl font-semibold">Side by side</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {medicines
              .filter((m) => compare.includes(m.id))
              .map((m) => (
                <div key={m.id}>
                  <h3 className="text-xl font-semibold">{m.ingredient}</h3>
                  <p className="mt-2">{m.brands}</p>
                  <p className="mt-2 font-semibold">{m.status}</p>
                  <p className="mt-4">{m.note}</p>
                  <h4 className="mt-4 font-semibold">A question to bring</h4>
                  <p className="mt-2">{m.question}</p>
                </div>
              ))}
          </div>
          <button className="text-link mt-6" onClick={() => setCompare([])}>
            Clear comparison
          </button>
        </section>
      )}
      <Link href="/tools/appointment-planner" className="tool-button mt-8">
        Build an appointment question list →
      </Link>
    </>
  );
}
