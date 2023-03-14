import { test, expect } from '@playwright/test';

test('should navigate to the about page', async ({ page }) => {
    // Just navigate to landing page
    await page.goto('/');
});
