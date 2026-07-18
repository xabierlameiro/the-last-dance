import { remarkCodeHike } from '@code-hike/mdx';
import remarkGfm from 'remark-gfm';
import theme from 'shiki/themes/one-dark-pro.json' with { type: 'json' };
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
    const filePath = path.join(route, fileName);
    const mdx = fs.readFileSync(filePath, 'utf8');

    return sz(mdx, {
        // MDX content is first-party (authored in this repo), so JS expressions
        // are trusted. next-mdx-remote v6 blocks them by default, which breaks
        // Code Hike's compiled output; re-enable JS while keeping the guard
        // against dangerous globals (eval/Function/require/...).
        blockJS: false,
        blockDangerousJS: true,
        mdxOptions: {
            // GFM tables/autolinks are not CommonMark — without remark-gfm the pipes
            // render as plain text. singleTilde off so "~1M"-style approximations in
            // prose can never pair up into accidental strikethrough.
            remarkPlugins: [[remarkGfm, { singleTilde: false }], [remarkCodeHike, { autoImport: false, theme }]],
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
        // See serializePath: trusted first-party MDX, so allow JS expressions
        // (required by Code Hike) while blocking dangerous globals.
        blockJS: false,
        blockDangerousJS: true,
        mdxOptions: {
            // See serializePath: GFM support with singleTilde disabled.
            remarkPlugins: [[remarkGfm, { singleTilde: false }], [remarkCodeHike, { autoImport: false, theme }]],
            useDynamicImport: true,
        },
    });
