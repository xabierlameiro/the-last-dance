import { browsedSegment, postPath } from '../postPath';
import { getAllCategories, getPostsByLocale } from '../fileReader';

describe('postPath', () => {
    const post = { category: 'Error', slug: 'solve-address-in-use-error' };

    it('links at the post category with no parameter when nothing is browsed', () => {
        expect(postPath(post)).toBe('/blog/error/solve-address-in-use-error');
    });

    it('drops the parameter when the browsed segment is the post category', () => {
        expect(postPath(post, 'error')).toBe('/blog/error/solve-address-in-use-error');
        expect(postPath(post, 'Error')).toBe('/blog/error/solve-address-in-use-error');
    });

    it('carries any other browsed segment as ?tag=', () => {
        expect(postPath(post, 'cli')).toBe('/blog/error/solve-address-in-use-error?tag=cli');
    });
});

describe('browsedSegment', () => {
    it('prefers a valid ?tag= over the path segment', () => {
        expect(browsedSegment({ category: 'error', tag: 'node' })).toBe('node');
    });

    it('falls back to the path segment without a tag, as on a legacy facet URL', () => {
        expect(browsedSegment({ category: 'node' })).toBe('node');
    });

    it('ignores a tag the rewrite would not have honoured, so client and server agree', () => {
        expect(browsedSegment({ category: 'error', tag: 'Node' })).toBe('error');
        expect(browsedSegment({ category: 'error', tag: ['node', 'cli'] })).toBe('error');
        expect(browsedSegment({ category: 'error', tag: '../x' })).toBe('error');
    });
});

// tag-facets-as-query-param, task 2.4: no sidebar link on the real corpus points at a tag path.
describe('sidebar links', () => {
    it.each(['en', 'es', 'gl'])('never use a tag as the path segment (%s)', (locale) => {
        const categoryOf = new Map(getPostsByLocale(locale).map(({ meta }) => [meta.slug, meta.category.toLowerCase()]));
        const { categories, tags } = getAllCategories(locale);

        for (const { href } of [...categories, ...tags]) {
            const [, segment, slug] = /^\/blog\/([^/]+)\/([^?]+)/.exec(href) ?? [];
            expect(segment).toBe(categoryOf.get(String(slug)));
        }
        for (const { tag, href } of tags) {
            expect(href).toMatch(new RegExp(`\\?tag=${tag.toLowerCase()}$`));
        }
    });
});
