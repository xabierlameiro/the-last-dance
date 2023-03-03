import useSWR from 'swr';
import React from 'react';
import { fetcher } from '@/helpers';

const initialValues = [
    {
        city: 'moraña',
        name: '',
        precipitation: 0,
        humidity: 0,
        windSpeed: 0,
        grades: 0,
        imageUrl: '',
    },
];
const useWeather = (cities: string[]) => {
    const url = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/weather`);
        url.searchParams.append('cities', cities.join(','));
        return url;
    }, [cities]);

    const { data, error, isLoading } = useSWR(url, fetcher, {
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
