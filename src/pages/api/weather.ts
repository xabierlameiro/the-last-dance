// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import console from '@/helpers/console';
import allowCors from '../../helpers/cors';
import { isValidCityName } from '../../helpers/city';

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

type GeocodingResponse = {
    results?: Array<{ latitude: number; longitude: number; name: string; country?: string }>;
};

type ForecastResponse = {
    current?: {
        temperature_2m: number;
        relative_humidity_2m: number;
        precipitation: number;
        wind_speed_10m: number;
        weather_code: number;
    };
};

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
    const query = city.split('+')[0].trim();

    const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.searchParams.set('name', query);
    geoUrl.searchParams.set('count', '1');
    geoUrl.searchParams.set('language', 'en');
    geoUrl.searchParams.set('format', 'json');

    const geoRes = await fetch(geoUrl.toString());
    if (!geoRes.ok) {
        throw new Error(`Geocoding HTTP error! status: ${geoRes.status}`);
    }
    const geo = (await geoRes.json()) as GeocodingResponse;
    const place = geo?.results?.[0];
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

    const forecastRes = await fetch(forecastUrl.toString());
    if (!forecastRes.ok) {
        throw new Error(`Forecast HTTP error! status: ${forecastRes.status}`);
    }
    const forecast = (await forecastRes.json()) as ForecastResponse;
    const current = forecast?.current;
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
