import { defaultLocale, MAX_STEPS } from '@/constants/site';
/**
 * @description Utility function to concatenate classes.
 *
 * @example
 *     clx('class1', 'class2', 'class3');
 *     returns 'class1 class2 class3'
 *
 * @param {(string | null | undefined)[]} classes
 * @returns {string}
 */
export const clx = (...classes: Array<string | null | undefined>) => {
    classes = classes
        .filter((element) => {
            return element !== '' && element !== null && element !== undefined;
        })
        .map((item) => item?.trim());

    if (!classes) {
        return '';
    }

    return classes.join(' ');
};

/**
 * @description Utility function to check if locale is not defaultLocale.
 *
 * @example
 *     isNotEng('en');
 *     returns false
 *
 * @param {string | undefined} locale
 * @returns {boolean}
 */
export const isNotEng = (locale: string | undefined) => locale !== defaultLocale;

/**
 * @description Utility function to clean trailing slash of a path.
 *
 * @example
 *     cleanTrailingSlash('/');
 *     returns ''
 *
 * @param {string} path
 */
export const cleanTrailingSlash = (path: string) => (path !== '/' ? path : '');

/**
 * @description Utility function to remove trailing slash of a string.
 *
 * @example
 *     removeTrailingSlash('string/');
 *     returns 'string'
 *
 * @param {string} str
 * @returns {string}
 */
export const removeTrailingSlash = (str: string) => {
    if (str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
};

/**
 * @description Utility function to return lang if not english.
 *
 * @example
 *     getLang('en');
 *     returns ''
 *
 * @param {string | undefined} lang
 */
export const getLang = (lang: string | undefined) => (isNotEng(lang) ? `/${lang}` : '');

/**
 *
 * @param ref  React.RefObject<HTMLDivElement>
 * @returns  interval
 */
export const setInverval = (ref: React.RefObject<HTMLDivElement>) => {
    let step = 0;
    const interval = setInterval(() => {
        if (ref.current) {
            step += 1;
            if (step < MAX_STEPS) {
                ref.current.scrollBy({
                    top: ref.current.clientHeight,
                    behavior: 'smooth',
                });
            } else {
                step = 0;
                ref.current.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });
            }
        }
    }, 15000);

    return interval;
};

/**
 * @description Utility function to use SWR with fetcher.
 * @example const { data, error } = useSWR('/api/weather', fetcher);
 * @param {string} url
 * @returns {Promise<any>}
 * @see https://swr.vercel.app/docs/data-fetching
 */
export const fetcher = (url: string) => fetch(url).then((res) => res.json());
