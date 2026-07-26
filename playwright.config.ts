import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({
    path: '.env.development',
});

const baseUrl = 'http://localhost:3000';
console.log(`ℹ️ Using base URL "${baseUrl}"`);

const opts = {
    headless: process.env.CI ? true : false,
    launchOptions: {
        slowMo: process.env.CI ? 0 : 400,
    },
};

export default defineConfig({
    use: {
        // Bundled Chromium rather than `channel: 'chrome'`. CI installs `--with-deps chromium`, so
        // asking for system Chrome only worked because the ubuntu-22.04 image happens to ship it.
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        // `video: 'on-first-retry'` could never fire while retries defaulted to 0.
        video: 'on-first-retry',
        trace: 'on-first-retry',
        baseURL: baseUrl,
        ...opts,
    },
    testDir: './e2e',
    reporter: [['html']],
    retries: process.env.CI ? 2 : 0,
    forbidOnly: !!process.env.CI,
    // Playwright owns the server lifecycle. CI previously did `npm run dev &` in one step and
    // `npx wait-on` in the next, which hung indefinitely on 2026-07-26 (that step takes ~22s when it
    // works; it sat for over 20 minutes) and pulled `wait-on` from the network at run time because it
    // is not a declared dependency. `webServer` has its own readiness probe and timeout, and it
    // serves a production build, so e2e exercises what actually deploys instead of the dev server.
    webServer: {
        command: 'npm run build && npm start',
        url: baseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
    },
});
