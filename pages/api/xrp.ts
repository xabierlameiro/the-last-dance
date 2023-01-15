import { NextApiRequest, NextApiResponse } from 'next';

const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const response = await fetch('https://www.google.com/search?q=xrp+eur+price', {
        method: 'GET',
        headers: new Headers({
            'user-agent': userAgent,
        }),
    });
    const dataString = await response.text();

    const price = dataString.substring(
        dataString.indexOf('class="pclqee"') + 15,
        dataString.indexOf('class="dvZgKd"') - 13
    );

    const todaySummary = dataString.substring(
        dataString.indexOf('jsname="SwWl3d"') + 16,
        dataString.indexOf('jsname="rfaVEf"') - 14
    );

    const todayPorcentage = dataString.substring(
        dataString.indexOf('jsname="rfaVEf"') + 17,
        dataString.indexOf('class="LQY0Hc"') - 33
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
