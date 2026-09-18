## Context

- No middleware exists today. No KV, Redis, Blob or Edge Config dependency either; the only
  external data store the site already talks to is GA4 (`@google-analytics/data`, for the views
  counter).
- Vercel Hobby runtime logs last 1 hour (vercel.com/docs/limits, 2026-09-18). Whether Log Drains
  are available on Hobby is not stated in the docs read; treat them as unavailable.
- Middleware can read `request.headers.get('user-agent')` and defer work with
  `event.waitUntil(promise)` (nextjs.org/docs, proxy / middleware reference).
- Vercel Web Analytics identifies visitors by a daily-rotating request hash and sets no cookies
  (vercel.com/docs/analytics). The Hobby event quota and retention were **not found** in the
  docs read on 2026-09-18 and must be checked in the dashboard before enabling.
- GA4 Measurement Protocol: `POST https://www.google-analytics.com/mp/collect` with
  `measurement_id`, `api_secret` and `client_id`; the secret must stay server-side. Google warns
  that MP-only streams may get partial reporting.

## Goals / Non-Goals

**Goals:**

- A durable count of AI crawler requests per bot and per path, from day one of deploy.
- A human visit count and referrer list that does not depend on the cookie banner.
- One command that prints both for a date range.

**Non-Goals:**

- Blocking, rate-limiting or cloaking for any crawler. `robots.txt` stays as SDD-013 left it.
- Changing Consent Mode defaults or the banner. Measuring more humans by weakening consent is
  not on the table.
- Detecting crawlers that lie about their user agent.

## Decisions

**D1 · Crawler records go to a separate GA4 stream via Measurement Protocol.** Each crawler hit
becomes one event `ai_crawler_hit` with `bot`, `operator`, `purpose`, `path`. `client_id` is a
fixed value per bot name, so each bot is one "user" and no human identifier is involved. There is
no `status`: middleware runs before the page renders and never sees the response status.

Alternatives considered:
- *Vercel Log Drain* — needs a paid plan or an external sink; not confirmed on Hobby.
- *Console logs* — 1-hour retention; useless for a 28-day reading.
- *Upstash / KV counter* — adds a new vendor and account for one counter.
- *Same GA4 property as humans* — pollutes human reports and the views counter.

**D2 · Bot list is a typed table in one module.** `src/constants/aiCrawlers.ts` (camelCase, like
the rest of `src/constants`) maps a UA token to `{ token, operator, purpose }`: GPTBot,
OAI-SearchBot, ChatGPT-User, OAI-AdsBot, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot,
Perplexity-User, meta-externalagent, meta-externalfetcher, CCBot. Tokens and purposes come from
each operator's own page, read 2026-09-18 (URLs in the module's doc comment). Left out on
purpose: Google-Extended and Applebot-Extended (robots.txt tokens only, never sent as a UA),
anthropic-ai (gone from Anthropic's list) and Bytespider (no official documentation).

**D3 · Middleware matches pages, not assets.** `config.matcher` excludes `_next/static`,
`_next/image`, images, fonts and `favicon`. It includes `/llms.txt`, `/llms-full.txt`,
`/robots.txt`, `/sitemap.xml` and the feeds — those are what crawlers read most, and they are
exactly the files the planned post is about.

**D4 · Humans are counted by Vercel Web Analytics.** `<Analytics />` from `@vercel/analytics/react`
in `_app.tsx`, production only, excluded for Lighthouse like gtag is. It covers AI referrals
through its referrer panel (`chatgpt.com`, `perplexity.ai`, `claude.ai`).

**D5 · The report is a script, not a dashboard.** `scripts/traffic-report.ts --from --to` reads
the crawler stream through the GA4 Data API (credentials already used by the views counter) and
prints a table. Vercel Web Analytics has no public read API confirmed in the docs read; its
numbers are copied from the dashboard into the report by hand until one is found.

## Risks / Trade-offs

- **Middleware runs on every page request**, adding latency and invocations. Mitigation: the
  matcher skips assets, the non-bot path returns `NextResponse.next()` after one string check, and
  the MP call runs in `waitUntil`. Task 1.2 checks the Hobby invocation quota before merge.
- **Static pages served from the CDN may skip middleware.** If so, crawler hits on cached pages
  are undercounted. Task 3.3 verifies with a real `curl -A GPTBot` against a preview deploy.
- **Web Analytics quota on Hobby is unknown.** If the site exceeds it, collection stops for the
  month; it does not bill. Checked in task 1.1.
- **Loading analytics before consent is a legal call.** Vercel Web Analytics stores nothing on
  the device, which is the usual argument for not needing consent under ePrivacy, but the site's
  banner is currently a prior-consent gate for all analytics. The owner confirms in task 1.1
  that cookieless counting outside the banner is acceptable; if not, `<Analytics />` goes behind
  the same consent state as gtag and the human number stays partial.
- **UA spoofing** inflates or deflates counts. Acceptable: the post reports declared crawlers and
  says so.
