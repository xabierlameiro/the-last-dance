import { defaultLocale } from '@/constants/site';
import { removeTrailingSlash } from '@/helpers';
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
    let sitemap = routes.reduce(
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
            const url = `${process.env.NEXT_PUBLIC_DOMAIN}${
                locale !== defaultLocale ? `/${locale}` : ''
            }/blog/${category}/${slug}`;
            return [...acc, url];
        },
        []
    );

    const pages = fs
        .readdirSync(path.join(process.cwd(), '/src/pages'))
        .filter(
            (page) =>
                page !== '_app.tsx' &&
                page !== '_document.tsx' &&
                page !== 'blog' &&
                page !== 'api' &&
                page !== 'legal' &&
                page !== '404.tsx'
        )
        .map((page) => {
            page = page.replace('.tsx', '');
            return {
                url: page === 'index' ? '' : `${page}`,
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
                            <loc>${removeTrailingSlash(
                                locale === defaultLocale
                                    ? `${process.env.NEXT_PUBLIC_DOMAIN}/${page.url}`
                                    : `${process.env.NEXT_PUBLIC_DOMAIN}/${locale}/${page.url}`
                            )}</loc>
                            <lastmod>${page.lastmod}</lastmod>
                        </url>
                    `;
                    })
                    .join('');
            })
            .join('')}
 
        </urlset>
    `;

    const formattedXml = prettier.format(xml, { parser: 'html', printWidth: 120 });
    const filePath = path.join(PUBLIC_DIR, 'sitemap.xml');

    fs.writeFileSync(filePath, formattedXml);
};
