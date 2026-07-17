# SDD-003: AdSense "low value content" remediation

- **Status**: Structural work implemented 2026-07-17 (Phase 0 code + /about + /contact +
  post bylines). Remaining: owner decision D1, content expansion (Phase 1–2, editorial)
  and the re-request (Phase 3)
- **Trigger**: AdSense rejection received 2026-07 — policy "minimum content requirements /
  low value content", with "verify site ownership" also pending.

## Why the site trips "low value content" (ranked by likely impact)

1. **Auto-generated pages on the domain**: `coverage.`, `e2e.`, `performance.`, `docs.` and
   `storybook.` subdomains are crawlable and partially indexed (verified in GSC; `coverage.`
   has no robots.txt). AdSense evaluates the site as a whole — machine-generated report
   pages are textbook thin content. → Fixed by SDD-002 D1.
2. **Little indexable prose**: the home page is an interactive desktop simulator whose text
   sits inside a dialog; the blog has 13 posts averaging ~400–800 words where a large share
   is code blocks; several are short error-fix notes.
3. **Weak navigation/discoverability**: no `/blog` index (redirects to home), no category
   hubs, no `/about` or `/contact` as standalone crawlable pages (legal pages do exist).
   An AdSense reviewer landing on the macOS-style UI finds little "site" to review.
4. **Locale tripling**: en/es/gl content is hand-authored (fine), but with so few base posts
   the property looks like 39 thin URLs instead of 13 solid articles.

## D1 — Reality check (owner must decide)

90-day traffic is **36 clicks**. Even if approved, AdSense revenue would round to €0/month.

**Recommendation**: treat AdSense approval as a *byproduct* of the SEO/content work
(SDD-002 + phases below), not as a goal that drives engineering. The same work serves
SEO, the Knowledge Panel program (SDD-004) and monetization optionality.

## Plan (if D1 = pursue)

- **Phase 0 — hygiene** (shared with SDD-002 D1/D2/D3): de-index subdomains, blog hub +
  category pages, rebuilt sitemap. Wait for re-indexation (2–4 weeks) before re-requesting
  review — premature re-requests waste review cycles.
- **Phase 1 — content depth**:
  - Expand the 5 thinnest posts into substantive tutorials
    (problem → cause → solution → context; 800+ words of prose besides code).
  - Add `/about` (professional bio, headshot, links — doubles as the entity page for
    SDD-004) and `/contact`.
  - Author byline + short bio block on every post (E-E-A-T signal).
- **Phase 2 — cadence**: ≥2 substantive posts/month during the review window. Ad slots
  remain hidden until approval (already implemented: ads hidden while not serving).
- **Phase 3 — re-request review** in the AdSense console, once — after verifying Phases 0–1
  are indexed (spot-check with `site:` + GSC URL inspection).

## Acceptance criteria

- GSC: subdomain URLs no longer indexed; ≥20 main-domain content URLs indexed.
- Every indexed URL has >300 words of unique prose, or is a legal/utility page.
- AdSense review re-requested exactly once, after verification — and passes.
