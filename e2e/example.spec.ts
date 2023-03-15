import { test, expect } from '@playwright/test';

test('should navigate to the landing page', async ({ page }) => {
    // Just navigate to landing page
    await page.goto('/');
    // Check the title
    await expect(page).toHaveTitle(/Front end developer, microcomputing and networks Technician/);
    // check if the header, main and footer are visible
    await page.locator('[data-testid="header"]').isVisible();
    await page.locator('[data-testid="main"]').isVisible();
    await page.locator('[data-testid="footer"]').isVisible();

    // TODO : Close the cookies modal
    // TODO : Close and open the modal
    // TODO : Navigate in the modal
    // TODO : Open links to the social networks and reports
    // TODO : Check the tooltips
    // TODO : Open the weather widget and news, scroll and close
    // ...
});
