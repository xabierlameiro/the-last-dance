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

export const isNotEng = (locale: string | undefined) => locale !== 'en';

export const cleanTrailingSlash = (path: string) => (path !== '/' ? path : '');

export const getLang = (lang: string | undefined) =>
    isNotEng(lang) ? `/${lang}` : '';
