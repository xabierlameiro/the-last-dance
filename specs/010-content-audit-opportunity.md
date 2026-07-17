# SDD-010: Content audit + GSC opportunity map

-   **Status**: Investigation only (2026-07-17) — evidence gathered, **no content/code changed**.
    Output is a prioritized action list to feed the enrichment work and SDD-011 (content engine).
-   **Data**: GSC API (`sc-domain:xabierlameiro.com`), 90 days `2026-04-18 → 2026-07-17`,
    dimensions `page` (60 rows) and `query` (142 rows); repo inventory of `data/blog`.
-   **Related**: [002](002-seo-technical-foundation.md), [003](003-adsense-content-remediation.md)
    (low-value remediation), [006](006-trending-content-radar.md), [009](009-technical-seo-audit.md).

## Inventory (13 posts × 3 locales = 39 files)

| Canonical slug (en)                          | Category   | Tag       | 90d impressions | clicks | pos  |
| -------------------------------------------- | ---------- | --------- | --------------: | -----: | ---- |
| npm-token-solution-error                     | Error      | npm       | **3,765**       | **18** | 6.1  |
| uncaught-error-minified-react-error          | Error      | node      | **1,666**       | 0      | 9.0  |
| counter-for-github-stars-repository          | Nextjs     | node      | 1,041           | 1      | 9.3  |
| solve-address-in-use-error                   | Error      | node      | 571             | 0      | 22.1 |
| deploying-my-storybook-is-very-simple        | React      | storybook | 504             | 2      | 14.1 |
| how-document-my-react-components-with-jsdoc  | React      | node      | 312             | 3      | 19.2 |
| make-a-views-counter-with-google-analytics   | Nextjs     | node      | 185             | 0      | 33.8 |
| dark-theme (nextjs)                          | Nextjs     | css       | 185             | 0      | 28.4 |
| publish-report-testing-react                 | React      | jest      | 214             | 1      | 29.5 |
| continuous-integration-with-github-actions   | Nextjs     | devops    | 176             | 0      | 41.0 |
| translate-slugs-web-pages                    | Nextjs     | intl      | 94              | 0      | 19.6 |
| lighthouse-reporting-automation              | Javascript | node      | 26              | 0      | 10.0 |
| filter-for-positions                         | React      | node      | **0** (orphan)  | 0      | —    |

(en-locale figures; `/es` and `/gl` add a small long tail. Categories used: Error, React,
Nextjs, Javascript. Tags are single-valued and inconsistent — see finding 6.)

## Findings

1. **CTR crisis, not a ranking crisis.** Many posts already rank page-1 (positions 6–15) but
   convert ~0 clicks: `uncaught-error…` (1,666 impr, **pos 9, 0 clicks**), `counter-for-github-stars`
   (1,041 impr, pos 9, 1 click), `solve-address-in-use` (571 impr, 0 clicks). The bottleneck is
   **titles/meta written as error-string matches, not human snippets**. A title/meta rewrite pass
   is the single highest-ROI lever — higher than new content. **Tempering note:** pasted-error
   queries are among the most zero-click SERPs (AI Overviews answer them inline), so the rewrite
   lifts CTR from ~0 to modest, not to spectacular — still worth it for the cost (one pass over
   13 frontmatters), just don't judge the lever failed if absolute clicks stay small.

2. **Impression concentration.** `npm-token-solution-error` alone is ~40% of impressions and holds
   the only healthy CTR (18 clicks, pos 6.1). It proves the format works **when the snippet earns
   the click** — a template to copy, not a fluke.

3. **The biggest untapped click pool is the "React error #425" cluster.** Dozens of query variants
   — "react minified error 425", "react error 425 hydration", "react error 425 invariant",
   "react.dev/errors/425" — hundreds of impressions at positions 5–11, **zero clicks**, all mapping
   to `uncaught-error-minified-react-error`. One deep, well-titled explainer (what #425 is, the
   hydration cause, a real repro + fix, screenshots) is the highest-value single enrichment on the
   site. **Ceiling caveat (review note, 2026-07-17):** a sizeable slice of the cluster
   ("react error 425 react.dev errors 425", "react.dev/errors/425"…) is people googling the URL
   printed in the minified error message — **navigational intent toward react.dev** that no blog
   post can capture. The informational slice ("…hydration", "…meaning", "…invariant") is winnable.
   Still the best single enrichment, but size expectations to the informational subset, not the
   raw impression total.

