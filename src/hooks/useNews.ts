import useSWR from 'swr';
import React from 'react';
import { fetcher } from '@/helpers';

const useNews = (city: string) => {
    const memoUrl = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/news`);
        url.searchParams.set('city', city);
        return url;
    }, [city]);

    const { data, error, isLoading } = useSWR(memoUrl, fetcher, {
        keepPreviousData: true,
        fallbackData: {
            news: [
                {
                    link: '',
                    title: '',
                    published: '',
                    description: '',
                },
            ],
        },
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useNews;
