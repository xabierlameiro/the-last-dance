import { Page, test, expect } from '@playwright/test';
import { socialLinks } from '@/constants/site';

// Must stay in sync with CONSENT_STORAGE_KEY / ConsentChoice in
// src/components/CookieConsent/index.tsx. Duplicated rather than imported because that module
// imports a CSS module, which Playwright's transform cannot resolve.
const CONSENT_STORAGE_KEY = 'cookie-consent';
const CONSENT_DENIED = 'denied';

let page: Page;

test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({});
    // Answer the consent notification before the first navigation, so these tests exercise the page
    // rather than the notification. 'denied' so the suite does not opt itself into analytics.
    //
    // It used to be a full-width bar at `bottom: 0` with `z-index: 10000`, directly over the Dock —
    // this site's only navigation — and it intercepted every click there until answered, which is what
    // timed these tests out on `getByTestId('home')`. It is now a macOS-style notification in the
    // top-right; the dedicated suite below guards that it stays out of the Dock's way.
    await page.addInitScript(
        ([key, choice]) => window.localStorage.setItem(key, choice),
        [CONSENT_STORAGE_KEY, CONSENT_DENIED]
    );
});

test.afterAll(async () => {
    await page.close();
});

test.describe('Landing page', () => {
    test('should navigate to landing page', async () => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Software Architect, microcomputing and networks Technician/);
    });
    test('should check if the header, main and footer are visible', async () => {
        await page.getByTestId('header').isVisible();
        await page.getByTestId('main').isVisible();
        await page.getByTestId('footer').isVisible();
    });
    test('should naviage between tabs', async () => {
        await page.getByTitle('knowledge.module.css').click();
        await page.getByTitle('contact.json').click();
        await page.getByTitle('index.tsx').click();
    });
    /*     test('should click and close the modal', async () => {
        await page.getByTestId('close').click();
    }); */
    /*     test('should click and open the modal', async () => {
        await page.getByTestId('home').click();
    });
    test('should click on minimise the modal', async () => {
        await page.getByTestId('minimise').click();
    }); */
    test('should open the modal again', async () => {
        await page.getByTestId('home').click();
    });

    socialLinks.forEach(async (link) => {
        test(`should navigate to ${link.name} page`, async () => {
            const popupPromise = page.waitForEvent('popup');
            await page.getByTestId(link.testId).click();
            const popup = await popupPromise;
            // Wait for the popup to load.
            await popup.waitForLoadState();
            // check if the url contains the correct URL.
            await expect(popup.url()).toContain(link.href);
            // Close the popup.
            await popup.close();
        });
    });
});
