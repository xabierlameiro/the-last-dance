import { getStaticProps } from '../pages/blog/[category]/[slug]';

/**
 * gsc-indexing-hygiene D3. `getPostBySlug` resolves a post on slug and locale alone, so before this
 * guard every category segment served every slug at 200 — /blog/javascript/npm-token-solution-error
 * and /blog/react/npm-token-solution-error both answered 200 with a canonical under /blog/error/,
 * verified on production 2026-09-23. The duplicate surface was every (segment, slug, locale) triple.
 *
 * These run against the real corpus rather than a fixture, because the invariant being pinned is
 * about the post's own facets: the segments that must keep rendering are exactly the ones the
 * middleware's `?tag=` rewrite produces, and a fixture whose only tag equals its category cannot
 * tell the two cases apart.
 */
// next-mdx-remote ships ESM that Jest's CJS runtime cannot parse; the route imports it at module
// scope, so it is stubbed the same way `singleLocalePost.test.tsx` stubs it.
jest.mock('next-mdx-remote', () => ({ MDXRemote: () => null }));
jest.mock('@/helpers/mdx', () => ({ serialize: jest.fn(async () => ({})) }));
// getStaticPaths writes public/sitemap.xml as a side effect; nothing here should touch the real file.
jest.mock('@/helpers/fileWritter', () => ({ createSiteMap: jest.fn(async () => undefined) }));

const ENGLISH = { category: 'error', slug: 'npm-token-solution-error' };
const SPANISH = { category: 'error', slug: 'npm-token-solucion-error' };

describe('a post requested under a segment it does not carry', () => {
    it.each(['javascript', 'react', 'nextjs'])('redirects /blog/%s/<slug> to the canonical URL', async (category) => {
        const props = await getStaticProps({ params: { ...ENGLISH, category }, locale: 'en' });

        expect(props).toEqual(
            expect.objectContaining({
                redirect: { destination: `/blog/error/${ENGLISH.slug}`, permanent: true },
            })
        );
    });

    // The destination has to carry the locale prefix, or a Spanish reader is sent to a URL that
    // redirects again — or worse, to the English post.
    it('keeps the locale prefix on the destination', async () => {
        const props = await getStaticProps({ params: { ...SPANISH, category: 'javascript' }, locale: 'es' });

        expect(props).toEqual(
            expect.objectContaining({
                redirect: { destination: `/es/blog/error/${SPANISH.slug}`, permanent: true },
            })
        );
    });
});

describe('a post requested under one of its own facets', () => {
    // `ci` is a tag of this post, not its category: this is the path the middleware rewrite takes
    // for /blog/error/<slug>?tag=ci, and a redirect here would bounce every tag click out of the
    // blog — the SDD-009 regression.
    it.each(['error', 'npm', 'yarn', 'ci'])('renders /blog/%s/<slug>', async (category) => {
        const props = await getStaticProps({ params: { ...ENGLISH, category }, locale: 'en' });

        expect(props).not.toHaveProperty('redirect');
        expect(props).toHaveProperty('props.post.meta.slug', ENGLISH.slug);
    });

    it('still 404s a slug that does not exist', async () => {
        const props = await getStaticProps({ params: { category: 'error', slug: 'no-existe-esto' }, locale: 'en' });

        expect(props).toEqual(expect.objectContaining({ notFound: true }));
    });
});
