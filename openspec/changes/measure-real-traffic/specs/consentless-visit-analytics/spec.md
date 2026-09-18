## Purpose

Count human visits and their referrers without depending on the cookie banner, so the site has
one traffic number it can trust, including visits that come from AI assistants.

## ADDED Requirements

### Requirement: Human visits are counted without cookies

The production site SHALL load a cookieless analytics script (Vercel Web Analytics) on every page,
independently of the consent state. It SHALL NOT set cookies or local storage entries.

#### Scenario: Visitor rejects the banner

- **WHEN** a visitor rejects analytics in the cookie banner and views two pages
- **THEN** both page views are counted by the cookieless analytics and no new cookie is set

#### Scenario: Non-production and Lighthouse

- **WHEN** the site runs outside production or the user agent is `Chrome-Lighthouse`
- **THEN** the cookieless analytics script is not loaded

### Requirement: Consent Mode defaults are unchanged

Adding cookieless analytics SHALL NOT change the GA4 consent defaults in `_app.tsx` or the
banner behaviour.

#### Scenario: Diff review

- **WHEN** the change's diff is reviewed
- **THEN** the `gtag('consent', 'default', …)` block is identical to before

### Requirement: Traffic is reported from one command

`scripts/traffic-report.ts` SHALL print, for a given date range, the crawler requests by bot and
by top path from the crawler stream, and SHALL accept the human visit and AI-referral figures
from Vercel Web Analytics as input until an API for them is available.

#### Scenario: 28-day report

- **WHEN** the script runs with a 28-day range after deploy
- **THEN** it prints a table with crawler requests per bot, the top 10 crawled paths, and the
  human visit and AI-referral figures provided

### Requirement: The privacy page names the processor

The privacy/legal page SHALL list Vercel Web Analytics, what it collects and that it sets no
cookies.

#### Scenario: Legal page

- **WHEN** the privacy page is rendered in each locale
- **THEN** it mentions Vercel Web Analytics
