# SDD-014: next-leak as a sixth Dock app

- **Status**: Proposed 2026-09-19. Design approved by the owner the same day. Not implemented.
- **Trigger**: [next-leak](https://github.com/xabierlameiro/next-leak) (the owner's CLI for measuring
  Next.js memory leaks, 0.11.3 on npm) has no page of its own on the owner's domain. Its pitch lives
  in the repo README and in one post,
  [How to find a Next.js memory leak in production](https://xabierlameiro.com/blog/nextjs/nextjs-memory-leak-in-production).
  The goal is a page that search engines and AI crawlers can cite for "which tool measures a Next.js
  leak", built into the desktop without breaking it.

## Evidence (2026-09-19)

| Check | Result |
| --- | --- |
| next-leak GitHub stars | 14. Referrals so far came from issue threads, Reddit and one newsletter that linked the blog post, not the repo |
| A standalone docs site as the alternative | [env-typegen](https://github.com/xabierlameiro/env-typegen) has one on Vercel, with `llms.txt`, and 2 stars. A site on its own brings no traffic |
| Blog post text in the raw HTML | Yes: the full article and 5 JSON-LD blocks come back from `curl` with no JavaScript. The desktop simulation does not hide content from crawlers (same finding as SDD-013) |
| `sitemap.xml` for a new `src/pages/*.tsx` | Picked up automatically in all three locales unless listed in `NON_SITEMAP_PAGES` (`src/helpers/fileWritter.ts:21`) |
| `llms.txt` pages section | Hand-written list in `scripts/generate-llms.ts` (`## Pages`). A new page is **not** picked up by itself |
| JSON-LD on a non-blog page | Not supported: `SEO` only emits JSON-LD when `isBlog` is set (`src/components/SEO/index.tsx:40`), and `jsonLd.ts` has no `SoftwareApplication` builder |
| Mobile `modalMode` window vs Dock | Measured on production `/comments` at 390×844: the window ends at 789px and the Dock starts at 769px, **20px of overlap**. Rule: `height: calc(100% - 90px)` at `src/components/Dialog/dialog.module.css:56`, and `100%` resolves against `<main>`, which is already 24px short of the viewport |
| Cold-load Dock and home editor bugs | Fixed separately in PR #216 (eager Dock icons, one editor in the server HTML, `fitContent` for the home window, the literal `I&apos;m`). This spec builds on it |

## Decisions

### 1. Where the page lives

**Chosen: a route on this site, `/next-leak`.** It inherits the domain's authority and everything
SDD-013 already set up: crawler allowances in `robots.txt`, IndexNow on deploy, `llms.txt`.

Considered:

- *A separate domain, or GitHub Pages for the repo.* Starts with no authority and splits the traffic
  the blog already earns. The env-typegen site above is what that gets.
- *Only the repo README.* It is already there, and it is not ranking for anything. It stays the
  source of the data.

### 2. What the page looks like

**Chosen: a sixth app in the Dock**, in the spirit of Activity Monitor: memory is the subject.
It is an ordinary window of the site, `<Dialog open modalMode large … />`, with the same chrome,
traffic lights, radius, fonts and `[data-theme]` tokens as the other apps. The design was produced
in Claude Design against this repo and approved; its handoff notes are summarised in §Implementation.

Window content:

1. Header: app name, version, the one-line pitch, and `npx next-leak .` with a copy button.
2. Sidebar sections (tabs on mobile): Overview, Example run, Build mode, Verified, Limits, Links.
3. Example run: a routes table (route, verdict, slope, heap, retainer) from a real run against the
   reproduction for vercel/next.js#95094, labelled as fixed in Next 16.3.0 so it does not read as a
   current bug. Selecting the leaking row shows the heap per cycle as a step chart plus the same nine
   values as a table, and the retainer chain verbatim.
4. Verified: the issue table from the next-leak README, with its "checked" date.

Considered:

- *A blog post.* Already exists, and a post is the wrong shape for install, verdicts and limits.
- *A page outside the desktop metaphor.* Faster to build, but it breaks the one thing that makes
  this site recognisable.

### 3. Where the data comes from

**Chosen: a typed constants file, `src/constants/nextLeak.ts`**, with a `checkedAt` date, updated by
hand when the next-leak README changes. Route names, figures, the retainer chain and the issue rows
are data, not copy: they stay out of the message catalogues and are never translated.

Considered: *fetching the README at build time.* The README is prose and tables written for humans.
Parsing it would break silently on the next edit, and the data changes a few times a month.

Every figure on the page must exist in the next-leak README at `checkedAt`. The page never shows
stars, download counts or any figure the README does not carry.

### 4. Indexing and structured data

- `/next-leak` is **indexable**, unlike `/comments` and `/settings`, which are `noindex`. It enters
  the sitemap by itself (decision above) and gets a line under `## Pages` in `generate-llms.ts`.
- JSON-LD `SoftwareApplication` (name, description, `applicationCategory: DeveloperApplication`,
  `operatingSystem`, `softwareVersion`, `url`, `codeRepository`-style `sameAs` links to GitHub and npm,
  `author` pointing at the existing Person `@id`, `offers` price 0). New builder in `jsonLd.ts`.
  `SEO` gets an optional `jsonLd` prop so a non-blog page can emit it without duplicating the head tags.
- Title and description are messages, in all three locales.

### 5. Languages

Labels, headings, the pitch and the limits are translated (`src/intl/messages/{en,es,gl}.ts`). The
verdict words (`stable`, `leak`, `saturating`, `inconclusive`, `failed`), CLI flags and all data stay
as the CLI prints them. The route is `/next-leak` in every locale, like `/comments`.

### 6. Mobile height

Fix the 20px overlap **for every `modalMode` window** in `dialog.module.css`, not only for this page:
`/comments` has the same bug. The value is derived from the measured Dock top, not guessed, and
checked on `/comments`, `/settings` and `/next-leak`. It has to compose with `fitContent` from #216,
so it lands after that PR.

## Implementation

Files to add:

- `src/pages/next-leak.tsx`, with its CSS module beside it.
- `src/constants/nextLeak.ts` (data, §3).
- `public/menu/next-leak.png`, the Dock icon, rendered at the same optical weight as the other five.

Files to touch:

- `src/constants/navMenu.ts`: one `Item`, `labelId: 'dock.nextLeak'`, `link: '/next-leak'`.
- `src/constants/site.ts`: a `translateRoute` case, so the menu bar shows the app name when it is focused.
- `src/intl/messages/{en,es,gl}.ts`: `dock.nextLeak` and the `nextLeak.*` ids.
- `src/components/SEO/{index.tsx,jsonLd.ts}`: the `jsonLd` prop and the `SoftwareApplication` builder.
- `scripts/generate-llms.ts`: the `## Pages` line.
- `styles/globals.css`: three verdict colours derived from the traffic-light RGBs, darkened in the light
  theme until each clears 4.5:1 on the window background; one monospace stack token.
- `src/components/Dialog/dialog.module.css`: the mobile height (§6).

Nothing else in `Dialog`, `Dock`, `Layout` or `Header` changes. The open-app dot under the icon is the
existing `.selected::after` in `dock.module.css`.

Accessibility: the window `<h1>` is visually hidden, as on `/comments`. Sections and route rows are
buttons. The chart is `aria-hidden` because every value it draws is in the table next to it.

## Acceptance criteria

1. `curl https://xabierlameiro.com/next-leak` (and `/es/next-leak`, `/gl/next-leak`) returns, with no
   JavaScript: the pitch, the install command, the five verdict words, every row of the issue table
   and the `SoftwareApplication` JSON-LD. `robots` is `index`.
2. `/next-leak` is in `sitemap.xml` for the three locales and in `llms.txt`.
3. The Dock has six items; on `/next-leak` the next-leak icon carries the open-app dot and the menu
   bar shows the app name.
4. At 1440×900 and 1024×768 the window does not cover the Dock. At 390×844, no `modalMode` window
   (`/comments`, `/settings`, `/next-leak`) overlaps the Dock: `dialog.bottom <= dock.top`, measured.
5. In the light theme every verdict colour clears 4.5:1 on the window background.
6. Every figure on the page is in the next-leak README at `checkedAt`. Checked by hand at review.
7. The other five apps render as before. `npm test`, `npm run typecheck`, `npm run lint` and
   `npm run build` pass; the Dock unit test covers the sixth item.

## Owner actions (outside the repo)

1. Approve or supply the Dock PNG. The design has an SVG reference, not the asset.
2. Point the next-leak repo's homepage at `https://xabierlameiro.com/next-leak` (today it points at
   the blog post), and link the page from the README.
3. Resubmit the sitemap in Search Console after deploy. Google does not pick up a new URL by itself.

## Honest expectations

This gives the tool a page that can be cited. It does not create demand. Stars have come from being
useful where the problem is discussed, and that stays the main channel. Measure it over 6–8 weeks:
Search Console impressions for `/next-leak`, referrals from `xabierlameiro.com` in the repo's traffic
view, and AI-assistant referrers in Vercel Analytics.
