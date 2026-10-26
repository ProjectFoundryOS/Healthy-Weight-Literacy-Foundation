import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { articleCompanions, selectedQuestions } from "../lib/learning/article-companions.ts";

test("print selection excludes unknown indexes and duplicates and retains reading order", () => {
  const companion = articleCompanions[0];
  assert.deepEqual(selectedQuestions(companion, [2, -1, 999, 0, 2]), [companion.questions[0], companion.questions[2]]);
  assert.deepEqual(selectedQuestions(companion, []), []);
});
test("all eight companions have valid published destinations and usable scenario feedback", () => {
  const catalog = JSON.parse(readFileSync(new URL("../content/articles/catalog.json", import.meta.url), "utf8"));
  const published = new Set(catalog.articles.map((a: any) => a.metadata.slug));
  assert.equal(new Set(articleCompanions.map(c => c.slug)).size, 8);
  for (const companion of articleCompanions) {
    assert.ok(published.has(companion.slug));
    assert.equal(companion.scenario.feedback.length, companion.scenario.options.length);
    assert.ok(companion.scenario.correct >= 0 && companion.scenario.correct < companion.scenario.options.length);
    assert.ok(companion.sources.every(s => s.url.startsWith("https://")));
    if (companion.next.href.startsWith("/blog/")) assert.ok(published.has(companion.next.href.slice(6)));
    else if (!companion.next.href.startsWith("/education/lessons/")) assert.ok(existsSync(new URL(`../app${companion.next.href}/page.tsx`, import.meta.url)));
  }
});
test("companion inputs do not introduce storage, network requests or conversion events", () => {
  const component = readFileSync(new URL("../components/learning/article-companion.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(component, /localStorage|sessionStorage|fetch\(|sendBeacon|gtag|education_lesson_completed|article_read_qualified|supabase/i);
  assert.ok(component.includes('disabled={!questions.length}'));
});
