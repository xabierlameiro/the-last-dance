## Context

- The facet paths exist because `getStaticPaths`/`fallback: 'blocking'` renders any
  `/blog/<segment>/<slug>` where the segment is the category or one of the post's tags, and the
  sidebar/listing link through the browsed segment to keep the selected tag highlighted.
- The previous attempt (#186) changed the links to the canonical path without carrying the tag,
  so opening a post from a tag listing de-selected the tag. The owner reported it as a bug and
  #189 reverted it. Lesson recorded: a working feature outranks a marginal SEO gain; any UX
  change here is a decision for the owner, not an implementation detail.

## Goals / Non-Goals

**Goals:**

- One indexable URL per post and locale.
- Identical tag navigation: same highlight, same filtered list, same back-button behaviour.

**Non-Goals:**

- Indexable `/blog/tag/<tag>` hub pages. 11 of 17 tags have one post; hubs would be thin content.
- Changing category URLs.

## Decisions

**D1 · Tag state lives in `?tag=`, served by a rewrite to the existing tag render.** (Revised
2026-09-18 during implementation.) The first idea was to read `router.query.tag` on the client.
It fails the "identical" goal: the post-list next to the article is built in `getStaticProps`
from the path segment, so a client-read tag would show the category list first and then swap it
on every full load of a tagged URL. Instead, `next.config.ts` rewrites
`/blog/:postCategory/:slug` with `?tag=<tag>` to `/blog/<tag>/<slug>`, the render the site
already had, so the HTML, list and highlight are the same, server-side and on client
transitions. The page reads the browsed segment as `?tag=` first and the path segment second
(`browsedSegment`), because after hydration Next re-parses `category` from the visible URL. The
accepted tag shape (`[a-z0-9-]+`) is one constant shared by the rewrite and the page, so any other
value renders the plain post on both sides.

Alternative: keep path segments and add `rel=nofollow` to facet links. Rejected: nofollow is a
hint, and it does not stop the URLs from being crawled via external links or sitemaps.

**D2 · Redirects ship last and separately.** Step 1 changes links and adds `?tag=`; step 2 adds
`Disallow: /*?tag=`; step 3, after both are verified in production, adds a 301 for each legacy
`/blog/<tag>/<slug>` to `/blog/<category>/<slug>?tag=<tag>`. Each step is a separate commit that
can be reverted alone.

**D3 · Redirect list is generated, not hand-written.** Built from the corpus (post → tags) at
build time in `next.config.ts`, so a new tag never leaves an orphan facet.

## Risks / Trade-offs

- **Navigation regression again.** Mitigation: Playwright tests written *before* the change that
  record today's behaviour (tag selected → open post → tag still highlighted → back → same list),
  then run unchanged after it.
- **`Disallow: /*?tag=` hides the canonical from crawlers that land on a tagged URL.** Acceptable:
  the canonical is linked elsewhere and listed in the sitemap without parameters.
- **Effort vs reward.** The measurable gain is small (proposal). If the Playwright suite cannot
  prove identical behaviour, the change stops at step 1's branch and is not merged.
