import { NextApiRequest, NextApiResponse } from 'next';
import jsdom from 'jsdom';
import allowCors from '../../helpers/cors';

/**
 * @description Get the price of XRP in EUR
 *
 * @returns {Promise<{ price: string; todaySummary: string; todayPorcentage: string } | { error: string }>}
 * @example https://xabierlameiro.com/api/xrp
 */
export default allowCors(async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const { JSDOM } = jsdom;
    const response = await fetch('https://www.google.com/search?q=xrp+eur+price', {
        method: 'GET',
        headers: new Headers({
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'cache-control': 'max-age=0',
        }),
    })
        .then((response) => {
            if (response.ok) {
                return response;
            }
        })
        .catch((err: Error | unknown) => {
            if (err instanceof Error) {
                res.status(500).json({ error: err.message });
            }
        });

    try {
        const raw = await response?.text();
        const dom = new JSDOM(raw);
        const price = dom.window.document.querySelector('.pclqee')?.textContent;
        const todaySummary = dom.window.document.querySelector('[jsname="SwWl3d"]')?.textContent;
        const todayPorcentage = dom.window.document.querySelector('[jsname="rfaVEf"]')?.textContent;

        res.status(200).json({
            price,
            todaySummary,
            todayPorcentage,
        });
    } catch (err: Error | unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
    }
});
