import { clx, isNotEng, cleanTrailingSlash, removeTrailingSlash, getLang } from '..';

describe('clx', () => {
    it('Should return empty string', () => {
        expect(clx()).toBe('');
        expect(clx('')).toBe('');
    });

    it('Should return class name', () => {
        expect(clx('a')).toBe('a');
        expect(clx('a', 'b')).toBe('a b');
        expect(clx('a', 'b', 'c')).toBe('a b c');
    });

    it('Should return class name with condition', () => {
        const conditionTrue = true;
        const conditionFalse = false;
        expect(clx('a', conditionTrue ? 'b' : '')).toBe('a b');
        expect(clx('a', conditionFalse ? 'b' : '')).toBe('a');
        expect(clx('a', conditionTrue ? 'b' : '', conditionFalse ? 'c' : '')).toBe('a b');
    });

    it('Should return class name with condition and null', () => {
        const conditionTrue = true;
        const conditionFalse = false;
        expect(clx('a', conditionTrue ? 'b' : '', null)).toBe('a b');
        expect(clx('a', conditionFalse ? 'b' : '', null)).toBe('a');
        expect(clx('a', conditionTrue ? 'b' : '', conditionFalse ? 'c' : '', null)).toBe('a b');
    });

    it('Should return class name with condition and undefined', () => {
        const conditionTrue = true;
        const conditionFalse = false;
        expect(clx('a', conditionTrue ? 'b' : '', undefined)).toBe('a b');
        expect(clx('a', conditionFalse ? 'b' : '', undefined)).toBe('a');
        expect(clx('a', conditionTrue ? 'b' : '', conditionFalse ? 'c' : '', undefined)).toBe('a b');
    });
});

describe('other helper utilities', () => {
    it('isNotEng should check default locale', () => {
        expect(isNotEng('es')).toBe(true);
        expect(isNotEng('en')).toBe(false);
        expect(isNotEng(undefined)).toBe(true);
    });

    it('cleanTrailingSlash should remove only root slash', () => {
        expect(cleanTrailingSlash('/')).toBe('');
        expect(cleanTrailingSlash('/es')).toBe('/es');
    });

    it('removeTrailingSlash should trim slash at end', () => {
        expect(removeTrailingSlash('path/')).toBe('path');
        expect(removeTrailingSlash('path')).toBe('path');
    });

    it('getLang should prefix lang when not english', () => {
        expect(getLang('es')).toBe('/es');
        expect(getLang('en')).toBe('');
    });

    // SDD-L07 removed the generic `fetcher` from this barrel. It resolved `unknown`, so both of its
    // callers cast at the call site, and it competed with six hand-rolled copies in the hooks. Its
    // replacement is `helpers/createFetcher.ts`, covered by createFetcher.test.tsx.
});
