> Each task closes with the command or GSC reading that proves it, pasted under the task.

## 1. Baseline

- [x] 1.1 Pull GSC page and query rows for both posts for the 28 days before the edit
      (`page contains memory-leak`, dimensions `page,query`) and paste the totals under this task.
      The proposal table is the 2026-09-18 reading; refresh it if the edit lands later.

      GSC `get_search_analytics`, dimension `page`, 2026-08-21 → 2026-09-18:
      `nextjs-memory-leak-in-production` 810 imp / 11 clicks / 1.36% / pos 7.1;
      `measure-nextjs-memory-leak` 155 imp / 2 clicks / 1.29% / pos 20.2.
      Edit made the same day, so this is the baseline.

- [x] 1.2 List the queries each page currently receives and tag each as "find in production" or
      "prove / measure". This is the intent split the rewrite follows.

      GSC `page,query`, 2026-06-20 → 2026-09-18 (visible queries only; the rest are anonymised):

      | Page | Query | Imp | Pos | Intent |
      | --- | --- | --- | --- | --- |
      | measure | `memwatch-next` | 2 | 39 | prove / measure |
      | measure | `npx leak` | 2 | 10.5 | prove / measure |
      | measure | `nextjs memory leak` | 2 | 27 | find (overlap) |
      | measure | `next js memory leak` | 1 | 32 | find (overlap) |
      | measure | `next js` | 1 | 5 | none |
      | production | `nextjs memory leak` | 5 | 12.2 | find |
      | production | `next js memory leak` | 1 | 17 | find |

      The head query belongs to the production post; the measurement post only picks up
      tooling queries on its own. Seven visible rows in 90 days: a small sample, used for
      direction only.

## 2. Measurement post rewrite

- [x] 2.1 Rewrite the first paragraph and title of `measure-nextjs-memory-leak.en.mdx` around
      proving a leak (heap snapshots, `--expose-gc`, retainer chains, `next-leak`). Title ≤ 60 chars.

      Title and H1: `Heap snapshot diffs: how to prove a Next.js memory leak` (55 chars).
      The existing intro already says "This post is about the method — how to measure, and how
      to prove the diagnosis" and links to the production post; left as it was.

- [x] 2.2 The excerpt already quotes the heap figures (28.7 → 138.9 MB across 8 cycles, flat once
      the cause is removed). Check whether the body shows them per cycle; if not, add the per-cycle
      table with the exact command that produced it.

      Already in the body ("The numbers" and "Removing the cause removes the effect"), per
      cycle, with the reproduction parameters. No change.

- [x] 2.3 Add a step-by-step section on reading one retainer chain from a real snapshot, with a
      screenshot or a text excerpt of the chain.

      Already covered by "The snapshot diff names the mechanism": the real #95094 chain as
      text, read bottom-up, plus the DevTools Comparison/Retainers steps. Not expanded; the
      new section points back to it.

- [x] 2.4 Add a reproducible entry point: a `next-leak` invocation or a minimal repo link that a
      reader can run in under five minutes.

      `npx next-leak .` was already there, but only covers App Router + standalone. Added
      "Without next-leak: the protocol in two files": a preloaded `heap-probe.cjs` (three forced
      GC passes and a snapshot on `SIGUSR2`) and a `measure.sh` cycle driver with autocannon.
      Both run exactly as published, against a standalone Next.js 15.5.21 build with two API
      routes (one leaking into a global array), Node 24.18, autocannon 8.0.0, 8 × 3000
      requests, 20 connections:

      ```
      /api/leak    24.8 → 28.6 → 26.4 → 27.5 → 28.5 → 29.5 → 30.6 → 31.6 → 32.6
      /api/clean   24.8 → 27.6 → 24.4 → 24.4 → 24.5 → 24.5 → 24.5 → 24.5 → 24.5
      ```

      Two runs gave identical series; a third, with the final probe, gave 26.5 at cycle 2
      and the same values elsewhere. Two findings from testing went into the post: cycle 1 is
      still warm-up (baseline moved to cycle 2), and standalone `server.js` calls
      `process.chdir(__dirname)`, so the probe captures its output directory at load.

- [x] 2.5 Rewrite `description` to ≤ 155 chars. Check with
      `node -e` over the parsed frontmatter, paste the length.

      `node -e` length check: 140 characters.

- [x] 2.6 Bump `updated:` on this post only.

      `updated: '2026-09-18'`. FAQ answer "Can I run this measurement on my own Next.js app?"
      extended to cover the two-file probe.

## 3. Production post link

- [x] 3.1 In `nextjs-memory-leak.en.mdx`, add a link to the measurement post inside the section
      where the reader must confirm the leak, with descriptive anchor text. Keep the closing link.

      Added after the retainer-names paragraph in "The shape of the growth tells you where to
      look": anchor "how to prove a Next.js memory leak with heap snapshot diffs". The link
      near the end of the post is kept.

- [x] 3.2 Do not bump `updated:` on this post: one moved link is not a substantial change.

      `updated: '2026-09-14'` unchanged.

## 4. Verify

- [x] 4.1 `npm run build` passes and both pages render locally with the new link and title.

      `NEXT_PUBLIC_DOMAIN=https://xabierlameiro.com NEXT_PUBLIC_ENV=development npm run build`:
      `✓ Compiled successfully`, `✓ Generating static pages (71/71)`, exit 0. Without
      `NEXT_PUBLIC_DOMAIN` the `/404` prerender fails on `undefined/api/analytics` **and the
      build first rewrites `public/sitemap.xml` with `undefined` as the host** — restored with
      `git checkout`; never commit a sitemap from a build without that variable.
      Built `en/blog/nextjs/measure-nextjs-memory-leak.html`: `<title>`, `og:title` and JSON-LD
      `headline` = new title; `meta description` = new 140-char text; the new section is present.
      Built `nextjs-memory-leak-in-production.html` links to the measurement post with the new
      anchor text and keeps the closing link. `npm run lint` exit 0; `npm test` 70 suites,
      339 tests passed.
      `public/sitemap.xml` `lastmod`: measurement post → 2026-09-18, and the three
      production-post locales → 2026-09-14 (their `updated:` changed on master on 2026-09-14 but
      the committed sitemap was never regenerated). `public/llms.txt`, `llms-full.txt` and
      `feed.xml` regenerated with the `prebuild` scripts.
- [ ] 4.2 After deploy, `curl` the production URL of the measurement post and confirm `<title>`,
      `meta[name=description]` and the JSON-LD `headline` carry the new values.
- [ ] 4.3 Request indexing of the measurement post in GSC (owner action: URL Inspection →
      Request indexing).

## 5. Measure

- [ ] 5.1 Day 14 after deploy: GSC reading for both pages, pasted here.
- [ ] 5.2 Day 28 after deploy: GSC reading, verdict against the baseline (combined clicks up or
      not; measurement post position vs 20.2).
