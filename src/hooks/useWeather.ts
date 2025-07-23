import useSWR from 'swr';
import React from 'react';
import { fetcher } from '@/helpers';

interface WeatherData {
    city: string;
    name: string;
    precipitation: string;
    humidity: string;
    windSpeed: string;
    grades: string;
    imageUrl?: string;
}

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
const useWeather = (cities: string[]) => {
    const url = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/weather`);
        url.searchParams.append('cities', cities.join(','));
        return url;
    }, [cities]);

    const { data, error, isLoading } = useSWR(url.toString(), fetcher, {
        dedupingInterval: 5000,
        keepPreviousData: true,
        fallback: initialValues,
        fallbackData: initialValues,
    });

    return {
        data: data as WeatherData[] | undefined,
        error,
        loading: isLoading,
    };
};

export default useWeather;
export type { WeatherData };
