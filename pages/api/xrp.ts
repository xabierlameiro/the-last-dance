import { NextApiRequest, NextApiResponse } from 'next';

const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';

/**
 * @description Get the price of XRP in EUR
 *
 * @returns {Promise<{ price: string; todaySummary: string; todayPorcentage: string } | { error: string } | void>}
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const response = await fetch('https://www.google.com/search?q=xrp+eur+price', {
        method: 'GET',
        headers: new Headers({
            'user-agent': userAgent,
        }),
    })
        .then((res) => res.text())
        .catch((err) => {
            throw new Error(err);
        });

    const price = response.substring(response.indexOf('class="pclqee"') + 15, response.indexOf('class="dvZgKd"') - 13);

    if (isNaN(Number(price))) {
        throw new Error(`The price is not a number ${price}`);
    }

    const todaySummary = response.substring(
        response.indexOf('jsname="SwWl3d"') + 16,
        response.indexOf('jsname="rfaVEf"') - 14
    );

    const todayPorcentage = response.substring(
        response.indexOf('jsname="rfaVEf"') + 17,
        response.indexOf('class="LQY0Hc"') - 33
    );

    try {
        res.status(200).json({
            price,
            todaySummary,
            todayPorcentage,
        });
    } catch (e) {
        res.status(500).json({ error: 'Something went wrong', e });
    }
}
