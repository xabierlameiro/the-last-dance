import useSWR from 'swr';
import React from 'react';
import { fetcher } from '@/helpers';

const useWeather = (cities: string[]) => {
    const url = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/weather`);
        url.searchParams.append('cities', cities.join(','));
        return url;
    }, [cities]);

    const { data, error, isLoading } = useSWR(url, fetcher, {
        keepPreviousData: true,
        fallbackData: [
            {
                city: 'moraña',
                name: '',
                precipitation: 0,
                humidity: 0,
                windSpeed: 0,
                grades: 0,
                imageUrl: '',
            },
        ],
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useWeather;
