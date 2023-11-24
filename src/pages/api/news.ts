// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import jsdom from 'jsdom';
import allowCors from '../../helpers/cors';

/**
 * @description Get weather data for a city
 * @param city {string}
 * @returns Promise<{city: string, news: {title: string, description: string, link: string, published: string}[]}>
 * @example getWeatherData('London')
 * @example getWeatherData('Madrid')
 */
const getWeatherData = async (city: string) => {
    const { JSDOM } = jsdom;

    const response = await fetch(`https://www.google.com/search?q=${city}&tbm=nws&tbs=sbd:1`, {
        method: 'GET',
        headers: {
            authority: 'www.google.com',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'cache-control': 'no-cache',
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            'access-control-allow-origin': '*',
        },
        redirect: 'follow',
    });
    const raw = await response.text();
    const dom = new JSDOM(raw);
    const elements = dom.window.document.querySelectorAll('.SoaBEf');

    if (!elements) return null;

    const news = Array.from(elements).map((element) => {
        return {
            title: element.querySelector('[role="heading"]')?.textContent,
            description: element.querySelector('.GI74Re.nDgy9d')?.textContent,
            link: element.querySelector('a')?.href,
            published: element.querySelector('.OSrXXb.ZE0LJd.YsWzw')?.textContent,
        };
    });

    return {
        city: city,
        news,
    };
};

/**
 *
 * @description Get news for a city
 * @param req {NextApiRequest}
 * @param res {NextApiResponse}
 * @returns Promise<void>
 * @example http://localhost:3000/api/news?city=London
 */
export default allowCors(async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const { query } = req;
    const { city } = query;

    if (!city || typeof city !== 'string') {
        res.status(500).json({ error: 'City must be a string' });
        return;
    }

    const data = await getWeatherData(city);

    if (!data || !data.city || !data.news) {
        res.status(500).json({ error: 'Error getting weather data' });
        return;
    }

    const response = {
        city: data.city,
        news: data.news,
    };

    res.status(200).json(response);
});
