# Editorial policy: which posts get written

In effect from **2026-09-18** (the policy date). [`editorial-standard.md`](editorial-standard.md)
covers how a post is written. This document decides whether it gets written at all, in which
language, and how it is judged once it is live. OpenSpec change: `investigation-content-strategy`.

## Why

GSC, `sc-domain:xabierlameiro.com`, 28 days ending 2026-09-18: 4,347 impressions, 20 clicks,
CTR 0.46%, average position 10.6.

- The two memory-leak investigations (July 2026) hold 13 of the 20 clicks.
- Error-message posts rank and do not convert. `npm-token-solution-error`: 1,190 impressions at
  position 6.0, 3 clicks. Two rounds of snippet work (SDD-010 in July, the NPM_TOKEN title fix in
  August) left their CTR at 0.18–0.25%. The fix fits in the AI Overview and the GitHub issue above
  the result, so nobody needs to open the page.
- Translations add cost, not reach. The `es` version of the winning post had 20 impressions
  against 810 for `en`. `gl` versions get about one impression a month.

## 1. The investigation gate

A topic is drafted only if it passes all four points. Record the result in the calendar below (or
in the radar issue) **before** the first draft exists.

1. **Measured.** It reports something the author measured or built, with the numbers or artefacts
   in the post.
2. **Not a snippet.** Write the answer in one sentence. If that sentence is enough for the reader,
   it is not a post.
3. **Reproducible.** It names a method the reader can run: a command, a repo, a script.
4. **Not an error fix.** Its subject is not how to fix a specific error message.

A rejected topic keeps its row with the reason, so the same idea is not proposed again next month.

## 2. Error-message posts are frozen

The posts in the `Error` category (`address-already-in-use`, `npm-token`, `uncaught-error`) stay
online as they are. They are not refreshed, retitled or expanded. The only permitted edits are
factual corrections and broken-link fixes. The quarterly refresh task never proposes them.

## 3. English first

A new post ships as `<slug>.en.mdx` only. An `es` or `gl` version is written only when the owner
asks for it for that post. Existing translations stay online unchanged.

The site handles a single-locale post without broken signals: it lists it only in English, emits
only its own hreflang plus `x-default`, and 301-redirects `/es/…` or `/gl/…` requests for it to
the English URL (pinned by `src/__test__/singleLocalePost.test.tsx`).

## 4. Frontmatter limits

`prebuild` runs `scripts/check-frontmatter`. For posts whose `<Date>` is on or after the policy
date, the build fails on a missing field, a `title` over 60 characters or a `description` over
155. Older posts only warn.

## 5. Measurement

Every published post gets two readings, written into its calendar row:

- **Day 14 and day 28:** GSC clicks, impressions, CTR and average position for the post URL, plus
  the visit count from Vercel Web Analytics once `measure-real-traffic` is live.
- **Day 28 verdict:** one line saying whether the format is kept.

## 6. Calendar

Cadence: 1–2 posts a month (owner decision, 2026-07-18). The order follows data availability, not
topic appeal: a post is never scheduled before its data exists.

| # | Working title | Source material | Data available | Gate (1·2·3·4) |
| --- | --- | --- | --- | --- |
| 1 | GA4 cannot see most visitors on a small site with Consent Mode v2. Drafted 2026-09-18 as `data/blog/ga4-consent-mode-small-site` ("GA4 saw 12 of my 23 Google clicks. Where did the rest go?"), committed after owner review. Measured gap is about half, not "most": 23 GSC clicks vs 12 GA4 `google / organic` sessions, 19 Aug–15 Sep 2026; GA4 Reporting identity says modeling is not available | `_app.tsx` consent defaults; GSC clicks vs GA4 sessions for the same 28-day window; Vercel visit counts if live | Now | pass · pass (the answer is the size of the gap on a real site, not the fact that one exists) · pass · pass |
| 2 | A blog route went from 32 s to 1.6 s: the O(N²) loader behind a Vercel 504. Drafted 2026-09-18 as `data/blog/quadratic-mdx-loader-vercel-504` ("One page, 32,800 file reads: the O(N²) behind a Vercel 504"), committed after owner review | SDD-012 measurements, PR #132; read-count benchmark of `99ea971` vs `7f9519a` at 39/78/117 files | Now | pass · pass · pass · pass (the 504 is the symptom, the post is the profiling) |
| 3 | Why a path-segment facet cannot be redirected, noindexed or disallowed. Drafted 2026-09-18 without results as `data/blog/tag-facet-urls-query-parameter` (owner's choice); its Results section is marked PENDING and blocks publishing | SDD-009, PRs #186 / #189, result of `tag-facets-as-query-param` | After that change ships | pass · pass · pass · pass |
| 4 | I let every AI crawler in and published llms.txt: what they took and what they sent back | `measure-real-traffic` data, 28 days minimum. Baseline read 2026-09-18 in GA4 (property 348472560), 18 Jul–17 Sep 2026, since llms.txt and the AI-crawler policy shipped (#133): 3 sessions referred by AI assistants (perplexity.ai 2, claude.ai 1, chatgpt.com 0) of 1,244. Consented visitors only; no crawler-hit data exists before that change ships | 28 days after that change reaches production | pass · pass · pass · pass (blocked on data) |

Readings (fill in as each post goes live):

| # | Published | Day 14 (clicks · impr · CTR · pos · visits) | Day 28 (clicks · impr · CTR · pos · visits) | Keep the format? |
| --- | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |

Each post goes through: gate recorded → draft → owner review → publish `en` only →
day-14 and day-28 readings.

Growth is organic. Posts are not cross-posted or pushed to social networks (SDD-013 "no
syndication", reconfirmed by the owner 2026-09-18). A post earns its readers through search and
AI answer engines, so the gate and the snippet limits above are what drive reach.
