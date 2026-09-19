import path from 'path';
import { legacyFacetRedirects } from '../legacyFacetRedirects';
import { getPostsByLocale } from '../fileReader';

// tag-facets-as-query-param, task 4.1: the redirects are generated from the real corpus.
const redirects = legacyFacetRedirects(path.join(process.cwd(), 'data/blog'));
const posts = ['en', 'es', 'gl'].flatMap((locale) => getPostsByLocale(locale));

describe('legacyFacetRedirects', () => {
    it('redirects every tag URL of every post to its category URL with the tag carried', () => {
        for (const { meta } of posts) {
            const category = meta.category.toLowerCase();
            for (const tag of meta.tags.map((value: string) => value.toLowerCase())) {
                if (tag === category) continue;
                expect(redirects).toContainEqual({
                    source: `/blog/${tag}/${encodeURIComponent(meta.slug)}`,
                    destination: `/blog/${category}/${meta.slug}?tag=${tag}`,
                    permanent: true,
                });
            }
        }
    });

    it('never redirects a real post URL, in any locale', () => {
        // Sources are prefixed for every locale by Next, so a match in any locale would redirect it.
        const canonicalPaths = new Set(
            posts.map(({ meta }) => `/blog/${meta.category.toLowerCase()}/${encodeURIComponent(meta.slug)}`)
        );
        expect(redirects.filter(({ source }) => canonicalPaths.has(source))).toEqual([]);
    });

    it('has one entry per source', () => {
        const sources = redirects.map(({ source }) => source);
        expect(new Set(sources).size).toBe(sources.length);
    });
});