4. **Strong lookup demand in the error posts, weak brand demand.** Query set is dominated by pasted
   terminal errors (EADDRINUSE / "address already in use" family, "failed to replace env in config",
   minified-react errors). Brand ("lameiro") = 2 impressions at pos 52. Confirms SDD-002/003: the
   traffic you have is lookup intent with near-zero engagement — exactly the "thin/low-value"
   profile AdSense flags. Fixing depth + intent match on these pages is remediation, not just growth.

5. **Illusory impressions on the stars-counter post.** Its 1,041 impressions come mostly from
   junk/bot-like queries ("api.github.com/repos/X stargazers_count"). Real intent is thin — do not
   over-invest here despite the impression count.

6. **Taxonomy is weak (feeds SDD-009).** Every post has exactly one tag, tags don't match categories,
   and some are near-duplicates of the category (Error/node). This makes tag pages low-value even
   once SDD-009 makes them navigable. Enrichment should also assign **richer, consistent multi-tag
   taxonomy**.

7. **Orphan / no-demand content.** `filter-for-positions` has zero GSC presence in 90 days. Either
   enrich toward a real query or leave as-is; not a priority.

8. **Junk subdomains still indexed** (`coverage.`, `performance.`, `e2e.`, `lighthouse.`) keep
   appearing among pages/queries — SDD-002 owner follow-up still pending and still diluting quality.

## What is actually worth writing/enriching (demand-backed)

Ranked by (existing demand ∩ your demonstrated stack ∩ ability to add first-hand depth):

-   **T1 — Enrich `uncaught-error-minified-react-error`** into a definitive "React error #425 /
    hydration" guide. Huge latent demand, already ranking, 0 clicks today. Best single move.
-   **T1 — Rewrite titles + meta descriptions across all 13 posts** for human CTR (keep the error
    string in the body/H2, put a benefit-led title on the tag). Cheap, site-wide lift.
-   **T2 — Expand `npm-token-solution-error`** (the winner): more `.npmrc` failure modes, CI cases,
    keep the FAQ. Defend and grow the one page that converts.
-   **T2 — Turn `solve-address-in-use-error` into a cross-platform EADDRINUSE guide** (macOS/Linux/
    Windows, node/docker/ports). Strong, evergreen developer pain at pos 22 → room to climb.
-   **T3 — Testing/CI cluster** (`publish-report-testing-react`, `publish-storybook`,
    `continuous-integration-github-actions`): you have authority; demand is moderate. Deepen with
    real screenshots and current tooling versions.
-   **Not from demand — net-new topics** in your stack (Next.js, React, testing, DevOps) belong to
    the SDD-011 engine (trending ∩ GitHub-issues ∩ experience), not to this audit.

## Decisions

-   **D1 (recommended) — Enrich-first, new-content-second.** Sequence: (1) site-wide title/meta
    rewrite for CTR, (2) deepen T1/T2 posts with first-hand explanation + screenshots, (3) only then
    add net-new posts via SDD-011. Rationale: the site already ranks; converting existing rankings
    beats chasing new ones, and depth is what removes the AdSense low-value signal.
-   **D2 — Assign consistent multi-tag taxonomy** during enrichment (pairs with SDD-009's tag pages).
-   **D3 — Leave orphan/junk-driven posts alone** (`filter-for-positions`, stars-counter) — no
    disproportionate effort.

## Acceptance criteria (for the enrichment session)

-   Every post has a human-readable `title` + `description` (benefit-led, ≤ ~60/~155 chars) distinct
    from the raw error string; the error string stays in-body for match.
-   T1 posts reach a materially deeper form (real repro, cause, fix, screenshots, updated versions)
    and demonstrate first-hand experience (E-E-A-T) per SDD-003.
-   Each post carries a consistent, multi-value tag set from a defined vocabulary.
-   Re-measure CTR/position for T1/T2 pages ~4 weeks post-deploy (owner, GSC).

## Handoff to SDD-011

Confirmed authority surface for the content engine: **Next.js, React, Node, testing (Jest,
Storybook, Playwright/e2e), CSS/theming, i18n, GitHub Actions/DevOps, GA**. The engine should
target net-new gaps in this surface — not re-cover the 13 existing topics.
