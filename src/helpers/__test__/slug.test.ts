import { isSafeSlug, isSafePagePath } from '../slug';

describe('isSafeSlug', () => {
    it.each(['dark-theme-in-nextjs', 'compoñentes', 'a', 'post-123'])('accepts %s', (value) => {
        expect(isSafeSlug(value)).toBe(true);
    });

    it.each([
        ['parent traversal', '../secrets'],
        ['traversal mid-string', 'posts/../../etc/passwd'],
        ['forward slash', 'blog/post'],
        ['backslash', 'blog\\post'],
        ['windows traversal', '..\\..\\windows'],
        ['empty string', ''],
    ])('rejects %s', (_label, value) => {
        expect(isSafeSlug(value)).toBe(false);
    });

    it.each([
        ['undefined', undefined],
        ['null', null],
        ['number', 42],
        ['array from a repeated query param', ['a', 'b']],
    ])('rejects a non-string: %s', (_label, value) => {
        expect(isSafeSlug(value)).toBe(false);
    });
});

describe('isSafePagePath', () => {
    // Page paths legitimately contain separators, so '/' must stay allowed here
    it.each(['/es/blog/react/hooks', '/', '/settings'])('accepts %s', (value) => {
        expect(isSafePagePath(value)).toBe(true);
    });

    it.each([
        ['parent traversal', '/blog/../../etc/passwd'],
        ['backslash', '/blog\\post'],
    ])('rejects %s', (_label, value) => {
        expect(isSafePagePath(value)).toBe(false);
    });

    it('rejects a non-string', () => {
        expect(isSafePagePath(undefined)).toBe(false);
    });
});
