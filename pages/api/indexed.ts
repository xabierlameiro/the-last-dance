import { NextApiRequest, NextApiResponse } from 'next';

const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';

/**
 * @description Get the number of indexed pages in Google
 *
 * @returns {Promise<{ num: string } | { error: string } | void>}
 */
export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
): Promise<
    | {
          num: string;
      }
    | {
          error: string;
      }
    | void
> {
    const response = await fetch('https://www.google.com/search?q=site%3Axabierlameiro.com', {
        method: 'GET',
        headers: new Headers({
            'user-agent': userAgent,
        }),
    })
        .then((res) => res.text())
        .catch((err) => {
            throw new Error(err);
        });

    const num = response.substring(response.indexOf('id="result-stats">') + 24, response.indexOf('<nobr>') - 8);

    if (isNaN(Number(num))) {
        throw new Error(`The number of indexed pages is not a number ${num}`);
    }

    try {
        res.status(200).json({ num });
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong', err });
    }
}
