import { resolveSeoUrls, robotsTags, imageTags, staticHreflangTags } from '../tags';

/**
 * SDD-L04 / SDD-L15. These are the tests that would have caught the duplicate-indexing defect.
 *
 * `seo.test.tsx` only asserted that `next-head` and one JSON-LD block render, so nothing covered
 * canonical construction — and the canonical was being built from the *router* locale rather than the
 * post's own. Combined with a locale-agnostic slug lookup and `fallback: 'blocking'`, that made every
 * post answer under every locale prefix and self-canonicalise there. Search Console confirmed the
 * same Spanish article indexed twice, each URL claiming itself canonical.
 */
describe('resolveSeoUrls', () => {
    // From jest.env.setup.js, which is the value resolveSeoUrls actually reads under test.
    const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;
    const post = {
        title: 'Fuga de memoria',
        slug: 'fuga-de-memoria-nextjs-en-produccion',
        category: 'Nextjs',
        locale: 'es',
    };

    // The regression. A Spanish post requested at the English prefix must still name the /es URL
    // canonical — never the prefix it happened to be served under.
    it('builds the canonical from the post locale, not the requested prefix', () => {
        const served = resolveSeoUrls({ meta: post, isBlog: true, locale: 'en', pathname: '/blog/nextjs/x' });

        expect(served.url).toBe(`${DOMAIN}/es/blog/nextjs/${post.slug}`);
        expect(served.url).not.toBe(`${DOMAIN}/blog/nextjs/${post.slug}`);
    });

    it('agrees with itself when the prefix and the content match', () => {
        const a = resolveSeoUrls({ meta: post, isBlog: true, locale: 'es', pathname: '/blog/nextjs/x' });
        const b = resolveSeoUrls({ meta: post, isBlog: true, locale: 'en', pathname: '/blog/nextjs/x' });

        expect(a.url).toBe(b.url);
    });

    it('puts an English post at the unprefixed URL', () => {
        const urls = resolveSeoUrls({
            meta: { ...post, locale: 'en', slug: 'nextjs-memory-leak' },
            isBlog: true,
            locale: 'en',
            pathname: '/blog/nextjs/x',
        });

        expect(urls.url).toBe(`${DOMAIN}/blog/nextjs/nextjs-memory-leak`);
    });

    // Non-blog pages genuinely exist at every prefix, so they must keep following the router.
    it('falls back to the router locale when the content declares none', () => {
        const urls = resolveSeoUrls({ meta: { title: 'Settings' }, locale: 'gl', pathname: '/settings' });

        expect(urls.url).toBe(`${DOMAIN}/gl/settings`);
    });

    // The canonical is built from the post's primary category, never the URL param, so a tag-faceted
    // URL consolidates onto the primary one. Search Console reports these as "Alternate page with
    // proper canonical tag", which is the intended outcome (SDD-009).
    it('consolidates a faceted URL onto the primary category', () => {
        const urls = resolveSeoUrls({ meta: post, isBlog: true, locale: 'es', pathname: '/blog/memory-leak/x' });

        expect(urls.url).toContain('/blog/nextjs/');
        expect(urls.url).not.toContain('/blog/memory-leak/');
    });
});

describe('staticHreflangTags', () => {
    it('declares all three locales plus x-default, with absolute URLs', () => {
        const langs = staticHreflangTags(process.env.NEXT_PUBLIC_DOMAIN, '/settings').map(
            (tag) => tag.props.hrefLang as string
        );

        expect(langs).toEqual(['en', 'es', 'gl', 'x-default']);
    });

    it('points x-default at the unprefixed URL', () => {
        const tags = staticHreflangTags(process.env.NEXT_PUBLIC_DOMAIN, '/settings');
        const xDefault = tags.find((tag) => tag.props.hrefLang === 'x-default');

        expect(xDefault?.props.href).toBe(`${process.env.NEXT_PUBLIC_DOMAIN}/settings`);
    });

    it('emits absolute URLs only', () => {
        const hrefs = staticHreflangTags(process.env.NEXT_PUBLIC_DOMAIN, '/settings').map(
            (tag) => tag.props.href as string
        );

        for (const href of hrefs) expect(href).toMatch(/^https:\/\//);
    });
});

describe('robotsTags', () => {
    it('opts into large image previews on indexable pages', () => {
        const content = robotsTags(false)[0].props.content as string;

        expect(content).toContain('index,follow');
        expect(content).toContain('max-image-preview:large');
    });

    // A noindex page must not also be asking for a big thumbnail.
    it('says only noindex when the page is excluded', () => {
        const content = robotsTags(true)[0].props.content as string;

        expect(content).toBe('noindex');
    });
});

describe('imageTags', () => {
    it('declares dimensions so a scraper can lay out the card without fetching', () => {
        const props = imageTags(true, `${process.env.NEXT_PUBLIC_DOMAIN}/og-home.jpg`, 'A title').map(
            (tag) => tag.props
        );

        expect(props).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ property: 'og:image:width', content: '1200' }),
                expect.objectContaining({ property: 'og:image:height', content: '630' }),
                expect.objectContaining({ property: 'og:image:alt', content: 'A title' }),
            ])
        );
    });

    it('omits the alt when there is no title to use', () => {
        const properties = imageTags(true, `${process.env.NEXT_PUBLIC_DOMAIN}/og-home.jpg`).map(
            (tag) => tag.props.property as string
        );

        expect(properties).not.toContain('og:image:alt');
    });
});
