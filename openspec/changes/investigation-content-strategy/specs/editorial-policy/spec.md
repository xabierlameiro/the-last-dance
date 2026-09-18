## Purpose

Decide which posts get written, in which order and language, and how each one is judged after
publication, so that editorial time goes only to formats that have earned clicks on this site.

## ADDED Requirements

### Requirement: Every new post passes the investigation gate before drafting

A new post SHALL be drafted only after it passes the four-point gate in `docs/editorial-policy.md`:
first-hand measurements, an answer that does not fit in one sentence, a reproducible method, and
not an error-message fix. The gate result SHALL be recorded in the post's tracking issue or
calendar entry before the first draft exists.

#### Scenario: An error-message topic is proposed

- **WHEN** the radar (SDD-006) or the owner proposes a post whose subject is how to fix a
  specific error message
- **THEN** the gate rejects it and the rejection reason is written next to the topic

#### Scenario: An investigation topic is proposed

- **WHEN** a topic reports something the author measured, with a reproducible method
- **THEN** the gate records a pass for each of the four points and the topic enters the calendar

### Requirement: Error-message posts are frozen

Existing error-message posts SHALL NOT be refreshed, retitled or expanded. They stay online as
they are. Their only permitted edits are factual corrections and broken-link fixes.

#### Scenario: Quarterly refresh pass

- **WHEN** the quarterly refresh task lists candidates
- **THEN** no post in the error category is proposed for a content refresh

### Requirement: New posts are English-first

A new post SHALL be published with an `.en.mdx` file only. An `es` or `gl` version SHALL be
written only when the owner asks for it for that post.

#### Scenario: Publishing a calendar post

- **WHEN** a calendar post is ready to publish and the owner has not asked for a translation
- **THEN** the PR adds exactly one MDX file for it, `<slug>.en.mdx`

### Requirement: The calendar is ordered by data availability

The calendar SHALL list each planned post with its source material and the date that material is
available. A post SHALL NOT be scheduled before its data exists.

#### Scenario: The AI-crawler post

- **WHEN** fewer than 28 days of AI-crawler telemetry have been collected
- **THEN** the AI-crawler post stays unscheduled and the next post with available data goes first

### Requirement: Each post is measured at day 14 and day 28

Every published post SHALL get a GSC reading (clicks, impressions, CTR, position) at 14 and 28
days, plus the visit count from the consentless analytics, written into the calendar entry.

#### Scenario: Day 28 of a published post

- **WHEN** a post has been live for 28 days
- **THEN** its calendar entry holds both readings and one line saying whether the format is kept
