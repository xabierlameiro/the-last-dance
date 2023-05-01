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
        channel: 'chrome',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'on-first-retry',
        baseURL: baseUrl,
        ...opts,
    },
    testDir: './e2e',
    reporter: [['html']],
});
