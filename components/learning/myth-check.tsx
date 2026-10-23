"use client";
import { useState } from "react";
import Link from "next/link";
import { myths } from "@/lib/learning/content";
import { SourceNote } from "./tool-shell";
export function MythCheck() {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <div className="learning-grid">
      {myths.map((m, i) => (
        <article key={m.claim} className="learning-card">
          <p className="eyebrow">A familiar claim</p>
          <h2 className="font-editorial mt-5 text-3xl">“{m.claim}”</h2>
          <button
            className="tool-button mt-6"
            aria-expanded={open.includes(i)}
            aria-controls={`myth-${i}`}
            onClick={() =>
              setOpen((s) =>
                s.includes(i) ? s.filter((n) => n !== i) : [...s, i],
              )
            }
          >
            {open.includes(i) ? "Hide explanation" : "Look a little closer"}
          </button>
          <div id={`myth-${i}`} hidden={!open.includes(i)} className="mt-7">
            <h3 className="text-xl font-semibold">{m.answer}</h3>
            <p className="mt-3 leading-relaxed">{m.explanation}</p>
            <SourceNote source={m.source} />
            <Link href={`/blog/${m.article}`} className="text-link mt-4">
              Explore the full explanation →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
