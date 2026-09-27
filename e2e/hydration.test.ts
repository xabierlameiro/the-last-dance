import { expect, test } from './fixtures';

/**
 * Chromium ships no Galician locale data: `Intl.DateTimeFormat.supportedLocalesOf(['gl'])` is empty
 * there, so anything formatted for `gl` comes out in the browser's own language. Node has the data.
 * The server wrote `3 de feb. de 2023`, the browser hydrated `Feb 3, 2023`, and React threw #418 on
 * every Galician page that prints a date or a number above 999.
 *
 * Two browser languages, because the fallback is the browser's and a fix that only agrees with one
 * of them is not a fix. The unit suite cannot see any of this: jsdom formats with Node's data.
 */
const GALICIAN_PAGES = ['/gl/blog/nextjs/tema-escuro', '/gl/next-leak', '/gl/next-coverage'];

for (const browserLocale of ['en-US', 'es-ES']) {
    test.describe(`Galician pages in a ${browserLocale} browser`, () => {
        test.use({ locale: browserLocale });

        for (const path of GALICIAN_PAGES) {
            test(`should hydrate ${path} without a page error`, async ({ page }) => {
                const errors: string[] = [];
                page.on('pageerror', (error) => errors.push(error.message));

                await page.goto(path);
                // The clock resolves in an effect, so by then hydration has either passed or thrown.
                await expect(page.locator('[class*="dateAndHour"]')).not.toHaveAttribute('data-pending');

                expect(errors).toEqual([]);
            });
        }

        test('should keep the date the server rendered under the post title', async ({ page, request }) => {
            const path = '/gl/blog/nextjs/tema-escuro';
            const html = await (await request.get(path)).text();
            const served = /<time[^>]*>([^<]+)<\/time>/.exec(html)?.[1];

            await page.goto(path);
            await expect(page.locator('[class*="dateAndHour"]')).not.toHaveAttribute('data-pending');

            expect(served).toBe('3 de feb. de 2023');
            await expect(page.locator('time').first()).toHaveText('3 de feb. de 2023');
        });
    });
}
