import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, pageBreadcrumbJsonLd, softwareApplicationJsonLd } from '../jsonLd';

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

    it('builds a BlogPosting node wired into the site graph', () => {
        const node = articleJsonLd({ ...base, date: '2026-07-01' });

        // SDD-L04: BlogPosting rather than the generic Article, and addressable via @id so
        // `publisher`/`isPartOf` are real edges to the nodes _document.tsx defines. Search Console
        // reported only Breadcrumbs as detected structured data while this node floated unlinked.
        expect(node['@type']).toBe('BlogPosting');
        expect(node['@id']).toBe(`${base.url}#article`);
        expect(node.publisher).toEqual({ '@id': `${DOMAIN}/#person` });
        expect(node.isPartOf).toEqual({ '@id': `${DOMAIN}/#website` });
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

describe('softwareApplicationJsonLd', () => {
    const node = softwareApplicationJsonLd({
        name: 'next-leak',
        description: 'Measures memory leaks',
        url: `${DOMAIN}/es/next-leak`,
        version: '0.11.3',
        operatingSystem: 'Linux, macOS',
        requirements: 'Node.js 22 or later',
        sameAs: ['https://github.com/xabierlameiro/next-leak', 'https://www.npmjs.com/package/next-leak'],
        author: 'Xabier Lameiro',
        domain: DOMAIN,
    });

    // The page is only citable as "the tool" if the node names it, versions it and says it is free.
    it('describes a free developer tool at the page URL', () => {
        expect(node).toMatchObject({
            '@type': 'SoftwareApplication',
            '@id': `${DOMAIN}/es/next-leak#software`,
            url: `${DOMAIN}/es/next-leak`,
            applicationCategory: 'DeveloperApplication',
            softwareVersion: '0.11.3',
            offers: { '@type': 'Offer', price: '0' },
        });
    });

    it('joins the site graph through the existing Person node and links the repo and the package', () => {
        expect(node.author['@id']).toBe(`${DOMAIN}/#person`);
        expect(node.sameAs).toEqual([
            'https://github.com/xabierlameiro/next-leak',
            'https://www.npmjs.com/package/next-leak',
        ]);
    });
});

describe('pageBreadcrumbJsonLd', () => {
    // Two levels, and the Home item has to follow the locale — a Galician result that breadcrumbs
    // through the English home sends the reader to the wrong language.
    it("trails Home → page in the page's own locale", () => {
        expect(
            pageBreadcrumbJsonLd({
                name: 'next-leak',
                url: `${DOMAIN}/gl/next-leak`,
                langPrefix: '/gl',
                domain: DOMAIN,
            }),
        ).toEqual({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${DOMAIN}/gl` },
                { '@type': 'ListItem', position: 2, name: 'next-leak', item: `${DOMAIN}/gl/next-leak` },
            ],
        });
    });

    it('points at the bare domain for English, which has no prefix', () => {
        const node = pageBreadcrumbJsonLd({
            name: 'next-leak',
            url: `${DOMAIN}/next-leak`,
            langPrefix: '',
            domain: DOMAIN,
        });
        expect(node.itemListElement[0].item).toBe(DOMAIN);
    });
});
