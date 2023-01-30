import useSWR from 'swr';
import { fetcher } from '@/helpers';

const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/api/github-stars`);

const useGithubStars = () => {
    const { data, error, isLoading } = useSWR(url, fetcher, {
        fallbackData: 0,
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useGithubStars;
