import { expect, test } from '@playwright/test';
import { CAPTURE_TARGETS, LOCALES, type Locale, REDIRECT_TARGETS, localisedPath } from './targets';
import { type Theme, gotoAndSettle, prepareDeterministicPage } from './support';

/**
 * @description The visual baseline. Each Playwright project sweeps one axis — locale, theme or
 * viewport — across every rendering screen; the axes are configured in `playwright.config.ts` and
 * read from `project.metadata` here, so adding an axis is a config change rather than a new file.
 *
 * One test per screen *and* locale, rather than a loop inside one test. A failure then names the
 * exact capture, and a red `es` does not stop `gl` from being captured in the same run — which
 * matters most on the run that establishes the baseline.
 */

type VisualAxis = {
    readonly locales: readonly Locale[];
    readonly theme: Theme;
};

function axisFor(metadata: unknown): VisualAxis {
    const axis = metadata as Partial<VisualAxis> | undefined;

    if (!axis?.locales?.length || !axis.theme) {
        throw new Error(
            'This project has no visual axis metadata. Visual specs must run under one of the ' +
                '`visual-*` projects defined in playwright.config.ts.'
        );
    }

    return { locales: axis.locales, theme: axis.theme };
}

test.describe('visual baseline', () => {
    test.beforeEach(async ({ page }) => {
        await prepareDeterministicPage(page);
    });

    for (const target of CAPTURE_TARGETS) {
        for (const locale of LOCALES) {
            test(`${target.name} · ${locale}`, async ({ page }, testInfo) => {
                const { locales, theme } = axisFor(testInfo.project.metadata);

                // Every project declares all three locales as tests and skips the ones outside its
                // axis, so the skipped entries in the report spell out the matrix instead of
                // leaving it implicit in the config.
                test.skip(!locales.includes(locale), `${locale} is not on this project's axis`);

                await gotoAndSettle(page, locale, target.path(locale), theme);

                await expect(page).toHaveScreenshot(`${target.name}-${locale}.png`, {
                    fullPage: true,
                    animations: 'disabled',
                    // Zero tolerance on purpose. A suite that accepts "nearly identical" cannot
                    // answer the question this change exists to answer.
                    maxDiffPixelRatio: 0,
                });
            });
        }
    }

    /**
     * `/blog` and `/blog/<category>` render nothing — both are `() => null` with a
     * `getServerSideProps` redirect to the newest post. Photographing them would follow the
     * redirect and pin whichever post is newest, so publishing would move two baselines. The
     * destination is asserted by shape instead.
     */
    for (const target of REDIRECT_TARGETS) {
        for (const locale of LOCALES) {
            test(`${target.name} redirects · ${locale}`, async ({ page }, testInfo) => {
                const { locales } = axisFor(testInfo.project.metadata);

                // Same reason as the captures above: each project declares all three locales and
                // skips the ones off its axis, so the report spells the matrix out rather than
                // leaving it implicit in the config. Nothing here is disabled or unfinished.
                test.skip(!locales.includes(locale), `${locale} is not on this project's axis`);

                const response = await page.request.get(localisedPath(locale, target.path), {
                    maxRedirects: 0,
                });

                expect(response.status(), `${target.path} in ${locale}`).toBeGreaterThanOrEqual(300);
                expect(response.status(), `${target.path} in ${locale}`).toBeLessThan(400);

                const location = response.headers()['location'];
                expect(location, `${target.path} in ${locale} has no Location header`).toBeTruthy();
                // The base only matters for parsing a relative Location; an absolute one ignores it.
                expect(new URL(location ?? '', 'http://localhost').pathname).toMatch(
                    target.destination(locale)
                );
            });
        }
    }
});
