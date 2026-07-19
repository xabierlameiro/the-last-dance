import { getAllCategories, getPostBySlug } from '../fileReader';

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
