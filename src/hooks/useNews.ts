import useSWR from 'swr';
import React from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useNews = (city: any) => {
    const url = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/news`);
        url.searchParams.set('city', city);
        return url;
    }, [city]);

    const { data, error } = useSWR(url, fetcher, {
        keepPreviousData: true,
        // refresh interval 1 minute
        refreshInterval: 1000 * 60,
        // remove auto revalidate
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    return {
        data,
        error,
    };
};

export default useNews;
