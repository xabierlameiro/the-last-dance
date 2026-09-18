## Why

A post is reachable at `/blog/<category>/<slug>` and also at `/blog/<tag>/<slug>` for every tag
it carries (`src/pages/blog/[category]/[slug].tsx`, `fallback: 'blocking'`). The canonical tag
points at the category URL, but the tag sidebar and `PostList` link through the facet path, so
the duplicates are heavily linked internally.

- GSC still shows facet URLs collecting impressions (28 days ending 2026-09-18):
  `/blog/cli/solve-address-in-use-error` (6), `/blog/testing/publicar-informe-probas-react` (1).
  Google overrode the declared canonical at least once
  (`/blog/testing/publish-report-testing-react`, reading of 2026-08-08).
- Every fix applied to the path shape has failed, and each failure is recorded: a 301 broke tag
  navigation (SDD-009, PR #186), rewriting internal links broke the menu (#186, reverted in
  #189), `noindex` is discouraged for canonical selection within a site and must not be combined
  with `rel=canonical`, and `robots.txt` cannot tell `/blog/<tag>/<slug>` from
  `/blog/<category>/<slug>`.
- Google's faceted-navigation guidance assumes facets are query parameters because a parameter
  can be excluded and a path segment cannot.

**Expected impact is small.** 13 "Alternate page with proper canonical tag" URLs are normal and
the impressions above are single digits. This change is worth doing because it removes a known
signal conflict permanently and because it feeds calendar post #3 of
`investigation-content-strategy`, not because it will move traffic on its own. It ranks last in
priority among the growth changes.

## What Changes

- Posts are linked only at `/blog/<primary-category>/<slug>`. The tag being browsed travels as
  `?tag=<tag>`.
- The tag sidebar and `PostList` read `?tag=` to keep the same highlight and filtering they show
  today. **The navigation must look and behave exactly as it does now**; any visible difference is
  a failed change, not a trade-off.
- `robots.txt` adds `Disallow: /*?tag=`.
- Only after the above is live and verified, legacy `/blog/<tag>/<slug>` paths 301 to the
  canonical URL with `?tag=<tag>` preserved.

## Capabilities

### New Capabilities

- `tag-navigation`: how tag browsing is represented in URLs and how it stays out of the index.

### Modified Capabilities

(none)

## Impact

- `src/pages/blog/[category]/[slug].tsx` (`getStaticPaths` stops minting tag paths), tag sidebar
  (`getAllTags` in `src/helpers/fileReader.ts` and its component), `PostList`, `next.config.ts`
  (redirects), `public/robots.txt`.
- Static pages that read `?tag=` must do it client-side (Pages Router static pages have no query
  at build time), or the highlight flickers. Covered in the design.
