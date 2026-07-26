import useSWR from 'swr';
import React from 'react';
import createFetcher from '@/helpers/createFetcher';
import { weatherSchema } from '../types/schemas';
import type { WeatherData } from '../types/schemas';

/**
 * SDD-L07: the local `WeatherData` declared here was the third copy of this shape, and the only one
 * that claimed `name`, `precipitation`, `humidity`, `windSpeed` and `grades` are always strings.
 * `/api/weather` answers with an explicit `null` in each of them for a city that geocodes but has no
 * current forecast, so the declaration was wrong for a case the route deliberately produces. The
 * shape now comes from the schema the response is checked against.
 */
const initialValues: WeatherData[] = [
    {
        city: 'moraña',
        name: 'Partly cloudy',
        precipitation: '0%',
        humidity: '50%',
        windSpeed: '10 km/h',
        grades: '15',
        imageUrl: '',
    },
];

const fetchWeather = createFetcher(weatherSchema, '/api/weather');

const useWeather = (
    cities: string[]
): {
    data: WeatherData[] | undefined;
    error: Error | undefined;
    loading: boolean;
} => {
    const url = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/weather`);
        url.searchParams.append('cities', cities.join(','));
        return url;
    }, [cities]);

    const { data, error, isLoading } = useSWR<WeatherData[], Error>(url.toString(), fetchWeather, {
        dedupingInterval: 5000,
        keepPreviousData: true,
        fallback: initialValues,
        fallbackData: initialValues,
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useWeather;
export type { WeatherData };
