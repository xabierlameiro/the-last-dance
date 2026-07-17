# SDD-006: Trending content radar (feeds the AdSense content phase)

-   **Status**: Implemented 2026-07-17 (radar + weekly GitHub issue). Owner runs the editorial loop.
-   **Feeds**: SDD-003 Phase 1–2 (content depth + cadence) and SDD-004 C (brand demand).

## Goal

Every week, surface the topics that are trending **within the owner's profile**
(React/Next.js/TypeScript, testing, automation, AI/Claude/MCP, IoT) and turn each into a
ready-to-write brief that combines: the trend evidence, the owner's professional angle
(banking/retail experience, recent repos) and a paste-ready Claude drafting prompt.

## The guardrail that shapes the whole design

AdSense rejected the site for **low value content**. Google's spam policy explicitly
targets _scaled content abuse_ (mass-produced/AI-generated pages with little added value).
Therefore:

-   The radar **never publishes anything**. Output is a briefing, not a post.
-   Every post is written/edited by the owner (with Claude as drafting assistant), must add
    first-hand experience ("what I did / measured / broke"), and respects the SDD-003
    cadence (~2 substantive posts/month) — not one post per trend.
-   Value bar per post: 800+ words of original prose, at least one real artifact
    (code from his repos, measurement, failure story), all three locales hand-reviewed.

## Design

### Sources (phase 1 — keyless, free)

| Source      | Endpoint                                                                      | Signal                      |
| ----------- | ----------------------------------------------------------------------------- | --------------------------- |
| Hacker News | `hn.algolia.com/api/v1/search?query=<kw>&tags=story` (last 7 days)            | points + comments           |
| dev.to      | `dev.to/api/articles?tag=<kw>&top=7`                                          | reactions + comments        |
| Reddit      | `reddit.com/r/<sub>/top.json?t=week` (reactjs, nextjs, webdev, ClaudeAI)      | score + comments            |
| GitHub      | `api.github.com/search/repositories` (recent, by topic, sorted by stars)      | stars velocity              |
| Own GSC     | Search Console API rising queries (28d vs previous 28d) — optional, env-gated | impressions delta           |
| Own repos   | `api.github.com/users/xabierlameiro/repos?sort=pushed`                        | the "recent projects" angle |

### Scoring

`score = source-normalized popularity × (1 + matched profile keywords) × recency decay (7-day half-life)`.
Items with zero keyword matches are dropped; AI/Claude/MCP keywords get a boost (current
professional focus and highest search growth).

### Delivery (D1 — resolved: GitHub issue)

Weekly GitHub Action (`.github/workflows/trending-radar.yml`, Mondays 07:00 UTC +
`workflow_dispatch`) runs `npm run trending` and opens an issue titled
`Trending radar <year>-W<week>` with the top topics. An issue (vs email/dashboard) keeps
the loop inside the repo, is free, and each topic can be converted into a task/PR.
GSC secrets (`ANALYTICS_CLIENT_EMAIL/PRIVATE_KEY`) are optional — the radar degrades
gracefully without them. **Owner follow-up**: add them as Actions secrets to enable the
rising-queries section.

### Brief format (per topic)

Evidence (links + numbers) · matched keywords · suggested personal angle (tied to
experience at CaixaBank/Openbank/Inditex or a recently-pushed repo) · a Claude drafting
prompt that demands first-hand experience and forbids generic filler.

## Editorial loop (owner)

1. Monday: read the issue, pick at most 1 topic (2/month total).
2. Draft with Claude Code using the prompt from the brief; inject real project code/data.
3. Review the three locales by hand; publish; internal-link from hub/category pages.
4. Close the issue noting which topic was used (feeds future dedupe).

## Acceptance criteria

-   `npm run trending` produces a markdown report locally (sources reachable) and never
    exits non-zero because one source failed.
-   Weekly issue appears with ≥5 scored topics and a Claude prompt per topic.
-   Unit tests cover scoring, keyword matching, normalization and report building.
-   No automated publishing path exists from radar to blog.
