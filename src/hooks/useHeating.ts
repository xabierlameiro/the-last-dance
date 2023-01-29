import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/heating`);

const useHeating = (): {
    data: {
        outsideTemp: number;
        zoneMeasuredTemp: number;
    };
    error: {
        statusCode: number;
        message: string;
    };
} => {
    const { data, error } = useSWR(url, fetcher, {
        keepPreviousData: true,
    });

    return {
        data,
        error,
    };
};

export default useHeating;
