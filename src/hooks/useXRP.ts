import useSWR from 'swr';
import type { XRPData } from '../types/api';

const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/xrp`;

const fetchXRP = async (url: string): Promise<XRPData> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch XRP data: ${response.statusText}`);
    }
    const data = await response.json();
    return data as XRPData;
};

const useXRP = () => {
    const { data, error, isLoading } = useSWR<XRPData>(url, fetchXRP, {
        dedupingInterval: 5000,
        keepPreviousData: true,
        fallbackData: {
            price: 0,
            todaySummary: '',
            todayPorcentage: '0%',
        },
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useXRP;
