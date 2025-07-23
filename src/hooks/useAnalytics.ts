import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import type { AnalyticsData } from '../types/api';

const initialValues: AnalyticsData = {
    pageViews: 0,
    newUsers: 0,
};

type ReturnType = {
    data: AnalyticsData;
    error: boolean;
    loading: boolean;
};

const fetchAnalytics = async (url: string): Promise<AnalyticsData> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
    }
    const data = await response.json();
    return data as AnalyticsData;
};

const useAnalytics = (all?: boolean): ReturnType => {
    const { asPath, locale } = useRouter();
    const slug = locale === 'en' ? asPath : `/${locale}${asPath}`;

    const memoUrl = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/analytics`);
        url.searchParams.set('slug', all ? '' : slug);
        return url.toString();
    }, [all, slug]);

    const { data, error, isLoading } = useSWR<AnalyticsData>(memoUrl, fetchAnalytics, {
        keepPreviousData: all ? true : false,
        fallback: initialValues,
        fallbackData: initialValues,
        dedupingInterval: 5000,
    });

    return {
        data: data ?? initialValues,
        error,
        loading: isLoading,
    };
};

export default useAnalytics;
