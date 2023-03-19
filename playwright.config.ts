import { defineConfig } from '@playwright/test';
export default defineConfig({
    use: {
        channel: 'chrome',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'on-first-retry',
        baseURL: process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000',
    },
    testDir: './e2e',
});
