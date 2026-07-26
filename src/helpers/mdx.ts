import { remarkPlugins } from '../../mdx.plugins.ts';
import { serialize as sz } from 'next-mdx-remote/serialize';
import path from 'path';
import fs from 'fs';

/**
 * SDD-L09-T8. The remark plugin array, in one place.
 *
 * It was duplicated verbatim between `serialize` and `serializePath`, and the comment on each copy
 * said "See serializePath" — so the duplication had been noticed and documented rather than removed.
 * Two copies of a plugin array is how the two MDX pipelines in this repo came to disagree about GFM:
 * `@next/mdx` compiles `.mdx` **pages** without remark-gfm, while `next-mdx-remote` compiles blog
 * posts with it, so a table renders in one and as literal pipe characters in the other, and an
 * author cannot tell which rules apply to the file in front of them.
 *
 * `next.config.js` imports the same constant, which is what makes the two pipelines agree.
 *
 * The options below are what both entry points pass to next-mdx-remote.
 *
 * MDX content is first-party (authored in this repo), so JS expressions are trusted.
 * next-mdx-remote v6 blocks them by default, which breaks Code Hike's compiled output; JS is
 * re-enabled while the guard against dangerous globals (eval/Function/require/...) stays on.
 */
const serializeOptions = {
    blockJS: false,
    blockDangerousJS: true,
    mdxOptions: {
        // next-mdx-remote compiles a fragment: `CH` arrives via the components prop, not an import.
        remarkPlugins: remarkPlugins({ autoImport: false }),
        useDynamicImport: true,
    },
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

    return sz(mdx, serializeOptions);
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
export const serialize = (mdx: string) => sz(mdx, serializeOptions);
