> Each task closes with the command and its output pasted under it. Lowest priority of the growth
> changes: start only after `memory-leak-cluster-refresh` and `measure-real-traffic` ship.
> (Owner asked to start it on 2026-09-18, before those shipped; everything is still uncommitted.)

## 1. Lock today's behaviour

- [x] 1.1 Playwright suite recording current tag navigation in `en` and `es`: select tag → list
      filtered → open post → tag highlighted → back → same list. Must pass on `master` before any
      code change. Paste the run.
      `e2e/tag-navigation.test.ts`, 3 tests × 2 locales, tag `node` (8 posts per locale). It
      asserts only what a reader sees (highlight, filtered list, open article, back, full reload,
      canonical visit), never the URL shape. Run on the pre-change build, 2026-09-18:
      `6 passed (10.8s)`.
      Local run notes: the repo config runs headed and builds without readable env, so it was run
      with a scratch config (headless, existing server, Playwright's installed
      `chromium_headless_shell-1228`, outside the sandbox). Port 3000 is also held on IPv4 by an
      unrelated local `node` process that answers `Cannot GET /blog`; runs use port 3917.
- [x] 1.2 Inventory facet URLs from the corpus (post × non-category tags, per locale) and from GSC
      (`page` dimension, last 90 days). Paste the counts.
      Corpus: 90 facet URLs, 30 per locale; 18 tags, `node` the largest (8 posts per locale).
      GSC, 2026-06-20 → 2026-09-18: 16 facet URLs with impressions, 343 impressions, 1 click.
      Largest: `/blog/hydration/uncaught-error-minified-react-error` (107),
      `/blog/ci/npm-token-solution-error` (46, the 1 click), `/blog/yarn/npm-token-solucion-erro` (43),
      `/blog/memory-leak/fuga-de-memoria-nextjs-en-producion` (33).

## 2. Step 1 — links carry `?tag=`

- [x] 2.1 `getStaticPaths` in `src/pages/blog/[category]/[slug].tsx` stops producing tag-segment
      paths (keep `fallback: 'blocking'` serving them until step 3).
      Already true: it only prerenders category paths. No change.
- [x] 2.2 Tag sidebar and `PostList` link to the category URL with `?tag=`.
      Implemented differently from design D1 (see the updated design): `src/helpers/postPath.ts`
      builds every link; `next.config.ts` rewrites `/blog/:postCategory/:slug?tag=<tag>` to the
      existing `/blog/<tag>/<slug>` render, so the list and highlight are server-rendered as before;
      the page reads the browsed segment with `browsedSegment(router.query)` because after
      hydration Next re-parses `category` from the visible URL. `getStaticProps` now also passes
      `category` in each list item.
- [x] 2.3 Run the 1.1 suite unchanged: must pass. If any assertion changes, stop and ask the
      owner — do not adjust the test.
      First run after the change failed on the highlight (the hydration issue above), fixed in
      code, suite unchanged. Then `6 passed` three runs in a row, and in the full e2e run
      `91 passed, 1 failed`; the failure is `scroll-surfaces › no status widget is clipped by its
      slot at 1550px`, which passed on its two reruns and does not touch the blog.
- [x] 2.4 Jest: no internal link in rendered listings matches `/blog/<tag>/<slug>`.
      `src/helpers/__test__/postPath.test.ts` (every sidebar href in en/es/gl has the post's
      category as segment, every tag href ends in `?tag=<tag>`) and the updated PostList test
      (`?tag=` carried; bare canonical when browsing the post's own category). On the built pages,
      every internal blog link uses a category segment (curl over en/es/gl).
      Side effect: the old PostList test pinned `/blog/ci/<slug>`; it now pins the new shape and
      keeps the #186 guard (a link never loses the browsed segment).

## 3. Step 2 — robots

- [x] 3.1 Add `Disallow: /*?tag=` to `public/robots.txt`; keep every AI crawler `Allow` block.
      Added to the `User-agent: *` group only. Crawlers with their own group (GPTBot, ClaudeBot,
      etc.) follow that group and are not affected; their `Allow: /` blocks are unchanged.
- [ ] 3.2 Check with GSC robots.txt report after deploy (owner) that the rule parses.

## 4. Step 3 — redirects (after steps 1–2 are in production ≥ 7 days)

- [ ] 4.1 Generate 301s in `next.config.ts` from the corpus (design D3), preserving `?tag=`.
      Risk to check first: the rewrite from step 1 targets `/blog/<tag>/<slug>`, the very path
      these redirects match. A server-side rewrite destination is not re-checked against
      redirects, but client transitions fetch `/_next/data/<build>/blog/<tag>/<slug>.json`, and a
      redirect matching that would bounce every tag click. Confirm in the Next.js 15.5 docs how
      redirects treat data routes, and run the 1.1 suite before anything else.
- [ ] 4.2 `curl -sI` each facet URL from 1.2 on a preview deploy: all 301 to the right target.
      Paste a sample of 10 and the total count.
- [ ] 4.3 Run the 1.1 suite again: must pass.

## 5. Verify and measure

- [x] 5.1 `npm run lint`, `npm test`, `npm run build`, Playwright pass. 2026-09-18: lint exit 0,
      typecheck exit 0, `npx jest --coverage` 77 suites / 407 tests passed, build exit 0 (71/71),
      Playwright as in 2.3. Verified on `next start`: `/blog/error/solve-address-in-use-error?tag=node`
      and the `es` equivalent render with the tag highlighted and `rel=canonical` without the
      parameter; the legacy `/blog/node/…` still renders; `?tag=BAD` renders the plain post.
- [ ] 5.2 Day 28 after step 3: GSC "Alternate page with proper canonical tag" count and facet URL
      impressions compared to 1.2. Record the result; it is the evidence for calendar post #3.
