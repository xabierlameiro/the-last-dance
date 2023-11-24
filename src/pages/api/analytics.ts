// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import allowCors from '../../helpers/cors';

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
export default allowCors(async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const { query } = req;
    const { slug } = query;
    let data = null;
    const analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email: process.env.ANALYTICS_CLIENT_EMAIL,
            private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        projectId: process.env.ANALYTICS_PROJECT_ID,
    });
    try {
        if (!slug) {
            const [response] = await analyticsDataClient.runReport({
                property: `properties/348472560`,
                dateRanges: [
                    {
                        startDate: '2023-01-01',
                        endDate: 'today',
                    },
                ],
                metrics: [
                    {
                        name: 'screenPageViews',
                    },
                    {
                        name: 'newUsers',
                    },
                ],
            });

            if (!response || !response.rows) {
                res.status(500).json({ error: 'No data' });
                return;
            }
            data = {
                pageViews: response?.rows?.[0].metricValues?.[0].value,
                newUsers: response?.rows?.[0].metricValues?.[1].value,
            };
        } else {
            const [response] = await analyticsDataClient.runReport({
                property: `properties/348472560`,
                dateRanges: [
                    {
                        startDate: '2023-01-01',
                        endDate: 'today',
                    },
                ],

                metrics: [
                    {
                        name: 'screenPageViews',
                    },
                    {
                        name: 'newUsers',
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
            });

            if (!response || !response.rows || typeof response.rowCount !== 'number') {
                res.status(500).json({ error: 'Error while parsing analytics data' });
                return;
            }

            if (response.rowCount > 0) {
                data = {
                    pageViews: response?.rows?.[0].metricValues?.[0].value,
                    newUsers: response?.rows?.[0].metricValues?.[1].value,
                };
            } else {
                data = {
                    pageViews: 0,
                    newUsers: 0,
                };
            }
        }

        res.status(200).json({
            pageViews: data.pageViews,
            newUsers: data.newUsers,
        });
    } catch (err: Error | unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
    }
});
