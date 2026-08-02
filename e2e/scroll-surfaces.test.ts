import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/**
 * SDD-L12-T1. The regression net for the scroll-surface work.
 *
 * Two separate defects are asserted here, because they have separate causes and separate fixes.
 *
 * 1. **The header does not fit.** Measured on `master` @ `4d1d898`, its content needed 1526 px at
 *    every viewport: 246 px unreachable on a 1280 px laptop, 1151 px on a phone. The widgets past
 *    the fold could only be reached by dragging horizontally inside a 24-pixel-tall strip.
 *
 *    L12-T2 first removed the five artifact links, which fixed 1280 and 1920 and left 768 and 375
 *    still overflowing — the remaining width was widgets, not links. L12-T8 replaced that approach
 *    with the layout the design was reaching for: three zones, status items as icons on the right,
 *    and priority-based shedding below 1023 px and 768 px, the way a macOS menu bar behaves. The
 *    links came back. All four viewports are asserted, none skipped.
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

/**
 * One route per surface that owns a scroller: the home window, the blog (body + article controls)
 * and a legal document. `/blog` rather than a single post, so the check does not depend on a slug
 * surviving a future content edit.
 */
const SCROLLER_ROUTES = ['/', '/blog', '/legal/privacy-policy'];

const VIEWPORTS = [
    { width: 375, height: 812, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'laptop' },
    { width: 1920, height: 1080, name: 'desktop' },
];

/**
 * Measures the *bar*, not the scroll box.
 *
 * `header.scrollWidth` looked like the obvious metric and is the wrong one: the weather popover is a
 * 400 px absolutely-positioned child, and a closed popover still has a box, so scrollWidth read
 * `clientWidth + 440` at 1024, 1280 and 1920 alike — a constant offset that says "a positioned child
 * hangs off the edge", not "the menu bar does not fit". Popovers are supposed to escape a menu bar.
 *
 * What actually matters is that the three zones fit inside the header and do not run into each
 * other, so that is what is measured.
 */
