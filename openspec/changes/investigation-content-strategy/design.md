## Context

- The post loader (`src/helpers/fileReader.ts`) already filters by locale: `findPostBySlug` looks
  a slug up inside the requested locale first, and `getPostsByLocale` builds each listing from
  that locale only. A post with only `.en.mdx` should already be absent from `es`/`gl` listings.
  What is not known is what the other surfaces do: hreflang in `SEO/tags.tsx` and
  `_document.tsx`, the language switcher, `getStaticPaths`, the sitemap writer
  (`fileWritter.ts`), RSS (`generate-feeds.ts`) and `llms.txt` (`generate-llms.ts`).
- Hreflang alternates come from the `alternate` frontmatter array. A post without it should
  emit only its own `en` link plus `x-default`, but that has to be checked in the rendered HTML.
- There is no frontmatter schema. Zod is already used in `scripts/` (`generate-llms.ts`,
  `generate-feeds.ts`, `indexnow-ping.ts`).
- Legacy posts break the limits widely: across all 45 MDX files, 38 descriptions exceed 155
  characters and 12 titles exceed 60 (measured 2026-09-18 with `scripts/check-frontmatter`; the
  first count of four looked at English error posts only). Per the 2026-09-05 decision, error
  posts are not optimised further, so the check cannot fail the build on them.

## Goals / Non-Goals

**Goals:**

- A written gate that rejects an error-fix post before any time is spent on it.
- English-only publishing that leaves no broken link, hreflang or route behind.
- A calendar of four posts whose data already exists or is being collected.

**Non-Goals:**

- Deleting, redirecting or noindexing existing `es`/`gl` translations. They cost nothing to keep
  and removing them is a separate decision with its own risk.
- Refreshing error posts.
- Publishing more than 2 posts a month. Volume of AI-assisted content is what earned the
  low-value-content flag (SDD-003).

## Decisions

**D1 · The investigation gate is a checklist, not a judgement.** A draft passes only if all four
hold:

1. It reports something the author measured or built, with the numbers or artefacts in the post.
2. The reader could not get the answer from a one-line snippet or an AI Overview. Test: write the
   answer in one sentence; if that sentence is enough, it is not a post.
3. It names a reproducible method (command, repo, script) the reader can run.
4. It is not a fix for an error message.

Alternative considered: keep writing error posts with better snippets. Rejected on evidence: two
rounds of snippet work (SDD-010 in July, NPM_TOKEN title fix in August) left CTR at 0.18–0.25%.

**D2 · Frontmatter validation fails only for new posts.** The schema checks every post; a post
whose publish date (`<Date>` in the body, via `extractPostDate`) is on or after the policy date
fails the build on violation, an older post logs a warning. Alternative: an allowlist of legacy
slugs. Rejected because a date cut-off needs no maintenance.

**D3 · Calendar order follows data availability, not topic appeal.**

| # | Working title | Source material | Available |
| --- | --- | --- | --- |
| 1 | GA4 cannot see most visitors on a small site with Consent Mode v2 | `_app.tsx` consent defaults, GSC clicks vs GA4 sessions for the same window | Now |
| 2 | A blog route went from 32 s to 1.6 s: the O(N²) loader behind a Vercel 504 | SDD-012 measurements, PR #132 | Now |
| 3 | Why a path-segment facet cannot be redirected, noindexed or disallowed | SDD-009, PRs #186 / #189, `tag-facets-as-query-param` result | After that change ships |
| 4 | I let every AI crawler in and published llms.txt: what they took and what they sent back | `measure-real-traffic` data, ≥ 4 weeks | ~4 weeks after that change ships |

The strongest topic (AI crawlers) goes last because publishing it without numbers would break D1.

## Risks / Trade-offs

- **Search demand for "consent mode" posts may be small.** Accepted: growth stays organic (owner,
  2026-09-18, `post-distribution` rejected), so the day-28 reading decides whether the format is
  kept rather than a distribution push.
- **English-only drops the Spanish audience.** Measured cost is near zero today (20 vs 810
  impressions on the winning post); the policy allows an `es` version when the owner wants one.
- **A missing-locale bug could ship silently.** Mitigation: task 2 adds a fixture post with only
  `.en.mdx` and asserts on the rendered HTML, not on the loader.
