import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/helpers';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslationSimple';

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
    const pathname = usePathname();
    const { lang } = useTranslation();
    let slug = lang === 'en' ? pathname : `/${lang}${pathname}`;

    const memoUrl = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/analytics`);
        url.searchParams.set('slug', all ? '' : slug);
        return url;
    }, [all, slug]);

    const { data, error, isLoading } = useSWR(memoUrl, fetcher, {
        keepPreviousData: all ? true : false,
        fallback: initialValues,
        fallbackData: initialValues,
        dedupingInterval: 5000,
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useAnalytics;
