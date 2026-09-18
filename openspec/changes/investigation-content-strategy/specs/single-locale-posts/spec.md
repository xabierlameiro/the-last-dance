## Purpose

Guarantee that a post existing in fewer than all three locales (`en`, `es`, `gl`) renders and is
announced correctly everywhere, so English-first publishing leaves no broken links or signals.

## ADDED Requirements

### Requirement: Hreflang lists only locales that exist

A post page SHALL emit `<link rel="alternate" hreflang>` entries only for locales in which that
post has an MDX file, plus `x-default`. It SHALL NOT emit an alternate that returns 404.

#### Scenario: English-only post

- **WHEN** the rendered HTML of a post that has only `<slug>.en.mdx` is inspected
- **THEN** it contains an `en` alternate and `x-default`, and no `es` or `gl` alternate

### Requirement: Missing-locale posts are absent from that locale's surfaces

A post without a file for a locale SHALL NOT appear in that locale's blog listing, tag sidebar
counts, sitemap entries, RSS feed or `llms.txt` section.

#### Scenario: Spanish listing with an English-only post

- **WHEN** `/es/blog` is rendered and the corpus contains an English-only post
- **THEN** the listing does not include it and no link on the page points to `/es/blog/.../<slug>`

#### Scenario: Sitemap

- **WHEN** `public/sitemap.xml` is generated
- **THEN** the English-only post appears once, under its `en` URL, and not under `/es/` or `/gl/`

### Requirement: The language switcher never leads to a 404

On a post that lacks the target locale, the language switcher SHALL send the reader to that
locale's blog index (or disable the option), not to a post URL that does not exist.

#### Scenario: Switching to Galician on an English-only post

- **WHEN** a reader on an English-only post selects `gl`
- **THEN** the resulting page returns 200
