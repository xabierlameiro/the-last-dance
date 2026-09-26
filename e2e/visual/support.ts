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

/**
 * The instant the page is *hydrated* at, which is deliberately not `FIXED_TIME`.
 *
 * The header clock renders `new Date()` into four `suppressHydrationWarning` spans. That attribute
 * tells React to accept the server's text and leave the DOM alone, so after hydration each span
 * still shows the time the page was **built**. React only rewrites a span when its value differs
 * from the previous client render — which means a field whose value is the same at hydration and at
 * capture keeps the build's text forever, and the capture records whatever hour the build happened
 * to run at.
 *
 * Measured, not reasoned about: hydrating and capturing both at 10:30 UTC left the hour reading
 * `10:41 PM` (the build's) while the date corrected itself. So this instant differs from
 * `FIXED_TIME` in weekday, day-of-month, month *and* time-of-day, and every span is forced to
 * change. Any other pair with all four different would do.
 */
export const HYDRATION_TIME = new Date('2025-12-14T21:07:00.000Z');

/** One clock tick of the header's `setInterval(…, 60000)`, which is what repaints it. */
const CLOCK_TICK_MS = 60_000;

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
 * Evaluated **in the page**, with the same call the component makes
 * (`src/components/Layout/Header/index.tsx`), because Node and Chromium do not agree. Node's full
 * ICU formats `gl` as `10:30`; the Chromium build used here has no `gl` data and falls back to
 * English, `10:30 AM`. Computing the expected value in Node therefore failed all 11 Galician
 * captures while the page itself was perfectly correct.
 *
 * Asking the browser removes the disagreement by construction, on any platform and any ICU build,
 * and stays deterministic because the clock is pinned. A change in how Chromium formats the string
 * then shows up where it belongs — as a pixel diff against the baseline, not as a timeout here.
 */
export async function expectedClockText(page: Page, locale: Locale): Promise<string> {
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
    // `install` rather than `setFixedTime`, because the clock has to be *moved* later: the header
    // only repaints when its interval fires, and a fixed clock never fires one. `pauseAt` then
    // stops it from drifting while the page loads, which is what makes the tick land on exactly
    // `FIXED_TIME` instead of a second or two past it.
    await page.clock.install({ time: HYDRATION_TIME });
    await page.clock.pauseAt(HYDRATION_TIME);

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

    // Hydration has run against `HYDRATION_TIME` by now, so the clock's interval is registered.
    // Moving the clock to one tick before `FIXED_TIME` and running exactly that tick fires the
    // interval with `new Date()` at `FIXED_TIME` to the millisecond.
    await page.clock.setSystemTime(new Date(FIXED_TIME.getTime() - CLOCK_TICK_MS));
    await page.clock.runFor(CLOCK_TICK_MS);

    // Waiting for the pinned value is what makes the capture reproducible; a fixed delay here would
    // pass or fail on machine speed instead.
    await page
        .getByTestId('header')
        .getByText(await expectedClockText(page, locale), { exact: true })
        .waitFor({ state: 'visible' });

    await page.evaluate(() => document.fonts.ready);
}
