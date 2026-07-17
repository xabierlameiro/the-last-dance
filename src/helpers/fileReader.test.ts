import { getAllCategories, getPostsByLocaleAndTag } from './fileReader';

// SDD-009: tags must be self-canonical listing URLs, not post URLs, and be resolvable
// case-insensitively from the lowercased slug used in `/blog/tag/<tag>`.
describe('fileReader — tag navigation (SDD-009)', () => {
    it('should point every tag link at its /blog/tag/<tag> listing, never a post URL', () => {
        const { tags } = getAllCategories('en');

        expect(tags.length).toBeGreaterThan(0);
        for (const { tag, href } of tags) {
            expect(href).toBe(`/blog/tag/${tag.toLowerCase()}`);
            // guard against the old regression where tags linked to /blog/<tag>/<slug>
            expect(href.split('/').filter(Boolean)).toHaveLength(3);
        }
    });

    it('should resolve posts by tag case-insensitively', () => {
        const lower = getPostsByLocaleAndTag('en', 'npm');
        const upper = getPostsByLocaleAndTag('en', 'NPM');

        expect(lower.length).toBeGreaterThan(0);
        expect(upper.map((post) => post.meta.slug)).toEqual(lower.map((post) => post.meta.slug));
        expect(lower.every((post) => post.meta.tags.map((tag: string) => tag.toLowerCase()).includes('npm'))).toBe(true);
    });

    it('should return no posts for an unknown tag (feeds notFound in getStaticProps)', () => {
        expect(getPostsByLocaleAndTag('en', 'does-not-exist')).toHaveLength(0);
    });
});
