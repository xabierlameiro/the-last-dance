/**
 * Pure builders for the JSON-LD payloads embedded by <SEO />.
 *
 * They live outside the component so the structured data can be unit-tested on its
 * own: it is invisible in the rendered page, so a regression here is silent until
 * Search Console flags it weeks later.
 */

type ArticleInput = {
    title?: string;
    description?: string;
    url: string;
    locale?: string;
    imageUrl?: string;
    date?: string | null;
    updated?: string | null;
    author: string;
    domain?: string;
};

type BreadcrumbInput = {
    title?: string;
    url: string;
    category?: string;
    categorySlug?: string;
    langPrefix: string;
    domain?: string;
};

type FaqEntry = { question: string; answer: string };

export const articleJsonLd = ({
    title,
    description,
    url,
    locale,
    imageUrl,
    date,
    updated,
    author,
    domain,
}: ArticleInput) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    inLanguage: locale,
    ...(imageUrl && { image: [imageUrl] }),
    ...(date && { datePublished: date, dateModified: updated ?? date }),
    author: [
        {
            '@type': 'Person',
            '@id': `${domain}/#person`,
            name: author,
            url: domain,
        },
    ],
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
});

export const breadcrumbJsonLd = ({ title, url, category, categorySlug, langPrefix, domain }: BreadcrumbInput) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${domain}${langPrefix}` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${domain}${langPrefix}/blog` },
        {
            '@type': 'ListItem',
            position: 3,
            name: category,
            item: `${domain}${langPrefix}/blog/${categorySlug}`,
        },
        { '@type': 'ListItem', position: 4, name: title, item: url },
    ],
});

export const faqJsonLd = (faq: FaqEntry[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
        },
    })),
});
