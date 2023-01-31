import { remarkCodeHike } from '@xabierlameiro/code-hike';
import theme from 'shiki/themes/one-dark-pro.json' assert { type: 'json' };
import { serialize as sz } from 'next-mdx-remote/serialize';
import path from 'path';
import fs from 'fs';

/**
 * @description Serialize MDX file.
 *
 * @example
 *     serializePath('/src/posts', 'first-post.mdx');
 *     returns { content: '...', meta: {...} }
 *
 * @param {string} route - Route of the MDX file.
 * @param {string} fileName - Name of the MDX file.
 * @returns {Object} - Object with MDX content and meta data.
 */
export const serializePath = (route: string, fileName: string) => {
    const folderPath = path.join(process.cwd(), route);
    const filePath = path.join(folderPath, fileName);
    const mdx = fs.readFileSync(filePath, 'utf8');

    return sz(mdx, {
        mdxOptions: {
            remarkPlugins: [[remarkCodeHike, { autoImport: false, theme }]],
            useDynamicImport: true,
        },
    });
};

/**
 * @description Serialize MDX file with Code Hike.
 *
 * @example
 *     serialize('# Hello World');
 *     returns { content: '...', meta: {...} }
 *
 * @param {string} mdx - MDX file.
 * @returns {Object} - Object with MDX content and meta data.
 */
export const serialize = (mdx: string) =>
    sz(mdx, {
        mdxOptions: {
            remarkPlugins: [[remarkCodeHike, { autoImport: false, theme }]],
            useDynamicImport: true,
        },
    });
