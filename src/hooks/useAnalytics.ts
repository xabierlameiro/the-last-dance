import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/helpers';
import { useRouter } from 'next/router';

const initialValues = {};

type Props = {
    all?: boolean;
};

const useAnalytics = ({ all }: Props) => {
    const { asPath } = useRouter();
    const memoUrl = React.useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/analytics`);
        url.searchParams.set('slug', all ? '' : asPath);
        return url;
    }, [all, asPath]);

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
