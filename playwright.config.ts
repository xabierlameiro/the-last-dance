import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from './e2e/visual/targets';

dotenv.config({
    path: '.env.development',
});

// The port is overridable so a run can coexist with a dev server the developer already has on
// 3000. CI leaves it unset and gets the previous behaviour exactly.
const port = process.env.PLAYWRIGHT_PORT ?? '3000';
const baseUrl = `http://localhost:${port}`;
console.log(`ℹ️ Using base URL "${baseUrl}"`);

/**
 * Escape hatch for a machine that cannot download Playwright's pinned browser build — a proxy that
 * refuses the CDN, an offline checkout. Unset, which is the case in CI and normally on a laptop,
 * this changes nothing. Set, it runs against the named binary so the suite can at least be
 * exercised; the resulting screenshots are not a baseline, because a baseline must come from the
 * same browser build and platform that compares it.
 */
const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_PATH;

const opts = {
    headless: process.env.CI ? true : false,
    launchOptions: {
        slowMo: process.env.CI ? 0 : 400,
        ...(chromiumExecutable ? { executablePath: chromiumExecutable } : {}),
    },
};

/** The visual projects never want `slowMo`: 55 captures at 400ms a step is minutes of nothing. */
const visualLaunchOptions = {
    slowMo: 0,
    ...(chromiumExecutable ? { executablePath: chromiumExecutable } : {}),
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
    /**
     * Baselines are platform-specific: font rasterisation differs between macOS and the Linux
     * runner, so a capture taken on a laptop can never match one compared in CI. Keeping the
     * platform in the path makes that explicit — a local run writes beside the committed Linux
     * baselines instead of overwriting them, and a missing baseline fails loudly.
     */
    snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{platform}/{arg}{ext}',
    /**
     * Projects arrived with the visual suite. `e2e` reproduces the previous single-project
     * behaviour for the six existing specs; the three `visual-*` projects each sweep one axis
     * across every screen, and carry the axis in `metadata` so the specs need no per-project file.
     */
    projects: [
        {
            name: 'e2e',
            testDir: './e2e',
            testIgnore: /visual[\\/]/,
        },
        {
            name: 'visual-locale',
            testDir: './e2e/visual',
            use: {
                viewport: DESKTOP_VIEWPORT,
                colorScheme: 'light',
                timezoneId: 'UTC',
                launchOptions: visualLaunchOptions,
            },
            metadata: { locales: ['en', 'es', 'gl'], theme: 'light' },
        },
        {
            name: 'visual-dark',
            testDir: './e2e/visual',
            use: {
                viewport: DESKTOP_VIEWPORT,
                colorScheme: 'dark',
                timezoneId: 'UTC',
                launchOptions: visualLaunchOptions,
            },
            metadata: { locales: ['en'], theme: 'dark' },
        },
        {
            name: 'visual-mobile',
            testDir: './e2e/visual',
            use: {
                viewport: MOBILE_VIEWPORT,
                colorScheme: 'light',
                timezoneId: 'UTC',
                launchOptions: visualLaunchOptions,
            },
            metadata: { locales: ['en'], theme: 'light' },
        },
    ],
    reporter: [['html']],
    retries: process.env.CI ? 2 : 0,
    forbidOnly: !!process.env.CI,
    // Playwright owns the server lifecycle. CI previously did `npm run dev &` in one step and
    // `npx wait-on` in the next, which hung indefinitely on 2026-07-26 (that step takes ~22s when it
    // works; it sat for over 20 minutes) and pulled `wait-on` from the network at run time because it
    // is not a declared dependency. `webServer` has its own readiness probe and timeout, and it
    // serves a production build, so e2e exercises what actually deploys instead of the dev server.
    webServer: {
        command: `npm run build && npm start -- -p ${port}`,
        url: baseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
    },
});
