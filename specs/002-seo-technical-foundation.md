# SDD-002: Technical SEO foundation + Search Console anomalies

- **Status**: Decisions D1–D5 proposed, awaiting owner sign-off
- **Data**: GSC API (`sc-domain:xabierlameiro.com`), pulled 2026-07-17

## Search Console findings (last 90 days)

- **36 clicks / 9,385 impressions / CTR 0.38% / avg position 11.4.**
- One page absorbs ~40% of impressions: `/blog/error/npm-token-solution-error`
  (3,757 impressions, 18 clicks, position 6.1).
- Top queries are pasted terminal errors ("failed to replace env in config",
  "address already in use", "betaanalyticsdataclient …"): lookup intent, near-zero CTR,
  no relation to the personal brand.
- **Brand invisibility**: "lameiro" got 6 impressions at position ~46 in 6.5 months;
  "xabier lameiro" has zero recorded impressions (see SDD-004).
- **Anomaly 2026-07-10..12**: daily impressions spiked to 485 while average position
  collapsed to ~24 — a long tail of low-quality URLs (mostly subdomain junk) entering results.
- **Junk indexation**: `coverage.xabierlameiro.com` (Jest coverage HTML),
  `performance.xabierlameiro.com` (Lighthouse reports) and `e2e.` URLs appear in search
  results and among top pages. `coverage.` has **no robots.txt** (404). These
  auto-generated pages sit on the same domain property and dilute quality signals
  (primary AdSense "low value" suspect — see SDD-003).
- **Sitemap**: static `public/sitemap.xml`, 42 URLs (home ×3 locales + 13 posts ×3 locales),
  no `<lastmod>`, legal pages missing. Last submitted 2026-07-08, 0 errors.
- **URL inspection (home)**: indexed, canonical correct, crawled 2026-07-16, but
  no rich results detected.

## Code-level issues

1. **Duplicate JSON-LD**: `Person` + `WebSite` are emitted in BOTH `src/pages/_document.tsx`
   and `src/pages/index.tsx` with diverging data (`http://` vs `https://schema.org`,
   relative vs absolute image URL, address present in only one, no stable `@id`).
   Google may pick either variant → weak, inconsistent entity signal.
2. **No blog hub**: `next.config.js` redirects `/blog` → `/`. Posts are only reachable
   via sitemap/nav deep links; there are no category hub pages; internal linking is ~zero.
3. **Post metadata**: `og:type` stays `website` globally (`_document`); posts should emit
   `og:type=article` + `article:published_time`. Article JSON-LD always sets
   `dateModified = datePublished`. No `BreadcrumbList`.
4. Non-standard `<meta name="image">` in the SEO component (harmless but noise).
5. **Home is a desktop simulator**: the real text content lives inside a `Dialog` (MDX).
   Crawlable prose is minimal and everything depends on client JS.

## Decisions

- **D1 (recommended)** — De-index all technical subdomains (`coverage`, `performance`,
  `e2e`, `docs`, `storybook`): `X-Robots-Tag: noindex` header per Vercel project
  (`vercel.json`) + per-subdomain `robots.txt`, then GSC removal requests.
  Header links for humans keep working — noindex breaks nothing.
  *Variant to combine*: basic-auth-gate `coverage`/`e2e` (they leak repo internals).
- **D2** — Generate the sitemap at build time from the filesystem/frontmatter: all locales,
  legal pages, blog hub + category pages, `<lastmod>`. Resubmit in GSC.
- **D3** — Create `/blog` index and `/blog/[category]` hubs (drop the `/blog` → `/` redirect),
  each with descriptive intro copy; add prev/next and related-posts links on every post.
- **D4** — Single JSON-LD source of truth: delete the copies in `index.tsx`; keep one enriched
  `Person` (`@id: <domain>/#person`) + `WebSite` (`@id: <domain>/#website`) in `_document`
  with absolute URLs; `Article` JSON-LD references the author by `@id`, adds
  `mainEntityOfPage` and a real `dateModified`; add `BreadcrumbList` on posts.
- **D5** — Article OG tags on posts: `og:type=article`, `article:published_time`,
  `article:section` (category).

## Acceptance criteria

- `site:xabierlameiro.com` returns only main-domain content pages within ~4 weeks of D1.
- Sitemap covers 100% of indexable pages with `lastmod`; 0 errors/warnings in GSC.
- Rich Results Test: Article + Breadcrumb valid on posts; exactly one Person/WebSite node on home.
- Follow-up GSC review (`compare_search_periods`) 4 weeks after deploy: junk-URL impressions → 0,
  main-domain CTR trending up.
