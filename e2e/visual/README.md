# Visual baseline

A committed screenshot of every screen that renders, in every locale, so that a change meant to
leave the site looking identical can prove it did. A pixel difference fails the build.

## Running it

```bash
npx playwright test --project=visual-locale --project=visual-dark --project=visual-mobile
```

Baselines are **captured in CI, not on a laptop**: run the `visual-baseline` workflow
(`workflow_dispatch`), download its artifact and commit it. Font rasterisation differs between
macOS and the Linux runner, so a locally captured baseline can never match what CI compares. The
snapshot path carries the platform, so a local run writes beside the committed Linux files rather
than over them — and then fails, because no local baseline exists. That is intended.

## The three projects

Each sweeps one axis across every screen. The axes are not multiplied by each other: a Spanish
dark-mode 404 fails for the same reason its English sibling does.

| Project | Axis | Screens | Captures |
| --- | --- | --- | --- |
| `visual-locale` | `en`, `es`, `gl` — light, 1280×720 | 11 | 33 |
| `visual-dark` | dark theme — `en`, 1280×720 | 11 | 11 |
| `visual-mobile` | 375×812 — `en`, light | 11 | 11 |

**55 captures**, plus 6 redirect assertions.

The mobile width is 375 because every `@media` rule in `src/**` bar two is `max-width`, the
narrowest at 420; 375 enters all 15 of them. The two `min-width` queries, 768 and 1024, are
already entered by the 1280 desktop captures. Between the two widths, every media query in the
stylesheets is exercised at least once.

## What is faked, and why

A capture must depend on committed inputs alone. Four controls, all in `support.ts`:

- **The clock is frozen** at `2026-01-15T10:30:00Z`, installed before `goto`. The header renders
  the wall clock on every screen, server-rendered first and replaced on hydration, so each capture
  waits for the pinned time to appear rather than for a delay to elapse.
- **The API is served from `fixtures/`** — one JSON per route under `src/pages/api` that a screen
  reads. The header alone pulls six of them, so this applies to every screen, not just the home
  page. An API call with no fixture is aborted rather than allowed through: a widget visibly broken
  in the diff is better than a screenshot that was only green on the day it was taken.
- **Third-party scripts are blocked** at the route layer: Google Tag Manager, Analytics, AdSense
  and Vercel's script and insights endpoints.
- **The browser timezone is UTC**, so the clock formats the same everywhere.

## Declared exclusions

Nothing is masked today. These are the screens and states the baseline deliberately does not
cover, recorded because an unrecorded gap is indistinguishable from an oversight.

- **The cookie banner.** `localStorage` is seeded with `cookie-consent: denied` before the page
  loads, so captures show the site as a returning visitor sees it, and no analytics script loads.
  The banner's own behaviour is covered by `e2e/cookie-consent.test.ts`.
- **`/blog` and `/blog/<category>`.** Neither renders: both are `() => null` with a
  `getServerSideProps` that redirects to the newest post. Capturing them would follow the redirect
  and pin whichever post is newest, so publishing would move two baselines in three locales. They
  are covered by a redirect assertion that matches the destination's *shape*.
- **Interactive states.** A capture records a screen as it loads. `Dialog`, `Tooltip`,
  `Notification`, `StarPrompt`, `Dock`, `SearchInput` and `CountDown` all have an open/closed or
  shown/hidden state that no baseline here exercises.

## Changing a baseline

Re-capture in the same commit that changes the screen, and say in the commit body which screens
changed and why. Refreshing a baseline to clear a failure whose cause has not been identified
disables the gate rather than satisfying it.

If a region ever has to be masked, record the mask and its justification in this file. A masked
region is a region no change can be measured against.

## Pinned constants

In `targets.ts`, never derived from "the newest post":

| Constant | Value |
| --- | --- |
| Post | `make-a-views-counter` — renders Code Hike, exists in all three locales |
| Category | `nextjs` (`getStaticPaths` lowercases the front matter's `Nextjs`) |
| Tag | `node` |
| Legal slug | `privacy-policy` |

The post's slug is **translated per locale**, so a post target is three URLs, not one. If the
pinned post is deleted the suite fails on a 404, loudly, rather than quietly capturing a different
page.
