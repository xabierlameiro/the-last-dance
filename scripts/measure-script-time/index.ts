/**
 * The script-time budget that keeps `reactCompiler` on (next.config.ts).
 *
 *   node scripts/measure-script-time/index.ts <baseline base URL> <candidate base URL>
 *
 * Serve each build with `next start` on its own port first: the baseline without the compiler, the
 * candidate with it. Each run is one session on each build: a cold load of a post, six client-side
 * navigations and five idle seconds (the header clock repaints on an interval). Chromium's own
 * counters (`Performance.getMetrics`) give the main-thread time. Analytics and `/api` requests are
 * blocked: they are the same under both builds and only add noise.
 *
 * The compiler stays on while the candidate's median session script time is at least 15% below
 * the baseline's and the two ranges over seven runs do not overlap. It buys that time with bytes,
 * which `scripts/measure-transfer/` budgets.
 */
import { chromium, type Browser, type CDPSession } from '@playwright/test';

const START = '/blog/nextjs/dark-theme';
const ROUTES = [
    '/blog/nextjs/measure-nextjs-memory-leak',
    '/settings',
    '/comments',
    '/legal/privacy-policy',
    '/blog/nextjs/dark-theme',
    '/',
];
const RUNS = 7;
const BUDGET = 0.85;

type Sample = { loadScript: number; sessionScript: number; sessionTask: number; heap: number };
type NextWindow = { next: { router: { push: (url: string) => Promise<boolean> } } };

const [baselineBase, candidateBase] = process.argv.slice(2);
if (!baselineBase || !candidateBase) {
    console.error('Usage: node scripts/measure-script-time/index.ts <baseline base URL> <candidate base URL>');
    process.exit(2);
}

type Metrics = { ScriptDuration: number; TaskDuration: number; JSHeapUsedSize: number };

const readMetrics = async (client: CDPSession): Promise<Metrics> => {
    const { metrics } = await client.send('Performance.getMetrics');
    const read = (name: keyof Metrics): number => {
        const metric = metrics.find((entry) => entry.name === name);
        if (!metric) throw new Error(`Chromium reported no ${name} metric`);
        return metric.value;
    };
    return {
        ScriptDuration: read('ScriptDuration'),
        TaskDuration: read('TaskDuration'),
        JSHeapUsedSize: read('JSHeapUsedSize'),
    };
};

const measureSession = async (browser: Browser, base: string): Promise<Sample> => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route(/googletagmanager|google-analytics|\/api\//, (route) => route.abort());
    const client = await context.newCDPSession(page);
    await client.send('Performance.enable');
    const response = await page.goto(base + START, { waitUntil: 'networkidle' });
    // An error page runs less script and would read as a win.
    if (!response?.ok()) throw new Error(`${base + START} answered ${response?.status() ?? 'nothing'}`);
    const loaded = await readMetrics(client);
    for (const route of ROUTES) {
        await page.evaluate((url) => (window as unknown as NextWindow).next.router.push(url), route);
        await page.waitForFunction((url) => window.location.pathname === url, route);
        await page.waitForLoadState('networkidle');
    }
    await page.waitForTimeout(5000);
    const done = await readMetrics(client);
    await context.close();
    return {
        loadScript: loaded.ScriptDuration * 1000,
        sessionScript: (done.ScriptDuration - loaded.ScriptDuration) * 1000,
        sessionTask: (done.TaskDuration - loaded.TaskDuration) * 1000,
        heap: done.JSHeapUsedSize / 1024 / 1024,
    };
};

const median = (values: number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? NaN;
const describe = (values: number[]): string =>
    `${median(values).toFixed(1)} [${Math.min(...values).toFixed(1)}..${Math.max(...values).toFixed(1)}]`;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH });
const samples: Record<'baseline' | 'candidate', Sample[]> = { baseline: [], candidate: [] };
for (let run = 0; run < RUNS; run += 1) {
    // Alternate the order so that drift on the machine lands on both builds.
    const order = run % 2 ? (['candidate', 'baseline'] as const) : (['baseline', 'candidate'] as const);
    for (const name of order) {
        samples[name].push(await measureSession(browser, name === 'baseline' ? baselineBase : candidateBase));
    }
}
await browser.close();

console.log(['Build', 'load script ms', 'session script ms', 'session task ms', 'heap MB'].join('\t'));
for (const [name, list] of Object.entries(samples)) {
    const column = (key: keyof Sample) => describe(list.map((sample) => sample[key]));
    console.log(
        [name, column('loadScript'), column('sessionScript'), column('sessionTask'), column('heap')].join('\t'),
    );
}

const baselineScript = samples.baseline.map((sample) => sample.sessionScript);
const candidateScript = samples.candidate.map((sample) => sample.sessionScript);
const ratio = median(candidateScript) / median(baselineScript);
const isApart = Math.max(...candidateScript) < Math.min(...baselineScript);
const change = `${((ratio - 1) * 100).toFixed(0)}%`;
console.log(
    ratio <= BUDGET && isApart
        ? `Budget met: session script time ${change}, ranges apart.`
        : `Budget missed: session script time ${change}, ranges ${isApart ? 'apart' : 'overlap'}. Turn reactCompiler off until it is understood.`,
);
