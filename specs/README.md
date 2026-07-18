# Specs (SDD)

Spec-Driven Development documents for xabierlameiro.com. Each spec records the evidence,
the decisions (with alternatives considered) and the acceptance criteria before any code is written.

Evidence snapshot date: **2026-07-17** — sources: Google Search Console API (`sc-domain:xabierlameiro.com`),
live-site inspection (browser + prod API probes), and code audit of this repo.

| Spec                                      | Title                                                        | Status                                                     |
| ----------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| [001](001-header-widgets-fixes.md)        | Header widgets & weather panel fixes                         | **Implemented** (2026-07-17)                               |
| [002](002-seo-technical-foundation.md)    | Technical SEO foundation + GSC anomalies                     | **Implemented** — owner follow-ups in GSC/Vercel pending   |
| [003](003-adsense-content-remediation.md) | AdSense "low value content" remediation                      | Structural work done; content + re-request pending (owner) |
| [004](004-knowledge-panel-entity.md)      | "Xabier Lameiro" Google entity / Knowledge Panel             | On-site part done; off-site program open (owner)           |
| [005](005-nextjs16-upgrade-decision.md)   | Next.js 16 upgrade go/no-go                                  | **Decided: NO-GO for now**                                 |
| [006](006-trending-content-radar.md)      | Trending content radar (weekly briefs for the content phase) | **Implemented** — weekly issue via GitHub Action           |
| [008](008-dev-audit-vulnerabilities.md)   | npm audit vulnerabilities (all dev-only)                     | **Resolved** — install audit silenced, prod audit clean    |
| [009](009-technical-seo-audit.md)         | Tag navigation regression + canonical / duplicate-URL audit  | **Corrected** (2026-07-18) — faceted URLs, listing page reverted |
| [010](010-content-audit-opportunity.md)   | Content audit + GSC opportunity map (enrich-first)           | **Investigation** — prioritized action list                 |
| [011](011-content-engine-editorial.md)    | Content engine: recurring GitHub issues + anti-AI editorial  | **Investigation / design** — extends SDD-006                |
| [012](012-blog-render-timeout.md)         | Blog navigation timeouts (FUNCTION_INVOCATION_TIMEOUT)       | **Fixed** (2026-07-18) — O(N²) loader cached, 32s→1.6s      |
| [013](013-llm-visibility-geo.md)          | LLM engine visibility (GEO): llms.txt, IndexNow, freshness   | **Implemented** — owner: register in Bing Webmaster Tools   |

All code lives on branch `fix/sdd-001-header-widgets` (specs + implementation).

> Note: [001-quality-refactor.md](001-quality-refactor.md) is the earlier quality-refactor
> spec shipped separately in PR #122 — it predates this numbering and is kept as-is.

## Key metrics baseline (90 days, 2026-04-18 → 2026-07-17)

-   Clicks: **36** · Impressions: **9,385** · CTR: **0.38%** · Avg. position: **11.4**
-   Brand query "lameiro": 6 impressions at position ~46 in 6.5 months; "xabier lameiro": none recorded.
-   ~40% of impressions concentrated in a single post (`/blog/error/npm-token-solution-error`).
-   Auto-generated subdomain pages (`coverage.`, `performance.`, `e2e.`) are indexed and appearing in search results.
