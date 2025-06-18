import { NextRequest, NextResponse } from 'next/server'
import { handleCors } from '../../../helpers/cors'

interface WeatherData {
    city: string;
    name?: string | null;
    precipitation?: string | null;
    humidity?: string | null;
    windSpeed?: string | null;
    grades?: string | null;
    imageUrl?: string;
}

interface WttrResponse {
    current_condition: Array<{
        temp_C: string;
        humidity: string;
        windspeedKmph: string;
        precipMM: string;
        weatherCode: string;
        weatherDesc: Array<{ value: string }>;
    }>;
    weather?: Array<any>;
}

const getWeatherData = async (city: string): Promise<WeatherData> => {
    try {
        // Using wttr.in - free weather API without API key
        const response = await fetch(
            `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; XabierLameiro/1.0)',
                },
                // Next.js 15: Use no-store for fresh data on every request
                cache: 'no-store'
            }
        );

        if (!response.ok) {
            throw new Error(`Weather API error! status: ${response.status}`);
        }

        const data: WttrResponse = await response.json();
        
        if (!data.current_condition?.[0]) {
            throw new Error('Weather data not found');
        }

        const current = data.current_condition[0];
        
        // Extract weather data
        const temp = parseInt(current.temp_C);
        const humidity = parseInt(current.humidity);
        const windSpeed = Math.round(parseFloat(current.windspeedKmph));
        const precipitation = current.precipMM ? `${current.precipMM} mm` : '0%';
        const description = current.weatherDesc?.[0]?.value ?? 'N/A';
        
        // Create a simple weather icon URL (using free service)
        const weatherCode = current.weatherCode ?? '113';
        const imageUrl = `https://cdn.worldweatheronline.com/images/wsymbols01_png_64/${weatherCode}.png`;
        
        return {
            city,
            name: description,
            precipitation,
            humidity: `${humidity}%`,
            windSpeed: `${windSpeed} km/h`,
            grades: `${temp}°`,
            imageUrl,
        };
    } catch (error) {
        // If API call fails, throw error to be handled by the main function
        throw new Error(`Failed to fetch weather data for ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * @description Get weather data using wttr.in free API
 * @example GET /api/weather?cities=Madrid,Barcelona
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const cities = searchParams.get('cities')

    if (!cities) {
        const response = NextResponse.json(
            { error: 'query param cities must be a string with comma separated values' },
            { status: 400 }
        )
        return handleCors(response)
    }

    try {
        const citiesArray = cities.split(',')

        const results = await Promise.allSettled(citiesArray.map((city) => getWeatherData(city)))
        const weatherData = results
            .filter((r): r is PromiseFulfilledResult<WeatherData> => r.status === 'fulfilled')
            .map((result) => result.value)

        const response = NextResponse.json(weatherData)
        return handleCors(response)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        const response = NextResponse.json({ error: errorMessage }, { status: 500 })
        return handleCors(response)
    }
}
