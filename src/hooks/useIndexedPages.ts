import useSWR from 'swr';
import { fetcher } from '@/helpers';

const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/indexed-pages`);

const useIndexedPages = () => {
    const { data, error, isLoading } = useSWR(url, fetcher, {
        dedupingInterval: 5000,
        fallbackData: {
            num: 0,
        },
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useIndexedPages;
