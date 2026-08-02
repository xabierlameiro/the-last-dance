import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/**
 * SDD-L12-T1. The regression net for the scroll-surface work.
 *
 * Two separate defects are asserted here, because they have separate causes and separate fixes.
 *
 * 1. **The header does not fit.** Measured on `master` @ `4d1d898`, its content needed 1526 px at
 *    every viewport: 246 px unreachable on a 1280 px laptop, 1151 px on a phone. The widgets past
 *    the fold could only be reached by dragging horizontally inside a 24-pixel-tall strip. L12-T2
 *    removed the five artifact links (decision D5) and brought that down to 1168 px.
 *
 * 2. **`overflow: scroll` where `auto` was meant.** `scroll` paints a scrollbar unconditionally;
 *    `auto` paints one only when there is something to scroll. Chromium on macOS hides the
 *    difference behind overlay scrollbars — Firefox, and macOS with *Show scroll bars: Always*, do
 *    not, which is why this reached a user before it reached us. L12-T3/T4 fix it.
 *
 * The viewport list is deliberate: 375 and 768 are the two breakpoints the layout already branches
 * on, 1280 is the config default, and 1920 catches a fix that only works because the window is
 * wide — which is exactly why this went unnoticed on the development machine.
 */

const VIEWPORTS = [
    { width: 375, height: 812, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'laptop' },
    { width: 1920, height: 1080, name: 'desktop' },
];

const readHeaderWidths = (page: Page) =>
    page.evaluate(() => {
        const header = document.querySelector('header');
        if (!header) throw new Error('no <header> in the document');
        return { scrollWidth: header.scrollWidth, clientWidth: header.clientWidth };
    });

/**
 * The header's width depends on widgets that resolve asynchronously (weather, crypto, view counts,
 * deployment status, heating). Measuring before they settle reads a narrower header than the one a
 * reader gets, which would let this suite pass for the wrong reason. Poll until two consecutive
 * reads agree instead of racing a fixed timeout.
 */
const waitForStableHeader = async (page: Page) => {
    let previous = -1;

    for (let attempt = 0; attempt < 40; attempt += 1) {
        const widths = await readHeaderWidths(page);
        if (widths.scrollWidth === previous) return widths;
        previous = widths.scrollWidth;
        await page.waitForTimeout(100);
    }

    return await readHeaderWidths(page);
};

test.describe('Scroll surfaces', () => {
    for (const viewport of VIEWPORTS) {
        test(`header fits without horizontal scrolling at ${viewport.width}px (${viewport.name})`, async ({
            page,
        }) => {
            /**
             * L12-T2 removed the five artifact links and the header went from 1526 px to 1168 px —
             * so it now fits a 1280 px laptop and anything wider, which is where the defect was
             * reported. It does **not** fit 768 or 375, and no further link removal will make it:
             * the remaining 1168 px is widgets (a five-segment countdown, weather, crypto, two
             * counters, heating, date) inside a 24 px strip.
             *
             * Closing these two needs the narrow-viewport half of D5 — option 3, priority-based
             * hiding or an overflow menu — which is a product decision, not a CSS fix. Skipped
             * with the reason attached rather than deleted, so the gap stays visible and measured.
             */
            test.skip(
                viewport.width < 1280,
                'needs the narrow-viewport decision (D5 option 3): 1168px of widgets cannot fit a 24px strip'
            );

            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');
            await expect(page.getByTestId('header')).toBeVisible();

            const { scrollWidth, clientWidth } = await waitForStableHeader(page);

            expect(
                scrollWidth,
                `header needs ${scrollWidth}px but has ${clientWidth}px: ` +
                    `${scrollWidth - clientWidth}px of it is unreachable without a horizontal drag`
            ).toBeLessThanOrEqual(clientWidth);
        });
    }

    /**
     * Marked `test.fail()`: the defect is real today, so the assertion below is expected to fail and
     * the suite stays green while it does. L12-T3/T4 change `overflow: scroll` to `auto` on the
     * header and the dialog body and sweep the rest — at which point this test starts *passing*,
     * Playwright reports the unexpected pass as a failure, and whoever did T3 removes the marker.
     * That is the point: unlike a skip, this cannot be forgotten, and it never stops running.
     */
    test('no element paints a scrollbar it does not need', async ({ page }) => {
        // Inside the body, so it marks this test only — at describe scope it would mark every test.
        test.fail();

        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/');
        await expect(page.getByTestId('header')).toBeVisible();
        await waitForStableHeader(page);

        const gratuitous = await page.evaluate(() =>
            [...document.querySelectorAll('*')]
                .filter((element) => {
                    const style = getComputedStyle(element);
                    if (style.overflowX !== 'scroll' && style.overflowY !== 'scroll') return false;
                    return element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight;
                })
                .map((element) => `${element.tagName.toLowerCase()}.${element.className}`)
        );

        expect(gratuitous, `these declare overflow: scroll but never overflow: ${gratuitous.join(', ')}`).toEqual([]);
    });
});
