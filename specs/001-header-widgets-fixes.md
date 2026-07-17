# SDD-001: Header widgets & weather panel fixes

- **Status**: Ready to implement — no open decisions
- **Evidence**: 2026-07-17 — code audit + live-site DOM inspection + prod API probes

## Problems and root causes

### 1. Tooltips never show on header widgets

`src/components/Tooltip/index.tsx` passes `enabled: controlledOpen === null` to both
`useHover` and `useFocus`. In uncontrolled usage (every header widget: `DateAndHour`,
`CryptoPrice`, `DeploymentStatus`, `Heating`, …) `controlledOpen` is `undefined`, and
`undefined === null` is `false` → hover/focus interactions are permanently disabled,
so the tooltip never opens.

**Fix**: use loose equality `controlledOpen == null` (matches the Floating UI reference
implementation). One-line change in two places + a regression test that hovers a trigger
and asserts `Tooltip.Content` becomes visible.

### 2. Weather panel lost its condition icons

`/api/weather` was migrated from SerpApi scraping to Open-Meteo, and the handler now
hardcodes `imageUrl: undefined` (`src/pages/api/weather.ts:64` and `:118`). The UI only
renders an icon when `imageUrl` is truthy, so icons silently disappeared.

**Decision (resolved)**: map the WMO `weather_code` already returned by Open-Meteo to a
local static icon set under `public/weather/` (0/1 → sun, 2/3 → cloud, 45/48 → fog,
51–65 → rain, 71–75 → snow, 80–82 → showers, 95+ → storm). Local assets need no
`images.remotePatterns` change and no external dependency.

### 3. Three red ✕ inside the weather panel (the reported bug)

Verified live on 2026-07-17: the ✕ are **not** broken images — the panel contains zero
`<img>` elements. They are the error glyph of `RenderManager`, rendered by the `News`
component once per city. `/api/news` scrapes `google.com/search?tbm=nws` with hardcoded
CSS class selectors (`.SoaBEf`, `.GI74Re`, …); in production it returns
`{"city":"limerick","news":[]}` — the scraper is dead (bot detection + volatile markup).

**Options**:

| Option | Notes |
| ------ | ----- |
| a) Google News RSS (`https://news.google.com/rss/search?q=<city>`) | Free, keyless, stable XML. **Recommended** |
| b) Remove the news section | Simplest; loses a feature |
| c) Paid news API | Overkill for a personal site |

Additionally the client must treat `news: []` as an *empty state*, not an error.

### 4. Header "indexed pages" widget shows a red ✕

`/api/indexed-pages` returns **HTTP 503** in production. The handler tries SerpApi
(missing/expired key) and then falls back to scraping Google Search, which is blocked.

**Options**:

| Option | Notes |
| ------ | ----- |
| a) Search Console API with the existing service account | Real data, already authenticated for GSC tooling. **Recommended** |
| b) Count URLs in `sitemap.xml` | Cheap approximation, no auth |
| c) Remove the widget | If the metric no longer matters |

### 5. Cleanup after 2–4 land

- Remove `serpapi.com` from the CSP `connect-src` in `next.config.js` (legacy of the old scrapers).
- Delete dead SerpApi/scraping code paths and unused selectors.

## Acceptance criteria

- Hovering every header widget shows its tooltip (jsdom regression test + one Playwright check).
- Weather panel renders icon + data for the 3 cities; with the news request failing or empty,
  an empty state is shown — no red error glyphs.
- `/api/news` returns items in production; `/api/indexed-pages` returns 200 with a number.
- No remaining SerpApi references in API routes or CSP.
