import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { lessons, lessonPassed, type Lesson } from "../lib/learning/content.ts";

const code = ts.transpileModule(
  readFileSync(new URL("../components/learning/lesson-player.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } },
).outputText;
type Element = { type: unknown; props: Record<string, any> };
// Isolated component adapter. No browser, network, real analytics or production data.
function harness({ lesson = lessons[0], consent = "accepted", hostname = "www.weightliteracy.org", ga = true, blocked = false, stored = new Map<string, string>() } = {}) {
  const state: any[] = [];
  let cursor = 0;
  const sent = { current: false };
  const calls: unknown[][] = [];
  const exports: { LessonPlayer?: (props: { lesson: Lesson }) => Element } = {};
  const jsx = (type: unknown, props: Record<string, any>) => ({ type, props });
  runInNewContext(code, {
    exports,
    require(name: string) {
      if (name === "react") return {
        useRef: () => sent,
        useState(initial: unknown) {
          const index = cursor++;
          if (!(index in state)) state[index] = initial;
          return [state[index], (next: unknown) => { state[index] = next; }];
        },
      };
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (name === "next/link") return { default: "link" };
      if (name === "./tool-shell") return { SourceNote: "source-note" };
      if (name === "@/lib/learning/content") return { lessonPassed };
      if (name === "@/components/analytics/ga4-provider") return { trackEvent: (...args: unknown[]) => calls.push(args) };
      throw new Error(`Unexpected import ${name}`);
    },
    window: { gtag: ga ? () => undefined : undefined }, location: { hostname },
    localStorage: { getItem() { if (blocked) throw Error("blocked"); return consent; } },
    sessionStorage: { getItem: (key: string) => stored.get(key), setItem: (key: string, value: string) => stored.set(key, value) },
  });
  function nodes() {
    cursor = 0;
    const result: Element[] = [];
    function visit(node: any) {
      if (Array.isArray(node)) node.forEach(visit);
      else if (node && typeof node === "object" && node.props) {
        result.push(node); visit(node.props.children);
      }
    }
    visit(exports.LessonPlayer!({ lesson }));
    return result;
  }
  const button = (label: string) => nodes().find(n => n.type === "button" && n.props.children === label)!;
  return {
    calls, stored, nodes, button,
    answer(question: number, option: number) {
      nodes().filter(n => n.type === "input" && n.props.name === `answer-${question}`)[option].props.onChange();
    },
    complete() { lesson.questions.forEach((q, i) => this.answer(i, q.correct)); button("Check my answers").props.onClick(); },
  };
}
test("lesson feedback follows each selected option and clears when an answer changes", () => {
  const h = harness();
  assert.equal(h.button("Check my answers").props.disabled, true);
  for (let option = 0; option < 3; option++) {
    lessons[0].questions.forEach((_, i) => h.answer(i, option));
    h.button("Check my answers").props.onClick();
    lessons[0].questions.forEach((q, i) => {
      const feedback = h.nodes().find(n => n.props.id === `answer-feedback-${i}`)!;
      assert.ok(feedback.props.children.includes(q.answerFeedback![option]));
      assert.ok(h.nodes().filter(n => n.props.name === `answer-${i}`).every(n => n.props["aria-describedby"] === `answer-feedback-${i}`));
    });
    assert.equal(h.calls.length, 0);
  }
  h.answer(0, 1);
  assert.equal(h.nodes().some(n => n.props.id === "answer-feedback-0"), false);
  h.button("Start again").props.onClick();
  assert.equal(h.nodes().some(n => n.type === "input" && n.props.checked), false);
  assert.equal(h.button("Check my answers").props.disabled, true);
});
test("only a correct lesson emits the slug once, including reset and remount", () => {
  const h = harness();
  h.complete();
  assert.equal(JSON.stringify(h.calls), JSON.stringify([["education_lesson_completed", "education", "bmi-in-context"]]));
  assert.ok(h.nodes().some(n => n.props.href === "/tools/appointment-planner"));
  h.button("Start again").props.onClick(); h.complete();
  assert.equal(h.calls.length, 1);
  const remount = harness({ stored: h.stored }); remount.complete();
  assert.equal(remount.calls.length, 0);
});
test("declined consent, local previews, absent analytics and blocked storage never send a completion", () => {
  for (const options of [{ consent: "declined" }, { hostname: "127.0.0.1" }, { ga: false }, { blocked: true }]) {
    const h = harness(options); h.complete();
    assert.equal(h.calls.length, 0);
    assert.equal(h.stored.size, 0);
    assert.ok(h.nodes().some(n => n.props.href === "/tools/appointment-planner"));
  }
});
test("unchanged lessons retain their general explanation and no BMI-specific content", () => {
  for (const lesson of lessons.slice(1)) {
    const h = harness({ lesson }); h.complete();
    assert.equal(h.nodes().some(n => n.props.id === "worked-example-title"), false);
    lesson.questions.forEach((q, i) => assert.ok(h.nodes().find(n => n.props.id === `answer-feedback-${i}`)!.props.children.includes(q.explanation)));
  }
});
test("worked BMI arithmetic and answer feedback are complete", () => {
  assert.equal((70 / (1.75 ** 2)).toFixed(1), "22.9");
  for (const q of lessons[0].questions) {
    assert.equal(q.answerFeedback?.length, q.answers.length);
    assert.ok(q.answerFeedback?.every(text => text.length > 30));
  }
});
