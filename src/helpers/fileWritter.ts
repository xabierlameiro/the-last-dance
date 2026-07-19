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

// Pages that must never reach the sitemap: framework internals, route directories
// handled by their own entries above, error pages, and utility pages with no search value.
const NON_SITEMAP_PAGES = new Set([
    '_app.tsx',
    '_document.tsx',
    'blog',
    'api',
    'legal',
    '404.tsx',
    '500.tsx',
    'survey.tsx',
    'settings.tsx',
    'comments.tsx',
]);

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

    // Legal pages — previously missing from the sitemap
    const legalSlugs = fs
        .readdirSync(path.join(process.cwd(), 'data/legal'))
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => file.replace('.mdx', ''));
    const legalEntries = locales.flatMap((locale) =>
        legalSlugs.map((slug) => urlEntry(`${domain}${localePrefix(locale)}/legal/${slug}`))
    );

    // Top-level pages, read from the pages directory; utility pages stay excluded. /about and
    // /contact dropped out here on their own when the files were deleted and folded into the home.
    // No <lastmod> for evergreen pages: stamping the build date on every URL misleads crawlers
    const pages = fs
        .readdirSync(path.join(process.cwd(), '/src/pages'))
        .filter((page) => !NON_SITEMAP_PAGES.has(page))
        .map((page) => {
            page = page.replace('.tsx', '');
            return page === 'index' ? '' : page;
        });
    const pageEntries = locales.flatMap((locale) =>
        pages.map((page) => urlEntry(removeTrailingSlash(`${domain}${localePrefix(locale)}/${page}`)))
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${[...pageEntries, ...postEntries, ...legalEntries].join('')}
        </urlset>
    `;

    const formattedXml = prettier.format(xml, { parser: 'html', printWidth: 120 });
    const filePath = path.join(PUBLIC_DIR, 'sitemap.xml');

    fs.writeFileSync(filePath, formattedXml);
};
