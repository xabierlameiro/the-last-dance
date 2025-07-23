import useSWR from 'swr';
import type { CounterData } from '../types/api';

const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/indexed-pages`;

const fetchCounter = async (url: string): Promise<CounterData> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch counter data: ${response.statusText}`);
    }
    const data = await response.json();
    return data as CounterData;
};

const useIndexedPages = () => {
    const { data, error, isLoading } = useSWR<CounterData>(url, fetchCounter, {
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
