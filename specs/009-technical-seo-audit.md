# SDD-009: Tag navigation regression + canonical / duplicate-URL audit

-   **Status**: **Implemented** (2026-07-17) on branch `fix/sdd-009-tag-navigation` — D1 applied and
    verified end-to-end (see "Implementation" at the end). Investigation evidence retained below.
-   **Data**: code audit of this repo + GSC API (`sc-domain:xabierlameiro.com`, live URL
    inspection, pulled 2026-07-17).
-   **Related**: [002](002-seo-technical-foundation.md) (canonical/blog-hub work that introduced
    the redirect), [003](003-adsense-content-remediation.md) (duplicate/low-value content is the
    primary AdSense suspect).

## Reported symptoms (owner)

1. On a blog post, clicking a **tag** in the side nav does **not** navigate to that tag and does
   **not** mark the tag as selected. It "worked at some point" and regressed.
2. Suspicion that the same posts are reachable under **multiple URIs** and that canonical links
   may be handled wrong.

Both symptoms share a single root cause. The tag list is rendered in
[`src/pages/blog/[category]/[slug].tsx:99`](../src/pages/blog/[category]/[slug].tsx).

## Architecture (as built)

-   Routing is Pages Router. A post lives at `/blog/<category>/<slug>`; the `[category]` segment
    is **reused** for both real categories and tags — there is no separate tag route.
-   Tag links are built in
    [`src/helpers/fileReader.ts:272`](../src/helpers/fileReader.ts) as
    `href: /blog/<tag>/<postsBytag[0].slug>` — i.e. a **post URL** under the tag name, not a tag
    listing page.
-   `NavList` decides "selected" in
    [`src/components/Blog/NavList/index.tsx:47-49`](../src/components/Blog/NavList/index.tsx):
    `isCategory ? category === item.category : category === item.tag`.

## Root cause

### 1. The 301 defeats tag navigation (contradiction between code and its own comment)

In `getStaticProps` of `[slug].tsx`:

```ts
// lines 164-175 — runs FIRST and returns
const canonicalCategory = post.meta.category.toLowerCase();
if (category !== canonicalCategory) {
    return { redirect: { destination: `.../blog/${canonicalCategory}/${slug}`, permanent: true }, ... };
}
// lines 177-179 — comment claims the opposite of what the code above does
// "Tag-based URLs render normally so tag navigation stays selectable ..."
```

A tag link points at `/blog/<tag>/<slug>` where `<tag> !== post.category`, so the request is
**301-redirected straight back** to the canonical `/blog/<category>/<slug>`. Clicking a tag
therefore bounces the user to the post's category URL → "no navega al tag". The comment at
lines 177-179 describes the intended behaviour ("render normally, rely on rel=canonical"), but
the redirect above it was added later and overrides it. **Verified via git (2026-07-17):** the 301
was introduced by `137bc25 fix: consolidate duplicate blog URLs and harden SEO after GSC audit`;
a later commit `bebb941 fix: restore header widgets and blog tag navigation` added the contradicting
comment as a *failed* attempt to restore tag nav (the redirect still fires above it). So this bug
had already been noticed once and "fixed" without effect. This is the regression.

### 2. The tag is never "selected"

The tag `NavList` (line 99) is passed `category={category}` — the **current route's category
param**, which after the redirect is always the post's real category (e.g. `error`), never a
tag. `isSelected` for tags compares `category === item.tag` (`error === "npm"`), which is never
true. So even without the redirect, the selection logic compares the wrong values.

### 3. Wrong link target (design smell)

Tag links resolve to a **post URL** (`/blog/<tag>/<slug>`) that collides with the canonical post
URL space, which is exactly what triggers the 301. A tag click should land on a **tag listing**
(e.g. `/blog/<tag>` — the hub in `[category]/index.tsx` already includes tag matches via
[`fileReader.ts:202`](../src/helpers/fileReader.ts), or a dedicated `/blog/tag/<tag>` route),
which is a distinct, self-canonical page — not another copy of a post.

## Canonical / duplicate-URL analysis

