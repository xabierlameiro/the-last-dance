import useSWR from 'swr';
import createFetcher from '@/helpers/createFetcher';
import { counterSchema } from '../types/schemas';
import type { CounterData } from '../types/api';

const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/indexed-pages`;

const fetchCounter = createFetcher(counterSchema, '/api/indexed-pages');

const useIndexedPages = (): {
    data: CounterData | undefined;
    error: Error | undefined;
    loading: boolean;
} => {
    const { data, error, isLoading } = useSWR<CounterData, Error>(url, fetchCounter, {
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
