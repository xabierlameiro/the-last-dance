# SDD-012: Blog navigation timeouts (FUNCTION_INVOCATION_TIMEOUT)

- **Status**: Fixed 2026-07-18 on `fix/blog-nav-timeout-oN2`. Root cause was an O(N²)/O(C·N²)
  filesystem scan in the post loader, amplified by on-demand rendering of tag-faceted URLs.
- **Symptom**: navigating the blog in production — especially tag-faceted category pages — was
  slow and sometimes returned `504 GATEWAY_TIMEOUT / FUNCTION_INVOCATION_TIMEOUT`.

## Root cause (measured, not guessed)

The pages are SSG, so a slow render made no sense — until profiling. Instrumenting
`getStaticProps` during a build showed **`getAllCategories` alone taking 3,900–11,200 ms**, and
each `/blog/[category]/[slug]` page taking **~32,000 ms** to prerender (`serialize` was a red
herring — measured at ~94 ms).

The loader in `src/helpers/fileReader.ts` was quadratic:

1. `findPostBySlug(slug)` read and gray-matter-parsed **every** file in the corpus to resolve one
   slug — O(N).
2. `getAllPosts()` called `getPostBySlug` per slug — **O(N²)**.
3. `getAllCategories(locale)` called `getAllPosts` once for posts, once for tags, and **once per
   category and per tag** (via `getPostsByCategory`/`getPostsByTag`) — **O(C·N²)**, ~18,000 disk
   reads + parses per page render.

All of this ran inside every `getStaticProps`. And by design (SDD-009 faceted navigation),
`getStaticPaths` prerendered only the canonical category URLs; **tag-faceted URLs**
(`/blog/<tag>/<slug>`) fell through to `fallback: 'blocking'` → they rendered **on-demand inside a
request-time serverless function**. Per the Pages Router docs, with `fallback: 'blocking'`
`getStaticProps` "is called **before the initial render**" — i.e. the user waits for it. A ~32 s
render vs the function timeout = `FUNCTION_INVOCATION_TIMEOUT`.

**Nuance (corrected after checking the official docs):** `revalidate: 10` did **not** cause the
user-facing 504s on prerendered pages — ISR regeneration is stale-while-revalidate (the `STALE`
cache state serves the cached page and updates in the background, and a failed background regen
keeps serving the last good page). What `revalidate: 10` did do is re-run the ~32 s function in
the background up to every 10 s per page — wasted compute and constant near-timeout invocations —
so raising it to 86400 is hygiene and cost, not the 504 fix. The 504 fix is making the render fast.

So: **a complexity bug** (O(N²)), an **anti-pattern** (no corpus caching; re-reading disk thousands
of times per render), and **fragile architecture** (heavy work in on-demand serverless renders with
a 10 s revalidate).

## Fix

- **Cache the corpus.** Read + gray-matter-parse every file **once** into a module-level cache
  (`loadCorpus`), reused by all `getPostsByX`. `getAllPosts` is now O(N); `getPostBySlug` is a
  lookup over the cache. Cache is gated to `NODE_ENV === 'production'` so `next dev` still
  hot-reloads content edits.
- **Sane revalidate.** `revalidate: 10` → `86400` (content is git-based, rebuilt on deploy);
  the notFound retry → `60`. Removed unnecessary `await` on the now-synchronous data calls.

Tag-faceted URLs stay on-demand (`fallback: 'blocking'`) — that is correct for a low-traffic blog
(don't prebuild ~150 duplicate faceted pages most visitors never open), and canonical tags stay out
of the sitemap. They are simply fast now.

## Results (measured)

| | Before | After |
| --- | --- | --- |
| Full `next build` | ~17.5 min (blog route alone) | **34 s** |
| Per `[slug]` page prerender | ~32,000 ms | **~1,600 ms** |
| On-demand tag-facet render (`next start`, warm) | would time out | **~134 ms**, then cached |
| `revalidate` | 10 s | 1 day |

`tsc` 0 errors · ESLint clean · 102 tests pass.

## Verified against official docs & community (2026-07-18)

- **`fallback: 'blocking'` semantics** — [Next.js Pages Router, getStaticProps](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props): runs at build time and "in the background" for ISR; for `fallback: 'blocking'` it is "called before the initial render". Confirms the 504 comes from the blocking on-demand render, not from ISR regens.
- **ISR is stale-while-revalidate** — same docs (`x-nextjs-cache: STALE` updates in background; a failed background regen keeps serving the last successful page). This corrected the initial claim about `revalidate: 10` (see nuance above).
- **Reading files from the FS in `getStaticProps` with `process.cwd()`** is the documented pattern — [getStaticProps API reference](https://nextjs.org/docs/pages/api-reference/functions/get-static-props).
- **Module-scope caching**: [vercel/next.js#10933](https://github.com/vercel/next.js/issues/10933) documents that in `next dev`, pages with `getStaticPaths` re-import modules per request (module cache doesn't persist) while production keeps module state — matching this fix's design (cache gated to production; dev re-reads anyway).
- **Vercel's official guidance for `FUNCTION_INVOCATION_TIMEOUT`** — [error reference](https://vercel.com/docs/errors/FUNCTION_INVOCATION_TIMEOUT): first recommendation is to make execution fit the plan's max duration (what this fix does); alternatives are Fluid compute / raising `maxDuration` ([configurable per function](https://vercel.com/docs/functions/configuring-functions/duration)) — kept as fallback levers only, since masking a quadratic loader with a longer timeout would be treating the symptom.

## Follow-ups (optional, not required to fix the 504)

- If truly instant (CDN) tag navigation is wanted later, either prebuild the facets in
  `getStaticPaths` (build cost is now cheap) or make tag filtering client-side. Not needed today.
- The same O(N²) loader also fed the `/blog` and `/blog/[category]` hubs; they benefit from the
  same cache.
