## Why

The blog does not lack visibility in Google. It lacks posts people need to open.

GSC, `sc-domain:xabierlameiro.com`, 28 days ending 2026-09-18: **4,347 impressions, 20 clicks,
CTR 0.46%, average position 10.6.**

- **Error-message posts rank and do not convert.** `npm-token-solution-error`: 1,190 impressions
  at position 6.0, 3 clicks (0.25%). `uncaught-error-minified-react-error`: 458 at 8.8, 1 click.
  `solve-address-in-use-error`: 321 at 18.2, 1 click. `counter-for-github-stars-repository`: 752
  at 8.2, 0 clicks; its queries are pasted API URLs such as
  `api.github.com/repos/vercel/next.js stargazers_count`. US desktop alone is 2,165 impressions at
  position 7.6 for 1 click.
- **Snippet work was tried and did not move them.** SDD-010 rewrote titles and descriptions in
  July; the NPM_TOKEN title corruption was fixed in August. The 2026-08-08 GSC reading found
  `how to kill address already in use` at position 1 with zero clicks. The answer to an error
  message fits in the AI Overview and the GitHub issue above the result; nobody needs the page.
- **First-hand investigations are the only format that converts.** The memory-leak pair (July
  2026) holds 13 of the 20 clicks. Twelve of the fifteen posts date from 2022–2023; they
  produce 5.
- **Nothing has been published since 2026-07-22**, against an agreed cadence of 1–2 posts a
  month (owner decision, 2026-07-18).
- **Translations add cost, not reach.** Every post exists as `en`, `es` and `gl` (45 MDX files
  for 15 posts). The `es` version of the winning post had 20 impressions against 810 for `en`;
  `gl` versions register about one impression a month.
- **The home page had 12 impressions and 0 clicks.** There is no brand demand yet; every visit
  depends on cold search, which is why each post has to earn its own click.

## What Changes

- Write down an editorial policy with a gate every new post must pass before drafting: it is a
  first-hand investigation with the author's own measurements, and its answer does not fit in a
  search snippet. Error-message fix posts are no longer written, refreshed or optimised.
- New posts are published in English only. `es` and `gl` versions are optional, written only when
  the owner wants them, never as a default step. Existing translations stay online unchanged.
- The site must build and render correctly for a post that has only an `.en.mdx` file: no broken
  hreflang alternates, no `es`/`gl` routes that 404 from internal links, no language switcher
  pointing at a missing page.
- A build-time frontmatter check validates required fields and snippet lengths (`title` ≤ 60,
  `description` ≤ 155) for posts published after the policy date. Older posts only warn.
- An editorial calendar with the next four investigation posts, each built from material the
  site already produced, in an order set by data availability (see `design.md`).

## Capabilities

### New Capabilities

- `editorial-policy`: which posts get written, the investigation gate, the calendar and the
  measurement each post receives.
- `single-locale-posts`: the site's behaviour when a post exists in fewer than all three locales.
- `frontmatter-validation`: build-time checks on post frontmatter.

### Modified Capabilities

(none)

## Impact

- New `docs/editorial-policy.md` (policy + calendar).
- Behaviour for missing locales: audited, no code change needed (see tasks 2.2). A fixture corpus
  and tests pin it.
- New frontmatter check (Zod, extending the existing `postFrontmatterSchema`) as the first
  `prebuild` step.
- `docs/editorial-standard.md`, `specs/README.md` and the radar brief (`scripts/trending/lib.ts`)
  point at the policy.
- Four new `data/blog/<slug>/<slug>.en.mdx` posts over roughly two months.
- Depends on `measure-real-traffic` for the AI-crawler post data; that post is last in the
  calendar for that reason.
