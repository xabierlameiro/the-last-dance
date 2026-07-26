import useSWR from 'swr';
import createFetcher from '@/helpers/createFetcher';
import { xrpSchema } from '../types/schemas';
import type { XRPData } from '../types/api';

const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/xrp`;

const fetchXRP = createFetcher(xrpSchema, '/api/xrp');

const useXRP = (): {
    data: XRPData | undefined;
    error: Error | undefined;
    loading: boolean;
} => {
    const { data, error, isLoading } = useSWR<XRPData, Error>(url, fetchXRP, {
        dedupingInterval: 5000,
        keepPreviousData: true,
        fallbackData: {
            price: 0,
            todaySummary: '',
            todayPercentage: '0%',
        },
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useXRP;
