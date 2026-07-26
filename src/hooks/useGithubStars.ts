import useSWR from 'swr';
import createFetcher from '@/helpers/createFetcher';
import { githubStarsSchema } from '../types/schemas';

/**
 * SDD-L07: this was `new URL(...)` at module scope, the only hook of seven that built its key that
 * way. Two consequences. The URL object became the SWR key, so the fetcher received an object where
 * every sibling passes a string; and with `NEXT_PUBLIC_DOMAIN` unset the constructor threw
 * `Invalid URL` while the module was still being imported — which fails `next build` outright rather
 * than failing the one widget. A template string like the other six does neither.
 */
const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/github-stars`;

const fetchGithubStars = createFetcher(githubStarsSchema, '/api/github-stars');

const useGithubStars = (): {
    data: number | undefined;
    error: Error | undefined;
    loading: boolean;
} => {
    const { data, error, isLoading } = useSWR<number, Error>(url, fetchGithubStars, {
        fallbackData: 0,
        dedupingInterval: 5000,
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useGithubStars;
