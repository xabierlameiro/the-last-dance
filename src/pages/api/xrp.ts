import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../../helpers/cors';

/**
 * @description Get the price of XRP in EUR using CoinGecko API
 *
 * @returns {Promise<{ price: string; todaySummary: string; todayPorcentage: string } | { error: string }>}
 * @example https://xabierlameiro.com/api/xrp
 */
export default allowCors(async function handler(_req: NextApiRequest, res: NextApiResponse) {
    try {
        // Using CoinGecko API which is more reliable than scraping Google
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=eur&include_24hr_change=true',
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'xabierlameiro.com',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.ripple) {
            throw new Error('XRP data not found');
        }

        const price = data.ripple.eur.toFixed(4);
        const change24h = data.ripple.eur_24h_change;
        const todayPorcentage = `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`;
        const todaySummary = change24h > 0 ? 'Up' : 'Down';

        res.status(200).json({
            price: `€${price}`,
            todaySummary,
            todayPorcentage,
        });
    } catch (err: Error | unknown) {
        console.error('XRP API Error:', err);
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});
