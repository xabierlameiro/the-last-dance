import { test, expect } from '@playwright/test';

// Must stay in sync with CONSENT_STORAGE_KEY in src/components/CookieConsent/index.tsx. Duplicated
// rather than imported because that module imports a CSS module, which Playwright cannot transform.
const CONSENT_STORAGE_KEY = 'cookie-consent';

/**
 * Regression guard for the consent notification.
 *
 * The previous implementation was a full-width bar pinned to `bottom: 0` at `z-index: 10000`, which
 * sat over the Dock — the site's only navigation — and swallowed clicks on it until answered. Its
 * Accept button and policy link also computed 1.00:1 against the light background (white on white),
 * so in practice a first-time visitor saw an invisible overlay blocking their only way to navigate.
 * These tests exist so none of that can come back quietly.
 */
test.describe('Cookie consent', () => {
    test.beforeEach(async ({ page }) => {
        // `addInitScript` runs on every navigation, so an unguarded `removeItem` would also wipe the
        // answer on `page.reload()` and the "stay away on the next visit" case could never pass. The
        // sessionStorage flag survives a reload within the tab, so this clears once per test only.
        await page.addInitScript((key) => {
            if (window.sessionStorage.getItem('e2e-consent-cleared')) return;
            window.localStorage.removeItem(key);
            window.sessionStorage.setItem('e2e-consent-cleared', '1');
        }, CONSENT_STORAGE_KEY);
        await page.goto('/');
    });

    test('should ask, with both choices visible', async ({ page }) => {
        await expect(page.getByTestId('consent-accept')).toBeVisible();
        await expect(page.getByTestId('consent-reject')).toBeVisible();
    });

    // The defect that broke the whole suite: the Dock must stay operable while the card is shown.
    test('should leave the Dock clickable while it is shown', async ({ page }) => {
        await expect(page.getByTestId('consent-accept')).toBeVisible();

        // Would time out with "subtree intercepts pointer events" if the card covered the Dock.
        await page.getByTestId('home').click({ timeout: 5000 });
        await expect(page.getByTestId('consent-accept')).toBeVisible();
    });

    test('should not overlap the Dock', async ({ page }) => {
        await expect(page.getByTestId('consent-accept')).toBeVisible();

        // Scoped by name: SDD-L06 gave the page's own window a real `role="dialog"` too, so a bare
        // role query now matches both and Playwright's strict mode rejects it.
        const card = await page.getByRole('dialog', { name: 'Cookies' }).boundingBox();
        const dock = await page.getByTestId('home').boundingBox();
        expect(card).not.toBeNull();
        expect(dock).not.toBeNull();
        // The card sits above the Dock with clear air between them.
        expect(card!.y + card!.height).toBeLessThan(dock!.y);
    });

    test('should record the grant and stay away on the next visit', async ({ page }) => {
        await page.getByTestId('consent-accept').click();

        await expect(page.getByTestId('consent-accept')).toBeHidden();
        expect(await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_STORAGE_KEY)).toBe('granted');

        await page.reload();
        await expect(page.getByTestId('consent-accept')).toBeHidden();
    });

    test('should be dismissable with the keyboard', async ({ page }) => {
        await expect(page.getByTestId('consent-accept')).toBeVisible();

        await page.keyboard.press('Escape');

        await expect(page.getByTestId('consent-accept')).toBeHidden();
        // Escape must mean "no", never consent by omission.
        expect(await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_STORAGE_KEY)).toBe('denied');
    });
});
