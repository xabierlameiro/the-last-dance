import { remarkCodeHike, recmaCodeHike } from 'codehike/mdx';
import { serialize as sz } from 'next-mdx-remote/serialize';
import path from 'path';
import fs from 'fs';

// Theme configuration for CodeHike
const chConfig = {
    components: { code: "Code" },
};

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
        mdxOptions: {
            remarkPlugins: [[remarkCodeHike, chConfig]],
            recmaPlugins: [[recmaCodeHike, chConfig]],
        },
    });
};

/**
 * @description Serialize MDX file with syntax highlighting.
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
            remarkPlugins: [[remarkCodeHike, chConfig]],
            recmaPlugins: [[recmaCodeHike, chConfig]],
        },
    });
