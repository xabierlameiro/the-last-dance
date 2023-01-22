import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

//https://developers.google.com/webmaster-tools/v1/searchanalytics/query
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.ANALYTICS_CLIENT_EMAIL,
            private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: 'https://www.googleapis.com/auth/webmasters',
    });

    const webmasters = google.webmasters({
        version: 'v3',
        auth,
    });

    const response = await webmasters.searchanalytics
        .query({
            siteUrl: 'sc-domain:xabierlameiro.com',
            requestBody: {
                startDate: '2023-01-01',
                endDate: '2023-12-30',
                dataState: 'ALL',
                dimensions: ['page'],
            },
        })
        .then((response) => response.data);

    res.status(200).json(response);
}
