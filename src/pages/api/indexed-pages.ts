import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import console from '@/helpers/console';
import { getSearchConsoleClient, SITE_URL } from '@/helpers/searchConsole';
import allowCors from '../../helpers/cors';
import { CACHE } from '@/helpers/http';

/**
 * @description Count the pages Google surfaced for the site in the last 28 days,
 * using the Search Console API with the same service account as /api/analytics.
 * Replaces the old SerpAPI/Google-scraping approach that 503'd in production (SDD-001).
 *
 * @returns {Promise<number | null>} - Page count, or null when credentials are missing
 */
const countFromSearchConsole = async (): Promise<number | null> => {
    const webmasters = getSearchConsoleClient();
    if (!webmasters) {
        return null;
    }

    const toDay = (date: Date) => date.toISOString().slice(0, 10);
    const end = new Date();
    const start = new Date(end.getTime() - 28 * 24 * 60 * 60 * 1000);

    const response = await webmasters.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
            startDate: toDay(start),
            endDate: toDay(end),
            dimensions: ['page'],
            // Was 25000. The route only needs `rows.length`, and the site publishes ~60 URLs, so the
            // old limit asked Search Console for four hundred times more data than the widget can
            // use — an expensive query repeated per visitor before this route was cached.
            rowLimit: 1000,
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
            res.setHeader('Cache-Control', CACHE.slow);
            return res.status(200).json({ num });
        }
    } catch (err) {
        console.error(`Search Console count failed, falling back to sitemap: ${err}`);
    }

    try {
        res.setHeader('Cache-Control', CACHE.slow);
        return res.status(200).json({ num: countFromSitemap() });
    } catch {
        res.setHeader('Cache-Control', CACHE.error);
        return res.status(500).json({ error: 'Unable to count indexed pages' });
    }
});