The `rel=canonical` itself is **correct for canonical URLs**. `SEO`
([`src/components/SEO/index.tsx:46-47,206`](../src/components/SEO/index.tsx)) builds the canonical
from `meta.category` (the post's own category), not from the current path, so a tag-variant page
would still emit the category canonical. Verified live in GSC:

| URL inspected (2026-07-17)                         | coverage_state                    | google_canonical                          |
| -------------------------------------------------- | --------------------------------- | ----------------------------------------- |
| `/blog/error/npm-token-solution-error` (canonical) | **Submitted and indexed** (PASS)  | self (user==google canonical, consistent) |
| `/blog/npm/npm-token-solution-error` (tag variant) | **Crawled – currently not indexed** | `null` (no canonical detected)            |

Findings from the live data:

-   The tag-variant URL **has been crawled by Google and rejected** ("Crawled – currently not
    indexed"), last crawled **2026-04-03** — i.e. before the July 301 was deployed, so Google has
    **not yet seen the consolidation**. `page_fetch_state` was `SUCCESSFUL` (200, not a redirect)
    at that crawl.
-   Its `referring_urls` are **other posts' tag navigation**
    (`/blog/react/publish-report-testing-react`, `/blog/react/how-document-my-react-components-with-jsdoc`).
    Internal linking is actively pointing crawlers at duplicate URLs.
-   Net: the site is in the **worst of both states** — the on-site tag UX is broken by the 301,
    **and** Google still holds duplicate low-value tag URLs it crawled and refused to index. Both
    feed the SDD-003 "low value content" signal.

So the canonical *tag* is fine; the problem is (a) the duplicate URL surface generated by reusing
`[category]` for tags, and (b) internal links that advertise those duplicates.

## Decisions

-   **D1 (chosen & implemented) — Make tags first-class listing pages; keep the post-level 301 as a
    safety net.** Point tag links at a dedicated listing route `/blog/tag/<tag>` instead of
    `/blog/<tag>/<slug>`. Result: tag navigation works, tag pages are self-canonical listings, post
    URLs have exactly one canonical, and internal links no longer advertise duplicates.
    **Refinement over the original wording:** the 301 in `[slug].tsx` is *kept*, not removed — with
    tag nav no longer pointing at `/blog/<tag>/<slug>`, its only remaining job is consolidating
    legacy/external tag-style URLs Google still holds, which is correct SEO. Removing it would let
    those resolve as 200 duplicates again. Highest UX + SEO value. **Real scope (review note,
    2026-07-17)** — two hidden costs the naive reading misses:
    -   Reusing the `/blog/<tag>` hub is **not free**: `[category]/index.tsx:75` sets
        `categoryName: posts[0].category`, so `/blog/npm` (which already resolves today via the
        tag match in `fileReader.ts:202`) would render `<h1>Error</h1>` — the first post's
        category — instead of the tag. Either fix the hub's heading/SEO for the tag case or add a
        dedicated `src/pages/blog/tag/[tag].tsx` (static segments take precedence over
        `[category]/[slug]`, so the route is safe).
    -   "Selected tag" state **cannot survive D1 as-is**: `NavList` only renders on post pages, and
        a tag click now navigates away to a listing. Either the tag listing renders the side nav
        (bigger change) or the acceptance criterion is reworded to plain navigation.
-   **D2 — Keep the redirect, remove tag links from post pages.** Cheapest; kills the broken UX by
    deleting the tag nav. Loses the tag feature and internal-linking value. Not recommended.
-   **D3 — Restore the pre-regression behaviour** (tag URLs render 200, rely on rel=canonical, fix
    the selection bug). Restores the UX but keeps the duplicate-URL surface that Google already
    rejected. Not recommended given the AdSense low-value context.

## Acceptance criteria (for the fix)

-   Clicking a tag on a post navigates to that tag's listing page, whose heading and SEO metadata
    name the **tag** (not the first post's category). If the listing renders the side nav, the
    clicked tag shows as selected; otherwise "selected" state is explicitly out of scope
    (unit test in `NavList/__test__` + an e2e in `e2e/`).
-   No post is reachable at more than one indexable URL; `/blog/<tag>/<slug>` no longer resolves as
    a 200 duplicate.
-   Internal links (tag nav) point only at canonical or self-canonical listing URLs — no links to
    duplicate post URLs.
-   `sitemap` and `getStaticPaths` emit only canonical URLs (already true — keep it).
-   Owner follow-up: after deploy, request re-indexing of the affected canonical posts and confirm
    the tag-variant URLs drop out of GSC over the next crawl cycle.

## Implementation (2026-07-17, branch `fix/sdd-009-tag-navigation`)

Chose a **dedicated `src/pages/blog/tag/[tag].tsx` route** (not the `/blog/<tag>` hub) so the
`<h1>Error</h1>` heading hazard is avoided by construction. Changes:

-   `src/helpers/fileReader.ts` — tag `href` now `/blog/tag/<tag>`; added exported
    `getPostsByLocaleAndTag` (case-insensitive); removed the now-unused `getPostsByTag`.
-   `src/pages/blog/tag/[tag].tsx` (new) — self-canonical tag listing mirroring the category hub;
    `<h1>` and SEO name the tag (original casing preserved from frontmatter).
-   `src/components/Blog/NavList/index.tsx` — selection by membership (handles a post's tag array,
    case-insensitive), replacing the broken `category === item.tag` compare.
-   `src/pages/blog/[category]/[slug].tsx` — pass the post's tags to the tag `NavList`; 301 **kept**
    with an updated comment explaining it is now a legacy-URL safety net.
-   `src/intl/translations.ts` — `blog.tag.*` keys for en/es/gl.
-   Tests: `NavList` tag-selection test + `fileReader.test.ts` (tag hrefs, case-insensitive lookup).

**Verification (real HTTP, `next start`):** post page tag links → `/blog/tag/<tag>`; the post's own
tag renders `selected`; `/blog/tag/npm` → 200 with `<h1>npm</h1>` and self-canonical; legacy
`/blog/npm/<slug>` → 308 → canonical; canonical post → 200. `next build` generates all
`/blog/tag/[tag]` pages with no route conflict. Full suite: 50 suites / 104 tests green; tsc +
eslint clean. **Owner follow-up unchanged:** after deploy, request re-indexing and confirm the old
tag-variant URLs drop out of GSC.

## Out of scope (tracked elsewhere)

-   Content enrichment / new content engine → future specs 010 (content audit) and 011 (content
    engine + anti-AI editorial guide).
-   Subdomain junk de-indexation → SDD-002 owner follow-ups.
