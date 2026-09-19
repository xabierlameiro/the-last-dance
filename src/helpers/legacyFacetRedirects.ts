import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import * as z from 'zod/mini';
import { postPath } from './postPath.ts';

/**
 * tag-facets-as-query-param, step 3. Before `?tag=`, every post was also reachable at
 * /blog/<tag>/<slug> for each of its tags. Those URLs are still crawled and linked from outside, so
 * each one gets a permanent redirect to the post's own category path, carrying the tag as `?tag=` so a
 * reader who follows an old link lands with the same tag selected.
 *
 * Sources carry no locale prefix on purpose: with i18n, Next prefixes `source` and `destination` for
 * every locale, which is what makes the default locale match (see the note on `redirects` in
 * next.config.ts). A tag + slug pair therefore has to map to one destination across locales, and no
 * source may equal a real post URL in any locale; the tests pin both.
 *
 * The `?tag=` rewrite in src/middleware.ts serves /blog/<category>/<slug>?tag= from this same
 * /blog/<tag>/<slug> path, and these redirects DO match that path, data route included
 * (`/_next/data/<build>/blog/<tag>/<slug>.json` answers 308). They do not loop because redirects run
 * before middleware: the browser and the Pages Router client only ever request the visible
 * /blog/<category>/<slug>?tag= URL, which is no redirect source, and the middleware rewrites it after
 * the redirects have been checked. Moving that rewrite back into next.config.ts `rewrites` would
 * break this: the client resolves config rewrites itself, would fetch the redirected path, and every
 * tag click would bounce. e2e/tag-navigation exercises exactly this transition, so run it against a
 * deployment after any change to the middleware or its matcher.
 *
 * Slugs are percent-encoded in `source` because the matcher compares against the encoded request
 * path: with a raw `ñ` the Galician post's tag URL answered 200 instead of redirecting.
 */

const facetFrontmatterSchema = z.object({
    slug: z.string(),
    category: z.string(),
    tags: z.optional(z.array(z.string())),
});

export type FacetRedirect = { source: string; destination: string; permanent: true };

/**
 * @description One permanent redirect per legacy tag URL in the corpus.
 * @param postsDir - The directory holding the `.mdx` posts (`data/blog`).
 * @returns Redirects from /blog/<tag>/<slug> to /blog/<category>/<slug>?tag=<tag>.
 */
export const legacyFacetRedirects = (postsDir: string): FacetRedirect[] => {
    const destinationBySource = new Map<string, string>();
    const files = fs
        .readdirSync(postsDir, { recursive: true })
        .map(String)
        .filter((file) => file.endsWith('.mdx'));

    for (const file of files) {
        const frontmatter = facetFrontmatterSchema.parse(matter(fs.readFileSync(path.join(postsDir, file), 'utf8')).data);
        const category = frontmatter.category.toLowerCase();
        for (const tag of frontmatter.tags ?? []) {
            const segment = tag.toLowerCase();
            if (segment === category) continue;
            const source = `/blog/${segment}/${encodeURIComponent(frontmatter.slug)}`;
            const destination = postPath(frontmatter, segment);
            const existing = destinationBySource.get(source);
            if (existing && existing !== destination) {
                throw new Error(
                    `Legacy tag URL ${source} would redirect to both ${existing} and ${destination}: two locales share ` +
                        'this slug with different categories. Give one of them its own slug before building.'
                );
            }
            destinationBySource.set(source, destination);
        }
    }

    return [...destinationBySource].map(([source, destination]) => ({ source, destination, permanent: true }));
};