const readHeaderZones = (page: Page) =>
    page.evaluate(() => {
        const header = document.querySelector('header');
        if (!header) throw new Error('no <header> in the document');

        const bounds = header.getBoundingClientRect();
        const zone = (selector: string) => {
            const element = header.querySelector(selector);
            if (!element || getComputedStyle(element).display === 'none') return null;
            const rect = element.getBoundingClientRect();
            return { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
        };

        return {
            headerLeft: Math.round(bounds.left),
            headerRight: Math.round(bounds.right),
            left: zone('[class*="left"]'),
            center: zone('[class*="center"]'),
            right: zone('[class*="right"]'),
            visibleLinks: [...header.querySelectorAll('nav a')].filter(
                (link) => getComputedStyle(link).display !== 'none',
            ).length,
        };
    });

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
        test(`header fits without horizontal scrolling at ${viewport.width}px (${viewport.name})`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');
            await expect(page.getByTestId('header')).toBeVisible();
            await waitForStableHeader(page);

            const zones = await readHeaderZones(page);
            const describe = JSON.stringify(zones);

            expect(zones.left, `no left zone at ${viewport.width}px: ${describe}`).not.toBeNull();
            expect(zones.right, `no right zone at ${viewport.width}px: ${describe}`).not.toBeNull();

            expect(
                zones.right!.right,
                `the status items run past the right edge of the bar at ${viewport.width}px: ${describe}`,
            ).toBeLessThanOrEqual(zones.headerRight);

            expect(
                zones.left!.left,
                `the app identity starts before the left edge at ${viewport.width}px: ${describe}`,
            ).toBeGreaterThanOrEqual(zones.headerLeft);

            // The middle zone is the one that collides first when the two sides grow. Below 768px it
            // is deliberately not rendered.
            //
            // Both neighbours are asserted. The first version of this test only checked the left
            // side, and the countdown was covering the last three status icons on the right the
            // whole time — `elementFromPoint` over the coverage, e2e and Lighthouse links returned
            // the countdown, so three links were unclickable and this suite said nothing.
            if (zones.center) {
                expect(
                    zones.center.left,
                    `the countdown overlaps the app identity at ${viewport.width}px: ${describe}`,
                ).toBeGreaterThanOrEqual(zones.left!.right);

                expect(
                    zones.center.right,
                    `the countdown overlaps the status items at ${viewport.width}px: ${describe}`,
                ).toBeLessThanOrEqual(zones.right!.left);
            }
        });

        test(`every status item is clickable at ${viewport.width}px (${viewport.name})`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');
            await expect(page.getByTestId('header')).toBeVisible();
            await waitForStableHeader(page);

            /**
             * Geometry alone is not enough: an element can be inside the bar and still be covered by
             * something painted over it. This asks the browser what is actually on top at each
             * icon's centre — the check that would have caught the countdown overlap immediately.
             */
            const covered = await page.evaluate(() => {
                const header = document.querySelector('header');
                if (!header) throw new Error('no <header> in the document');

                return [...header.querySelectorAll('nav a')]
                    .filter((link) => getComputedStyle(link).display !== 'none')
                    .map((link) => {
                        const rect = link.getBoundingClientRect();
                        const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
                        const reachable = top === link || link.contains(top);
                        return reachable
                            ? null
                            : `${(link as HTMLElement).dataset.testid} is covered by ` +
                                  `${top?.tagName.toLowerCase()}.${String(top?.className).slice(0, 40)}`;
                    })
                    .filter(Boolean);
            });

            expect(covered, `status items are not reachable: ${covered.join(' | ')}`).toEqual([]);
        });
    }

    /**
     * L12-T3/T4. This shipped as `test.fail()` while the defect existed: the suite stayed green, and
     * the moment T3 changed `scroll` to `auto` Playwright reported "expected to fail, but passed" —
     * which is how the marker got removed instead of forgotten.
     *
     * The routes are the ones that own the remaining scrollers: the blog body and the article
     * controls (T4), and the legal document surface (T4). Checking only `/` would have declared the
     * sweep done while three untouched `overflow: scroll` rules were still live one route away.
     */
    for (const route of SCROLLER_ROUTES) {
        test(`no element paints a scrollbar it does not need on ${route}`, async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 720 });
            await page.goto(route);
            await expect(page.getByTestId('header')).toBeVisible();
            await waitForStableHeader(page);

            const gratuitous = await page.evaluate(() =>
                [...document.querySelectorAll('*')]
                    .filter((element) => {
                        const style = getComputedStyle(element);
                        if (style.overflowX !== 'scroll' && style.overflowY !== 'scroll') return false;
                        return (
                            element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight
                        );
                    })
                    .map((element) => `${element.tagName.toLowerCase()}.${element.className}`),
            );

            expect(gratuitous, `these declare overflow: scroll but never overflow: ${gratuitous.join(', ')}`).toEqual(
                [],
            );
        });
    }

    /**
     * The other half of T4: proving the sweep removed bars without removing *scrolling*. `auto` and
     * `scroll` differ only in whether the bar is painted when there is nothing to scroll, so this
     * should hold by construction — but "should hold by construction" is exactly the claim that
     * earns a test, and the article body is the surface a reader would notice losing.
     */
    test('the article body still scrolls after the sweep', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/blog');
        await expect(page.getByTestId('header')).toBeVisible();

        const body = page.locator('[class*="blog_body"]').first();
        await expect(body).toBeVisible();

        const scrolled = await body.evaluate((element) => {
            const overflows = element.scrollHeight > element.clientHeight;
            element.scrollTop = 300;
            return { overflows, scrollTop: element.scrollTop, overflowY: getComputedStyle(element).overflowY };
        });

        expect(scrolled.overflowY, 'the article body must stay a scroller').toBe('auto');
        expect(scrolled.overflows, 'a full post should be taller than its pinned container').toBe(true);
        expect(scrolled.scrollTop, 'setting scrollTop must actually move the body').toBeGreaterThan(0);
    });
});
