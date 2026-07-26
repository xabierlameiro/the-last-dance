import useSWR from 'swr';
import React from 'react';
import createFetcher from '@/helpers/createFetcher';
import { newsSchema } from '../types/schemas';
import type { NewsData } from '../types/api';

const fetchNews = createFetcher(newsSchema, '/api/news');

const useNews = (
    city: string
): {
    data: NewsData | undefined;
    error: Error | undefined;
    loading: boolean;
} => {
    const memoUrl = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/news`);
        url.searchParams.set('city', city);
        return url.toString();
    }, [city]);

    const { data, error, isLoading } = useSWR<NewsData, Error>(memoUrl, fetchNews, {
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
