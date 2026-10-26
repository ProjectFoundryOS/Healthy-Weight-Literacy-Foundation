"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { lessonPassed, type Lesson } from "@/lib/learning/content";
import { SourceNote } from "./tool-shell";
import { trackEvent } from "@/components/analytics/ga4-provider";
export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const sent = useRef(false);
  const answered = Object.keys(answers).length === lesson.questions.length;
  const passed = checked && lessonPassed(lesson, answers);
  function check() {
    setChecked(true);
    if (!lessonPassed(lesson, answers) || sent.current) return;
    try {
      if (typeof (window as unknown as { gtag?: unknown }).gtag !== "function")
        return;
      if (
        localStorage.getItem("hwlf-cookie-consent") !== "accepted" ||
        !["weightliteracy.org", "www.weightliteracy.org"].includes(
          location.hostname,
        )
      )
        return;
      const key = "wl-lesson-completed:" + lesson.slug;
      if (sessionStorage.getItem(key)) return;
      trackEvent("education_lesson_completed", "education", lesson.slug);
      sessionStorage.setItem(key, "1");
      sent.current = true;
    } catch {
      /* Learning works with storage disabled. */
    }
  }
  return (
    <>
      <section className="learning-card">
        <div className="lesson-flow" aria-label={lesson.visual.join(" → ")}>
          {lesson.visual.map((step, i) => (
            <div key={step}>
              <span className="step-number">{i + 1}</span>
              <h2 className="mt-5 text-xl font-semibold">{step}</h2>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed">
          {lesson.takeaway}
        </p>
        <SourceNote source={lesson.source} />
      </section>
      {lesson.workedExample && (
        <section className="learning-card mt-8" aria-labelledby="worked-example-title">
          <p className="eyebrow">A worked example</p>
          <h2 id="worked-example-title" className="font-editorial mt-3 text-3xl">
            {lesson.workedExample.title}
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed">{lesson.workedExample.context}</p>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {lesson.workedExample.steps.map((step, i) => (
              <li key={step.label} className="rounded-xl bg-[#F5F1E8] p-5">
                <h3 className="font-semibold">{i + 1}. {step.label}</h3>
                <p className="mt-3 leading-relaxed">{step.detail}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl leading-relaxed">{lesson.workedExample.conclusion}</p>
          {lesson.workedExample.sources.map(source => <SourceNote key={source} source={source} />)}
        </section>
      )}
      <section className="mt-10">
        <p className="eyebrow">Try the idea</p>
        <h2 className="font-editorial mt-3 text-3xl">
          Three questions to make it stick.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Choose an answer to each, then check your understanding. You can
          review and try again.
        </p>
        {lesson.workedExample && (
          <div className="learning-note mt-6">
            <h3 className="font-semibold">Put it into practice</h3>
            <p className="mt-2">{lesson.workedExample.scenario}</p>
          </div>
        )}
        {lesson.questions.map((q, i) => (
          <fieldset className="learning-card mt-6" key={q.prompt}>
            <legend className="px-2 font-semibold">
              {i + 1}. {q.prompt}
            </legend>
            {q.answers.map((answer, n) => (
              <label className="choice-row" key={answer}>
                <input
                  type="radio"
                  name={`answer-${i}`}
                  aria-describedby={checked ? `answer-feedback-${i}` : undefined}
                  checked={answers[i] === n}
                  onChange={() => {
                    setAnswers({ ...answers, [i]: n });
                    setChecked(false);
                  }}
                />
                <span>{answer}</span>
              </label>
            ))}
            {checked && (
              <p
                id={`answer-feedback-${i}`}
                className={`mt-4 rounded-lg p-4 ${answers[i] === q.correct ? "bg-primary-soft" : "bg-[#F7E5D7]"}`}
              >
                <strong>
                  {answers[i] === q.correct
                    ? "That’s right."
                    : "Take another look."}
                </strong>{" "}
                {q.answerFeedback?.[answers[i]] ?? q.explanation}
              </p>
            )}
          </fieldset>
        ))}
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <button className="tool-button" disabled={!answered} onClick={check}>
            Check my answers
          </button>
          <button
            className="text-link"
            onClick={() => {
              setAnswers({});
              setChecked(false);
            }}
          >
            Start again
          </button>
        </div>
        <div role="status" className="mt-6">
          {passed ? (
            <div className="learning-note">
              <h3 className="text-xl font-semibold">
                Lesson complete. Keep the conversation going.
              </h3>
              <p className="mt-2">
                You answered all three questions correctly. This activity is a
                learning check, not a medical assessment.
              </p>
              {lesson.workedExample && (
                <div className="mt-5">
                  <h4 className="font-semibold">A question to take with you</h4>
                  <p className="mt-2">“{lesson.workedExample.questionToTake}”</p>
                  <Link className="text-link mt-3" href="/tools/appointment-planner">
                    Make an appointment question list →
                  </Link>
                </div>
              )}
              <Link className="text-link mt-3" href={`/blog/${lesson.article}`}>
                Read the full guide →
              </Link>
            </div>
          ) : checked ? (
            <p>
              Review the explanations, change any answers you want to revisit,
              and check again.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {Object.keys(answers).length} of 3 questions answered
            </p>
          )}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Answers stay in this page. If you allow analytics, we can count a
          completed lesson; we do not send your individual answers.
        </p>
      </section>
    </>
  );
}
