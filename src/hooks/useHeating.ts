import useSWR from 'swr';
import type { HeatingData } from '../types/api';

const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/heating`;

const initialValues: HeatingData = {
    outsideTemp: 0,
    zoneMeasuredTemp: 0,
};

const fetchHeating = async (url: string): Promise<HeatingData> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch heating data: ${response.statusText}`);
    }
    const data = await response.json();
    return data as HeatingData;
};

const useHeating = (): {
    data: HeatingData;
    error: boolean;
    loading: boolean;
} => {
    const { data, error, isLoading } = useSWR<HeatingData>(url, fetchHeating, {
        keepPreviousData: true,
        fallback: initialValues,
        fallbackData: initialValues,
        dedupingInterval: 5000,
    });

    return {
        data: data ?? initialValues,
        error,
        loading: isLoading,
    };
};

export default useHeating;
