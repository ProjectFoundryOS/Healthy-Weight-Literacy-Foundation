"use client";
import { useState } from "react";
import { plannerGroups } from "@/lib/learning/content";
export function AppointmentPlanner() {
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  function toggle(question: string) {
    setSelected((current) =>
      current.includes(question)
        ? current.filter((q) => q !== question)
        : [...current, question],
    );
  }
  return (
    <div className="planner-grid">
      <div className="no-print">
        <p className="learning-note">
          Choose a few questions that matter most. Your choices and notes stay
          in this open page and are cleared when you reload or leave. They are
          not sent to us.
        </p>
        {plannerGroups.map((group) => (
          <fieldset key={group.title} className="learning-card mt-5">
            <legend className="text-xl font-semibold px-2">
              {group.title}
            </legend>
            {group.questions.map((question) => (
              <label key={question} className="choice-row">
                <input
                  type="checkbox"
                  checked={selected.includes(question)}
                  onChange={() => toggle(question)}
                />
                <span>{question}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <label htmlFor="planner-notes" className="mt-7 block font-semibold">
          Anything else you want to ask?{" "}
          <span className="font-normal">(optional)</span>
        </label>
        <textarea
          id="planner-notes"
          value={notes}
          maxLength={1500}
          onChange={(e) => setNotes(e.target.value)}
          className="learning-input mt-2 min-h-28"
          placeholder="Add a question or leave this blank."
        />
        <button
          className="text-link mt-4"
          onClick={() => {
            setSelected([]);
            setNotes("");
          }}
        >
          Clear my planner
        </button>
      </div>
      <section
        className="learning-card planner-output"
        aria-label="Your appointment guide"
      >
        <p className="eyebrow">WeightLiteracy · Conversation guide</p>
        <h2 className="font-editorial mt-3 text-3xl">My next appointment</h2>
        <p className="mt-3 text-sm no-print" aria-live="polite">
          {selected.length} {selected.length === 1 ? "question" : "questions"}{" "}
          selected
        </p>
        {selected.length ? (
          <ol className="mt-6 list-decimal space-y-5 pl-5">
            {selected.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        ) : (
          <p className="mt-6 text-muted-foreground">
            Choose questions from the list to build your guide.
          </p>
        )}
        {notes && (
          <div className="mt-7">
            <h3 className="font-semibold">My own question</h3>
            <p className="mt-2 whitespace-pre-wrap break-words">{notes}</p>
          </div>
        )}
        <h3 className="mt-8 font-semibold">Notes from the conversation</h3>
        <div className="writing-lines" aria-hidden="true" />
        <p className="mt-5 text-xs text-muted-foreground">
          Bring your current medicine list and any information your care team
          requests. This guide supports a conversation; it does not recommend
          treatment.
        </p>
        <button
          className="tool-button no-print mt-7"
          disabled={!selected.length && !notes.trim()}
          onClick={() => window.print()}
        >
          Print / save as PDF
        </button>
        <p className="no-print mt-3 text-xs text-muted-foreground">
          Choose “Save as PDF” in your browser’s print window.
        </p>
      </section>
    </div>
  );
}
