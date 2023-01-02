import { domain, defaultLocale } from '@/constants/site';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/**
 * @description - Function to create sitemap.xml file
 *
 * @example
 *     createSiteMap(routes, locales);
 *
 * @param {Array} routes - Array of routes
 * @param {Array} locales - Array of locales
 * @returns {void}
 */
export const createSiteMap = (
    routes: {
        locale: string;
        params: {
            category: string;
            slug: string;
        };
    }[],
    locales: string[]
) => {
    const sitemap = routes.reduce(
        (
            acc: string[],
            path: {
                locale: string;
                params: {
                    category: string;
                    slug: string;
                };
            }
        ) => {
            const { locale, params } = path;
            const { category, slug } = params;
            const url = `${domain}${locale !== defaultLocale ? `/${locale}` : ''}/blog/${category}/${slug}`;
            return [...acc, url];
        },
        []
    );

    const pages = fs
        .readdirSync(path.join(process.cwd(), '/pages'))
        .filter((page) => page !== '_app.tsx' && page !== '_document.tsx' && page !== 'blog')
        .map((page) => {
            page = page.replace('.tsx', '');
            return {
                url: page === 'index' ? domain : `${domain}/${page}`,
                lastmod: new Date().toISOString(),
            };
        });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${sitemap
            .map((url: string) => {
                return `
                    <url>
                        <loc>${url}</loc>
                        <lastmod>${new Date().toISOString()}</lastmod>
                    </url>
                `;
            })
            .join('')}
        ${locales
            .map((locale: string) => {
                return pages
                    .map((page: { url: string; lastmod: string }) => {
                        return `
                        <url>
                            <loc>${locale === defaultLocale ? page.url : `${page.url}/${locale}`}</loc>
                            <lastmod>${page.lastmod}</lastmod>
                        </url>
                    `;
                    })
                    .join('');
            })
            .join('')}
 
        </urlset>
    `;

    const formattedXml = prettier.format(xml, { parser: 'html' });
    const filePath = path.join(PUBLIC_DIR, 'sitemap.xml');

    fs.writeFileSync(filePath, formattedXml);
};
