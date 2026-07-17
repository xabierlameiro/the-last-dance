import { defaultLocale } from '@/constants/site';
import { removeTrailingSlash } from '@/helpers';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

type SitemapRoute = {
    locale: string;
    date?: string | null;
    params: {
        category: string;
        slug: string;
    };
};

const urlEntry = (loc: string, lastmod?: string | null) => `
    <url>
        <loc>${loc}</loc>
        ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    </url>
`;

/**
 * @description - Function to create sitemap.xml file: blog posts (with lastmod
 * from their publication date), blog hub + category hubs, legal pages and the
 * top-level pages, for every locale (SDD-002 D2).
 *
 * @example
 *     createSiteMap(routes, locales);
 *
 * @param {Array} routes - Array of blog post routes (locale, optional date, category/slug params)
 * @param {Array} locales - Array of locales
 * @returns {void}
 */
export const createSiteMap = (routes: SitemapRoute[], locales: string[]) => {
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const localePrefix = (locale: string) => (locale !== defaultLocale ? `/${locale}` : '');

    // Blog posts — lastmod comes from the <Date /> tag embedded in each post
    const postEntries = routes.map(({ locale, date, params: { category, slug } }) =>
        urlEntry(`${domain}${localePrefix(locale)}/blog/${category}/${slug}`, date)
    );

    // Blog hub + category hub pages (SDD-002 D3)
    const categories = [...new Set(routes.map(({ params }) => params.category))];
    const hubEntries = locales.flatMap((locale) => [
        urlEntry(`${domain}${localePrefix(locale)}/blog`),
        ...categories.map((category) => urlEntry(`${domain}${localePrefix(locale)}/blog/${category}`)),
    ]);

    // Legal pages — previously missing from the sitemap
    const legalSlugs = fs
        .readdirSync(path.join(process.cwd(), 'data/legal'))
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => file.replace('.mdx', ''));
    const legalEntries = locales.flatMap((locale) =>
        legalSlugs.map((slug) => urlEntry(`${domain}${localePrefix(locale)}/legal/${slug}`))
    );

    // Top-level pages (home, about, contact, …); utility pages stay excluded.
    // No <lastmod> for evergreen pages: stamping the build date on every URL misleads crawlers
    const pages = fs
        .readdirSync(path.join(process.cwd(), '/src/pages'))
        .filter(
            (page) =>
                page !== '_app.tsx' &&
                page !== '_document.tsx' &&
                page !== 'blog' &&
                page !== 'api' &&
                page !== 'legal' &&
                page !== '404.tsx' &&
                page !== '500.tsx' &&
                page !== 'survey.tsx' &&
                // Utility pages with no search value
                page !== 'settings.tsx' &&
                page !== 'comments.tsx'
        )
        .map((page) => {
            page = page.replace('.tsx', '');
            return page === 'index' ? '' : page;
        });
    const pageEntries = locales.flatMap((locale) =>
        pages.map((page) => urlEntry(removeTrailingSlash(`${domain}${localePrefix(locale)}/${page}`)))
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${[...pageEntries, ...hubEntries, ...postEntries, ...legalEntries].join('')}
        </urlset>
    `;

    const formattedXml = prettier.format(xml, { parser: 'html', printWidth: 120 });
    const filePath = path.join(PUBLIC_DIR, 'sitemap.xml');

    fs.writeFileSync(filePath, formattedXml);
};
