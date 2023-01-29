import useSWR from 'swr';
import React from 'react';

const useWeather = (cities: string[]) => {
    const url = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/weather`);
        url.searchParams.append('cities', cities.join(','));
        return url;
    }, [cities]);

    const { data, error } = useSWR(url, (url: string) => fetch(url).then((res) => res.json()), {
        keepPreviousData: true,
        // refresh interval 1 minute
        refreshInterval: 5000 * 60,
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    return {
        data,
        error,
    };
};

export default useWeather;
