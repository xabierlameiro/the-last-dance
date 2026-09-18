import path from 'path';
import { render } from '@/test';
import SEO from '@/components/SEO';

// investigation-content-strategy: new posts ship as `<slug>.en.mdx` only. These tests run the real
// loader, route and SEO code over a two-post fixture corpus (one English-only post, one translated
// into Spanish) and assert on what each per-locale surface produces for the English-only one.

const FIXTURE_ROOT = path.join(__dirname, 'fixtures', 'single-locale');
const ENGLISH_ONLY_SLUG = 'english-only-post';

jest.mock('next-mdx-remote', () => ({ MDXRemote: () => null }));
jest.mock('@/helpers/mdx', () => ({ serialize: jest.fn(async () => ({})) }));
// The route writes public/sitemap.xml as a side effect; capture the routes it would submit instead.
jest.mock('@/helpers/fileWritter', () => ({ createSiteMap: jest.fn(async () => undefined) }));

/**
 * `fileReader` resolves `data/blog` against `process.cwd()` when it is first imported, so the
 * fixture corpus is swapped in by pointing cwd at it and importing a fresh module registry.
 */
const importWithFixtureCorpus = async <T,>(importModule: () => Promise<T>): Promise<T> => {
    const cwd = jest.spyOn(process, 'cwd').mockReturnValue(FIXTURE_ROOT);
    try {
        let imported: T | undefined;
        await jest.isolateModulesAsync(async () => {
            imported = await importModule();
        });
        if (!imported) throw new Error('fixture import produced nothing');
        return imported;
    } finally {
        cwd.mockRestore();
    }
};

describe('an English-only post', () => {
    it('is listed and counted in English only', async () => {
        const { getPostsByLocale, getAllCategories } = await importWithFixtureCorpus(
            () => import('@/helpers/fileReader')
        );
        const slugsIn = (locale: string) => getPostsByLocale(locale).map((post) => post.meta.slug);

        expect(slugsIn('en')).toContain(ENGLISH_ONLY_SLUG);
        expect(slugsIn('es')).toEqual(['publicacion-traducida']);
        expect(slugsIn('gl')).toEqual([]);

        const nextjsTotal = (locale: string) =>
            getAllCategories(locale).categories.find(({ category }) => category === 'Nextjs')?.total ?? 0;
        expect(nextjsTotal('en')).toBe(2);
        expect(nextjsTotal('es')).toBe(1);
    });

    it('declares only its own English alternate and x-default', async () => {
        const { getPostBySlug } = await importWithFixtureCorpus(() => import('@/helpers/fileReader'));
        const post = getPostBySlug(ENGLISH_ONLY_SLUG, 'en');

        render(<SEO meta={{ ...post.meta }} isBlog />);
        // React 19 hoists <link> elements into document.head, out of the rendered container.
        const hreflangs = [...document.head.querySelectorAll('link[hreflang]')].map((link) =>
            link.getAttribute('hreflang')
        );

        expect(hreflangs.sort((a, b) => String(a).localeCompare(String(b)))).toEqual(['en', 'x-default']);
    });

    it('has meta that getStaticProps can serialize without an alternate list', async () => {
        // Next rejects `undefined` in props; Jest does not run that check, so a JSON round trip
        // stands in for it. `toStrictEqual` fails on a key whose value is undefined.
        const { getPostBySlug } = await importWithFixtureCorpus(() => import('@/helpers/fileReader'));
        const { meta } = getPostBySlug(ENGLISH_ONLY_SLUG, 'en');

        expect(JSON.parse(JSON.stringify(meta))).toStrictEqual(meta);
    });

    it('is prerendered and submitted to the sitemap under en only', async () => {
        const [{ getStaticPaths }, { createSiteMap }] = await importWithFixtureCorpus(() =>
            Promise.all([import('../pages/blog/[category]/[slug]'), import('@/helpers/fileWritter')])
        );

        const { paths } = await getStaticPaths({ locales: ['en', 'es', 'gl'] });
        const englishOnlyPaths = paths.filter(({ params }) => params.slug === ENGLISH_ONLY_SLUG);
        expect(englishOnlyPaths.map(({ locale }) => locale)).toEqual(['en']);

        const [sitemapRoutes] = (createSiteMap as jest.Mock).mock.calls.at(-1) as [
            { locale: string; params: { slug: string } }[],
        ];
        const englishOnlyRoutes = sitemapRoutes.filter(({ params }) => params.slug === ENGLISH_ONLY_SLUG);
        expect(englishOnlyRoutes.map(({ locale }) => locale)).toEqual(['en']);
    });

    it.each(['es', 'gl'])('sends a /%s request for it to the English page instead of a 404', async (locale) => {
        const { getStaticProps } = await importWithFixtureCorpus(() => import('../pages/blog/[category]/[slug]'));

        const props = await getStaticProps({ params: { category: 'nextjs', slug: ENGLISH_ONLY_SLUG }, locale });

        expect(props).toEqual(
            expect.objectContaining({
                redirect: { destination: `/blog/nextjs/${ENGLISH_ONLY_SLUG}`, permanent: true },
            })
        );
    });
});
