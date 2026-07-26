// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import console from '@/helpers/console';
import allowCors from '../../helpers/cors';
import { CACHE, fetchWithTimeout } from '@/helpers/http';
import { isValidCityName } from '../../helpers/city';
import { describeIssues } from '../../types/schemas';
import { forecastSchema, geocodingSchema } from '../../types/upstream';
import type { WeatherData } from '../../types/api';

// SDD-L07: the response shape was declared here, again in `useWeather`, and a third time nowhere —
// the client took it via `data as WeatherData[]`. One schema now, in `types/schemas.ts`, and the two
// upstream shapes are checked rather than asserted with `as`.
type WeatherResponse = WeatherData[] | { error: string };

// Minimal WMO weather-code → description map, used as the image alt / name.
const WEATHER_CODE_TEXT: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
};

// WMO weather-code → local icon under public/weather/ (SDD-001: no remote image hosts involved).
const WEATHER_CODE_ICON: Record<number, string> = {
    0: 'sun',
    1: 'sun',
    2: 'partly-cloudy',
    3: 'cloud',
    45: 'fog',
    48: 'fog',
    51: 'drizzle',
    53: 'drizzle',
    55: 'drizzle',
    61: 'rain',
    63: 'rain',
    65: 'rain',
    71: 'snow',
    73: 'snow',
    75: 'snow',
    80: 'showers',
    81: 'showers',
    82: 'showers',
    95: 'storm',
    96: 'storm',
    99: 'storm',
};

const emptyWeather = (city: string): WeatherData => ({
    city,
    name: null,
    precipitation: null,
    humidity: null,
    windSpeed: null,
    grades: null,
    imageUrl: undefined,
});

/**
 * @description Get current weather for a city from Open-Meteo (free, no API key).
 * City names arrive as "limerick+ireland"; the first token is used to geocode,
 * then the resulting coordinates feed the forecast endpoint.
 */
const getWeatherData = async (city: string): Promise<WeatherData> => {
    const query = (city.split('+')[0] ?? city).trim();

    const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.searchParams.set('name', query);
    geoUrl.searchParams.set('count', '1');
    geoUrl.searchParams.set('language', 'en');
    geoUrl.searchParams.set('format', 'json');

    const geoRes = await fetchWithTimeout(geoUrl.toString());
    if (!geoRes.ok) {
        throw new Error(`Geocoding HTTP error! status: ${geoRes.status}`);
    }
    const geo = geocodingSchema.safeParse(await geoRes.json());
    if (!geo.success) {
        throw new Error(`Geocoding response did not match: ${describeIssues(geo.error.issues)}`);
    }
    const place = geo.data.results?.[0];
    if (!place) {
        console.warn(`No geocoding result for city: ${city}`);
        return emptyWeather(city);
    }

    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.searchParams.set('latitude', String(place.latitude));
    forecastUrl.searchParams.set('longitude', String(place.longitude));
    forecastUrl.searchParams.set(
        'current',
        'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code'
    );

    const forecastRes = await fetchWithTimeout(forecastUrl.toString());
    if (!forecastRes.ok) {
        throw new Error(`Forecast HTTP error! status: ${forecastRes.status}`);
    }
    const forecast = forecastSchema.safeParse(await forecastRes.json());
    if (!forecast.success) {
        throw new Error(`Forecast response did not match: ${describeIssues(forecast.error.issues)}`);
    }
    const current = forecast.data.current;
    if (!current) {
        console.warn(`No forecast data for city: ${city}`);
        return emptyWeather(city);
    }

    return {
        city,
        name: WEATHER_CODE_TEXT[current.weather_code] ?? null,
        grades: `${Math.round(current.temperature_2m)}`,
        precipitation: `${current.precipitation} mm`,
        humidity: `${current.relative_humidity_2m}%`,
        windSpeed: `${Math.round(current.wind_speed_10m)} km/h`,
        imageUrl: WEATHER_CODE_ICON[current.weather_code]
            ? `/weather/${WEATHER_CODE_ICON[current.weather_code]}.svg`
            : undefined,
    };
};

/**
 * @description Get weather data from Open-Meteo
 * @param req {NextApiRequest}
 * @param res {NextApiResponse}
 * @returns Promise<void>
 * @example http://localhost:3000/api/weather?cities=Madrid,Barcelona
 */
export default allowCors(async function handler(req: NextApiRequest, res: NextApiResponse<WeatherResponse>) {
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
    const citiesArray = String(cities)
        .split(',')
        .map((city) => city.trim())
        .filter(Boolean);

    if (citiesArray.length === 0) {
        return res.status(400).json({ error: 'At least one city must be provided' });
    }

    if (citiesArray.length > 5) {
        return res.status(400).json({ error: 'Maximum 5 cities allowed' });
    }

    const invalidCities = citiesArray.filter((city) => !isValidCityName(city));

    if (invalidCities.length > 0) {
        return res.status(400).json({ error: `Invalid city names: ${invalidCities.join(', ')}` });
    }

    /*
     * SDD-L07 rewrote this block. It had three defects stacked on each other:
     *
     * 1. `.catch()` on a `Promise.allSettled` chain was unreachable. `allSettled` never rejects —
     *    that is its whole contract — so the only way into it was the `.then` body itself throwing,
     *    which would then try to send a second response over one already sent.
     * 2. When every upstream call failed, `results` was `[]` and the route answered **200 with an
     *    empty array**. The client saw neither an error nor a loading state, so the widget rendered
     *    nothing at all and looked like a styling bug. A total failure is a 502.
     * 3. The outer catch was `if (err instanceof Error)`. Anything else thrown — and a rejected
     *    fetch in Node can surface as a `DOMException` for a timeout, which is not an `Error`
     *    subclass in every runtime — sent no response whatsoever, leaving the request hanging until
     *    the platform's function timeout killed it.
     *
     * A partial failure still answers 200 with the cities that did resolve: one unreachable city
     * should not blank the other four.
     */
    try {
        const settled = await Promise.allSettled(citiesArray.map((city) => getWeatherData(city)));
        const results = settled
            .filter((result): result is PromiseFulfilledResult<WeatherData> => result.status === 'fulfilled')
            .map((result) => result.value);

        if (results.length === 0) {
            settled.forEach((result) => {
                if (result.status === 'rejected') console.error('Weather API upstream failure:', result.reason);
            });
            res.setHeader('Cache-Control', CACHE.error);
            return res.status(502).json({ error: 'Weather service unavailable' });
        }

        res.setHeader('Cache-Control', CACHE.weather);
        return res.status(200).json(results);
    } catch (err: unknown) {
        console.error('Weather API Error:', err);
        res.setHeader('Cache-Control', CACHE.error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
