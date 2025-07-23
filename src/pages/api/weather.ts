// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';
import console from '@/helpers/console';
import allowCors from '../../helpers/cors';

interface WeatherData {
    city: string;
    name?: string | null;
    precipitation?: string | null;
    humidity?: string | null;
    windSpeed?: string | null;
    grades?: string | null;
    imageUrl?: string;
}

type WeatherResponse = WeatherData[] | { error: string };

const getWeatherData = async (city: string): Promise<WeatherData> => {
    // const { JSDOM } = jsdom; // Already imported above
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

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const raw = await response.text();
    const dom = new JSDOM(raw);
    const weatherBox = dom.window.document.querySelector('#wob_wc') as HTMLImageElement;

    if (!weatherBox) {
        console.warn(`Weather widget not found for city: ${city}`);
        // Return basic structure with city name only if weather widget is not found
        return {
            city,
            name: null,
            precipitation: null,
            humidity: null,
            windSpeed: null,
            grades: null,
            imageUrl: undefined,
        };
    }

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
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        }
        throw new Error('Unknown error occurred');
    }
};

/**
 * @description Get weather data from google
 * @param req {NextApiRequest}
 * @param res {NextApiResponse}
 * @returns Promise<void>
 * @example http://localhost:3000/api/weather?cities=Madrid,Barcelona
 */
export default allowCors(async function handler(
    req: NextApiRequest,
    res: NextApiResponse<WeatherResponse>
) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query } = req;
    const { cities = '' } = query;

    // Validate cities parameter
    if (!cities || typeof cities !== 'string') {
        return res.status(400).json({ error: 'Cities parameter must be a non-empty string' });
    }

    // Validate cities format and length
    const citiesArray = String(cities).split(',').map(city => city.trim()).filter(Boolean);
    
    if (citiesArray.length === 0) {
        return res.status(400).json({ error: 'At least one city must be provided' });
    }
    
    if (citiesArray.length > 5) {
        return res.status(400).json({ error: 'Maximum 5 cities allowed' });
    }

    // Validate each city name (basic validation)
    const invalidCities = citiesArray.filter(city => 
        !city || city.length < 2 || city.length > 50 || !/^[a-zA-ZÀ-ÿ\s-]+$/.test(city)
    );
    
    if (invalidCities.length > 0) {
        return res.status(400).json({ error: `Invalid city names: ${invalidCities.join(', ')}` });
    }

    try {

        await Promise.allSettled(citiesArray.map((city) => getWeatherData(city)))
            .then((raw) => {
                const results = raw
                    .filter((r): r is PromiseFulfilledResult<WeatherData> => r.status === 'fulfilled')
                    .map((result) => result.value);
                res.status(200).json(results);
            })
            .catch((err) => res.status(500).json({ error: err.message }));
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
    }
});
