import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { articleCompanions, selectedQuestions } from "../lib/learning/article-companions.ts";

const compile = (path: string) => ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const trackerCode = compile("../lib/learning/question-guide-tracking.ts");
const componentCode = compile("../components/learning/article-companion.tsx");
function tracker(options: { consent?: string | null; hostname?: string; ga?: boolean; storageFailure?: string; analyticsFailure?: boolean; stored?: Map<string, string> } = {}) {
  const stored = options.stored ?? new Map<string, string>();
  const calls: unknown[][] = [];
  const exports: any = {};
  let consent = options.consent === undefined ? "accepted" : options.consent;
  runInNewContext(trackerCode, {
    exports, require(name: string) {
      assert.equal(name, "@/components/analytics/ga4-provider");
      return { trackEvent: (...args: unknown[]) => { if (options.analyticsFailure) throw Error("analytics unavailable"); calls.push(args); } };
    },
    window: { location: { hostname: options.hostname ?? "www.weightliteracy.org" }, gtag: options.ga === false ? undefined : () => undefined },
    localStorage: { getItem(key: string) { assert.equal(key, "hwlf-cookie-consent"); if (options.storageFailure === "consent") throw Error("blocked"); return consent; } },
    sessionStorage: {
      getItem: (key: string) => { if (options.storageFailure === "read") throw Error("blocked"); return stored.get(key); },
      setItem: (key: string, value: string) => { if (options.storageFailure === "write") throw Error("blocked"); stored.set(key, value); },
    },
  });
  return { calls, stored, send: exports.trackQuestionGuideDownloadRequest as () => void, consent: (next: string) => { consent = next; } };
}
function component({ send = () => {}, failDownload = false, companion = articleCompanions[0] } = {}) {
  let cursor = 0;
  const state: any[] = [], files: any[] = [], exports: any = {};
  let printed = 0, removed = 0, revoked = 0;
  const jsx = (type: unknown, props: any) => ({ type, props });
  runInNewContext(componentCode, {
    exports, require(name: string) {
      if (name === "react") return { useId: () => "guide-test", useState: (initial: any) => {
        const i = cursor++; if (!(i in state)) state[i] = initial;
        return [state[i], (next: any) => { state[i] = typeof next === "function" ? next(state[i]) : next; }];
      } };
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "next/link") return { default: "link" };
      if (name === "@/lib/learning/article-companions") return { selectedQuestions };
      if (name === "@/lib/learning/question-guide-tracking") return { trackQuestionGuideDownloadRequest: send };
      throw Error(`Unexpected dependency ${name}`);
    },
    Blob: class { constructor(parts: string[], options: object) { files.push({ text: parts.join(""), options }); } },
    URL: { createObjectURL() { return "blob:local-test"; }, revokeObjectURL() { revoked++; } },
    document: { documentElement: { dataset: {} }, body: { appendChild() {} }, createElement(tag: string) {
      assert.equal(tag, "a"); return { href: "", download: "", click() { if (failDownload) throw Error("download blocked"); files.at(-1).filename = this.download; }, remove() { removed++; } };
    } },
    window: { addEventListener() {}, removeEventListener() {}, print() { printed++; } },
    setTimeout(fn: () => void) { fn(); },
  });
  function nodes() {
    cursor = 0; const out: any[] = [];
    function visit(node: any) { if (Array.isArray(node)) node.forEach(visit); else if (node?.props) { out.push(node); visit(node.props.children); } }
    visit(exports.ArticleCompanion({ companion })); return out;
  }
  const button = (label: string) => nodes().find(n => n.type === "button" && n.props.children === label)!;
  return { nodes, files, button, counts: () => ({ printed, removed, revoked }),
    choose(index: number) { nodes().filter(n => n.type === "input" && n.props.type === "checkbox")[index].props.onChange(); },
    download(trusted = true) { button("Download my questions").props.onClick({ isTrusted: trusted }); },
  };
}

