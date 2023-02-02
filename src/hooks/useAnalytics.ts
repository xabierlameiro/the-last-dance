import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/helpers';
import { useRouter } from 'next/router';

const initialValues = {};

type ReturnType = {
    data: {
        pageViews: number;
        newUsers: number;
    };
    error: boolean;
    loading: boolean;
};

const useAnalytics = (all?: boolean): ReturnType => {
    const { asPath, locale } = useRouter();
    let slug = locale === 'en' ? asPath : `/${locale}${asPath}`;

    const memoUrl = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/analytics`);
        url.searchParams.set('slug', all ? '' : slug);
        return url;
    }, [all, slug]);

    const { data, error, isLoading } = useSWR(memoUrl, fetcher, {
        keepPreviousData: all ? true : false,
        fallback: initialValues,
        fallbackData: initialValues,
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useAnalytics;
