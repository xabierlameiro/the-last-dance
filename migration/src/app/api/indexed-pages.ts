import { NextApiRequest, NextApiResponse } from 'next';
import jsdom from 'jsdom';
import allowCors from '../../helpers/cors';

/**
 * @description Get the number of indexed pages in Google
 *
 * @returns {Promise<{ num: string } | { error: string } | void>}
 */
export default allowCors(async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
): Promise<{ num: string } | { error: string } | void> {
    const { JSDOM } = jsdom;

    const response = await fetch('https://www.google.com/search?q=site%3Axabierlameiro.com', {
        method: 'GET',
        headers: new Headers({
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'cache-control': 'max-age=0',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.5',
            'accept-encoding': 'gzip, deflate, br',
            'dnt': '1',
            'connection': 'keep-alive',
            'upgrade-insecure-requests': '1',
        }),
    }).catch((err) => {
        res.status(500).json({ error: err });
    });

    try {
        const raw = await response?.text();
        const dom = new JSDOM(raw);
        const numPagesString = dom.window.document.getElementById('result-stats')?.textContent;
        const num = parseInt(numPagesString?.split(' ')[1].replace(/,/g, '') || '0', 10);

        res.status(200).json({ num });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});
