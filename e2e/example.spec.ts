import { Page, test, expect } from '@playwright/test';
import { socialLinks } from '@/constants/site';

// You can override some options for a file or describe block.
// test.use({
//     headless: false,
//     launchOptions: {
//         slowMo: 200,
//     },
// });

let page: Page;

test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({});
});

test.describe('Landing page', () => {
    test('should navigate to landing page', async () => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Front end developer, microcomputing and networks Technician/);
    });
    test('should check if the header, main and footer are visible', async () => {
        await page.getByTestId('header').isVisible();
        await page.getByTestId('main').isVisible();
        await page.getByTestId('footer').isVisible();
    });

    test('should show tooltips when user does hover on icons', async () => {
        let target = page.getByTestId('countdown');
        await target.hover();
        await expect(target.locator('..')).toHaveAttribute('data-state', 'open');
        target = page.getByTestId('crypto-price');
        await target.hover();
        await expect(target.locator('..')).toHaveAttribute('data-state', 'open');
        target = page.getByTestId('indexed-counter');
        await target.hover();
        await expect(target.locator('..')).toHaveAttribute('data-state', 'open');
        target = page.getByTestId('views');
        await target.hover();
        await expect(target.locator('..')).toHaveAttribute('data-state', 'open');
        target = page.getByTestId('new-users');
        await target.hover();
        await expect(target.locator('..')).toHaveAttribute('data-state', 'open');
        target = page.getByTestId('heating');
        await target.hover();
        await expect(target.locator('..')).toHaveAttribute('data-state', 'open');
    });

    test('should naviage between tabs', async () => {
        await page.getByTitle('knowledge.module.css').click();
        await page.getByTitle('contact.json').click();
        await page.getByTitle('index.tsx').click();
    });
    test('should click and close the modal', async () => {
        await page.getByTestId('close').click();
    });
    test('should click and open the modal', async () => {
        await page.getByTestId('home').click();
    });
    test('should click on minimise the modal', async () => {
        await page.getByTestId('minimise').click();
    });
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
