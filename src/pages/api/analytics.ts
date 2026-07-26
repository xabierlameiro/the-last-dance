// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import allowCors from '../../helpers/cors';
import { isSafePagePath } from '../../helpers/slug';
import { CACHE } from '@/helpers/http';
import type { AnalyticsData } from '../../types/api';

/**
 * @description This function is used to get the total number of page views for a given page. It uses the Google
 * Analytics Data API to get the data.
 *
 * @param {NextApiRequest} req
 * @param {NextApiResponse<Data>} res
 * @returns {Promise<{
 *     error?: string;
 *     total?: number;
 * }>}
 * @throws {Error: Error while parsing analytics data}
 * @see https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
 *
 * SDD-L07: this route declared `pageViews: string | number` and returned
 * `row.metricValues?.[0]?.value || '0'` — a **string**, because that is what the GA4 Data API emits
 * for every metric. `types/api.ts` declared the same field `number`, and `useAnalytics` cast the
 * response with `as AnalyticsData`, which erases at compile time and checks nothing. So a string
 * travelled all the way to `ViewCounter`, which rendered `12345` unseparated while `CryptoPrice`
 * beside it went through `formatNumber`. The two counters disagreed for exactly this reason.
 *
 * The union is gone and the coercion happens here, at the boundary that knows GA4 sends strings,
 * rather than being carried through the app as an ambiguity. `types/api.ts` is the single contract.
 */
type AnalyticsResponse = AnalyticsData | { error: string };

const GA_PROPERTY = 'properties/348472560';
// Since the property started collecting, so the counters read as all-time totals.
const GA_DATE_RANGES = [{ startDate: '2023-01-01', endDate: 'today' }];
const GA_METRICS = [{ name: 'screenPageViews' }, { name: 'newUsers' }];

const EMPTY_ANALYTICS: AnalyticsData = { pageViews: 0, newUsers: 0 };

/**
 * @description Turn a GA4 metric value into the number the contract promises.
 *
 * Deliberately not `z.coerce.number()`: coercion there runs `Number()`, which maps `null` and `''`
 * to `0` and an unparseable string to `NaN` — and `NaN` serialises to JSON `null`, so a bad metric
 * would arrive at the client as a missing field rather than a rejected one. Explicit is better here.
 */
const toCount = (value: string | null | undefined): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * The GA4 Data API bills every call against a per-property daily token quota, and
 * without this header each visitor rendering a view counter spent one. A total
 * that is five minutes stale is indistinguishable from a fresh one to a reader,
 * so the edge answers instead — and `stale-while-revalidate` means a quota
 * exhaustion or an API outage shows the last known figure rather than an error.
 *
 * SDD-L02 moved the value itself into helpers/http.ts. This route was the only one that had a cache
 * header; the other seven now share that module, and a local copy here would be the start of the
 * next drift.
 */
const CACHE_CONTROL = CACHE.analytics;

/**
 * @description Build the runReport request. Without a slug the report covers the whole
 * property; with one it is filtered down to that exact page path.
 */
const buildReportRequest = (slug?: string) => ({
    property: GA_PROPERTY,
    dateRanges: GA_DATE_RANGES,
    metrics: GA_METRICS,
    ...(slug && {
        dimensionFilter: {
            filter: {
                fieldName: 'pagePath',
                stringFilter: { matchType: 'EXACT' as const, value: slug },
            },
        },
    }),
});

export default allowCors(async function handler(req: NextApiRequest, res: NextApiResponse<AnalyticsResponse>) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = req.query;

    // Validate slug parameter if provided
    if (slug && !isSafePagePath(slug)) {
        res.setHeader('Cache-Control', CACHE.error);
        return res.status(400).json({ error: 'Invalid slug parameter' });
    }

    // Validate required environment variables
    if (
        !process.env.ANALYTICS_CLIENT_EMAIL ||
        !process.env.ANALYTICS_PRIVATE_KEY ||
        !process.env.ANALYTICS_PROJECT_ID
    ) {
        console.error('Missing required environment variables for Google Analytics API');
        res.setHeader('Cache-Control', CACHE.error);
        return res.status(500).json({ error: 'Configuration error' });
    }

    try {
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: process.env.ANALYTICS_CLIENT_EMAIL,
                private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            projectId: process.env.ANALYTICS_PROJECT_ID,
        });

        const [response] = await analyticsDataClient.runReport(buildReportRequest(slug as string | undefined));
        const [row] = response?.rows ?? [];

        if (!row) {
            // A page nobody has visited yet is a normal result, not a failure — GA simply
            // returns no rows for it. Only the unfiltered site-wide report having no rows
            // means something is actually wrong.
            if (slug) {
                res.setHeader('Cache-Control', CACHE_CONTROL);
                return res.status(200).json(EMPTY_ANALYTICS);
            }
            // Errors stay uncached: caching one would keep serving it for five minutes
            // after the cause is gone.
            res.setHeader('Cache-Control', CACHE.error);
            return res.status(500).json({ error: 'No data' });
        }

        res.setHeader('Cache-Control', CACHE_CONTROL);
        return res.status(200).json({
            pageViews: toCount(row.metricValues?.[0]?.value),
            newUsers: toCount(row.metricValues?.[1]?.value),
        });
    } catch (err: unknown) {
        console.error('Analytics API Error:', err);
        res.setHeader('Cache-Control', CACHE.error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
