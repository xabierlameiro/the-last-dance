> Each task closes with the command and its output pasted under it.

## 1. Preconditions (read before writing code)

- [ ] 1.1 Owner: in the Vercel dashboard, read the Hobby quota and retention for Web Analytics
      events and paste them here. If the quota is below ~3× the current monthly page views, stop
      and decide before enabling. Also confirm that cookieless counting outside the consent banner
      is acceptable (design, risks); if not, gate `<Analytics />` on consent instead.
- [ ] 1.2 Owner: read the Hobby quota for edge requests / middleware invocations in the Vercel
      usage page and paste it with last month's request count.
- [x] 1.3 Re-read the official crawler pages (OpenAI, Anthropic, Perplexity, Meta, Common Crawl)
      and fix the UA tokens and purposes in the crawler table.
      Done 2026-09-18; the URLs are in the doc comment of `src/constants/aiCrawlers.ts`. Changes
      against the first draft: `anthropic-ai` dropped (no longer in Anthropic's list), `OAI-AdsBot`
      and `meta-externalfetcher` added, `Bytespider` left out (no official documentation).
- [ ] 1.4 Owner: create a GA4 property (or data stream) for crawlers, create a Measurement
      Protocol API secret, and set `GA_CRAWLER_MEASUREMENT_ID` / `GA_CRAWLER_API_SECRET` in Vercel
      (production and preview). Register `bot`, `operator`, `purpose`, `path` as event-scoped
      custom dimensions. For the report, set `GA_CRAWLER_PROPERTY_ID` locally and give the
      existing `ANALYTICS_CLIENT_EMAIL` service account Viewer access to that property.

## 2. Crawler telemetry

- [x] 2.1 `src/constants/aiCrawlers.ts`: typed table (design D2), with Google-Extended and
      Applebot-Extended documented as robots-only tokens.
- [x] 2.2 Pure `findAiCrawler(userAgent)` in `src/helpers/aiCrawler.ts` returning the table entry
      or `undefined`. Jest tests in `src/helpers/__test__/aiCrawler.test.ts`: the real UA string of
      every bot, case-insensitive matching, a desktop browser, Googlebot, an empty/null UA, token
      independence, robots-only tokens never matching.
- [x] 2.3 `src/middleware.ts` with the matcher from design D3; non-bot path returns
      `NextResponse.next()` after one header read; bot path sends the MP event inside
      `event.waitUntil` with `AbortSignal.timeout(2000)`.
- [x] 2.4 Env validation with Zod (`readCrawlerAnalyticsConfig`): missing or malformed crawler env
      vars disable sending and warn once per isolate; nothing throws.
- [x] 2.5 Jest test for the middleware (`src/__test__/middleware.test.ts`): browser passes through,
      crawler hit recorded, GA4 unreachable leaves the response unchanged, missing config warns
      once, matcher excludes API/_next/assets and keeps `robots.txt`, `sitemap.xml`, `llms.txt`.
      `npx jest src/__test__/middleware.test.ts` → 5 passed.

## 3. Consentless human analytics

- [x] 3.1 `npm install @vercel/analytics --legacy-peer-deps` (same flag as `vercel.json`
      `installCommand`; the optional `@remix-run/react` peer wants React 18). `^2.0.1` added.
      `npm audit --omit=dev --audit-level=high` → found 0 vulnerabilities.
      Side effect in `package-lock.json`: npm re-flagged 27 sharp/@img platform packages from
      `dev` to `optional`.
- [x] 3.2 `src/components/VercelAnalytics` renders `<Analytics />` from `@vercel/analytics/next`,
      production only (`isProduction && <VercelAnalytics />` in `_app.tsx`), skipped for
      `Chrome-Lighthouse` via `useSyncExternalStore` so hydration does not mismatch. Consent block
      in `_app.tsx` unchanged (`git diff src/pages/_app.tsx`: one import, one line).
- [ ] 3.3 Owner: enable Web Analytics for the project in Vercel.
- [x] 3.4 Update the privacy policy and cookies policy. The legal pages exist only in English
      (`data/legal/*.mdx`), so no `es`/`gl` versions to update. Privacy policy: Vercel Inc. added as
      recipient with the data points from Vercel's docs. Cookies policy: new section
      "Cookieless visit counting".

## 4. Report

- [x] 4.1 `scripts/traffic-report/index.ts --from YYYY-MM-DD --to YYYY-MM-DD [--human N]
      [--ai-referrals source=count,...]` reading the crawler property through the GA4 Data API
      (`runReport` grouped by `customEvent:bot` and `customEvent:path`). Pure parsing and
      formatting live in `scripts/traffic-report/lib.ts`, tested in `__test__/lib.test.ts`.
- [x] 4.2 `npm run traffic-report` script entry.

## 5. Verify

- [ ] 5.1 Preview deploy: `curl -A "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)"`
      against a static post, `/llms.txt` and `/robots.txt`; confirm the three events in GA4
      realtime. If the static post does not produce an event, record that middleware is skipped
      for cached pages and adjust the report's caveat.
- [ ] 5.2 Preview deploy: load two pages in a browser with the banner rejected; confirm two page
      views in Vercel Web Analytics and no new cookies in DevTools.
- [ ] 5.3 Lighthouse run on the preview: performance score not lower than production's current
      score by more than 2 points. Paste both.
- [x] 5.4 Local checks, 2026-09-18:
      `npm run typecheck` → exit 0.
      `npm run lint` → exit 0 (after splitting a nested ternary in `requestedPath`).
      `npx jest --silent --coverage` → 74 suites, 381 tests passed.
      `NEXT_PUBLIC_DOMAIN=https://xabierlameiro.com NEXT_PUBLIC_ENV=development npm run build` →
      exit 0, 71/71 static pages, `ƒ Middleware 48.8 kB`. `public/sitemap.xml` only carries the
      lastmod changes from `memory-leak-cluster-refresh` (no `undefined` host).
      `next start` without the crawler env vars: browser UA on `/robots.txt` → 200, no log line;
      GPTBot UA on `/robots.txt`, `/es`, `/llms.txt` → 200 ×3 and exactly one
      `[ai-crawler] ... not set: hits are not recorded` line.

## 6. First reading

- [ ] 6.1 Day 28 after production deploy: run the report and paste it here. This is the input for
      calendar post #4 in `investigation-content-strategy`.
