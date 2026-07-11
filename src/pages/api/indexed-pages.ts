import { NextApiRequest, NextApiResponse } from 'next';
import console from '@/helpers/console';
import allowCors from '../../helpers/cors';

// Last count successfully fetched from SerpAPI, served while the upstream is down.
let lastKnownCount: number | null = null;

/**
 * @description Get the number of indexed pages using SerpAPI. Serves the last
 * known count if the upstream fails, and an honest 503 when there is no data.
 *
 * @returns {Promise<void>}
 */
export default allowCors(async function handler(_req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const serpApiKey = process.env.SERP_API_KEY;

    if (!serpApiKey) {
        res.status(503).json({ error: 'Indexed pages source not configured' });
        return;
    }

    try {
        const response = await fetch(
            `https://serpapi.com/search?q=site%3Axabierlameiro.com&api_key=${serpApiKey}&num=1`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`SerpAPI request failed with status ${response.status}`);
        }

        const data = await response.json();
        const resultsCount = Number(data.search_information?.total_results);

        if (!Number.isFinite(resultsCount) || resultsCount <= 0) {
            throw new Error('SerpAPI response missing total_results');
        }

        lastKnownCount = resultsCount;
        res.status(200).json({ num: resultsCount });
    } catch (err) {
        console.error('Indexed pages API error:', err instanceof Error ? err.message : err);

        if (lastKnownCount !== null) {
            res.status(200).json({ num: lastKnownCount });
            return;
        }

        res.status(503).json({ error: 'Indexed pages count unavailable' });
    }
});
