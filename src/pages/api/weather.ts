// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import jsdom from 'jsdom';

const getWeatherData = async (city: string) => {
    const { JSDOM } = jsdom;
    const response = await fetch(`https://www.google.com/search?q=tiempo+${city}`, {
        method: 'GET',
        headers: {
            authority: 'www.google.com',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'cache-control': 'no-cache',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        },
        redirect: 'follow',
    });
    const raw = await response.text();
    const dom = new JSDOM(raw);
    const weatherBox = dom.window.document.querySelector('#wob_wc') as HTMLImageElement;

    try {
        const grades = weatherBox.querySelector('#wob_tm')?.textContent;
        const name = weatherBox.querySelector('#wob_dc')?.textContent;
        const precipitation = weatherBox.querySelector('#wob_pp')?.textContent;
        const humidity = weatherBox.querySelector('#wob_hm')?.textContent;
        const windSpeed = weatherBox.querySelector('#wob_ws')?.textContent;
        const imageUrl = (weatherBox.querySelector('#dimg_1') as HTMLImageElement)?.src;

        return {
            city,
            name,
            precipitation,
            humidity,
            windSpeed,
            grades,
            imageUrl,
        };
    } catch (err: Error | unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        }
    }
};

/**
 * @description Get weather data from google
 * @param req {NextApiRequest}
 * @param res {NextApiResponse}
 * @returns Promise<void>
 * @example http://localhost:3000/api/weather?cities=Madrid,Barcelona
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const { query } = req;
    const { cities = '' } = query;

    if (!cities) {
        res.status(500).json({ error: 'query param citites must be a strings with comma' });
    }
    try {
        const citiesArray = String(cities).split(',');

        await Promise.allSettled(citiesArray.map((city) => getWeatherData(city)))
            .then((raw) => {
                const results = raw.map((result: any) => result.value);
                res.status(200).json(results);
            })
            .catch((err) => res.status(500).json({ error: err.message }));
    } catch (err: Error | unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
    }
}
