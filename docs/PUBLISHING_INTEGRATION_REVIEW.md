# Publishing integration review

**October 18 update:** the user has chosen repository-only article publishing. The hybrid-source implementation discussed below is historical and has been replaced. The public reader now has no database dependency. See [current cutover](ARTICLE_SOURCE_CUTOVER.md) and [publishing workflow](OWNED_ARTICLE_PUBLISHING.md). Browser project access was obtained October 17, but settings/log permissions remain limited; those permissions are no longer prerequisites for building the article reader.

Checked October 16, 2026 Pacific time. This records source comparison, not a merged integration or independent clinical review.

## Verified source state

- GitHub main remains `e919066f9e3748c83f537d783f8adea411a71fd7`.
- Foundation [PR #32](https://github.com/ProjectFoundryOS/Healthy-Weight-Literacy-Foundation/pull/32) remains open at `60f4ff2947ae4bfe0ffc16624f7e58e17db217e5`. Its actual ten-file patch was read in this continuation.
- [Issue #33](https://github.com/ProjectFoundryOS/Healthy-Weight-Literacy-Foundation/issues/33) remains open. It reports an earlier hosted source-fetch failure and pending read-only corpus diagnosis on the existing infrastructure. This is historical evidence, not a fresh database health result.

## How the implementations interact

| Area | PR #32 | Owned publishing branch | Integration decision |
| --- | --- | --- | --- |
| Public reader | Changes functions in `lib/supabase-blog.ts` | Routes public pages through `lib/articles.ts`; leaves old helpers intact | Keep one public inventory. Merging the old helper changes alone would not add snapshot fallback to the new adapter. |
| Legacy inventory | Live public read lacks pagination; exporter pages in fixed batches | Public read paginates with exact-count verification, including a smaller server cap | Preserve complete-inventory checks. A partial response must not become the public library. |
| Source outage | Allows validated local snapshot fallback | Stops on missing or empty legacy source | Keep the present stop until a real backup and withdrawal rules are verified. No snapshot is available in this branch. |
| Sitemap | Removes swallowed reader errors | Same error behavior; also removes the static file shadowing the generated route | Retain the served-sitemap fix and shared inventory. |
| Commands | Adds snapshot exporter and staging verification | Adds approval exporter and isolated publishing tests | Different contracts; do not replace one command with the other or use engine fixtures as approved content. |
| New content approval | Existing engine is a separate dependency | Private Markdown/JSON, explicit approval records, body and metadata hashes | New articles do not require ownership of Terry's generator. Genuine human review remains required. |

Do not merge PR #32 wholesale as a prerequisite for this new workflow. Preserve its history and useful backup work. If a real legacy backup is needed, integrate that source through the single adapter after reviewing the actual corpus, unpublished/withdrawn slugs, freshness policy, public fields, and rollback behavior. A hash proves unchanged bytes, not that an old article is still authorized for publication.

## Current access results

- GitHub main and PR reads succeeded.
- Vercel connector returned 403 for team `an0ns-projects-467eafcd`, project `v0-healthyweightliteracyfoundation`.
- The same project URL in the browser showed Not Found while signed in as `tony+v0@infinitmation.com`.
- No `vercel` CLI was available on PATH for the suggested authenticated fallback.
- Connected Supabase listed four unrelated projects and no WeightLiteracy project. Their databases were not queried. This does not establish whether WeightLiteracy uses another cloud account or a self-hosted instance.

The next prerequisite is access to the existing [Vercel project](https://vercel.com/an0ns-projects-467eafcd/v0-healthyweightliteracyfoundation). Sign in with an account that already has access, or have the project owner invite the intended account. Once access works, verify project/repository linkage, production branch, content endpoint configuration, and the actual article inventory before choosing a migration or release. No keys need to be copied into this document.

## Newsletter dependency

The current `app/api/newsletter/route.ts` was read again: it attempts two emails, catches both failures, stores no subscriber record, and returns success. No live signup was submitted. Selecting or altering a subscriber store before identifying the existing accounts would risk creating a second, disconnected mailing list. After hosting access is restored, inspect configuration and the existing mailing-list destination; then implement durable, consent-aware capture with truthful success reporting and verify an authorized test subscriber end to end.

No PR was merged, no remote branch was pushed, and no deployment, database mutation, invitation, or email was sent during this review.
