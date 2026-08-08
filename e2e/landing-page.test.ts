import { socialLinks } from '@/constants/site';
import en from '../src/intl/messages/en';
import { expect, test } from './fixtures';

/**
 * SDD-L10, T1 + T2. This suite could not fail.
 *
 * Of its tests, exactly two contained a real assertion. Three called `.isVisible()` and awaited the
 * boolean without asserting it — `locator.isVisible()` resolves to true or false and never throws,
 * so the test passed whether the element was there or not. Three more called `.click()` with no
 * post-condition: a click that navigated nowhere, or hit the wrong element, was indistinguishable
 * from one that worked. Two were commented out entirely.
 *
 * Writing the assertions found things the old suite could not have. The `<footer>` has **zero
 * height** — its only child is the Dock, which is `position: fixed` — so a naive `toBeVisible()` on
 * it fails; the old `.isVisible()` returned `false` there and the result was discarded. And the two
 * commented-out tests named a `close` control that does not exist on `/`: the home page's `Dialog`
 * is rendered with no `header`, so it has no `ControlButtons` and that window cannot be closed at
 * all. They are not restored, because there is nothing there to restore them to.
 */
test.describe('Landing page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    /*
     * Asserted against the message catalogue rather than a copied literal. The previous version
     * inlined the title text, so when #184 rewrote it for the SERP the assertion kept checking a
     * string the site no longer served and the suite went red on master — a test failing for the one
     * reason a test should never fail, that the copy it duplicated moved on without it. Reading the
     * value from the same place the page reads it keeps the check ("the home renders its SEO title")
     * while removing the duplication that made it brittle.
     */
    test('should navigate to landing page', async ({ page }) => {
        await expect(page).toHaveTitle(en['home.seo.title']);
    });

    /**
     * `expect(locator).toBeVisible()` auto-retries until the timeout and throws on failure;
     * `locator.isVisible()` returns a boolean immediately. The old version awaited the second and
     * discarded it, which is the difference between a test and a statement.
     *
     * The footer is asserted attached rather than visible: it is a zero-height wrapper around a
     * fixed-position Dock, so "visible" is the wrong question to ask of it. The Dock is the thing a
     * reader can actually see and use, so that is what is asserted.
     */
    test('should render the three landmarks', async ({ page }) => {
        await expect(page.getByTestId('header')).toBeVisible();
        await expect(page.getByTestId('main')).toBeVisible();
        await expect(page.getByTestId('footer')).toBeAttached();
        await expect(page.getByTestId('dock')).toBeVisible();
    });

    test('should switch between the editor tabs', async ({ page }) => {
        // Code Hike marks the active tab with a class, not aria-current — asserted against what the
        // markup actually does rather than what it ought to.
        const knowledge = page.getByTitle('knowledge.module.css');
        const index = page.getByTitle('index.tsx');

        await knowledge.click();
        await expect(knowledge).toHaveClass(/ch-editor-tab-active/);
        await expect(index).not.toHaveClass(/ch-editor-tab-active/);

        await index.click();
        await expect(index).toHaveClass(/ch-editor-tab-active/);
        await expect(knowledge).not.toHaveClass(/ch-editor-tab-active/);
    });

    // Replaces "should open the modal again", which clicked the Dock and asserted nothing.
    test('should navigate from the Dock', async ({ page }) => {
        await page.getByTestId('settings').click();

        await expect(page).toHaveURL(/\/settings$/);
        await expect(page.getByTestId('dialog')).toBeVisible();
    });

    for (const link of socialLinks) {
        test(`should navigate to ${link.name} page`, async ({ page }) => {
            const popupPromise = page.waitForEvent('popup');
            await page.getByTestId(link.testId).click();
            const popup = await popupPromise;
            await popup.waitForLoadState();

            expect(popup.url()).toContain(link.href);

            await popup.close();
        });
    }
});
