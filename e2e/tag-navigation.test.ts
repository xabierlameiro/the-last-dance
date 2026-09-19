import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/**
 * tag-facets-as-query-param, task 1.1: today's tag navigation, recorded before the browsed tag moves
 * from a path segment to `?tag=`. PR #186 changed the URL shape and silently de-selected the tag
 * when a post was opened from a tag listing; #189 reverted it. So this suite asserts only what a
 * reader sees (highlight, filtered list, open article, back button), never the URL shape, and it
 * must pass unchanged before and after the change.
 */

const TAG = 'node';

const tagLink = (page: Page) => page.getByTestId('nav-list').nth(1).locator(`a[title="${TAG}"]`);
const selectedCategoryLinks = (page: Page) =>
    page.getByTestId('nav-list').first().locator('a[class*="selected"]');
const postListTitles = (page: Page) => page.getByTestId('post-list').locator('li a').evaluateAll(
    (links) => links.map((link) => link.getAttribute('title'))
);
const selectedPostTitle = (page: Page) =>
    page.getByTestId('post-list').locator('li[class*="selected"] a').getAttribute('title');

for (const localePrefix of ['', '/es']) {
    test.describe(`Tag navigation (${localePrefix || '/en'})`, () => {
        test('should keep the browsed tag through the listing, a second post and back', async ({ page }) => {
            await page.goto(`${localePrefix}/blog`);
            await tagLink(page).click();

            // The tag is highlighted, no category is, and the list holds exactly the tag's posts.
            await expect(tagLink(page)).toHaveClass(/selected/);
            await expect(selectedCategoryLinks(page)).toHaveCount(0);
            const tagTotal = Number(await tagLink(page).locator('div').last().textContent());
            const tagListing = await postListTitles(page);
            expect(tagTotal).toBeGreaterThan(1);
            expect(tagListing).toHaveLength(tagTotal);

            const firstPost = await selectedPostTitle(page);
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(String(firstPost));

            // Open another post from the tag listing: same tag, same list, new article.
            const secondPost = tagListing.find((title) => title !== firstPost);
            await page.getByTestId('post-list').locator(`a[title="${secondPost}"]`).click();
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(String(secondPost));
            await expect(tagLink(page)).toHaveClass(/selected/);
            expect(await postListTitles(page)).toEqual(tagListing);
            expect(await selectedPostTitle(page)).toBe(secondPost);

            // Back: the first article, still inside the same tag listing.
            await page.goBack();
            await expect(page.getByRole('heading', { level: 1 })).toHaveText(String(firstPost));
            await expect(tagLink(page)).toHaveClass(/selected/);
            expect(await postListTitles(page)).toEqual(tagListing);
        });

        test('should render the tag listing on a full reload of a tagged post', async ({ page }) => {
            await page.goto(`${localePrefix}/blog`);
            await tagLink(page).click();
            await expect(tagLink(page)).toHaveClass(/selected/);
            const tagListing = await postListTitles(page);

            // A refresh or a shared link is a server render, not a client transition.
            await page.reload();
            await expect(tagLink(page)).toHaveClass(/selected/);
            expect(await postListTitles(page)).toEqual(tagListing);
        });

        test('should select no tag on a direct visit to the canonical post URL', async ({ page }) => {
            await page.goto(`${localePrefix}/blog`);
            await tagLink(page).click();
            await expect(tagLink(page)).toHaveClass(/selected/);

            const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
            await page.goto(new URL(String(canonical)).pathname);

            await expect(tagLink(page)).not.toHaveClass(/selected/);
            await expect(selectedCategoryLinks(page)).toHaveCount(1);
        });
    });
}
