import { test as base, expect } from '@playwright/test';

/**
 * SDD-L10-T2. A per-test page, with the consent notification already answered.
 *
 * `landing-page.test.ts` used to create one `Page` in `beforeAll` and share it across every test in
 * the file. That made the suite order-dependent — "should open the modal again" only made sense
 * after the test before it had clicked something — while `playwright.config.ts` declares no serial
 * mode, so Playwright was free to shard or reorder them. It also meant one test's leftover DOM state
 * silently became the next test's precondition, which is the failure mode where a suite goes green
 * for the wrong reason.
 *
 * Using Playwright's own `page` fixture gives each test a fresh context. The only shared setup is
 * the consent answer, which every test needs and no test is about.
 */

// Must stay in sync with CONSENT_STORAGE_KEY / ConsentChoice in
// src/components/CookieConsent/index.tsx. Duplicated rather than imported because that module
// imports a CSS module, which Playwright's transform cannot resolve.
const CONSENT_STORAGE_KEY = 'cookie-consent';
const CONSENT_DENIED = 'denied';

export const test = base.extend({
    page: async ({ page }, use) => {
        // 'denied' so the suite never opts itself into analytics.
        await page.addInitScript(
            ([key, choice]) => window.localStorage.setItem(key, choice),
            [CONSENT_STORAGE_KEY, CONSENT_DENIED]
        );
        await use(page);
    },
});

export { expect };
