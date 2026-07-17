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
request-time serverless function**. A ~32 s render in a function with Vercel's ~10 s timeout =
`FUNCTION_INVOCATION_TIMEOUT`. `revalidate: 10` made it worse by marking even prerendered pages
stale every 10 s, re-running the whole thing constantly.

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

## Follow-ups (optional, not required to fix the 504)

- If truly instant (CDN) tag navigation is wanted later, either prebuild the facets in
  `getStaticPaths` (build cost is now cheap) or make tag filtering client-side. Not needed today.
- The same O(N²) loader also fed the `/blog` and `/blog/[category]` hubs; they benefit from the
  same cache.
