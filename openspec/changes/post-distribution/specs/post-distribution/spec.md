## Purpose

Give every investigation post a prepared, attributable path to readers outside Google search,
while leaving every public action to the owner and respecting each community's rules.

## ADDED Requirements

### Requirement: Every investigation post has a distribution kit before publication

Before a post is published, `docs/distribution/<slug>.md` SHALL exist with: the dev.to
cross-post status, the LinkedIn text, the Reddit plan (subreddit and text, or "slot used this
month"), the HN decision with reason, and every link with its UTM parameters.

#### Scenario: Post ready to publish

- **WHEN** a post's publish PR is opened
- **THEN** the PR includes its distribution kit file

### Requirement: dev.to cross-posts are drafts with a canonical URL

`scripts/crosspost-devto.ts <slug>` SHALL create an unpublished dev.to article from the post's
`.en.mdx`, with `canonical_url` set to the post's URL on xabierlameiro.com. It SHALL NOT publish.
MDX components with no Markdown equivalent SHALL be converted or removed, and the script SHALL
list what it changed.

#### Scenario: Creating the draft

- **WHEN** the script runs for `nextjs-memory-leak-in-production` with a valid API key
- **THEN** a dev.to draft exists with `published: false` and
  `canonical_url: https://xabierlameiro.com/blog/nextjs/nextjs-memory-leak-in-production`

#### Scenario: Missing API key

- **WHEN** `DEVTO_API_KEY` is not set
- **THEN** the script exits non-zero with a message naming the variable, and makes no request

### Requirement: Outbound links are attributable

Every link to the site inside a distribution kit SHALL carry `utm_source` (the platform),
`utm_medium=social` (or `referral` for dev.to) and `utm_campaign=<slug>`. The dev.to
`canonical_url` itself SHALL NOT carry UTM parameters.

#### Scenario: LinkedIn link

- **WHEN** the LinkedIn text of a kit is read
- **THEN** its link ends with `?utm_source=linkedin&utm_medium=social&utm_campaign=<slug>`

### Requirement: Community limits are respected

The kit SHALL plan at most one Reddit self-post per calendar month across all posts, as a native
text post that stands on its own without the link. An HN submission SHALL use the post's plain
title. Nothing SHALL be submitted automatically; the owner performs every public action.

#### Scenario: Second post in the same month

- **WHEN** a second post is published in a month whose Reddit slot is already used
- **THEN** its kit records "Reddit: slot used this month" and plans no Reddit post

### Requirement: Distribution is measured per channel

At day 14 the kit file SHALL record visits per `utm_source` from the consentless analytics, and
the post's GSC position at day 0 and day 14.

#### Scenario: Day 14

- **WHEN** a distributed post reaches day 14
- **THEN** its kit shows visits per channel and the GSC position change
