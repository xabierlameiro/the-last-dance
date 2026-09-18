## Purpose

Record every request a declared AI crawler makes to the site, durably and apart from human
analytics, so the site can say which bots read what and how often.

## ADDED Requirements

### Requirement: Declared AI crawlers are recognised by user agent

The site SHALL classify a request as an AI crawler when its user agent contains a token from the
crawler table, and SHALL attach the bot name, operator and purpose (training, search or
user-triggered fetch) from that table.

#### Scenario: GPTBot requests a post

- **WHEN** a request with a user agent containing `GPTBot` hits `/blog/nextjs/nextjs-memory-leak-in-production`
- **THEN** it is classified as bot `GPTBot`, operator `OpenAI`, purpose `training`

#### Scenario: A browser requests the same post

- **WHEN** a request with a desktop Chrome user agent hits the same URL
- **THEN** it is not classified as a crawler and no crawler event is sent

### Requirement: Crawler hits are recorded durably without delaying the response

Each classified request SHALL produce one `ai_crawler_hit` event with `bot`, `purpose` and
`path` in a GA4 data stream dedicated to crawlers. The event SHALL be sent after the response is
handed back (`waitUntil`); a failure to send SHALL NOT change the response.

#### Scenario: GA4 is unreachable

- **WHEN** the Measurement Protocol call fails or times out
- **THEN** the crawler still receives the page with the normal status and the failure is logged

#### Scenario: Event reaches the stream

- **WHEN** a request with user agent `ClaudeBot` is made to `/llms.txt` on a preview deploy
- **THEN** within the GA4 realtime view of the crawler stream an `ai_crawler_hit` event appears
  with `bot=ClaudeBot` and `path=/llms.txt`

### Requirement: Crawler data never mixes with human analytics

Crawler events SHALL go only to the crawler stream, and SHALL carry no cookie, IP address or
human identifier. The human GA4 property and its consent defaults SHALL remain unchanged.

#### Scenario: Human property after deploy

- **WHEN** the human GA4 property is inspected after deploy
- **THEN** it contains no `ai_crawler_hit` events

### Requirement: Asset requests are not processed

The middleware SHALL NOT run for static assets (`_next/static`, `_next/image`, images, fonts,
favicon). It SHALL run for pages and for `/robots.txt`, `/sitemap.xml`, `/llms.txt`,
`/llms-full.txt` and the RSS feeds.

#### Scenario: Image request

- **WHEN** a crawler requests `/posts/nextjs-memory-leak.png`
- **THEN** the middleware does not execute
