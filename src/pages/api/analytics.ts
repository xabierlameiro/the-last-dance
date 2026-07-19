// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import allowCors from '../../helpers/cors';
import { isSafePagePath } from '../../helpers/slug';

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
 */
interface AnalyticsData {
    pageViews: string | number;
    newUsers: string | number;
}

type AnalyticsResponse = AnalyticsData | { error: string };

const GA_PROPERTY = 'properties/348472560';
const GA_DATE_RANGES = [{ startDate: '2023-01-01', endDate: 'today' }];
const GA_METRICS = [{ name: 'screenPageViews' }, { name: 'newUsers' }];

const EMPTY_ANALYTICS: AnalyticsData = { pageViews: 0, newUsers: 0 };

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
        return res.status(400).json({ error: 'Invalid slug parameter' });
    }

    // Validate required environment variables
    if (!process.env.ANALYTICS_CLIENT_EMAIL || !process.env.ANALYTICS_PRIVATE_KEY || !process.env.ANALYTICS_PROJECT_ID) {
        console.error('Missing required environment variables for Google Analytics API');
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
                return res.status(200).json(EMPTY_ANALYTICS);
            }
            return res.status(500).json({ error: 'No data' });
        }

        return res.status(200).json({
            pageViews: row.metricValues?.[0]?.value || '0',
            newUsers: row.metricValues?.[1]?.value || '0',
        });
    } catch (err: unknown) {
        console.error('Analytics API Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
