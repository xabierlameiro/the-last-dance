import type { Page, Route } from '@playwright/test';
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
 *    with three zones and priority-based shedding, the way a macOS menu bar behaves, and the links
 *    came back. L12-T9 then moved the link icons into the LEFT zone, beside the identity, and put
 *    the status values on a fixed pitch.
 *
 *    T9 is why the widths in `VIEWPORTS` all changed. With the icons on the left the left zone is
 *    320 px rather than 66 px, so it can now reach the centred countdown too — `W >= 2 * (zone +
 *    103)` has to hold for *both* sides, and every breakpoint was re-derived against the wider of
 *    the two. A ladder that watches one side is how the bar ended up drawn over itself at 1024 px.
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

/**
 * Both sides of every shedding breakpoint, plus the three ordinary sizes.
 *
 * The first version of this list held four round numbers — 375, 768, 1280, 1920 — and passed while
 * the bar was visibly broken at 1024, because that width sits just above a breakpoint where every
 * widget was still rendered in a window too narrow to hold them. A breakpoint is precisely where a
 * layout changes behaviour, so it is precisely where it has to be measured: one pixel below and one
 * above each.
 */
const VIEWPORTS = [
    { width: 375, height: 812, name: 'mobile' },
    { width: 479, height: 812, name: 'below profile icons' },
    { width: 480, height: 812, name: 'profile icons appear' },
    { width: 768, height: 1024, name: 'tablet, no countdown' },
    { width: 769, height: 1024, name: 'tablet, countdown appears' },
    { width: 869, height: 800, name: 'below artifact icons' },
    { width: 870, height: 800, name: 'artifact icons appear' },
    { width: 939, height: 800, name: 'below crypto' },
    { width: 940, height: 800, name: 'crypto appears' },
    { width: 1024, height: 800, name: 'small laptop' },
    { width: 1179, height: 800, name: 'below heating' },
    { width: 1180, height: 800, name: 'heating appears' },
    { width: 1280, height: 720, name: 'laptop' },
    { width: 1549, height: 800, name: 'below views and users' },
    { width: 1550, height: 800, name: 'views and users appear' },
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 2000, height: 1080, name: 'wide desktop, the width the defect was reported at' },
];

/**
 * SDD-L12-T9/T10. Every width a status slot is allowed to have.
 *
 * T8 sized the slots with `auto` tracks, so each was as wide as whatever its widget happened to be
 * showing, and the row read as randomly spaced. T9 made them fixed but gave them all ONE width,
 * which broke the two widgets that render two values each: the view counter (page views AND new
 * users, an icon on each) wants 166px and had 96, so 69px vanished off its left edge in production.
 *
 * Pinning the numbers means a future `auto`, a stray `gap`, or a widget growing a second value fails
 * as a test rather than as a screenshot a month later.
 */
