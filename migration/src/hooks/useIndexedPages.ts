import useSWR from 'swr';
import { fetcher } from '@/helpers';

const useIndexedPages = () => {
    const { data, error, isLoading } = useSWR('/api/indexed-pages', fetcher, {
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
