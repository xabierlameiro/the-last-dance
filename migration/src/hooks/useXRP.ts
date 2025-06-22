import useSWR from 'swr';
import { fetcher } from '@/helpers';

const useXRP = () => {
    const { data, error, isLoading } = useSWR('/api/xrp', fetcher, {
        dedupingInterval: 5000,
        keepPreviousData: true,
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
