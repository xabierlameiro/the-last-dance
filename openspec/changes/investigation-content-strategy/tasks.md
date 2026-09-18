> Each task closes with the command and its output pasted under it.

## 1. Policy document

- [x] 1.1 Write `docs/editorial-policy.md`: the four-point gate (design D1), the frozen error
      posts rule, English-first, the policy date (2026-09-18), the day-14/day-28 measurement, and
      the calendar table (design D3) with one row per post and its gate result.
      `docs/editorial-standard.md` contradicted the policy in three places (Spanish as drafting
      voice, problem → solution as "the format that ranks", en/es/gl in the reviewer checklist);
      those lines now point at the policy.
- [x] 1.2 Link the policy from `specs/README.md` and from the radar. There is no radar issue
      template: the weekly issue body is built by `buildReport` in `scripts/trending/lib.ts`. Its
      header and the drafting prompt now ask for the gate first and an English-only draft.

## 2. Single-locale posts

- [x] 2.1 Fixture corpus at `src/__test__/fixtures/single-locale/data/blog/`: one post with only
      `.en.mdx`, one with `.en.mdx` + `.es.mdx`.
- [x] 2.2 Audit, per surface, for an English-only post (2026-09-18):
      - hreflang (`SEO/tags.tsx` `blogTags`): OK. Emits the self alternate and `x-default` only;
        alternates come from the post's own `alternate` frontmatter, never from a locale list.
        The hard-coded en/es/gl list (`staticHreflangTags`) is used only by non-blog pages.
      - Language switcher: not on post pages. `LangSelect` renders only on `/settings`, which
        exists in every locale. Nothing to fix.
      - `getStaticPaths` of `blog/[category]/[slug].tsx`: OK. One path per MDX file.
      - `/es/…` or `/gl/…` request for the post: `getStaticProps` → `redirectToPostLocale` → 301
        to the English URL, which returns 200.
      - Listings and tag/category counts (`getPostsByLocale`, `getAllCategories`): OK, per locale.
      - Sitemap (`createSiteMap`): OK. Fed from the same per-file routes.
      - RSS (`generate-feeds.ts`): OK. Filters each channel by the post's `locale`.
      - `llms.txt` (`generate-llms.ts`): OK. Reads `.en.mdx` only by design.
- [x] 2.3 Fix every failing surface: none failed.
- [x] 2.4 Jest `src/__test__/singleLocalePost.test.tsx`, real loader/route/SEO code over the
      fixture corpus: listed and counted in `en` only; hreflang is exactly `en` + `x-default`;
      prerendered and submitted to the sitemap under `en` only; `/es` and `/gl` requests 301 to
      the English URL. 5 passed.
- [x] 2.5 Replaced the Playwright check. It assumed a language switcher on the post page, which
      does not exist. The `/gl` → English 301 is asserted in 2.4 against the route's
      `getStaticProps` instead.

## 3. Frontmatter validation

- [x] 3.1 `scripts/check-frontmatter/` (pure `lib.ts` + runner `index.ts`), first step of
      `prebuild`. It extends the existing `postFrontmatterSchema` (`src/types/upstream.ts`) with
      `slug`, `author`, `tags`, `locale` (en/es/gl) and `description`, rather than adding a second
      contract. A prebuild script, not `fileReader.ts`: the loader must keep serving legacy posts
      at runtime, and a build-time report can list every post at once.
- [x] 3.2 Date cut-off (design D2): the `<Date>` in the body on or after 2026-09-18 → error; before
      → warning; no `<Date>` → error. Tests in `scripts/check-frontmatter/__test__/lib.test.ts`
      cover both branches, the policy day itself, the missing field and the missing date
      (11 passed).
- [x] 3.3 `node scripts/check-frontmatter/index.ts` on the current corpus → exit 0,
      `45 posts checked: 0 errors, 50 warnings` (38 descriptions over 155, 12 titles over 60).
      The design expected four; it counted English descriptions only.

## 4. Calendar posts

Each post: gate recorded (policy calendar) → draft → owner review → publish `en` only →
day-14 and day-28 readings.

- [ ] 4.1 Post 1: GA4 and Consent Mode v2 on a small site. Needs the GA4 sessions vs GSC clicks
      comparison for one 28-day window; if `measure-real-traffic` is live, add Vercel visit counts.
- [ ] 4.2 Post 2: the 32 s → 1.6 s blog route (SDD-012 data).
- [ ] 4.3 Post 3: path-segment facets (after `tag-facets-as-query-param` ships).
- [ ] 4.4 Post 4: AI crawlers and llms.txt (after ≥ 28 days of `measure-real-traffic` data).

## 5. Verify

- [x] 5.1 `npm run lint`, `npm test` and `npm run build` pass. 2026-09-18:
      `npm run typecheck` → exit 0. `npm run lint` → exit 0.
      `npx jest --silent --coverage` → 76 suites, 397 tests passed, thresholds met.
      `NEXT_PUBLIC_DOMAIN=https://xabierlameiro.com NEXT_PUBLIC_ENV=development npm run build` →
      exit 0; prebuild logs `[frontmatter] 45 posts checked: 0 errors, 50 warnings`; 71/71 pages.
      The fixture slugs appear in no file under `public/`.
