import { defaultLocale } from '@/constants/site';
import { removeTrailingSlash } from '@/helpers';
import fs from 'fs';
import matter from 'gray-matter';
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
export const createSiteMap = async (routes: SitemapRoute[], locales: string[]): Promise<void> => {
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    const localePrefix = (locale: string) => (locale !== defaultLocale ? `/${locale}` : '');

    // Blog posts — lastmod comes from the <Date /> tag embedded in each post
    const postEntries = routes.map(({ locale, date, params: { category, slug } }) =>
        urlEntry(`${domain}${localePrefix(locale)}/blog/${category}/${slug}`, date)
    );

    /**
     * Legal pages, minus the ones that tell crawlers not to index them.
     *
     * SDD-L04: this used to submit every legal slug for every locale unconditionally, and all three
     * documents carry `noindex: true` in their frontmatter. That put 9 guaranteed-uncrawlable URLs
     * into the sitemap — Search Console duly reported them as "Discovered – currently not indexed" —
     * which is the signal that erodes trust in the whole file. Submitting a URL is a request to index
     * it, so it has to agree with the page's own robots directive.
     *
     * The filter stays rather than the block being deleted, so a future indexable legal document is
     * picked up automatically.
     */
    const legalDir = path.join(process.cwd(), 'data/legal');
    const legalSlugs = fs
        .readdirSync(legalDir)
        .filter((file) => file.endsWith('.mdx'))
        .filter((file) => matter(fs.readFileSync(path.join(legalDir, file), 'utf8')).data?.noindex !== true)
        .map((file) => file.replace('.mdx', ''));
    const legalEntries = locales.flatMap((locale) =>
        legalSlugs.map((slug) => urlEntry(`${domain}${localePrefix(locale)}/legal/${slug}`))
    );

    // Top-level pages, read from the pages directory; utility pages stay excluded. /about and
    // /contact dropped out here on their own when the files were deleted and folded into the home.
    // No <lastmod> for evergreen pages: stamping the build date on every URL misleads crawlers
    const pages = fs
        .readdirSync(path.join(process.cwd(), '/src/pages'))
        // SDD-L10-T13: include what is a page, then exclude the ones that must not ship. The filter
        // used to be exclusion-only, so anything absent from NON_SITEMAP_PAGES became a URL —
        // `error.module.css` sits in this directory beside the page that imports it, survived a
        // `.replace('.tsx', '')` that does not match it, and was advertised in all three locales as
        // a page returning 404. An allowlist by extension cannot be outgrown by a new asset type.
        .filter((page) => page.endsWith('.tsx'))
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

    // SDD-L10-T10: awaited. Prettier 3 returns a Promise; the fake `declare module 'prettier'` in
    // global.d.ts claimed otherwise, so without deleting it this line would have written the literal
    // text "[object Promise]" into the sitemap with nothing failing.
    const formattedXml = await prettier.format(xml, { parser: 'html', printWidth: 120 });
    const filePath = path.join(PUBLIC_DIR, 'sitemap.xml');

    fs.writeFileSync(filePath, formattedXml);
};
