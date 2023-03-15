import { Page, test, expect } from '@playwright/test';

// You can override some options for a file or describe block.
// test.use({
//     headless: false,
//     launchOptions: {
//         slowMo: 1000,
//     },
// });

let page: Page;

test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({});
});

test('Landing page - Full validation', async () => {
    // Just navigate to landing page
    await page.goto('/');
    // Check the title
    await expect(page).toHaveTitle(/Front end developer, microcomputing and networks Technician/);
    // check if the header, main and footer are visible
    await page.getByTestId('header').isVisible();
    await page.getByTestId('main').isVisible();
    await page.getByTestId('footer').isVisible();

    // Naviage between tabs
    await page.getByTitle('knowledge.module.css').click();
    await page.getByTitle('contact.json').click();
    await page.getByTitle('index.tsx').click();

    // Click and close the modal
    await page.getByTestId('close').click();
    // Click and open the modal
    await page.getByTestId('home').click();
    // Click on minimise and close the modal
    await page.getByTestId('minimise').click();
    // Click and open the modal
    await page.getByTestId('home').click();
});
