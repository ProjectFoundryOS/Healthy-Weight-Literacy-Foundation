"use client";
import { useState } from "react";
import Link from "next/link";
const sheets = [
  {
    id: "visit",
    title: "A clearer healthcare conversation",
    description: "A place for your priorities, questions and next steps.",
  },
  {
    id: "patterns",
    title: "A week of noticing",
    description:
      "Optional notes on sleep, appetite and everyday context. No calorie counting or weigh-ins.",
  },
  {
    id: "headlines",
    title: "Before you share that health headline",
    description: "Five questions for looking beyond a confident claim.",
  },
];
export function Toolkits() {
  const [selected, setSelected] = useState("visit");
  return (
    <>
      <fieldset className="learning-grid no-print">
        <legend className="sr-only">Choose a printable worksheet</legend>
        {sheets.map((s) => (
          <label
            key={s.id}
            className={`learning-card cursor-pointer ${selected === s.id ? "selected-card" : ""}`}
          >
            <input
              type="radio"
              name="sheet"
              checked={selected === s.id}
              onChange={() => setSelected(s.id)}
              className="accent-primary"
            />
            <h2 className="mt-4 text-xl font-semibold">{s.title}</h2>
            <p className="mt-3 text-muted-foreground">{s.description}</p>
          </label>
        ))}
      </fieldset>
      <div className="no-print mt-6 flex flex-wrap gap-5 items-center">
        <button className="tool-button" onClick={() => window.print()}>
          Print / save as PDF
        </button>
        <p className="text-sm text-muted-foreground">
          Free. No email required. Choose “Save as PDF” in the print window.
        </p>
      </div>
      <article className="learning-card worksheet mt-8">
        <p className="eyebrow">
          WeightLiteracy · Take a little understanding with you
        </p>
        <h2 className="font-editorial mt-4 text-3xl">
          {sheets.find((s) => s.id === selected)!.title}
        </h2>
        {selected === "visit" ? (
          <>
            <p className="mt-4">
              Bring this to your appointment and use it in the way that works
              for you.
            </p>
            {[
              "What I most want to discuss",
              "Questions I want to ask",
              "What we decided together",
              "Next step, date and who to contact",
            ].map((title) => (
              <section key={title} className="mt-6">
                <h3 className="font-semibold">{title}</h3>
                <div className="writing-lines" aria-hidden="true" />
              </section>
            ))}
            <p className="mt-6 text-sm">
              Bring an up-to-date list of medicines, supplements and any
              information requested by your care team.
            </p>
          </>
        ) : selected === "patterns" ? (
          <>
            <p className="mt-4">
              Use ordinary words, not scores. Notice without judging. Skip
              anything you do not want to track. These observations do not
              diagnose a condition or prove what caused a change.
            </p>
            <div className="worksheet-table mt-6">
              <table>
                <caption className="sr-only">
                  Seven-day observation sheet
                </caption>
                <thead>
                  <tr>
                    {[
                      "Day / date",
                      "Sleep & rest",
                      "Appetite & energy",
                      "What else was going on?",
                    ].map((t) => (
                      <th scope="col" key={t}>
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 7 }, (_, i) => (
                    <tr key={i}>
                      <th scope="row">Day {i + 1}</th>
                      <td />
                      <td />
                      <td />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="mt-6 font-semibold">
              Anything I want to discuss with a healthcare professional
            </h3>
            <div className="writing-lines" aria-hidden="true" />
          </>
        ) : (
          <>
            <p className="mt-4">
              Keep the original source beside the headline. If you cannot answer
              a question, mark it “unknown.”
            </p>
            {[
              "What was actually studied: people, animals or cells?",
              "What did the study compare, and for how long?",
              "Does the headline describe an average or promise an individual result?",
              "What limitations or uncertainties does the source describe?",
              "Who funded the work, and does anyone selling something benefit from the claim?",
            ].map((q, i) => (
              <section className="mt-6" key={q}>
                <h3 className="font-semibold">
                  {i + 1}. {q}
                </h3>
                <div className="writing-lines short" aria-hidden="true" />
              </section>
            ))}
            <p className="mt-6 text-sm">
              One worksheet cannot establish whether a treatment is safe or
              suitable for you. Bring treatment questions to a qualified
              healthcare professional.
            </p>
          </>
        )}
        <p className="mt-7 text-xs text-muted-foreground">
          weightliteracy.org · Free education for readers across the United
          States
        </p>
      </article>
      <p className="no-print mt-7">
        Want a guide with questions you choose?{" "}
        <Link className="text-link" href="/tools/appointment-planner">
          Build your appointment planner →
        </Link>
      </p>
    </>
  );
}
