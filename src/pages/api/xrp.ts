import type { NextApiRequest, NextApiResponse } from 'next';
import console from '@/helpers/console';
import allowCors from '../../helpers/cors';
import { CACHE, fetchWithTimeout } from '@/helpers/http';
import { describeIssues } from '../../types/schemas';
import { coinGeckoXrpSchema } from '../../types/upstream';

/**
 * @description Get the price of XRP in EUR using CoinGecko API
 *
 * @returns {Promise<{ price: string; todaySummary: string; todayPorcentage: string } | { error: string }>}
 * @example https://xabierlameiro.com/api/xrp
 */
export default allowCors(async function handler(_req: NextApiRequest, res: NextApiResponse) {
    try {
        // Using CoinGecko API which is more reliable than scraping Google
        const response = await fetchWithTimeout(
            'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=eur&include_24hr_change=true',
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'User-Agent': 'xabierlameiro.com',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        // SDD-L07: `const data = await response.json()` is an implicit `any`, and the only check was
        // `if (!data.ripple)`. A response with `ripple` present but `eur` missing — what CoinGecko
        // returns for a currency it does not support, at status 200 — reached `.toFixed()` on
        // `undefined` and threw a TypeError that the outer catch reported as a flat 500. The log
        // said "Internal server error" about someone else's API changing shape.
        const parsed = coinGeckoXrpSchema.safeParse(await response.json());
        if (!parsed.success) {
            throw new Error(`CoinGecko response did not match: ${describeIssues(parsed.error.issues)}`);
        }

        const price = parseFloat(parsed.data.ripple.eur.toFixed(4));
        const change24h = parsed.data.ripple.eur_24h_change;
        const todayPorcentage = `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`;
        const todaySummary = change24h > 0 ? 'Up' : 'Down';

        res.setHeader('Cache-Control', CACHE.price);
        res.status(200).json({
            price,
            todaySummary,
            todayPorcentage,
        });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('XRP API Error:', err);
        }
        res.setHeader('Cache-Control', CACHE.error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
