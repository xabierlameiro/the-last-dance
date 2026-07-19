import { getAllCategories, getLatestPostPath, getPostBySlug, getPostsByLocale } from '../fileReader';

// The post date comes from the `<Date date="MM-DD-YYYY" />` tag in the MDX body and feeds
// datePublished in the Article JSON-LD. The old implementation parsed the tag with
// `new Date(...)` (LOCAL midnight) + `toISOString()` (UTC), which published every post one
// day early in timezones ahead of UTC — these tests pin the timezone to catch that shift.
describe('getPostBySlug', () => {
    const originalTimezone = process.env.TZ;

    afterEach(() => {
        if (originalTimezone === undefined) {
            delete process.env.TZ;
        } else {
            process.env.TZ = originalTimezone;
        }
    });

    it('Should keep the calendar day of the Date tag in a timezone ahead of UTC', () => {
        process.env.TZ = 'Europe/Madrid';
        const post = getPostBySlug('uncaught-error-minified-react-error');
        expect(post.meta.date).toBe('2023-01-05');
    });

    it('Should keep the calendar day of the Date tag in a timezone behind UTC', () => {
        process.env.TZ = 'America/New_York';
        const post = getPostBySlug('uncaught-error-minified-react-error');
        expect(post.meta.date).toBe('2023-01-05');
    });
});

// This is the blog's entry point: the Dock links to /blog and that route redirects here, so a
// wrong answer sends every visitor to the wrong post — or to a 404 in their language.
describe('getLatestPostPath', () => {
    const newestOf = (locale: string, category?: string) => {
        const posts = getPostsByLocale(locale).filter(
            ({ meta }) => !category || meta.category.toLowerCase() === category
        );
        return [...posts].sort((a, b) => (b.meta.date ?? '').localeCompare(a.meta.date ?? ''))[0];
    };

    it.each(['en', 'es', 'gl'])('Should point at the newest post of the %s corpus', (locale) => {
        const newest = newestOf(locale);

        expect(getLatestPostPath(locale)).toBe(`/blog/${newest.meta.category.toLowerCase()}/${newest.meta.slug}`);
    });

    it('Should scope to the newest post of a category when one is given', () => {
        const newest = newestOf('en', 'react');

        expect(getLatestPostPath('en', 'react')).toBe(`/blog/react/${newest.meta.slug}`);
    });

    it('Should be case insensitive about the category', () => {
        expect(getLatestPostPath('en', 'React')).toBe(getLatestPostPath('en', 'react'));
    });

    it('Should fall back to the newest post overall for a category with no posts', () => {
        expect(getLatestPostPath('en', 'does-not-exist')).toBe(getLatestPostPath('en'));
    });

    it('Should fall back to the default locale for a locale with no posts', () => {
        expect(getLatestPostPath('fr')).toBe(getLatestPostPath('en'));
    });

    it('Should return a path the blog route can serve', () => {
        expect(getLatestPostPath('es')).toMatch(/^\/blog\/[a-z0-9-]+\/[^/]+$/);
    });
});

// Both taxonomies render as sidebar sections ("Topics" and "Tags") that link into the same
// /blog/[category]/ namespace, so an overlapping name is the same URL listed twice.
describe('getAllCategories', () => {
    it.each(['en', 'es', 'gl'])('Should keep tags disjoint from categories in %s', (locale) => {
        const { categories, tags } = getAllCategories(locale);
        const categoryNames = new Set(categories.map(({ category }) => category.toLowerCase()));
        const colliding = tags.filter(({ tag }) => categoryNames.has(tag.toLowerCase()));

        expect(colliding).toEqual([]);
    });
});
