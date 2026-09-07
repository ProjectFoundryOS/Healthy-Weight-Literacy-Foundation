# ProjectFoundryOS Migration Readiness — Healthy-Weight-Literacy-Foundation

Mission: `PFORG-MIG-WEIGHT-003` (Agent Mission Control, worker `claude-seat-1`,
project `agent-mission-control` / ProjectFoundryOS top-five migration-readiness
sprint).

Scope: audit-and-fix-in-place only. **No repository transfer, DNS change,
custom-domain change, production deployment change, billing change, or
credential rotation was performed or is proposed here. No medical/evidence
policy, citation-integrity requirement, or content-quality gate was
weakened.**

## 1. Production identity confirmed

- Repository: `TheRealSynth/Healthy-Weight-Literacy-Foundation` (this repo).
- Production domains: `weightliteracy.org` and `www.weightliteracy.org`.
- Vercel project (per mission brief, not independently re-derivable from
  inside this repository — no `vercel.json` exists here; Vercel project
  settings live in Vercel's own configuration): `v0-healthyweightliteracyfoundation`.
- Post-transfer target: **`ProjectFoundryOS/Healthy-Weight-Literacy-Foundation`**
  (not performed by this mission).

## 2. Current Vercel/GitHub/domain binding assumptions (documented, not changed)

- A Vercel GitHub App integration is installed on this repository. Evidence:
  merged PR #13's head commit carried a `Vercel Preview Comments` check run
  (`conclusion: success`, `details_url: https://vercel.com/github`).
- No `vercel.json` exists — production branch, environment variables, and
  domain assignment are entirely Vercel-side configuration, not something a
  repository-content audit can read or change.
- `weightliteracy.org` / `www.weightliteracy.org` DNS and custom-domain
  assignment are Vercel/domain-registrar-side configuration, explicitly out
  of this mission's scope.
- **Hazard (same class as the sibling GLH-PROD-002 mission's finding)**: a
  GitHub organization transfer does not automatically guarantee Vercel's
  Git integration and any Supabase preview GitHub App stay linked/authorized
  for the new org. This must be verified, and reconnected/re-authorized if
  needed, by whoever holds Vercel/GitHub App access, **after** the transfer.

## 3. Hard-coded `TheRealSynth` / live-configuration hazard inventory

A full-repository recursive, case-insensitive search for `TheRealSynth`
found **zero hits** anywhere in this repository's tracked files (unlike the
sibling `ideabin-ai` and `v0-growlocalhub-new-motion-site` repositories,
which each had a handful of historical PR-URL/audit-snapshot references —
this repository has none at all).

**No fixable hazard class was found:**

- No `.github/workflows/**` exist in this repository — nothing to audit for
  hardcoded-owner `actions/checkout` refs or workflow-level org assumptions.
- No `vercel.json` exists.
- `package.json` has no `repository`, `homepage`, or `bugs` field pointing at
  a GitHub URL (`name` is the generic v0-generated `"my-v0-project"`).
- No `README.md`, `.env.example`, `AGENTS.md`, or `CLAUDE.md` exists in this
  repository, so there is no launcher/agent-prompt document of the kind the
  sibling `ideabin-ai` repository had to genericize.
- Supabase access (`lib/supabase*`, `scripts/migrate-html-to-markdown.ts`)
  reads `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` from
  environment variables — already portable; no hardcoded project ref.
- `weightliteracy.org` / `info@weightliteracy.org` (in `lib/seo.ts` and
  several pages) is the production business domain/email, not a repository
  or GitHub-org reference — unaffected by a GitHub org transfer and out of
  this mission's scope regardless.
- `replit-changes.patch` and `.replit` at the repo root are pre-existing,
  unrelated Replit-import artifacts (the patch file contains unresolved
  `diff --cc` conflict markers from a past merge). Neither is inside this
  mission's `owns_paths`, and neither references `TheRealSynth` or any
  transfer-relevant configuration — left untouched, out of scope.

**Conclusion: this repository contains zero hardcoded-ownership hazards to
fix.** The one documentation deliverable required by this mission is this
readiness doc itself.

## 4. Pre-existing build/deployment defects vs. migration-specific risk

The mission brief states the latest known deployment state was not healthy.
Three genuinely pre-existing defects were found and verified as **unrelated
to any org transfer** (they reproduce identically regardless of which
GitHub org hosts this repository):

| ID | Defect | Pre-existing or migration-caused? | Fixed here? |
|---|---|---|---|
| WEIGHT-003-D1 | `next build` panicked with a Turbopack internal error (`NftJsonAsset: cannot handle filepath node:worker_threads`) on the pinned `next@16.0.10`. | **Pre-existing** — a known-class Turbopack bug in an early Next.js 16.0.x patch, unrelated to repository ownership. | **Yes** — bumped `next` to `16.2.6` (the same patched minor already validated working in the sibling `PFORG-MIG-GLH-PROD-002` migration mission's repository), which resolves the panic. Verified: `pnpm build` now compiles successfully. |
| WEIGHT-003-D2 | `next build`'s TypeScript pass failed on `scripts/migrate-html-to-markdown.ts`: `Could not find a declaration file for module 'turndown'`. | **Pre-existing** — `turndown` has no bundled types and `@types/turndown` was never added; this was masked before D1 was fixed because the build never reached the typecheck phase. Unrelated to org transfer. | **Yes** — added `@types/turndown@^5.0.6` as a devDependency. Verified: typecheck now passes and the build completes (40 routes generated). |
| WEIGHT-003-D3 | `pnpm lint` fails immediately: `ESLint couldn't find an eslint.config.(js|mjs|cjs) file` — and ESLint is not even declared as a project dependency (the invoked binary resolves to whatever ESLint happens to be available in the environment, currently v10.1.0). | **Pre-existing** — this repository has never had a working lint configuration; unrelated to org transfer. | **Not fixed.** Adding a lint toolchain from scratch (choosing an ESLint version, a Next.js-appropriate rule set, and an `eslint.config.js`) is a nontrivial tooling decision outside this migration mission's intent, and `eslint.config.js` is not inside this mission's `owns_paths`. Recorded here as a genuine defect for a dedicated follow-up mission, per the instruction to distinguish and record rather than silently fix or silently ignore. |
| WEIGHT-003-D4 | `__tests__/routes.test.ts` exists (Jest-style `describe`/`it`/`expect`) but no test runner is installed or wired to a `package.json` `test` script; it cannot currently be executed. | **Pre-existing** — unrelated to org transfer. | **Not fixed** — same reasoning as D3 (adding a test-runner toolchain is a scope decision beyond this mission, and no test-runner config file is in `owns_paths`). Note: the already-open `PR #29` (`claude/claude-seat-2/wl-build-001`, a separate, already-in-flight mission) adds `vitest.config.mts` and new tests — that PR is the appropriate place for test-runner setup, not this one. |
| WEIGHT-003-D5 | During the build's static generation, `getBlogPosts` logs `[Supabase] CONFIG ERROR: NEXT_PUBLIC_SUPABASE_URL is not set` and the build proceeds with zero statically generated `/blog/[slug]` pages. | **Pre-existing / environment-dependent, not migration-caused** — this session has no live Supabase credentials, so the content-retrieval fail-closed path is expected here. The underlying "silently ships zero article slugs when the content source is unavailable" behavior is exactly what the already-open `PR #29` (`WL-BUILD-001: Fail closed on empty article builds instead of silently shipping zero slugs`) is addressing. This mission does not duplicate that in-flight work. | **Not fixed here** — tracked by the existing PR #29, out of this mission's scope to duplicate. |

No evidence-based-publishing, citation-integrity, or health-content
safeguard was touched, weakened, or bypassed to obtain these results. The
two fixes made here (D1, D2) are dependency-version/type-declaration
corrections only — no application logic, content-validation rule, or
editorial/medical-review gate was changed.

## 5. Remaining owner actions (not performed by this mission)

1. Perform the actual GitHub organization transfer of this repository from
   `TheRealSynth` to `ProjectFoundryOS` (owner-gated; not done here).
2. After transfer, open the Vercel dashboard for project
   `v0-healthyweightliteracyfoundation` and confirm the GitHub Git
   integration still resolves to
   `ProjectFoundryOS/Healthy-Weight-Literacy-Foundation`; reconnect it if
   Vercel shows the linked repository as missing/renamed.
3. Re-approve or reinstall the Vercel GitHub App (and any other installed
   GitHub App) for the `ProjectFoundryOS` organization if GitHub suspends
   the existing installation on transfer.
4. Confirm `weightliteracy.org` / `www.weightliteracy.org` custom-domain
   assignment in Vercel is unaffected (expected: unaffected, since domain
   assignment is tied to the Vercel project, not the GitHub repo identity —
   not independently verifiable from this session).
5. Update any local/VPS clone remotes for every human or machine with an
   existing local checkout.
6. Update `agent-mission-control`'s own `control/PROJECTS.yaml` repository
   pointer for this project — outside this mission's `owns_paths`; tracked
   by the control-plane's own migration mission.
7. Set live production environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, etc.) in the (post-transfer) Vercel project
   if they are not already configured there independent of this repository
   — this session cannot read or verify production environment variables.
8. Non-blocking follow-up (unrelated to transfer, tracked here for
   visibility): set up a real ESLint config (WEIGHT-003-D3) and a wired
   test runner (WEIGHT-003-D4) in a dedicated mission, and land the
   already-open `PR #29` / `PR #22` content-safety work.

## 6. Post-transfer validation checklist

- [ ] `git clone https://github.com/ProjectFoundryOS/Healthy-Weight-Literacy-Foundation.git`
      succeeds for a fresh checkout.
- [ ] Vercel dashboard shows the project's Git integration pointing at
      `ProjectFoundryOS/Healthy-Weight-Literacy-Foundation` with the
      production branch unchanged.
- [ ] A no-op commit/push to the production branch triggers a new Vercel
      deployment (confirms the GitHub↔Vercel hook survived the transfer).
- [ ] `weightliteracy.org` and `www.weightliteracy.org` still resolve to the
      same Vercel deployment with no DNS change required.
- [ ] `pnpm install && pnpm build` passes on a fresh clone under the new org
      URL with real Supabase credentials configured, and `/blog/[slug]`
      generates a non-zero number of article pages.
- [ ] Browser smoke test: homepage, `/education`, `/programs`, `/blog`, one
      real blog article, `/donate`, `/contact` — confirm content renders
      and citation/medical-review pages (`/medical-review`,
      `/editorial-policy`, `/how-we-create-content`) still render their
      evidence-policy content unchanged.
- [ ] Any installed GitHub Apps (Vercel, and any others) show as active /
      authorized under `ProjectFoundryOS` in the repo's Settings →
      Integrations page.

## 7. Rollback plan

This mission's functional changes are two minimal, independently revertible
dependency edits in `package.json`/`pnpm-lock.yaml` (the `next` patch bump
and the `@types/turndown` addition), plus this one new documentation file:

- Revert/close the PR, or `git revert` the commits — no application logic,
  content, schema, or medical/editorial policy was touched.
- If the `next@16.2.6` bump is ever suspected of an unrelated regression,
  reverting to `16.0.10` restores the prior (Turbopack-broken) baseline;
  reverting is safe because no other code was written against the new
  version's behavior.
- If a future transfer is attempted and Vercel/GitHub App re-linking fails
  (Section 6 checklist fails), the safe rollback is to transfer the GitHub
  repository back to `TheRealSynth` and re-run the Section 6 checklist
  against the original org.

## 8. Readiness verdict

**READY_AFTER_OWNER_ACTION**

The repository contains zero hardcoded-ownership hazards (Section 3) and
now builds cleanly after two minimal, verified, reversible dependency fixes
that resolved genuinely pre-existing (not migration-caused) build defects
(Section 4, D1/D2 — `pnpm build` now passes, 40 routes generated). `pnpm
lint` and the orphaned Jest-style test file remain non-functional for
reasons predating this mission and outside its `owns_paths` (D3/D4); they
are recorded as follow-ups, not migration blockers. No evidence-based
publishing, citation-integrity, or health-content safeguard was weakened.
What remains is entirely owner-gated and cannot be verified or performed
from this session: the actual GitHub org transfer, Vercel dashboard/GitHub
App re-linking, and a live post-transfer smoke test against the production
domain (Sections 5 and 6).