test("guide selection is visible before exploration and the shortcut targets an accessible section", () => {
  const h = component(); const nodes = h.nodes();
  const section = nodes.find(n => n.props.id === "guide-test-questions");
  assert.equal(section.type, "section"); assert.equal(section.props.tabIndex, -1);
  assert.ok(nodes.some(n => n.props.href === "#guide-test-questions"));
  assert.ok(nodes.indexOf(section) < nodes.findIndex(n => n.props.role === "group"));
});
test("rendering, selections, clearing, print and empty downloads never emit", () => {
  const t = tracker(), h = component({ send: t.send });
  assert.equal(h.button("Download my questions").props.disabled, true);
  h.download(); assert.equal(h.files.length, 0);
  h.choose(0); h.button("Print / save as PDF").props.onClick();
  h.button("Clear my choices").props.onClick(); h.download();
  assert.equal(h.counts().printed, 1); assert.equal(t.calls.length, 0);
});
test("a deliberate download exports exactly the approved selected questions and a generic event", () => {
  for (const companion of articleCompanions) {
    const t = tracker(), h = component({ send: t.send, companion });
    h.choose(0); h.choose(2); h.download();
    assert.equal(h.files.length, 1); assert.ok(h.files[0].text.includes(companion.title));
    assert.ok(h.files[0].text.includes(companion.questions[0])); assert.ok(h.files[0].text.includes(companion.questions[2]));
    assert.ok(!h.files[0].text.includes(companion.questions[1]));
    assert.equal(h.files[0].filename, `weightliteracy-${companion.slug}-questions.txt`);
    assert.equal(JSON.stringify(t.calls), JSON.stringify([["question_guide_download_requested", "education", "question_guide"]]));
    assert.deepEqual(h.counts(), { printed: 0, removed: 1, revoked: 1 });
  }
});
test("repeat clicks, remounts and another guide do not inflate a session", () => {
  const t = tracker(), h = component({ send: t.send }); h.choose(0); h.download(); h.download();
  assert.equal(h.files.length, 2); assert.equal(t.calls.length, 1);
  const remount = tracker({ stored: t.stored }), second = component({ send: remount.send, companion: articleCompanions[1] });
  second.choose(1); second.download(); assert.equal(remount.calls.length, 0);
  assert.deepEqual([...t.stored.entries()], [["wl-question-guide-download-requested", "1"]]);
});
test("privacy and unavailable-analytics guards suppress tracking while downloads work", () => {
  for (const options of [{ consent: "declined" }, { consent: null }, { hostname: "localhost" }, { hostname: "preview.vercel.app" }, { ga: false }, { storageFailure: "consent" }, { storageFailure: "read" }, { storageFailure: "write" }, { analyticsFailure: true }]) {
    const t = tracker(options), h = component({ send: t.send }); h.choose(0); h.download();
    assert.equal(t.calls.length, 0); assert.equal(h.files.length, 1);
    assert.ok(h.nodes().some(n => n.props.role === "status" && n.props.children.startsWith("Download requested.")));
  }
});
test("download failure and untrusted programmatic activation produce no conversion", () => {
  const t = tracker(), fail = component({ send: t.send, failDownload: true }); fail.choose(0); fail.download();
  assert.equal(t.calls.length, 0); assert.ok(fail.nodes().some(n => n.props.role === "status" && n.props.children.startsWith("The download could not start.")));
  const synthetic = component({ send: t.send }); synthetic.choose(0); synthetic.download(false);
  assert.equal(t.calls.length, 0); assert.equal(synthetic.files.length, 1);
});
test("consent acceptance alone does not backfill an earlier request", () => {
  const t = tracker({ consent: "declined" }), h = component({ send: t.send }); h.choose(0); h.download();
  t.consent("accepted"); h.nodes(); assert.equal(t.calls.length, 0);
  h.download(); assert.equal(t.calls.length, 1);
  t.consent("declined"); h.download(); assert.equal(t.calls.length, 1);
});
