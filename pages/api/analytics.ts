// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

type Data = {
    error?: string;
    total?: number;
};

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
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { query } = req;
    const { slug } = query;
    let total = 0;
    const analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email: process.env.ANALYTICS_CLIENT_EMAIL,
            private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        projectId: process.env.ANALYTICS_PROJECT_ID,
    });
    if (!slug) {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/348472560`,
            dateRanges: [
                {
                    startDate: '2023-01-01',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: 'pagePath',
                },
            ],
            metrics: [
                {
                    name: 'screenPageViews',
                },
            ],
            orderBys: [
                {
                    metric: {
                        metricName: 'screenPageViews',
                    },
                },
            ],
        });

        if (!response || !response.rows) {
            res.status(500).json({ error: 'No data' });
            return;
        }

        total = response.rows.reduce((prev: any, curr: any) => {
            return prev + parseInt(curr.metricValues[0].value, 0);
        }, 0);
    } else {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/348472560`,
            dateRanges: [
                {
                    startDate: '2023-01-01',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: 'date',
                },
                {
                    name: 'pagePath',
                },
            ],
            metrics: [
                {
                    name: 'screenPageViews',
                },
            ],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    stringFilter: {
                        matchType: 'EXACT',
                        value: slug.toString(),
                    },
                },
            },
            orderBys: [
                {
                    dimension: {
                        dimensionName: 'date',
                    },
                },
            ],
        });

        if (!response || !response.rows) {
            res.status(500).json({ error: 'Error while parsing analytics data' });
            return;
        }

        total = response.rows.reduce((prev: any, curr: any) => {
            return prev + parseInt(curr.metricValues[0].value, 0);
        }, 0);
    }
    try {
        res.status(200).json({ total });
    } catch (err: any) {
        res.status(500).json({ error: err });
    }
}
