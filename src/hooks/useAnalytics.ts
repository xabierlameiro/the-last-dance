import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import createFetcher from '@/helpers/createFetcher';
import { analyticsSchema } from '../types/schemas';
import type { AnalyticsData } from '../types/api';

const initialValues: AnalyticsData = {
    pageViews: 0,
    newUsers: 0,
};

/**
 * SDD-L07: `error` was declared `boolean` here and in every sibling hook. SWR types its response as
 * `SWRResponse<Data, Error>` with `Error` defaulting to `any` when only the first generic is given,
 * and `any` assigns to `boolean` without complaint. So the declaration said boolean, an `Error`
 * object flowed, and every widget could show only one undifferentiated error icon — a boolean cannot
 * express anything else.
 */
type ReturnType = {
    data: AnalyticsData;
    error: Error | undefined;
    loading: boolean;
};

const fetchAnalytics = createFetcher(analyticsSchema, '/api/analytics');

const useAnalytics = (all?: boolean): ReturnType => {
    const { asPath, locale } = useRouter();
    const slug = locale === 'en' ? asPath : `/${locale}${asPath}`;

    const memoUrl = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/analytics`);
        url.searchParams.set('slug', all ? '' : slug);
        return url.toString();
    }, [all, slug]);

    const { data, error, isLoading } = useSWR<AnalyticsData, Error>(memoUrl, fetchAnalytics, {
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
