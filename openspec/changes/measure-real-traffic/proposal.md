## Why

Today the site cannot answer "how many people visit" or "how much do AI crawlers take". Both
numbers matter for the growth work and neither is measured.

- **GA4 misses most humans.** Consent Mode v2 starts every signal `denied`
  (`src/pages/_app.tsx:63-71`). Visitors who ignore or reject the banner send only cookieless
  pings, and GA4 models those only above a traffic threshold this site does not reach. So GA4
  reports a subset of the ~20 search clicks a month plus whatever other traffic consents.
- **AI crawlers are invited and invisible.** `public/robots.txt` explicitly allows GPTBot,
  OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot and six
  more (SDD-013), and the site publishes `llms.txt` / `llms-full.txt`. Crawlers do not run
  JavaScript, so GA4 never sees them; GSC only covers Google Search. Vercel Hobby keeps runtime
  logs for **1 hour** (vercel.com/docs/limits, read 2026-09-18), so there is no history either.
- **AI referrals are unattributed.** A reader who clicks a citation in ChatGPT, Perplexity or
  Claude lands with a referrer GA4 records only if that reader consents.
- The investigation post planned on this topic (`investigation-content-strategy`, calendar #4)
  cannot be written without these numbers.

## What Changes

- Log every request from a known AI crawler in `middleware.ts`: crawler name, purpose (training /
  search / user-triggered fetch / ads / dataset), path. Send it off the response path with
  `event.waitUntil` to a dedicated GA4 data stream through the Measurement Protocol, so the data
  persists beyond the 1-hour log window and never mixes with human analytics.
- Add Vercel Web Analytics (cookieless) to count human visits and referrers independently of the
  consent banner. Keep GA4 and its consent defaults unchanged.
- Add a small report script that reads both sources for a date range and prints: human visits,
  AI-referral visits by source, crawler requests by bot and top paths.

## Capabilities

### New Capabilities

- `ai-crawler-telemetry`: detection, classification and durable recording of AI crawler requests.
- `consentless-visit-analytics`: human visit and referrer counts that do not depend on consent.

### Modified Capabilities

(none)

## Impact

- New `src/middleware.ts` (Next.js 15.5 Pages Router; the file is renamed `proxy.ts` in Next 16,
  which this repo has not adopted — SDD-005).
- New dependency `@vercel/analytics` (passes the dependency checklist: no native equivalent,
  first-party, small client script). Owner must enable Web Analytics in the Vercel dashboard.
- New env vars `GA_CRAWLER_MEASUREMENT_ID` and `GA_CRAWLER_API_SECRET` (server-only). Owner
  creates the stream and the secret in GA4.
- Cookie banner and privacy page: Vercel Web Analytics sets no cookies; the privacy page must
  still name it as a processor.
- Every page request passes through middleware. The cost on Hobby must be checked before merge
  (task 1.2).
