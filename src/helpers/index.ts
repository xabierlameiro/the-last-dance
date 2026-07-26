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
    const filteredClasses = classes
        .filter((element) => {
            return element !== '' && element !== null && element !== undefined;
        })
        .map((item) => item?.trim())
        .filter((item) => item !== '');

    if (!filteredClasses.length) {
        return '';
    }

    return filteredClasses.join(' ');
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
 * @description Serialize a value for a JSON-LD <script> block. Escaping '<'
 * prevents breaking out of the script tag (XSS) when values derive from
 * user-influenced input such as the router locale or slugs.
 */
export const jsonLdString = (value: unknown): string => JSON.stringify(value).replace(/</g, '\\u003c');

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
export const setInverval = (ref: React.RefObject<HTMLDivElement | null>) => {
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

/*
 * SDD-L07: the generic `fetcher` used to live here. It returned `Promise<unknown>`, so both of its
 * callers cast the result at the call site, and it competed with six hand-rolled copies of the same
 * function in the hooks. All eight are now `helpers/createFetcher.ts`, which takes the route's schema
 * and returns a value that has actually been checked against it.
 *
 * It is gone rather than deprecated on purpose: leaving an unvalidated fetcher exported from the
 * barrel is how the next hook would quietly get written the old way.
 */
