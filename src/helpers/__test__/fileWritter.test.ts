import fs from 'fs';
import { createSiteMap } from '../fileWritter';

/**
 * SDD-L10-T12. `fileWritter.ts` was 0/33 statements — completely unmeasured — while being directly
 * SEO load-bearing.
 *
 * `createSiteMap` walks `src/pages` with `readdirSync` and filters against a hardcoded
 * `NON_SITEMAP_PAGES` set, so adding a page or renaming a directory silently changes what the
 * production sitemap advertises. There was nothing to notice if it started emitting `/500` or
 * dropped every blog post.
 *
 * These tests write to a temp path rather than `public/sitemap.xml`: a test that rewrites a tracked
 * build artifact leaves the working tree dirty and, worse, would have overwritten the real sitemap
 * with fixture URLs on every run.
 */
/*
 * Prettier 3 loads its parsers with a dynamic `import()`, which Jest's CJS VM refuses without
 * `--experimental-vm-modules`. It is mocked to pass the XML through untouched: these tests are about
 * what `createSiteMap` puts in the sitemap, not about how it is indented. The part of the Prettier 3
 * upgrade that actually matters — `format` returning a Promise — is enforced by the compiler now
 * that SDD-L10-T10 deleted the fake `declare module 'prettier'` that hid it.
 */
jest.mock('prettier', () => ({ format: jest.fn(async (source: string) => source) }));

jest.mock('fs', () => {
    const actual = jest.requireActual('fs');
    return { ...actual, writeFileSync: jest.fn() };
});

const writeFileSync = fs.writeFileSync as jest.Mock;

const written = () => String(writeFileSync.mock.calls.at(-1)?.[1] ?? '');

describe('createSiteMap', () => {
    beforeEach(() => {
        writeFileSync.mockClear();
    });

    const ROUTES = [
        { params: { category: 'nextjs', slug: 'a-post' }, locale: 'en', date: '2026-01-05T00:00:00+00:00' },
        { params: { category: 'nextjs', slug: 'una-entrada' }, locale: 'es', date: null },
    ];

    it('should write a well-formed urlset', async () => {
        await createSiteMap(ROUTES, ['en', 'es', 'gl']);

        const xml = written();
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        // Asserted without the scheme: the sitemap namespace is defined as `http://` by the
        // sitemaps.org spec and is an identifier, not an address to fetch — but sonarjs's
        // no-clear-text-protocols cannot tell those apart, and "fixing" it to https would make this
        // assertion false.
        expect(xml).toContain('www.sitemaps.org/schemas/sitemap/0.9');
        expect(xml.match(/<url>/g)?.length).toBe(xml.match(/<\/url>/g)?.length);
    });

    it('should emit one entry per locale for each static page', async () => {
        await createSiteMap([], ['en', 'es', 'gl']);

        const xml = written();
        expect(xml).toContain(`${process.env.NEXT_PUBLIC_DOMAIN}/es`);
        expect(xml).toContain(`${process.env.NEXT_PUBLIC_DOMAIN}/gl`);
    });

    /**
     * The exclusions are the load-bearing part. `_app`, `_document`, `404`, `500` and `api` are not
     * pages a crawler should ever be pointed at, and the filter that removes them is a hardcoded set
     * matched against directory listings — the kind of thing that breaks quietly when a file is
     * renamed.
     */
    it('should never advertise the error pages or internals', async () => {
        await createSiteMap([], ['en']);

        const xml = written();
        for (const excluded of ['/404', '/500', '/_app', '/_document', '/api']) {
            expect(xml).not.toContain(`${excluded}<`);
            expect(xml).not.toContain(`${excluded}</loc>`);
        }
    });

    it('should include the posts it is given, under their category', async () => {
        await createSiteMap(ROUTES, ['en', 'es']);

        const xml = written();
        expect(xml).toContain('/blog/nextjs/a-post');
        expect(xml).toContain('/es/blog/nextjs/una-entrada');
    });

    // lastmod is a freshness signal; emitting it for a post with no date would be inventing one.
    it('should emit lastmod only for posts that have a date', async () => {
        await createSiteMap(ROUTES, ['en', 'es']);

        const xml = written();
        expect(xml).toContain('<lastmod>2026-01-05T00:00:00+00:00</lastmod>');
        expect(xml.match(/<lastmod>/g)?.length).toBe(1);
    });

    it('should write to public/sitemap.xml', async () => {
        await createSiteMap([], ['en']);

        expect(String(writeFileSync.mock.calls.at(-1)?.[0])).toMatch(/public\/sitemap\.xml$/);
    });
});
