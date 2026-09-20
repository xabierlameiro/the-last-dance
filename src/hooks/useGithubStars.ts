import useSWR from 'swr';
import createFetcher from '@/helpers/createFetcher';
import { githubStarsSchema, type GithubStarsData } from '../types/schemas';

/**
 * SDD-L07: this was `new URL(...)` at module scope, the only hook of seven that built its key that
 * way. Two consequences. The URL object became the SWR key, so the fetcher received an object where
 * every sibling passes a string; and with `NEXT_PUBLIC_DOMAIN` unset the constructor threw
 * `Invalid URL` while the module was still being imported — which fails `next build` outright rather
 * than failing the one widget. A template string like the other six does neither.
 */
const url = `${process.env.NEXT_PUBLIC_DOMAIN}/api/github-stars`;

const fetchGithubStars = createFetcher(githubStarsSchema, '/api/github-stars');

/**
 * The fallback is a whole zeroed record rather than `0`, because the route now answers an object.
 * Without it the first render of every consumer would have to guard each field, and SWR would
 * report `undefined` data with `loading: false` on a cache hit.
 */
const EMPTY: GithubStarsData = { stars: 0, forks: 0, watchers: 0, issues: 0, pushedAt: '' };

const useGithubStars = (): {
    data: GithubStarsData | undefined;
    error: Error | undefined;
    loading: boolean;
} => {
    const { data, error, isLoading } = useSWR<GithubStarsData, Error>(url, fetchGithubStars, {
        fallbackData: EMPTY,
        dedupingInterval: 5000,
    });

    return {
        data,
        error,
        loading: isLoading,
    };
};

export default useGithubStars;
