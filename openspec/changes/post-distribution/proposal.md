## Why

Search alone cannot grow this site from where it is.

- **The search ceiling is low.** 4,347 impressions in 28 days (GSC, ending 2026-09-18) is about
  155 a day. Even at a healthy 5% CTR that is ~7 visits a day.
- **There is no brand demand.** The home page had 12 impressions and 0 clicks in the same window.
  Nobody searches for the author, so nobody arrives without a search.
- **Distribution was planned and never recorded.** The cadence agreed on 2026-07-18 plans
  dev.to, LinkedIn and Reddit for the memory-leak post, but no record says whether it happened
  (task 1.2 checks). That post climbed from position 16.9 to 7.1 anyway; with distribution
  unmeasured there is no way to tell how much of the climb, if any, it explains.
- **A prior decision says the opposite.** SDD-013 (2026-07-18) records an owner decision of "no
  syndication/distribution (not organic)", while the cadence agreed the same day plans dev.to,
  LinkedIn and Reddit for every post. On 2026-09-18 the owner asked for visibility "by any
  means". This change makes distribution the rule and needs the owner to confirm the reversal
  explicitly (task 1.1).

## What Changes

- Every investigation post gets a distribution kit prepared in the repo before it is published:
  dev.to cross-post with `canonical_url`, LinkedIn text, one Reddit native-text post (only if the
  monthly slot is free), and a Hacker News submission for posts with a reproducible tool or
  surprising numbers.
- A script creates the dev.to cross-post as an unpublished draft through the dev.to API, with
  `canonical_url` pointing at the site. The owner reviews and publishes it. Nothing is posted on
  the owner's behalf.
- Every outbound link in the kit carries UTM parameters, so visits are attributable in the
  consentless analytics from `measure-real-traffic`.
- Community rules are written down: Reddit native text, no bare link drops, one self-post a month,
  participation between posts; HN plain title, no marketing words.

## Capabilities

### New Capabilities

- `post-distribution`: the per-post kit, the dev.to draft automation, UTM rules and community
  limits.

### Modified Capabilities

(none)

## Impact

- New `scripts/crosspost-devto.ts` (reads `DEVTO_API_KEY` from the environment; owner creates the
  key).
- New `docs/distribution/<slug>.md` per post with the kit texts.
- Supersedes the "no syndication" trigger recorded in `specs/013-llm-visibility-geo.md:4` once the
  owner confirms; that spec gets a one-line note pointing here.
- Owner time: ~30 minutes per post to review and publish the kit.
