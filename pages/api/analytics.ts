// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

type Data = {
    error?: Error;
    response?: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email: process.env.ANALYTICS_CLIENT_EMAIL,
            private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        projectId: process.env.ANALYTICS_PROJECT_ID,
    });

    // Runs a simple report.
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
                name: 'screenpageViews',
            },
            {
                name: 'engagementRate',
            },
            {
                name: 'totalUsers',
            },
        ],
    });

    try {
        res.status(200).json({ response });
    } catch (err: any) {
        res.status(500).json({ error: err });
    }
}
