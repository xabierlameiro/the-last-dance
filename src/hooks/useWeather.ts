import useSWR from 'swr';
import React from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useWeather = (cities: string[]) => {
    const url = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/weather`);
        url.searchParams.append('cities', cities.join(','));
        return url;
    }, [cities]);

    const { data, error } = useSWR(url, fetcher, {
        keepPreviousData: true,
    });

    return {
        data,
        error,
    };
};

export default useWeather;
