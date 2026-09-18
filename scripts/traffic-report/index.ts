// Traffic report runner (measure-real-traffic). Usage:
//   npm run traffic-report -- --from 2026-09-01 --to 2026-09-28 [--human 412] [--ai-referrals chatgpt.com=3]
// Reads AI-crawler hits from the dedicated GA4 property the middleware writes to, and prints them
// next to the human figures copied from Vercel Web Analytics. Runs under Node's type stripping.
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import * as z from 'zod';
import { CRAWLER_EVENT_NAME, TOP_PATHS, formatTrafficReport, parseReportArgs, parseReportRows } from './lib.ts';
import type { ReportOptions } from './lib.ts';

const envSchema = z.object({
    GA_CRAWLER_PROPERTY_ID: z.string().regex(/^\d+$/, 'numeric GA4 property id of the crawler property'),
    ANALYTICS_CLIENT_EMAIL: z.string().min(1),
    ANALYTICS_PRIVATE_KEY: z.string().min(1),
    ANALYTICS_PROJECT_ID: z.string().min(1),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
    const missing = env.error.issues.map((issue) => issue.path.join('.')).join(', ');
    console.error(`[traffic-report] missing or invalid environment: ${missing}`);
    process.exit(1);
}

const readOptions = (): ReportOptions => {
    try {
        return parseReportArgs(process.argv.slice(2));
    } catch (error) {
        console.error(`[traffic-report] ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
};

const options = readOptions();

const client = new BetaAnalyticsDataClient({
    credentials: {
        client_email: env.data.ANALYTICS_CLIENT_EMAIL,
        private_key: env.data.ANALYTICS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    projectId: env.data.ANALYTICS_PROJECT_ID,
});

const countCrawlerHitsBy = async (dimension: 'customEvent:bot' | 'customEvent:path', limit?: number) => {
    const [response] = await client.runReport({
        property: `properties/${env.data.GA_CRAWLER_PROPERTY_ID}`,
        dateRanges: [{ startDate: options.from, endDate: options.to }],
        dimensions: [{ name: dimension }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: CRAWLER_EVENT_NAME } } },
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit,
    });
    return parseReportRows(response);
};

const [byBot, byPath] = await Promise.all([
    countCrawlerHitsBy('customEvent:bot'),
    countCrawlerHitsBy('customEvent:path', TOP_PATHS),
]);

console.log(formatTrafficReport(options, byBot, byPath));
