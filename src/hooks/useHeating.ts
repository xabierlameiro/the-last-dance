import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/heating`);

const useHeating = (): {
    data: {
        outsideTemp: number;
        zoneMeasuredTemp: number;
    };
    error: boolean;
    loading: boolean;
} => {
    const { data, error, isLoading } = useSWR(url, fetcher, {
        keepPreviousData: true,
        fallbackData: {
            outsideTemp: 0,
            zoneMeasuredTemp: 0,
        },
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useHeating;
