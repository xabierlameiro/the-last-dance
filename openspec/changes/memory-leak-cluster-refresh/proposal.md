## Why

The only content on the site that earns clicks is the Next.js memory-leak pair, and the second
half of the pair is underperforming its sibling by an order of magnitude.

GSC, `sc-domain:xabierlameiro.com`, 28 days ending 2026-09-18:

| Page | Impressions | Clicks | CTR | Avg position |
| --- | --- | --- | --- | --- |
| `/blog/nextjs/nextjs-memory-leak-in-production` | 810 | 11 | 1.36% | 7.1 |
| `/blog/nextjs/measure-nextjs-memory-leak` | 155 | 2 | 1.29% | 20.2 |
| Whole site | 4,347 | 20 | 0.46% | 10.6 |

- The two posts produce 13 of the site's 20 clicks. Every error-message post combined produces 5.
- The measurement post converts at the same rate as the winner (1.29% vs 1.36%) but sits 13
  places lower. Its problem is ranking, not snippet: getting it to the first page is worth more
  than any other single edit available on the site.
- Both posts compete for the same head query. `nextjs memory leak` shows at position 15.6 and
  `next js memory leak` at 24.5; neither page owns it. The measurement post also surfaces for
  tooling queries (`memwatch-next`, `npx leak`) it was not written for.
- The internal link from the winner to the measurement post is at line 166 of a 2,556-word post,
  after the reader has already left. The measurement post's description is 217 characters, so
  Google truncates the part that says what the reader gets.

## What Changes

- Split the two posts by intent so they stop competing: the winner keeps "which leak do I have
  and how do I find it in production"; the measurement post takes "how to prove it" — heap
  snapshots, `--expose-gc`, retainer chains, the `next-leak` tool.
- Deepen the measurement post with material only this author has: the raw before/after heap
  numbers from the confirmed leak, a reproducible repo or `next-leak` invocation, and a section
  on reading a retainer chain step by step.
- Move the cross-link from the winner into the diagnosis section, where the reader first needs
  proof, and keep the one at the end.
- Rewrite the measurement post's `description` to 155 characters or fewer.
- Bump `updated:` only on the post whose content substantially changed, per the cadence rule
  (real bumps only).
- Measure at day 14 and day 28 after deploy against the table above.

## Capabilities

### New Capabilities

- `topic-cluster`: how two or more posts on the same subject divide search intent, link to each
  other and are measured as one unit.

### Modified Capabilities

(none)

## Impact

- `data/blog/measure-nextjs-memory-leak/measure-nextjs-memory-leak.en.mdx` — content, title and
  description.
- `data/blog/nextjs-memory-leak/nextjs-memory-leak.en.mdx` — one link moved, no other change.
- `es`/`gl` versions of both posts are left as they are. They get about one impression a month
  each (GSC, 2026-09-05 reading) and are out of scope; see `investigation-content-strategy`.
- No code change.
