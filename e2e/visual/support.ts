import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';
import { type Locale, localisedPath } from './targets';

/**
 * @description Everything a capture needs in order to depend on committed inputs alone: a frozen
 * clock, resolved cookie consent, API responses served from fixtures and third-party scripts
 * blocked at the route layer.
 */

/**
 * The instant every capture is taken at. Any value works as long as it never changes; this one is
 * mid-morning on a weekday so the header's short weekday renders a typical width rather than the
 * shortest one in the calendar.
 */
export const FIXED_TIME = new Date('2026-01-15T10:30:00.000Z');

/*
 * A second instant, `HYDRATION_TIME`, used to live here, and the suite hydrated at it before
 * jumping the clock one interval tick to `FIXED_TIME`.
 *
 * That was a workaround for a defect in the header, not a property of the capture. The clock
 * rendered `new Date()` into four `suppressHydrationWarning` spans; React keeps the server's text
 * for those and afterwards only rewrites a node whose value differs from the previous CLIENT
 * render, so a field that read the same at hydration and at capture kept the text from the moment
 * the page was BUILT. Hydrating at a deliberately different instant forced all four to change.
 *
 * The header now renders nothing until it mounts and reads the clock in an effect, so hydrating and
 * capturing at the same pinned instant produces the pinned instant. The workaround is gone with the
 * defect it worked around, and the captures are unchanged: recorded against the old arrangement and
 * replayed against this one, all 71 match.
 */

/** `src/components/CookieConsent/index.tsx`. `denied` also keeps GA from loading at all. */
const CONSENT_STORAGE_KEY = 'cookie-consent';
const CONSENT_VALUE = 'denied';

// Playwright loads these specs as ES modules, where `__dirname` does not exist.
const HERE = path.dirname(fileURLToPath(import.meta.url));

const FIXTURE_DIR = path.join(HERE, 'fixtures');

/**
 * API route → fixture file. Every route under `src/pages/api` that a captured screen reads is
 * here; the header alone pulls six of them, so this covers every screen rather than the home page.
 */
const API_FIXTURES: Record<string, string> = {
    analytics: 'analytics.json',
    deployments: 'deployments.json',
    'github-stars': 'github-stars.json',
    heating: 'heating.json',
    'indexed-pages': 'indexed-pages.json',
    news: 'news.json',
    weather: 'weather.json',
    xrp: 'xrp.json',
};

/**
 * Hosts whose scripts would make a capture depend on the network. AdSense is already disabled in
 * code; it is listed so that re-enabling it cannot silently reach the baseline.
 */
const BLOCKED_HOSTS = [
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'region1.google-analytics.com',
    'pagead2.googlesyndication.com',
    'googleads.g.doubleclick.net',
    'va.vercel-scripts.com',
    'vitals.vercel-insights.com',
];

function readFixture(name: string): string {
    return fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8');
}

/**
 * The text the header's clock shows once its interval has repainted it.
 *
 * English and Spanish are evaluated **in the page**, with the options the component passes
 * (`src/components/Layout/Header/index.tsx`), because Node and Chromium do not agree on every
 * locale. Asking the browser removes the disagreement by construction, on any platform and any ICU
 * build, and stays deterministic because the clock is pinned. A change in how Chromium formats the
 * string then shows up where it belongs — as a pixel diff against the baseline, not as a timeout
 * here.
 *
 * Galician is the exception, because the browser is no longer who writes it. Chromium has no `gl`
 * data and answered in its own language, `10:30 AM`, which this function used to wait for and the
 * baseline used to photograph. The site now formats Galician itself (`src/intl/galician.ts`): two
 * digits and 24 hours, the same on the server and in any browser.
 */
export async function expectedClockText(page: Page, locale: Locale): Promise<string> {
    // The context is UTC, so the ISO string already holds the hour the page will show.
    if (locale === 'gl') return FIXED_TIME.toISOString().slice(11, 16);

    return page.evaluate(
        ({ iso, tag }) =>
            // No `timeZone`: the component does not pass one either, and the context is UTC.
            new Date(iso).toLocaleTimeString(tag, { hour: 'numeric', minute: 'numeric' }),
        { iso: FIXED_TIME.toISOString(), tag: locale as string }
    );
}

/**
 * Applies every determinism control. Call before `page.goto`, never after: a clock installed after
 * navigation has already let the page read the real one.
 */
export async function prepareDeterministicPage(page: Page): Promise<void> {
    // `setFixedTime`, not `install`: it pins `Date.now()` and `new Date()` to the capture instant
    // and leaves every timer running. The header reads the clock once on mount, so that is all it
    // needs — but the status widgets beside it do not fetch until a timer fires, and an installed
    // clock does not advance on its own. Capturing under `install`/`pauseAt` photographed six
    // widgets stuck on their loading spinner and moved every item left of the clock, which failed
    // 46 of the 71 captures. Pinning without freezing keeps the clock deterministic and leaves the
    // rest of the bar to settle on its own.
    await page.clock.setFixedTime(FIXED_TIME);

    await page.addInitScript(
        ({ key, value }: { key: string; value: string }) => {
            try {
                window.localStorage.setItem(key, value);
            } catch {
                // A context with storage disabled still renders; the banner simply stays up and the
                // diff will show it. Swallowing here keeps the failure visual rather than an
                // unrelated exception.
            }
        },
        { key: CONSENT_STORAGE_KEY, value: CONSENT_VALUE }
    );

    for (const host of BLOCKED_HOSTS) {
        await page.route(`**://${host}/**`, (route) => route.abort());
    }

    await page.route('**/api/**', async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        const routeName = pathname.replace(/^.*\/api\//, '').replace(/\/$/, '');
        const fixture = API_FIXTURES[routeName];

        if (!fixture) {
            // An unfixtured API call would reach the network and make the capture non-reproducible.
            // Failing the request surfaces it as a broken widget in the diff instead of as a
            // screenshot that happens to be green on the day it was taken.
            await route.abort();
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: readFixture(fixture),
        });
    });
}

export type Theme = 'light' | 'dark';

/**
 * Navigates to a target and waits until the page is safe to photograph.
 *
 * Two hydration waits, not one. `useDarkMode` starts at `null` and writes `data-theme` in an
 * effect, exactly like the header clock, so capturing before it lands would photograph the
 * pre-hydration palette — the failure mode that hook's own header comment records shipping once.
 */
export async function gotoAndSettle(
    page: Page,
    locale: Locale,
    targetPath: string,
    theme: Theme
): Promise<void> {
    await page.goto(localisedPath(locale, targetPath), { waitUntil: 'networkidle' });

    await page.locator(`html[data-theme="${theme}"]`).waitFor({ state: 'attached' });

    // Waiting for the pinned value is what makes the capture reproducible; a fixed delay here would
    // pass or fail on machine speed instead. It is also the signal that the clock has mounted —
    // before that the fields are empty and the bar is still holding their width open.
    await page
        .getByTestId('header')
        .getByText(await expectedClockText(page, locale), { exact: true })
        .waitFor({ state: 'visible' });

    await page.evaluate(() => document.fonts.ready);
}
