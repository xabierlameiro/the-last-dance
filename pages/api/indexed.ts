import { NextApiRequest, NextApiResponse } from 'next';

const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';

/**
 * @description Get the number of indexed pages in Google
 *
 * @returns {number} Number of indexed pages
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const response = await fetch('https://www.google.com/search?q=site%3Axabierlameiro.com', {
        method: 'GET',
        headers: new Headers({
            'user-agent': userAgent,
        }),
    });
    const dataString = await response.text();

    const num = dataString.substring(dataString.indexOf('id="result-stats">') + 24, dataString.indexOf('<nobr>') - 8);

    try {
        res.status(200).json({ num });
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong', err });
    }
}
