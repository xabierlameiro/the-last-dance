import { clx } from '../';

describe('clx', () => {
    it('Should return empty string', () => {
        expect(clx()).toBe('');
        expect(clx('')).toBe('');
        expect(clx('')).toBe('');
    });
    it('Should return class name', () => {
        expect(clx('a')).toBe('a');
        expect(clx('a', 'b')).toBe('a b');
        expect(clx('a', 'b', 'c')).toBe('a b c');
    });
    it('Should return class name with condition', () => {
        expect(clx('a', true ? 'b' : '')).toBe('a b');
        expect(clx('a', false ? 'b' : '')).toBe('a');
        expect(clx('a', true ? 'b' : '', false ? 'c' : '')).toBe('a b');
    });

    it('Should return class name with condition and null', () => {
        expect(clx('a', true ? 'b' : '', null)).toBe('a b');
        expect(clx('a', false ? 'b' : '', null)).toBe('a');
        expect(clx('a', true ? 'b' : '', false ? 'c' : '', null)).toBe('a b');
    });

    it('Should return class name with condition and undefined', () => {
        expect(clx('a', true ? 'b' : '', undefined)).toBe('a b');
        expect(clx('a', false ? 'b' : '', undefined)).toBe('a');
        expect(clx('a', true ? 'b' : '', false ? 'c' : '', undefined)).toBe('a b');
    });
});

describe('other helper utilities', () => {
    const { isNotEng, cleanTrailingSlash, removeTrailingSlash, getLang } = require('..');

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

    it('fetcher should resolve json or throw', async () => {
        const { fetcher } = require('..');
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ a: 1 }),
        });
        await expect(fetcher('url')).resolves.toEqual({ a: 1 });

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            statusText: 'Bad',
        });
        await expect(fetcher('url')).rejects.toThrow('Bad');
    });
});
