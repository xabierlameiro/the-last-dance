import { defineConfig } from '@playwright/test';
export default defineConfig({
    use: {
        headless: true,
        channel: 'chrome',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'on-first-retry',
        baseURL: 'https://pre.xabierlameiro.com',
    },
    testDir: './e2e',
    reporter: process.env.CI
        ? 'github'
        : [
              ['list', { printSteps: true }],
              ['html', { outputFile: 'test-results.html' }],
              // ['json', { outputFile: 'test-results.json' }]
          ],
});