const SLOT_WIDTHS = { deploymentDot: 24, value: 96, views: 184, heating: 120, clock: 140 };

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

        /**
         * The right zone is a `1fr` grid track that starts right after the identity, while its
         * contents are pushed to the end with `justify-content: end`. Measuring the track says the
         * status items begin at x=104 on a 1280px window, which is not where anything is painted —
         * an overlap check against that reads as a collision at every width. So the *content* box is
         * what gets measured: the union of the visible children.
         */
        const contentBox = (selector: string) => {
            const container = header.querySelector(selector);
            if (!container) return null;
            const visible = [...container.children].filter(
                (child) => getComputedStyle(child).display !== 'none' && child.getBoundingClientRect().width > 0,
            );
            if (visible.length === 0) return null;
            const rects = visible.map((child) => child.getBoundingClientRect());
            const left = Math.min(...rects.map((rect) => rect.left));
            const right = Math.max(...rects.map((rect) => rect.right));
            return { left: Math.round(left), right: Math.round(right), width: Math.round(right - left) };
        };

        return {
            headerLeft: Math.round(bounds.left),
            headerRight: Math.round(bounds.right),
            left: zone('[class*="left"]'),
            center: zone('[class*="center"]'),
            right: contentBox('[class*="right"]'),
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

/**
 * SDD-L12-T10. Waits for the status widgets' **contents** to settle, which is a different question
 * from `waitForStableHeader` and now the only useful one.
 *
 * That helper watches `header.scrollWidth`. It worked while the slots were `auto`, because a widget
 * resolving made the bar wider. Fixed slots removed exactly that signal: the header's width is a
 * constant from first paint, so the poll agrees with itself immediately and returns while widgets are
 * still loading. Measured mid-load, the deployment indicator reported 3px of overflow at one viewport
 * and none at another — the same page, two answers, which is how a flaky test is born.
 *
 * So poll what actually moves: every slot's content box, until two consecutive reads agree.
 */
const readStatusSignature = (page: Page) =>
    page.evaluate(() => {
        const zone = document.querySelector('header [class*="right"]');
        if (!zone) return '';

        const parts: string[] = [];
        for (const slot of [...zone.children]) {
            const rects = [...slot.querySelectorAll('*')].map((node) => node.getBoundingClientRect());
            if (rects.length === 0) {
                parts.push('empty');
                continue;
            }
            const left = Math.round(Math.min(...rects.map((rect) => rect.left)));
            const right = Math.round(Math.max(...rects.map((rect) => rect.right)));
            parts.push(`${left}-${right}`);
        }
        return parts.join('|');
    });

const waitForStableStatusContent = async (page: Page) => {
    let previous = '';

    for (let attempt = 0; attempt < 60; attempt += 1) {
        const signature = await readStatusSignature(page);
        if (signature !== '' && signature === previous) return signature;
        previous = signature;
        await page.waitForTimeout(150);
    }

    return previous;
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

            // The countdown is centred on the window and the sides must stay out of its band. Both
            // neighbours are asserted: the first version of this test only checked the left, and the
            // countdown was covering the last three status icons on the right the whole time.
            //
            // Below 769px there is deliberately no countdown — the owner's call, and the arithmetic
            // agrees that nothing would fit.
            if (viewport.width > 768) {
                expect(
                    zones.center,
                    `the countdown should be rendered at ${viewport.width}px: ${describe}`,
                ).not.toBeNull();

                expect(
                    zones.center!.left,
                    `the countdown overlaps the app identity at ${viewport.width}px: ${describe}`,
                ).toBeGreaterThanOrEqual(zones.left!.right);

                expect(
                    zones.center!.right,
                    `the countdown overlaps the status items at ${viewport.width}px: ${describe}`,
                ).toBeLessThanOrEqual(zones.right!.left);

                // Centred on the window, not on the leftover space: that is the whole point of
                // positioning it, so it is worth asserting rather than assuming. 2px of tolerance
                // for sub-pixel rounding.
                const centreOfWindow = viewport.width / 2;
                const centreOfCountdown = (zones.center!.left + zones.center!.right) / 2;
                expect(
                    Math.abs(centreOfCountdown - centreOfWindow),
                    `the countdown is off-centre at ${viewport.width}px: ${describe}`,
                ).toBeLessThanOrEqual(2);
            } else {
                expect(zones.center, `no countdown below 769px: ${describe}`).toBeNull();
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
     * L12-T9. The owner's report was "each one takes a random amount of space, and they should be
     * stuck to the right". Both halves are asserted, because they have different causes: the pitch
     * comes from the fixed slot widths, and the flush edge from the zone's own alignment.
     *
     * Measured at two widths so the claim is not an artefact of one: at 1280 the crypto slot is shed
     * and at 1920 it is not, so the check sees a different number of slots each time.
     */
    for (const width of [1280, 1920]) {
        test(`the status items keep a fixed pitch, flush to the bar edge at ${width}px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 800 });
            await page.goto('/');
            await expect(page.getByTestId('header')).toBeVisible();
            await waitForStableHeader(page);

            const layout = await page.evaluate(() => {
                const header = document.querySelector('header');
                if (!header) throw new Error('no <header> in the document');
                const right = header.querySelector('[class*="right"]');
                if (!right) throw new Error('no right zone in the header');

                const bounds = header.getBoundingClientRect();
                const style = getComputedStyle(header);
                const slots = [...right.children]
                    .filter((child) => getComputedStyle(child).display !== 'none')
                    .map((child) => ({
                        width: Math.round(child.getBoundingClientRect().width),
                        right: Math.round(child.getBoundingClientRect().right),
                    }));

                return {
                    slots,
                    paddingLeft: Math.round(parseFloat(style.paddingLeft)),
                    trailingGap: slots.length
                        ? Math.round(bounds.right - slots[slots.length - 1].right)
                        : Number.NaN,
                };
            });

            const describe = JSON.stringify(layout);
            const allowed = Object.values(SLOT_WIDTHS);

            expect(layout.slots.length, `no status items at ${width}px: ${describe}`).toBeGreaterThan(1);

            for (const slot of layout.slots) {
                expect(allowed, `a status slot is ${slot.width}px, which is not a fixed slot: ${describe}`).toContain(
                    slot.width,
                );
            }

            // Flush right: the gap left after the last slot is the bar's own padding, the same
            // number as on the identity side. Anything else is the zone drifting off the edge.
            expect(
                layout.trailingGap,
                `the status items are not flush to the bar's right edge at ${width}px: ${describe}`,
            ).toBe(layout.paddingLeft);
        });
    }

    /**
     * SDD-L12-T10. No status widget may be clipped by its own slot.
     *
     * This is the check that was missing, and its absence is why a 69px-wide hole in the view counter
     * shipped. The obvious test — `scrollWidth > clientWidth` — **cannot see this defect**: the slots
     * are `justify-content: flex-end`, so content that does not fit escapes towards the inline-START
     * edge, and `scrollWidth` only measures overflow past the inline-END edge. The clipped slot
     * reported `scrollWidth === clientWidth === 96` and read as perfectly healthy.
     *
     * So compare boxes instead: the content's own bounding box against the slot's, on both sides.
     *
     * Absolutely-positioned descendants are excluded, because escaping the bar is their job — the
     * clock's weather popover is 400px wide and anchored to it, and counting it would report every
     * run as a failure. That exclusion is also why measuring `header.scrollWidth` was abandoned.
     *
     * 2000px is included deliberately: that is the width the defect was reported at, and every
     * narrower viewport hides the view counter behind a shedding breakpoint.
     */
    test.describe('with the widgets serving worst-case values', () => {
        /**
         * `bypassCSP` is required, and finding out why cost a red CI run.
         *
         * The hooks build their URL from `NEXT_PUBLIC_DOMAIN`. That is `localhost:3000` on a
         * developer machine, so the fetch is same-origin and everything works. CI injects the real
         * domain from secrets while still serving the build on localhost, so the page asks for
         * `https://xabierlameiro.com/api/analytics` — and the site's own `connect-src` refuses it.
         * The request is blocked in the renderer **before it becomes a network request**, so
         * `page.route` never sees it (`0` interceptions, measured) and no amount of CORS headers on
         * the mocked response helps. The widget falls back to its error state and the assertion
         * fails on an empty string.
         *
         * So the CSP is lifted for these two tests only. They measure slot geometry, not the
         * site's connection policy — which the security headers in `next.config.ts` cover.
         */
        test.use({ bypassCSP: true });

        for (const width of [1550, 2000]) {
            test(`no status widget is clipped by its slot at ${width}px`, async ({ page }) => {
                /**
                 * The values are mocked, and that is not a convenience — it is what makes this a
                 * test. Neither this machine nor CI has Google Analytics or Ariston credentials, so
                 * both render an error glyph roughly 15px wide, which fits any slot. Measured
                 * against a failure state the check passes while the widget is unreadable in
                 * production, which is precisely the hole the reported defect fell through.
                 *
                 * `access-control-allow-origin` covers the cross-origin half: with the CSP lifted
                 * the request does go out, and on CI it goes to another origin.
                 */
                const mock = (json: object) => (route: Route) =>
                    route.fulfill({ json, headers: { 'access-control-allow-origin': '*' } });

                await page.route('**/api/analytics*', mock({ pageViews: 999999, newUsers: 888888 }));
                await page.route('**/api/heating*', mock({ outsideTemp: -12.5, zoneMeasuredTemp: 100.5 }));

                await page.setViewportSize({ width, height: 900 });
                await page.goto('/');
                await expect(page.getByTestId('header')).toBeVisible();
                await expect(page.getByTestId('views')).toContainText('999999');
                await waitForStableStatusContent(page);

                const clipped = await page.evaluate(() => {
                    const header = document.querySelector('header');
                    if (!header) throw new Error('no <header> in the document');
                    const right = header.querySelector('[class*="right"]');
                    if (!right) throw new Error('no right zone in the header');

                    return [...right.children]
                        .filter((slot) => getComputedStyle(slot).display !== 'none')
                        .map((slot) => {
                            const box = slot.getBoundingClientRect();
                            /**
                             * Excluding nodes that are themselves absolute is not enough: the weather
                             * popover is absolute, but its contents are static children of it, so they
                             * pass that filter and drag the measurement 457px past the clock. Walk up to
                             * the slot and drop anything with a positioned ancestor.
                             */
                            const escapes = (node: Element) => {
                                for (let el: Element | null = node; el && el !== slot; el = el.parentElement) {
                                    const position = getComputedStyle(el).position;
                                    if (position === 'absolute' || position === 'fixed') return true;
                                }
                                return false;
                            };

                            const laidOut = [...slot.querySelectorAll('*')].filter((node) => {
                                if (getComputedStyle(node).display === 'none' || escapes(node)) return false;
                                const rect = node.getBoundingClientRect();
                                return rect.width > 0 && rect.height > 0;
                            });
                            if (laidOut.length === 0) return null;

                            const rects = laidOut.map((node) => node.getBoundingClientRect());
                            const lostLeft = Math.round(box.left - Math.min(...rects.map((rect) => rect.left)));
                            const lostRight = Math.round(Math.max(...rects.map((rect) => rect.right)) - box.right);
                            if (lostLeft <= 1 && lostRight <= 1) return null;

                            return (
                                `${(slot.className.match(/header_(\w+?)__/) || [])[1] || slot.className}` +
                                ` (${Math.round(box.width)}px slot, "${(slot.textContent || '').trim().slice(0, 20)}")` +
                                ` loses ${lostLeft > 1 ? lostLeft + 'px off its left' : ''}` +
                                `${lostLeft > 1 && lostRight > 1 ? ' and ' : ''}` +
                                `${lostRight > 1 ? lostRight + 'px off its right' : ''}`
                            );
                        })
                        .filter(Boolean);
                });

                expect(clipped, `status widgets clipped at ${width}px: ${clipped.join(' | ')}`).toEqual([]);
            });
        }
    });

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
