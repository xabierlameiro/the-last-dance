import useSWR from 'swr';
import { fetcher } from '@/helpers';

const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/xrp`);

const useXRP = () => {
    const { data, error, isLoading } = useSWR(url, fetcher, {
        dedupingInterval: 5000,
        fallbackData: {
            price: 0,
            todaySummary: '',
            todayPorcentage: '',
        },
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useXRP;
