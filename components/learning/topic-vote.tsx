"use client";
import { useState, useEffect } from "react";
import { voteTopics } from "@/lib/learning/content";
export function TopicVote() {
  const [topic, setTopic] = useState("");
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("Loading reader votes…");
  const [ready, setReady] = useState(false);
  async function load() {
    setBusy(true);
    try {
      const r = await fetch("/api/topic-vote", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok || !data.ok) throw Error(data.message);
      setCounts(data.counts);
      setVoted(data.voted);
      setReady(true);
      setMessage(
        data.voted
          ? "Your vote for this round has already been saved."
          : "Choose the question you would most like us to explore.",
      );
    } catch {
      setReady(false);
      setMessage(
        "Voting is temporarily unavailable. Your vote has not been saved. Please try again later.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function submit() {
    if (!topic || voted || busy || !ready) return;
    setBusy(true);
    try {
      const r = await fetch("/api/topic-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw Error(data.message);
      setVoted(true);
      setCounts(data.counts);
      setMessage(data.message);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Your vote could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="learning-note">
        Help choose a future explainer. This is an editorial suggestion box, not
        a health questionnaire or a scientific survey. No account, email address
        or personal health information needed.
      </p>
      <fieldset
        className="learning-grid mt-7"
        disabled={busy || voted || !ready}
      >
        <legend className="sr-only">Choose one topic</legend>
        {voteTopics.map((t) => (
          <label
            className={`learning-card cursor-pointer ${topic === t.id ? "selected-card" : ""}`}
            key={t.id}
          >
            <input
              type="radio"
              name="vote"
              checked={topic === t.id}
              onChange={() => setTopic(t.id)}
              className="accent-primary"
            />
            <h2 className="mt-4 text-xl font-semibold">{t.title}</h2>
            <p className="mt-3 text-muted-foreground">{t.detail}</p>
            {counts && (
              <p className="mt-5 font-semibold text-primary">
                {counts[t.id] || 0}{" "}
                {(counts[t.id] || 0) === 1 ? "vote" : "votes"}
              </p>
            )}
          </label>
        ))}
      </fieldset>
      <button
        className="tool-button mt-6"
        disabled={!ready || !topic || busy || voted}
        onClick={submit}
      >
        {busy ? "Please wait…" : voted ? "Vote saved" : "Send my vote"}
      </button>
      {!ready && !busy && (
        <button className="text-link ml-5" onClick={load}>
          Try again
        </button>
      )}
      <p role="status" className="mt-5">
        {message}
      </p>
      <p className="mt-7 text-sm text-muted-foreground">
        One vote per browser for this round. We use a voting cookie to recognize
        a submitted vote and a short-lived, one-way network identifier to limit
        spam. We store the chosen topic, not your name or email. Results help
        inform our editorial choices; they do not guarantee publication.
      </p>
    </>
  );
}
