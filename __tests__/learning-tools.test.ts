import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  lessons,
  lessonPassed,
  paths,
  experiences,
  medicines,
  supportResources,
} from "../lib/learning/content.ts";
import {
  createVoteHandlers,
  signVoter,
  validVoter,
  voterHash,
  networkBucket,
  voteCookie,
  type VoteStore,
} from "../lib/learning/voting.ts";
const secret = "test-only-fixed-secret-not-production";
test("lesson completion requires all three correct answers; incomplete and wrong submissions do not pass", () => {
  for (const lesson of lessons) {
    assert.equal(lesson.questions.length, 3);
    assert.equal(lessonPassed(lesson, {}), false);
    const answers = Object.fromEntries(
      lesson.questions.map((q, i) => [i, q.correct]),
    );
    assert.equal(lessonPassed(lesson, answers), true);
    assert.equal(
      lessonPassed(lesson, { ...answers, 0: (answers[0] + 1) % 3 }),
      false,
    );
  }
});
test("guided paths only link to implemented routes or published articles", () => {
  const catalog = JSON.parse(
    readFileSync(
      new URL("../content/articles/catalog.json", import.meta.url),
      "utf8",
    ),
  );
  const published = new Set(catalog.articles.map((a: any) => a.metadata.slug));
  for (const path of paths)
    for (const step of path.steps) {
      if (step.url.startsWith("/blog/"))
        assert.ok(published.has(step.url.slice(6)), step.url);
      else if (step.url.startsWith("/education/lessons/"))
        assert.ok(lessons.some((l) => step.url.endsWith(l.slug)));
      else
        assert.ok(
          existsSync(new URL(`../app${step.url}/page.tsx`, import.meta.url)),
          step.url,
        );
    }
  for (const item of experiences)
    assert.ok(
      existsSync(new URL(`../app${item.url}/page.tsx`, import.meta.url)),
    );
});
test("national support collection has no Ohio service-area targeting and only HTTPS destinations", () => {
  assert.ok(supportResources.length >= 4);
  assert.ok(
    !/ohio|dayton|columbus|cincinnati|cleveland/i.test(
      JSON.stringify(supportResources),
    ),
  );
  for (const r of supportResources)
    assert.equal(new URL(r.url).protocol, "https:");
  assert.equal(
    medicines.find((m) => m.id === "retatrutide")?.status,
    "Not FDA-approved",
  );
});
test("voting tokens reject tampering, expiration and a different server secret", () => {
  const now = Date.now();
  const token = signVoter(secret, now);
  assert.ok(validVoter(token, secret, now));
  assert.equal(validVoter(token + "a", secret, now), false);
  assert.equal(validVoter(token, "other", now), false);
  assert.equal(validVoter(token, secret, now + 181 * 86400000), false);
  assert.notEqual(voterHash(token, secret), token);
  assert.notEqual(
    networkBucket("192.0.2.1", secret, 0),
    networkBucket("192.0.2.1", secret, 86400000),
  );
});
function harness(fail = false) {
  const rows = new Map<string, string>();
  let writes = 0;
  const store: VoteStore = {
    async counts() {
      if (fail) throw Error("offline");
      return Object.fromEntries(
        [
          "health-headlines",
          "care-questions",
          "food-labels",
          "research-words",
        ].map((t) => [t, [...rows.values()].filter((v) => v === t).length]),
      );
    },
    async hasVote(hash) {
      return rows.has(hash);
    },
    async vote(topic, hash) {
      writes++;
      if (fail) throw Error("offline");
      if (rows.has(hash)) return "duplicate";
      rows.set(hash, topic);
      return "saved";
    },
  };
  return { api: createVoteHandlers(store, secret), writes: () => writes };
}
function post(
  body: string,
  token: string,
  origin = "https://www.weightliteracy.org",
) {
  return new Request("https://www.weightliteracy.org/api/topic-vote", {
    method: "POST",
    headers: {
      origin,
      "Content-Type": "application/json",
      cookie: `${voteCookie}=${token}`,
    },
    body,
  });
}
test("voting rejects cross-origin, malformed, oversized and unlisted input before storing", async () => {
  const h = harness();
  const token = signVoter(secret);
  for (const req of [
    post('{"topic":"health-headlines"}', token, "https://other.invalid"),
    post("bad", token),
    post('{"topic":"unknown"}', token),
    post('{"topic":"health-headlines","email":"someone"}', token),
    post("a".repeat(513), token),
    post('{"topic":"health-headlines"}', "forged"),
  ])
    assert.ok((await h.api.POST(req)).status >= 400);
  assert.equal(h.writes(), 0);
});
test("voting gives an HttpOnly receipt and counts a repeated submission only once", async () => {
  const h = harness();
  const first = await h.api.GET(
    new Request("https://www.weightliteracy.org/api/topic-vote"),
  );
  assert.ok(first.headers.get("set-cookie")?.includes("HttpOnly"));
  assert.ok(first.headers.get("set-cookie")?.includes("Secure"));
  const cookie = first.headers
    .get("set-cookie")!
    .split(";")[0]
    .slice(voteCookie.length + 1);
  for (let i = 0; i < 2; i++) {
    const response = await h.api.POST(
      post('{"topic":"health-headlines"}', cookie),
    );
    assert.equal(response.status, 200);
    assert.equal((await response.json()).counts["health-headlines"], 1);
  }
});
test("storage failure never reports a saved vote or invents counts", async () => {
  const h = harness(true);
  const response = await h.api.POST(
    post('{"topic":"food-labels"}', signVoter(secret)),
  );
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.counts, undefined);
  assert.equal(
    (
      await h.api.GET(
        new Request("https://www.weightliteracy.org/api/topic-vote"),
      )
    ).status,
    503,
  );
});
