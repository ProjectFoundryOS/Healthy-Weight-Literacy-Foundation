"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { selectedQuestions, type Companion } from "@/lib/learning/article-companions";

export function ArticleCompanion({ companion }: { companion: Companion }) {
  const id = useId();
  const [card, setCard] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const questions = selectedQuestions(companion, selected);
  function toggle(index: number) {
    setSelected(current => current.includes(index) ? current.filter(i => i !== index) : [...current, index]);
  }
  function printGuide() {
    // A temporary print marker isolates this guide. No personal input or state is persisted.
    document.documentElement.dataset.printCompanion = "true";
    const clear = () => { delete document.documentElement.dataset.printCompanion; };
    window.addEventListener("afterprint", clear, { once: true });
    try { window.print(); } catch (error) { clear(); throw error; }
  }
  function downloadGuide() {
    const text = ["WeightLiteracy · Conversation guide", companion.title, "", ...questions.map((question, index) => `${index + 1}. ${question}`), "", companion.safety || "", "For a conversation with your care team; not a diagnosis or treatment recommendation.", `https://www.weightliteracy.org/blog/${companion.slug}`].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `weightliteracy-${companion.slug}-questions.txt`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="article-companion mb-10" aria-labelledby={`${id}-title`}>
      <div className="companion-screen">
        <div className="companion-heading">
          <p className="eyebrow">Try it here · Free learning tool</p>
          <h2 id={`${id}-title`} className="font-editorial mt-3 text-2xl sm:text-3xl">{companion.title}</h2>
          <p className="mt-3 max-w-3xl leading-relaxed">{companion.intro}</p>
          <a href="#article-reading-content" className="text-link mt-3 inline-flex min-h-11 items-center">Go straight to the article ↓</a>
        </div>
        {companion.safety && <div className="companion-safety"><h3 className="font-semibold">When to get help</h3><p className="mt-2">{companion.safety}</p><a className="text-link mt-2 inline-block" href={`${companion.sources[0].url}`}>Read the official medicine information ↗</a></div>}
        <div className="companion-body">
          <p className="eyebrow">01 · {companion.exploreLabel}</p>
          <div role="group" aria-label={companion.exploreLabel} className="companion-choices mt-4">
            {companion.cards.map((item, index) => <button type="button" key={item.title} aria-pressed={card === index} aria-controls={`${id}-explanation`} onClick={() => setCard(index)}>{item.title}</button>)}
          </div>
          <div id={`${id}-explanation`} className="companion-explanation" aria-live="polite" aria-atomic="true">
            <h3 className="font-semibold text-lg">{companion.cards[card].title}</h3>
            <p className="mt-2 leading-relaxed">{companion.cards[card].body}</p>
            <p className="mt-4 border-l-2 border-primary pl-4 font-medium leading-relaxed">{companion.cards[card].takeaway}</p>
          </div>
          <details className="companion-detail">
            <summary>02 · Try a worked example</summary>
            <p className="mt-4 text-sm text-muted-foreground">Fictional learning example · not an assessment of you</p>
            <p className="mt-3 leading-relaxed">{companion.scenario.setup}</p>
            <fieldset className="mt-4">
              <legend className="font-semibold">{companion.scenario.question}</legend>
              {companion.scenario.options.map((option, index) => <label className="choice-row" key={option}><input type="radio" name={`${id}-scenario`} checked={answer === index} onChange={() => setAnswer(index)}/><span>{option}</span></label>)}
            </fieldset>
            <div aria-live="polite" aria-atomic="true">{answer !== null && <p className="learning-note mt-4"><strong>{answer === companion.scenario.correct ? "Useful distinction. " : "Take another look. "}</strong>{companion.scenario.feedback[answer]}</p>}</div>
          </details>
          <details className="companion-detail">
            <summary>03 · Make a question list to keep</summary>
            <p className="mt-4 text-sm leading-relaxed">Choose questions to download, print or save as a PDF. Your choices stay in this open page and clear when you reload or leave. They are not sent to us.</p>
            <fieldset className="mt-4"><legend className="font-semibold">What would you like to ask?</legend>
              {companion.questions.map((question, index) => <label className="choice-row" key={question}><input type="checkbox" checked={selected.includes(index)} onChange={() => toggle(index)}/><span>{question}</span></label>)}
            </fieldset>
            <p className="mt-4 text-sm" aria-live="polite">{questions.length} {questions.length === 1 ? "question" : "questions"} selected</p>
            {questions.length > 0 && <div className="learning-note mt-4"><h3 className="font-semibold">My question sheet</h3><ol className="mt-3 list-decimal pl-5 space-y-2">{questions.map(question => <li key={question}>{question}</li>)}</ol></div>}
            <div className="mt-4 flex flex-wrap items-center gap-4"><button type="button" className="tool-button" disabled={!questions.length} onClick={downloadGuide}>Download my questions</button><button type="button" className="text-link min-h-11" disabled={!questions.length} onClick={printGuide}>Print / save as PDF</button><button type="button" className="text-link min-h-11" disabled={!questions.length} onClick={() => setSelected([])}>Clear my choices</button></div>
            <p className="mt-3 text-xs text-muted-foreground">Use “Save as PDF” in your browser's print window. This is a conversation aid, not medical advice.</p>
          </details>
          <details className="companion-detail"><summary>Sources & further reading</summary><ul className="mt-3 space-y-3">{companion.sources.map(source => <li key={source.url}><a className="text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul><p className="mt-4 text-sm">Medical choices depend on your circumstances. Use the full article and a healthcare professional for context.</p></details>
          <Link href={companion.next.href} className="mt-5 inline-flex min-h-11 items-center text-link">{companion.next.title} →</Link>
        </div>
      </div>
      <section className="companion-print" aria-label="Your selected conversation questions">
        <p>WeightLiteracy · Free conversation guide</p>
        <h2>{companion.title}</h2>
        <ol>{questions.map(question => <li key={question}>{question}</li>)}</ol>
        <h3>Notes from the conversation</h3><div className="writing-lines" />
        {companion.safety && <p>{companion.safety}</p>}
        <p>This guide supports a conversation. It does not diagnose a condition or recommend treatment.</p>
        <p>Read the full guide: www.weightliteracy.org/blog/{companion.slug}</p>
      </section>
    </section>
  );
}
