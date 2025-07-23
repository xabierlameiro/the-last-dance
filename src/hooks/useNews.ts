import useSWR from 'swr';
import React from 'react';
import type { NewsData } from '../types/api';

const fetchNews = async (url: string): Promise<NewsData> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch news data: ${response.statusText}`);
    }
    const data = await response.json();
    return data as NewsData;
};

const useNews = (city: string) => {
    const memoUrl = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/news`);
        url.searchParams.set('city', city);
        return url.toString();
    }, [city]);

    const { data, error, isLoading } = useSWR<NewsData>(memoUrl, fetchNews, {
        keepPreviousData: true,
        dedupingInterval: 5000,
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
