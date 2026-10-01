/**
 * The transfer budget that decides the production bundler (next.config.ts, top comment).
 *
 *   node scripts/measure-transfer/index.ts <webpack base URL> <turbopack base URL>
 *
 * Serve each build with `next start` on its own port first. For every page below, a cold Chromium
 * load sums what `/_next/static` transferred (gzip, as `encodedBodySize` reports it), prefetches
 * included, because that is what a reader's browser downloads. Analytics and `/api` requests are
 * blocked: they are the same under both bundlers and only add noise.
 *
 * Turbopack may build production when its JavaScript is within 5% of webpack's on every page,
 * measured the same day by this script.
 */
import { chromium, type Browser } from '@playwright/test';

const ROUTES = ['/', '/blog/nextjs/dark-theme', '/es/legal/privacy-policy', '/gl/comments', '/settings'];
const BUDGET = 1.05;

type Transfer = { jsBytes: number; jsFiles: number; cssBytes: number };

const [webpackBase, turbopackBase] = process.argv.slice(2);
if (!webpackBase || !turbopackBase) {
    console.error('Usage: node scripts/measure-transfer/index.ts <webpack base URL> <turbopack base URL>');
    process.exit(2);
}

const measure = async (browser: Browser, url: string): Promise<Transfer> => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route(/googletagmanager|google-analytics|\/api\//, (route) => route.abort());
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    // An error page loads less JavaScript and would read as "within budget".
    if (!response?.ok()) throw new Error(`${url} answered ${response?.status() ?? 'nothing'}`);
    // `next/link` prefetches on idle and can land after networkidle; let them finish.
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    const transfer = await page.evaluate(() => {
        const sum = { jsBytes: 0, jsFiles: 0, cssBytes: 0 };
        for (const entry of performance.getEntriesByType('resource') as PerformanceResourceTiming[]) {
            if (!entry.name.includes('/_next/static/')) continue;
            if (entry.name.endsWith('.js')) {
                sum.jsBytes += entry.encodedBodySize;
                sum.jsFiles += 1;
            } else if (entry.name.endsWith('.css')) {
                sum.cssBytes += entry.encodedBodySize;
            }
        }
        return sum;
    });
    await context.close();
    return transfer;
};

const kilobytes = (bytes: number): string => `${(bytes / 1024).toFixed(1)} KB`;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH });
let pagesOverBudget = 0;
console.log(['Page', 'webpack JS', 'Turbopack JS', 'Change', 'JS files', 'Budget'].join('\t'));
for (const route of ROUTES) {
    const webpack = await measure(browser, webpackBase + route);
    const turbopack = await measure(browser, turbopackBase + route);
    const ratio = turbopack.jsBytes / webpack.jsBytes;
    const isWithinBudget = ratio <= BUDGET;
    if (!isWithinBudget) pagesOverBudget += 1;
    console.log(
        [
            route,
            kilobytes(webpack.jsBytes),
            kilobytes(turbopack.jsBytes),
            `${ratio >= 1 ? '+' : ''}${((ratio - 1) * 100).toFixed(0)}%`,
            `${webpack.jsFiles} → ${turbopack.jsFiles}`,
            isWithinBudget ? 'within' : 'over',
        ].join('\t')
    );
}
await browser.close();

console.log(
    pagesOverBudget === 0
        ? 'Budget met on every page: switching `build` to Turbopack can be proposed.'
        : `Budget missed on ${pagesOverBudget} of ${ROUTES.length} pages: \`build\` stays on webpack.`
);
