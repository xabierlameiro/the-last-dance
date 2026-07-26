import useSWR from 'swr';
import createFetcher from '@/helpers/createFetcher';
import { heatingSchema } from '../types/schemas';
import type { HeatingData } from '../types/api';

const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/heating`;

const initialValues: HeatingData = {
    outsideTemp: 0,
    zoneMeasuredTemp: 0,
};

const fetchHeating = createFetcher(heatingSchema, '/api/heating');

const useHeating = (): {
    data: HeatingData;
    error: Error | undefined;
    loading: boolean;
} => {
    const { data, error, isLoading } = useSWR<HeatingData, Error>(url, fetchHeating, {
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
