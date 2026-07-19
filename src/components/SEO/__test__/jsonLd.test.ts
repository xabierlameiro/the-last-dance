import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '../jsonLd';

const DOMAIN = 'https://xabierlameiro.com';

describe('articleJsonLd', () => {
    const base = {
        title: 'A post',
        description: 'What it is about',
        url: `${DOMAIN}/blog/react/a-post`,
        locale: 'en',
        imageUrl: `${DOMAIN}/posts/a-post.png`,
        author: 'Xabier Lameiro',
        domain: DOMAIN,
    };

    it('builds an Article node pointing back at its own URL', () => {
        const node = articleJsonLd({ ...base, date: '2026-07-01' });

        expect(node['@type']).toBe('Article');
        expect(node.headline).toBe('A post');
        expect(node.mainEntityOfPage).toEqual({ '@type': 'WebPage', '@id': base.url });
        expect(node.author[0]['@id']).toBe(`${DOMAIN}/#person`);
    });

    // dateModified drives the "Updated" label in search results; falling back to the
    // publication date keeps it from being reported as missing.
    it('falls back to the publication date when the post was never updated', () => {
        const node = articleJsonLd({ ...base, date: '2026-07-01', updated: null });

        expect(node).toMatchObject({ datePublished: '2026-07-01', dateModified: '2026-07-01' });
    });

    it('prefers the update date when there is one', () => {
        const node = articleJsonLd({ ...base, date: '2026-07-01', updated: '2026-07-15' });

        expect(node).toMatchObject({ datePublished: '2026-07-01', dateModified: '2026-07-15' });
    });

    it('omits the date fields entirely when the post has no date', () => {
        const node = articleJsonLd({ ...base, date: null });

        expect(node).not.toHaveProperty('datePublished');
        expect(node).not.toHaveProperty('dateModified');
    });

    it('omits the image field when there is no image', () => {
        const node = articleJsonLd({ ...base, imageUrl: undefined, date: null });

        expect(node).not.toHaveProperty('image');
    });
});

describe('breadcrumbJsonLd', () => {
    it('builds a four-level trail with sequential positions', () => {
        const node = breadcrumbJsonLd({
            title: 'A post',
            url: `${DOMAIN}/es/blog/react/a-post`,
            category: 'React',
            categorySlug: 'react',
            langPrefix: '/es',
            domain: DOMAIN,
        });

        expect(node.itemListElement.map((item) => item.position)).toEqual([1, 2, 3, 4]);
        expect(node.itemListElement.map((item) => item.name)).toEqual(['Home', 'Blog', 'React', 'A post']);
        expect(node.itemListElement[1].item).toBe(`${DOMAIN}/es/blog`);
        // The crumb label keeps the display casing while the URL uses the slug
        expect(node.itemListElement[2].item).toBe(`${DOMAIN}/es/blog/react`);
    });

    it('produces unprefixed URLs for the default locale', () => {
        const node = breadcrumbJsonLd({
            title: 'A post',
            url: `${DOMAIN}/blog/react/a-post`,
            category: 'React',
            categorySlug: 'react',
            langPrefix: '',
            domain: DOMAIN,
        });

        expect(node.itemListElement[0].item).toBe(DOMAIN);
    });
});

describe('faqJsonLd', () => {
    it('maps each entry to a Question with its accepted answer', () => {
        const node = faqJsonLd([{ question: 'Why?', answer: 'Because.' }]);

        expect(node['@type']).toBe('FAQPage');
        expect(node.mainEntity).toEqual([
            {
                '@type': 'Question',
                name: 'Why?',
                acceptedAnswer: { '@type': 'Answer', text: 'Because.' },
            },
        ]);
    });

    it('returns an empty entity list for an empty FAQ', () => {
        expect(faqJsonLd([]).mainEntity).toEqual([]);
    });
});
