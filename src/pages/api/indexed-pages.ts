import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import console from '@/helpers/console';
import allowCors from '../../helpers/cors';

const SITE_URL = 'sc-domain:xabierlameiro.com';

/**
 * @description Count the pages Google surfaced for the site in the last 28 days,
 * using the Search Console API with the same service account as /api/analytics.
 * Replaces the old SerpAPI/Google-scraping approach that 503'd in production (SDD-001).
 *
 * @returns {Promise<number | null>} - Page count, or null when credentials are missing
 */
const countFromSearchConsole = async (): Promise<number | null> => {
    if (!process.env.ANALYTICS_CLIENT_EMAIL || !process.env.ANALYTICS_PRIVATE_KEY) {
        return null;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.ANALYTICS_CLIENT_EMAIL,
            private_key: process.env.ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: 'https://www.googleapis.com/auth/webmasters.readonly',
    });

    const webmasters = google.webmasters({ version: 'v3', auth });

    const toDay = (date: Date) => date.toISOString().slice(0, 10);
    const end = new Date();
    const start = new Date(end.getTime() - 28 * 24 * 60 * 60 * 1000);

    const response = await webmasters.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
            startDate: toDay(start),
            endDate: toDay(end),
            dimensions: ['page'],
            rowLimit: 25000,
        },
    });

    return response.data.rows?.length ?? 0;
};

/**
 * @description Fallback when Search Console is unavailable: count the URLs we
 * publish in the sitemap instead of fabricating a number.
 *
 * @returns {number} - Number of <loc> entries in public/sitemap.xml
 */
const countFromSitemap = (): number => {
    const sitemap = fs.readFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), 'utf8');
    return sitemap.match(/<loc>/g)?.length ?? 0;
};

/**
 * @description Get the number of pages indexed/surfaced by Google
 * @param _req {NextApiRequest}
 * @param res {NextApiResponse}
 * @returns Promise<void>
 * @example http://localhost:3000/api/indexed-pages
 */
export default allowCors(async function handler(_req: NextApiRequest, res: NextApiResponse) {
    try {
        const num = await countFromSearchConsole();
        if (num !== null && num > 0) {
            return res.status(200).json({ num });
        }
    } catch (err) {
        console.error(`Search Console count failed, falling back to sitemap: ${err}`);
    }

    try {
        return res.status(200).json({ num: countFromSitemap() });
    } catch {
        return res.status(500).json({ error: 'Unable to count indexed pages' });
    }
});
