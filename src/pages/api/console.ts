import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../../helpers/cors';

/**
 * @description This is a test to get the data from the Google Search Console API
 * @param _req NextApiRequest
 * @param res NextApiResponse
 * @returns Promise<void>
 * @see https://developers.google.com/webmaster-tools/v1/searchanalytics/query
 */
export default allowCors(async function handler(_req: NextApiRequest, res: NextApiResponse) {
    // Validate required environment variables
    if (!process.env.ANALYTICS_CLIENT_EMAIL || !process.env.ANALYTICS_PRIVATE_KEY) {
        console.error('Missing required environment variables for Google API authentication');
        return res.status(500).json({ error: 'Configuration error' });
    }

    try {
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
            .then((response) => response.data)
            .catch((error) => {
                console.error('Google API error:', error);
                throw new Error('Failed to fetch search console data');
            });

        res.status(200).json(response);
    } catch (error) {
        console.error('Search Console API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
