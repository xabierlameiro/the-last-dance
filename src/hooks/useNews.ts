import useSWR from 'swr';
import React from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useNews = (city: string) => {
    const url = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/news`);
        url.searchParams.set('city', city);
        return url;
    }, [city]);

    const { data, error } = useSWR(url, fetcher, {
        keepPreviousData: true,
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

export default useNews;
